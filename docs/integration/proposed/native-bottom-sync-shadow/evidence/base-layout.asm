
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 1428754: d10283ff     	sub	sp, sp, #0xa0
 1428758: a9046ffc     	stp	x28, x27, [sp, #0x40]
 142875c: a90567fa     	stp	x26, x25, [sp, #0x50]
 1428760: a9065ff8     	stp	x24, x23, [sp, #0x60]
 1428764: a90757f6     	stp	x22, x21, [sp, #0x70]
 1428768: a9084ff4     	stp	x20, x19, [sp, #0x80]
 142876c: a9097bfd     	stp	x29, x30, [sp, #0x90]
 1428770: 910243fd     	add	x29, sp, #0x90
 1428774: aa0003f3     	mov	x19, x0
 1428778: aa0003e9     	mov	x9, x0
 142877c: f84e8d28     	ldr	x8, [x9, #0xe8]!
 1428780: 3904013f     	strb	wzr, [x9, #0x100]
 1428784: b4000128     	cbz	x8, 0x14287a8 <_ChromeMain+0x142350c>
 1428788: b006aeea     	adrp	x10, 0xea05000 <dyld_stub_binder+0xea05000>
 142878c: 9118214a     	add	x10, x10, #0x608
 1428790: f940110b     	ldr	x11, [x8, #0x20]
 1428794: eb0a017f     	cmp	x11, x10
 1428798: 54000448     	b.hi	0x1428820 <_ChromeMain+0x1423584>
 142879c: 54000482     	b.hs	0x142882c <_ChromeMain+0x1423590>
 14287a0: f9400508     	ldr	x8, [x8, #0x8]
 14287a4: b5ffff68     	cbnz	x8, 0x1428790 <_ChromeMain+0x14234f4>
 14287a8: 91082675     	add	x21, x19, #0x209
 14287ac: 39482668     	ldrb	w8, [x19, #0x209]
 14287b0: 370004c8     	tbnz	w8, #0x0, 0x1428848 <_ChromeMain+0x14235ac>
 14287b4: f9410260     	ldr	x0, [x19, #0x200]
 14287b8: b40000a0     	cbz	x0, 0x14287cc <_ChromeMain+0x1423530>
 14287bc: f9400008     	ldr	x8, [x0]
