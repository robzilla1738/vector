
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7d472f8:      	stp	x22, x21, [sp, #-0x30]!
 7d472fc:      	stp	x20, x19, [sp, #0x10]
 7d47300:      	stp	x29, x30, [sp, #0x20]
 7d47304:      	add	x29, sp, #0x20
 7d47308:      	mov	x19, x1
 7d4730c:      	mov	x20, x0
 7d47310:      	bl	0x6696a80 <_ChromeMain+0x66917e4>
 7d47314:      	ldr	x8, [x1]
 7d47318:      	add	x21, x20, #0x8
 7d4731c:      	cmp	x8, #0x0
 7d47320:      	ccmp	x8, x21, #0x4, ne
 7d47324:      	b.eq	0x7d47354 <_ChromeMain+0x7d420b8>
 7d47328:      	mov	x0, x20
 7d4732c:      	mov	x1, x19
 7d47330:      	bl	0x6696a80 <_ChromeMain+0x66917e4>
 7d47334:      	ldr	x8, [x1]
 7d47338:      	cmp	x8, #0x0
 7d4733c:      	csel	x8, x21, x8, eq
 7d47340:      	ldr	x0, [x8, #0x30]
 7d47344:      	ldp	x29, x30, [sp, #0x20]
 7d47348:      	ldp	x20, x19, [sp, #0x10]
 7d4734c:      	ldp	x22, x21, [sp], #0x30
 7d47350:      	ret
 7d47354:      	brk	#0
 7d47358:      	hlt	#0
 7d4735c:      	brk	#0x1
 7d47360:      	stp	x22, x21, [sp, #-0x30]!
