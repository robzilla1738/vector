import { z } from "zod";

export const MinimalUiSchema = z.boolean();
export const WindowControlsVisibleSchema = z.tuple([z.boolean()]);
