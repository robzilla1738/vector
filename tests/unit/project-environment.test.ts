import {expect,it} from 'vitest';
import {mkdir,mkdtemp,rm,symlink,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {inspectProjectEnvironment} from '../../apps/desktop/main/project-environment.js';

it('recognizes bounded pnpm and package workspaces without inspecting package code',async()=>{
  const root=await mkdtemp(join(tmpdir(),'aux-project-environment-'));
  try{
    await writeFile(join(root,'package.json'),JSON.stringify({packageManager:'pnpm@10',workspaces:['fallback/*','../outside'],scripts:{check:'node --check index.js'}}));
    await writeFile(join(root,'pnpm-lock.yaml'),'lockfileVersion: 9\n');
    await writeFile(join(root,'pnpm-workspace.yaml'),"packages:\n  - 'apps/*'\n  - packages/*\n  - ../outside\n");
    await mkdir(join(root,'apps','web'),{recursive:true});await writeFile(join(root,'apps','web','package.json'),JSON.stringify({name:'@fixture/web',dependencies:{'@fixture/shared':'workspace:*'},scripts:{dev:'vite',check:'tsc --noEmit'}}));
    await mkdir(join(root,'packages','shared'),{recursive:true});await writeFile(join(root,'packages','shared','package.json'),JSON.stringify({name:'@fixture/shared',scripts:{check:'tsc --noEmit'}}));
    const outside=await mkdtemp(join(tmpdir(),'aux-project-environment-outside-'));await writeFile(join(outside,'package.json'),JSON.stringify({name:'outside',scripts:{check:'echo unsafe'}}));await symlink(outside,join(root,'apps','outside'));
    const environment=await inspectProjectEnvironment(root,['packages/shared/src/index.ts']);
    expect(environment.javascript?.manager).toBe('pnpm');
    expect(environment.javascript?.workspace?.marker).toBe('pnpm-workspace.yaml');expect(environment.javascript?.workspace?.patterns).toEqual(['apps/*','packages/*']);
    const packages=environment.javascript?.workspace?.packages??[];expect(packages).toHaveLength(2);
    expect(packages.find(item=>item.name==='@fixture/shared')).toMatchObject({path:'packages/shared',dependencies:[],affected:true,reasons:['Changed files in this package']});
    expect(packages.find(item=>item.name==='@fixture/web')).toMatchObject({path:'apps/web',dependencies:['@fixture/shared'],affected:true,reasons:['Depends on @fixture/shared']});
    expect(environment.javascript?.workspace?.affectedSuggestion?.command).toBe("pnpm --cwd 'apps/web' run 'check' && pnpm --cwd 'packages/shared' run 'check'");
    expect(environment.javascript?.suggestions.map(item=>item.command)).toContain("pnpm run 'check'");
    await rm(outside,{recursive:true,force:true});
  }finally{await rm(root,{recursive:true,force:true});}
});

it('recognizes bounded Python frameworks and loads credible checks and services',async()=>{
  const root=await mkdtemp(join(tmpdir(),'aux-python-environment-'));
  try{
    await writeFile(join(root,'requirements.txt'),'Django==5.2\npytest>=8\nruff==0.12\nmypy==1.17\n');
    await writeFile(join(root,'manage.py'),'raise SystemExit("inspection must not execute this file")\n');
    await mkdir(join(root,'.venv','bin'),{recursive:true});await writeFile(join(root,'.venv','bin','python'),'');
    const environment=await inspectProjectEnvironment(root);
    expect(environment.python).toMatchObject({manager:'python',manifests:['requirements.txt'],environmentPresent:true,frameworks:['django']});
    expect(environment.python?.suggestions).toEqual(expect.arrayContaining([
      expect.objectContaining({id:'python.test',command:'.venv/bin/python -m pytest',intent:'check'}),
      expect.objectContaining({id:'python.ruff',command:'.venv/bin/python -m ruff check .',intent:'check'}),
      expect.objectContaining({id:'python.mypy',command:'.venv/bin/python -m mypy .',intent:'check'}),
      expect.objectContaining({id:'python.django.check',command:'.venv/bin/python manage.py check',intent:'check'}),
      expect.objectContaining({id:'python.django.service',command:'.venv/bin/python manage.py runserver 127.0.0.1:8000',intent:'service'}),
    ]));
  }finally{await rm(root,{recursive:true,force:true});}
});

it('requires matching regular Python entry files and bounded manifests',async()=>{
  const root=await mkdtemp(join(tmpdir(),'aux-python-bounds-'));
  const outside=await mkdtemp(join(tmpdir(),'aux-python-outside-'));
  try{
    await writeFile(join(root,'pyproject.toml'),'dependencies = ["fastapi", "uvicorn", "flask"]\n');
    await writeFile(join(outside,'main.py'),'raise SystemExit("outside")\n');await symlink(join(outside,'main.py'),join(root,'main.py'));
    const environment=await inspectProjectEnvironment(root);
    expect(environment.python?.frameworks).toEqual([]);
    expect(environment.python?.suggestions.some(item=>item.intent==='service')).toBe(false);
    await writeFile(join(root,'pyproject.toml'),'x'.repeat(256*1024+1));
    const oversized=await inspectProjectEnvironment(root);
    expect(oversized.python?.error).toMatch(/no larger than 256 KB/);
    expect(oversized.python?.suggestions).toEqual([]);
  }finally{await rm(root,{recursive:true,force:true});await rm(outside,{recursive:true,force:true});}
});

it('loads reviewed Ruby, JVM, PHP and container workflows from bounded root manifests',async()=>{
  const root=await mkdtemp(join(tmpdir(),'aux-additional-environments-'));
  try{
    await writeFile(join(root,'Gemfile'),"source 'https://rubygems.org'\ngem 'rails'\n");await mkdir(join(root,'bin'));await writeFile(join(root,'bin','rails'),'');
    await writeFile(join(root,'build.gradle.kts'),'plugins { id("org.springframework.boot") version "4.0.0" }\n');await writeFile(join(root,'gradlew'),'');
    await writeFile(join(root,'composer.json'),JSON.stringify({scripts:{test:'phpunit'}}));await mkdir(join(root,'public'));await writeFile(join(root,'public','index.php'),'<?php echo "ok";');
    await writeFile(join(root,'Dockerfile'),'FROM scratch\n');await writeFile(join(root,'compose.yaml'),'services: {}\n');
    const environment=await inspectProjectEnvironment(root);const additional=environment.additional??[];
    expect(additional.find(item=>item.ecosystem==='Ruby')?.suggestions).toEqual(expect.arrayContaining([expect.objectContaining({id:'ruby.rails',intent:'service'})]));
    expect(additional.find(item=>item.ecosystem==='JVM')?.suggestions).toEqual(expect.arrayContaining([expect.objectContaining({id:'jvm.spring',command:'./gradlew bootRun'})]));
    expect(additional.find(item=>item.ecosystem==='PHP')?.suggestions).toEqual(expect.arrayContaining([expect.objectContaining({id:'php.test'}),expect.objectContaining({id:'php.service'})]));
    expect(additional.find(item=>item.ecosystem==='Container')?.suggestions).toEqual(expect.arrayContaining([expect.objectContaining({id:'container.build'}),expect.objectContaining({id:'container.service',intent:'service'})]));
  }finally{await rm(root,{recursive:true,force:true});}
});

it('loads affected Cargo workspace crates without forcing a nonexistent lockfile',async()=>{
  const root=await mkdtemp(join(tmpdir(),'aux-cargo-workspace-'));
  try{
    await writeFile(join(root,'Cargo.toml'),'[workspace]\nmembers = ["crates/*"]\nresolver = "2"\n');
    await mkdir(join(root,'crates','core','src'),{recursive:true});await writeFile(join(root,'crates','core','Cargo.toml'),'[package]\nname = "aux-core"\nversion = "0.1.0"\n');
    await mkdir(join(root,'crates','app','src'),{recursive:true});await writeFile(join(root,'crates','app','Cargo.toml'),'[package]\nname = "aux-app"\nversion = "0.1.0"\n');
    const environment=await inspectProjectEnvironment(root,['crates/core/src/lib.rs']);
    expect(environment.rust).toMatchObject({workspace:true,locked:false,members:[
      {path:'crates/app',name:'aux-app',affected:false,reasons:[]},
      {path:'crates/core',name:'aux-core',affected:true,reasons:['Changed files in this crate']},
    ]});
    expect(environment.rust?.suggestions[0]?.command).toBe('cargo check');
    expect(environment.rust?.affectedSuggestion?.command).toBe("cargo check --package 'aux-core'");
  }finally{await rm(root,{recursive:true,force:true});}
});

it('loads bounded Go workspace modules and scopes affected checks',async()=>{
  const root=await mkdtemp(join(tmpdir(),'aux-go-workspace-'));
  try{
    await writeFile(join(root,'go.work'),'go 1.24\n\nuse (\n  ./services/api\n  ./packages/shared\n  ../outside\n)\n');
    await mkdir(join(root,'services','api'),{recursive:true});await writeFile(join(root,'services','api','go.mod'),'module example.test/api\n\ngo 1.24\n');
    await mkdir(join(root,'packages','shared'),{recursive:true});await writeFile(join(root,'packages','shared','go.mod'),'module example.test/shared\n\ngo 1.24\n');
    const environment=await inspectProjectEnvironment(root,['services/api/main.go']);
    expect(environment.go?.manifest).toBe('go.work');
    expect(environment.go?.workspace?.modules).toEqual([
      {path:'services/api',module:'example.test/api',affected:true,reasons:['Changed files in this module']},
      {path:'packages/shared',module:'example.test/shared',affected:false,reasons:[]},
    ]);
    expect(environment.go?.workspace?.affectedSuggestion?.command).toBe("go test './services/api/...'");
    expect(environment.go?.suggestions[0]?.command).toBe("go test './services/api/...' './packages/shared/...'");
  }finally{await rm(root,{recursive:true,force:true});}
});
