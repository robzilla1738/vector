
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4650500: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4650504: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4650508: 910043fd     	add	x29, sp, #0x10
 465050c: aa0003f3     	mov	x19, x0
 4650510: 350001a1     	cbnz	w1, 0x4650544 <_ChromeMain+0x464b2a8>
 4650514: 39682e68     	ldrb	w8, [x19, #0xa0b]
 4650518: 34000108     	cbz	w8, 0x4650538 <_ChromeMain+0x464b29c>
 465051c: 39282e7f     	strb	wzr, [x19, #0xa0b]
 4650520: 39683268     	ldrb	w8, [x19, #0xa0c]
 4650524: 340000a8     	cbz	w8, 0x4650538 <_ChromeMain+0x464b29c>
 4650528: aa1303e0     	mov	x0, x19
 465052c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4650530: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4650534: 17ffc588     	b	0x4641b54 <_ChromeMain+0x463c8b8>
 4650538: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 465053c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4650540: d65f03c0     	ret
 4650544: 397e4268     	ldrb	w8, [x19, #0xf90]
 4650548: 370001c8     	tbnz	w8, #0x0, 0x4650580 <_ChromeMain+0x464b2e4>
 465054c: f9422e60     	ldr	x0, [x19, #0x458]
 4650550: b4000180     	cbz	x0, 0x4650580 <_ChromeMain+0x464b2e4>
 4650554: f940c268     	ldr	x8, [x19, #0x180]
 4650558: b4000168     	cbz	x8, 0x4650584 <_ChromeMain+0x464b2e8>
 465055c: 97897331     	bl	0x28ad220 <_ChromeMain+0x28a7f84>
 4650560: 34000100     	cbz	w0, 0x4650580 <_ChromeMain+0x464b2e4>
 4650564: f9442668     	ldr	x8, [x19, #0x848]
 4650568: 39424108     	ldrb	w8, [x8, #0x90]
 465056c: 340000c8     	cbz	w8, 0x4650584 <_ChromeMain+0x464b2e8>
 4650570: f940c260     	ldr	x0, [x19, #0x180]
 4650574: b40005a0     	cbz	x0, 0x4650628 <_ChromeMain+0x464b38c>
 4650578: 9708ac54     	bl	0x87b6c8 <_ChromeMain+0x87642c>
 465057c: 35000560     	cbnz	w0, 0x4650628 <_ChromeMain+0x464b38c>
 4650580: 52800008     	mov	w8, #0x0                ; =0
 4650584: 39682e69     	ldrb	w9, [x19, #0xa0b]
 4650588: 6b08013f     	cmp	w9, w8
 465058c: 54fffd60     	b.eq	0x4650538 <_ChromeMain+0x464b29c>
 4650590: 39282e68     	strb	w8, [x19, #0xa0b]
 4650594: 34fffc68     	cbz	w8, 0x4650520 <_ChromeMain+0x464b284>
 4650598: 91250260     	add	x0, x19, #0x940
 465059c: 9703785f     	bl	0x72e718 <_ChromeMain+0x72947c>
 46505a0: 52800028     	mov	w8, #0x1                ; =1
 46505a4: 39283268     	strb	w8, [x19, #0xa0c]
 46505a8: aa1303e0     	mov	x0, x19
 46505ac: 94000025     	bl	0x4650640 <_ChromeMain+0x464b3a4>
 46505b0: f942ca60     	ldr	x0, [x19, #0x590]
 46505b4: b943a808     	ldr	w8, [x0, #0x3a8]
 46505b8: 340000a8     	cbz	w8, 0x46505cc <_ChromeMain+0x464b330>
 46505bc: b903a81f     	str	wzr, [x0, #0x3a8]
 46505c0: 52800021     	mov	w1, #0x1                ; =1
 46505c4: 96ff7fac     	bl	0x630474 <_ChromeMain+0x62b1d8>
 46505c8: f942ca60     	ldr	x0, [x19, #0x590]
 46505cc: b943ac08     	ldr	w8, [x0, #0x3ac]
 46505d0: 340000a8     	cbz	w8, 0x46505e4 <_ChromeMain+0x464b348>
 46505d4: b903ac1f     	str	wzr, [x0, #0x3ac]
 46505d8: 52800021     	mov	w1, #0x1                ; =1
 46505dc: 96ff7fa6     	bl	0x630474 <_ChromeMain+0x62b1d8>
 46505e0: f942ca60     	ldr	x0, [x19, #0x590]
 46505e4: 394ee008     	ldrb	w8, [x0, #0x3b8]
 46505e8: 340000a8     	cbz	w8, 0x46505fc <_ChromeMain+0x464b360>
 46505ec: 390ee01f     	strb	wzr, [x0, #0x3b8]
 46505f0: 52800001     	mov	w1, #0x0                ; =0
 46505f4: 96ff7fa0     	bl	0x630474 <_ChromeMain+0x62b1d8>
 46505f8: f942ca60     	ldr	x0, [x19, #0x590]
 46505fc: 394ec808     	ldrb	w8, [x0, #0x3b2]
 4650600: 370000a8     	tbnz	w8, #0x0, 0x4650614 <_ChromeMain+0x464b378>
 4650604: 52800028     	mov	w8, #0x1                ; =1
 4650608: 390ec808     	strb	w8, [x0, #0x3b2]
 465060c: 52800001     	mov	w1, #0x0                ; =0
 4650610: 96ff7f99     	bl	0x630474 <_ChromeMain+0x62b1d8>
 4650614: aa1303e0     	mov	x0, x19
 4650618: d2800001     	mov	x1, #0x0                ; =0
 465061c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4650620: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4650624: 17baa3f1     	b	0x34f95e8 <_ChromeMain+0x34f434c>
 4650628: b94c8668     	ldr	w8, [x19, #0xc84]
 465062c: 7100011f     	cmp	w8, #0x0
 4650630: 1a9f17e8     	cset	w8, eq
 4650634: 17ffffd4     	b	0x4650584 <_ChromeMain+0x464b2e8>
		...
