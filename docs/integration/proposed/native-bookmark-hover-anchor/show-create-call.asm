
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 c7abd3c:      	sub	sp, sp, #0x40
 c7abd40:      	stp	x22, x21, [sp, #0x10]
 c7abd44:      	stp	x20, x19, [sp, #0x20]
 c7abd48:      	stp	x29, x30, [sp, #0x30]
 c7abd4c:      	add	x29, sp, #0x30
 c7abd50:      	ldr	x8, [x0, #0x48]
 c7abd54:      	cbz	x8, 0xc7abd6c <_ChromeMain+0xc7a6ad0>
 c7abd58:      	ldp	x29, x30, [sp, #0x30]
 c7abd5c:      	ldp	x20, x19, [sp, #0x20]
 c7abd60:      	ldp	x22, x21, [sp, #0x10]
 c7abd64:      	add	sp, sp, #0x40
 c7abd68:      	ret
 c7abd6c:      	mov	x21, x2
 c7abd70:      	mov	x19, x0
 c7abd74:      	ldr	x0, [x0, #0x30]
 c7abd78:      	cmp	x0, x2
 c7abd7c:      	ccmp	x0, #0x0, #0x4, eq
 c7abd80:      	b.eq	0xc7abd58 <_ChromeMain+0xc7a6abc>
 c7abd84:      	mov	x20, x1
 c7abd88:      	ldr	x8, [x0]
 c7abd8c:      	ldr	x8, [x8, #0x18]
 c7abd90:      	blr	x8
 c7abd94:      	cbz	w0, 0xc7abd58 <_ChromeMain+0xc7a6abc>
 c7abd98:      	ldr	x1, [x19, #0x30]
 c7abd9c:      	mov	x0, x19
 c7abda0:      	bl	0xc7ab260 <_ChromeMain+0xc7a5fc4>
 c7abda4:      	ldr	x0, [x19, #0x30]
 c7abda8:      	cbz	x0, 0xc7abdec <_ChromeMain+0xc7a6b50>
 c7abdac:      	ldr	x8, [x0]
