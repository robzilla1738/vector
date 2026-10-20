
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 2979d00: f9401808     	ldr	x8, [x0, #0x30]
 2979d04: b4000068     	cbz	x8, 0x2979d10 <_ChromeMain+0x2974a74>
 2979d08: 19404108     	ldapurb	w8, [x8, #0x4]
 2979d0c: 34000048     	cbz	w8, 0x2979d14 <_ChromeMain+0x2974a78>
 2979d10: d65f03c0     	ret
 2979d14: f9401c08     	ldr	x8, [x0, #0x38]
 2979d18: b4ffffc8     	cbz	x8, 0x2979d10 <_ChromeMain+0x2974a74>
 2979d1c: f9401809     	ldr	x9, [x0, #0x30]
 2979d20: b4000149     	cbz	x9, 0x2979d48 <_ChromeMain+0x2974aac>
 2979d24: a9422002     	ldp	x2, x8, [x0, #0x20]
 2979d28: 19404129     	ldapurb	w9, [x9, #0x4]
 2979d2c: 350000e9     	cbnz	w9, 0x2979d48 <_ChromeMain+0x2974aac>
 2979d30: f9401c09     	ldr	x9, [x0, #0x38]
 2979d34: 8b880520     	add	x0, x9, x8, asr #1
 2979d38: 36000068     	tbz	w8, #0x0, 0x2979d44 <_ChromeMain+0x2974aa8>
 2979d3c: f9400008     	ldr	x8, [x0]
 2979d40: f8624902     	ldr	x2, [x8, w2, uxtw]
 2979d44: d61f0040     	br	x2
 2979d48: d4200000     	brk	#0
 2979d4c: d4400000     	hlt	#0
