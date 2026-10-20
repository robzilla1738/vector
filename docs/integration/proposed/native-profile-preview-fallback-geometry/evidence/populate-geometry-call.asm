
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4654ac4: aa1303e0     	mov	x0, x19
 4654ac8: aa1603e1     	mov	x1, x22
 4654acc: 94001027     	bl	0x4658b68 <_ChromeMain+0x46538cc>
 4654ad0: f9422e68     	ldr	x8, [x19, #0x458]
 4654ad4: b40001c8     	cbz	x8, 0x4654b0c <_ChromeMain+0x464f870>
 4654ad8: f9429d09     	ldr	x9, [x8, #0x538]
 4654adc: b4000189     	cbz	x9, 0x4654b0c <_ChromeMain+0x464f870>
 4654ae0: f9429d00     	ldr	x0, [x8, #0x538]
 4654ae4: 910083e8     	add	x8, sp, #0x20
 4654ae8: aa1403e1     	mov	x1, x20
 4654aec: 97fc1fc5     	bl	0x455ca00 <_ChromeMain+0x4557764>
