
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46550b8: f9418ad8     	ldr	x24, [x22, #0x310]
 46550bc: d101a3a0     	sub	x0, x29, #0x68
 46550c0: 910143e1     	add	x1, sp, #0x50
 46550c4: 97096d41     	bl	0x8b05c8 <_ChromeMain+0x8ab32c>
 46550c8: f85983b9     	ldur	x25, [x29, #-0x68]
 46550cc: f9003bf9     	str	x25, [sp, #0x70]
 46550d0: b4001ed9     	cbz	x25, 0x46554a8 <_ChromeMain+0x465020c>
 46550d4: b9400328     	ldr	w8, [x25]
 46550d8: 31000509     	adds	w9, w8, #0x1
 46550dc: b9000329     	str	w9, [x25]
 46550e0: 54002922     	b.hs	0x4655604 <_ChromeMain+0x4650368>
 46550e4: 52800029     	mov	w9, #0x1                ; =1
 46550e8: 390243e9     	strb	w9, [sp, #0x90]
 46550ec: b9000328     	str	w8, [x25]
 46550f0: 34001e28     	cbz	w8, 0x46554b4 <_ChromeMain+0x4650218>
 46550f4: 9101c3e1     	add	x1, sp, #0x70
 46550f8: aa1803e0     	mov	x0, x24
 46550fc: 96fd2fe9     	bl	0x5a10a0 <_ChromeMain+0x59be04>
 4655100: 9101c3e0     	add	x0, sp, #0x70
 4655104: 9707c5cf     	bl	0x846840 <_ChromeMain+0x8415a4>
 4655108: f9418ac0     	ldr	x0, [x22, #0x310]
 465510c: f9400008     	ldr	x8, [x0]
 4655110: f9405108     	ldr	x8, [x8, #0xa0]
 4655114: 52800021     	mov	w1, #0x1                ; =1
 4655118: d63f0100     	blr	x8
 465511c: f9419ac0     	ldr	x0, [x22, #0x330]
 4655120: f9400008     	ldr	x8, [x0]
 4655124: f9405108     	ldr	x8, [x8, #0xa0]
 4655128: 52800001     	mov	w1, #0x0                ; =0
 465512c: d63f0100     	blr	x8
 4655130: aa1603e0     	mov	x0, x22
 4655134: 52800001     	mov	w1, #0x0                ; =0
 4655138: 96ff6ccf     	bl	0x630474 <_ChromeMain+0x62b1d8>
 465513c: aa1603e0     	mov	x0, x22
 4655140: 96fd300f     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4655144: 17ffff53     	b	0x4654e90 <_ChromeMain+0x464fbf4>
