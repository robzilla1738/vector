#ifndef AUX_RECOVERED_PNG_CODEC_H_
#define AUX_RECOVERED_PNG_CODEC_H_
#include <vector>
namespace aux::pdf {
// Original reverse-byte-order PDF bitmap: RGBx rows; output alpha is always255.
std::vector<unsigned char> EncodeRenderedPng(const unsigned char* pixels,int width,int height,int stride);
}
#endif
