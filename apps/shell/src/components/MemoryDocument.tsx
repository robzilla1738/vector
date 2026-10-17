import { AnswerMarkdown } from "./AnswerMarkdown";
import "./MemoryDocument.css";

export function MemoryDocument({ text }: { text: string }) {
  return (
    <div className="memory-document selectable">
      <AnswerMarkdown text={text} />
    </div>
  );
}
