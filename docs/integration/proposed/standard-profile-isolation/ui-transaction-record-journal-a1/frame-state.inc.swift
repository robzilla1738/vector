    private final class UiTransactionUpload {
        let id:Data
        let transaction:String
        let descriptor:UiCaptureJournal.TransactionDescriptor
        var bytes=Data()
        var receipt:Data?
        var recordDigest:Data?
        var physicalOutcomeUnknown=false
        init(id:Data,transaction:String,descriptor:UiCaptureJournal.TransactionDescriptor) {
            self.id=id;self.transaction=transaction;self.descriptor=descriptor
        }
        func matches(transaction:String,descriptor:UiCaptureJournal.TransactionDescriptor)->Bool {
            let d=self.descriptor
            return self.transaction==transaction && d.ordinal==descriptor.ordinal && d.kind==descriptor.kind &&
                d.previous==descriptor.previous && d.intent==descriptor.intent &&
                d.count==descriptor.count && d.digest==descriptor.digest
        }
    }
    private struct UiTransactionDownload {
        let transaction:String
        let record:UiCaptureJournal.TransactionRecord
    }
