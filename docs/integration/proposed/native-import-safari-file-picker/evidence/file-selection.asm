
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 42500d0: d10243ff     	sub	sp, sp, #0x90
 42500d4: a9055ff8     	stp	x24, x23, [sp, #0x50]
 42500d8: a90657f6     	stp	x22, x21, [sp, #0x60]
 42500dc: a9074ff4     	stp	x20, x19, [sp, #0x70]
 42500e0: a9087bfd     	stp	x29, x30, [sp, #0x80]
 42500e4: 910203fd     	add	x29, sp, #0x80
 42500e8: aa0103f3     	mov	x19, x1
 42500ec: aa0003f4     	mov	x20, x0
 42500f0: f9400c00     	ldr	x0, [x0, #0x18]
 42500f4: f9000e9f     	str	xzr, [x20, #0x18]
 42500f8: b4000120     	cbz	x0, 0x425011c <_ChromeMain+0x424ae80>
 42500fc: 91002008     	add	x8, x0, #0x8
 4250100: 12800009     	mov	w9, #-0x1               ; =-1
 4250104: b8e90108     	ldaddal	w9, w8, [x8]
 4250108: 7100051f     	cmp	w8, #0x1
 425010c: 54000081     	b.ne	0x425011c <_ChromeMain+0x424ae80>
 4250110: f9400008     	ldr	x8, [x0]
 4250114: f9400d08     	ldr	x8, [x8, #0x18]
 4250118: d63f0100     	blr	x8
 425011c: b004bac0     	adrp	x0, 0xd9a9000 <dyld_stub_binder+0xd9a9000>
 4250120: 91169c00     	add	x0, x0, #0x5a7
 4250124: f004c661     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4250128: 91043821     	add	x1, x1, #0x10e
 425012c: 9100c3e8     	add	x8, sp, #0x30
 4250130: 52803402     	mov	w2, #0x1a0              ; =416
 4250134: 96f802d3     	bl	0x50c80 <_ChromeMain+0x4b9e4>
 4250138: 910063e8     	add	x8, sp, #0x18
 425013c: aa1303e0     	mov	x0, x19
 4250140: 95674aa2     	bl	0x9c22bc8 <_ChromeMain+0x9c1d92c>
 4250144: 52800800     	mov	w0, #0x40               ; =64
 4250148: 96f6fc88     	bl	0xf368 <_ChromeMain+0xa0cc>
 425014c: aa0003f5     	mov	x21, x0
 4250150: 52800036     	mov	w22, #0x1               ; =1
 4250154: b9000016     	str	w22, [x0]
 4250158: 90fef848     	adrp	x8, 0x2158000 <_ChromeMain+0x2152d64>
 425015c: 9108c108     	add	x8, x8, #0x230
 4250160: d0ffb449     	adrp	x9, 0x38da000 <_ChromeMain+0x38d4d64>
 4250164: 91020129     	add	x9, x9, #0x80
 4250168: a900a408     	stp	x8, x9, [x0, #0x8]
 425016c: b0ff1868     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4250170: 912c0108     	add	x8, x8, #0xb00
 4250174: 10003829     	adr	x9, 0x4250878 <_ChromeMain+0x424b5dc>
 4250178: d503201f     	nop
 425017c: a901a408     	stp	x8, x9, [x0, #0x18]
 4250180: 3cc183e0     	ldur	q0, [sp, #0x18]
 4250184: 3c828000     	stur	q0, [x0, #0x28]
 4250188: f94017e8     	ldr	x8, [sp, #0x28]
 425018c: f9001c08     	str	x8, [x0, #0x38]
 4250190: a901ffff     	stp	xzr, xzr, [sp, #0x18]
 4250194: f90017ff     	str	xzr, [sp, #0x28]
 4250198: f9404a97     	ldr	x23, [x20, #0x90]
 425019c: b40000b7     	cbz	x23, 0x42501b0 <_ChromeMain+0x424af14>
 42501a0: b83602e8     	ldadd	w22, w8, [x23]
 42501a4: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 42501a8: 6b09011f     	cmp	w8, w9
 42501ac: 54000680     	b.eq	0x425027c <_ChromeMain+0x424afe0>
 42501b0: f9404e94     	ldr	x20, [x20, #0x98]
 42501b4: 910003e8     	mov	x8, sp
 42501b8: aa1303e0     	mov	x0, x19
 42501bc: 95674a83     	bl	0x9c22bc8 <_ChromeMain+0x9c1d92c>
 42501c0: 52800b00     	mov	w0, #0x58               ; =88
 42501c4: 96f6fc69     	bl	0xf368 <_ChromeMain+0xa0cc>
 42501c8: aa0003e3     	mov	x3, x0
 42501cc: b9000016     	str	w22, [x0]
 42501d0: f0ffeb28     	adrp	x8, 0x3fb7000 <_ChromeMain+0x3fb1d64>
 42501d4: 91300108     	add	x8, x8, #0xc00
 42501d8: d0fff0c9     	adrp	x9, 0x406a000 <_ChromeMain+0x4064d64>
 42501dc: 913a0129     	add	x9, x9, #0xe80
 42501e0: a900a408     	stp	x8, x9, [x0, #0x8]
 42501e4: d0fff2e8     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 42501e8: 911b0108     	add	x8, x8, #0x6c0
 42501ec: 10004149     	adr	x9, 0x4250a14 <_ChromeMain+0x424b778>
 42501f0: d503201f     	nop
 42501f4: a901a408     	stp	x8, x9, [x0, #0x18]
 42501f8: a902dc1f     	stp	xzr, x23, [x0, #0x28]
 42501fc: f9001c14     	str	x20, [x0, #0x38]
 4250200: 3dc003e0     	ldr	q0, [sp]
 4250204: 3d801000     	str	q0, [x0, #0x40]
 4250208: f9400be8     	ldr	x8, [sp, #0x10]
 425020c: f9002808     	str	x8, [x0, #0x50]
 4250210: a9007fff     	stp	xzr, xzr, [sp]
 4250214: f9000bff     	str	xzr, [sp, #0x10]
 4250218: 900465c1     	adrp	x1, 0xcf08000 <dyld_stub_binder+0xcf08000>
 425021c: 91010021     	add	x1, x1, #0x40
 4250220: 9100c3e0     	add	x0, sp, #0x30
 4250224: aa1503e2     	mov	x2, x21
 4250228: 97a8b170     	bl	0x2c7c7e8 <_ChromeMain+0x2c7754c>
 425022c: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 4250230: 37f801c8     	tbnz	w8, #0x1f, 0x4250268 <_ChromeMain+0x424afcc>
 4250234: 39c0bfe8     	ldrsb	w8, [sp, #0x2f]
 4250238: 37f800e8     	tbnz	w8, #0x1f, 0x4250254 <_ChromeMain+0x424afb8>
 425023c: a9487bfd     	ldp	x29, x30, [sp, #0x80]
 4250240: a9474ff4     	ldp	x20, x19, [sp, #0x70]
 4250244: a94657f6     	ldp	x22, x21, [sp, #0x60]
 4250248: a9455ff8     	ldp	x24, x23, [sp, #0x50]
 425024c: 910243ff     	add	sp, sp, #0x90
 4250250: d65f03c0     	ret
 4250254: f9400fe0     	ldr	x0, [sp, #0x18]
 4250258: f94017e8     	ldr	x8, [sp, #0x28]
 425025c: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4250260: 96f6e316     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4250264: 17fffff6     	b	0x425023c <_ChromeMain+0x424afa0>
 4250268: f94003e0     	ldr	x0, [sp]
 425026c: f9400be8     	ldr	x8, [sp, #0x10]
 4250270: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4250274: 96f6e311     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4250278: 17ffffef     	b	0x4250234 <_ChromeMain+0x424af98>
 425027c: d4200000     	brk	#0
 4250280: d4400000     	hlt	#0
 4250284: d4200020     	brk	#0x1
 4250288: aa0003e8     	mov	x8, x0
 425028c: f9400c00     	ldr	x0, [x0, #0x18]
 4250290: f9000d1f     	str	xzr, [x8, #0x18]
 4250294: b40000c0     	cbz	x0, 0x42502ac <_ChromeMain+0x424b010>
 4250298: 91002008     	add	x8, x0, #0x8
 425029c: 12800009     	mov	w9, #-0x1               ; =-1
 42502a0: b8e90108     	ldaddal	w9, w8, [x8]
 42502a4: 7100051f     	cmp	w8, #0x1
 42502a8: 54000040     	b.eq	0x42502b0 <_ChromeMain+0x424b014>
 42502ac: d65f03c0     	ret
 42502b0: f9400008     	ldr	x8, [x0]
 42502b4: f9400d01     	ldr	x1, [x8, #0x18]
 42502b8: d61f0020     	br	x1
