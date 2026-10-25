@_silgen_name("AuxCopyOrdinaryBrowserParentLifetime")
private func copyOrdinaryParentLifetime(_ pid:UnsafeMutablePointer<Int32>,_ seconds:UnsafeMutablePointer<UInt64>,_ microseconds:UnsafeMutablePointer<UInt64>)->Int32
@_silgen_name("AuxOrdinaryPriorBrowserHasExited")
private func ordinaryPriorBrowserExited(_ pid:Int32,_ seconds:UInt64,_ microseconds:UInt64)->Int32
struct AuxOrdinaryBrowserLifetime:Equatable {
    let pid:Int32
    let seconds:UInt64
    let microseconds:UInt64
    private static func current()throws->Self {
        var pid:Int32 = -1,seconds:UInt64=0,microseconds:UInt64=0
        guard copyOrdinaryParentLifetime(&pid,&seconds,&microseconds)==0,pid>1,seconds>0,microseconds<1_000_000 else{throw AuxFreshColdGuardError.path}
        return .init(pid:pid,seconds:seconds,microseconds:microseconds)
    }
    static func capture(peer:AuxLiveNativeParentConnection)throws->Self {
        // Kernel direct-parent facts are sampled between actual retained peer
        // authentication, never supplied as JSON/PID/approval by a caller.
        try peer.revalidate();let value=try current();try peer.revalidate()
        guard try current()==value else{throw AuxFreshColdGuardError.path};return value
    }
    func requireCurrent()throws {guard try Self.current()==self else{throw AuxFreshColdGuardError.path}}
    func hasExited()->Bool {ordinaryPriorBrowserExited(pid,seconds,microseconds)==1}
}
