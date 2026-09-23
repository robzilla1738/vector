import { expect, it } from "vitest";
import { openDb, Repo } from "@aux/runtime";
import { PrivateBookmarks } from "../../apps/desktop/main/private-bookmarks.js";

for (const kind of ["regular", "private"] as const) {
  it(`${kind} moves a selection atomically and keeps concurrent title edits`, () => {
    const db = openDb(":memory:");
    const repo = new Repo(db);
    const privateBookmarks = new PrivateBookmarks();
    const add = (url:string, title:string, folderPath:string[]) => kind === "regular" ? repo.addBookmark(url,title,folderPath) : privateBookmarks.invoke("bookmarks.add",{url,title,folderPath});
    const move = (bookmarks:{url:string;folderPath:string[]}[], folderPath:string[], createFolder=false) => kind === "regular" ? repo.moveBookmarks({bookmarks,folderPath,createFolder}) : privateBookmarks.invoke("bookmarks.move",{bookmarks,folderPath,createFolder});
    const list = () => kind === "regular" ? repo.listBookmarks() : privateBookmarks.list();
    try {
      add("https://one.test", "One", ["First"]);
      add("https://two.test", "Two", ["Second"]);
      add("https://one.test", "Updated title", ["First"]);
      expect(move([{url:"https://one.test",folderPath:["First"]},{url:"https://two.test",folderPath:["Second"]}], [])).toEqual({moved:2});
      expect(list().every(item => !item.folderPath?.length)).toBe(true);
      expect(list().find(item => item.url === "https://one.test")?.title).toBe("Updated title");
      expect(() => move([{url:"https://one.test",folderPath:[]},{url:"https://two.test",folderPath:["Second"]}], ["First"])).toThrow(/nothing was moved/);
      expect(list().every(item => !item.folderPath?.length)).toBe(true);
      expect(() => move([{url:"https://one.test",folderPath:[]}], ["Deleted folder"])).toThrow(/destination folder/);
      expect(move([{url:"https://one.test",folderPath:[]},{url:"https://one.test",folderPath:[]}], ["First"])).toEqual({moved:1});
      const folders = () => kind === "regular" ? repo.bookmarkFolders() : privateBookmarks.invoke("bookmarks.folders.list", {});
      expect(() => move([{url:"https://one.test",folderPath:[]}], ["Not created"], true)).toThrow(/nothing was moved/);
      expect(folders()).not.toContainEqual(["Not created"]);
      expect(() => move([{url:"https://one.test",folderPath:["First"]}], ["Missing", "Child"], true)).toThrow(/parent folder/);
      expect(folders()).not.toContainEqual(["Missing"]);
      expect(() => move([{url:"https://one.test",folderPath:["First"]}], ["Second"], true)).toThrow(/already exists/);
      expect(move([{url:"https://one.test",folderPath:["First"]},{url:"https://two.test",folderPath:[]}], ["First", "Research"], true)).toEqual({moved:2});
      expect(list().every(item => JSON.stringify(item.folderPath) === JSON.stringify(["First", "Research"]))).toBe(true);
      expect(folders()).toContainEqual(["First", "Research"]);
    } finally { db.close(); }
  });
}
