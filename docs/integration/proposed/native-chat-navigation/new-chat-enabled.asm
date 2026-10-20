
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4560518: f9401e68     	ldr	x8, [x19, #0x38]
 456051c: b9406109     	ldr	w9, [x8, #0x60]
 4560520: 34000189     	cbz	w9, 0x4560550 <_ChromeMain+0x455b2b4>
 4560524: 52800015     	mov	w21, #0x0               ; =0
 4560528: f9402660     	ldr	x0, [x19, #0x48]
 456052c: f9400008     	ldr	x8, [x0]
 4560530: f9401d08     	ldr	x8, [x8, #0x38]
 4560534: 5290a261     	mov	w1, #0x8513             ; =34067
 4560538: aa1503e2     	mov	x2, x21
 456053c: d63f0100     	blr	x8
 4560540: f9402674     	ldr	x20, [x19, #0x48]
 4560544: 350000f5     	cbnz	w21, 0x4560560 <_ChromeMain+0x455b2c4>
 4560548: 52800002     	mov	w2, #0x0                ; =0
 456054c: 14000008     	b	0x456056c <_ChromeMain+0x455b2d0>
 4560550: f9403500     	ldr	x0, [x8, #0x68]
 4560554: 971a7731     	bl	0xbfe218 <_ChromeMain+0xbf8f7c>
 4560558: aa0003f5     	mov	x21, x0
 456055c: 17fffff3     	b	0x4560528 <_ChromeMain+0x455b28c>
