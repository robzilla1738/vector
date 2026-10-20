
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  f72a30: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
  f72a34: 910003fd     	mov	x29, sp
  f72a38: aa0203e4     	mov	x4, x2
  f72a3c: b9403c08     	ldr	w8, [x0, #0x3c]
  f72a40: 7100051f     	cmp	w8, #0x1
  f72a44: 5400046b     	b.lt	0xf72ad0 <_ChromeMain+0xf6d834>
  f72a48: 39405c09     	ldrb	w9, [x0, #0x17]
  f72a4c: 13001d2a     	sxtb	w10, w9
  f72a50: f940040b     	ldr	x11, [x0, #0x8]
  f72a54: 7100015f     	cmp	w10, #0x0
  f72a58: 9a89416b     	csel	x11, x11, x9, mi
  f72a5c: b9803809     	ldrsw	x9, [x0, #0x38]
  f72a60: eb09016b     	subs	x11, x11, x9
  f72a64: 54000423     	b.lo	0xf72ae8 <_ChromeMain+0xf6d84c>
  f72a68: f940000c     	ldr	x12, [x0]
  f72a6c: 7100015f     	cmp	w10, #0x0
  f72a70: 9a80418a     	csel	x10, x12, x0, mi
  f72a74: eb08017f     	cmp	x11, x8
  f72a78: 9a883168     	csel	x8, x11, x8, lo
  f72a7c: 8b090140     	add	x0, x10, x9
  f72a80: b9403c29     	ldr	w9, [x1, #0x3c]
  f72a84: 7100053f     	cmp	w9, #0x1
  f72a88: 540002ab     	b.lt	0xf72adc <_ChromeMain+0xf6d840>
  f72a8c: 39405c2a     	ldrb	w10, [x1, #0x17]
  f72a90: 13001d4b     	sxtb	w11, w10
  f72a94: f940042c     	ldr	x12, [x1, #0x8]
  f72a98: 7100017f     	cmp	w11, #0x0
  f72a9c: 9a8a418c     	csel	x12, x12, x10, mi
  f72aa0: b980382a     	ldrsw	x10, [x1, #0x38]
  f72aa4: eb0a018c     	subs	x12, x12, x10
  f72aa8: 54000203     	b.lo	0xf72ae8 <_ChromeMain+0xf6d84c>
  f72aac: f940002d     	ldr	x13, [x1]
  f72ab0: 7100017f     	cmp	w11, #0x0
  f72ab4: 9a8141ab     	csel	x11, x13, x1, mi
  f72ab8: eb09019f     	cmp	x12, x9
  f72abc: 9a893183     	csel	x3, x12, x9, lo
  f72ac0: 8b0a0162     	add	x2, x11, x10
  f72ac4: aa0803e1     	mov	x1, x8
  f72ac8: a8c17bfd     	ldp	x29, x30, [sp], #0x10
  f72acc: 1400000a     	b	0xf72af4 <_ChromeMain+0xf6d858>
  f72ad0: d2800008     	mov	x8, #0x0                ; =0
  f72ad4: d2800000     	mov	x0, #0x0                ; =0
  f72ad8: 17ffffea     	b	0xf72a80 <_ChromeMain+0xf6d7e4>
  f72adc: d2800003     	mov	x3, #0x0                ; =0
  f72ae0: d2800002     	mov	x2, #0x0                ; =0
  f72ae4: 17fffff8     	b	0xf72ac4 <_ChromeMain+0xf6d828>
  f72ae8: d0064380     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
  f72aec: 91376000     	add	x0, x0, #0xdd8
  f72af0: 94f235f9     	bl	0x4c002d4 <_ChromeMain+0x4bfb038>
  f72af4: d10503ff     	sub	sp, sp, #0x140
  f72af8: a90f67fa     	stp	x26, x25, [sp, #0xf0]
  f72afc: a9105ff8     	stp	x24, x23, [sp, #0x100]
  f72b00: a91157f6     	stp	x22, x21, [sp, #0x110]
  f72b04: a9124ff4     	stp	x20, x19, [sp, #0x120]
  f72b08: a9137bfd     	stp	x29, x30, [sp, #0x130]
  f72b0c: 9104c3fd     	add	x29, sp, #0x130
  f72b10: aa0003f7     	mov	x23, x0
  f72b14: 52800000     	mov	w0, #0x0                ; =0
  f72b18: d00685a8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
  f72b1c: f940f908     	ldr	x8, [x8, #0x1f0]
  f72b20: f9400108     	ldr	x8, [x8]
  f72b24: f81b83a8     	stur	x8, [x29, #-0x48]
  f72b28: b40001c1     	cbz	x1, 0xf72b60 <_ChromeMain+0xf6d8c4>
  f72b2c: aa0303f4     	mov	x20, x3
  f72b30: b4000183     	cbz	x3, 0xf72b60 <_ChromeMain+0xf6d8c4>
  f72b34: aa0403f3     	mov	x19, x4
  f72b38: aa0203f5     	mov	x21, x2
  f72b3c: aa0103f6     	mov	x22, x1
  f72b40: eb14003f     	cmp	x1, x20
  f72b44: 540002c1     	b.ne	0xf72b9c <_ChromeMain+0xf6d900>
  f72b48: aa1703e0     	mov	x0, x23
  f72b4c: aa1503e1     	mov	x1, x21
  f72b50: aa1603e2     	mov	x2, x22
  f72b54: 95c25b43     	bl	0x8009860 <_ChromeMain+0x80045c4>
  f72b58: 35000220     	cbnz	w0, 0xf72b9c <_ChromeMain+0xf6d900>
  f72b5c: 52800020     	mov	w0, #0x1                ; =1
  f72b60: f85b83a8     	ldur	x8, [x29, #-0x48]
  f72b64: d00685a9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
  f72b68: f940f929     	ldr	x9, [x9, #0x1f0]
  f72b6c: f9400129     	ldr	x9, [x9]
  f72b70: eb08013f     	cmp	x9, x8
  f72b74: 54000a21     	b.ne	0xf72cb8 <_ChromeMain+0xf6da1c>
  f72b78: a9537bfd     	ldp	x29, x30, [sp, #0x130]
  f72b7c: a9524ff4     	ldp	x20, x19, [sp, #0x120]
  f72b80: a95157f6     	ldp	x22, x21, [sp, #0x110]
  f72b84: a9505ff8     	ldp	x24, x23, [sp, #0x100]
  f72b88: a94f67fa     	ldp	x26, x25, [sp, #0xf0]
  f72b8c: 910503ff     	add	sp, sp, #0x140
  f72b90: d65f03c0     	ret
  f72b94: 52800000     	mov	w0, #0x0                ; =0
  f72b98: 17fffff2     	b	0xf72b60 <_ChromeMain+0xf6d8c4>
  f72b9c: f0069df8     	adrp	x24, 0xe331000 <dyld_stub_binder+0xe331000>
  f72ba0: 91200318     	add	x24, x24, #0x800
  f72ba4: 910123e8     	add	x8, sp, #0x48
  f72ba8: 91008119     	add	x25, x8, #0x20
  f72bac: a904e7f8     	stp	x24, x25, [sp, #0x48]
  f72bb0: 90067e48     	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
  f72bb4: 3dc28500     	ldr	q0, [x8, #0xa10]
  f72bb8: 3d8007e0     	str	q0, [sp, #0x10]
  f72bbc: 3c8583e0     	stur	q0, [sp, #0x58]
  f72bc0: 6f00e400     	movi.2d	v0, #0000000000000000
  f72bc4: ad0103e0     	stp	q0, q0, [sp, #0x20]
  f72bc8: 12800008     	mov	w8, #-0x1               ; =-1
  f72bcc: b9002fe8     	str	w8, [sp, #0x2c]
  f72bd0: 910123e2     	add	x2, sp, #0x48
  f72bd4: 910083e3     	add	x3, sp, #0x20
  f72bd8: aa1703e0     	mov	x0, x23
  f72bdc: aa1603e1     	mov	x1, x22
  f72be0: 97c81028     	bl	0x176c80 <_ChromeMain+0x1719e4>
  f72be4: b94023e8     	ldr	w8, [sp, #0x20]
  f72be8: f90027f8     	str	x24, [sp, #0x48]
  f72bec: f9402be0     	ldr	x0, [sp, #0x50]
  f72bf0: eb19001f     	cmp	x0, x25
  f72bf4: 54000040     	b.eq	0xf72bfc <_ChromeMain+0xf6d960>
  f72bf8: b5000620     	cbnz	x0, 0xf72cbc <_ChromeMain+0xf6da20>
  f72bfc: 121f7908     	and	w8, w8, #0xfffffffe
  f72c00: 7100091f     	cmp	w8, #0x2
  f72c04: 54fffc80     	b.eq	0xf72b94 <_ChromeMain+0xf6d8f8>
  f72c08: aa1703e0     	mov	x0, x23
  f72c0c: aa1603e1     	mov	x1, x22
  f72c10: aa1303e2     	mov	x2, x19
  f72c14: 97ffbaf7     	bl	0xf617f0 <_ChromeMain+0xf5c554>
  f72c18: b4fffbe1     	cbz	x1, 0xf72b94 <_ChromeMain+0xf6d8f8>
  f72c1c: aa0003f7     	mov	x23, x0
  f72c20: aa0103f6     	mov	x22, x1
  f72c24: 910123e8     	add	x8, sp, #0x48
  f72c28: 91008119     	add	x25, x8, #0x20
  f72c2c: a904e7f8     	stp	x24, x25, [sp, #0x48]
  f72c30: 3dc007e0     	ldr	q0, [sp, #0x10]
  f72c34: 3c8583e0     	stur	q0, [sp, #0x58]
  f72c38: 6f00e400     	movi.2d	v0, #0000000000000000
  f72c3c: ad0103e0     	stp	q0, q0, [sp, #0x20]
  f72c40: 12800008     	mov	w8, #-0x1               ; =-1
  f72c44: b9002fe8     	str	w8, [sp, #0x2c]
  f72c48: 910123e2     	add	x2, sp, #0x48
  f72c4c: 910083e3     	add	x3, sp, #0x20
  f72c50: aa1503e0     	mov	x0, x21
  f72c54: aa1403e1     	mov	x1, x20
  f72c58: 97c8100a     	bl	0x176c80 <_ChromeMain+0x1719e4>
  f72c5c: b94023e8     	ldr	w8, [sp, #0x20]
  f72c60: f90027f8     	str	x24, [sp, #0x48]
  f72c64: f9402be0     	ldr	x0, [sp, #0x50]
  f72c68: eb19001f     	cmp	x0, x25
  f72c6c: 54000040     	b.eq	0xf72c74 <_ChromeMain+0xf6d9d8>
  f72c70: b50002e0     	cbnz	x0, 0xf72ccc <_ChromeMain+0xf6da30>
  f72c74: 121f7908     	and	w8, w8, #0xfffffffe
  f72c78: 7100091f     	cmp	w8, #0x2
  f72c7c: 54fff8c0     	b.eq	0xf72b94 <_ChromeMain+0xf6d8f8>
  f72c80: aa1503e0     	mov	x0, x21
  f72c84: aa1403e1     	mov	x1, x20
  f72c88: aa1303e2     	mov	x2, x19
  f72c8c: 97ffbad9     	bl	0xf617f0 <_ChromeMain+0xf5c554>
  f72c90: eb0102df     	cmp	x22, x1
  f72c94: 54fff801     	b.ne	0xf72b94 <_ChromeMain+0xf6d8f8>
  f72c98: aa0003e2     	mov	x2, x0
  f72c9c: aa1703e0     	mov	x0, x23
  f72ca0: aa0203e1     	mov	x1, x2
  f72ca4: aa1603e2     	mov	x2, x22
  f72ca8: 95c25aee     	bl	0x8009860 <_ChromeMain+0x80045c4>
  f72cac: 7100001f     	cmp	w0, #0x0
  f72cb0: 1a9f17e0     	cset	w0, eq
  f72cb4: 17ffffab     	b	0xf72b60 <_ChromeMain+0xf6d8c4>
  f72cb8: 95c245aa     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
  f72cbc: b9000fe8     	str	w8, [sp, #0xc]
  f72cc0: 97c2866a     	bl	0x14668 <_ChromeMain+0xf3cc>
  f72cc4: b9400fe8     	ldr	w8, [sp, #0xc]
  f72cc8: 17ffffcd     	b	0xf72bfc <_ChromeMain+0xf6d960>
  f72ccc: aa0803f8     	mov	x24, x8
  f72cd0: 97c28666     	bl	0x14668 <_ChromeMain+0xf3cc>
  f72cd4: aa1803e8     	mov	x8, x24
  f72cd8: 17ffffe7     	b	0xf72c74 <_ChromeMain+0xf6d9d8>
