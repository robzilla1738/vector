
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 42773f4: f94002a8     	ldr	x8, [x21]
 42773f8: f9400908     	ldr	x8, [x8, #0x10]
 42773fc: aa1503e0     	mov	x0, x21
 4277400: d63f0100     	blr	x8
 4277404: a90f7f7f     	stp	xzr, xzr, [x27, #0xf0]
 4277408: f900837f     	str	xzr, [x27, #0x100]
 427740c: 3982dfe8     	ldrsb	x8, [sp, #0xb7]
 4277410: 910283e9     	add	x9, sp, #0xa0
 4277414: a94a2fea     	ldp	x10, x11, [sp, #0xa0]
 4277418: f100011f     	cmp	x8, #0x0
 427741c: 9a894143     	csel	x3, x10, x9, mi
 4277420: 7100011f     	cmp	w8, #0x0
 4277424: 9a884164     	csel	x4, x11, x8, mi
 4277428: d004c321     	adrp	x1, 0xdadd000 <dyld_stub_binder+0xdadd000>
 427742c: 91141c21     	add	x1, x1, #0x507
 4277430: d10303a0     	sub	x0, x29, #0xc0
 4277434: 528000a2     	mov	w2, #0x5                ; =5
 4277438: 9750a464     	bl	0x16a05c8 <_ChromeMain+0x169b32c>
 427743c: 9100dfe8     	add	x8, sp, #0x37
 4277440: d10303a1     	sub	x1, x29, #0xc0
 4277444: aa1403e0     	mov	x0, x20
 4277448: 94a9bd91     	bl	0x6ce6a8c <_ChromeMain+0x6ce17f0>
 427744c: 3940dff5     	ldrb	w21, [sp, #0x37]
 4277450: 90015008     	adrp	x8, 0x6c77000 <_ChromeMain+0x6c71d64>
 4277454: 91397108     	add	x8, x8, #0xe5c
 4277458: a9027f48     	stp	x8, xzr, [x26, #0x20]
 427745c: f9000354     	str	x20, [x26]
 4277460: d000a140     	adrp	x0, 0x56a1000 <_ChromeMain+0x569bd64>
 4277464: 91120000     	add	x0, x0, #0x480
 4277468: d10203a1     	sub	x1, x29, #0x80
 427746c: d10283a2     	sub	x2, x29, #0xa0
