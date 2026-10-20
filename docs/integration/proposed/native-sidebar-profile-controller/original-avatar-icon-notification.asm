
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 423fa70: aa1303e0     	mov	x0, x19
 423fa74: 977c310d     	bl	0x214bea8 <_ChromeMain+0x2146c0c>
 423fa78: f9442668     	ldr	x8, [x19, #0x848]
 423fa7c: d37ced14     	lsl	x20, x8, #4
 423fa80: b4000134     	cbz	x20, 0x423faa4 <_ChromeMain+0x423a808>
 423fa84: f9442268     	ldr	x8, [x19, #0x840]
 423fa88: 91002115     	add	x21, x8, #0x8
 423fa8c: f84106a0     	ldr	x0, [x21], #0x10
 423fa90: f9400008     	ldr	x8, [x0]
 423fa94: f9403908     	ldr	x8, [x8, #0x70]
 423fa98: d63f0100     	blr	x8
 423fa9c: f1004294     	subs	x20, x20, #0x10
 423faa0: 54ffff61     	b.ne	0x423fa8c <_ChromeMain+0x423a7f0>
 423faa4: 91202260     	add	x0, x19, #0x808
 423faa8: 52800601     	mov	w1, #0x30               ; =48
 423faac: 52800022     	mov	w2, #0x1                ; =1
 423fab0: 978dc734     	bl	0x25b1780 <_ChromeMain+0x25ac4e4>
 423fab4: d10203a0     	sub	x0, x29, #0x80
