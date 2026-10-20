
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 35e73e0: 52814148     	mov	w8, #0xa0a              ; =2570
 35e73e4: 72b18148     	movk	w8, #0x8c0a, lsl #16
 35e73e8: 529f5f49     	mov	w9, #0xfafa             ; =64250
 35e73ec: 72b19f49     	movk	w9, #0x8cfa, lsl #16
 35e73f0: 7100029f     	cmp	w20, #0x0
 35e73f4: 1a88113b     	csel	w27, w9, w8, ne
