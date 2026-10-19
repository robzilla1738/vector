import { Button, Dialog, Empty, ErrorNotice } from '@aux/ui';
import { useLocation } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { rpc } from './daemon';
import { native } from './native';
import './plugin-settings.css';

type Skill = {
  name: string;
  description: string;
  path: string;
  builtin: boolean;
  enabled: boolean;
  overridden: boolean;
  category: string;
  autoInject: { keywords: string[]; urlPatterns: string[] };
  body?: string;
  files?: { name: string; size: number }[];
};
type Project = { id: string; name: string; archivedAt?: number };
const message = (error: unknown) =>
  error instanceof Error
    ? error.message
    : 'The skill operation could not be completed.';
function route(projectId: string | null, category: string, skill?: string) {
  const params = new URLSearchParams({ category });
  if (projectId) params.set('project', projectId);
  if (skill) params.set('skill', skill);
  return `#/settings/plugins/skills${skill ? '/detail' : ''}?${params}`;
}
export function SkillsSettings({ accountId }: { accountId: number }) {
  const location = useLocation();
  const search = new URLSearchParams(location.searchStr);
  const projectId = search.get('project');
  const category = search.get('category') ?? 'all';
  const skillPath = search.get('skill');
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>();
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [editor, setEditor] = useState<Skill | 'new'>();
  const [importing, setImporting] = useState(false);
  const load = useCallback(async () => {
    const rows = await rpc<Skill[]>('projects.listSkillsForSettings', {
      accountId,
      projectId,
    });
    setSkills(rows);
  }, [accountId, projectId]);
  useEffect(() => {
    let active = true;
    setSkills(undefined);
    setError('');
    Promise.all([
      rpc<Skill[]>('projects.listSkillsForSettings', { accountId, projectId }),
      rpc<Project[]>('projects.list', { accountId }),
    ])
      .then(([skills, projects]) => {
        if (active) {
          setSkills(skills);
          setProjects(projects.filter((project) => !project.archivedAt));
        }
      })
      .catch((error) => {
        if (active) setError(message(error));
      });
    return () => {
      active = false;
    };
  }, [accountId, projectId]);
  async function enable(skill: Skill, enabled: boolean) {
    setBusy(skill.path);
    setError('');
    try {
      await rpc(
        'projects.setSkillEnabled',
        { accountId, projectId, skillPath: skill.path, enabled },
        true,
      );
      await load();
    } catch (error) {
      setError(message(error));
    } finally {
      setBusy('');
    }
  }
  const visible = skills?.filter(
    (skill) =>
      (category === 'all' || skill.category === category) &&
      `${skill.name} ${skill.description}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  if (skillPath)
    return (
      <SkillDetail
        key={`${accountId}:${projectId}:${skillPath}`}
        accountId={accountId}
        projectId={projectId}
        category={category}
        skillPath={skillPath}
      />
    );
  return (
    <section className="plugin-settings">
      <p className="muted">
        Skills provide task instructions and supporting files. User and project
        skills override built-in instructions with the same name. Import only
        folders you trust.
      </p>
      <div className="plugin-toolbar">
        <label>
          Scope{' '}
          <select
            value={projectId ?? ''}
            onChange={(event) => {
              window.location.hash = route(
                event.target.value || null,
                'all',
              ).slice(1);
            }}
          >
            <option value="">This account</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>
        <input
          aria-label="Search skills"
          placeholder="Search skills"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Button onClick={() => setEditor('new')}>Create skill</Button>
        <Button onClick={() => setImporting(true)}>Import folder</Button>
      </div>
      <fieldset
        className="skill-categories row wrap"
        aria-label="Skill categories"
      >
        {['all', 'builtin', 'user', ...(projectId ? ['project'] : [])].map(
          (value) => (
            <a
              key={value}
              href={route(projectId, value)}
              aria-current={category === value ? 'page' : undefined}
            >
              {value === 'builtin'
                ? 'Built-in'
                : value[0]?.toUpperCase() + value.slice(1)}
            </a>
          ),
        )}
      </fieldset>
      {projectId && (
        <p className="muted">
          Account-wide disabled skills remain disabled in projects.
          Account-owned skills can be edited from the account scope.
        </p>
      )}
      {error && (
        <ErrorNotice
          error={error}
          retry={() => {
            void load()
              .then(() => setError(''))
              .catch((error) => setError(message(error)));
          }}
        />
      )}
      {!skills && !error && <p role="status">Discovering skills…</p>}
      {visible?.length === 0 && (
        <Empty>No matching skills in this scope.</Empty>
      )}
      <div className="skill-grid">
        {visible?.map((skill) => (
          <article className="plugin-card" key={skill.path}>
            <div>
              <span className="plugin-badge">
                {skill.category === 'builtin' ? 'Built-in' : skill.category}
              </span>
              {skill.overridden && (
                <span className="plugin-badge">Customized version active</span>
              )}
            </div>
            <a href={route(projectId, category, skill.path)}>{skill.name}</a>
            <p>{skill.description}</p>
            <label className="row">
              Enabled{' '}
              <input
                type="checkbox"
                checked={skill.enabled}
                disabled={!!busy || skill.overridden}
                onChange={(event) => {
                  void enable(skill, event.target.checked);
                }}
              />
            </label>
          </article>
        ))}
      </div>
      {editor && (
        <SkillEditor
          key="new"
          accountId={accountId}
          projectId={projectId}
          onClose={() => setEditor(undefined)}
          onSaved={async () => {
            setEditor(undefined);
            try {
              await load();
            } catch (error) {
              setError(
                `Skill saved, but the list could not refresh. ${message(error)}`,
              );
            }
          }}
        />
      )}
      {importing && (
        <ImportSkill
          accountId={accountId}
          projectId={projectId}
          onClose={() => setImporting(false)}
          onSaved={async () => {
            setImporting(false);
            try {
              await load();
            } catch (error) {
              setError(
                `Skill imported, but the list could not refresh. ${message(error)}`,
              );
            }
          }}
        />
      )}
    </section>
  );
}
function SkillDetail({
  accountId,
  projectId,
  category,
  skillPath,
}: {
  accountId: number;
  projectId: string | null;
  category: string;
  skillPath: string;
}) {
  const [skill, setSkill] = useState<Skill>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [copying, setCopying] = useState(false);
  const [copyName, setCopyName] = useState('');
  const [file, setFile] = useState('SKILL.md');
  const [content, setContent] = useState<string>();
  const load = useCallback(async () => {
    const result = await rpc<Skill>('projects.getSkill', {
      accountId,
      projectId,
      skillPath,
    });
    setSkill(result);
  }, [accountId, projectId, skillPath]);
  useEffect(() => {
    let active = true;
    void rpc<Skill>('projects.getSkill', { accountId, projectId, skillPath })
      .then((result) => {
        if (active) {
          setSkill(result);
          setCopyName(result.name);
        }
      })
      .catch((error) => {
        if (active) setError(message(error));
      });
    return () => {
      active = false;
    };
  }, [accountId, projectId, skillPath]);
  useEffect(() => {
    let active = true;
    setContent(undefined);
    void rpc<{ content: string }>('projects.readSkillFile', {
      accountId,
      projectId,
      skillPath,
      fileName: file,
    })
      .then((result) => {
        if (active) setContent(result.content);
      })
      .catch((error) => {
        if (active) setError(message(error));
      });
    return () => {
      active = false;
    };
  }, [accountId, projectId, skillPath, file]);
  async function remove() {
    if (
      !skill ||
      !confirm(
        `Delete “${skill.name}” and its supporting files? This cannot be undone.`,
      )
    )
      return;
    setBusy(true);
    setError('');
    try {
      await rpc(
        'projects.deleteSkill',
        { accountId, projectId, skillPath },
        true,
      );
      window.location.hash = route(projectId, category).slice(1);
    } catch (error) {
      setError(message(error));
    } finally {
      setBusy(false);
    }
  }
  async function copy() {
    setBusy(true);
    setError('');
    try {
      const result = await rpc<{ skillPath: string }>(
        'projects.copySkillForCustomization',
        { accountId, projectId, skillPath, name: copyName },
        true,
      );
      window.location.hash = route(
        projectId,
        projectId ? 'project' : 'user',
        result.skillPath,
      ).slice(1);
    } catch (error) {
      setError(message(error));
    } finally {
      setBusy(false);
    }
  }
  const editable =
    skill &&
    !skill.builtin &&
    skill.category === (projectId ? 'project' : 'user');
  return (
    <section className="plugin-settings">
      <a href={route(projectId, category)}>← Back to skills</a>
      {error && (
        <ErrorNotice
          error={error}
          retry={() => {
            void load()
              .then(() => setError(''))
              .catch((error) => setError(message(error)));
          }}
        />
      )}
      {!skill && !error && <p role="status">Loading skill…</p>}
      {skill && (
        <>
          <div>
            <h2>{skill.name}</h2>
            <p>{skill.description}</p>
            <small>{skill.path}</small>
          </div>
          <div className="row wrap">
            {editable && (
              <>
                <Button disabled={busy} onClick={() => setEditing(true)}>
                  Edit instructions
                </Button>
                <Button
                  disabled={busy}
                  onClick={() => {
                    void remove();
                  }}
                >
                  Delete skill
                </Button>
              </>
            )}
            <Button disabled={busy} onClick={() => setCopying(true)}>
              Copy for customization
            </Button>
          </div>
          <p className="muted">
            Automatic matching:{' '}
            {skill.autoInject.keywords.join(', ') || 'No keywords'} ·{' '}
            {skill.autoInject.urlPatterns.join(', ') || 'No URL patterns'}
          </p>
          <fieldset className="skill-file-list" aria-label="Skill files">
            {skill.files?.map((item) => (
              <Button
                key={item.name}
                disabled={busy}
                aria-pressed={file === item.name}
                onClick={() => {
                  setError('');
                  setFile(item.name);
                }}
              >
                {item.name} ({item.size} bytes)
              </Button>
            ))}
          </fieldset>
          <pre>
            {content === undefined
              ? error
                ? 'File unavailable.'
                : 'Loading file…'
              : content || '(Empty file)'}
          </pre>
        </>
      )}
      {editing && skill && (
        <SkillEditor
          accountId={accountId}
          projectId={projectId}
          skill={skill}
          onClose={() => setEditing(false)}
          onSaved={async () => {
            setEditing(false);
            try {
              await load();
              setFile('SKILL.md');
              const result = await rpc<{ content: string }>(
                'projects.readSkillFile',
                { accountId, projectId, skillPath, fileName: 'SKILL.md' },
              );
              setContent(result.content);
            } catch (error) {
              setError(
                `Skill saved, but its detail could not refresh. ${message(error)}`,
              );
            }
          }}
        />
      )}
      {copying && (
        <Dialog
          title="Copy for customization"
          onClose={() => {
            if (!busy) setCopying(false);
          }}
        >
          <p>
            A copy with the same name overrides the built-in instructions.
            Existing user skills are preserved; choose a new name if one already
            exists.
          </p>
          <form
            className="plugin-form"
            onSubmit={(event) => {
              event.preventDefault();
              void copy();
            }}
          >
            <label>
              Skill name
              <input
                required
                pattern="[a-z0-9][a-z0-9-]*"
                value={copyName}
                disabled={busy}
                onChange={(event) => setCopyName(event.target.value)}
              />
            </label>
            {error && <ErrorNotice error={error} />}
            <Button type="submit" disabled={busy}>
              Create user copy
            </Button>
          </form>
        </Dialog>
      )}
    </section>
  );
}
function SkillEditor({
  accountId,
  projectId,
  skill,
  onClose,
  onSaved,
}: {
  accountId: number;
  projectId: string | null;
  skill?: Skill;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [name, setName] = useState(skill?.name ?? '');
  const [description, setDescription] = useState(skill?.description ?? '');
  const [body, setBody] = useState(
    skill?.body?.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '').trim() ??
      '',
  );
  const [keywords, setKeywords] = useState(
    skill?.autoInject.keywords.join(', ') ?? '',
  );
  const [patterns, setPatterns] = useState(
    skill?.autoInject.urlPatterns.join('\n') ?? '',
  );
  const [enabled, setEnabled] = useState(skill?.enabled ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function save() {
    setBusy(true);
    setError('');
    try {
      await rpc(
        skill ? 'projects.updateSkill' : 'projects.createSkill',
        {
          accountId,
          projectId,
          skillPath: skill?.path,
          name,
          description,
          body,
          enabled,
          keywords: keywords
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
          urlPatterns: patterns
            .split('\n')
            .map((item) => item.trim())
            .filter(Boolean),
        },
        true,
      );
      await onSaved();
    } catch (error) {
      setError(message(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      title={skill ? 'Edit skill' : 'Create skill'}
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <form
        className="plugin-form"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <label>
          Name
          <input
            required
            pattern="[a-z0-9][a-z0-9-]*"
            disabled={busy || !!skill}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="my-skill"
          />
        </label>
        <label>
          Description
          <textarea
            required
            disabled={busy}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <label>
          Instructions
          <textarea
            className="skill-body"
            required
            disabled={busy}
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
        </label>
        <label>
          Matching keywords (comma separated)
          <input
            disabled={busy}
            value={keywords}
            onChange={(event) => setKeywords(event.target.value)}
          />
        </label>
        <label>
          URL patterns (one per line, without scheme)
          <textarea
            disabled={busy}
            value={patterns}
            onChange={(event) => setPatterns(event.target.value)}
            placeholder="example.com/*"
          />
        </label>
        <label className="row">
          Enabled
          <input
            type="checkbox"
            disabled={busy}
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
          />
        </label>
        {error && <ErrorNotice error={error} />}
        <div className="row">
          <Button type="submit" disabled={busy}>
            Save skill
          </Button>
          <Button disabled={busy} onClick={onClose}>
            Cancel
          </Button>
        </div>
        {busy && <p role="status">Saving instructions…</p>}
      </form>
    </Dialog>
  );
}
function ImportSkill({
  accountId,
  projectId,
  onClose,
  onSaved,
}: {
  accountId: number;
  projectId: string | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [path, setPath] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function pick() {
    setError('');
    try {
      const picker = native?.auxMiniPopup?.pickDirectory;
      if (!picker)
        throw new Error(
          'The native folder picker is unavailable. Enter the exact folder path below.',
        );
      const result = await picker();
      if (typeof result === 'string' && result) {
        setPath(result);
        setConsent(false);
      }
    } catch (error) {
      setError(message(error));
    }
  }
  async function submit() {
    setBusy(true);
    setError('');
    try {
      await rpc(
        'projects.importSkillFolder',
        { accountId, projectId, folderPath: path, authorized: consent },
        true,
      );
      await onSaved();
    } catch (error) {
      setError(message(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      title="Import a skill folder"
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <form
        className="plugin-form"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <p>
          Choose one folder containing SKILL.md. Aux copies ordinary supporting
          files into this scope. Existing skills are never replaced and symbolic
          links are rejected.
        </p>
        <Button
          disabled={busy}
          onClick={() => {
            void pick();
          }}
        >
          Choose folder
        </Button>
        <label>
          Exact folder path
          <input
            required
            value={path}
            disabled={busy}
            onChange={(event) => {
              setPath(event.target.value);
              setConsent(false);
            }}
          />
        </label>
        <label className="row">
          <input
            type="checkbox"
            disabled={busy || !path}
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
          />
          I authorize reading and copying this folder and its supporting files.
        </label>
        {error && <ErrorNotice error={error} />}
        <Button type="submit" disabled={busy || !path || !consent}>
          Import into {projectId ? 'project' : 'account'}
        </Button>
      </form>
    </Dialog>
  );
}
