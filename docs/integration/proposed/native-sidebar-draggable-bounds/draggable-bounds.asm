
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 465176c: d10103ff     	sub	sp, sp, #0x40
 4651770: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4651774: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4651778: 9100c3fd     	add	x29, sp, #0x30
 465177c: aa0003f3     	mov	x19, x0
 4651780: f942d800     	ldr	x0, [x0, #0x5b0]
 4651784: 9737577c     	bl	0x1427574 <_ChromeMain+0x14222d8>
 4651788: a90107e0     	stp	x0, x1, [sp, #0x10]
 465178c: f9423e68     	ldr	x8, [x19, #0x478]
 4651790: f9419d00     	ldr	x0, [x8, #0x338]
 4651794: b4000100     	cbz	x0, 0x46517b4 <_ChromeMain+0x464c518>
 4651798: 39472008     	ldrb	w8, [x0, #0x1c8]
 465179c: 340000c8     	cbz	w8, 0x46517b4 <_ChromeMain+0x464c518>
 46517a0: 97375775     	bl	0x1427574 <_ChromeMain+0x14222d8>
 46517a4: a90007e0     	stp	x0, x1, [sp]
 46517a8: 910043e0     	add	x0, sp, #0x10
 46517ac: 910003e1     	mov	x1, sp
 46517b0: 970d2f34     	bl	0x99d480 <_ChromeMain+0x9981e4>
 46517b4: f942d660     	ldr	x0, [x19, #0x5a8]
 46517b8: b40000c0     	cbz	x0, 0x46517d0 <_ChromeMain+0x464c534>
 46517bc: 39472008     	ldrb	w8, [x0, #0x1c8]
 46517c0: 34000088     	cbz	w8, 0x46517d0 <_ChromeMain+0x464c534>
 46517c4: 9737576c     	bl	0x1427574 <_ChromeMain+0x14222d8>
 46517c8: d360fc08     	lsr	x8, x0, #32
 46517cc: 14000005     	b	0x46517e0 <_ChromeMain+0x464c544>
 46517d0: aa1303e0     	mov	x0, x19
 46517d4: 97375768     	bl	0x1427574 <_ChromeMain+0x14222d8>
 46517d8: d360fc08     	lsr	x8, x0, #32
 46517dc: 8b418108     	add	x8, x8, x1, lsr #32
 46517e0: b94017e9     	ldr	w9, [sp, #0x14]
 46517e4: 4b090108     	sub	w8, w8, w9
 46517e8: 0aa87d08     	bic	w8, w8, w8, asr #31
 46517ec: 2b080128     	adds	w8, w9, w8
 46517f0: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 46517f4: 1a886148     	csel	w8, w10, w8, vs
 46517f8: 6b090108     	subs	w8, w8, w9
 46517fc: 131f7d09     	asr	w9, w8, #31
 4651800: 52010129     	eor	w9, w9, #0x80000000
 4651804: 1a886128     	csel	w8, w9, w8, vs
 4651808: 0aa87d08     	bic	w8, w8, w8, asr #31
 465180c: b9001fe8     	str	w8, [sp, #0x1c]
 4651810: a94107e0     	ldp	x0, x1, [sp, #0x10]
 4651814: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4651818: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 465181c: 910103ff     	add	sp, sp, #0x40
 4651820: d65f03c0     	ret
