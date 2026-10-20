
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4250a14: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 4250a18: a90167fa     	stp	x26, x25, [sp, #0x10]
 4250a1c: a9025ff8     	stp	x24, x23, [sp, #0x20]
 4250a20: a90357f6     	stp	x22, x21, [sp, #0x30]
 4250a24: a9044ff4     	stp	x20, x19, [sp, #0x40]
 4250a28: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4250a2c: 910143fd     	add	x29, sp, #0x50
 4250a30: d10683ff     	sub	sp, sp, #0x1a0
 4250a34: aa0003f4     	mov	x20, x0
 4250a38: 37000182     	tbnz	w2, #0x0, 0x4250a68 <_ChromeMain+0x424b7cc>
 4250a3c: aa1403e0     	mov	x0, x20
 4250a40: 910683ff     	add	sp, sp, #0x1a0
 4250a44: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 4250a48: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4250a4c: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4250a50: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4250a54: a94167fa     	ldp	x26, x25, [sp, #0x10]
 4250a58: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 4250a5c: 140000f9     	b	0x4250e40 <_ChromeMain+0x424bba4>
 4250a60: d2800001     	mov	x1, #0x0                ; =0
 4250a64: 14000008     	b	0x4250a84 <_ChromeMain+0x424b7e8>
 4250a68: aa0103f3     	mov	x19, x1
 4250a6c: b9404a88     	ldr	w8, [x20, #0x48]
 4250a70: 34000468     	cbz	w8, 0x4250afc <_ChromeMain+0x424b860>
 4250a74: f9400a88     	ldr	x8, [x20, #0x10]
 4250a78: b4ffff48     	cbz	x8, 0x4250a60 <_ChromeMain+0x424b7c4>
 4250a7c: f9403108     	ldr	x8, [x8, #0x60]
 4250a80: f9413901     	ldr	x1, [x8, #0x270]
 4250a84: aa1403e0     	mov	x0, x20
 4250a88: 9400017f     	bl	0x4251084 <_ChromeMain+0x424bde8>
 4250a8c: 36000400     	tbz	w0, #0x0, 0x4250b0c <_ChromeMain+0x424b870>
 4250a90: 3902229f     	strb	wzr, [x20, #0x88]
 4250a94: f900429f     	str	xzr, [x20, #0x80]
 4250a98: f9401e88     	ldr	x8, [x20, #0x38]
 4250a9c: d37ef509     	lsl	x9, x8, #2
 4250aa0: b4000129     	cbz	x9, 0x4250ac4 <_ChromeMain+0x424b828>
 4250aa4: f9401a8a     	ldr	x10, [x20, #0x30]
 4250aa8: cb080be8     	neg	x8, x8, lsl #2
 4250aac: 8b0a0129     	add	x9, x9, x10
 4250ab0: d1001129     	sub	x9, x9, #0x4
 4250ab4: b40003e9     	cbz	x9, 0x4250b30 <_ChromeMain+0x424b894>
 4250ab8: d1001129     	sub	x9, x9, #0x4
 4250abc: 91001108     	add	x8, x8, #0x4
 4250ac0: b5ffffa8     	cbnz	x8, 0x4250ab4 <_ChromeMain+0x424b818>
 4250ac4: f9001e9f     	str	xzr, [x20, #0x38]
 4250ac8: aa1403e0     	mov	x0, x20
 4250acc: 9400037d     	bl	0x42518c0 <_ChromeMain+0x424c624>
 4250ad0: f9401680     	ldr	x0, [x20, #0x28]
 4250ad4: aa1303e1     	mov	x1, x19
 4250ad8: 52800002     	mov	w2, #0x0                ; =0
 4250adc: 910683ff     	add	sp, sp, #0x1a0
 4250ae0: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 4250ae4: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4250ae8: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4250aec: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4250af0: a94167fa     	ldp	x26, x25, [sp, #0x10]
 4250af4: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 4250af8: 17fa766d     	b	0x40ee4ac <_ChromeMain+0x40e9210>
 4250afc: d00564a8     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 4250b00: f9467d00     	ldr	x0, [x8, #0xcf8]
 4250b04: 975f3c1d     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 4250b08: b5000580     	cbnz	x0, 0x4250bb8 <_ChromeMain+0x424b91c>
 4250b0c: aa1403e0     	mov	x0, x20
 4250b10: 910683ff     	add	sp, sp, #0x1a0
 4250b14: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 4250b18: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4250b1c: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4250b20: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4250b24: a94167fa     	ldp	x26, x25, [sp, #0x10]
 4250b28: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 4250b2c: 1400023d     	b	0x4251420 <_ChromeMain+0x424c184>
 4250b30: d4200020     	brk	#0x1
 4250b34: 13001d09     	sxtb	w9, w8
 4250b38: 7100013f     	cmp	w9, #0x0
 4250b3c: a9452a89     	ldp	x9, x10, [x20, #0x50]
 4250b40: 9a964121     	csel	x1, x9, x22, mi
 4250b44: 9a884142     	csel	x2, x10, x8, mi
 4250b48: 910343e0     	add	x0, sp, #0xd0
 4250b4c: 9709602d     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 4250b50: 1400004e     	b	0x4250c88 <_ChromeMain+0x424b9ec>
 4250b54: f9402a80     	ldr	x0, [x20, #0x50]
 4250b58: f9403288     	ldr	x8, [x20, #0x60]
 4250b5c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4250b60: 96f6e0d6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4250b64: 1400001e     	b	0x4250bdc <_ChromeMain+0x424b940>
 4250b68: 13001d09     	sxtb	w9, w8
 4250b6c: 7100013f     	cmp	w9, #0x0
 4250b70: a946aa89     	ldp	x9, x10, [x20, #0x68]
 4250b74: 9a994121     	csel	x1, x9, x25, mi
 4250b78: 9a884142     	csel	x2, x10, x8, mi
 4250b7c: 91006300     	add	x0, x24, #0x18
 4250b80: 9719f72d     	bl	0x8ce834 <_ChromeMain+0x8c9598>
 4250b84: 1400004c     	b	0x4250cb4 <_ChromeMain+0x424ba18>
 4250b88: a9468a81     	ldp	x1, x2, [x20, #0x68]
 4250b8c: 91006300     	add	x0, x24, #0x18
 4250b90: 9719f6d7     	bl	0x8ce6ec <_ChromeMain+0x8c9450>
 4250b94: 14000048     	b	0x4250cb4 <_ChromeMain+0x424ba18>
 4250b98: a9450a81     	ldp	x1, x2, [x20, #0x50]
 4250b9c: 910343e0     	add	x0, sp, #0xd0
 4250ba0: 97095fc5     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4250ba4: 14000039     	b	0x4250c88 <_ChromeMain+0x424b9ec>
 4250ba8: 528000c8     	mov	w8, #0x6                ; =6
 4250bac: f9003a88     	str	x8, [x20, #0x70]
 4250bb0: f9403688     	ldr	x8, [x20, #0x68]
 4250bb4: 14000014     	b	0x4250c04 <_ChromeMain+0x424b968>
 4250bb8: aa0003f5     	mov	x21, x0
 4250bbc: 975f3c15     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 4250bc0: aa0003f7     	mov	x23, x0
 4250bc4: 910343e8     	add	x8, sp, #0xd0
 4250bc8: aa1503e0     	mov	x0, x21
 4250bcc: 94e1dad9     	bl	0x7ac7730 <_ChromeMain+0x7ac2494>
 4250bd0: 91014296     	add	x22, x20, #0x50
 4250bd4: 39c19e88     	ldrsb	w8, [x20, #0x67]
 4250bd8: 37fffbe8     	tbnz	w8, #0x1f, 0x4250b54 <_ChromeMain+0x424b8b8>
 4250bdc: 3dc037e0     	ldr	q0, [sp, #0xd0]
 4250be0: 3d8002c0     	str	q0, [x22]
 4250be4: f94073e8     	ldr	x8, [sp, #0xe0]
 4250be8: f9000ac8     	str	x8, [x22, #0x10]
 4250bec: 9101a299     	add	x25, x20, #0x68
 4250bf0: 39c1fe88     	ldrsb	w8, [x20, #0x7f]
 4250bf4: 37fffda8     	tbnz	w8, #0x1f, 0x4250ba8 <_ChromeMain+0x424b90c>
 4250bf8: 528000c8     	mov	w8, #0x6                ; =6
 4250bfc: 3901fe88     	strb	w8, [x20, #0x7f]
 4250c00: 9101a288     	add	x8, x20, #0x68
 4250c04: 52800e49     	mov	w9, #0x72               ; =114
 4250c08: 72a00d29     	movk	w9, #0x69, lsl #16
 4250c0c: b9000909     	str	w9, [x8, #0x8]
 4250c10: d004e949     	adrp	x9, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 4250c14: d503201f     	nop
 4250c18: f941bd29     	ldr	x9, [x9, #0x378]
 4250c1c: f9000109     	str	x9, [x8]
 4250c20: 7900191f     	strh	wzr, [x8, #0xc]
 4250c24: 910343f8     	add	x24, sp, #0xd0
 4250c28: f900cbff     	str	xzr, [sp, #0x190]
 4250c2c: 6f00e400     	movi.2d	v0, #0000000000000000
 4250c30: ad0b83e0     	stp	q0, q0, [sp, #0x170]
 4250c34: ad0a83e0     	stp	q0, q0, [sp, #0x150]
 4250c38: ad0983e0     	stp	q0, q0, [sp, #0x130]
 4250c3c: ad0883e0     	stp	q0, q0, [sp, #0x110]
 4250c40: ad0783e0     	stp	q0, q0, [sp, #0xf0]
 4250c44: ad0683e0     	stp	q0, q0, [sp, #0xd0]
 4250c48: 97ae25ff     	bl	0x2dda444 <_ChromeMain+0x2dd51a8>
 4250c4c: aa0003e1     	mov	x1, x0
 4250c50: 91022300     	add	x0, x24, #0x88
 4250c54: 97ae25ae     	bl	0x2dda30c <_ChromeMain+0x2dd5070>
 4250c58: 790323ff     	strh	wzr, [sp, #0x190]
 4250c5c: 39064bff     	strb	wzr, [sp, #0x192]
 4250c60: eb16031f     	cmp	x24, x22
 4250c64: 54000120     	b.eq	0x4250c88 <_ChromeMain+0x424b9ec>
 4250c68: 39c39fe9     	ldrsb	w9, [sp, #0xe7]
 4250c6c: 39419e88     	ldrb	w8, [x20, #0x67]
 4250c70: 37fff629     	tbnz	w9, #0x1f, 0x4250b34 <_ChromeMain+0x424b898>
 4250c74: 373ff928     	tbnz	w8, #0x7, 0x4250b98 <_ChromeMain+0x424b8fc>
 4250c78: 3dc002c0     	ldr	q0, [x22]
 4250c7c: 3d8037e0     	str	q0, [sp, #0xd0]
 4250c80: f9400ac8     	ldr	x8, [x22, #0x10]
 4250c84: f90073e8     	str	x8, [sp, #0xe0]
 4250c88: 9100631a     	add	x26, x24, #0x18
 4250c8c: eb19035f     	cmp	x26, x25
 4250c90: 54000120     	b.eq	0x4250cb4 <_ChromeMain+0x424ba18>
 4250c94: 39c3ffe9     	ldrsb	w9, [sp, #0xff]
 4250c98: 3941fe88     	ldrb	w8, [x20, #0x7f]
 4250c9c: 37fff669     	tbnz	w9, #0x1f, 0x4250b68 <_ChromeMain+0x424b8cc>
 4250ca0: 373ff748     	tbnz	w8, #0x7, 0x4250b88 <_ChromeMain+0x424b8ec>
 4250ca4: 3dc00320     	ldr	q0, [x25]
 4250ca8: 3d800340     	str	q0, [x26]
 4250cac: f9400b28     	ldr	x8, [x25, #0x10]
 4250cb0: f9000b48     	str	x8, [x26, #0x10]
 4250cb4: aa1703e0     	mov	x0, x23
 4250cb8: 94e1f49e     	bl	0x7acdf30 <_ChromeMain+0x7ac8c94>
 4250cbc: f94073e8     	ldr	x8, [sp, #0xe0]
 4250cc0: f9000be8     	str	x8, [sp, #0x10]
 4250cc4: f9400b48     	ldr	x8, [x26, #0x10]
 4250cc8: f90017e8     	str	x8, [sp, #0x28]
 4250ccc: 3dc037e0     	ldr	q0, [sp, #0xd0]
 4250cd0: 3d8003e0     	str	q0, [sp]
 4250cd4: a90d7fff     	stp	xzr, xzr, [sp, #0xd0]
 4250cd8: 3dc00340     	ldr	q0, [x26]
 4250cdc: 3c8183e0     	stur	q0, [sp, #0x18]
 4250ce0: a9007f5f     	stp	xzr, xzr, [x26]
 4250ce4: f9000b5f     	str	xzr, [x26, #0x10]
 4250ce8: f9408be8     	ldr	x8, [sp, #0x110]
 4250cec: f90023e8     	str	x8, [sp, #0x40]
 4250cf0: 3dc043e0     	ldr	q0, [sp, #0x100]
 4250cf4: 3d800fe0     	str	q0, [sp, #0x30]
 4250cf8: f90073ff     	str	xzr, [sp, #0xe0]
 4250cfc: a9107fff     	stp	xzr, xzr, [sp, #0x100]
 4250d00: 910067e8     	add	x8, sp, #0x19
 4250d04: 3ccff100     	ldur	q0, [x8, #0xff]
 4250d08: f94097e8     	ldr	x8, [sp, #0x128]
 4250d0c: f9002fe8     	str	x8, [sp, #0x58]
 4250d10: 3c8483e0     	stur	q0, [sp, #0x48]
 4250d14: a9127fff     	stp	xzr, xzr, [sp, #0x120]
 4250d18: a9117fff     	stp	xzr, xzr, [sp, #0x110]
 4250d1c: f9009fe0     	str	x0, [sp, #0x138]
 4250d20: ad4987e0     	ldp	q0, q1, [sp, #0x130]
 4250d24: f940abe8     	ldr	x8, [sp, #0x150]
 4250d28: f90043e8     	str	x8, [sp, #0x80]
 4250d2c: ad0307e0     	stp	q0, q1, [sp, #0x60]
 4250d30: a9147fff     	stp	xzr, xzr, [sp, #0x140]
 4250d34: 910003e8     	mov	x8, sp
 4250d38: f900abff     	str	xzr, [sp, #0x150]
 4250d3c: 91022100     	add	x0, x8, #0x88
 4250d40: 91022301     	add	x1, x24, #0x88
 4250d44: 97ae2572     	bl	0x2dda30c <_ChromeMain+0x2dd5070>
 4250d48: 784c0308     	ldurh	w8, [x24, #0xc0]
 4250d4c: 790183e8     	strh	w8, [sp, #0xc0]
 4250d50: 384c2308     	ldurb	w8, [x24, #0xc2]
 4250d54: 39030be8     	strb	w8, [sp, #0xc2]
 4250d58: 910003e1     	mov	x1, sp
 4250d5c: aa1703e0     	mov	x0, x23
 4250d60: 979ab504     	bl	0x28fe170 <_ChromeMain+0x28f8ed4>
 4250d64: 910003e0     	mov	x0, sp
 4250d68: 979bf9e7     	bl	0x294f504 <_ChromeMain+0x294a268>
 4250d6c: f9404a97     	ldr	x23, [x20, #0x90]
 4250d70: b40000d7     	cbz	x23, 0x4250d88 <_ChromeMain+0x424baec>
 4250d74: 52800028     	mov	w8, #0x1                ; =1
 4250d78: b82802e8     	ldadd	w8, w8, [x23]
 4250d7c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4250d80: 6b09011f     	cmp	w8, w9
 4250d84: 54000580     	b.eq	0x4250e34 <_ChromeMain+0x424bb98>
 4250d88: f9404e98     	ldr	x24, [x20, #0x98]
 4250d8c: 52800b00     	mov	w0, #0x58               ; =88
 4250d90: 96f6f976     	bl	0xf368 <_ChromeMain+0xa0cc>
 4250d94: aa0003f4     	mov	x20, x0
 4250d98: 52800028     	mov	w8, #0x1                ; =1
 4250d9c: b9000008     	str	w8, [x0]
 4250da0: f0ffeb28     	adrp	x8, 0x3fb7000 <_ChromeMain+0x3fb1d64>
 4250da4: 91300108     	add	x8, x8, #0xc00
 4250da8: d0fff0c9     	adrp	x9, 0x406a000 <_ChromeMain+0x4064d64>
 4250dac: 913a0129     	add	x9, x9, #0xe80
 4250db0: a900a408     	stp	x8, x9, [x0, #0x8]
 4250db4: d0fff2e8     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 4250db8: 911b0108     	add	x8, x8, #0x6c0
 4250dbc: 100046c9     	adr	x9, 0x4251694 <_ChromeMain+0x424c3f8>
 4250dc0: d503201f     	nop
 4250dc4: a901a408     	stp	x8, x9, [x0, #0x18]
 4250dc8: a902dc1f     	stp	xzr, x23, [x0, #0x28]
 4250dcc: f9001c18     	str	x24, [x0, #0x38]
 4250dd0: 39c05e68     	ldrsb	w8, [x19, #0x17]
 4250dd4: 37f80288     	tbnz	w8, #0x1f, 0x4250e24 <_ChromeMain+0x424bb88>
 4250dd8: 3dc00260     	ldr	q0, [x19]
 4250ddc: 3c840280     	stur	q0, [x20, #0x40]
 4250de0: f9400a68     	ldr	x8, [x19, #0x10]
 4250de4: f8050288     	stur	x8, [x20, #0x50]
 4250de8: aa1503e0     	mov	x0, x21
 4250dec: aa1603e1     	mov	x1, x22
 4250df0: aa1403e2     	mov	x2, x20
 4250df4: d2800003     	mov	x3, #0x0                ; =0
 4250df8: 94e1d73d     	bl	0x7ac6aec <_ChromeMain+0x7ac1850>
 4250dfc: 910343e0     	add	x0, sp, #0xd0
 4250e00: 979bf9c1     	bl	0x294f504 <_ChromeMain+0x294a268>
 4250e04: 910683ff     	add	sp, sp, #0x1a0
 4250e08: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 4250e0c: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4250e10: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4250e14: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4250e18: a94167fa     	ldp	x26, x25, [sp, #0x10]
 4250e1c: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 4250e20: d65f03c0     	ret
 4250e24: a9400a61     	ldp	x1, x2, [x19]
 4250e28: 91010280     	add	x0, x20, #0x40
 4250e2c: 96f71cfb     	bl	0x18218 <_ChromeMain+0x12f7c>
 4250e30: 17ffffee     	b	0x4250de8 <_ChromeMain+0x424bb4c>
 4250e34: d4200000     	brk	#0
 4250e38: d4400000     	hlt	#0
 4250e3c: d4200020     	brk	#0x1
 4250e40: d10343ff     	sub	sp, sp, #0xd0
 4250e44: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 4250e48: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 4250e4c: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 4250e50: 910303fd     	add	x29, sp, #0xc0
 4250e54: 9004eec8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 4250e58: f940f908     	ldr	x8, [x8, #0x1f0]
 4250e5c: f9400108     	ldr	x8, [x8]
 4250e60: f81d83a8     	stur	x8, [x29, #-0x28]
 4250e64: f9400808     	ldr	x8, [x0, #0x10]
 4250e68: b4000bc8     	cbz	x8, 0x4250fe0 <_ChromeMain+0x424bd44>
 4250e6c: aa0003f3     	mov	x19, x0
 4250e70: f9403100     	ldr	x0, [x8, #0x60]
 4250e74: b4000660     	cbz	x0, 0x4250f40 <_ChromeMain+0x424bca4>
 4250e78: d00564a8     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 4250e7c: f9467d08     	ldr	x8, [x8, #0xcf8]
 4250e80: f9414908     	ldr	x8, [x8, #0x290]
 4250e84: f9400514     	ldr	x20, [x8, #0x8]
 4250e88: 970d3d9b     	bl	0x5a04f4 <_ChromeMain+0x59b258>
 4250e8c: b40005a0     	cbz	x0, 0x4250f40 <_ChromeMain+0x424bca4>
 4250e90: f9402808     	ldr	x8, [x0, #0x50]
 4250e94: b5000068     	cbnz	x8, 0x4250ea0 <_ChromeMain+0x424bc04>
 4250e98: f9402409     	ldr	x9, [x0, #0x48]
 4250e9c: b4000529     	cbz	x9, 0x4250f40 <_ChromeMain+0x424bca4>
 4250ea0: 52800a09     	mov	w9, #0x50               ; =80
 4250ea4: 5280090a     	mov	w10, #0x48              ; =72
 4250ea8: f100011f     	cmp	x8, #0x0
 4250eac: 9a890148     	csel	x8, x10, x9, eq
 4250eb0: f8686808     	ldr	x8, [x0, x8]
 4250eb4: f9400908     	ldr	x8, [x8, #0x10]
 4250eb8: f9400515     	ldr	x21, [x8, #0x8]
 4250ebc: b4000435     	cbz	x21, 0x4250f40 <_ChromeMain+0x424bca4>
 4250ec0: 9100a2a8     	add	x8, x21, #0x28
 4250ec4: 3900a3ff     	strb	wzr, [sp, #0x28]
 4250ec8: 9100a3e9     	add	x9, sp, #0x28
 4250ecc: a90623e9     	stp	x9, x8, [sp, #0x60]
 4250ed0: b0fe5b02     	adrp	x2, 0xdb1000 <_ChromeMain+0xdabd64>
 4250ed4: 912dc042     	add	x2, x2, #0xb70
 4250ed8: 910183e1     	add	x1, sp, #0x60
 4250edc: aa1403e0     	mov	x0, x20
 4250ee0: 52800003     	mov	w3, #0x0                ; =0
 4250ee4: 52800004     	mov	w4, #0x0                ; =0
 4250ee8: 972d8262     	bl	0xdb1870 <_ChromeMain+0xdac5d4>
 4250eec: 3940a3e8     	ldrb	w8, [sp, #0x28]
 4250ef0: 34000288     	cbz	w8, 0x4250f40 <_ChromeMain+0x424bca4>
 4250ef4: f9403ea8     	ldr	x8, [x21, #0x78]
 4250ef8: b4000248     	cbz	x8, 0x4250f40 <_ChromeMain+0x424bca4>
 4250efc: f85d83a8     	ldur	x8, [x29, #-0x28]
 4250f00: 9004eec9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 4250f04: f940f929     	ldr	x9, [x9, #0x1f0]
 4250f08: f9400129     	ldr	x9, [x9]
 4250f0c: eb08013f     	cmp	x9, x8
 4250f10: 54000b81     	b.ne	0x4251080 <_ChromeMain+0x424bde4>
 4250f14: d004e940     	adrp	x0, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 4250f18: 910e5800     	add	x0, x0, #0x396
 4250f1c: 900465c2     	adrp	x2, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4250f20: 91011842     	add	x2, x2, #0x46
 4250f24: 528002e1     	mov	w1, #0x17               ; =23
 4250f28: 52800523     	mov	w3, #0x29               ; =41
 4250f2c: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 4250f30: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 4250f34: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 4250f38: 910343ff     	add	sp, sp, #0xd0
 4250f3c: 140cf16c     	b	0x458d4ec <_ChromeMain+0x4588250>
 4250f40: f9400a73     	ldr	x19, [x19, #0x10]
 4250f44: f004c661     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4250f48: 91064021     	add	x1, x1, #0x190
 4250f4c: 9100a3e0     	add	x0, sp, #0x28
 4250f50: 979c83e4     	bl	0x2971ee0 <_ChromeMain+0x296cc44>
 4250f54: 910123e0     	add	x0, sp, #0x48
 4250f58: 9100a3e1     	add	x1, sp, #0x28
 4250f5c: 97793b35     	bl	0x209fc30 <_ChromeMain+0x209a994>
 4250f60: 900465c1     	adrp	x1, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4250f64: 91026821     	add	x1, x1, #0x9a
 4250f68: 910023e0     	add	x0, sp, #0x8
 4250f6c: 979c83dd     	bl	0x2971ee0 <_ChromeMain+0x296cc44>
 4250f70: 910183e8     	add	x8, sp, #0x60
 4250f74: a9087fff     	stp	xzr, xzr, [sp, #0x80]
 4250f78: 3cc483e0     	ldur	q0, [sp, #0x48]
 4250f7c: 3d801be0     	str	q0, [sp, #0x60]
 4250f80: f9402fe9     	ldr	x9, [sp, #0x58]
 4250f84: a9077fe9     	stp	x9, xzr, [sp, #0x70]
 4250f88: 91006100     	add	x0, x8, #0x18
 4250f8c: 910023e1     	add	x1, sp, #0x8
 4250f90: 97793b28     	bl	0x209fc30 <_ChromeMain+0x209a994>
 4250f94: d004b961     	adrp	x1, 0xd97e000 <dyld_stub_binder+0xd97e000>
 4250f98: 911e5021     	add	x1, x1, #0x794
 4250f9c: 910183e3     	add	x3, sp, #0x60
 4250fa0: aa1303e0     	mov	x0, x19
 4250fa4: 52800302     	mov	w2, #0x18               ; =24
 4250fa8: 52800044     	mov	w4, #0x2                ; =2
 4250fac: 949d85ea     	bl	0x69b2754 <_ChromeMain+0x69ad4b8>
 4250fb0: 394083e8     	ldrb	w8, [sp, #0x20]
 4250fb4: b0053393     	adrp	x19, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 4250fb8: 9121e273     	add	x19, x19, #0x878
 4250fbc: 7103fd1f     	cmp	w8, #0xff
 4250fc0: 54000060     	b.eq	0x4250fcc <_ChromeMain+0x424bd30>
 4250fc4: 721e791f     	tst	w8, #0xfffffffd
 4250fc8: 54000361     	b.ne	0x4251034 <_ChromeMain+0x424bd98>
 4250fcc: 394103e8     	ldrb	w8, [sp, #0x40]
 4250fd0: 7103fd1f     	cmp	w8, #0xff
 4250fd4: 54000060     	b.eq	0x4250fe0 <_ChromeMain+0x424bd44>
 4250fd8: 721e791f     	tst	w8, #0xfffffffd
 4250fdc: 54000181     	b.ne	0x425100c <_ChromeMain+0x424bd70>
 4250fe0: f85d83a8     	ldur	x8, [x29, #-0x28]
 4250fe4: 9004eec9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 4250fe8: f940f929     	ldr	x9, [x9, #0x1f0]
 4250fec: f9400129     	ldr	x9, [x9]
 4250ff0: eb08013f     	cmp	x9, x8
 4250ff4: 54000461     	b.ne	0x4251080 <_ChromeMain+0x424bde4>
 4250ff8: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 4250ffc: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 4251000: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 4251004: 910343ff     	add	sp, sp, #0xd0
 4251008: d65f03c0     	ret
 425100c: 7100111f     	cmp	w8, #0x4
 4251010: 540000c0     	b.eq	0x4251028 <_ChromeMain+0x424bd8c>
 4251014: f8685a68     	ldr	x8, [x19, w8, uxtw #3]
 4251018: 910183e0     	add	x0, sp, #0x60
 425101c: 9100a3e1     	add	x1, sp, #0x28
 4251020: d63f0100     	blr	x8
 4251024: 17ffffef     	b	0x4250fe0 <_ChromeMain+0x424bd44>
 4251028: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 425102c: 36fffda8     	tbz	w8, #0x1f, 0x4250fe0 <_ChromeMain+0x424bd44>
 4251030: 1400000f     	b	0x425106c <_ChromeMain+0x424bdd0>
 4251034: 7100111f     	cmp	w8, #0x4
 4251038: 540000c0     	b.eq	0x4251050 <_ChromeMain+0x424bdb4>
 425103c: f8685a68     	ldr	x8, [x19, w8, uxtw #3]
 4251040: 910183e0     	add	x0, sp, #0x60
 4251044: 910023e1     	add	x1, sp, #0x8
 4251048: d63f0100     	blr	x8
 425104c: 17ffffe0     	b	0x4250fcc <_ChromeMain+0x424bd30>
 4251050: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 4251054: 36fffbc8     	tbz	w8, #0x1f, 0x4250fcc <_ChromeMain+0x424bd30>
 4251058: f94007e0     	ldr	x0, [sp, #0x8]
 425105c: f9400fe8     	ldr	x8, [sp, #0x18]
 4251060: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4251064: 96f6df95     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4251068: 17ffffd9     	b	0x4250fcc <_ChromeMain+0x424bd30>
 425106c: f94017e0     	ldr	x0, [sp, #0x28]
 4251070: f9401fe8     	ldr	x8, [sp, #0x38]
 4251074: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4251078: 96f6df90     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425107c: 17ffffd9     	b	0x4250fe0 <_ChromeMain+0x424bd44>
 4251080: 94f6ccb8     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 4251084: d10303ff     	sub	sp, sp, #0xc0
 4251088: a9066ffc     	stp	x28, x27, [sp, #0x60]
 425108c: a90767fa     	stp	x26, x25, [sp, #0x70]
 4251090: a9085ff8     	stp	x24, x23, [sp, #0x80]
 4251094: a90957f6     	stp	x22, x21, [sp, #0x90]
 4251098: a90a4ff4     	stp	x20, x19, [sp, #0xa0]
 425109c: a90b7bfd     	stp	x29, x30, [sp, #0xb0]
 42510a0: 9102c3fd     	add	x29, sp, #0xb0
 42510a4: aa0103fb     	mov	x27, x1
 42510a8: aa0003f3     	mov	x19, x0
 42510ac: f9401400     	ldr	x0, [x0, #0x28]
 42510b0: f900167f     	str	xzr, [x19, #0x28]
 42510b4: b5000740     	cbnz	x0, 0x425119c <_ChromeMain+0x424bf00>
 42510b8: f9401260     	ldr	x0, [x19, #0x20]
 42510bc: f900127f     	str	xzr, [x19, #0x20]
 42510c0: b4000080     	cbz	x0, 0x42510d0 <_ChromeMain+0x424be34>
 42510c4: 97b84c59     	bl	0x3064228 <_ChromeMain+0x305ef8c>
 42510c8: 52802f01     	mov	w1, #0x178              ; =376
 42510cc: 96f6df7b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42510d0: 3902227f     	strb	wzr, [x19, #0x88]
 42510d4: f900427f     	str	xzr, [x19, #0x80]
 42510d8: f9401e68     	ldr	x8, [x19, #0x38]
 42510dc: d37ef509     	lsl	x9, x8, #2
 42510e0: b4000129     	cbz	x9, 0x4251104 <_ChromeMain+0x424be68>
 42510e4: f9401a6a     	ldr	x10, [x19, #0x30]
 42510e8: cb080be8     	neg	x8, x8, lsl #2
 42510ec: 8b0a0129     	add	x9, x9, x10
 42510f0: d1001129     	sub	x9, x9, #0x4
 42510f4: b40005c9     	cbz	x9, 0x42511ac <_ChromeMain+0x424bf10>
 42510f8: d1001129     	sub	x9, x9, #0x4
 42510fc: 91001108     	add	x8, x8, #0x4
 4251100: b5ffffa8     	cbnz	x8, 0x42510f4 <_ChromeMain+0x424be58>
 4251104: f9001e7f     	str	xzr, [x19, #0x38]
 4251108: b400037b     	cbz	x27, 0x4251174 <_ChromeMain+0x424bed8>
 425110c: 97ac4912     	bl	0x2d63554 <_ChromeMain+0x2d5e2b8>
 4251110: aa1b03e1     	mov	x1, x27
 4251114: 52800022     	mov	w2, #0x1                ; =1
 4251118: 96f8071f     	bl	0x52d94 <_ChromeMain+0x4daf8>
 425111c: aa0003fc     	mov	x28, x0
 4251120: aa1b03e0     	mov	x0, x27
 4251124: 974fffae     	bl	0x1650fdc <_ChromeMain+0x164bd40>
 4251128: aa0003fa     	mov	x26, x0
 425112c: aa1b03e0     	mov	x0, x27
 4251130: 52800001     	mov	w1, #0x0                ; =0
 4251134: 976c6452     	bl	0x1d6a27c <_ChromeMain+0x1d64fe0>
 4251138: aa0003f7     	mov	x23, x0
 425113c: aa1b03e0     	mov	x0, x27
 4251140: 9726a9cf     	bl	0xbfb87c <_ChromeMain+0xbf65e0>
 4251144: aa0003f8     	mov	x24, x0
 4251148: aa1b03e0     	mov	x0, x27
 425114c: 97a574d5     	bl	0x2bae4a0 <_ChromeMain+0x2ba9204>
 4251150: aa0003f9     	mov	x25, x0
 4251154: aa1b03e0     	mov	x0, x27
 4251158: 977d6f9a     	bl	0x21acfc0 <_ChromeMain+0x21a7d24>
 425115c: f100033f     	cmp	x25, #0x0
 4251160: fa401b04     	ccmp	x24, #0x0, #0x4, ne
 4251164: fa401ae4     	ccmp	x23, #0x0, #0x4, ne
 4251168: fa401b44     	ccmp	x26, #0x0, #0x4, ne
 425116c: fa401b84     	ccmp	x28, #0x0, #0x4, ne
 4251170: 54000201     	b.ne	0x42511b0 <_ChromeMain+0x424bf14>
 4251174: 52800014     	mov	w20, #0x0               ; =0
 4251178: aa1403e0     	mov	x0, x20
 425117c: a94b7bfd     	ldp	x29, x30, [sp, #0xb0]
 4251180: a94a4ff4     	ldp	x20, x19, [sp, #0xa0]
 4251184: a94957f6     	ldp	x22, x21, [sp, #0x90]
 4251188: a9485ff8     	ldp	x24, x23, [sp, #0x80]
 425118c: a94767fa     	ldp	x26, x25, [sp, #0x70]
 4251190: a9466ffc     	ldp	x28, x27, [sp, #0x60]
 4251194: 910303ff     	add	sp, sp, #0xc0
 4251198: d65f03c0     	ret
 425119c: 94d3f248     	bl	0x774dabc <_ChromeMain+0x7748820>
 42511a0: 52805801     	mov	w1, #0x2c0              ; =704
 42511a4: 96f6df45     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42511a8: 17ffffc4     	b	0x42510b8 <_ChromeMain+0x424be1c>
 42511ac: d4200020     	brk	#0x1
 42511b0: f9001fe0     	str	x0, [sp, #0x38]
 42511b4: aa1b03e0     	mov	x0, x27
 42511b8: 52800001     	mov	w1, #0x0                ; =0
 42511bc: 97b4be58     	bl	0x2f80b1c <_ChromeMain+0x2f7b880>
 42511c0: aa0003f5     	mov	x21, x0
 42511c4: aa1b03e0     	mov	x0, x27
 42511c8: 52800001     	mov	w1, #0x0                ; =0
 42511cc: 975769e0     	bl	0x182b94c <_ChromeMain+0x18266b0>
 42511d0: aa0003f6     	mov	x22, x0
 42511d4: f10002bf     	cmp	x21, #0x0
 42511d8: fa401804     	ccmp	x0, #0x0, #0x4, ne
 42511dc: 1a9f07f4     	cset	w20, ne
 42511e0: 54000061     	b.ne	0x42511ec <_ChromeMain+0x424bf50>
 42511e4: b5000c76     	cbnz	x22, 0x4251370 <_ChromeMain+0x424c0d4>
 42511e8: 14000069     	b	0x425138c <_ChromeMain+0x424c0f0>
 42511ec: 52802f00     	mov	w0, #0x178              ; =376
 42511f0: 96f6f85e     	bl	0xf368 <_ChromeMain+0xa0cc>
 42511f4: 910022a9     	add	x9, x21, #0x8
 42511f8: 52800028     	mov	w8, #0x1                ; =1
 42511fc: b828012a     	ldadd	w8, w10, [x9]
 4251200: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4251204: 6b09015f     	cmp	w10, w9
 4251208: 54000e40     	b.eq	0x42513d0 <_ChromeMain+0x424c134>
 425120c: 910022ca     	add	x10, x22, #0x8
 4251210: b8280148     	ldadd	w8, w8, [x10]
 4251214: 6b09011f     	cmp	w8, w9
 4251218: 54000e20     	b.eq	0x42513dc <_ChromeMain+0x424c140>
 425121c: aa1c03e1     	mov	x1, x28
 4251220: aa1503e2     	mov	x2, x21
 4251224: aa1603e3     	mov	x3, x22
 4251228: d2800004     	mov	x4, #0x0                ; =0
 425122c: 97ac4915     	bl	0x2d63680 <_ChromeMain+0x2d5e3e4>
 4251230: f940127c     	ldr	x28, [x19, #0x20]
 4251234: f9001be0     	str	x0, [sp, #0x30]
 4251238: f9001260     	str	x0, [x19, #0x20]
 425123c: b40000fc     	cbz	x28, 0x4251258 <_ChromeMain+0x424bfbc>
 4251240: aa1c03e0     	mov	x0, x28
 4251244: 97b84bf9     	bl	0x3064228 <_ChromeMain+0x305ef8c>
 4251248: 52802f01     	mov	w1, #0x178              ; =376
 425124c: 96f6df1b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4251250: f9401268     	ldr	x8, [x19, #0x20]
 4251254: f9001be8     	str	x8, [sp, #0x30]
 4251258: f940275c     	ldr	x28, [x26, #0x48]
 425125c: f9400368     	ldr	x8, [x27]
 4251260: f940b508     	ldr	x8, [x8, #0x168]
 4251264: aa1b03e0     	mov	x0, x27
 4251268: d63f0100     	blr	x8
 425126c: aa0003fb     	mov	x27, x0
 4251270: 52800b00     	mov	w0, #0x58               ; =88
 4251274: 96f6f83d     	bl	0xf368 <_ChromeMain+0xa0cc>
 4251278: aa0003fa     	mov	x26, x0
 425127c: b00500a8     	adrp	x8, 0xe266000 <dyld_stub_binder+0xe266000>
 4251280: 91372108     	add	x8, x8, #0xdc8
 4251284: f9000008     	str	x8, [x0]
 4251288: 6f00e400     	movi.2d	v0, #0000000000000000
 425128c: 3c808000     	stur	q0, [x0, #0x8]
 4251290: 3c818000     	stur	q0, [x0, #0x18]
 4251294: b900281f     	str	wzr, [x0, #0x28]
 4251298: a9037c1f     	stp	xzr, xzr, [x0, #0x30]
 425129c: b900401f     	str	wzr, [x0, #0x40]
 42512a0: 52800100     	mov	w0, #0x8                ; =8
 42512a4: 96f6f831     	bl	0xf368 <_ChromeMain+0xa0cc>
 42512a8: b900001f     	str	wzr, [x0]
 42512ac: 3900101f     	strb	wzr, [x0, #0x4]
 42512b0: b40000c0     	cbz	x0, 0x42512c8 <_ChromeMain+0x424c02c>
 42512b4: 52800028     	mov	w8, #0x1                ; =1
 42512b8: b8280008     	ldadd	w8, w8, [x0]
 42512bc: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 42512c0: 6b09011f     	cmp	w8, w9
 42512c4: 54000980     	b.eq	0x42513f4 <_ChromeMain+0x424c158>
 42512c8: a90257fc     	stp	x28, x21, [sp, #0x20]
 42512cc: a904eb40     	stp	x0, x26, [x26, #0x48]
 42512d0: b00564a8     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 42512d4: f9467d08     	ldr	x8, [x8, #0xcf8]
 42512d8: f9414909     	ldr	x9, [x8, #0x290]
 42512dc: f9000ffb     	str	x27, [sp, #0x18]
 42512e0: b4000909     	cbz	x9, 0x4251400 <_ChromeMain+0x424c164>
 42512e4: f9402935     	ldr	x21, [x9, #0x50]
 42512e8: b4000815     	cbz	x21, 0x42513e8 <_ChromeMain+0x424c14c>
 42512ec: 52805800     	mov	w0, #0x2c0              ; =704
 42512f0: 96f6f81e     	bl	0xf368 <_ChromeMain+0xa0cc>
 42512f4: aa0003fc     	mov	x28, x0
 42512f8: 91002268     	add	x8, x19, #0x8
 42512fc: f100027f     	cmp	x19, #0x0
 4251300: 9a8803fb     	csel	x27, xzr, x8, eq
 4251304: 39c05ea8     	ldrsb	w8, [x21, #0x17]
 4251308: 37f80548     	tbnz	w8, #0x1f, 0x42513b0 <_ChromeMain+0x424c114>
 425130c: 3dc002a0     	ldr	q0, [x21]
 4251310: f9400aa8     	ldr	x8, [x21, #0x10]
 4251314: f9002be8     	str	x8, [sp, #0x50]
 4251318: 3d8013e0     	str	q0, [sp, #0x40]
 425131c: 910103e8     	add	x8, sp, #0x40
 4251320: a900a3fa     	stp	x26, x8, [sp, #0x8]
 4251324: a9418fe8     	ldp	x8, x3, [sp, #0x18]
 4251328: f90003e8     	str	x8, [sp]
 425132c: aa1c03e0     	mov	x0, x28
 4251330: aa1b03e1     	mov	x1, x27
 4251334: a9431fe2     	ldp	x2, x7, [sp, #0x30]
 4251338: aa1703e4     	mov	x4, x23
 425133c: aa1803e5     	mov	x5, x24
 4251340: aa1903e6     	mov	x6, x25
 4251344: 97fa732c     	bl	0x40edff4 <_ChromeMain+0x40e8d58>
 4251348: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 425134c: f94017f5     	ldr	x21, [sp, #0x28]
 4251350: 36f800a8     	tbz	w8, #0x1f, 0x4251364 <_ChromeMain+0x424c0c8>
 4251354: f94023e0     	ldr	x0, [sp, #0x40]
 4251358: f9402be8     	ldr	x8, [sp, #0x50]
 425135c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4251360: 96f6ded6     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4251364: f9401660     	ldr	x0, [x19, #0x28]
 4251368: f900167c     	str	x28, [x19, #0x28]
 425136c: b50002a0     	cbnz	x0, 0x42513c0 <_ChromeMain+0x424c124>
 4251370: 910022c8     	add	x8, x22, #0x8
 4251374: 12800009     	mov	w9, #-0x1               ; =-1
 4251378: b8e90108     	ldaddal	w9, w8, [x8]
 425137c: 7100051f     	cmp	w8, #0x1
 4251380: 54000061     	b.ne	0x425138c <_ChromeMain+0x424c0f0>
 4251384: aa1603e0     	mov	x0, x22
 4251388: 97925bf5     	bl	0x26e835c <_ChromeMain+0x26e30c0>
 425138c: b4ffef75     	cbz	x21, 0x4251178 <_ChromeMain+0x424bedc>
 4251390: 910022a8     	add	x8, x21, #0x8
 4251394: 12800009     	mov	w9, #-0x1               ; =-1
 4251398: b8e90108     	ldaddal	w9, w8, [x8]
 425139c: 7100051f     	cmp	w8, #0x1
 42513a0: 54ffeec1     	b.ne	0x4251178 <_ChromeMain+0x424bedc>
 42513a4: aa1503e0     	mov	x0, x21
 42513a8: 97925bed     	bl	0x26e835c <_ChromeMain+0x26e30c0>
 42513ac: 17ffff73     	b	0x4251178 <_ChromeMain+0x424bedc>
 42513b0: a9400aa1     	ldp	x1, x2, [x21]
 42513b4: 910103e0     	add	x0, sp, #0x40
 42513b8: 96f71b98     	bl	0x18218 <_ChromeMain+0x12f7c>
 42513bc: 17ffffd8     	b	0x425131c <_ChromeMain+0x424c080>
 42513c0: 94d3f1bf     	bl	0x774dabc <_ChromeMain+0x7748820>
 42513c4: 52805801     	mov	w1, #0x2c0              ; =704
 42513c8: 96f6debc     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42513cc: 17ffffe9     	b	0x4251370 <_ChromeMain+0x424c0d4>
 42513d0: d4200000     	brk	#0
 42513d4: d4400000     	hlt	#0
 42513d8: d4200020     	brk	#0x1
 42513dc: d4200000     	brk	#0
 42513e0: d4400000     	hlt	#0
 42513e4: d4200020     	brk	#0x1
 42513e8: d4200000     	brk	#0
 42513ec: d4400000     	hlt	#0
 42513f0: d4200020     	brk	#0x1
 42513f4: d4200000     	brk	#0
 42513f8: d4400000     	hlt	#0
 42513fc: d4200020     	brk	#0x1
 4251400: f9400900     	ldr	x0, [x8, #0x10]
 4251404: 9785ecfd     	bl	0x23cc7f8 <_ChromeMain+0x23c755c>
 4251408: 91004015     	add	x21, x0, #0x10
 425140c: 17ffffb8     	b	0x42512ec <_ChromeMain+0x424c050>
		...
 4251420: d10303ff     	sub	sp, sp, #0xc0
 4251424: a90a4ff4     	stp	x20, x19, [sp, #0xa0]
 4251428: a90b7bfd     	stp	x29, x30, [sp, #0xb0]
 425142c: 9102c3fd     	add	x29, sp, #0xb0
 4251430: aa0003f3     	mov	x19, x0
 4251434: f004eea8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 4251438: f940f908     	ldr	x8, [x8, #0x1f0]
 425143c: f9400108     	ldr	x8, [x8]
 4251440: f81e83a8     	stur	x8, [x29, #-0x18]
 4251444: 39819c08     	ldrsb	x8, [x0, #0x67]
 4251448: b6f80048     	tbz	x8, #0x3f, 0x4251450 <_ChromeMain+0x424c1b4>
 425144c: f9402e68     	ldr	x8, [x19, #0x58]
 4251450: b40006a8     	cbz	x8, 0x4251524 <_ChromeMain+0x424c288>
 4251454: b00564b4     	adrp	x20, 0xeee6000 <dyld_stub_binder+0xeee6000>
 4251458: f9467e80     	ldr	x0, [x20, #0xcf8]
 425145c: b4000100     	cbz	x0, 0x425147c <_ChromeMain+0x424c1e0>
 4251460: 975f39c6     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 4251464: b40000c0     	cbz	x0, 0x425147c <_ChromeMain+0x424c1e0>
 4251468: f9467e80     	ldr	x0, [x20, #0xcf8]
 425146c: 975f39c3     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 4251470: 975f39e8     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 4251474: 91014261     	add	x1, x19, #0x50
 4251478: 94e1f062     	bl	0x7acd600 <_ChromeMain+0x7ac8364>
 425147c: d004c660     	adrp	x0, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4251480: 9106ac00     	add	x0, x0, #0x1ab
 4251484: d004c661     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4251488: 91043821     	add	x1, x1, #0x10e
 425148c: d10143a8     	sub	x8, x29, #0x50
 4251490: 52805e02     	mov	w2, #0x2f0              ; =752
 4251494: 96f7fdfb     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4251498: 52800800     	mov	w0, #0x40               ; =64
 425149c: 96f6f7b3     	bl	0xf368 <_ChromeMain+0xa0cc>
 42514a0: aa0003f4     	mov	x20, x0
 42514a4: 52800028     	mov	w8, #0x1                ; =1
 42514a8: b9000008     	str	w8, [x0]
 42514ac: 90ffb968     	adrp	x8, 0x397d000 <_ChromeMain+0x3977d64>
 42514b0: 911f3108     	add	x8, x8, #0x7cc
 42514b4: 90ffeb49     	adrp	x9, 0x3fb9000 <_ChromeMain+0x3fb3d64>
 42514b8: 91310129     	add	x9, x9, #0xc40
 42514bc: a900a408     	stp	x8, x9, [x0, #0x8]
 42514c0: 90ff1868     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 42514c4: 912c0108     	add	x8, x8, #0xb00
 42514c8: f9000c08     	str	x8, [x0, #0x18]
 42514cc: 39c19e68     	ldrsb	w8, [x19, #0x67]
 42514d0: 37f80528     	tbnz	w8, #0x1f, 0x4251574 <_ChromeMain+0x424c2d8>
 42514d4: 3cc50260     	ldur	q0, [x19, #0x50]
 42514d8: 3c828280     	stur	q0, [x20, #0x28]
 42514dc: f8460268     	ldur	x8, [x19, #0x60]
 42514e0: f8038288     	stur	x8, [x20, #0x38]
 42514e4: 900565c8     	adrp	x8, 0xef09000 <dyld_stub_binder+0xef09000>
 42514e8: f940d500     	ldr	x0, [x8, #0x1a8]
 42514ec: f00465a2     	adrp	x2, 0xcf08000 <dyld_stub_binder+0xcf08000>
 42514f0: 91032c42     	add	x2, x2, #0xcb
 42514f4: d10143a1     	sub	x1, x29, #0x50
 42514f8: aa1403e3     	mov	x3, x20
 42514fc: d2800004     	mov	x4, #0x0                ; =0
 4251500: 9709b2a0     	bl	0x4bdf80 <_ChromeMain+0x4b8ce4>
 4251504: 39c19e68     	ldrsb	w8, [x19, #0x67]
 4251508: 37f802e8     	tbnz	w8, #0x1f, 0x4251564 <_ChromeMain+0x424c2c8>
 425150c: 3901427f     	strb	wzr, [x19, #0x50]
 4251510: 39019e7f     	strb	wzr, [x19, #0x67]
 4251514: 39c1fe68     	ldrsb	w8, [x19, #0x7f]
 4251518: 37f801e8     	tbnz	w8, #0x1f, 0x4251554 <_ChromeMain+0x424c2b8>
 425151c: 7900d27f     	strh	wzr, [x19, #0x68]
 4251520: 3901fe7f     	strb	wzr, [x19, #0x7f]
 4251524: f9400a73     	ldr	x19, [x19, #0x10]
 4251528: b50002f3     	cbnz	x19, 0x4251584 <_ChromeMain+0x424c2e8>
 425152c: f85e83a8     	ldur	x8, [x29, #-0x18]
 4251530: f004eea9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 4251534: f940f929     	ldr	x9, [x9, #0x1f0]
 4251538: f9400129     	ldr	x9, [x9]
 425153c: eb08013f     	cmp	x9, x8
 4251540: 54000a81     	b.ne	0x4251690 <_ChromeMain+0x424c3f4>
 4251544: a94b7bfd     	ldp	x29, x30, [sp, #0xb0]
 4251548: a94a4ff4     	ldp	x20, x19, [sp, #0xa0]
 425154c: 910303ff     	add	sp, sp, #0xc0
 4251550: d65f03c0     	ret
 4251554: f9403668     	ldr	x8, [x19, #0x68]
 4251558: 7900011f     	strh	wzr, [x8]
 425155c: f9003a7f     	str	xzr, [x19, #0x70]
 4251560: 17fffff1     	b	0x4251524 <_ChromeMain+0x424c288>
 4251564: f9402a68     	ldr	x8, [x19, #0x50]
 4251568: 3900011f     	strb	wzr, [x8]
 425156c: f9002e7f     	str	xzr, [x19, #0x58]
 4251570: 17ffffe9     	b	0x4251514 <_ChromeMain+0x424c278>
 4251574: a9450a61     	ldp	x1, x2, [x19, #0x50]
 4251578: 9100a280     	add	x0, x20, #0x28
 425157c: 96f71b27     	bl	0x18218 <_ChromeMain+0x12f7c>
 4251580: 17ffffd9     	b	0x42514e4 <_ChromeMain+0x424c248>
 4251584: d004c661     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4251588: 91059c21     	add	x1, x1, #0x167
 425158c: 9100a3e0     	add	x0, sp, #0x28
 4251590: 979c8254     	bl	0x2971ee0 <_ChromeMain+0x296cc44>
 4251594: 910123e0     	add	x0, sp, #0x48
 4251598: 9100a3e1     	add	x1, sp, #0x28
 425159c: 977939a5     	bl	0x209fc30 <_ChromeMain+0x209a994>
 42515a0: f00465a1     	adrp	x1, 0xcf08000 <dyld_stub_binder+0xcf08000>
 42515a4: 91031021     	add	x1, x1, #0xc4
 42515a8: 910023e0     	add	x0, sp, #0x8
 42515ac: 979c824d     	bl	0x2971ee0 <_ChromeMain+0x296cc44>
 42515b0: d10143a8     	sub	x8, x29, #0x50
 42515b4: a93d7fbf     	stp	xzr, xzr, [x29, #-0x30]
 42515b8: 3cc483e0     	ldur	q0, [sp, #0x48]
 42515bc: 3c9b03a0     	stur	q0, [x29, #-0x50]
 42515c0: f9402fe9     	ldr	x9, [sp, #0x58]
 42515c4: a93c7fa9     	stp	x9, xzr, [x29, #-0x40]
 42515c8: 91006100     	add	x0, x8, #0x18
 42515cc: 910023e1     	add	x1, sp, #0x8
 42515d0: 97793998     	bl	0x209fc30 <_ChromeMain+0x209a994>
 42515d4: b004b961     	adrp	x1, 0xd97e000 <dyld_stub_binder+0xd97e000>
 42515d8: 911e5021     	add	x1, x1, #0x794
 42515dc: d10143a3     	sub	x3, x29, #0x50
 42515e0: aa1303e0     	mov	x0, x19
 42515e4: 52800302     	mov	w2, #0x18               ; =24
 42515e8: 52800044     	mov	w4, #0x2                ; =2
 42515ec: 949d845a     	bl	0x69b2754 <_ChromeMain+0x69ad4b8>
 42515f0: 394083e8     	ldrb	w8, [sp, #0x20]
 42515f4: 90053393     	adrp	x19, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 42515f8: 9121e273     	add	x19, x19, #0x878
 42515fc: 7103fd1f     	cmp	w8, #0xff
 4251600: 54000060     	b.eq	0x425160c <_ChromeMain+0x424c370>
 4251604: 721e791f     	tst	w8, #0xfffffffd
 4251608: 540001a1     	b.ne	0x425163c <_ChromeMain+0x424c3a0>
 425160c: 394103e8     	ldrb	w8, [sp, #0x40]
 4251610: 7103fd1f     	cmp	w8, #0xff
 4251614: 54fff8c0     	b.eq	0x425152c <_ChromeMain+0x424c290>
 4251618: 721e791f     	tst	w8, #0xfffffffd
 425161c: 54fff880     	b.eq	0x425152c <_ChromeMain+0x424c290>
 4251620: 7100111f     	cmp	w8, #0x4
 4251624: 54000280     	b.eq	0x4251674 <_ChromeMain+0x424c3d8>
 4251628: f8685a68     	ldr	x8, [x19, w8, uxtw #3]
 425162c: d10143a0     	sub	x0, x29, #0x50
 4251630: 9100a3e1     	add	x1, sp, #0x28
 4251634: d63f0100     	blr	x8
 4251638: 17ffffbd     	b	0x425152c <_ChromeMain+0x424c290>
 425163c: 7100111f     	cmp	w8, #0x4
 4251640: 540000c0     	b.eq	0x4251658 <_ChromeMain+0x424c3bc>
 4251644: f8685a68     	ldr	x8, [x19, w8, uxtw #3]
 4251648: d10143a0     	sub	x0, x29, #0x50
 425164c: 910023e1     	add	x1, sp, #0x8
 4251650: d63f0100     	blr	x8
 4251654: 17ffffee     	b	0x425160c <_ChromeMain+0x424c370>
 4251658: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 425165c: 36fffd88     	tbz	w8, #0x1f, 0x425160c <_ChromeMain+0x424c370>
 4251660: f94007e0     	ldr	x0, [sp, #0x8]
 4251664: f9400fe8     	ldr	x8, [sp, #0x18]
 4251668: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425166c: 96f6de13     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4251670: 17ffffe7     	b	0x425160c <_ChromeMain+0x424c370>
 4251674: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 4251678: 36fff5a8     	tbz	w8, #0x1f, 0x425152c <_ChromeMain+0x424c290>
 425167c: f94017e0     	ldr	x0, [sp, #0x28]
 4251680: f9401fe8     	ldr	x8, [sp, #0x38]
 4251684: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4251688: 96f6de0c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425168c: 17ffffa8     	b	0x425152c <_ChromeMain+0x424c290>
 4251690: 94f6cb34     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 4251694: d10203ff     	sub	sp, sp, #0x80
 4251698: a9045ff8     	stp	x24, x23, [sp, #0x40]
 425169c: a90557f6     	stp	x22, x21, [sp, #0x50]
 42516a0: a9064ff4     	stp	x20, x19, [sp, #0x60]
 42516a4: a9077bfd     	stp	x29, x30, [sp, #0x70]
 42516a8: 9101c3fd     	add	x29, sp, #0x70
 42516ac: aa0003f4     	mov	x20, x0
 42516b0: b4000b62     	cbz	x2, 0x425181c <_ChromeMain+0x424c580>
 42516b4: aa0203f5     	mov	x21, x2
 42516b8: aa0103f3     	mov	x19, x1
 42516bc: f9400048     	ldr	x8, [x2]
 42516c0: f940b508     	ldr	x8, [x8, #0x168]
 42516c4: aa0203e0     	mov	x0, x2
 42516c8: d63f0100     	blr	x8
 42516cc: aa0003f6     	mov	x22, x0
 42516d0: 3981fe81     	ldrsb	x1, [x20, #0x7f]
 42516d4: b7f80901     	tbnz	x1, #0x3f, 0x42517f4 <_ChromeMain+0x424c558>
 42516d8: 9101a280     	add	x0, x20, #0x68
 42516dc: 910003f7     	mov	x23, sp
 42516e0: 910003e8     	mov	x8, sp
 42516e4: 97354589     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 42516e8: 39805fe8     	ldrsb	x8, [sp, #0x17]
 42516ec: a9402be9     	ldp	x9, x10, [sp]
 42516f0: f100011f     	cmp	x8, #0x0
 42516f4: 9a974121     	csel	x1, x9, x23, mi
 42516f8: 7100011f     	cmp	w8, #0x0
 42516fc: 9a884142     	csel	x2, x10, x8, mi
 4251700: 910063e0     	add	x0, sp, #0x18
 4251704: 9726311f     	bl	0xbddb80 <_ChromeMain+0xbd88e4>
 4251708: f0046421     	adrp	x1, 0xced8000 <dyld_stub_binder+0xced8000>
 425170c: 913d4021     	add	x1, x1, #0xf50
 4251710: 910063e3     	add	x3, sp, #0x18
 4251714: aa1603e0     	mov	x0, x22
 4251718: 52800182     	mov	w2, #0xc                ; =12
 425171c: 974ae063     	bl	0x15098a8 <_ChromeMain+0x150460c>
 4251720: 3940c3e8     	ldrb	w8, [sp, #0x30]
 4251724: 7103fd1f     	cmp	w8, #0xff
 4251728: 54000060     	b.eq	0x4251734 <_ChromeMain+0x424c498>
 425172c: 721e791f     	tst	w8, #0xfffffffd
 4251730: 54000981     	b.ne	0x4251860 <_ChromeMain+0x424c5c4>
 4251734: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 4251738: 36f800a8     	tbz	w8, #0x1f, 0x425174c <_ChromeMain+0x424c4b0>
 425173c: f94003e0     	ldr	x0, [sp]
 4251740: f9400be8     	ldr	x8, [sp, #0x10]
 4251744: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4251748: 96f6dddc     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425174c: b00564a8     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 4251750: f9467d00     	ldr	x0, [x8, #0xcf8]
 4251754: 975f3909     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 4251758: 975f392e     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 425175c: aa0003f6     	mov	x22, x0
 4251760: f94002a8     	ldr	x8, [x21]
 4251764: f9401909     	ldr	x9, [x8, #0x30]
 4251768: 910063e8     	add	x8, sp, #0x18
 425176c: aa1503e0     	mov	x0, x21
 4251770: d63f0120     	blr	x9
 4251774: 910063e1     	add	x1, sp, #0x18
 4251778: aa1603e0     	mov	x0, x22
 425177c: 975f3961     	bl	0x1a1fd00 <_ChromeMain+0x1a1aa64>
 4251780: aa0003f6     	mov	x22, x0
 4251784: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 4251788: 37f80588     	tbnz	w8, #0x1f, 0x4251838 <_ChromeMain+0x424c59c>
 425178c: b5000616     	cbnz	x22, 0x425184c <_ChromeMain+0x424c5b0>
 4251790: aa1403e0     	mov	x0, x20
 4251794: aa1503e1     	mov	x1, x21
 4251798: 97fffe3b     	bl	0x4251084 <_ChromeMain+0x424bde8>
 425179c: 36000300     	tbz	w0, #0x0, 0x42517fc <_ChromeMain+0x424c560>
 42517a0: 3902229f     	strb	wzr, [x20, #0x88]
 42517a4: f900429f     	str	xzr, [x20, #0x80]
 42517a8: f9401e88     	ldr	x8, [x20, #0x38]
 42517ac: d37ef509     	lsl	x9, x8, #2
 42517b0: b4000129     	cbz	x9, 0x42517d4 <_ChromeMain+0x424c538>
 42517b4: f9401a8a     	ldr	x10, [x20, #0x30]
 42517b8: cb080be8     	neg	x8, x8, lsl #2
 42517bc: 8b0a0129     	add	x9, x9, x10
 42517c0: d1001129     	sub	x9, x9, #0x4
 42517c4: b40006e9     	cbz	x9, 0x42518a0 <_ChromeMain+0x424c604>
 42517c8: d1001129     	sub	x9, x9, #0x4
 42517cc: 91001108     	add	x8, x8, #0x4
 42517d0: b5ffffa8     	cbnz	x8, 0x42517c4 <_ChromeMain+0x424c528>
 42517d4: f9001e9f     	str	xzr, [x20, #0x38]
 42517d8: aa1403e0     	mov	x0, x20
 42517dc: 94000039     	bl	0x42518c0 <_ChromeMain+0x424c624>
 42517e0: f9401680     	ldr	x0, [x20, #0x28]
 42517e4: aa1303e1     	mov	x1, x19
 42517e8: 52800002     	mov	w2, #0x0                ; =0
 42517ec: 97fa7330     	bl	0x40ee4ac <_ChromeMain+0x40e9210>
 42517f0: 14000005     	b	0x4251804 <_ChromeMain+0x424c568>
 42517f4: a9468680     	ldp	x0, x1, [x20, #0x68]
 42517f8: 17ffffb9     	b	0x42516dc <_ChromeMain+0x424c440>
 42517fc: aa1403e0     	mov	x0, x20
 4251800: 97ffff08     	bl	0x4251420 <_ChromeMain+0x424c184>
 4251804: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 4251808: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 425180c: a94557f6     	ldp	x22, x21, [sp, #0x50]
 4251810: a9445ff8     	ldp	x24, x23, [sp, #0x40]
 4251814: 910203ff     	add	sp, sp, #0x80
 4251818: d65f03c0     	ret
 425181c: aa1403e0     	mov	x0, x20
 4251820: a9477bfd     	ldp	x29, x30, [sp, #0x70]
 4251824: a9464ff4     	ldp	x20, x19, [sp, #0x60]
 4251828: a94557f6     	ldp	x22, x21, [sp, #0x50]
 425182c: a9445ff8     	ldp	x24, x23, [sp, #0x40]
 4251830: 910203ff     	add	sp, sp, #0x80
 4251834: 17fffefb     	b	0x4251420 <_ChromeMain+0x424c184>
 4251838: f9400fe0     	ldr	x0, [sp, #0x18]
 425183c: f94017e8     	ldr	x8, [sp, #0x28]
 4251840: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4251844: 96f6dd9d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4251848: b4fffa56     	cbz	x22, 0x4251790 <_ChromeMain+0x424c4f4>
 425184c: 9101a281     	add	x1, x20, #0x68
 4251850: aa1603e0     	mov	x0, x22
 4251854: 52800002     	mov	w2, #0x0                ; =0
 4251858: 94e1eb63     	bl	0x7acc5e4 <_ChromeMain+0x7ac7348>
 425185c: 17ffffcd     	b	0x4251790 <_ChromeMain+0x424c4f4>
 4251860: 7100111f     	cmp	w8, #0x4
 4251864: 54000100     	b.eq	0x4251884 <_ChromeMain+0x424c5e8>
 4251868: 90053389     	adrp	x9, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 425186c: 9121e129     	add	x9, x9, #0x878
 4251870: f8685928     	ldr	x8, [x9, w8, uxtw #3]
 4251874: d100c7a0     	sub	x0, x29, #0x31
 4251878: 910063e1     	add	x1, sp, #0x18
 425187c: d63f0100     	blr	x8
 4251880: 17ffffad     	b	0x4251734 <_ChromeMain+0x424c498>
 4251884: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 4251888: 36fff568     	tbz	w8, #0x1f, 0x4251734 <_ChromeMain+0x424c498>
 425188c: f9400fe0     	ldr	x0, [sp, #0x18]
 4251890: f94017e8     	ldr	x8, [sp, #0x28]
 4251894: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4251898: 96f6dd88     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425189c: 17ffffa6     	b	0x4251734 <_ChromeMain+0x424c498>
 42518a0: d4200020     	brk	#0x1
		...
 42518c0: d10303ff     	sub	sp, sp, #0xc0
 42518c4: a90a4ff4     	stp	x20, x19, [sp, #0xa0]
 42518c8: a90b7bfd     	stp	x29, x30, [sp, #0xb0]
 42518cc: 9102c3fd     	add	x29, sp, #0xb0
 42518d0: f004eea8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 42518d4: f940f908     	ldr	x8, [x8, #0x1f0]
 42518d8: f9400108     	ldr	x8, [x8]
 42518dc: f81e83a8     	stur	x8, [x29, #-0x18]
 42518e0: f9400813     	ldr	x19, [x0, #0x10]
 42518e4: b5000173     	cbnz	x19, 0x4251910 <_ChromeMain+0x424c674>
 42518e8: f85e83a8     	ldur	x8, [x29, #-0x18]
 42518ec: f004eea9     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 42518f0: f940f929     	ldr	x9, [x9, #0x1f0]
 42518f4: f9400129     	ldr	x9, [x9]
 42518f8: eb08013f     	cmp	x9, x8
 42518fc: 54000921     	b.ne	0x4251a20 <_ChromeMain+0x424c784>
 4251900: a94b7bfd     	ldp	x29, x30, [sp, #0xb0]
 4251904: a94a4ff4     	ldp	x20, x19, [sp, #0xa0]
 4251908: 910303ff     	add	sp, sp, #0xc0
 425190c: d65f03c0     	ret
 4251910: d004c661     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4251914: 91054021     	add	x1, x1, #0x150
 4251918: 9100a3e0     	add	x0, sp, #0x28
 425191c: 979c8171     	bl	0x2971ee0 <_ChromeMain+0x296cc44>
 4251920: 910123e0     	add	x0, sp, #0x48
 4251924: 9100a3e1     	add	x1, sp, #0x28
 4251928: 977938c2     	bl	0x209fc30 <_ChromeMain+0x209a994>
 425192c: f00465a1     	adrp	x1, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4251930: 91031021     	add	x1, x1, #0xc4
 4251934: 910023e0     	add	x0, sp, #0x8
 4251938: 979c816a     	bl	0x2971ee0 <_ChromeMain+0x296cc44>
 425193c: d10143a8     	sub	x8, x29, #0x50
 4251940: a93d7fbf     	stp	xzr, xzr, [x29, #-0x30]
 4251944: 3cc483e0     	ldur	q0, [sp, #0x48]
 4251948: 3c9b03a0     	stur	q0, [x29, #-0x50]
 425194c: f9402fe9     	ldr	x9, [sp, #0x58]
 4251950: a93c7fa9     	stp	x9, xzr, [x29, #-0x40]
 4251954: 91006100     	add	x0, x8, #0x18
 4251958: 910023e1     	add	x1, sp, #0x8
 425195c: 977938b5     	bl	0x209fc30 <_ChromeMain+0x209a994>
 4251960: b004b961     	adrp	x1, 0xd97e000 <dyld_stub_binder+0xd97e000>
 4251964: 911e5021     	add	x1, x1, #0x794
 4251968: d10143a3     	sub	x3, x29, #0x50
 425196c: aa1303e0     	mov	x0, x19
 4251970: 52800302     	mov	w2, #0x18               ; =24
 4251974: 52800044     	mov	w4, #0x2                ; =2
 4251978: 949d8377     	bl	0x69b2754 <_ChromeMain+0x69ad4b8>
 425197c: 394083e8     	ldrb	w8, [sp, #0x20]
 4251980: 90053393     	adrp	x19, 0xe8c1000 <dyld_stub_binder+0xe8c1000>
 4251984: 9121e273     	add	x19, x19, #0x878
 4251988: 7103fd1f     	cmp	w8, #0xff
 425198c: 54000060     	b.eq	0x4251998 <_ChromeMain+0x424c6fc>
 4251990: 721e791f     	tst	w8, #0xfffffffd
 4251994: 540001a1     	b.ne	0x42519c8 <_ChromeMain+0x424c72c>
 4251998: 394103e8     	ldrb	w8, [sp, #0x40]
 425199c: 7103fd1f     	cmp	w8, #0xff
 42519a0: 54fffa40     	b.eq	0x42518e8 <_ChromeMain+0x424c64c>
 42519a4: 721e791f     	tst	w8, #0xfffffffd
 42519a8: 54fffa00     	b.eq	0x42518e8 <_ChromeMain+0x424c64c>
 42519ac: 7100111f     	cmp	w8, #0x4
 42519b0: 54000200     	b.eq	0x42519f0 <_ChromeMain+0x424c754>
 42519b4: f8685a68     	ldr	x8, [x19, w8, uxtw #3]
 42519b8: d10143a0     	sub	x0, x29, #0x50
 42519bc: 9100a3e1     	add	x1, sp, #0x28
 42519c0: d63f0100     	blr	x8
 42519c4: 17ffffc9     	b	0x42518e8 <_ChromeMain+0x424c64c>
 42519c8: 7100111f     	cmp	w8, #0x4
 42519cc: 540000c0     	b.eq	0x42519e4 <_ChromeMain+0x424c748>
 42519d0: f8685a68     	ldr	x8, [x19, w8, uxtw #3]
 42519d4: d10143a0     	sub	x0, x29, #0x50
 42519d8: 910023e1     	add	x1, sp, #0x8
 42519dc: d63f0100     	blr	x8
 42519e0: 17ffffee     	b	0x4251998 <_ChromeMain+0x424c6fc>
 42519e4: 39c07fe8     	ldrsb	w8, [sp, #0x1f]
 42519e8: 36fffd88     	tbz	w8, #0x1f, 0x4251998 <_ChromeMain+0x424c6fc>
 42519ec: 14000008     	b	0x4251a0c <_ChromeMain+0x424c770>
 42519f0: 39c0ffe8     	ldrsb	w8, [sp, #0x3f]
 42519f4: 36fff7a8     	tbz	w8, #0x1f, 0x42518e8 <_ChromeMain+0x424c64c>
 42519f8: f94017e0     	ldr	x0, [sp, #0x28]
 42519fc: f9401fe8     	ldr	x8, [sp, #0x38]
 4251a00: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4251a04: 96f6dd2d     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4251a08: 17ffffb8     	b	0x42518e8 <_ChromeMain+0x424c64c>
 4251a0c: f94007e0     	ldr	x0, [sp, #0x8]
 4251a10: f9400fe8     	ldr	x8, [sp, #0x18]
 4251a14: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4251a18: 96f6dd28     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4251a1c: 17ffffdf     	b	0x4251998 <_ChromeMain+0x424c6fc>
 4251a20: 94f6ca50     	bl	0x8004360 <_ChromeMain+0x7fff0c4>
 4251a24: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4251a28: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4251a2c: 910043fd     	add	x29, sp, #0x10
 4251a30: aa0003f3     	mov	x19, x0
 4251a34: b00500a8     	adrp	x8, 0xe266000 <dyld_stub_binder+0xe266000>
 4251a38: 9130c108     	add	x8, x8, #0xc30
 4251a3c: 91022109     	add	x9, x8, #0x88
 4251a40: a9002408     	stp	x8, x9, [x0]
 4251a44: f9400c00     	ldr	x0, [x0, #0x18]
 4251a48: b4000080     	cbz	x0, 0x4251a58 <_ChromeMain+0x424c7bc>
 4251a4c: f9400008     	ldr	x8, [x0]
 4251a50: f9400508     	ldr	x8, [x8, #0x8]
 4251a54: d63f0100     	blr	x8
 4251a58: f9004e7f     	str	xzr, [x19, #0x98]
 4251a5c: f9404a68     	ldr	x8, [x19, #0x90]
 4251a60: b4000168     	cbz	x8, 0x4251a8c <_ChromeMain+0x424c7f0>
 4251a64: 52800029     	mov	w9, #0x1                ; =1
 4251a68: 19004109     	stlurb	w9, [x8, #0x4]
 4251a6c: f9404a60     	ldr	x0, [x19, #0x90]
 4251a70: b40000e0     	cbz	x0, 0x4251a8c <_ChromeMain+0x424c7f0>
 4251a74: 12800008     	mov	w8, #-0x1               ; =-1
 4251a78: b8e80008     	ldaddal	w8, w8, [x0]
 4251a7c: 7100051f     	cmp	w8, #0x1
 4251a80: 54000061     	b.ne	0x4251a8c <_ChromeMain+0x424c7f0>
 4251a84: 52800101     	mov	w1, #0x8                ; =8
 4251a88: 96f6dd0c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4251a8c: 39c1fe68     	ldrsb	w8, [x19, #0x7f]
 4251a90: 36f800a8     	tbz	w8, #0x1f, 0x4251aa4 <_ChromeMain+0x424c808>
 4251a94: f9403660     	ldr	x0, [x19, #0x68]
 4251a98: f9403e68     	ldr	x8, [x19, #0x78]
 4251a9c: d37ff901     	lsl	x1, x8, #1
 4251aa0: 96f6dd06     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4251aa4: 39c19e68     	ldrsb	w8, [x19, #0x67]
 4251aa8: 37f80448     	tbnz	w8, #0x1f, 0x4251b30 <_ChromeMain+0x424c894>
 4251aac: f9401a60     	ldr	x0, [x19, #0x30]
 4251ab0: b50004a0     	cbnz	x0, 0x4251b44 <_ChromeMain+0x424c8a8>
 4251ab4: f9401660     	ldr	x0, [x19, #0x28]
 4251ab8: f900167f     	str	xzr, [x19, #0x28]
 4251abc: b5000620     	cbnz	x0, 0x4251b80 <_ChromeMain+0x424c8e4>
 4251ac0: f9401260     	ldr	x0, [x19, #0x20]
 4251ac4: f900127f     	str	xzr, [x19, #0x20]
 4251ac8: b4000080     	cbz	x0, 0x4251ad8 <_ChromeMain+0x424c83c>
 4251acc: 97b849d7     	bl	0x3064228 <_ChromeMain+0x305ef8c>
 4251ad0: 52802f01     	mov	w1, #0x178              ; =376
 4251ad4: 96f6dcf9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4251ad8: f9400e60     	ldr	x0, [x19, #0x18]
 4251adc: b4000120     	cbz	x0, 0x4251b00 <_ChromeMain+0x424c864>
 4251ae0: 91002008     	add	x8, x0, #0x8
 4251ae4: 12800009     	mov	w9, #-0x1               ; =-1
 4251ae8: b8e90108     	ldaddal	w9, w8, [x8]
 4251aec: 7100051f     	cmp	w8, #0x1
 4251af0: 54000081     	b.ne	0x4251b00 <_ChromeMain+0x424c864>
 4251af4: f9400008     	ldr	x8, [x0]
 4251af8: f9400d08     	ldr	x8, [x8, #0x18]
 4251afc: d63f0100     	blr	x8
 4251b00: f9400a60     	ldr	x0, [x19, #0x10]
 4251b04: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4251b08: b0054b09     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4251b0c: f9404529     	ldr	x9, [x9, #0x88]
 4251b10: eb09011f     	cmp	x8, x9
 4251b14: 54000041     	b.ne	0x4251b1c <_ChromeMain+0x424c880>
 4251b18: 96f743c9     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4251b1c: f9000a7f     	str	xzr, [x19, #0x10]
 4251b20: aa1303e0     	mov	x0, x19
 4251b24: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4251b28: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4251b2c: d65f03c0     	ret
 4251b30: f9402a60     	ldr	x0, [x19, #0x50]
 4251b34: f9403268     	ldr	x8, [x19, #0x60]
 4251b38: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4251b3c: 96f6dcdf     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4251b40: 17ffffdb     	b	0x4251aac <_ChromeMain+0x424c810>
 4251b44: f9401e68     	ldr	x8, [x19, #0x38]
 4251b48: d37ef509     	lsl	x9, x8, #2
 4251b4c: b4000109     	cbz	x9, 0x4251b6c <_ChromeMain+0x424c8d0>
 4251b50: cb080be8     	neg	x8, x8, lsl #2
 4251b54: 8b000129     	add	x9, x9, x0
 4251b58: d1001129     	sub	x9, x9, #0x4
 4251b5c: b40001a9     	cbz	x9, 0x4251b90 <_ChromeMain+0x424c8f4>
 4251b60: d1001129     	sub	x9, x9, #0x4
 4251b64: 91001108     	add	x8, x8, #0x4
 4251b68: b5ffffa8     	cbnz	x8, 0x4251b5c <_ChromeMain+0x424c8c0>
 4251b6c: f9001e7f     	str	xzr, [x19, #0x38]
 4251b70: f9402268     	ldr	x8, [x19, #0x40]
 4251b74: d37ef501     	lsl	x1, x8, #2
 4251b78: 96f6dcd0     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4251b7c: 17ffffce     	b	0x4251ab4 <_ChromeMain+0x424c818>
 4251b80: 94d3efcf     	bl	0x774dabc <_ChromeMain+0x7748820>
 4251b84: 52805801     	mov	w1, #0x2c0              ; =704
 4251b88: 96f6dccc     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4251b8c: 17ffffcd     	b	0x4251ac0 <_ChromeMain+0x424c824>
 4251b90: d4200020     	brk	#0x1
