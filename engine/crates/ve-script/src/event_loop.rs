//! The event loop: task queues, microtasks, timers and quiescence.
//!
//! Time is *virtual*: the loop only advances when [`EventLoop::advance`] is
//! called, which makes agent programs and tests deterministic. Embedders that
//! want wall-clock behaviour advance the loop from their own timer.

use std::cmp::Ordering;
use std::collections::{BinaryHeap, HashMap, VecDeque};
use std::time::Duration;

use serde::{Deserialize, Serialize};

/// Identifies a queued task or timer (for cancellation).
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize)]
pub struct TaskId(pub u64);

/// HTML task sources. Each source is its own FIFO; [`EventLoop::run_one`]
/// takes the oldest task from the highest-priority non-empty source.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TaskSource {
    /// DOM manipulation (e.g. `load` events for inserted elements).
    DomManipulation,
    /// Input events dispatched by the agent or embedder.
    UserInteraction,
    /// Network responses and progress events.
    Networking,
    /// Timer callbacks (`setTimeout`).
    Timer,
    /// `postMessage` and similar.
    PostedMessage,
    /// Rendering opportunities (`requestAnimationFrame`).
    Rendering,
}

impl TaskSource {
    /// HTML-ish selection order: user input and network beat timers and rAF.
    const PRIORITY: [Self; 6] = [
        Self::UserInteraction,
        Self::Networking,
        Self::DomManipulation,
        Self::PostedMessage,
        Self::Timer,
        Self::Rendering,
    ];
}

/// A queued callback.
pub type TaskFn = Box<dyn FnOnce(&mut EventLoop)>;

struct Task {
    id: TaskId,
    source: TaskSource,
    run: TaskFn,
}

struct Timer {
    due: Duration,
    id: TaskId,
    task: Task,
}

impl PartialEq for Timer {
    fn eq(&self, other: &Self) -> bool {
        self.due == other.due && self.id == other.id
    }
}
impl Eq for Timer {}
impl PartialOrd for Timer {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}
impl Ord for Timer {
    /// Reversed so the `BinaryHeap` pops the earliest timer first.
    fn cmp(&self, other: &Self) -> Ordering {
        other
            .due
            .cmp(&self.due)
            .then_with(|| other.id.cmp(&self.id))
    }
}

/// A page `setTimeout`/`setInterval` registered from the JS host table.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
struct JsTimer {
    due_ms: u64,
    seq: u64,
    id: u64,
    repeat_ms: Option<u64>,
}

impl PartialOrd for JsTimer {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for JsTimer {
    fn cmp(&self, other: &Self) -> Ordering {
        other
            .due_ms
            .cmp(&self.due_ms)
            .then_with(|| other.seq.cmp(&self.seq))
    }
}

/// A JS timer that is due and should fire through `__veFireTimer`.
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct DueJsTimer {
    /// Prelude timer id.
    pub id: u64,
    /// Virtual due time in milliseconds.
    pub due_ms: u64,
    /// Interval period when this is a repeating timer.
    pub repeat_ms: Option<u64>,
}

/// Summary of a [`EventLoop::run_until_quiescent`] call.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct RunReport {
    /// Tasks executed.
    pub tasks_run: usize,
    /// Microtasks executed.
    pub microtasks_run: usize,
    /// Whether the loop was quiescent when the call returned.
    pub quiescent: bool,
    /// Whether the task budget was exhausted.
    pub budget_exhausted: bool,
}

/// The event loop for one page.
#[derive(Default)]
pub struct EventLoop {
    tasks: VecDeque<Task>,
    microtasks: VecDeque<TaskFn>,
    timers: BinaryHeap<Timer>,
    js_timers: BinaryHeap<JsTimer>,
    js_live: HashMap<u64, u64>,
    js_seq: u64,
    cancelled: Vec<TaskId>,
    now: Duration,
    next_id: u64,
    in_flight: usize,
    tasks_executed: u64,
}

impl std::fmt::Debug for EventLoop {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("EventLoop")
            .field("tasks", &self.tasks.len())
            .field("microtasks", &self.microtasks.len())
            .field("timers", &self.timers.len())
            .field("js_timers", &self.js_live.len())
            .field("in_flight", &self.in_flight)
            .field("now", &self.now)
            .finish()
    }
}

impl EventLoop {
    /// Creates an idle loop at virtual time zero.
    #[must_use]
    pub fn new() -> Self {
        Self::default()
    }

    fn next_id(&mut self) -> TaskId {
        self.next_id += 1;
        TaskId(self.next_id)
    }

    /// Current virtual time.
    #[must_use]
    pub fn now(&self) -> Duration {
        self.now
    }

    /// Advances virtual time; timers that become due are moved to the task
    /// queue (in due order) on the next run.
    pub fn advance(&mut self, by: Duration) {
        self.now += by;
    }

    /// Queues a task.
    pub fn queue_task(
        &mut self,
        source: TaskSource,
        run: impl FnOnce(&mut EventLoop) + 'static,
    ) -> TaskId {
        let id = self.next_id();
        self.tasks.push_back(Task {
            id,
            source,
            run: Box::new(run),
        });
        id
    }

    /// Queues a microtask (runs before the next task).
    pub fn queue_microtask(&mut self, run: impl FnOnce(&mut EventLoop) + 'static) {
        self.microtasks.push_back(Box::new(run));
    }

    /// Schedules a task after `delay` of virtual time.
    pub fn set_timeout(
        &mut self,
        delay: Duration,
        run: impl FnOnce(&mut EventLoop) + 'static,
    ) -> TaskId {
        let id = self.next_id();
        self.timers.push(Timer {
            due: self.now + delay,
            id,
            task: Task {
                id,
                source: TaskSource::Timer,
                run: Box::new(run),
            },
        });
        id
    }

    /// Cancels a timer or a queued task. Returns `true` if it had not run.
    pub fn cancel(&mut self, id: TaskId) -> bool {
        let before = self.tasks.len();
        self.tasks.retain(|t| t.id != id);
        if self.tasks.len() != before {
            return true;
        }
        if self.timers.iter().any(|t| t.id == id) {
            self.cancelled.push(id);
            return true;
        }
        false
    }

    /// Records the start of an asynchronous operation (fetch, decode) whose
    /// completion will queue a task. The loop is not quiescent while any are
    /// outstanding.
    pub fn async_begin(&mut self) {
        self.in_flight += 1;
    }

    /// Records the completion of an asynchronous operation.
    pub fn async_end(&mut self) {
        self.in_flight = self.in_flight.saturating_sub(1);
    }

    /// Outstanding asynchronous operations.
    #[must_use]
    pub fn pending_async(&self) -> usize {
        self.in_flight
    }

    /// Queued tasks (including timers that are already due).
    #[must_use]
    pub fn pending_tasks(&self) -> usize {
        self.tasks.len()
            + self
                .timers
                .iter()
                .filter(|t| t.due <= self.now && !self.cancelled.contains(&t.id))
                .count()
    }

    /// Queued microtasks.
    #[must_use]
    pub fn pending_microtasks(&self) -> usize {
        self.microtasks.len()
    }

    /// Arms a page JS timer (`setTimeout` / `setInterval`).
    pub fn arm_js_timer(&mut self, id: u64, now_ms: u64, delay_ms: u64, repeat: bool) {
        self.js_seq += 1;
        self.js_live.insert(id, self.js_seq);
        self.js_timers.push(JsTimer {
            due_ms: now_ms.saturating_add(delay_ms),
            seq: self.js_seq,
            id,
            repeat_ms: repeat.then_some(delay_ms.max(1)),
        });
    }

    /// Cancels a page JS timer.
    pub fn clear_js_timer(&mut self, id: u64) {
        self.js_live.remove(&id);
    }

    /// Live page JS timer count.
    #[must_use]
    pub fn js_timer_count(&self) -> usize {
        self.js_live.len()
    }

    /// Earliest live JS timer due time.
    #[must_use]
    pub fn next_js_timer_due_ms(&self) -> Option<u64> {
        self.js_timers
            .iter()
            .filter(|t| self.js_live.get(&t.id) == Some(&t.seq))
            .map(|t| t.due_ms)
            .min()
    }

    /// `(due within horizon, armed later)` for settle readiness.
    #[must_use]
    pub fn js_timer_readiness(&self, horizon_ms: u64) -> (usize, usize) {
        let mut soon = 0;
        let mut later = 0;
        for t in self
            .js_timers
            .iter()
            .filter(|t| self.js_live.get(&t.id) == Some(&t.seq))
        {
            if t.due_ms <= horizon_ms {
                soon += 1;
            } else {
                later += 1;
            }
        }
        (soon, later)
    }

    /// Pops the next live JS timer due at or before `horizon_ms`.
    pub fn pop_due_js_timer(&mut self, horizon_ms: u64) -> Option<DueJsTimer> {
        loop {
            match self.js_timers.peek() {
                None => return None,
                Some(t) if self.js_live.get(&t.id) != Some(&t.seq) => {
                    self.js_timers.pop();
                }
                Some(t) if t.due_ms > horizon_ms => return None,
                Some(_) => {
                    let t = self.js_timers.pop().expect("peeked");
                    return Some(DueJsTimer {
                        id: t.id,
                        due_ms: t.due_ms,
                        repeat_ms: t.repeat_ms,
                    });
                }
            }
        }
    }

    /// Re-arms an interval after it fired.
    pub fn rearm_js_interval(&mut self, id: u64, due_ms: u64, period: u64) {
        self.js_seq += 1;
        self.js_live.insert(id, self.js_seq);
        self.js_timers.push(JsTimer {
            due_ms: due_ms.saturating_add(period),
            seq: self.js_seq,
            id,
            repeat_ms: Some(period),
        });
    }

    /// Drops a one-shot JS timer after it fired.
    pub fn drop_js_timer(&mut self, id: u64) {
        self.js_live.remove(&id);
    }

    /// Virtual time at which the next timer fires, if any.
    #[must_use]
    pub fn next_timer_due(&self) -> Option<Duration> {
        self.timers
            .iter()
            .filter(|t| !self.cancelled.contains(&t.id))
            .map(|t| t.due)
            .min()
    }

    /// Total tasks executed since creation.
    #[must_use]
    pub fn tasks_executed(&self) -> u64 {
        self.tasks_executed
    }

    /// Quiescent: nothing runnable now and nothing in flight. Future timers
    /// do not block quiescence (a page with `setInterval` would never settle);
    /// callers that care can inspect [`Self::next_timer_due`].
    #[must_use]
    pub fn is_quiescent(&self) -> bool {
        self.tasks.is_empty()
            && self.microtasks.is_empty()
            && self.in_flight == 0
            && self.pending_tasks() == 0
    }

    /// Runs every queued microtask (including ones queued while running).
    pub fn perform_microtask_checkpoint(&mut self) -> usize {
        let mut count = 0;
        while let Some(job) = self.microtasks.pop_front() {
            job(self);
            count += 1;
        }
        count
    }

    fn promote_due_timers(&mut self) {
        while let Some(timer) = self.timers.peek() {
            if timer.due > self.now {
                break;
            }
            let timer = self.timers.pop().expect("peeked");
            if let Some(pos) = self.cancelled.iter().position(|c| *c == timer.id) {
                self.cancelled.swap_remove(pos);
                continue;
            }
            self.tasks.push_back(timer.task);
        }
    }

    fn pop_next_task(&mut self) -> Option<Task> {
        for source in TaskSource::PRIORITY {
            if let Some(i) = self.tasks.iter().position(|t| t.source == source) {
                return self.tasks.remove(i);
            }
        }
        None
    }

    /// Runs one task (highest-priority source, oldest in that source) followed
    /// by a microtask checkpoint. Returns `(ran_task, microtasks_run)`.
    pub fn run_one(&mut self) -> (bool, usize) {
        self.promote_due_timers();
        let Some(task) = self.pop_next_task() else {
            return (false, self.perform_microtask_checkpoint());
        };
        tracing::trace!(id = task.id.0, source = ?task.source, "running task");
        (task.run)(self);
        self.tasks_executed += 1;
        (true, self.perform_microtask_checkpoint())
    }

    /// Runs tasks until the loop is quiescent or `max_tasks` have run.
    pub fn run_until_quiescent(&mut self, max_tasks: usize) -> RunReport {
        let mut report = RunReport::default();
        report.microtasks_run += self.perform_microtask_checkpoint();
        while report.tasks_run < max_tasks {
            let (ran, micro) = self.run_one();
            report.microtasks_run += micro;
            if !ran {
                break;
            }
            report.tasks_run += 1;
        }
        report.quiescent = self.is_quiescent();
        report.budget_exhausted =
            !report.quiescent && report.tasks_run >= max_tasks && self.pending_tasks() > 0;
        report
    }
}

#[cfg(test)]
mod tests {
    use std::cell::RefCell;
    use std::rc::Rc;

    use super::*;

    #[test]
    fn microtasks_run_before_the_next_task_and_timers_fire_in_order() {
        let log = Rc::new(RefCell::new(Vec::new()));
        let mut lp = EventLoop::new();
        let l = log.clone();
        lp.queue_task(TaskSource::DomManipulation, move |lp| {
            l.borrow_mut().push("task1");
            let l2 = l.clone();
            lp.queue_microtask(move |_| l2.borrow_mut().push("micro-from-task1"));
        });
        let l = log.clone();
        lp.queue_task(TaskSource::UserInteraction, move |_| {
            l.borrow_mut().push("task2")
        });
        let l = log.clone();
        lp.queue_microtask(move |_| l.borrow_mut().push("micro0"));
        let l = log.clone();
        lp.set_timeout(Duration::from_millis(20), move |_| {
            l.borrow_mut().push("t20")
        });
        let l = log.clone();
        lp.set_timeout(Duration::from_millis(10), move |_| {
            l.borrow_mut().push("t10")
        });
        let l = log.clone();
        let cancelled = lp.set_timeout(Duration::from_millis(5), move |_| {
            l.borrow_mut().push("never")
        });
        assert!(lp.cancel(cancelled));

        let report = lp.run_until_quiescent(100);
        assert_eq!(
            *log.borrow(),
            vec!["micro0", "task2", "task1", "micro-from-task1"]
        );
        assert!(report.quiescent, "future timers do not block quiescence");
        assert_eq!(report.tasks_run, 2);
        assert_eq!(lp.next_timer_due(), Some(Duration::from_millis(10)));

        lp.advance(Duration::from_millis(25));
        assert!(!lp.is_quiescent(), "due timers are runnable");
        lp.run_until_quiescent(100);
        assert_eq!(&log.borrow()[4..], &["t10", "t20"]);
        assert_eq!(lp.tasks_executed(), 4);
    }

    #[test]
    fn async_operations_and_budget_affect_quiescence() {
        let mut lp = EventLoop::new();
        lp.async_begin();
        assert!(!lp.is_quiescent());
        lp.async_end();
        assert!(lp.is_quiescent());

        for _ in 0..5 {
            lp.queue_task(TaskSource::Networking, |_| {});
        }
        let report = lp.run_until_quiescent(2);
        assert_eq!(report.tasks_run, 2);
        assert!(report.budget_exhausted && !report.quiescent);
        assert_eq!(lp.pending_tasks(), 3);
    }

    #[test]
    fn independent_loops_do_not_block_each_other() {
        let mut busy = EventLoop::new();
        let mut idle = EventLoop::new();
        for _ in 0..1000 {
            busy.queue_task(TaskSource::Networking, |_| {});
        }
        idle.queue_task(TaskSource::UserInteraction, |_| {});
        let idle_report = idle.run_until_quiescent(10);
        assert!(idle_report.quiescent);
        assert_eq!(idle_report.tasks_run, 1);
        assert_eq!(busy.pending_tasks(), 1000);
    }

    #[test]
    fn user_interaction_tasks_run_before_timer_tasks() {
        let log = Rc::new(RefCell::new(Vec::new()));
        let mut lp = EventLoop::new();
        let l = log.clone();
        lp.queue_task(TaskSource::Timer, move |_| {
            l.borrow_mut().push("timer");
        });
        let l = log.clone();
        lp.queue_task(TaskSource::UserInteraction, move |_| {
            l.borrow_mut().push("ui");
        });
        lp.run_until_quiescent(10);
        assert_eq!(*log.borrow(), vec!["ui", "timer"]);
    }

    #[test]
    fn js_timers_live_on_the_same_loop() {
        let mut lp = EventLoop::new();
        lp.arm_js_timer(1, 0, 10, false);
        lp.arm_js_timer(2, 0, 50, true);
        assert_eq!(lp.js_timer_count(), 2);
        assert_eq!(lp.next_js_timer_due_ms(), Some(10));
        assert_eq!(lp.js_timer_readiness(20), (1, 1));
        let due = lp.pop_due_js_timer(20).expect("timeout due");
        assert_eq!(due.id, 1);
        lp.drop_js_timer(due.id);
        assert_eq!(lp.js_timer_count(), 1);
        lp.clear_js_timer(2);
        assert_eq!(lp.js_timer_count(), 0);
        assert!(lp.pop_due_js_timer(100).is_none());
    }
}
