
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4646654:      	sub	sp, sp, #0x190
 4646658:      	stp	x28, x27, [sp, #0x130]
 464665c:      	stp	x26, x25, [sp, #0x140]
 4646660:      	stp	x24, x23, [sp, #0x150]
 4646664:      	stp	x22, x21, [sp, #0x160]
 4646668:      	stp	x20, x19, [sp, #0x170]
 464666c:      	stp	x29, x30, [sp, #0x180]
 4646670:      	add	x29, sp, #0x180
 4646674:      	mov	w21, #0x0               ; =0
 4646678:      	cbz	x1, 0x4646894 <_ChromeMain+0x46415f8>
 464667c:      	mov	x19, x0
 4646680:      	ldr	x8, [x0, #0x6a0]
 4646684:      	cbz	x8, 0x4646894 <_ChromeMain+0x46415f8>
 4646688:      	mov	x20, x1
 464668c:      	ldr	x22, [x19, #0x468]
 4646690:      	ldr	q0, [x1, #0x80]
 4646694:      	stur	q0, [x29, #-0x90]
 4646698:      	ldr	x8, [x1, #0x90]
 464669c:      	stur	x8, [x29, #-0x80]
 46466a0:      	cbz	x22, 0x46466b4 <_ChromeMain+0x4641418>
 46466a4:      	ldurb	w8, [x29, #-0x80]
 46466a8:      	tbz	w8, #0x0, 0x46466b4 <_ChromeMain+0x4641418>
 46466ac:      	ldr	x21, [x22, #0x8]
 46466b0:      	cbnz	x21, 0x46468dc <_ChromeMain+0x4641640>
 46466b4:      	ldr	x21, [x20, #0x40]
 46466b8:      	cbz	x21, 0x4646894 <_ChromeMain+0x46415f8>
 46466bc:      	str	xzr, [sp, #0xe0]
 46466c0:      	movi.2d	v0, #0000000000000000
 46466c4:      	stp	q0, q0, [sp, #0xc0]
 46466c8:      	stp	q0, q0, [sp, #0xa0]
 46466cc:      	stp	q0, q0, [sp, #0x80]
 46466d0:      	str	q0, [sp, #0x70]
 46466d4:      	ldr	x8, [x21, #0x290]
 46466d8:      	cbnz	x8, 0x46468b8 <_ChromeMain+0x464161c>
 46466dc:      	ldr	x8, [x21, #0x260]
 46466e0:      	ldr	x9, [x8, #0x38]
 46466e4:      	adrp	x10, 0x4045000 <_ChromeMain+0x403fd64>
 46466e8:      	add	x10, x10, #0xf20
 46466ec:      	ldrsw	x8, [x21, #0x2b4]
 46466f0:      	cmp	x9, x10
 46466f4:      	b.ne	0x46468d0 <_ChromeMain+0x4641634>
 46466f8:      	cmn	w8, #0x1
 46466fc:      	b.eq	0x4646ef4 <_ChromeMain+0x4641c58>
 4646700:      	ldr	x9, [x21, #0x280]
 4646704:      	cmp	x9, x8
 4646708:      	b.ls	0x4646cb4 <_ChromeMain+0x4641a18>
 464670c:      	ldr	x9, [x21, #0x278]
 4646710:      	ldr	x8, [x9, x8, lsl #3]
 4646714:      	cbz	x8, 0x4646ee8 <_ChromeMain+0x4641c4c>
 4646718:      	ldrsb	x9, [x8, #0x3f]
 464671c:      	tbnz	x9, #0x3f, 0x4646ed8 <_ChromeMain+0x4641c3c>
 4646720:      	cbnz	x9, 0x4646ee0 <_ChromeMain+0x4641c44>
 4646724:      	ldr	x8, [x8, #0x18]
 4646728:      	ldr	x8, [x8, #0x8]
 464672c:      	add	x1, x8, #0x60
 4646730:      	add	x0, sp, #0x70
 4646734:      	bl	0x139f94 <_ChromeMain+0x134cf8>
 4646738:      	ldrb	w8, [sp, #0x88]
 464673c:      	tbnz	w8, #0x0, 0x4646794 <_ChromeMain+0x46414f8>
 4646740:      	ldrsw	x8, [x21, #0x2b4]
 4646744:      	cmn	w8, #0x1
 4646748:      	b.eq	0x4646f10 <_ChromeMain+0x4641c74>
 464674c:      	ldr	x9, [x21, #0x280]
 4646750:      	cmp	x9, x8
 4646754:      	b.ls	0x4646cb4 <_ChromeMain+0x4641a18>
 4646758:      	ldr	x9, [x21, #0x278]
 464675c:      	ldr	x8, [x9, x8, lsl #3]
 4646760:      	cbz	x8, 0x4646f1c <_ChromeMain+0x4641c80>
 4646764:      	ldrsb	x9, [x8, #0x3f]
 4646768:      	tbnz	x9, #0x3f, 0x4646f00 <_ChromeMain+0x4641c64>
 464676c:      	cbnz	x9, 0x4646f08 <_ChromeMain+0x4641c6c>
 4646770:      	ldr	x8, [x8, #0x18]
 4646774:      	ldr	x8, [x8, #0x8]
 4646778:      	add	x1, x8, #0x60
 464677c:      	add	x0, sp, #0x70
 4646780:      	bl	0x4cb90c <_ChromeMain+0x4c6670>
 4646784:      	ldrb	w8, [sp, #0x88]
 4646788:      	cbnz	w8, 0x4646794 <_ChromeMain+0x46414f8>
 464678c:      	mov	w21, #0x0               ; =0
 4646790:      	b	0x4646864 <_ChromeMain+0x46415c8>
 4646794:      	stp	xzr, xzr, [sp, #0x60]
 4646798:      	stp	xzr, xzr, [sp, #0x50]
 464679c:      	ldr	x0, [x19, #0x6a0]
 46467a0:      	add	x1, sp, #0x70
 46467a4:      	add	x2, sp, #0x68
 46467a8:      	add	x3, sp, #0x50
 46467ac:      	bl	0x46142cc <_ChromeMain+0x460f030>
 46467b0:      	cbz	w0, 0x4646848 <_ChromeMain+0x46415ac>
 46467b4:      	ldrb	w8, [sp, #0x67]
 46467b8:      	ldr	x9, [sp, #0x58]
 46467bc:      	tst	w8, #0x80
 46467c0:      	csel	x8, x9, x8, ne
 46467c4:      	cbnz	x8, 0x4646830 <_ChromeMain+0x4641594>
 46467c8:      	ldr	w8, [sp, #0xac]
 46467cc:      	cmp	w8, #0x1
 46467d0:      	b.lt	0x4646820 <_ChromeMain+0x4641584>
 46467d4:      	ldrb	w9, [sp, #0x87]
 46467d8:      	sxtb	w11, w9
 46467dc:      	ldr	x10, [sp, #0x78]
 46467e0:      	cmp	w11, #0x0
 46467e4:      	csel	x9, x10, x9, mi
 46467e8:      	ldrsw	x10, [sp, #0xa8]
 46467ec:      	subs	x12, x9, x10
 46467f0:      	b.lo	0x4646f28 <_ChromeMain+0x4641c8c>
 46467f4:      	ldr	x13, [sp, #0x70]
 46467f8:      	cmp	w11, #0x0
 46467fc:      	add	x11, sp, #0x70
 4646800:      	csel	x11, x13, x11, mi
 4646804:      	cmp	x12, x8
 4646808:      	csel	x2, x12, x8, lo
 464680c:      	add	x1, x11, x10
 4646810:      	cmp	x9, x10
 4646814:      	b.eq	0x4646828 <_ChromeMain+0x464158c>
 4646818:      	cbnz	x1, 0x4646828 <_ChromeMain+0x464158c>
 464681c:      	b	0x4646cb4 <_ChromeMain+0x4641a18>
 4646820:      	mov	x1, #0x0                ; =0
 4646824:      	mov	x2, #0x0                ; =0
 4646828:      	add	x0, sp, #0x50
 464682c:      	bl	0x4d74c0 <_ChromeMain+0x4d2224>
 4646830:      	ldrb	w9, [sp, #0x67]
 4646834:      	sxtb	w8, w9
 4646838:      	ldr	x2, [sp, #0x58]
 464683c:      	cmp	w8, #0x0
 4646840:      	csel	x9, x2, x9, mi
 4646844:      	cbnz	x9, 0x4646928 <_ChromeMain+0x464168c>
 4646848:      	mov	w21, #0x0               ; =0
 464684c:      	ldrsb	w8, [sp, #0x67]
 4646850:      	tbz	w8, #0x1f, 0x4646864 <_ChromeMain+0x46415c8>
 4646854:      	ldr	x0, [sp, #0x50]
 4646858:      	ldr	x8, [sp, #0x60]
 464685c:      	and	x1, x8, #0x7fffffffffffffff
 4646860:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4646864:      	add	x19, sp, #0x70
 4646868:      	add	x0, x19, #0x70
 464686c:      	mov	x1, #0x0                ; =0
 4646870:      	bl	0x27cb8 <_ChromeMain+0x22a1c>
 4646874:      	add	x0, x19, #0x20
 4646878:      	bl	0x27c78 <_ChromeMain+0x229dc>
 464687c:      	ldrsb	w8, [sp, #0x87]
 4646880:      	tbz	w8, #0x1f, 0x4646894 <_ChromeMain+0x46415f8>
 4646884:      	ldr	x0, [sp, #0x70]
 4646888:      	ldr	x8, [sp, #0x80]
 464688c:      	and	x1, x8, #0x7fffffffffffffff
 4646890:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4646894:      	mov	x0, x21
 4646898:      	ldp	x29, x30, [sp, #0x180]
 464689c:      	ldp	x20, x19, [sp, #0x170]
 46468a0:      	ldp	x22, x21, [sp, #0x160]
 46468a4:      	ldp	x24, x23, [sp, #0x150]
 46468a8:      	ldp	x26, x25, [sp, #0x140]
 46468ac:      	ldp	x28, x27, [sp, #0x130]
 46468b0:      	add	sp, sp, #0x190
 46468b4:      	ret
 46468b8:      	ldr	w9, [x21, #0x2b8]
 46468bc:      	cmn	w9, #0x1
 46468c0:      	b.ne	0x4646eb8 <_ChromeMain+0x4641c1c>
 46468c4:      	ldrb	w9, [x8, #0x348]
 46468c8:      	cbz	w9, 0x4646718 <_ChromeMain+0x464147c>
 46468cc:      	b	0x4646e54 <_ChromeMain+0x4641bb8>
 46468d0:      	cmn	w8, #0x1
 46468d4:      	b.ne	0x4646700 <_ChromeMain+0x4641464>
 46468d8:      	b	0x4646f34 <_ChromeMain+0x4641c98>
 46468dc:      	sub	x1, x29, #0x90
 46468e0:      	mov	x0, x21
 46468e4:      	bl	0x6696a80 <_ChromeMain+0x66917e4>
 46468e8:      	ldr	x8, [x1]
 46468ec:      	add	x9, x21, #0x8
 46468f0:      	cmp	x8, #0x0
 46468f4:      	ccmp	x8, x9, #0x4, ne
 46468f8:      	b.eq	0x46466b4 <_ChromeMain+0x4641418>
 46468fc:      	ldurb	w8, [x29, #-0x80]
 4646900:      	tbz	w8, #0x0, 0x4646ed4 <_ChromeMain+0x4641c38>
 4646904:      	ldr	x0, [x22, #0x8]
 4646908:      	sub	x1, x29, #0x90
 464690c:      	bl	0x7d472f8 <_ChromeMain+0x7d4205c>
 4646910:      	cbz	x0, 0x46466b4 <_ChromeMain+0x4641418>
 4646914:      	b	0x4646df0 <_ChromeMain+0x4641b54>
 4646918:      	ldr	x1, [sp, #0x50]
 464691c:      	add	x0, x25, #0x8
 4646920:      	bl	0x4a8ab4 <_ChromeMain+0x4a3818>
 4646924:      	b	0x464694c <_ChromeMain+0x46416b0>
 4646928:      	add	x25, sp, #0x30
 464692c:      	stp	xzr, xzr, [sp, #0x40]
 4646930:      	ldr	x9, [sp, #0x68]
 4646934:      	stp	x9, xzr, [sp, #0x30]
 4646938:      	tbnz	w8, #0x1f, 0x4646918 <_ChromeMain+0x464167c>
 464693c:      	ldr	q0, [sp, #0x50]
 4646940:      	stur	q0, [x25, #0x8]
 4646944:      	ldr	x8, [sp, #0x60]
 4646948:      	stur	x8, [x25, #0x18]
 464694c:      	ldr	w24, [x20, #0x10]
 4646950:      	ldr	x26, [x19, #0xf98]
 4646954:      	ldr	x11, [x19, #0xfa0]
 4646958:      	add	x8, x11, x11, lsl #2
 464695c:      	lsl	x8, x8, #3
 4646960:      	cbz	x8, 0x46469a4 <_ChromeMain+0x4641708>
 4646964:      	asr	x9, x8, #3
 4646968:      	mov	x10, #-0x3333333333333334 ; =-3689348814741910324
 464696c:      	movk	x10, #0xcccd
 4646970:      	mul	x10, x9, x10
 4646974:      	mov	w9, #0x28               ; =40
 4646978:      	mov	x22, x26
 464697c:      	lsr	x12, x10, #1
 4646980:      	madd	x13, x12, x9, x22
 4646984:      	ldr	w14, [x13], #0x28
 4646988:      	mvn	x15, x10, lsr #1
 464698c:      	add	x10, x10, x15
 4646990:      	cmp	w14, w24
 4646994:      	csel	x10, x10, x12, lt
 4646998:      	csel	x22, x13, x22, lt
 464699c:      	cbnz	x10, 0x464697c <_ChromeMain+0x46416e0>
 46469a0:      	b	0x46469a8 <_ChromeMain+0x464170c>
 46469a4:      	mov	x22, x26
 46469a8:      	mov	w9, #0x28               ; =40
 46469ac:      	madd	x9, x11, x9, x26
 46469b0:      	cmp	x22, x9
 46469b4:      	b.eq	0x46469c4 <_ChromeMain+0x4641728>
 46469b8:      	ldr	w9, [x22]
 46469bc:      	cmp	w24, w9
 46469c0:      	b.ge	0x4646b48 <_ChromeMain+0x46418ac>
 46469c4:      	add	x10, x19, #0xf98
 46469c8:      	add	x9, x19, #0xfa0
 46469cc:      	sub	x15, x22, x26
 46469d0:      	ldr	x12, [x19, #0xfa8]
 46469d4:      	cmp	x11, x12
 46469d8:      	b.ne	0x4646d14 <_ChromeMain+0x4641a78>
 46469dc:      	mov	x8, #0x6666666666666666 ; =7378697629483820646
 46469e0:      	movk	x8, #0x666, lsl #48
 46469e4:      	add	x9, x11, #0x1
 46469e8:      	cmp	x9, x8
 46469ec:      	b.hi	0x4646ecc <_ChromeMain+0x4641c30>
 46469f0:      	mov	x23, #0x0               ; =0
 46469f4:      	lsl	x10, x11, #1
 46469f8:      	cmp	x10, x9
 46469fc:      	csel	x9, x10, x9, hi
 4646a00:      	mov	x10, #0x3333333333333333 ; =3689348814741910323
 4646a04:      	movk	x10, #0x333, lsl #48
 4646a08:      	cmp	x11, x10
 4646a0c:      	csel	x27, x9, x8, lo
 4646a10:      	stur	xzr, [x29, #-0x78]
 4646a14:      	cbz	x27, 0x4646a38 <_ChromeMain+0x464179c>
 4646a18:      	cmp	x27, x8
 4646a1c:      	b.hi	0x4646ed0 <_ChromeMain+0x4641c34>
 4646a20:      	add	x8, x27, x27, lsl #2
 4646a24:      	lsl	x0, x8, #3
 4646a28:      	bl	0xf368 <_ChromeMain+0xa0cc>
 4646a2c:      	mov	x23, x0
 4646a30:      	stur	x0, [x29, #-0x78]
 4646a34:      	sub	x15, x22, x26
 4646a38:      	add	x28, x23, x15
 4646a3c:      	stur	x28, [x29, #-0x70]
 4646a40:      	stur	x27, [x29, #-0x60]
 4646a44:      	asr	x8, x15, #3
 4646a48:      	mov	x9, #-0x3333333333333334 ; =-3689348814741910324
 4646a4c:      	movk	x9, #0xcccd
 4646a50:      	mul	x8, x8, x9
 4646a54:      	cmp	x27, x8
 4646a58:      	b.ne	0x4646a78 <_ChromeMain+0x46417dc>
 4646a5c:      	cmp	x22, x26
 4646a60:      	b.eq	0x4646e08 <_ChromeMain+0x4641b6c>
 4646a64:      	add	x8, x27, #0x1
 4646a68:      	lsr	x8, x8, #1
 4646a6c:      	mov	x9, #-0x28              ; =-40
 4646a70:      	madd	x28, x8, x9, x28
 4646a74:      	stur	x28, [x29, #-0x70]
 4646a78:      	cbz	x28, 0x4646cb4 <_ChromeMain+0x4641a18>
 4646a7c:      	str	w24, [x28]
 4646a80:      	ldr	x8, [sp, #0x30]
 4646a84:      	str	x8, [x28, #0x8]
 4646a88:      	ldur	x8, [x25, #0x18]
 4646a8c:      	ldur	q0, [x25, #0x8]
 4646a90:      	str	q0, [x28, #0x10]
 4646a94:      	str	x8, [x28, #0x20]
 4646a98:      	stp	xzr, xzr, [x25, #0x10]
 4646a9c:      	stur	xzr, [x25, #0x8]
 4646aa0:      	ldur	x8, [x29, #-0x70]
 4646aa4:      	sub	x8, x28, x8
 4646aa8:      	add	x8, x8, #0x28
 4646aac:      	asr	x8, x8, #3
 4646ab0:      	mov	x9, #-0x3333333333333334 ; =-3689348814741910324
 4646ab4:      	movk	x9, #0xcccd
 4646ab8:      	mul	x8, x8, x9
 4646abc:      	stur	x8, [x29, #-0x68]
 4646ac0:      	sub	x0, x29, #0x78
 4646ac4:      	add	x2, x19, #0xf98
 4646ac8:      	add	x3, x19, #0xfa0
 4646acc:      	add	x4, x19, #0xfa8
 4646ad0:      	mov	x1, x22
 4646ad4:      	bl	0x468289c <_ChromeMain+0x467d600>
 4646ad8:      	ldur	x8, [x29, #-0x68]
 4646adc:      	add	x9, x8, x8, lsl #2
 4646ae0:      	lsl	x9, x9, #3
 4646ae4:      	cbz	x9, 0x4646b2c <_ChromeMain+0x4641890>
 4646ae8:      	ldur	x10, [x29, #-0x70]
 4646aec:      	add	x9, x9, x10
 4646af0:      	sub	x22, x9, #0x28
 4646af4:      	mov	x9, #-0x28              ; =-40
 4646af8:      	mul	x23, x8, x9
 4646afc:      	b	0x4646b1c <_ChromeMain+0x4641880>
 4646b00:      	ldr	x0, [x22, #0x10]
 4646b04:      	ldr	x8, [x22, #0x20]
 4646b08:      	and	x1, x8, #0x7fffffffffffffff
 4646b0c:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4646b10:      	sub	x22, x22, #0x28
 4646b14:      	adds	x23, x23, #0x28
 4646b18:      	b.eq	0x4646b2c <_ChromeMain+0x4641890>
 4646b1c:      	cbz	x22, 0x4646cb4 <_ChromeMain+0x4641a18>
 4646b20:      	ldrsb	w8, [x22, #0x27]
 4646b24:      	tbz	w8, #0x1f, 0x4646b10 <_ChromeMain+0x4641874>
 4646b28:      	b	0x4646b00 <_ChromeMain+0x4641864>
 4646b2c:      	ldur	x0, [x29, #-0x78]
 4646b30:      	cbz	x0, 0x4646b70 <_ChromeMain+0x46418d4>
 4646b34:      	ldur	x8, [x29, #-0x60]
 4646b38:      	add	x8, x8, x8, lsl #2
 4646b3c:      	lsl	x1, x8, #3
 4646b40:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4646b44:      	b	0x4646b70 <_ChromeMain+0x46418d4>
 4646b48:      	ldr	x8, [sp, #0x30]
 4646b4c:      	str	x8, [x22, #0x8]
 4646b50:      	ldrsb	w8, [x22, #0x27]
 4646b54:      	tbnz	w8, #0x1f, 0x4646e9c <_ChromeMain+0x4641c00>
 4646b58:      	ldur	q0, [x25, #0x8]
 4646b5c:      	ldur	x8, [x25, #0x18]
 4646b60:      	stur	x8, [x22, #0x20]
 4646b64:      	stur	q0, [x22, #0x10]
 4646b68:      	strb	wzr, [sp, #0x4f]
 4646b6c:      	strb	wzr, [sp, #0x38]
 4646b70:      	ldr	x22, [sp, #0x68]
 4646b74:      	ldrsb	w8, [sp, #0x67]
 4646b78:      	tbnz	w8, #0x1f, 0x4646b90 <_ChromeMain+0x46418f4>
 4646b7c:      	ldr	q0, [sp, #0x50]
 4646b80:      	str	q0, [sp, #0x10]
 4646b84:      	ldr	x8, [sp, #0x60]
 4646b88:      	str	x8, [sp, #0x20]
 4646b8c:      	b	0x4646b9c <_ChromeMain+0x4641900>
 4646b90:      	ldp	x1, x2, [sp, #0x50]
 4646b94:      	add	x0, sp, #0x10
 4646b98:      	bl	0x18218 <_ChromeMain+0x12f7c>
 4646b9c:      	add	x2, sp, #0x10
 4646ba0:      	mov	x0, x21
 4646ba4:      	mov	x1, x22
 4646ba8:      	bl	0x45576f4 <_ChromeMain+0x4552458>
 4646bac:      	ldrsb	w8, [sp, #0x27]
 4646bb0:      	tbz	w8, #0x1f, 0x4646bc4 <_ChromeMain+0x4641928>
 4646bb4:      	ldr	x0, [sp, #0x10]
 4646bb8:      	ldr	x8, [sp, #0x20]
 4646bbc:      	and	x1, x8, #0x7fffffffffffffff
 4646bc0:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4646bc4:      	ldr	x2, [sp, #0x68]
 4646bc8:      	add	x3, sp, #0x50
 4646bcc:      	mov	x0, x19
 4646bd0:      	mov	x1, x20
 4646bd4:      	bl	0x464ffb8 <_ChromeMain+0x464ad1c>
 4646bd8:      	ldr	w8, [x20, #0x10]
 4646bdc:      	ldr	x9, [x19, #0xfb0]
 4646be0:      	ldr	x10, [x19, #0xfb8]
 4646be4:      	lsl	x11, x10, #2
 4646be8:      	cbz	x11, 0x4646c1c <_ChromeMain+0x4641980>
 4646bec:      	asr	x11, x11, #2
 4646bf0:      	mov	x1, x9
 4646bf4:      	lsr	x12, x11, #1
 4646bf8:      	add	x13, x1, x12, lsl #2
 4646bfc:      	ldr	w14, [x13], #0x4
 4646c00:      	mvn	x15, x11, lsr #1
 4646c04:      	add	x11, x11, x15
 4646c08:      	cmp	w14, w8
 4646c0c:      	csel	x11, x11, x12, lt
 4646c10:      	csel	x1, x13, x1, lt
 4646c14:      	cbnz	x11, 0x4646bf4 <_ChromeMain+0x4641958>
 4646c18:      	b	0x4646c20 <_ChromeMain+0x4641984>
 4646c1c:      	mov	x1, x9
 4646c20:      	add	x9, x9, x10, lsl #2
 4646c24:      	mov	x2, x1
 4646c28:      	cmp	x1, x9
 4646c2c:      	b.eq	0x4646c44 <_ChromeMain+0x46419a8>
 4646c30:      	ldr	w9, [x1]
 4646c34:      	cmp	w8, w9
 4646c38:      	mov	w8, #0x4                ; =4
 4646c3c:      	csel	x8, xzr, x8, lt
 4646c40:      	add	x2, x1, x8
 4646c44:      	add	x0, x19, #0xfb0
 4646c48:      	bl	0x4c99930 <_ChromeMain+0x4c94694>
 4646c4c:      	ldrsb	w8, [sp, #0x4f]
 4646c50:      	tbz	w8, #0x1f, 0x4646c64 <_ChromeMain+0x46419c8>
 4646c54:      	ldr	x0, [sp, #0x38]
 4646c58:      	ldr	x8, [sp, #0x48]
 4646c5c:      	and	x1, x8, #0x7fffffffffffffff
 4646c60:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4646c64:      	mov	w21, #0x1               ; =1
 4646c68:      	b	0x464684c <_ChromeMain+0x46415b0>
 4646c6c:      	add	x12, x8, x26
 4646c70:      	add	x12, x12, #0x28
 4646c74:      	ldur	w13, [x12, #-0x50]
 4646c78:      	mov	x14, x12
 4646c7c:      	str	w13, [x14, #-0x28]!
 4646c80:      	ldur	x13, [x14, #-0x20]
 4646c84:      	str	x13, [x14, #0x8]
 4646c88:      	ldur	q0, [x14, #-0x18]
 4646c8c:      	str	q0, [x14, #0x10]
 4646c90:      	ldur	x13, [x14, #-0x8]
 4646c94:      	str	x13, [x14, #0x20]
 4646c98:      	stp	xzr, xzr, [x14, #-0x18]
 4646c9c:      	stur	xzr, [x14, #-0x8]
 4646ca0:      	cmp	x14, x11
 4646ca4:      	b.hs	0x4646cb8 <_ChromeMain+0x4641a1c>
 4646ca8:      	add	x12, x12, #0x28
 4646cac:      	cmp	x12, #0x28
 4646cb0:      	b.ne	0x4646c74 <_ChromeMain+0x46419d8>
 4646cb4:      	brk	#0x1
 4646cb8:      	ldr	x26, [x10]
 4646cbc:      	b	0x4646d90 <_ChromeMain+0x4641af4>
 4646cc0:      	ldr	x0, [x23, #0x10]
 4646cc4:      	ldr	x8, [x23, #0x20]
 4646cc8:      	and	x1, x8, #0x7fffffffffffffff
 4646ccc:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4646cd0:      	sub	x8, x23, #0x18
 4646cd4:      	ldr	q0, [x8]
 4646cd8:      	stur	q0, [x23, #0x10]
 4646cdc:      	ldr	x8, [x8, #0x10]
 4646ce0:      	stur	x8, [x23, #0x20]
 4646ce4:      	sturb	wzr, [x23, #-0x1]
 4646ce8:      	sturb	wzr, [x23, #-0x18]
 4646cec:      	mov	x23, x25
 4646cf0:      	cmp	x25, x22
 4646cf4:      	b.eq	0x4646dbc <_ChromeMain+0x4641b20>
 4646cf8:      	ldr	w8, [x25, #-0x28]!
 4646cfc:      	str	w8, [x23]
 4646d00:      	ldur	x8, [x23, #-0x20]
 4646d04:      	str	x8, [x23, #0x8]
 4646d08:      	ldrsb	w8, [x23, #0x27]
 4646d0c:      	tbnz	w8, #0x1f, 0x4646cc0 <_ChromeMain+0x4641a24>
 4646d10:      	b	0x4646cd0 <_ChromeMain+0x4641a34>
 4646d14:      	add	x11, x26, x8
 4646d18:      	cmp	x22, x11
 4646d1c:      	b.ne	0x4646d6c <_ChromeMain+0x4641ad0>
 4646d20:      	cbz	x22, 0x4646cb4 <_ChromeMain+0x4641a18>
 4646d24:      	str	w24, [x22]
 4646d28:      	ldr	x8, [sp, #0x30]
 4646d2c:      	str	x8, [x22, #0x8]
 4646d30:      	ldur	x8, [x25, #0x18]
 4646d34:      	ldur	q0, [x25, #0x8]
 4646d38:      	str	q0, [x22, #0x10]
 4646d3c:      	str	x8, [x22, #0x20]
 4646d40:      	stp	xzr, xzr, [x25, #0x10]
 4646d44:      	stur	xzr, [x25, #0x8]
 4646d48:      	ldr	x8, [x10]
 4646d4c:      	sub	x8, x22, x8
 4646d50:      	add	x8, x8, #0x28
 4646d54:      	asr	x8, x8, #3
 4646d58:      	mov	x10, #-0x3333333333333334 ; =-3689348814741910324
 4646d5c:      	movk	x10, #0xcccd
 4646d60:      	mul	x8, x8, x10
 4646d64:      	str	x8, [x9]
 4646d68:      	b	0x4646b70 <_ChromeMain+0x46418d4>
 4646d6c:      	ldp	x28, x27, [sp, #0x30]
 4646d70:      	ldr	q0, [sp, #0x40]
 4646d74:      	str	q0, [sp]
 4646d78:      	stp	xzr, xzr, [x25, #0x10]
 4646d7c:      	sub	x23, x11, #0x28
 4646d80:      	stur	xzr, [x25, #0x8]
 4646d84:      	cmp	x23, x11
 4646d88:      	b.lo	0x4646c6c <_ChromeMain+0x46419d0>
 4646d8c:      	add	x12, x26, x8
 4646d90:      	sub	x10, x12, x26
 4646d94:      	asr	x10, x10, #3
 4646d98:      	mov	x11, #-0x3333333333333334 ; =-3689348814741910324
 4646d9c:      	movk	x11, #0xcccd
 4646da0:      	mul	x10, x10, x11
 4646da4:      	str	x10, [x9]
 4646da8:      	add	x9, x15, #0x28
 4646dac:      	cmp	x8, x9
 4646db0:      	b.eq	0x4646dbc <_ChromeMain+0x4641b20>
 4646db4:      	mov	x25, x23
 4646db8:      	b	0x4646cf8 <_ChromeMain+0x4641a5c>
 4646dbc:      	str	w24, [x22]
 4646dc0:      	str	x28, [x22, #0x8]
 4646dc4:      	ldrsb	w8, [x22, #0x27]
 4646dc8:      	tbnz	w8, #0x1f, 0x4646ddc <_ChromeMain+0x4641b40>
 4646dcc:      	str	x27, [x22, #0x10]
 4646dd0:      	ldr	q0, [sp]
 4646dd4:      	stur	q0, [x22, #0x18]
 4646dd8:      	b	0x4646b70 <_ChromeMain+0x46418d4>
 4646ddc:      	ldr	x0, [x22, #0x10]
 4646de0:      	ldr	x8, [x22, #0x20]
 4646de4:      	and	x1, x8, #0x7fffffffffffffff
 4646de8:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4646dec:      	b	0x4646dcc <_ChromeMain+0x4641b30>
 4646df0:      	ldr	x8, [x0, #0xb8]
 4646df4:      	cbz	x8, 0x46466b4 <_ChromeMain+0x4641418>
 4646df8:      	ldrb	w8, [x8, #0x11]
 4646dfc:      	tbz	w8, #0x0, 0x46466b4 <_ChromeMain+0x4641418>
 4646e00:      	mov	w21, #0x0               ; =0
 4646e04:      	b	0x4646894 <_ChromeMain+0x46415f8>
 4646e08:      	lsl	x8, x27, #1
 4646e0c:      	cmp	x8, #0x1
 4646e10:      	csinc	x26, x8, xzr, hi
 4646e14:      	lsr	x8, x26, #2
 4646e18:      	str	x8, [sp]
 4646e1c:      	add	x8, x26, x26, lsl #2
 4646e20:      	lsl	x0, x8, #3
 4646e24:      	bl	0xf368 <_ChromeMain+0xa0cc>
 4646e28:      	mov	w8, #0x28               ; =40
 4646e2c:      	ldr	x9, [sp]
 4646e30:      	madd	x8, x9, x8, x0
 4646e34:      	stp	x0, x8, [x29, #-0x78]
 4646e38:      	stur	x26, [x29, #-0x60]
 4646e3c:      	cbz	x23, 0x4646a78 <_ChromeMain+0x46417dc>
 4646e40:      	add	x8, x27, x27, lsl #2
 4646e44:      	lsl	x1, x8, #3
 4646e48:      	mov	x0, x23
 4646e4c:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4646e50:      	b	0x4646a78 <_ChromeMain+0x46417dc>
 4646e54:      	ldrb	w9, [x21, #0x2e8]
 4646e58:      	cbz	w9, 0x46466dc <_ChromeMain+0x4641440>
 4646e5c:      	ldrsw	x9, [x21, #0x2b4]
 4646e60:      	cmn	w9, #0x1
 4646e64:      	b.eq	0x4646f40 <_ChromeMain+0x4641ca4>
 4646e68:      	ldr	x10, [x21, #0x280]
 4646e6c:      	cmp	x10, x9
 4646e70:      	b.ls	0x4646cb4 <_ChromeMain+0x4641a18>
 4646e74:      	ldr	x10, [x21, #0x278]
 4646e78:      	ldr	x9, [x10, x9, lsl #3]
 4646e7c:      	ldr	w9, [x9, #0x430]
 4646e80:      	cmp	w9, #0x2
 4646e84:      	b.eq	0x46466dc <_ChromeMain+0x4641440>
 4646e88:      	ldr	x9, [x21, #0x268]
 4646e8c:      	cbz	x9, 0x4646f4c <_ChromeMain+0x4641cb0>
 4646e90:      	ldrb	w9, [x9, #0x160]
 4646e94:      	tbnz	w9, #0x0, 0x46466dc <_ChromeMain+0x4641440>
 4646e98:      	b	0x4646718 <_ChromeMain+0x464147c>
 4646e9c:      	ldr	x0, [x22, #0x10]
 4646ea0:      	ldr	x8, [x22, #0x20]
 4646ea4:      	and	x1, x8, #0x7fffffffffffffff
 4646ea8:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 4646eac:      	stp	xzr, xzr, [x22, #0x10]
 4646eb0:      	stur	xzr, [x22, #0x20]
 4646eb4:      	b	0x4646b58 <_ChromeMain+0x46418bc>
 4646eb8:      	ldrb	w9, [x21, #0x2e8]
 4646ebc:      	cbz	w9, 0x46466dc <_ChromeMain+0x4641440>
 4646ec0:      	ldrb	w9, [x8, #0x348]
 4646ec4:      	cbnz	w9, 0x46466dc <_ChromeMain+0x4641440>
 4646ec8:      	b	0x4646718 <_ChromeMain+0x464147c>
 4646ecc:      	bl	0x4bbe000 <_ChromeMain+0x4bb8d64>
 4646ed0:      	bl	0x4c06020 <_ChromeMain+0x4c00d84>
 4646ed4:      	bl	0x4c0031c <_ChromeMain+0x4bfb080>
 4646ed8:      	ldr	x9, [x8, #0x30]
 4646edc:      	cbz	x9, 0x4646724 <_ChromeMain+0x4641488>
 4646ee0:      	add	x1, x8, #0x28
 4646ee4:      	b	0x4646730 <_ChromeMain+0x4641494>
 4646ee8:      	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 4646eec:      	mov	x1, x0
 4646ef0:      	b	0x4646730 <_ChromeMain+0x4641494>
 4646ef4:      	brk	#0
 4646ef8:      	hlt	#0
 4646efc:      	brk	#0x1
 4646f00:      	ldr	x9, [x8, #0x30]
 4646f04:      	cbz	x9, 0x4646770 <_ChromeMain+0x46414d4>
 4646f08:      	add	x1, x8, #0x28
 4646f0c:      	b	0x464677c <_ChromeMain+0x46414e0>
 4646f10:      	brk	#0
 4646f14:      	hlt	#0
 4646f18:      	brk	#0x1
 4646f1c:      	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 4646f20:      	mov	x1, x0
 4646f24:      	b	0x464677c <_ChromeMain+0x46414e0>
 4646f28:      	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 4646f2c:      	add	x0, x0, #0xdd8
 4646f30:      	bl	0x4c002d4 <_ChromeMain+0x4bfb038>
 4646f34:      	brk	#0
 4646f38:      	hlt	#0
 4646f3c:      	brk	#0x1
 4646f40:      	brk	#0
 4646f44:      	hlt	#0
 4646f48:      	brk	#0x1
 4646f4c:      	brk	#0
 4646f50:      	hlt	#0
 4646f54:      	brk	#0x1
