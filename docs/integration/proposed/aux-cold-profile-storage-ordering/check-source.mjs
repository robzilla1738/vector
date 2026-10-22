import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const pins=JSON.parse(readFileSync(new URL('./source-pins.json',import.meta.url))),texts=new Map;
for(const file of pins.files){const text=readFileSync((file.kind==='native'?pins.nativeRoot:pins.repositoryRoot)+file.path,'utf8');assert.equal(createHash('sha256').update(text).digest('hex'),file.sha256,file.path);for(const a of file.anchors)assert.equal(text.indexOf(a.anchor),a.offset,file.path+':'+a.anchor);texts.set(file.path,text)}
const wrapper=texts.get('vendor/provided/native/cli-launcher.mm');assert.ok(wrapper.indexOf('mkdir(home.c_str(), 0700)')<wrapper.indexOf('execv(sea.c_str(), arguments.data())'));assert.ok(!wrapper.includes('stateIdentityVersion'));
const getter=texts.get('chrome/browser/browser_process_impl.cc');assert.match(getter,/ProfileManager\* BrowserProcessImpl::profile_manager\(\)[\s\S]*?if \(!created_profile_manager_\) \{\s*CreateProfileManager\(\);/);
const profile=texts.get('chrome/browser/profiles/profile_impl.cc'),start=profile.indexOf('ProfileImpl::~ProfileImpl()');assert.ok(profile.indexOf('DependencyManager::PerformInterlockedTwoPhaseShutdown(',start)<profile.indexOf('ShutdownStoragePartitions();',start));
const partition=texts.get('content/browser/storage_partition_impl.cc'),flush=partition.slice(partition.indexOf('void StoragePartitionImpl::Flush()'),partition.indexOf('void StoragePartitionImpl::ResetURLLoaderFactories()'));assert.ok(flush.includes('GetDOMStorageContext()->Flush()'));assert.ok(!flush.includes('indexed_db'));
console.log(JSON.stringify({staticSourcePins:pins.files.length,actualOrderingChecks:true,packagedCliPreSeaHomeMutation:true,allWritersVerified:false,buildPerformed:false}));
