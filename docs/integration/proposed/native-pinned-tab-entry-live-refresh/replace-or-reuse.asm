
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 46055a8: f85403a8     	ldur	x8, [x29, #-0xc0]
 46055ac: f901b268     	str	x8, [x19, #0x360]
 46055b0: 3cd483a0     	ldur	q0, [x29, #-0xb8]
 46055b4: 3d8002a0     	str	q0, [x21]
 46055b8: aa1303e0     	mov	x0, x19
 46055bc: 95fffbde     	bl	0xc604534 <_ChromeMain+0xc5ff298>
 46055c0: 14000027     	b	0x460565c <_ChromeMain+0x46003c0>
 46055c4: 39555268     	ldrb	w8, [x19, #0x554]
 46055c8: 14000028     	b	0x4605668 <_ChromeMain+0x46003cc>
 46055cc: f941b260     	ldr	x0, [x19, #0x360]
 46055d0: f85483b7     	ldur	x23, [x29, #-0xb8]
 46055d4: cb000288     	sub	x8, x20, x0
 46055d8: 9343fd08     	asr	x8, x8, #3
 46055dc: d28710a9     	mov	x9, #0x3885             ; =14469
 46055e0: f2a7e569     	movk	x9, #0x3f2b, lsl #16
 46055e4: f2d9c429     	movk	x9, #0xce21, lsl #32
 46055e8: f2e9f949     	movk	x9, #0x4fca, lsl #48
 46055ec: 9b097d08     	mul	x8, x8, x9
 46055f0: f901b668     	str	x8, [x19, #0x368]
 46055f4: f941ba68     	ldr	x8, [x19, #0x370]
 46055f8: 52804d09     	mov	w9, #0x268              ; =616
 46055fc: 9b097d01     	mul	x1, x8, x9
 4605600: 96e80e2e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4605604: f85403a8     	ldur	x8, [x29, #-0xc0]
 4605608: f85503a9     	ldur	x9, [x29, #-0xb0]
 460560c: f901b268     	str	x8, [x19, #0x360]
 4605610: f901b677     	str	x23, [x19, #0x368]
 4605614: f901ba69     	str	x9, [x19, #0x370]
 4605618: 34fffd16     	cbz	w22, 0x46055b8 <_ChromeMain+0x460031c>
 460561c: f940ce68     	ldr	x8, [x19, #0x198]
 4605620: d37df116     	lsl	x22, x8, #3
 4605624: b4000136     	cbz	x22, 0x4605648 <_ChromeMain+0x46003ac>
 4605628: f940ca77     	ldr	x23, [x19, #0x190]
 460562c: f84086f4     	ldr	x20, [x23], #0x8
 4605630: aa1403e0     	mov	x0, x20
 4605634: 940008a3     	bl	0x46078c0 <_ChromeMain+0x4602624>
 4605638: aa1403e0     	mov	x0, x20
 460563c: 96fe6ed0     	bl	0x5a117c <_ChromeMain+0x59bee0>
 4605640: f10022d6     	subs	x22, x22, #0x8
 4605644: 54ffff41     	b.ne	0x460562c <_ChromeMain+0x4600390>
 4605648: f9424660     	ldr	x0, [x19, #0x488]
 460564c: b4000080     	cbz	x0, 0x460565c <_ChromeMain+0x46003c0>
 4605650: 9400089c     	bl	0x46078c0 <_ChromeMain+0x4602624>
 4605654: f9424660     	ldr	x0, [x19, #0x488]
 4605658: 96fe6ec9     	bl	0x5a117c <_ChromeMain+0x59bee0>
 460565c: f94002a8     	ldr	x8, [x21]
 4605660: b4fffb28     	cbz	x8, 0x46055c4 <_ChromeMain+0x4600328>
 4605664: 52800028     	mov	w8, #0x1                ; =1
