
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 35e8904: 12acc008     	mov	w8, #-0x66000001        ; =-1711276033
 35e8908: 52830369     	mov	w9, #0x181b             ; =6171
 35e890c: 72b32309     	movk	w9, #0x9918, lsl #16
 35e8910: 7100029f     	cmp	w20, #0x0
 35e8914: 1a881135     	csel	w21, w9, w8, ne
