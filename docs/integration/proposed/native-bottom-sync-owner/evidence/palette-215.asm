
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 35e6e40: 529f5f49     	mov	w9, #0xfafa             ; =64250
 35e6e44: 72a4df49     	movk	w9, #0x26fa, lsl #16
 35e6e48: 52814148     	mov	w8, #0xa0a              ; =2570
 35e6e4c: 72a34148     	movk	w8, #0x1a0a, lsl #16
 35e6e50: 7100029f     	cmp	w20, #0x0
 35e6e54: 1a881136     	csel	w22, w9, w8, ne
