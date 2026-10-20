
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4106178: a9bc5ff8     	stp	x24, x23, [sp, #-0x40]!
 410617c: a90157f6     	stp	x22, x21, [sp, #0x10]
 4106180: a9024ff4     	stp	x20, x19, [sp, #0x20]
 4106184: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4106188: 9100c3fd     	add	x29, sp, #0x30
 410618c: aa0403f6     	mov	x22, x4
 4106190: aa0303f4     	mov	x20, x3
 4106194: aa0203f7     	mov	x23, x2
 4106198: aa0103f5     	mov	x21, x1
 410619c: aa0003f3     	mov	x19, x0
 41061a0: 925e7448     	and	x8, x2, #0xfffffffc00000000
 41061a4: 90055578     	adrp	x24, 0xebb2000 <dyld_stub_binder+0xebb2000>
 41061a8: f9404709     	ldr	x9, [x24, #0x88]
 41061ac: eb09011f     	cmp	x8, x9
 41061b0: 54000061     	b.ne	0x41061bc <_ChromeMain+0x4100f20>
 41061b4: aa1703e0     	mov	x0, x23
 41061b8: 96fc3851     	bl	0x142fc <_ChromeMain+0xf060>
 41061bc: f9402260     	ldr	x0, [x19, #0x40]
 41061c0: 925e7408     	and	x8, x0, #0xfffffffc00000000
 41061c4: f9404709     	ldr	x9, [x24, #0x88]
 41061c8: eb09011f     	cmp	x8, x9
 41061cc: 54000041     	b.ne	0x41061d4 <_ChromeMain+0x4100f38>
 41061d0: 96fc721b     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 41061d4: f9002277     	str	x23, [x19, #0x40]
 41061d8: b40000f6     	cbz	x22, 0x41061f4 <_ChromeMain+0x4100f58>
 41061dc: 910022c8     	add	x8, x22, #0x8
 41061e0: 52800029     	mov	w9, #0x1                ; =1
 41061e4: b8290108     	ldadd	w9, w8, [x8]
 41061e8: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 41061ec: 6b09011f     	cmp	w8, w9
 41061f0: 54001420     	b.eq	0x4106474 <_ChromeMain+0x41011d8>
 41061f4: f9403e60     	ldr	x0, [x19, #0x78]
 41061f8: f9003e76     	str	x22, [x19, #0x78]
 41061fc: b40000e0     	cbz	x0, 0x4106218 <_ChromeMain+0x4100f7c>
 4106200: 91002008     	add	x8, x0, #0x8
 4106204: 12800009     	mov	w9, #-0x1               ; =-1
 4106208: b8e90108     	ldaddal	w9, w8, [x8]
 410620c: 7100051f     	cmp	w8, #0x1
 4106210: 54000041     	b.ne	0x4106218 <_ChromeMain+0x4100f7c>
 4106214: 94dc7460     	bl	0x7823394 <_ChromeMain+0x781e0f8>
 4106218: 91022268     	add	x8, x19, #0x88
 410621c: eb15011f     	cmp	x8, x21
 4106220: 54000120     	b.eq	0x4106244 <_ChromeMain+0x4100fa8>
 4106224: 39c27e6a     	ldrsb	w10, [x19, #0x9f]
 4106228: 39405ea9     	ldrb	w9, [x21, #0x17]
 410622c: 37f80d4a     	tbnz	w10, #0x1f, 0x41063d4 <_ChromeMain+0x4101138>
 4106230: 37380ac9     	tbnz	w9, #0x7, 0x4106388 <_ChromeMain+0x41010ec>
 4106234: 3dc002a0     	ldr	q0, [x21]
 4106238: f9400aa9     	ldr	x9, [x21, #0x10]
 410623c: f9000909     	str	x9, [x8, #0x10]
 4106240: 3d800100     	str	q0, [x8]
 4106244: b9401aa8     	ldr	w8, [x21, #0x18]
 4106248: b900a268     	str	w8, [x19, #0xa0]
 410624c: 9102a269     	add	x9, x19, #0xa8
 4106250: 910082a8     	add	x8, x21, #0x20
 4106254: eb08013f     	cmp	x9, x8
 4106258: 54000120     	b.eq	0x410627c <_ChromeMain+0x4100fe0>
 410625c: 39c2fe6b     	ldrsb	w11, [x19, #0xbf]
 4106260: 3940deaa     	ldrb	w10, [x21, #0x37]
 4106264: 37f80d8b     	tbnz	w11, #0x1f, 0x4106414 <_ChromeMain+0x4101178>
 4106268: 3738088a     	tbnz	w10, #0x7, 0x4106378 <_ChromeMain+0x41010dc>
 410626c: 3dc00100     	ldr	q0, [x8]
 4106270: f9400908     	ldr	x8, [x8, #0x10]
 4106274: f9000928     	str	x8, [x9, #0x10]
 4106278: 3d800120     	str	q0, [x9]
 410627c: 91030269     	add	x9, x19, #0xc0
 4106280: 9100e2a8     	add	x8, x21, #0x38
 4106284: eb08013f     	cmp	x9, x8
 4106288: 54000120     	b.eq	0x41062ac <_ChromeMain+0x4101010>
 410628c: 39c35e6b     	ldrsb	w11, [x19, #0xd7]
 4106290: 39413eaa     	ldrb	w10, [x21, #0x4f]
 4106294: 37f80d0b     	tbnz	w11, #0x1f, 0x4106434 <_ChromeMain+0x4101198>
 4106298: 3738060a     	tbnz	w10, #0x7, 0x4106358 <_ChromeMain+0x41010bc>
 410629c: 3dc00100     	ldr	q0, [x8]
 41062a0: f9400908     	ldr	x8, [x8, #0x10]
 41062a4: f9000928     	str	x8, [x9, #0x10]
 41062a8: 3d800120     	str	q0, [x9]
 41062ac: 7940a2a8     	ldrh	w8, [x21, #0x50]
 41062b0: 7901b268     	strh	w8, [x19, #0xd8]
 41062b4: 91038269     	add	x9, x19, #0xe0
 41062b8: 910162a8     	add	x8, x21, #0x58
 41062bc: eb08013f     	cmp	x9, x8
 41062c0: 54000120     	b.eq	0x41062e4 <_ChromeMain+0x4101048>
 41062c4: 39c3de6b     	ldrsb	w11, [x19, #0xf7]
 41062c8: 3941beaa     	ldrb	w10, [x21, #0x6f]
 41062cc: 37f80c4b     	tbnz	w11, #0x1f, 0x4106454 <_ChromeMain+0x41011b8>
 41062d0: 373804ca     	tbnz	w10, #0x7, 0x4106368 <_ChromeMain+0x41010cc>
 41062d4: 3dc00100     	ldr	q0, [x8]
 41062d8: f9400908     	ldr	x8, [x8, #0x10]
 41062dc: f9000928     	str	x8, [x9, #0x10]
 41062e0: 3d800120     	str	q0, [x9]
 41062e4: 9103e269     	add	x9, x19, #0xf8
 41062e8: 9101c2a8     	add	x8, x21, #0x70
 41062ec: eb08013f     	cmp	x9, x8
 41062f0: 54000120     	b.eq	0x4106314 <_ChromeMain+0x4101078>
 41062f4: 39c43e6b     	ldrsb	w11, [x19, #0x10f]
 41062f8: 39421eaa     	ldrb	w10, [x21, #0x87]
 41062fc: 37f807cb     	tbnz	w11, #0x1f, 0x41063f4 <_ChromeMain+0x4101158>
 4106300: 373804ca     	tbnz	w10, #0x7, 0x4106398 <_ChromeMain+0x41010fc>
 4106304: 3dc00100     	ldr	q0, [x8]
 4106308: f9400908     	ldr	x8, [x8, #0x10]
 410630c: f9000928     	str	x8, [x9, #0x10]
 4106310: 3d800120     	str	q0, [x9]
 4106314: 79022274     	strh	w20, [x19, #0x110]
 4106318: 39447268     	ldrb	w8, [x19, #0x11c]
 410631c: 34000048     	cbz	w8, 0x4106324 <_ChromeMain+0x4101088>
 4106320: 3904727f     	strb	wzr, [x19, #0x11c]
 4106324: aa1303e0     	mov	x0, x19
 4106328: aa1503e1     	mov	x1, x21
 410632c: 94dc68ca     	bl	0x7820654 <_ChromeMain+0x781b3b8>
 4106330: 360003c0     	tbz	w0, #0x0, 0x41063a8 <_ChromeMain+0x410110c>
 4106334: aa1303e0     	mov	x0, x19
 4106338: aa1403e1     	mov	x1, x20
 410633c: 94dc68e8     	bl	0x78206dc <_ChromeMain+0x781b440>
 4106340: aa1303e0     	mov	x0, x19
 4106344: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4106348: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 410634c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4106350: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 4106354: 1400004b     	b	0x4106480 <_ChromeMain+0x41011e4>
 4106358: a9438aa1     	ldp	x1, x2, [x21, #0x38]
 410635c: 91030260     	add	x0, x19, #0xc0
 4106360: 970e89d5     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4106364: 17ffffd2     	b	0x41062ac <_ChromeMain+0x4101010>
 4106368: a9458aa1     	ldp	x1, x2, [x21, #0x58]
 410636c: 91038260     	add	x0, x19, #0xe0
 4106370: 970e89d1     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4106374: 17ffffdc     	b	0x41062e4 <_ChromeMain+0x4101048>
 4106378: a9420aa1     	ldp	x1, x2, [x21, #0x20]
 410637c: 9102a260     	add	x0, x19, #0xa8
 4106380: 970e89cd     	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4106384: 17ffffbe     	b	0x410627c <_ChromeMain+0x4100fe0>
 4106388: a9400aa1     	ldp	x1, x2, [x21]
 410638c: 91022260     	add	x0, x19, #0x88
 4106390: 971f20d7     	bl	0x8ce6ec <_ChromeMain+0x8c9450>
 4106394: 17ffffac     	b	0x4106244 <_ChromeMain+0x4100fa8>
 4106398: a9470aa1     	ldp	x1, x2, [x21, #0x70]
 410639c: 9103e260     	add	x0, x19, #0xf8
 41063a0: 971f20d3     	bl	0x8ce6ec <_ChromeMain+0x8c9450>
 41063a4: 17ffffdc     	b	0x4106314 <_ChromeMain+0x4101078>
 41063a8: 52800028     	mov	w8, #0x1                ; =1
 41063ac: 39044a68     	strb	w8, [x19, #0x112]
 41063b0: f9404260     	ldr	x0, [x19, #0x80]
 41063b4: b4000040     	cbz	x0, 0x41063bc <_ChromeMain+0x4101120>
 41063b8: 94dc5e2a     	bl	0x781dc60 <_ChromeMain+0x78189c4>
 41063bc: aa1303e0     	mov	x0, x19
 41063c0: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 41063c4: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 41063c8: a94157f6     	ldp	x22, x21, [sp, #0x10]
 41063cc: a8c45ff8     	ldp	x24, x23, [sp], #0x40
 41063d0: 14dc6888     	b	0x78205f0 <_ChromeMain+0x781b354>
 41063d4: 13001d28     	sxtb	w8, w9
 41063d8: 7100011f     	cmp	w8, #0x0
 41063dc: a9402aa8     	ldp	x8, x10, [x21]
 41063e0: 9a954101     	csel	x1, x8, x21, mi
 41063e4: 9a894142     	csel	x2, x10, x9, mi
 41063e8: 91022260     	add	x0, x19, #0x88
 41063ec: 971f2112     	bl	0x8ce834 <_ChromeMain+0x8c9598>
 41063f0: 17ffff95     	b	0x4106244 <_ChromeMain+0x4100fa8>
 41063f4: 13001d49     	sxtb	w9, w10
 41063f8: 7100013f     	cmp	w9, #0x0
 41063fc: a9472ea9     	ldp	x9, x11, [x21, #0x70]
 4106400: 9a884121     	csel	x1, x9, x8, mi
 4106404: 9a8a4162     	csel	x2, x11, x10, mi
 4106408: 9103e260     	add	x0, x19, #0xf8
 410640c: 971f210a     	bl	0x8ce834 <_ChromeMain+0x8c9598>
 4106410: 17ffffc1     	b	0x4106314 <_ChromeMain+0x4101078>
 4106414: 13001d49     	sxtb	w9, w10
 4106418: 7100013f     	cmp	w9, #0x0
 410641c: a9422ea9     	ldp	x9, x11, [x21, #0x20]
 4106420: 9a884121     	csel	x1, x9, x8, mi
 4106424: 9a8a4162     	csel	x2, x11, x10, mi
 4106428: 9102a260     	add	x0, x19, #0xa8
 410642c: 970e89f5     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 4106430: 17ffff93     	b	0x410627c <_ChromeMain+0x4100fe0>
 4106434: 13001d49     	sxtb	w9, w10
 4106438: 7100013f     	cmp	w9, #0x0
 410643c: a943aea9     	ldp	x9, x11, [x21, #0x38]
 4106440: 9a884121     	csel	x1, x9, x8, mi
 4106444: 9a8a4162     	csel	x2, x11, x10, mi
 4106448: 91030260     	add	x0, x19, #0xc0
 410644c: 970e89ed     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 4106450: 17ffff97     	b	0x41062ac <_ChromeMain+0x4101010>
 4106454: 13001d49     	sxtb	w9, w10
 4106458: 7100013f     	cmp	w9, #0x0
 410645c: a945aea9     	ldp	x9, x11, [x21, #0x58]
 4106460: 9a884121     	csel	x1, x9, x8, mi
 4106464: 9a8a4162     	csel	x2, x11, x10, mi
 4106468: 91038260     	add	x0, x19, #0xe0
 410646c: 970e89e5     	bl	0x4a8c00 <_ChromeMain+0x4a3964>
 4106470: 17ffff9d     	b	0x41062e4 <_ChromeMain+0x4101048>
 4106474: d4200000     	brk	#0
