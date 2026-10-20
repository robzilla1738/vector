
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4654f30: f9457e75     	ldr	x21, [x19, #0xaf8]
 4654f34: f9458277     	ldr	x23, [x19, #0xb00]
 4654f38: 8b1706e8     	add	x8, x23, x23, lsl #1
 4654f3c: d37df108     	lsl	x8, x8, #3
 4654f40: b5003688     	cbnz	x8, 0x4655610 <_ChromeMain+0x4650374>
 4654f44: aa1503f8     	mov	x24, x21
 4654f48: 52800308     	mov	w8, #0x18               ; =24
 4654f4c: 9b0856e8     	madd	x8, x23, x8, x21
 4654f50: eb08031f     	cmp	x24, x8
 4654f54: 540032e1     	b.ne	0x46555b0 <_ChromeMain+0x4650314>
 4654f58: 912be260     	add	x0, x19, #0xaf8
 4654f5c: aa1403e1     	mov	x1, x20
 4654f60: aa1403e2     	mov	x2, x20
 4654f64: 94b67fe0     	bl	0x73f4ee4 <_ChromeMain+0x73efc48>
 4654f68: f9422e68     	ldr	x8, [x19, #0x458]
 4654f6c: b40001e8     	cbz	x8, 0x4654fa8 <_ChromeMain+0x464fd0c>
 4654f70: f9429d08     	ldr	x8, [x8, #0x538]
 4654f74: b40001a8     	cbz	x8, 0x4654fa8 <_ChromeMain+0x464fd0c>
 4654f78: f940d916     	ldr	x22, [x8, #0x1b0]
 4654f7c: b40000d6     	cbz	x22, 0x4654f94 <_ChromeMain+0x464fcf8>
 4654f80: 52800029     	mov	w9, #0x1                ; =1
 4654f84: b82902c9     	ldadd	w9, w9, [x22]
 4654f88: 12b0000a     	mov	w10, #0x7fffffff        ; =2147483647
 4654f8c: 6b0a013f     	cmp	w9, w10
 4654f90: 54003040     	b.eq	0x4655598 <_ChromeMain+0x46502fc>
 4654f94: f940dd08     	ldr	x8, [x8, #0x1b8]
 4654f98: 9100a109     	add	x9, x8, #0x28
 4654f9c: f100011f     	cmp	x8, #0x0
 4654fa0: 9a8903f5     	csel	x21, xzr, x9, eq
 4654fa4: 14000003     	b	0x4654fb0 <_ChromeMain+0x464fd14>
 4654fa8: d2800015     	mov	x21, #0x0               ; =0
 4654fac: d2800016     	mov	x22, #0x0               ; =0
 4654fb0: f94a0678     	ldr	x24, [x19, #0x1408]
 4654fb4: b40000d8     	cbz	x24, 0x4654fcc <_ChromeMain+0x464fd30>
 4654fb8: 52800028     	mov	w8, #0x1                ; =1
 4654fbc: b8280308     	ldadd	w8, w8, [x24]
 4654fc0: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4654fc4: 6b09011f     	cmp	w8, w9
 4654fc8: 54002d00     	b.eq	0x4655568 <_ChromeMain+0x46502cc>
 4654fcc: f94a0a79     	ldr	x25, [x19, #0x1410]
 4654fd0: 52800c00     	mov	w0, #0x60               ; =96
 4654fd4: 96e6e8e5     	bl	0xf368 <_ChromeMain+0xa0cc>
 4654fd8: aa0003f7     	mov	x23, x0
 4654fdc: 52800028     	mov	w8, #0x1                ; =1
 4654fe0: b9000008     	str	w8, [x0]
 4654fe4: 1015bb49     	adr	x9, 0x468074c <_ChromeMain+0x467b4b0>
 4654fe8: d503201f     	nop
 4654fec: 10141daa     	adr	x10, 0x467d3a0 <_ChromeMain+0x4678104>
 4654ff0: d503201f     	nop
 4654ff4: a900a809     	stp	x9, x10, [x0, #0x8]
 4654ff8: b0fef849     	adrp	x9, 0x255d000 <_ChromeMain+0x2557d64>
 4654ffc: 912c0129     	add	x9, x9, #0xb00
 4655000: f9000c09     	str	x9, [x0, #0x18]
 4655004: a902e418     	stp	x24, x25, [x0, #0x28]
 4655008: f9001c16     	str	x22, [x0, #0x38]
 465500c: b40000b6     	cbz	x22, 0x4655020 <_ChromeMain+0x464fd84>
 4655010: b82802c8     	ldadd	w8, w8, [x22]
 4655014: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4655018: 6b09011f     	cmp	w8, w9
 465501c: 54002ac0     	b.eq	0x4655574 <_ChromeMain+0x46502d8>
 4655020: f90022f5     	str	x21, [x23, #0x40]
 4655024: 39c05e88     	ldrsb	w8, [x20, #0x17]
 4655028: f9400bf5     	ldr	x21, [sp, #0x10]
 465502c: 37f808e8     	tbnz	w8, #0x1f, 0x4655148 <_ChromeMain+0x464feac>
 4655030: 3dc00280     	ldr	q0, [x20]
 4655034: 3c8482e0     	stur	q0, [x23, #0x48]
 4655038: f9400a88     	ldr	x8, [x20, #0x10]
 465503c: f80582e8     	stur	x8, [x23, #0x58]
 4655040: aa1503e0     	mov	x0, x21
 4655044: aa1403e1     	mov	x1, x20
 4655048: 52800002     	mov	w2, #0x0                ; =0
 465504c: aa1703e3     	mov	x3, x23
 4655050: 94d1c659     	bl	0x7ac69b4 <_ChromeMain+0x7ac1718>
 4655054: 36001bc0     	tbz	w0, #0x0, 0x46553cc <_ChromeMain+0x4650130>
