import { z } from "zod";

const coordinate = z.number().finite();
const text = (max: number) => z.string().max(max);
const element = z
  .object({
    ref: text(32),
    frame: z.literal("main"),
    tag: text(64),
    name: text(120),
    role: text(128).optional(),
    type: text(128).optional(),
    href: text(8192).optional(),
    rect: z
      .object({ x: coordinate, y: coordinate, w: coordinate.nonnegative(), h: coordinate.nonnegative() })
      .strict(),
    selector: z.object({}).strict(),
  })
  .strict();
export const NativePersonObservedValueSchema = z
  .object({
    url: text(8192),
    title: text(512),
    viewport: z
      .object({
        width: coordinate.nonnegative(),
        height: coordinate.nonnegative(),
        scale: coordinate.positive(),
      })
      .strict(),
    scroll: z.object({ x: coordinate, y: coordinate, maxY: coordinate.nonnegative() }).strict(),
    text: text(16000),
    headings: z.array(text(140)).max(12),
    elements: z.array(element).max(200),
    formFields: z.array(z.object({ ref: text(32), label: text(120), type: text(128) }).strict()).max(200),
    tables: z
      .array(
        z
          .object({
            ref: text(32),
            caption: text(80).optional(),
            columns: z.array(text(120)).max(20),
            rows: z.array(z.array(text(120)).max(20)).max(12),
            totalRows: z.number().int().nonnegative(),
            truncated: z.boolean(),
          })
          .strict(),
      )
      .max(6),
    links: z.array(z.object({ ref: text(32), text: text(120), href: text(8192) }).strict()).max(200),
    dialogs: z.array(z.object({ type: text(128), message: text(512) }).strict()).max(8),
    truncated: z.boolean(),
    elementsTotal: z.number().int().min(0).max(10000),
    nextRef: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
  })
  .strict();
export const NativePersonExtractedValueSchema = z.record(
  z.string().regex(/^[A-Za-z][\w-]{0,63}$/),
  z.union([z.null(), text(4000), z.array(text(4000)).max(200)]),
);
