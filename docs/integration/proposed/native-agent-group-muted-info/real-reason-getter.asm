
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 76832e0: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 76832e4: a9017bfd     	stp	x29, x30, [sp, #0x10]
 76832e8: 910043fd     	add	x29, sp, #0x10
 76832ec: aa0003f3     	mov	x19, x0
 76832f0: 97fe97ef     	bl	0x76292ac <_ChromeMain+0x7624010>
 76832f4: f002c301     	adrp	x1, 0xcee6000 <dyld_stub_binder+0xcee6000>
 76832f8: 9115e021     	add	x1, x1, #0x578
 76832fc: 91002260     	add	x0, x19, #0x8
 7683300: 96273f9c     	bl	0x53170 <_ChromeMain+0x4ded4>
 7683304: b9401000     	ldr	w0, [x0, #0x10]
 7683308: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 768330c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 7683310: d65f03c0     	ret
