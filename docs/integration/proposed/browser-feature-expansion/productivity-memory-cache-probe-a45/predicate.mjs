export function usesFixedAccountMemoryFactory(loadBinding) {
 try {
  const binding=loadBinding();
  const mode=Object.getOwnPropertyDescriptor(binding,'supervisedTasksEnabled');
  if(!mode||mode.get||mode.set||mode.writable||mode.configurable||mode.value!==false)return false;
  const factory=Object.getOwnPropertyDescriptor(binding,'createAccountMemoryProcess');
  return !!factory&&!factory.get&&!factory.set&&!factory.writable&&!factory.configurable&&typeof factory.value==='function';
 } catch {
  return false;
 }
}
