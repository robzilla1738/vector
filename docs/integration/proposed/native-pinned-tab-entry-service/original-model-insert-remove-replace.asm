
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41d7424: d10103ff     	sub	sp, sp, #0x40
 41d7428: a90157f6     	stp	x22, x21, [sp, #0x10]
 41d742c: a9024ff4     	stp	x20, x19, [sp, #0x20]
 41d7430: a9037bfd     	stp	x29, x30, [sp, #0x30]
 41d7434: 9100c3fd     	add	x29, sp, #0x30
 41d7438: aa0103f4     	mov	x20, x1
 41d743c: aa0003f3     	mov	x19, x0
 41d7440: b9400048     	ldr	w8, [x2]
 41d7444: 7100051f     	cmp	w8, #0x1
 41d7448: 540003c0     	b.eq	0x41d74c0 <_ChromeMain+0x41d2224>
 41d744c: 7100091f     	cmp	w8, #0x2
 41d7450: 54000100     	b.eq	0x41d7470 <_ChromeMain+0x41d21d4>
 41d7454: 7100111f     	cmp	w8, #0x4
 41d7458: 540006c0     	b.eq	0x41d7530 <_ChromeMain+0x41d2294>
 41d745c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 41d7460: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 41d7464: a94157f6     	ldp	x22, x21, [sp, #0x10]
 41d7468: 910103ff     	add	sp, sp, #0x40
 41d746c: d65f03c0     	ret
 41d7470: 3940a048     	ldrb	w8, [x2, #0x28]
 41d7474: 7100051f     	cmp	w8, #0x1
 41d7478: 540006e1     	b.ne	0x41d7554 <_ChromeMain+0x41d22b8>
 41d747c: f9400848     	ldr	x8, [x2, #0x10]
 41d7480: 8b080508     	add	x8, x8, x8, lsl #1
 41d7484: d37ced14     	lsl	x20, x8, #4
 41d7488: b4fffeb4     	cbz	x20, 0x41d745c <_ChromeMain+0x41d21c0>
 41d748c: f9400448     	ldr	x8, [x2, #0x8]
 41d7490: 91002115     	add	x21, x8, #0x8
 41d7494: 14000008     	b	0x41d74b4 <_ChromeMain+0x41d2218>
 41d7498: b9401108     	ldr	w8, [x8, #0x10]
 41d749c: b9000fe8     	str	w8, [sp, #0xc]
 41d74a0: 91018260     	add	x0, x19, #0x60
 41d74a4: 910033e1     	add	x1, sp, #0xc
 41d74a8: 940000ac     	bl	0x41d7758 <_ChromeMain+0x41d24bc>
 41d74ac: f100c294     	subs	x20, x20, #0x30
 41d74b0: 54fffd60     	b.eq	0x41d745c <_ChromeMain+0x41d21c0>
 41d74b4: f84306a8     	ldr	x8, [x21], #0x30
 41d74b8: b4ffffa8     	cbz	x8, 0x41d74ac <_ChromeMain+0x41d2210>
 41d74bc: 17fffff7     	b	0x41d7498 <_ChromeMain+0x41d21fc>
 41d74c0: 3940a048     	ldrb	w8, [x2, #0x28]
 41d74c4: 35000488     	cbnz	w8, 0x41d7554 <_ChromeMain+0x41d22b8>
 41d74c8: f9400848     	ldr	x8, [x2, #0x10]
 41d74cc: 8b080508     	add	x8, x8, x8, lsl #1
 41d74d0: d37df115     	lsl	x21, x8, #3
 41d74d4: b40001b5     	cbz	x21, 0x41d7508 <_ChromeMain+0x41d226c>
 41d74d8: f9400456     	ldr	x22, [x2, #0x8]
 41d74dc: 14000006     	b	0x41d74f4 <_ChromeMain+0x41d2258>
 41d74e0: aa1303e0     	mov	x0, x19
 41d74e4: 94000024     	bl	0x41d7574 <_ChromeMain+0x41d22d8>
 41d74e8: 910062d6     	add	x22, x22, #0x18
 41d74ec: f10062b5     	subs	x21, x21, #0x18
 41d74f0: 540000c0     	b.eq	0x41d7508 <_ChromeMain+0x41d226c>
 41d74f4: f94002c1     	ldr	x1, [x22]
 41d74f8: b4ffff81     	cbz	x1, 0x41d74e8 <_ChromeMain+0x41d224c>
 41d74fc: 39418428     	ldrb	w8, [x1, #0x61]
 41d7500: 34ffff48     	cbz	w8, 0x41d74e8 <_ChromeMain+0x41d224c>
 41d7504: 17fffff7     	b	0x41d74e0 <_ChromeMain+0x41d2244>
 41d7508: f9402260     	ldr	x0, [x19, #0x40]
 41d750c: 94e42222     	bl	0x7adfd94 <_ChromeMain+0x7adaaf8>
 41d7510: 3707fa60     	tbnz	w0, #0x0, 0x41d745c <_ChromeMain+0x41d21c0>
 41d7514: aa1303e0     	mov	x0, x19
 41d7518: aa1403e1     	mov	x1, x20
 41d751c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 41d7520: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 41d7524: a94157f6     	ldp	x22, x21, [sp, #0x10]
 41d7528: 910103ff     	add	sp, sp, #0x40
 41d752c: 17fffbe9     	b	0x41d64d0 <_ChromeMain+0x41d1234>
 41d7530: aa0203e0     	mov	x0, x2
 41d7534: 94ee20b3     	bl	0x7d5f800 <_ChromeMain+0x7d5a564>
 41d7538: f9400001     	ldr	x1, [x0]
 41d753c: b4fffe61     	cbz	x1, 0x41d7508 <_ChromeMain+0x41d226c>
 41d7540: 39418428     	ldrb	w8, [x1, #0x61]
 41d7544: 34fffe28     	cbz	w8, 0x41d7508 <_ChromeMain+0x41d226c>
 41d7548: aa1303e0     	mov	x0, x19
 41d754c: 9400000a     	bl	0x41d7574 <_ChromeMain+0x41d22d8>
 41d7550: 17ffffee     	b	0x41d7508 <_ChromeMain+0x41d226c>
 41d7554: 7103fd1f     	cmp	w8, #0xff
 41d7558: 54000081     	b.ne	0x41d7568 <_ChromeMain+0x41d22cc>
 41d755c: b004b060     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 41d7560: 913be000     	add	x0, x0, #0xef8
 41d7564: 94293f4b     	bl	0x4c27290 <_ChromeMain+0x4c21ff4>
 41d7568: b004b060     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 41d756c: 913c6000     	add	x0, x0, #0xf18
 41d7570: 94293f48     	bl	0x4c27290 <_ChromeMain+0x4c21ff4>
