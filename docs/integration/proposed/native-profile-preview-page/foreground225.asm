
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 35e7650: 52814148     	mov	w8, #0xa0a              ; =2570
 35e7654: 72b70148     	movk	w8, #0xb80a, lsl #16
 35e7658: 529f5f49     	mov	w9, #0xfafa             ; =64250
 35e765c: 72b4df49     	movk	w9, #0xa6fa, lsl #16
 35e7660: 7100029f     	cmp	w20, #0x0
 35e7664: 1a881135     	csel	w21, w9, w8, ne
