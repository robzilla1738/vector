import Foundation
import AVFoundation
import Speech

// Audio stays in memory. Both the capability check and request must require
// on-device recognition: https://developer.apple.com/documentation/speech/sfspeechrecognitionrequest/requiresondevicerecognition
func emit(_ value: [String: Any]) {
    guard let data = try? JSONSerialization.data(withJSONObject: value), let line = String(data: data, encoding: .utf8) else { return }
    print(line)
    fflush(stdout)
}
let recognizer = SFSpeechRecognizer(locale: Locale.current)
let available = recognizer?.supportsOnDeviceRecognition == true
if CommandLine.arguments.contains("--status") {
    emit(["available": available, "language": Locale.current.identifier,
          "reason": available ? "" : "On-device dictation is unavailable for your Mac’s current language. Enable Dictation for that language in System Settings."])
    exit(0)
}
if !available { emit(["type": "error", "message": "On-device dictation is unavailable for the current language."]); exit(1) }

final class Dictation {
    let engine = AVAudioEngine()
    let request = SFSpeechAudioBufferRecognitionRequest()
    var task: SFSpeechRecognitionTask?
    var text = ""
    var ended = false
    var stopping = false
    var tapped = false
    func finish(_ error: String? = nil) {
        guard !ended else { return }
        ended = true
        stopAudio()
        task?.cancel()
        if let error { emit(["type": "error", "message": error, "text": text]) }
        else { emit(["type": "final", "text": text]) }
        exit(error == nil ? 0 : 1)
    }
    func stopAudio() {
        engine.stop()
        if tapped { engine.inputNode.removeTap(onBus: 0); tapped = false }
        request.endAudio()
    }
    func stop() {
        guard !ended && !stopping else { return }
        stopping = true
        stopAudio()
        emit(["type": "finishing"])
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) { self.finish() }
    }
    func begin() {
        guard !ended && !stopping else { return }
        guard let recognizer, recognizer.supportsOnDeviceRecognition, recognizer.isAvailable else { finish("Speech recognition is temporarily unavailable. Try again."); return }
        request.requiresOnDeviceRecognition = true
        request.shouldReportPartialResults = true
        let node = engine.inputNode
        let format = node.outputFormat(forBus: 0)
        guard format.sampleRate > 0 && format.channelCount > 0 else { finish("No microphone input is available. Check your input device in System Settings."); return }
        node.installTap(onBus: 0, bufferSize: 1024, format: format) { buffer, _ in self.request.append(buffer) }
        tapped = true
        task = recognizer.recognitionTask(with: request) { result, error in
            DispatchQueue.main.async {
                guard !self.ended else { return }
                if let result {
                    self.text = String(result.bestTranscription.formattedString.prefix(20000))
                    emit(["type": "transcript", "text": self.text])
                    if result.isFinal { self.finish(); return }
                }
                if error != nil { self.finish(self.stopping && !self.text.isEmpty ? nil : "Dictation stopped. Check your microphone and try again.") }
            }
        }
        do {
            engine.prepare()
            try engine.start()
            emit(["type": "recording"])
            DispatchQueue.main.asyncAfter(deadline: .now() + 60) { self.stop() }
        } catch { finish("The microphone could not start. Check microphone access and your input device in System Settings.") }
    }
    func authorize() {
        SFSpeechRecognizer.requestAuthorization { status in
            DispatchQueue.main.async {
                guard !self.ended && !self.stopping else { return }
                guard status == .authorized else { self.finish("Allow Speech Recognition for Aux in System Settings → Privacy & Security."); return }
                AVCaptureDevice.requestAccess(for: .audio) { allowed in
                    DispatchQueue.main.async {
                        guard !self.ended && !self.stopping else { return }
                        if allowed { self.begin() }
                        else { self.finish("Allow Microphone access for Aux in System Settings → Privacy & Security.") }
                    }
                }
            }
        }
    }
}
let dictation = Dictation()
DispatchQueue.global(qos: .userInitiated).async {
    while let command = readLine() {
        DispatchQueue.main.async {
            if command == "stop" { dictation.stop() }
            else if command == "cancel" { dictation.finish() }
        }
    }
    DispatchQueue.main.async { dictation.finish() }
}
DispatchQueue.main.async { dictation.authorize() }
RunLoop.main.run()
