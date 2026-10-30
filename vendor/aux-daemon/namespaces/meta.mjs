/** The `meta` tRPC namespace: open, copy and inspect a session's local files, for loopback callers
 * only. Path resolution and the macOS actions stay the supplied ones. */
export function create({z, meta: m}) {
  const location = async input => (await m.resolveLocalPath(input)).location;
  return {
    open: m.localhostProcedure.input(m.openFileSchema).mutation(async ({input}) => {
      const {location: target, targetStat} = await m.resolveLocalPath(input);
      await m.openSystemPath(target, {mode: input.mode, targetType: targetStat.isDirectory() ? 'directory' : 'file'});
    }),
    resolvePath: m.localhostProcedure.input(m.sessionPathSchema).output(z.object({absolutePath: z.string()})).query(async ({input}) => ({absolutePath: await location(input)})),
    copyFile: m.localhostProcedure.input(m.sessionPathSchema).mutation(async ({input}) => {
      await m.copyFileToClipboard(await location(input));
    }),
    listOpenApps: m.localhostProcedure.input(m.sessionPathSchema).output(z.object({apps: z.array(m.openAppSchema)})).query(async ({input}) => ({apps: await m.listOpenApps(await location(input))})),
    openWith: m.localhostProcedure.input(m.openWithSchema).mutation(async ({input}) => {
      await m.openFileWithApp(await location(input), input.appPath);
    }),
  };
}
