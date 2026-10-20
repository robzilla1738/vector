
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 42abc18:      	sub	sp, sp, #0x80
 42abc1c:      	stp	x24, x23, [sp, #0x40]
 42abc20:      	stp	x22, x21, [sp, #0x50]
 42abc24:      	stp	x20, x19, [sp, #0x60]
 42abc28:      	stp	x29, x30, [sp, #0x70]
 42abc2c:      	add	x29, sp, #0x70
 42abc30:      	mov	x20, x0
 42abc34:      	ldr	x8, [x0, #0x398]
 42abc38:      	cbz	x8, 0x42abc44 <_ChromeMain+0x42a69a8>
 42abc3c:      	ldapurb	w8, [x8, #0x4]
 42abc40:      	cbz	w8, 0x42abca4 <_ChromeMain+0x42a6a08>
 42abc44:      	mov	x19, #0x0               ; =0
 42abc48:      	mov	w0, #0x30               ; =48
 42abc4c:      	bl	0xf368 <_ChromeMain+0xa0cc>
 42abc50:      	str	x0, [sp, #0x28]
 42abc54:      	adrp	x8, 0xdf3b000 <dyld_stub_binder+0xdf3b000>
 42abc58:      	ldr	q0, [x8, #0x3e0]
 42abc5c:      	stur	q0, [sp, #0x30]
 42abc60:      	add	x9, x0, #0x20
 42abc64:      	cmp	x9, x0
 42abc68:      	b.lo	0x42abe98 <_ChromeMain+0x42a6bfc>
 42abc6c:      	mov	x21, x0
 42abc70:      	str	q0, [sp]
 42abc74:      	adrp	x8, 0xce48000 <dyld_stub_binder+0xce48000>
 42abc78:      	add	x8, x8, #0x96a
 42abc7c:      	cmp	x9, x8
 42abc80:      	ccmp	x0, x8, #0x2, hi
 42abc84:      	b.ls	0x42abe98 <_ChromeMain+0x42a6bfc>
 42abc88:      	ldp	q0, q1, [x8]
 42abc8c:      	stp	q0, q1, [x21]
 42abc90:      	strb	wzr, [x21, #0x20]
 42abc94:      	ldr	x22, [x20, #0x70]!
 42abc98:      	cbz	x22, 0x42abd4c <_ChromeMain+0x42a6ab0>
 42abc9c:      	mov	w23, #0x20              ; =32
 42abca0:      	b	0x42abcb8 <_ChromeMain+0x42a6a1c>
 42abca4:      	ldr	x19, [x20, #0x3a0]
 42abca8:      	b	0x42abc48 <_ChromeMain+0x42a69ac>
 42abcac:      	b.hi	0x42abcf0 <_ChromeMain+0x42a6a54>
 42abcb0:      	ldr	x22, [x22, #0x8]
 42abcb4:      	cbz	x22, 0x42abd4c <_ChromeMain+0x42a6ab0>
 42abcb8:      	mov	x8, x22
 42abcbc:      	ldr	x9, [x8, #0x20]!
 42abcc0:      	ldrsb	x10, [x8, #0x17]
 42abcc4:      	cmp	x10, #0x0
 42abcc8:      	csel	x1, x9, x8, mi
 42abccc:      	ldr	x8, [x8, #0x8]
 42abcd0:      	cmp	w10, #0x0
 42abcd4:      	csel	x24, x8, x10, mi
 42abcd8:      	cmp	x24, #0x20
 42abcdc:      	csel	x2, x24, x23, lo
 42abce0:      	mov	x0, x21
 42abce4:      	bl	0x8009860 <_ChromeMain+0x80045c4>
 42abce8:      	cbz	w0, 0x42abcfc <_ChromeMain+0x42a6a60>
 42abcec:      	tbz	w0, #0x1f, 0x42abcb0 <_ChromeMain+0x42a6a14>
 42abcf0:      	ldr	x22, [x22]
 42abcf4:      	cbz	x22, 0x42abd4c <_ChromeMain+0x42a6ab0>
 42abcf8:      	b	0x42abcb8 <_ChromeMain+0x42a6a1c>
 42abcfc:      	cmp	x24, #0x20
 42abd00:      	b.ne	0x42abcac <_ChromeMain+0x42a6a10>
 42abd04:      	cmp	x22, x20
 42abd08:      	b.eq	0x42abd4c <_ChromeMain+0x42a6ab0>
 42abd0c:      	ldrsb	x8, [x22, #0x67]
 42abd10:      	tbz	x8, #0x3f, 0x42abd18 <_ChromeMain+0x42a6a7c>
 42abd14:      	ldr	x8, [x22, #0x58]
 42abd18:      	mov	w21, #0x0               ; =0
 42abd1c:      	cbz	x19, 0x42abd50 <_ChromeMain+0x42a6ab4>
 42abd20:      	cbz	x8, 0x42abd50 <_ChromeMain+0x42a6ab4>
 42abd24:      	mov	x0, x19
 42abd28:      	bl	0xf15110 <_ChromeMain+0xf0fe74>
 42abd2c:      	cbz	w0, 0x42abd4c <_ChromeMain+0x42a6ab0>
 42abd30:      	mov	x0, x19
 42abd34:      	bl	0x16a186c <_ChromeMain+0x169c5d0>
 42abd38:      	cbz	x0, 0x42abd4c <_ChromeMain+0x42a6ab0>
 42abd3c:      	add	x0, x0, #0x80
 42abd40:      	add	x1, sp, #0x28
 42abd44:      	bl	0x54304 <_ChromeMain+0x4f068>
 42abd48:      	cbnz	w0, 0x42abdd0 <_ChromeMain+0x42a6b34>
 42abd4c:      	mov	w21, #0x0               ; =0
 42abd50:      	ldrsb	w8, [sp, #0x3f]
 42abd54:      	tbz	w8, #0x1f, 0x42abd68 <_ChromeMain+0x42a6acc>
 42abd58:      	ldr	x0, [sp, #0x28]
 42abd5c:      	ldr	x8, [sp, #0x38]
 42abd60:      	and	x1, x8, #0x7fffffffffffffff
 42abd64:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42abd68:      	mov	x0, x21
 42abd6c:      	ldp	x29, x30, [sp, #0x70]
 42abd70:      	ldp	x20, x19, [sp, #0x60]
 42abd74:      	ldp	x22, x21, [sp, #0x50]
 42abd78:      	ldp	x24, x23, [sp, #0x40]
 42abd7c:      	add	sp, sp, #0x80
 42abd80:      	ret
 42abd84:      	cmp	x24, #0x20
 42abd88:      	b.ne	0x42abe70 <_ChromeMain+0x42a6bd4>
 42abd8c:      	cmp	x22, x20
 42abd90:      	b.eq	0x42abdb0 <_ChromeMain+0x42a6b14>
 42abd94:      	ldrsb	x8, [x22, #0x67]
 42abd98:      	tbz	x8, #0x3f, 0x42abda0 <_ChromeMain+0x42a6b04>
 42abd9c:      	ldr	x8, [x22, #0x58]
 42abda0:      	cbz	x8, 0x42abdb0 <_ChromeMain+0x42a6b14>
 42abda4:      	mov	x0, x19
 42abda8:      	bl	0xf15110 <_ChromeMain+0xf0fe74>
 42abdac:      	cbnz	w0, 0x42abe78 <_ChromeMain+0x42a6bdc>
 42abdb0:      	mov	w21, #0x0               ; =0
 42abdb4:      	ldrsb	w8, [sp, #0x27]
 42abdb8:      	tbz	w8, #0x1f, 0x42abd50 <_ChromeMain+0x42a6ab4>
 42abdbc:      	ldr	x0, [sp, #0x10]
 42abdc0:      	ldr	x8, [sp, #0x20]
 42abdc4:      	and	x1, x8, #0x7fffffffffffffff
 42abdc8:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 42abdcc:      	b	0x42abd50 <_ChromeMain+0x42a6ab4>
 42abdd0:      	mov	w0, #0x30               ; =48
 42abdd4:      	bl	0xf368 <_ChromeMain+0xa0cc>
 42abdd8:      	str	x0, [sp, #0x10]
 42abddc:      	ldr	q0, [sp]
 42abde0:      	stur	q0, [sp, #0x18]
 42abde4:      	add	x9, x0, #0x20
 42abde8:      	cmp	x9, x0
 42abdec:      	b.lo	0x42abe98 <_ChromeMain+0x42a6bfc>
 42abdf0:      	mov	x21, x0
 42abdf4:      	adrp	x8, 0xce48000 <dyld_stub_binder+0xce48000>
 42abdf8:      	add	x8, x8, #0x949
 42abdfc:      	cmp	x9, x8
 42abe00:      	ccmp	x0, x8, #0x2, hi
 42abe04:      	b.ls	0x42abe98 <_ChromeMain+0x42a6bfc>
 42abe08:      	ldp	q0, q1, [x8]
 42abe0c:      	stp	q0, q1, [x21]
 42abe10:      	strb	wzr, [x21, #0x20]
 42abe14:      	ldr	x22, [x20]
 42abe18:      	cbz	x22, 0x42abdb0 <_ChromeMain+0x42a6b14>
 42abe1c:      	mov	w23, #0x20              ; =32
 42abe20:      	b	0x42abe2c <_ChromeMain+0x42a6b90>
 42abe24:      	ldr	x22, [x22, #0x8]
 42abe28:      	cbz	x22, 0x42abdb0 <_ChromeMain+0x42a6b14>
 42abe2c:      	mov	x8, x22
 42abe30:      	ldr	x9, [x8, #0x20]!
 42abe34:      	ldrsb	x10, [x8, #0x17]
 42abe38:      	cmp	x10, #0x0
 42abe3c:      	csel	x1, x9, x8, mi
 42abe40:      	ldr	x8, [x8, #0x8]
 42abe44:      	cmp	w10, #0x0
 42abe48:      	csel	x24, x8, x10, mi
 42abe4c:      	cmp	x24, #0x20
 42abe50:      	csel	x2, x24, x23, lo
 42abe54:      	mov	x0, x21
 42abe58:      	bl	0x8009860 <_ChromeMain+0x80045c4>
 42abe5c:      	cbz	w0, 0x42abd84 <_ChromeMain+0x42a6ae8>
 42abe60:      	tbz	w0, #0x1f, 0x42abe24 <_ChromeMain+0x42a6b88>
 42abe64:      	ldr	x22, [x22]
 42abe68:      	cbz	x22, 0x42abdb0 <_ChromeMain+0x42a6b14>
 42abe6c:      	b	0x42abe2c <_ChromeMain+0x42a6b90>
 42abe70:      	b.hi	0x42abe64 <_ChromeMain+0x42a6bc8>
 42abe74:      	b	0x42abe24 <_ChromeMain+0x42a6b88>
 42abe78:      	mov	x0, x19
 42abe7c:      	bl	0x16a186c <_ChromeMain+0x169c5d0>
 42abe80:      	cbz	x0, 0x42abdb0 <_ChromeMain+0x42a6b14>
 42abe84:      	add	x0, x0, #0x80
 42abe88:      	add	x1, sp, #0x10
 42abe8c:      	bl	0x54304 <_ChromeMain+0x4f068>
 42abe90:      	mov	x21, x0
 42abe94:      	b	0x42abdb4 <_ChromeMain+0x42a6b18>
 42abe98:      	brk	#0x1
