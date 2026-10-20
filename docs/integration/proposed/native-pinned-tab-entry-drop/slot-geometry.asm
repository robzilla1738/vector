
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4608230: d10103ff     	sub	sp, sp, #0x40
 4608234: a90157f6     	stp	x22, x21, [sp, #0x10]
 4608238: a9024ff4     	stp	x20, x19, [sp, #0x20]
 460823c: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4608240: 9100c3fd     	add	x29, sp, #0x30
 4608244: aa0103f3     	mov	x19, x1
 4608248: aa0003f4     	mov	x20, x0
 460824c: fd40e000     	ldr	d0, [x0, #0x1c0]
 4608250: b941c015     	ldr	w21, [x0, #0x1c0]
 4608254: 2f20a400     	ushll.2d	v0, v0, #0x0
 4608258: d2c00028     	mov	x8, #0x100000000        ; =4294967296
 460825c: 4e080d01     	dup.2d	v1, x8
 4608260: 4ea11c00     	orr.16b	v0, v0, v1
 4608264: 3d8003e0     	str	q0, [sp]
 4608268: 910003e1     	mov	x1, sp
 460826c: 940002a5     	bl	0x4608d00 <_ChromeMain+0x4603a64>
 4608270: 39554288     	ldrb	w8, [x20, #0x550]
 4608274: 34000048     	cbz	w8, 0x460827c <_ChromeMain+0x4602fe0>
 4608278: b9454e95     	ldr	w21, [x20, #0x54c]
 460827c: 128000a8     	mov	w8, #-0x6               ; =-6
 4608280: 1b085408     	madd	w8, w0, w8, w21
 4608284: 11001908     	add	w8, w8, #0x6
 4608288: 1ac00d08     	sdiv	w8, w8, w0
 460828c: 0aa87d14     	bic	w20, w8, w8, asr #31
 4608290: 1ac00e75     	sdiv	w21, w19, w0
 4608294: 1b00cea8     	msub	w8, w21, w0, w19
 4608298: 11001a89     	add	w9, w20, #0x6
 460829c: 1b097d13     	mul	w19, w8, w9
 46082a0: 52800740     	mov	w0, #0x3a               ; =58
 46082a4: 96fbed87     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 46082a8: 11001808     	add	w8, w0, #0x6
 46082ac: 1b157d15     	mul	w21, w8, w21
 46082b0: 52800740     	mov	w0, #0x3a               ; =58
 46082b4: 96fbed83     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 46082b8: 2b140268     	adds	w8, w19, w20
 46082bc: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 46082c0: 1a886128     	csel	w8, w9, w8, vs
 46082c4: 6b130108     	subs	w8, w8, w19
 46082c8: 131f7d09     	asr	w9, w8, #31
 46082cc: 52010129     	eor	w9, w9, #0x80000000
 46082d0: 1a886128     	csel	w8, w9, w8, vs
 46082d4: 2b0002a9     	adds	w9, w21, w0
 46082d8: 131f7d2a     	asr	w10, w9, #31
 46082dc: 5201014a     	eor	w10, w10, #0x80000000
 46082e0: 1a896149     	csel	w9, w10, w9, vs
 46082e4: 6b150129     	subs	w9, w9, w21
 46082e8: 131f7d2a     	asr	w10, w9, #31
 46082ec: 5201014a     	eor	w10, w10, #0x80000000
 46082f0: 1a896149     	csel	w9, w10, w9, vs
 46082f4: 0aa87d08     	bic	w8, w8, w8, asr #31
 46082f8: 0aa97d29     	bic	w9, w9, w9, asr #31
 46082fc: aa158260     	orr	x0, x19, x21, lsl #32
 4608300: aa098101     	orr	x1, x8, x9, lsl #32
 4608304: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4608308: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 460830c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4608310: 910103ff     	add	sp, sp, #0x40
 4608314: d65f03c0     	ret
