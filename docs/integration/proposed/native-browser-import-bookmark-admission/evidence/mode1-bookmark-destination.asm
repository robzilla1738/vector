
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4258618: a9ba6ffc     	stp	x28, x27, [sp, #-0x60]!
 425861c: a90167fa     	stp	x26, x25, [sp, #0x10]
 4258620: a9025ff8     	stp	x24, x23, [sp, #0x20]
 4258624: a90357f6     	stp	x22, x21, [sp, #0x30]
 4258628: a9044ff4     	stp	x20, x19, [sp, #0x40]
 425862c: a9057bfd     	stp	x29, x30, [sp, #0x50]
 4258630: 910143fd     	add	x29, sp, #0x50
 4258634: d10683ff     	sub	sp, sp, #0x1a0
 4258638: aa0003f4     	mov	x20, x0
 425863c: b4001841     	cbz	x1, 0x4258944 <_ChromeMain+0x42536a8>
 4258640: f9403688     	ldr	x8, [x20, #0x68]
 4258644: b4001808     	cbz	x8, 0x4258944 <_ChromeMain+0x42536a8>
 4258648: aa0103f5     	mov	x21, x1
 425864c: 52800300     	mov	w0, #0x18               ; =24
 4258650: 96f6db46     	bl	0xf368 <_ChromeMain+0xa0cc>
 4258654: aa0003f9     	mov	x25, x0
 4258658: 9004fac8     	adrp	x8, 0xe1b0000 <dyld_stub_binder+0xe1b0000>
 425865c: 9110e108     	add	x8, x8, #0x438
 4258660: b900081f     	str	wzr, [x0, #0x8]
 4258664: f9000008     	str	x8, [x0]
 4258668: 925e76a8     	and	x8, x21, #0xfffffffc00000000
 425866c: d0054ac9     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4258670: f9404529     	ldr	x9, [x9, #0x88]
 4258674: eb09011f     	cmp	x8, x9
 4258678: 54000061     	b.ne	0x4258684 <_ChromeMain+0x42533e8>
 425867c: aa1503e0     	mov	x0, x21
 4258680: 96f6ef1f     	bl	0x142fc <_ChromeMain+0xf060>
 4258684: f9000b35     	str	x21, [x25, #0x10]
 4258688: b40000f9     	cbz	x25, 0x42586a4 <_ChromeMain+0x4253408>
 425868c: 91002328     	add	x8, x25, #0x8
 4258690: 52800029     	mov	w9, #0x1                ; =1
 4258694: b8290108     	ldadd	w9, w8, [x8]
 4258698: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 425869c: 6b09011f     	cmp	w8, w9
 42586a0: 54002700     	b.eq	0x4258b80 <_ChromeMain+0x42538e4>
 42586a4: f9403688     	ldr	x8, [x20, #0x68]
 42586a8: f9405108     	ldr	x8, [x8, #0xa0]
 42586ac: b4000c88     	cbz	x8, 0x425883c <_ChromeMain+0x42535a0>
 42586b0: aa1503e0     	mov	x0, x21
 42586b4: 97268c72     	bl	0xbfb87c <_ChromeMain+0xbf65e0>
 42586b8: 39408408     	ldrb	w8, [x0, #0x21]
 42586bc: 34000448     	cbz	w8, 0x4258744 <_ChromeMain+0x42534a8>
 42586c0: f9403693     	ldr	x19, [x20, #0x68]
 42586c4: b9401a80     	ldr	w0, [x20, #0x18]
 42586c8: d101c3a8     	sub	x8, x29, #0x70
 42586cc: 94001df1     	bl	0x425fe90 <_ChromeMain+0x425abf4>
 42586d0: d004e902     	adrp	x2, 0xdf7a000 <dyld_stub_binder+0xdf7a000>
 42586d4: 91111042     	add	x2, x2, #0x444
 42586d8: d101c3a0     	sub	x0, x29, #0x70
 42586dc: d2800001     	mov	x1, #0x0                ; =0
 42586e0: 528001c3     	mov	w3, #0xe                ; =14
 42586e4: 97593312     	bl	0x18a532c <_ChromeMain+0x18a0090>
 42586e8: f9400808     	ldr	x8, [x0, #0x10]
 42586ec: 3dc00000     	ldr	q0, [x0]
 42586f0: 3d8017e0     	str	q0, [sp, #0x50]
 42586f4: f90033e8     	str	x8, [sp, #0x60]
 42586f8: a900fc1f     	stp	xzr, xzr, [x0, #0x8]
 42586fc: f900001f     	str	xzr, [x0]
 4258700: 91026261     	add	x1, x19, #0x98
 4258704: 910143e2     	add	x2, sp, #0x50
 4258708: aa1903e0     	mov	x0, x25
 425870c: 97fabbf9     	bl	0x41076f0 <_ChromeMain+0x4102454>
 4258710: 39c19fe8     	ldrsb	w8, [sp, #0x67]
 4258714: 36f800a8     	tbz	w8, #0x1f, 0x4258728 <_ChromeMain+0x425348c>
 4258718: f9402be0     	ldr	x0, [sp, #0x50]
 425871c: f94033e8     	ldr	x8, [sp, #0x60]
 4258720: d37ff901     	lsl	x1, x8, #1
 4258724: 96f6c1e5     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4258728: 38da73a8     	ldursb	w8, [x29, #-0x59]
 425872c: 36f80888     	tbz	w8, #0x1f, 0x425883c <_ChromeMain+0x42535a0>
 4258730: f85903a0     	ldur	x0, [x29, #-0x70]
 4258734: f85a03a8     	ldur	x8, [x29, #-0x60]
 4258738: d37ff901     	lsl	x1, x8, #1
 425873c: 96f6c1df     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4258740: 1400003f     	b	0x425883c <_ChromeMain+0x42535a0>
 4258744: 90056588     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 4258748: b940b108     	ldr	w8, [x8, #0xb0]
 425874c: 7100051f     	cmp	w8, #0x1
 4258750: 5400076c     	b.gt	0x425883c <_ChromeMain+0x42535a0>
 4258754: b0054ac8     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 4258758: b94b8908     	ldr	w8, [x8, #0xb88]
 425875c: 35000088     	cbnz	w8, 0x425876c <_ChromeMain+0x42534d0>
 4258760: 90056588     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 4258764: f9405d08     	ldr	x8, [x8, #0xb8]
 4258768: b40006a8     	cbz	x8, 0x425883c <_ChromeMain+0x42535a0>
 425876c: f004c621     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4258770: 91080821     	add	x1, x1, #0x202
 4258774: 910143f3     	add	x19, sp, #0x50
 4258778: 910143e0     	add	x0, sp, #0x50
 425877c: 52812282     	mov	w2, #0x914              ; =2324
 4258780: 52800023     	mov	w3, #0x1                ; =1
 4258784: 970ec272     	bl	0x60914c <_ChromeMain+0x603eb0>
 4258788: f004c621     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 425878c: 91097421     	add	x1, x1, #0x25d
 4258790: 91004260     	add	x0, x19, #0x10
 4258794: 52800502     	mov	w2, #0x28               ; =40
 4258798: 96f73349     	bl	0x254bc <_ChromeMain+0x20220>
 425879c: aa0003f6     	mov	x22, x0
 42587a0: b9401a80     	ldr	w0, [x20, #0x18]
 42587a4: 9100e3f3     	add	x19, sp, #0x38
 42587a8: 9100e3e8     	add	x8, sp, #0x38
 42587ac: 94001db9     	bl	0x425fe90 <_ChromeMain+0x425abf4>
 42587b0: 39813fe8     	ldrsb	x8, [sp, #0x4f]
 42587b4: a943abe9     	ldp	x9, x10, [sp, #0x38]
 42587b8: f100011f     	cmp	x8, #0x0
 42587bc: 9a934120     	csel	x0, x9, x19, mi
 42587c0: 7100011f     	cmp	w8, #0x0
 42587c4: 9a884141     	csel	x1, x10, x8, mi
 42587c8: d101c3b3     	sub	x19, x29, #0x70
 42587cc: d101c3a8     	sub	x8, x29, #0x70
 42587d0: 9735294e     	bl	0xfa2d08 <_ChromeMain+0xf9da6c>
 42587d4: 389a73a8     	ldursb	x8, [x29, #-0x59]
 42587d8: a9792ba9     	ldp	x9, x10, [x29, #-0x70]
 42587dc: f100011f     	cmp	x8, #0x0
 42587e0: 9a934121     	csel	x1, x9, x19, mi
 42587e4: 7100011f     	cmp	w8, #0x0
 42587e8: 9a884142     	csel	x2, x10, x8, mi
 42587ec: aa1603e0     	mov	x0, x22
 42587f0: 96f73333     	bl	0x254bc <_ChromeMain+0x20220>
 42587f4: f004c621     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 42587f8: 910a1821     	add	x1, x1, #0x286
 42587fc: 52800162     	mov	w2, #0xb                ; =11
 4258800: 96f7332f     	bl	0x254bc <_ChromeMain+0x20220>
 4258804: 38da73a8     	ldursb	w8, [x29, #-0x59]
 4258808: 36f800a8     	tbz	w8, #0x1f, 0x425881c <_ChromeMain+0x4253580>
 425880c: f85903a0     	ldur	x0, [x29, #-0x70]
 4258810: f85a03a8     	ldur	x8, [x29, #-0x60]
 4258814: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4258818: 96f6c1a8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425881c: 39c13fe8     	ldrsb	w8, [sp, #0x4f]
 4258820: 36f800a8     	tbz	w8, #0x1f, 0x4258834 <_ChromeMain+0x4253598>
 4258824: f9401fe0     	ldr	x0, [sp, #0x38]
 4258828: f94027e8     	ldr	x8, [sp, #0x48]
 425882c: d37ff901     	lsl	x1, x8, #1
 4258830: 96f6c1a2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4258834: 910143e0     	add	x0, sp, #0x50
 4258838: 970ec212     	bl	0x609080 <_ChromeMain+0x603de4>
 425883c: f9403688     	ldr	x8, [x20, #0x68]
