
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 463bd4c: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 463bd50: a90167fa     	stp	x26, x25, [sp, #0x10]
 463bd54: a9025ff8     	stp	x24, x23, [sp, #0x20]
 463bd58: a90357f6     	stp	x22, x21, [sp, #0x30]
 463bd5c: a9044ff4     	stp	x20, x19, [sp, #0x40]
 463bd60: a9057bfd     	stp	x29, x30, [sp, #0x50]
 463bd64: 910143fd     	add	x29, sp, #0x50
 463bd68: d10783ff     	sub	sp, sp, #0x1e0
 463bd6c: aa0403f3     	mov	x19, x4
 463bd70: b004cf68     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 463bd74: f940f908     	ldr	x8, [x8, #0x1f0]
 463bd78: f9400108     	ldr	x8, [x8]
 463bd7c: f81a03a8     	stur	x8, [x29, #-0x60]
 463bd80: f9422c08     	ldr	x8, [x0, #0x458]
 463bd84: b40001e8     	cbz	x8, 0x463bdc0 <_ChromeMain+0x4636b24>
 463bd88: f9429d08     	ldr	x8, [x8, #0x538]
 463bd8c: f9403515     	ldr	x21, [x8, #0x68]
 463bd90: b4000195     	cbz	x21, 0x463bdc0 <_ChromeMain+0x4636b24>
 463bd94: aa0003f4     	mov	x20, x0
 463bd98: 397e4008     	ldrb	w8, [x0, #0xf90]
 463bd9c: 37000128     	tbnz	w8, #0x0, 0x463bdc0 <_ChromeMain+0x4636b24>
 463bda0: aa0503f7     	mov	x23, x5
 463bda4: 394060a8     	ldrb	w8, [x5, #0x18]
 463bda8: 340000c8     	cbz	w8, 0x463bdc0 <_ChromeMain+0x4636b24>
 463bdac: 39405ee8     	ldrb	w8, [x23, #0x17]
 463bdb0: f94006e9     	ldr	x9, [x23, #0x8]
 463bdb4: 7219011f     	tst	w8, #0x80
 463bdb8: 9a881128     	csel	x8, x9, x8, ne
 463bdbc: b50004c8     	cbnz	x8, 0x463be54 <_ChromeMain+0x4636bb8>
 463bdc0: 390283ff     	strb	wzr, [sp, #0xa0]
 463bdc4: 3902e3ff     	strb	wzr, [sp, #0xb8]
 463bdc8: b4002bf3     	cbz	x19, 0x463c344 <_ChromeMain+0x46370a8>
 463bdcc: f9400668     	ldr	x8, [x19, #0x8]
 463bdd0: 910283e2     	add	x2, sp, #0xa0
 463bdd4: aa1303e0     	mov	x0, x19
 463bdd8: 52800001     	mov	w1, #0x0                ; =0
 463bddc: d63f0100     	blr	x8
 463bde0: 12800008     	mov	w8, #-0x1               ; =-1
 463bde4: b8e80268     	ldaddal	w8, w8, [x19]
 463bde8: 7100051f     	cmp	w8, #0x1
 463bdec: 54000081     	b.ne	0x463bdfc <_ChromeMain+0x4636b60>
 463bdf0: f9400a68     	ldr	x8, [x19, #0x10]
 463bdf4: aa1303e0     	mov	x0, x19
 463bdf8: d63f0100     	blr	x8
 463bdfc: 3942e3e8     	ldrb	w8, [sp, #0xb8]
 463be00: 340000e8     	cbz	w8, 0x463be1c <_ChromeMain+0x4636b80>
 463be04: 39c2dfe8     	ldrsb	w8, [sp, #0xb7]
 463be08: 36f800a8     	tbz	w8, #0x1f, 0x463be1c <_ChromeMain+0x4636b80>
 463be0c: f94053e0     	ldr	x0, [sp, #0xa0]
 463be10: f9405be8     	ldr	x8, [sp, #0xb0]
 463be14: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 463be18: 96e73428     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463be1c: f85a03a8     	ldur	x8, [x29, #-0x60]
 463be20: b004cf69     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 463be24: f940f929     	ldr	x9, [x9, #0x1f0]
 463be28: f9400129     	ldr	x9, [x9]
 463be2c: eb08013f     	cmp	x9, x8
 463be30: 54002901     	b.ne	0x463c350 <_ChromeMain+0x46370b4>
 463be34: 910783ff     	add	sp, sp, #0x1e0
 463be38: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 463be3c: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 463be40: a94357f6     	ldp	x22, x21, [sp, #0x30]
 463be44: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 463be48: a94167fa     	ldp	x26, x25, [sp, #0x10]
 463be4c: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 463be50: d65f03c0     	ret
 463be54: aa0303f6     	mov	x22, x3
 463be58: aa0203f9     	mov	x25, x2
 463be5c: aa0103fa     	mov	x26, x1
 463be60: 5280e600     	mov	w0, #0x730              ; =1840
 463be64: 96e74d41     	bl	0xf368 <_ChromeMain+0xa0cc>
 463be68: aa0003f8     	mov	x24, x0
 463be6c: 96ebf88b     	bl	0x13a098 <_ChromeMain+0x134dfc>
 463be70: 39805f3c     	ldrsb	x28, [x25, #0x17]
 463be74: b6f8005c     	tbz	x28, #0x3f, 0x463be7c <_ChromeMain+0x4636be0>
 463be78: a9407339     	ldp	x25, x28, [x25]
 463be7c: f9422e88     	ldr	x8, [x20, #0x458]
 463be80: b40003a8     	cbz	x8, 0x463bef4 <_ChromeMain+0x4636c58>
 463be84: f9429d08     	ldr	x8, [x8, #0x538]
 463be88: f940351b     	ldr	x27, [x8, #0x68]
 463be8c: b400037b     	cbz	x27, 0x463bef8 <_ChromeMain+0x4636c5c>
 463be90: 39412368     	ldrb	w8, [x27, #0x48]
 463be94: 37000328     	tbnz	w8, #0x0, 0x463bef8 <_ChromeMain+0x4636c5c>
 463be98: f9400368     	ldr	x8, [x27]
 463be9c: f940b508     	ldr	x8, [x8, #0x168]
 463bea0: aa1b03e0     	mov	x0, x27
 463bea4: d63f0100     	blr	x8
 463bea8: b4000280     	cbz	x0, 0x463bef8 <_ChromeMain+0x4636c5c>
 463beac: b0044501     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 463beb0: 91018021     	add	x1, x1, #0x60
 463beb4: f90003e0     	str	x0, [sp]
 463beb8: 52800202     	mov	w2, #0x10               ; =16
 463bebc: 96fa0364     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 463bec0: b40001c0     	cbz	x0, 0x463bef8 <_ChromeMain+0x4636c5c>
 463bec4: b0044501     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 463bec8: 91018021     	add	x1, x1, #0x60
 463becc: f94003e0     	ldr	x0, [sp]
 463bed0: 52800202     	mov	w2, #0x10               ; =16
 463bed4: 96f20ad5     	bl	0x2bea28 <_ChromeMain+0x2b978c>
 463bed8: 3100041f     	cmn	w0, #0x1
 463bedc: d2c00028     	mov	x8, #0x100000000        ; =4294967296
 463bee0: 9a9fc109     	csel	x9, x8, xzr, gt
 463bee4: 37f800a0     	tbnz	w0, #0x1f, 0x463bef8 <_ChromeMain+0x4636c5c>
 463bee8: 0aa07c0a     	bic	w10, w0, w0, asr #31
 463beec: aa0a0120     	orr	x0, x9, x10
 463bef0: 14000005     	b	0x463bf04 <_ChromeMain+0x4636c68>
 463bef4: d280001b     	mov	x27, #0x0               ; =0
 463bef8: aa1b03e0     	mov	x0, x27
 463befc: 97eb1db1     	bl	0x41035c0 <_ChromeMain+0x40fe324>
 463bf00: 92600008     	and	x8, x0, #0x100000000
 463bf04: 2a0003e9     	mov	w9, w0
 463bf08: aa090108     	orr	x8, x8, x9
 463bf0c: d2c00029     	mov	x9, #0x100000000        ; =4294967296
 463bf10: eb09011f     	cmp	x8, x9
 463bf14: 9a89811b     	csel	x27, x8, x9, hi
 463bf18: d0048548     	adrp	x8, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 463bf1c: 91075908     	add	x8, x8, #0x1d6
 463bf20: 528002c9     	mov	w9, #0x16               ; =22
 463bf24: a93527a8     	stp	x8, x9, [x29, #-0xb0]
 463bf28: b004c488     	adrp	x8, 0xdecc000 <dyld_stub_binder+0xdecc000>
 463bf2c: 9104d908     	add	x8, x8, #0x136
 463bf30: 52800289     	mov	w9, #0x14               ; =20
 463bf34: a93627a8     	stp	x8, x9, [x29, #-0xa0]
 463bf38: 39805f48     	ldrsb	x8, [x26, #0x17]
 463bf3c: a9402b49     	ldp	x9, x10, [x26]
 463bf40: f100011f     	cmp	x8, #0x0
 463bf44: 9a9a4120     	csel	x0, x9, x26, mi
 463bf48: 7100011f     	cmp	w8, #0x0
 463bf4c: 9a884141     	csel	x1, x10, x8, mi
 463bf50: d0045482     	adrp	x2, 0xd0cd000 <dyld_stub_binder+0xd0cd000>
 463bf54: 913b3042     	add	x2, x2, #0xecc
 463bf58: 910303fa     	add	x26, sp, #0xc0
 463bf5c: 910303e8     	add	x8, sp, #0xc0
 463bf60: 52800003     	mov	w3, #0x0                ; =0
 463bf64: 52800004     	mov	w4, #0x0                ; =0
 463bf68: 972ddd6c     	bl	0x11b3518 <_ChromeMain+0x11ae27c>
 463bf6c: 39835fe8     	ldrsb	x8, [sp, #0xd7]
 463bf70: a94c2be9     	ldp	x9, x10, [sp, #0xc0]
 463bf74: f100011f     	cmp	x8, #0x0
 463bf78: 9a9a4129     	csel	x9, x9, x26, mi
 463bf7c: 7100011f     	cmp	w8, #0x0
 463bf80: 9a884148     	csel	x8, x10, x8, mi
 463bf84: b0048d6a     	adrp	x10, 0xd7e8000 <dyld_stub_binder+0xd7e8000>
 463bf88: 9104f14a     	add	x10, x10, #0x13c
 463bf8c: a93723a9     	stp	x9, x8, [x29, #-0x90]
 463bf90: 52800028     	mov	w8, #0x1                ; =1
 463bf94: a93823aa     	stp	x10, x8, [x29, #-0x80]
 463bf98: a93973b9     	stp	x25, x28, [x29, #-0x70]
 463bf9c: 910363f9     	add	x25, sp, #0xd8
 463bfa0: 910363e8     	add	x8, sp, #0xd8
 463bfa4: d102c3a0     	sub	x0, x29, #0xb0
 463bfa8: 528000a1     	mov	w1, #0x5                ; =5
 463bfac: 9700baea     	bl	0x66ab54 <_ChromeMain+0x6658b8>
 463bfb0: 3983bfe8     	ldrsb	x8, [sp, #0xef]
 463bfb4: a94dabe9     	ldp	x9, x10, [sp, #0xd8]
 463bfb8: f100011f     	cmp	x8, #0x0
 463bfbc: 9a994121     	csel	x1, x9, x25, mi
 463bfc0: 7100011f     	cmp	w8, #0x0
 463bfc4: 9a884142     	csel	x2, x10, x8, mi
 463bfc8: 9103c3f9     	add	x25, sp, #0xf0
 463bfcc: 9103c3e0     	add	x0, sp, #0xf0
 463bfd0: 96f4d081     	bl	0x3701d4 <_ChromeMain+0x36af38>
 463bfd4: d10323ba     	sub	x26, x29, #0xc8
 463bfd8: d10323a8     	sub	x8, x29, #0xc8
 463bfdc: aa1b03e0     	mov	x0, x27
 463bfe0: 972bd498     	bl	0x1131240 <_ChromeMain+0x112bfa4>
 463bfe4: 3894f3a8     	ldursb	x8, [x29, #-0xb1]
 463bfe8: a973aba9     	ldp	x9, x10, [x29, #-0xc8]
 463bfec: f100011f     	cmp	x8, #0x0
 463bff0: 9a9a4123     	csel	x3, x9, x26, mi
 463bff4: 7100011f     	cmp	w8, #0x0
 463bff8: 9a884144     	csel	x4, x10, x8, mi
 463bffc: b0049981     	adrp	x1, 0xd96c000 <dyld_stub_binder+0xd96c000>
 463c000: 91287021     	add	x1, x1, #0xa1c
 463c004: 9100a3e8     	add	x8, sp, #0x28
 463c008: 9103c3e0     	add	x0, sp, #0xf0
 463c00c: 52800122     	mov	w2, #0x9                ; =9
 463c010: 975a97cc     	bl	0x1ce1f40 <_ChromeMain+0x1cdcca4>
 463c014: 38d4f3a8     	ldursb	w8, [x29, #-0xb1]
 463c018: 36f800a8     	tbz	w8, #0x1f, 0x463c02c <_ChromeMain+0x4636d90>
 463c01c: f85383a0     	ldur	x0, [x29, #-0xc8]
 463c020: f85483a8     	ldur	x8, [x29, #-0xb8]
 463c024: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 463c028: 96e733a4     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463c02c: 9101c320     	add	x0, x25, #0x70
 463c030: d2800001     	mov	x1, #0x0                ; =0
 463c034: 96e7af21     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 463c038: 91008320     	add	x0, x25, #0x20
 463c03c: 96e7af0f     	bl	0x27c78 <_ChromeMain+0x229dc>
 463c040: 39c41fe8     	ldrsb	w8, [sp, #0x107]
 463c044: 36f800a8     	tbz	w8, #0x1f, 0x463c058 <_ChromeMain+0x4636dbc>
 463c048: f9407be0     	ldr	x0, [sp, #0xf0]
 463c04c: f94083e8     	ldr	x8, [sp, #0x100]
 463c050: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 463c054: 96e73399     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463c058: 39c3bfe8     	ldrsb	w8, [sp, #0xef]
 463c05c: 36f800a8     	tbz	w8, #0x1f, 0x463c070 <_ChromeMain+0x4636dd4>
 463c060: f9406fe0     	ldr	x0, [sp, #0xd8]
 463c064: f94077e8     	ldr	x8, [sp, #0xe8]
 463c068: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 463c06c: 96e73393     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463c070: 39c35fe8     	ldrsb	w8, [sp, #0xd7]
 463c074: 36f800a8     	tbz	w8, #0x1f, 0x463c088 <_ChromeMain+0x4636dec>
 463c078: f94063e0     	ldr	x0, [sp, #0xc0]
 463c07c: f9406be8     	ldr	x8, [sp, #0xd0]
 463c080: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 463c084: 96e7338d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463c088: 9100a3f9     	add	x25, sp, #0x28
 463c08c: 91006300     	add	x0, x24, #0x18
 463c090: 9100a3e1     	add	x1, sp, #0x28
 463c094: 96fef693     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 463c098: 9101c320     	add	x0, x25, #0x70
 463c09c: d2800001     	mov	x1, #0x0                ; =0
 463c0a0: 96e7af06     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 463c0a4: 91008320     	add	x0, x25, #0x20
 463c0a8: 96e7aef4     	bl	0x27c78 <_ChromeMain+0x229dc>
 463c0ac: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 463c0b0: 36f800a8     	tbz	w8, #0x1f, 0x463c0c4 <_ChromeMain+0x4636e28>
 463c0b4: f94017e0     	ldr	x0, [sp, #0x28]
 463c0b8: f9401fe8     	ldr	x8, [sp, #0x38]
 463c0bc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 463c0c0: 96e7337e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463c0c4: 39c05f08     	ldrsb	w8, [x24, #0x17]
 463c0c8: 37f800a8     	tbnz	w8, #0x1f, 0x463c0dc <_ChromeMain+0x4636e40>
 463c0cc: 52800088     	mov	w8, #0x4                ; =4
 463c0d0: 39005f08     	strb	w8, [x24, #0x17]
 463c0d4: aa1803e8     	mov	x8, x24
 463c0d8: 14000004     	b	0x463c0e8 <_ChromeMain+0x4636e4c>
 463c0dc: 52800088     	mov	w8, #0x4                ; =4
 463c0e0: f9000708     	str	x8, [x24, #0x8]
 463c0e4: f9400308     	ldr	x8, [x24]
 463c0e8: 5289ea09     	mov	w9, #0x4f50             ; =20304
 463c0ec: 72aa8a69     	movk	w9, #0x5453, lsl #16
 463c0f0: b9000109     	str	w9, [x8]
 463c0f4: 3900111f     	strb	wzr, [x8, #0x4]
 463c0f8: 52800208     	mov	w8, #0x10               ; =16
 463c0fc: b9026b08     	str	w8, [x24, #0x268]
 463c100: 394062e8     	ldrb	w8, [x23, #0x18]
 463c104: 36001248     	tbz	w8, #0x0, 0x463c34c <_ChromeMain+0x46370b0>
 463c108: 39805ee4     	ldrsb	x4, [x23, #0x17]
 463c10c: b6f80044     	tbz	x4, #0x3f, 0x463c114 <_ChromeMain+0x4636e78>
 463c110: a94012f7     	ldp	x23, x4, [x23]
 463c114: f0043ae1     	adrp	x1, 0xcd9b000 <dyld_stub_binder+0xcd9b000>
 463c118: 912ed421     	add	x1, x1, #0xbb5
 463c11c: 9108e300     	add	x0, x24, #0x238
 463c120: 528001a2     	mov	w2, #0xd                ; =13
 463c124: aa1703e3     	mov	x3, x23
 463c128: 97181915     	bl	0xc4257c <_ChromeMain+0xc3d2e0>
 463c12c: f004c460     	adrp	x0, 0xdecb000 <dyld_stub_binder+0xdecb000>
 463c130: 912bdc00     	add	x0, x0, #0xaf7
 463c134: f004c461     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 463c138: 912c7821     	add	x1, x1, #0xb1e
 463c13c: 910023e8     	add	x8, sp, #0x8
 463c140: 5283dc02     	mov	w2, #0x1ee0             ; =7904
 463c144: 96e852cf     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 463c148: b0048541     	adrp	x1, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 463c14c: 91025021     	add	x1, x1, #0x94
 463c150: 910023e2     	add	x2, sp, #0x8
 463c154: aa1803e0     	mov	x0, x24
 463c158: 975a96ea     	bl	0x1ce1d00 <_ChromeMain+0x1cdca64>
 463c15c: aa0003f7     	mov	x23, x0
 463c160: f90017e0     	str	x0, [sp, #0x28]
 463c164: 52800028     	mov	w8, #0x1                ; =1
 463c168: 3900c408     	strb	w8, [x0, #0x31]
 463c16c: 5298d808     	mov	w8, #0xc6c0             ; =50880
 463c170: 72a005a8     	movk	w8, #0x2d, lsl #16
 463c174: f9010008     	str	x8, [x0, #0x200]
 463c178: 394062c8     	ldrb	w8, [x22, #0x18]
 463c17c: d0052bb9     	adrp	x25, 0xebb2000 <dyld_stub_binder+0xebb2000>
 463c180: 34000248     	cbz	w8, 0x463c1c8 <_ChromeMain+0x4636f2c>
 463c184: 39805ed8     	ldrsb	x24, [x22, #0x17]
 463c188: b6f80058     	tbz	x24, #0x3f, 0x463c190 <_ChromeMain+0x4636ef4>
 463c18c: a94062d6     	ldp	x22, x24, [x22]
 463c190: f0049428     	adrp	x8, 0xd8c3000 <dyld_stub_binder+0xd8c3000>
 463c194: 911b9508     	add	x8, x8, #0x6e5
 463c198: 52800209     	mov	w9, #0x10               ; =16
 463c19c: a90f27e8     	stp	x8, x9, [sp, #0xf0]
 463c1a0: 9103c3e8     	add	x8, sp, #0xf0
 463c1a4: 925e7508     	and	x8, x8, #0xfffffffc00000000
 463c1a8: f9404729     	ldr	x9, [x25, #0x88]
 463c1ac: eb09011f     	cmp	x8, x9
 463c1b0: 54000f20     	b.eq	0x463c394 <_ChromeMain+0x46370f8>
 463c1b4: 9103c3e3     	add	x3, sp, #0xf0
 463c1b8: aa1703e0     	mov	x0, x23
 463c1bc: aa1603e1     	mov	x1, x22
 463c1c0: aa1803e2     	mov	x2, x24
 463c1c4: 976d662b     	bl	0x2195a70 <_ChromeMain+0x21907d4>
 463c1c8: 52825e08     	mov	w8, #0x12f0             ; =4848
 463c1cc: 8b080280     	add	x0, x20, x8
 463c1d0: 9100a3e1     	add	x1, sp, #0x28
 463c1d4: 94b9b889     	bl	0x74aa3f8 <_ChromeMain+0x74a515c>
 463c1d8: aa1503e0     	mov	x0, x21
 463c1dc: 972db7db     	bl	0x11aa148 <_ChromeMain+0x11a4eac>
 463c1e0: f9413c08     	ldr	x8, [x0, #0x278]
 463c1e4: b4000b88     	cbz	x8, 0x463c354 <_ChromeMain+0x46370b8>
 463c1e8: f9400115     	ldr	x21, [x8]
 463c1ec: b40000b5     	cbz	x21, 0x463c200 <_ChromeMain+0x4636f64>
 463c1f0: b9400aa8     	ldr	w8, [x21, #0x8]
 463c1f4: 31000508     	adds	w8, w8, #0x1
 463c1f8: b9000aa8     	str	w8, [x21, #0x8]
 463c1fc: 54000b22     	b.hs	0x463c360 <_ChromeMain+0x46370c4>
 463c200: f94a0696     	ldr	x22, [x20, #0x1408]
 463c204: b40000d6     	cbz	x22, 0x463c21c <_ChromeMain+0x4636f80>
 463c208: 52800028     	mov	w8, #0x1                ; =1
 463c20c: b82802c8     	ldadd	w8, w8, [x22]
 463c210: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 463c214: 6b09011f     	cmp	w8, w9
 463c218: 54000aa0     	b.eq	0x463c36c <_ChromeMain+0x46370d0>
 463c21c: f94a0a98     	ldr	x24, [x20, #0x1410]
 463c220: 52800a00     	mov	w0, #0x50               ; =80
 463c224: 96e74c51     	bl	0xf368 <_ChromeMain+0xa0cc>
 463c228: aa0003f4     	mov	x20, x0
 463c22c: 52800028     	mov	w8, #0x1                ; =1
 463c230: b9000008     	str	w8, [x0]
 463c234: 101a8de8     	adr	x8, 0x46713f0 <_ChromeMain+0x466c154>
 463c238: d503201f     	nop
 463c23c: 101a9509     	adr	x9, 0x46714dc <_ChromeMain+0x466c240>
 463c240: d503201f     	nop
 463c244: a900a408     	stp	x8, x9, [x0, #0x8]
 463c248: d0ffd168     	adrp	x8, 0x406a000 <_ChromeMain+0x4064d64>
 463c24c: 910a0108     	add	x8, x8, #0x280
 463c250: 10003b89     	adr	x9, 0x463c9c0 <_ChromeMain+0x4637724>
 463c254: d503201f     	nop
 463c258: a901a408     	stp	x8, x9, [x0, #0x18]
 463c25c: a902d81f     	stp	xzr, x22, [x0, #0x28]
 463c260: f9001c18     	str	x24, [x0, #0x38]
 463c264: 925e76f6     	and	x22, x23, #0xfffffffc00000000
 463c268: f9404728     	ldr	x8, [x25, #0x88]
 463c26c: eb0802df     	cmp	x22, x8
 463c270: 54000061     	b.ne	0x463c27c <_ChromeMain+0x4636fe0>
 463c274: aa1703e0     	mov	x0, x23
 463c278: 96e76021     	bl	0x142fc <_ChromeMain+0xf060>
 463c27c: a9044e97     	stp	x23, x19, [x20, #0x40]
 463c280: f94016f8     	ldr	x24, [x23, #0x28]
 463c284: 52800f00     	mov	w0, #0x78               ; =120
 463c288: 96e74c38     	bl	0xf368 <_ChromeMain+0xa0cc>
 463c28c: aa0003f3     	mov	x19, x0
 463c290: f9404728     	ldr	x8, [x25, #0x88]
 463c294: eb0802df     	cmp	x22, x8
 463c298: 54000061     	b.ne	0x463c2a4 <_ChromeMain+0x4637008>
 463c29c: aa1703e0     	mov	x0, x23
 463c2a0: 96e76017     	bl	0x142fc <_ChromeMain+0xf060>
 463c2a4: f100031f     	cmp	x24, #0x0
 463c2a8: 1a9f07e8     	cset	w8, ne
 463c2ac: 39004268     	strb	w8, [x19, #0x10]
 463c2b0: d004e608     	adrp	x8, 0xe2fe000 <dyld_stub_binder+0xe2fe000>
 463c2b4: 91294108     	add	x8, x8, #0xa50
 463c2b8: a9005e68     	stp	x8, x23, [x19]
 463c2bc: 91014108     	add	x8, x8, #0x50
 463c2c0: 52a00029     	mov	w9, #0x10000            ; =65536
 463c2c4: a901a668     	stp	x8, x9, [x19, #0x18]
 463c2c8: 3900a27f     	strb	wzr, [x19, #0x28]
 463c2cc: 3901027f     	strb	wzr, [x19, #0x40]
 463c2d0: f9002674     	str	x20, [x19, #0x48]
 463c2d4: 3dc01ae0     	ldr	q0, [x23, #0x60]
 463c2d8: b94072e8     	ldr	w8, [x23, #0x70]
 463c2dc: b9006268     	str	w8, [x19, #0x60]
 463c2e0: 3d801660     	str	q0, [x19, #0x50]
 463c2e4: f9403ee8     	ldr	x8, [x23, #0x78]
 463c2e8: a906fe68     	stp	x8, xzr, [x19, #0x68]
 463c2ec: f9405ae0     	ldr	x0, [x23, #0xb0]
 463c2f0: f9005af3     	str	x19, [x23, #0xb0]
 463c2f4: b5000420     	cbnz	x0, 0x463c378 <_ChromeMain+0x46370dc>
 463c2f8: aa1703e0     	mov	x0, x23
 463c2fc: aa1503e1     	mov	x1, x21
 463c300: 976d6680     	bl	0x2195d00 <_ChromeMain+0x2190a64>
 463c304: b4000155     	cbz	x21, 0x463c32c <_ChromeMain+0x4637090>
 463c308: b9400aa9     	ldr	w9, [x21, #0x8]
 463c30c: 51000528     	sub	w8, w9, #0x1
 463c310: b9000aa8     	str	w8, [x21, #0x8]
 463c314: 340003a9     	cbz	w9, 0x463c388 <_ChromeMain+0x46370ec>
 463c318: 350000a8     	cbnz	w8, 0x463c32c <_ChromeMain+0x4637090>
 463c31c: f94002a8     	ldr	x8, [x21]
 463c320: f9400508     	ldr	x8, [x8, #0x8]
 463c324: aa1503e0     	mov	x0, x21
 463c328: d63f0100     	blr	x8
 463c32c: f94017e0     	ldr	x0, [sp, #0x28]
 463c330: f90017ff     	str	xzr, [sp, #0x28]
 463c334: b4ffd740     	cbz	x0, 0x463be1c <_ChromeMain+0x4636b80>
 463c338: 973fc618     	bl	0x162db98 <_ChromeMain+0x16288fc>
 463c33c: 52804501     	mov	w1, #0x228              ; =552
 463c340: 17fffeb6     	b	0x463be18 <_ChromeMain+0x4636b7c>
 463c344: d4200000     	brk	#0
 463c348: d4400000     	hlt	#0
 463c34c: d4200020     	brk	#0x1
 463c350: 94e72004     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 463c354: d4200000     	brk	#0
 463c358: d4400000     	hlt	#0
 463c35c: d4200020     	brk	#0x1
 463c360: d4200000     	brk	#0
 463c364: d4400000     	hlt	#0
 463c368: d4200020     	brk	#0x1
 463c36c: d4200000     	brk	#0
 463c370: d4400000     	hlt	#0
 463c374: d4200020     	brk	#0x1
 463c378: f9400008     	ldr	x8, [x0]
 463c37c: f9400508     	ldr	x8, [x8, #0x8]
 463c380: d63f0100     	blr	x8
 463c384: 17ffffdd     	b	0x463c2f8 <_ChromeMain+0x463705c>
 463c388: d4200000     	brk	#0
 463c38c: d4400000     	hlt	#0
 463c390: d4200020     	brk	#0x1
 463c394: 9103c3e0     	add	x0, sp, #0xf0
 463c398: 96e75fd9     	bl	0x142fc <_ChromeMain+0xf060>
 463c39c: 17ffff86     	b	0x463c1b4 <_ChromeMain+0x4636f18>
 463c3a0: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 463c3a4: a90167fa     	stp	x26, x25, [sp, #0x10]
 463c3a8: a9025ff8     	stp	x24, x23, [sp, #0x20]
 463c3ac: a90357f6     	stp	x22, x21, [sp, #0x30]
 463c3b0: a9044ff4     	stp	x20, x19, [sp, #0x40]
 463c3b4: a9057bfd     	stp	x29, x30, [sp, #0x50]
 463c3b8: 910143fd     	add	x29, sp, #0x50
 463c3bc: d10683ff     	sub	sp, sp, #0x1a0
 463c3c0: aa0303f3     	mov	x19, x3
 463c3c4: 9004cf68     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 463c3c8: f940f908     	ldr	x8, [x8, #0x1f0]
 463c3cc: f9400108     	ldr	x8, [x8]
 463c3d0: f81a03a8     	stur	x8, [x29, #-0x60]
 463c3d4: f9422c08     	ldr	x8, [x0, #0x458]
 463c3d8: b40002a8     	cbz	x8, 0x463c42c <_ChromeMain+0x4637190>
 463c3dc: f9429d08     	ldr	x8, [x8, #0x538]
 463c3e0: f9403515     	ldr	x21, [x8, #0x68]
 463c3e4: b4000255     	cbz	x21, 0x463c42c <_ChromeMain+0x4637190>
 463c3e8: aa0003f4     	mov	x20, x0
 463c3ec: 397e4008     	ldrb	w8, [x0, #0xf90]
 463c3f0: 370001e8     	tbnz	w8, #0x0, 0x463c42c <_ChromeMain+0x4637190>
 463c3f4: aa0403f7     	mov	x23, x4
 463c3f8: 39406088     	ldrb	w8, [x4, #0x18]
 463c3fc: 34000188     	cbz	w8, 0x463c42c <_ChromeMain+0x4637190>
 463c400: 39405ee8     	ldrb	w8, [x23, #0x17]
 463c404: f94006e9     	ldr	x9, [x23, #0x8]
 463c408: 7219011f     	tst	w8, #0x80
 463c40c: 9a881128     	csel	x8, x9, x8, ne
 463c410: b40000e8     	cbz	x8, 0x463c42c <_ChromeMain+0x4637190>
 463c414: aa0203f6     	mov	x22, x2
 463c418: aa0103f9     	mov	x25, x1
 463c41c: 39805c28     	ldrsb	x8, [x1, #0x17]
 463c420: b6f80048     	tbz	x8, #0x3f, 0x463c428 <_ChromeMain+0x463718c>
 463c424: f9400728     	ldr	x8, [x25, #0x8]
 463c428: b50004c8     	cbnz	x8, 0x463c4c0 <_ChromeMain+0x4637224>
 463c42c: 390263ff     	strb	wzr, [sp, #0x98]
 463c430: 3902c3ff     	strb	wzr, [sp, #0xb0]
 463c434: b40027d3     	cbz	x19, 0x463c92c <_ChromeMain+0x4637690>
 463c438: f9400668     	ldr	x8, [x19, #0x8]
 463c43c: 910263e2     	add	x2, sp, #0x98
 463c440: aa1303e0     	mov	x0, x19
 463c444: 52800001     	mov	w1, #0x0                ; =0
 463c448: d63f0100     	blr	x8
 463c44c: 12800008     	mov	w8, #-0x1               ; =-1
 463c450: b8e80268     	ldaddal	w8, w8, [x19]
 463c454: 7100051f     	cmp	w8, #0x1
 463c458: 54000081     	b.ne	0x463c468 <_ChromeMain+0x46371cc>
 463c45c: f9400a68     	ldr	x8, [x19, #0x10]
 463c460: aa1303e0     	mov	x0, x19
 463c464: d63f0100     	blr	x8
 463c468: 3942c3e8     	ldrb	w8, [sp, #0xb0]
 463c46c: 340000e8     	cbz	w8, 0x463c488 <_ChromeMain+0x46371ec>
 463c470: 39c2bfe8     	ldrsb	w8, [sp, #0xaf]
 463c474: 36f800a8     	tbz	w8, #0x1f, 0x463c488 <_ChromeMain+0x46371ec>
 463c478: f9404fe0     	ldr	x0, [sp, #0x98]
 463c47c: f94057e8     	ldr	x8, [sp, #0xa8]
 463c480: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 463c484: 96e7328d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463c488: f85a03a8     	ldur	x8, [x29, #-0x60]
 463c48c: 9004cf69     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 463c490: f940f929     	ldr	x9, [x9, #0x1f0]
 463c494: f9400129     	ldr	x9, [x9]
 463c498: eb08013f     	cmp	x9, x8
 463c49c: 540024e1     	b.ne	0x463c938 <_ChromeMain+0x463769c>
 463c4a0: 910683ff     	add	sp, sp, #0x1a0
 463c4a4: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 463c4a8: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 463c4ac: a94357f6     	ldp	x22, x21, [sp, #0x30]
 463c4b0: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 463c4b4: a94167fa     	ldp	x26, x25, [sp, #0x10]
 463c4b8: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 463c4bc: d65f03c0     	ret
 463c4c0: 5280e600     	mov	w0, #0x730              ; =1840
 463c4c4: 96e74ba9     	bl	0xf368 <_ChromeMain+0xa0cc>
 463c4c8: aa0003f8     	mov	x24, x0
 463c4cc: 96ebf6f3     	bl	0x13a098 <_ChromeMain+0x134dfc>
 463c4d0: 39805f3c     	ldrsb	x28, [x25, #0x17]
 463c4d4: b6f8005c     	tbz	x28, #0x3f, 0x463c4dc <_ChromeMain+0x4637240>
 463c4d8: a9407339     	ldp	x25, x28, [x25]
 463c4dc: f9422e88     	ldr	x8, [x20, #0x458]
 463c4e0: b40003a8     	cbz	x8, 0x463c554 <_ChromeMain+0x46372b8>
 463c4e4: f9429d08     	ldr	x8, [x8, #0x538]
 463c4e8: f940351a     	ldr	x26, [x8, #0x68]
 463c4ec: b400037a     	cbz	x26, 0x463c558 <_ChromeMain+0x46372bc>
 463c4f0: 39412348     	ldrb	w8, [x26, #0x48]
 463c4f4: 37000328     	tbnz	w8, #0x0, 0x463c558 <_ChromeMain+0x46372bc>
 463c4f8: f9400348     	ldr	x8, [x26]
 463c4fc: f940b508     	ldr	x8, [x8, #0x168]
 463c500: aa1a03e0     	mov	x0, x26
 463c504: d63f0100     	blr	x8
 463c508: b4000280     	cbz	x0, 0x463c558 <_ChromeMain+0x46372bc>
 463c50c: aa0003fb     	mov	x27, x0
 463c510: 90044501     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 463c514: 91018021     	add	x1, x1, #0x60
 463c518: 52800202     	mov	w2, #0x10               ; =16
 463c51c: 96fa01cc     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 463c520: b40001c0     	cbz	x0, 0x463c558 <_ChromeMain+0x46372bc>
 463c524: 90044501     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 463c528: 91018021     	add	x1, x1, #0x60
 463c52c: aa1b03e0     	mov	x0, x27
 463c530: 52800202     	mov	w2, #0x10               ; =16
 463c534: 96f2093d     	bl	0x2bea28 <_ChromeMain+0x2b978c>
 463c538: 3100041f     	cmn	w0, #0x1
 463c53c: d2c00028     	mov	x8, #0x100000000        ; =4294967296
 463c540: 9a9fc109     	csel	x9, x8, xzr, gt
 463c544: 37f800a0     	tbnz	w0, #0x1f, 0x463c558 <_ChromeMain+0x46372bc>
 463c548: 0aa07c0a     	bic	w10, w0, w0, asr #31
 463c54c: aa0a0120     	orr	x0, x9, x10
 463c550: 14000005     	b	0x463c564 <_ChromeMain+0x46372c8>
 463c554: d280001a     	mov	x26, #0x0               ; =0
 463c558: aa1a03e0     	mov	x0, x26
 463c55c: 97eb1c19     	bl	0x41035c0 <_ChromeMain+0x40fe324>
 463c560: 92600008     	and	x8, x0, #0x100000000
 463c564: 2a0003e9     	mov	w9, w0
 463c568: aa090108     	orr	x8, x8, x9
 463c56c: b0048549     	adrp	x9, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 463c570: 91075929     	add	x9, x9, #0x1d6
 463c574: 528002ca     	mov	w10, #0x16              ; =22
 463c578: a9372ba9     	stp	x9, x10, [x29, #-0x90]
 463c57c: 9004c489     	adrp	x9, 0xdecc000 <dyld_stub_binder+0xdecc000>
 463c580: 9104d929     	add	x9, x9, #0x136
 463c584: 5280028a     	mov	w10, #0x14              ; =20
 463c588: a9382ba9     	stp	x9, x10, [x29, #-0x80]
 463c58c: d2c00029     	mov	x9, #0x100000000        ; =4294967296
 463c590: eb09011f     	cmp	x8, x9
 463c594: 9a89811a     	csel	x26, x8, x9, hi
 463c598: a93973b9     	stp	x25, x28, [x29, #-0x70]
 463c59c: 9102e3f9     	add	x25, sp, #0xb8
 463c5a0: 9102e3e8     	add	x8, sp, #0xb8
 463c5a4: d10243a0     	sub	x0, x29, #0x90
 463c5a8: 52800061     	mov	w1, #0x3                ; =3
 463c5ac: 9700b96a     	bl	0x66ab54 <_ChromeMain+0x6658b8>
 463c5b0: 39833fe8     	ldrsb	x8, [sp, #0xcf]
 463c5b4: a94babe9     	ldp	x9, x10, [sp, #0xb8]
 463c5b8: f100011f     	cmp	x8, #0x0
 463c5bc: 9a994121     	csel	x1, x9, x25, mi
 463c5c0: 7100011f     	cmp	w8, #0x0
 463c5c4: 9a884142     	csel	x2, x10, x8, mi
 463c5c8: 910343f9     	add	x25, sp, #0xd0
 463c5cc: 910343e0     	add	x0, sp, #0xd0
 463c5d0: 96f4cf01     	bl	0x3701d4 <_ChromeMain+0x36af38>
 463c5d4: d102a3bb     	sub	x27, x29, #0xa8
 463c5d8: d102a3a8     	sub	x8, x29, #0xa8
 463c5dc: aa1a03e0     	mov	x0, x26
 463c5e0: 972bd318     	bl	0x1131240 <_ChromeMain+0x112bfa4>
 463c5e4: 3896f3a8     	ldursb	x8, [x29, #-0x91]
 463c5e8: a975aba9     	ldp	x9, x10, [x29, #-0xa8]
 463c5ec: f100011f     	cmp	x8, #0x0
 463c5f0: 9a9b4123     	csel	x3, x9, x27, mi
 463c5f4: 7100011f     	cmp	w8, #0x0
 463c5f8: 9a884144     	csel	x4, x10, x8, mi
 463c5fc: 90049981     	adrp	x1, 0xd96c000 <dyld_stub_binder+0xd96c000>
 463c600: 91287021     	add	x1, x1, #0xa1c
 463c604: 910083e8     	add	x8, sp, #0x20
 463c608: 910343e0     	add	x0, sp, #0xd0
 463c60c: 52800122     	mov	w2, #0x9                ; =9
 463c610: 975a964c     	bl	0x1ce1f40 <_ChromeMain+0x1cdcca4>
 463c614: 38d6f3a8     	ldursb	w8, [x29, #-0x91]
 463c618: 36f800a8     	tbz	w8, #0x1f, 0x463c62c <_ChromeMain+0x4637390>
 463c61c: f85583a0     	ldur	x0, [x29, #-0xa8]
 463c620: f85683a8     	ldur	x8, [x29, #-0x98]
 463c624: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 463c628: 96e73224     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463c62c: 9101c320     	add	x0, x25, #0x70
 463c630: d2800001     	mov	x1, #0x0                ; =0
 463c634: 96e7ada1     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 463c638: 91008320     	add	x0, x25, #0x20
 463c63c: 96e7ad8f     	bl	0x27c78 <_ChromeMain+0x229dc>
 463c640: 39c39fe8     	ldrsb	w8, [sp, #0xe7]
 463c644: 36f800a8     	tbz	w8, #0x1f, 0x463c658 <_ChromeMain+0x46373bc>
 463c648: f9406be0     	ldr	x0, [sp, #0xd0]
 463c64c: f94073e8     	ldr	x8, [sp, #0xe0]
 463c650: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 463c654: 96e73219     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463c658: 39c33fe8     	ldrsb	w8, [sp, #0xcf]
 463c65c: 36f800a8     	tbz	w8, #0x1f, 0x463c670 <_ChromeMain+0x46373d4>
 463c660: f9405fe0     	ldr	x0, [sp, #0xb8]
 463c664: f94067e8     	ldr	x8, [sp, #0xc8]
 463c668: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 463c66c: 96e73213     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463c670: 910083f9     	add	x25, sp, #0x20
 463c674: 91006300     	add	x0, x24, #0x18
 463c678: 910083e1     	add	x1, sp, #0x20
 463c67c: 96fef519     	bl	0x5f9ae0 <_ChromeMain+0x5f4844>
 463c680: 9101c320     	add	x0, x25, #0x70
 463c684: d2800001     	mov	x1, #0x0                ; =0
 463c688: 96e7ad8c     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 463c68c: 91008320     	add	x0, x25, #0x20
 463c690: 96e7ad7a     	bl	0x27c78 <_ChromeMain+0x229dc>
 463c694: 39c0dfe8     	ldrsb	w8, [sp, #0x37]
 463c698: 36f800a8     	tbz	w8, #0x1f, 0x463c6ac <_ChromeMain+0x4637410>
 463c69c: f94013e0     	ldr	x0, [sp, #0x20]
 463c6a0: f9401be8     	ldr	x8, [sp, #0x30]
 463c6a4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 463c6a8: 96e73204     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463c6ac: 39c05f08     	ldrsb	w8, [x24, #0x17]
 463c6b0: 37f800a8     	tbnz	w8, #0x1f, 0x463c6c4 <_ChromeMain+0x4637428>
 463c6b4: 52800088     	mov	w8, #0x4                ; =4
 463c6b8: 39005f08     	strb	w8, [x24, #0x17]
 463c6bc: aa1803e8     	mov	x8, x24
 463c6c0: 14000004     	b	0x463c6d0 <_ChromeMain+0x4637434>
 463c6c4: 52800088     	mov	w8, #0x4                ; =4
 463c6c8: f9000708     	str	x8, [x24, #0x8]
 463c6cc: f9400308     	ldr	x8, [x24]
 463c6d0: 5289ea09     	mov	w9, #0x4f50             ; =20304
 463c6d4: 72aa8a69     	movk	w9, #0x5453, lsl #16
 463c6d8: b9000109     	str	w9, [x8]
 463c6dc: 3900111f     	strb	wzr, [x8, #0x4]
 463c6e0: 52800208     	mov	w8, #0x10               ; =16
 463c6e4: b9026b08     	str	w8, [x24, #0x268]
 463c6e8: 394062e8     	ldrb	w8, [x23, #0x18]
 463c6ec: 36001248     	tbz	w8, #0x0, 0x463c934 <_ChromeMain+0x4637698>
 463c6f0: 39805ee4     	ldrsb	x4, [x23, #0x17]
 463c6f4: b6f80044     	tbz	x4, #0x3f, 0x463c6fc <_ChromeMain+0x4637460>
 463c6f8: a94012f7     	ldp	x23, x4, [x23]
 463c6fc: f0043ae1     	adrp	x1, 0xcd9b000 <dyld_stub_binder+0xcd9b000>
 463c700: 912ed421     	add	x1, x1, #0xbb5
 463c704: 9108e300     	add	x0, x24, #0x238
 463c708: 528001a2     	mov	w2, #0xd                ; =13
 463c70c: aa1703e3     	mov	x3, x23
 463c710: 9718179b     	bl	0xc4257c <_ChromeMain+0xc3d2e0>
 463c714: f004c460     	adrp	x0, 0xdecb000 <dyld_stub_binder+0xdecb000>
 463c718: 912d9000     	add	x0, x0, #0xb64
 463c71c: f004c461     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 463c720: 912c7821     	add	x1, x1, #0xb1e
 463c724: 910003e8     	mov	x8, sp
 463c728: 5283e0e2     	mov	w2, #0x1f07             ; =7943
 463c72c: 96e85155     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 463c730: b0048541     	adrp	x1, 0xd6e5000 <dyld_stub_binder+0xd6e5000>
 463c734: 91025021     	add	x1, x1, #0x94
 463c738: 910003e2     	mov	x2, sp
 463c73c: aa1803e0     	mov	x0, x24
 463c740: 975a9570     	bl	0x1ce1d00 <_ChromeMain+0x1cdca64>
 463c744: aa0003f7     	mov	x23, x0
 463c748: f90013e0     	str	x0, [sp, #0x20]
 463c74c: 52800028     	mov	w8, #0x1                ; =1
 463c750: 3900c408     	strb	w8, [x0, #0x31]
 463c754: 5298d808     	mov	w8, #0xc6c0             ; =50880
 463c758: 72a005a8     	movk	w8, #0x2d, lsl #16
 463c75c: f9010008     	str	x8, [x0, #0x200]
 463c760: 394062c8     	ldrb	w8, [x22, #0x18]
 463c764: d0052bb9     	adrp	x25, 0xebb2000 <dyld_stub_binder+0xebb2000>
 463c768: 34000248     	cbz	w8, 0x463c7b0 <_ChromeMain+0x4637514>
 463c76c: 39805ed8     	ldrsb	x24, [x22, #0x17]
 463c770: b6f80058     	tbz	x24, #0x3f, 0x463c778 <_ChromeMain+0x46374dc>
 463c774: a94062d6     	ldp	x22, x24, [x22]
 463c778: f0049428     	adrp	x8, 0xd8c3000 <dyld_stub_binder+0xd8c3000>
 463c77c: 911b9508     	add	x8, x8, #0x6e5
 463c780: 52800209     	mov	w9, #0x10               ; =16
 463c784: a90d27e8     	stp	x8, x9, [sp, #0xd0]
 463c788: 910343e8     	add	x8, sp, #0xd0
 463c78c: 925e7508     	and	x8, x8, #0xfffffffc00000000
 463c790: f9404729     	ldr	x9, [x25, #0x88]
 463c794: eb09011f     	cmp	x8, x9
 463c798: 54000f20     	b.eq	0x463c97c <_ChromeMain+0x46376e0>
 463c79c: 910343e3     	add	x3, sp, #0xd0
 463c7a0: aa1703e0     	mov	x0, x23
 463c7a4: aa1603e1     	mov	x1, x22
 463c7a8: aa1803e2     	mov	x2, x24
 463c7ac: 976d64b1     	bl	0x2195a70 <_ChromeMain+0x21907d4>
 463c7b0: 52825e08     	mov	w8, #0x12f0             ; =4848
 463c7b4: 8b080280     	add	x0, x20, x8
 463c7b8: 910083e1     	add	x1, sp, #0x20
 463c7bc: 94b9b70f     	bl	0x74aa3f8 <_ChromeMain+0x74a515c>
 463c7c0: aa1503e0     	mov	x0, x21
 463c7c4: 972db661     	bl	0x11aa148 <_ChromeMain+0x11a4eac>
 463c7c8: f9413c08     	ldr	x8, [x0, #0x278]
 463c7cc: b4000b88     	cbz	x8, 0x463c93c <_ChromeMain+0x46376a0>
 463c7d0: f9400115     	ldr	x21, [x8]
 463c7d4: b40000b5     	cbz	x21, 0x463c7e8 <_ChromeMain+0x463754c>
 463c7d8: b9400aa8     	ldr	w8, [x21, #0x8]
 463c7dc: 31000508     	adds	w8, w8, #0x1
 463c7e0: b9000aa8     	str	w8, [x21, #0x8]
 463c7e4: 54000b22     	b.hs	0x463c948 <_ChromeMain+0x46376ac>
 463c7e8: f94a0696     	ldr	x22, [x20, #0x1408]
 463c7ec: b40000d6     	cbz	x22, 0x463c804 <_ChromeMain+0x4637568>
 463c7f0: 52800028     	mov	w8, #0x1                ; =1
 463c7f4: b82802c8     	ldadd	w8, w8, [x22]
 463c7f8: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 463c7fc: 6b09011f     	cmp	w8, w9
 463c800: 54000aa0     	b.eq	0x463c954 <_ChromeMain+0x46376b8>
 463c804: f94a0a98     	ldr	x24, [x20, #0x1410]
 463c808: 52800a00     	mov	w0, #0x50               ; =80
 463c80c: 96e74ad7     	bl	0xf368 <_ChromeMain+0xa0cc>
 463c810: aa0003f4     	mov	x20, x0
 463c814: 52800028     	mov	w8, #0x1                ; =1
 463c818: b9000008     	str	w8, [x0]
 463c81c: 101a5ea8     	adr	x8, 0x46713f0 <_ChromeMain+0x466c154>
 463c820: d503201f     	nop
 463c824: 101a65c9     	adr	x9, 0x46714dc <_ChromeMain+0x466c240>
 463c828: d503201f     	nop
 463c82c: a900a408     	stp	x8, x9, [x0, #0x8]
 463c830: d0ffd168     	adrp	x8, 0x406a000 <_ChromeMain+0x4064d64>
 463c834: 910a0108     	add	x8, x8, #0x280
 463c838: 10000c49     	adr	x9, 0x463c9c0 <_ChromeMain+0x4637724>
 463c83c: d503201f     	nop
 463c840: a901a408     	stp	x8, x9, [x0, #0x18]
 463c844: a902d81f     	stp	xzr, x22, [x0, #0x28]
 463c848: f9001c18     	str	x24, [x0, #0x38]
 463c84c: 925e76f6     	and	x22, x23, #0xfffffffc00000000
 463c850: f9404728     	ldr	x8, [x25, #0x88]
 463c854: eb0802df     	cmp	x22, x8
 463c858: 54000061     	b.ne	0x463c864 <_ChromeMain+0x46375c8>
 463c85c: aa1703e0     	mov	x0, x23
 463c860: 96e75ea7     	bl	0x142fc <_ChromeMain+0xf060>
 463c864: a9044e97     	stp	x23, x19, [x20, #0x40]
 463c868: f94016f8     	ldr	x24, [x23, #0x28]
 463c86c: 52800f00     	mov	w0, #0x78               ; =120
 463c870: 96e74abe     	bl	0xf368 <_ChromeMain+0xa0cc>
 463c874: aa0003f3     	mov	x19, x0
 463c878: f9404728     	ldr	x8, [x25, #0x88]
 463c87c: eb0802df     	cmp	x22, x8
 463c880: 54000061     	b.ne	0x463c88c <_ChromeMain+0x46375f0>
 463c884: aa1703e0     	mov	x0, x23
 463c888: 96e75e9d     	bl	0x142fc <_ChromeMain+0xf060>
 463c88c: f100031f     	cmp	x24, #0x0
 463c890: 1a9f07e8     	cset	w8, ne
 463c894: 39004268     	strb	w8, [x19, #0x10]
 463c898: d004e608     	adrp	x8, 0xe2fe000 <dyld_stub_binder+0xe2fe000>
 463c89c: 91294108     	add	x8, x8, #0xa50
 463c8a0: a9005e68     	stp	x8, x23, [x19]
 463c8a4: 91014108     	add	x8, x8, #0x50
 463c8a8: 52a00029     	mov	w9, #0x10000            ; =65536
 463c8ac: a901a668     	stp	x8, x9, [x19, #0x18]
 463c8b0: 3900a27f     	strb	wzr, [x19, #0x28]
 463c8b4: 3901027f     	strb	wzr, [x19, #0x40]
 463c8b8: f9002674     	str	x20, [x19, #0x48]
 463c8bc: 3dc01ae0     	ldr	q0, [x23, #0x60]
 463c8c0: b94072e8     	ldr	w8, [x23, #0x70]
 463c8c4: b9006268     	str	w8, [x19, #0x60]
 463c8c8: 3d801660     	str	q0, [x19, #0x50]
 463c8cc: f9403ee8     	ldr	x8, [x23, #0x78]
 463c8d0: a906fe68     	stp	x8, xzr, [x19, #0x68]
 463c8d4: f9405ae0     	ldr	x0, [x23, #0xb0]
 463c8d8: f9005af3     	str	x19, [x23, #0xb0]
 463c8dc: b5000420     	cbnz	x0, 0x463c960 <_ChromeMain+0x46376c4>
 463c8e0: aa1703e0     	mov	x0, x23
 463c8e4: aa1503e1     	mov	x1, x21
 463c8e8: 976d6506     	bl	0x2195d00 <_ChromeMain+0x2190a64>
 463c8ec: b4000155     	cbz	x21, 0x463c914 <_ChromeMain+0x4637678>
 463c8f0: b9400aa9     	ldr	w9, [x21, #0x8]
 463c8f4: 51000528     	sub	w8, w9, #0x1
 463c8f8: b9000aa8     	str	w8, [x21, #0x8]
 463c8fc: 340003a9     	cbz	w9, 0x463c970 <_ChromeMain+0x46376d4>
 463c900: 350000a8     	cbnz	w8, 0x463c914 <_ChromeMain+0x4637678>
 463c904: f94002a8     	ldr	x8, [x21]
 463c908: f9400508     	ldr	x8, [x8, #0x8]
 463c90c: aa1503e0     	mov	x0, x21
 463c910: d63f0100     	blr	x8
 463c914: f94013e0     	ldr	x0, [sp, #0x20]
 463c918: f90013ff     	str	xzr, [sp, #0x20]
 463c91c: b4ffdb60     	cbz	x0, 0x463c488 <_ChromeMain+0x46371ec>
 463c920: 973fc49e     	bl	0x162db98 <_ChromeMain+0x16288fc>
 463c924: 52804501     	mov	w1, #0x228              ; =552
 463c928: 17fffed7     	b	0x463c484 <_ChromeMain+0x46371e8>
 463c92c: d4200000     	brk	#0
 463c930: d4400000     	hlt	#0
 463c934: d4200020     	brk	#0x1
 463c938: 94e71e8a     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 463c93c: d4200000     	brk	#0
 463c940: d4400000     	hlt	#0
 463c944: d4200020     	brk	#0x1
 463c948: d4200000     	brk	#0
 463c94c: d4400000     	hlt	#0
 463c950: d4200020     	brk	#0x1
 463c954: d4200000     	brk	#0
 463c958: d4400000     	hlt	#0
 463c95c: d4200020     	brk	#0x1
 463c960: f9400008     	ldr	x8, [x0]
 463c964: f9400508     	ldr	x8, [x8, #0x8]
 463c968: d63f0100     	blr	x8
 463c96c: 17ffffdd     	b	0x463c8e0 <_ChromeMain+0x4637644>
 463c970: d4200000     	brk	#0
 463c974: d4400000     	hlt	#0
 463c978: d4200020     	brk	#0x1
 463c97c: 910343e0     	add	x0, sp, #0xd0
 463c980: 96e75e5f     	bl	0x142fc <_ChromeMain+0xf060>
 463c984: 17ffff86     	b	0x463c79c <_ChromeMain+0x4637500>
 463c988: d503201f     	nop
 463c98c: d503201f     	nop
 463c990: d503201f     	nop
 463c994: d503201f     	nop
 463c998: d503201f     	nop
 463c99c: d503201f     	nop
 463c9a0: d503201f     	nop
 463c9a4: d503201f     	nop
 463c9a8: d503201f     	nop
 463c9ac: d503201f     	nop
 463c9b0: d503201f     	nop
 463c9b4: d503201f     	nop
 463c9b8: d503201f     	nop
 463c9bc: d503201f     	nop
 463c9c0: d101c3ff     	sub	sp, sp, #0x70
 463c9c4: a90267fa     	stp	x26, x25, [sp, #0x20]
 463c9c8: a9035ff8     	stp	x24, x23, [sp, #0x30]
 463c9cc: a90457f6     	stp	x22, x21, [sp, #0x40]
 463c9d0: a9054ff4     	stp	x20, x19, [sp, #0x50]
 463c9d4: a9067bfd     	stp	x29, x30, [sp, #0x60]
 463c9d8: 910183fd     	add	x29, sp, #0x60
 463c9dc: aa0303f5     	mov	x21, x3
 463c9e0: aa0203f3     	mov	x19, x2
 463c9e4: f9497c08     	ldr	x8, [x0, #0x12f8]
 463c9e8: d37df109     	lsl	x9, x8, #3
 463c9ec: b4000189     	cbz	x9, 0x463ca1c <_ChromeMain+0x4637780>
 463c9f0: aa0103f6     	mov	x22, x1
 463c9f4: aa0003f7     	mov	x23, x0
 463c9f8: f949780a     	ldr	x10, [x0, #0x12f0]
 463c9fc: cb0a03e8     	neg	x8, x10
 463ca00: f9400154     	ldr	x20, [x10]
 463ca04: eb16029f     	cmp	x20, x22
 463ca08: 54000680     	b.eq	0x463cad8 <_ChromeMain+0x463783c>
 463ca0c: 9100214a     	add	x10, x10, #0x8
 463ca10: d1002108     	sub	x8, x8, #0x8
 463ca14: f1002129     	subs	x9, x9, #0x8
 463ca18: 54ffff41     	b.ne	0x463ca00 <_ChromeMain+0x4637764>
 463ca1c: d2800014     	mov	x20, #0x0               ; =0
 463ca20: 52800001     	mov	w1, #0x0                ; =0
 463ca24: 52800036     	mov	w22, #0x1               ; =1
 463ca28: 390003ff     	strb	wzr, [sp]
 463ca2c: 390063ff     	strb	wzr, [sp, #0x18]
 463ca30: 394062a8     	ldrb	w8, [x21, #0x18]
 463ca34: 34000128     	cbz	w8, 0x463ca58 <_ChromeMain+0x46377bc>
 463ca38: 3dc002a0     	ldr	q0, [x21]
 463ca3c: 3d8003e0     	str	q0, [sp]
 463ca40: f9400aa8     	ldr	x8, [x21, #0x10]
 463ca44: f9000be8     	str	x8, [sp, #0x10]
 463ca48: a900febf     	stp	xzr, xzr, [x21, #0x8]
 463ca4c: f90002bf     	str	xzr, [x21]
 463ca50: 52800028     	mov	w8, #0x1                ; =1
 463ca54: 390063e8     	strb	w8, [sp, #0x18]
 463ca58: b4000c33     	cbz	x19, 0x463cbdc <_ChromeMain+0x4637940>
 463ca5c: f9400668     	ldr	x8, [x19, #0x8]
 463ca60: 910003e2     	mov	x2, sp
 463ca64: aa1303e0     	mov	x0, x19
 463ca68: d63f0100     	blr	x8
 463ca6c: 12800008     	mov	w8, #-0x1               ; =-1
 463ca70: b8e80268     	ldaddal	w8, w8, [x19]
 463ca74: 7100051f     	cmp	w8, #0x1
 463ca78: 54000081     	b.ne	0x463ca88 <_ChromeMain+0x46377ec>
 463ca7c: f9400a68     	ldr	x8, [x19, #0x10]
 463ca80: aa1303e0     	mov	x0, x19
 463ca84: d63f0100     	blr	x8
 463ca88: 394063e8     	ldrb	w8, [sp, #0x18]
 463ca8c: 340000e8     	cbz	w8, 0x463caa8 <_ChromeMain+0x463780c>
 463ca90: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 463ca94: 36f800a8     	tbz	w8, #0x1f, 0x463caa8 <_ChromeMain+0x463780c>
 463ca98: f94003e0     	ldr	x0, [sp]
 463ca9c: f9400be8     	ldr	x8, [sp, #0x10]
 463caa0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 463caa4: 96e73105     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463caa8: 370000b6     	tbnz	w22, #0x0, 0x463cabc <_ChromeMain+0x4637820>
 463caac: aa1403e0     	mov	x0, x20
 463cab0: 973fc43a     	bl	0x162db98 <_ChromeMain+0x16288fc>
 463cab4: 52804501     	mov	w1, #0x228              ; =552
 463cab8: 96e73100     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463cabc: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 463cac0: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 463cac4: a94457f6     	ldp	x22, x21, [sp, #0x40]
 463cac8: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 463cacc: a94267fa     	ldp	x26, x25, [sp, #0x20]
 463cad0: 9101c3ff     	add	sp, sp, #0x70
 463cad4: d65f03c0     	ret
 463cad8: f900015f     	str	xzr, [x10]
 463cadc: f9497ae9     	ldr	x9, [x23, #0x12f0]
 463cae0: f9497eeb     	ldr	x11, [x23, #0x12f8]
 463cae4: 8b0b0d39     	add	x25, x9, x11, lsl #3
 463cae8: eb19015f     	cmp	x10, x25
 463caec: 54000760     	b.eq	0x463cbd8 <_ChromeMain+0x463793c>
 463caf0: d37df16a     	lsl	x10, x11, #3
 463caf4: cb0803f8     	neg	x24, x8
 463caf8: 5280010c     	mov	w12, #0x8               ; =8
 463cafc: 8b0a012a     	add	x10, x9, x10
 463cb00: cb0a018a     	sub	x10, x12, x10
 463cb04: eb08015f     	cmp	x10, x8
 463cb08: 54000220     	b.eq	0x463cb4c <_ChromeMain+0x46378b0>
 463cb0c: 52800109     	mov	w9, #0x8                ; =8
 463cb10: cb08013a     	sub	x26, x9, x8
 463cb14: 14000008     	b	0x463cb34 <_ChromeMain+0x4637898>
 463cb18: 973fc420     	bl	0x162db98 <_ChromeMain+0x16288fc>
 463cb1c: 52804501     	mov	w1, #0x228              ; =552
 463cb20: 96e730e6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 463cb24: 91002318     	add	x24, x24, #0x8
 463cb28: 9100235a     	add	x26, x26, #0x8
 463cb2c: eb19035f     	cmp	x26, x25
