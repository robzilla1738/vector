
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7ab8320: f941b808     	ldr	x8, [x0, #0x370]
 7ab8324: b4000048     	cbz	x8, 0x7ab832c <_ChromeMain+0x7ab3090>
 7ab8328: d65f03c0     	ret
 7ab832c: 394ee008     	ldrb	w8, [x0, #0x3b8]
 7ab8330: 3707ffc8     	tbnz	w8, #0x0, 0x7ab8328 <_ChromeMain+0x7ab308c>
 7ab8334: b943ac08     	ldr	w8, [x0, #0x3ac]
 7ab8338: 7100011f     	cmp	w8, #0x0
 7ab833c: 7a431904     	ccmp	w8, #0x3, #0x4, ne
 7ab8340: 54ffff40     	b.eq	0x7ab8328 <_ChromeMain+0x7ab308c>
 7ab8344: 162ba38e     	b	0x5a117c <_ChromeMain+0x59bee0>
