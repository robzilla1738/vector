import { expect, it } from 'vitest';
import { openDb, Repo } from '@aux/runtime';
import { MethodSchemas } from '@aux/contracts';
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

it('renames a folder subtree atomically and preserves existing placement on import', () => {
 const db=openDb(':memory:');const repo=new Repo(db);
 try {
  repo.importBookmarks([{url:'https://nested.test/',title:'Nested',folderPath:['Work','Reading']}],[['Work','Empty']]);
  repo.importBookmarks([{url:'https://nested.test/',title:'Duplicate',folderPath:['Personal']}]);
  expect(repo.listBookmarks()[0]?.folderPath).toEqual(['Work','Reading']);
  repo.renameBookmarkFolder(['Work'],'Research');
  expect(repo.listBookmarks()[0]?.folderPath).toEqual(['Research','Reading']);
  expect(repo.bookmarkFolders()).toEqual(expect.arrayContaining([['Research'],['Research','Reading'],['Research','Empty']]));
  expect(()=>repo.removeBookmarkFolder(['Research'])).toThrow();
  repo.removeBookmarkFolder(['Research','Empty']);
  repo.createBookmarkFolder(['Occupied']);
  expect(()=>repo.renameBookmarkFolder(['Research'],'Occupied')).toThrow();
  expect(repo.listBookmarks()[0]?.folderPath).toEqual(['Research','Reading']);
 } finally {db.close();}
});

it('edits bookmark addresses atomically without overwriting duplicates or stale edits', () => {
 const db=openDb(':memory:');const repo=new Repo(db);
 try {
  repo.addBookmark('https://old.test/','Original',['Reading']);
  repo.addBookmark('https://taken.test/','Keep');
  const original=repo.listBookmarks().find(item=>item.title==='Original')!;
  const edit={originalUrl:original.url,url:'https://new.test/',title:'Updated',folderPath:['Work'],expected:{title:original.title,folderPath:original.folderPath}};
  expect(()=>repo.updateBookmark({...edit,url:'https://taken.test/'})).toThrow('already bookmarked');
  expect(repo.listBookmarks()).toContainEqual(original);
  repo.updateBookmark(edit);
  expect(repo.listBookmarks().find(item=>item.url===edit.url)).toMatchObject({title:'Updated',folderPath:['Work'],createdAt:original.createdAt});
  expect(repo.listBookmarks().some(item=>item.url===original.url)).toBe(false);
  expect(()=>repo.updateBookmark({...edit,originalUrl:edit.url,expected:{title:'Old'}})).toThrow('changed');
  expect(repo.listBookmarks().find(item=>item.url==='https://taken.test/')?.title).toBe('Keep');
 } finally {db.close();}
});

it('saves tab collections without merging named folders or relocating prior bookmarks', () => {
 const db=openDb(':memory:');const repo=new Repo(db);
 try {
  repo.addBookmark('https://saved.test/','Keep',['Original']);
  expect(repo.saveBookmarkFolder('Research',[{url:'https://saved.test/',title:'Duplicate'},{url:'https://new.test/',title:'New'}])).toEqual({added:1,skipped:1});
  expect(repo.listBookmarks().find(item=>item.url==='https://saved.test/')?.folderPath).toEqual(['Original']);
  expect(()=>repo.saveBookmarkFolder('Research',[{url:'https://other.test/',title:'Other'}])).toThrow('already has');
  expect(repo.listBookmarks().some(item=>item.url==='https://other.test/')).toBe(false);
  expect(()=>repo.saveBookmarkFolder('Empty',[{url:'https://saved.test/',title:'Duplicate'}])).toThrow('already bookmarked');
  expect(repo.bookmarkFolders()).not.toContainEqual(['Empty']);
 } finally {db.close();}
});
