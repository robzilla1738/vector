import { constants } from "node:fs";
import { lstat, open, readdir, realpath } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { AuxError, type RoutineShare } from "@aux/contracts";
import type {
  SkillLibrarySource,
  SkillLibraryPreview,
} from "@aux/contracts/skill-library";
import { auxSkillCatalog } from "./aux-skill-catalog.js";
import { parseSkillDocument } from "./skill-document.js";
type Identity = { dev: bigint; ino: bigint };
type Item = {
  skillId: string;
  share?: RoutineShare;
  path?: string;
  identity?: Identity;
  digest?: string;
  error?: string;
};
type Review = {
  token: string;
  expires: number;
  source: SkillLibrarySource;
  root?: Identity;
  items: Item[];
};
const sha = (text: string) => createHash("sha256").update(text).digest("hex");
const same = (a: Identity, b: Identity) => a.dev === b.dev && a.ino === b.ino;
/** Explicit read-only review; this service never executes imported scripts or grants file access. */
export class SkillLibrary {
  private readonly reviews = new Map<string, Review>();
  private readonly root = join(homedir(), ".claude", "skills");
  private async directory(path: string) {
    const info = await lstat(path, { bigint: true });
    if (!info.isDirectory() || (await realpath(path)) !== resolve(path))
      throw new AuxError(
        "permission_denied",
        "Choose a real skill directory without symlinks.",
      );
    return info;
  }
  private async read(path: string, check: () => Promise<void>) {
    await check();
    const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
    try {
      const before = await file.stat({ bigint: true });
      if (!before.isFile() || before.size > 64000n)
        throw new AuxError(
          "invalid_params",
          "SKILL.md must be a regular file under 64 KB.",
        );
      const bytes = Buffer.alloc(64001);
      const { bytesRead } = await file.read(bytes, 0, bytes.length, 0);
      const after = await file.stat({ bigint: true });
      if (
        bytesRead !== Number(before.size) ||
        bytesRead > 64000 ||
        !same(before, after) ||
        before.size !== after.size ||
        before.mtimeNs !== after.mtimeNs
      )
        throw new AuxError("ref_stale", "The skill changed while being read.");
      const text = bytes.subarray(0, bytesRead).toString("utf8");
      await check();
      return {
        share: parseSkillDocument(text),
        identity: before,
        digest: sha(text),
      };
    } finally {
      await file.close();
    }
  }
  async preview(
    source: SkillLibrarySource,
    token: string,
    check: () => Promise<void>,
  ): Promise<SkillLibraryPreview> {
    await check();
    const review: Review = {
      token,
      expires: Date.now() + 600000,
      source,
      items: [],
    };
    if (source === "aux")
      review.items = auxSkillCatalog.map((item) => ({ ...item }));
    else {
      review.root = await this.directory(this.root);
      const names = await readdir(this.root);
      if (names.length > 128)
        throw new AuxError(
          "invalid_params",
          "Review a skills directory with at most 128 entries.",
        );
      for (const name of names.sort()) {
        await check();
        const directory = join(this.root, name);
        try {
          if (name.length > 80)
            throw new AuxError(
              "invalid_params",
              "Skill directory names must fit the 80-character selection bound.",
            );
          const identity = await this.directory(directory);
          const path = join(directory, "SKILL.md");
          const item = await this.read(path, check);
          if (!same(identity, await this.directory(directory)))
            throw new AuxError("ref_stale", "The skill directory changed.");
          const objective = `Imported read-only source: ${path}. Relative references remain in this original directory and require current file access; importing grants no execution or credential authority.\n\n${item.share.objective}`;
          if (objective.length > 10000)
            throw new AuxError(
              "invalid_params",
              "Skill instructions exceed Aux's saved objective limit.",
            );
          review.items.push({
            skillId: name,
            path,
            ...item,
            share: { ...item.share, objective },
          });
        } catch (error) {
          review.items.push({
            skillId: name,
            error:
              error instanceof AuxError
                ? error.message
                : "No readable regular SKILL.md in this directory.",
          });
        }
      }
      if (!same(review.root, await this.directory(this.root)))
        throw new AuxError(
          "ref_stale",
          "The reviewed skills directory changed.",
        );
    }
    await check();
    for (const [id, old] of this.reviews)
      if (old.expires < Date.now() || old.token === token)
        this.reviews.delete(id);
    if (this.reviews.size >= 64)
      throw new AuxError(
        "needs_input",
        "Close an existing Skills review before opening another.",
      );
    const reviewId = randomUUID();
    this.reviews.set(reviewId, review);
    return {
      reviewId,
      source,
      location: source === "aux" ? "Built into Aux" : this.root,
      skills: review.items.map((item) => ({
        skillId: item.skillId,
        title: item.share?.title ?? item.skillId,
        description: item.share?.description ?? "",
        objective: item.share?.objective,
        error: item.error,
      })),
    };
  }
  async selected(
    reviewId: string,
    skillIds: string[],
    token: string,
    check: () => Promise<void>,
  ): Promise<RoutineShare[]> {
    await check();
    const review = this.reviews.get(reviewId);
    if (!review || review.token !== token || review.expires < Date.now())
      throw new AuxError(
        "ref_stale",
        "Open the Skills review in its original window again.",
      );
    if (new Set(skillIds).size !== skillIds.length)
      throw new AuxError("invalid_params", "Select each skill once.");
    const selected: RoutineShare[] = [];
    for (const id of skillIds) {
      const item = review.items.find((entry) => entry.skillId === id);
      if (!item?.share || item.error)
        throw new AuxError(
          "invalid_params",
          "Select only reviewed readable Skills.",
        );
      if (item.path) {
        await this.directory(join(this.root, id));
        const current = await this.read(item.path, check);
        if (
          !item.identity ||
          !same(item.identity, current.identity) ||
          item.digest !== current.digest
        )
          throw new AuxError(
            "ref_stale",
            "A reviewed Skill changed. Preview it again.",
          );
      }
      selected.push(item.share);
    }
    if (review.root && !same(review.root, await this.directory(this.root)))
      throw new AuxError("ref_stale", "The reviewed skills directory changed.");
    await check();
    return selected;
  }
}
