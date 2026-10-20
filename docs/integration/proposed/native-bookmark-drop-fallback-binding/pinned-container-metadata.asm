
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 789e0f0: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 789e0f4: a9017bfd     	stp	x29, x30, [sp, #0x10]
 789e0f8: 910043fd     	add	x29, sp, #0x10
 789e0fc: f003b314     	adrp	x20, 0xef01000 <dyld_stub_binder+0xef01000>
 789e100: f9435e93     	ldr	x19, [x20, #0x6b8]
 789e104: b40000b3     	cbz	x19, 0x789e118 <_ChromeMain+0x7898e7c>
 789e108: aa1303e0     	mov	x0, x19
 789e10c: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 789e110: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 789e114: d65f03c0     	ret
 789e118: 52800d00     	mov	w0, #0x68               ; =104
 789e11c: 961dc493     	bl	0xf368 <_ChromeMain+0xa0cc>
 789e120: aa0003f3     	mov	x19, x0
 789e124: 94000023     	bl	0x789e1b0 <_ChromeMain+0x7898f14>
 789e128: 967c21af     	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 789e12c: f9035e93     	str	x19, [x20, #0x6b8]
 789e130: 17fffff6     	b	0x789e108 <_ChromeMain+0x7898e6c>
 789e134: 00000000     	udf	#0x0
 789e138: 17ffffee     	b	0x789e0f0 <_ChromeMain+0x7898e54>
