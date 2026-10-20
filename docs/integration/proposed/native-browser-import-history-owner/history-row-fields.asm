
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4254fc4: 910943fb     	add	x27, sp, #0x250
 4254fc8: 910683fc     	add	x28, sp, #0x1a0
 4254fcc: 9004ad17     	adrp	x23, 0xd7f4000 <dyld_stub_binder+0xd7f4000>
 4254fd0: 910b4ef7     	add	x23, x23, #0x2d3
 4254fd4: d004b278     	adrp	x24, 0xd8a2000 <dyld_stub_binder+0xd8a2000>
 4254fd8: 91144318     	add	x24, x24, #0x510
 4254fdc: d004bbd9     	adrp	x25, 0xd9ce000 <dyld_stub_binder+0xd9ce000>
 4254fe0: 9133cf39     	add	x25, x25, #0xcf3
 4254fe4: 14000014     	b	0x4255034 <_ChromeMain+0x424fd98>
 4254fe8: f94133e0     	ldr	x0, [sp, #0x260]
 4254fec: f9413be8     	ldr	x8, [sp, #0x270]
 4254ff0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4254ff4: 96f6cfb1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4254ff8: 9101c380     	add	x0, x28, #0x70
 4254ffc: d2800001     	mov	x1, #0x0                ; =0
 4255000: 96f74b2e     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4255004: 91008380     	add	x0, x28, #0x20
 4255008: 96f74b1c     	bl	0x27c78 <_ChromeMain+0x229dc>
 425500c: 39c6dfe8     	ldrsb	w8, [sp, #0x1b7]
 4255010: 36f800a8     	tbz	w8, #0x1f, 0x4255024 <_ChromeMain+0x424fd88>
 4255014: f940d3e0     	ldr	x0, [sp, #0x1a0]
 4255018: f940dbe8     	ldr	x8, [sp, #0x1b0]
 425501c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4255020: 96f6cfa6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4255024: d10283a0     	sub	x0, x29, #0xa0
 4255028: 9718eda6     	bl	0x8906c0 <_ChromeMain+0x88b424>
 425502c: 7101901f     	cmp	w0, #0x64
 4255030: 54ffb241     	b.ne	0x4254678 <_ChromeMain+0x424f3dc>
 4255034: f9010bff     	str	xzr, [sp, #0x210]
 4255038: 6f00e400     	movi.2d	v0, #0000000000000000
 425503c: ad0f83e0     	stp	q0, q0, [sp, #0x1f0]
 4255040: ad0e83e0     	stp	q0, q0, [sp, #0x1d0]
 4255044: ad0d83e0     	stp	q0, q0, [sp, #0x1b0]
 4255048: 3d806be0     	str	q0, [sp, #0x1a0]
 425504c: d10283a0     	sub	x0, x29, #0xa0
 4255050: 52800001     	mov	w1, #0x0                ; =0
 4255054: 971203e3     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 4255058: aa0003e2     	mov	x2, x0
 425505c: aa0103e3     	mov	x3, x1
 4255060: 910683e0     	add	x0, sp, #0x1a0
 4255064: aa0203e1     	mov	x1, x2
 4255068: aa0303e2     	mov	x2, x3
 425506c: 97046c5a     	bl	0x3701d4 <_ChromeMain+0x36af38>
 4255070: 3946e3e8     	ldrb	w8, [sp, #0x1b8]
 4255074: 34fffc28     	cbz	w8, 0x4254ff8 <_ChromeMain+0x424fd5c>
 4255078: 910683e0     	add	x0, sp, #0x1a0
 425507c: aa1703e1     	mov	x1, x23
 4255080: 528000c2     	mov	w2, #0x6                ; =6
 4255084: 970d2cc3     	bl	0x5a0390 <_ChromeMain+0x59b0f4>
 4255088: 3707fb80     	tbnz	w0, #0x0, 0x4254ff8 <_ChromeMain+0x424fd5c>
 425508c: 910683e0     	add	x0, sp, #0x1a0
 4255090: aa1803e1     	mov	x1, x24
 4255094: 52800202     	mov	w2, #0x10               ; =16
 4255098: 970d2cbe     	bl	0x5a0390 <_ChromeMain+0x59b0f4>
 425509c: 3707fae0     	tbnz	w0, #0x0, 0x4254ff8 <_ChromeMain+0x424fd5c>
 42550a0: 910683e0     	add	x0, sp, #0x1a0
 42550a4: aa1903e1     	mov	x1, x25
 42550a8: 52800102     	mov	w2, #0x8                ; =8
 42550ac: 970d2cb9     	bl	0x5a0390 <_ChromeMain+0x59b0f4>
 42550b0: 3707fa40     	tbnz	w0, #0x0, 0x4254ff8 <_ChromeMain+0x424fd5c>
 42550b4: f80b037f     	stur	xzr, [x27, #0xb0]
 42550b8: 6f00e400     	movi.2d	v0, #0000000000000000
 42550bc: ad048360     	stp	q0, q0, [x27, #0x90]
 42550c0: ad038360     	stp	q0, q0, [x27, #0x70]
 42550c4: ad028360     	stp	q0, q0, [x27, #0x50]
 42550c8: ad018360     	stp	q0, q0, [x27, #0x30]
 42550cc: ad008360     	stp	q0, q0, [x27, #0x10]
 42550d0: b0050728     	adrp	x8, 0xe33a000 <dyld_stub_binder+0xe33a000>
 42550d4: 912c4108     	add	x8, x8, #0xb10
 42550d8: f9012be8     	str	x8, [sp, #0x250]
 42550dc: f9012fff     	str	xzr, [sp, #0x258]
 42550e0: 91004360     	add	x0, x27, #0x10
 42550e4: 910683e1     	add	x1, sp, #0x1a0
 42550e8: 96fb93ab     	bl	0x139f94 <_ChromeMain+0x134cf8>
 42550ec: 91022368     	add	x8, x27, #0x88
 42550f0: 6f00e400     	movi.2d	v0, #0000000000000000
 42550f4: 3c819100     	stur	q0, [x8, #0x19]
 42550f8: ad000100     	stp	q0, q0, [x8]
 42550fc: d10283a0     	sub	x0, x29, #0xa0
 4255100: 52800021     	mov	w1, #0x1                ; =1
 4255104: 971203b7     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 4255108: 910623e8     	add	x8, sp, #0x188
 425510c: 971a3481     	bl	0x8e2310 <_ChromeMain+0x8dd074>
 4255110: 39467fe8     	ldrb	w8, [sp, #0x19f]
 4255114: 13001d09     	sxtb	w9, w8
 4255118: f940cbe2     	ldr	x2, [sp, #0x190]
 425511c: 7100013f     	cmp	w9, #0x0
 4255120: 9a884048     	csel	x8, x2, x8, mi
 4255124: 394bbfeb     	ldrb	w11, [sp, #0x2ef]
 4255128: 13001d6a     	sxtb	w10, w11
 425512c: f94173ec     	ldr	x12, [sp, #0x2e0]
 4255130: 7100015f     	cmp	w10, #0x0
 4255134: 9a8b418b     	csel	x11, x12, x11, mi
 4255138: eb0b011f     	cmp	x8, x11
 425513c: 540006e1     	b.ne	0x4255218 <_ChromeMain+0x424ff7c>
 4255140: b4000208     	cbz	x8, 0x4255180 <_ChromeMain+0x424fee4>
 4255144: f9416feb     	ldr	x11, [sp, #0x2d8]
 4255148: 7100015f     	cmp	w10, #0x0
 425514c: 9102236c     	add	x12, x27, #0x88
 4255150: 9a8c416b     	csel	x11, x11, x12, mi
 4255154: f940c7ec     	ldr	x12, [sp, #0x188]
 4255158: 7100013f     	cmp	w9, #0x0
 425515c: 910623ed     	add	x13, sp, #0x188
 4255160: 9a8d418c     	csel	x12, x12, x13, mi
 4255164: aa0803ed     	mov	x13, x8
 4255168: 7840258e     	ldrh	w14, [x12], #0x2
 425516c: 7840256f     	ldrh	w15, [x11], #0x2
 4255170: 6b0e01ff     	cmp	w15, w14
 4255174: 54000521     	b.ne	0x4255218 <_ChromeMain+0x424ff7c>
 4255178: f10005ad     	subs	x13, x13, #0x1
 425517c: 54ffff61     	b.ne	0x4255168 <_ChromeMain+0x424fecc>
 4255180: 39c67fe8     	ldrsb	w8, [sp, #0x19f]
 4255184: 36f800a8     	tbz	w8, #0x1f, 0x4255198 <_ChromeMain+0x424fefc>
 4255188: f940c7e0     	ldr	x0, [sp, #0x188]
 425518c: f940cfe8     	ldr	x8, [sp, #0x198]
 4255190: d37ff901     	lsl	x1, x8, #1
 4255194: 96f6cf49     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4255198: d10283a0     	sub	x0, x29, #0xa0
 425519c: 52800041     	mov	w1, #0x2                ; =2
 42551a0: 971202a4     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 42551a4: b902f3e0     	str	w0, [sp, #0x2f0]
 42551a8: d10283a0     	sub	x0, x29, #0xa0
 42551ac: 52800061     	mov	w1, #0x3                ; =3
 42551b0: 971202a0     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 42551b4: b902f7e0     	str	w0, [sp, #0x2f4]
 42551b8: d10283a0     	sub	x0, x29, #0xa0
 42551bc: 52800081     	mov	w1, #0x4                ; =4
 42551c0: 9712029c     	bl	0x6d5c30 <_ChromeMain+0x6d0994>
 42551c4: f9017fe0     	str	x0, [sp, #0x2f8]
 42551c8: d10283a0     	sub	x0, x29, #0xa0
 42551cc: 528000a1     	mov	w1, #0x5                ; =5
 42551d0: 971203b8     	bl	0x6d60b0 <_ChromeMain+0x6d0e14>
 42551d4: 390c03e0     	strb	w0, [sp, #0x300]
 42551d8: 910043e0     	add	x0, sp, #0x10
 42551dc: 910943e1     	add	x1, sp, #0x250
 42551e0: 94f9dd72     	bl	0x80cc7a8 <_ChromeMain+0x80c750c>
 42551e4: b0050728     	adrp	x8, 0xe33a000 <dyld_stub_binder+0xe33a000>
