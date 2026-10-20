
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41f6200: f9434261     	ldr	x1, [x19, #0x680]
 41f6204: f90017e0     	str	x0, [sp, #0x28]
 41f6208: aa1403e2     	mov	x2, x20
 41f620c: 97a65bd2     	bl	0x2b8d154 <_ChromeMain+0x2b87eb8>
 41f6210: 97281437     	bl	0xbfb2ec <_ChromeMain+0xbf6050>
 41f6214: aa0003f4     	mov	x20, x0
 41f6218: f9433e68     	ldr	x8, [x19, #0x678]
 41f621c: 9100a109     	add	x9, x8, #0x28
 41f6220: f100011f     	cmp	x8, #0x0
 41f6224: 9a8903e9     	csel	x9, xzr, x9, eq
 41f6228: f940b128     	ldr	x8, [x9, #0x160]
 41f622c: b40002e8     	cbz	x8, 0x41f6288 <_ChromeMain+0x41f0fec>
 41f6230: 91058129     	add	x9, x9, #0x160
 41f6234: b005358a     	adrp	x10, 0xe8a7000 <dyld_stub_binder+0xe8a7000>
 41f6238: 9125c14a     	add	x10, x10, #0x970
 41f623c: 1400000d     	b	0x41f6270 <_ChromeMain+0x41f0fd4>
 41f6240: eb09011f     	cmp	x8, x9
 41f6244: 54000220     	b.eq	0x41f6288 <_ChromeMain+0x41f0fec>
 41f6248: f9401515     	ldr	x21, [x8, #0x28]
 41f624c: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 41f6250: f9404709     	ldr	x9, [x24, #0x88]
 41f6254: eb09011f     	cmp	x8, x9
 41f6258: 540001a1     	b.ne	0x41f628c <_ChromeMain+0x41f0ff0>
 41f625c: aa1503e0     	mov	x0, x21
 41f6260: 96f87827     	bl	0x142fc <_ChromeMain+0xf060>
 41f6264: 1400000a     	b	0x41f628c <_ChromeMain+0x41f0ff0>
 41f6268: f9400108     	ldr	x8, [x8]
 41f626c: b40000e8     	cbz	x8, 0x41f6288 <_ChromeMain+0x41f0fec>
 41f6270: f940110b     	ldr	x11, [x8, #0x20]
 41f6274: eb0a017f     	cmp	x11, x10
 41f6278: 54ffff88     	b.hi	0x41f6268 <_ChromeMain+0x41f0fcc>
 41f627c: 54fffe20     	b.eq	0x41f6240 <_ChromeMain+0x41f0fa4>
 41f6280: f9400508     	ldr	x8, [x8, #0x8]
 41f6284: b5ffff68     	cbnz	x8, 0x41f6270 <_ChromeMain+0x41f0fd4>
 41f6288: d2800015     	mov	x21, #0x0               ; =0
 41f628c: f90023fc     	str	x28, [sp, #0x40]
 41f6290: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 41f6294: f9404709     	ldr	x9, [x24, #0x88]
 41f6298: eb09011f     	cmp	x8, x9
 41f629c: 54000061     	b.ne	0x41f62a8 <_ChromeMain+0x41f100c>
 41f62a0: aa1503e0     	mov	x0, x21
 41f62a4: 96f8b1e6     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41f62a8: d2800296     	mov	x22, #0x14              ; =20
 41f62ac: f2c00036     	movk	x22, #0x1, lsl #32
 41f62b0: f94002a2     	ldr	x2, [x21]
 41f62b4: aa1403e0     	mov	x0, x20
 41f62b8: 528025c1     	mov	w1, #0x12e              ; =302
 41f62bc: 972813b4     	bl	0xbfb18c <_ChromeMain+0xbf5ef0>
 41f62c0: b5015460     	cbnz	x0, 0x41f8d4c <_ChromeMain+0x41f3ab0>
