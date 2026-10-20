
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 42c88ec: f9401008     	ldr	x8, [x0, #0x20]
 42c88f0: b40000c8     	cbz	x8, 0x42c8908 <_ChromeMain+0x42c366c>
 42c88f4: f9400c08     	ldr	x8, [x0, #0x18]
 42c88f8: b8bfc108     	ldapr	w8, [x8]
 42c88fc: 7100051f     	cmp	w8, #0x1
 42c8900: 1a9f07e0     	cset	w0, ne
 42c8904: d65f03c0     	ret
 42c8908: 52800000     	mov	w0, #0x0                ; =0
 42c890c: d65f03c0     	ret
