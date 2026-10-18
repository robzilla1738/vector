import { z } from "zod";
const str = z.string();
const decimal = str.regex(/^[1-9][0-9]{0,19}$/).refine((value) => BigInt(value) <= 18446744073709551615n);
const hex = (length: number) => str.regex(new RegExp(`^[a-f0-9]{${length}}$`));
const NativeAppearanceFileChannelSchema = z
  .object({
    producer: z.literal("aux-native-appearance-file-channel"),
    version: z.literal(1),
    pid: z.number().int().positive().max(2147483647),
    processUuid: hex(32).refine((value) => value !== "0".repeat(32)),
    processStartMachTicks: decimal,
    buildId: str.min(1).max(200),
    sourceCommit: hex(40),
    nonce: hex(32),
    basename: z.literal("native-appearance-channel.jsonl"),
    rootDevice: decimal,
    rootInode: decimal,
    profileName: z.literal("Default"),
    profileDevice: decimal,
    profileInode: decimal,
    fileDevice: decimal,
    fileInode: decimal,
    publicKeySpkiHex: hex(88),
    headerSha256: hex(64),
  })
  .strict();
export const HostCapabilitiesSchema = z
  .object({
    buildId: str,
    sourceCommit: str.regex(/^[a-f0-9]{40}(\+dirty)?$/),
    methods: z.array(str),
    downloadOriginal: z.boolean().optional(),
    privateSession: z.object({ id: z.string().uuid() }).strict().optional(),
    nativeAppearanceFileChannel: NativeAppearanceFileChannelSchema.optional(),
    testClockScale: z.number().finite().min(1).max(100000).optional(),
    loopbackServicesUrl: z
      .string()
      .url()
      .max(200)
      .refine((value) => {
        const url = new URL(value);
        return (
          url.protocol === "http:" &&
          url.hostname === "127.0.0.1" &&
          !!url.port &&
          !url.username &&
          !url.password &&
          url.pathname === "/" &&
          !url.search &&
          !url.hash
        );
      })
      .optional(),
  })
  .strict();
export type HostCapabilities = z.infer<typeof HostCapabilitiesSchema>;
