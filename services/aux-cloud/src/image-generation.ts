import { createGateway } from '@ai-sdk/gateway';

/** Use Gateway's typed image protocol for both generation and reference edits. */
export async function generateGatewayImages(options: {
  modelId: string; prompt: string; apiKey: string; signal: AbortSignal;
  inputs: { data: string; mimeType: string }[]; transport?: typeof fetch;
}) {
  const gateway=createGateway({apiKey:options.apiKey,...options.transport?{fetch:options.transport}:{}});
  const result=await gateway.imageModel(options.modelId).doGenerate({
    prompt:options.prompt,n:1,size:undefined,aspectRatio:undefined,seed:undefined,mask:undefined,
    files:options.inputs.length?options.inputs.map(image=>({type:'file' as const,mediaType:image.mimeType,data:image.data})):undefined,
    providerOptions:{gateway:{zeroDataRetention:true,disallowPromptTraining:true}},
    abortSignal:options.signal,
  });
  return result.images.map(image=>typeof image==='string'?image:Buffer.from(image).toString('base64'));
}
