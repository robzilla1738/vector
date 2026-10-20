
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7accc80: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 7accc84: a9017bfd     	stp	x29, x30, [sp, #0x10]
 7accc88: 910043fd     	add	x29, sp, #0x10
 7accc8c: aa0103e2     	mov	x2, x1
 7accc90: aa0003f3     	mov	x19, x0
 7accc94: f002a161     	adrp	x1, 0xcefb000 <dyld_stub_binder+0xcefb000>
 7accc98: 911ba821     	add	x1, x1, #0x6ea
 7accc9c: 96c35365     	bl	0x2ba1a30 <_ChromeMain+0x2b9c794>
 7accca0: 35000080     	cbnz	w0, 0x7acccb0 <_ChromeMain+0x7ac7a14>
 7accca4: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 7accca8: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 7acccac: d65f03c0     	ret
 7acccb0: f9400660     	ldr	x0, [x19, #0x8]
 7acccb4: 91006261     	add	x1, x19, #0x18
 7acccb8: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 7acccbc: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 7acccc0: 16ab970f     	b	0x25b28fc <_ChromeMain+0x25ad660>
 7acccc4: aa0103e2     	mov	x2, x1
 7acccc8: f002a161     	adrp	x1, 0xcefb000 <dyld_stub_binder+0xcefb000>
 7accccc: 9110c021     	add	x1, x1, #0x430
 7acccd0: 17fffef3     	b	0x7acc89c <_ChromeMain+0x7ac7600>
 7acccd4: aa0103e2     	mov	x2, x1
 7acccd8: f002a161     	adrp	x1, 0xcefb000 <dyld_stub_binder+0xcefb000>
 7acccdc: 9111f021     	add	x1, x1, #0x47c
 7accce0: 16c35354     	b	0x2ba1a30 <_ChromeMain+0x2b9c794>
 7accce4: d10103ff     	sub	sp, sp, #0x40
 7accce8: a9024ff4     	stp	x20, x19, [sp, #0x20]
 7acccec: a9037bfd     	stp	x29, x30, [sp, #0x30]
 7acccf0: 9100c3fd     	add	x29, sp, #0x30
 7acccf4: aa0103e2     	mov	x2, x1
 7acccf8: aa0003f4     	mov	x20, x0
 7acccfc: f002a161     	adrp	x1, 0xcefb000 <dyld_stub_binder+0xcefb000>
