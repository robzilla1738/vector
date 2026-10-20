
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4634db8: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4634dbc: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4634dc0: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4634dc4: 910083fd     	add	x29, sp, #0x20
 4634dc8: 397e4008     	ldrb	w8, [x0, #0xf90]
 4634dcc: 37000cc8     	tbnz	w8, #0x0, 0x4634f64 <_ChromeMain+0x462fcc8>
 4634dd0: aa0003f3     	mov	x19, x0
 4634dd4: 52800028     	mov	w8, #0x1                ; =1
 4634dd8: 393e4008     	strb	w8, [x0, #0xf90]
 4634ddc: f9444414     	ldr	x20, [x0, #0x888]
 4634de0: b5000cb4     	cbnz	x20, 0x4634f74 <_ChromeMain+0x462fcd8>
 4634de4: f942ce75     	ldr	x21, [x19, #0x598]
 4634de8: b4000a55     	cbz	x21, 0x4634f30 <_ChromeMain+0x462fc94>
 4634dec: 3954daa8     	ldrb	w8, [x21, #0x536]
 4634df0: 37000a08     	tbnz	w8, #0x0, 0x4634f30 <_ChromeMain+0x462fc94>
 4634df4: 52800034     	mov	w20, #0x1               ; =1
 4634df8: 3914dab4     	strb	w20, [x21, #0x536]
 4634dfc: f942eea8     	ldr	x8, [x21, #0x5d8]
 4634e00: 19004114     	stlurb	w20, [x8, #0x4]
 4634e04: 52800100     	mov	w0, #0x8                ; =8
 4634e08: 96e76958     	bl	0xf368 <_ChromeMain+0xa0cc>
 4634e0c: b900001f     	str	wzr, [x0]
 4634e10: 3900101f     	strb	wzr, [x0, #0x4]
 4634e14: b40000a0     	cbz	x0, 0x4634e28 <_ChromeMain+0x462fb8c>
 4634e18: b8340008     	ldadd	w20, w8, [x0]
 4634e1c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
