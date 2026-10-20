
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 27d1a60: 3946d009     	ldrb	w9, [x0, #0x1b4]
 27d1a64: 12001c48     	and	w8, w2, #0xff
 27d1a68: 6a08013f     	tst	w9, w8
 27d1a6c: 54000121     	b.ne	0x27d1a90 <_ChromeMain+0x27cc7f4>
 27d1a70: 6b08013f     	cmp	w9, w8
 27d1a74: 540001c0     	b.eq	0x27d1aac <_ChromeMain+0x27cc810>
 27d1a78: 9106b009     	add	x9, x0, #0x1ac
 27d1a7c: f9000121     	str	x1, [x9]
 27d1a80: 3906d008     	strb	w8, [x0, #0x1b4]
 27d1a84: f9400008     	ldr	x8, [x0]
 27d1a88: f9418501     	ldr	x1, [x8, #0x308]
 27d1a8c: d61f0020     	br	x1
 27d1a90: 36000102     	tbz	w2, #0x0, 0x27d1ab0 <_ChromeMain+0x27cc814>
 27d1a94: d360fc29     	lsr	x9, x1, #32
 27d1a98: b941ac0a     	ldr	w10, [x0, #0x1ac]
 27d1a9c: b941b00b     	ldr	w11, [x0, #0x1b0]
 27d1aa0: 6b01015f     	cmp	w10, w1
 27d1aa4: 7a490160     	ccmp	w11, w9, #0x0, eq
 27d1aa8: 54fffe81     	b.ne	0x27d1a78 <_ChromeMain+0x27cc7dc>
 27d1aac: d65f03c0     	ret
 27d1ab0: d4200020     	brk	#0x1
 27d1ab4: d10103ff     	sub	sp, sp, #0x40
 27d1ab8: a90157f6     	stp	x22, x21, [sp, #0x10]
 27d1abc: a9024ff4     	stp	x20, x19, [sp, #0x20]
 27d1ac0: a9037bfd     	stp	x29, x30, [sp, #0x30]
 27d1ac4: 9100c3fd     	add	x29, sp, #0x30
 27d1ac8: 37000101     	tbnz	w1, #0x0, 0x27d1ae8 <_ChromeMain+0x27cc84c>
 27d1acc: 39472008     	ldrb	w8, [x0, #0x1c8]
 27d1ad0: 370000c8     	tbnz	w8, #0x0, 0x27d1ae8 <_ChromeMain+0x27cc84c>
 27d1ad4: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 27d1ad8: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 27d1adc: a94157f6     	ldp	x22, x21, [sp, #0x10]
 27d1ae0: 910103ff     	add	sp, sp, #0x40
 27d1ae4: d65f03c0     	ret
 27d1ae8: f90007e0     	str	x0, [sp, #0x8]
 27d1aec: bd0007e0     	str	s0, [sp, #0x4]
 27d1af0: 97773d40     	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 27d1af4: f94007e8     	ldr	x8, [sp, #0x8]
 27d1af8: b4fffee0     	cbz	x0, 0x27d1ad4 <_ChromeMain+0x27cc838>
 27d1afc: aa0003f3     	mov	x19, x0
