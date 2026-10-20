
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 3479904: b903b69f     	str	wzr, [x20, #0x3b4]
 3479908: aa1403e0     	mov	x0, x20
 347990c: 9437358d     	bl	0x4246f40 <_ChromeMain+0x4241ca4>
 3479910: 0aa07c08     	bic	w8, w0, w0, asr #31
 3479914: 6b08031f     	cmp	w24, w8
 3479918: 1a888318     	csel	w24, w24, w8, hi
 347991c: 394012a8     	ldrb	w8, [x21, #0x4]
 3479920: 34000148     	cbz	w8, 0x3479948 <_ChromeMain+0x34746ac>
 3479924: b943ae88     	ldr	w8, [x20, #0x3ac]
 3479928: 7100051f     	cmp	w8, #0x1
 347992c: 540000eb     	b.lt	0x3479948 <_ChromeMain+0x34746ac>
 3479930: aa1403e0     	mov	x0, x20
 3479934: 943735d3     	bl	0x4247080 <_ChromeMain+0x4241de4>
 3479938: b943ae88     	ldr	w8, [x20, #0x3ac]
 347993c: 0b000108     	add	w8, w8, w0
 3479940: 6b1c011f     	cmp	w8, w28
 3479944: 54008c4a     	b.ge	0x347aacc <_ChromeMain+0x3475830>
 3479948: 394ec688     	ldrb	w8, [x20, #0x3b1]
 347994c: 37000068     	tbnz	w8, #0x0, 0x3479958 <_ChromeMain+0x34746bc>
 3479950: b943ae9b     	ldr	w27, [x20, #0x3ac]
 3479954: 14000002     	b	0x347995c <_ChromeMain+0x34746c0>
 3479958: 5280001b     	mov	w27, #0x0               ; =0
 347995c: 53017f1a     	lsr	w26, w24, #1
 3479960: 52800840     	mov	w0, #0x42               ; =66
 3479964: 974227d7     	bl	0x5038c0 <_ChromeMain+0x4fe624>
 3479968: aa0003f9     	mov	x25, x0
 347996c: f941be96     	ldr	x22, [x20, #0x378]
 3479970: b4004f36     	cbz	x22, 0x347a354 <_ChromeMain+0x34750b8>
 3479974: 394722c8     	ldrb	w8, [x22, #0x1c8]
 3479978: 34004a68     	cbz	w8, 0x347a2c4 <_ChromeMain+0x3475028>
