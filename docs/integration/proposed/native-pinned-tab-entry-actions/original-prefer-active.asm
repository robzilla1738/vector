
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46077a0: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 46077a4: a90167fa     	stp	x26, x25, [sp, #0x10]
 46077a8: a9025ff8     	stp	x24, x23, [sp, #0x20]
 46077ac: a90357f6     	stp	x22, x21, [sp, #0x30]
 46077b0: a9044ff4     	stp	x20, x19, [sp, #0x40]
 46077b4: a9057bfd     	stp	x29, x30, [sp, #0x50]
 46077b8: 910143fd     	add	x29, sp, #0x50
 46077bc: f941a408     	ldr	x8, [x0, #0x348]
 46077c0: b40006a8     	cbz	x8, 0x4607894 <_ChromeMain+0x46025f8>
 46077c4: aa0103f3     	mov	x19, x1
 46077c8: aa0003f4     	mov	x20, x0
 46077cc: f9404901     	ldr	x1, [x8, #0x90]
 46077d0: b4000221     	cbz	x1, 0x4607814 <_ChromeMain+0x4602578>
 46077d4: f9400100     	ldr	x0, [x8]
 46077d8: 96f60b55     	bl	0x38a52c <_ChromeMain+0x385290>
 46077dc: 7200003f     	tst	w1, #0x1
 46077e0: 5a9f1016     	csinv	w22, w0, wzr, ne
 46077e4: f941a688     	ldr	x8, [x20, #0x348]
 46077e8: f9400100     	ldr	x0, [x8]
 46077ec: b9401808     	ldr	w8, [x0, #0x18]
 46077f0: 7100051f     	cmp	w8, #0x1
 46077f4: 5400042b     	b.lt	0x4607878 <_ChromeMain+0x46025dc>
 46077f8: d2800015     	mov	x21, #0x0               ; =0
 46077fc: 52800019     	mov	w25, #0x0               ; =0
 4607800: 52800018     	mov	w24, #0x0               ; =0
 4607804: 52800017     	mov	w23, #0x0               ; =0
 4607808: 5280003a     	mov	w26, #0x1               ; =1
 460780c: 2a1603fb     	mov	w27, w22
 4607810: 1400000e     	b	0x4607848 <_ChromeMain+0x46025ac>
 4607814: 12800016     	mov	w22, #-0x1              ; =-1
 4607818: 17fffff4     	b	0x46077e8 <_ChromeMain+0x460254c>
 460781c: 53087ea8     	lsr	w8, w21, #8
 4607820: 7200033f     	tst	w25, #0x1
 4607824: 1a9512f7     	csel	w23, w23, w21, ne
 4607828: 1a881318     	csel	w24, w24, w8, ne
 460782c: 1a9f0759     	csinc	w25, w26, wzr, eq
 4607830: 910006b5     	add	x21, x21, #0x1
 4607834: f941a688     	ldr	x8, [x20, #0x348]
 4607838: f9400100     	ldr	x0, [x8]
 460783c: b9801808     	ldrsw	x8, [x0, #0x18]
 4607840: eb0802bf     	cmp	x21, x8
 4607844: 5400022a     	b.ge	0x4607888 <_ChromeMain+0x46025ec>
 4607848: aa1503e1     	mov	x1, x21
 460784c: 97295aab     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 4607850: aa0003e1     	mov	x1, x0
 4607854: aa1303e2     	mov	x2, x19
 4607858: 97fffb2e     	bl	0x4606510 <_ChromeMain+0x4601274>
 460785c: 34fffea0     	cbz	w0, 0x4607830 <_ChromeMain+0x4602594>
 4607860: eb15037f     	cmp	x27, x21
 4607864: 54fffdc1     	b.ne	0x460781c <_ChromeMain+0x4602580>
 4607868: 53087ed8     	lsr	w24, w22, #8
 460786c: d2c00028     	mov	x8, #0x100000000        ; =4294967296
 4607870: aa1603f7     	mov	x23, x22
 4607874: 14000009     	b	0x4607898 <_ChromeMain+0x46025fc>
 4607878: d2800008     	mov	x8, #0x0                ; =0
 460787c: 52800017     	mov	w23, #0x0               ; =0
 4607880: 52800018     	mov	w24, #0x0               ; =0
 4607884: 14000005     	b	0x4607898 <_ChromeMain+0x46025fc>
 4607888: 12001f28     	and	w8, w25, #0xff
 460788c: d3607d08     	lsl	x8, x8, #32
