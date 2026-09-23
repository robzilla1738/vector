import { dialog } from "electron";
import { type AutofillProfile, autofillScript, hasAutofillData } from "../autofill.js";
import { channel } from "../runtime/supervisor.js";

/**
 * Fill a frame's form with saved personal info — explicit user request only.
 * Settings stay in the runtime; the profile is pulled at click time so the
 * menu never works from a stale copy. Returns the filled-field count.
 */
export async function runAutofill(frame: Electron.WebFrameMain): Promise<number> {
  try {
    if (!channel) throw new Error("The browser runtime is not connected yet.");
    const settings = await channel.call("api.invoke", { method: "settings.get", params: {}, desktopUser: true }) as { autofill?: AutofillProfile };
    const profile = settings.autofill;
    if (!hasAutofillData(profile)) {
      void dialog.showMessageBox({ type: "info", title: "Personal info", message: "No personal info is saved yet.", detail: "Add your details in Settings → Browsing → Personal info, then use Fill personal info on a form.", buttons: ["OK"] });
      return 0;
    }
    const filled = await frame.executeJavaScript(autofillScript(profile), true) as number;
    if (!filled) void dialog.showMessageBox({ type: "info", title: "Personal info", message: "Aux couldn’t match this form to your personal info.", detail: "Filling only applies to empty contact and address fields and never touches password, payment or account fields.", buttons: ["OK"] });
    return filled;
  } catch (error) {
    void dialog.showMessageBox({ type: "info", title: "Personal info", message: "Autofill couldn’t run on this page.", detail: error instanceof Error ? error.message : String(error), buttons: ["OK"] });
    return 0;
  }
}
