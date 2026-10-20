
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 35e6e40: 529f5f49     	mov	w9, #0xfafa             ; =64250
 35e6e44: 72a4df49     	movk	w9, #0x26fa, lsl #16
 35e6e48: 52814148     	mov	w8, #0xa0a              ; =2570
 35e6e4c: 72a34148     	movk	w8, #0x1a0a, lsl #16
 35e6e50: 7100029f     	cmp	w20, #0x0
 35e6e54: 1a881136     	csel	w22, w9, w8, ne
 35e6e58: 52800035     	mov	w21, #0x1               ; =1
 35e6e5c: 3900c3f5     	strb	w21, [sp, #0x30]
 35e6e60: 52800500     	mov	w0, #0x28               ; =40
 35e6e64: 9728a141     	bl	0xf368 <_ChromeMain+0xa0cc>
 35e6e68: b9000015     	str	w21, [x0]
 35e6e6c: b0fed1c8     	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e6e70: 91180108     	add	x8, x8, #0x600
 35e6e74: a900a019     	stp	x25, x8, [x0, #0x8]
 35e6e78: f9000c1a     	str	x26, [x0, #0x18]
 35e6e7c: b90023f6     	str	w22, [sp, #0x20]
