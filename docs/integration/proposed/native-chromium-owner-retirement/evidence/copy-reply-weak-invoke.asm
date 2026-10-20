
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 425f03c: f9401808     	ldr	x8, [x0, #0x30]
 425f040: b4000068     	cbz	x8, 0x425f04c <_ChromeMain+0x4259db0>
 425f044: 19404108     	ldapurb	w8, [x8, #0x4]
 425f048: 34000048     	cbz	w8, 0x425f050 <_ChromeMain+0x4259db4>
 425f04c: d65f03c0     	ret
 425f050: f9401c08     	ldr	x8, [x0, #0x38]
 425f054: b4ffffc8     	cbz	x8, 0x425f04c <_ChromeMain+0x4259db0>
 425f058: f9401809     	ldr	x9, [x0, #0x30]
 425f05c: b4000b09     	cbz	x9, 0x425f1bc <_ChromeMain+0x4259f20>
 425f060: a9422808     	ldp	x8, x10, [x0, #0x20]
 425f064: 19404129     	ldapurb	w9, [x9, #0x4]
 425f068: 35000aa9     	cbnz	w9, 0x425f1bc <_ChromeMain+0x4259f20>
 425f06c: d10483ff     	sub	sp, sp, #0x120
 425f070: a9106ffc     	stp	x28, x27, [sp, #0x100]
 425f074: a9117bfd     	stp	x29, x30, [sp, #0x110]
 425f078: 910443fd     	add	x29, sp, #0x110
 425f07c: 910003e9     	mov	x9, sp
 425f080: f9401c0b     	ldr	x11, [x0, #0x38]
 425f084: 8b8a0560     	add	x0, x11, x10, asr #1
 425f088: 3600006a     	tbz	w10, #0x0, 0x425f094 <_ChromeMain+0x4259df8>
 425f08c: f940000a     	ldr	x10, [x0]
 425f090: f8684948     	ldr	x8, [x10, w8, uxtw]
 425f094: 3940002a     	ldrb	w10, [x1]
 425f098: 390003ea     	strb	w10, [sp]
 425f09c: 3cc08020     	ldur	q0, [x1, #0x8]
 425f0a0: 3c8083e0     	stur	q0, [sp, #0x8]
 425f0a4: f9400c2a     	ldr	x10, [x1, #0x18]
 425f0a8: f9000fea     	str	x10, [sp, #0x18]
 425f0ac: 6f00e400     	movi.2d	v0, #0000000000000000
 425f0b0: 3d800420     	str	q0, [x1, #0x10]
 425f0b4: f900043f     	str	xzr, [x1, #0x8]
 425f0b8: 3dc00821     	ldr	q1, [x1, #0x20]
 425f0bc: 3d800be1     	str	q1, [sp, #0x20]
 425f0c0: f940182a     	ldr	x10, [x1, #0x30]
 425f0c4: f9001bea     	str	x10, [sp, #0x30]
 425f0c8: 3c828020     	stur	q0, [x1, #0x28]
 425f0cc: f900103f     	str	xzr, [x1, #0x20]
 425f0d0: 3cc38021     	ldur	q1, [x1, #0x38]
 425f0d4: 3c8383e1     	stur	q1, [sp, #0x38]
 425f0d8: 3c838020     	stur	q0, [x1, #0x38]
 425f0dc: a944ac2a     	ldp	x10, x11, [x1, #0x48]
 425f0e0: a904fc3f     	stp	xzr, xzr, [x1, #0x48]
 425f0e4: a904afea     	stp	x10, x11, [sp, #0x48]
 425f0e8: 3cc58021     	ldur	q1, [x1, #0x58]
 425f0ec: 3c858020     	stur	q0, [x1, #0x58]
 425f0f0: 3c8583e1     	stur	q1, [sp, #0x58]
 425f0f4: f940342a     	ldr	x10, [x1, #0x68]
 425f0f8: f900343f     	str	xzr, [x1, #0x68]
 425f0fc: f90037ea     	str	x10, [sp, #0x68]
 425f100: 3dc01c21     	ldr	q1, [x1, #0x70]
 425f104: 3d801c20     	str	q0, [x1, #0x70]
 425f108: 3d801fe1     	str	q1, [sp, #0x70]
 425f10c: f940402a     	ldr	x10, [x1, #0x80]
 425f110: f900403f     	str	xzr, [x1, #0x80]
 425f114: 3cc88021     	ldur	q1, [x1, #0x88]
 425f118: 3c888020     	stur	q0, [x1, #0x88]
 425f11c: 3c888121     	stur	q1, [x9, #0x88]
 425f120: f9404c2b     	ldr	x11, [x1, #0x98]
 425f124: f9004c3f     	str	xzr, [x1, #0x98]
 425f128: f90043ea     	str	x10, [sp, #0x80]
 425f12c: f9004feb     	str	x11, [sp, #0x98]
 425f130: 3dc02821     	ldr	q1, [x1, #0xa0]
 425f134: 3d802820     	str	q0, [x1, #0xa0]
 425f138: 3d802be1     	str	q1, [sp, #0xa0]
 425f13c: f940582a     	ldr	x10, [x1, #0xb0]
 425f140: f900583f     	str	xzr, [x1, #0xb0]
 425f144: f9005bea     	str	x10, [sp, #0xb0]
 425f148: 3ccb8021     	ldur	q1, [x1, #0xb8]
 425f14c: 3c8b8020     	stur	q0, [x1, #0xb8]
 425f150: 3c8b8121     	stur	q1, [x9, #0xb8]
 425f154: 390323ff     	strb	wzr, [sp, #0xc8]
 425f158: 3903e3ff     	strb	wzr, [sp, #0xf8]
 425f15c: 3943e029     	ldrb	w9, [x1, #0xf8]
 425f160: 340001e9     	cbz	w9, 0x425f19c <_ChromeMain+0x4259f00>
 425f164: 910003e9     	mov	x9, sp
 425f168: 3ccc8020     	ldur	q0, [x1, #0xc8]
 425f16c: 3c8c8120     	stur	q0, [x9, #0xc8]
 425f170: f9406c2a     	ldr	x10, [x1, #0xd8]
 425f174: f80d812a     	stur	x10, [x9, #0xd8]
 425f178: a90cfc3f     	stp	xzr, xzr, [x1, #0xc8]
 425f17c: 3dc03820     	ldr	q0, [x1, #0xe0]
 425f180: a90dfc3f     	stp	xzr, xzr, [x1, #0xd8]
 425f184: 3d803be0     	str	q0, [sp, #0xe0]
 425f188: f9407829     	ldr	x9, [x1, #0xf0]
 425f18c: f9007be9     	str	x9, [sp, #0xf0]
 425f190: a90efc3f     	stp	xzr, xzr, [x1, #0xe8]
 425f194: 52800029     	mov	w9, #0x1                ; =1
 425f198: 3903e3e9     	strb	w9, [sp, #0xf8]
 425f19c: 910003e1     	mov	x1, sp
 425f1a0: d63f0100     	blr	x8
 425f1a4: 910003e0     	mov	x0, sp
 425f1a8: 97ffe80f     	bl	0x42591e4 <_ChromeMain+0x4253f48>
 425f1ac: a9517bfd     	ldp	x29, x30, [sp, #0x110]
 425f1b0: a9506ffc     	ldp	x28, x27, [sp, #0x100]
 425f1b4: 910483ff     	add	sp, sp, #0x120
 425f1b8: d65f03c0     	ret
 425f1bc: d4200000     	brk	#0
 425f1c0: d4400000     	hlt	#0
