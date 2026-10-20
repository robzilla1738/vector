
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4254af8: 9105c3e0     	add	x0, sp, #0x170
 4254afc: 910943e1     	add	x1, sp, #0x250
 4254b00: aa1503e2     	mov	x2, x21
 4254b04: 9400161f     	bl	0x425a380 <_ChromeMain+0x42550e4>
 4254b08: 34000100     	cbz	w0, 0x4254b28 <_ChromeMain+0x424f88c>
 4254b0c: 394aa3e8     	ldrb	w8, [sp, #0x2a8]
 4254b10: 360039e8     	tbz	w8, #0x0, 0x425524c <_ChromeMain+0x424ffb0>
 4254b14: 9105c3e0     	add	x0, sp, #0x170
 4254b18: 910943e1     	add	x1, sp, #0x250
 4254b1c: 910062a2     	add	x2, x21, #0x18
 4254b20: 94001982     	bl	0x425b128 <_ChromeMain+0x4255e8c>
 4254b24: 37003ea0     	tbnz	w0, #0x0, 0x42552f8 <_ChromeMain+0x425005c>
 4254b28: 900565a8     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
 4254b2c: b940b108     	ldr	w8, [x8, #0xb0]
 4254b30: 7100091f     	cmp	w8, #0x2
 4254b34: 540006ac     	b.gt	0x4254c08 <_ChromeMain+0x424f96c>
 4254b38: f004c641     	adrp	x1, 0xdb1f000 <dyld_stub_binder+0xdb1f000>
 4254b3c: 91080821     	add	x1, x1, #0x202
 4254b40: 910103f5     	add	x21, sp, #0x40
 4254b44: 910103e0     	add	x0, sp, #0x40
 4254b48: 5280fd22     	mov	w2, #0x7e9              ; =2025
