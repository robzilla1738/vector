
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 40fd74c: d10103ff     	sub	sp, sp, #0x40
 40fd750: a9024ff4     	stp	x20, x19, [sp, #0x20]
 40fd754: a9037bfd     	stp	x29, x30, [sp, #0x30]
 40fd758: 9100c3fd     	add	x29, sp, #0x30
 40fd75c: 910023e8     	add	x8, sp, #0x8
 40fd760: 97a8fde0     	bl	0x2b3cee0 <_ChromeMain+0x2b37c44>
 40fd764: a940a7e0     	ldp	x0, x9, [sp, #0x8]
 40fd768: d2800013     	mov	x19, #0x0               ; =0
 40fd76c: d37df128     	lsl	x8, x9, #3
 40fd770: b40001a8     	cbz	x8, 0x40fd7a4 <_ChromeMain+0x40f8508>
 40fd774: aa0803ea     	mov	x10, x8
 40fd778: aa0003eb     	mov	x11, x0
 40fd77c: 14000007     	b	0x40fd798 <_ChromeMain+0x40f84fc>
 40fd780: 3941818c     	ldrb	w12, [x12, #0x60]
 40fd784: d240018c     	eor	x12, x12, #0x1
 40fd788: 8b0c0273     	add	x19, x19, x12
 40fd78c: 9100216b     	add	x11, x11, #0x8
 40fd790: f100214a     	subs	x10, x10, #0x8
 40fd794: 54000080     	b.eq	0x40fd7a4 <_ChromeMain+0x40f8508>
 40fd798: f940016c     	ldr	x12, [x11]
 40fd79c: b4ffff8c     	cbz	x12, 0x40fd78c <_ChromeMain+0x40f84f0>
 40fd7a0: 17fffff8     	b	0x40fd780 <_ChromeMain+0x40f84e4>
 40fd7a4: b50000c0     	cbnz	x0, 0x40fd7bc <_ChromeMain+0x40f8520>
 40fd7a8: aa1303e0     	mov	x0, x19
 40fd7ac: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 40fd7b0: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 40fd7b4: 910103ff     	add	sp, sp, #0x40
 40fd7b8: d65f03c0     	ret
 40fd7bc: 9240f129     	and	x9, x9, #0x1fffffffffffffff
 40fd7c0: 5280010a     	mov	w10, #0x8               ; =8
 40fd7c4: cb00014a     	sub	x10, x10, x0
 40fd7c8: cb080148     	sub	x8, x10, x8
 40fd7cc: d343090a     	lsl	x10, x8, #61
 40fd7d0: cb080148     	sub	x8, x10, x8
 40fd7d4: eb480d3f     	cmp	x9, x8, lsr #3
 40fd7d8: 54000049     	b.ls	0x40fd7e0 <_ChromeMain+0x40f8544>
 40fd7dc: d4200020     	brk	#0x1
