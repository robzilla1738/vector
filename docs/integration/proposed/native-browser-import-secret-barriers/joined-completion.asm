
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4258c60: 52800028     	mov	w8, #0x1                ; =1
 4258c64: 39004408     	strb	w8, [x0, #0x11]
 4258c68: 14000006     	b	0x4258c80 <_ChromeMain+0x42539e4>
 4258c6c: 52800028     	mov	w8, #0x1                ; =1
 4258c70: 39004808     	strb	w8, [x0, #0x12]
 4258c74: 14000003     	b	0x4258c80 <_ChromeMain+0x42539e4>
		...
 4258c80: d10203ff     	sub	sp, sp, #0x80
 4258c84: a9045ff8     	stp	x24, x23, [sp, #0x40]
 4258c88: a90557f6     	stp	x22, x21, [sp, #0x50]
 4258c8c: a9064ff4     	stp	x20, x19, [sp, #0x60]
 4258c90: a9077bfd     	stp	x29, x30, [sp, #0x70]
 4258c94: 9101c3fd     	add	x29, sp, #0x70
 4258c98: 39404408     	ldrb	w8, [x0, #0x11]
 4258c9c: 34000cc8     	cbz	w8, 0x4258e34 <_ChromeMain+0x4253b98>
 4258ca0: aa0003f4     	mov	x20, x0
 4258ca4: 39404808     	ldrb	w8, [x0, #0x12]
 4258ca8: 34000c68     	cbz	w8, 0x4258e34 <_ChromeMain+0x4253b98>
 4258cac: 3900429f     	strb	wzr, [x20, #0x10]
 4258cb0: f9403e93     	ldr	x19, [x20, #0x78]
 4258cb4: b40001b3     	cbz	x19, 0x4258ce8 <_ChromeMain+0x4253a4c>
 4258cb8: f9003e9f     	str	xzr, [x20, #0x78]
 4258cbc: f9400668     	ldr	x8, [x19, #0x8]
 4258cc0: aa1303e0     	mov	x0, x19
 4258cc4: 52800021     	mov	w1, #0x1                ; =1
 4258cc8: d63f0100     	blr	x8
 4258ccc: 12800008     	mov	w8, #-0x1               ; =-1
 4258cd0: b8e80268     	ldaddal	w8, w8, [x19]
 4258cd4: 7100051f     	cmp	w8, #0x1
 4258cd8: 54000081     	b.ne	0x4258ce8 <_ChromeMain+0x4253a4c>
 4258cdc: f9400a68     	ldr	x8, [x19, #0x10]
 4258ce0: aa1303e0     	mov	x0, x19
 4258ce4: d63f0100     	blr	x8
 4258ce8: 39404e88     	ldrb	w8, [x20, #0x13]
