
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 35e7174: 12ae6008     	mov	w8, #-0x73000001        ; =-1929379841
 35e7178: 529f5f49     	mov	w9, #0xfafa             ; =64250
 35e717c: 72a15f49     	movk	w9, #0xafa, lsl #16
 35e7180: 7100029f     	cmp	w20, #0x0
 35e7184: 1a881135     	csel	w21, w9, w8, ne
 35e7188: 52800036     	mov	w22, #0x1               ; =1
