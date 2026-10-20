
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45740dc: aa1803e0     	mov	x0, x24
 45740e0: aa1703e1     	mov	x1, x23
 45740e4: 9752af07     	bl	0x1a1fd00 <_ChromeMain+0x1a1aa64>
 45740e8: b4ffff40     	cbz	x0, 0x45740d0 <_ChromeMain+0x456ee34>
 45740ec: aa0003fc     	mov	x28, x0
 45740f0: 39418008     	ldrb	w8, [x0, #0x60]
 45740f4: 3707fee8     	tbnz	w8, #0x0, 0x45740d0 <_ChromeMain+0x456ee34>
 45740f8: d102c3a1     	sub	x1, x29, #0xb0
 45740fc: aa1703e0     	mov	x0, x23
 4574100: 972d6001     	bl	0x10cc104 <_ChromeMain+0x10c6e68>
 4574104: aa0003fb     	mov	x27, x0
 4574108: 37000060     	tbnz	w0, #0x0, 0x4574114 <_ChromeMain+0x456ee78>
 457410c: b9402fe8     	ldr	w8, [sp, #0x2c]
 4574110: 35fffe08     	cbnz	w8, 0x45740d0 <_ChromeMain+0x456ee34>
 4574114: 35ffd8db     	cbnz	w27, 0x4573c2c <_ChromeMain+0x456e990>
 4574118: f94007e0     	ldr	x0, [sp, #0x8]
 457411c: aa1703e1     	mov	x1, x23
 4574120: 9788c561     	bl	0x27a56a4 <_ChromeMain+0x27a0408>
 4574124: aa0003fa     	mov	x26, x0
 4574128: 6f00e400     	movi.2d	v0, #0000000000000000
 457412c: ad3883a0     	stp	q0, q0, [x29, #-0xf0]
 4574130: f81303bf     	stur	xzr, [x29, #-0xd0]
 4574134: 52bfffe8     	mov	w8, #-0x10000           ; =-65536
 4574138: b811c3a8     	stur	w8, [x29, #-0xe4]
 457413c: 381203b9     	sturb	w25, [x29, #-0xe0]
 4574140: 381303bf     	sturb	wzr, [x29, #-0xd0]
 4574144: 9106c3e8     	add	x8, sp, #0x1b0
 4574148: aa1c03e0     	mov	x0, x28
 457414c: 52800281     	mov	w1, #0x14               ; =20
 4574150: 52800022     	mov	w2, #0x1                ; =1
 4574154: f0048b63     	adrp	x3, 0xd6e3000 <dyld_stub_binder+0xd6e3000>
 4574158: 9102b063     	add	x3, x3, #0xac
 457415c: 97873ca6     	bl	0x27433f4 <_ChromeMain+0x273e158>
 4574160: f940dbe8     	ldr	x8, [sp, #0x1b0]
 4574164: f9007be8     	str	x8, [sp, #0xf0]
 4574168: 910443e8     	add	x8, sp, #0x110
 457416c: 9103c3e0     	add	x0, sp, #0xf0
 4574170: 52800281     	mov	w1, #0x14               ; =20
 4574174: 52800282     	mov	w2, #0x14               ; =20
 4574178: 52800003     	mov	w3, #0x0                ; =0
 457417c: 974aaf51     	bl	0x181fec0 <_ChromeMain+0x181ac24>
 4574180: f9408be8     	ldr	x8, [sp, #0x110]
 4574184: f900dbe8     	str	x8, [sp, #0x1b0]
 4574188: b40000a8     	cbz	x8, 0x457419c <_ChromeMain+0x456ef00>
 457418c: b9400109     	ldr	w9, [x8]
 4574190: 31000529     	adds	w9, w9, #0x1
 4574194: b9000109     	str	w9, [x8]
 4574198: 54000ee2     	b.hs	0x4574374 <_ChromeMain+0x456f0d8>
 457419c: 52800035     	mov	w21, #0x1               ; =1
 45741a0: 390743f9     	strb	w25, [sp, #0x1d0]
 45741a4: d103c3a0     	sub	x0, x29, #0xf0
 45741a8: 9106c3e1     	add	x1, sp, #0x1b0
 45741ac: 97131627     	bl	0xa39a48 <_ChromeMain+0xa347ac>
 45741b0: 9106c3e0     	add	x0, sp, #0x1b0
 45741b4: 970b49a3     	bl	0x846840 <_ChromeMain+0x8415a4>
 45741b8: f9408bf9     	ldr	x25, [sp, #0x110]
 45741bc: b40000d9     	cbz	x25, 0x45741d4 <_ChromeMain+0x456ef38>
 45741c0: b9400329     	ldr	w9, [x25]
 45741c4: 51000528     	sub	w8, w9, #0x1
 45741c8: b9000328     	str	w8, [x25]
 45741cc: 34000da9     	cbz	w9, 0x4574380 <_ChromeMain+0x456f0e4>
 45741d0: 34000548     	cbz	w8, 0x4574278 <_ChromeMain+0x456efdc>
 45741d4: f9407bf9     	ldr	x25, [sp, #0xf0]
 45741d8: b40000d9     	cbz	x25, 0x45741f0 <_ChromeMain+0x456ef54>
 45741dc: b9400329     	ldr	w9, [x25]
 45741e0: 51000528     	sub	w8, w9, #0x1
 45741e4: b9000328     	str	w8, [x25]
 45741e8: 34000d29     	cbz	w9, 0x457438c <_ChromeMain+0x456f0f0>
 45741ec: 34000588     	cbz	w8, 0x457429c <_ChromeMain+0x456f000>
 45741f0: 52800019     	mov	w25, #0x0               ; =0
