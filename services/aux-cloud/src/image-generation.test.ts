import assert from 'node:assert/strict';
import test from 'node:test';
import { generateGatewayImages } from './image-generation';

test('the actual Gateway SDK sends private reference images through its ZDR image protocol',async()=>{
  let observed=false;
  const transport:typeof fetch=async(input,init)=>{
    assert.equal(String(input),'https://ai-gateway.vercel.sh/v4/ai/image-model');
    const headers=new Headers(init?.headers),body=JSON.parse(String(init?.body));
    assert.equal(headers.get('ai-model-id'),'meta/muse-image-1.0');
    assert.deepEqual(body.files,[{type:'file',mediaType:'image/png',data:'c3ludGhldGlj'}]);
    assert.deepEqual(body.providerOptions,{gateway:{zeroDataRetention:true,disallowPromptTraining:true}});
    assert.equal(body.n,1);observed=true;
    return Response.json({images:['c3ludGhldGljLXJlc3VsdA=='],warnings:[]});
  };
  const images=await generateGatewayImages({modelId:'meta/muse-image-1.0',prompt:'Synthetic protocol fixture',inputs:[{data:'c3ludGhldGlj',mimeType:'image/png'}],apiKey:'synthetic-test-only',signal:new AbortController().signal,transport});
  assert.equal(observed,true);assert.deepEqual(images,['c3ludGhldGljLXJlc3VsdA==']);
});
