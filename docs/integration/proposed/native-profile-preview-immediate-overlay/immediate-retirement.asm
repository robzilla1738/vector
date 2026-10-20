
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 465618c: f9422e68     	ldr	x8, [x19, #0x458]
 4656190: b4000228     	cbz	x8, 0x46561d4 <_ChromeMain+0x4650f38>
 4656194: f9432508     	ldr	x8, [x8, #0x648]
 4656198: b40001e8     	cbz	x8, 0x46561d4 <_ChromeMain+0x4650f38>
 465619c: f941d909     	ldr	x9, [x8, #0x3b0]
 46561a0: d37df135     	lsl	x21, x9, #3
 46561a4: b4000195     	cbz	x21, 0x46561d4 <_ChromeMain+0x4650f38>
 46561a8: f941d516     	ldr	x22, [x8, #0x3a8]
 46561ac: 14000005     	b	0x46561c0 <_ChromeMain+0x4650f24>
 46561b0: 97fde3c5     	bl	0x45cf0c4 <_ChromeMain+0x45c9e28>
 46561b4: 910022d6     	add	x22, x22, #0x8
 46561b8: f10022b5     	subs	x21, x21, #0x8
 46561bc: 540000c0     	b.eq	0x46561d4 <_ChromeMain+0x4650f38>
 46561c0: f94002c8     	ldr	x8, [x22]
 46561c4: b4ffff88     	cbz	x8, 0x46561b4 <_ChromeMain+0x4650f18>
 46561c8: f941b900     	ldr	x0, [x8, #0x370]
 46561cc: b4ffff40     	cbz	x0, 0x46561b4 <_ChromeMain+0x4650f18>
 46561d0: 17fffff8     	b	0x46561b0 <_ChromeMain+0x4650f14>
 46561d4: 39286a7f     	strb	wzr, [x19, #0xa1a]
