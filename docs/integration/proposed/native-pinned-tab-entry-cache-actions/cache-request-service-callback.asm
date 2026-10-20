
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 460588c: 910e6268     	add	x8, x19, #0x398
 4605890: f9400119     	ldr	x25, [x8]
 4605894: b40004b9     	cbz	x25, 0x4605928 <_ChromeMain+0x460068c>
 4605898: 39809fe8     	ldrsb	x8, [sp, #0x27]
 460589c: a9412be9     	ldp	x9, x10, [sp, #0x10]
 46058a0: f100011f     	cmp	x8, #0x0
 46058a4: 910043eb     	add	x11, sp, #0x10
 46058a8: 9a8b4138     	csel	x24, x9, x11, mi
 46058ac: 7100011f     	cmp	w8, #0x0
 46058b0: 9a884157     	csel	x23, x10, x8, mi
 46058b4: aa1903e8     	mov	x8, x25
 46058b8: f8420d09     	ldr	x9, [x8, #0x20]!
 46058bc: 39805d0a     	ldrsb	x10, [x8, #0x17]
 46058c0: f100015f     	cmp	x10, #0x0
 46058c4: 9a884121     	csel	x1, x9, x8, mi
 46058c8: f9400508     	ldr	x8, [x8, #0x8]
 46058cc: 7100015f     	cmp	w10, #0x0
 46058d0: 9a8a411a     	csel	x26, x8, x10, mi
 46058d4: eb17035f     	cmp	x26, x23
 46058d8: 9a973342     	csel	x2, x26, x23, lo
 46058dc: aa1803e0     	mov	x0, x24
 46058e0: 94e80fe0     	bl	0x8009860 <_ChromeMain+0x80045c4>
 46058e4: 34000160     	cbz	w0, 0x4605910 <_ChromeMain+0x4600674>
 46058e8: 5280003a     	mov	w26, #0x1               ; =1
 46058ec: 37f800c0     	tbnz	w0, #0x1f, 0x4605904 <_ChromeMain+0x4600668>
 46058f0: f9400739     	ldr	x25, [x25, #0x8]
 46058f4: b5fffe19     	cbnz	x25, 0x46058b4 <_ChromeMain+0x4600618>
 46058f8: 1400000c     	b	0x4605928 <_ChromeMain+0x460068c>
 46058fc: 5280003a     	mov	w26, #0x1               ; =1
 4605900: 54ffff82     	b.hs	0x46058f0 <_ChromeMain+0x4600654>
 4605904: f9400339     	ldr	x25, [x25]
 4605908: b5fffd79     	cbnz	x25, 0x46058b4 <_ChromeMain+0x4600618>
 460590c: 14000007     	b	0x4605928 <_ChromeMain+0x460068c>
 4605910: eb1a02ff     	cmp	x23, x26
 4605914: 54ffff41     	b.ne	0x46058fc <_ChromeMain+0x4600660>
 4605918: 910e6268     	add	x8, x19, #0x398
 460591c: eb08033f     	cmp	x25, x8
 4605920: 5280003a     	mov	w26, #0x1               ; =1
 4605924: 54000581     	b.ne	0x46059d4 <_ChromeMain+0x4600738>
 4605928: f941a268     	ldr	x8, [x19, #0x340]
 460592c: f9403500     	ldr	x0, [x8, #0x68]
 4605930: 52800001     	mov	w1, #0x0                ; =0
 4605934: 97916748     	bl	0x2a5f654 <_ChromeMain+0x2a5a3b8>
 4605938: b40004e0     	cbz	x0, 0x46059d4 <_ChromeMain+0x4600738>
 460593c: aa0003f8     	mov	x24, x0
 4605940: 910e4260     	add	x0, x19, #0x390
 4605944: 910e4261     	add	x1, x19, #0x390
 4605948: 910043e2     	add	x2, sp, #0x10
 460594c: 9724230d     	bl	0xf0e580 <_ChromeMain+0xf092e4>
 4605950: f9430677     	ldr	x23, [x19, #0x608]
 4605954: b40000b7     	cbz	x23, 0x4605968 <_ChromeMain+0x46006cc>
 4605958: b83a02e8     	ldadd	w26, w8, [x23]
 460595c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4605960: 6b09011f     	cmp	w8, w9
 4605964: 54003520     	b.eq	0x4606008 <_ChromeMain+0x4600d6c>
 4605968: f9430a7a     	ldr	x26, [x19, #0x610]
 460596c: 52801700     	mov	w0, #0xb8               ; =184
 4605970: 96e8267e     	bl	0xf368 <_ChromeMain+0xa0cc>
 4605974: aa0003f9     	mov	x25, x0
 4605978: 52800028     	mov	w8, #0x1                ; =1
 460597c: b9000008     	str	w8, [x0]
 4605980: d0ffcd88     	adrp	x8, 0x3fb7000 <_ChromeMain+0x3fb1d64>
 4605984: 91300109     	add	x9, x8, #0xc00
 4605988: 10ef9ec8     	adr	x8, 0x45e4d60 <_ChromeMain+0x45dfac4>
 460598c: d503201f     	nop
 4605990: a900a009     	stp	x9, x8, [x0, #0x8]
 4605994: b0ffd548     	adrp	x8, 0x40ae000 <_ChromeMain+0x40a8d64>
 4605998: 911b0109     	add	x9, x8, #0x6c0
 460599c: 10025228     	adr	x8, 0x460a3e0 <_ChromeMain+0x4605144>
 46059a0: d503201f     	nop
 46059a4: a901a009     	stp	x9, x8, [x0, #0x18]
 46059a8: a902dc1f     	stp	xzr, x23, [x0, #0x28]
 46059ac: f9001c1a     	str	x26, [x0, #0x38]
 46059b0: 5280003a     	mov	w26, #0x1               ; =1
 46059b4: 91010000     	add	x0, x0, #0x40
 46059b8: 9106a3e1     	add	x1, sp, #0x1a8
 46059bc: 96ecd176     	bl	0x139f94 <_ChromeMain+0x134cf8>
 46059c0: 9106a3e1     	add	x1, sp, #0x1a8
 46059c4: 910f0263     	add	x3, x19, #0x3c0
 46059c8: aa1803e0     	mov	x0, x24
 46059cc: aa1903e2     	mov	x2, x25
 46059d0: 97916770     	bl	0x2a5f790 <_ChromeMain+0x2a5a4f4>
