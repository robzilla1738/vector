
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 461b5bc:      	cbz	x0, 0x461b618 <_ChromeMain+0x461637c>
 461b5c0:      	stp	x22, x21, [sp, #-0x30]!
 461b5c4:      	stp	x20, x19, [sp, #0x10]
 461b5c8:      	stp	x29, x30, [sp, #0x20]
 461b5cc:      	add	x29, sp, #0x20
 461b5d0:      	mov	x19, x1
 461b5d4:      	ldr	x8, [x0, #0x60]
 461b5d8:      	cmp	x8, x1
 461b5dc:      	b.eq	0x461b60c <_ChromeMain+0x4616370>
 461b5e0:      	ldr	x8, [x0, #0x48]
 461b5e4:      	lsl	x20, x8, #3
 461b5e8:      	cbz	x20, 0x461b608 <_ChromeMain+0x461636c>
 461b5ec:      	ldr	x21, [x0, #0x40]
 461b5f0:      	ldr	x0, [x21], #0x8
 461b5f4:      	mov	x1, x19
 461b5f8:      	bl	0x461b5bc <_ChromeMain+0x4616320>
 461b5fc:      	cbnz	x0, 0x461b60c <_ChromeMain+0x4616370>
 461b600:      	subs	x20, x20, #0x8
 461b604:      	b.ne	0x461b5f0 <_ChromeMain+0x4616354>
 461b608:      	mov	x0, #0x0                ; =0
 461b60c:      	ldp	x29, x30, [sp, #0x20]
 461b610:      	ldp	x20, x19, [sp, #0x10]
 461b614:      	ldp	x22, x21, [sp], #0x30
 461b618:      	ret
