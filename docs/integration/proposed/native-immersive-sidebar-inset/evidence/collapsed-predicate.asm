
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 c770db0: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 c770db4: 910003fd     	mov	x29, sp
 c770db8: f9429c08     	ldr	x8, [x0, #0x538]
 c770dbc: 9100a109     	add	x9, x8, #0x28
 c770dc0: f100011f     	cmp	x8, #0x0
 c770dc4: 9a8903e0     	csel	x0, xzr, x9, eq
 c770dc8: 9410f2f3     	bl	0xcbad994 <_ChromeMain+0xcba86f8>
 c770dcc: b40000a0     	cbz	x0, 0xc770de0 <_ChromeMain+0xc76bb44>
 c770dd0: 39424008     	ldrb	w8, [x0, #0x90]
 c770dd4: 12000100     	and	w0, w8, #0x1
 c770dd8: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 c770ddc: d65f03c0     	ret
 c770de0: 52800008     	mov	w8, #0x0                ; =0
 c770de4: 17fffffc     	b	0xc770dd4 <_ChromeMain+0xc76bb38>
