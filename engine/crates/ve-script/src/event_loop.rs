//! The event loop: task queues, microtasks, timers and quiescence.
//!
//! Time is *virtual*: the loop only advances when [`EventLoop::advance`] is
//! called, which makes agent programs and tests deterministic. Embedders that
//! want wall-clock behaviour advance the loop from their own timer.

use std::cmp::Ordering;
use std::collections::{BinaryHeap, VecDeque};
use std::time::Duration;

use serde::{Deserialize, Serialize};

/// Identifies a queued task or timer (for cancellation).
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord, Serialize, Deserialize)]
pub struct TaskId(pub u64);

/// HTML task sources. Each source is conceptually its own FIFO; the loop
/// picks in FIFO order across sources in M0.
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

    /// Runs one task (oldest first) followed by a microtask checkpoint.
    /// Returns `(ran_task, microtasks_run)`.
    pub fn run_one(&mut self) -> (bool, usize) {
        self.promote_due_timers();
        let Some(task) = self.tasks.pop_front() else {
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
            vec!["micro0", "task1", "micro-from-task1", "task2"]
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
}
