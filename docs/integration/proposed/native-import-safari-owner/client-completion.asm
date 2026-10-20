
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 427a9cc: d10103ff     	sub	sp, sp, #0x40
 427a9d0: a9024ff4     	stp	x20, x19, [sp, #0x20]
 427a9d4: a9037bfd     	stp	x29, x30, [sp, #0x30]
 427a9d8: 9100c3fd     	add	x29, sp, #0x30
 427a9dc: 39446008     	ldrb	w8, [x0, #0x118]
 427a9e0: 34000ac8     	cbz	w8, 0x427ab38 <_ChromeMain+0x427589c>
 427a9e4: aa0003f3     	mov	x19, x0
 427a9e8: 39445008     	ldrb	w8, [x0, #0x114]
 427a9ec: 34000a68     	cbz	w8, 0x427ab38 <_ChromeMain+0x427589c>
 427a9f0: 39432268     	ldrb	w8, [x19, #0xc8]
 427a9f4: 370000e8     	tbnz	w8, #0x0, 0x427aa10 <_ChromeMain+0x4275774>
 427a9f8: 39445668     	ldrb	w8, [x19, #0x115]
 427a9fc: 340009e8     	cbz	w8, 0x427ab38 <_ChromeMain+0x427589c>
 427aa00: 39445a68     	ldrb	w8, [x19, #0x116]
 427aa04: 340009a8     	cbz	w8, 0x427ab38 <_ChromeMain+0x427589c>
 427aa08: 39445e68     	ldrb	w8, [x19, #0x117]
 427aa0c: 34000968     	cbz	w8, 0x427ab38 <_ChromeMain+0x427589c>
 427aa10: f9407a60     	ldr	x0, [x19, #0xf0]
 427aa14: f9007a7f     	str	xzr, [x19, #0xf0]
 427aa18: b5000a40     	cbnz	x0, 0x427ab60 <_ChromeMain+0x42758c4>
 427aa1c: f9407660     	ldr	x0, [x19, #0xe8]
 427aa20: f900767f     	str	xzr, [x19, #0xe8]
 427aa24: b4000080     	cbz	x0, 0x427aa34 <_ChromeMain+0x4275798>
 427aa28: 97b7a600     	bl	0x3064228 <_ChromeMain+0x305ef8c>
 427aa2c: 52802f01     	mov	w1, #0x178              ; =376
 427aa30: 96f63922     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427aa34: f9408268     	ldr	x8, [x19, #0x100]
 427aa38: d37ef509     	lsl	x9, x8, #2
 427aa3c: b4000129     	cbz	x9, 0x427aa60 <_ChromeMain+0x42757c4>
 427aa40: f9407e6a     	ldr	x10, [x19, #0xf8]
 427aa44: cb080be8     	neg	x8, x8, lsl #2
 427aa48: 8b0a0129     	add	x9, x9, x10
 427aa4c: d1001129     	sub	x9, x9, #0x4
 427aa50: b4000909     	cbz	x9, 0x427ab70 <_ChromeMain+0x42758d4>
 427aa54: d1001129     	sub	x9, x9, #0x4
 427aa58: 91001108     	add	x8, x8, #0x4
 427aa5c: b5ffffa8     	cbnz	x8, 0x427aa50 <_ChromeMain+0x42757b4>
 427aa60: f900827f     	str	xzr, [x19, #0x100]
 427aa64: aa1303e0     	mov	x0, x19
 427aa68: 97fffbfb     	bl	0x4279a54 <_ChromeMain+0x42747b8>
 427aa6c: 52800128     	mov	w8, #0x9                ; =9
 427aa70: 39007fe8     	strb	w8, [sp, #0x1f]
 427aa74: 910023e9     	add	x9, sp, #0x8
 427aa78: 9100252a     	add	x10, x9, #0x9
 427aa7c: 90046488     	adrp	x8, 0xcf0a000 <dyld_stub_binder+0xcf0a000>
 427aa80: 91106908     	add	x8, x8, #0x41a
 427aa84: eb08015f     	cmp	x10, x8
 427aa88: fa488122     	ccmp	x9, x8, #0x2, hi
 427aa8c: 54000729     	b.ls	0x427ab70 <_ChromeMain+0x42758d4>
 427aa90: 52800c89     	mov	w9, #0x64               ; =100
 427aa94: 790023e9     	strh	w9, [sp, #0x10]
 427aa98: f9400108     	ldr	x8, [x8]
 427aa9c: f90007e8     	str	x8, [sp, #0x8]
 427aaa0: 91016274     	add	x20, x19, #0x58
 427aaa4: 39c1be68     	ldrsb	w8, [x19, #0x6f]
 427aaa8: 37f80668     	tbnz	w8, #0x1f, 0x427ab74 <_ChromeMain+0x42758d8>
 427aaac: 3cc083e0     	ldur	q0, [sp, #0x8]
 427aab0: 3d800280     	str	q0, [x20]
 427aab4: f9400fe8     	ldr	x8, [sp, #0x18]
 427aab8: f9000a88     	str	x8, [x20, #0x10]
 427aabc: 39c29e68     	ldrsb	w8, [x19, #0xa7]
 427aac0: 37f80648     	tbnz	w8, #0x1f, 0x427ab88 <_ChromeMain+0x42758ec>
 427aac4: a9097e7f     	stp	xzr, xzr, [x19, #0x90]
 427aac8: f80a027f     	stur	xzr, [x19, #0xa0]
 427aacc: 39c23e68     	ldrsb	w8, [x19, #0x8f]
 427aad0: 37f803c8     	tbnz	w8, #0x1f, 0x427ab48 <_ChromeMain+0x42758ac>
 427aad4: 3901e27f     	strb	wzr, [x19, #0x78]
 427aad8: 39023e7f     	strb	wzr, [x19, #0x8f]
 427aadc: 3941be69     	ldrb	w9, [x19, #0x6f]
 427aae0: 13001d28     	sxtb	w8, w9
 427aae4: f940326a     	ldr	x10, [x19, #0x60]
 427aae8: 7100011f     	cmp	w8, #0x0
 427aaec: 9a894149     	csel	x9, x10, x9, mi
 427aaf0: f100253f     	cmp	x9, #0x9
 427aaf4: 540001a1     	b.ne	0x427ab28 <_ChromeMain+0x427588c>
 427aaf8: f9400289     	ldr	x9, [x20]
 427aafc: 7100011f     	cmp	w8, #0x0
 427ab00: 9a944128     	csel	x8, x9, x20, mi
 427ab04: f9400109     	ldr	x9, [x8]
 427ab08: 39402108     	ldrb	w8, [x8, #0x8]
 427ab0c: 7101911f     	cmp	w8, #0x64
 427ab10: d28eae68     	mov	x8, #0x7573             ; =30067
 427ab14: f2ac6c68     	movk	x8, #0x6363, lsl #16
 427ab18: f2ccaca8     	movk	x8, #0x6565, lsl #32
 427ab1c: f2ecac88     	movk	x8, #0x6564, lsl #48
 427ab20: fa480120     	ccmp	x9, x8, #0x0, eq
 427ab24: 540001a0     	b.eq	0x427ab58 <_ChromeMain+0x42758bc>
 427ab28: fd403a60     	ldr	d0, [x19, #0x70]
 427ab2c: fd003a60     	str	d0, [x19, #0x70]
 427ab30: aa1303e0     	mov	x0, x19
 427ab34: 97fffb64     	bl	0x42798c4 <_ChromeMain+0x4274628>
 427ab38: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 427ab3c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 427ab40: 910103ff     	add	sp, sp, #0x40
 427ab44: d65f03c0     	ret
 427ab48: f9403e68     	ldr	x8, [x19, #0x78]
 427ab4c: 3900011f     	strb	wzr, [x8]
 427ab50: f900427f     	str	xzr, [x19, #0x80]
 427ab54: 17ffffe2     	b	0x427aadc <_ChromeMain+0x4275840>
 427ab58: 1e6e1000     	fmov	d0, #1.00000000
 427ab5c: 17fffff4     	b	0x427ab2c <_ChromeMain+0x4275890>
 427ab60: 94d34bd7     	bl	0x774dabc <_ChromeMain+0x7748820>
 427ab64: 52805801     	mov	w1, #0x2c0              ; =704
 427ab68: 96f638d4     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427ab6c: 17ffffac     	b	0x427aa1c <_ChromeMain+0x4275780>
 427ab70: d4200020     	brk	#0x1
 427ab74: f9402e60     	ldr	x0, [x19, #0x58]
 427ab78: f9403668     	ldr	x8, [x19, #0x68]
 427ab7c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427ab80: 96f638ce     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427ab84: 17ffffca     	b	0x427aaac <_ChromeMain+0x4275810>
 427ab88: f9404a60     	ldr	x0, [x19, #0x90]
 427ab8c: f9405268     	ldr	x8, [x19, #0xa0]
 427ab90: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427ab94: 96f638c9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427ab98: 17ffffcb     	b	0x427aac4 <_ChromeMain+0x4275828>
 427ab9c: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 427aba0: a9017bfd     	stp	x29, x30, [sp, #0x10]
 427aba4: 910043fd     	add	x29, sp, #0x10
 427aba8: aa0003f3     	mov	x19, x0
 427abac: f900781f     	str	xzr, [x0, #0xf0]
 427abb0: f9407408     	ldr	x8, [x0, #0xe8]
 427abb4: b4000168     	cbz	x8, 0x427abe0 <_ChromeMain+0x4275944>
 427abb8: 52800029     	mov	w9, #0x1                ; =1
 427abbc: 19004109     	stlurb	w9, [x8, #0x4]
 427abc0: f9407660     	ldr	x0, [x19, #0xe8]
 427abc4: b40000e0     	cbz	x0, 0x427abe0 <_ChromeMain+0x4275944>
 427abc8: 12800008     	mov	w8, #-0x1               ; =-1
 427abcc: b8e80008     	ldaddal	w8, w8, [x0]
 427abd0: 7100051f     	cmp	w8, #0x1
 427abd4: 54000061     	b.ne	0x427abe0 <_ChromeMain+0x4275944>
 427abd8: 52800101     	mov	w1, #0x8                ; =8
 427abdc: 96f638b7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427abe0: f9406e60     	ldr	x0, [x19, #0xd8]
 427abe4: f9006e7f     	str	xzr, [x19, #0xd8]
 427abe8: b4000080     	cbz	x0, 0x427abf8 <_ChromeMain+0x427595c>
 427abec: 97ffa032     	bl	0x4262cb4 <_ChromeMain+0x425da18>
 427abf0: 52801801     	mov	w1, #0xc0               ; =192
 427abf4: 96f638b1     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427abf8: 39432268     	ldrb	w8, [x19, #0xc8]
 427abfc: 340000e8     	cbz	w8, 0x427ac18 <_ChromeMain+0x427597c>
 427ac00: 39c31e68     	ldrsb	w8, [x19, #0xc7]
 427ac04: 36f800a8     	tbz	w8, #0x1f, 0x427ac18 <_ChromeMain+0x427597c>
 427ac08: f9405a60     	ldr	x0, [x19, #0xb0]
 427ac0c: f9406268     	ldr	x8, [x19, #0xc0]
 427ac10: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427ac14: 96f638a9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427ac18: f9405660     	ldr	x0, [x19, #0xa8]
 427ac1c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 427ac20: 900549c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 427ac24: f9404529     	ldr	x9, [x9, #0x88]
 427ac28: eb09011f     	cmp	x8, x9
 427ac2c: 54000041     	b.ne	0x427ac34 <_ChromeMain+0x4275998>
 427ac30: 96f69f83     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 427ac34: f900567f     	str	xzr, [x19, #0xa8]
 427ac38: aa1303e0     	mov	x0, x19
 427ac3c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 427ac40: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 427ac44: 17fffbc1     	b	0x4279b48 <_ChromeMain+0x42748ac>
 427ac48: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 427ac4c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 427ac50: 910043fd     	add	x29, sp, #0x10
 427ac54: aa0003f3     	mov	x19, x0
 427ac58: f900781f     	str	xzr, [x0, #0xf0]
 427ac5c: f9407408     	ldr	x8, [x0, #0xe8]
 427ac60: b4000168     	cbz	x8, 0x427ac8c <_ChromeMain+0x42759f0>
 427ac64: 52800029     	mov	w9, #0x1                ; =1
 427ac68: 19004109     	stlurb	w9, [x8, #0x4]
 427ac6c: f9407660     	ldr	x0, [x19, #0xe8]
 427ac70: b40000e0     	cbz	x0, 0x427ac8c <_ChromeMain+0x42759f0>
 427ac74: 12800008     	mov	w8, #-0x1               ; =-1
 427ac78: b8e80008     	ldaddal	w8, w8, [x0]
 427ac7c: 7100051f     	cmp	w8, #0x1
 427ac80: 54000061     	b.ne	0x427ac8c <_ChromeMain+0x42759f0>
 427ac84: 52800101     	mov	w1, #0x8                ; =8
 427ac88: 96f6388c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427ac8c: f9406e60     	ldr	x0, [x19, #0xd8]
 427ac90: f9006e7f     	str	xzr, [x19, #0xd8]
 427ac94: b4000080     	cbz	x0, 0x427aca4 <_ChromeMain+0x4275a08>
 427ac98: 97ffa007     	bl	0x4262cb4 <_ChromeMain+0x425da18>
 427ac9c: 52801801     	mov	w1, #0xc0               ; =192
 427aca0: 96f63886     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427aca4: 39432268     	ldrb	w8, [x19, #0xc8]
 427aca8: 340000e8     	cbz	w8, 0x427acc4 <_ChromeMain+0x4275a28>
 427acac: 39c31e68     	ldrsb	w8, [x19, #0xc7]
 427acb0: 36f800a8     	tbz	w8, #0x1f, 0x427acc4 <_ChromeMain+0x4275a28>
 427acb4: f9405a60     	ldr	x0, [x19, #0xb0]
 427acb8: f9406268     	ldr	x8, [x19, #0xc0]
 427acbc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 427acc0: 96f6387e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 427acc4: f9405660     	ldr	x0, [x19, #0xa8]
 427acc8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 427accc: 900549c9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 427acd0: f9404529     	ldr	x9, [x9, #0x88]
 427acd4: eb09011f     	cmp	x8, x9
 427acd8: 54000041     	b.ne	0x427ace0 <_ChromeMain+0x4275a44>
 427acdc: 96f69f58     	bl	0x22a3c <_ChromeMain+0x1d7a0>
