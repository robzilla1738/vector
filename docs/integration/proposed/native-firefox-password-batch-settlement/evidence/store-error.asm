
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 6d814f4: 39410008     	ldrb	w8, [x0, #0x40]
 6d814f8: 340001e8     	cbz	w8, 0x6d81534 <_ChromeMain+0x6d7c298>
 6d814fc: f9403800     	ldr	x0, [x0, #0x70]
 6d81500: b4000180     	cbz	x0, 0x6d81530 <_ChromeMain+0x6d7c294>
 6d81504: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 6d81508: 910003fd     	mov	x29, sp
 6d8150c: 96ec0fe3     	bl	0x2885498 <_ChromeMain+0x28801fc>
 6d81510: 5281bfe8     	mov	w8, #0xdff              ; =3583
 6d81514: 1ac02508     	lsr	w8, w8, w0
 6d81518: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 6d8151c: 37000048     	tbnz	w8, #0x0, 0x6d81524 <_ChromeMain+0x6d7c288>
 6d81520: d42aa160     	brk	#0x550b
 6d81524: 90030668     	adrp	x8, 0xce4d000 <dyld_stub_binder+0xce4d000>
 6d81528: 91309108     	add	x8, x8, #0xc24
 6d8152c: 38604900     	ldrb	w0, [x8, w0, uxtw]
 6d81530: d65f03c0     	ret
 6d81534: 52800020     	mov	w0, #0x1                ; =1
 6d81538: d65f03c0     	ret
 6d8153c: d10343ff     	sub	sp, sp, #0xd0
