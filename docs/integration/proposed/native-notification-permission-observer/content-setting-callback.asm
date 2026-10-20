
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 22ef2b0: d1002000     	sub	x0, x0, #0x8
 22ef2b4: 2a0303e3     	mov	w3, w3
 22ef2b8: 14000001     	b	0x22ef2bc <_ChromeMain+0x22ea020>
 22ef2bc: 7100187f     	cmp	w3, #0x6
 22ef2c0: 54000080     	b.eq	0x22ef2d0 <_ChromeMain+0x22ea034>
 22ef2c4: 3100047f     	cmn	w3, #0x1
 22ef2c8: 54000040     	b.eq	0x22ef2d0 <_ChromeMain+0x22ea034>
 22ef2cc: d65f03c0     	ret
 22ef2d0: d10103ff     	sub	sp, sp, #0x40
 22ef2d4: a9024ff4     	stp	x20, x19, [sp, #0x20]
 22ef2d8: a9037bfd     	stp	x29, x30, [sp, #0x30]
 22ef2dc: 9100c3fd     	add	x29, sp, #0x30
 22ef2e0: f90007e0     	str	x0, [sp, #0x8]
 22ef2e4: 947829b7     	bl	0x40f99c0 <_ChromeMain+0x40f4724>
 22ef2e8: 52800200     	mov	w0, #0x10               ; =16
 22ef2ec: 9774801f     	bl	0xf368 <_ChromeMain+0xa0cc>
 22ef2f0: aa0003f3     	mov	x19, x0
 22ef2f4: b900001f     	str	wzr, [x0]
 22ef2f8: f900041f     	str	xzr, [x0, #0x8]
 22ef2fc: b4000060     	cbz	x0, 0x22ef308 <_ChromeMain+0x22ea06c>
 22ef300: aa1303e0     	mov	x0, x19
 22ef304: 978375df     	bl	0x3cca80 <_ChromeMain+0x3c77e4>
 22ef308: f94007e8     	ldr	x8, [sp, #0x8]
 22ef30c: f9400d00     	ldr	x0, [x8, #0x18]
 22ef310: 910063e8     	add	x8, sp, #0x18
 22ef314: a9014fe8     	stp	x8, x19, [sp, #0x10]
 22ef318: b002a762     	adrp	x2, 0x77dc000 <_ChromeMain+0x77d6d64>
 22ef31c: 911ac042     	add	x2, x2, #0x6b0
 22ef320: 910043e1     	add	x1, sp, #0x10
 22ef324: 9474f462     	bl	0x402c4ac <_ChromeMain+0x4027210>
 22ef328: 910063e0     	add	x0, sp, #0x18
 22ef32c: 9553ad17     	bl	0x77da788 <_ChromeMain+0x77d54ec>
 22ef330: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 22ef334: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 22ef338: 910103ff     	add	sp, sp, #0x40
 22ef33c: 17ffffe4     	b	0x22ef2cc <_ChromeMain+0x22ea030>
