/** Implements docs/spec/ui/settings.md developers local CLI installation. */
import { constants } from 'node:fs';
import { access, lstat, mkdir, realpath, symlink } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { DaemonServices } from '../http/server.js';
export function createDeveloperSettingsRouter(
  { store, t, procedure }: DaemonServices,
  options: { home?: string; cliExecutable?: string } = {},
) {
  const home = options.home ?? homedir();
  const executable =
    options.cliExecutable ??
    process.env.AUX_CLI_PATH ??
    resolve(
      dirname(process.execPath),
      '../../../../cli/Aux CLI.app/Contents/MacOS/aux-cli',
    );
  const destination = join(home, '.local/bin/aux');
  async function status() {
    let available = false;
    try {
      await access(executable, constants.X_OK);
      available = (await lstat(executable)).isFile();
    } catch (error) {
      if (
        !(
          error instanceof Error &&
          'code' in error &&
          ['ENOENT', 'EACCES'].includes(String(error.code))
        )
      )
        throw error;
    }
    let installed = false;
    let conflict = false;
    try {
      const info = await lstat(destination);
      if (info.isSymbolicLink() && available)
        installed =
          (await realpath(destination)) === (await realpath(executable));
      conflict = !installed;
    } catch (error) {
      if (
        !(error instanceof Error && 'code' in error && error.code === 'ENOENT')
      )
        throw error;
    }
    return {
      available,
      installed,
      conflict,
      path: destination,
      executable: available ? executable : undefined,
      onPath: (process.env.PATH ?? '')
        .split(':')
        .includes(dirname(destination)),
    };
  }
  const scope = z.object({ accountId: z.number().int().nonnegative() });
  return t.router({
    checkCliInstallation: procedure.input(scope).query(({ input }) => {
      store.requireAccount(input.accountId);
      return status();
    }),
    installCli: procedure.input(scope).mutation(async ({ input }) => {
      store.requireAccount(input.accountId);
      const current = await status();
      if (!current.available)
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message:
            'The bundled Aux CLI executable is unavailable. Launch an assembled Aux installation.',
        });
      if (current.installed) return current;
      if (current.conflict)
        throw new TRPCError({
          code: 'CONFLICT',
          message:
            'An existing command occupies this path. Aux will not replace it.',
        });
      await mkdir(dirname(destination), { recursive: true });
      await symlink(executable, destination);
      return status();
    }),
  });
}
