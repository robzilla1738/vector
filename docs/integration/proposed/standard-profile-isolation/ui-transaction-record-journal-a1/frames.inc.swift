                case 7: // Finite descriptor only; persistence is a separate physical action.
                    guard frame.count==138 else{throw UiCaptureFrameError.invalid}
                    let transaction=try Self.captureUUID(Data(frame[1..<17]))
                    let id=Data(frame[17..<33]);_ = try Self.captureUUID(id)
                    let ordinal=Int(try Self.captureInteger(frame,33,4)),kind=frame[37]
                    let count=Int(try Self.captureInteger(frame,102,4))
                    guard (0..<64).contains(ordinal),(1...8).contains(kind),count>0,count<=64*1024*1024
                        else{throw UiCaptureFrameError.invalid}
                    let descriptor=UiCaptureJournal.TransactionDescriptor(ordinal:ordinal,kind:kind,
                        previous:Data(frame[38..<70]),intent:Data(frame[70..<102]),
                        count:count,digest:Data(frame[106..<138]))
                    if let previous=entry.uiTransactionUpload {
                        if previous.id==id {
                            guard previous.matches(transaction:transaction,descriptor:descriptor),
                                  !previous.physicalOutcomeUnknown else{throw UiCaptureFrameError.conflict}
                            return Data([7])+Self.captureIntegerBytes(UInt64(previous.bytes.count),4)
                        }
                        guard previous.receipt != nil,!previous.physicalOutcomeUnknown
                            else{throw UiCaptureFrameError.incomplete}
                    }
                    // The UUID is only a locator for an actual complete native
                    // capture journal under this retained authenticated root.
                    _ = try UiCaptureJournal.load(context:captured.owner,transaction:transaction)
                    entry.uiTransactionUpload=UiTransactionUpload(id:id,transaction:transaction,descriptor:descriptor)
                    return Data([7])+Self.captureIntegerBytes(0,4)
                case 8:
                    guard frame.count>21,let upload=entry.uiTransactionUpload,
                          frame[1..<17]==upload.id,upload.receipt==nil,
                          !upload.physicalOutcomeUnknown else{throw UiCaptureFrameError.invalid}
                    let offset=Int(try Self.captureInteger(frame,17,4)),chunk=Data(frame[21...])
                    guard offset==upload.bytes.count,offset<=upload.descriptor.count,
                          chunk.count<=upload.descriptor.count-offset else{throw UiCaptureFrameError.conflict}
                    upload.bytes.append(chunk)
                    return Data([8])+Self.captureIntegerBytes(UInt64(upload.bytes.count),4)
                case 9:
                    guard frame.count==17,let upload=entry.uiTransactionUpload,
                          frame[1..<17]==upload.id else{throw UiCaptureFrameError.invalid}
                    if let receipt=upload.receipt,let digest=upload.recordDigest {
                        return Data([9])+digest+Self.captureIntegerBytes(UInt64(receipt.count),4)+receipt
                    }
                    guard !upload.physicalOutcomeUnknown else{throw UiCaptureFrameError.unknown}
                    guard upload.bytes.count==upload.descriptor.count,
                          Data(SHA256.hash(data:upload.bytes))==upload.descriptor.digest else{throw UiCaptureFrameError.incomplete}
                    upload.physicalOutcomeUnknown=true
                    let record=try UiCaptureJournal.persistRecord(context:captured.owner,
                        transaction:upload.transaction,descriptor:upload.descriptor,payload:upload.bytes)
                    upload.receipt=record.receipt;upload.recordDigest=record.digest;upload.physicalOutcomeUnknown=false
                    return Data([9])+record.digest+Self.captureIntegerBytes(UInt64(record.receipt.count),4)+record.receipt
                case 10:
                    guard frame.count==21 else{throw UiCaptureFrameError.invalid}
                    let transaction=try Self.captureUUID(Data(frame[1..<17]))
                    let ordinal=Int(try Self.captureInteger(frame,17,4))
                    guard (0..<64).contains(ordinal) else{throw UiCaptureFrameError.invalid}
                    let records=try UiCaptureJournal.records(context:captured.owner,transaction:transaction)
                    guard ordinal<records.count else{throw UiCaptureFrameError.incomplete}
                    let record=records[ordinal]
                    entry.uiTransactionDownload=UiTransactionDownload(transaction:transaction,record:record)
                    // Exact physical sync/readback can settle a lost Persist.
                    // A different record cannot clear the older unknown write.
                    if let upload=entry.uiTransactionUpload,
                       upload.matches(transaction:transaction,descriptor:record.descriptor),
                       upload.bytes==record.payload {
                        upload.receipt=record.receipt;upload.recordDigest=record.digest;upload.physicalOutcomeUnknown=false
                    }
                    return Data([10])+Self.captureIntegerBytes(UInt64(record.payload.count),4)+
                        Data([record.descriptor.kind])+record.digest+
                        Self.captureIntegerBytes(UInt64(record.receipt.count),4)+record.receipt
                case 11:
                    guard frame.count==29,let loaded=entry.uiTransactionDownload,
                          try Self.captureUUID(Data(frame[1..<17]))==loaded.transaction,
                          Int(try Self.captureInteger(frame,17,4))==loaded.record.descriptor.ordinal
                        else{throw UiCaptureFrameError.invalid}
                    let offset=Int(try Self.captureInteger(frame,21,4)),count=Int(try Self.captureInteger(frame,25,4))
                    guard count>0,count<=8191,offset<=loaded.record.payload.count-count
                        else{throw UiCaptureFrameError.invalid}
                    return Data([11])+loaded.record.payload[offset..<offset+count]
                case 12:
                    guard frame.count==17 else{throw UiCaptureFrameError.invalid}
                    let transaction=try Self.captureUUID(Data(frame[1..<17]))
                    let records=try UiCaptureJournal.records(context:captured.owner,transaction:transaction)
                    var reply=Data([12])+Self.captureIntegerBytes(UInt64(records.count),4)
                    for record in records {
                        reply.append(Self.captureIntegerBytes(UInt64(record.descriptor.ordinal),4))
                        reply.append(record.descriptor.kind);reply.append(record.digest)
                        reply.append(record.descriptor.digest)
                    }
                    return reply
