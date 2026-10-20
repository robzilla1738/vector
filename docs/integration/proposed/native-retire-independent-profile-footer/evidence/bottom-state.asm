
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 424544c: d100c3ff     	sub	sp, sp, #0x30
 4245450: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4245454: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4245458: 910083fd     	add	x29, sp, #0x20
 424545c: 394fe008     	ldrb	w8, [x0, #0x3f8]
 4245460: 6b01011f     	cmp	w8, w1
 4245464: 540000a1     	b.ne	0x4245478 <_ChromeMain+0x42401dc>
 4245468: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 424546c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4245470: 9100c3ff     	add	sp, sp, #0x30
 4245474: d65f03c0     	ret
 4245478: aa0003f3     	mov	x19, x0
 424547c: 390fe001     	strb	w1, [x0, #0x3f8]
 4245480: 97fffe2e     	bl	0x4244d38 <_ChromeMain+0x423fa9c>
 4245484: f941c660     	ldr	x0, [x19, #0x388]
 4245488: f9400008     	ldr	x8, [x0]
 424548c: f9405108     	ldr	x8, [x8, #0xa0]
 4245490: 52800001     	mov	w1, #0x0                ; =0
 4245494: d63f0100     	blr	x8
 4245498: 394fe261     	ldrb	w1, [x19, #0x3f8]
 424549c: f9400268     	ldr	x8, [x19]
 42454a0: f9405108     	ldr	x8, [x8, #0xa0]
 42454a4: aa1303e0     	mov	x0, x19
 42454a8: d63f0100     	blr	x8
 42454ac: 394fe274     	ldrb	w20, [x19, #0x3f8]
 42454b0: b9431a68     	ldr	w8, [x19, #0x318]
 42454b4: 6b14011f     	cmp	w8, w20
 42454b8: 54000301     	b.ne	0x4245518 <_ChromeMain+0x424027c>
 42454bc: 7200029f     	tst	w20, #0x1
 42454c0: 52800068     	mov	w8, #0x3                ; =3
 42454c4: 1a9f1114     	csel	w20, w8, wzr, ne
 42454c8: b9432268     	ldr	w8, [x19, #0x320]
 42454cc: 6b14011f     	cmp	w8, w20
 42454d0: 54fffcc0     	b.eq	0x4245468 <_ChromeMain+0x42401cc>
 42454d4: f9418a68     	ldr	x8, [x19, #0x310]
 42454d8: b9000ff4     	str	w20, [sp, #0xc]
 42454dc: 90053e01     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 42454e0: 9115a021     	add	x1, x1, #0x568
 42454e4: 91046100     	add	x0, x8, #0x118
 42454e8: 910033e2     	add	x2, sp, #0xc
 42454ec: 97607f2e     	bl	0x1a651a4 <_ChromeMain+0x1a5ff08>
 42454f0: b9032274     	str	w20, [x19, #0x320]
 42454f4: aa1303e0     	mov	x0, x19
 42454f8: 52800021     	mov	w1, #0x1                ; =1
 42454fc: 9716711a     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 4245500: 9103e260     	add	x0, x19, #0xf8
 4245504: 910c8261     	add	x1, x19, #0x320
 4245508: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 424550c: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4245510: 9100c3ff     	add	sp, sp, #0x30
 4245514: 17338aaf     	b	0xf27fd0 <_ChromeMain+0xf22d34>
 4245518: f9418a60     	ldr	x0, [x19, #0x310]
 424551c: aa1403e1     	mov	x1, x20
 4245520: 97e384f8     	bl	0x3b26900 <_ChromeMain+0x3b21664>
 4245524: b9031a74     	str	w20, [x19, #0x318]
 4245528: aa1303e0     	mov	x0, x19
 424552c: 52800021     	mov	w1, #0x1                ; =1
 4245530: 9716710d     	bl	0x7e1964 <_ChromeMain+0x7dc6c8>
 4245534: 9103e260     	add	x0, x19, #0xf8
 4245538: 910c6261     	add	x1, x19, #0x318
 424553c: 97338aa5     	bl	0xf27fd0 <_ChromeMain+0xf22d34>
 4245540: 394fe274     	ldrb	w20, [x19, #0x3f8]
 4245544: 17ffffde     	b	0x42454bc <_ChromeMain+0x4240220>
