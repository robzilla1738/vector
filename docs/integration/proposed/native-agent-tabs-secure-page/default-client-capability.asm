
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4032ebc: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 4032ec0: a90157f6     	stp	x22, x21, [sp, #0x10]
 4032ec4: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4032ec8: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4032ecc: 9100c3fd     	add	x29, sp, #0x30
 4032ed0: aa0403f4     	mov	x20, x4
 4032ed4: aa0303f5     	mov	x21, x3
 4032ed8: aa0203f6     	mov	x22, x2
 4032edc: aa0003f3     	mov	x19, x0
 4032ee0: 900504e8     	adrp	x8, 0xe0ce000 <dyld_stub_binder+0xe0ce000>
 4032ee4: 9101c108     	add	x8, x8, #0x70
 4032ee8: a9000408     	stp	x8, x1, [x0]
 4032eec: 925e7448     	and	x8, x2, #0xfffffffc00000000
 4032ef0: 90055c09     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4032ef4: f9404529     	ldr	x9, [x9, #0x88]
 4032ef8: eb09011f     	cmp	x8, x9
 4032efc: 54000061     	b.ne	0x4032f08 <_ChromeMain+0x402dc6c>
 4032f00: aa1603e0     	mov	x0, x22
 4032f04: 96ff84fe     	bl	0x142fc <_ChromeMain+0xf060>
 4032f08: f9000a76     	str	x22, [x19, #0x10]
 4032f0c: b9001a75     	str	w21, [x19, #0x18]
 4032f10: f9001274     	str	x20, [x19, #0x20]
 4032f14: b4000474     	cbz	x20, 0x4032fa0 <_ChromeMain+0x402dd04>
 4032f18: b9400a88     	ldr	w8, [x20, #0x8]
 4032f1c: 31000508     	adds	w8, w8, #0x1
 4032f20: b9000a88     	str	w8, [x20, #0x8]
 4032f24: 54000782     	b.hs	0x4033014 <_ChromeMain+0x402dd78>
 4032f28: 3900a27f     	strb	wzr, [x19, #0x28]
 4032f2c: f9401275     	ldr	x21, [x19, #0x20]
