
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
 4258840: f9404509     	ldr	x9, [x8, #0x88]
 4258844: b5000929     	cbnz	x9, 0x4258968 <_ChromeMain+0x42536cc>
 4258848: f9402d08     	ldr	x8, [x8, #0x58]
 425884c: b4000a88     	cbz	x8, 0x425899c <_ChromeMain+0x4253700>
 4258850: aa1503e0     	mov	x0, x21
 4258854: 973d463d     	bl	0x11aa148 <_ChromeMain+0x11a4eac>
 4258858: b4000a20     	cbz	x0, 0x425899c <_ChromeMain+0x4253700>
 425885c: aa0003f7     	mov	x23, x0
 4258860: 6f00e400     	movi.2d	v0, #0000000000000000
 4258864: ad0283e0     	stp	q0, q0, [sp, #0x50]
 4258868: 52800038     	mov	w24, #0x1               ; =1
 425886c: 3901b3f8     	strb	w24, [sp, #0x6c]
 4258870: 390143ff     	strb	wzr, [sp, #0x50]
 4258874: 0f000440     	movi.2s	v0, #0x2
 4258878: fc0543e0     	stur	d0, [sp, #0x54]
 425887c: f805c3ff     	stur	xzr, [sp, #0x5c]
 4258880: f80643ff     	stur	xzr, [sp, #0x64]
 4258884: f9403688     	ldr	x8, [x20, #0x68]
 4258888: f9402d16     	ldr	x22, [x8, #0x58]
 425888c: f9404293     	ldr	x19, [x20, #0x80]
 4258890: b40000b3     	cbz	x19, 0x42588a4 <_ChromeMain+0x4253608>
 4258894: b8380268     	ldadd	w24, w8, [x19]
 4258898: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 425889c: 6b09011f     	cmp	w8, w9
 42588a0: 54001760     	b.eq	0x4258b8c <_ChromeMain+0x42538f0>
 42588a4: f90003f9     	str	x25, [sp]
 42588a8: f9404699     	ldr	x25, [x20, #0x88]
 42588ac: 52800800     	mov	w0, #0x40               ; =64
 42588b0: 96f6daae     	bl	0xf368 <_ChromeMain+0xa0cc>
 42588b4: aa0003e1     	mov	x1, x0
 42588b8: d0ffe8a8     	adrp	x8, 0x3f6e000 <_ChromeMain+0x3f68d64>
 42588bc: 91230108     	add	x8, x8, #0x8c0
 42588c0: 90ffe8a9     	adrp	x9, 0x3f6c000 <_ChromeMain+0x3f66d64>
 42588c4: 912b0129     	add	x9, x9, #0xac0
 42588c8: b9000018     	str	w24, [x0]
 42588cc: d0fff2aa     	adrp	x10, 0x40ae000 <_ChromeMain+0x40a8d64>
 42588d0: 911b014a     	add	x10, x10, #0x6c0
 42588d4: 10001c6b     	adr	x11, 0x4258c60 <_ChromeMain+0x42539c4>
 42588d8: d503201f     	nop
 42588dc: a900a408     	stp	x8, x9, [x0, #0x8]
 42588e0: a901ac0a     	stp	x10, x11, [x0, #0x18]
 42588e4: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 42588e8: f9001c19     	str	x25, [x0, #0x38]
 42588ec: aa1603e0     	mov	x0, x22
 42588f0: 976dd582     	bl	0x1dcdef8 <_ChromeMain+0x1dc8c5c>
 42588f4: aa0003f6     	mov	x22, x0
 42588f8: aa1703e0     	mov	x0, x23
 42588fc: 97a12ba9     	bl	0x2aa37a0 <_ChromeMain+0x2a9e504>
 4258900: b4000400     	cbz	x0, 0x4258980 <_ChromeMain+0x42536e4>
 4258904: f9403688     	ldr	x8, [x20, #0x68]
 4258908: f9402d09     	ldr	x9, [x8, #0x58]
 425890c: 5280350a     	mov	w10, #0x1a8             ; =424
 4258910: 9b0a7d29     	mul	x9, x9, x10
 4258914: b40003e9     	cbz	x9, 0x4258990 <_ChromeMain+0x42536f4>
 4258918: aa0003f7     	mov	x23, x0
 425891c: f9402918     	ldr	x24, [x8, #0x50]
 4258920: 8b090319     	add	x25, x24, x9
 4258924: 100378ba     	adr	x26, 0x425f838 <_ChromeMain+0x425a59c>
 4258928: d503201f     	nop
 425892c: 5280003b     	mov	w27, #0x1               ; =1
 4258930: d0ffe8dc     	adrp	x28, 0x3f72000 <_ChromeMain+0x3f6cd64>
 4258934: 9125039c     	add	x28, x28, #0x940
 4258938: b0ff1833     	adrp	x19, 0x255d000 <_ChromeMain+0x2557d64>
 425893c: 912c0273     	add	x19, x19, #0xb00
 4258940: 14000049     	b	0x4258a64 <_ChromeMain+0x42537c8>
 4258944: aa1403e0     	mov	x0, x20
 4258948: 910683ff     	add	sp, sp, #0x1a0
 425894c: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 4258950: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 4258954: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4258958: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 425895c: a94167fa     	ldp	x26, x25, [sp, #0x10]
 4258960: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 4258964: 17ffec76     	b	0x4253b3c <_ChromeMain+0x424e8a0>
 4258968: 91020101     	add	x1, x8, #0x80
 425896c: aa1903e0     	mov	x0, x25
 4258970: 52800022     	mov	w2, #0x1                ; =1
 4258974: 94d728c8     	bl	0x7822c94 <_ChromeMain+0x781d9f8>
 4258978: f9403688     	ldr	x8, [x20, #0x68]
 425897c: 17ffffb3     	b	0x4258848 <_ChromeMain+0x42535ac>
 4258980: 52800028     	mov	w8, #0x1                ; =1
 4258984: 39004688     	strb	w8, [x20, #0x11]
 4258988: aa1403e0     	mov	x0, x20
 425898c: 940000bd     	bl	0x4258c80 <_ChromeMain+0x42539e4>
 4258990: b5000476     	cbnz	x22, 0x4258a1c <_ChromeMain+0x4253780>
 4258994: f94003f9     	ldr	x25, [sp]
 4258998: 14000005     	b	0x42589ac <_ChromeMain+0x4253710>
 425899c: 52800028     	mov	w8, #0x1                ; =1
 42589a0: 39004688     	strb	w8, [x20, #0x11]
 42589a4: aa1403e0     	mov	x0, x20
 42589a8: 940000b6     	bl	0x4258c80 <_ChromeMain+0x42539e4>
 42589ac: f9403688     	ldr	x8, [x20, #0x68]
 42589b0: f9403908     	ldr	x8, [x8, #0x70]
 42589b4: b40000a8     	cbz	x8, 0x42589c8 <_ChromeMain+0x425372c>
 42589b8: aa1503e0     	mov	x0, x21
 42589bc: 52800001     	mov	w1, #0x0                ; =0
 42589c0: 97b4a057     	bl	0x2f80b1c <_ChromeMain+0x2f7b880>
 42589c4: b50006e0     	cbnz	x0, 0x4258aa0 <_ChromeMain+0x4253804>
 42589c8: 52800028     	mov	w8, #0x1                ; =1
 42589cc: 39004a88     	strb	w8, [x20, #0x12]
 42589d0: aa1403e0     	mov	x0, x20
 42589d4: 940000ab     	bl	0x4258c80 <_ChromeMain+0x42539e4>
 42589d8: b40000d9     	cbz	x25, 0x42589f0 <_ChromeMain+0x4253754>
 42589dc: 91002328     	add	x8, x25, #0x8
 42589e0: 12800009     	mov	w9, #-0x1               ; =-1
 42589e4: b8e90108     	ldaddal	w9, w8, [x8]
 42589e8: 7100051f     	cmp	w8, #0x1
 42589ec: 54000120     	b.eq	0x4258a10 <_ChromeMain+0x4253774>
 42589f0: 910683ff     	add	sp, sp, #0x1a0
 42589f4: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 42589f8: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 42589fc: a94357f6     	ldp	x22, x21, [sp, #0x30]
 4258a00: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 4258a04: a94167fa     	ldp	x26, x25, [sp, #0x10]
 4258a08: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 4258a0c: d65f03c0     	ret
 4258a10: aa1903e0     	mov	x0, x25
 4258a14: 94d72a60     	bl	0x7823394 <_ChromeMain+0x781e0f8>
 4258a18: 17fffff6     	b	0x42589f0 <_ChromeMain+0x4253754>
 4258a1c: 12800008     	mov	w8, #-0x1               ; =-1
 4258a20: b8e802c8     	ldaddal	w8, w8, [x22]
 4258a24: 7100051f     	cmp	w8, #0x1
 4258a28: 54fffb61     	b.ne	0x4258994 <_ChromeMain+0x42536f8>
 4258a2c: f9400ac8     	ldr	x8, [x22, #0x10]
 4258a30: aa1603e0     	mov	x0, x22
 4258a34: d63f0100     	blr	x8
 4258a38: 17ffffd7     	b	0x4258994 <_ChromeMain+0x42536f8>
 4258a3c: f94002e8     	ldr	x8, [x23]
 4258a40: f9401508     	ldr	x8, [x8, #0x28]
 4258a44: 9104c302     	add	x2, x24, #0x130
 4258a48: 910143e3     	add	x3, sp, #0x50
 4258a4c: aa1703e0     	mov	x0, x23
 4258a50: aa1803e1     	mov	x1, x24
 4258a54: d63f0100     	blr	x8
 4258a58: 9106a318     	add	x24, x24, #0x1a8
 4258a5c: eb19031f     	cmp	x24, x25
 4258a60: 54fff980     	b.eq	0x4258990 <_ChromeMain+0x42536f4>
 4258a64: 52800600     	mov	w0, #0x30               ; =48
 4258a68: 96f6da40     	bl	0xf368 <_ChromeMain+0xa0cc>
 4258a6c: aa0003e4     	mov	x4, x0
 4258a70: b900001b     	str	w27, [x0]
 4258a74: a900f01a     	stp	x26, x28, [x0, #0x8]
 4258a78: f9000c13     	str	x19, [x0, #0x18]
 4258a7c: f9001416     	str	x22, [x0, #0x28]
 4258a80: b4fffdf6     	cbz	x22, 0x4258a3c <_ChromeMain+0x42537a0>
 4258a84: b83b02c8     	ldadd	w27, w8, [x22]
 4258a88: 7100011f     	cmp	w8, #0x0
 4258a8c: 540006ed     	b.le	0x4258b68 <_ChromeMain+0x42538cc>
 4258a90: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4258a94: 6b09011f     	cmp	w8, w9
 4258a98: 540006e0     	b.eq	0x4258b74 <_ChromeMain+0x42538d8>
 4258a9c: 17ffffe8     	b	0x4258a3c <_ChromeMain+0x42537a0>
 4258aa0: aa0003f5     	mov	x21, x0
 4258aa4: f9403688     	ldr	x8, [x20, #0x68]
 4258aa8: a946e116     	ldp	x22, x24, [x8, #0x68]
 4258aac: a900e3f6     	stp	x22, x24, [sp, #0x8]
 4258ab0: f9403d17     	ldr	x23, [x8, #0x78]
 4258ab4: a906fd1f     	stp	xzr, xzr, [x8, #0x68]
 4258ab8: f9003d1f     	str	xzr, [x8, #0x78]
 4258abc: f9000ff7     	str	x23, [sp, #0x18]
 4258ac0: 910083e8     	add	x8, sp, #0x20
 4258ac4: 910023e0     	add	x0, sp, #0x8
 4258ac8: 94ac4ec5     	bl	0x6d6c5dc <_ChromeMain+0x6d67340>
 4258acc: f9404293     	ldr	x19, [x20, #0x80]
 4258ad0: b40000d3     	cbz	x19, 0x4258ae8 <_ChromeMain+0x425384c>
 4258ad4: 52800028     	mov	w8, #0x1                ; =1
 4258ad8: b8280268     	ldadd	w8, w8, [x19]
 4258adc: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4258ae0: 6b09011f     	cmp	w8, w9
 4258ae4: 540007c0     	b.eq	0x4258bdc <_ChromeMain+0x4253940>
 4258ae8: f9404694     	ldr	x20, [x20, #0x88]
 4258aec: 52800800     	mov	w0, #0x40               ; =64
 4258af0: 96f6da1e     	bl	0xf368 <_ChromeMain+0xa0cc>
 4258af4: aa0003e2     	mov	x2, x0
 4258af8: 52800028     	mov	w8, #0x1                ; =1
 4258afc: d0ffe8a9     	adrp	x9, 0x3f6e000 <_ChromeMain+0x3f68d64>
 4258b00: 91230129     	add	x9, x9, #0x8c0
 4258b04: 90ffe8aa     	adrp	x10, 0x3f6c000 <_ChromeMain+0x3f66d64>
 4258b08: 912b014a     	add	x10, x10, #0xac0
 4258b0c: b9000008     	str	w8, [x0]
 4258b10: d0fff2a8     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 4258b14: 911b0108     	add	x8, x8, #0x6c0
 4258b18: 10000aab     	adr	x11, 0x4258c6c <_ChromeMain+0x42539d0>
 4258b1c: d503201f     	nop
 4258b20: a900a809     	stp	x9, x10, [x0, #0x8]
 4258b24: a901ac08     	stp	x8, x11, [x0, #0x18]
 4258b28: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 4258b2c: f9001c14     	str	x20, [x0, #0x38]
 4258b30: 910083e1     	add	x1, sp, #0x20
 4258b34: aa1503e0     	mov	x0, x21
 4258b38: 94ac6821     	bl	0x6d72bbc <_ChromeMain+0x6d6d920>
 4258b3c: f94013f3     	ldr	x19, [sp, #0x20]
 4258b40: b5000593     	cbnz	x19, 0x4258bf0 <_ChromeMain+0x4253954>
 4258b44: b50002b6     	cbnz	x22, 0x4258b98 <_ChromeMain+0x42538fc>
 4258b48: 910022a8     	add	x8, x21, #0x8
 4258b4c: 12800009     	mov	w9, #-0x1               ; =-1
 4258b50: b8e90108     	ldaddal	w9, w8, [x8]
 4258b54: 7100051f     	cmp	w8, #0x1
 4258b58: 54fff401     	b.ne	0x42589d8 <_ChromeMain+0x425373c>
 4258b5c: aa1503e0     	mov	x0, x21
 4258b60: 97923dff     	bl	0x26e835c <_ChromeMain+0x26e30c0>
 4258b64: 17ffff9d     	b	0x42589d8 <_ChromeMain+0x425373c>
 4258b68: d4200000     	brk	#0
 4258b6c: d4400000     	hlt	#0
 4258b70: d4200020     	brk	#0x1
 4258b74: d4200000     	brk	#0
 4258b78: d4400000     	hlt	#0
 4258b7c: d4200020     	brk	#0x1
 4258b80: d4200000     	brk	#0
 4258b84: d4400000     	hlt	#0
 4258b88: d4200020     	brk	#0x1
 4258b8c: d4200000     	brk	#0
 4258b90: d4400000     	hlt	#0
 4258b94: d4200020     	brk	#0x1
 4258b98: 52810608     	mov	w8, #0x830              ; =2096
 4258b9c: 9b087f08     	mul	x8, x24, x8
 4258ba0: b4000148     	cbz	x8, 0x4258bc8 <_ChromeMain+0x425392c>
 4258ba4: 8b160108     	add	x8, x8, x22
 4258ba8: d120c100     	sub	x0, x8, #0x830
 4258bac: 928105e8     	mov	x8, #-0x830             ; =-2096
 4258bb0: 9b087f13     	mul	x19, x24, x8
 4258bb4: b4000180     	cbz	x0, 0x4258be4 <_ChromeMain+0x4253948>
 4258bb8: 94ac41d9     	bl	0x6d6931c <_ChromeMain+0x6d64080>
 4258bbc: d120c000     	sub	x0, x0, #0x830
 4258bc0: b120c273     	adds	x19, x19, #0x830
 4258bc4: 54ffff81     	b.ne	0x4258bb4 <_ChromeMain+0x4253918>
 4258bc8: 52810608     	mov	w8, #0x830              ; =2096
 4258bcc: 9b087ee1     	mul	x1, x23, x8
 4258bd0: aa1603e0     	mov	x0, x22
 4258bd4: 96f6c0b9     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4258bd8: 17ffffdc     	b	0x4258b48 <_ChromeMain+0x42538ac>
 4258bdc: d4200000     	brk	#0
 4258be0: d4400000     	hlt	#0
 4258be4: d4200020     	brk	#0x1
 4258be8: aa1303e0     	mov	x0, x19
 4258bec: 1400000f     	b	0x4258c28 <_ChromeMain+0x425398c>
 4258bf0: f94017e8     	ldr	x8, [sp, #0x28]
 4258bf4: d375d109     	lsl	x9, x8, #11
 4258bf8: eb081929     	subs	x9, x9, x8, lsl #6
 4258bfc: 54ffff60     	b.eq	0x4258be8 <_ChromeMain+0x425394c>
 4258c00: 8b130129     	add	x9, x9, x19
 4258c04: d11f0120     	sub	x0, x9, #0x7c0
 4258c08: d37ae509     	lsl	x9, x8, #6
 4258c0c: cb082d34     	sub	x20, x9, x8, lsl #11
 4258c10: b4fffea0     	cbz	x0, 0x4258be4 <_ChromeMain+0x4253948>
 4258c14: 94ac5514     	bl	0x6d6e064 <_ChromeMain+0x6d68dc8>
 4258c18: d11f0000     	sub	x0, x0, #0x7c0
 4258c1c: b11f0294     	adds	x20, x20, #0x7c0
 4258c20: 54ffff81     	b.ne	0x4258c10 <_ChromeMain+0x4253974>
 4258c24: f94013e0     	ldr	x0, [sp, #0x20]
 4258c28: cb000268     	sub	x8, x19, x0
 4258c2c: 9346fd08     	asr	x8, x8, #6
 4258c30: d28f7be9     	mov	x9, #0x7bdf             ; =31711
 4258c34: f2b7bde9     	movk	x9, #0xbdef, lsl #16
 4258c38: f2dbdee9     	movk	x9, #0xdef7, lsl #32
 4258c3c: f2fdef69     	movk	x9, #0xef7b, lsl #48
 4258c40: 9b097d08     	mul	x8, x8, x9
 4258c44: f90017e8     	str	x8, [sp, #0x28]
 4258c48: f9401be8     	ldr	x8, [sp, #0x30]
 4258c4c: d375d109     	lsl	x9, x8, #11
 4258c50: cb081921     	sub	x1, x9, x8, lsl #6
 4258c54: 96f6c099     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4258c58: b4fff796     	cbz	x22, 0x4258b48 <_ChromeMain+0x42538ac>
 4258c5c: 17ffffcf     	b	0x4258b98 <_ChromeMain+0x42538fc>
 4258c60: 52800028     	mov	w8, #0x1                ; =1
 4258c64: 39004408     	strb	w8, [x0, #0x11]
 4258c68: 14000006     	b	0x4258c80 <_ChromeMain+0x42539e4>
 4258c6c: 52800028     	mov	w8, #0x1                ; =1
 4258c70: 39004808     	strb	w8, [x0, #0x12]
 4258c74: 14000003     	b	0x4258c80 <_ChromeMain+0x42539e4>
		...
