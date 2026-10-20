
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 464d3f0: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 464d3f4: a9014ff4     	stp	x20, x19, [sp, #0x10]
 464d3f8: a9027bfd     	stp	x29, x30, [sp, #0x20]
 464d3fc: 910083fd     	add	x29, sp, #0x20
 464d400: f942d808     	ldr	x8, [x0, #0x5b0]
 464d404: b4000508     	cbz	x8, 0x464d4a4 <_ChromeMain+0x4648208>
 464d408: aa0003f5     	mov	x21, x0
 464d40c: 9737685a     	bl	0x1427574 <_ChromeMain+0x14222d8>
 464d410: aa0003f3     	mov	x19, x0
 464d414: aa0103f4     	mov	x20, x1
 464d418: f942daa0     	ldr	x0, [x21, #0x5b0]
 464d41c: 97376856     	bl	0x1427574 <_ChromeMain+0x14222d8>
 464d420: d360fc16     	lsr	x22, x0, #32
 464d424: f9423ea8     	ldr	x8, [x21, #0x478]
 464d428: b4000168     	cbz	x8, 0x464d454 <_ChromeMain+0x46481b8>
 464d42c: f9419d00     	ldr	x0, [x8, #0x338]
 464d430: 39472008     	ldrb	w8, [x0, #0x1c8]
 464d434: 34000108     	cbz	w8, 0x464d454 <_ChromeMain+0x46481b8>
 464d438: b941c008     	ldr	w8, [x0, #0x1c0]
 464d43c: 340000c8     	cbz	w8, 0x464d454 <_ChromeMain+0x46481b8>
 464d440: b941c408     	ldr	w8, [x0, #0x1c4]
 464d444: 34000088     	cbz	w8, 0x464d454 <_ChromeMain+0x46481b8>
 464d448: 9737684b     	bl	0x1427574 <_ChromeMain+0x14222d8>
 464d44c: 12800068     	mov	w8, #-0x4               ; =-4
 464d450: 8b408116     	add	x22, x8, x0, lsr #32
 464d454: 52800740     	mov	w0, #0x3a               ; =58
 464d458: 96fad91a     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 464d45c: 11003008     	add	w8, w0, #0xc
 464d460: 1e270280     	fmov	s0, w20
 464d464: 1e270261     	fmov	s1, w19
 464d468: 4e0c1ec1     	mov.s	v1[1], w22
 464d46c: 4e0c1d00     	mov.s	v0[1], w8
 464d470: 0ea00c20     	sqadd.2s	v0, v1, v0
 464d474: 0ea12c00     	sqsub.2s	v0, v0, v1
 464d478: 0e0c3c08     	mov.s	w8, v0[1]
 464d47c: 1e260009     	fmov	w9, s0
 464d480: 0aa97d29     	bic	w9, w9, w9, asr #31
 464d484: 0aa87d08     	bic	w8, w8, w8, asr #31
 464d488: aa088121     	orr	x1, x9, x8, lsl #32
 464d48c: b3607ed3     	bfi	x19, x22, #32, #32
 464d490: aa1303e0     	mov	x0, x19
 464d494: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 464d498: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 464d49c: a8c357f6     	ldp	x22, x21, [sp], #0x30
 464d4a0: d65f03c0     	ret
 464d4a4: d2800001     	mov	x1, #0x0                ; =0
 464d4a8: d2800013     	mov	x19, #0x0               ; =0
 464d4ac: 17fffff9     	b	0x464d490 <_ChromeMain+0x46481f4>
