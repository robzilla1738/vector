
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4561988: 15fffcde     	b	0xc560d00 <_ChromeMain+0xc55ba64>
 456198c: 5298ea48     	mov	w8, #0xc752             ; =51026
 4561990: 6b08029f     	cmp	w20, w8
 4561994: 54000d4d     	b.le	0x4561b3c <_ChromeMain+0x455c8a0>
 4561998: 5298ea68     	mov	w8, #0xc753             ; =51027
 456199c: 6b08029f     	cmp	w20, w8
 45619a0: 54000fe0     	b.eq	0x4561b9c <_ChromeMain+0x455c900>
 45619a4: 5299a288     	mov	w8, #0xcd14             ; =52500
 45619a8: 6b08029f     	cmp	w20, w8
 45619ac: 540012c0     	b.eq	0x4561c04 <_ChromeMain+0x455c968>
 45619b0: 5299a2a8     	mov	w8, #0xcd15             ; =52501
 45619b4: 6b08029f     	cmp	w20, w8
 45619b8: 54002561     	b.ne	0x4561e64 <_ChromeMain+0x455cbc8>
 45619bc: f9401e73     	ldr	x19, [x19, #0x38]
 45619c0: b40166d3     	cbz	x19, 0x4564698 <_ChromeMain+0x455f3fc>
 45619c4: 9100a260     	add	x0, x19, #0x28
 45619c8: 970893a4     	bl	0x786858 <_ChromeMain+0x7815bc>
 45619cc: b4015a80     	cbz	x0, 0x456451c <_ChromeMain+0x455f280>
 45619d0: f9400008     	ldr	x8, [x0]
 45619d4: f9416901     	ldr	x1, [x8, #0x2d0]
 45619d8: 14000092     	b	0x4561c20 <_ChromeMain+0x455c984>
 45619dc: 52930b08     	mov	w8, #0x9858             ; =39000
 45619e0: 6b08029f     	cmp	w20, w8
 45619e4: 5400030d     	b.le	0x4561a44 <_ChromeMain+0x455c7a8>
 45619e8: 52930b48     	mov	w8, #0x985a             ; =39002
 45619ec: 6b08029f     	cmp	w20, w8
 45619f0: 5400170a     	b.ge	0x4561cd0 <_ChromeMain+0x455ca34>
