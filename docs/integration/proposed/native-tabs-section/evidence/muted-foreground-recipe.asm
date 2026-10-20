
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 35e7724: 52814148     	mov	w8, #0xa0a              ; =2570
 35e7728: 72ae6148     	movk	w8, #0x730a, lsl #16
 35e772c: 529f5f49     	mov	w9, #0xfafa             ; =64250
 35e7730: 72ae7f49     	movk	w9, #0x73fa, lsl #16
 35e7734: 7100029f     	cmp	w20, #0x0
 35e7738: 1a881137     	csel	w23, w9, w8, ne
