import { expect, it } from 'vitest';
import { openDb, Repo } from '@vector/runtime';
import { MethodSchemas } from '@vector/contracts';
it('imports atomically and preserves existing titles on repeated imports', () => {
 const db=openDb(':memory:');const repo=new Repo(db);
 try {
  repo.addBookmark('https://example.test/','My title');
  const input=[{url:'https://example.test/',title:'Imported title'},{url:'https://other.test/',title:'Other'}];
  expect(repo.importBookmarks(input)).toEqual({added:1,skipped:1});
  expect(repo.importBookmarks(input)).toEqual({added:0,skipped:2});
  expect(repo.listBookmarks().find(item=>item.url==='https://example.test/')?.title).toBe('My title');
  db.exec("CREATE TRIGGER reject_fixture BEFORE INSERT ON bookmarks WHEN NEW.title = 'fail' BEGIN SELECT RAISE(ABORT, 'synthetic failure'); END");
  expect(()=>repo.importBookmarks([{url:'https://rollback.test/',title:'Rollback'},{url:'https://failure.test/',title:'fail'}])).toThrow();
  expect(repo.listBookmarks().some(item=>item.url==='https://rollback.test/')).toBe(false);
  expect(MethodSchemas['bookmarks.import'].safeParse({bookmarks:[{url:'javascript:alert(1)',title:'Bad'}]}).success).toBe(false);
 } finally {db.close();}
});
