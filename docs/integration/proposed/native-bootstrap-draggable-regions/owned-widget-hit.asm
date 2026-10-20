
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 c7716bc: d101c3ff     	sub	sp, sp, #0x70
 c7716c0: a9035ff8     	stp	x24, x23, [sp, #0x30]
 c7716c4: a90457f6     	stp	x22, x21, [sp, #0x40]
 c7716c8: a9054ff4     	stp	x20, x19, [sp, #0x50]
 c7716cc: a9067bfd     	stp	x29, x30, [sp, #0x60]
 c7716d0: 910183fd     	add	x29, sp, #0x60
 c7716d4: aa0003f4     	mov	x20, x0
 c7716d8: 9107c000     	add	x0, x0, #0x1f0
 c7716dc: 977da535     	bl	0xa6dabb0 <_ChromeMain+0xa6d5914>
 c7716e0: aa0003f3     	mov	x19, x0
 c7716e4: aa1403e0     	mov	x0, x20
 c7716e8: 9410f6ff     	bl	0xcbaf2e4 <_ChromeMain+0xcbaa048>
 c7716ec: aa0003f4     	mov	x20, x0
 c7716f0: a9017fff     	stp	xzr, xzr, [sp, #0x10]
 c7716f4: f90013ff     	str	xzr, [sp, #0x20]
 c7716f8: 910023e8     	add	x8, sp, #0x8
 c7716fc: 94106f70     	bl	0xcb8d4bc <_ChromeMain+0xcb88220>
 c771700: 910043f6     	add	x22, sp, #0x10
 c771704: 910043e8     	add	x8, sp, #0x10
 c771708: 910023e0     	add	x0, sp, #0x8
 c77170c: 9410f6f9     	bl	0xcbaf2f0 <_ChromeMain+0xcbaa054>
 c771710: f94007f5     	ldr	x21, [sp, #0x8]
 c771714: f90007ff     	str	xzr, [sp, #0x8]
 c771718: b40000d5     	cbz	x21, 0xc771730 <_ChromeMain+0xc76c494>
 c77171c: aa1503e0     	mov	x0, x21
 c771720: 941114b2     	bl	0xcbb69e8 <dyld_stub_binder+0xcbb69e8>
 c771724: aa1503e0     	mov	x0, x21
 c771728: 52800101     	mov	w1, #0x8                ; =8
 c77172c: 94104441     	bl	0xcb82830 <_ChromeMain+0xcb7d594>
 c771730: f9400bf7     	ldr	x23, [sp, #0x10]
 c771734: 910022d6     	add	x22, x22, #0x8
 c771738: eb1602ff     	cmp	x23, x22
 c77173c: 540000a0     	b.eq	0xc771750 <_ChromeMain+0xc76c4b4>
 c771740: d360fe78     	lsr	x24, x19, #32
 c771744: 14000015     	b	0xc771798 <_ChromeMain+0xc76c4fc>
 c771748: 52800033     	mov	w19, #0x1               ; =1
 c77174c: 14000002     	b	0xc771754 <_ChromeMain+0xc76c4b8>
 c771750: 52800013     	mov	w19, #0x0               ; =0
 c771754: f9400fe1     	ldr	x1, [sp, #0x18]
 c771758: 910043e8     	add	x8, sp, #0x10
 c77175c: f90017e8     	str	x8, [sp, #0x28]
 c771760: 9100a3e0     	add	x0, sp, #0x28
 c771764: 94107409     	bl	0xcb8e788 <_ChromeMain+0xcb894ec>
 c771768: aa1303e0     	mov	x0, x19
 c77176c: a9467bfd     	ldp	x29, x30, [sp, #0x60]
 c771770: a9454ff4     	ldp	x20, x19, [sp, #0x50]
 c771774: a94457f6     	ldp	x22, x21, [sp, #0x40]
 c771778: a9435ff8     	ldp	x24, x23, [sp, #0x30]
 c77177c: 9101c3ff     	add	sp, sp, #0x70
 c771780: d65f03c0     	ret
 c771784: aa0803f7     	mov	x23, x8
 c771788: f9400108     	ldr	x8, [x8]
 c77178c: b5ffffc8     	cbnz	x8, 0xc771784 <_ChromeMain+0xc76c4e8>
 c771790: eb1602ff     	cmp	x23, x22
 c771794: 54fffde0     	b.eq	0xc771750 <_ChromeMain+0xc76c4b4>
 c771798: f94012f5     	ldr	x21, [x23, #0x20]
 c77179c: eb1402bf     	cmp	x21, x20
 c7717a0: 540001c0     	b.eq	0xc7717d8 <_ChromeMain+0xc76c53c>
 c7717a4: aa1503e0     	mov	x0, x21
 c7717a8: 9410ed63     	bl	0xcbacd34 <_ChromeMain+0xcba7a98>
 c7717ac: 34000160     	cbz	w0, 0xc7717d8 <_ChromeMain+0xc76c53c>
 c7717b0: aa1503e0     	mov	x0, x21
 c7717b4: 9410eb8c     	bl	0xcbac5e4 <_ChromeMain+0xcba7348>
 c7717b8: 0b000028     	add	w8, w1, w0
 c7717bc: 6b00027f     	cmp	w19, w0
 c7717c0: 7a53a104     	ccmp	w8, w19, #0x4, ge
 c7717c4: d360fc08     	lsr	x8, x0, #32
 c7717c8: 7a48c308     	ccmp	w24, w8, #0x8, gt
 c7717cc: 8b418108     	add	x8, x8, x1, lsr #32
 c7717d0: 7a58a104     	ccmp	w8, w24, #0x4, ge
 c7717d4: 54fffbac     	b.gt	0xc771748 <_ChromeMain+0xc76c4ac>
 c7717d8: f94006e8     	ldr	x8, [x23, #0x8]
 c7717dc: b5fffd48     	cbnz	x8, 0xc771784 <_ChromeMain+0xc76c4e8>
 c7717e0: aa1703e8     	mov	x8, x23
 c7717e4: f9400af7     	ldr	x23, [x23, #0x10]
 c7717e8: f94002e9     	ldr	x9, [x23]
 c7717ec: eb09011f     	cmp	x8, x9
 c7717f0: 54ffff81     	b.ne	0xc7717e0 <_ChromeMain+0xc76c544>
 c7717f4: 17ffffe7     	b	0xc771790 <_ChromeMain+0xc76c4f4>
