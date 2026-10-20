
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 136e5e8: f901da76     	str	x22, [x19, #0x3b0]
 136e5ec: 2f00e5e0     	movi	d0, #0x000000ffffffff
 136e5f0: fd01de60     	str	d0, [x19, #0x3b8]
 136e5f4: 910f0260     	add	x0, x19, #0x3c0
 136e5f8: 910c4261     	add	x1, x19, #0x310
 136e5fc: 94000161     	bl	0x136eb80 <_ChromeMain+0x13698e4>
 136e600: b0067ee8     	adrp	x8, 0xe34b000 <dyld_stub_binder+0xe34b000>
 136e604: 91266108     	add	x8, x8, #0x998
 136e608: f901e268     	str	x8, [x19, #0x3c0]
 136e60c: f9421e68     	ldr	x8, [x19, #0x438]
 136e610: f9022668     	str	x8, [x19, #0x448]
 136e614: 52835008     	mov	w8, #0x1a80             ; =6784
 136e618: 72a000c8     	movk	w8, #0x6, lsl #16
 136e61c: f9022a68     	str	x8, [x19, #0x450]
 136e620: b9045a7f     	str	wzr, [x19, #0x458]
 136e624: 3911727f     	strb	wzr, [x19, #0x45c]
 136e628: 3911827f     	strb	wzr, [x19, #0x460]
 136e62c: 52810008     	mov	w8, #0x800              ; =2048
 136e630: b9046668     	str	w8, [x19, #0x464]
 136e634: 0f004420     	movi.2s	v0, #0x1, lsl #16
 136e638: bd046a60     	str	s0, [x19, #0x468]
