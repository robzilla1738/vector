
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 464329c: f947da68     	ldr	x8, [x19, #0xfb0]
 46432a0: f947de69     	ldr	x9, [x19, #0xfb8]
 46432a4: d37ef52a     	lsl	x10, x9, #2
 46432a8: b40001aa     	cbz	x10, 0x46432dc <_ChromeMain+0x463e040>
 46432ac: 9342fd4a     	asr	x10, x10, #2
 46432b0: aa0803e1     	mov	x1, x8
 46432b4: d341fd4b     	lsr	x11, x10, #1
 46432b8: 8b0b082c     	add	x12, x1, x11, lsl #2
 46432bc: b840458d     	ldr	w13, [x12], #0x4
 46432c0: aa6a07ee     	mvn	x14, x10, lsr #1
 46432c4: 8b0e014a     	add	x10, x10, x14
 46432c8: 6b1401bf     	cmp	w13, w20
 46432cc: 9a8bb14a     	csel	x10, x10, x11, lt
 46432d0: 9a81b181     	csel	x1, x12, x1, lt
 46432d4: b5ffff0a     	cbnz	x10, 0x46432b4 <_ChromeMain+0x463e018>
 46432d8: 14000002     	b	0x46432e0 <_ChromeMain+0x463e044>
 46432dc: aa0803e1     	mov	x1, x8
 46432e0: 8b090908     	add	x8, x8, x9, lsl #2
 46432e4: aa0103e2     	mov	x2, x1
 46432e8: eb08003f     	cmp	x1, x8
 46432ec: 540000c0     	b.eq	0x4643304 <_ChromeMain+0x463e068>
 46432f0: b9400028     	ldr	w8, [x1]
 46432f4: 6b08029f     	cmp	w20, w8
 46432f8: 52800088     	mov	w8, #0x4                ; =4
 46432fc: 9a88b3e8     	csel	x8, xzr, x8, lt
 4643300: 8b080022     	add	x2, x1, x8
 4643304: 913ec260     	add	x0, x19, #0xfb0
 4643308: 9419598a     	bl	0x4c99930 <_ChromeMain+0x4c94694>
