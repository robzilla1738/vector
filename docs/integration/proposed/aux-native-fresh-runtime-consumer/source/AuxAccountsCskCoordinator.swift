// Inactive fixed-home account/CSK transaction. No JS path or lock-held token.
import Foundation
import CryptoKit
import Security
import Darwin

enum AuxCskPublication:String { case stored,same,conflict,unsupported }
enum AuxAccountsCskError:Error { case unavailable }
final class AuxAccountsCskCoordinator {
    private let process=getpid()
    private let retainedHomeFD:Int32?
    private let home:String
    private let review:ReviewedAuxSecureStoreScope
    private let installation:AuxInstallationCommandCore
    private let boundary:AuxSecureStoreBoundary
    init(home:String,review:ReviewedAuxSecureStoreScope,installation:AuxInstallationCommandCore,boundary:AuxSecureStoreBoundary,retainedHomeDescriptor:Int32? = nil)throws {
        guard home.hasPrefix("/"),!home.utf8.contains(0),
              SHA256.hash(data:Data(home.utf8)).map({String(format:"%02x",$0)}).joined()==review.scope else{throw AuxAccountsCskError.unavailable}
        if let retainedHomeDescriptor {
            let fd=fcntl(retainedHomeDescriptor,F_DUPFD_CLOEXEC,0)
            guard fd>=0 else{throw AuxAccountsCskError.unavailable}
            do{try Self.requireRetainedHome(home,fd:fd)}catch{close(fd);throw error}
            retainedHomeFD=fd
        }else{retainedHomeFD=nil}
        self.home=home;self.review=review;self.installation=installation;self.boundary=boundary
    }
    deinit{if let retainedHomeFD{close(retainedHomeFD)}}
    private static func requireRetainedHome(_ home:String,fd:Int32)throws {
        guard let canonical=realpath(home,nil)else{throw AuxAccountsCskError.unavailable}
        defer{free(canonical)}
        var held=stat(),entry=stat()
        guard String(cString:canonical)==home,fstat(fd,&held)==0,lstat(home,&entry)==0,
              held.st_dev==entry.st_dev,held.st_ino==entry.st_ino,
              (held.st_mode&S_IFMT)==S_IFDIR,held.st_uid==geteuid(),held.st_mode&0o7777==0o700 else{throw AuxAccountsCskError.unavailable}
        errno=0
        let acl=acl_get_fd_np(fd,ACL_TYPE_EXTENDED)
        if acl==nil && errno==ENOENT{return}
        guard let acl else{throw AuxAccountsCskError.unavailable};defer{acl_free(UnsafeMutableRawPointer(acl))}
        guard acl_valid(acl)==0 else{throw AuxAccountsCskError.unavailable}
        var aclEntry:acl_entry_t?;errno=0
        guard acl_get_entry(acl,0,&aclEntry) == -1,errno==EINVAL,aclEntry==nil else{throw AuxAccountsCskError.unavailable}
    }
    // Whole synchronous callback executes under the actual OS lock AND caller's
    // owned dispatcher lease. Never release it between JSON read and write.
    func withAccountRegistryLock<T>(_ body:()throws->T)throws->T {try withDirectoryLock{_ in try body()}}
    private func withDirectoryLock<T>(_ body:(Int32)throws->T)throws->T {
        guard getpid()==process else{throw AuxAccountsCskError.unavailable}
        let directory:Int32
        if let retainedHomeFD {
            try Self.requireRetainedHome(home,fd:retainedHomeFD)
            directory=fcntl(retainedHomeFD,F_DUPFD_CLOEXEC,0)
        }else{directory=open(home,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC)}
        guard directory>=0 else{throw AuxAccountsCskError.unavailable};defer{close(directory)}
        var parent=stat();guard fstat(directory,&parent)==0,parent.st_uid==geteuid(),parent.st_mode & 0o077==0 else{throw AuxAccountsCskError.unavailable}
        let fd=openat(directory,".aux-accounts-csk.lock",O_CREAT|O_RDWR|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK,0o600)
        guard fd>=0 else{throw AuxAccountsCskError.unavailable};defer{close(fd)}
        var metadata=stat();guard fstat(fd,&metadata)==0,(metadata.st_mode&S_IFMT)==S_IFREG,metadata.st_uid==geteuid(),metadata.st_nlink==1,metadata.st_mode&0o077==0 else{throw AuxAccountsCskError.unavailable}
        var acquired=false
        for _ in 0..<200 {if flock(fd,LOCK_EX|LOCK_NB)==0{acquired=true;break};guard errno==EWOULDBLOCK || errno==EAGAIN else{throw AuxAccountsCskError.unavailable};usleep(5_000)}
        guard acquired else{throw AuxAccountsCskError.unavailable};defer{_ = flock(fd,LOCK_UN)}
        var entry=stat();guard fstatat(directory,".aux-accounts-csk.lock",&entry,AT_SYMLINK_NOFOLLOW)==0,entry.st_dev==metadata.st_dev,entry.st_ino==metadata.st_ino else{throw AuxAccountsCskError.unavailable}
        return try body(directory) // The persistent lock inode is NEVER unlinked/replaced.
    }
    private func integer(_ value:Any?)->Int64? {
        guard let n=value as? NSNumber,CFGetTypeID(n) != CFBooleanGetTypeID(),n.doubleValue>=0,n.doubleValue<=9_007_199_254_740_991,n.doubleValue.rounded()==n.doubleValue else{return nil};return n.int64Value
    }
    private func binding(directory:Int32,account:Int64,owner:String,generation:Int64)throws->Bool {
        let fd=openat(directory,"accounts.json",O_RDONLY|O_NOFOLLOW|O_CLOEXEC|O_NONBLOCK);guard fd>=0 else{throw AuxAccountsCskError.unavailable};defer{close(fd)}
        var st=stat();guard fstat(fd,&st)==0,(st.st_mode&S_IFMT)==S_IFREG,st.st_uid==geteuid(),st.st_nlink==1,st.st_size>0,st.st_size<=4*1024*1024,st.st_mode&0o022==0 else{throw AuxAccountsCskError.unavailable}
        var bytes=Data(count:Int(st.st_size));var offset=0
        while offset<bytes.count {
            let count=bytes.withUnsafeMutableBytes{Darwin.read(fd,$0.baseAddress!.advanced(by:offset),$0.count-offset)}
            if count<0 && errno==EINTR {continue}
            guard count>0 else{throw AuxAccountsCskError.unavailable};offset += count
        }
        let registry=try strictEnvelopeObject(bytes)
        guard integer(registry["version"])==1,let accounts=registry["accounts"] as? [[String:Any]],let sessions=registry["sessions"] as? [String:Any] else{throw AuxAccountsCskError.unavailable}
        let matching=accounts.filter{integer($0["id"])==account};guard matching.count==1,matching[0]["userId"] as? String==owner,let session=sessions[String(account)] as? [String:Any],let token=session["accessToken"] as? String else{return false}
        // Same supplied persisted contract: account.userId plus session JWT sg.
        // This parses stored metadata; it does not claim to authenticate a JWT.
        let parts=token.split(separator:".",omittingEmptySubsequences:false);guard parts.count==3 else{return false}
        var payload=String(parts[1]).replacingOccurrences(of:"-",with:"+").replacingOccurrences(of:"_",with:"/");payload += String(repeating:"=",count:(4-payload.count%4)%4)
        guard let decoded=Data(base64Encoded:payload) else{return false};return integer(try strictEnvelopeObject(decoded)["sg"])==generation
    }
    private let info=Data("aux.dk.csk.v2".utf8)
    private func subkey(_ root:Data)->SymmetricKey {HKDF<SHA256>.deriveKey(inputKeyMaterial:SymmetricKey(data:root),salt:Data(),info:info,outputByteCount:32)}
    private func record(_ key:Data,root:Data,account:Int64,owner:String,generation:Int64)throws->Data {
        let box=try ChaChaPoly.seal(key,using:subkey(root),authenticating:info)
        let nonce=box.nonce.withUnsafeBytes{Data($0)}
        return try JSONSerialization.data(withJSONObject:["schemaVersion":1,"accountId":account,"boundUserId":owner,"syncGeneration":generation,"encryptedBlob":["format":"aux.dk.v2","purpose":"csk","nonce":nonce.base64EncodedString(),"ciphertext":(box.ciphertext+box.tag).base64EncodedString()]],options:[.sortedKeys,.withoutEscapingSlashes])
    }
    private func equal(_ bytes:Data,key:Data,root:Data,account:Int64,owner:String,generation:Int64)throws->Bool {
        let o=try strictEnvelopeObject(bytes)
        guard Set(o.keys)==["schemaVersion","accountId","boundUserId","syncGeneration","encryptedBlob"],integer(o["schemaVersion"])==1,integer(o["accountId"])==account,o["boundUserId"] as? String==owner,integer(o["syncGeneration"])==generation,let b=o["encryptedBlob"] as? [String:Any],Set(b.keys)==["format","purpose","nonce","ciphertext"],b["format"] as? String=="aux.dk.v2",b["purpose"] as? String=="csk",let n=b["nonce"] as? String,let nonce=Data(base64Encoded:n),nonce.count==12,nonce.base64EncodedString()==n,let c=b["ciphertext"] as? String,let encrypted=Data(base64Encoded:c),encrypted.count==48,encrypted.base64EncodedString()==c else{return false}
        let box=try ChaChaPoly.SealedBox(nonce:ChaChaPoly.Nonce(data:nonce),ciphertext:encrypted.prefix(32),tag:encrypted.suffix(16))
        var plaintext=try ChaChaPoly.open(box,using:subkey(root),authenticating:info);defer{plaintext.resetBytes(in:0..<plaintext.count)}
        guard plaintext.count==32 else{return false};var difference:UInt8=0;for i in 0..<32{difference |= plaintext[i]^key[i]};return difference==0
    }
    func publish(input:String)->AuxCskPublication {
        do {
            let o=try strictEnvelopeObject(Data(input.utf8))
            guard Set(o.keys)==["accountId","owner","generation","keyB64"],let account=integer(o["accountId"]),let generation=integer(o["generation"]),let owner=o["owner"] as? String,!owner.isEmpty,owner.utf8.count<=512,!owner.utf8.contains(0),let text=o["keyB64"] as? String,var key=Data(base64Encoded:text),key.count==32,key.base64EncodedString()==text else{return .unsupported}
            defer{key.resetBytes(in:0..<key.count)}
            return try withDirectoryLock {directory in
                guard try binding(directory:directory,account:account,owner:owner,generation:generation) else{return .conflict}
                let selector=try review.selector("aux.csk_"+String(account))
                return try installation.withCskPublicationRoot {root in
                    func existing()->AuxCskPublication {
                        guard case .bytes(let bytes)=boundary.read(selector) else{return .unsupported}
                        return (try? equal(bytes,key:key,root:root,account:account,owner:owner,generation:generation))==true ? .same:.conflict
                    }
                    switch boundary.read(selector) {
                    case .missing:
                        let data=try record(key,root:root,account:account,owner:owner,generation:generation)
                        let status=boundary.add(selector,data:data)
                        if status==errSecSuccess{return .stored}
                        if status==errSecDuplicateItem{return existing()}
                        return .unsupported
                    case .bytes:return existing()
                    case .failure,.invalid:return .unsupported
                    }
                }
            }
        }catch{return .unsupported}
    }
}
