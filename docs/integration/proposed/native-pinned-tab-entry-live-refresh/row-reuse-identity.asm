
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4605404: f940ce78     	ldr	x24, [x19, #0x198]
 4605408: 910da275     	add	x21, x19, #0x368
 460540c: f941b668     	ldr	x8, [x19, #0x368]
 4605410: eb08031f     	cmp	x24, x8
 4605414: 54000ae1     	b.ne	0x4605570 <_ChromeMain+0x46002d4>
 4605418: f85483b7     	ldur	x23, [x29, #-0xb8]
 460541c: f941b274     	ldr	x20, [x19, #0x360]
 4605420: eb17031f     	cmp	x24, x23
 4605424: 54000180     	b.eq	0x4605454 <_ChromeMain+0x46001b8>
 4605428: 52800016     	mov	w22, #0x0               ; =0
 460542c: b4000ed4     	cbz	x20, 0x4605604 <_ChromeMain+0x4600368>
 4605430: 52804d08     	mov	w8, #0x268              ; =616
 4605434: 9b087f18     	mul	x24, x24, x8
 4605438: b4000998     	cbz	x24, 0x4605568 <_ChromeMain+0x46002cc>
 460543c: d2800017     	mov	x23, #0x0               ; =0
 4605440: aa1403f9     	mov	x25, x20
 4605444: 1400003e     	b	0x460553c <_ChromeMain+0x46002a0>
 4605448: 52800036     	mov	w22, #0x1               ; =1
 460544c: b5ffff34     	cbnz	x20, 0x4605430 <_ChromeMain+0x4600194>
 4605450: 1400006d     	b	0x4605604 <_ChromeMain+0x4600368>
 4605454: 52804d08     	mov	w8, #0x268              ; =616
 4605458: 9b087f08     	mul	x8, x24, x8
 460545c: b4ffff68     	cbz	x8, 0x4605448 <_ChromeMain+0x46001ac>
 4605460: d280001a     	mov	x26, #0x0               ; =0
 4605464: f85403b9     	ldur	x25, [x29, #-0xc0]
 4605468: d109a11b     	sub	x27, x8, #0x268
 460546c: 8b1a0289     	add	x9, x20, x26
 4605470: 8b1a0328     	add	x8, x25, x26
 4605474: 39405d2b     	ldrb	w11, [x9, #0x17]
 4605478: 13001d6a     	sxtb	w10, w11
 460547c: f940052c     	ldr	x12, [x9, #0x8]
 4605480: 7100015f     	cmp	w10, #0x0
 4605484: 9a8b4182     	csel	x2, x12, x11, mi
 4605488: 39405d0c     	ldrb	w12, [x8, #0x17]
 460548c: 13001d8b     	sxtb	w11, w12
 4605490: f940050d     	ldr	x13, [x8, #0x8]
 4605494: 7100017f     	cmp	w11, #0x0
 4605498: 9a8c41ac     	csel	x12, x13, x12, mi
 460549c: eb0c005f     	cmp	x2, x12
 46054a0: 54fffc41     	b.ne	0x4605428 <_ChromeMain+0x460018c>
 46054a4: f940012c     	ldr	x12, [x9]
 46054a8: 7100015f     	cmp	w10, #0x0
 46054ac: 9a894180     	csel	x0, x12, x9, mi
 46054b0: f9400109     	ldr	x9, [x8]
 46054b4: 7100017f     	cmp	w11, #0x0
 46054b8: 9a884121     	csel	x1, x9, x8, mi
 46054bc: 94e810e9     	bl	0x8009860 <_ChromeMain+0x80045c4>
 46054c0: 7100001f     	cmp	w0, #0x0
 46054c4: 1a9f17f6     	cset	w22, eq
 46054c8: fa5a0364     	ccmp	x27, x26, #0x4, eq
 46054cc: 9109a35a     	add	x26, x26, #0x268
 46054d0: 54fffce1     	b.ne	0x460546c <_ChromeMain+0x46001d0>
 46054d4: 17ffffd6     	b	0x460542c <_ChromeMain+0x4600190>
