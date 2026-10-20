
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 103eb5c: b5000061     	cbnz	x1, 0x103eb68 <_ChromeMain+0x10398cc>
 103eb60: 52800020     	mov	w0, #0x1                ; =1
 103eb64: d65f03c0     	ret
 103eb68: 92400808     	and	x8, x0, #0x7
 103eb6c: 8b010009     	add	x9, x0, x1
 103eb70: eb00013f     	cmp	x9, x0
 103eb74: fa408904     	ccmp	x8, #0x0, #0x4, hi
 103eb78: aa0003e8     	mov	x8, x0
 103eb7c: 540002e1     	b.ne	0x103ebd8 <_ChromeMain+0x103993c>
 103eb80: d102012a     	sub	x10, x9, #0x80
 103eb84: eb0a011f     	cmp	x8, x10
 103eb88: 54000449     	b.ls	0x103ec10 <_ChromeMain+0x1039974>
 103eb8c: d100212b     	sub	x11, x9, #0x8
 103eb90: eb0b011f     	cmp	x8, x11
 103eb94: 54000628     	b.hi	0x103ec58 <_ChromeMain+0x10399bc>
 103eb98: d280000a     	mov	x10, #0x0               ; =0
 103eb9c: f840850c     	ldr	x12, [x8], #0x8
 103eba0: aa0a018a     	orr	x10, x12, x10
 103eba4: eb0b011f     	cmp	x8, x11
 103eba8: 54ffffa9     	b.ls	0x103eb9c <_ChromeMain+0x1039900>
 103ebac: eb09011f     	cmp	x8, x9
 103ebb0: 540000e2     	b.hs	0x103ebcc <_ChromeMain+0x1039930>
 103ebb4: 8b000029     	add	x9, x1, x0
 103ebb8: cb080129     	sub	x9, x9, x8
 103ebbc: 3880150b     	ldrsb	x11, [x8], #0x1
 103ebc0: aa0b014a     	orr	x10, x10, x11
 103ebc4: f1000529     	subs	x9, x9, #0x1
 103ebc8: 54ffffa1     	b.ne	0x103ebbc <_ChromeMain+0x1039920>
 103ebcc: f201c15f     	tst	x10, #0x8080808080808080
 103ebd0: 1a9f17e0     	cset	w0, eq
 103ebd4: d65f03c0     	ret
 103ebd8: d280000a     	mov	x10, #0x0               ; =0
 103ebdc: 9100040b     	add	x11, x0, #0x1
 103ebe0: aa0003e8     	mov	x8, x0
 103ebe4: 3880150c     	ldrsb	x12, [x8], #0x1
 103ebe8: aa0c014a     	orr	x10, x10, x12
 103ebec: eb09011f     	cmp	x8, x9
 103ebf0: 54000082     	b.hs	0x103ec00 <_ChromeMain+0x1039964>
 103ebf4: 9240096c     	and	x12, x11, #0x7
 103ebf8: 9100056b     	add	x11, x11, #0x1
 103ebfc: b5ffff4c     	cbnz	x12, 0x103ebe4 <_ChromeMain+0x1039948>
 103ec00: f201c15f     	tst	x10, #0x8080808080808080
 103ec04: 54fffbe0     	b.eq	0x103eb80 <_ChromeMain+0x10398e4>
 103ec08: 52800000     	mov	w0, #0x0                ; =0
 103ec0c: d65f03c0     	ret
 103ec10: ad420500     	ldp	q0, q1, [x8, #0x40]
 103ec14: ad400d02     	ldp	q2, q3, [x8]
 103ec18: ad431504     	ldp	q4, q5, [x8, #0x60]
 103ec1c: ad411d06     	ldp	q6, q7, [x8, #0x20]
 103ec20: 4ea51ce5     	orr.16b	v5, v7, v5
 103ec24: 4ea11c61     	orr.16b	v1, v3, v1
 103ec28: 4ea51c21     	orr.16b	v1, v1, v5
 103ec2c: 4ea41cc3     	orr.16b	v3, v6, v4
 103ec30: 4ea01c40     	orr.16b	v0, v2, v0
 103ec34: 4ea31c00     	orr.16b	v0, v0, v3
 103ec38: 4ea11c00     	orr.16b	v0, v0, v1
 103ec3c: 5e180401     	mov	d1, v0[1]
 103ec40: 0ea11c00     	orr.8b	v0, v0, v1
 103ec44: 9e66000b     	fmov	x11, d0
 103ec48: 91020108     	add	x8, x8, #0x80
 103ec4c: f201c17f     	tst	x11, #0x8080808080808080
 103ec50: 54fffdc1     	b.ne	0x103ec08 <_ChromeMain+0x103996c>
 103ec54: 17ffffcc     	b	0x103eb84 <_ChromeMain+0x10398e8>
 103ec58: d280000a     	mov	x10, #0x0               ; =0
 103ec5c: 17ffffd4     	b	0x103ebac <_ChromeMain+0x1039910>
