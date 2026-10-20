
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4561570: a9bc6ffc     	stp	x28, x27, [sp, #-0x40]!
 4561574: a90157f6     	stp	x22, x21, [sp, #0x10]
 4561578: a9024ff4     	stp	x20, x19, [sp, #0x20]
 456157c: a9037bfd     	stp	x29, x30, [sp, #0x30]
 4561580: 9100c3fd     	add	x29, sp, #0x30
 4561584: d11703ff     	sub	sp, sp, #0x5c0
 4561588: aa0103f4     	mov	x20, x1
 456158c: aa0003f3     	mov	x19, x0
 4561590: 529116e8     	mov	w8, #0x88b7             ; =34999
 4561594: 6b08003f     	cmp	w1, w8
 4561598: 5400040d     	b.le	0x4561618 <_ChromeMain+0x455c37c>
 456159c: 5293a568     	mov	w8, #0x9d2b             ; =40235
 45615a0: 6b08029f     	cmp	w20, w8
 45615a4: 5400080c     	b.gt	0x45616a4 <_ChromeMain+0x455c408>
 45615a8: 529142c8     	mov	w8, #0x8a16             ; =35350
 45615ac: 6b08029f     	cmp	w20, w8
 45615b0: 54000cad     	b.le	0x4561744 <_ChromeMain+0x455c4a8>
 45615b4: 52928e48     	mov	w8, #0x9472             ; =38002
 45615b8: 6b08029f     	cmp	w20, w8
 45615bc: 5400158c     	b.gt	0x456186c <_ChromeMain+0x455c5d0>
 45615c0: 52919448     	mov	w8, #0x8ca2             ; =36002
 45615c4: 6b08029f     	cmp	w20, w8
 45615c8: 5400c42d     	b.le	0x4562e4c <_ChromeMain+0x455dbb0>
 45615cc: 52923ca8     	mov	w8, #0x91e5             ; =37349
 45615d0: 6b08029f     	cmp	w20, w8
 45615d4: 5400562d     	b.le	0x4562098 <_ChromeMain+0x455cdfc>
 45615d8: 52928e28     	mov	w8, #0x9471             ; =38001
 45615dc: 6b08029f     	cmp	w20, w8
 45615e0: 540021e0     	b.eq	0x4561a1c <_ChromeMain+0x455c780>
 45615e4: 52928e48     	mov	w8, #0x9472             ; =38002
 45615e8: 6b08029f     	cmp	w20, w8
 45615ec: 5400d4e1     	b.ne	0x4563088 <_ChromeMain+0x455ddec>
 45615f0: f9401e68     	ldr	x8, [x19, #0x38]
 45615f4: 9100a109     	add	x9, x8, #0x28
 45615f8: f100011f     	cmp	x8, #0x0
 45615fc: 9a8903e8     	csel	x8, xzr, x9, eq
 4561600: f9403108     	ldr	x8, [x8, #0x60]
 4561604: f9404908     	ldr	x8, [x8, #0x90]
 4561608: b4017948     	cbz	x8, 0x4564530 <_ChromeMain+0x455f294>
 456160c: f9402100     	ldr	x0, [x8, #0x40]
 4561610: 52800001     	mov	w1, #0x0                ; =0
 4561614: 14000118     	b	0x4561a74 <_ChromeMain+0x455c7d8>
 4561618: aa0203f6     	mov	x22, x2
 456161c: 52901dc8     	mov	w8, #0x80ee             ; =33006
 4561620: 6b08029f     	cmp	w20, w8
 4561624: 54000fcd     	b.le	0x456181c <_ChromeMain+0x455c580>
 4561628: 129099e8     	mov	w8, #-0x84d0            ; =-34000
 456162c: 0b080288     	add	w8, w20, w8
 4561630: 7101b11f     	cmp	w8, #0x6c
 4561634: 540040c8     	b.hi	0x4561e4c <_ChromeMain+0x455cbb0>
 4561638: aa0303f5     	mov	x21, x3
 456163c: 90048c09     	adrp	x9, 0xd6e1000 <dyld_stub_binder+0xd6e1000>
 4561640: 91211129     	add	x9, x9, #0x844
 4561644: 1000000a     	adr	x10, 0x4561644 <_ChromeMain+0x455c3a8>
 4561648: b8a8792b     	ldrsw	x11, [x9, x8, lsl #2]
 456164c: 8b0b014a     	add	x10, x10, x11
 4561650: d61f0140     	br	x10
 4561654: 9004ae08     	adrp	x8, 0xdb21000 <dyld_stub_binder+0xdb21000>
 4561658: 912cf508     	add	x8, x8, #0xb3d
 456165c: f90023e8     	str	x8, [sp, #0x40]
 4561660: 910103e0     	add	x0, sp, #0x40
 4561664: 97563442     	bl	0x1aee76c <_ChromeMain+0x1ae94d0>
 4561668: f9401e68     	ldr	x8, [x19, #0x38]
 456166c: 9100a109     	add	x9, x8, #0x28
 4561670: f100011f     	cmp	x8, #0x0
 4561674: 9a8903e0     	csel	x0, xzr, x9, eq
 4561678: 12909c28     	mov	w8, #-0x84e2            ; =-34018
 456167c: 0b080281     	add	w1, w20, w8
 4561680: 52800062     	mov	w2, #0x3                ; =3
 4561684: aa1503e3     	mov	x3, x21
 4561688: 940012bb     	bl	0x4566174 <_ChromeMain+0x4560ed8>
 456168c: 911703ff     	add	sp, sp, #0x5c0
 4561690: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4561694: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4561698: a94157f6     	ldp	x22, x21, [sp, #0x10]
 456169c: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 45616a0: d65f03c0     	ret
 45616a4: 5298ea08     	mov	w8, #0xc750             ; =51024
 45616a8: 6b08029f     	cmp	w20, w8
 45616ac: 540002cd     	b.le	0x4561704 <_ChromeMain+0x455c468>
 45616b0: 5299a3a8     	mov	w8, #0xcd1d             ; =52509
 45616b4: 6b08029f     	cmp	w20, w8
 45616b8: 540016ad     	b.le	0x456198c <_ChromeMain+0x455c6f0>
 45616bc: 529a0668     	mov	w8, #0xd033             ; =53299
 45616c0: 6b08029f     	cmp	w20, w8
 45616c4: 5400420c     	b.gt	0x4561f04 <_ChromeMain+0x455cc68>
 45616c8: 1299a3a8     	mov	w8, #-0xcd1e            ; =-52510
 45616cc: 0b080288     	add	w8, w20, w8
 45616d0: 7100151f     	cmp	w8, #0x5
 45616d4: 54003c82     	b.hs	0x4561e64 <_ChromeMain+0x455cbc8>
 45616d8: f9401e68     	ldr	x8, [x19, #0x38]
 45616dc: 9100a109     	add	x9, x8, #0x28
 45616e0: f100011f     	cmp	x8, #0x0
 45616e4: 9a8903e1     	csel	x1, xzr, x9, eq
 45616e8: aa1403e0     	mov	x0, x20
 45616ec: 911703ff     	add	sp, sp, #0x5c0
 45616f0: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 45616f4: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 45616f8: a94157f6     	ldp	x22, x21, [sp, #0x10]
 45616fc: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4561700: 15fffcda     	b	0xc560a68 <_ChromeMain+0xc55b7cc>
 4561704: 1293a568     	mov	w8, #-0x9d2c            ; =-40236
 4561708: 0b080288     	add	w8, w20, w8
 456170c: 7101191f     	cmp	w8, #0x46
 4561710: 54003e08     	b.hi	0x4561ed0 <_ChromeMain+0x455cc34>
 4561714: 90048c09     	adrp	x9, 0xd6e1000 <dyld_stub_binder+0xd6e1000>
 4561718: 912db129     	add	x9, x9, #0xb6c
 456171c: 1000000a     	adr	x10, 0x456171c <_ChromeMain+0x455c480>
 4561720: b8a8792b     	ldrsw	x11, [x9, x8, lsl #2]
 4561724: 8b0b014a     	add	x10, x10, x11
 4561728: d61f0140     	br	x10
 456172c: f9401e68     	ldr	x8, [x19, #0x38]
 4561730: f9403500     	ldr	x0, [x8, #0x68]
 4561734: 52800001     	mov	w1, #0x0                ; =0
 4561738: 975ded5f     	bl	0x1cdccb4 <_ChromeMain+0x1cd7a18>
 456173c: b4fffa80     	cbz	x0, 0x456168c <_ChromeMain+0x455c3f0>
 4561740: 14000b85     	b	0x4564554 <_ChromeMain+0x455f2b8>
 4561744: 129116e8     	mov	w8, #-0x88b8            ; =-35000
 4561748: 0b080288     	add	w8, w20, w8
 456174c: 7100d51f     	cmp	w8, #0x35
 4561750: 540038a8     	b.hi	0x4561e64 <_ChromeMain+0x455cbc8>
 4561754: 90048c09     	adrp	x9, 0xd6e1000 <dyld_stub_binder+0xd6e1000>
 4561758: 9127e129     	add	x9, x9, #0x9f8
 456175c: 1000000a     	adr	x10, 0x456175c <_ChromeMain+0x455c4c0>
 4561760: b8a8792b     	ldrsw	x11, [x9, x8, lsl #2]
 4561764: 8b0b014a     	add	x10, x10, x11
 4561768: d61f0140     	br	x10
 456176c: f9401e68     	ldr	x8, [x19, #0x38]
 4561770: 9100a109     	add	x9, x8, #0x28
 4561774: f100011f     	cmp	x8, #0x0
 4561778: 9a8903e0     	csel	x0, xzr, x9, eq
 456177c: 911703ff     	add	sp, sp, #0x5c0
 4561780: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4561784: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4561788: a94157f6     	ldp	x22, x21, [sp, #0x10]
 456178c: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4561790: 15f20805     	b	0xc1e37a4 <_ChromeMain+0xc1de508>
 4561794: f9401e68     	ldr	x8, [x19, #0x38]
 4561798: 9100a109     	add	x9, x8, #0x28
 456179c: f100011f     	cmp	x8, #0x0
 45617a0: 9a8903e0     	csel	x0, xzr, x9, eq
 45617a4: 95fffcb4     	bl	0xc560a74 <_ChromeMain+0xc55b7d8>
 45617a8: 9004ae08     	adrp	x8, 0xdb21000 <dyld_stub_binder+0xdb21000>
 45617ac: 912da508     	add	x8, x8, #0xb69
 45617b0: f90023e8     	str	x8, [sp, #0x40]
 45617b4: 910103e0     	add	x0, sp, #0x40
 45617b8: 975633ed     	bl	0x1aee76c <_ChromeMain+0x1ae94d0>
 45617bc: 17ffffb4     	b	0x456168c <_ChromeMain+0x455c3f0>
 45617c0: 9004ae08     	adrp	x8, 0xdb21000 <dyld_stub_binder+0xdb21000>
 45617c4: 912b6508     	add	x8, x8, #0xad9
 45617c8: f90023e8     	str	x8, [sp, #0x40]
 45617cc: 910103e0     	add	x0, sp, #0x40
 45617d0: 975633e7     	bl	0x1aee76c <_ChromeMain+0x1ae94d0>
 45617d4: f9401e68     	ldr	x8, [x19, #0x38]
 45617d8: 9100a109     	add	x9, x8, #0x28
 45617dc: f100011f     	cmp	x8, #0x0
 45617e0: 9a8903e0     	csel	x0, xzr, x9, eq
 45617e4: 9400116b     	bl	0x4565d90 <_ChromeMain+0x4560af4>
 45617e8: 17ffffa9     	b	0x456168c <_ChromeMain+0x455c3f0>
 45617ec: 9004ae08     	adrp	x8, 0xdb21000 <dyld_stub_binder+0xdb21000>
 45617f0: 91290d08     	add	x8, x8, #0xa43
 45617f4: f90023e8     	str	x8, [sp, #0x40]
 45617f8: 910103e0     	add	x0, sp, #0x40
 45617fc: 975633dc     	bl	0x1aee76c <_ChromeMain+0x1ae94d0>
 4561800: f9401e68     	ldr	x8, [x19, #0x38]
 4561804: 9100a109     	add	x9, x8, #0x28
 4561808: f100011f     	cmp	x8, #0x0
 456180c: 9a8903e0     	csel	x0, xzr, x9, eq
 4561810: 52800021     	mov	w1, #0x1                ; =1
 4561814: 94dc4c63     	bl	0x7c749a0 <_ChromeMain+0x7c6f704>
 4561818: 17ffff9d     	b	0x456168c <_ChromeMain+0x455c3f0>
 456181c: 52901d48     	mov	w8, #0x80ea             ; =33002
 4561820: 6b08029f     	cmp	w20, w8
 4561824: 540014ad     	b.le	0x4561ab8 <_ChromeMain+0x455c81c>
 4561828: 52901d68     	mov	w8, #0x80eb             ; =33003
 456182c: 6b08029f     	cmp	w20, w8
 4561830: 540012e0     	b.eq	0x4561a8c <_ChromeMain+0x455c7f0>
 4561834: 52901d88     	mov	w8, #0x80ec             ; =33004
 4561838: 6b08029f     	cmp	w20, w8
 456183c: 54002ee1     	b.ne	0x4561e18 <_ChromeMain+0x455cb7c>
 4561840: f9401e68     	ldr	x8, [x19, #0x38]
 4561844: 9100a109     	add	x9, x8, #0x28
 4561848: f100011f     	cmp	x8, #0x0
 456184c: 9a8903e0     	csel	x0, xzr, x9, eq
 4561850: 95fffcf6     	bl	0xc560c28 <_ChromeMain+0xc55b98c>
 4561854: b4fff1c0     	cbz	x0, 0x456168c <_ChromeMain+0x455c3f0>
 4561858: 12800008     	mov	w8, #-0x1               ; =-1
 456185c: b8e80008     	ldaddal	w8, w8, [x0]
 4561860: 7100051f     	cmp	w8, #0x1
 4561864: 54fff141     	b.ne	0x456168c <_ChromeMain+0x455c3f0>
 4561868: 14000af6     	b	0x4564440 <_ChromeMain+0x455f1a4>
 456186c: 52930c08     	mov	w8, #0x9860             ; =39008
 4561870: 6b08029f     	cmp	w20, w8
 4561874: 54000b4d     	b.le	0x45619dc <_ChromeMain+0x455c740>
 4561878: 129387e8     	mov	w8, #-0x9c40            ; =-40000
 456187c: 0b080288     	add	w8, w20, w8
 4561880: 7100711f     	cmp	w8, #0x1c
 4561884: 54007148     	b.hi	0x45626ac <_ChromeMain+0x455d410>
 4561888: 90048c09     	adrp	x9, 0xd6e1000 <dyld_stub_binder+0xd6e1000>
 456188c: 912be129     	add	x9, x9, #0xaf8
 4561890: 1000000a     	adr	x10, 0x4561890 <_ChromeMain+0x455c5f4>
 4561894: b8a8792b     	ldrsw	x11, [x9, x8, lsl #2]
 4561898: 8b0b014a     	add	x10, x10, x11
 456189c: d61f0140     	br	x10
 45618a0: f9401e68     	ldr	x8, [x19, #0x38]
 45618a4: f940d108     	ldr	x8, [x8, #0x1a0]
 45618a8: f9403d00     	ldr	x0, [x8, #0x78]
 45618ac: 911703ff     	add	sp, sp, #0x5c0
 45618b0: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 45618b4: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 45618b8: a94157f6     	ldp	x22, x21, [sp, #0x10]
 45618bc: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 45618c0: 14d93e72     	b	0x7bb1288 <_ChromeMain+0x7babfec>
 45618c4: f9401e68     	ldr	x8, [x19, #0x38]
 45618c8: 9100a109     	add	x9, x8, #0x28
 45618cc: f100011f     	cmp	x8, #0x0
 45618d0: 9a8903e0     	csel	x0, xzr, x9, eq
 45618d4: 911703ff     	add	sp, sp, #0x5c0
 45618d8: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 45618dc: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 45618e0: a94157f6     	ldp	x22, x21, [sp, #0x10]
 45618e4: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 45618e8: 15f434df     	b	0xc26ec64 <_ChromeMain+0xc2699c8>
 45618ec: f9401e68     	ldr	x8, [x19, #0x38]
 45618f0: 9100a109     	add	x9, x8, #0x28
 45618f4: f100011f     	cmp	x8, #0x0
 45618f8: 9a8903e0     	csel	x0, xzr, x9, eq
 45618fc: 911703ff     	add	sp, sp, #0x5c0
 4561900: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4561904: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4561908: a94157f6     	ldp	x22, x21, [sp, #0x10]
 456190c: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4561910: 15fffcf6     	b	0xc560ce8 <_ChromeMain+0xc55ba4c>
 4561914: f9401e68     	ldr	x8, [x19, #0x38]
 4561918: 9100a109     	add	x9, x8, #0x28
 456191c: f100011f     	cmp	x8, #0x0
 4561920: 9a8903e0     	csel	x0, xzr, x9, eq
 4561924: 911703ff     	add	sp, sp, #0x5c0
 4561928: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 456192c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4561930: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4561934: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4561938: 15f4359f     	b	0xc26efb4 <_ChromeMain+0xc269d18>
 456193c: f9401e68     	ldr	x8, [x19, #0x38]
 4561940: 9100a109     	add	x9, x8, #0x28
 4561944: f100011f     	cmp	x8, #0x0
 4561948: 9a8903e0     	csel	x0, xzr, x9, eq
 456194c: 911703ff     	add	sp, sp, #0x5c0
 4561950: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4561954: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4561958: a94157f6     	ldp	x22, x21, [sp, #0x10]
 456195c: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4561960: 15fffce5     	b	0xc560cf4 <_ChromeMain+0xc55ba58>
 4561964: f9401e68     	ldr	x8, [x19, #0x38]
 4561968: 9100a109     	add	x9, x8, #0x28
 456196c: f100011f     	cmp	x8, #0x0
 4561970: 9a8903e0     	csel	x0, xzr, x9, eq
 4561974: 911703ff     	add	sp, sp, #0x5c0
 4561978: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 456197c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4561980: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4561984: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4561988: 15fffcde     	b	0xc560d00 <_ChromeMain+0xc55ba64>
 456198c: 5298ea48     	mov	w8, #0xc752             ; =51026
 4561990: 6b08029f     	cmp	w20, w8
 4561994: 54000d4d     	b.le	0x4561b3c <_ChromeMain+0x455c8a0>
 4561998: 5298ea68     	mov	w8, #0xc753             ; =51027
 456199c: 6b08029f     	cmp	w20, w8
 45619a0: 54000fe0     	b.eq	0x4561b9c <_ChromeMain+0x455c900>
 45619a4: 5299a288     	mov	w8, #0xcd14             ; =52500
 45619a8: 6b08029f     	cmp	w20, w8
 45619ac: 540012c0     	b.eq	0x4561c04 <_ChromeMain+0x455c968>
 45619b0: 5299a2a8     	mov	w8, #0xcd15             ; =52501
 45619b4: 6b08029f     	cmp	w20, w8
 45619b8: 54002561     	b.ne	0x4561e64 <_ChromeMain+0x455cbc8>
 45619bc: f9401e73     	ldr	x19, [x19, #0x38]
 45619c0: b40166d3     	cbz	x19, 0x4564698 <_ChromeMain+0x455f3fc>
 45619c4: 9100a260     	add	x0, x19, #0x28
 45619c8: 970893a4     	bl	0x786858 <_ChromeMain+0x7815bc>
 45619cc: b4015a80     	cbz	x0, 0x456451c <_ChromeMain+0x455f280>
 45619d0: f9400008     	ldr	x8, [x0]
 45619d4: f9416901     	ldr	x1, [x8, #0x2d0]
 45619d8: 14000092     	b	0x4561c20 <_ChromeMain+0x455c984>
 45619dc: 52930b08     	mov	w8, #0x9858             ; =39000
 45619e0: 6b08029f     	cmp	w20, w8
 45619e4: 5400030d     	b.le	0x4561a44 <_ChromeMain+0x455c7a8>
 45619e8: 52930b48     	mov	w8, #0x985a             ; =39002
 45619ec: 6b08029f     	cmp	w20, w8
 45619f0: 5400170a     	b.ge	0x4561cd0 <_ChromeMain+0x455ca34>
 45619f4: f9401e74     	ldr	x20, [x19, #0x38]
 45619f8: b4016594     	cbz	x20, 0x45646a8 <_ChromeMain+0x455f40c>
 45619fc: 9100a280     	add	x0, x20, #0x28
 4561a00: 97089396     	bl	0x786858 <_ChromeMain+0x7815bc>
 4561a04: b40159e0     	cbz	x0, 0x4564540 <_ChromeMain+0x455f2a4>
 4561a08: f9400008     	ldr	x8, [x0]
 4561a0c: f940e508     	ldr	x8, [x8, #0x1c8]
 4561a10: d63f0100     	blr	x8
 4561a14: 34ffe3c0     	cbz	w0, 0x456168c <_ChromeMain+0x455c3f0>
 4561a18: 14000a7f     	b	0x4564414 <_ChromeMain+0x455f178>
 4561a1c: f9401e68     	ldr	x8, [x19, #0x38]
 4561a20: 9100a109     	add	x9, x8, #0x28
 4561a24: f100011f     	cmp	x8, #0x0
 4561a28: 9a8903e8     	csel	x8, xzr, x9, eq
 4561a2c: f9403108     	ldr	x8, [x8, #0x60]
 4561a30: f9404908     	ldr	x8, [x8, #0x90]
 4561a34: b4015828     	cbz	x8, 0x4564538 <_ChromeMain+0x455f29c>
 4561a38: f9402100     	ldr	x0, [x8, #0x40]
 4561a3c: 52800021     	mov	w1, #0x1                ; =1
 4561a40: 1400000d     	b	0x4561a74 <_ChromeMain+0x455c7d8>
 4561a44: 52928e68     	mov	w8, #0x9473             ; =38003
 4561a48: 6b08029f     	cmp	w20, w8
 4561a4c: 54001ca1     	b.ne	0x4561de0 <_ChromeMain+0x455cb44>
 4561a50: f9401e68     	ldr	x8, [x19, #0x38]
 4561a54: 9100a109     	add	x9, x8, #0x28
 4561a58: f100011f     	cmp	x8, #0x0
 4561a5c: 9a8903e8     	csel	x8, xzr, x9, eq
 4561a60: f9403108     	ldr	x8, [x8, #0x60]
 4561a64: f9404908     	ldr	x8, [x8, #0x90]
 4561a68: b40154c8     	cbz	x8, 0x4564500 <_ChromeMain+0x455f264>
 4561a6c: f9402100     	ldr	x0, [x8, #0x40]
 4561a70: 12800001     	mov	w1, #-0x1               ; =-1
 4561a74: 911703ff     	add	sp, sp, #0x5c0
 4561a78: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4561a7c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4561a80: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4561a84: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4561a88: 15819016     	b	0xa5c5ae0 <_ChromeMain+0xa5c0844>
 4561a8c: f9401e68     	ldr	x8, [x19, #0x38]
 4561a90: 9100a109     	add	x9, x8, #0x28
 4561a94: f100011f     	cmp	x8, #0x0
 4561a98: 9a8903e0     	csel	x0, xzr, x9, eq
 4561a9c: aa1603e1     	mov	x1, x22
 4561aa0: 911703ff     	add	sp, sp, #0x5c0
 4561aa4: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4561aa8: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4561aac: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4561ab0: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4561ab4: 14000eb4     	b	0x4565584 <_ChromeMain+0x45602e8>
 4561ab8: 52901d28     	mov	w8, #0x80e9             ; =33001
 4561abc: 6b08029f     	cmp	w20, w8
 4561ac0: 540016e1     	b.ne	0x4561d9c <_ChromeMain+0x455cb00>
 4561ac4: f9401e68     	ldr	x8, [x19, #0x38]
 4561ac8: 9100a109     	add	x9, x8, #0x28
 4561acc: f100011f     	cmp	x8, #0x0
 4561ad0: 9a8903e0     	csel	x0, xzr, x9, eq
 4561ad4: aa1603e1     	mov	x1, x22
 4561ad8: 911703ff     	add	sp, sp, #0x5c0
 4561adc: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4561ae0: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4561ae4: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4561ae8: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4561aec: 15fffc88     	b	0xc560d0c <_ChromeMain+0xc55ba70>
 4561af0: 9004cb28     	adrp	x8, 0xdec5000 <dyld_stub_binder+0xdec5000>
 4561af4: 9111e908     	add	x8, x8, #0x47a
 4561af8: f90023e8     	str	x8, [sp, #0x40]
 4561afc: 910103e0     	add	x0, sp, #0x40
 4561b00: 9756331b     	bl	0x1aee76c <_ChromeMain+0x1ae94d0>
 4561b04: f9401e68     	ldr	x8, [x19, #0x38]
 4561b08: 9100a109     	add	x9, x8, #0x28
 4561b0c: f100011f     	cmp	x8, #0x0
 4561b10: 9a8903e8     	csel	x8, xzr, x9, eq
 4561b14: f9402100     	ldr	x0, [x8, #0x40]
 4561b18: f9400008     	ldr	x8, [x0]
 4561b1c: f940b508     	ldr	x8, [x8, #0x168]
 4561b20: d63f0100     	blr	x8
 4561b24: 90044be1     	adrp	x1, 0xcedd000 <dyld_stub_binder+0xcedd000>
 4561b28: 911eb821     	add	x1, x1, #0x7ae
 4561b2c: 528003a2     	mov	w2, #0x1d               ; =29
 4561b30: 52800043     	mov	w3, #0x2                ; =2
 4561b34: 97a47dc0     	bl	0x2e81234 <_ChromeMain+0x2e7bf98>
 4561b38: 17fffed5     	b	0x456168c <_ChromeMain+0x455c3f0>
 4561b3c: 5298ea28     	mov	w8, #0xc751             ; =51025
 4561b40: 6b08029f     	cmp	w20, w8
 4561b44: 54fffd60     	b.eq	0x4561af0 <_ChromeMain+0x455c854>
 4561b48: 5298ea48     	mov	w8, #0xc752             ; =51026
 4561b4c: 6b08029f     	cmp	w20, w8
 4561b50: 540018a1     	b.ne	0x4561e64 <_ChromeMain+0x455cbc8>
 4561b54: 9004cb28     	adrp	x8, 0xdec5000 <dyld_stub_binder+0xdec5000>
 4561b58: 91113d08     	add	x8, x8, #0x44f
 4561b5c: f90023e8     	str	x8, [sp, #0x40]
 4561b60: 910103e0     	add	x0, sp, #0x40
 4561b64: 97563302     	bl	0x1aee76c <_ChromeMain+0x1ae94d0>
 4561b68: f9401e68     	ldr	x8, [x19, #0x38]
 4561b6c: 9100a109     	add	x9, x8, #0x28
 4561b70: f100011f     	cmp	x8, #0x0
 4561b74: 9a8903e8     	csel	x8, xzr, x9, eq
 4561b78: f9402100     	ldr	x0, [x8, #0x40]
 4561b7c: f9400008     	ldr	x8, [x0]
 4561b80: f940b508     	ldr	x8, [x8, #0x168]
 4561b84: d63f0100     	blr	x8
 4561b88: 90044be1     	adrp	x1, 0xcedd000 <dyld_stub_binder+0xcedd000>
 4561b8c: 911eb821     	add	x1, x1, #0x7ae
 4561b90: 528003a2     	mov	w2, #0x1d               ; =29
 4561b94: 52800003     	mov	w3, #0x0                ; =0
 4561b98: 17ffffe7     	b	0x4561b34 <_ChromeMain+0x455c898>
 4561b9c: 9004cb28     	adrp	x8, 0xdec5000 <dyld_stub_binder+0xdec5000>
 4561ba0: 91129508     	add	x8, x8, #0x4a5
 4561ba4: f90023e8     	str	x8, [sp, #0x40]
 4561ba8: 910103e0     	add	x0, sp, #0x40
 4561bac: 975632f0     	bl	0x1aee76c <_ChromeMain+0x1ae94d0>
 4561bb0: f9401e68     	ldr	x8, [x19, #0x38]
 4561bb4: 9100a109     	add	x9, x8, #0x28
 4561bb8: f100011f     	cmp	x8, #0x0
 4561bbc: 9a8903e8     	csel	x8, xzr, x9, eq
 4561bc0: f9402100     	ldr	x0, [x8, #0x40]
 4561bc4: f9400008     	ldr	x8, [x0]
 4561bc8: f940b508     	ldr	x8, [x8, #0x168]
 4561bcc: d63f0100     	blr	x8
 4561bd0: 90044be1     	adrp	x1, 0xcedd000 <dyld_stub_binder+0xcedd000>
 4561bd4: 911eb821     	add	x1, x1, #0x7ae
 4561bd8: 528003a2     	mov	w2, #0x1d               ; =29
 4561bdc: 52800023     	mov	w3, #0x1                ; =1
 4561be0: 17ffffd5     	b	0x4561b34 <_ChromeMain+0x455c898>
 4561be4: f9401e73     	ldr	x19, [x19, #0x38]
 4561be8: b40156d3     	cbz	x19, 0x45646c0 <_ChromeMain+0x455f424>
 4561bec: 9100a260     	add	x0, x19, #0x28
 4561bf0: 9708931a     	bl	0x786858 <_ChromeMain+0x7815bc>
 4561bf4: b4014d00     	cbz	x0, 0x4564594 <_ChromeMain+0x455f2f8>
 4561bf8: f9400008     	ldr	x8, [x0]
 4561bfc: f9418101     	ldr	x1, [x8, #0x300]
 4561c00: 14000008     	b	0x4561c20 <_ChromeMain+0x455c984>
 4561c04: f9401e73     	ldr	x19, [x19, #0x38]
 4561c08: b40154d3     	cbz	x19, 0x45646a0 <_ChromeMain+0x455f404>
 4561c0c: 9100a260     	add	x0, x19, #0x28
 4561c10: 97089312     	bl	0x786858 <_ChromeMain+0x7815bc>
 4561c14: b40147a0     	cbz	x0, 0x4564508 <_ChromeMain+0x455f26c>
 4561c18: f9400008     	ldr	x8, [x0]
 4561c1c: f9416501     	ldr	x1, [x8, #0x2c8]
 4561c20: 911703ff     	add	sp, sp, #0x5c0
 4561c24: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4561c28: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4561c2c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4561c30: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4561c34: d61f0020     	br	x1
 4561c38: f9401e69     	ldr	x9, [x19, #0x38]
 4561c3c: f940c528     	ldr	x8, [x9, #0x188]
 4561c40: b0053294     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4561c44: b40001a8     	cbz	x8, 0x4561c78 <_ChromeMain+0x455c9dc>
 4561c48: 91062129     	add	x9, x9, #0x188
 4561c4c: 900519aa     	adrp	x10, 0xe895000 <dyld_stub_binder+0xe895000>
 4561c50: 9101814a     	add	x10, x10, #0x60
 4561c54: 14000003     	b	0x4561c60 <_ChromeMain+0x455c9c4>
 4561c58: f9400108     	ldr	x8, [x8]
 4561c5c: b40000e8     	cbz	x8, 0x4561c78 <_ChromeMain+0x455c9dc>
 4561c60: f940110b     	ldr	x11, [x8, #0x20]
 4561c64: eb0a017f     	cmp	x11, x10
 4561c68: 54ffff88     	b.hi	0x4561c58 <_ChromeMain+0x455c9bc>
 4561c6c: 540001e0     	b.eq	0x4561ca8 <_ChromeMain+0x455ca0c>
 4561c70: f9400508     	ldr	x8, [x8, #0x8]
 4561c74: b5ffff68     	cbnz	x8, 0x4561c60 <_ChromeMain+0x455c9c4>
 4561c78: d2800013     	mov	x19, #0x0               ; =0
 4561c7c: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4561c80: f9404689     	ldr	x9, [x20, #0x88]
 4561c84: eb09011f     	cmp	x8, x9
 4561c88: 54000061     	b.ne	0x4561c94 <_ChromeMain+0x455c9f8>
 4561c8c: aa1303e0     	mov	x0, x19
 4561c90: 96eb036b     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4561c94: b4ffcfd3     	cbz	x19, 0x456168c <_ChromeMain+0x455c3f0>
 4561c98: f9400268     	ldr	x8, [x19]
 4561c9c: f9401101     	ldr	x1, [x8, #0x20]
 4561ca0: aa1303e0     	mov	x0, x19
 4561ca4: 17ffffdf     	b	0x4561c20 <_ChromeMain+0x455c984>
 4561ca8: eb09011f     	cmp	x8, x9
 4561cac: 54fffe60     	b.eq	0x4561c78 <_ChromeMain+0x455c9dc>
 4561cb0: f9401513     	ldr	x19, [x8, #0x28]
 4561cb4: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4561cb8: f9404689     	ldr	x9, [x20, #0x88]
 4561cbc: eb09011f     	cmp	x8, x9
 4561cc0: 54fffde1     	b.ne	0x4561c7c <_ChromeMain+0x455c9e0>
 4561cc4: aa1303e0     	mov	x0, x19
 4561cc8: 96eac98d     	bl	0x142fc <_ChromeMain+0xf060>
 4561ccc: 17ffffec     	b	0x4561c7c <_ChromeMain+0x455c9e0>
 4561cd0: 52930b88     	mov	w8, #0x985c             ; =39004
 4561cd4: 6b08029f     	cmp	w20, w8
 4561cd8: 540003cc     	b.gt	0x4561d50 <_ChromeMain+0x455cab4>
 4561cdc: 52930b48     	mov	w8, #0x985a             ; =39002
 4561ce0: 6b08029f     	cmp	w20, w8
 4561ce4: 54012720     	b.eq	0x45641c8 <_ChromeMain+0x455ef2c>
 4561ce8: 52930b68     	mov	w8, #0x985b             ; =39003
 4561cec: 6b08029f     	cmp	w20, w8
 4561cf0: 54000161     	b.ne	0x4561d1c <_ChromeMain+0x455ca80>
 4561cf4: f9401e68     	ldr	x8, [x19, #0x38]
 4561cf8: 9100a109     	add	x9, x8, #0x28
 4561cfc: f100011f     	cmp	x8, #0x0
 4561d00: 9a8903e0     	csel	x0, xzr, x9, eq
 4561d04: 911703ff     	add	sp, sp, #0x5c0
 4561d08: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4561d0c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4561d10: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4561d14: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4561d18: 15fffcb9     	b	0xc560ffc <_ChromeMain+0xc55bd60>
 4561d1c: 52930b88     	mov	w8, #0x985c             ; =39004
 4561d20: 6b08029f     	cmp	w20, w8
 4561d24: 54000a01     	b.ne	0x4561e64 <_ChromeMain+0x455cbc8>
 4561d28: f9401e68     	ldr	x8, [x19, #0x38]
 4561d2c: 9100a109     	add	x9, x8, #0x28
 4561d30: f100011f     	cmp	x8, #0x0
 4561d34: 9a8903e0     	csel	x0, xzr, x9, eq
 4561d38: 911703ff     	add	sp, sp, #0x5c0
 4561d3c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4561d40: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4561d44: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4561d48: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4561d4c: 15fffcfb     	b	0xc561138 <_ChromeMain+0xc55be9c>
 4561d50: 52930ba8     	mov	w8, #0x985d             ; =39005
 4561d54: 6b08029f     	cmp	w20, w8
 4561d58: 5400f140     	b.eq	0x4563b80 <_ChromeMain+0x455e8e4>
 4561d5c: 52930bc8     	mov	w8, #0x985e             ; =39006
 4561d60: 6b08029f     	cmp	w20, w8
 4561d64: 540121c0     	b.eq	0x456419c <_ChromeMain+0x455ef00>
 4561d68: 52930be8     	mov	w8, #0x985f             ; =39007
 4561d6c: 6b08029f     	cmp	w20, w8
 4561d70: 540007a1     	b.ne	0x4561e64 <_ChromeMain+0x455cbc8>
 4561d74: f9401e68     	ldr	x8, [x19, #0x38]
 4561d78: 9100a109     	add	x9, x8, #0x28
 4561d7c: f100011f     	cmp	x8, #0x0
 4561d80: 9a8903e0     	csel	x0, xzr, x9, eq
 4561d84: 911703ff     	add	sp, sp, #0x5c0
 4561d88: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4561d8c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4561d90: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4561d94: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4561d98: 15fffceb     	b	0xc561144 <_ChromeMain+0xc55bea8>
 4561d9c: 52901d08     	mov	w8, #0x80e8             ; =33000
 4561da0: 6b08029f     	cmp	w20, w8
 4561da4: 54011e60     	b.eq	0x4564170 <_ChromeMain+0x455eed4>
 4561da8: 52901d48     	mov	w8, #0x80ea             ; =33002
 4561dac: 6b08029f     	cmp	w20, w8
 4561db0: 540005a1     	b.ne	0x4561e64 <_ChromeMain+0x455cbc8>
 4561db4: f9401e68     	ldr	x8, [x19, #0x38]
 4561db8: 9100a109     	add	x9, x8, #0x28
 4561dbc: f100011f     	cmp	x8, #0x0
 4561dc0: 9a8903e0     	csel	x0, xzr, x9, eq
 4561dc4: aa1603e1     	mov	x1, x22
 4561dc8: 911703ff     	add	sp, sp, #0x5c0
 4561dcc: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4561dd0: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4561dd4: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4561dd8: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4561ddc: 15f54fd8     	b	0xc2b5d3c <_ChromeMain+0xc2b0aa0>
 4561de0: 52930b08     	mov	w8, #0x9858             ; =39000
 4561de4: 6b08029f     	cmp	w20, w8
 4561de8: 540003e1     	b.ne	0x4561e64 <_ChromeMain+0x455cbc8>
 4561dec: 9004ae08     	adrp	x8, 0xdb21000 <dyld_stub_binder+0xdb21000>
 4561df0: 912e2508     	add	x8, x8, #0xb89
 4561df4: f90023e8     	str	x8, [sp, #0x40]
 4561df8: 910103e0     	add	x0, sp, #0x40
 4561dfc: 9756325c     	bl	0x1aee76c <_ChromeMain+0x1ae94d0>
 4561e00: f9401e68     	ldr	x8, [x19, #0x38]
 4561e04: 9100a109     	add	x9, x8, #0x28
 4561e08: f100011f     	cmp	x8, #0x0
 4561e0c: 9a8903e0     	csel	x0, xzr, x9, eq
 4561e10: 95fffcd0     	bl	0xc561150 <_ChromeMain+0xc55beb4>
 4561e14: 17fffe1e     	b	0x456168c <_ChromeMain+0x455c3f0>
 4561e18: 52901dc8     	mov	w8, #0x80ee             ; =33006
 4561e1c: 6b08029f     	cmp	w20, w8
 4561e20: 54000221     	b.ne	0x4561e64 <_ChromeMain+0x455cbc8>
 4561e24: f9401e68     	ldr	x8, [x19, #0x38]
 4561e28: 9100a109     	add	x9, x8, #0x28
 4561e2c: f100011f     	cmp	x8, #0x0
 4561e30: 9a8903e0     	csel	x0, xzr, x9, eq
 4561e34: 911703ff     	add	sp, sp, #0x5c0
 4561e38: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4561e3c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4561e40: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4561e44: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4561e48: 15f434b2     	b	0xc26f110 <_ChromeMain+0xc269e74>
 4561e4c: 52901de8     	mov	w8, #0x80ef             ; =33007
 4561e50: 6b08029f     	cmp	w20, w8
 4561e54: 5400e700     	b.eq	0x4563b34 <_ChromeMain+0x455e898>
 4561e58: 52901e28     	mov	w8, #0x80f1             ; =33009
 4561e5c: 6b08029f     	cmp	w20, w8
 4561e60: 5400e600     	b.eq	0x4563b20 <_ChromeMain+0x455e884>
 4561e64: f0054d28     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 4561e68: b940b108     	ldr	w8, [x8, #0xb0]
 4561e6c: 7100051f     	cmp	w8, #0x1
 4561e70: 54ffc0ec     	b.gt	0x456168c <_ChromeMain+0x455c3f0>
 4561e74: 90053288     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 4561e78: b94b8908     	ldr	w8, [x8, #0xb88]
 4561e7c: 35000088     	cbnz	w8, 0x4561e8c <_ChromeMain+0x455cbf0>
 4561e80: f0054d28     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 4561e84: f9405d08     	ldr	x8, [x8, #0xb8]
 4561e88: b4ffc028     	cbz	x8, 0x456168c <_ChromeMain+0x455c3f0>
 4561e8c: 9004cb21     	adrp	x1, 0xdec5000 <dyld_stub_binder+0xdec5000>
 4561e90: 91134c21     	add	x1, x1, #0x4d3
 4561e94: 910103f3     	add	x19, sp, #0x40
 4561e98: 910103e0     	add	x0, sp, #0x40
 4561e9c: 5280ca42     	mov	w2, #0x652              ; =1618
 4561ea0: 52800023     	mov	w3, #0x1                ; =1
 4561ea4: 97029caa     	bl	0x60914c <_ChromeMain+0x603eb0>
 4561ea8: 9004cb21     	adrp	x1, 0xdec5000 <dyld_stub_binder+0xdec5000>
 4561eac: 91142421     	add	x1, x1, #0x509
 4561eb0: 91004260     	add	x0, x19, #0x10
 4561eb4: 52800402     	mov	w2, #0x20               ; =32
 4561eb8: 96eb0d81     	bl	0x254bc <_ChromeMain+0x20220>
 4561ebc: aa1403e1     	mov	x1, x20
 4561ec0: 96ef5238     	bl	0x1367a0 <_ChromeMain+0x131504>
 4561ec4: 910103e0     	add	x0, sp, #0x40
 4561ec8: 97029c6e     	bl	0x609080 <_ChromeMain+0x603de4>
 4561ecc: 17fffdf0     	b	0x456168c <_ChromeMain+0x455c3f0>
 4561ed0: 52988228     	mov	w8, #0xc411             ; =50193
 4561ed4: 6b08029f     	cmp	w20, w8
 4561ed8: 54fffc61     	b.ne	0x4561e64 <_ChromeMain+0x455cbc8>
 4561edc: f9401e68     	ldr	x8, [x19, #0x38]
 4561ee0: 9100a109     	add	x9, x8, #0x28
 4561ee4: f100011f     	cmp	x8, #0x0
 4561ee8: 9a8903e0     	csel	x0, xzr, x9, eq
 4561eec: 911703ff     	add	sp, sp, #0x5c0
 4561ef0: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4561ef4: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4561ef8: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4561efc: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4561f00: 15f43616     	b	0xc26f758 <_ChromeMain+0xc26a4bc>
 4561f04: 529a0908     	mov	w8, #0xd048             ; =53320
 4561f08: 6b08029f     	cmp	w20, w8
 4561f0c: 54000301     	b.ne	0x4561f6c <_ChromeMain+0x455ccd0>
 4561f10: f9401e68     	ldr	x8, [x19, #0x38]
 4561f14: f9403500     	ldr	x0, [x8, #0x68]
 4561f18: f9400008     	ldr	x8, [x0]
 4561f1c: f940b508     	ldr	x8, [x8, #0x168]
 4561f20: d63f0100     	blr	x8
 4561f24: aa0003f3     	mov	x19, x0
 4561f28: b0044c34     	adrp	x20, 0xcee6000 <dyld_stub_binder+0xcee6000>
 4561f2c: 91087a94     	add	x20, x20, #0x21e
 4561f30: aa1403e1     	mov	x1, x20
 4561f34: 528002e2     	mov	w2, #0x17               ; =23
 4561f38: 96f69172     	bl	0x306500 <_ChromeMain+0x301264>
 4561f3c: 52000008     	eor	w8, w0, #0x1
 4561f40: 390103e8     	strb	w8, [sp, #0x40]
 4561f44: 52800028     	mov	w8, #0x1                ; =1
 4561f48: 390163e8     	strb	w8, [sp, #0x58]
 4561f4c: 910103e3     	add	x3, sp, #0x40
 4561f50: aa1303e0     	mov	x0, x19
 4561f54: aa1403e1     	mov	x1, x20
 4561f58: 528002e2     	mov	w2, #0x17               ; =23
 4561f5c: 973e9e53     	bl	0x15098a8 <_ChromeMain+0x150460c>
 4561f60: 910103e0     	add	x0, sp, #0x40
 4561f64: 9742f21c     	bl	0x161e7d4 <_ChromeMain+0x1619538>
 4561f68: 17fffdc9     	b	0x456168c <_ChromeMain+0x455c3f0>
 4561f6c: 529a0688     	mov	w8, #0xd034             ; =53300
 4561f70: 6b08029f     	cmp	w20, w8
 4561f74: 540001c0     	b.eq	0x4561fac <_ChromeMain+0x455cd10>
 4561f78: 529a0928     	mov	w8, #0xd049             ; =53321
 4561f7c: 6b08029f     	cmp	w20, w8
 4561f80: 54fff721     	b.ne	0x4561e64 <_ChromeMain+0x455cbc8>
 4561f84: f9401e68     	ldr	x8, [x19, #0x38]
 4561f88: 9100a109     	add	x9, x8, #0x28
 4561f8c: f100011f     	cmp	x8, #0x0
 4561f90: 9a8903e0     	csel	x0, xzr, x9, eq
 4561f94: 911703ff     	add	sp, sp, #0x5c0
 4561f98: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4561f9c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4561fa0: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4561fa4: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4561fa8: 15fffc6d     	b	0xc56115c <_ChromeMain+0xc55bec0>
 4561fac: 94b3c357     	bl	0x7252d08 <_ChromeMain+0x724da6c>
 4561fb0: aa0003f4     	mov	x20, x0
 4561fb4: 52800500     	mov	w0, #0x28               ; =40
 4561fb8: 96eab4ec     	bl	0xf368 <_ChromeMain+0xa0cc>
 4561fbc: aa0003e1     	mov	x1, x0
 4561fc0: 52800028     	mov	w8, #0x1                ; =1
 4561fc4: d0fdd5c9     	adrp	x9, 0x1b000 <_ChromeMain+0x15d64>
 4561fc8: 912c0129     	add	x9, x9, #0xb00
 4561fcc: d0ff81ea     	adrp	x10, 0x359f000 <_ChromeMain+0x3599d64>
 4561fd0: 911a014a     	add	x10, x10, #0x680
 4561fd4: b9000008     	str	w8, [x0]
 4561fd8: a900a809     	stp	x9, x10, [x0, #0x8]
 4561fdc: 90feffe8     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4561fe0: 912c0108     	add	x8, x8, #0xb00
 4561fe4: f9000c08     	str	x8, [x0, #0x18]
 4561fe8: aa1403e0     	mov	x0, x20
 4561fec: 94b4334e     	bl	0x726ed24 <_ChromeMain+0x7269a88>
 4561ff0: b4000154     	cbz	x20, 0x4562018 <_ChromeMain+0x455cd7c>
 4561ff4: 91002288     	add	x8, x20, #0x8
 4561ff8: 12800009     	mov	w9, #-0x1               ; =-1
 4561ffc: b8e90108     	ldaddal	w9, w8, [x8]
 4562000: 7100051f     	cmp	w8, #0x1
 4562004: 540000a1     	b.ne	0x4562018 <_ChromeMain+0x455cd7c>
 4562008: f9400288     	ldr	x8, [x20]
 456200c: f9400508     	ldr	x8, [x8, #0x8]
 4562010: aa1403e0     	mov	x0, x20
 4562014: d63f0100     	blr	x8
 4562018: f9401e68     	ldr	x8, [x19, #0x38]
 456201c: f9403500     	ldr	x0, [x8, #0x68]
 4562020: 94e46c0b     	bl	0x7e7d04c <_ChromeMain+0x7e77db0>
 4562024: 979a58d3     	bl	0x2bf8370 <_ChromeMain+0x2bf30d4>
 4562028: aa0003f3     	mov	x19, x0
 456202c: f9400400     	ldr	x0, [x0, #0x8]
 4562030: b5013860     	cbnz	x0, 0x456473c <_ChromeMain+0x455f4a0>
 4562034: 3900027f     	strb	wzr, [x19]
 4562038: 17fffd95     	b	0x456168c <_ChromeMain+0x455c3f0>
 456203c: 52921148     	mov	w8, #0x908a             ; =37002
 4562040: 6b08029f     	cmp	w20, w8
 4562044: 54fff101     	b.ne	0x4561e64 <_ChromeMain+0x455cbc8>
 4562048: f9401e68     	ldr	x8, [x19, #0x38]
 456204c: 9100a109     	add	x9, x8, #0x28
 4562050: f100011f     	cmp	x8, #0x0
 4562054: 9a8903e0     	csel	x0, xzr, x9, eq
 4562058: 911703ff     	add	sp, sp, #0x5c0
 456205c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4562060: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4562064: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4562068: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 456206c: 15fffc3f     	b	0xc561168 <_ChromeMain+0xc55becc>
 4562070: f9401e68     	ldr	x8, [x19, #0x38]
 4562074: 9100a109     	add	x9, x8, #0x28
 4562078: f100011f     	cmp	x8, #0x0
 456207c: 9a8903e0     	csel	x0, xzr, x9, eq
 4562080: 911703ff     	add	sp, sp, #0x5c0
 4562084: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4562088: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 456208c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4562090: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4562094: 15415461     	b	0x95b7218 <_ChromeMain+0x95b1f7c>
 4562098: 52921128     	mov	w8, #0x9089             ; =37001
 456209c: 6b08029f     	cmp	w20, w8
 45620a0: 5400044d     	b.le	0x4562128 <_ChromeMain+0x455ce8c>
 45620a4: 52921168     	mov	w8, #0x908b             ; =37003
 45620a8: 6b08029f     	cmp	w20, w8
 45620ac: 54fffc81     	b.ne	0x456203c <_ChromeMain+0x455cda0>
 45620b0: f9401e68     	ldr	x8, [x19, #0x38]
 45620b4: 9100a109     	add	x9, x8, #0x28
 45620b8: f100011f     	cmp	x8, #0x0
 45620bc: 9a8903e0     	csel	x0, xzr, x9, eq
 45620c0: 97dd0040     	bl	0x3ca21c0 <_ChromeMain+0x3c9cf24>
 45620c4: 35fffd60     	cbnz	w0, 0x4562070 <_ChromeMain+0x455cdd4>
 45620c8: f9402660     	ldr	x0, [x19, #0x48]
 45620cc: f9400008     	ldr	x8, [x0]
 45620d0: f9400d08     	ldr	x8, [x8, #0x18]
 45620d4: 52901dc1     	mov	w1, #0x80ee             ; =33006
 45620d8: d63f0100     	blr	x8
 45620dc: 34ffad80     	cbz	w0, 0x456168c <_ChromeMain+0x455c3f0>
 45620e0: f0053268     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 45620e4: f9468d08     	ldr	x8, [x8, #0xd18]
 45620e8: d63f0100     	blr	x8
 45620ec: aa0003e4     	mov	x4, x0
 45620f0: 390103ff     	strb	wzr, [sp, #0x40]
 45620f4: 390183ff     	strb	wzr, [sp, #0x60]
 45620f8: f9400268     	ldr	x8, [x19]
 45620fc: f9402908     	ldr	x8, [x8, #0x50]
 4562100: 910103e3     	add	x3, sp, #0x40
 4562104: aa1303e0     	mov	x0, x19
 4562108: 52901dc1     	mov	w1, #0x80ee             ; =33006
 456210c: 52800022     	mov	w2, #0x1                ; =1
 4562110: d63f0100     	blr	x8
 4562114: 394183e8     	ldrb	w8, [sp, #0x60]
 4562118: 34ffaba8     	cbz	w8, 0x456168c <_ChromeMain+0x455c3f0>
 456211c: 910103e0     	add	x0, sp, #0x40
 4562120: 97d45617     	bl	0x3a7797c <_ChromeMain+0x3a726e0>
 4562124: 17fffd5a     	b	0x456168c <_ChromeMain+0x455c3f0>
 4562128: 52919468     	mov	w8, #0x8ca3             ; =36003
 456212c: 6b08029f     	cmp	w20, w8
 4562130: 54000360     	b.eq	0x456219c <_ChromeMain+0x455cf00>
 4562134: 52921108     	mov	w8, #0x9088             ; =37000
 4562138: 6b08029f     	cmp	w20, w8
 456213c: 540001c0     	b.eq	0x4562174 <_ChromeMain+0x455ced8>
 4562140: 52921128     	mov	w8, #0x9089             ; =37001
 4562144: 6b08029f     	cmp	w20, w8
 4562148: 54ffe8e1     	b.ne	0x4561e64 <_ChromeMain+0x455cbc8>
 456214c: f9401e68     	ldr	x8, [x19, #0x38]
 4562150: 9100a109     	add	x9, x8, #0x28
 4562154: f100011f     	cmp	x8, #0x0
 4562158: 9a8903e0     	csel	x0, xzr, x9, eq
 456215c: 911703ff     	add	sp, sp, #0x5c0
 4562160: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4562164: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4562168: a94157f6     	ldp	x22, x21, [sp, #0x10]
 456216c: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4562170: 15fffcd9     	b	0xc5614d4 <_ChromeMain+0xc55c238>
 4562174: f9401e68     	ldr	x8, [x19, #0x38]
 4562178: 9100a109     	add	x9, x8, #0x28
 456217c: f100011f     	cmp	x8, #0x0
 4562180: 9a8903e0     	csel	x0, xzr, x9, eq
 4562184: 911703ff     	add	sp, sp, #0x5c0
 4562188: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 456218c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4562190: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4562194: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4562198: 15fffcd2     	b	0xc5614e0 <_ChromeMain+0xc55c244>
 456219c: f9401e68     	ldr	x8, [x19, #0x38]
 45621a0: 9100a109     	add	x9, x8, #0x28
 45621a4: f100011f     	cmp	x8, #0x0
 45621a8: 9a8903e9     	csel	x9, xzr, x9, eq
 45621ac: f940b128     	ldr	x8, [x9, #0x160]
 45621b0: b4000568     	cbz	x8, 0x456225c <_ChromeMain+0x455cfc0>
 45621b4: 91058129     	add	x9, x9, #0x160
 45621b8: b0051a2a     	adrp	x10, 0xe8a7000 <dyld_stub_binder+0xe8a7000>
 45621bc: 9125c14a     	add	x10, x10, #0x970
 45621c0: 14000021     	b	0x4562244 <_ChromeMain+0x455cfa8>
 45621c4: eb09011f     	cmp	x8, x9
 45621c8: 54000240     	b.eq	0x4562210 <_ChromeMain+0x455cf74>
 45621cc: f9401513     	ldr	x19, [x8, #0x28]
 45621d0: 925e7668     	and	x8, x19, #0xfffffffc00000000
 45621d4: 90053289     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45621d8: f9404529     	ldr	x9, [x9, #0x88]
 45621dc: eb09011f     	cmp	x8, x9
 45621e0: 540001a1     	b.ne	0x4562214 <_ChromeMain+0x455cf78>
 45621e4: aa1303e0     	mov	x0, x19
 45621e8: 96eac845     	bl	0x142fc <_ChromeMain+0xf060>
 45621ec: 1400000a     	b	0x4562214 <_ChromeMain+0x455cf78>
 45621f0: f9400108     	ldr	x8, [x8]
 45621f4: b40000e8     	cbz	x8, 0x4562210 <_ChromeMain+0x455cf74>
 45621f8: f940110b     	ldr	x11, [x8, #0x20]
 45621fc: eb0a017f     	cmp	x11, x10
 4562200: 54ffff88     	b.hi	0x45621f0 <_ChromeMain+0x455cf54>
 4562204: 54fffe00     	b.eq	0x45621c4 <_ChromeMain+0x455cf28>
 4562208: f9400508     	ldr	x8, [x8, #0x8]
 456220c: b5ffff68     	cbnz	x8, 0x45621f8 <_ChromeMain+0x455cf5c>
 4562210: d2800013     	mov	x19, #0x0               ; =0
 4562214: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4562218: 90053289     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 456221c: f9404529     	ldr	x9, [x9, #0x88]
 4562220: eb09011f     	cmp	x8, x9
 4562224: 54000061     	b.ne	0x4562230 <_ChromeMain+0x455cf94>
 4562228: aa1303e0     	mov	x0, x19
 456222c: 96eb0204     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4562230: f9400261     	ldr	x1, [x19]
 4562234: 52800020     	mov	w0, #0x1                ; =1
 4562238: 14000013     	b	0x4562284 <_ChromeMain+0x455cfe8>
 456223c: f9400108     	ldr	x8, [x8]
 4562240: b40000e8     	cbz	x8, 0x456225c <_ChromeMain+0x455cfc0>
 4562244: f940110b     	ldr	x11, [x8, #0x20]
 4562248: eb0a017f     	cmp	x11, x10
 456224c: 54ffff88     	b.hi	0x456223c <_ChromeMain+0x455cfa0>
 4562250: 54000260     	b.eq	0x456229c <_ChromeMain+0x455d000>
 4562254: f9400508     	ldr	x8, [x8, #0x8]
 4562258: b5ffff68     	cbnz	x8, 0x4562244 <_ChromeMain+0x455cfa8>
 456225c: d2800013     	mov	x19, #0x0               ; =0
 4562260: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4562264: 90053289     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4562268: f9404529     	ldr	x9, [x9, #0x88]
 456226c: eb09011f     	cmp	x8, x9
 4562270: 54000061     	b.ne	0x456227c <_ChromeMain+0x455cfe0>
 4562274: aa1303e0     	mov	x0, x19
 4562278: 96eb01f1     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 456227c: f9400261     	ldr	x1, [x19]
 4562280: 52800040     	mov	w0, #0x2                ; =2
 4562284: 911703ff     	add	sp, sp, #0x5c0
 4562288: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 456228c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4562290: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4562294: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4562298: 15fffc95     	b	0xc5614ec <_ChromeMain+0xc55c250>
 456229c: eb09011f     	cmp	x8, x9
 45622a0: 54fffde0     	b.eq	0x456225c <_ChromeMain+0x455cfc0>
 45622a4: f9401513     	ldr	x19, [x8, #0x28]
 45622a8: 925e7668     	and	x8, x19, #0xfffffffc00000000
 45622ac: 90053289     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45622b0: f9404529     	ldr	x9, [x9, #0x88]
 45622b4: eb09011f     	cmp	x8, x9
 45622b8: 54fffd41     	b.ne	0x4562260 <_ChromeMain+0x455cfc4>
 45622bc: aa1303e0     	mov	x0, x19
 45622c0: 96eac80f     	bl	0x142fc <_ChromeMain+0xf060>
 45622c4: 17ffffe7     	b	0x4562260 <_ChromeMain+0x455cfc4>
 45622c8: f9401e68     	ldr	x8, [x19, #0x38]
 45622cc: 9100a109     	add	x9, x8, #0x28
 45622d0: f100011f     	cmp	x8, #0x0
 45622d4: 9a8903e9     	csel	x9, xzr, x9, eq
 45622d8: f940b128     	ldr	x8, [x9, #0x160]
 45622dc: b40001a8     	cbz	x8, 0x4562310 <_ChromeMain+0x455d074>
 45622e0: 91058129     	add	x9, x9, #0x160
 45622e4: b0051a2a     	adrp	x10, 0xe8a7000 <dyld_stub_binder+0xe8a7000>
 45622e8: 9125c14a     	add	x10, x10, #0x970
 45622ec: 14000003     	b	0x45622f8 <_ChromeMain+0x455d05c>
 45622f0: f9400108     	ldr	x8, [x8]
 45622f4: b40000e8     	cbz	x8, 0x4562310 <_ChromeMain+0x455d074>
 45622f8: f940110b     	ldr	x11, [x8, #0x20]
 45622fc: eb0a017f     	cmp	x11, x10
 4562300: 54ffff88     	b.hi	0x45622f0 <_ChromeMain+0x455d054>
 4562304: 540001c0     	b.eq	0x456233c <_ChromeMain+0x455d0a0>
 4562308: f9400508     	ldr	x8, [x8, #0x8]
 456230c: b5ffff68     	cbnz	x8, 0x45622f8 <_ChromeMain+0x455d05c>
 4562310: d2800013     	mov	x19, #0x0               ; =0
 4562314: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4562318: 90053289     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 456231c: f9404529     	ldr	x9, [x9, #0x88]
 4562320: eb09011f     	cmp	x8, x9
 4562324: 54000061     	b.ne	0x4562330 <_ChromeMain+0x455d094>
 4562328: aa1303e0     	mov	x0, x19
 456232c: 96eb01c4     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4562330: f9400261     	ldr	x1, [x19]
 4562334: 52800000     	mov	w0, #0x0                ; =0
 4562338: 17ffffd3     	b	0x4562284 <_ChromeMain+0x455cfe8>
 456233c: eb09011f     	cmp	x8, x9
 4562340: 54fffe80     	b.eq	0x4562310 <_ChromeMain+0x455d074>
 4562344: f9401513     	ldr	x19, [x8, #0x28]
 4562348: 925e7668     	and	x8, x19, #0xfffffffc00000000
 456234c: 90053289     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4562350: f9404529     	ldr	x9, [x9, #0x88]
 4562354: eb09011f     	cmp	x8, x9
 4562358: 54fffde1     	b.ne	0x4562314 <_ChromeMain+0x455d078>
 456235c: aa1303e0     	mov	x0, x19
 4562360: 96eac7e7     	bl	0x142fc <_ChromeMain+0xf060>
 4562364: 17ffffec     	b	0x4562314 <_ChromeMain+0x455d078>
 4562368: f9401e68     	ldr	x8, [x19, #0x38]
 456236c: 9100a109     	add	x9, x8, #0x28
 4562370: f100011f     	cmp	x8, #0x0
 4562374: 9a8903e0     	csel	x0, xzr, x9, eq
 4562378: f9404508     	ldr	x8, [x8, #0x88]
 456237c: f9404908     	ldr	x8, [x8, #0x90]
 4562380: b4000108     	cbz	x8, 0x45623a0 <_ChromeMain+0x455d104>
 4562384: f9402101     	ldr	x1, [x8, #0x40]
 4562388: 911703ff     	add	sp, sp, #0x5c0
 456238c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4562390: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4562394: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4562398: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 456239c: 15f20342     	b	0xc1e30a4 <_ChromeMain+0xc1dde08>
 45623a0: d2800001     	mov	x1, #0x0                ; =0
 45623a4: 17fffff9     	b	0x4562388 <_ChromeMain+0x455d0ec>
 45623a8: f004ade8     	adrp	x8, 0xdb21000 <dyld_stub_binder+0xdb21000>
 45623ac: 912f1908     	add	x8, x8, #0xbc6
 45623b0: f90023e8     	str	x8, [sp, #0x40]
 45623b4: 910103e0     	add	x0, sp, #0x40
 45623b8: 975630ed     	bl	0x1aee76c <_ChromeMain+0x1ae94d0>
 45623bc: f9401e68     	ldr	x8, [x19, #0x38]
 45623c0: 9100a109     	add	x9, x8, #0x28
 45623c4: f100011f     	cmp	x8, #0x0
 45623c8: 9a8903e8     	csel	x8, xzr, x9, eq
 45623cc: f9403108     	ldr	x8, [x8, #0x60]
 45623d0: f9404908     	ldr	x8, [x8, #0x90]
 45623d4: b4000088     	cbz	x8, 0x45623e4 <_ChromeMain+0x455d148>
 45623d8: f9402100     	ldr	x0, [x8, #0x40]
 45623dc: 94ea7e2e     	bl	0x8001c94 <_ChromeMain+0x7ffc9f8>
 45623e0: 17fffcab     	b	0x456168c <_ChromeMain+0x455c3f0>
 45623e4: d2800000     	mov	x0, #0x0                ; =0
 45623e8: 17fffffd     	b	0x45623dc <_ChromeMain+0x455d140>
 45623ec: d2800000     	mov	x0, #0x0                ; =0
 45623f0: 14000009     	b	0x4562414 <_ChromeMain+0x455d178>
 45623f4: f9401e68     	ldr	x8, [x19, #0x38]
 45623f8: 9100a109     	add	x9, x8, #0x28
 45623fc: f100011f     	cmp	x8, #0x0
 4562400: 9a8903e8     	csel	x8, xzr, x9, eq
 4562404: f9403108     	ldr	x8, [x8, #0x60]
 4562408: f9404908     	ldr	x8, [x8, #0x90]
 456240c: b4ffff08     	cbz	x8, 0x45623ec <_ChromeMain+0x455d150>
 4562410: f9402100     	ldr	x0, [x8, #0x40]
 4562414: 52800081     	mov	w1, #0x4                ; =4
 4562418: 52800002     	mov	w2, #0x0                ; =0
 456241c: 911703ff     	add	sp, sp, #0x5c0
 4562420: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4562424: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4562428: a94157f6     	ldp	x22, x21, [sp, #0x10]
 456242c: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4562430: 14d9089d     	b	0x7ba46a4 <_ChromeMain+0x7b9f408>
 4562434: 9100a260     	add	x0, x19, #0x28
 4562438: 972befe6     	bl	0x105e3d0 <_ChromeMain+0x1059134>
 456243c: b50001a0     	cbnz	x0, 0x4562470 <_ChromeMain+0x455d1d4>
 4562440: f9403e60     	ldr	x0, [x19, #0x78]
 4562444: 1400000b     	b	0x4562470 <_ChromeMain+0x455d1d4>
 4562448: f004ade8     	adrp	x8, 0xdb21000 <dyld_stub_binder+0xdb21000>
 456244c: 912fa908     	add	x8, x8, #0xbea
 4562450: f90023e8     	str	x8, [sp, #0x40]
 4562454: 910103e0     	add	x0, sp, #0x40
 4562458: 975630c5     	bl	0x1aee76c <_ChromeMain+0x1ae94d0>
 456245c: f9401e73     	ldr	x19, [x19, #0x38]
 4562460: b4011293     	cbz	x19, 0x45646b0 <_ChromeMain+0x455f414>
 4562464: 9100a260     	add	x0, x19, #0x28
 4562468: 970890fc     	bl	0x786858 <_ChromeMain+0x7815bc>
 456246c: b4fffe40     	cbz	x0, 0x4562434 <_ChromeMain+0x455d198>
 4562470: f9400008     	ldr	x8, [x0]
 4562474: f9411908     	ldr	x8, [x8, #0x230]
 4562478: 14000012     	b	0x45624c0 <_ChromeMain+0x455d224>
 456247c: f004ade8     	adrp	x8, 0xdb21000 <dyld_stub_binder+0xdb21000>
 4562480: 912abd08     	add	x8, x8, #0xaaf
 4562484: f90023e8     	str	x8, [sp, #0x40]
 4562488: 910103e0     	add	x0, sp, #0x40
 456248c: 975630b8     	bl	0x1aee76c <_ChromeMain+0x1ae94d0>
 4562490: f9401e68     	ldr	x8, [x19, #0x38]
 4562494: 9100a109     	add	x9, x8, #0x28
 4562498: f100011f     	cmp	x8, #0x0
 456249c: 9a8903f3     	csel	x19, xzr, x9, eq
 45624a0: f004a828     	adrp	x8, 0xda69000 <dyld_stub_binder+0xda69000>
 45624a4: 91033d08     	add	x8, x8, #0xcf
 45624a8: f90023e8     	str	x8, [sp, #0x40]
 45624ac: 910103e0     	add	x0, sp, #0x40
 45624b0: 975630af     	bl	0x1aee76c <_ChromeMain+0x1ae94d0>
 45624b4: f9402a60     	ldr	x0, [x19, #0x50]
 45624b8: f9400008     	ldr	x8, [x0]
 45624bc: f9403108     	ldr	x8, [x8, #0x60]
 45624c0: d63f0100     	blr	x8
 45624c4: 17fffc72     	b	0x456168c <_ChromeMain+0x455c3f0>
 45624c8: f9401e68     	ldr	x8, [x19, #0x38]
 45624cc: 9100a109     	add	x9, x8, #0x28
 45624d0: f100011f     	cmp	x8, #0x0
 45624d4: 9a8903e0     	csel	x0, xzr, x9, eq
 45624d8: 95fffce7     	bl	0xc561874 <_ChromeMain+0xc55c5d8>
 45624dc: f004ade0     	adrp	x0, 0xdb21000 <dyld_stub_binder+0xdb21000>
 45624e0: 912d5400     	add	x0, x0, #0xb55
 45624e4: 52800021     	mov	w1, #0x1                ; =1
 45624e8: 528000a2     	mov	w2, #0x5                ; =5
 45624ec: 528000c3     	mov	w3, #0x6                ; =6
 45624f0: 52800024     	mov	w4, #0x1                ; =1
 45624f4: 970eec23     	bl	0x91d580 <_ChromeMain+0x9182e4>
 45624f8: f9400008     	ldr	x8, [x0]
 45624fc: f9401902     	ldr	x2, [x8, #0x30]
 4562500: d0fde2a8     	adrp	x8, 0x1b8000 <_ChromeMain+0x1b2d64>
 4562504: 912b0108     	add	x8, x8, #0xac0
 4562508: eb08005f     	cmp	x2, x8
 456250c: 54000061     	b.ne	0x4562518 <_ChromeMain+0x455d27c>
 4562510: 52800001     	mov	w1, #0x0                ; =0
 4562514: 1400004c     	b	0x4562644 <_ChromeMain+0x455d3a8>
 4562518: 52800001     	mov	w1, #0x0                ; =0
 456251c: 1400006f     	b	0x45626d8 <_ChromeMain+0x455d43c>
 4562520: 90054d74     	adrp	x20, 0xef0e000 <dyld_stub_binder+0xef0e000>
 4562524: b947aa80     	ldr	w0, [x20, #0x7a8]
 4562528: 34010640     	cbz	w0, 0x45645f0 <_ChromeMain+0x455f354>
 456252c: f9401e68     	ldr	x8, [x19, #0x38]
 4562530: 9100a109     	add	x9, x8, #0x28
 4562534: f100011f     	cmp	x8, #0x0
 4562538: 9a8903e8     	csel	x8, xzr, x9, eq
 456253c: 7100041f     	cmp	w0, #0x1
 4562540: 54000080     	b.eq	0x4562550 <_ChromeMain+0x455d2b4>
 4562544: aa0803e0     	mov	x0, x8
 4562548: 95f431fd     	bl	0xc26ed3c <_ChromeMain+0xc269aa0>
 456254c: 14000003     	b	0x4562558 <_ChromeMain+0x455d2bc>
 4562550: aa0803e0     	mov	x0, x8
 4562554: 95f431fd     	bl	0xc26ed48 <_ChromeMain+0xc269aac>
 4562558: f004ade0     	adrp	x0, 0xdb21000 <dyld_stub_binder+0xdb21000>
 456255c: 912d5400     	add	x0, x0, #0xb55
 4562560: 52800021     	mov	w1, #0x1                ; =1
 4562564: 528000a2     	mov	w2, #0x5                ; =5
 4562568: 528000c3     	mov	w3, #0x6                ; =6
 456256c: 52800024     	mov	w4, #0x1                ; =1
 4562570: 970eec04     	bl	0x91d580 <_ChromeMain+0x9182e4>
 4562574: f9400008     	ldr	x8, [x0]
 4562578: f9401902     	ldr	x2, [x8, #0x30]
 456257c: d0fde2a8     	adrp	x8, 0x1b8000 <_ChromeMain+0x1b2d64>
 4562580: 912b0108     	add	x8, x8, #0xac0
 4562584: 52800061     	mov	w1, #0x3                ; =3
 4562588: 1400002d     	b	0x456263c <_ChromeMain+0x455d3a0>
 456258c: 90054d74     	adrp	x20, 0xef0e000 <dyld_stub_binder+0xef0e000>
 4562590: b947aa80     	ldr	w0, [x20, #0x7a8]
 4562594: 34010400     	cbz	w0, 0x4564614 <_ChromeMain+0x455f378>
 4562598: f9401e68     	ldr	x8, [x19, #0x38]
 456259c: 9100a109     	add	x9, x8, #0x28
 45625a0: f100011f     	cmp	x8, #0x0
 45625a4: 9a8903e8     	csel	x8, xzr, x9, eq
 45625a8: 7100041f     	cmp	w0, #0x1
 45625ac: 54000080     	b.eq	0x45625bc <_ChromeMain+0x455d320>
 45625b0: aa0803e0     	mov	x0, x8
 45625b4: 95f431e5     	bl	0xc26ed48 <_ChromeMain+0xc269aac>
 45625b8: 14000003     	b	0x45625c4 <_ChromeMain+0x455d328>
 45625bc: aa0803e0     	mov	x0, x8
 45625c0: 95f431df     	bl	0xc26ed3c <_ChromeMain+0xc269aa0>
 45625c4: f004ade0     	adrp	x0, 0xdb21000 <dyld_stub_binder+0xdb21000>
 45625c8: 912d5400     	add	x0, x0, #0xb55
 45625cc: 52800021     	mov	w1, #0x1                ; =1
 45625d0: 528000a2     	mov	w2, #0x5                ; =5
 45625d4: 528000c3     	mov	w3, #0x6                ; =6
 45625d8: 52800024     	mov	w4, #0x1                ; =1
 45625dc: 970eebe9     	bl	0x91d580 <_ChromeMain+0x9182e4>
 45625e0: f9400008     	ldr	x8, [x0]
 45625e4: f9401902     	ldr	x2, [x8, #0x30]
 45625e8: d0fde2a8     	adrp	x8, 0x1b8000 <_ChromeMain+0x1b2d64>
 45625ec: 912b0108     	add	x8, x8, #0xac0
 45625f0: 52800081     	mov	w1, #0x4                ; =4
 45625f4: 14000012     	b	0x456263c <_ChromeMain+0x455d3a0>
 45625f8: f9401e68     	ldr	x8, [x19, #0x38]
 45625fc: 9100a109     	add	x9, x8, #0x28
 4562600: f100011f     	cmp	x8, #0x0
 4562604: 9a8903e0     	csel	x0, xzr, x9, eq
 4562608: 9400115e     	bl	0x4566b80 <_ChromeMain+0x45618e4>
 456260c: f004ade0     	adrp	x0, 0xdb21000 <dyld_stub_binder+0xdb21000>
 4562610: 912d5400     	add	x0, x0, #0xb55
 4562614: 52800021     	mov	w1, #0x1                ; =1
 4562618: 528000a2     	mov	w2, #0x5                ; =5
 456261c: 528000c3     	mov	w3, #0x6                ; =6
 4562620: 52800024     	mov	w4, #0x1                ; =1
 4562624: 970eebd7     	bl	0x91d580 <_ChromeMain+0x9182e4>
 4562628: f9400008     	ldr	x8, [x0]
 456262c: f9401902     	ldr	x2, [x8, #0x30]
 4562630: d0fde2a8     	adrp	x8, 0x1b8000 <_ChromeMain+0x1b2d64>
 4562634: 912b0108     	add	x8, x8, #0xac0
 4562638: 52800041     	mov	w1, #0x2                ; =2
 456263c: eb08005f     	cmp	x2, x8
 4562640: 540004c1     	b.ne	0x45626d8 <_ChromeMain+0x455d43c>
 4562644: 911703ff     	add	sp, sp, #0x5c0
 4562648: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 456264c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4562650: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4562654: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4562658: 16f1591a     	b	0x1b8ac0 <_ChromeMain+0x1b3824>
 456265c: f9401e68     	ldr	x8, [x19, #0x38]
 4562660: 9100a109     	add	x9, x8, #0x28
 4562664: f100011f     	cmp	x8, #0x0
 4562668: 9a8903e0     	csel	x0, xzr, x9, eq
 456266c: 95f431ba     	bl	0xc26ed54 <_ChromeMain+0xc269ab8>
 4562670: f004ade0     	adrp	x0, 0xdb21000 <dyld_stub_binder+0xdb21000>
 4562674: 912d5400     	add	x0, x0, #0xb55
 4562678: 52800021     	mov	w1, #0x1                ; =1
 456267c: 528000a2     	mov	w2, #0x5                ; =5
 4562680: 528000c3     	mov	w3, #0x6                ; =6
 4562684: 52800024     	mov	w4, #0x1                ; =1
 4562688: 970eebbe     	bl	0x91d580 <_ChromeMain+0x9182e4>
 456268c: f9400008     	ldr	x8, [x0]
 4562690: f9401902     	ldr	x2, [x8, #0x30]
 4562694: d0fde2a8     	adrp	x8, 0x1b8000 <_ChromeMain+0x1b2d64>
 4562698: 912b0108     	add	x8, x8, #0xac0
 456269c: eb08005f     	cmp	x2, x8
 45626a0: 540001a1     	b.ne	0x45626d4 <_ChromeMain+0x455d438>
 45626a4: 52800021     	mov	w1, #0x1                ; =1
 45626a8: 17ffffe7     	b	0x4562644 <_ChromeMain+0x455d3a8>
 45626ac: 529398c8     	mov	w8, #0x9cc6             ; =40134
 45626b0: 6b08029f     	cmp	w20, w8
 45626b4: 540001e1     	b.ne	0x45626f0 <_ChromeMain+0x455d454>
 45626b8: f9401e73     	ldr	x19, [x19, #0x38]
 45626bc: b400fff3     	cbz	x19, 0x45646b8 <_ChromeMain+0x455f41c>
 45626c0: 9100a260     	add	x0, x19, #0x28
 45626c4: 97089065     	bl	0x786858 <_ChromeMain+0x7815bc>
 45626c8: b40002e0     	cbz	x0, 0x4562724 <_ChromeMain+0x455d488>
 45626cc: f9400008     	ldr	x8, [x0]
 45626d0: f9413d02     	ldr	x2, [x8, #0x278]
 45626d4: 52800021     	mov	w1, #0x1                ; =1
 45626d8: 911703ff     	add	sp, sp, #0x5c0
 45626dc: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 45626e0: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 45626e4: a94157f6     	ldp	x22, x21, [sp, #0x10]
 45626e8: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 45626ec: d61f0040     	br	x2
 45626f0: 52930c28     	mov	w8, #0x9861             ; =39009
 45626f4: 6b08029f     	cmp	w20, w8
 45626f8: 54ffbb61     	b.ne	0x4561e64 <_ChromeMain+0x455cbc8>
 45626fc: f9401e68     	ldr	x8, [x19, #0x38]
 4562700: 9100a109     	add	x9, x8, #0x28
 4562704: f100011f     	cmp	x8, #0x0
 4562708: 9a8903e0     	csel	x0, xzr, x9, eq
 456270c: 911703ff     	add	sp, sp, #0x5c0
 4562710: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4562714: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4562718: a94157f6     	ldp	x22, x21, [sp, #0x10]
 456271c: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4562720: 15fffc58     	b	0xc561880 <_ChromeMain+0xc55c5e4>
 4562724: 9100a260     	add	x0, x19, #0x28
 4562728: 972bef2a     	bl	0x105e3d0 <_ChromeMain+0x1059134>
 456272c: b5fffd00     	cbnz	x0, 0x45626cc <_ChromeMain+0x455d430>
 4562730: f9403e60     	ldr	x0, [x19, #0x78]
 4562734: 17ffffe6     	b	0x45626cc <_ChromeMain+0x455d430>
 4562738: d2800014     	mov	x20, #0x0               ; =0
 456273c: 14000006     	b	0x4562754 <_ChromeMain+0x455d4b8>
 4562740: f9401e68     	ldr	x8, [x19, #0x38]
 4562744: f9404508     	ldr	x8, [x8, #0x88]
 4562748: f9404908     	ldr	x8, [x8, #0x90]
 456274c: b4ffff68     	cbz	x8, 0x4562738 <_ChromeMain+0x455d49c>
 4562750: f9402114     	ldr	x20, [x8, #0x40]
 4562754: d0053bc0     	adrp	x0, 0xecdc000 <dyld_stub_binder+0xecdc000>
 4562758: 910d2000     	add	x0, x0, #0x348
 456275c: 96eedac9     	bl	0x119280 <_ChromeMain+0x113fe4>
 4562760: 340000c0     	cbz	w0, 0x4562778 <_ChromeMain+0x455d4dc>
 4562764: f9401e68     	ldr	x8, [x19, #0x38]
 4562768: f9403500     	ldr	x0, [x8, #0x68]
 456276c: aa1403e1     	mov	x1, x20
 4562770: 971a63f8     	bl	0xbfb750 <_ChromeMain+0xbf64b4>
 4562774: 36000400     	tbz	w0, #0x0, 0x45627f4 <_ChromeMain+0x455d558>
 4562778: f9447e81     	ldr	x1, [x20, #0x8f8]
 456277c: f9408c20     	ldr	x0, [x1, #0x118]
 4562780: f9400008     	ldr	x8, [x0]
 4562784: f940dd02     	ldr	x2, [x8, #0x1b8]
 4562788: 911703ff     	add	sp, sp, #0x5c0
 456278c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4562790: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4562794: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4562798: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 456279c: d61f0040     	br	x2
 45627a0: f9401e68     	ldr	x8, [x19, #0x38]
 45627a4: f9404508     	ldr	x8, [x8, #0x88]
 45627a8: f9404908     	ldr	x8, [x8, #0x90]
 45627ac: b4000328     	cbz	x8, 0x4562810 <_ChromeMain+0x455d574>
 45627b0: f9402114     	ldr	x20, [x8, #0x40]
 45627b4: d0053bc0     	adrp	x0, 0xecdc000 <dyld_stub_binder+0xecdc000>
 45627b8: 910d2000     	add	x0, x0, #0x348
 45627bc: 96eedab1     	bl	0x119280 <_ChromeMain+0x113fe4>
 45627c0: 340000c0     	cbz	w0, 0x45627d8 <_ChromeMain+0x455d53c>
 45627c4: f9401e68     	ldr	x8, [x19, #0x38]
 45627c8: f9403500     	ldr	x0, [x8, #0x68]
 45627cc: aa1403e1     	mov	x1, x20
 45627d0: 971a63e0     	bl	0xbfb750 <_ChromeMain+0xbf64b4>
 45627d4: 36000100     	tbz	w0, #0x0, 0x45627f4 <_ChromeMain+0x455d558>
 45627d8: f9401e60     	ldr	x0, [x19, #0x38]
 45627dc: 911703ff     	add	sp, sp, #0x5c0
 45627e0: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 45627e4: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 45627e8: a94157f6     	ldp	x22, x21, [sp, #0x10]
 45627ec: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 45627f0: 15f434fc     	b	0xc26fbe0 <_ChromeMain+0xc26a944>
 45627f4: aa1403e0     	mov	x0, x20
 45627f8: 911703ff     	add	sp, sp, #0x5c0
 45627fc: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4562800: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4562804: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4562808: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 456280c: 15f431e7     	b	0xc26efa8 <_ChromeMain+0xc269d0c>
 4562810: d2800014     	mov	x20, #0x0               ; =0
 4562814: 17ffffe8     	b	0x45627b4 <_ChromeMain+0x455d518>
 4562818: f9401e68     	ldr	x8, [x19, #0x38]
 456281c: f9404509     	ldr	x9, [x8, #0x88]
 4562820: f9404929     	ldr	x9, [x9, #0x90]
 4562824: 3941e129     	ldrb	w9, [x9, #0x78]
 4562828: 37077329     	tbnz	w9, #0x0, 0x456168c <_ChromeMain+0x455c3f0>
 456282c: 9100a109     	add	x9, x8, #0x28
 4562830: f100011f     	cmp	x8, #0x0
 4562834: 9a8903e0     	csel	x0, xzr, x9, eq
 4562838: 52800021     	mov	w1, #0x1                ; =1
 456283c: 1400000a     	b	0x4562864 <_ChromeMain+0x455d5c8>
 4562840: f9401e68     	ldr	x8, [x19, #0x38]
 4562844: f9404509     	ldr	x9, [x8, #0x88]
 4562848: f9404929     	ldr	x9, [x9, #0x90]
 456284c: 3941e129     	ldrb	w9, [x9, #0x78]
 4562850: 370771e9     	tbnz	w9, #0x0, 0x456168c <_ChromeMain+0x455c3f0>
 4562854: 9100a109     	add	x9, x8, #0x28
 4562858: f100011f     	cmp	x8, #0x0
 456285c: 9a8903e0     	csel	x0, xzr, x9, eq
 4562860: 52800001     	mov	w1, #0x0                ; =0
 4562864: 52800122     	mov	w2, #0x9                ; =9
 4562868: 911703ff     	add	sp, sp, #0x5c0
 456286c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4562870: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4562874: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4562878: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 456287c: 15f22cf4     	b	0xc1edc4c <_ChromeMain+0xc1e89b0>
 4562880: f9401e68     	ldr	x8, [x19, #0x38]
 4562884: 9100a109     	add	x9, x8, #0x28
 4562888: f100011f     	cmp	x8, #0x0
 456288c: 9a8903e0     	csel	x0, xzr, x9, eq
 4562890: 911703ff     	add	sp, sp, #0x5c0
 4562894: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4562898: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 456289c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 45628a0: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 45628a4: 14001908     	b	0x4568cc4 <_ChromeMain+0x4563a28>
 45628a8: f9401e68     	ldr	x8, [x19, #0x38]
 45628ac: 9100a109     	add	x9, x8, #0x28
 45628b0: f100011f     	cmp	x8, #0x0
 45628b4: 9a8903e0     	csel	x0, xzr, x9, eq
 45628b8: 911703ff     	add	sp, sp, #0x5c0
 45628bc: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 45628c0: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 45628c4: a94157f6     	ldp	x22, x21, [sp, #0x10]
 45628c8: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 45628cc: 15fffbf0     	b	0xc56188c <_ChromeMain+0xc55c5f0>
 45628d0: f9401e68     	ldr	x8, [x19, #0x38]
 45628d4: 9100a109     	add	x9, x8, #0x28
 45628d8: f100011f     	cmp	x8, #0x0
 45628dc: 9a8903e0     	csel	x0, xzr, x9, eq
 45628e0: 911703ff     	add	sp, sp, #0x5c0
 45628e4: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 45628e8: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 45628ec: a94157f6     	ldp	x22, x21, [sp, #0x10]
 45628f0: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 45628f4: 15fffbe9     	b	0xc561898 <_ChromeMain+0xc55c5fc>
 45628f8: f9401e68     	ldr	x8, [x19, #0x38]
 45628fc: 9100a109     	add	x9, x8, #0x28
 4562900: f100011f     	cmp	x8, #0x0
 4562904: 9a8903e0     	csel	x0, xzr, x9, eq
 4562908: 911703ff     	add	sp, sp, #0x5c0
 456290c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4562910: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4562914: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4562918: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 456291c: 15fffbe2     	b	0xc5618a4 <_ChromeMain+0xc55c608>
 4562920: f9401e68     	ldr	x8, [x19, #0x38]
 4562924: 9100a109     	add	x9, x8, #0x28
 4562928: f100011f     	cmp	x8, #0x0
 456292c: 9a8903e0     	csel	x0, xzr, x9, eq
 4562930: 911703ff     	add	sp, sp, #0x5c0
 4562934: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4562938: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 456293c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4562940: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4562944: 15fffcfd     	b	0xc561d38 <_ChromeMain+0xc55ca9c>
 4562948: f9401e68     	ldr	x8, [x19, #0x38]
 456294c: 9100a109     	add	x9, x8, #0x28
 4562950: f100011f     	cmp	x8, #0x0
 4562954: 9a8903e0     	csel	x0, xzr, x9, eq
 4562958: 911703ff     	add	sp, sp, #0x5c0
 456295c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4562960: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4562964: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4562968: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 456296c: 1400111b     	b	0x4566dd8 <_ChromeMain+0x4561b3c>
 4562970: f9401e68     	ldr	x8, [x19, #0x38]
 4562974: 9100a109     	add	x9, x8, #0x28
 4562978: f100011f     	cmp	x8, #0x0
 456297c: 9a8903e0     	csel	x0, xzr, x9, eq
 4562980: 911703ff     	add	sp, sp, #0x5c0
 4562984: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4562988: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 456298c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4562990: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4562994: 140010cb     	b	0x4566cc0 <_ChromeMain+0x4561a24>
 4562998: 90053240     	adrp	x0, 0xebaa000 <dyld_stub_binder+0xebaa000>
 456299c: 9111a000     	add	x0, x0, #0x468
 45629a0: 96eeda38     	bl	0x119280 <_ChromeMain+0x113fe4>
 45629a4: 34ff6740     	cbz	w0, 0x456168c <_ChromeMain+0x455c3f0>
 45629a8: f9401e68     	ldr	x8, [x19, #0x38]
 45629ac: 9100a109     	add	x9, x8, #0x28
 45629b0: f100011f     	cmp	x8, #0x0
 45629b4: 9a8903e0     	csel	x0, xzr, x9, eq
 45629b8: 911703ff     	add	sp, sp, #0x5c0
 45629bc: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 45629c0: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 45629c4: a94157f6     	ldp	x22, x21, [sp, #0x10]
 45629c8: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 45629cc: 15fffcde     	b	0xc561d44 <_ChromeMain+0xc55caa8>
 45629d0: f9401e68     	ldr	x8, [x19, #0x38]
 45629d4: f9404508     	ldr	x8, [x8, #0x88]
 45629d8: f9404908     	ldr	x8, [x8, #0x90]
 45629dc: b4ff6588     	cbz	x8, 0x456168c <_ChromeMain+0x455c3f0>
 45629e0: f9402113     	ldr	x19, [x8, #0x40]
 45629e4: b4ff6553     	cbz	x19, 0x456168c <_ChromeMain+0x455c3f0>
 45629e8: f0047b21     	adrp	x1, 0xd4c9000 <dyld_stub_binder+0xd4c9000>
 45629ec: 9133d021     	add	x1, x1, #0xcf4
 45629f0: 91002260     	add	x0, x19, #0x8
 45629f4: 96ebc1df     	bl	0x53170 <_ChromeMain+0x4ded4>
 45629f8: d1008008     	sub	x8, x0, #0x20
 45629fc: f100001f     	cmp	x0, #0x0
 4562a00: fa401904     	ccmp	x8, #0x0, #0x4, ne
 4562a04: 5400e620     	b.eq	0x45646c8 <_ChromeMain+0x455f42c>
 4562a08: b9405414     	ldr	w20, [x0, #0x54]
 4562a0c: 52800600     	mov	w0, #0x30               ; =48
 4562a10: 96eab256     	bl	0xf368 <_ChromeMain+0xa0cc>
 4562a14: aa0003e1     	mov	x1, x0
 4562a18: 52800028     	mov	w8, #0x1                ; =1
 4562a1c: b9000008     	str	w8, [x0]
 4562a20: b002c9e8     	adrp	x8, 0x9e9f000 <_ChromeMain+0x9e99d64>
 4562a24: 91380108     	add	x8, x8, #0xe00
 4562a28: 90fec669     	adrp	x9, 0x1e2e000 <_ChromeMain+0x1e28d64>
 4562a2c: 913c0129     	add	x9, x9, #0xf00
 4562a30: a900a408     	stp	x8, x9, [x0, #0x8]
 4562a34: f0feffc8     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4562a38: 912c0108     	add	x8, x8, #0xb00
 4562a3c: 90040c09     	adrp	x9, 0xc6e2000 <_ChromeMain+0xc6dcd64>
 4562a40: 91116129     	add	x9, x9, #0x458
 4562a44: a901a408     	stp	x8, x9, [x0, #0x18]
 4562a48: b9002814     	str	w20, [x0, #0x28]
 4562a4c: aa1303e0     	mov	x0, x19
 4562a50: 52800022     	mov	w2, #0x1                ; =1
 4562a54: d2800003     	mov	x3, #0x0                ; =0
 4562a58: 911703ff     	add	sp, sp, #0x5c0
 4562a5c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4562a60: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4562a64: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4562a68: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4562a6c: 14d9a1d0     	b	0x7bcb1ac <_ChromeMain+0x7bc5f10>
 4562a70: f9401e68     	ldr	x8, [x19, #0x38]
 4562a74: 9100a109     	add	x9, x8, #0x28
 4562a78: f100011f     	cmp	x8, #0x0
 4562a7c: 9a8903e0     	csel	x0, xzr, x9, eq
 4562a80: 911703ff     	add	sp, sp, #0x5c0
 4562a84: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4562a88: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4562a8c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4562a90: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4562a94: 15fffce6     	b	0xc561e2c <_ChromeMain+0xc55cb90>
 4562a98: f9401e68     	ldr	x8, [x19, #0x38]
 4562a9c: 9100a109     	add	x9, x8, #0x28
 4562aa0: f100011f     	cmp	x8, #0x0
 4562aa4: 9a8903e0     	csel	x0, xzr, x9, eq
 4562aa8: 52800021     	mov	w1, #0x1                ; =1
 4562aac: 911703ff     	add	sp, sp, #0x5c0
 4562ab0: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4562ab4: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4562ab8: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4562abc: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4562ac0: 14000bc8     	b	0x45659e0 <_ChromeMain+0x4560744>
 4562ac4: f9401e68     	ldr	x8, [x19, #0x38]
 4562ac8: 9100a109     	add	x9, x8, #0x28
 4562acc: f100011f     	cmp	x8, #0x0
 4562ad0: 9a8903e8     	csel	x8, xzr, x9, eq
 4562ad4: d100a100     	sub	x0, x8, #0x28
 4562ad8: 911703ff     	add	sp, sp, #0x5c0
 4562adc: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4562ae0: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4562ae4: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4562ae8: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4562aec: 14ea0b1a     	b	0x7fe5754 <_ChromeMain+0x7fe04b8>
 4562af0: f004ade8     	adrp	x8, 0xdb21000 <dyld_stub_binder+0xdb21000>
 4562af4: 912b0108     	add	x8, x8, #0xac0
 4562af8: f90023e8     	str	x8, [sp, #0x40]
 4562afc: 910103e0     	add	x0, sp, #0x40
 4562b00: 97562f1b     	bl	0x1aee76c <_ChromeMain+0x1ae94d0>
 4562b04: f9401e68     	ldr	x8, [x19, #0x38]
 4562b08: 9100a109     	add	x9, x8, #0x28
 4562b0c: f100011f     	cmp	x8, #0x0
 4562b10: 9a8903e0     	csel	x0, xzr, x9, eq
 4562b14: 94dc7e1a     	bl	0x7c8237c <_ChromeMain+0x7c7d0e0>
 4562b18: 17fffadd     	b	0x456168c <_ChromeMain+0x455c3f0>
 4562b1c: f9401e75     	ldr	x21, [x19, #0x38]
 4562b20: b4ff5b75     	cbz	x21, 0x456168c <_ChromeMain+0x455c3f0>
 4562b24: f94036a0     	ldr	x0, [x21, #0x68]
 4562b28: 971a6dbc     	bl	0xbfe218 <_ChromeMain+0xbf8f7c>
 4562b2c: 34ff5b00     	cbz	w0, 0x456168c <_ChromeMain+0x455c3f0>
 4562b30: f94036b3     	ldr	x19, [x21, #0x68]
 4562b34: b4000353     	cbz	x19, 0x4562b9c <_ChromeMain+0x455d900>
 4562b38: 39412268     	ldrb	w8, [x19, #0x48]
 4562b3c: 37000308     	tbnz	w8, #0x0, 0x4562b9c <_ChromeMain+0x455d900>
 4562b40: f9400268     	ldr	x8, [x19]
 4562b44: f940b508     	ldr	x8, [x8, #0x168]
 4562b48: aa1303e0     	mov	x0, x19
 4562b4c: d63f0100     	blr	x8
 4562b50: b4000260     	cbz	x0, 0x4562b9c <_ChromeMain+0x455d900>
 4562b54: aa0003f4     	mov	x20, x0
 4562b58: d0044bc1     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 4562b5c: 91018021     	add	x1, x1, #0x60
 4562b60: 52800202     	mov	w2, #0x10               ; =16
 4562b64: 96fd683a     	bl	0x4bcc4c <_ChromeMain+0x4b79b0>
 4562b68: b40001a0     	cbz	x0, 0x4562b9c <_ChromeMain+0x455d900>
 4562b6c: d0044bc1     	adrp	x1, 0xcedc000 <dyld_stub_binder+0xcedc000>
 4562b70: 91018021     	add	x1, x1, #0x60
 4562b74: aa1403e0     	mov	x0, x20
 4562b78: 52800202     	mov	w2, #0x10               ; =16
 4562b7c: 96f56fab     	bl	0x2bea28 <_ChromeMain+0x2b978c>
 4562b80: 3100041f     	cmn	w0, #0x1
 4562b84: d2c00028     	mov	x8, #0x100000000        ; =4294967296
 4562b88: 9a9fc109     	csel	x9, x8, xzr, gt
 4562b8c: 37f80080     	tbnz	w0, #0x1f, 0x4562b9c <_ChromeMain+0x455d900>
 4562b90: 0aa07c0a     	bic	w10, w0, w0, asr #31
 4562b94: aa0a0120     	orr	x0, x9, x10
 4562b98: 14000004     	b	0x4562ba8 <_ChromeMain+0x455d90c>
 4562b9c: aa1303e0     	mov	x0, x19
 4562ba0: 97ee8288     	bl	0x41035c0 <_ChromeMain+0x40fe324>
 4562ba4: 92600008     	and	x8, x0, #0x100000000
 4562ba8: 2a0003e9     	mov	w9, w0
 4562bac: f81c03bf     	stur	xzr, [x29, #-0x40]
 4562bb0: aa090108     	orr	x8, x8, x9
 4562bb4: 6f00e400     	movi.2d	v0, #0000000000000000
 4562bb8: ad3d03a0     	stp	q0, q0, [x29, #-0x60]
 4562bbc: d2c00029     	mov	x9, #0x100000000        ; =4294967296
 4562bc0: eb09011f     	cmp	x8, x9
 4562bc4: 9a898102     	csel	x2, x8, x9, hi
 4562bc8: ad3c03a0     	stp	q0, q0, [x29, #-0x80]
 4562bcc: ad3b03a0     	stp	q0, q0, [x29, #-0xa0]
 4562bd0: 3c9503a0     	stur	q0, [x29, #-0xb0]
 4562bd4: f0048be0     	adrp	x0, 0xd6e1000 <dyld_stub_binder+0xd6e1000>
 4562bd8: 91322000     	add	x0, x0, #0xc88
 4562bdc: f0048be3     	adrp	x3, 0xd6e1000 <dyld_stub_binder+0xd6e1000>
 4562be0: 91324863     	add	x3, x3, #0xc92
 4562be4: d102c3a8     	sub	x8, x29, #0xb0
 4562be8: 52800121     	mov	w1, #0x9                ; =9
 4562bec: 52800144     	mov	w4, #0xa                ; =10
 4562bf0: 94000944     	bl	0x4565100 <_ChromeMain+0x455fe64>
 4562bf4: 385683a8     	ldurb	w8, [x29, #-0x98]
 4562bf8: 340005e8     	cbz	w8, 0x4562cb4 <_ChromeMain+0x455da18>
 4562bfc: f94046b6     	ldr	x22, [x21, #0x88]
 4562c00: b40005b6     	cbz	x22, 0x4562cb4 <_ChromeMain+0x455da18>
 4562c04: f9404ac1     	ldr	x1, [x22, #0x90]
 4562c08: b40002a1     	cbz	x1, 0x4562c5c <_ChromeMain+0x455d9c0>
 4562c0c: f94002c0     	ldr	x0, [x22]
 4562c10: 96f89e47     	bl	0x38a52c <_ChromeMain+0x385290>
 4562c14: aa0003f3     	mov	x19, x0
 4562c18: 3100067f     	cmn	w19, #0x1
 4562c1c: 1a9f07e8     	cset	w8, ne
 4562c20: 6a08003f     	tst	w1, w8
 4562c24: 540001c0     	b.eq	0x4562c5c <_ChromeMain+0x455d9c0>
 4562c28: 37f8d6d3     	tbnz	w19, #0x1f, 0x4564700 <_ChromeMain+0x455f464>
 4562c2c: f94002c0     	ldr	x0, [x22]
 4562c30: b9401808     	ldr	w8, [x0, #0x18]
 4562c34: 6b08027f     	cmp	w19, w8
 4562c38: 5400d64a     	b.ge	0x4564700 <_ChromeMain+0x455f464>
 4562c3c: 92407a61     	and	x1, x19, #0x7fffffff
 4562c40: 972bedae     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 4562c44: f9402000     	ldr	x0, [x0, #0x40]
 4562c48: d102c3a1     	sub	x1, x29, #0xb0
 4562c4c: 940007b2     	bl	0x4564b14 <_ChromeMain+0x455f878>
 4562c50: 34000080     	cbz	w0, 0x4562c60 <_ChromeMain+0x455d9c4>
 4562c54: 12185e76     	and	w22, w19, #0xffffff00
 4562c58: 14000656     	b	0x45645b0 <_ChromeMain+0x455f314>
 4562c5c: 12800013     	mov	w19, #-0x1              ; =-1
 4562c60: f94002c0     	ldr	x0, [x22]
 4562c64: b9401808     	ldr	w8, [x0, #0x18]
 4562c68: 7100051f     	cmp	w8, #0x1
 4562c6c: 5400024b     	b.lt	0x4562cb4 <_ChromeMain+0x455da18>
 4562c70: d2800014     	mov	x20, #0x0               ; =0
 4562c74: 2a1303f3     	mov	w19, w19
 4562c78: 14000006     	b	0x4562c90 <_ChromeMain+0x455d9f4>
 4562c7c: f94002c0     	ldr	x0, [x22]
 4562c80: 91000694     	add	x20, x20, #0x1
 4562c84: b9801808     	ldrsw	x8, [x0, #0x18]
 4562c88: eb08029f     	cmp	x20, x8
 4562c8c: 5400014a     	b.ge	0x4562cb4 <_ChromeMain+0x455da18>
 4562c90: eb14027f     	cmp	x19, x20
 4562c94: 54ffff60     	b.eq	0x4562c80 <_ChromeMain+0x455d9e4>
 4562c98: aa1403e1     	mov	x1, x20
 4562c9c: 972bed97     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 4562ca0: f9402000     	ldr	x0, [x0, #0x40]
 4562ca4: d102c3a1     	sub	x1, x29, #0xb0
 4562ca8: 9400079b     	bl	0x4564b14 <_ChromeMain+0x455f878>
 4562cac: 3700c7e0     	tbnz	w0, #0x0, 0x45645a8 <_ChromeMain+0x455f30c>
 4562cb0: 17fffff3     	b	0x4562c7c <_ChromeMain+0x455d9e0>
 4562cb4: 910103e0     	add	x0, sp, #0x40
 4562cb8: 5280a001     	mov	w1, #0x500              ; =1280
 4562cbc: 94ea9ad5     	bl	0x8009810 <_ChromeMain+0x8004574>
 4562cc0: 910103e0     	add	x0, sp, #0x40
 4562cc4: 9100a2a1     	add	x1, x21, #0x28
 4562cc8: d102c3a2     	sub	x2, x29, #0xb0
 4562ccc: 52800003     	mov	w3, #0x0                ; =0
 4562cd0: 97b1a683     	bl	0x31cc6dc <_ChromeMain+0x31c7440>
 4562cd4: 52800068     	mov	w8, #0x3                ; =3
 4562cd8: b902b3e8     	str	w8, [sp, #0x2b0]
 4562cdc: f94046a8     	ldr	x8, [x21, #0x88]
 4562ce0: f9404908     	ldr	x8, [x8, #0x90]
 4562ce4: b40005a8     	cbz	x8, 0x4562d98 <_ChromeMain+0x455dafc>
 4562ce8: f9402113     	ldr	x19, [x8, #0x40]
 4562cec: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4562cf0: 90053294     	adrp	x20, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4562cf4: f9404689     	ldr	x9, [x20, #0x88]
 4562cf8: eb09011f     	cmp	x8, x9
 4562cfc: 54000061     	b.ne	0x4562d08 <_ChromeMain+0x455da6c>
 4562d00: aa1303e0     	mov	x0, x19
 4562d04: 96eac57e     	bl	0x142fc <_ChromeMain+0xf060>
 4562d08: f94157e0     	ldr	x0, [sp, #0x2a8]
 4562d0c: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4562d10: f9404689     	ldr	x9, [x20, #0x88]
 4562d14: eb09011f     	cmp	x8, x9
 4562d18: 54000041     	b.ne	0x4562d20 <_ChromeMain+0x455da84>
 4562d1c: 96eb0f4a     	bl	0x26a44 <_ChromeMain+0x217a8>
 4562d20: f90157f3     	str	x19, [sp, #0x2a8]
 4562d24: 52800028     	mov	w8, #0x1                ; =1
 4562d28: b9030be8     	str	w8, [sp, #0x308]
 4562d2c: 910103e0     	add	x0, sp, #0x40
 4562d30: 94001bf0     	bl	0x4569cf0 <_ChromeMain+0x4564a54>
 4562d34: 381cf3bf     	sturb	wzr, [x29, #-0x31]
 4562d38: 910103e0     	add	x0, sp, #0x40
 4562d3c: d100c7a1     	sub	x1, x29, #0x31
 4562d40: 97c58800     	bl	0x36c4d40 <_ChromeMain+0x36bfaa4>
 4562d44: b50001c0     	cbnz	x0, 0x4562d7c <_ChromeMain+0x455dae0>
 4562d48: 910103e0     	add	x0, sp, #0x40
 4562d4c: 97b1a6bb     	bl	0x31cc838 <_ChromeMain+0x31c759c>
 4562d50: d102c3b3     	sub	x19, x29, #0xb0
 4562d54: 9101c260     	add	x0, x19, #0x70
 4562d58: d2800001     	mov	x1, #0x0                ; =0
 4562d5c: 96eb13d7     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4562d60: 91008260     	add	x0, x19, #0x20
 4562d64: 96eb13c5     	bl	0x27c78 <_ChromeMain+0x229dc>
 4562d68: 38d673a8     	ldursb	w8, [x29, #-0x99]
 4562d6c: 36ff4908     	tbz	w8, #0x1f, 0x456168c <_ChromeMain+0x455c3f0>
 4562d70: f85503a0     	ldur	x0, [x29, #-0xb0]
 4562d74: f85603a8     	ldur	x8, [x29, #-0xa0]
 4562d78: 14000087     	b	0x4562f94 <_ChromeMain+0x455dcf8>
 4562d7c: 12800008     	mov	w8, #-0x1               ; =-1
 4562d80: b8e80008     	ldaddal	w8, w8, [x0]
 4562d84: 7100051f     	cmp	w8, #0x1
 4562d88: 54fffe01     	b.ne	0x4562d48 <_ChromeMain+0x455daac>
 4562d8c: 52800101     	mov	w1, #0x8                ; =8
 4562d90: 96ea984a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4562d94: 17ffffed     	b	0x4562d48 <_ChromeMain+0x455daac>
 4562d98: d2800013     	mov	x19, #0x0               ; =0
 4562d9c: 17ffffd4     	b	0x4562cec <_ChromeMain+0x455da50>
 4562da0: f9401e68     	ldr	x8, [x19, #0x38]
 4562da4: f9403500     	ldr	x0, [x8, #0x68]
 4562da8: 52800041     	mov	w1, #0x2                ; =2
 4562dac: 911703ff     	add	sp, sp, #0x5c0
 4562db0: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4562db4: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4562db8: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4562dbc: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4562dc0: 14d694de     	b	0x7b08138 <_ChromeMain+0x7b02e9c>
 4562dc4: d2800000     	mov	x0, #0x0                ; =0
 4562dc8: 911703ff     	add	sp, sp, #0x5c0
 4562dcc: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4562dd0: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4562dd4: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4562dd8: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4562ddc: 14d59f78     	b	0x7acabbc <_ChromeMain+0x7ac5920>
 4562de0: 52919408     	mov	w8, #0x8ca0             ; =36000
 4562de4: 6b08029f     	cmp	w20, w8
 4562de8: 54ffa700     	b.eq	0x45622c8 <_ChromeMain+0x455d02c>
 4562dec: 52919428     	mov	w8, #0x8ca1             ; =36001
 4562df0: 6b08029f     	cmp	w20, w8
 4562df4: 54ff8381     	b.ne	0x4561e64 <_ChromeMain+0x455cbc8>
 4562df8: f9401e68     	ldr	x8, [x19, #0x38]
 4562dfc: 9100a109     	add	x9, x8, #0x28
 4562e00: f100011f     	cmp	x8, #0x0
 4562e04: 9a8903e9     	csel	x9, xzr, x9, eq
 4562e08: f940b128     	ldr	x8, [x9, #0x160]
 4562e0c: b4ffa028     	cbz	x8, 0x4562210 <_ChromeMain+0x455cf74>
 4562e10: 91058129     	add	x9, x9, #0x160
 4562e14: b0051a2a     	adrp	x10, 0xe8a7000 <dyld_stub_binder+0xe8a7000>
 4562e18: 9125c14a     	add	x10, x10, #0x970
 4562e1c: 17fffcf7     	b	0x45621f8 <_ChromeMain+0x455cf5c>
 4562e20: 910103e8     	add	x8, sp, #0x40
 4562e24: 528001c0     	mov	w0, #0xe                ; =14
 4562e28: 14000003     	b	0x4562e34 <_ChromeMain+0x455db98>
 4562e2c: 910103e8     	add	x8, sp, #0x40
 4562e30: 528001e0     	mov	w0, #0xf                ; =15
 4562e34: 94d9aa6a     	bl	0x7bcd7dc <_ChromeMain+0x7bc8540>
 4562e38: 910103e0     	add	x0, sp, #0x40
 4562e3c: 95ecfb1f     	bl	0xc0a1ab8 <_ChromeMain+0xc09c81c>
 4562e40: 910103e0     	add	x0, sp, #0x40
 4562e44: 94d9aa0f     	bl	0x7bcd680 <_ChromeMain+0x7bc83e4>
 4562e48: 17fffa11     	b	0x456168c <_ChromeMain+0x455c3f0>
 4562e4c: 129142c8     	mov	w8, #-0x8a17            ; =-35351
 4562e50: 0b080288     	add	w8, w20, w8
 4562e54: 7100251f     	cmp	w8, #0x9
 4562e58: 54fffc48     	b.hi	0x4562de0 <_ChromeMain+0x455db44>
 4562e5c: f0048be9     	adrp	x9, 0xd6e1000 <dyld_stub_binder+0xd6e1000>
 4562e60: 912b4129     	add	x9, x9, #0xad0
 4562e64: 1000000a     	adr	x10, 0x4562e64 <_ChromeMain+0x455dbc8>
 4562e68: b8a8792b     	ldrsw	x11, [x9, x8, lsl #2]
 4562e6c: 8b0b014a     	add	x10, x10, x11
 4562e70: d61f0140     	br	x10
 4562e74: f9401e68     	ldr	x8, [x19, #0x38]
 4562e78: 9100a100     	add	x0, x8, #0x28
 4562e7c: 911703ff     	add	sp, sp, #0x5c0
 4562e80: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4562e84: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4562e88: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4562e8c: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4562e90: 14bb7183     	b	0x743f49c <_ChromeMain+0x743a200>
 4562e94: f9401e68     	ldr	x8, [x19, #0x38]
 4562e98: f9403500     	ldr	x0, [x8, #0x68]
 4562e9c: 972f6e3b     	bl	0x113e788 <_ChromeMain+0x11394ec>
 4562ea0: aa0003e8     	mov	x8, x0
 4562ea4: f9401e69     	ldr	x9, [x19, #0x38]
 4562ea8: f9403520     	ldr	x0, [x9, #0x68]
 4562eac: 34000928     	cbz	w8, 0x4562fd0 <_ChromeMain+0x455dd34>
 4562eb0: 52800021     	mov	w1, #0x1                ; =1
 4562eb4: 911703ff     	add	sp, sp, #0x5c0
 4562eb8: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4562ebc: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4562ec0: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4562ec4: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4562ec8: 14d154a9     	b	0x79b816c <_ChromeMain+0x79b2ed0>
 4562ecc: f9401e68     	ldr	x8, [x19, #0x38]
 4562ed0: f9403513     	ldr	x19, [x8, #0x68]
 4562ed4: aa1303e0     	mov	x0, x19
 4562ed8: 9738a2a6     	bl	0x138b970 <_ChromeMain+0x13866d4>
 4562edc: f9402c00     	ldr	x0, [x0, #0x58]
 4562ee0: 910103f4     	add	x20, sp, #0x40
 4562ee4: 910103e8     	add	x8, sp, #0x40
 4562ee8: 52800001     	mov	w1, #0x0                ; =0
 4562eec: 977127f1     	bl	0x21aceb0 <_ChromeMain+0x21a7c14>
 4562ef0: 9100c281     	add	x1, x20, #0x30
 4562ef4: aa1303e0     	mov	x0, x19
 4562ef8: 94d9a502     	bl	0x7bcc300 <_ChromeMain+0x7bc7064>
 4562efc: 39c21fe8     	ldrsb	w8, [sp, #0x87]
 4562f00: 37f8be88     	tbnz	w8, #0x1f, 0x45646d0 <_ChromeMain+0x455f434>
 4562f04: 39c1bfe8     	ldrsb	w8, [sp, #0x6f]
 4562f08: 37f8bee8     	tbnz	w8, #0x1f, 0x45646e4 <_ChromeMain+0x455f448>
 4562f0c: 1400001e     	b	0x4562f84 <_ChromeMain+0x455dce8>
 4562f10: f9401e68     	ldr	x8, [x19, #0x38]
 4562f14: 9100a109     	add	x9, x8, #0x28
 4562f18: f100011f     	cmp	x8, #0x0
 4562f1c: 9a8903f3     	csel	x19, xzr, x9, eq
 4562f20: f9404508     	ldr	x8, [x8, #0x88]
 4562f24: f9404908     	ldr	x8, [x8, #0x90]
 4562f28: b4000508     	cbz	x8, 0x4562fc8 <_ChromeMain+0x455dd2c>
 4562f2c: f9402114     	ldr	x20, [x8, #0x40]
 4562f30: 52800600     	mov	w0, #0x30               ; =48
 4562f34: 96eab10d     	bl	0xf368 <_ChromeMain+0xa0cc>
 4562f38: f90023e0     	str	x0, [sp, #0x40]
 4562f3c: b004cec8     	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 4562f40: 3dc0f900     	ldr	q0, [x8, #0x3e0]
 4562f44: 3c8483e0     	stur	q0, [sp, #0x48]
 4562f48: 91008009     	add	x9, x0, #0x20
 4562f4c: eb00013f     	cmp	x9, x0
 4562f50: 5400b783     	b.lo	0x4564640 <_ChromeMain+0x455f3a4>
 4562f54: d0044728     	adrp	x8, 0xce48000 <dyld_stub_binder+0xce48000>
 4562f58: 91252508     	add	x8, x8, #0x949
 4562f5c: eb08013f     	cmp	x9, x8
 4562f60: fa488002     	ccmp	x0, x8, #0x2, hi
 4562f64: 5400b6e9     	b.ls	0x4564640 <_ChromeMain+0x455f3a4>
 4562f68: ad400500     	ldp	q0, q1, [x8]
 4562f6c: ad000400     	stp	q0, q1, [x0]
 4562f70: 3900801f     	strb	wzr, [x0, #0x20]
 4562f74: 910103e2     	add	x2, sp, #0x40
 4562f78: aa1303e0     	mov	x0, x19
 4562f7c: aa1403e1     	mov	x1, x20
 4562f80: 97edf1ca     	bl	0x40df6a8 <_ChromeMain+0x40da40c>
 4562f84: 39c15fe8     	ldrsb	w8, [sp, #0x57]
 4562f88: 36ff3828     	tbz	w8, #0x1f, 0x456168c <_ChromeMain+0x455c3f0>
 4562f8c: f94023e0     	ldr	x0, [sp, #0x40]
 4562f90: f9402be8     	ldr	x8, [sp, #0x50]
 4562f94: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4562f98: 96ea97c8     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4562f9c: 17fff9bc     	b	0x456168c <_ChromeMain+0x455c3f0>
 4562fa0: f9401e68     	ldr	x8, [x19, #0x38]
 4562fa4: 9100a109     	add	x9, x8, #0x28
 4562fa8: f100011f     	cmp	x8, #0x0
 4562fac: 9a8903e0     	csel	x0, xzr, x9, eq
 4562fb0: 94dd249b     	bl	0x7cac21c <_ChromeMain+0x7ca6f80>
 4562fb4: a9047fff     	stp	xzr, xzr, [sp, #0x40]
 4562fb8: f9002bff     	str	xzr, [sp, #0x50]
 4562fbc: 910103e1     	add	x1, sp, #0x40
 4562fc0: 95eda665     	bl	0xc0cc954 <_ChromeMain+0xc0c76b8>
 4562fc4: 17fffff0     	b	0x4562f84 <_ChromeMain+0x455dce8>
 4562fc8: d2800014     	mov	x20, #0x0               ; =0
 4562fcc: 17ffffd9     	b	0x4562f30 <_ChromeMain+0x455dc94>
 4562fd0: 911703ff     	add	sp, sp, #0x5c0
 4562fd4: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4562fd8: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4562fdc: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4562fe0: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4562fe4: 14d59f10     	b	0x7acac24 <_ChromeMain+0x7ac5988>
 4562fe8: f9401e68     	ldr	x8, [x19, #0x38]
 4562fec: 9100a109     	add	x9, x8, #0x28
 4562ff0: f100011f     	cmp	x8, #0x0
 4562ff4: 9a8903f3     	csel	x19, xzr, x9, eq
 4562ff8: f9403500     	ldr	x0, [x8, #0x68]
 4562ffc: 910103f4     	add	x20, sp, #0x40
 4563000: 910103e8     	add	x8, sp, #0x40
 4563004: 94cc5fe7     	bl	0x787afa0 <_ChromeMain+0x7875d04>
 4563008: 910103e1     	add	x1, sp, #0x40
 456300c: aa1303e0     	mov	x0, x19
 4563010: 95f43129     	bl	0xc26f4b4 <_ChromeMain+0xc26a218>
 4563014: 9101c280     	add	x0, x20, #0x70
 4563018: d2800001     	mov	x1, #0x0                ; =0
 456301c: 96eb1327     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4563020: 91008280     	add	x0, x20, #0x20
 4563024: 96eb1315     	bl	0x27c78 <_ChromeMain+0x229dc>
 4563028: 17ffffd7     	b	0x4562f84 <_ChromeMain+0x455dce8>
 456302c: f9401e68     	ldr	x8, [x19, #0x38]
 4563030: f9403513     	ldr	x19, [x8, #0x68]
 4563034: 910103e8     	add	x8, sp, #0x40
 4563038: aa1303e0     	mov	x0, x19
 456303c: 94d9a560     	bl	0x7bcc5bc <_ChromeMain+0x7bc7320>
 4563040: 910103e1     	add	x1, sp, #0x40
 4563044: aa1303e0     	mov	x0, x19
 4563048: 52800042     	mov	w2, #0x2                ; =2
 456304c: 52800023     	mov	w3, #0x1                ; =1
 4563050: 94d69500     	bl	0x7b08450 <_ChromeMain+0x7b031b4>
 4563054: 1400000a     	b	0x456307c <_ChromeMain+0x455dde0>
 4563058: f9401e68     	ldr	x8, [x19, #0x38]
 456305c: f9403513     	ldr	x19, [x8, #0x68]
 4563060: 910103e8     	add	x8, sp, #0x40
 4563064: aa1303e0     	mov	x0, x19
 4563068: 94d9a555     	bl	0x7bcc5bc <_ChromeMain+0x7bc7320>
 456306c: 910103e1     	add	x1, sp, #0x40
 4563070: aa1303e0     	mov	x0, x19
 4563074: 52800042     	mov	w2, #0x2                ; =2
 4563078: 94d69461     	bl	0x7b081fc <_ChromeMain+0x7b02f60>
 456307c: 910103e0     	add	x0, sp, #0x40
 4563080: 973e61b1     	bl	0x14fb744 <_ChromeMain+0x14f64a8>
 4563084: 17fff982     	b	0x456168c <_ChromeMain+0x455c3f0>
 4563088: 52923cc8     	mov	w8, #0x91e6             ; =37350
 456308c: 6b08029f     	cmp	w20, w8
 4563090: 54ff6ea1     	b.ne	0x4561e64 <_ChromeMain+0x455cbc8>
 4563094: f9401e68     	ldr	x8, [x19, #0x38]
 4563098: 9100a109     	add	x9, x8, #0x28
 456309c: f100011f     	cmp	x8, #0x0
 45630a0: 9a8903e0     	csel	x0, xzr, x9, eq
 45630a4: f0044c21     	adrp	x1, 0xceea000 <dyld_stub_binder+0xceea000>
 45630a8: 9113d421     	add	x1, x1, #0x4f5
 45630ac: 528001a2     	mov	w2, #0xd                ; =13
 45630b0: 14000019     	b	0x4563114 <_ChromeMain+0x455de78>
 45630b4: f9401e68     	ldr	x8, [x19, #0x38]
 45630b8: 9100a109     	add	x9, x8, #0x28
 45630bc: f100011f     	cmp	x8, #0x0
 45630c0: 9a8903e0     	csel	x0, xzr, x9, eq
 45630c4: b0044cc1     	adrp	x1, 0xcefc000 <dyld_stub_binder+0xcefc000>
 45630c8: 9124a421     	add	x1, x1, #0x929
 45630cc: 52800122     	mov	w2, #0x9                ; =9
 45630d0: 14000011     	b	0x4563114 <_ChromeMain+0x455de78>
 45630d4: f9401e68     	ldr	x8, [x19, #0x38]
 45630d8: 9100a109     	add	x9, x8, #0x28
 45630dc: f100011f     	cmp	x8, #0x0
 45630e0: 9a8903e0     	csel	x0, xzr, x9, eq
 45630e4: 94dd244e     	bl	0x7cac21c <_ChromeMain+0x7ca6f80>
 45630e8: f0044ca1     	adrp	x1, 0xcefa000 <dyld_stub_binder+0xcefa000>
 45630ec: 91388021     	add	x1, x1, #0xe20
 45630f0: 14000008     	b	0x4563110 <_ChromeMain+0x455de74>
 45630f4: f9401e68     	ldr	x8, [x19, #0x38]
 45630f8: 9100a109     	add	x9, x8, #0x28
 45630fc: f100011f     	cmp	x8, #0x0
 4563100: 9a8903e0     	csel	x0, xzr, x9, eq
 4563104: 94dd2446     	bl	0x7cac21c <_ChromeMain+0x7ca6f80>
 4563108: b0044d21     	adrp	x1, 0xcf08000 <dyld_stub_binder+0xcf08000>
 456310c: 9128cc21     	add	x1, x1, #0xa33
 4563110: 52800162     	mov	w2, #0xb                ; =11
 4563114: 911703ff     	add	sp, sp, #0x5c0
 4563118: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 456311c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563120: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563124: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563128: 15fffc4a     	b	0xc562250 <_ChromeMain+0xc55cfb4>
 456312c: f9401e68     	ldr	x8, [x19, #0x38]
 4563130: 9100a109     	add	x9, x8, #0x28
 4563134: f100011f     	cmp	x8, #0x0
 4563138: 9a8903e0     	csel	x0, xzr, x9, eq
 456313c: 94dd2438     	bl	0x7cac21c <_ChromeMain+0x7ca6f80>
 4563140: b0044d21     	adrp	x1, 0xcf08000 <dyld_stub_binder+0xcf08000>
 4563144: 9128b021     	add	x1, x1, #0xa2c
 4563148: 528000c2     	mov	w2, #0x6                ; =6
 456314c: 17fffff2     	b	0x4563114 <_ChromeMain+0x455de78>
 4563150: f9401e68     	ldr	x8, [x19, #0x38]
 4563154: 9100a109     	add	x9, x8, #0x28
 4563158: f100011f     	cmp	x8, #0x0
 456315c: 9a8903e0     	csel	x0, xzr, x9, eq
 4563160: 528000e1     	mov	w1, #0x7                ; =7
 4563164: 911703ff     	add	sp, sp, #0x5c0
 4563168: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 456316c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563170: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563174: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563178: 14cb0afe     	b	0x7825d70 <_ChromeMain+0x7820ad4>
 456317c: f9401e68     	ldr	x8, [x19, #0x38]
 4563180: 9100a109     	add	x9, x8, #0x28
 4563184: f100011f     	cmp	x8, #0x0
 4563188: 9a8903e0     	csel	x0, xzr, x9, eq
 456318c: 52800001     	mov	w1, #0x0                ; =0
 4563190: 911703ff     	add	sp, sp, #0x5c0
 4563194: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563198: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 456319c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 45631a0: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 45631a4: 14cb0b2d     	b	0x7825e58 <_ChromeMain+0x7820bbc>
 45631a8: d004ade8     	adrp	x8, 0xdb21000 <dyld_stub_binder+0xdb21000>
 45631ac: 912cf508     	add	x8, x8, #0xb3d
 45631b0: f90023e8     	str	x8, [sp, #0x40]
 45631b4: 910103e0     	add	x0, sp, #0x40
 45631b8: 97562d6d     	bl	0x1aee76c <_ChromeMain+0x1ae94d0>
 45631bc: f9401e68     	ldr	x8, [x19, #0x38]
 45631c0: 9100a109     	add	x9, x8, #0x28
 45631c4: f100011f     	cmp	x8, #0x0
 45631c8: 9a8903e0     	csel	x0, xzr, x9, eq
 45631cc: 52800061     	mov	w1, #0x3                ; =3
 45631d0: aa1503e2     	mov	x2, x21
 45631d4: 94000d23     	bl	0x4566660 <_ChromeMain+0x45613c4>
 45631d8: 17fff92d     	b	0x456168c <_ChromeMain+0x455c3f0>
 45631dc: f9401e68     	ldr	x8, [x19, #0x38]
 45631e0: 9100a109     	add	x9, x8, #0x28
 45631e4: f100011f     	cmp	x8, #0x0
 45631e8: 9a8903e8     	csel	x8, xzr, x9, eq
 45631ec: f940bd08     	ldr	x8, [x8, #0x178]
 45631f0: f9408108     	ldr	x8, [x8, #0x100]
 45631f4: 91032100     	add	x0, x8, #0xc8
 45631f8: 52800021     	mov	w1, #0x1                ; =1
 45631fc: 911703ff     	add	sp, sp, #0x5c0
 4563200: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563204: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563208: a94157f6     	ldp	x22, x21, [sp, #0x10]
 456320c: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563210: 14be576d     	b	0x74f8fc4 <_ChromeMain+0x74f3d28>
 4563214: eb09011f     	cmp	x8, x9
 4563218: 54000380     	b.eq	0x4563288 <_ChromeMain+0x455dfec>
 456321c: f9401513     	ldr	x19, [x8, #0x28]
 4563220: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4563224: f0053269     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4563228: f9404529     	ldr	x9, [x9, #0x88]
 456322c: eb09011f     	cmp	x8, x9
 4563230: 540002e1     	b.ne	0x456328c <_ChromeMain+0x455dff0>
 4563234: aa1303e0     	mov	x0, x19
 4563238: 96eac431     	bl	0x142fc <_ChromeMain+0xf060>
 456323c: 14000014     	b	0x456328c <_ChromeMain+0x455dff0>
 4563240: f9401e68     	ldr	x8, [x19, #0x38]
 4563244: f940d108     	ldr	x8, [x8, #0x1a0]
 4563248: f941c909     	ldr	x9, [x8, #0x390]
 456324c: b400a669     	cbz	x9, 0x4564718 <_ChromeMain+0x455f47c>
 4563250: f940b128     	ldr	x8, [x9, #0x160]
 4563254: b40001a8     	cbz	x8, 0x4563288 <_ChromeMain+0x455dfec>
 4563258: 91058129     	add	x9, x9, #0x160
 456325c: d00517ca     	adrp	x10, 0xe85d000 <dyld_stub_binder+0xe85d000>
 4563260: 911f414a     	add	x10, x10, #0x7d0
 4563264: 14000003     	b	0x4563270 <_ChromeMain+0x455dfd4>
 4563268: f9400108     	ldr	x8, [x8]
 456326c: b40000e8     	cbz	x8, 0x4563288 <_ChromeMain+0x455dfec>
 4563270: f940110b     	ldr	x11, [x8, #0x20]
 4563274: eb0a017f     	cmp	x11, x10
 4563278: 54ffff88     	b.hi	0x4563268 <_ChromeMain+0x455dfcc>
 456327c: 54fffcc0     	b.eq	0x4563214 <_ChromeMain+0x455df78>
 4563280: f9400508     	ldr	x8, [x8, #0x8]
 4563284: b5ffff68     	cbnz	x8, 0x4563270 <_ChromeMain+0x455dfd4>
 4563288: d2800013     	mov	x19, #0x0               ; =0
 456328c: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4563290: f0053269     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4563294: f9404529     	ldr	x9, [x9, #0x88]
 4563298: eb09011f     	cmp	x8, x9
 456329c: 54000061     	b.ne	0x45632a8 <_ChromeMain+0x455e00c>
 45632a0: aa1303e0     	mov	x0, x19
 45632a4: 96eafde6     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45632a8: aa1303e0     	mov	x0, x19
 45632ac: 52800281     	mov	w1, #0x14               ; =20
 45632b0: 1400006d     	b	0x4563464 <_ChromeMain+0x455e1c8>
 45632b4: eb09011f     	cmp	x8, x9
 45632b8: 54000380     	b.eq	0x4563328 <_ChromeMain+0x455e08c>
 45632bc: f9401513     	ldr	x19, [x8, #0x28]
 45632c0: 925e7668     	and	x8, x19, #0xfffffffc00000000
 45632c4: f0053269     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45632c8: f9404529     	ldr	x9, [x9, #0x88]
 45632cc: eb09011f     	cmp	x8, x9
 45632d0: 540002e1     	b.ne	0x456332c <_ChromeMain+0x455e090>
 45632d4: aa1303e0     	mov	x0, x19
 45632d8: 96eac409     	bl	0x142fc <_ChromeMain+0xf060>
 45632dc: 14000014     	b	0x456332c <_ChromeMain+0x455e090>
 45632e0: f9401e68     	ldr	x8, [x19, #0x38]
 45632e4: f940d108     	ldr	x8, [x8, #0x1a0]
 45632e8: f941c909     	ldr	x9, [x8, #0x390]
 45632ec: b400a0e9     	cbz	x9, 0x4564708 <_ChromeMain+0x455f46c>
 45632f0: f940b128     	ldr	x8, [x9, #0x160]
 45632f4: b40001a8     	cbz	x8, 0x4563328 <_ChromeMain+0x455e08c>
 45632f8: 91058129     	add	x9, x9, #0x160
 45632fc: d00517ca     	adrp	x10, 0xe85d000 <dyld_stub_binder+0xe85d000>
 4563300: 911f414a     	add	x10, x10, #0x7d0
 4563304: 14000003     	b	0x4563310 <_ChromeMain+0x455e074>
 4563308: f9400108     	ldr	x8, [x8]
 456330c: b40000e8     	cbz	x8, 0x4563328 <_ChromeMain+0x455e08c>
 4563310: f940110b     	ldr	x11, [x8, #0x20]
 4563314: eb0a017f     	cmp	x11, x10
 4563318: 54ffff88     	b.hi	0x4563308 <_ChromeMain+0x455e06c>
 456331c: 54fffcc0     	b.eq	0x45632b4 <_ChromeMain+0x455e018>
 4563320: f9400508     	ldr	x8, [x8, #0x8]
 4563324: b5ffff68     	cbnz	x8, 0x4563310 <_ChromeMain+0x455e074>
 4563328: d2800013     	mov	x19, #0x0               ; =0
 456332c: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4563330: f0053269     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4563334: f9404529     	ldr	x9, [x9, #0x88]
 4563338: eb09011f     	cmp	x8, x9
 456333c: 54000061     	b.ne	0x4563348 <_ChromeMain+0x455e0ac>
 4563340: aa1303e0     	mov	x0, x19
 4563344: 96eafdbe     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4563348: aa1303e0     	mov	x0, x19
 456334c: 52800021     	mov	w1, #0x1                ; =1
 4563350: 14000045     	b	0x4563464 <_ChromeMain+0x455e1c8>
 4563354: eb09011f     	cmp	x8, x9
 4563358: 54000380     	b.eq	0x45633c8 <_ChromeMain+0x455e12c>
 456335c: f9401513     	ldr	x19, [x8, #0x28]
 4563360: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4563364: f0053269     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4563368: f9404529     	ldr	x9, [x9, #0x88]
 456336c: eb09011f     	cmp	x8, x9
 4563370: 540002e1     	b.ne	0x45633cc <_ChromeMain+0x455e130>
 4563374: aa1303e0     	mov	x0, x19
 4563378: 96eac3e1     	bl	0x142fc <_ChromeMain+0xf060>
 456337c: 14000014     	b	0x45633cc <_ChromeMain+0x455e130>
 4563380: f9401e68     	ldr	x8, [x19, #0x38]
 4563384: f940d108     	ldr	x8, [x8, #0x1a0]
 4563388: f941c909     	ldr	x9, [x8, #0x390]
 456338c: b4009ca9     	cbz	x9, 0x4564720 <_ChromeMain+0x455f484>
 4563390: f940b128     	ldr	x8, [x9, #0x160]
 4563394: b40001a8     	cbz	x8, 0x45633c8 <_ChromeMain+0x455e12c>
 4563398: 91058129     	add	x9, x9, #0x160
 456339c: d00517ca     	adrp	x10, 0xe85d000 <dyld_stub_binder+0xe85d000>
 45633a0: 911f414a     	add	x10, x10, #0x7d0
 45633a4: 14000003     	b	0x45633b0 <_ChromeMain+0x455e114>
 45633a8: f9400108     	ldr	x8, [x8]
 45633ac: b40000e8     	cbz	x8, 0x45633c8 <_ChromeMain+0x455e12c>
 45633b0: f940110b     	ldr	x11, [x8, #0x20]
 45633b4: eb0a017f     	cmp	x11, x10
 45633b8: 54ffff88     	b.hi	0x45633a8 <_ChromeMain+0x455e10c>
 45633bc: 54fffcc0     	b.eq	0x4563354 <_ChromeMain+0x455e0b8>
 45633c0: f9400508     	ldr	x8, [x8, #0x8]
 45633c4: b5ffff68     	cbnz	x8, 0x45633b0 <_ChromeMain+0x455e114>
 45633c8: d2800013     	mov	x19, #0x0               ; =0
 45633cc: 925e7668     	and	x8, x19, #0xfffffffc00000000
 45633d0: f0053269     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45633d4: f9404529     	ldr	x9, [x9, #0x88]
 45633d8: eb09011f     	cmp	x8, x9
 45633dc: 54000061     	b.ne	0x45633e8 <_ChromeMain+0x455e14c>
 45633e0: aa1303e0     	mov	x0, x19
 45633e4: 96eafd96     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45633e8: aa1303e0     	mov	x0, x19
 45633ec: 52800221     	mov	w1, #0x11               ; =17
 45633f0: 1400001d     	b	0x4563464 <_ChromeMain+0x455e1c8>
 45633f4: f9401e68     	ldr	x8, [x19, #0x38]
 45633f8: f940d108     	ldr	x8, [x8, #0x1a0]
 45633fc: f941c909     	ldr	x9, [x8, #0x390]
 4563400: b40097c9     	cbz	x9, 0x45646f8 <_ChromeMain+0x455f45c>
 4563404: f940b128     	ldr	x8, [x9, #0x160]
 4563408: b40001a8     	cbz	x8, 0x456343c <_ChromeMain+0x455e1a0>
 456340c: 91058129     	add	x9, x9, #0x160
 4563410: d00517ca     	adrp	x10, 0xe85d000 <dyld_stub_binder+0xe85d000>
 4563414: 911f414a     	add	x10, x10, #0x7d0
 4563418: 14000003     	b	0x4563424 <_ChromeMain+0x455e188>
 456341c: f9400108     	ldr	x8, [x8]
 4563420: b40000e8     	cbz	x8, 0x456343c <_ChromeMain+0x455e1a0>
 4563424: f940110b     	ldr	x11, [x8, #0x20]
 4563428: eb0a017f     	cmp	x11, x10
 456342c: 54ffff88     	b.hi	0x456341c <_ChromeMain+0x455e180>
 4563430: 540002c0     	b.eq	0x4563488 <_ChromeMain+0x455e1ec>
 4563434: f9400508     	ldr	x8, [x8, #0x8]
 4563438: b5ffff68     	cbnz	x8, 0x4563424 <_ChromeMain+0x455e188>
 456343c: d2800013     	mov	x19, #0x0               ; =0
 4563440: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4563444: f0053269     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4563448: f9404529     	ldr	x9, [x9, #0x88]
 456344c: eb09011f     	cmp	x8, x9
 4563450: 54000061     	b.ne	0x456345c <_ChromeMain+0x455e1c0>
 4563454: aa1303e0     	mov	x0, x19
 4563458: 96eafd79     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 456345c: aa1303e0     	mov	x0, x19
 4563460: 52800041     	mov	w1, #0x2                ; =2
 4563464: d28001a2     	mov	x2, #0xd                ; =13
 4563468: f2c00022     	movk	x2, #0x1, lsl #32
 456346c: 52800003     	mov	w3, #0x0                ; =0
 4563470: 911703ff     	add	sp, sp, #0x5c0
 4563474: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563478: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 456347c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563480: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563484: 14c6198f     	b	0x76e9ac0 <_ChromeMain+0x76e4824>
 4563488: eb09011f     	cmp	x8, x9
 456348c: 54fffd80     	b.eq	0x456343c <_ChromeMain+0x455e1a0>
 4563490: f9401513     	ldr	x19, [x8, #0x28]
 4563494: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4563498: f0053269     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 456349c: f9404529     	ldr	x9, [x9, #0x88]
 45634a0: eb09011f     	cmp	x8, x9
 45634a4: 54fffce1     	b.ne	0x4563440 <_ChromeMain+0x455e1a4>
 45634a8: aa1303e0     	mov	x0, x19
 45634ac: 96eac394     	bl	0x142fc <_ChromeMain+0xf060>
 45634b0: 17ffffe4     	b	0x4563440 <_ChromeMain+0x455e1a4>
 45634b4: f9401e68     	ldr	x8, [x19, #0x38]
 45634b8: f940d108     	ldr	x8, [x8, #0x1a0]
 45634bc: f941c909     	ldr	x9, [x8, #0x390]
 45634c0: b4009289     	cbz	x9, 0x4564710 <_ChromeMain+0x455f474>
 45634c4: f940b128     	ldr	x8, [x9, #0x160]
 45634c8: b40001a8     	cbz	x8, 0x45634fc <_ChromeMain+0x455e260>
 45634cc: 91058129     	add	x9, x9, #0x160
 45634d0: d00517ca     	adrp	x10, 0xe85d000 <dyld_stub_binder+0xe85d000>
 45634d4: 911f414a     	add	x10, x10, #0x7d0
 45634d8: 14000003     	b	0x45634e4 <_ChromeMain+0x455e248>
 45634dc: f9400108     	ldr	x8, [x8]
 45634e0: b40000e8     	cbz	x8, 0x45634fc <_ChromeMain+0x455e260>
 45634e4: f940110b     	ldr	x11, [x8, #0x20]
 45634e8: eb0a017f     	cmp	x11, x10
 45634ec: 54ffff88     	b.hi	0x45634dc <_ChromeMain+0x455e240>
 45634f0: 540001c0     	b.eq	0x4563528 <_ChromeMain+0x455e28c>
 45634f4: f9400508     	ldr	x8, [x8, #0x8]
 45634f8: b5ffff68     	cbnz	x8, 0x45634e4 <_ChromeMain+0x455e248>
 45634fc: d2800013     	mov	x19, #0x0               ; =0
 4563500: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4563504: f0053269     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4563508: f9404529     	ldr	x9, [x9, #0x88]
 456350c: eb09011f     	cmp	x8, x9
 4563510: 54000061     	b.ne	0x456351c <_ChromeMain+0x455e280>
 4563514: aa1303e0     	mov	x0, x19
 4563518: 96eafd49     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 456351c: aa1303e0     	mov	x0, x19
 4563520: 52800001     	mov	w1, #0x0                ; =0
 4563524: 17ffffd0     	b	0x4563464 <_ChromeMain+0x455e1c8>
 4563528: eb09011f     	cmp	x8, x9
 456352c: 54fffe80     	b.eq	0x45634fc <_ChromeMain+0x455e260>
 4563530: f9401513     	ldr	x19, [x8, #0x28]
 4563534: 925e7668     	and	x8, x19, #0xfffffffc00000000
 4563538: f0053269     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 456353c: f9404529     	ldr	x9, [x9, #0x88]
 4563540: eb09011f     	cmp	x8, x9
 4563544: 54fffde1     	b.ne	0x4563500 <_ChromeMain+0x455e264>
 4563548: aa1303e0     	mov	x0, x19
 456354c: 96eac36c     	bl	0x142fc <_ChromeMain+0xf060>
 4563550: 17ffffec     	b	0x4563500 <_ChromeMain+0x455e264>
 4563554: eb09011f     	cmp	x8, x9
 4563558: 54000380     	b.eq	0x45635c8 <_ChromeMain+0x455e32c>
 456355c: f9401514     	ldr	x20, [x8, #0x28]
 4563560: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4563564: f0053269     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4563568: f9404529     	ldr	x9, [x9, #0x88]
 456356c: eb09011f     	cmp	x8, x9
 4563570: 540002e1     	b.ne	0x45635cc <_ChromeMain+0x455e330>
 4563574: aa1403e0     	mov	x0, x20
 4563578: 96eac361     	bl	0x142fc <_ChromeMain+0xf060>
 456357c: 14000014     	b	0x45635cc <_ChromeMain+0x455e330>
 4563580: f9401e68     	ldr	x8, [x19, #0x38]
 4563584: 9100a109     	add	x9, x8, #0x28
 4563588: f100011f     	cmp	x8, #0x0
 456358c: 9a8903e9     	csel	x9, xzr, x9, eq
 4563590: f940b128     	ldr	x8, [x9, #0x160]
 4563594: d0051995     	adrp	x21, 0xe895000 <dyld_stub_binder+0xe895000>
 4563598: 911ec2b5     	add	x21, x21, #0x7b0
 456359c: b4000168     	cbz	x8, 0x45635c8 <_ChromeMain+0x455e32c>
 45635a0: 91058129     	add	x9, x9, #0x160
 45635a4: 14000003     	b	0x45635b0 <_ChromeMain+0x455e314>
 45635a8: f9400108     	ldr	x8, [x8]
 45635ac: b40000e8     	cbz	x8, 0x45635c8 <_ChromeMain+0x455e32c>
 45635b0: f940110a     	ldr	x10, [x8, #0x20]
 45635b4: eb15015f     	cmp	x10, x21
 45635b8: 54ffff88     	b.hi	0x45635a8 <_ChromeMain+0x455e30c>
 45635bc: 54fffcc0     	b.eq	0x4563554 <_ChromeMain+0x455e2b8>
 45635c0: f9400508     	ldr	x8, [x8, #0x8]
 45635c4: b5ffff68     	cbnz	x8, 0x45635b0 <_ChromeMain+0x455e314>
 45635c8: d2800014     	mov	x20, #0x0               ; =0
 45635cc: 925e7688     	and	x8, x20, #0xfffffffc00000000
 45635d0: f0053276     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45635d4: f94046c9     	ldr	x9, [x22, #0x88]
 45635d8: eb09011f     	cmp	x8, x9
 45635dc: 54000061     	b.ne	0x45635e8 <_ChromeMain+0x455e34c>
 45635e0: aa1403e0     	mov	x0, x20
 45635e4: 96eafd16     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45635e8: b4008a14     	cbz	x20, 0x4564728 <_ChromeMain+0x455f48c>
 45635ec: f9401e68     	ldr	x8, [x19, #0x38]
 45635f0: 9100a109     	add	x9, x8, #0x28
 45635f4: f100011f     	cmp	x8, #0x0
 45635f8: 9a8903f3     	csel	x19, xzr, x9, eq
 45635fc: f940b268     	ldr	x8, [x19, #0x160]
 4563600: b4000168     	cbz	x8, 0x456362c <_ChromeMain+0x455e390>
 4563604: 91058269     	add	x9, x19, #0x160
 4563608: 14000003     	b	0x4563614 <_ChromeMain+0x455e378>
 456360c: f9400108     	ldr	x8, [x8]
 4563610: b40000e8     	cbz	x8, 0x456362c <_ChromeMain+0x455e390>
 4563614: f940110a     	ldr	x10, [x8, #0x20]
 4563618: eb15015f     	cmp	x10, x21
 456361c: 54ffff88     	b.hi	0x456360c <_ChromeMain+0x455e370>
 4563620: 54000280     	b.eq	0x4563670 <_ChromeMain+0x455e3d4>
 4563624: f9400508     	ldr	x8, [x8, #0x8]
 4563628: b5ffff68     	cbnz	x8, 0x4563614 <_ChromeMain+0x455e378>
 456362c: d2800014     	mov	x20, #0x0               ; =0
 4563630: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4563634: f94046c9     	ldr	x9, [x22, #0x88]
 4563638: eb09011f     	cmp	x8, x9
 456363c: 54000061     	b.ne	0x4563648 <_ChromeMain+0x455e3ac>
 4563640: aa1403e0     	mov	x0, x20
 4563644: 96eafcfe     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4563648: f9402261     	ldr	x1, [x19, #0x40]
 456364c: 91016282     	add	x2, x20, #0x58
 4563650: aa1303e0     	mov	x0, x19
 4563654: 52800043     	mov	w3, #0x2                ; =2
 4563658: 911703ff     	add	sp, sp, #0x5c0
 456365c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563660: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563664: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563668: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 456366c: 15f43108     	b	0xc26fa8c <_ChromeMain+0xc26a7f0>
 4563670: eb09011f     	cmp	x8, x9
 4563674: 54fffdc0     	b.eq	0x456362c <_ChromeMain+0x455e390>
 4563678: f9401514     	ldr	x20, [x8, #0x28]
 456367c: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4563680: f94046c9     	ldr	x9, [x22, #0x88]
 4563684: eb09011f     	cmp	x8, x9
 4563688: 54fffd41     	b.ne	0x4563630 <_ChromeMain+0x455e394>
 456368c: aa1403e0     	mov	x0, x20
 4563690: 96eac31b     	bl	0x142fc <_ChromeMain+0xf060>
 4563694: 17ffffe7     	b	0x4563630 <_ChromeMain+0x455e394>
 4563698: f9401e68     	ldr	x8, [x19, #0x38]
 456369c: 9100a109     	add	x9, x8, #0x28
 45636a0: f100011f     	cmp	x8, #0x0
 45636a4: 9a8903e0     	csel	x0, xzr, x9, eq
 45636a8: 52800041     	mov	w1, #0x2                ; =2
 45636ac: 14000012     	b	0x45636f4 <_ChromeMain+0x455e458>
 45636b0: f9401e68     	ldr	x8, [x19, #0x38]
 45636b4: 9100a109     	add	x9, x8, #0x28
 45636b8: f100011f     	cmp	x8, #0x0
 45636bc: 9a8903e0     	csel	x0, xzr, x9, eq
 45636c0: 52800081     	mov	w1, #0x4                ; =4
 45636c4: 1400000c     	b	0x45636f4 <_ChromeMain+0x455e458>
 45636c8: f9401e68     	ldr	x8, [x19, #0x38]
 45636cc: 9100a109     	add	x9, x8, #0x28
 45636d0: f100011f     	cmp	x8, #0x0
 45636d4: 9a8903e0     	csel	x0, xzr, x9, eq
 45636d8: 52800061     	mov	w1, #0x3                ; =3
 45636dc: 14000006     	b	0x45636f4 <_ChromeMain+0x455e458>
 45636e0: f9401e68     	ldr	x8, [x19, #0x38]
 45636e4: 9100a109     	add	x9, x8, #0x28
 45636e8: f100011f     	cmp	x8, #0x0
 45636ec: 9a8903e0     	csel	x0, xzr, x9, eq
 45636f0: 52800001     	mov	w1, #0x0                ; =0
 45636f4: 911703ff     	add	sp, sp, #0x5c0
 45636f8: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 45636fc: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563700: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563704: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563708: 15fffcfe     	b	0xc562b00 <_ChromeMain+0xc55d864>
 456370c: f9401e68     	ldr	x8, [x19, #0x38]
 4563710: 9100a109     	add	x9, x8, #0x28
 4563714: f100011f     	cmp	x8, #0x0
 4563718: 9a8903e0     	csel	x0, xzr, x9, eq
 456371c: 52800021     	mov	w1, #0x1                ; =1
 4563720: 17fffff5     	b	0x45636f4 <_ChromeMain+0x455e458>
 4563724: f9401e68     	ldr	x8, [x19, #0x38]
 4563728: f9403500     	ldr	x0, [x8, #0x68]
 456372c: 972f6c17     	bl	0x113e788 <_ChromeMain+0x11394ec>
 4563730: aa0003f5     	mov	x21, x0
 4563734: f9401e68     	ldr	x8, [x19, #0x38]
 4563738: 9100a109     	add	x9, x8, #0x28
 456373c: f100011f     	cmp	x8, #0x0
 4563740: 9a8903e0     	csel	x0, xzr, x9, eq
 4563744: 94dd22b6     	bl	0x7cac21c <_ChromeMain+0x7ca6f80>
 4563748: aa0003f4     	mov	x20, x0
 456374c: 35000095     	cbnz	w21, 0x456375c <_ChromeMain+0x455e4c0>
 4563750: aa1403e0     	mov	x0, x20
 4563754: 95fffcee     	bl	0xc562b0c <_ChromeMain+0xc55d870>
 4563758: 14000008     	b	0x4563778 <_ChromeMain+0x455e4dc>
 456375c: b4007ed4     	cbz	x20, 0x4564734 <_ChromeMain+0x455f498>
 4563760: aa1403e0     	mov	x0, x20
 4563764: 97088c3d     	bl	0x786858 <_ChromeMain+0x7815bc>
 4563768: b40073a0     	cbz	x0, 0x45645dc <_ChromeMain+0x455f340>
 456376c: f9400008     	ldr	x8, [x0]
 4563770: f9416d08     	ldr	x8, [x8, #0x2d8]
 4563774: d63f0100     	blr	x8
 4563778: f9401e68     	ldr	x8, [x19, #0x38]
 456377c: 9100a109     	add	x9, x8, #0x28
 4563780: f100011f     	cmp	x8, #0x0
 4563784: 9a8903e9     	csel	x9, xzr, x9, eq
 4563788: f940b128     	ldr	x8, [x9, #0x160]
 456378c: b4000308     	cbz	x8, 0x45637ec <_ChromeMain+0x455e550>
 4563790: 91058129     	add	x9, x9, #0x160
 4563794: d005184a     	adrp	x10, 0xe86d000 <dyld_stub_binder+0xe86d000>
 4563798: 9138c14a     	add	x10, x10, #0xe30
 456379c: 1400000e     	b	0x45637d4 <_ChromeMain+0x455e538>
 45637a0: eb09011f     	cmp	x8, x9
 45637a4: 54000240     	b.eq	0x45637ec <_ChromeMain+0x455e550>
 45637a8: f9401513     	ldr	x19, [x8, #0x28]
 45637ac: 925e7668     	and	x8, x19, #0xfffffffc00000000
 45637b0: f0053269     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45637b4: f9404529     	ldr	x9, [x9, #0x88]
 45637b8: eb09011f     	cmp	x8, x9
 45637bc: 540001a1     	b.ne	0x45637f0 <_ChromeMain+0x455e554>
 45637c0: aa1303e0     	mov	x0, x19
 45637c4: 96eac2ce     	bl	0x142fc <_ChromeMain+0xf060>
 45637c8: 1400000a     	b	0x45637f0 <_ChromeMain+0x455e554>
 45637cc: f9400108     	ldr	x8, [x8]
 45637d0: b40000e8     	cbz	x8, 0x45637ec <_ChromeMain+0x455e550>
 45637d4: f940110b     	ldr	x11, [x8, #0x20]
 45637d8: eb0a017f     	cmp	x11, x10
 45637dc: 54ffff88     	b.hi	0x45637cc <_ChromeMain+0x455e530>
 45637e0: 54fffe00     	b.eq	0x45637a0 <_ChromeMain+0x455e504>
 45637e4: f9400508     	ldr	x8, [x8, #0x8]
 45637e8: b5ffff68     	cbnz	x8, 0x45637d4 <_ChromeMain+0x455e538>
 45637ec: d2800013     	mov	x19, #0x0               ; =0
 45637f0: 925e7668     	and	x8, x19, #0xfffffffc00000000
 45637f4: f0053269     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45637f8: f9404529     	ldr	x9, [x9, #0x88]
 45637fc: eb09011f     	cmp	x8, x9
 4563800: 54000061     	b.ne	0x456380c <_ChromeMain+0x455e570>
 4563804: aa1303e0     	mov	x0, x19
 4563808: 96eafc8d     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 456380c: f9400268     	ldr	x8, [x19]
 4563810: f9401508     	ldr	x8, [x8, #0x28]
 4563814: aa1303e0     	mov	x0, x19
 4563818: d63f0100     	blr	x8
 456381c: aa0003f3     	mov	x19, x0
 4563820: 974cac0c     	bl	0x188e850 <_ChromeMain+0x18895b4>
 4563824: 90052b81     	adrp	x1, 0xead3000 <dyld_stub_binder+0xead3000>
 4563828: 91022021     	add	x1, x1, #0x88
 456382c: aa1303e2     	mov	x2, x19
 4563830: 952bd726     	bl	0x90594c8 <_ChromeMain+0x905422c>
 4563834: b4fef2c0     	cbz	x0, 0x456168c <_ChromeMain+0x455c3f0>
 4563838: aa0003f3     	mov	x19, x0
 456383c: 974cac05     	bl	0x188e850 <_ChromeMain+0x18895b4>
 4563840: b0051a22     	adrp	x2, 0xe8a8000 <dyld_stub_binder+0xe8a8000>
 4563844: 91202042     	add	x2, x2, #0x808
 4563848: aa1303e1     	mov	x1, x19
 456384c: 911703ff     	add	sp, sp, #0x5c0
 4563850: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563854: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563858: a94157f6     	ldp	x22, x21, [sp, #0x10]
 456385c: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563860: 17a009f1     	b	0x2d66024 <_ChromeMain+0x2d60d88>
 4563864: f9401e68     	ldr	x8, [x19, #0x38]
 4563868: f9403500     	ldr	x0, [x8, #0x68]
 456386c: 911703ff     	add	sp, sp, #0x5c0
 4563870: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563874: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563878: a94157f6     	ldp	x22, x21, [sp, #0x10]
 456387c: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563880: 15fffcea     	b	0xc562c28 <_ChromeMain+0xc55d98c>
 4563884: d28001a8     	mov	x8, #0xd                ; =13
 4563888: f2c00028     	movk	x8, #0x1, lsl #32
 456388c: d1002102     	sub	x2, x8, #0x8
 4563890: aa1303e0     	mov	x0, x19
 4563894: 528001a1     	mov	w1, #0xd                ; =13
 4563898: 14000004     	b	0x45638a8 <_ChromeMain+0x455e60c>
 456389c: aa1303e0     	mov	x0, x19
 45638a0: 528001a1     	mov	w1, #0xd                ; =13
 45638a4: b20003e2     	mov	x2, #0x100000001        ; =4294967297
 45638a8: 911703ff     	add	sp, sp, #0x5c0
 45638ac: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 45638b0: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 45638b4: a94157f6     	ldp	x22, x21, [sp, #0x10]
 45638b8: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 45638bc: 15f42a90     	b	0xc26e2fc <_ChromeMain+0xc269060>
 45638c0: f9401e68     	ldr	x8, [x19, #0x38]
 45638c4: 9100a109     	add	x9, x8, #0x28
 45638c8: f100011f     	cmp	x8, #0x0
 45638cc: 9a8903e0     	csel	x0, xzr, x9, eq
 45638d0: f9402001     	ldr	x1, [x0, #0x40]
 45638d4: 52800022     	mov	w2, #0x1                ; =1
 45638d8: 14000007     	b	0x45638f4 <_ChromeMain+0x455e658>
 45638dc: f9401e68     	ldr	x8, [x19, #0x38]
 45638e0: 9100a109     	add	x9, x8, #0x28
 45638e4: f100011f     	cmp	x8, #0x0
 45638e8: 9a8903e0     	csel	x0, xzr, x9, eq
 45638ec: f9402001     	ldr	x1, [x0, #0x40]
 45638f0: 52800002     	mov	w2, #0x0                ; =0
 45638f4: 911703ff     	add	sp, sp, #0x5c0
 45638f8: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 45638fc: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563900: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563904: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563908: 15fffcf8     	b	0xc562ce8 <_ChromeMain+0xc55da4c>
 456390c: f9401e68     	ldr	x8, [x19, #0x38]
 4563910: 9100a109     	add	x9, x8, #0x28
 4563914: f100011f     	cmp	x8, #0x0
 4563918: 9a8903e0     	csel	x0, xzr, x9, eq
 456391c: 52800028     	mov	w8, #0x1                ; =1
 4563920: b90023e8     	str	w8, [sp, #0x20]
 4563924: 910083f3     	add	x19, sp, #0x20
 4563928: f90017ff     	str	xzr, [sp, #0x28]
 456392c: 910083e1     	add	x1, sp, #0x20
 4563930: 52800042     	mov	w2, #0x2                ; =2
 4563934: 14000015     	b	0x4563988 <_ChromeMain+0x455e6ec>
 4563938: f9401e68     	ldr	x8, [x19, #0x38]
 456393c: 9100a109     	add	x9, x8, #0x28
 4563940: f100011f     	cmp	x8, #0x0
 4563944: 9a8903e0     	csel	x0, xzr, x9, eq
 4563948: 52800088     	mov	w8, #0x4                ; =4
 456394c: b90013e8     	str	w8, [sp, #0x10]
 4563950: 910043f3     	add	x19, sp, #0x10
 4563954: f9000fff     	str	xzr, [sp, #0x18]
 4563958: 910043e1     	add	x1, sp, #0x10
 456395c: 52800082     	mov	w2, #0x4                ; =4
 4563960: 1400000a     	b	0x4563988 <_ChromeMain+0x455e6ec>
 4563964: f9401e68     	ldr	x8, [x19, #0x38]
 4563968: 9100a109     	add	x9, x8, #0x28
 456396c: f100011f     	cmp	x8, #0x0
 4563970: 9a8903e0     	csel	x0, xzr, x9, eq
 4563974: b90033ff     	str	wzr, [sp, #0x30]
 4563978: 9100c3f3     	add	x19, sp, #0x30
 456397c: f9001fff     	str	xzr, [sp, #0x38]
 4563980: 9100c3e1     	add	x1, sp, #0x30
 4563984: 52800022     	mov	w2, #0x1                ; =1
 4563988: 95fffcdb     	bl	0xc562cf4 <_ChromeMain+0xc55da58>
 456398c: 91002260     	add	x0, x19, #0x8
 4563990: d2800001     	mov	x1, #0x0                ; =0
 4563994: 95ffcb89     	bl	0xc5567b8 <_ChromeMain+0xc55151c>
 4563998: 17fff73d     	b	0x456168c <_ChromeMain+0x455c3f0>
 456399c: f9401e68     	ldr	x8, [x19, #0x38]
 45639a0: 9100a109     	add	x9, x8, #0x28
 45639a4: f100011f     	cmp	x8, #0x0
 45639a8: 9a8903e0     	csel	x0, xzr, x9, eq
 45639ac: 528000a8     	mov	w8, #0x5                ; =5
 45639b0: b90003e8     	str	w8, [sp]
 45639b4: 910003f3     	mov	x19, sp
 45639b8: f90007ff     	str	xzr, [sp, #0x8]
 45639bc: 910003e1     	mov	x1, sp
 45639c0: 528000a2     	mov	w2, #0x5                ; =5
 45639c4: 17fffff1     	b	0x4563988 <_ChromeMain+0x455e6ec>
 45639c8: 911703ff     	add	sp, sp, #0x5c0
 45639cc: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 45639d0: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 45639d4: a94157f6     	ldp	x22, x21, [sp, #0x10]
 45639d8: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 45639dc: 15fffcc9     	b	0xc562d00 <_ChromeMain+0xc55da64>
 45639e0: 911703ff     	add	sp, sp, #0x5c0
 45639e4: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 45639e8: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 45639ec: a94157f6     	ldp	x22, x21, [sp, #0x10]
 45639f0: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 45639f4: 14552133     	b	0x5aabec0 <_ChromeMain+0x5aa6c24>
 45639f8: d004ade8     	adrp	x8, 0xdb21000 <dyld_stub_binder+0xdb21000>
 45639fc: 912bed08     	add	x8, x8, #0xafb
 4563a00: f90023e8     	str	x8, [sp, #0x40]
 4563a04: 910103e0     	add	x0, sp, #0x40
 4563a08: 97562b59     	bl	0x1aee76c <_ChromeMain+0x1ae94d0>
 4563a0c: f9401e68     	ldr	x8, [x19, #0x38]
 4563a10: 9100a109     	add	x9, x8, #0x28
 4563a14: f100011f     	cmp	x8, #0x0
 4563a18: 9a8903e0     	csel	x0, xzr, x9, eq
 4563a1c: 52800061     	mov	w1, #0x3                ; =3
 4563a20: aa1503e2     	mov	x2, x21
 4563a24: 95fffcba     	bl	0xc562d0c <_ChromeMain+0xc55da70>
 4563a28: 17fff719     	b	0x456168c <_ChromeMain+0x455c3f0>
 4563a2c: f9401e68     	ldr	x8, [x19, #0x38]
 4563a30: 9100a109     	add	x9, x8, #0x28
 4563a34: f100011f     	cmp	x8, #0x0
 4563a38: 9a8903e0     	csel	x0, xzr, x9, eq
 4563a3c: 95fffcb7     	bl	0xc562d18 <_ChromeMain+0xc55da7c>
 4563a40: 34fffdc0     	cbz	w0, 0x45639f8 <_ChromeMain+0x455e75c>
 4563a44: d004ade8     	adrp	x8, 0xdb21000 <dyld_stub_binder+0xdb21000>
 4563a48: 912ca108     	add	x8, x8, #0xb28
 4563a4c: 14000009     	b	0x4563a70 <_ChromeMain+0x455e7d4>
 4563a50: f9401e68     	ldr	x8, [x19, #0x38]
 4563a54: 9100a109     	add	x9, x8, #0x28
 4563a58: f100011f     	cmp	x8, #0x0
 4563a5c: 9a8903e0     	csel	x0, xzr, x9, eq
 4563a60: 95fffcae     	bl	0xc562d18 <_ChromeMain+0xc55da7c>
 4563a64: 340001c0     	cbz	w0, 0x4563a9c <_ChromeMain+0x455e800>
 4563a68: d004ade8     	adrp	x8, 0xdb21000 <dyld_stub_binder+0xdb21000>
 4563a6c: 912c4d08     	add	x8, x8, #0xb13
 4563a70: f90023e8     	str	x8, [sp, #0x40]
 4563a74: 910103e0     	add	x0, sp, #0x40
 4563a78: 97562b3d     	bl	0x1aee76c <_ChromeMain+0x1ae94d0>
 4563a7c: f9401e68     	ldr	x8, [x19, #0x38]
 4563a80: 9100a109     	add	x9, x8, #0x28
 4563a84: f100011f     	cmp	x8, #0x0
 4563a88: 9a8903e0     	csel	x0, xzr, x9, eq
 4563a8c: 52800061     	mov	w1, #0x3                ; =3
 4563a90: aa1503e2     	mov	x2, x21
 4563a94: 9400091f     	bl	0x4565f10 <_ChromeMain+0x4560c74>
 4563a98: 17fff6fd     	b	0x456168c <_ChromeMain+0x455c3f0>
 4563a9c: d004ade8     	adrp	x8, 0xdb21000 <dyld_stub_binder+0xdb21000>
 4563aa0: 912b9d08     	add	x8, x8, #0xae7
 4563aa4: f90023e8     	str	x8, [sp, #0x40]
 4563aa8: 910103e0     	add	x0, sp, #0x40
 4563aac: 97562b30     	bl	0x1aee76c <_ChromeMain+0x1ae94d0>
 4563ab0: f9401e68     	ldr	x8, [x19, #0x38]
 4563ab4: 9100a109     	add	x9, x8, #0x28
 4563ab8: f100011f     	cmp	x8, #0x0
 4563abc: 9a8903e0     	csel	x0, xzr, x9, eq
 4563ac0: 52800061     	mov	w1, #0x3                ; =3
 4563ac4: aa1503e2     	mov	x2, x21
 4563ac8: 95fffc97     	bl	0xc562d24 <_ChromeMain+0xc55da88>
 4563acc: 17fff6f0     	b	0x456168c <_ChromeMain+0x455c3f0>
 4563ad0: f9401e68     	ldr	x8, [x19, #0x38]
 4563ad4: 9100a109     	add	x9, x8, #0x28
 4563ad8: f100011f     	cmp	x8, #0x0
 4563adc: 9a8903e0     	csel	x0, xzr, x9, eq
 4563ae0: b0047761     	adrp	x1, 0xd450000 <dyld_stub_binder+0xd450000>
 4563ae4: 910ef421     	add	x1, x1, #0x3bd
 4563ae8: 52800182     	mov	w2, #0xc                ; =12
 4563aec: 911703ff     	add	sp, sp, #0x5c0
 4563af0: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563af4: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563af8: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563afc: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563b00: 15fffc8c     	b	0xc562d30 <_ChromeMain+0xc55da94>
 4563b04: f9401e60     	ldr	x0, [x19, #0x38]
 4563b08: 911703ff     	add	sp, sp, #0x5c0
 4563b0c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563b10: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563b14: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563b18: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563b1c: 15fffc88     	b	0xc562d3c <_ChromeMain+0xc55daa0>
 4563b20: f9401e68     	ldr	x8, [x19, #0x38]
 4563b24: 9100a109     	add	x9, x8, #0x28
 4563b28: f100011f     	cmp	x8, #0x0
 4563b2c: 9a8903e0     	csel	x0, xzr, x9, eq
 4563b30: 95fffc86     	bl	0xc562d48 <_ChromeMain+0xc55daac>
 4563b34: f9401e68     	ldr	x8, [x19, #0x38]
 4563b38: 9100a109     	add	x9, x8, #0x28
 4563b3c: f100011f     	cmp	x8, #0x0
 4563b40: 9a8903e0     	csel	x0, xzr, x9, eq
 4563b44: aa1603e1     	mov	x1, x22
 4563b48: 911703ff     	add	sp, sp, #0x5c0
 4563b4c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563b50: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563b54: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563b58: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563b5c: 15fffc7e     	b	0xc562d54 <_ChromeMain+0xc55dab8>
 4563b60: d004ade8     	adrp	x8, 0xdb21000 <dyld_stub_binder+0xdb21000>
 4563b64: 912f6d08     	add	x8, x8, #0xbdb
 4563b68: f90023e8     	str	x8, [sp, #0x40]
 4563b6c: 910103e0     	add	x0, sp, #0x40
 4563b70: 97562aff     	bl	0x1aee76c <_ChromeMain+0x1ae94d0>
 4563b74: f9401e60     	ldr	x0, [x19, #0x38]
 4563b78: 94ea17f1     	bl	0x7fe9b3c <_ChromeMain+0x7fe48a0>
 4563b7c: 17fff6c4     	b	0x456168c <_ChromeMain+0x455c3f0>
 4563b80: f9401e68     	ldr	x8, [x19, #0x38]
 4563b84: 9100a109     	add	x9, x8, #0x28
 4563b88: f100011f     	cmp	x8, #0x0
 4563b8c: 9a8903e0     	csel	x0, xzr, x9, eq
 4563b90: 911703ff     	add	sp, sp, #0x5c0
 4563b94: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563b98: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563b9c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563ba0: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563ba4: 15fffcfc     	b	0xc562f94 <_ChromeMain+0xc55dcf8>
 4563ba8: f9401e68     	ldr	x8, [x19, #0x38]
 4563bac: 9100a109     	add	x9, x8, #0x28
 4563bb0: f100011f     	cmp	x8, #0x0
 4563bb4: 9a8903e0     	csel	x0, xzr, x9, eq
 4563bb8: 911703ff     	add	sp, sp, #0x5c0
 4563bbc: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563bc0: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563bc4: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563bc8: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563bcc: 15fffcf5     	b	0xc562fa0 <_ChromeMain+0xc55dd04>
 4563bd0: f9401e68     	ldr	x8, [x19, #0x38]
 4563bd4: 9100a109     	add	x9, x8, #0x28
 4563bd8: f100011f     	cmp	x8, #0x0
 4563bdc: 9a8903e0     	csel	x0, xzr, x9, eq
 4563be0: 911703ff     	add	sp, sp, #0x5c0
 4563be4: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563be8: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563bec: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563bf0: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563bf4: 15fffcee     	b	0xc562fac <_ChromeMain+0xc55dd10>
 4563bf8: f9401e68     	ldr	x8, [x19, #0x38]
 4563bfc: 9100a109     	add	x9, x8, #0x28
 4563c00: f100011f     	cmp	x8, #0x0
 4563c04: 9a8903e0     	csel	x0, xzr, x9, eq
 4563c08: 911703ff     	add	sp, sp, #0x5c0
 4563c0c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563c10: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563c14: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563c18: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563c1c: 15fffce7     	b	0xc562fb8 <_ChromeMain+0xc55dd1c>
 4563c20: f9401e68     	ldr	x8, [x19, #0x38]
 4563c24: 9100a109     	add	x9, x8, #0x28
 4563c28: f100011f     	cmp	x8, #0x0
 4563c2c: 9a8903e0     	csel	x0, xzr, x9, eq
 4563c30: 911703ff     	add	sp, sp, #0x5c0
 4563c34: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563c38: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563c3c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563c40: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563c44: 15fffcff     	b	0xc563040 <_ChromeMain+0xc55dda4>
 4563c48: f9401e68     	ldr	x8, [x19, #0x38]
 4563c4c: 9100a109     	add	x9, x8, #0x28
 4563c50: f100011f     	cmp	x8, #0x0
 4563c54: 9a8903e0     	csel	x0, xzr, x9, eq
 4563c58: 911703ff     	add	sp, sp, #0x5c0
 4563c5c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563c60: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563c64: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563c68: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563c6c: 15fffcf8     	b	0xc56304c <_ChromeMain+0xc55ddb0>
 4563c70: f9401e68     	ldr	x8, [x19, #0x38]
 4563c74: 9100a109     	add	x9, x8, #0x28
 4563c78: f100011f     	cmp	x8, #0x0
 4563c7c: 9a8903e0     	csel	x0, xzr, x9, eq
 4563c80: 911703ff     	add	sp, sp, #0x5c0
 4563c84: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563c88: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563c8c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563c90: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563c94: 15fffcf1     	b	0xc563058 <_ChromeMain+0xc55ddbc>
 4563c98: f9401e68     	ldr	x8, [x19, #0x38]
 4563c9c: 9100a109     	add	x9, x8, #0x28
 4563ca0: f100011f     	cmp	x8, #0x0
 4563ca4: 9a8903e0     	csel	x0, xzr, x9, eq
 4563ca8: 911703ff     	add	sp, sp, #0x5c0
 4563cac: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563cb0: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563cb4: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563cb8: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563cbc: 15fffcea     	b	0xc563064 <_ChromeMain+0xc55ddc8>
 4563cc0: f9401e68     	ldr	x8, [x19, #0x38]
 4563cc4: 9100a109     	add	x9, x8, #0x28
 4563cc8: f100011f     	cmp	x8, #0x0
 4563ccc: 9a8903e0     	csel	x0, xzr, x9, eq
 4563cd0: 911703ff     	add	sp, sp, #0x5c0
 4563cd4: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563cd8: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563cdc: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563ce0: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563ce4: 15fffce3     	b	0xc563070 <_ChromeMain+0xc55ddd4>
 4563ce8: f9401e68     	ldr	x8, [x19, #0x38]
 4563cec: 9100a109     	add	x9, x8, #0x28
 4563cf0: f100011f     	cmp	x8, #0x0
 4563cf4: 9a8903e0     	csel	x0, xzr, x9, eq
 4563cf8: 911703ff     	add	sp, sp, #0x5c0
 4563cfc: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563d00: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563d04: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563d08: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563d0c: 15fffcdc     	b	0xc56307c <_ChromeMain+0xc55dde0>
 4563d10: f9401e68     	ldr	x8, [x19, #0x38]
 4563d14: 9100a109     	add	x9, x8, #0x28
 4563d18: f100011f     	cmp	x8, #0x0
 4563d1c: 9a8903e0     	csel	x0, xzr, x9, eq
 4563d20: 911703ff     	add	sp, sp, #0x5c0
 4563d24: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563d28: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563d2c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563d30: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563d34: 15fffcd5     	b	0xc563088 <_ChromeMain+0xc55ddec>
 4563d38: f9401e68     	ldr	x8, [x19, #0x38]
 4563d3c: 9100a109     	add	x9, x8, #0x28
 4563d40: f100011f     	cmp	x8, #0x0
 4563d44: 9a8903e0     	csel	x0, xzr, x9, eq
 4563d48: 911703ff     	add	sp, sp, #0x5c0
 4563d4c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563d50: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563d54: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563d58: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563d5c: 15fffcce     	b	0xc563094 <_ChromeMain+0xc55ddf8>
 4563d60: f9401e68     	ldr	x8, [x19, #0x38]
 4563d64: 9100a109     	add	x9, x8, #0x28
 4563d68: f100011f     	cmp	x8, #0x0
 4563d6c: 9a8903e0     	csel	x0, xzr, x9, eq
 4563d70: 911703ff     	add	sp, sp, #0x5c0
 4563d74: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563d78: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563d7c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563d80: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563d84: 15fffcc7     	b	0xc5630a0 <_ChromeMain+0xc55de04>
 4563d88: f9401e68     	ldr	x8, [x19, #0x38]
 4563d8c: 9100a109     	add	x9, x8, #0x28
 4563d90: f100011f     	cmp	x8, #0x0
 4563d94: 9a8903e0     	csel	x0, xzr, x9, eq
 4563d98: 911703ff     	add	sp, sp, #0x5c0
 4563d9c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563da0: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563da4: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563da8: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563dac: 15fffcc0     	b	0xc5630ac <_ChromeMain+0xc55de10>
 4563db0: f9401e68     	ldr	x8, [x19, #0x38]
 4563db4: 9100a109     	add	x9, x8, #0x28
 4563db8: f100011f     	cmp	x8, #0x0
 4563dbc: 9a8903e0     	csel	x0, xzr, x9, eq
 4563dc0: 911703ff     	add	sp, sp, #0x5c0
 4563dc4: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563dc8: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563dcc: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563dd0: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563dd4: 15fffcb9     	b	0xc5630b8 <_ChromeMain+0xc55de1c>
 4563dd8: f9401e68     	ldr	x8, [x19, #0x38]
 4563ddc: 9100a109     	add	x9, x8, #0x28
 4563de0: f100011f     	cmp	x8, #0x0
 4563de4: 9a8903e0     	csel	x0, xzr, x9, eq
 4563de8: 911703ff     	add	sp, sp, #0x5c0
 4563dec: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563df0: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563df4: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563df8: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563dfc: 15fffcb2     	b	0xc5630c4 <_ChromeMain+0xc55de28>
 4563e00: f9401e68     	ldr	x8, [x19, #0x38]
 4563e04: 9100a109     	add	x9, x8, #0x28
 4563e08: f100011f     	cmp	x8, #0x0
 4563e0c: 9a8903e0     	csel	x0, xzr, x9, eq
 4563e10: 911703ff     	add	sp, sp, #0x5c0
 4563e14: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563e18: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563e1c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563e20: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563e24: 15fffcab     	b	0xc5630d0 <_ChromeMain+0xc55de34>
 4563e28: f9401e68     	ldr	x8, [x19, #0x38]
 4563e2c: 9100a109     	add	x9, x8, #0x28
 4563e30: f100011f     	cmp	x8, #0x0
 4563e34: 9a8903e0     	csel	x0, xzr, x9, eq
 4563e38: 911703ff     	add	sp, sp, #0x5c0
 4563e3c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563e40: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563e44: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563e48: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563e4c: 15fffcfd     	b	0xc563240 <_ChromeMain+0xc55dfa4>
 4563e50: f9401e68     	ldr	x8, [x19, #0x38]
 4563e54: 9100a109     	add	x9, x8, #0x28
 4563e58: f100011f     	cmp	x8, #0x0
 4563e5c: 9a8903e0     	csel	x0, xzr, x9, eq
 4563e60: 911703ff     	add	sp, sp, #0x5c0
 4563e64: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563e68: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563e6c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563e70: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563e74: 15fffcf6     	b	0xc56324c <_ChromeMain+0xc55dfb0>
 4563e78: f9401e68     	ldr	x8, [x19, #0x38]
 4563e7c: 9100a109     	add	x9, x8, #0x28
 4563e80: f100011f     	cmp	x8, #0x0
 4563e84: 9a8903e0     	csel	x0, xzr, x9, eq
 4563e88: 911703ff     	add	sp, sp, #0x5c0
 4563e8c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563e90: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563e94: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563e98: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563e9c: 15fffcef     	b	0xc563258 <_ChromeMain+0xc55dfbc>
 4563ea0: f9401e68     	ldr	x8, [x19, #0x38]
 4563ea4: 9100a109     	add	x9, x8, #0x28
 4563ea8: f100011f     	cmp	x8, #0x0
 4563eac: 9a8903e0     	csel	x0, xzr, x9, eq
 4563eb0: 911703ff     	add	sp, sp, #0x5c0
 4563eb4: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563eb8: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563ebc: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563ec0: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563ec4: 15fffce8     	b	0xc563264 <_ChromeMain+0xc55dfc8>
 4563ec8: f9401e68     	ldr	x8, [x19, #0x38]
 4563ecc: 9100a109     	add	x9, x8, #0x28
 4563ed0: f100011f     	cmp	x8, #0x0
 4563ed4: 9a8903e0     	csel	x0, xzr, x9, eq
 4563ed8: 911703ff     	add	sp, sp, #0x5c0
 4563edc: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563ee0: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563ee4: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563ee8: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563eec: 15fffce1     	b	0xc563270 <_ChromeMain+0xc55dfd4>
 4563ef0: f9401e68     	ldr	x8, [x19, #0x38]
 4563ef4: 9100a109     	add	x9, x8, #0x28
 4563ef8: f100011f     	cmp	x8, #0x0
 4563efc: 9a8903e0     	csel	x0, xzr, x9, eq
 4563f00: 911703ff     	add	sp, sp, #0x5c0
 4563f04: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563f08: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563f0c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563f10: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563f14: 15fffcda     	b	0xc56327c <_ChromeMain+0xc55dfe0>
 4563f18: f9401e68     	ldr	x8, [x19, #0x38]
 4563f1c: 9100a109     	add	x9, x8, #0x28
 4563f20: f100011f     	cmp	x8, #0x0
 4563f24: 9a8903e0     	csel	x0, xzr, x9, eq
 4563f28: 911703ff     	add	sp, sp, #0x5c0
 4563f2c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563f30: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563f34: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563f38: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563f3c: 15fffcd3     	b	0xc563288 <_ChromeMain+0xc55dfec>
 4563f40: f9401e68     	ldr	x8, [x19, #0x38]
 4563f44: 9100a109     	add	x9, x8, #0x28
 4563f48: f100011f     	cmp	x8, #0x0
 4563f4c: 9a8903e0     	csel	x0, xzr, x9, eq
 4563f50: 911703ff     	add	sp, sp, #0x5c0
 4563f54: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563f58: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563f5c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563f60: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563f64: 15fffccc     	b	0xc563294 <_ChromeMain+0xc55dff8>
 4563f68: f9401e68     	ldr	x8, [x19, #0x38]
 4563f6c: 9100a109     	add	x9, x8, #0x28
 4563f70: f100011f     	cmp	x8, #0x0
 4563f74: 9a8903e0     	csel	x0, xzr, x9, eq
 4563f78: 911703ff     	add	sp, sp, #0x5c0
 4563f7c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563f80: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563f84: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563f88: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563f8c: 15fffcc5     	b	0xc5632a0 <_ChromeMain+0xc55e004>
 4563f90: f9401e68     	ldr	x8, [x19, #0x38]
 4563f94: 9100a109     	add	x9, x8, #0x28
 4563f98: f100011f     	cmp	x8, #0x0
 4563f9c: 9a8903e0     	csel	x0, xzr, x9, eq
 4563fa0: 911703ff     	add	sp, sp, #0x5c0
 4563fa4: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563fa8: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563fac: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563fb0: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563fb4: 15fffcbe     	b	0xc5632ac <_ChromeMain+0xc55e010>
 4563fb8: f9401e68     	ldr	x8, [x19, #0x38]
 4563fbc: 9100a109     	add	x9, x8, #0x28
 4563fc0: f100011f     	cmp	x8, #0x0
 4563fc4: 9a8903e0     	csel	x0, xzr, x9, eq
 4563fc8: 911703ff     	add	sp, sp, #0x5c0
 4563fcc: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563fd0: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563fd4: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4563fd8: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4563fdc: 15fffcb7     	b	0xc5632b8 <_ChromeMain+0xc55e01c>
 4563fe0: f9401e68     	ldr	x8, [x19, #0x38]
 4563fe4: 9100a109     	add	x9, x8, #0x28
 4563fe8: f100011f     	cmp	x8, #0x0
 4563fec: 9a8903e0     	csel	x0, xzr, x9, eq
 4563ff0: 911703ff     	add	sp, sp, #0x5c0
 4563ff4: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4563ff8: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4563ffc: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4564000: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4564004: 15fffcb0     	b	0xc5632c4 <_ChromeMain+0xc55e028>
 4564008: f9401e68     	ldr	x8, [x19, #0x38]
 456400c: 9100a109     	add	x9, x8, #0x28
 4564010: f100011f     	cmp	x8, #0x0
 4564014: 9a8903e0     	csel	x0, xzr, x9, eq
 4564018: 911703ff     	add	sp, sp, #0x5c0
 456401c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4564020: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4564024: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4564028: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 456402c: 15fffca9     	b	0xc5632d0 <_ChromeMain+0xc55e034>
 4564030: f9401e68     	ldr	x8, [x19, #0x38]
 4564034: 9100a109     	add	x9, x8, #0x28
 4564038: f100011f     	cmp	x8, #0x0
 456403c: 9a8903e0     	csel	x0, xzr, x9, eq
 4564040: 911703ff     	add	sp, sp, #0x5c0
 4564044: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4564048: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 456404c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4564050: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4564054: 15fffca2     	b	0xc5632dc <_ChromeMain+0xc55e040>
 4564058: f9401e68     	ldr	x8, [x19, #0x38]
 456405c: 9100a109     	add	x9, x8, #0x28
 4564060: f100011f     	cmp	x8, #0x0
 4564064: 9a8903e0     	csel	x0, xzr, x9, eq
 4564068: 911703ff     	add	sp, sp, #0x5c0
 456406c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4564070: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4564074: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4564078: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 456407c: 15fffc9b     	b	0xc5632e8 <_ChromeMain+0xc55e04c>
 4564080: f9401e68     	ldr	x8, [x19, #0x38]
 4564084: 9100a109     	add	x9, x8, #0x28
 4564088: f100011f     	cmp	x8, #0x0
 456408c: 9a8903e0     	csel	x0, xzr, x9, eq
 4564090: 911703ff     	add	sp, sp, #0x5c0
 4564094: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4564098: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 456409c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 45640a0: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 45640a4: 15fffc94     	b	0xc5632f4 <_ChromeMain+0xc55e058>
 45640a8: f9401e68     	ldr	x8, [x19, #0x38]
 45640ac: 9100a109     	add	x9, x8, #0x28
 45640b0: f100011f     	cmp	x8, #0x0
 45640b4: 9a8903e0     	csel	x0, xzr, x9, eq
 45640b8: 911703ff     	add	sp, sp, #0x5c0
 45640bc: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 45640c0: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 45640c4: a94157f6     	ldp	x22, x21, [sp, #0x10]
 45640c8: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 45640cc: 15fffc8d     	b	0xc563300 <_ChromeMain+0xc55e064>
 45640d0: f9401e68     	ldr	x8, [x19, #0x38]
 45640d4: 9100a109     	add	x9, x8, #0x28
 45640d8: f100011f     	cmp	x8, #0x0
 45640dc: 9a8903e0     	csel	x0, xzr, x9, eq
 45640e0: 911703ff     	add	sp, sp, #0x5c0
 45640e4: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 45640e8: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 45640ec: a94157f6     	ldp	x22, x21, [sp, #0x10]
 45640f0: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 45640f4: 15fffc86     	b	0xc56330c <_ChromeMain+0xc55e070>
 45640f8: f9401e68     	ldr	x8, [x19, #0x38]
 45640fc: 9100a109     	add	x9, x8, #0x28
 4564100: f100011f     	cmp	x8, #0x0
 4564104: 9a8903e0     	csel	x0, xzr, x9, eq
 4564108: 911703ff     	add	sp, sp, #0x5c0
 456410c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4564110: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4564114: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4564118: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 456411c: 15fffc7f     	b	0xc563318 <_ChromeMain+0xc55e07c>
 4564120: f9401e68     	ldr	x8, [x19, #0x38]
 4564124: 9100a109     	add	x9, x8, #0x28
 4564128: f100011f     	cmp	x8, #0x0
 456412c: 9a8903e0     	csel	x0, xzr, x9, eq
 4564130: 911703ff     	add	sp, sp, #0x5c0
 4564134: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4564138: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 456413c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4564140: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4564144: 14e1179d     	b	0x7da9fb8 <_ChromeMain+0x7da4d1c>
 4564148: f9401e68     	ldr	x8, [x19, #0x38]
 456414c: 9100a109     	add	x9, x8, #0x28
 4564150: f100011f     	cmp	x8, #0x0
 4564154: 9a8903e0     	csel	x0, xzr, x9, eq
 4564158: 911703ff     	add	sp, sp, #0x5c0
 456415c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4564160: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4564164: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4564168: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 456416c: 15fffc6e     	b	0xc563324 <_ChromeMain+0xc55e088>
 4564170: f9401e68     	ldr	x8, [x19, #0x38]
 4564174: 9100a109     	add	x9, x8, #0x28
 4564178: f100011f     	cmp	x8, #0x0
 456417c: 9a8903e0     	csel	x0, xzr, x9, eq
 4564180: aa1603e1     	mov	x1, x22
 4564184: 911703ff     	add	sp, sp, #0x5c0
 4564188: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 456418c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4564190: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4564194: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4564198: 15fffc66     	b	0xc563330 <_ChromeMain+0xc55e094>
 456419c: b004ade8     	adrp	x8, 0xdb21000 <dyld_stub_binder+0xdb21000>
 45641a0: 912ec108     	add	x8, x8, #0xbb0
 45641a4: f90023e8     	str	x8, [sp, #0x40]
 45641a8: 910103e0     	add	x0, sp, #0x40
 45641ac: 97562970     	bl	0x1aee76c <_ChromeMain+0x1ae94d0>
 45641b0: f9401e68     	ldr	x8, [x19, #0x38]
 45641b4: 9100a109     	add	x9, x8, #0x28
 45641b8: f100011f     	cmp	x8, #0x0
 45641bc: 9a8903e0     	csel	x0, xzr, x9, eq
 45641c0: 95fffc5f     	bl	0xc56333c <_ChromeMain+0xc55e0a0>
 45641c4: 17fff532     	b	0x456168c <_ChromeMain+0x455c3f0>
 45641c8: b004ade8     	adrp	x8, 0xdb21000 <dyld_stub_binder+0xdb21000>
 45641cc: 912e7508     	add	x8, x8, #0xb9d
 45641d0: f90023e8     	str	x8, [sp, #0x40]
 45641d4: 910103e0     	add	x0, sp, #0x40
 45641d8: 97562965     	bl	0x1aee76c <_ChromeMain+0x1ae94d0>
 45641dc: f9401e68     	ldr	x8, [x19, #0x38]
 45641e0: 9100a109     	add	x9, x8, #0x28
 45641e4: f100011f     	cmp	x8, #0x0
 45641e8: 9a8903e0     	csel	x0, xzr, x9, eq
 45641ec: 95fffcfe     	bl	0xc5635e4 <_ChromeMain+0xc55e348>
 45641f0: 17fff527     	b	0x456168c <_ChromeMain+0x455c3f0>
 45641f4: f9401e68     	ldr	x8, [x19, #0x38]
 45641f8: 9100a109     	add	x9, x8, #0x28
 45641fc: f100011f     	cmp	x8, #0x0
 4564200: 9a8903e0     	csel	x0, xzr, x9, eq
 4564204: 911703ff     	add	sp, sp, #0x5c0
 4564208: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 456420c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4564210: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4564214: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4564218: 15fffcf6     	b	0xc5635f0 <_ChromeMain+0xc55e354>
 456421c: f9401e68     	ldr	x8, [x19, #0x38]
 4564220: 9100a109     	add	x9, x8, #0x28
 4564224: f100011f     	cmp	x8, #0x0
 4564228: 9a8903e0     	csel	x0, xzr, x9, eq
 456422c: 911703ff     	add	sp, sp, #0x5c0
 4564230: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4564234: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4564238: a94157f6     	ldp	x22, x21, [sp, #0x10]
 456423c: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4564240: 15fffcef     	b	0xc5635fc <_ChromeMain+0xc55e360>
 4564244: f9401e68     	ldr	x8, [x19, #0x38]
 4564248: 9100a109     	add	x9, x8, #0x28
 456424c: f100011f     	cmp	x8, #0x0
 4564250: 9a8903e0     	csel	x0, xzr, x9, eq
 4564254: 911703ff     	add	sp, sp, #0x5c0
 4564258: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 456425c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4564260: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4564264: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4564268: 15fffce8     	b	0xc563608 <_ChromeMain+0xc55e36c>
 456426c: f9401e68     	ldr	x8, [x19, #0x38]
 4564270: 9100a109     	add	x9, x8, #0x28
 4564274: f100011f     	cmp	x8, #0x0
 4564278: 9a8903e0     	csel	x0, xzr, x9, eq
 456427c: 911703ff     	add	sp, sp, #0x5c0
 4564280: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4564284: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4564288: a94157f6     	ldp	x22, x21, [sp, #0x10]
 456428c: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4564290: 15fffce1     	b	0xc563614 <_ChromeMain+0xc55e378>
 4564294: f9401e68     	ldr	x8, [x19, #0x38]
 4564298: 9100a109     	add	x9, x8, #0x28
 456429c: f100011f     	cmp	x8, #0x0
 45642a0: 9a8903e0     	csel	x0, xzr, x9, eq
 45642a4: 911703ff     	add	sp, sp, #0x5c0
 45642a8: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 45642ac: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 45642b0: a94157f6     	ldp	x22, x21, [sp, #0x10]
 45642b4: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 45642b8: 15fffcda     	b	0xc563620 <_ChromeMain+0xc55e384>
 45642bc: f9401e68     	ldr	x8, [x19, #0x38]
 45642c0: 9100a109     	add	x9, x8, #0x28
 45642c4: f100011f     	cmp	x8, #0x0
 45642c8: 9a8903e0     	csel	x0, xzr, x9, eq
 45642cc: 911703ff     	add	sp, sp, #0x5c0
 45642d0: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 45642d4: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 45642d8: a94157f6     	ldp	x22, x21, [sp, #0x10]
 45642dc: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 45642e0: 15fffcf9     	b	0xc5636c4 <_ChromeMain+0xc55e428>
 45642e4: f9401e68     	ldr	x8, [x19, #0x38]
 45642e8: 9100a109     	add	x9, x8, #0x28
 45642ec: f100011f     	cmp	x8, #0x0
 45642f0: 9a8903e0     	csel	x0, xzr, x9, eq
 45642f4: 911703ff     	add	sp, sp, #0x5c0
 45642f8: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 45642fc: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4564300: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4564304: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4564308: 15fffcf2     	b	0xc5636d0 <_ChromeMain+0xc55e434>
 456430c: f9401e68     	ldr	x8, [x19, #0x38]
 4564310: 9100a109     	add	x9, x8, #0x28
 4564314: f100011f     	cmp	x8, #0x0
 4564318: 9a8903e0     	csel	x0, xzr, x9, eq
 456431c: 52800021     	mov	w1, #0x1                ; =1
 4564320: 911703ff     	add	sp, sp, #0x5c0
 4564324: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4564328: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 456432c: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4564330: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4564334: 15fffcea     	b	0xc5636dc <_ChromeMain+0xc55e440>
 4564338: f9401e68     	ldr	x8, [x19, #0x38]
 456433c: 9100a109     	add	x9, x8, #0x28
 4564340: f100011f     	cmp	x8, #0x0
 4564344: 9a8903e0     	csel	x0, xzr, x9, eq
 4564348: 94dd1fb5     	bl	0x7cac21c <_ChromeMain+0x7ca6f80>
 456434c: 911703ff     	add	sp, sp, #0x5c0
 4564350: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4564354: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4564358: a94157f6     	ldp	x22, x21, [sp, #0x10]
 456435c: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4564360: 15fffce2     	b	0xc5636e8 <_ChromeMain+0xc55e44c>
 4564364: f9401e68     	ldr	x8, [x19, #0x38]
 4564368: 9100a109     	add	x9, x8, #0x28
 456436c: f100011f     	cmp	x8, #0x0
 4564370: 9a8903e0     	csel	x0, xzr, x9, eq
 4564374: 94dd1faa     	bl	0x7cac21c <_ChromeMain+0x7ca6f80>
 4564378: 911703ff     	add	sp, sp, #0x5c0
 456437c: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4564380: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4564384: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4564388: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 456438c: 15910756     	b	0xa9a60e4 <_ChromeMain+0xa9a0e48>
 4564390: f9401e68     	ldr	x8, [x19, #0x38]
 4564394: 9100a109     	add	x9, x8, #0x28
 4564398: f100011f     	cmp	x8, #0x0
 456439c: 9a8903e0     	csel	x0, xzr, x9, eq
 45643a0: 94dd1f9f     	bl	0x7cac21c <_ChromeMain+0x7ca6f80>
 45643a4: 911703ff     	add	sp, sp, #0x5c0
 45643a8: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 45643ac: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 45643b0: a94157f6     	ldp	x22, x21, [sp, #0x10]
 45643b4: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 45643b8: 15fffccf     	b	0xc5636f4 <_ChromeMain+0xc55e458>
 45643bc: f9401e68     	ldr	x8, [x19, #0x38]
 45643c0: 9100a109     	add	x9, x8, #0x28
 45643c4: f100011f     	cmp	x8, #0x0
 45643c8: 9a8903e0     	csel	x0, xzr, x9, eq
 45643cc: 94dd1f94     	bl	0x7cac21c <_ChromeMain+0x7ca6f80>
 45643d0: 911703ff     	add	sp, sp, #0x5c0
 45643d4: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 45643d8: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 45643dc: a94157f6     	ldp	x22, x21, [sp, #0x10]
 45643e0: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 45643e4: 15fffcc7     	b	0xc563700 <_ChromeMain+0xc55e464>
 45643e8: f9401e68     	ldr	x8, [x19, #0x38]
 45643ec: 9100a109     	add	x9, x8, #0x28
 45643f0: f100011f     	cmp	x8, #0x0
 45643f4: 9a8903e0     	csel	x0, xzr, x9, eq
 45643f8: 94dd1f89     	bl	0x7cac21c <_ChromeMain+0x7ca6f80>
 45643fc: 911703ff     	add	sp, sp, #0x5c0
 4564400: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4564404: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4564408: a94157f6     	ldp	x22, x21, [sp, #0x10]
 456440c: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4564410: 15fffcbf     	b	0xc56370c <_ChromeMain+0xc55e470>
 4564414: b004cb08     	adrp	x8, 0xdec5000 <dyld_stub_binder+0xdec5000>
 4564418: 9110e908     	add	x8, x8, #0x43a
 456441c: f90023e8     	str	x8, [sp, #0x40]
 4564420: 910103e0     	add	x0, sp, #0x40
 4564424: 975628d2     	bl	0x1aee76c <_ChromeMain+0x1ae94d0>
 4564428: f9401e68     	ldr	x8, [x19, #0x38]
 456442c: 9100a109     	add	x9, x8, #0x28
 4564430: f100011f     	cmp	x8, #0x0
 4564434: 9a8903e0     	csel	x0, xzr, x9, eq
 4564438: 95f42abc     	bl	0xc26ef28 <_ChromeMain+0xc269c8c>
 456443c: 17fff494     	b	0x456168c <_ChromeMain+0x455c3f0>
 4564440: 52800101     	mov	w1, #0x8                ; =8
 4564444: 911703ff     	add	sp, sp, #0x5c0
 4564448: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 456444c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4564450: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4564454: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4564458: 16ea9298     	b	0x8eb8 <_ChromeMain+0x3c1c>
 456445c: f9401e68     	ldr	x8, [x19, #0x38]
 4564460: 9100a109     	add	x9, x8, #0x28
 4564464: f100011f     	cmp	x8, #0x0
 4564468: 9a8903e0     	csel	x0, xzr, x9, eq
 456446c: 94dd1f6c     	bl	0x7cac21c <_ChromeMain+0x7ca6f80>
 4564470: 52800201     	mov	w1, #0x10               ; =16
 4564474: 911703ff     	add	sp, sp, #0x5c0
 4564478: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 456447c: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4564480: a94157f6     	ldp	x22, x21, [sp, #0x10]
 4564484: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4564488: 14c74623     	b	0x7735d14 <_ChromeMain+0x7730a78>
 456448c: f9401e68     	ldr	x8, [x19, #0x38]
 4564490: 9100a109     	add	x9, x8, #0x28
 4564494: f100011f     	cmp	x8, #0x0
 4564498: 9a8903e0     	csel	x0, xzr, x9, eq
 456449c: 94dd1f60     	bl	0x7cac21c <_ChromeMain+0x7ca6f80>
 45644a0: aa0003f3     	mov	x19, x0
 45644a4: 9400179d     	bl	0x456a318 <_ChromeMain+0x456507c>
 45644a8: 37068f20     	tbnz	w0, #0x0, 0x456168c <_ChromeMain+0x455c3f0>
 45644ac: aa1303e0     	mov	x0, x19
 45644b0: 911703ff     	add	sp, sp, #0x5c0
 45644b4: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 45644b8: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 45644bc: a94157f6     	ldp	x22, x21, [sp, #0x10]
 45644c0: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 45644c4: 15ecf75a     	b	0xc0a222c <_ChromeMain+0xc09cf90>
 45644c8: f9401e68     	ldr	x8, [x19, #0x38]
 45644cc: 9100a109     	add	x9, x8, #0x28
 45644d0: f100011f     	cmp	x8, #0x0
 45644d4: 9a8903e0     	csel	x0, xzr, x9, eq
 45644d8: 94dd1f51     	bl	0x7cac21c <_ChromeMain+0x7ca6f80>
 45644dc: 90044be1     	adrp	x1, 0xcee0000 <dyld_stub_binder+0xcee0000>
 45644e0: 9136a421     	add	x1, x1, #0xda9
 45644e4: 52800162     	mov	w2, #0xb                ; =11
 45644e8: 911703ff     	add	sp, sp, #0x5c0
 45644ec: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 45644f0: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 45644f4: a94157f6     	ldp	x22, x21, [sp, #0x10]
 45644f8: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 45644fc: 15fffcce     	b	0xc563834 <_ChromeMain+0xc55e598>
 4564500: d2800000     	mov	x0, #0x0                ; =0
 4564504: 17fff55b     	b	0x4561a70 <_ChromeMain+0x455c7d4>
 4564508: 9100a260     	add	x0, x19, #0x28
 456450c: 972be7b1     	bl	0x105e3d0 <_ChromeMain+0x1059134>
 4564510: b5feb840     	cbnz	x0, 0x4561c18 <_ChromeMain+0x455c97c>
 4564514: f9403e60     	ldr	x0, [x19, #0x78]
 4564518: 17fff5c0     	b	0x4561c18 <_ChromeMain+0x455c97c>
 456451c: 9100a260     	add	x0, x19, #0x28
 4564520: 972be7ac     	bl	0x105e3d0 <_ChromeMain+0x1059134>
 4564524: b5fea560     	cbnz	x0, 0x45619d0 <_ChromeMain+0x455c734>
 4564528: f9403e60     	ldr	x0, [x19, #0x78]
 456452c: 17fff529     	b	0x45619d0 <_ChromeMain+0x455c734>
 4564530: d2800000     	mov	x0, #0x0                ; =0
 4564534: 17fff437     	b	0x4561610 <_ChromeMain+0x455c374>
 4564538: d2800000     	mov	x0, #0x0                ; =0
 456453c: 17fff540     	b	0x4561a3c <_ChromeMain+0x455c7a0>
 4564540: 9100a280     	add	x0, x20, #0x28
 4564544: 972be7a3     	bl	0x105e3d0 <_ChromeMain+0x1059134>
 4564548: b5fea600     	cbnz	x0, 0x4561a08 <_ChromeMain+0x455c76c>
 456454c: f9403e80     	ldr	x0, [x20, #0x78]
 4564550: 17fff52e     	b	0x4561a08 <_ChromeMain+0x455c76c>
 4564554: f9401e68     	ldr	x8, [x19, #0x38]
 4564558: f9403500     	ldr	x0, [x8, #0x68]
 456455c: 52800001     	mov	w1, #0x0                ; =0
 4564560: 975de1d5     	bl	0x1cdccb4 <_ChromeMain+0x1cd7a18>
 4564564: f9401e68     	ldr	x8, [x19, #0x38]
 4564568: 9100a109     	add	x9, x8, #0x28
 456456c: f100011f     	cmp	x8, #0x0
 4564570: 9a8903e1     	csel	x1, xzr, x9, eq
 4564574: 52800022     	mov	w2, #0x1                ; =1
 4564578: 528000e3     	mov	w3, #0x7                ; =7
 456457c: 911703ff     	add	sp, sp, #0x5c0
 4564580: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 4564584: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 4564588: a94157f6     	ldp	x22, x21, [sp, #0x10]
 456458c: a8c46ffc     	ldp	x28, x27, [sp], #0x40
 4564590: 14d034fc     	b	0x7971980 <_ChromeMain+0x796c6e4>
 4564594: 9100a260     	add	x0, x19, #0x28
 4564598: 972be78e     	bl	0x105e3d0 <_ChromeMain+0x1059134>
 456459c: b5feb2e0     	cbnz	x0, 0x4561bf8 <_ChromeMain+0x455c95c>
 45645a0: f9403e60     	ldr	x0, [x19, #0x78]
 45645a4: 17fff595     	b	0x4561bf8 <_ChromeMain+0x455c95c>
 45645a8: 12185a96     	and	w22, w20, #0x7fffff00
 45645ac: aa1403f3     	mov	x19, x20
 45645b0: 12001e74     	and	w20, w19, #0xff
 45645b4: f94046b3     	ldr	x19, [x21, #0x88]
 45645b8: b0053268     	adrp	x8, 0xebb1000 <dyld_stub_binder+0xebb1000>
 45645bc: f9468d08     	ldr	x8, [x8, #0xd18]
 45645c0: d63f0100     	blr	x8
 45645c4: aa0003e3     	mov	x3, x0
 45645c8: 2a1402c1     	orr	w1, w22, w20
 45645cc: aa1303e0     	mov	x0, x19
 45645d0: 528000c2     	mov	w2, #0x6                ; =6
 45645d4: 94dfad45     	bl	0x7d4fae8 <_ChromeMain+0x7d4a84c>
 45645d8: 17fff9de     	b	0x4562d50 <_ChromeMain+0x455dab4>
 45645dc: aa1403e0     	mov	x0, x20
 45645e0: 972be77c     	bl	0x105e3d0 <_ChromeMain+0x1059134>
 45645e4: b5ff8c40     	cbnz	x0, 0x456376c <_ChromeMain+0x455e4d0>
 45645e8: f9402a80     	ldr	x0, [x20, #0x50]
 45645ec: 17fffc60     	b	0x456376c <_ChromeMain+0x455e4d0>
 45645f0: 9748125d     	bl	0x1768f64 <_ChromeMain+0x1763cc8>
 45645f4: aa0003e8     	mov	x8, x0
 45645f8: 39402009     	ldrb	w9, [x0, #0x8]
 45645fc: 7100053f     	cmp	w9, #0x1
 4564600: 54000221     	b.ne	0x4564644 <_ChromeMain+0x455f3a8>
 4564604: 91005d00     	add	x0, x8, #0x17
 4564608: 96eedabe     	bl	0x11b100 <_ChromeMain+0x115e64>
 456460c: b907aa80     	str	w0, [x20, #0x7a8]
 4564610: 17fff7c7     	b	0x456252c <_ChromeMain+0x455d290>
 4564614: 97481254     	bl	0x1768f64 <_ChromeMain+0x1763cc8>
 4564618: aa0003e8     	mov	x8, x0
 456461c: 39402009     	ldrb	w9, [x0, #0x8]
 4564620: 7100053f     	cmp	w9, #0x1
 4564624: 54000221     	b.ne	0x4564668 <_ChromeMain+0x455f3cc>
 4564628: 91005d00     	add	x0, x8, #0x17
 456462c: 96eedab5     	bl	0x11b100 <_ChromeMain+0x115e64>
 4564630: b907aa80     	str	w0, [x20, #0x7a8]
 4564634: 17fff7d9     	b	0x4562598 <_ChromeMain+0x455d2fc>
 4564638: d4200000     	brk	#0
 456463c: d4400000     	hlt	#0
 4564640: d4200020     	brk	#0x1
 4564644: b0049400     	adrp	x0, 0xd7e5000 <dyld_stub_binder+0xd7e5000>
 4564648: 91299000     	add	x0, x0, #0xa64
 456464c: 7100093f     	cmp	w9, #0x2
 4564650: 540008e1     	b.ne	0x456476c <_ChromeMain+0x455f4d0>
 4564654: f9401108     	ldr	x8, [x8, #0x20]
 4564658: f9400508     	ldr	x8, [x8, #0x8]
 456465c: f100011f     	cmp	x8, #0x0
 4564660: 9a880000     	csel	x0, x0, x8, eq
 4564664: 17ffffe9     	b	0x4564608 <_ChromeMain+0x455f36c>
 4564668: b0049400     	adrp	x0, 0xd7e5000 <dyld_stub_binder+0xd7e5000>
 456466c: 91299000     	add	x0, x0, #0xa64
 4564670: 7100093f     	cmp	w9, #0x2
 4564674: 54000781     	b.ne	0x4564764 <_ChromeMain+0x455f4c8>
 4564678: f9401108     	ldr	x8, [x8, #0x20]
 456467c: f9400508     	ldr	x8, [x8, #0x8]
 4564680: f100011f     	cmp	x8, #0x0
 4564684: 9a880000     	csel	x0, x0, x8, eq
 4564688: 17ffffe9     	b	0x456462c <_ChromeMain+0x455f390>
 456468c: d4200000     	brk	#0
 4564690: d4400000     	hlt	#0
 4564694: d4200020     	brk	#0x1
 4564698: d2800000     	mov	x0, #0x0                ; =0
 456469c: 17fff4cd     	b	0x45619d0 <_ChromeMain+0x455c734>
 45646a0: d2800000     	mov	x0, #0x0                ; =0
 45646a4: 17fff55d     	b	0x4561c18 <_ChromeMain+0x455c97c>
 45646a8: d2800000     	mov	x0, #0x0                ; =0
 45646ac: 17fff4d7     	b	0x4561a08 <_ChromeMain+0x455c76c>
 45646b0: d2800000     	mov	x0, #0x0                ; =0
 45646b4: 17fff76f     	b	0x4562470 <_ChromeMain+0x455d1d4>
 45646b8: d2800000     	mov	x0, #0x0                ; =0
 45646bc: 17fff804     	b	0x45626cc <_ChromeMain+0x455d430>
 45646c0: d2800000     	mov	x0, #0x0                ; =0
 45646c4: 17fff54d     	b	0x4561bf8 <_ChromeMain+0x455c95c>
 45646c8: 12800014     	mov	w20, #-0x1              ; =-1
 45646cc: 17fff8d0     	b	0x4562a0c <_ChromeMain+0x455d770>
 45646d0: f9403be0     	ldr	x0, [sp, #0x70]
 45646d4: f94043e8     	ldr	x8, [sp, #0x80]
 45646d8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 45646dc: 96ea91f7     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45646e0: 17fffa09     	b	0x4562f04 <_ChromeMain+0x455dc68>
 45646e4: f9402fe0     	ldr	x0, [sp, #0x58]
 45646e8: f94037e8     	ldr	x8, [sp, #0x68]
 45646ec: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 45646f0: 96ea91f2     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45646f4: 17fffa24     	b	0x4562f84 <_ChromeMain+0x455dce8>
 45646f8: d2800013     	mov	x19, #0x0               ; =0
 45646fc: 17fffb58     	b	0x456345c <_ChromeMain+0x455e1c0>
 4564700: d2800000     	mov	x0, #0x0                ; =0
 4564704: 17fff951     	b	0x4562c48 <_ChromeMain+0x455d9ac>
 4564708: d2800013     	mov	x19, #0x0               ; =0
 456470c: 17fffb0f     	b	0x4563348 <_ChromeMain+0x455e0ac>
 4564710: d2800013     	mov	x19, #0x0               ; =0
 4564714: 17fffb82     	b	0x456351c <_ChromeMain+0x455e280>
 4564718: d2800013     	mov	x19, #0x0               ; =0
 456471c: 17fffae3     	b	0x45632a8 <_ChromeMain+0x455e00c>
 4564720: d2800013     	mov	x19, #0x0               ; =0
 4564724: 17fffb31     	b	0x45633e8 <_ChromeMain+0x455e14c>
 4564728: d4200000     	brk	#0
 456472c: d4400000     	hlt	#0
 4564730: d4200020     	brk	#0x1
 4564734: d2800000     	mov	x0, #0x0                ; =0
 4564738: 17fffc0d     	b	0x456376c <_ChromeMain+0x455e4d0>
 456473c: f9400008     	ldr	x8, [x0]
 4564740: f9402108     	ldr	x8, [x8, #0x40]
 4564744: d63f0100     	blr	x8
 4564748: f9400660     	ldr	x0, [x19, #0x8]
 456474c: f900067f     	str	xzr, [x19, #0x8]
