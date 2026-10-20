
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45576f4:      	stp	x22, x21, [sp, #-0x30]!
 45576f8:      	stp	x20, x19, [sp, #0x10]
 45576fc:      	stp	x29, x30, [sp, #0x20]
 4557700:      	add	x29, sp, #0x20
 4557704:      	cbz	x0, 0x4557778 <_ChromeMain+0x45524dc>
 4557708:      	mov	x20, x1
 455770c:      	cbz	x1, 0x4557778 <_ChromeMain+0x45524dc>
 4557710:      	mov	x21, x2
 4557714:      	ldrb	w8, [x2, #0x17]
 4557718:      	ldr	x22, [x2, #0x8]
 455771c:      	tst	w8, #0x80
 4557720:      	csel	x8, x22, x8, ne
 4557724:      	cbz	x8, 0x4557778 <_ChromeMain+0x45524dc>
 4557728:      	mov	x19, x0
 455772c:      	mov	w0, #0x28               ; =40
 4557730:      	bl	0xf368 <_ChromeMain+0xa0cc>
 4557734:      	mov	x2, x0
 4557738:      	ldr	x8, [x21]
 455773c:      	ldr	x9, [x21, #0x10]
 4557740:      	stp	xzr, xzr, [x21]
 4557744:      	str	xzr, [x21, #0x10]
 4557748:      	adrp	x10, 0xe4fa000 <dyld_stub_binder+0xe4fa000>
 455774c:      	add	x10, x10, #0xbe0
 4557750:      	stp	x10, x20, [x0]
 4557754:      	stp	x8, x22, [x0, #0x10]
 4557758:      	str	x9, [x0, #0x20]
 455775c:      	adrp	x1, 0xead4000 <dyld_stub_binder+0xead4000>
 4557760:      	add	x1, x1, #0x9a8
 4557764:      	add	x0, x19, #0x8
 4557768:      	ldp	x29, x30, [sp, #0x20]
 455776c:      	ldp	x20, x19, [sp, #0x10]
 4557770:      	ldp	x22, x21, [sp], #0x30
 4557774:      	b	0xf67d00 <_ChromeMain+0xf62a64>
 4557778:      	ldp	x29, x30, [sp, #0x20]
 455777c:      	ldp	x20, x19, [sp, #0x10]
 4557780:      	ldp	x22, x21, [sp], #0x30
 4557784:      	ret
