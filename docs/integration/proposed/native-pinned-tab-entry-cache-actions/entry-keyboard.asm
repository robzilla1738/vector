
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 460d1c4: 79411028     	ldrh	w8, [x1, #0x88]
 460d1c8: 7100811f     	cmp	w8, #0x20
 460d1cc: 7a4d1904     	ccmp	w8, #0xd, #0x4, ne
 460d1d0: 54000161     	b.ne	0x460d1fc <_ChromeMain+0x4607f60>
 460d1d4: f941e808     	ldr	x8, [x0, #0x3d0]
 460d1d8: b4000168     	cbz	x8, 0x460d204 <_ChromeMain+0x4607f68>
 460d1dc: a9bf7bfd     	stp	x29, x30, [sp, #-0x10]!
 460d1e0: 910003fd     	mov	x29, sp
 460d1e4: f941f001     	ldr	x1, [x0, #0x3e0]
 460d1e8: aa0803e0     	mov	x0, x8
 460d1ec: 97fff40f     	bl	0x460a228 <_ChromeMain+0x4604f8c>
 460d1f0: 52800020     	mov	w0, #0x1                ; =1
 460d1f4: a8c17bfd     	ldp	x29, x30, [sp], #0x10
 460d1f8: d65f03c0     	ret
 460d1fc: 52800000     	mov	w0, #0x0                ; =0
 460d200: d65f03c0     	ret
 460d204: 52800020     	mov	w0, #0x1                ; =1
 460d208: d65f03c0     	ret
