
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 463a8b4: f94a0674     	ldr	x20, [x19, #0x1408]
 463a8b8: b40000d4     	cbz	x20, 0x463a8d0 <_ChromeMain+0x4635634>
 463a8bc: 52800028     	mov	w8, #0x1                ; =1
 463a8c0: b8280288     	ldadd	w8, w8, [x20]
 463a8c4: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 463a8c8: 6b09011f     	cmp	w8, w9
 463a8cc: 54003ae0     	b.eq	0x463b028 <_ChromeMain+0x4635d8c>
 463a8d0: 910ac3f5     	add	x21, sp, #0x2b0
 463a8d4: f94a0a73     	ldr	x19, [x19, #0x1410]
 463a8d8: 52800a00     	mov	w0, #0x50               ; =80
 463a8dc: 96e752a3     	bl	0xf368 <_ChromeMain+0xa0cc>
 463a8e0: 52800028     	mov	w8, #0x1                ; =1
 463a8e4: b9000008     	str	w8, [x0]
 463a8e8: 101a7f48     	adr	x8, 0x466f8d0 <_ChromeMain+0x466a634>
 463a8ec: d503201f     	nop
 463a8f0: 10acba09     	adr	x9, 0x4594030 <_ChromeMain+0x458ed94>
 463a8f4: d503201f     	nop
 463a8f8: a900a408     	stp	x8, x9, [x0, #0x8]
 463a8fc: f0fef908     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 463a900: 912c0108     	add	x8, x8, #0xb00
 463a904: f9000c08     	str	x8, [x0, #0x18]
 463a908: a902cc14     	stp	x20, x19, [x0, #0x28]
 463a90c: 3dc037e0     	ldr	q0, [sp, #0xd0]
 463a910: 3c838000     	stur	q0, [x0, #0x38]
 463a914: f94073e8     	ldr	x8, [sp, #0xe0]
 463a918: f9002408     	str	x8, [x0, #0x48]
 463a91c: a90d7fff     	stp	xzr, xzr, [sp, #0xd0]
 463a920: f90073ff     	str	xzr, [sp, #0xe0]
 463a924: a90183ff     	stp	xzr, x0, [sp, #0x18]
 463a928: 528000c8     	mov	w8, #0x6                ; =6
 463a92c: b004ca69     	adrp	x9, 0xdf87000 <dyld_stub_binder+0xdf87000>
 463a930: 9130d129     	add	x9, x9, #0xc34
 463a934: a900d7e8     	stp	x8, x21, [sp, #0x8]
 463a938: f90003e9     	str	x9, [sp]
 463a93c: b004ca61     	adrp	x1, 0xdf87000 <dyld_stub_binder+0xdf87000>
 463a940: 91329821     	add	x1, x1, #0xca6
 463a944: b004ca63     	adrp	x3, 0xdf87000 <dyld_stub_binder+0xdf87000>
 463a948: 91330063     	add	x3, x3, #0xcc0
 463a94c: b004ca66     	adrp	x6, 0xdf87000 <dyld_stub_binder+0xdf87000>
 463a950: 9134c8c6     	add	x6, x6, #0xd32
 463a954: 910643e0     	add	x0, sp, #0x190
 463a958: 52800182     	mov	w2, #0xc                ; =12
 463a95c: 52800704     	mov	w4, #0x38               ; =56
 463a960: 52800025     	mov	w5, #0x1                ; =1
 463a964: 528000c7     	mov	w7, #0x6                ; =6
 463a968: 97ef7125     	bl	0x4216dfc <_ChromeMain+0x4211b60>
 463a96c: 39cb1fe8     	ldrsb	w8, [sp, #0x2c7]
 463a970: 36f800a8     	tbz	w8, #0x1f, 0x463a984 <_ChromeMain+0x46356e8>
 463a974: f9415be0     	ldr	x0, [sp, #0x2b0]
 463a978: f94163e8     	ldr	x8, [sp, #0x2c0]
 463a97c: d37ff901     	lsl	x1, x8, #1
 463a980: 96e7394e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
