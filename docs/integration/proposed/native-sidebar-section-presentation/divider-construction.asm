
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 37e1944: f942e275     	ldr	x21, [x19, #0x5c0]
 37e1948: b005b948     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 37e194c: 91120108     	add	x8, x8, #0x480
 37e1950: f8bfc100     	ldapr	x0, [x8]
 37e1954: b401da80     	cbz	x0, 0x37e54a4 <_ChromeMain+0x37e0208>
 37e1958: 52806201     	mov	w1, #0x310              ; =784
 37e195c: d2800002     	mov	x2, #0x0                ; =0
 37e1960: 97232714     	bl	0xab5b0 <_ChromeMain+0xa6314>
 37e1964: aa0003f4     	mov	x20, x0
 37e1968: 976e35f6     	bl	0x136f140 <_ChromeMain+0x1369ea4>
 37e196c: b0057a2a     	adrp	x10, 0xe726000 <dyld_stub_binder+0xe726000>
 37e1970: 912ac14a     	add	x10, x10, #0xab0
 37e1974: 910fa148     	add	x8, x10, #0x3e8
 37e1978: a900200a     	stp	x10, x8, [x0]
 37e197c: 91104148     	add	x8, x10, #0x410
 37e1980: f9000808     	str	x8, [x0, #0x10]
 37e1984: 91112148     	add	x8, x10, #0x448
 37e1988: 9111e149     	add	x9, x10, #0x478
 37e198c: a906a408     	stp	x8, x9, [x0, #0x68]
 37e1990: 91132148     	add	x8, x10, #0x4c8
 37e1994: f9005808     	str	x8, [x0, #0xb0]
 37e1998: 9114a148     	add	x8, x10, #0x528
 37e199c: f9006c08     	str	x8, [x0, #0xd8]
 37e19a0: 91156148     	add	x8, x10, #0x558
 37e19a4: aa0003f6     	mov	x22, x0
 37e19a8: f80f8ec8     	str	x8, [x22, #0xf8]!
 37e19ac: d2c00021     	mov	x1, #0x100000000        ; =4294967296
 37e19b0: 52800022     	mov	w2, #0x1                ; =1
 37e19b4: 97bfc02b     	bl	0x27d1a60 <_ChromeMain+0x27cc7c4>
 37e19b8: 3946a688     	ldrb	w8, [x20, #0x1a9]
 37e19bc: 340000a8     	cbz	w8, 0x37e19d0 <_ChromeMain+0x37dc734>
 37e19c0: 3906a69f     	strb	wzr, [x20, #0x1a9]
 37e19c4: 9106a681     	add	x1, x20, #0x1a9
 37e19c8: aa1603e0     	mov	x0, x22
 37e19cc: 975d1981     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 37e19d0: 3945a688     	ldrb	w8, [x20, #0x169]
 37e19d4: 3501e108     	cbnz	w8, 0x37e55f4 <_ChromeMain+0x37e0358>
 37e19d8: f940cea2     	ldr	x2, [x21, #0x198]
 37e19dc: aa1503e0     	mov	x0, x21
 37e19e0: aa1403e1     	mov	x1, x20
 37e19e4: 973e5e86     	bl	0x7793fc <_ChromeMain+0x774160>
 37e19e8: 925e7688     	and	x8, x20, #0xfffffffc00000000
 37e19ec: f9404789     	ldr	x9, [x28, #0x88]
 37e19f0: eb09011f     	cmp	x8, x9
 37e19f4: 54000061     	b.ne	0x37e1a00 <_ChromeMain+0x37dc764>
 37e19f8: aa1403e0     	mov	x0, x20
 37e19fc: 9720ca40     	bl	0x142fc <_ChromeMain+0xf060>
 37e1a00: f9436a60     	ldr	x0, [x19, #0x6d0]
 37e1a04: 925e7408     	and	x8, x0, #0xfffffffc00000000
 37e1a08: f9404789     	ldr	x9, [x28, #0x88]
 37e1a0c: eb09011f     	cmp	x8, x9
 37e1a10: 54000041     	b.ne	0x37e1a18 <_ChromeMain+0x37dc77c>
 37e1a14: 9721040a     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 37e1a18: f9036a74     	str	x20, [x19, #0x6d0]
 37e1a1c: f9400288     	ldr	x8, [x20]
 37e1a20: f9405108     	ldr	x8, [x8, #0xa0]
 37e1a24: aa1403e0     	mov	x0, x20
 37e1a28: 52800001     	mov	w1, #0x0                ; =0
 37e1a2c: d63f0100     	blr	x8
