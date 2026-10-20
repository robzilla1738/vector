
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 8d3946c: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 8d39470: a9017bfd     	stp	x29, x30, [sp, #0x10]
 8d39474: 910043fd     	add	x29, sp, #0x10
 8d39478: aa0003f3     	mov	x19, x0
 8d3947c: a9007c01     	stp	x1, xzr, [x0]
 8d39480: 52a02028     	mov	w8, #0x1010000          ; =16842752
 8d39484: b9001008     	str	w8, [x0, #0x10]
 8d39488: 3900501f     	strb	wzr, [x0, #0x14]
 8d3948c: 6f00e400     	movi.2d	v0, #0000000000000000
 8d39490: 3c818000     	stur	q0, [x0, #0x18]
 8d39494: 3c828000     	stur	q0, [x0, #0x28]
 8d39498: 3c838000     	stur	q0, [x0, #0x38]
 8d3949c: 3c848000     	stur	q0, [x0, #0x48]
 8d394a0: 3c858000     	stur	q0, [x0, #0x58]
 8d394a4: 3c868000     	stur	q0, [x0, #0x68]
 8d394a8: 9101e000     	add	x0, x0, #0x78
 8d394ac: 96d75620     	bl	0x430ed2c <_ChromeMain+0x4309a90>
 8d394b0: 91028260     	add	x0, x19, #0xa0
 8d394b4: 96d7561e     	bl	0x430ed2c <_ChromeMain+0x4309a90>
 8d394b8: 91032260     	add	x0, x19, #0xc8
 8d394bc: 96d7561c     	bl	0x430ed2c <_ChromeMain+0x4309a90>
 8d394c0: 9103c260     	add	x0, x19, #0xf0
 8d394c4: 96d7561a     	bl	0x430ed2c <_ChromeMain+0x4309a90>
 8d394c8: 91046260     	add	x0, x19, #0x118
 8d394cc: 96d75618     	bl	0x430ed2c <_ChromeMain+0x4309a90>
 8d394d0: 3905027f     	strb	wzr, [x19, #0x140]
 8d394d4: 3905127f     	strb	wzr, [x19, #0x144]
 8d394d8: 91052260     	add	x0, x19, #0x148
 8d394dc: 94000985     	bl	0x8d3baf0 <_ChromeMain+0x8d36854>
 8d394e0: 91096268     	add	x8, x19, #0x258
 8d394e4: 3909c27f     	strb	wzr, [x19, #0x270]
 8d394e8: 390c427f     	strb	wzr, [x19, #0x310]
 8d394ec: 390c627f     	strb	wzr, [x19, #0x318]
 8d394f0: 390ee27f     	strb	wzr, [x19, #0x3b8]
 8d394f4: 390f027f     	strb	wzr, [x19, #0x3c0]
 8d394f8: 3911827f     	strb	wzr, [x19, #0x460]
 8d394fc: 3911a27f     	strb	wzr, [x19, #0x468]
 8d39500: 3912e27f     	strb	wzr, [x19, #0x4b8]
 8d39504: 3913027f     	strb	wzr, [x19, #0x4c0]
 8d39508: 3914027f     	strb	wzr, [x19, #0x500]
 8d3950c: 3914427f     	strb	wzr, [x19, #0x510]
 8d39510: 3914827f     	strb	wzr, [x19, #0x520]
 8d39514: 9114a269     	add	x9, x19, #0x528
 8d39518: 6f00e400     	movi.2d	v0, #0000000000000000
 8d3951c: 3d800100     	str	q0, [x8]
 8d39520: 3909a27f     	strb	wzr, [x19, #0x268]
 8d39524: 3d800120     	str	q0, [x9]
 8d39528: f9400260     	ldr	x0, [x19]
 8d3952c: b50000a0     	cbnz	x0, 0x8d39540 <_ChromeMain+0x8d342a4>
 8d39530: aa1303e0     	mov	x0, x19
 8d39534: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 8d39538: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 8d3953c: d65f03c0     	ret
 8d39540: aa1303e1     	mov	x1, x19
 8d39544: 96b62ec7     	bl	0x3ac5060 <_ChromeMain+0x3abfdc4>
 8d39548: 17fffffa     	b	0x8d39530 <_ChromeMain+0x8d34294>
