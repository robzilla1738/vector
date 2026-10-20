
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 35e7984: 529f5f49     	mov	w9, #0xfafa             ; =64250
 35e7988: 72a35f49     	movk	w9, #0x1afa, lsl #16
 35e798c: 7100029f     	cmp	w20, #0x0
 35e7990: 52814148     	mov	w8, #0xa0a              ; =2570
 35e7994: 72a34148     	movk	w8, #0x1a0a, lsl #16
 35e7998: 1a881135     	csel	w21, w9, w8, ne
