
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 214c0f0: 9119e008     	add	x8, x0, #0x678
 214c0f4: 395a200a     	ldrb	w10, [x0, #0x688]
 214c0f8: 39404029     	ldrb	w9, [x1, #0x10]
 214c0fc: 6a0a013f     	tst	w9, w10
 214c100: 54000260     	b.eq	0x214c14c <_ChromeMain+0x2146eb0>
 214c104: 36000369     	tbz	w9, #0x0, 0x214c170 <_ChromeMain+0x2146ed4>
 214c108: b9400109     	ldr	w9, [x8]
 214c10c: b940002a     	ldr	w10, [x1]
 214c110: 6b0a013f     	cmp	w9, w10
 214c114: 54000201     	b.ne	0x214c154 <_ChromeMain+0x2146eb8>
 214c118: b9467c09     	ldr	w9, [x0, #0x67c]
 214c11c: b940042a     	ldr	w10, [x1, #0x4]
 214c120: 6b0a013f     	cmp	w9, w10
 214c124: 54000181     	b.ne	0x214c154 <_ChromeMain+0x2146eb8>
 214c128: b9468009     	ldr	w9, [x0, #0x680]
 214c12c: b940082a     	ldr	w10, [x1, #0x8]
 214c130: 6b0a013f     	cmp	w9, w10
 214c134: 54000101     	b.ne	0x214c154 <_ChromeMain+0x2146eb8>
 214c138: b9468409     	ldr	w9, [x0, #0x684]
 214c13c: b9400c2a     	ldr	w10, [x1, #0xc]
 214c140: 6b0a013f     	cmp	w9, w10
 214c144: 54000081     	b.ne	0x214c154 <_ChromeMain+0x2146eb8>
 214c148: d65f03c0     	ret
 214c14c: 6b09015f     	cmp	w10, w9
 214c150: 54ffffc0     	b.eq	0x214c148 <_ChromeMain+0x2146eac>
 214c154: 3dc00020     	ldr	q0, [x1]
 214c158: 39404029     	ldrb	w9, [x1, #0x10]
 214c15c: 39004109     	strb	w9, [x8, #0x10]
 214c160: 3d800100     	str	q0, [x8]
 214c164: f9400008     	ldr	x8, [x0]
 214c168: f9427d01     	ldr	x1, [x8, #0x4f8]
 214c16c: d61f0020     	br	x1
 214c170: d4200020     	brk	#0x1
