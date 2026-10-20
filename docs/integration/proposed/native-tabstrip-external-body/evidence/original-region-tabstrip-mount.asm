
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 464ccfc:      	sub	sp, sp, #0x70
 464cd00:      	stp	x24, x23, [sp, #0x30]
 464cd04:      	stp	x22, x21, [sp, #0x40]
 464cd08:      	stp	x20, x19, [sp, #0x50]
 464cd0c:      	stp	x29, x30, [sp, #0x60]
 464cd10:      	add	x29, sp, #0x60
 464cd14:      	ldr	x20, [x0, #0x478]
 464cd18:      	cbz	x20, 0x464d1c4 <_ChromeMain+0x4647f28>
 464cd1c:      	mov	x19, x0
 464cd20:      	ldr	x0, [x0, #0x680]
 464cd24:      	cbz	x0, 0x464d1b8 <_ChromeMain+0x4647f1c>
 464cd28:      	ldr	x2, [x0, #0x198]
 464cd2c:      	mov	x1, x20
 464cd30:      	bl	0x7793fc <_ChromeMain+0x774160>
 464cd34:      	mov	x0, x20
 464cd38:      	mov	w1, #0x1                ; =1
 464cd3c:      	bl	0x4129628 <_ChromeMain+0x412438c>
 464cd40:      	ldr	x2, [x19, #0x5b0]
 464cd44:      	mov	x0, x20
 464cd48:      	mov	x1, x19
 464cd4c:      	bl	0x41297a0 <_ChromeMain+0x4124504>
 464cd50:      	ldr	x21, [x20, #0x360]
 464cd54:      	adrp	x23, 0x255d000 <_ChromeMain+0x2557d64>
 464cd58:      	add	x23, x23, #0xb00
 464cd5c:      	adrp	x24, 0xebb2000 <dyld_stub_binder+0xebb2000>
 464cd60:      	cbz	x21, 0x464cdd8 <_ChromeMain+0x4647b3c>
 464cd64:      	ldr	x1, [x19, #0x5d0]
 464cd68:      	ldr	x2, [x21, #0x198]
 464cd6c:      	mov	x0, x21
 464cd70:      	bl	0x7793fc <_ChromeMain+0x774160>
 464cd74:      	ldr	x1, [x19, #0x5d0]
 464cd78:      	mov	x0, x21
 464cd7c:      	bl	0x4134400 <_ChromeMain+0x412f164>
 464cd80:      	ldr	x0, [x19, #0x5d0]
 464cd84:      	bl	0x46271b0 <_ChromeMain+0x4621f14>
 464cd88:      	and	x8, x19, #0xfffffffc00000000
 464cd8c:      	ldr	x9, [x24, #0x88]
 464cd90:      	cmp	x8, x9
 464cd94:      	b.ne	0x464cda0 <_ChromeMain+0x4647b04>
 464cd98:      	mov	x0, x19
 464cd9c:      	bl	0x142fc <_ChromeMain+0xf060>
 464cda0:      	mov	w0, #0x30               ; =48
 464cda4:      	bl	0xf368 <_ChromeMain+0xa0cc>
 464cda8:      	mov	w8, #0x1                ; =1
 464cdac:      	str	w8, [x0]
 464cdb0:      	adr	x8, 0x4679358 <_ChromeMain+0x46740bc>
 464cdb4:      	nop
 464cdb8:      	adrp	x9, 0x3963000 <_ChromeMain+0x395dd64>
 464cdbc:      	add	x9, x9, #0x480
 464cdc0:      	stp	x8, x9, [x0, #0x8]
 464cdc4:      	str	x23, [x0, #0x18]
 464cdc8:      	str	x19, [x0, #0x28]
 464cdcc:      	ldr	x22, [x21, #0x580]
 464cdd0:      	str	x0, [x21, #0x580]
 464cdd4:      	cbnz	x22, 0x464d13c <_ChromeMain+0x4647ea0>
 464cdd8:      	mov	w0, #0x40               ; =64
 464cddc:      	bl	0xf368 <_ChromeMain+0xa0cc>
 464cde0:      	mov	w8, #0x1                ; =1
 464cde4:      	str	w8, [x0]
 464cde8:      	adrp	x8, 0x1027000 <_ChromeMain+0x1021d64>
 464cdec:      	add	x8, x8, #0x980
 464cdf0:      	adrp	x9, 0x2f2000 <_ChromeMain+0x2ecd64>
 464cdf4:      	add	x9, x9, #0x880
 464cdf8:      	stp	x8, x9, [x0, #0x8]
 464cdfc:      	adrp	x8, 0x3b26000 <_ChromeMain+0x3b20d64>
 464ce00:      	add	x8, x8, #0xc40
 464ce04:      	stp	x23, x8, [x0, #0x18]
 464ce08:      	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 464ce0c:      	ldr	q0, [x8, #0x760]
 464ce10:      	stur	q0, [x0, #0x28]
 464ce14:      	strb	wzr, [x0, #0x38]
 464ce18:      	str	x0, [sp]
 464ce1c:      	movi.2s	v0, #0x1
 464ce20:      	str	d0, [sp, #0x8]
 464ce24:      	mov	w8, #0x3                ; =3
 464ce28:      	str	w8, [sp, #0x10]
 464ce2c:      	stp	xzr, xzr, [sp, #0x20]
 464ce30:      	str	xzr, [sp, #0x18]
 464ce34:      	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 464ce38:      	add	x1, x1, #0x548
 464ce3c:      	add	x0, x20, #0xd8
 464ce40:      	mov	x2, sp
 464ce44:      	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 464ce48:      	mov	x0, sp
 464ce4c:      	bl	0x174ad24 <_ChromeMain+0x1745a88>
 464ce50:      	adrp	x8, 0xdf3a000 <dyld_stub_binder+0xdf3a000>
 464ce54:      	ldr	q0, [x8, #0x3e0]
 464ce58:      	str	q0, [sp]
 464ce5c:      	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 464ce60:      	add	x1, x1, #0x488
 464ce64:      	add	x0, x20, #0xd8
 464ce68:      	mov	x2, sp
 464ce6c:      	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 464ce70:      	ldr	x8, [x19, #0x458]
 464ce74:      	ldr	x8, [x8, #0x538]
 464ce78:      	add	x9, x8, #0x28
 464ce7c:      	cmp	x8, #0x0
 464ce80:      	csel	x9, xzr, x9, eq
 464ce84:      	ldr	x8, [x9, #0x160]
 464ce88:      	cbz	x8, 0x464cee4 <_ChromeMain+0x4647c48>
 464ce8c:      	add	x9, x9, #0x160
 464ce90:      	adrp	x10, 0xe87b000 <dyld_stub_binder+0xe87b000>
 464ce94:      	add	x10, x10, #0x218
 464ce98:      	b	0x464cecc <_ChromeMain+0x4647c30>
 464ce9c:      	cmp	x8, x9
 464cea0:      	b.eq	0x464cee4 <_ChromeMain+0x4647c48>
 464cea4:      	ldr	x20, [x8, #0x28]
 464cea8:      	and	x8, x20, #0xfffffffc00000000
 464ceac:      	ldr	x9, [x24, #0x88]
 464ceb0:      	cmp	x8, x9
 464ceb4:      	b.ne	0x464cee8 <_ChromeMain+0x4647c4c>
 464ceb8:      	mov	x0, x20
 464cebc:      	bl	0x142fc <_ChromeMain+0xf060>
 464cec0:      	b	0x464cee8 <_ChromeMain+0x4647c4c>
 464cec4:      	ldr	x8, [x8]
 464cec8:      	cbz	x8, 0x464cee4 <_ChromeMain+0x4647c48>
 464cecc:      	ldr	x11, [x8, #0x20]
 464ced0:      	cmp	x11, x10
 464ced4:      	b.hi	0x464cec4 <_ChromeMain+0x4647c28>
 464ced8:      	b.eq	0x464ce9c <_ChromeMain+0x4647c00>
 464cedc:      	ldr	x8, [x8, #0x8]
 464cee0:      	cbnz	x8, 0x464cecc <_ChromeMain+0x4647c30>
 464cee4:      	mov	x20, #0x0               ; =0
 464cee8:      	and	x8, x20, #0xfffffffc00000000
 464ceec:      	ldr	x9, [x24, #0x88]
 464cef0:      	cmp	x8, x9
 464cef4:      	b.ne	0x464cf00 <_ChromeMain+0x4647c64>
 464cef8:      	mov	x0, x20
 464cefc:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 464cf00:      	ldrb	w8, [x19, #0x8c4]
 464cf04:      	adrp	x9, 0xe87b000 <dyld_stub_binder+0xe87b000>
 464cf08:      	add	x9, x9, #0x298
 464cf0c:      	adrp	x10, 0xe87b000 <dyld_stub_binder+0xe87b000>
 464cf10:      	add	x10, x10, #0x2a0
 464cf14:      	cmp	w8, #0x0
 464cf18:      	csel	x2, x10, x9, ne
 464cf1c:      	adrp	x1, 0xe87b000 <dyld_stub_binder+0xe87b000>
 464cf20:      	add	x1, x1, #0x290
 464cf24:      	mov	x0, x20
 464cf28:      	bl	0x7700914 <_ChromeMain+0x76fb678>
 464cf2c:      	and	x8, x19, #0xfffffffc00000000
 464cf30:      	ldr	x9, [x24, #0x88]
 464cf34:      	cmp	x8, x9
 464cf38:      	b.ne	0x464cf44 <_ChromeMain+0x4647ca8>
 464cf3c:      	mov	x0, x19
 464cf40:      	bl	0x142fc <_ChromeMain+0xf060>
 464cf44:      	mov	w0, #0x38               ; =56
 464cf48:      	bl	0xf368 <_ChromeMain+0xa0cc>
 464cf4c:      	mov	x21, x0
 464cf50:      	mov	w8, #0x1                ; =1
 464cf54:      	str	w8, [x0]
 464cf58:      	adrp	x8, 0x3fb9000 <_ChromeMain+0x3fb3d64>
 464cf5c:      	add	x8, x8, #0x300
 464cf60:      	adrp	x9, 0x3899000 <_ChromeMain+0x3893d64>
 464cf64:      	add	x9, x9, #0xb40
 464cf68:      	stp	x8, x9, [x0, #0x8]
 464cf6c:      	adr	x8, 0x464bf00 <_ChromeMain+0x4646c64>
 464cf70:      	nop
 464cf74:      	stp	x23, x8, [x0, #0x18]
 464cf78:      	stp	xzr, x19, [x0, #0x28]
 464cf7c:      	adrp	x1, 0xe87b000 <dyld_stub_binder+0xe87b000>
 464cf80:      	add	x1, x1, #0x290
 464cf84:      	mov	x0, x20
 464cf88:      	bl	0x11e4758 <_ChromeMain+0x11df4bc>
 464cf8c:      	mov	x8, sp
 464cf90:      	add	x0, x0, #0x1d0
 464cf94:      	mov	x1, x21
 464cf98:      	bl	0x2fecb70 <_ChromeMain+0x2fe78d4>
 464cf9c:      	add	x8, x19, #0x870
 464cfa0:      	ldrb	w9, [x19, #0x878]
 464cfa4:      	tbz	w9, #0x0, 0x464d00c <_ChromeMain+0x4647d70>
 464cfa8:      	add	x0, x19, #0x870
 464cfac:      	mov	x1, sp
 464cfb0:      	bl	0x846ad0 <_ChromeMain+0x841834>
 464cfb4:      	ldr	x20, [sp]
 464cfb8:      	cbz	x20, 0x464d020 <_ChromeMain+0x4647d84>
 464cfbc:      	str	xzr, [sp]
 464cfc0:      	ldr	x8, [x20, #0x8]
 464cfc4:      	mov	x0, x20
 464cfc8:      	blr	x8
 464cfcc:      	mov	w8, #-0x1               ; =-1
 464cfd0:      	ldaddal	w8, w8, [x20]
 464cfd4:      	cmp	w8, #0x1
 464cfd8:      	b.ne	0x464cfe8 <_ChromeMain+0x4647d4c>
 464cfdc:      	ldr	x8, [x20, #0x10]
 464cfe0:      	mov	x0, x20
 464cfe4:      	blr	x8
 464cfe8:      	ldr	x0, [sp]
 464cfec:      	cbz	x0, 0x464d020 <_ChromeMain+0x4647d84>
 464cff0:      	mov	w8, #-0x1               ; =-1
 464cff4:      	ldaddal	w8, w8, [x0]
 464cff8:      	cmp	w8, #0x1
 464cffc:      	b.ne	0x464d020 <_ChromeMain+0x4647d84>
 464d000:      	ldr	x8, [x0, #0x10]
 464d004:      	blr	x8
 464d008:      	b	0x464d020 <_ChromeMain+0x4647d84>
 464d00c:      	cbz	x8, 0x464d1c0 <_ChromeMain+0x4647f24>
 464d010:      	ldr	x8, [sp]
 464d014:      	str	x8, [x19, #0x870]
 464d018:      	mov	w8, #0x1                ; =1
 464d01c:      	strb	w8, [x19, #0x878]
 464d020:      	ldr	x20, [x19, #0x848]
 464d024:      	and	x8, x19, #0xfffffffc00000000
 464d028:      	ldr	x9, [x24, #0x88]
 464d02c:      	cmp	x8, x9
 464d030:      	b.ne	0x464d03c <_ChromeMain+0x4647da0>
 464d034:      	mov	x0, x19
 464d038:      	bl	0x142fc <_ChromeMain+0xf060>
 464d03c:      	mov	w0, #0x38               ; =56
 464d040:      	bl	0xf368 <_ChromeMain+0xa0cc>
 464d044:      	mov	x1, x0
 464d048:      	mov	w8, #0x1                ; =1
 464d04c:      	str	w8, [x0]
 464d050:      	adrp	x8, 0x3fb3000 <_ChromeMain+0x3fadd64>
 464d054:      	add	x8, x8, #0xc00
 464d058:      	adrp	x9, 0x3899000 <_ChromeMain+0x3893d64>
 464d05c:      	add	x9, x9, #0xb40
 464d060:      	stp	x8, x9, [x0, #0x8]
 464d064:      	adrp	x8, 0xc786000 <_ChromeMain+0xc780d64>
 464d068:      	add	x8, x8, #0x7a0
 464d06c:      	stp	x23, x8, [x0, #0x18]
 464d070:      	stp	xzr, x19, [x0, #0x28]
 464d074:      	mov	x8, sp
 464d078:      	add	x0, x20, #0x108
 464d07c:      	bl	0x1bbd2a0 <_ChromeMain+0x1bb8004>
 464d080:      	add	x8, x19, #0x858
 464d084:      	ldrb	w9, [x19, #0x860]
 464d088:      	tbz	w9, #0x0, 0x464d0f0 <_ChromeMain+0x4647e54>
 464d08c:      	add	x0, x19, #0x858
 464d090:      	mov	x1, sp
 464d094:      	bl	0x846ad0 <_ChromeMain+0x841834>
 464d098:      	ldr	x20, [sp]
 464d09c:      	cbz	x20, 0x464d104 <_ChromeMain+0x4647e68>
 464d0a0:      	str	xzr, [sp]
 464d0a4:      	ldr	x8, [x20, #0x8]
 464d0a8:      	mov	x0, x20
 464d0ac:      	blr	x8
 464d0b0:      	mov	w8, #-0x1               ; =-1
 464d0b4:      	ldaddal	w8, w8, [x20]
 464d0b8:      	cmp	w8, #0x1
 464d0bc:      	b.ne	0x464d0cc <_ChromeMain+0x4647e30>
 464d0c0:      	ldr	x8, [x20, #0x10]
 464d0c4:      	mov	x0, x20
 464d0c8:      	blr	x8
 464d0cc:      	ldr	x0, [sp]
 464d0d0:      	cbz	x0, 0x464d104 <_ChromeMain+0x4647e68>
 464d0d4:      	mov	w8, #-0x1               ; =-1
 464d0d8:      	ldaddal	w8, w8, [x0]
 464d0dc:      	cmp	w8, #0x1
 464d0e0:      	b.ne	0x464d104 <_ChromeMain+0x4647e68>
 464d0e4:      	ldr	x8, [x0, #0x10]
 464d0e8:      	blr	x8
 464d0ec:      	b	0x464d104 <_ChromeMain+0x4647e68>
 464d0f0:      	cbz	x8, 0x464d1c0 <_ChromeMain+0x4647f24>
 464d0f4:      	ldr	x8, [sp]
 464d0f8:      	str	x8, [x19, #0x858]
 464d0fc:      	mov	w8, #0x1                ; =1
 464d100:      	strb	w8, [x19, #0x860]
 464d104:      	ldr	x1, [x19, #0x848]
 464d108:      	mov	x0, x19
 464d10c:      	bl	0x4633340 <_ChromeMain+0x462e0a4>
 464d110:      	mov	x0, x19
 464d114:      	bl	0x4645400 <_ChromeMain+0x4640164>
 464d118:      	ldr	x1, [x19, #0x848]
 464d11c:      	mov	x0, x19
 464d120:      	bl	0x4633340 <_ChromeMain+0x462e0a4>
 464d124:      	ldp	x29, x30, [sp, #0x60]
 464d128:      	ldp	x20, x19, [sp, #0x50]
 464d12c:      	ldp	x22, x21, [sp, #0x40]
 464d130:      	ldp	x24, x23, [sp, #0x30]
 464d134:      	add	sp, sp, #0x70
 464d138:      	ret
 464d13c:      	mov	w8, #-0x1               ; =-1
 464d140:      	ldaddal	w8, w8, [x22]
 464d144:      	cmp	w8, #0x1
 464d148:      	b.ne	0x464cdd8 <_ChromeMain+0x4647b3c>
 464d14c:      	ldr	x8, [x22, #0x10]
 464d150:      	adrp	x9, 0xfa5000 <_ChromeMain+0xf9fd64>
 464d154:      	add	x9, x9, #0x640
 464d158:      	cmp	x8, x9
 464d15c:      	b.eq	0x464d184 <_ChromeMain+0x4647ee8>
 464d160:      	adrp	x9, 0x396c000 <_ChromeMain+0x3966d64>
 464d164:      	add	x9, x9, #0x600
 464d168:      	mov	x0, x22
 464d16c:      	cmp	x8, x9
 464d170:      	b.eq	0x464d17c <_ChromeMain+0x4647ee0>
 464d174:      	blr	x8
 464d178:      	b	0x464cdd8 <_ChromeMain+0x4647b3c>
 464d17c:      	mov	w1, #0x38               ; =56
 464d180:      	b	0x464d194 <_ChromeMain+0x4647ef8>
 464d184:      	ldr	x0, [x22, #0x30]
 464d188:      	cbnz	x0, 0x464d19c <_ChromeMain+0x4647f00>
 464d18c:      	mov	x0, x22
 464d190:      	mov	w1, #0x48               ; =72
 464d194:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 464d198:      	b	0x464cdd8 <_ChromeMain+0x4647b3c>
 464d19c:      	mov	w8, #-0x1               ; =-1
 464d1a0:      	ldaddal	w8, w8, [x0]
 464d1a4:      	cmp	w8, #0x1
 464d1a8:      	b.ne	0x464d18c <_ChromeMain+0x4647ef0>
 464d1ac:      	mov	w1, #0x8                ; =8
 464d1b0:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 464d1b4:      	b	0x464d18c <_ChromeMain+0x4647ef0>
 464d1b8:      	brk	#0
 464d1bc:      	hlt	#0
 464d1c0:      	brk	#0x1
 464d1c4:      	brk	#0
 464d1c8:      	hlt	#0
 464d1cc:      	brk	#0x1
		...
 464d1e0:      	stp	x22, x21, [sp, #-0x30]!
 464d1e4:      	stp	x20, x19, [sp, #0x10]
 464d1e8:      	stp	x29, x30, [sp, #0x20]
 464d1ec:      	add	x29, sp, #0x20
 464d1f0:      	mov	x19, x0
 464d1f4:      	ldr	x20, [x0, #0x888]
 464d1f8:      	cbnz	x20, 0x464d294 <_ChromeMain+0x4647ff8>
 464d1fc:      	ldr	x0, [x19, #0xc90]
 464d200:      	str	xzr, [x19, #0xc90]
 464d204:      	cbnz	x0, 0x464d2c4 <_ChromeMain+0x4648028>
 464d208:      	ldrb	w8, [x19, #0x878]
 464d20c:      	cbz	w8, 0x464d21c <_ChromeMain+0x4647f80>
 464d210:      	ldr	x20, [x19, #0x870]
 464d214:      	cbnz	x20, 0x464d324 <_ChromeMain+0x4648088>
 464d218:      	strb	wzr, [x19, #0x878]
 464d21c:      	ldrb	w8, [x19, #0x860]
 464d220:      	cbz	w8, 0x464d230 <_ChromeMain+0x4647f94>
 464d224:      	ldr	x20, [x19, #0x858]
 464d228:      	cbnz	x20, 0x464d2d4 <_ChromeMain+0x4648038>
 464d22c:      	strb	wzr, [x19, #0x860]
 464d230:      	mov	x0, x19
 464d234:      	bl	0x2d944b0 <_ChromeMain+0x2d8f214>
 464d238:      	strb	wzr, [x19, #0xa08]
 464d23c:      	ldr	x20, [x19, #0x478]
 464d240:      	cbz	x20, 0x464d284 <_ChromeMain+0x4647fe8>
 464d244:      	ldr	x8, [x20, #0x360]
 464d248:      	cbz	x8, 0x464d258 <_ChromeMain+0x4647fbc>
 464d24c:      	ldr	x21, [x8, #0x580]
 464d250:      	str	xzr, [x8, #0x580]
 464d254:      	cbnz	x21, 0x464d374 <_ChromeMain+0x46480d8>
 464d258:      	mov	x0, x20
 464d25c:      	mov	x1, #0x0                ; =0
 464d260:      	mov	x2, #0x0                ; =0
 464d264:      	bl	0x41297a0 <_ChromeMain+0x4124504>
 464d268:      	ldr	x2, [x19, #0x198]
 464d26c:      	mov	x0, x19
 464d270:      	mov	x1, x20
 464d274:      	ldp	x29, x30, [sp, #0x20]
 464d278:      	ldp	x20, x19, [sp, #0x10]
 464d27c:      	ldp	x22, x21, [sp], #0x30
 464d280:      	b	0x7793fc <_ChromeMain+0x774160>
 464d284:      	ldp	x29, x30, [sp, #0x20]
 464d288:      	ldp	x20, x19, [sp, #0x10]
 464d28c:      	ldp	x22, x21, [sp], #0x30
 464d290:      	ret
 464d294:      	str	xzr, [x19, #0x888]
 464d298:      	ldr	x1, [x19, #0x880]
 464d29c:      	add	x0, x20, #0xa0
 464d2a0:      	bl	0x29a7370 <_ChromeMain+0x29a20d4>
 464d2a4:      	and	x8, x20, #0xfffffffc00000000
 464d2a8:      	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 464d2ac:      	ldr	x9, [x9, #0x88]
 464d2b0:      	cmp	x8, x9
 464d2b4:      	b.ne	0x464d1fc <_ChromeMain+0x4647f60>
 464d2b8:      	mov	x0, x20
 464d2bc:      	bl	0x22a3c <_ChromeMain+0x1d7a0>
 464d2c0:      	b	0x464d1fc <_ChromeMain+0x4647f60>
 464d2c4:      	bl	0x7fb6458 <_ChromeMain+0x7fb11bc>
 464d2c8:      	mov	w1, #0x18               ; =24
 464d2cc:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 464d2d0:      	b	0x464d208 <_ChromeMain+0x4647f6c>
 464d2d4:      	str	xzr, [x19, #0x858]
 464d2d8:      	ldr	x8, [x20, #0x8]
 464d2dc:      	mov	x0, x20
 464d2e0:      	blr	x8
 464d2e4:      	mov	w8, #-0x1               ; =-1
 464d2e8:      	ldaddal	w8, w8, [x20]
 464d2ec:      	cmp	w8, #0x1
 464d2f0:      	b.ne	0x464d300 <_ChromeMain+0x4648064>
 464d2f4:      	ldr	x8, [x20, #0x10]
 464d2f8:      	mov	x0, x20
 464d2fc:      	blr	x8
 464d300:      	ldr	x0, [x19, #0x858]
 464d304:      	cbz	x0, 0x464d22c <_ChromeMain+0x4647f90>
 464d308:      	mov	w8, #-0x1               ; =-1
 464d30c:      	ldaddal	w8, w8, [x0]
 464d310:      	cmp	w8, #0x1
 464d314:      	b.ne	0x464d22c <_ChromeMain+0x4647f90>
 464d318:      	ldr	x8, [x0, #0x10]
 464d31c:      	blr	x8
 464d320:      	b	0x464d22c <_ChromeMain+0x4647f90>
 464d324:      	str	xzr, [x19, #0x870]
 464d328:      	ldr	x8, [x20, #0x8]
 464d32c:      	mov	x0, x20
 464d330:      	blr	x8
 464d334:      	mov	w8, #-0x1               ; =-1
 464d338:      	ldaddal	w8, w8, [x20]
 464d33c:      	cmp	w8, #0x1
 464d340:      	b.ne	0x464d350 <_ChromeMain+0x46480b4>
 464d344:      	ldr	x8, [x20, #0x10]
 464d348:      	mov	x0, x20
 464d34c:      	blr	x8
 464d350:      	ldr	x0, [x19, #0x870]
 464d354:      	cbz	x0, 0x464d218 <_ChromeMain+0x4647f7c>
 464d358:      	mov	w8, #-0x1               ; =-1
 464d35c:      	ldaddal	w8, w8, [x0]
 464d360:      	cmp	w8, #0x1
 464d364:      	b.ne	0x464d218 <_ChromeMain+0x4647f7c>
 464d368:      	ldr	x8, [x0, #0x10]
 464d36c:      	blr	x8
 464d370:      	b	0x464d218 <_ChromeMain+0x4647f7c>
 464d374:      	mov	w8, #-0x1               ; =-1
 464d378:      	ldaddal	w8, w8, [x21]
 464d37c:      	cmp	w8, #0x1
 464d380:      	b.ne	0x464d258 <_ChromeMain+0x4647fbc>
 464d384:      	ldr	x8, [x21, #0x10]
 464d388:      	adrp	x9, 0xfa5000 <_ChromeMain+0xf9fd64>
 464d38c:      	add	x9, x9, #0x640
 464d390:      	cmp	x8, x9
 464d394:      	b.eq	0x464d3bc <_ChromeMain+0x4648120>
 464d398:      	adrp	x9, 0x396c000 <_ChromeMain+0x3966d64>
 464d39c:      	add	x9, x9, #0x600
 464d3a0:      	mov	x0, x21
 464d3a4:      	cmp	x8, x9
 464d3a8:      	b.eq	0x464d3b4 <_ChromeMain+0x4648118>
 464d3ac:      	blr	x8
 464d3b0:      	b	0x464d258 <_ChromeMain+0x4647fbc>
 464d3b4:      	mov	w1, #0x38               ; =56
 464d3b8:      	b	0x464d3cc <_ChromeMain+0x4648130>
 464d3bc:      	ldr	x0, [x21, #0x30]
 464d3c0:      	cbnz	x0, 0x464d3d4 <_ChromeMain+0x4648138>
 464d3c4:      	mov	x0, x21
 464d3c8:      	mov	w1, #0x48               ; =72
 464d3cc:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 464d3d0:      	b	0x464d258 <_ChromeMain+0x4647fbc>
 464d3d4:      	mov	w8, #-0x1               ; =-1
 464d3d8:      	ldaddal	w8, w8, [x0]
 464d3dc:      	cmp	w8, #0x1
 464d3e0:      	b.ne	0x464d3c4 <_ChromeMain+0x4648128>
 464d3e4:      	mov	w1, #0x8                ; =8
 464d3e8:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 464d3ec:      	b	0x464d3c4 <_ChromeMain+0x4648128>
 464d3f0:      	stp	x22, x21, [sp, #-0x30]!
 464d3f4:      	stp	x20, x19, [sp, #0x10]
 464d3f8:      	stp	x29, x30, [sp, #0x20]
 464d3fc:      	add	x29, sp, #0x20
 464d400:      	ldr	x8, [x0, #0x5b0]
 464d404:      	cbz	x8, 0x464d4a4 <_ChromeMain+0x4648208>
 464d408:      	mov	x21, x0
 464d40c:      	bl	0x1427574 <_ChromeMain+0x14222d8>
 464d410:      	mov	x19, x0
 464d414:      	mov	x20, x1
 464d418:      	ldr	x0, [x21, #0x5b0]
 464d41c:      	bl	0x1427574 <_ChromeMain+0x14222d8>
 464d420:      	lsr	x22, x0, #32
 464d424:      	ldr	x8, [x21, #0x478]
 464d428:      	cbz	x8, 0x464d454 <_ChromeMain+0x46481b8>
 464d42c:      	ldr	x0, [x8, #0x338]
 464d430:      	ldrb	w8, [x0, #0x1c8]
 464d434:      	cbz	w8, 0x464d454 <_ChromeMain+0x46481b8>
 464d438:      	ldr	w8, [x0, #0x1c0]
 464d43c:      	cbz	w8, 0x464d454 <_ChromeMain+0x46481b8>
 464d440:      	ldr	w8, [x0, #0x1c4]
 464d444:      	cbz	w8, 0x464d454 <_ChromeMain+0x46481b8>
 464d448:      	bl	0x1427574 <_ChromeMain+0x14222d8>
 464d44c:      	mov	w8, #-0x4               ; =-4
 464d450:      	add	x22, x8, x0, lsr #32
 464d454:      	mov	w0, #0x3a               ; =58
 464d458:      	bl	0x5038c0 <_ChromeMain+0x4fe624>
 464d45c:      	add	w8, w0, #0xc
 464d460:      	fmov	s0, w20
 464d464:      	fmov	s1, w19
 464d468:      	mov.s	v1[1], w22
 464d46c:      	mov.s	v0[1], w8
 464d470:      	sqadd.2s	v0, v1, v0
 464d474:      	sqsub.2s	v0, v0, v1
 464d478:      	mov.s	w8, v0[1]
 464d47c:      	fmov	w9, s0
 464d480:      	bic	w9, w9, w9, asr #31
 464d484:      	bic	w8, w8, w8, asr #31
 464d488:      	orr	x1, x9, x8, lsl #32
 464d48c:      	bfi	x19, x22, #32, #32
 464d490:      	mov	x0, x19
 464d494:      	ldp	x29, x30, [sp, #0x20]
 464d498:      	ldp	x20, x19, [sp, #0x10]
 464d49c:      	ldp	x22, x21, [sp], #0x30
 464d4a0:      	ret
 464d4a4:      	mov	x1, #0x0                ; =0
 464d4a8:      	mov	x19, #0x0               ; =0
 464d4ac:      	b	0x464d490 <_ChromeMain+0x46481f4>
