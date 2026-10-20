
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4657b04: a94e7bfd     	ldp	x29, x30, [sp, #0xe0]
 4657b08: a94d4ff4     	ldp	x20, x19, [sp, #0xd0]
 4657b0c: a94c57f6     	ldp	x22, x21, [sp, #0xc0]
 4657b10: a94b5ff8     	ldp	x24, x23, [sp, #0xb0]
 4657b14: a94a67fa     	ldp	x26, x25, [sp, #0xa0]
 4657b18: a9496ffc     	ldp	x28, x27, [sp, #0x90]
 4657b1c: 9103c3ff     	add	sp, sp, #0xf0
 4657b20: d65f03c0     	ret
 4657b24: 131f7ec8     	asr	w8, w22, #31
 4657b28: 32000116     	orr	w22, w8, #0x1
 4657b2c: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4657b30: f0052ad9     	adrp	x25, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4657b34: f9404729     	ldr	x9, [x25, #0x88]
 4657b38: eb09011f     	cmp	x8, x9
 4657b3c: 54000061     	b.ne	0x4657b48 <_ChromeMain+0x46528ac>
 4657b40: aa1403e0     	mov	x0, x20
 4657b44: 96e6f1ee     	bl	0x142fc <_ChromeMain+0xf060>
 4657b48: f942f660     	ldr	x0, [x19, #0x5e8]
 4657b4c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4657b50: f9404729     	ldr	x9, [x25, #0x88]
 4657b54: eb09011f     	cmp	x8, x9
 4657b58: 54000041     	b.ne	0x4657b60 <_ChromeMain+0x46528c4>
 4657b5c: 96e72bb8     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4657b60: f902f674     	str	x20, [x19, #0x5e8]
 4657b64: b90a2276     	str	w22, [x19, #0xa20]
 4657b68: aa1303e0     	mov	x0, x19
 4657b6c: aa1403e1     	mov	x1, x20
 4657b70: 97ffede7     	bl	0x465330c <_ChromeMain+0x464e070>
 4657b74: f942f661     	ldr	x1, [x19, #0x5e8]
 4657b78: aa1303e0     	mov	x0, x19
 4657b7c: 940003fb     	bl	0x4658b68 <_ChromeMain+0x46538cc>
 4657b80: f942f674     	ldr	x20, [x19, #0x5e8]
 4657b84: b4000254     	cbz	x20, 0x4657bcc <_ChromeMain+0x4652930>
 4657b88: f9400288     	ldr	x8, [x20]
 4657b8c: f9402d08     	ldr	x8, [x8, #0x58]
 4657b90: aa1403e0     	mov	x0, x20
 4657b94: d63f0100     	blr	x8
 4657b98: aa0003f6     	mov	x22, x0
 4657b9c: 940099a1     	bl	0x467e220 <_ChromeMain+0x4678f84>
 4657ba0: f10002df     	cmp	x22, #0x0
 4657ba4: 1a9f07e8     	cset	w8, ne
 4657ba8: eb0002df     	cmp	x22, x0
 4657bac: fa401ac4     	ccmp	x22, #0x0, #0x4, ne
 4657bb0: 54000100     	b.eq	0x4657bd0 <_ChromeMain+0x4652934>
 4657bb4: f94026d6     	ldr	x22, [x22, #0x48]
 4657bb8: f10002df     	cmp	x22, #0x0
 4657bbc: 1a9f07e8     	cset	w8, ne
 4657bc0: fa4012c4     	ccmp	x22, x0, #0x4, ne
 4657bc4: 54ffff81     	b.ne	0x4657bb4 <_ChromeMain+0x4652918>
 4657bc8: 14000002     	b	0x4657bd0 <_ChromeMain+0x4652934>
 4657bcc: 52800008     	mov	w8, #0x0                ; =0
