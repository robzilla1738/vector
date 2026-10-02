export interface MentionController {
  insert(candidateId: string): void;
  remove(tokenStart: number): void;
}
const controllers = new Map<string, MentionController>();
export function registerMentionController(composerId: string, controller: MentionController) {
  controllers.set(composerId, controller);
  return () => {
    if (controllers.get(composerId) === controller) controllers.delete(composerId);
  };
}
export function mentionController(composerId: string) {
  const controller = controllers.get(composerId);
  if (!controller) throw new Error("This composer is no longer available.");
  return controller;
}
