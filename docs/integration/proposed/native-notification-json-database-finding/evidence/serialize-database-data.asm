
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 672aa24: d10443ff     	sub	sp, sp, #0x110
 672aa28: a90b6ffc     	stp	x28, x27, [sp, #0xb0]
 672aa2c: a90c67fa     	stp	x26, x25, [sp, #0xc0]
 672aa30: a90d5ff8     	stp	x24, x23, [sp, #0xd0]
 672aa34: a90e57f6     	stp	x22, x21, [sp, #0xe0]
 672aa38: a90f4ff4     	stp	x20, x19, [sp, #0xf0]
 672aa3c: a9107bfd     	stp	x29, x30, [sp, #0x100]
 672aa40: 910403fd     	add	x29, sp, #0x100
 672aa44: aa0103f3     	mov	x19, x1
 672aa48: aa0003f4     	mov	x20, x0
 672aa4c: 52801400     	mov	w0, #0xa0               ; =160
 672aa50: 96639246     	bl	0xf368 <_ChromeMain+0xa0cc>
 672aa54: aa0003f5     	mov	x21, x0
 672aa58: d2800001     	mov	x1, #0x0                ; =0
 672aa5c: 94e55916     	bl	0xa080eb4 <_ChromeMain+0xa07bc18>
 672aa60: 3982be81     	ldrsb	x1, [x20, #0xaf]
 672aa64: b7f80341     	tbnz	x1, #0x3f, 0x672aacc <_ChromeMain+0x6725830>
 672aa68: 91026280     	add	x0, x20, #0x98
 672aa6c: 910003e8     	mov	x8, sp
 672aa70: 96a1e0a6     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 672aa74: b94012a8     	ldr	w8, [x21, #0x10]
 672aa78: 321e0108     	orr	w8, w8, #0x4
 672aa7c: b90012a8     	str	w8, [x21, #0x10]
 672aa80: f94006a2     	ldr	x2, [x21, #0x8]
 672aa84: 370036c2     	tbnz	w2, #0x0, 0x672b15c <_ChromeMain+0x6725ec0>
 672aa88: 910122a0     	add	x0, x21, #0x48
 672aa8c: 910003e1     	mov	x1, sp
 672aa90: 96aec713     	bl	0x12dc6dc <_ChromeMain+0x12d7440>
 672aa94: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 672aa98: 36f800a8     	tbz	w8, #0x1f, 0x672aaac <_ChromeMain+0x6725810>
 672aa9c: f94003e0     	ldr	x0, [sp]
 672aaa0: f9400be8     	ldr	x8, [sp, #0x10]
 672aaa4: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 672aaa8: 96637904     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 672aaac: b940b288     	ldr	w8, [x20, #0xb0]
 672aab0: 34000128     	cbz	w8, 0x672aad4 <_ChromeMain+0x6725838>
 672aab4: 7100051f     	cmp	w8, #0x1
 672aab8: 54000120     	b.eq	0x672aadc <_ChromeMain+0x6725840>
 672aabc: 7100091f     	cmp	w8, #0x2
 672aac0: 540000e0     	b.eq	0x672aadc <_ChromeMain+0x6725840>
 672aac4: b94012a8     	ldr	w8, [x21, #0x10]
 672aac8: 14000008     	b	0x672aae8 <_ChromeMain+0x672584c>
 672aacc: a9498680     	ldp	x0, x1, [x20, #0x98]
 672aad0: 17ffffe7     	b	0x672aa6c <_ChromeMain+0x67257d0>
 672aad4: b9008abf     	str	wzr, [x21, #0x88]
 672aad8: 14000002     	b	0x672aae0 <_ChromeMain+0x6725844>
 672aadc: b9008aa8     	str	w8, [x21, #0x88]
 672aae0: b94012a8     	ldr	w8, [x21, #0x10]
 672aae4: 32160108     	orr	w8, w8, #0x400
 672aae8: 321d0108     	orr	w8, w8, #0x8
 672aaec: b90012a8     	str	w8, [x21, #0x10]
 672aaf0: f94006a2     	ldr	x2, [x21, #0x8]
 672aaf4: 370033a2     	tbnz	w2, #0x0, 0x672b168 <_ChromeMain+0x6725ecc>
 672aaf8: 910142a0     	add	x0, x21, #0x50
 672aafc: 9102e281     	add	x1, x20, #0xb8
 672ab00: 968a2fd9     	bl	0x9b6a64 <_ChromeMain+0x9b17c8>
 672ab04: 39839e81     	ldrsb	x1, [x20, #0xe7]
 672ab08: b7f807e1     	tbnz	x1, #0x3f, 0x672ac04 <_ChromeMain+0x6725968>
 672ab0c: 91034280     	add	x0, x20, #0xd0
 672ab10: 910003e8     	mov	x8, sp
 672ab14: 96a1e07d     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 672ab18: b94012a8     	ldr	w8, [x21, #0x10]
 672ab1c: 321c0108     	orr	w8, w8, #0x10
 672ab20: b90012a8     	str	w8, [x21, #0x10]
 672ab24: f94006a2     	ldr	x2, [x21, #0x8]
 672ab28: 37003262     	tbnz	w2, #0x0, 0x672b174 <_ChromeMain+0x6725ed8>
 672ab2c: 910162a0     	add	x0, x21, #0x58
 672ab30: 910003e1     	mov	x1, sp
 672ab34: 96aec6ea     	bl	0x12dc6dc <_ChromeMain+0x12d7440>
 672ab38: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 672ab3c: 36f800a8     	tbz	w8, #0x1f, 0x672ab50 <_ChromeMain+0x67258b4>
 672ab40: f94003e0     	ldr	x0, [sp]
 672ab44: f9400be8     	ldr	x8, [sp, #0x10]
 672ab48: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 672ab4c: 966378db     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 672ab50: b94012a8     	ldr	w8, [x21, #0x10]
 672ab54: 321b0108     	orr	w8, w8, #0x20
 672ab58: b90012a8     	str	w8, [x21, #0x10]
 672ab5c: f94006a2     	ldr	x2, [x21, #0x8]
 672ab60: 37003102     	tbnz	w2, #0x0, 0x672b180 <_ChromeMain+0x6725ee4>
 672ab64: 910182a0     	add	x0, x21, #0x60
 672ab68: 9103a281     	add	x1, x20, #0xe8
 672ab6c: 968a2fbe     	bl	0x9b6a64 <_ChromeMain+0x9b17c8>
 672ab70: 91040280     	add	x0, x20, #0x100
 672ab74: 967d07c5     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 672ab78: aa0003e1     	mov	x1, x0
 672ab7c: b94012a8     	ldr	w8, [x21, #0x10]
 672ab80: 32170108     	orr	w8, w8, #0x200
 672ab84: b90012a8     	str	w8, [x21, #0x10]
 672ab88: f94006a2     	ldr	x2, [x21, #0x8]
 672ab8c: 37003002     	tbnz	w2, #0x0, 0x672b18c <_ChromeMain+0x6725ef0>
 672ab90: 910202a0     	add	x0, x21, #0x80
 672ab94: 968a2fb4     	bl	0x9b6a64 <_ChromeMain+0x9b17c8>
 672ab98: 9105e280     	add	x0, x20, #0x178
 672ab9c: 967d07bb     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 672aba0: aa0003e1     	mov	x1, x0
 672aba4: b94012a8     	ldr	w8, [x21, #0x10]
 672aba8: 321a0108     	orr	w8, w8, #0x40
 672abac: b90012a8     	str	w8, [x21, #0x10]
 672abb0: f94006a2     	ldr	x2, [x21, #0x8]
 672abb4: 37002f22     	tbnz	w2, #0x0, 0x672b198 <_ChromeMain+0x6725efc>
 672abb8: 9101a2a0     	add	x0, x21, #0x68
 672abbc: 968a2faa     	bl	0x9b6a64 <_ChromeMain+0x9b17c8>
 672abc0: 9107c280     	add	x0, x20, #0x1f0
 672abc4: 967d07b1     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 672abc8: aa0003e1     	mov	x1, x0
 672abcc: b94012a8     	ldr	w8, [x21, #0x10]
 672abd0: 32180108     	orr	w8, w8, #0x100
 672abd4: b90012a8     	str	w8, [x21, #0x10]
 672abd8: f94006a2     	ldr	x2, [x21, #0x8]
 672abdc: 37002e42     	tbnz	w2, #0x0, 0x672b1a4 <_ChromeMain+0x6725f08>
 672abe0: 9101e2a0     	add	x0, x21, #0x78
 672abe4: 968a2fa0     	bl	0x9b6a64 <_ChromeMain+0x9b17c8>
 672abe8: f9413a89     	ldr	x9, [x20, #0x270]
 672abec: b4000489     	cbz	x9, 0x672ac7c <_ChromeMain+0x67259e0>
 672abf0: d2800018     	mov	x24, #0x0               ; =0
 672abf4: aa1503f6     	mov	x22, x21
 672abf8: f8418ec8     	ldr	x8, [x22, #0x18]!
 672abfc: 910022d9     	add	x25, x22, #0x8
 672ac00: 14000012     	b	0x672ac48 <_ChromeMain+0x67259ac>
 672ac04: a94d0680     	ldp	x0, x1, [x20, #0xd0]
 672ac08: 17ffffc2     	b	0x672ab10 <_ChromeMain+0x6725874>
 672ac0c: 294426a2     	ldp	w2, w9, [x21, #0x20]
 672ac10: 6b09005f     	cmp	w2, w9
 672ac14: 540027e0     	b.eq	0x672b110 <_ChromeMain+0x6725e74>
 672ac18: 11000457     	add	w23, w2, #0x1
 672ac1c: 927df108     	and	x8, x8, #0xfffffffffffffff8
 672ac20: b9000337     	str	w23, [x25]
 672ac24: b822d91a     	str	w26, [x8, w2, sxtw #2]
 672ac28: f94002c8     	ldr	x8, [x22]
 672ac2c: f9413a89     	ldr	x9, [x20, #0x270]
 672ac30: b94012aa     	ldr	w10, [x21, #0x10]
 672ac34: 3200014a     	orr	w10, w10, #0x1
 672ac38: b90012aa     	str	w10, [x21, #0x10]
 672ac3c: 91000718     	add	x24, x24, #0x1
 672ac40: eb09031f     	cmp	x24, x9
 672ac44: 540001e2     	b.hs	0x672ac80 <_ChromeMain+0x67259e4>
 672ac48: f941368a     	ldr	x10, [x20, #0x268]
 672ac4c: b878795a     	ldr	w26, [x10, x24, lsl #2]
 672ac50: 3717fde8     	tbnz	w8, #0x2, 0x672ac0c <_ChromeMain+0x6725970>
 672ac54: 1200050a     	and	w10, w8, #0x3
 672ac58: 7100095f     	cmp	w10, #0x2
 672ac5c: 54002580     	b.eq	0x672b10c <_ChromeMain+0x6725e70>
 672ac60: 1100054a     	add	w10, w10, #0x1
 672ac64: 9240050b     	and	x11, x8, #0x3
 672ac68: 927df108     	and	x8, x8, #0xfffffffffffffff8
 672ac6c: aa0a0108     	orr	x8, x8, x10
 672ac70: f90002c8     	str	x8, [x22]
 672ac74: b82b7b3a     	str	w26, [x25, x11, lsl #2]
 672ac78: 17ffffee     	b	0x672ac30 <_ChromeMain+0x6725994>
 672ac7c: b94012aa     	ldr	w10, [x21, #0x10]
 672ac80: f9414288     	ldr	x8, [x20, #0x280]
 672ac84: f9004aa8     	str	x8, [x21, #0x90]
 672ac88: 394a2288     	ldrb	w8, [x20, #0x288]
 672ac8c: 39023aa8     	strb	w8, [x21, #0x8e]
 672ac90: 910a2688     	add	x8, x20, #0x289
 672ac94: 79400108     	ldrh	w8, [x8]
 672ac98: 79011aa8     	strh	w8, [x21, #0x8c]
 672ac9c: 32150d48     	orr	w8, w10, #0x7800
 672aca0: b90012a8     	str	w8, [x21, #0x10]
 672aca4: f9414e82     	ldr	x2, [x20, #0x298]
 672aca8: b4000162     	cbz	x2, 0x672acd4 <_ChromeMain+0x6725a38>
 672acac: f9414a81     	ldr	x1, [x20, #0x290]
 672acb0: 528f1008     	mov	w8, #0x7880             ; =30848
 672acb4: 2a080148     	orr	w8, w10, w8
 672acb8: b90012a8     	str	w8, [x21, #0x10]
 672acbc: f94006a3     	ldr	x3, [x21, #0x8]
 672acc0: 37002903     	tbnz	w3, #0x0, 0x672b1e0 <_ChromeMain+0x6725f44>
 672acc4: b7f82382     	tbnz	x2, #0x3f, 0x672b134 <_ChromeMain+0x6725e98>
 672acc8: b4002361     	cbz	x1, 0x672b134 <_ChromeMain+0x6725e98>
 672accc: 9101c2a0     	add	x0, x21, #0x70
 672acd0: 96da801f     	bl	0x1dcad4c <_ChromeMain+0x1dc5ab0>
 672acd4: f9416a88     	ldr	x8, [x20, #0x2d0]
 672acd8: d37df117     	lsl	x23, x8, #3
 672acdc: b4000ad7     	cbz	x23, 0x672ae34 <_ChromeMain+0x6725b98>
 672ace0: f9416698     	ldr	x24, [x20, #0x2c8]
 672ace4: 52800239     	mov	w25, #0x11              ; =17
 672ace8: 14000015     	b	0x672ad3c <_ChromeMain+0x6725aa0>
 672acec: 9102c100     	add	x0, x8, #0xb0
 672acf0: 910003e8     	mov	x8, sp
 672acf4: 96a1e005     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 672acf8: b94012c8     	ldr	w8, [x22, #0x10]
 672acfc: 321d0108     	orr	w8, w8, #0x8
 672ad00: b90012c8     	str	w8, [x22, #0x10]
 672ad04: f94006c2     	ldr	x2, [x22, #0x8]
 672ad08: 37002662     	tbnz	w2, #0x0, 0x672b1d4 <_ChromeMain+0x6725f38>
 672ad0c: 9100c2c0     	add	x0, x22, #0x30
 672ad10: 910003e1     	mov	x1, sp
 672ad14: 96aec672     	bl	0x12dc6dc <_ChromeMain+0x12d7440>
 672ad18: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 672ad1c: 36f800a8     	tbz	w8, #0x1f, 0x672ad30 <_ChromeMain+0x6725a94>
 672ad20: f94003e0     	ldr	x0, [sp]
 672ad24: f9400be8     	ldr	x8, [sp, #0x10]
 672ad28: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 672ad2c: 96637863     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 672ad30: 91002318     	add	x24, x24, #0x8
 672ad34: f10022f7     	subs	x23, x23, #0x8
 672ad38: 540007e0     	b.eq	0x672ae34 <_ChromeMain+0x6725b98>
 672ad3c: aa1503e0     	mov	x0, x21
 672ad40: 94000131     	bl	0x672b204 <_ChromeMain+0x6725f68>
 672ad44: f9400308     	ldr	x8, [x24]
 672ad48: b9400108     	ldr	w8, [x8]
 672ad4c: 7100091f     	cmp	w8, #0x2
 672ad50: 54002542     	b.hs	0x672b1f8 <_ChromeMain+0x6725f5c>
 672ad54: aa0003f6     	mov	x22, x0
 672ad58: b9003808     	str	w8, [x0, #0x38]
 672ad5c: b9401009     	ldr	w9, [x0, #0x10]
 672ad60: 321c0128     	orr	w8, w9, #0x10
 672ad64: b9001008     	str	w8, [x0, #0x10]
 672ad68: f9400308     	ldr	x8, [x24]
 672ad6c: 2a190129     	orr	w9, w9, w25
 672ad70: b9001009     	str	w9, [x0, #0x10]
 672ad74: f9400402     	ldr	x2, [x0, #0x8]
 672ad78: 37001e02     	tbnz	w2, #0x0, 0x672b138 <_ChromeMain+0x6725e9c>
 672ad7c: 910062c0     	add	x0, x22, #0x18
 672ad80: 91002101     	add	x1, x8, #0x8
 672ad84: 968a2f38     	bl	0x9b6a64 <_ChromeMain+0x9b17c8>
 672ad88: f9400308     	ldr	x8, [x24]
 672ad8c: 3980dd01     	ldrsb	x1, [x8, #0x37]
 672ad90: b7f804e1     	tbnz	x1, #0x3f, 0x672ae2c <_ChromeMain+0x6725b90>
 672ad94: 91008100     	add	x0, x8, #0x20
 672ad98: 910003e8     	mov	x8, sp
 672ad9c: 96a1dfdb     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 672ada0: b94012c8     	ldr	w8, [x22, #0x10]
 672ada4: 321f0108     	orr	w8, w8, #0x2
 672ada8: b90012c8     	str	w8, [x22, #0x10]
 672adac: f94006c2     	ldr	x2, [x22, #0x8]
 672adb0: 37001ca2     	tbnz	w2, #0x0, 0x672b144 <_ChromeMain+0x6725ea8>
 672adb4: 910082c0     	add	x0, x22, #0x20
 672adb8: 910003e1     	mov	x1, sp
 672adbc: 96aec648     	bl	0x12dc6dc <_ChromeMain+0x12d7440>
 672adc0: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 672adc4: 36f800a8     	tbz	w8, #0x1f, 0x672add8 <_ChromeMain+0x6725b3c>
 672adc8: f94003e0     	ldr	x0, [sp]
 672adcc: f9400be8     	ldr	x8, [sp, #0x10]
 672add0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 672add4: 96637839     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 672add8: f9400308     	ldr	x8, [x24]
 672addc: 9100e100     	add	x0, x8, #0x38
 672ade0: 967d072a     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 672ade4: aa0003e1     	mov	x1, x0
 672ade8: b94012c8     	ldr	w8, [x22, #0x10]
 672adec: 321e0108     	orr	w8, w8, #0x4
 672adf0: b90012c8     	str	w8, [x22, #0x10]
 672adf4: f94006c2     	ldr	x2, [x22, #0x8]
 672adf8: 37001ac2     	tbnz	w2, #0x0, 0x672b150 <_ChromeMain+0x6725eb4>
 672adfc: 9100a2c0     	add	x0, x22, #0x28
 672ae00: 968a2f19     	bl	0x9b6a64 <_ChromeMain+0x9b17c8>
 672ae04: f9400308     	ldr	x8, [x24]
 672ae08: 39432108     	ldrb	w8, [x8, #0xc8]
 672ae0c: 34fff928     	cbz	w8, 0x672ad30 <_ChromeMain+0x6725a94>
 672ae10: f9400308     	ldr	x8, [x24]
 672ae14: 39432109     	ldrb	w9, [x8, #0xc8]
 672ae18: 360018e9     	tbz	w9, #0x0, 0x672b134 <_ChromeMain+0x6725e98>
 672ae1c: 39831d01     	ldrsb	x1, [x8, #0xc7]
 672ae20: b6fff661     	tbz	x1, #0x3f, 0x672acec <_ChromeMain+0x6725a50>
 672ae24: a94b0500     	ldp	x0, x1, [x8, #0xb0]
 672ae28: 17ffffb2     	b	0x672acf0 <_ChromeMain+0x6725a54>
 672ae2c: a9420500     	ldp	x0, x1, [x8, #0x20]
 672ae30: 17ffffda     	b	0x672ad98 <_ChromeMain+0x6725afc>
 672ae34: 394ba288     	ldrb	w8, [x20, #0x2e8]
 672ae38: 360000c8     	tbz	w8, #0x0, 0x672ae50 <_ChromeMain+0x6725bb4>
 672ae3c: f9417288     	ldr	x8, [x20, #0x2e0]
 672ae40: f9004ea8     	str	x8, [x21, #0x98]
 672ae44: b94012a8     	ldr	w8, [x21, #0x10]
 672ae48: 32110108     	orr	w8, w8, #0x8000
 672ae4c: b90012a8     	str	w8, [x21, #0x10]
 672ae50: 6f00e400     	movi.2d	v0, #0000000000000000
 672ae54: ad0383e0     	stp	q0, q0, [sp, #0x70]
 672ae58: ad0283e0     	stp	q0, q0, [sp, #0x50]
 672ae5c: ad0183e0     	stp	q0, q0, [sp, #0x30]
 672ae60: ad0083e0     	stp	q0, q0, [sp, #0x10]
 672ae64: 3d8003e0     	str	q0, [sp]
 672ae68: 910003e0     	mov	x0, sp
 672ae6c: d2800001     	mov	x1, #0x0                ; =0
 672ae70: 94e55c02     	bl	0xa081e78 <_ChromeMain+0xa07cbdc>
 672ae74: b94013e8     	ldr	w8, [sp, #0x10]
 672ae78: 321f0108     	orr	w8, w8, #0x2
 672ae7c: b90013e8     	str	w8, [sp, #0x10]
 672ae80: f94007e2     	ldr	x2, [sp, #0x8]
 672ae84: 37001962     	tbnz	w2, #0x0, 0x672b1b0 <_ChromeMain+0x6725f14>
 672ae88: 910003e8     	mov	x8, sp
 672ae8c: 91008100     	add	x0, x8, #0x20
 672ae90: aa1403e1     	mov	x1, x20
 672ae94: 968a2ef4     	bl	0x9b6a64 <_ChromeMain+0x9b17c8>
 672ae98: 91006280     	add	x0, x20, #0x18
 672ae9c: 967d06fb     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 672aea0: aa0003e1     	mov	x1, x0
 672aea4: b94013e8     	ldr	w8, [sp, #0x10]
 672aea8: 32000108     	orr	w8, w8, #0x1
 672aeac: b90013e8     	str	w8, [sp, #0x10]
 672aeb0: f94007e2     	ldr	x2, [sp, #0x8]
 672aeb4: 37001842     	tbnz	w2, #0x0, 0x672b1bc <_ChromeMain+0x6725f20>
 672aeb8: 910003e8     	mov	x8, sp
 672aebc: 91006100     	add	x0, x8, #0x18
 672aec0: 968a2ee9     	bl	0x9b6a64 <_ChromeMain+0x9b17c8>
 672aec4: f9404a88     	ldr	x8, [x20, #0x90]
 672aec8: f9001fe8     	str	x8, [sp, #0x38]
 672aecc: b94013e8     	ldr	w8, [sp, #0x10]
 672aed0: 321c0108     	orr	w8, w8, #0x10
 672aed4: b90013e8     	str	w8, [sp, #0x10]
 672aed8: f94007f6     	ldr	x22, [sp, #0x8]
 672aedc: 37001776     	tbnz	w22, #0x0, 0x672b1c8 <_ChromeMain+0x6725f2c>
 672aee0: b50000d6     	cbnz	x22, 0x672aef8 <_ChromeMain+0x6725c5c>
 672aee4: f94017e0     	ldr	x0, [sp, #0x28]
 672aee8: b4000080     	cbz	x0, 0x672aef8 <_ChromeMain+0x6725c5c>
 672aeec: f9400008     	ldr	x8, [x0]
 672aef0: f9400508     	ldr	x8, [x8, #0x8]
 672aef4: d63f0100     	blr	x8
 672aef8: b40004f5     	cbz	x21, 0x672af94 <_ChromeMain+0x6725cf8>
 672aefc: f94006a2     	ldr	x2, [x21, #0x8]
 672af00: 37001762     	tbnz	w2, #0x0, 0x672b1ec <_ChromeMain+0x6725f50>
 672af04: eb0202df     	cmp	x22, x2
 672af08: 540000a0     	b.eq	0x672af1c <_ChromeMain+0x6725c80>
 672af0c: aa1603e0     	mov	x0, x22
 672af10: aa1503e1     	mov	x1, x21
 672af14: 94876477     	bl	0x89040f0 <_ChromeMain+0x88fee54>
 672af18: aa0003f5     	mov	x21, x0
 672af1c: b94013e8     	ldr	w8, [sp, #0x10]
 672af20: 321e0108     	orr	w8, w8, #0x4
 672af24: f90017f5     	str	x21, [sp, #0x28]
 672af28: 394ec289     	ldrb	w9, [x20, #0x3b0]
 672af2c: 3901a3e9     	strb	w9, [sp, #0x68]
 672af30: 910ed289     	add	x9, x20, #0x3b4
 672af34: fd400120     	ldr	d0, [x9]
 672af38: fd0023e0     	str	d0, [sp, #0x40]
 672af3c: f941e289     	ldr	x9, [x20, #0x3c0]
 672af40: f90027e9     	str	x9, [sp, #0x48]
 672af44: 394f4289     	ldrb	w9, [x20, #0x3d0]
 672af48: 340002c9     	cbz	w9, 0x672afa0 <_ChromeMain+0x6725d04>
 672af4c: f941e689     	ldr	x9, [x20, #0x3c8]
 672af50: b24107ea     	mov	x10, #-0x7fffffffffffffff ; =-9223372036854775807
 672af54: 8b0a012a     	add	x10, x9, x10
 672af58: f100095f     	cmp	x10, #0x2
 672af5c: 54000082     	b.hs	0x672af6c <_ChromeMain+0x6725cd0>
 672af60: 937ffd29     	asr	x9, x9, #63
 672af64: d240f929     	eor	x9, x9, #0x7fffffffffffffff
 672af68: 14000008     	b	0x672af88 <_ChromeMain+0x6725cec>
 672af6c: d29ef9ea     	mov	x10, #0xf7cf            ; =63439
 672af70: f2bc6a6a     	movk	x10, #0xe353, lsl #16
 672af74: f2d374aa     	movk	x10, #0x9ba5, lsl #32
 672af78: f2e4188a     	movk	x10, #0x20c4, lsl #48
 672af7c: 9b4a7d29     	smulh	x9, x9, x10
 672af80: 9347fd2a     	asr	x10, x9, #7
 672af84: 8b49fd49     	add	x9, x10, x9, lsr #63
 672af88: f9002be9     	str	x9, [sp, #0x50]
 672af8c: 52813c09     	mov	w9, #0x9e0              ; =2528
 672af90: 14000005     	b	0x672afa4 <_ChromeMain+0x6725d08>
 672af94: b94013e8     	ldr	w8, [sp, #0x10]
 672af98: 121d7908     	and	w8, w8, #0xfffffffb
 672af9c: 17ffffe2     	b	0x672af24 <_ChromeMain+0x6725c88>
 672afa0: 52811c09     	mov	w9, #0x8e0              ; =2272
 672afa4: 2a090108     	orr	w8, w8, w9
 672afa8: 394f8289     	ldrb	w9, [x20, #0x3e0]
 672afac: 34000249     	cbz	w9, 0x672aff4 <_ChromeMain+0x6725d58>
 672afb0: f941ee89     	ldr	x9, [x20, #0x3d8]
 672afb4: b24107ea     	mov	x10, #-0x7fffffffffffffff ; =-9223372036854775807
 672afb8: 8b0a012a     	add	x10, x9, x10
 672afbc: f100095f     	cmp	x10, #0x2
 672afc0: 54000123     	b.lo	0x672afe4 <_ChromeMain+0x6725d48>
 672afc4: d29ef9ea     	mov	x10, #0xf7cf            ; =63439
 672afc8: f2bc6a6a     	movk	x10, #0xe353, lsl #16
 672afcc: f2d374aa     	movk	x10, #0x9ba5, lsl #32
 672afd0: f2e4188a     	movk	x10, #0x20c4, lsl #48
 672afd4: 9b4a7d29     	smulh	x9, x9, x10
 672afd8: 9347fd2a     	asr	x10, x9, #7
 672afdc: 8b49fd49     	add	x9, x10, x9, lsr #63
 672afe0: 14000003     	b	0x672afec <_ChromeMain+0x6725d50>
 672afe4: 937ffd29     	asr	x9, x9, #63
 672afe8: d240f929     	eor	x9, x9, #0x7fffffffffffffff
 672afec: f9002fe9     	str	x9, [sp, #0x58]
 672aff0: 32170108     	orr	w8, w8, #0x200
 672aff4: 394fc289     	ldrb	w9, [x20, #0x3f0]
 672aff8: 34000249     	cbz	w9, 0x672b040 <_ChromeMain+0x6725da4>
 672affc: f941f689     	ldr	x9, [x20, #0x3e8]
 672b000: b24107ea     	mov	x10, #-0x7fffffffffffffff ; =-9223372036854775807
 672b004: 8b0a012a     	add	x10, x9, x10
 672b008: f100095f     	cmp	x10, #0x2
 672b00c: 54000082     	b.hs	0x672b01c <_ChromeMain+0x6725d80>
 672b010: 937ffd29     	asr	x9, x9, #63
 672b014: d240f929     	eor	x9, x9, #0x7fffffffffffffff
 672b018: 14000008     	b	0x672b038 <_ChromeMain+0x6725d9c>
 672b01c: d29ef9ea     	mov	x10, #0xf7cf            ; =63439
 672b020: f2bc6a6a     	movk	x10, #0xe353, lsl #16
 672b024: f2d374aa     	movk	x10, #0x9ba5, lsl #32
 672b028: f2e4188a     	movk	x10, #0x20c4, lsl #48
 672b02c: 9b4a7d29     	smulh	x9, x9, x10
 672b030: 9347fd2a     	asr	x10, x9, #7
 672b034: 8b49fd49     	add	x9, x10, x9, lsr #63
 672b038: f90033e9     	str	x9, [sp, #0x60]
 672b03c: 32160108     	orr	w8, w8, #0x400
 672b040: b943fa89     	ldr	w9, [x20, #0x3f8]
 672b044: 7100093f     	cmp	w9, #0x2
 672b048: 54000068     	b.hi	0x672b054 <_ChromeMain+0x6725db8>
 672b04c: b9006fe9     	str	w9, [sp, #0x6c]
 672b050: 32120108     	orr	w8, w8, #0x4000
 672b054: 394be289     	ldrb	w9, [x20, #0x2f8]
 672b058: 3901a7e9     	strb	w9, [sp, #0x69]
 672b05c: 394ff289     	ldrb	w9, [x20, #0x3fc]
 672b060: 3901abe9     	strb	w9, [sp, #0x6a]
 672b064: 52960009     	mov	w9, #0xb000             ; =45056
 672b068: 2a090108     	orr	w8, w8, w9
 672b06c: b90013e8     	str	w8, [sp, #0x10]
 672b070: f9420295     	ldr	x21, [x20, #0x400]
 672b074: 91102294     	add	x20, x20, #0x408
 672b078: eb1402bf     	cmp	x21, x20
 672b07c: 540002a0     	b.eq	0x672b0d0 <_ChromeMain+0x6725e34>
 672b080: 910003f6     	mov	x22, sp
 672b084: 14000006     	b	0x672b09c <_ChromeMain+0x6725e00>
 672b088: aa0803f5     	mov	x21, x8
 672b08c: f9400108     	ldr	x8, [x8]
 672b090: b5ffffc8     	cbnz	x8, 0x672b088 <_ChromeMain+0x6725dec>
 672b094: eb1402bf     	cmp	x21, x20
 672b098: 540001c0     	b.eq	0x672b0d0 <_ChromeMain+0x6725e34>
 672b09c: d101c3a8     	sub	x8, x29, #0x70
 672b0a0: 9101c2c0     	add	x0, x22, #0x70
 672b0a4: 910082a1     	add	x1, x21, #0x20
 672b0a8: 9100e2a2     	add	x2, x21, #0x38
 672b0ac: 97ce1d55     	bl	0x5ab2600 <_ChromeMain+0x5aad364>
 672b0b0: f94006a8     	ldr	x8, [x21, #0x8]
 672b0b4: b5fffea8     	cbnz	x8, 0x672b088 <_ChromeMain+0x6725dec>
 672b0b8: aa1503e8     	mov	x8, x21
 672b0bc: f9400ab5     	ldr	x21, [x21, #0x10]
 672b0c0: f94002a9     	ldr	x9, [x21]
 672b0c4: eb09011f     	cmp	x8, x9
 672b0c8: 54ffff81     	b.ne	0x672b0b8 <_ChromeMain+0x6725e1c>
 672b0cc: 17fffff2     	b	0x672b094 <_ChromeMain+0x6725df8>
 672b0d0: 910003e0     	mov	x0, sp
 672b0d4: aa1303e1     	mov	x1, x19
 672b0d8: 96e19ff6     	bl	0x1f930b0 <_ChromeMain+0x1f8de14>
 672b0dc: aa0003f3     	mov	x19, x0
 672b0e0: 910003e0     	mov	x0, sp
 672b0e4: 94e55b97     	bl	0xa081f40 <_ChromeMain+0xa07cca4>
 672b0e8: aa1303e0     	mov	x0, x19
 672b0ec: a9507bfd     	ldp	x29, x30, [sp, #0x100]
 672b0f0: a94f4ff4     	ldp	x20, x19, [sp, #0xf0]
 672b0f4: a94e57f6     	ldp	x22, x21, [sp, #0xe0]
 672b0f8: a94d5ff8     	ldp	x24, x23, [sp, #0xd0]
 672b0fc: a94c67fa     	ldp	x26, x25, [sp, #0xc0]
 672b100: a94b6ffc     	ldp	x28, x27, [sp, #0xb0]
 672b104: 910443ff     	add	sp, sp, #0x110
 672b108: d65f03c0     	ret
 672b10c: 52800042     	mov	w2, #0x2                ; =2
 672b110: f27e011f     	tst	x8, #0x4
 672b114: 1a9f17e1     	cset	w1, eq
 672b118: 11000457     	add	w23, w2, #0x1
 672b11c: aa1603e0     	mov	x0, x22
 672b120: aa1703e3     	mov	x3, x23
 672b124: 96e6698f     	bl	0x20c5760 <_ChromeMain+0x20c04c4>
 672b128: f94002c8     	ldr	x8, [x22]
 672b12c: b9400322     	ldr	w2, [x25]
 672b130: 17fffebb     	b	0x672ac1c <_ChromeMain+0x6725980>
 672b134: d4200020     	brk	#0x1
 672b138: 927ff849     	and	x9, x2, #0xfffffffffffffffe
 672b13c: f9400122     	ldr	x2, [x9]
 672b140: 17ffff0f     	b	0x672ad7c <_ChromeMain+0x6725ae0>
 672b144: 927ff848     	and	x8, x2, #0xfffffffffffffffe
 672b148: f9400102     	ldr	x2, [x8]
 672b14c: 17ffff1a     	b	0x672adb4 <_ChromeMain+0x6725b18>
 672b150: 927ff848     	and	x8, x2, #0xfffffffffffffffe
 672b154: f9400102     	ldr	x2, [x8]
 672b158: 17ffff29     	b	0x672adfc <_ChromeMain+0x6725b60>
 672b15c: 927ff848     	and	x8, x2, #0xfffffffffffffffe
 672b160: f9400102     	ldr	x2, [x8]
 672b164: 17fffe49     	b	0x672aa88 <_ChromeMain+0x67257ec>
 672b168: 927ff848     	and	x8, x2, #0xfffffffffffffffe
 672b16c: f9400102     	ldr	x2, [x8]
 672b170: 17fffe62     	b	0x672aaf8 <_ChromeMain+0x672585c>
 672b174: 927ff848     	and	x8, x2, #0xfffffffffffffffe
 672b178: f9400102     	ldr	x2, [x8]
 672b17c: 17fffe6c     	b	0x672ab2c <_ChromeMain+0x6725890>
 672b180: 927ff848     	and	x8, x2, #0xfffffffffffffffe
 672b184: f9400102     	ldr	x2, [x8]
 672b188: 17fffe77     	b	0x672ab64 <_ChromeMain+0x67258c8>
 672b18c: 927ff848     	and	x8, x2, #0xfffffffffffffffe
 672b190: f9400102     	ldr	x2, [x8]
 672b194: 17fffe7f     	b	0x672ab90 <_ChromeMain+0x67258f4>
 672b198: 927ff848     	and	x8, x2, #0xfffffffffffffffe
 672b19c: f9400102     	ldr	x2, [x8]
 672b1a0: 17fffe86     	b	0x672abb8 <_ChromeMain+0x672591c>
 672b1a4: 927ff848     	and	x8, x2, #0xfffffffffffffffe
 672b1a8: f9400102     	ldr	x2, [x8]
 672b1ac: 17fffe8d     	b	0x672abe0 <_ChromeMain+0x6725944>
 672b1b0: 927ff848     	and	x8, x2, #0xfffffffffffffffe
 672b1b4: f9400102     	ldr	x2, [x8]
 672b1b8: 17ffff34     	b	0x672ae88 <_ChromeMain+0x6725bec>
 672b1bc: 927ff848     	and	x8, x2, #0xfffffffffffffffe
 672b1c0: f9400102     	ldr	x2, [x8]
 672b1c4: 17ffff3d     	b	0x672aeb8 <_ChromeMain+0x6725c1c>
 672b1c8: 927ffac8     	and	x8, x22, #0xfffffffffffffffe
 672b1cc: f9400116     	ldr	x22, [x8]
 672b1d0: 17ffff44     	b	0x672aee0 <_ChromeMain+0x6725c44>
 672b1d4: 927ff848     	and	x8, x2, #0xfffffffffffffffe
 672b1d8: f9400102     	ldr	x2, [x8]
 672b1dc: 17fffecc     	b	0x672ad0c <_ChromeMain+0x6725a70>
 672b1e0: 927ff868     	and	x8, x3, #0xfffffffffffffffe
 672b1e4: f9400103     	ldr	x3, [x8]
 672b1e8: 17fffeb7     	b	0x672acc4 <_ChromeMain+0x6725a28>
 672b1ec: 927ff848     	and	x8, x2, #0xfffffffffffffffe
 672b1f0: f9400102     	ldr	x2, [x8]
 672b1f4: 17ffff44     	b	0x672af04 <_ChromeMain+0x6725c68>
 672b1f8: d4200000     	brk	#0
 672b1fc: d4400000     	hlt	#0
 672b200: d4200020     	brk	#0x1
