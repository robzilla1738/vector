import { useRef, useState } from "react";
import { Menu } from "../ui/dialog";
import { shellIconDown, shellIconGear, shellIconPerson } from "../ui/icons";
import { pushSettingsPath } from "../settings/routes";
import { runCommand } from "../commands";
import { useStore } from "../store";

/** Home shortcuts to Aux-owned Profile and usage controls. */
export function HomeSettingsMenu() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const navigate = (category: string) => {
    setOpen(false);
    pushSettingsPath(category);
    useStore.setState({ settingsCategory: category });
    runCommand("settings");
  };
  return (
    <div className="home-settings">
      <button
        ref={trigger}
        type="button"
        className="home-settings-trigger"
        aria-label="Profile and settings"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="home-profile-icon">{shellIconPerson}</span>
        {shellIconDown}
      </button>
      {open && (
        <Menu
          label="Profile and settings"
          className="home-settings-menu"
          anchor={trigger}
          returnFocus={trigger}
          onClose={() => setOpen(false)}
        >
          <button type="button" role="menuitem" onClick={() => navigate("Profiles")}>
            {shellIconPerson} Profiles
          </button>
          <button type="button" role="menuitem" onClick={() => navigate("Usage & Budgets")}>
            Usage &amp; Budgets
          </button>
          <hr />
          <button type="button" role="menuitem" onClick={() => navigate("General")}>
            {shellIconGear} Settings
          </button>
        </Menu>
      )}
    </div>
  );
}
