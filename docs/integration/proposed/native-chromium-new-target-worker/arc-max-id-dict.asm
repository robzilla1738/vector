
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 426ccc0: b4000501     	cbz	x1, 0x426cd60 <_ChromeMain+0x4267ac4>
 426ccc4: d10103ff     	sub	sp, sp, #0x40
 426ccc8: a90157f6     	stp	x22, x21, [sp, #0x10]
 426cccc: a9024ff4     	stp	x20, x19, [sp, #0x20]
 426ccd0: a9037bfd     	stp	x29, x30, [sp, #0x30]
 426ccd4: 9100c3fd     	add	x29, sp, #0x30
 426ccd8: aa0103f3     	mov	x19, x1
 426ccdc: aa0003f4     	mov	x20, x0
 426cce0: f004ac01     	adrp	x1, 0xd7ef000 <dyld_stub_binder+0xd7ef000>
 426cce4: 9109e421     	add	x1, x1, #0x279
 426cce8: 52800042     	mov	w2, #0x2                ; =2
 426ccec: 9776f365     	bl	0x2029a80 <_ChromeMain+0x20247e4>
 426ccf0: b40001a0     	cbz	x0, 0x426cd24 <_ChromeMain+0x4267a88>
 426ccf4: b9000fff     	str	wzr, [sp, #0xc]
 426ccf8: 39805c01     	ldrsb	x1, [x0, #0x17]
 426ccfc: b6f80041     	tbz	x1, #0x3f, 0x426cd04 <_ChromeMain+0x4267a68>
 426cd00: a9400400     	ldp	x0, x1, [x0]
 426cd04: 910033e2     	add	x2, sp, #0xc
 426cd08: 97594c77     	bl	0x18bfee4 <_ChromeMain+0x18bac48>
 426cd0c: 340000c0     	cbz	w0, 0x426cd24 <_ChromeMain+0x4267a88>
 426cd10: b9400268     	ldr	w8, [x19]
 426cd14: b9400fe9     	ldr	w9, [sp, #0xc]
 426cd18: 6b09011f     	cmp	w8, w9
 426cd1c: 1a89c108     	csel	w8, w8, w9, gt
 426cd20: b9000268     	str	w8, [x19]
 426cd24: f9400688     	ldr	x8, [x20, #0x8]
 426cd28: d37be915     	lsl	x21, x8, #5
 426cd2c: b4000115     	cbz	x21, 0x426cd4c <_ChromeMain+0x4267ab0>
 426cd30: f9400288     	ldr	x8, [x20]
 426cd34: 91006114     	add	x20, x8, #0x18
 426cd38: f8420680     	ldr	x0, [x20], #0x20
 426cd3c: aa1303e1     	mov	x1, x19
 426cd40: 94000430     	bl	0x426de00 <_ChromeMain+0x4268b64>
 426cd44: f10082b5     	subs	x21, x21, #0x20
 426cd48: 54ffff81     	b.ne	0x426cd38 <_ChromeMain+0x4267a9c>
 426cd4c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 426cd50: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 426cd54: a94157f6     	ldp	x22, x21, [sp, #0x10]
 426cd58: 910103ff     	add	sp, sp, #0x40
 426cd5c: d65f03c0     	ret
 426cd60: d4200000     	brk	#0
 426cd64: d4400000     	hlt	#0
 426cd68: d4200020     	brk	#0x1
