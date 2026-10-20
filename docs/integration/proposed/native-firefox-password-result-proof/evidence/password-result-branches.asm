
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4105b04: f9406268     	ldr	x8, [x19, #0xc0]
 4105b08: b4000288     	cbz	x8, 0x4105b58 <_ChromeMain+0x41008bc>
 4105b0c: 19404108     	ldapurb	w8, [x8, #0x4]
 4105b10: 35000248     	cbnz	w8, 0x4105b58 <_ChromeMain+0x41008bc>
 4105b14: f9406668     	ldr	x8, [x19, #0xc8]
 4105b18: b4000208     	cbz	x8, 0x4105b58 <_ChromeMain+0x41008bc>
 4105b1c: f9406268     	ldr	x8, [x19, #0xc0]
 4105b20: b40006a8     	cbz	x8, 0x4105bf4 <_ChromeMain+0x4100958>
 4105b24: 19404108     	ldapurb	w8, [x8, #0x4]
 4105b28: 35000668     	cbnz	w8, 0x4105bf4 <_ChromeMain+0x4100958>
 4105b2c: f9403e69     	ldr	x9, [x19, #0x78]
 4105b30: d360fd28     	lsr	x8, x9, #32
 4105b34: b5000648     	cbnz	x8, 0x4105bfc <_ChromeMain+0x4100960>
 4105b38: f9406668     	ldr	x8, [x19, #0xc8]
 4105b3c: 9104510a     	add	x10, x8, #0x114
 4105b40: 3944710b     	ldrb	w11, [x8, #0x11c]
 4105b44: d3607d29     	lsl	x9, x9, #32
 4105b48: f9000149     	str	x9, [x10]
 4105b4c: 3700006b     	tbnz	w11, #0x0, 0x4105b58 <_ChromeMain+0x41008bc>
 4105b50: 52800029     	mov	w9, #0x1                ; =1
 4105b54: 39047109     	strb	w9, [x8, #0x11c]
 4105b58: f940b260     	ldr	x0, [x19, #0x160]
 4105b5c: 52800101     	mov	w1, #0x8                ; =8
 4105b60: 94dc72d6     	bl	0x78226b8 <_ChromeMain+0x781d41c>
 4105b64: 91066260     	add	x0, x19, #0x198
 4105b68: 94dc6907     	bl	0x781ff84 <_ChromeMain+0x781ace8>
 4105b6c: f940e260     	ldr	x0, [x19, #0x1c0]
 4105b70: 52800101     	mov	w1, #0x8                ; =8
 4105b74: 94d90711     	bl	0x77477b8 <_ChromeMain+0x774251c>
 4105b78: 17ffffdc     	b	0x4105ae8 <_ChromeMain+0x410084c>
 4105b7c: f940b260     	ldr	x0, [x19, #0x160]
 4105b80: aa1403e1     	mov	x1, x20
 4105b84: 94dc72cd     	bl	0x78226b8 <_ChromeMain+0x781d41c>
 4105b88: 91066260     	add	x0, x19, #0x198
 4105b8c: 94dc68fe     	bl	0x781ff84 <_ChromeMain+0x781ace8>
 4105b90: f940e260     	ldr	x0, [x19, #0x1c0]
 4105b94: aa1403e1     	mov	x1, x20
 4105b98: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 4105b9c: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 4105ba0: a94257f6     	ldp	x22, x21, [sp, #0x20]
 4105ba4: 910143ff     	add	sp, sp, #0x50
 4105ba8: 14d90704     	b	0x77477b8 <_ChromeMain+0x774251c>
 4105bac: f9406268     	ldr	x8, [x19, #0xc0]
 4105bb0: b4fffd48     	cbz	x8, 0x4105b58 <_ChromeMain+0x41008bc>
 4105bb4: 19404108     	ldapurb	w8, [x8, #0x4]
 4105bb8: 35fffd08     	cbnz	w8, 0x4105b58 <_ChromeMain+0x41008bc>
 4105bbc: f9406668     	ldr	x8, [x19, #0xc8]
 4105bc0: b4fffcc8     	cbz	x8, 0x4105b58 <_ChromeMain+0x41008bc>
 4105bc4: f9406268     	ldr	x8, [x19, #0xc0]
 4105bc8: b4000228     	cbz	x8, 0x4105c0c <_ChromeMain+0x4100970>
 4105bcc: 19404108     	ldapurb	w8, [x8, #0x4]
 4105bd0: 350001e8     	cbnz	w8, 0x4105c0c <_ChromeMain+0x4100970>
 4105bd4: f9406668     	ldr	x8, [x19, #0xc8]
 4105bd8: 9104510a     	add	x10, x8, #0x114
 4105bdc: 3944710b     	ldrb	w11, [x8, #0x11c]
 4105be0: 52800029     	mov	w9, #0x1                ; =1
 4105be4: f9000149     	str	x9, [x10]
 4105be8: 3707fb8b     	tbnz	w11, #0x0, 0x4105b58 <_ChromeMain+0x41008bc>
 4105bec: 39047109     	strb	w9, [x8, #0x11c]
 4105bf0: 17ffffda     	b	0x4105b58 <_ChromeMain+0x41008bc>
 4105bf4: d4200000     	brk	#0
 4105bf8: d4400000     	hlt	#0
 4105bfc: d4200020     	brk	#0x1
 4105c00: d4200000     	brk	#0
 4105c04: d4400000     	hlt	#0
 4105c08: d4200020     	brk	#0x1
 4105c0c: d4200000     	brk	#0
 4105c10: d4400000     	hlt	#0
 4105c14: d4200020     	brk	#0x1
