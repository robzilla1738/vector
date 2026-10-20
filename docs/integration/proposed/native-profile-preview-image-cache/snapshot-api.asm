
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 a24bc40: d10543ff     	sub	sp, sp, #0x150
 a24bc44: 6d0e2beb     	stp	d11, d10, [sp, #0xe0]
 a24bc48: 6d0f23e9     	stp	d9, d8, [sp, #0xf0]
 a24bc4c: a91067fa     	stp	x26, x25, [sp, #0x100]
 a24bc50: a9115ff8     	stp	x24, x23, [sp, #0x110]
 a24bc54: a91257f6     	stp	x22, x21, [sp, #0x120]
 a24bc58: a9134ff4     	stp	x20, x19, [sp, #0x130]
 a24bc5c: a9147bfd     	stp	x29, x30, [sp, #0x140]
 a24bc60: 910503fd     	add	x29, sp, #0x140
 a24bc64: aa0103f3     	mov	x19, x1
 a24bc68: aa0003f4     	mov	x20, x0
 a24bc6c: f90017e2     	str	x2, [sp, #0x28]
 a24bc70: 94a4fca1     	bl	0xcb8aef4 <_ChromeMain+0xcb85c58>
 a24bc74: aa0003f5     	mov	x21, x0
 a24bc78: 52848e08     	mov	w8, #0x2470             ; =9328
 a24bc7c: 72a00048     	movk	w8, #0x2, lsl #16
 a24bc80: 6b08001f     	cmp	w0, w8
 a24bc84: 5400040b     	b.lt	0xa24bd04 <_ChromeMain+0xa246a68>
 a24bc88: 52893de8     	mov	w8, #0x49ef             ; =18927
 a24bc8c: 72a00048     	movk	w8, #0x2, lsl #16
 a24bc90: 6b0802bf     	cmp	w21, w8
 a24bc94: 54000348     	b.hi	0xa24bcfc <_ChromeMain+0xa246a60>
 a24bc98: d0025508     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 a24bc9c: f9450518     	ldr	x24, [x8, #0xa08]
 a24bca0: d503201f     	nop
 a24bca4: f9433900     	ldr	x0, [x8, #0x670]
 a24bca8: 94a5b9c6     	bl	0xcbba3c0 <dyld_stub_binder+0xcbba3c0>
 a24bcac: 94a5a6b7     	bl	0xcbb5788 <dyld_stub_binder+0xcbb5788>
 a24bcb0: aa0003f6     	mov	x22, x0
 a24bcb4: 94a5b9bb     	bl	0xcbba3a0 <dyld_stub_binder+0xcbba3a0>
 a24bcb8: 94a5a6b4     	bl	0xcbb5788 <dyld_stub_binder+0xcbb5788>
 a24bcbc: aa0003f7     	mov	x23, x0
 a24bcc0: aa1803e0     	mov	x0, x24
 a24bcc4: aa1703e2     	mov	x2, x23
 a24bcc8: 94a5d6fe     	bl	0xcbc18c0 <dyld_stub_binder+0xcbc18c0>
 a24bccc: 94a5a6af     	bl	0xcbb5788 <dyld_stub_binder+0xcbb5788>
 a24bcd0: aa0003f8     	mov	x24, x0
 a24bcd4: 94a5ba4b     	bl	0xcbba600 <dyld_stub_binder+0xcbba600>
 a24bcd8: aa0003f9     	mov	x25, x0
 a24bcdc: aa1803e0     	mov	x0, x24
 a24bce0: 94a5a5db     	bl	0xcbb544c <dyld_stub_binder+0xcbb544c>
 a24bce4: aa1703e0     	mov	x0, x23
 a24bce8: 94a5a5d9     	bl	0xcbb544c <dyld_stub_binder+0xcbb544c>
 a24bcec: aa1603e0     	mov	x0, x22
 a24bcf0: 94a5a5d7     	bl	0xcbb544c <dyld_stub_binder+0xcbb544c>
 a24bcf4: f100073f     	cmp	x25, #0x1
 a24bcf8: 54000068     	b.hi	0xa24bd04 <_ChromeMain+0xa246a68>
 a24bcfc: 52800036     	mov	w22, #0x1               ; =1
 a24bd00: 14000002     	b	0xa24bd08 <_ChromeMain+0xa246a6c>
 a24bd04: 52800016     	mov	w22, #0x0               ; =0
 a24bd08: 52800020     	mov	w0, #0x1                ; =1
 a24bd0c: 528001c1     	mov	w1, #0xe                ; =14
 a24bd10: 52800082     	mov	w2, #0x4                ; =4
 a24bd14: 52800003     	mov	w3, #0x0                ; =0
 a24bd18: 94a4e15c     	bl	0xcb84288 <_ChromeMain+0xcb7efec>
 a24bd1c: 529ef408     	mov	w8, #0xf7a0             ; =63392
 a24bd20: 72a00068     	movk	w8, #0x3, lsl #16
 a24bd24: 520002c9     	eor	w9, w22, #0x1
 a24bd28: 6b0802bf     	cmp	w21, w8
 a24bd2c: 1a89a3e8     	csel	w8, wzr, w9, ge
 a24bd30: 37000aa8     	tbnz	w8, #0x0, 0xa24be84 <_ChromeMain+0xa246be8>
 a24bd34: 34000a80     	cbz	w0, 0xa24be84 <_ChromeMain+0xa246be8>
 a24bd38: 910083e0     	add	x0, sp, #0x20
 a24bd3c: aa1403e1     	mov	x1, x20
 a24bd40: 9660150b     	bl	0x3a5116c <_ChromeMain+0x3a4bed0>
 a24bd44: f94017e8     	ldr	x8, [sp, #0x28]
 a24bd48: f90017ff     	str	xzr, [sp, #0x28]
 a24bd4c: f81903a8     	stur	x8, [x29, #-0x70]
 a24bd50: 910083e0     	add	x0, sp, #0x20
 a24bd54: 96749743     	bl	0x3f71a60 <_ChromeMain+0x3f6c7c4>
 a24bd58: 94a5a68c     	bl	0xcbb5788 <dyld_stub_binder+0xcbb5788>
 a24bd5c: aa0003f4     	mov	x20, x0
 a24bd60: 94a5c998     	bl	0xcbbe3c0 <dyld_stub_binder+0xcbbe3c0>
 a24bd64: 94a5a689     	bl	0xcbb5788 <dyld_stub_binder+0xcbb5788>
 a24bd68: aa0003f6     	mov	x22, x0
 a24bd6c: 94a5cd35     	bl	0xcbbf240 <dyld_stub_binder+0xcbbf240>
 a24bd70: aa0003f5     	mov	x21, x0
 a24bd74: aa1603e0     	mov	x0, x22
 a24bd78: 94a5a5b5     	bl	0xcbb544c <dyld_stub_binder+0xcbb544c>
 a24bd7c: 910203f7     	add	x23, sp, #0x80
 a24bd80: a9085fff     	stp	xzr, x23, [sp, #0x80]
 a24bd84: 90fcf0a8     	adrp	x8, 0x405f000 <_ChromeMain+0x4059d64>
 a24bd88: 91286108     	add	x8, x8, #0xa18
 a24bd8c: d2a24009     	mov	x9, #0x12000000         ; =301989888
 a24bd90: f2c00709     	movk	x9, #0x38, lsl #32
 a24bd94: b0fe846a     	adrp	x10, 0x72d8000 <_ChromeMain+0x72d2d64>
 a24bd98: 9130814a     	add	x10, x10, #0xc20
 a24bd9c: d001accb     	adrp	x11, 0xd7e5000 <dyld_stub_binder+0xd7e5000>
 a24bda0: 9129916b     	add	x11, x11, #0xa64
 a24bda4: a90923e9     	stp	x9, x8, [sp, #0x90]
 a24bda8: a90a2fea     	stp	x10, x11, [sp, #0xa0]
 a24bdac: f85903a8     	ldur	x8, [x29, #-0x70]
 a24bdb0: f9005be8     	str	x8, [sp, #0xb0]
 a24bdb4: f81903bf     	stur	xzr, [x29, #-0x70]
 a24bdb8: aa1403e0     	mov	x0, x20
 a24bdbc: 94a5bb69     	bl	0xcbbab60 <dyld_stub_binder+0xcbbab60>
 a24bdc0: aa1403e0     	mov	x0, x20
 a24bdc4: d2800002     	mov	x2, #0x0                ; =0
 a24bdc8: 94a5cb9e     	bl	0xcbbec40 <dyld_stub_binder+0xcbbec40>
 a24bdcc: 4ea01c08     	mov.16b	v8, v0
 a24bdd0: 4ea11c29     	mov.16b	v9, v1
 a24bdd4: 4ea31c6a     	mov.16b	v10, v3
 a24bdd8: aa1403e0     	mov	x0, x20
 a24bddc: 94a5c979     	bl	0xcbbe3c0 <dyld_stub_binder+0xcbbe3c0>
 a24bde0: 94a5a66a     	bl	0xcbb5788 <dyld_stub_binder+0xcbb5788>
 a24bde4: aa0003f6     	mov	x22, x0
 a24bde8: 94a5bb46     	bl	0xcbbab00 <dyld_stub_binder+0xcbbab00>
 a24bdec: 4ea31c6b     	mov.16b	v11, v3
 a24bdf0: aa1603e0     	mov	x0, x22
 a24bdf4: 94a5a596     	bl	0xcbb544c <dyld_stub_binder+0xcbb544c>
 a24bdf8: aa1303e0     	mov	x0, x19
 a24bdfc: 9682a52c     	bl	0x42f52ac <_ChromeMain+0x42f0010>
 a24be00: 1e693964     	fsub	d4, d11, d9
 a24be04: 1e6a3885     	fsub	d5, d4, d10
 a24be08: 4ea81d04     	mov.16b	v4, v8
 a24be0c: 94a5b5fe     	bl	0xcbb9604 <dyld_stub_binder+0xcbb9604>
 a24be10: d0025508     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 a24be14: f9434900     	ldr	x0, [x8, #0x690]
 a24be18: b001eee8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 a24be1c: f9454108     	ldr	x8, [x8, #0xa80]
 a24be20: 52b84009     	mov	w9, #-0x3e000000        ; =-1040187392
 a24be24: 1000194a     	adr	x10, 0xa24c14c <_ChromeMain+0xa246eb0>
 a24be28: d503201f     	nop
 a24be2c: a90327e8     	stp	x8, x9, [sp, #0x30]
 a24be30: 90023c48     	adrp	x8, 0xe9d3000 <dyld_stub_binder+0xe9d3000>
 a24be34: 91274108     	add	x8, x8, #0x9d0
 a24be38: a90423ea     	stp	x10, x8, [sp, #0x40]
 a24be3c: 910203e8     	add	x8, sp, #0x80
 a24be40: a90557e8     	stp	x8, x21, [sp, #0x50]
 a24be44: 6d0607e0     	stp	d0, d1, [sp, #0x60]
 a24be48: 6d070fe2     	stp	d2, d3, [sp, #0x70]
 a24be4c: 9100c3e2     	add	x2, sp, #0x30
 a24be50: 94a61114     	bl	0xcbd02a0 <dyld_stub_binder+0xcbd02a0>
 a24be54: 910203e0     	add	x0, sp, #0x80
 a24be58: 52800101     	mov	w1, #0x8                ; =8
 a24be5c: 94a5a9c6     	bl	0xcbb6574 <dyld_stub_binder+0xcbb6574>
 a24be60: 9100c2e0     	add	x0, x23, #0x30
 a24be64: 94a4e439     	bl	0xcb84f48 <_ChromeMain+0xcb7fcac>
 a24be68: aa1403e0     	mov	x0, x20
 a24be6c: 94a5a578     	bl	0xcbb544c <dyld_stub_binder+0xcbb544c>
 a24be70: d101c3a0     	sub	x0, x29, #0x70
 a24be74: 94a4e435     	bl	0xcb84f48 <_ChromeMain+0xcb7fcac>
 a24be78: 910083e0     	add	x0, sp, #0x20
 a24be7c: 96200de2     	bl	0x2a4f604 <_ChromeMain+0x2a4a368>
 a24be80: 1400007d     	b	0xa24c074 <_ChromeMain+0xa246dd8>
 a24be84: f9000fff     	str	xzr, [sp, #0x18]
 a24be88: 910043e0     	add	x0, sp, #0x10
 a24be8c: aa1403e1     	mov	x1, x20
 a24be90: 966014b7     	bl	0x3a5116c <_ChromeMain+0x3a4bed0>
 a24be94: 910043e0     	add	x0, sp, #0x10
 a24be98: 967496f2     	bl	0x3f71a60 <_ChromeMain+0x3f6c7c4>
 a24be9c: 94a5a63b     	bl	0xcbb5788 <dyld_stub_binder+0xcbb5788>
 a24bea0: aa0003f4     	mov	x20, x0
 a24bea4: 94a5c947     	bl	0xcbbe3c0 <dyld_stub_binder+0xcbbe3c0>
 a24bea8: 94a5a638     	bl	0xcbb5788 <dyld_stub_binder+0xcbb5788>
 a24beac: aa0003f5     	mov	x21, x0
 a24beb0: d0025508     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 a24beb4: f9446500     	ldr	x0, [x8, #0x8c8]
 a24beb8: 94a5cffa     	bl	0xcbbfea0 <dyld_stub_binder+0xcbbfea0>
 a24bebc: 94a5a633     	bl	0xcbb5788 <dyld_stub_binder+0xcbb5788>
