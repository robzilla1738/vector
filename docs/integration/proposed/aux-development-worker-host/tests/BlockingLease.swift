// TEST ONLY: actual dispatcher lease, synthetic owner; no protected operations.
import Foundation
import Dispatch
private let fixtureLeaseLock=NSLock()
private var fixtureLeaseCompleted:Int32=0
@_cdecl("AuxFixtureBeginBlockingLease")
func auxFixtureBeginBlockingLease(_ handle:UInt64)->Int32 {
    let started=DispatchSemaphore(value:0)
    fixtureLeaseLock.lock();fixtureLeaseCompleted=0;fixtureLeaseLock.unlock()
    Thread.detachNewThread {
        do {
            try AuxCommandDispatcherRegistry.shared.withContext(handle){_ in
                started.signal()
                Thread.sleep(forTimeInterval:0.15)
                fixtureLeaseLock.lock();fixtureLeaseCompleted=1;fixtureLeaseLock.unlock()
            }
        }catch{started.signal()}
    }
    return started.wait(timeout:.now()+2) == .success ? 0:-1
}
@_cdecl("AuxFixtureLeaseCompleted")
func auxFixtureLeaseCompleted()->Int32 {
    fixtureLeaseLock.lock();defer{fixtureLeaseLock.unlock()};return fixtureLeaseCompleted
}
