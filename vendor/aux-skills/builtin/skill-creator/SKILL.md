---
name: "skill-creator"
description: "Create or update Aux skills. Use when the user wants to turn reusable instructions, site instructions, workflows, domain knowledge, scripts, references, or templates into an account skill."
icon: "https://app.getaux.co/builtin-skills/v1/skill-creator.jpg"
---

# Making skills

Use this to create or update the user's own account skills.

## Where they go

```text
<accountRoot>/skills/user/<skill-name>/SKILL.md
```

Write the file with write_file. To change a skill that already exists, use edit_file.

## Front matter

Aux finds and activates skills from the `SKILL.md` front matter. Use only the fields Aux knows:

```yaml
---
name: "my-skill"
description: "Clear trigger description for when Aux should use this skill."
---
```

Wrap every string value in double quotes and escape inner double quotes as `\"`. That way characters like `: `, `#` or `'` can't break the YAML.

## Body

The body is standing instructions for a future Aux agent. Keep it short and step-by-step:

1. Say what the workflow or decision rule is.
2. Point to files in `scripts/`, `references/` or `assets/` only when they really help.
3. Give concrete examples where they remove doubt.
4. Leave out setup notes, changelogs, history and placeholder text.

Triggers belong in `description`, not in a "When to use" section of the body. The body is only read once the skill has been chosen.

## Steps

1. Pin down the reusable behavior with concrete examples.
2. Choose a short, lowercase, hyphenated name.
3. Create or update `<accountRoot>/skills/user/<skill-name>/SKILL.md`.
4. Add only the resources it actually needs, next to that `SKILL.md`.
5. Run `node <this-skill-dir>/scripts/validate-frontmatter.mjs <target-skill-path>/SKILL.md` and fix anything it reports before you finish.
6. Touch only the skill you were asked about.

## Standards

- One focused skill beats one that tries to cover everything.
- Write instructions that still make sense in a new session.
- No icons or icon files.
- Don't add READMEs, changelogs, install guides or cheat sheets.
