'use strict';
// Minimal reproducer retained for the discarded approach; not a product reader.
// The actual attempted fixture failed before any payload/version read. This
// reduced reproducer was not rerun; evidence.json records the original attempt.
const fs=require('node:fs/promises');
const {constants:c}=require('node:fs');
(async()=>{
  const home=await fs.mkdtemp('/private/tmp/aux-cache-fd-fixture-');let fd;
  try{
    await fs.mkdir(home+'/child');
    fd=await fs.open(home,c.O_RDONLY|c.O_DIRECTORY|c.O_NOFOLLOW|c.O_NONBLOCK);
    const child=await fs.open(`/dev/fd/${fd.fd}/child`,c.O_RDONLY|c.O_DIRECTORY|c.O_NOFOLLOW|c.O_NONBLOCK);
    await child.close();
  }finally{if(fd)await fd.close();await fs.rm(home,{recursive:true,force:true})}
})().catch(error=>{console.error(error.code);process.exitCode=1});
