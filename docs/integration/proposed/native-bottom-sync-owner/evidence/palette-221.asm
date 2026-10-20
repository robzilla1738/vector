
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 35e730c: 529f5f48     	mov	w8, #0xfafa             ; =64250
 35e7310: 72bb3f48     	movk	w8, #0xd9fa, lsl #16
 35e7314: 52814149     	mov	w9, #0xa0a              ; =2570
 35e7318: 72bb2149     	movk	w9, #0xd90a, lsl #16
 35e731c: 7100029f     	cmp	w20, #0x0
 35e7320: 1a891116     	csel	w22, w8, w9, ne
