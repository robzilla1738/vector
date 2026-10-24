    // Finite, native-peer-only transfer of unqualified capture data. The real
    // Entry execution lock serializes frames; no caller chooses a root/handle.
    private final class UiCaptureUpload {
        let id:Data
        let count:Int
        let digest:Data
        var bytes=Data()
        var receipt:Data?
        var physicalOutcomeUnknown=false
        init(id:Data,count:Int,digest:Data){self.id=id;self.count=count;self.digest=digest}
    }
    private struct UiCaptureDownload {
        let id:Data
        let capture:Data
    }
    private enum UiCaptureFrameError:Error {case invalid,conflict,incomplete,unknown}
    private static func captureInteger(_ bytes:Data,_ offset:Int,_ count:Int)throws->UInt64 {
        guard offset>=0,count>0,count<=8,offset<=bytes.count-count else{throw UiCaptureFrameError.invalid}
        return (0..<count).reduce(UInt64(0)){$0 | UInt64(bytes[offset+$1]) << (8*$1)}
    }
    private static func captureIntegerBytes(_ value:UInt64,_ count:Int)->Data {
        Data((0..<count).map{UInt8(truncatingIfNeeded:value >> (8*$0))})
    }
    private static func captureUUID(_ bytes:Data)throws->String {
        guard bytes.count==16 else{throw UiCaptureFrameError.invalid}
        let hex=bytes.map{String(format:"%02x",$0)}.joined()
        let groups=[8,4,4,4,12]
        var cursor=hex.startIndex,parts=[String]()
        for length in groups {
            let end=hex.index(cursor,offsetBy:length)
            parts.append(String(hex[cursor..<end]));cursor=end
        }
        let result=parts.joined(separator:"-")
        guard UUID(uuidString:result)?.uuidString.lowercased()==result else{throw UiCaptureFrameError.invalid}
        return result
    }
    private static func captureUUIDBytes(_ text:String)throws->Data {
        guard UUID(uuidString:text)?.uuidString.lowercased()==text else{throw UiCaptureFrameError.invalid}
        let hex=Array(text.replacingOccurrences(of:"-",with:"").utf8)
        func nibble(_ value:UInt8)->UInt8{value<=57 ? value-48:value-87}
        return Data(stride(from:0,to:32,by:2).map{nibble(hex[$0])*16+nibble(hex[$0+1])})
    }
    func exchangeUiStorageCaptureFrame(_ handle:UInt64,frame:Data)throws->Data {
        guard !frame.isEmpty,frame.count<=8192 else{throw UiCaptureFrameError.invalid}
        return try withEntry(handle,guardGenericAction:false){entry in
            guard let captured=entry.nativeFreshRuntime else{throw AuxDispatcherLifetimeError.invalidInput}
            return try guardedFreshAction(entry,before:.beforeAction,after:.afterAction,afterThrow:.afterThrownAction){
                try captured.owner.verifyUiCaptureJournalAdmission()
                switch frame[0] {
                case 1: // Begin: operation, upload UUID, total LE32, SHA256.
                    guard frame.count==53 else{throw UiCaptureFrameError.invalid}
                    let id=Data(frame[1..<17]),count=Int(try Self.captureInteger(frame,17,4))
                    _ = try Self.captureUUID(id)
                    guard count>0,count<=64*1024*1024 else{throw UiCaptureFrameError.invalid}
                    let digest=Data(frame[21..<53])
                    if let previous=entry.uiCaptureUpload {
                        if previous.id==id {
                            guard previous.count==count,previous.digest==digest,
                                  !previous.physicalOutcomeUnknown else{throw UiCaptureFrameError.conflict}
                            return Data([1])+Self.captureIntegerBytes(UInt64(previous.bytes.count),4)
                        }
                        // Partial/unknown work cannot be discarded by a new UUID.
                        guard previous.receipt != nil,!previous.physicalOutcomeUnknown else{throw UiCaptureFrameError.incomplete}
                    }
                    entry.uiCaptureUpload=UiCaptureUpload(id:id,count:count,digest:digest)
                    return Data([1])+Self.captureIntegerBytes(0,4)
                case 2: // Append: operation, upload UUID, exact offset LE32, bytes.
                    guard frame.count>21,let upload=entry.uiCaptureUpload,
                          frame[1..<17]==upload.id,upload.receipt==nil,
                          !upload.physicalOutcomeUnknown else{throw UiCaptureFrameError.invalid}
                    let offset=Int(try Self.captureInteger(frame,17,4)),chunk=Data(frame[21...])
                    guard offset==upload.bytes.count,chunk.count<=upload.count-offset else{throw UiCaptureFrameError.conflict}
                    upload.bytes.append(chunk)
                    return Data([2])+Self.captureIntegerBytes(UInt64(upload.bytes.count),4)
                case 3: // Persist once. A failed physical attempt is never rerun.
                    guard frame.count==17,let upload=entry.uiCaptureUpload,
                          frame[1..<17]==upload.id else{throw UiCaptureFrameError.invalid}
                    if let receipt=upload.receipt{return Data([3])+receipt}
                    guard !upload.physicalOutcomeUnknown else{throw UiCaptureFrameError.unknown}
                    guard upload.bytes.count==upload.count,
                          Data(SHA256.hash(data:upload.bytes))==upload.digest else{throw UiCaptureFrameError.incomplete}
                    upload.physicalOutcomeUnknown=true
                    let receipt=try UiCaptureJournal.persist(context:captured.owner,capture:upload.bytes)
                    upload.receipt=receipt;upload.physicalOutcomeUnknown=false
                    return Data([3])+receipt
                case 4: // Discover immutable/partial journal IDs; no promotion.
                    guard frame.count==1 else{throw UiCaptureFrameError.invalid}
                    let ids=try UiCaptureJournal.list(context:captured.owner)
                    var reply=Data([4])+Self.captureIntegerBytes(UInt64(ids.count),4)
                    for id in ids {reply.append(try Self.captureUUIDBytes(id))}
                    return reply
                case 5: // Load from the actual owner; cache only validated data.
                    guard frame.count==17 else{throw UiCaptureFrameError.invalid}
                    let id=Data(frame[1..<17])
                    let loaded=try UiCaptureJournal.load(context:captured.owner,transaction:Self.captureUUID(id))
                    entry.uiCaptureDownload=UiCaptureDownload(id:id,capture:loaded.capture)
                    return Data([5])+Self.captureIntegerBytes(UInt64(loaded.capture.count),4)+
                        Self.captureIntegerBytes(loaded.sourceGeneration,8)+Self.captureIntegerBytes(loaded.currentGeneration,8)+
                        Data(SHA256.hash(data:loaded.capture))+Self.captureIntegerBytes(UInt64(loaded.receipt.count),4)+loaded.receipt
                case 6: // Read a bounded slice of that exact validated capture.
                    guard frame.count==25,let loaded=entry.uiCaptureDownload,
                          frame[1..<17]==loaded.id else{throw UiCaptureFrameError.invalid}
                    let offset=Int(try Self.captureInteger(frame,17,4)),count=Int(try Self.captureInteger(frame,21,4))
                    guard count>0,count<=8191,offset<=loaded.capture.count-count else{throw UiCaptureFrameError.invalid}
                    return Data([6])+loaded.capture[offset..<offset+count]
                default:throw UiCaptureFrameError.invalid
                }
            }
        }
    }
