    // Ordinary mode is a distinct sealed-policy/storage contract. Its ADMITTED
    // history does not mean ES CLEAN and is never accepted by supervised mode.
#if AUX_BROWSER_ONLY_NATIVE_STARTUP
    private struct OrdinaryStored:Equatable {
        let reservation:String
        let generation:UInt64
        let phase:String
        let installation:String
        let existing:Bool
        let browser:AuxOrdinaryBrowserLifetime
    }
    private static func ordinaryParent(_ path:String)throws->Int32 {
        let fd=open(path,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK)
        guard fd>=0 else{throw AuxFreshColdGuardError.io(errno)}
        do{try metadata(fd,directory:true);try pathIdentity(path,fd);return fd}
        catch{close(fd);throw error}
    }
    private static func ordinaryInstallation(_ policy:AuxAuthenticatedFreshBootstrapPolicy)throws->String {
        let parent=try ordinaryParent(policy.contents.canonicalPrivateParent);defer{close(parent)}
        let fd=openat(parent,AuxFreshNativeHome.reservationName,O_RDONLY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK)
        if fd<0 {guard errno==ENOENT else{throw AuxFreshColdGuardError.io(errno)};return ""}
        defer{close(fd)}
        try metadata(fd,directory:false);try entry(parent,AuxFreshNativeHome.reservationName,fd)
        let bytes=try readRecord(fd)
        let object=try strictEnvelopeObject(bytes)
        guard object["format"] as? String=="aux.first-installation.reservation.v1" else{throw AuxFreshColdGuardError.path}
        return freshBootstrapDigest(bytes)
    }
    private static func ordinaryBinding(policy:AuxAuthenticatedFreshBootstrapPolicy,role:Int,root:Int32,
        reservation:String,generation:UInt64,phase:String,installation:String,existing:Bool,browser:AuxOrdinaryBrowserLifetime)throws->Data {
        guard let taskPath=policy.contents.canonicalTaskParent else{throw AuxFreshColdGuardError.path}
        let control=try ordinaryParent(policy.contents.canonicalPrivateParent);defer{close(control)}
        let task=try ordinaryParent(taskPath);defer{close(task)}
        var r=stat(),c=stat(),t=stat()
        guard fstat(root,&r)==0,fstat(control,&c)==0,fstat(task,&t)==0 else{throw AuxFreshColdGuardError.metadata}
        return try JSONSerialization.data(withJSONObject:[
            "format":"aux.browser.ordinary-root-lease.v1","policySha256":policy.policySha256,
            "role":role,"device":String(r.st_dev),"inode":String(r.st_ino),
            "controlDevice":String(c.st_dev),"controlInode":String(c.st_ino),
            "taskDevice":String(t.st_dev),"taskInode":String(t.st_ino),
            "generation":String(generation),"reservation":reservation,"phase":phase,
            "installationReservationSha256":installation,
            "existingData":existing,
            "browserPid":String(browser.pid),"browserBirthSeconds":String(browser.seconds),
            "browserBirthMicroseconds":String(browser.microseconds)
        ],options:[.sortedKeys,.withoutEscapingSlashes])
    }
    private static func decodeOrdinary(_ bytes:Data,policy:AuxAuthenticatedFreshBootstrapPolicy,role:Int,root:Int32)throws->OrdinaryStored {
        let object=try strictEnvelopeObject(bytes)
        guard let reservation=object["reservation"] as? String,UUID(uuidString:reservation)?.uuidString==reservation,
              let gs=object["generation"] as? String,let g=UInt64(gs),g>0,String(g)==gs,
              let phase=object["phase"] as? String,["prepared","admitted"].contains(phase),
              let installation=object["installationReservationSha256"] as? String,
              let existing=object["existingData"] as? Bool,
              installation.isEmpty || (installation.count==64 && installation.allSatisfy({"0123456789abcdef".contains($0)})),
              !(existing || phase=="admitted") || !installation.isEmpty,
              let ps=object["browserPid"] as? String,let pid=Int32(ps),pid>1,String(pid)==ps,
              let ss=object["browserBirthSeconds"] as? String,let seconds=UInt64(ss),seconds>0,String(seconds)==ss,
              let us=object["browserBirthMicroseconds"] as? String,let microseconds=UInt64(us),microseconds<1_000_000,String(microseconds)==us else{throw AuxFreshColdGuardError.path}
        let browser=AuxOrdinaryBrowserLifetime(pid:pid,seconds:seconds,microseconds:microseconds)
        guard bytes == (try ordinaryBinding(policy:policy,role:role,root:root,reservation:reservation,generation:g,phase:phase,installation:installation,existing:existing,browser:browser)) else{throw AuxFreshColdGuardError.path}
        return .init(reservation:reservation,generation:g,phase:phase,installation:installation,existing:existing,browser:browser)
    }
    private static func noSupervisedMarker(_ root:Int32)throws {
        for name in [".aux-browser-startup-lease.v1",".aux-browser-startup-lease.v2"] {
            var st=stat()
            guard fstatat(root,name,&st,AT_SYMLINK_NOFOLLOW) != 0,errno==ENOENT else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
        }
    }
    private static func acquireOrdinary(policy:AuxAuthenticatedFreshBootstrapPolicy,generation:UInt64,
        data:Int32,cache:Int32,browser:AuxOrdinaryBrowserLifetime)throws->AuxBrowserFreshRootAdmission {
        try policy.revalidateCurrentIdentity();try browser.requireCurrent()
        guard generation>0,let paths=policy.contents.browserStartupRoots,paths.count==2 else{throw AuxFreshColdGuardError.path}
        var roots=[Int32](),markers=[Int32](),records=[Data]();var transferred=false
        defer{if !transferred{for fd in markers+roots{close(fd)}}}
        var existing=[Bool]()
        for (i,source) in [data,cache].enumerated() {
            let fd=fcntl(source,F_DUPFD_CLOEXEC,0);guard fd>=0 else{throw AuxFreshColdGuardError.io(errno)};roots.append(fd)
            try metadata(fd,directory:true);try pathIdentity(paths[i],fd);try noSupervisedMarker(fd)
            var st=stat();let status=fstatat(fd,marker,&st,AT_SYMLINK_NOFOLLOW)
            guard status==0 || errno==ENOENT else{throw AuxFreshColdGuardError.io(errno)};existing.append(status==0)
        }
        guard existing[0]==existing[1] else{throw AuxFreshColdGuardError.path}
        let reopening=existing[0]
        for root in roots {
            let fd=openat(root,marker,O_RDWR|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK|(reopening ? 0:O_CREAT|O_EXCL),0o600)
            guard fd>=0 else{throw AuxFreshColdGuardError.io(errno)};markers.append(fd)
            try metadata(fd,directory:false);try entry(root,marker,fd)
            guard flock(fd,LOCK_EX|LOCK_NB)==0 else{throw AuxFreshColdGuardError.installerBusy}
        }
        let installation=try ordinaryInstallation(policy)
        var permitsExisting=false
        if reopening {
            let first=try decodeOrdinary(readRecord(markers[0]),policy:policy,role:1,root:roots[0])
            let second=try decodeOrdinary(readRecord(markers[1]),policy:policy,role:2,root:roots[1])
            guard first==second,first.installation==installation,
                  first.browser != browser,first.browser.hasExited() else{throw AuxFreshColdBootstrapError.legacyOrUnknownExistingState}
            permitsExisting=first.phase=="admitted" || first.existing
            if !permitsExisting {for root in roots{try inventory(root,allowed:[".","..",marker])}}
        }else{
            // A missing ordinary marker never adopts pre-existing browser data.
            for root in roots{try inventory(root,allowed:[".","..",marker])}
        }
        let reservation=UUID().uuidString
        for i in roots.indices {
            let record=try ordinaryBinding(policy:policy,role:i+1,root:roots[i],reservation:reservation,generation:generation,phase:"prepared",installation:installation,existing:permitsExisting,browser:browser)
            try writeRecord(record,fd:markers[i]);guard fsync(roots[i])==0 else{throw AuxFreshColdGuardError.io(errno)};records.append(record)
        }
        let owned=AuxBrowserFreshRootAdmission(policy:policy,generation:generation,paths:paths,roots:roots,markers:markers,records:records,reservation:reservation,permitsExistingData:permitsExisting,priorCleanReceipt:"",ordinaryBrowser:browser)
        owned.ordinaryInstallationSha=installation
        transferred=true;try owned.revalidate();return owned
    }
    private func validateOrdinaryLocked()throws {
        guard phase != .failed,let browser=ordinaryBrowser else{throw AuxFreshColdGuardError.path}
        try policy.revalidateCurrentIdentity();try browser.requireCurrent()
        if phase == .admitted || !ordinaryInstallationSha.isEmpty {
            guard try Self.ordinaryInstallation(policy)==ordinaryInstallationSha else{throw AuxFreshColdGuardError.path}
        }
        for i in roots.indices {
            try Self.metadata(roots[i],directory:true);try Self.pathIdentity(paths[i],roots[i]);try Self.noSupervisedMarker(roots[i])
            try Self.metadata(markers[i],directory:false);try Self.entry(roots[i],Self.marker,markers[i])
            guard try Self.readRecord(markers[i])==records[i] else{throw AuxFreshColdGuardError.path}
        }
        if phase == .prepared {do{try validateStartupInventoriesLocked()}catch{phase = .failed;throw error}}
    }
    private func ordinaryReceipt()throws->Data {
        guard getpid()==process else{throw AuxFreshColdGuardError.wrongProcess}
        lock.lock();defer{lock.unlock()};try validateOrdinaryLocked()
        guard phase == .prepared || phase == .admitted,let browser=ordinaryBrowser else{throw AuxFreshColdGuardError.path}
        if phase == .prepared {
            let installation=try Self.ordinaryInstallation(policy)
            guard !installation.isEmpty else{throw AuxFreshColdGuardError.path}
            phase = .failed // Any partial record remains refused; never reset/retry it.
            var admitted=[Data]()
            for i in roots.indices {
                if !permitsExistingData {try Self.inventory(roots[i],allowed:[".","..",Self.marker])}
                let record=try Self.ordinaryBinding(policy:policy,role:i+1,root:roots[i],reservation:reservation,generation:generation,phase:"admitted",installation:installation,existing:permitsExistingData,browser:browser)
                try Self.writeRecord(record,fd:markers[i]);guard fsync(roots[i])==0 else{throw AuxFreshColdGuardError.io(errno)};admitted.append(record)
            }
            records=admitted;ordinaryInstallationSha=installation;phase = .admitted
            do{try validateOrdinaryLocked();try validateStartupInventoriesLocked()}catch{phase = .failed;throw error}
        }
        var g=generation.littleEndian
        var bytes=withUnsafeBytes(of:&g){Data($0)}
        for path in paths{bytes.append(contentsOf:SHA256.hash(data:Data(path.utf8)))}
        return bytes // Existing authenticated generation+root-digest contract,72bytes.
    }
#endif
