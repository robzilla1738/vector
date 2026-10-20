
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 463fde0: 39683008     	ldrb	w8, [x0, #0xa0c]
 463fde4: 34000348     	cbz	w8, 0x463fe4c <_ChromeMain+0x463abb0>
 463fde8: f942ca60     	ldr	x0, [x19, #0x590]
 463fdec: b943a808     	ldr	w8, [x0, #0x3a8]
 463fdf0: 340000a8     	cbz	w8, 0x463fe04 <_ChromeMain+0x463ab68>
 463fdf4: b903a81f     	str	wzr, [x0, #0x3a8]
 463fdf8: 52800021     	mov	w1, #0x1                ; =1
 463fdfc: 96ffc19e     	bl	0x630474 <_ChromeMain+0x62b1d8>
 463fe00: f942ca60     	ldr	x0, [x19, #0x590]
 463fe04: b943ac08     	ldr	w8, [x0, #0x3ac]
 463fe08: 340000a8     	cbz	w8, 0x463fe1c <_ChromeMain+0x463ab80>
 463fe0c: b903ac1f     	str	wzr, [x0, #0x3ac]
 463fe10: 52800021     	mov	w1, #0x1                ; =1
 463fe14: 96ffc198     	bl	0x630474 <_ChromeMain+0x62b1d8>
 463fe18: f942ca60     	ldr	x0, [x19, #0x590]
 463fe1c: 394ee008     	ldrb	w8, [x0, #0x3b8]
 463fe20: 340000a8     	cbz	w8, 0x463fe34 <_ChromeMain+0x463ab98>
 463fe24: 390ee01f     	strb	wzr, [x0, #0x3b8]
 463fe28: 52800001     	mov	w1, #0x0                ; =0
 463fe2c: 96ffc192     	bl	0x630474 <_ChromeMain+0x62b1d8>
 463fe30: f942ca60     	ldr	x0, [x19, #0x590]
 463fe34: 394ec808     	ldrb	w8, [x0, #0x3b2]
 463fe38: 370000a8     	tbnz	w8, #0x0, 0x463fe4c <_ChromeMain+0x463abb0>
 463fe3c: 52800028     	mov	w8, #0x1                ; =1
 463fe40: 390ec808     	strb	w8, [x0, #0x3b2]
 463fe44: 52800001     	mov	w1, #0x0                ; =0
 463fe48: 96ffc18b     	bl	0x630474 <_ChromeMain+0x62b1d8>
