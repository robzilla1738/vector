
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4105eec: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 4105ef0: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4105ef4: 910043fd     	add	x29, sp, #0x10
 4105ef8: 3945a008     	ldrb	w8, [x0, #0x168]
 4105efc: 36000088     	tbz	w8, #0x0, 0x4105f0c <_ChromeMain+0x4100c70>
 4105f00: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4105f04: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4105f08: d65f03c0     	ret
 4105f0c: aa0003f3     	mov	x19, x0
 4105f10: 3905c01f     	strb	wzr, [x0, #0x170]
 4105f14: f9406008     	ldr	x8, [x0, #0xc0]
 4105f18: b4000268     	cbz	x8, 0x4105f64 <_ChromeMain+0x4100cc8>
 4105f1c: 19404108     	ldapurb	w8, [x8, #0x4]
 4105f20: 35000228     	cbnz	w8, 0x4105f64 <_ChromeMain+0x4100cc8>
 4105f24: f9406668     	ldr	x8, [x19, #0xc8]
 4105f28: b40001e8     	cbz	x8, 0x4105f64 <_ChromeMain+0x4100cc8>
 4105f2c: f9406268     	ldr	x8, [x19, #0xc0]
 4105f30: b4000328     	cbz	x8, 0x4105f94 <_ChromeMain+0x4100cf8>
 4105f34: 19404108     	ldapurb	w8, [x8, #0x4]
 4105f38: 350002e8     	cbnz	w8, 0x4105f94 <_ChromeMain+0x4100cf8>
 4105f3c: f9406668     	ldr	x8, [x19, #0xc8]
 4105f40: 91045109     	add	x9, x8, #0x114
 4105f44: 3944710a     	ldrb	w10, [x8, #0x11c]
 4105f48: b9416e6b     	ldr	w11, [x19, #0x16c]
 4105f4c: 2a0103ec     	mov	w12, w1
 4105f50: aa0b818b     	orr	x11, x12, x11, lsl #32
 4105f54: f900012b     	str	x11, [x9]
 4105f58: 3700006a     	tbnz	w10, #0x0, 0x4105f64 <_ChromeMain+0x4100cc8>
 4105f5c: 52800029     	mov	w9, #0x1                ; =1
 4105f60: 39047109     	strb	w9, [x8, #0x11c]
 4105f64: f940b260     	ldr	x0, [x19, #0x160]
 4105f68: 52800101     	mov	w1, #0x8                ; =8
 4105f6c: 94dc71d3     	bl	0x78226b8 <_ChromeMain+0x781d41c>
 4105f70: 91066260     	add	x0, x19, #0x198
 4105f74: 94dc6804     	bl	0x781ff84 <_ChromeMain+0x781ace8>
 4105f78: f940e260     	ldr	x0, [x19, #0x1c0]
 4105f7c: 52800101     	mov	w1, #0x8                ; =8
 4105f80: 94d9060e     	bl	0x77477b8 <_ChromeMain+0x774251c>
 4105f84: aa1303e0     	mov	x0, x19
 4105f88: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4105f8c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4105f90: 17fffe4a     	b	0x41058b8 <_ChromeMain+0x410061c>
 4105f94: d4200000     	brk	#0
