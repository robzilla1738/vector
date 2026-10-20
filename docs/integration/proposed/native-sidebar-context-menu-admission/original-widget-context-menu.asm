
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45bb30c: d102c3ff     	sub	sp, sp, #0xb0
 45bb310: a90667fa     	stp	x26, x25, [sp, #0x60]
 45bb314: a9075ff8     	stp	x24, x23, [sp, #0x70]
 45bb318: a90857f6     	stp	x22, x21, [sp, #0x80]
 45bb31c: a9094ff4     	stp	x20, x19, [sp, #0x90]
 45bb320: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 45bb324: 910283fd     	add	x29, sp, #0xa0
 45bb328: aa0303f3     	mov	x19, x3
 45bb32c: aa0203f4     	mov	x20, x2
 45bb330: aa0103f5     	mov	x21, x1
 45bb334: aa0003f6     	mov	x22, x0
 45bb338: b0054a68     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 45bb33c: f9401900     	ldr	x0, [x8, #0x30]
 45bb340: f0047481     	adrp	x1, 0xd44e000 <dyld_stub_binder+0xd44e000>
 45bb344: 91041421     	add	x1, x1, #0x105
 45bb348: 96f0e88d     	bl	0x1f557c <_ChromeMain+0x1f02e0>
 45bb34c: 370002a0     	tbnz	w0, #0x0, 0x45bb3a0 <_ChromeMain+0x45b6104>
 45bb350: f941c6c8     	ldr	x8, [x22, #0x388]
 45bb354: f9429d08     	ldr	x8, [x8, #0x538]
 45bb358: b9406108     	ldr	w8, [x8, #0x60]
 45bb35c: 7100151f     	cmp	w8, #0x5
 45bb360: 54000200     	b.eq	0x45bb3a0 <_ChromeMain+0x45b6104>
 45bb364: b40001f5     	cbz	x21, 0x45bb3a0 <_ChromeMain+0x45b6104>
 45bb368: b943aac8     	ldr	w8, [x22, #0x3a8]
 45bb36c: 350001a8     	cbnz	w8, 0x45bb3a0 <_ChromeMain+0x45b6104>
 45bb370: f94002a8     	ldr	x8, [x21]
 45bb374: f9403508     	ldr	x8, [x8, #0x68]
 45bb378: aa1503e0     	mov	x0, x21
 45bb37c: d63f0100     	blr	x8
 45bb380: b4000100     	cbz	x0, 0x45bb3a0 <_ChromeMain+0x45b6104>
 45bb384: f941cec8     	ldr	x8, [x22, #0x398]
 45bb388: b40001a8     	cbz	x8, 0x45bb3bc <_ChromeMain+0x45b6120>
 45bb38c: f9400500     	ldr	x0, [x8, #0x8]
 45bb390: f9400008     	ldr	x8, [x0]
 45bb394: f9400108     	ldr	x8, [x8]
 45bb398: d63f0100     	blr	x8
 45bb39c: 36000100     	tbz	w0, #0x0, 0x45bb3bc <_ChromeMain+0x45b6120>
 45bb3a0: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 45bb3a4: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 45bb3a8: a94857f6     	ldp	x22, x21, [sp, #0x80]
 45bb3ac: a9475ff8     	ldp	x24, x23, [sp, #0x70]
 45bb3b0: a94667fa     	ldp	x26, x25, [sp, #0x60]
 45bb3b4: 9102c3ff     	add	sp, sp, #0xb0
 45bb3b8: d65f03c0     	ret
 45bb3bc: aa1603e0     	mov	x0, x22
 45bb3c0: 95fffcf9     	bl	0xc5ba7a4 <_ChromeMain+0xc5b5508>
 45bb3c4: aa0003f8     	mov	x24, x0
 45bb3c8: 925e76c8     	and	x8, x22, #0xfffffffc00000000
 45bb3cc: f0052fba     	adrp	x26, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45bb3d0: f9404749     	ldr	x9, [x26, #0x88]
 45bb3d4: eb09011f     	cmp	x8, x9
 45bb3d8: 54000061     	b.ne	0x45bb3e4 <_ChromeMain+0x45b6148>
 45bb3dc: aa1603e0     	mov	x0, x22
 45bb3e0: 96e963c7     	bl	0x142fc <_ChromeMain+0xf060>
 45bb3e4: 52800700     	mov	w0, #0x38               ; =56
 45bb3e8: 96e94fe0     	bl	0xf368 <_ChromeMain+0xa0cc>
 45bb3ec: aa0003f9     	mov	x25, x0
 45bb3f0: 52800028     	mov	w8, #0x1                ; =1
 45bb3f4: b9000008     	str	w8, [x0]
 45bb3f8: d0ffcbe8     	adrp	x8, 0x3f39000 <_ChromeMain+0x3f33d64>
 45bb3fc: 913a0108     	add	x8, x8, #0xe80
 45bb400: d0ff96e9     	adrp	x9, 0x3899000 <_ChromeMain+0x3893d64>
 45bb404: 912d0129     	add	x9, x9, #0xb40
 45bb408: a900a408     	stp	x8, x9, [x0, #0x8]
 45bb40c: d0fefd08     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 45bb410: 912c0108     	add	x8, x8, #0xb00
 45bb414: f0040dc9     	adrp	x9, 0xc776000 <_ChromeMain+0xc770d64>
 45bb418: 912f6129     	add	x9, x9, #0xbd8
 45bb41c: a901a408     	stp	x8, x9, [x0, #0x18]
 45bb420: a902d81f     	stp	xzr, x22, [x0, #0x28]
 45bb424: 52800300     	mov	w0, #0x18               ; =24
 45bb428: 96e94fd0     	bl	0xf368 <_ChromeMain+0xa0cc>
 45bb42c: aa0003f7     	mov	x23, x0
 45bb430: 52800128     	mov	w8, #0x9                ; =9
 45bb434: b9000008     	str	w8, [x0]
 45bb438: aa1803e0     	mov	x0, x24
 45bb43c: 52800121     	mov	w1, #0x9                ; =9
 45bb440: aa1903e2     	mov	x2, x25
 45bb444: 97af542f     	bl	0x3190500 <_ChromeMain+0x318b264>
 45bb448: aa0003f8     	mov	x24, x0
 45bb44c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45bb450: f9404749     	ldr	x9, [x26, #0x88]
 45bb454: eb09011f     	cmp	x8, x9
 45bb458: 54000061     	b.ne	0x45bb464 <_ChromeMain+0x45b61c8>
 45bb45c: aa1803e0     	mov	x0, x24
 45bb460: 96e963a7     	bl	0x142fc <_ChromeMain+0xf060>
 45bb464: a900fef8     	stp	x24, xzr, [x23, #0x8]
 45bb468: f941cec0     	ldr	x0, [x22, #0x398]
 45bb46c: f901ced7     	str	x23, [x22, #0x398]
 45bb470: b40000a0     	cbz	x0, 0x45bb484 <_ChromeMain+0x45b61e8>
 45bb474: 978bfeaa     	bl	0x28baf1c <_ChromeMain+0x28b5c80>
 45bb478: 52800301     	mov	w1, #0x18               ; =24
 45bb47c: 96e9368f     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45bb480: f941ced7     	ldr	x23, [x22, #0x398]
 45bb484: f94002a8     	ldr	x8, [x21]
 45bb488: f9403508     	ldr	x8, [x8, #0x68]
 45bb48c: aa1503e0     	mov	x0, x21
 45bb490: d63f0100     	blr	x8
 45bb494: aa0003f5     	mov	x21, x0
 45bb498: f9400288     	ldr	x8, [x20]
 45bb49c: a9057fe8     	stp	x8, xzr, [sp, #0x50]
 45bb4a0: 52800100     	mov	w0, #0x8                ; =8
 45bb4a4: 96e94fb1     	bl	0xf368 <_ChromeMain+0xa0cc>
 45bb4a8: f900001f     	str	xzr, [x0]
 45bb4ac: f90027e0     	str	x0, [sp, #0x48]
 45bb4b0: 3900d3ff     	strb	wzr, [sp, #0x34]
 45bb4b4: 390113ff     	strb	wzr, [sp, #0x44]
 45bb4b8: 390043ff     	strb	wzr, [sp, #0x10]
 45bb4bc: 3900a3ff     	strb	wzr, [sp, #0x28]
 45bb4c0: 910043e8     	add	x8, sp, #0x10
 45bb4c4: f90003e8     	str	x8, [sp]
 45bb4c8: 910143e3     	add	x3, sp, #0x50
 45bb4cc: 910123e6     	add	x6, sp, #0x48
 45bb4d0: 9100d3e7     	add	x7, sp, #0x34
 45bb4d4: aa1703e0     	mov	x0, x23
 45bb4d8: aa1503e1     	mov	x1, x21
 45bb4dc: d2800002     	mov	x2, #0x0                ; =0
 45bb4e0: 52800004     	mov	w4, #0x0                ; =0
 45bb4e4: aa1303e5     	mov	x5, x19
 45bb4e8: 95837c4c     	bl	0xa69a618 <_ChromeMain+0xa69537c>
 45bb4ec: 3940a3e8     	ldrb	w8, [sp, #0x28]
 45bb4f0: 340000e8     	cbz	w8, 0x45bb50c <_ChromeMain+0x45b6270>
 45bb4f4: 39c09fe8     	ldrsb	w8, [sp, #0x27]
 45bb4f8: 36f800a8     	tbz	w8, #0x1f, 0x45bb50c <_ChromeMain+0x45b6270>
 45bb4fc: f9400be0     	ldr	x0, [sp, #0x10]
 45bb500: f94013e8     	ldr	x8, [sp, #0x20]
 45bb504: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 45bb508: 96e9366c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45bb50c: f94027f3     	ldr	x19, [sp, #0x48]
 45bb510: f90027ff     	str	xzr, [sp, #0x48]
 45bb514: b40000d3     	cbz	x19, 0x45bb52c <_ChromeMain+0x45b6290>
 45bb518: aa1303e0     	mov	x0, x19
 45bb51c: 9502c2ff     	bl	0x866c118 <_ChromeMain+0x8666e7c>
 45bb520: aa1303e0     	mov	x0, x19
 45bb524: 52800101     	mov	w1, #0x8                ; =8
 45bb528: 96e93664     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45bb52c: f004c868     	adrp	x8, 0xdeca000 <dyld_stub_binder+0xdeca000>
 45bb530: 9113f108     	add	x8, x8, #0x4fc
 45bb534: f9002be8     	str	x8, [sp, #0x50]
 45bb538: 910143e0     	add	x0, sp, #0x50
 45bb53c: 9754cc8c     	bl	0x1aee76c <_ChromeMain+0x1ae94d0>
 45bb540: 17ffff98     	b	0x45bb3a0 <_ChromeMain+0x45b6104>
