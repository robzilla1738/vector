        // Immutable transaction DATA, never a migration/profile grant. The
        // authenticated native controller joins these bytes to real live holds.
        struct TransactionDescriptor {
            let ordinal:Int
            let kind:UInt8
            let previous:Data
            let intent:Data
            let count:Int
            let digest:Data
        }
        struct TransactionRecord {
            let descriptor:TransactionDescriptor
            let receipt:Data
            let payload:Data
            var digest:Data {Data(SHA256.hash(data:receipt))}
        }
        private static let transactionKinds = ["pre-target-intent", "target-attempt",
            "store-readback", "restore-attempt", "source-readback",
            "backends-target-observed", "cache-publish-attempt", "cache-publish-ack"]
        private static func recordName(_ ordinal:Int,_ suffix:String)throws->String {
            guard (0..<64).contains(ordinal),["payload","binding","READY"].contains(suffix)
                else{throw Failure.invalid}
            return String(format:"transaction-r%02d",ordinal)+"."+suffix
        }
        private static func digestText(_ data:Data)->String {
            data.map{String(format:"%02x",$0)}.joined()
        }
        private func hasRecordFile(_ ordinal:Int,_ suffix:String)throws->Bool {
            try revalidate()
            var value=stat()
            let name=try Self.recordName(ordinal,suffix)
            if fstatat(directoryFD,name,&value,AT_SYMLINK_NOFOLLOW)==0 {
                guard (value.st_mode & S_IFMT)==S_IFREG,value.st_uid==geteuid(),
                      (value.st_mode & 0o7777)==0o600,value.st_nlink==1 else{throw Failure.unsafe}
                return true
            }
            guard errno==ENOENT else{throw Failure.io(errno)}
            return false
        }
        private func syncRecordFile(_ name:String)throws {
            try revalidate()
            let fd=openat(directoryFD,name,O_RDWR|O_NONBLOCK|O_NOFOLLOW|O_CLOEXEC)
            guard fd>=0 else{throw Failure.io(errno)}
            defer{Darwin.close(fd)}
            try Self.sameEntry(parent:directoryFD,name:name,fd:fd,directory:false)
            try Self.sync(fd)
            try Self.sameEntry(parent:directoryFD,name:name,fd:fd,directory:false)
            try Self.sync(directoryFD)
            try revalidate()
        }
        private func transactionBinding(_ d:TransactionDescriptor,writerGeneration:UInt64,
            captureReceipt:Data,capture:Data,sourceGeneration:UInt64)throws->Data {
            guard (0..<64).contains(d.ordinal),(1...8).contains(d.kind),
                  d.previous.count==32,d.intent.count==32,d.digest.count==32,
                  d.count>0,d.count<=Self.limit,writerGeneration != 0 else{throw Failure.invalid}
            let root=try Self.metadata(rootFD,directory:true)
            return try Self.encode([
                "format":"aux.ui-storage.transaction-binding.v1",
                "phase":"unqualified-data","qualified":false,"activationAuthorized":false,
                "transactionId":transaction,"ordinal":String(d.ordinal),
                "kind":Self.transactionKinds[Int(d.kind)-1],
                "writerGeneration":String(writerGeneration),
                "captureSourceGeneration":String(sourceGeneration),
                "captureReceiptSha256":Self.hash(captureReceipt),"captureSha256":Self.hash(capture),
                "policySha256":context.journal.policySha256,
                "initialJournalSha256":context.durableJournalSha256,
                "rootDevice":String(root.st_dev),"rootInode":String(root.st_ino),
                "previousRecordSha256":Self.digestText(d.previous),
                "intentSha256":Self.digestText(d.intent),
                "payloadSha256":Self.digestText(d.digest),"payloadBytes":String(d.count)])
        }
        private func transactionReceipt(_ d:TransactionDescriptor,binding:Data)throws->Data {
            try Self.encode(["format":"aux.ui-storage.transaction-receipt.v1",
                "phase":"unqualified-data","qualified":false,"activationAuthorized":false,
                "transactionId":transaction,"ordinal":String(d.ordinal),
                "kind":Self.transactionKinds[Int(d.kind)-1],
                "bindingSha256":Self.hash(binding),"payloadSha256":Self.digestText(d.digest),
                "previousRecordSha256":Self.digestText(d.previous),"intentSha256":Self.digestText(d.intent)])
        }
        private static func sameDescriptor(_ a:TransactionDescriptor,_ b:TransactionDescriptor)->Bool {
            a.ordinal==b.ordinal && a.kind==b.kind && a.previous==b.previous &&
                a.intent==b.intent && a.count==b.count && a.digest==b.digest
        }
        private func transactionRecords(captureReceipt:Data,capture:Data,sourceGeneration:UInt64)throws->[TransactionRecord] {
            var records=[TransactionRecord](),total=0,ended=false
            for ordinal in 0..<64 {
                let ready=try hasRecordFile(ordinal,"READY")
                let payloadExists=try hasRecordFile(ordinal,"payload")
                let bindingExists=try hasRecordFile(ordinal,"binding")
                if !ready {
                    // Partial or gapped records are retained uncertainty. Never
                    // skip them, replace them, or infer a target action absent.
                    guard !payloadExists && !bindingExists else{throw Failure.incomplete}
                    ended=true;continue
                }
                guard !ended,payloadExists,bindingExists else{throw Failure.incomplete}
                let payloadName=try Self.recordName(ordinal,"payload")
                let bindingName=try Self.recordName(ordinal,"binding")
                let readyName=try Self.recordName(ordinal,"READY")
                // Fresh physical sync plus exact readback resolves a lost
                // receipt; file existence alone never settles a write.
                for name in [payloadName,bindingName,readyName] {try syncRecordFile(name)}
                let payload=try read(payloadName)
                let binding=try read(bindingName,limit:16_384)
                let receipt=try read(readyName,limit:16_384)
                guard !payload.isEmpty,total<=Self.limit-payload.count,
                      let b=try JSONSerialization.jsonObject(with:binding) as? [String:Any],
                      let generationText=b["writerGeneration"] as? String,
                      let writerGeneration=UInt64(generationText),writerGeneration != 0,
                      String(writerGeneration)==generationText,
                      let kindText=b["kind"] as? String,
                      let kindIndex=Self.transactionKinds.firstIndex(of:kindText)
                    else{throw Failure.binding}
                total += payload.count
                let previous=records.last?.digest ?? Data(repeating:0,count:32)
                let digest=Data(SHA256.hash(data:payload))
                let intent=records.first?.descriptor.intent ?? digest
                let descriptor=TransactionDescriptor(ordinal:ordinal,kind:UInt8(kindIndex+1),
                    previous:previous,intent:intent,count:payload.count,digest:digest)
                guard ordinal != 0 || descriptor.kind==1,
                      ordinal == 0 || descriptor.kind != 1,
                      try transactionBinding(descriptor,writerGeneration:writerGeneration,
                        captureReceipt:captureReceipt,capture:capture,sourceGeneration:sourceGeneration)==binding,
                      try transactionReceipt(descriptor,binding:binding)==receipt else{throw Failure.binding}
                records.append(TransactionRecord(descriptor:descriptor,receipt:receipt,payload:payload))
            }
            try revalidate()
            return records
        }
        static func records(context:NativeFreshStagedContext,transaction:String)throws->[TransactionRecord] {
            let capture=try load(context:context,transaction:transaction)
            let store=try UiCaptureJournal(context:context,transaction:transaction,create:false)
            return try store.transactionRecords(captureReceipt:capture.receipt,
                capture:capture.capture,sourceGeneration:capture.sourceGeneration)
        }
        static func persistRecord(context:NativeFreshStagedContext,transaction:String,
            descriptor:TransactionDescriptor,payload:Data)throws->TransactionRecord {
            guard (0..<64).contains(descriptor.ordinal),(1...8).contains(descriptor.kind),
                  descriptor.count>0,descriptor.count<=Self.limit,
                  payload.count==descriptor.count,
                  Data(SHA256.hash(data:payload))==descriptor.digest else{throw Failure.invalid}
            let capture=try load(context:context,transaction:transaction)
            let store=try UiCaptureJournal(context:context,transaction:transaction,create:false)
            let records=try store.transactionRecords(captureReceipt:capture.receipt,
                capture:capture.capture,sourceGeneration:capture.sourceGeneration)
            if descriptor.ordinal<records.count {
                let existing=records[descriptor.ordinal]
                guard sameDescriptor(existing.descriptor,descriptor),existing.payload==payload else{throw Failure.binding}
                return existing
            }
            guard descriptor.ordinal==records.count,records.count<64,
                  descriptor.previous==(records.last?.digest ?? Data(repeating:0,count:32)),
                  descriptor.intent==(records.first?.descriptor.intent ?? descriptor.digest),
                  (descriptor.ordinal==0 ? descriptor.kind==1:descriptor.kind != 1),
                  records.reduce(0,{$0+$1.payload.count})<=Self.limit-payload.count else{throw Failure.binding}
            let binding=try store.transactionBinding(descriptor,writerGeneration:store.generation,
                captureReceipt:capture.receipt,capture:capture.capture,sourceGeneration:capture.sourceGeneration)
            let receipt=try store.transactionReceipt(descriptor,binding:binding)
            try store.writeNew(recordName(descriptor.ordinal,"payload"),payload)
            try store.writeNew(recordName(descriptor.ordinal,"binding"),binding)
            guard try store.read(recordName(descriptor.ordinal,"payload"))==payload,
                  try store.read(recordName(descriptor.ordinal,"binding"),limit:16_384)==binding else{throw Failure.binding}
            try store.writeNew(recordName(descriptor.ordinal,"READY"),receipt)
            let observed=try store.transactionRecords(captureReceipt:capture.receipt,
                capture:capture.capture,sourceGeneration:capture.sourceGeneration)
            guard observed.count==descriptor.ordinal+1,
                  sameDescriptor(observed[descriptor.ordinal].descriptor,descriptor),
                  observed[descriptor.ordinal].payload==payload else{throw Failure.binding}
            return observed[descriptor.ordinal]
        }
