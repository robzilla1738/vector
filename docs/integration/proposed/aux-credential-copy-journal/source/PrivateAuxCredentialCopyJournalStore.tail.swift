    private func filename(_ j:AuxCredentialCopyJournal,_ hash:String)->String {String(format:"revision-%07d-",j.revision)+hash+".json"}
    private func loadUnlocked()throws->StoredAuxCredentialCopyCheckpoint? {
        guard let bytes=try readFile("HEAD.json")else{return nil}
        let object=try strictEnvelopeObject(bytes)
        guard Set(object.keys)==["format","transactionId","revision","file","sha256"]else{throw AuxCredentialCopyStoreError.corruptCheckpoint}
        let head=try JSONDecoder().decode(AuxCredentialCopyStoreHead.self,from:bytes)
        guard head.format=="aux.credential.copy-only.head.v1",head.transactionId==transactionId,
              (0...3).contains(head.revision),AuxCredentialCopyStoreRules.hash(head.sha256),
              head.file==String(format:"revision-%07d-",head.revision)+head.sha256+".json",
              let journalBytes=try readFile(head.file),credentialCopyHash(journalBytes)==head.sha256 else{throw AuxCredentialCopyStoreError.corruptCheckpoint}
        let journal=try AuxCredentialCopyStoreRules.decode(journalBytes)
        guard journal.transactionId==transactionId,journal.revision==head.revision else{throw AuxCredentialCopyStoreError.corruptCheckpoint}
        return .init(journal:journal,sha256:head.sha256,bytes:journalBytes)
    }
    func loadCurrent()throws->StoredAuxCredentialCopyCheckpoint? {try locked{try loadUnlocked()}}
    func commit(_ journal:AuxCredentialCopyJournal,expectedHead:String?)throws->StoredAuxCredentialCopyCheckpoint {
        try locked {
            let current=try loadUnlocked()
            guard current?.sha256==expectedHead,journal.transactionId==transactionId else{throw AuxCredentialCopyStoreError.staleHead}
            let bytes=try journal.canonicalBytes()
            if let current,current.journal==journal {
                try syncFile(filename(journal,current.sha256));try syncFile("HEAD.json")
                return current
            }
            try AuxCredentialCopyStoreRules.successor(journal,current?.journal)
            let hash=credentialCopyHash(bytes),file=filename(journal,hash)
            // O_EXCL deliberately refuses an orphan revision after uncertain
            // publication. No automatic adoption can re-arm a fresh Add.
            try exclusiveWrite(file,bytes:bytes)
            let head=AuxCredentialCopyStoreHead(format:"aux.credential.copy-only.head.v1",transactionId:transactionId,revision:journal.revision,file:file,sha256:hash)
            let encoder=JSONEncoder();encoder.outputFormatting=[.sortedKeys,.withoutEscapingSlashes]
            let temporary="HEAD-"+UUID().uuidString.lowercased()+".next"
            try exclusiveWrite(temporary,bytes:encoder.encode(head))
            guard try loadUnlocked()?.sha256==expectedHead else{throw AuxCredentialCopyStoreError.staleHead}
            guard renameat(directoryFD,temporary,directoryFD,"HEAD.json")==0 else{throw AuxCredentialCopyStoreError.io(errno)}
            try Self.sync(directoryFD)
            guard let loaded=try loadUnlocked(),loaded.sha256==hash,loaded.journal==journal else{throw AuxCredentialCopyStoreError.corruptCheckpoint}
            try syncFile(file);try syncFile("HEAD.json")
            return loaded
        }
    }
}
