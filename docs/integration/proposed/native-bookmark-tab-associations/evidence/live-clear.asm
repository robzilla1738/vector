
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 464ef84:      	sub	sp, sp, #0x50
 464ef88:      	stp	x22, x21, [sp, #0x20]
 464ef8c:      	stp	x20, x19, [sp, #0x30]
 464ef90:      	stp	x29, x30, [sp, #0x40]
 464ef94:      	add	x29, sp, #0x40
 464ef98:      	ldr	x8, [x0, #0x458]
 464ef9c:      	cbz	x8, 0x464f008 <_ChromeMain+0x4649d6c>
 464efa0:      	ldr	x21, [x8, #0x538]
 464efa4:      	cbz	x21, 0x464f008 <_ChromeMain+0x4649d6c>
 464efa8:      	ldr	x20, [x1, #0x40]
 464efac:      	cbz	x20, 0x464f008 <_ChromeMain+0x4649d6c>
 464efb0:      	ldr	x19, [x21, #0x68]
 464efb4:      	bl	0x108d1d0 <_ChromeMain+0x1087f34>
 464efb8:      	mov	x1, x19
 464efbc:      	mov	w2, #0x1                ; =1
 464efc0:      	bl	0x52d94 <_ChromeMain+0x4daf8>
 464efc4:      	sub	x19, x0, #0x10
 464efc8:      	cmp	x0, #0x0
 464efcc:      	ccmp	x19, #0x0, #0x4, ne
 464efd0:      	b.eq	0x464f008 <_ChromeMain+0x4649d6c>
 464efd4:      	adrp	x1, 0xd4c9000 <dyld_stub_binder+0xd4c9000>
 464efd8:      	add	x1, x1, #0xcf4
 464efdc:      	add	x0, x20, #0x8
 464efe0:      	bl	0x53170 <_ChromeMain+0x4ded4>
 464efe4:      	cbz	x0, 0x464f008 <_ChromeMain+0x4649d6c>
 464efe8:      	sub	x8, x0, #0x20
 464efec:      	cbz	x8, 0x464f008 <_ChromeMain+0x4649d6c>
 464eff0:      	ldr	w20, [x0, #0x50]
 464eff4:      	cmp	w20, #0x1
 464eff8:      	b.lt	0x464f008 <_ChromeMain+0x4649d6c>
 464effc:      	ldr	w1, [x21, #0x110]
 464f000:      	cmp	w1, #0x1
 464f004:      	b.ge	0x464f01c <_ChromeMain+0x4649d80>
 464f008:      	ldp	x29, x30, [sp, #0x40]
 464f00c:      	ldp	x20, x19, [sp, #0x30]
 464f010:      	ldp	x22, x21, [sp, #0x20]
 464f014:      	add	sp, sp, #0x50
 464f018:      	ret
 464f01c:      	mov	w8, #0x1                ; =1
 464f020:      	strb	w8, [sp, #0x1f]
 464f024:      	add	x8, sp, #0x8
 464f028:      	orr	x9, x8, #0x1
 464f02c:      	adrp	x10, 0xd7e8000 <dyld_stub_binder+0xd7e8000>
 464f030:      	add	x10, x10, #0x634
 464f034:      	cmp	x9, x10
 464f038:      	ccmp	x8, x10, #0x2, hi
 464f03c:      	b.ls	0x464f0b8 <_ChromeMain+0x4649e1c>
 464f040:      	mov	w8, #0x30               ; =48
 464f044:      	strh	w8, [sp, #0x8]
 464f048:      	adrp	x3, 0xd6e1000 <dyld_stub_binder+0xd6e1000>
 464f04c:      	add	x3, x3, #0x7ac
 464f050:      	add	x4, sp, #0x8
 464f054:      	mov	x0, x19
 464f058:      	mov	x2, x20
 464f05c:      	bl	0x7ae5e84 <_ChromeMain+0x7ae0be8>
 464f060:      	ldrsb	w8, [sp, #0x1f]
 464f064:      	tbz	w8, #0x1f, 0x464f078 <_ChromeMain+0x4649ddc>
 464f068:      	ldr	x0, [sp, #0x8]
 464f06c:      	ldr	x8, [sp, #0x18]
 464f070:      	and	x1, x8, #0x7fffffffffffffff
 464f074:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 464f078:      	ldr	w1, [x21, #0x110]
 464f07c:      	stp	xzr, xzr, [sp, #0x8]
 464f080:      	str	xzr, [sp, #0x18]
 464f084:      	adrp	x3, 0xd6e1000 <dyld_stub_binder+0xd6e1000>
 464f088:      	add	x3, x3, #0x7d0
 464f08c:      	add	x4, sp, #0x8
 464f090:      	mov	x0, x19
 464f094:      	mov	x2, x20
 464f098:      	bl	0x7ae5e84 <_ChromeMain+0x7ae0be8>
 464f09c:      	ldrsb	w8, [sp, #0x1f]
 464f0a0:      	tbz	w8, #0x1f, 0x464f008 <_ChromeMain+0x4649d6c>
 464f0a4:      	ldr	x0, [sp, #0x8]
 464f0a8:      	ldr	x8, [sp, #0x18]
 464f0ac:      	and	x1, x8, #0x7fffffffffffffff
 464f0b0:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 464f0b4:      	b	0x464f008 <_ChromeMain+0x4649d6c>
 464f0b8:      	brk	#0x1
