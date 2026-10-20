
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 2f93f68: d10703ff     	sub	sp, sp, #0x1c0
 2f93f6c: a9166ffc     	stp	x28, x27, [sp, #0x160]
 2f93f70: a91767fa     	stp	x26, x25, [sp, #0x170]
 2f93f74: a9185ff8     	stp	x24, x23, [sp, #0x180]
 2f93f78: a91957f6     	stp	x22, x21, [sp, #0x190]
 2f93f7c: a91a4ff4     	stp	x20, x19, [sp, #0x1a0]
 2f93f80: a91b7bfd     	stp	x29, x30, [sp, #0x1b0]
 2f93f84: 9106c3fd     	add	x29, sp, #0x1b0
 2f93f88: b00584a8     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 2f93f8c: f940f908     	ldr	x8, [x8, #0x1f0]
 2f93f90: f9400108     	ldr	x8, [x8]
 2f93f94: f81a83a8     	stur	x8, [x29, #-0x58]
 2f93f98: b9001fe1     	str	w1, [sp, #0x1c]
 2f93f9c: f9403008     	ldr	x8, [x0, #0x60]
 2f93fa0: b4003de8     	cbz	x8, 0x2f9475c <_ChromeMain+0x2f8f4c0>
 2f93fa4: aa0203f5     	mov	x21, x2
 2f93fa8: aa0103f4     	mov	x20, x1
 2f93fac: aa0003f3     	mov	x19, x0
 2f93fb0: 39807c08     	ldrsb	x8, [x0, #0x1f]
 2f93fb4: b7f802c8     	tbnz	x8, #0x3f, 0x2f9400c <_ChromeMain+0x2f8ed70>
 2f93fb8: b40002e8     	cbz	x8, 0x2f94014 <_ChromeMain+0x2f8ed78>
 2f93fbc: 5280003a     	mov	w26, #0x1               ; =1
 2f93fc0: 528000c8     	mov	w8, #0x6                ; =6
 2f93fc4: 3900dfe8     	strb	w8, [sp, #0x37]
 2f93fc8: 910083e8     	add	x8, sp, #0x20
 2f93fcc: b27f0509     	orr	x9, x8, #0x6
 2f93fd0: 9005498a     	adrp	x10, 0xd8c3000 <dyld_stub_binder+0xd8c3000>
 2f93fd4: 912bfd4a     	add	x10, x10, #0xaff
 2f93fd8: eb0a013f     	cmp	x9, x10
 2f93fdc: fa4a8102     	ccmp	x8, x10, #0x2, hi
 2f93fe0: 540055a9     	b.ls	0x2f94a94 <_ChromeMain+0x2f8f7f8>
 2f93fe4: 528dcd28     	mov	w8, #0x6e69             ; =28265
 2f93fe8: 79004be8     	strh	w8, [sp, #0x24]
 2f93fec: 528e4de8     	mov	w8, #0x726f             ; =29295
 2f93ff0: 72aced28     	movk	w8, #0x6769, lsl #16
 2f93ff4: b90023e8     	str	w8, [sp, #0x20]
 2f93ff8: 39009bff     	strb	wzr, [sp, #0x26]
 2f93ffc: f9403ab6     	ldr	x22, [x21, #0x70]
 2f94000: b4000a16     	cbz	x22, 0x2f94140 <_ChromeMain+0x2f8eea4>
 2f94004: 528000d7     	mov	w23, #0x6               ; =6
 2f94008: 14000011     	b	0x2f9404c <_ChromeMain+0x2f8edb0>
 2f9400c: f9400a68     	ldr	x8, [x19, #0x10]
 2f94010: b5fffd68     	cbnz	x8, 0x2f93fbc <_ChromeMain+0x2f8ed20>
 2f94014: 3980de68     	ldrsb	x8, [x19, #0x37]
 2f94018: b7f800c8     	tbnz	x8, #0x3f, 0x2f94030 <_ChromeMain+0x2f8ed94>
 2f9401c: b5fffd08     	cbnz	x8, 0x2f93fbc <_ChromeMain+0x2f8ed20>
 2f94020: f9402268     	ldr	x8, [x19, #0x40]
 2f94024: f100011f     	cmp	x8, #0x0
 2f94028: 1a9f07fa     	cset	w26, ne
 2f9402c: 17ffffe5     	b	0x2f93fc0 <_ChromeMain+0x2f8ed24>
 2f94030: f9401668     	ldr	x8, [x19, #0x28]
 2f94034: b5fffc48     	cbnz	x8, 0x2f93fbc <_ChromeMain+0x2f8ed20>
 2f94038: 17fffffa     	b	0x2f94020 <_ChromeMain+0x2f8ed84>
