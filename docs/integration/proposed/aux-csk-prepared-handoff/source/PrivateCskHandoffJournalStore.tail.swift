    private func filename(_ j:CskHandoffJournal,_ hash:String)->String {String(format:"revision-%07d-",j.revision)+hash+".json"}
    private func loadUnlocked()throws->StoredCskHandoffCheckpoint? {
        guard let bytes=try readFile("HEAD.json")else{return nil}
        let object=try strictEnvelopeObject(bytes)
        guard Set(object.keys)==["format","transactionId","revision","file","sha256"]else{throw CskHandoffStoreError.corruptCheckpoint}
        let head=try JSONDecoder().decode(CskHandoffHead.self,from:bytes)
        guard head.format=="aux.csk.prepared-handoff.head.v2",head.transactionId==transactionId,
              (0...3).contains(head.revision),CskHandoffStoreRules.hash(head.sha256),
              head.file==String(format:"revision-%07d-",head.revision)+head.sha256+".json",
              let journalBytes=try readFile(head.file),credentialCopyHash(journalBytes)==head.sha256 else{throw CskHandoffStoreError.corruptCheckpoint}
        let journal=try CskHandoffStoreRules.decode(journalBytes)
        guard journal.transactionId==transactionId,journal.revision==head.revision else{throw CskHandoffStoreError.corruptCheckpoint}
        return .init(journal:journal,sha256:head.sha256)
    }
    func loadCurrent()throws->StoredCskHandoffCheckpoint? {try locked{try loadUnlocked()}}
    func commit(_ journal:CskHandoffJournal,expectedHead:String?)throws->StoredCskHandoffCheckpoint {
        try locked {
            let current=try loadUnlocked()
            guard current?.sha256==expectedHead,journal.transactionId==transactionId else{throw CskHandoffStoreError.staleHead}
            let bytes=try journal.canonicalBytes()
            if let current,current.journal==journal {
                try syncFile(filename(journal,current.sha256));try syncFile("HEAD.json")
                return current
            }
            try CskHandoffStoreRules.successor(journal,current?.journal)
            let hash=credentialCopyHash(bytes),file=filename(journal,hash)
            // O_EXCL deliberately refuses an orphan revision after uncertain
            // publication. No automatic adoption can re-arm a fresh Add.
            try exclusiveWrite(file,bytes:bytes)
            let head=CskHandoffHead(format:"aux.csk.prepared-handoff.head.v2",transactionId:transactionId,revision:journal.revision,file:file,sha256:hash)
            let encoder=JSONEncoder();encoder.outputFormatting=[.sortedKeys,.withoutEscapingSlashes]
            let temporary="HEAD-"+UUID().uuidString.lowercased()+".next"
            try exclusiveWrite(temporary,bytes:encoder.encode(head))
            guard try loadUnlocked()?.sha256==expectedHead else{throw CskHandoffStoreError.staleHead}
            guard renameat(directoryFD,temporary,directoryFD,"HEAD.json")==0 else{throw CskHandoffStoreError.io(errno)}
            try Self.sync(directoryFD)
            guard let loaded=try loadUnlocked(),loaded.sha256==hash,loaded.journal==journal else{throw CskHandoffStoreError.corruptCheckpoint}
            try syncFile(file);try syncFile("HEAD.json")
            return loaded
        }
    }
}
