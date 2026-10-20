
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 40f9eb8: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 40f9ebc: a90167fa     	stp	x26, x25, [sp, #0x10]
 40f9ec0: a9025ff8     	stp	x24, x23, [sp, #0x20]
 40f9ec4: a90357f6     	stp	x22, x21, [sp, #0x30]
 40f9ec8: a9044ff4     	stp	x20, x19, [sp, #0x40]
 40f9ecc: a9057bfd     	stp	x29, x30, [sp, #0x50]
 40f9ed0: 910143fd     	add	x29, sp, #0x50
 40f9ed4: d10f03ff     	sub	sp, sp, #0x3c0
 40f9ed8: b0056f68     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 40f9edc: f9467d08     	ldr	x8, [x8, #0xcf8]
 40f9ee0: 39448109     	ldrb	w9, [x8, #0x120]
 40f9ee4: 370000c9     	tbnz	w9, #0x0, 0x40f9efc <_ChromeMain+0x40f4c60>
 40f9ee8: 39448508     	ldrb	w8, [x8, #0x121]
 40f9eec: 37000088     	tbnz	w8, #0x0, 0x40f9efc <_ChromeMain+0x40f4c60>
 40f9ef0: aa0003f3     	mov	x19, x0
 40f9ef4: f9400c08     	ldr	x8, [x0, #0x18]
 40f9ef8: b5000128     	cbnz	x8, 0x40f9f1c <_ChromeMain+0x40f4c80>
 40f9efc: 910f03ff     	add	sp, sp, #0x3c0
 40f9f00: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 40f9f04: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 40f9f08: a94357f6     	ldp	x22, x21, [sp, #0x30]
 40f9f0c: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 40f9f10: a94167fa     	ldp	x26, x25, [sp, #0x10]
 40f9f14: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 40f9f18: d65f03c0     	ret
 40f9f1c: aa0503f6     	mov	x22, x5
 40f9f20: aa0403f7     	mov	x23, x4
 40f9f24: aa0303f8     	mov	x24, x3
 40f9f28: aa0203f5     	mov	x21, x2
 40f9f2c: aa0103f9     	mov	x25, x1
 40f9f30: 9101a3e0     	add	x0, sp, #0x68
 40f9f34: 52806b01     	mov	w1, #0x358              ; =856
 40f9f38: 94fc3e36     	bl	0x8009810 <_ChromeMain+0x8004574>
 40f9f3c: 9101a3e8     	add	x8, sp, #0x68
 40f9f40: aa1303e0     	mov	x0, x19
 40f9f44: aa1503e1     	mov	x1, x21
 40f9f48: aa1903e2     	mov	x2, x25
 40f9f4c: aa1703e3     	mov	x3, x23
 40f9f50: aa1603e4     	mov	x4, x22
 40f9f54: aa1803e5     	mov	x5, x24
 40f9f58: 94db8240     	bl	0x77da858 <_ChromeMain+0x77d55bc>
 40f9f5c: 52801100     	mov	w0, #0x88               ; =136
 40f9f60: 96fc5502     	bl	0xf368 <_ChromeMain+0xa0cc>
 40f9f64: aa0003f4     	mov	x20, x0
 40f9f68: b0050588     	adrp	x8, 0xe1aa000 <dyld_stub_binder+0xe1aa000>
 40f9f6c: 9127a108     	add	x8, x8, #0x9e8
 40f9f70: f9000008     	str	x8, [x0]
 40f9f74: a901fc1f     	stp	xzr, xzr, [x0, #0x18]
 40f9f78: b802701f     	stur	wzr, [x0, #0x27]
 40f9f7c: f8010c1f     	str	xzr, [x0, #0x10]!
 40f9f80: 6f07e600     	movi.2d	v0, #0xffffffff00000000
 40f9f84: ad018280     	stp	q0, q0, [x20, #0x30]
 40f9f88: ad028280     	stp	q0, q0, [x20, #0x50]
 40f9f8c: 7900e29f     	strh	wzr, [x20, #0x70]
 40f9f90: a907fe9f     	stp	xzr, xzr, [x20, #0x78]
 40f9f94: 5280003a     	mov	w26, #0x1               ; =1
 40f9f98: b9000a9a     	str	w26, [x20, #0x8]
 40f9f9c: aa1803e1     	mov	x1, x24
 40f9fa0: 970f465b     	bl	0x4cb90c <_ChromeMain+0x4c6670>
 40f9fa4: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 40f9fa8: f90033ff     	str	xzr, [sp, #0x60]
 40f9fac: 910143e8     	add	x8, sp, #0x50
 40f9fb0: aa1903e0     	mov	x0, x25
 40f9fb4: aa1503e1     	mov	x1, x21
 40f9fb8: aa1803e2     	mov	x2, x24
 40f9fbc: aa1703e3     	mov	x3, x23
 40f9fc0: 52800004     	mov	w4, #0x0                ; =0
 40f9fc4: 94000094     	bl	0x40fa214 <_ChromeMain+0x40f4f78>
 40f9fc8: f9402be8     	ldr	x8, [sp, #0x50]
 40f9fcc: f9001fe8     	str	x8, [sp, #0x38]
 40f9fd0: 3cc583e0     	ldur	q0, [sp, #0x58]
 40f9fd4: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 40f9fd8: f90033ff     	str	xzr, [sp, #0x60]
 40f9fdc: 3c8403e0     	stur	q0, [sp, #0x40]
 40f9fe0: f94002c8     	ldr	x8, [x22]
 40f9fe4: b4000068     	cbz	x8, 0x40f9ff0 <_ChromeMain+0x40f4d54>
 40f9fe8: 91002109     	add	x9, x8, #0x8
 40f9fec: b83a0129     	ldadd	w26, w9, [x9]
 40f9ff0: f90007e8     	str	x8, [sp, #0x8]
 40f9ff4: 3cc082c0     	ldur	q0, [x22, #0x8]
 40f9ff8: 3c8103e0     	stur	q0, [sp, #0x10]
 40f9ffc: f9400ec8     	ldr	x8, [x22, #0x18]
 40fa000: b4000068     	cbz	x8, 0x40fa00c <_ChromeMain+0x40f4d70>
 40fa004: 52800029     	mov	w9, #0x1                ; =1
 40fa008: b8290109     	ldadd	w9, w9, [x8]
 40fa00c: f90013e8     	str	x8, [sp, #0x20]
 40fa010: 3dc00ac0     	ldr	q0, [x22, #0x20]
 40fa014: 3c8283e0     	stur	q0, [sp, #0x28]
 40fa018: 9100e3e1     	add	x1, sp, #0x38
 40fa01c: 910023e2     	add	x2, sp, #0x8
 40fa020: aa1303e0     	mov	x0, x19
 40fa024: 52800003     	mov	w3, #0x0                ; =0
 40fa028: 97fffa2a     	bl	0x40f88d0 <_ChromeMain+0x40f3634>
 40fa02c: f94013e0     	ldr	x0, [sp, #0x20]
 40fa030: b40000a0     	cbz	x0, 0x40fa044 <_ChromeMain+0x40f4da8>
 40fa034: 12800008     	mov	w8, #-0x1               ; =-1
 40fa038: b8e80008     	ldaddal	w8, w8, [x0]
 40fa03c: 7100051f     	cmp	w8, #0x1
 40fa040: 54000c60     	b.eq	0x40fa1cc <_ChromeMain+0x40f4f30>
 40fa044: f94007e0     	ldr	x0, [sp, #0x8]
 40fa048: b50006e0     	cbnz	x0, 0x40fa124 <_ChromeMain+0x40f4e88>
 40fa04c: 9100e3e0     	add	x0, sp, #0x38
 40fa050: 9721910c     	bl	0x95e480 <_ChromeMain+0x9591e4>
 40fa054: f9400e60     	ldr	x0, [x19, #0x18]
 40fa058: aa1503e1     	mov	x1, x21
 40fa05c: 9400016b     	bl	0x40fa608 <_ChromeMain+0x40f536c>
 40fa060: 37000560     	tbnz	w0, #0x0, 0x40fa10c <_ChromeMain+0x40f4e70>
 40fa064: f9400e75     	ldr	x21, [x19, #0x18]
 40fa068: d0057028     	adrp	x8, 0xef00000 <dyld_stub_binder+0xef00000>
 40fa06c: 9127a108     	add	x8, x8, #0x9e8
 40fa070: 38bfc108     	ldaprb	w8, [x8]
 40fa074: 36000648     	tbz	w8, #0x0, 0x40fa13c <_ChromeMain+0x40f4ea0>
 40fa078: d0057020     	adrp	x0, 0xef00000 <dyld_stub_binder+0xef00000>
 40fa07c: 91268000     	add	x0, x0, #0x9a0
 40fa080: aa1503e1     	mov	x1, x21
 40fa084: 52800022     	mov	w2, #0x1                ; =1
 40fa088: 96fd6343     	bl	0x52d94 <_ChromeMain+0x4daf8>
 40fa08c: 9101a3f5     	add	x21, sp, #0x68
 40fa090: 9101a3e2     	add	x2, sp, #0x68
 40fa094: 52800021     	mov	w1, #0x1                ; =1
 40fa098: aa1403e3     	mov	x3, x20
 40fa09c: 94db76b0     	bl	0x77d7b5c <_ChromeMain+0x77d28c0>
 40fa0a0: f9400e61     	ldr	x1, [x19, #0x18]
 40fa0a4: 910262a3     	add	x3, x21, #0x98
 40fa0a8: 528000c0     	mov	w0, #0x6                ; =6
 40fa0ac: d2800002     	mov	x2, #0x0                ; =0
 40fa0b0: 94b0ba75     	bl	0x6d28a84 <_ChromeMain+0x6d237e8>
 40fa0b4: f9400e74     	ldr	x20, [x19, #0x18]
 40fa0b8: 97b04783     	bl	0x2d0bec4 <_ChromeMain+0x2d06c28>
 40fa0bc: aa1403e1     	mov	x1, x20
 40fa0c0: 52800022     	mov	w2, #0x1                ; =1
 40fa0c4: 96fd6334     	bl	0x52d94 <_ChromeMain+0x4daf8>
 40fa0c8: b40000c0     	cbz	x0, 0x40fa0e0 <_ChromeMain+0x40f4e44>
 40fa0cc: 910262a1     	add	x1, x21, #0x98
 40fa0d0: 52800022     	mov	w2, #0x1                ; =1
 40fa0d4: 52800003     	mov	w3, #0x0                ; =0
 40fa0d8: 52800004     	mov	w4, #0x0                ; =0
 40fa0dc: 94b07224     	bl	0x6d1696c <_ChromeMain+0x6d116d0>
 40fa0e0: 910262a0     	add	x0, x21, #0x98
 40fa0e4: 953dc8ec     	bl	0x906c494 <_ChromeMain+0x90671f8>
 40fa0e8: aa0003e2     	mov	x2, x0
 40fa0ec: f9400e60     	ldr	x0, [x19, #0x18]
 40fa0f0: 910262a1     	add	x1, x21, #0x98
 40fa0f4: 95073743     	bl	0x82c7e00 <_ChromeMain+0x82c2b64>
 40fa0f8: 910143e0     	add	x0, sp, #0x50
 40fa0fc: 972190e1     	bl	0x95e480 <_ChromeMain+0x9591e4>
 40fa100: 9101a3e0     	add	x0, sp, #0x68
 40fa104: 95ac5753     	bl	0xac0fe50 <_ChromeMain+0xac0abb4>
 40fa108: 17ffff7d     	b	0x40f9efc <_ChromeMain+0x40f4c60>
 40fa10c: 910143e0     	add	x0, sp, #0x50
 40fa110: 972190dc     	bl	0x95e480 <_ChromeMain+0x9591e4>
 40fa114: b4ffff74     	cbz	x20, 0x40fa100 <_ChromeMain+0x40f4e64>
 40fa118: aa1403e0     	mov	x0, x20
 40fa11c: 94db6fa4     	bl	0x77d5fac <_ChromeMain+0x77d0d10>
 40fa120: 17fffff8     	b	0x40fa100 <_ChromeMain+0x40f4e64>
 40fa124: 91002008     	add	x8, x0, #0x8
 40fa128: 12800009     	mov	w9, #-0x1               ; =-1
 40fa12c: b8e90108     	ldaddal	w9, w8, [x8]
 40fa130: 7100051f     	cmp	w8, #0x1
 40fa134: 54000440     	b.eq	0x40fa1bc <_ChromeMain+0x40f4f20>
 40fa138: 17ffffc5     	b	0x40fa04c <_ChromeMain+0x40f4db0>
 40fa13c: d0057036     	adrp	x22, 0xef00000 <dyld_stub_binder+0xef00000>
 40fa140: 9127a2d6     	add	x22, x22, #0x9e8
 40fa144: aa1603e0     	mov	x0, x22
 40fa148: 94fc29de     	bl	0x80048c0 <_ChromeMain+0x7fff624>
 40fa14c: 34fff960     	cbz	w0, 0x40fa078 <_ChromeMain+0x40f4ddc>
 40fa150: d0057020     	adrp	x0, 0xef00000 <dyld_stub_binder+0xef00000>
 40fa154: 91268000     	add	x0, x0, #0x9a0
 40fa158: 979f3f02     	bl	0x28c9d60 <_ChromeMain+0x28c4ac4>
 40fa15c: 52800037     	mov	w23, #0x1               ; =1
 40fa160: 089ffed7     	stlrb	w23, [x22]
 40fa164: b0055f80     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 40fa168: 9127c000     	add	x0, x0, #0x9f0
 40fa16c: 94fc29d8     	bl	0x80048cc <_ChromeMain+0x7fff630>
 40fa170: 35000440     	cbnz	w0, 0x40fa1f8 <_ChromeMain+0x40f4f5c>
 40fa174: d0057028     	adrp	x8, 0xef00000 <dyld_stub_binder+0xef00000>
 40fa178: 3967a516     	ldrb	w22, [x8, #0x9e9]
 40fa17c: 3927a517     	strb	w23, [x8, #0x9e9]
 40fa180: b0055f80     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 40fa184: 9127c000     	add	x0, x0, #0x9f0
 40fa188: 94fc29df     	bl	0x8004904 <_ChromeMain+0x7fff668>
 40fa18c: 35000260     	cbnz	w0, 0x40fa1d8 <_ChromeMain+0x40f4f3c>
 40fa190: 3617f756     	tbz	w22, #0x2, 0x40fa078 <_ChromeMain+0x40f4ddc>
 40fa194: b0055f80     	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 40fa198: 9128c000     	add	x0, x0, #0xa30
 40fa19c: 94fc29dd     	bl	0x8004910 <_ChromeMain+0x7fff674>
 40fa1a0: 34fff6c0     	cbz	w0, 0x40fa078 <_ChromeMain+0x40f4ddc>
 40fa1a4: d004efc8     	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 40fa1a8: 911c4d08     	add	x8, x8, #0x713
 40fa1ac: f90003e8     	str	x8, [sp]
 40fa1b0: d004efc0     	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
 40fa1b4: 911c9c00     	add	x0, x0, #0x727
 40fa1b8: 94fc29d9     	bl	0x800491c <_ChromeMain+0x7fff680>
 40fa1bc: f9400008     	ldr	x8, [x0]
 40fa1c0: f9400908     	ldr	x8, [x8, #0x10]
 40fa1c4: d63f0100     	blr	x8
 40fa1c8: 17ffffa1     	b	0x40fa04c <_ChromeMain+0x40f4db0>
 40fa1cc: 52801201     	mov	w1, #0x90               ; =144
 40fa1d0: 96fc3b3a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40fa1d4: 17ffff9c     	b	0x40fa044 <_ChromeMain+0x40f4da8>
 40fa1d8: d004efc8     	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 40fa1dc: 911c4d08     	add	x8, x8, #0x713
 40fa1e0: f90003e8     	str	x8, [sp]
 40fa1e4: d004efc0     	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
 40fa1e8: 911be000     	add	x0, x0, #0x6f8
 40fa1ec: 94fc29cc     	bl	0x800491c <_ChromeMain+0x7fff680>
 40fa1f0: 14000008     	b	0x40fa210 <_ChromeMain+0x40f4f74>
 40fa1f4: 94fc2a34     	bl	0x8004ac4 <_ChromeMain+0x7fff828>
 40fa1f8: d004efc8     	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 40fa1fc: 911c4d08     	add	x8, x8, #0x713
 40fa200: f90003e8     	str	x8, [sp]
 40fa204: d004efc0     	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
 40fa208: 911b7400     	add	x0, x0, #0x6dd
 40fa20c: 94fc29c4     	bl	0x800491c <_ChromeMain+0x7fff680>
 40fa210: d4200020     	brk	#0x1
