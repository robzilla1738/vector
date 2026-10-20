
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 40f88d0: d10343ff     	sub	sp, sp, #0xd0
 40f88d4: a90867fa     	stp	x26, x25, [sp, #0x80]
 40f88d8: a9095ff8     	stp	x24, x23, [sp, #0x90]
 40f88dc: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 40f88e0: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 40f88e4: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 40f88e8: 910303fd     	add	x29, sp, #0xc0
 40f88ec: f9400c14     	ldr	x20, [x0, #0x18]
 40f88f0: b4001974     	cbz	x20, 0x40f8c1c <_ChromeMain+0x40f3980>
 40f88f4: aa0103f3     	mov	x19, x1
 40f88f8: aa0003f5     	mov	x21, x0
 40f88fc: 3942a008     	ldrb	w8, [x0, #0xa8]
 40f8900: 360013e8     	tbz	w8, #0x0, 0x40f8b7c <_ChromeMain+0x40f38e0>
 40f8904: aa0303f6     	mov	x22, x3
 40f8908: aa0203f7     	mov	x23, x2
 40f890c: a903ffff     	stp	xzr, xzr, [sp, #0x38]
 40f8910: f90027ff     	str	xzr, [sp, #0x48]
 40f8914: f9400288     	ldr	x8, [x20]
 40f8918: f9401909     	ldr	x9, [x8, #0x30]
 40f891c: 9100e3e8     	add	x8, sp, #0x38
 40f8920: aa1403e0     	mov	x0, x20
 40f8924: d63f0120     	blr	x9
 40f8928: f004cca0     	adrp	x0, 0xda8f000 <dyld_stub_binder+0xda8f000>
 40f892c: 91038800     	add	x0, x0, #0xe2
 40f8930: f004cca1     	adrp	x1, 0xda8f000 <dyld_stub_binder+0xda8f000>
 40f8934: 91008421     	add	x1, x1, #0x21
 40f8938: 910063e8     	add	x8, sp, #0x18
 40f893c: 52805782     	mov	w2, #0x2bc              ; =700
 40f8940: 96fd60d0     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 40f8944: 910003e8     	mov	x8, sp
 40f8948: aa1303e0     	mov	x0, x19
 40f894c: 97276777     	bl	0xad2728 <_ChromeMain+0xacd48c>
 40f8950: 52801200     	mov	w0, #0x90               ; =144
 40f8954: 96fc5a85     	bl	0xf368 <_ChromeMain+0xa0cc>
 40f8958: aa0003f4     	mov	x20, x0
 40f895c: 52800028     	mov	w8, #0x1                ; =1
 40f8960: 10011489     	adr	x9, 0x40fabf0 <_ChromeMain+0x40f5954>
 40f8964: d503201f     	nop
 40f8968: b9000008     	str	w8, [x0]
 40f896c: 10011f28     	adr	x8, 0x40fad50 <_ChromeMain+0x40f5ab4>
 40f8970: d503201f     	nop
 40f8974: b0ff2338     	adrp	x24, 0x255d000 <_ChromeMain+0x2557d64>
 40f8978: 912c0318     	add	x24, x24, #0xb00
 40f897c: a900a009     	stp	x9, x8, [x0, #0x8]
 40f8980: 10ffd7c8     	adr	x8, 0x40f8478 <_ChromeMain+0x40f31dc>
 40f8984: d503201f     	nop
 40f8988: a901a018     	stp	x24, x8, [x0, #0x18]
 40f898c: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 40f8990: 37f80ee8     	tbnz	w8, #0x1f, 0x40f8b6c <_ChromeMain+0x40f38d0>
 40f8994: 3cc383e0     	ldur	q0, [sp, #0x38]
 40f8998: 3c828280     	stur	q0, [x20, #0x28]
 40f899c: f94027e8     	ldr	x8, [sp, #0x48]
 40f89a0: f8038288     	stur	x8, [x20, #0x38]
 40f89a4: f94003e8     	ldr	x8, [sp]
 40f89a8: f90003ff     	str	xzr, [sp]
 40f89ac: f9002288     	str	x8, [x20, #0x40]
 40f89b0: 3cc083e0     	ldur	q0, [sp, #0x8]
 40f89b4: 6f00e401     	movi.2d	v1, #0000000000000000
 40f89b8: 3c8083e1     	stur	q1, [sp, #0x8]
 40f89bc: 3c848280     	stur	q0, [x20, #0x48]
 40f89c0: f94002e8     	ldr	x8, [x23]
 40f89c4: f90002ff     	str	xzr, [x23]
 40f89c8: f9002e88     	str	x8, [x20, #0x58]
 40f89cc: 3cc082e0     	ldur	q0, [x23, #0x8]
 40f89d0: 3d801a80     	str	q0, [x20, #0x60]
 40f89d4: aa1703e0     	mov	x0, x23
 40f89d8: f8418c08     	ldr	x8, [x0, #0x18]!
 40f89dc: f900001f     	str	xzr, [x0]
 40f89e0: f9003a88     	str	x8, [x20, #0x70]
 40f89e4: 3dc00ae0     	ldr	q0, [x23, #0x20]
 40f89e8: 3c878280     	stur	q0, [x20, #0x78]
 40f89ec: 3c8082e1     	stur	q1, [x23, #0x8]
 40f89f0: f81b83bf     	stur	xzr, [x29, #-0x48]
 40f89f4: 3c9a83a1     	stur	q1, [x29, #-0x58]
 40f89f8: d10163a1     	sub	x1, x29, #0x58
 40f89fc: 97996041     	bl	0x2750b00 <_ChromeMain+0x274b864>
 40f8a00: f85b83a8     	ldur	x8, [x29, #-0x48]
 40f8a04: f85a83a0     	ldur	x0, [x29, #-0x58]
 40f8a08: f90016e8     	str	x8, [x23, #0x28]
 40f8a0c: b40000a0     	cbz	x0, 0x40f8a20 <_ChromeMain+0x40f3784>
 40f8a10: 12800008     	mov	w8, #-0x1               ; =-1
 40f8a14: b8e80008     	ldaddal	w8, w8, [x0]
 40f8a18: 7100051f     	cmp	w8, #0x1
 40f8a1c: 54000fa0     	b.eq	0x40f8c10 <_ChromeMain+0x40f3974>
 40f8a20: 39022296     	strb	w22, [x20, #0x88]
 40f8a24: f9405ab6     	ldr	x22, [x21, #0xb0]
 40f8a28: b40000d6     	cbz	x22, 0x40f8a40 <_ChromeMain+0x40f37a4>
 40f8a2c: 52800028     	mov	w8, #0x1                ; =1
 40f8a30: b82802c8     	ldadd	w8, w8, [x22]
 40f8a34: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 40f8a38: 6b09011f     	cmp	w8, w9
 40f8a3c: 54000f60     	b.eq	0x40f8c28 <_ChromeMain+0x40f398c>
 40f8a40: f9405eb9     	ldr	x25, [x21, #0xb8]
 40f8a44: 52800b00     	mov	w0, #0x58               ; =88
 40f8a48: 96fc5a48     	bl	0xf368 <_ChromeMain+0xa0cc>
 40f8a4c: aa0003f5     	mov	x21, x0
 40f8a50: 52800037     	mov	w23, #0x1               ; =1
 40f8a54: b9000017     	str	w23, [x0]
 40f8a58: 10011ce8     	adr	x8, 0x40fadf4 <_ChromeMain+0x40f5b58>
 40f8a5c: d503201f     	nop
 40f8a60: 10012449     	adr	x9, 0x40faee8 <_ChromeMain+0x40f5c4c>
 40f8a64: d503201f     	nop
 40f8a68: a900a408     	stp	x8, x9, [x0, #0x8]
 40f8a6c: 10b8c0a8     	adr	x8, 0x406a280 <_ChromeMain+0x4064fe4>
 40f8a70: d503201f     	nop
 40f8a74: 10000e09     	adr	x9, 0x40f8c34 <_ChromeMain+0x40f3998>
 40f8a78: d503201f     	nop
 40f8a7c: a901a408     	stp	x8, x9, [x0, #0x18]
 40f8a80: a902d81f     	stp	xzr, x22, [x0, #0x28]
 40f8a84: f9400268     	ldr	x8, [x19]
 40f8a88: a903a019     	stp	x25, x8, [x0, #0x38]
 40f8a8c: 3cc08260     	ldur	q0, [x19, #0x8]
 40f8a90: a9007e7f     	stp	xzr, xzr, [x19]
 40f8a94: f9000a7f     	str	xzr, [x19, #0x10]
 40f8a98: 3c848000     	stur	q0, [x0, #0x48]
 40f8a9c: 52800100     	mov	w0, #0x8                ; =8
 40f8aa0: 96fc5a32     	bl	0xf368 <_ChromeMain+0xa0cc>
 40f8aa4: aa0003f3     	mov	x19, x0
 40f8aa8: f900001f     	str	xzr, [x0]
 40f8aac: 52800700     	mov	w0, #0x38               ; =56
 40f8ab0: 96fc5a2e     	bl	0xf368 <_ChromeMain+0xa0cc>
 40f8ab4: aa0003f6     	mov	x22, x0
 40f8ab8: f0ff50a8     	adrp	x8, 0x2b0f000 <_ChromeMain+0x2b09d64>
 40f8abc: 91290108     	add	x8, x8, #0xa40
 40f8ac0: f0fff609     	adrp	x9, 0x3fbb000 <_ChromeMain+0x3fb5d64>
 40f8ac4: 91210129     	add	x9, x9, #0x840
 40f8ac8: b9000017     	str	w23, [x0]
 40f8acc: a900a408     	stp	x8, x9, [x0, #0x8]
 40f8ad0: 10012b08     	adr	x8, 0x40fb030 <_ChromeMain+0x40f5d94>
 40f8ad4: d503201f     	nop
 40f8ad8: a901a018     	stp	x24, x8, [x0, #0x18]
 40f8adc: f9001414     	str	x20, [x0, #0x28]
 40f8ae0: 925e7668     	and	x8, x19, #0xfffffffc00000000
 40f8ae4: d00555c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 40f8ae8: f9404529     	ldr	x9, [x9, #0x88]
 40f8aec: eb09011f     	cmp	x8, x9
 40f8af0: 54000061     	b.ne	0x40f8afc <_ChromeMain+0x40f3860>
 40f8af4: aa1303e0     	mov	x0, x19
 40f8af8: 96fc6e01     	bl	0x142fc <_ChromeMain+0xf060>
 40f8afc: f9001ad3     	str	x19, [x22, #0x30]
 40f8b00: 52800700     	mov	w0, #0x38               ; =56
 40f8b04: 96fc5a19     	bl	0xf368 <_ChromeMain+0xa0cc>
 40f8b08: aa0003e3     	mov	x3, x0
 40f8b0c: b9000017     	str	w23, [x0]
 40f8b10: f0ff6448     	adrp	x8, 0x2d83000 <_ChromeMain+0x2d7dd64>
 40f8b14: 91000108     	add	x8, x8, #0x0
 40f8b18: 100136a9     	adr	x9, 0x40fb1ec <_ChromeMain+0x40f5f50>
 40f8b1c: d503201f     	nop
 40f8b20: a900a408     	stp	x8, x9, [x0, #0x8]
 40f8b24: 10013048     	adr	x8, 0x40fb12c <_ChromeMain+0x40f5e90>
 40f8b28: d503201f     	nop
 40f8b2c: a901a018     	stp	x24, x8, [x0, #0x18]
 40f8b30: a902cc15     	stp	x21, x19, [x0, #0x28]
 40f8b34: b0046f81     	adrp	x1, 0xcee9000 <dyld_stub_binder+0xcee9000>
 40f8b38: 912b2421     	add	x1, x1, #0xac9
 40f8b3c: 910063e0     	add	x0, sp, #0x18
 40f8b40: aa1603e2     	mov	x2, x22
 40f8b44: 978ac890     	bl	0x23aad84 <_ChromeMain+0x23a5ae8>
 40f8b48: 910003e0     	mov	x0, sp
 40f8b4c: 9721964d     	bl	0x95e480 <_ChromeMain+0x9591e4>
 40f8b50: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 40f8b54: 36f80508     	tbz	w8, #0x1f, 0x40f8bf4 <_ChromeMain+0x40f3958>
 40f8b58: f9401fe0     	ldr	x0, [sp, #0x38]
 40f8b5c: f94027e8     	ldr	x8, [sp, #0x48]
 40f8b60: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40f8b64: 96fc40d5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f8b68: 14000023     	b	0x40f8bf4 <_ChromeMain+0x40f3958>
 40f8b6c: a9438be1     	ldp	x1, x2, [sp, #0x38]
 40f8b70: 9100a280     	add	x0, x20, #0x28
 40f8b74: 96fc7da9     	bl	0x18218 <_ChromeMain+0x12f7c>
 40f8b78: 17ffff8b     	b	0x40f89a4 <_ChromeMain+0x40f3708>
 40f8b7c: f9400268     	ldr	x8, [x19]
 40f8b80: f900027f     	str	xzr, [x19]
 40f8b84: f9002be8     	str	x8, [sp, #0x50]
 40f8b88: 3cc08260     	ldur	q0, [x19, #0x8]
 40f8b8c: 6f00e401     	movi.2d	v1, #0000000000000000
 40f8b90: 3c808261     	stur	q1, [x19, #0x8]
 40f8b94: 3c8583e0     	stur	q0, [sp, #0x58]
 40f8b98: 9004b761     	adrp	x1, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 40f8b9c: 911cdc21     	add	x1, x1, #0x737
 40f8ba0: b0046f93     	adrp	x19, 0xcee9000 <dyld_stub_binder+0xcee9000>
 40f8ba4: 912cde73     	add	x19, x19, #0xb37
 40f8ba8: 910143e0     	add	x0, sp, #0x50
 40f8bac: 52800082     	mov	w2, #0x4                ; =4
 40f8bb0: aa1303e3     	mov	x3, x19
 40f8bb4: 97569ecf     	bl	0x16a06f0 <_ChromeMain+0x169b454>
 40f8bb8: f9402be8     	ldr	x8, [sp, #0x50]
 40f8bbc: f9002bff     	str	xzr, [sp, #0x50]
 40f8bc0: f9000fe8     	str	x8, [sp, #0x18]
 40f8bc4: 3cc583e0     	ldur	q0, [sp, #0x58]
 40f8bc8: 6f00e401     	movi.2d	v1, #0000000000000000
 40f8bcc: 3c8583e1     	stur	q1, [sp, #0x58]
 40f8bd0: 3c8203e0     	stur	q0, [sp, #0x20]
 40f8bd4: 910063e2     	add	x2, sp, #0x18
 40f8bd8: aa1403e0     	mov	x0, x20
 40f8bdc: aa1303e1     	mov	x1, x19
 40f8be0: 940006bb     	bl	0x40fa6cc <_ChromeMain+0x40f5430>
 40f8be4: 910063e0     	add	x0, sp, #0x18
 40f8be8: 97219626     	bl	0x95e480 <_ChromeMain+0x9591e4>
 40f8bec: 910143e0     	add	x0, sp, #0x50
 40f8bf0: 97219624     	bl	0x95e480 <_ChromeMain+0x9591e4>
 40f8bf4: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 40f8bf8: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 40f8bfc: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 40f8c00: a9495ff8     	ldp	x24, x23, [sp, #0x90]
 40f8c04: a94867fa     	ldp	x26, x25, [sp, #0x80]
 40f8c08: 910343ff     	add	sp, sp, #0xd0
 40f8c0c: d65f03c0     	ret
 40f8c10: 52801201     	mov	w1, #0x90               ; =144
 40f8c14: 96fc40a9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40f8c18: 17ffff82     	b	0x40f8a20 <_ChromeMain+0x40f3784>
 40f8c1c: d4200000     	brk	#0
 40f8c20: d4400000     	hlt	#0
 40f8c24: d4200020     	brk	#0x1
 40f8c28: d4200000     	brk	#0
 40f8c2c: d4400000     	hlt	#0
 40f8c30: d4200020     	brk	#0x1
