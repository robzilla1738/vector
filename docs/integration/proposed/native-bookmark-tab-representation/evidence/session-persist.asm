
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 464ffb8:      	ldr	x8, [x0, #0x458]
 464ffbc:      	cbz	x8, 0x4650074 <_ChromeMain+0x464add8>
 464ffc0:      	sub	sp, sp, #0x60
 464ffc4:      	stp	x24, x23, [sp, #0x20]
 464ffc8:      	stp	x22, x21, [sp, #0x30]
 464ffcc:      	stp	x20, x19, [sp, #0x40]
 464ffd0:      	stp	x29, x30, [sp, #0x50]
 464ffd4:      	add	x29, sp, #0x50
 464ffd8:      	mov	x20, x2
 464ffdc:      	cbz	x2, 0x4650060 <_ChromeMain+0x464adc4>
 464ffe0:      	ldr	x24, [x8, #0x538]
 464ffe4:      	cbz	x24, 0x4650060 <_ChromeMain+0x464adc4>
 464ffe8:      	mov	x19, x3
 464ffec:      	ldrb	w8, [x3, #0x17]
 464fff0:      	ldr	x9, [x3, #0x8]
 464fff4:      	tst	w8, #0x80
 464fff8:      	csel	x8, x9, x8, ne
 464fffc:      	cbz	x8, 0x4650060 <_ChromeMain+0x464adc4>
 4650000:      	ldr	x22, [x1, #0x40]
 4650004:      	cbz	x22, 0x4650060 <_ChromeMain+0x464adc4>
 4650008:      	ldr	x21, [x24, #0x68]
 465000c:      	bl	0x108d1d0 <_ChromeMain+0x1087f34>
 4650010:      	mov	x1, x21
 4650014:      	mov	w2, #0x1                ; =1
 4650018:      	bl	0x52d94 <_ChromeMain+0x4daf8>
 465001c:      	sub	x21, x0, #0x10
 4650020:      	cmp	x0, #0x0
 4650024:      	ccmp	x21, #0x0, #0x4, ne
 4650028:      	b.eq	0x4650060 <_ChromeMain+0x464adc4>
 465002c:      	adrp	x1, 0xd4c9000 <dyld_stub_binder+0xd4c9000>
 4650030:      	add	x1, x1, #0xcf4
 4650034:      	add	x0, x22, #0x8
 4650038:      	bl	0x53170 <_ChromeMain+0x4ded4>
 465003c:      	cbz	x0, 0x4650060 <_ChromeMain+0x464adc4>
 4650040:      	sub	x8, x0, #0x20
 4650044:      	cbz	x8, 0x4650060 <_ChromeMain+0x464adc4>
 4650048:      	ldr	w22, [x0, #0x50]
 465004c:      	cmp	w22, #0x1
 4650050:      	b.lt	0x4650060 <_ChromeMain+0x464adc4>
 4650054:      	ldr	w23, [x24, #0x110]
 4650058:      	cmp	w23, #0x1
 465005c:      	b.ge	0x4650078 <_ChromeMain+0x464addc>
 4650060:      	ldp	x29, x30, [sp, #0x50]
 4650064:      	ldp	x20, x19, [sp, #0x40]
 4650068:      	ldp	x22, x21, [sp, #0x30]
 465006c:      	ldp	x24, x23, [sp, #0x20]
 4650070:      	add	sp, sp, #0x60
 4650074:      	ret
 4650078:      	add	x8, sp, #0x8
 465007c:      	mov	x0, x20
 4650080:      	bl	0x190d6a4 <_ChromeMain+0x1908408>
 4650084:      	adrp	x3, 0xd6e1000 <dyld_stub_binder+0xd6e1000>
 4650088:      	add	x3, x3, #0x7ac
 465008c:      	add	x4, sp, #0x8
 4650090:      	mov	x0, x21
 4650094:      	mov	x1, x23
 4650098:      	mov	x2, x22
 465009c:      	bl	0x7ae5e84 <_ChromeMain+0x7ae0be8>
 46500a0:      	ldrsb	w8, [sp, #0x1f]
 46500a4:      	tbz	w8, #0x1f, 0x46500b8 <_ChromeMain+0x464ae1c>
 46500a8:      	ldr	x0, [sp, #0x8]
 46500ac:      	ldr	x8, [sp, #0x18]
 46500b0:      	and	x1, x8, #0x7fffffffffffffff
 46500b4:      	bl	0x8eb8 <_ChromeMain+0x3c1c>
 46500b8:      	ldr	w1, [x24, #0x110]
 46500bc:      	adrp	x3, 0xd6e1000 <dyld_stub_binder+0xd6e1000>
 46500c0:      	add	x3, x3, #0x7d0
 46500c4:      	mov	x0, x21
 46500c8:      	mov	x2, x22
 46500cc:      	mov	x4, x19
 46500d0:      	bl	0x7ae5e84 <_ChromeMain+0x7ae0be8>
 46500d4:      	b	0x4650060 <_ChromeMain+0x464adc4>
