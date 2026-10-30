/** "Add a local agent…": any command that speaks the Agent Client Protocol, registered by the
 * person and run as an argument list. No shell ever sees it, so nothing in it is expanded; a shell
 * character outside quotes is refused rather than passed on as if it meant something. Reads and
 * writes one file, which only this module touches. */
import {createHash} from 'node:crypto';
import {mkdirSync, readFileSync, renameSync, writeFileSync} from 'node:fs';
import path from 'node:path';

const MAX_AGENTS = 32;
const SHELL_CHARACTER = /[$`;|&<>()*?~#!{}[\]\\\n]/;

/** A command line as an argument list: spaces separate, single or double quotes keep text as it is. */
export function parseCommand(text) {
  const line = String(text ?? '').trim();
  if (!line) throw Error('Enter the command that starts the agent.');
  const argv = [];
  let current = '', quote = null, started = false;
  for (const character of line) {
    if (quote) {
      if (character === quote) quote = null; else current += character;
    } else if (character === '"' || character === "'") {
      quote = character;
      started = true;
    } else if (/\s/.test(character)) {
      if (started) argv.push(current);
      current = '';
      started = false;
    } else {
      if (SHELL_CHARACTER.test(character)) throw Error(`Aux runs this command directly, without a shell, so ${character} can’t be used. Put it in quotes if it’s part of an argument.`);
      current += character;
      started = true;
    }
  }
  if (quote) throw Error('A quote in the command isn’t closed.');
  if (started) argv.push(current);
  return argv;
}

/** The argument list as it reads in a terminal. */
export const showCommand = argv => argv.map(part => /^[\w@%+=:,./-]+$/.test(part) ? part : `'${part.replaceAll("'", `'\\''`)}'`).join(' ');

/** The program to run: an absolute path, or a bare name found on `directories`. */
export function resolveProgram(program, directories, resolve) {
  if (program.includes('/') && !path.isAbsolute(program)) throw Error('Use the program’s name, or its full path.');
  const file = path.isAbsolute(program) ? resolve([path.basename(program)], [path.dirname(program)]) : resolve([program], directories);
  if (!file) throw Error(`Aux can’t find ${program} on this Mac.`);
  return file;
}

export function createLocalAgents(file) {
  const read = () => {
    try {
      const agents = JSON.parse(readFileSync(file, 'utf8')).agents;
      return Array.isArray(agents) ? agents.filter(agent => agent && typeof agent.id === 'string' && path.isAbsolute(agent.file ?? '') && Array.isArray(agent.args)) : [];
    } catch { return []; }
  };
  const write = agents => {
    mkdirSync(path.dirname(file), {recursive: true, mode: 0o700});
    const temporary = `${file}.${process.pid}.tmp`;
    writeFileSync(temporary, `${JSON.stringify({version: 1, agents}, null, 1)}\n`, {mode: 0o600});
    renameSync(temporary, file);
  };
  return {
    list: read,
    find: id => read().find(agent => agent.id === id),
    add({name, file: program, args}) {
      const agents = read(), id = `agent-${createHash('sha256').update(JSON.stringify([program, args])).digest('hex').slice(0, 12)}`;
      if (agents.some(agent => agent.id === id)) throw Error('That command is already added.');
      if (agents.length >= MAX_AGENTS) throw Error('Remove a local agent before adding another.');
      write([...agents, {id, name, file: program, args}]);
      return id;
    },
    remove: id => write(read().filter(agent => agent.id !== id)),
  };
}
