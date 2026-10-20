
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7dc3e7c: d10343ff     	sub	sp, sp, #0xd0
 7dc3e80: a9076ffc     	stp	x28, x27, [sp, #0x70]
 7dc3e84: a90867fa     	stp	x26, x25, [sp, #0x80]
 7dc3e88: a9095ff8     	stp	x24, x23, [sp, #0x90]
 7dc3e8c: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 7dc3e90: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 7dc3e94: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 7dc3e98: 910303fd     	add	x29, sp, #0xc0
 7dc3e9c: f90003e1     	str	x1, [sp]
 7dc3ea0: aa0003f3     	mov	x19, x0
 7dc3ea4: 52800028     	mov	w8, #0x1                ; =1
 7dc3ea8: 3900e408     	strb	w8, [x0, #0x39]
 7dc3eac: a905ffff     	stp	xzr, xzr, [sp, #0x58]
 7dc3eb0: f90037ff     	str	xzr, [sp, #0x68]
 7dc3eb4: 910163e0     	add	x0, sp, #0x58
 7dc3eb8: 965bff52     	bl	0x14c3c00 <_ChromeMain+0x14be964>
 7dc3ebc: f9401660     	ldr	x0, [x19, #0x28]
 7dc3ec0: f9400408     	ldr	x8, [x0, #0x8]
 7dc3ec4: b4000a68     	cbz	x8, 0x7dc4010 <_ChromeMain+0x7dbed74>
 7dc3ec8: d2800015     	mov	x21, #0x0               ; =0
 7dc3ecc: b002e4f8     	adrp	x24, 0xda60000 <dyld_stub_binder+0xda60000>
 7dc3ed0: 91182318     	add	x24, x24, #0x608
 7dc3ed4: f002e059     	adrp	x25, 0xd9ce000 <dyld_stub_binder+0xd9ce000>
 7dc3ed8: 913a6739     	add	x25, x25, #0xe99
 7dc3edc: d002e95a     	adrp	x26, 0xdaed000 <dyld_stub_binder+0xdaed000>
 7dc3ee0: 912e1f5a     	add	x26, x26, #0xb87
 7dc3ee4: 9002e07b     	adrp	x27, 0xd9cf000 <dyld_stub_binder+0xd9cf000>
 7dc3ee8: 91067f7b     	add	x27, x27, #0x19f
 7dc3eec: f002d25c     	adrp	x28, 0xd80e000 <dyld_stub_binder+0xd80e000>
 7dc3ef0: 9133e79c     	add	x28, x28, #0xcf9
 7dc3ef4: d002e954     	adrp	x20, 0xdaed000 <dyld_stub_binder+0xdaed000>
 7dc3ef8: 912e4694     	add	x20, x20, #0xb91
 7dc3efc: 14000039     	b	0x7dc3fe0 <_ChromeMain+0x7dbed44>
 7dc3f00: a94712c3     	ldp	x3, x4, [x22, #0x70]
 7dc3f04: 14000010     	b	0x7dc3f44 <_ChromeMain+0x7dbeca8>
 7dc3f08: aa1603e3     	mov	x3, x22
 7dc3f0c: 910083e0     	add	x0, sp, #0x20
 7dc3f10: f002d161     	adrp	x1, 0xd7f2000 <dyld_stub_binder+0xd7f2000>
 7dc3f14: 9138dc21     	add	x1, x1, #0xe37
 7dc3f18: 52800082     	mov	w2, #0x4                ; =4
 7dc3f1c: 96a61ac8     	bl	0x274aa3c <_ChromeMain+0x27457a0>
 7dc3f20: 910083e0     	add	x0, sp, #0x20
 7dc3f24: d002d2c1     	adrp	x1, 0xd81d000 <dyld_stub_binder+0xd81d000>
 7dc3f28: 91314c21     	add	x1, x1, #0xc53
 7dc3f2c: 528000a2     	mov	w2, #0x5                ; =5
 7dc3f30: aa1503e3     	mov	x3, x21
 7dc3f34: 961ddbc7     	bl	0x53ae50 <_ChromeMain+0x535bb4>
 7dc3f38: 39821ec4     	ldrsb	x4, [x22, #0x87]
 7dc3f3c: b7fffe24     	tbnz	x4, #0x3f, 0x7dc3f00 <_ChromeMain+0x7dbec64>
 7dc3f40: 9101c2c3     	add	x3, x22, #0x70
 7dc3f44: 910083e0     	add	x0, sp, #0x20
 7dc3f48: aa1803e1     	mov	x1, x24
 7dc3f4c: 52800162     	mov	w2, #0xb                ; =11
 7dc3f50: 96a61abb     	bl	0x274aa3c <_ChromeMain+0x27457a0>
 7dc3f54: 910083e0     	add	x0, sp, #0x20
 7dc3f58: 120002e3     	and	w3, w23, #0x1
 7dc3f5c: aa1903e1     	mov	x1, x25
 7dc3f60: 528000e2     	mov	w2, #0x7                ; =7
 7dc3f64: 966353a5     	bl	0x1698df8 <_ChromeMain+0x1693b5c>
 7dc3f68: 530106e3     	ubfx	w3, w23, #1, #1
 7dc3f6c: 910083e0     	add	x0, sp, #0x20
 7dc3f70: aa1a03e1     	mov	x1, x26
 7dc3f74: 52800122     	mov	w2, #0x9                ; =9
 7dc3f78: 966353a0     	bl	0x1698df8 <_ChromeMain+0x1693b5c>
 7dc3f7c: 53030ee3     	ubfx	w3, w23, #3, #1
 7dc3f80: 910083e0     	add	x0, sp, #0x20
 7dc3f84: aa1b03e1     	mov	x1, x27
 7dc3f88: 52800122     	mov	w2, #0x9                ; =9
 7dc3f8c: 9663539b     	bl	0x1698df8 <_ChromeMain+0x1693b5c>
 7dc3f90: 530412e3     	ubfx	w3, w23, #4, #1
 7dc3f94: 910083e0     	add	x0, sp, #0x20
 7dc3f98: aa1c03e1     	mov	x1, x28
 7dc3f9c: 528000c2     	mov	w2, #0x6                ; =6
 7dc3fa0: 96635396     	bl	0x1698df8 <_ChromeMain+0x1693b5c>
 7dc3fa4: 53061ae3     	ubfx	w3, w23, #6, #1
 7dc3fa8: 910083e0     	add	x0, sp, #0x20
 7dc3fac: aa1403e1     	mov	x1, x20
 7dc3fb0: 52800202     	mov	w2, #0x10               ; =16
 7dc3fb4: 96635391     	bl	0x1698df8 <_ChromeMain+0x1693b5c>
 7dc3fb8: 910163e0     	add	x0, sp, #0x58
 7dc3fbc: 910083e1     	add	x1, sp, #0x20
 7dc3fc0: 96316879     	bl	0xa1e1a4 <_ChromeMain+0xa18f08>
 7dc3fc4: 910083e0     	add	x0, sp, #0x20
 7dc3fc8: 962e692e     	bl	0x95e480 <_ChromeMain+0x9591e4>
 7dc3fcc: 910006b5     	add	x21, x21, #0x1
 7dc3fd0: f9401660     	ldr	x0, [x19, #0x28]
 7dc3fd4: f9400408     	ldr	x8, [x0, #0x8]
 7dc3fd8: eb0802bf     	cmp	x21, x8
 7dc3fdc: 540001a2     	b.hs	0x7dc4010 <_ChromeMain+0x7dbed74>
 7dc3fe0: aa1503e1     	mov	x1, x21
 7dc3fe4: 97e97418     	bl	0x7821044 <_ChromeMain+0x781bda8>
 7dc3fe8: aa0003f6     	mov	x22, x0
 7dc3fec: 7940a017     	ldrh	w23, [x0, #0x50]
 7dc3ff0: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 7dc3ff4: f9001bff     	str	xzr, [sp, #0x30]
 7dc3ff8: 910083e0     	add	x0, sp, #0x20
 7dc3ffc: 965bff01     	bl	0x14c3c00 <_ChromeMain+0x14be964>
 7dc4000: 39805ec4     	ldrsb	x4, [x22, #0x17]
 7dc4004: b6fff824     	tbz	x4, #0x3f, 0x7dc3f08 <_ChromeMain+0x7dbec6c>
 7dc4008: a94012c3     	ldp	x3, x4, [x22]
 7dc400c: 17ffffc0     	b	0x7dc3f0c <_ChromeMain+0x7dbec70>
 7dc4010: f94003e1     	ldr	x1, [sp]
 7dc4014: 39805c22     	ldrsb	x2, [x1, #0x17]
 7dc4018: b6f80042     	tbz	x2, #0x3f, 0x7dc4020 <_ChromeMain+0x7dbed84>
 7dc401c: a9400821     	ldp	x1, x2, [x1]
 7dc4020: 910083e0     	add	x0, sp, #0x20
 7dc4024: 963866d7     	bl	0xbddb80 <_ChromeMain+0xbd88e4>
 7dc4028: 910103e0     	add	x0, sp, #0x40
 7dc402c: 910083e1     	add	x1, sp, #0x20
 7dc4030: 968b6f00     	bl	0x209fc30 <_ChromeMain+0x209a994>
 7dc4034: 910163e8     	add	x8, sp, #0x58
 7dc4038: f90007e8     	str	x8, [sp, #0x8]
 7dc403c: 528000e8     	mov	w8, #0x7                ; =7
 7dc4040: 390063e8     	strb	w8, [sp, #0x18]
 7dc4044: 910103e1     	add	x1, sp, #0x40
 7dc4048: 910023e2     	add	x2, sp, #0x8
 7dc404c: aa1303e0     	mov	x0, x19
 7dc4050: 97afbba2     	bl	0x69b2ed8 <_ChromeMain+0x69adc3c>
 7dc4054: 910083e0     	add	x0, sp, #0x20
 7dc4058: 966169df     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 7dc405c: 910163e0     	add	x0, sp, #0x58
 7dc4060: 968777e8     	bl	0x1fa2000 <_ChromeMain+0x1f9cd64>
 7dc4064: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 7dc4068: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 7dc406c: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 7dc4070: a9495ff8     	ldp	x24, x23, [sp, #0x90]
 7dc4074: a94867fa     	ldp	x26, x25, [sp, #0x80]
 7dc4078: a9476ffc     	ldp	x28, x27, [sp, #0x70]
 7dc407c: 910343ff     	add	sp, sp, #0xd0
 7dc4080: d65f03c0     	ret
