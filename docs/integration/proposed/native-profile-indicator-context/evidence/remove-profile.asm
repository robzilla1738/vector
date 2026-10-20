
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 40ff250: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 40ff254: a9014ff4     	stp	x20, x19, [sp, #0x10]
 40ff258: a9027bfd     	stp	x29, x30, [sp, #0x20]
 40ff25c: 910083fd     	add	x29, sp, #0x20
 40ff260: aa0203f3     	mov	x19, x2
 40ff264: aa0003f4     	mov	x20, x0
 40ff268: f0056f28     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 40ff26c: f9467d00     	ldr	x0, [x8, #0xcf8]
 40ff270: b4000120     	cbz	x0, 0x40ff294 <_ChromeMain+0x40f9ff8>
 40ff274: aa0103f6     	mov	x22, x1
 40ff278: 97648240     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 40ff27c: b40000c0     	cbz	x0, 0x40ff294 <_ChromeMain+0x40f9ff8>
 40ff280: aa0003f5     	mov	x21, x0
 40ff284: aa1603e0     	mov	x0, x22
 40ff288: aa1403e1     	mov	x1, x20
 40ff28c: 97ffff90     	bl	0x40ff0cc <_ChromeMain+0x40f9e30>
 40ff290: 37000280     	tbnz	w0, #0x0, 0x40ff2e0 <_ChromeMain+0x40fa044>
 40ff294: b40001f3     	cbz	x19, 0x40ff2d0 <_ChromeMain+0x40fa034>
 40ff298: f9400668     	ldr	x8, [x19, #0x8]
 40ff29c: aa1303e0     	mov	x0, x19
 40ff2a0: d2800001     	mov	x1, #0x0                ; =0
 40ff2a4: d63f0100     	blr	x8
 40ff2a8: 12800008     	mov	w8, #-0x1               ; =-1
 40ff2ac: b8e80268     	ldaddal	w8, w8, [x19]
 40ff2b0: 7100051f     	cmp	w8, #0x1
 40ff2b4: 540000e1     	b.ne	0x40ff2d0 <_ChromeMain+0x40fa034>
 40ff2b8: f9400a61     	ldr	x1, [x19, #0x10]
 40ff2bc: aa1303e0     	mov	x0, x19
 40ff2c0: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 40ff2c4: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 40ff2c8: a8c357f6     	ldp	x22, x21, [sp], #0x30
 40ff2cc: d61f0020     	br	x1
 40ff2d0: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 40ff2d4: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 40ff2d8: a8c357f6     	ldp	x22, x21, [sp], #0x30
 40ff2dc: d65f03c0     	ret
 40ff2e0: b50001d3     	cbnz	x19, 0x40ff318 <_ChromeMain+0x40fa07c>
 40ff2e4: 52800500     	mov	w0, #0x28               ; =40
 40ff2e8: 96fc4020     	bl	0xf368 <_ChromeMain+0xa0cc>
 40ff2ec: aa0003f3     	mov	x19, x0
 40ff2f0: 52800028     	mov	w8, #0x1                ; =1
 40ff2f4: f0fdf889     	adrp	x9, 0x12000 <_ChromeMain+0xcd64>
 40ff2f8: 91370129     	add	x9, x9, #0xdc0
 40ff2fc: 90fe790a     	adrp	x10, 0x101f000 <_ChromeMain+0x1019d64>
 40ff300: 9118014a     	add	x10, x10, #0x600
 40ff304: b9000008     	str	w8, [x0]
 40ff308: a900a809     	stp	x9, x10, [x0, #0x8]
 40ff30c: d0ff22e8     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 40ff310: 912c0108     	add	x8, x8, #0xb00
 40ff314: f9000c08     	str	x8, [x0, #0x18]
 40ff318: f94052a0     	ldr	x0, [x21, #0xa0]
 40ff31c: aa1403e1     	mov	x1, x20
 40ff320: aa1303e2     	mov	x2, x19
 40ff324: 52800023     	mov	w3, #0x1                ; =1
 40ff328: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 40ff32c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 40ff330: a8c357f6     	ldp	x22, x21, [sp], #0x30
 40ff334: 14e72829     	b	0x7ac93d8 <_ChromeMain+0x7ac413c>
