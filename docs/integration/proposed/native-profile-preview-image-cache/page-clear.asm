
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4655368: f941dec8     	ldr	x8, [x22, #0x3b8]
 465536c: b4ffea68     	cbz	x8, 0x46550b8 <_ChromeMain+0x464fe1c>
 4655370: f9418ac0     	ldr	x0, [x22, #0x310]
 4655374: f9003bff     	str	xzr, [sp, #0x70]
 4655378: 2f06e400     	movi	d0, #0xffff000000000000
 465537c: fd003fe0     	str	d0, [sp, #0x78]
 4655380: 52800028     	mov	w8, #0x1                ; =1
 4655384: 390203e8     	strb	w8, [sp, #0x80]
 4655388: f90047ff     	str	xzr, [sp, #0x88]
 465538c: 390243ff     	strb	wzr, [sp, #0x90]
 4655390: 9101c3e1     	add	x1, sp, #0x70
 4655394: 96fd2f43     	bl	0x5a10a0 <_ChromeMain+0x59be04>
 4655398: 9101c3e0     	add	x0, sp, #0x70
 465539c: 9707c529     	bl	0x846840 <_ChromeMain+0x8415a4>
 46553a0: f9418ac0     	ldr	x0, [x22, #0x310]
 46553a4: f9400008     	ldr	x8, [x0]
 46553a8: f9405108     	ldr	x8, [x8, #0xa0]
 46553ac: 52800001     	mov	w1, #0x0                ; =0
 46553b0: d63f0100     	blr	x8
 46553b4: f9419ac0     	ldr	x0, [x22, #0x330]
 46553b8: f9400008     	ldr	x8, [x0]
 46553bc: f9405108     	ldr	x8, [x8, #0xa0]
 46553c0: 52800001     	mov	w1, #0x0                ; =0
 46553c4: d63f0100     	blr	x8
 46553c8: 17fffeb2     	b	0x4654e90 <_ChromeMain+0x464fbf4>
