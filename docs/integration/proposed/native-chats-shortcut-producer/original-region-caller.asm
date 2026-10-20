
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 37e220c: 5290a260     	mov	w0, #0x8513             ; =34067
 37e2210: 97c69293     	bl	0x2986c5c <_ChromeMain+0x29819c0>
 37e2214: f9401bf6     	ldr	x22, [sp, #0x30]
 37e2218: 340001e0     	cbz	w0, 0x37e2254 <_ChromeMain+0x37dcfb8>
 37e221c: 9101c3f4     	add	x20, sp, #0x70
 37e2220: 9101c3e8     	add	x8, sp, #0x70
 37e2224: d10343a0     	sub	x0, x29, #0xd0
 37e2228: 97eefcb7     	bl	0x33a1504 <_ChromeMain+0x339c268>
 37e222c: 39821fe8     	ldrsb	x8, [sp, #0x87]
 37e2230: a9472be9     	ldp	x9, x10, [sp, #0x70]
 37e2234: f100011f     	cmp	x8, #0x0
 37e2238: 9a944121     	csel	x1, x9, x20, mi
 37e223c: 7100011f     	cmp	w8, #0x0
 37e2240: 9a884142     	csel	x2, x10, x8, mi
 37e2244: aa1a03e0     	mov	x0, x26
 37e2248: 94298982     	bl	0x4244850 <_ChromeMain+0x423f5b4>
 37e224c: 39c21fe8     	ldrsb	w8, [sp, #0x87]
 37e2250: 37f94bc8     	tbnz	w8, #0x1f, 0x37e4bc8 <_ChromeMain+0x37df92c>
 37e2254: b5014c56     	cbnz	x22, 0x37e4bdc <_ChromeMain+0x37df940>
