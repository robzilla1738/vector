
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 40ff0cc: d10183ff     	sub	sp, sp, #0x60
 40ff0d0: a90357f6     	stp	x22, x21, [sp, #0x30]
 40ff0d4: a9044ff4     	stp	x20, x19, [sp, #0x40]
 40ff0d8: a9057bfd     	stp	x29, x30, [sp, #0x50]
 40ff0dc: 910143fd     	add	x29, sp, #0x50
 40ff0e0: aa0003f5     	mov	x21, x0
 40ff0e4: f0056f28     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 40ff0e8: f9467d00     	ldr	x0, [x8, #0xcf8]
 40ff0ec: b40004c0     	cbz	x0, 0x40ff184 <_ChromeMain+0x40f9ee8>
 40ff0f0: aa0103f3     	mov	x19, x1
 40ff0f4: 976482a1     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 40ff0f8: 52800016     	mov	w22, #0x0               ; =0
 40ff0fc: b4000475     	cbz	x21, 0x40ff188 <_ChromeMain+0x40f9eec>
 40ff100: aa0003f4     	mov	x20, x0
 40ff104: b4000420     	cbz	x0, 0x40ff188 <_ChromeMain+0x40f9eec>
 40ff108: 39805e68     	ldrsb	x8, [x19, #0x17]
 40ff10c: b7f80388     	tbnz	x8, #0x3f, 0x40ff17c <_ChromeMain+0x40f9ee0>
 40ff110: b40003a8     	cbz	x8, 0x40ff184 <_ChromeMain+0x40f9ee8>
 40ff114: a9007fff     	stp	xzr, xzr, [sp]
 40ff118: f9000bff     	str	xzr, [sp, #0x10]
 40ff11c: f94002a8     	ldr	x8, [x21]
 40ff120: f940a508     	ldr	x8, [x8, #0x148]
 40ff124: aa1503e0     	mov	x0, x21
 40ff128: d63f0100     	blr	x8
 40ff12c: f9400008     	ldr	x8, [x0]
 40ff130: f9401909     	ldr	x9, [x8, #0x30]
 40ff134: 910003e8     	mov	x8, sp
 40ff138: d63f0120     	blr	x9
 40ff13c: 910003e0     	mov	x0, sp
 40ff140: aa1303e1     	mov	x1, x19
 40ff144: 973f33f0     	bl	0x10cc104 <_ChromeMain+0x10c6e68>
 40ff148: 37000360     	tbnz	w0, #0x0, 0x40ff1b4 <_ChromeMain+0x40f9f18>
 40ff14c: aa1403e0     	mov	x0, x20
 40ff150: 976482b0     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 40ff154: aa0003f4     	mov	x20, x0
 40ff158: 910063e8     	add	x8, sp, #0x18
 40ff15c: 97a8f761     	bl	0x2b3cee0 <_ChromeMain+0x2b37c44>
 40ff160: a941a7e0     	ldp	x0, x9, [sp, #0x18]
 40ff164: d37df128     	lsl	x8, x9, #3
 40ff168: b40005e8     	cbz	x8, 0x40ff224 <_ChromeMain+0x40f9f88>
 40ff16c: d280000a     	mov	x10, #0x0               ; =0
 40ff170: aa0803eb     	mov	x11, x8
 40ff174: aa0003ec     	mov	x12, x0
 40ff178: 1400001d     	b	0x40ff1ec <_ChromeMain+0x40f9f50>
 40ff17c: f9400668     	ldr	x8, [x19, #0x8]
 40ff180: b5fffca8     	cbnz	x8, 0x40ff114 <_ChromeMain+0x40f9e78>
 40ff184: 52800016     	mov	w22, #0x0               ; =0
 40ff188: 120002c0     	and	w0, w22, #0x1
 40ff18c: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 40ff190: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 40ff194: a94357f6     	ldp	x22, x21, [sp, #0x30]
 40ff198: 910183ff     	add	sp, sp, #0x60
 40ff19c: d65f03c0     	ret
 40ff1a0: f90013ff     	str	xzr, [sp, #0x20]
 40ff1a4: f94017e8     	ldr	x8, [sp, #0x28]
 40ff1a8: d37df101     	lsl	x1, x8, #3
 40ff1ac: 96fc2743     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40ff1b0: 360002d5     	tbz	w21, #0x0, 0x40ff208 <_ChromeMain+0x40f9f6c>
 40ff1b4: 52800016     	mov	w22, #0x0               ; =0
 40ff1b8: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 40ff1bc: 36fffe68     	tbz	w8, #0x1f, 0x40ff188 <_ChromeMain+0x40f9eec>
 40ff1c0: f94003e0     	ldr	x0, [sp]
 40ff1c4: f9400be8     	ldr	x8, [sp, #0x10]
 40ff1c8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 40ff1cc: 96fc273b     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40ff1d0: 17ffffee     	b	0x40ff188 <_ChromeMain+0x40f9eec>
 40ff1d4: 394181ad     	ldrb	w13, [x13, #0x60]
 40ff1d8: d24001ad     	eor	x13, x13, #0x1
 40ff1dc: 8b0d014a     	add	x10, x10, x13
 40ff1e0: 9100218c     	add	x12, x12, #0x8
 40ff1e4: f100216b     	subs	x11, x11, #0x8
 40ff1e8: 54000080     	b.eq	0x40ff1f8 <_ChromeMain+0x40f9f5c>
 40ff1ec: f940018d     	ldr	x13, [x12]
 40ff1f0: b4ffff8d     	cbz	x13, 0x40ff1e0 <_ChromeMain+0x40f9f44>
 40ff1f4: 17fffff8     	b	0x40ff1d4 <_ChromeMain+0x40f9f38>
 40ff1f8: f100095f     	cmp	x10, #0x2
 40ff1fc: 1a9f27f5     	cset	w21, lo
 40ff200: b5000160     	cbnz	x0, 0x40ff22c <_ChromeMain+0x40f9f90>
 40ff204: 3707fd95     	tbnz	w21, #0x0, 0x40ff1b4 <_ChromeMain+0x40f9f18>
 40ff208: aa1403e0     	mov	x0, x20
 40ff20c: aa1303e1     	mov	x1, x19
 40ff210: 976482bc     	bl	0x1a1fd00 <_ChromeMain+0x1a1aa64>
 40ff214: b4fffd00     	cbz	x0, 0x40ff1b4 <_ChromeMain+0x40f9f18>
 40ff218: 39418008     	ldrb	w8, [x0, #0x60]
 40ff21c: 52000116     	eor	w22, w8, #0x1
 40ff220: 17ffffe6     	b	0x40ff1b8 <_ChromeMain+0x40f9f1c>
 40ff224: 52800035     	mov	w21, #0x1               ; =1
 40ff228: b4fffee0     	cbz	x0, 0x40ff204 <_ChromeMain+0x40f9f68>
 40ff22c: 9240f129     	and	x9, x9, #0x1fffffffffffffff
 40ff230: 5280010a     	mov	w10, #0x8               ; =8
 40ff234: 8b000108     	add	x8, x8, x0
 40ff238: cb080148     	sub	x8, x10, x8
 40ff23c: d343090a     	lsl	x10, x8, #61
 40ff240: cb080148     	sub	x8, x10, x8
 40ff244: eb480d3f     	cmp	x9, x8, lsr #3
 40ff248: 54fffac9     	b.ls	0x40ff1a0 <_ChromeMain+0x40f9f04>
 40ff24c: d4200020     	brk	#0x1
