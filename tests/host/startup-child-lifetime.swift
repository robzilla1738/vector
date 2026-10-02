// One ORIGINAL posix_spawn child. No PID/path/process selectors or polling.
// Source-only until the dedicated builder compiles this exact helper assembly.
import Darwin
import Foundation
import Dispatch

final class StartupChildLifetime {
  private let lock = NSLock()
  private let queue = DispatchQueue(label: "aux.startup-helper.cancellation")
  private var sources: [DispatchSourceSignal] = []
  private var pid: pid_t?
  private var spawning = false
  private var canceled = false
  private var escalationScheduled = false
  private var reaped = false
  init() {
    signal(SIGCHLD, SIG_DFL) // preserve sole explicit wait/reap ownership
    for number in [SIGTERM, SIGINT] {
      signal(number, SIG_IGN)
      let source = DispatchSource.makeSignalSource(signal: number, queue: queue)
      source.setEventHandler { [weak self] in self?.requestCancellation() }
      sources.append(source); source.resume()
    }
  }
  deinit { sources.forEach { $0.cancel() } }
  func beginSpawn() -> Bool {
    lock.lock(); defer { lock.unlock() }
    guard !canceled, !spawning, pid == nil, !reaped else { return false }
    spawning = true
    return true
  }
  // Called IMMEDIATELY after the original posix_spawn returns, before metadata
  // IO or receipt emission. Cancellation during spawn cannot lose its child.
  func spawned(_ original: pid_t?) {
    lock.lock()
    guard spawning, pid == nil else { lock.unlock(); _exit(125) }
    spawning = false; pid = original
    let cancel = canceled
    if cancel, let actual = pid { kill(actual, SIGTERM) }
    lock.unlock()
    if cancel { requestCancellation() }
  }
  func isCanceled() -> Bool {
    lock.lock(); defer { lock.unlock() }
    return canceled
  }
  func requestCancellation() {
    lock.lock()
    canceled = true
    guard let actual = pid, !reaped else {
      let safeToExit = !spawning
      lock.unlock()
      if safeToExit { _exit(125) }
      return
    }
    // waitid(WNOWAIT) leaves the exited child unreaped until the locked final
    // waitpid below. A canceled child PID cannot become a foreign reused PID.
    kill(actual, SIGTERM)
    let schedule = !escalationScheduled
    escalationScheduled = true
    lock.unlock()
    if schedule {
      queue.asyncAfter(deadline: .now() + .milliseconds(750)) { [weak self] in
        guard let self else { return }
        self.lock.lock(); defer { self.lock.unlock() }
        if self.pid == actual && !self.reaped { kill(actual, SIGKILL) }
      }
      queue.asyncAfter(deadline: .now() + .seconds(3)) { [weak self] in
        guard let self else { return }
        self.lock.lock()
        let unreaped = self.pid == actual && !self.reaped
        if unreaped { kill(actual, SIGKILL) }
        self.lock.unlock()
        if unreaped {
          FileHandle.standardError.write(Data("Startup child did not reap within cancellation deadline\n".utf8))
          _exit(125) // original cleanup failure, never a successful exit receipt
        }
      }
    }
  }
  func waitForExit() throws -> Int32 {
    lock.lock()
    guard let actual = pid, !spawning, !reaped else { lock.unlock(); throw StartupReceiptError.io }
    lock.unlock()
    // This is the sole wait/reap owner. No Node time/clock mapping or timer poll.
    var information = siginfo_t()
    var observed: Int32
    repeat { observed = waitid(P_PID, id_t(actual), &information, WEXITED | WNOWAIT) }
      while observed < 0 && errno == EINTR
    guard observed == 0 else {
      if errno == ECHILD {
        // Never signal a PID whose original child wait ownership was lost.
        lock.lock(); reaped = true; pid = nil; lock.unlock()
      }
      throw StartupReceiptError.io
    }
    lock.lock(); defer { lock.unlock() }
    guard pid == actual, !reaped else { throw StartupReceiptError.io }
    var status: Int32 = 0
    var waited: pid_t
    repeat { waited = waitpid(actual, &status, 0) } while waited < 0 && errno == EINTR
    guard waited == actual else {
      if errno == ECHILD { reaped = true; pid = nil }
      throw StartupReceiptError.io
    }
    reaped = true
    return status
  }
}
