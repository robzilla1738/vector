
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4620f98:      	sub	sp, sp, #0xa0
 4620f9c:      	stp	x20, x19, [sp, #0x80]
 4620fa0:      	stp	x29, x30, [sp, #0x90]
 4620fa4:      	add	x29, sp, #0x90
 4620fa8:      	mov	x19, x1
 4620fac:      	mov	x20, x0
 4620fb0:      	bl	0x968804 <_ChromeMain+0x963568>
 4620fb4:      	ldr	w8, [x20, #0x454]
 4620fb8:      	cmp	w8, #0x1
 4620fbc:      	b.ne	0x462109c <_ChromeMain+0x461be00>
 4620fc0:      	add	x8, x20, #0x1c0
 4620fc4:      	movi.2d	v0, #0000000000000000
 4620fc8:      	stur	q0, [sp, #0x48]
 4620fcc:      	stur	q0, [sp, #0x58]
 4620fd0:      	str	xzr, [sp, #0x68]
 4620fd4:      	mov	x9, #0x341              ; =833
 4620fd8:      	movk	x9, #0xbf80, lsl #48
 4620fdc:      	mov	x10, #0x3fc00000        ; =1069547520
 4620fe0:      	movk	x10, #0x4080, lsl #48
 4620fe4:      	stp	x10, x9, [sp, #0x38]
 4620fe8:      	ld1r.2d	{ v0 }, [x8]
 4620fec:      	str	q0, [sp]
 4620ff0:      	mov	x0, x20
 4620ff4:      	bl	0x5a0ff0 <_ChromeMain+0x59bd54>
 4620ff8:      	mov	w1, #0xd8               ; =216
 4620ffc:      	bl	0xf281c8 <_ChromeMain+0xf22f2c>
 4621000:      	bl	0xdced68 <_ChromeMain+0xdc9acc>
 4621004:      	stp	s0, s1, [sp, #0x28]
 4621008:      	stp	s2, s3, [sp, #0x30]
 462100c:      	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 4621010:      	ldr	q0, [x8, #0x40]
 4621014:      	ldr	q1, [sp]
 4621018:      	ushl.2d	v0, v1, v0
 462101c:      	xtn.2s	v0, v0
 4621020:      	str	xzr, [sp, #0x18]
 4621024:      	movi.2d	v1, #0000000000000000
 4621028:      	smax.2s	v0, v0, v1
 462102c:      	ucvtf.2s	v0, v0
 4621030:      	str	d0, [sp, #0x20]
 4621034:      	fmov.4s	v0, #1.00000000
 4621038:      	stur	q0, [x29, #-0x20]
 462103c:      	add	x0, sp, #0x18
 4621040:      	sub	x1, x29, #0x20
 4621044:      	bl	0x1c100 <_ChromeMain+0x16e64>
 4621048:      	ldr	x0, [x19, #0xc0]
 462104c:      	ldp	d0, d1, [sp, #0x18]
 4621050:      	fadd.2s	v1, v0, v1
 4621054:      	stp	d0, d1, [x29, #-0x20]
 4621058:      	ldr	x8, [x0]
 462105c:      	ldr	x8, [x8, #0x108]
 4621060:      	sub	x1, x29, #0x20
 4621064:      	fmov	s0, #10.00000000
 4621068:      	fmov	s1, #10.00000000
 462106c:      	add	x2, sp, #0x28
 4621070:      	blr	x8
 4621074:      	ldr	x0, [sp, #0x68]
 4621078:      	cbnz	x0, 0x4621108 <_ChromeMain+0x461be6c>
 462107c:      	ldr	x0, [sp, #0x60]
 4621080:      	cbnz	x0, 0x46210e4 <_ChromeMain+0x461be48>
 4621084:      	ldr	x0, [sp, #0x58]
 4621088:      	cbnz	x0, 0x4621150 <_ChromeMain+0x461beb4>
 462108c:      	ldr	x0, [sp, #0x50]
 4621090:      	cbnz	x0, 0x46210ac <_ChromeMain+0x461be10>
 4621094:      	ldr	x0, [sp, #0x48]
 4621098:      	cbnz	x0, 0x462112c <_ChromeMain+0x461be90>
 462109c:      	ldp	x29, x30, [sp, #0x90]
 46210a0:      	ldp	x20, x19, [sp, #0x80]
 46210a4:      	add	sp, sp, #0xa0
 46210a8:      	ret
 46210ac:      	add	x8, x0, #0x8
 46210b0:      	mov	w9, #-0x1               ; =-1
 46210b4:      	ldaddal	w9, w8, [x8]
 46210b8:      	cmp	w8, #0x1
 46210bc:      	b.ne	0x4621094 <_ChromeMain+0x461bdf8>
 46210c0:      	ldr	x9, [x0]
 46210c4:      	ldr	x8, [x9, #0x10]
 46210c8:      	adrp	x10, 0x25000 <_ChromeMain+0x1fd64>
 46210cc:      	add	x10, x10, #0x180
 46210d0:      	cmp	x8, x10
 46210d4:      	b.ne	0x46210dc <_ChromeMain+0x461be40>
 46210d8:      	ldr	x8, [x9, #0x8]
 46210dc:      	blr	x8
 46210e0:      	b	0x4621094 <_ChromeMain+0x461bdf8>
 46210e4:      	add	x8, x0, #0x8
 46210e8:      	mov	w9, #-0x1               ; =-1
 46210ec:      	ldaddal	w9, w8, [x8]
 46210f0:      	cmp	w8, #0x1
 46210f4:      	b.ne	0x4621084 <_ChromeMain+0x461bde8>
 46210f8:      	ldr	x8, [x0]
 46210fc:      	ldr	x8, [x8, #0x10]
 4621100:      	blr	x8
 4621104:      	b	0x4621084 <_ChromeMain+0x461bde8>
 4621108:      	add	x8, x0, #0x8
 462110c:      	mov	w9, #-0x1               ; =-1
 4621110:      	ldaddal	w9, w8, [x8]
 4621114:      	cmp	w8, #0x1
 4621118:      	b.ne	0x462107c <_ChromeMain+0x461bde0>
 462111c:      	ldr	x8, [x0]
 4621120:      	ldr	x8, [x8, #0x10]
 4621124:      	blr	x8
 4621128:      	b	0x462107c <_ChromeMain+0x461bde0>
 462112c:      	add	x8, x0, #0x8
 4621130:      	mov	w9, #-0x1               ; =-1
 4621134:      	ldaddal	w9, w8, [x8]
 4621138:      	cmp	w8, #0x1
 462113c:      	b.ne	0x462109c <_ChromeMain+0x461be00>
 4621140:      	ldr	x8, [x0]
 4621144:      	ldr	x8, [x8, #0x10]
 4621148:      	blr	x8
 462114c:      	b	0x462109c <_ChromeMain+0x461be00>
 4621150:      	add	x8, x0, #0x8
 4621154:      	mov	w9, #-0x1               ; =-1
 4621158:      	ldaddal	w9, w8, [x8]
 462115c:      	cmp	w8, #0x1
 4621160:      	b.ne	0x462108c <_ChromeMain+0x461bdf0>
 4621164:      	ldr	x8, [x0]
 4621168:      	ldr	x8, [x8, #0x10]
 462116c:      	blr	x8
 4621170:      	b	0x462108c <_ChromeMain+0x461bdf0>
