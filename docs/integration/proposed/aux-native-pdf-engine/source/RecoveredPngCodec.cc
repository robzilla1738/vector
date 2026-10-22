#include "RecoveredPngCodec.h"
#include "third_party/zlib/zlib.h"
#include <cstdint>
#include <stdexcept>
#include <string_view>
namespace aux::pdf {
namespace {
void Uint32(std::vector<unsigned char>&out,uint32_t value){for(int shift:{24,16,8,0})out.push_back(static_cast<unsigned char>(value>>shift));}
void Chunk(std::vector<unsigned char>&out,std::string_view type,const std::vector<unsigned char>&bytes){
  Uint32(out,static_cast<uint32_t>(bytes.size()));size_t start=out.size();out.insert(out.end(),type.begin(),type.end());out.insert(out.end(),bytes.begin(),bytes.end());
  Uint32(out,crc32(0,out.data()+start,static_cast<uInt>(4+bytes.size())));
}
}
std::vector<unsigned char> EncodeRenderedPng(const unsigned char*pixels,int width,int height,int stride){
  if(!pixels||stride<width*4)throw std::runtime_error("Failed to read rendered PDF bitmap");
  std::vector<unsigned char> raw(static_cast<size_t>(width*4+1)*height);size_t at=0;
  for(int y=0;y<height;++y){raw[at++]=0;auto row=pixels+y*stride;for(int x=0;x<width;++x){raw[at++]=row[x*4];raw[at++]=row[x*4+1];raw[at++]=row[x*4+2];raw[at++]=255;}}
  uLongf count=compressBound(raw.size());std::vector<unsigned char> compressed(count);
  if(compress2(compressed.data(),&count,raw.data(),raw.size(),1)!=Z_OK)throw std::runtime_error("Failed to encode rendered PDF page");
  compressed.resize(count);std::vector<unsigned char> png={137,80,78,71,13,10,26,10},header;Uint32(header,width);Uint32(header,height);header.insert(header.end(),{8,6,0,0,0});
  Chunk(png,"IHDR",header);Chunk(png,"IDAT",compressed);Chunk(png,"IEND",{});return png;
}
}
