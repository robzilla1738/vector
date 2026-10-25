// Exact supplied model pins from the actual sealed memory-v2 entry.
constexpr char kMemoryModelKey[]="2001e15f1ea3e79468db44b6ad772d05978b2787e1f414044cb0efb8c4bc78bc";
struct MemoryModelPin {const char* path;bool directory;unsigned mode;uint64_t bytes;const char* sha256;};
constexpr MemoryModelPin kMemoryModelPins[]={
{"NOTICE.txt",false,384,1447,"57dc25fa5d349dbe7eb79d7c268948f531130fb9514fb2306863e7a62dcfb033"},
{"model-512.mlmodelc",true,448,0,""},
{"model-512.mlmodelc/analytics",true,448,0,""},
{"model-512.mlmodelc/analytics/coremldata.bin",false,384,243,"de49558a1cd75f837c11c4ecf4b13afb3b39582468cbe1c5465971b50d3de2f8"},
{"model-512.mlmodelc/coremldata.bin",false,384,202,"ae757c2e7ab5efeee8c0614f03871270894be188133465dc6955e86b65a6122e"},
{"model-512.mlmodelc/model.mil",false,384,1925379,"c37e776de656f87a5df24966a605ad08256e71dfa5a7f9602df76555ee74c2e5"},
{"model-512.mlmodelc/weights",true,448,0,""},
{"model-512.mlmodelc/weights/weight.bin",false,384,31198592,"5d77d6497f1216cfb9e255975166c5c93e90599e6ab43e96149df28b91d54bba"},
{"model-64.mlmodelc",true,448,0,""},
{"model-64.mlmodelc/analytics",true,448,0,""},
{"model-64.mlmodelc/analytics/coremldata.bin",false,384,243,"22982c1c4272728bfb85b2e8837e8a994278922f8879aeb476049f242ad51930"},
{"model-64.mlmodelc/coremldata.bin",false,384,200,"9e5098c335c455e6675c79871791df71f9eba8ece0feb33910e0dd3e6a0e065b"},
{"model-64.mlmodelc/model.mil",false,384,175677,"a9400700376d80b6a6bb363fdbf5292d805fdce72a363f18d6f064eddb752bf1"},
{"model-64.mlmodelc/weights",true,448,0,""},
{"model-64.mlmodelc/weights/weight.bin",false,384,30738048,"601250fe71743538d4004af092be26fba9010b230d9d3af449aac10298b42461"},
{"model.json",false,384,1751,"2001e15f1ea3e79468db44b6ad772d05978b2787e1f414044cb0efb8c4bc78bc"},
{"tokenizer-compact.json",false,384,323696,"2fe1fd3058fc7e106948c8d272262cbbdde0b0c9e307a770fe1e10d3c320f711"},
{"tokenizer-merges.u32",false,384,9289664,"b3b1752af9fceb91bcbe7f946188c4b61b7ceffa24cd429921063bc4538f36f8"},
{"word-embeddings.i8",false,384,98304000,"7538b65345dd34131e977945a562bd2548604cf1978543c70ea94e0a528bb5cd"},
{"word-scales.f32",false,384,1024000,"1b62de68e6b9b90800b37e4ac8d4e3fe3a41080a324a108cff88f0228c6182e4"},
};
