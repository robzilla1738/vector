
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4639c10: 34ffec55     	cbz	w21, 0x4639998 <_ChromeMain+0x46346fc>
 4639c14: 71002ebf     	cmp	w21, #0xb
 4639c18: 54fffd61     	b.ne	0x4639bc4 <_ChromeMain+0x4634928>
 4639c1c: 528001a8     	mov	w8, #0xd                ; =13
 4639c20: 39069fe8     	strb	w8, [sp, #0x1a7]
 4639c24: 910643e9     	add	x9, sp, #0x190
 4639c28: 9100352a     	add	x10, x9, #0xd
 4639c2c: d004c488     	adrp	x8, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4639c30: 912b2d08     	add	x8, x8, #0xacb
 4639c34: eb08015f     	cmp	x10, x8
 4639c38: fa488122     	ccmp	x9, x8, #0x2, hi
 4639c3c: 540040c9     	b.ls	0x463a454 <_ChromeMain+0x46351b8>
 4639c40: f9400109     	ldr	x9, [x8]
 4639c44: f900cbe9     	str	x9, [sp, #0x190]
 4639c48: f8405108     	ldur	x8, [x8, #0x5]
 4639c4c: f80052c8     	stur	x8, [x22, #0x5]
 4639c50: 390677ff     	strb	wzr, [sp, #0x19d]
 4639c54: 390ac3ff     	strb	wzr, [sp, #0x2b0]
 4639c58: 390b23ff     	strb	wzr, [sp, #0x2c8]
 4639c5c: f94a0674     	ldr	x20, [x19, #0x1408]
 4639c60: b40000d4     	cbz	x20, 0x4639c78 <_ChromeMain+0x46349dc>
 4639c64: 52800028     	mov	w8, #0x1                ; =1
 4639c68: b8280288     	ldadd	w8, w8, [x20]
 4639c6c: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4639c70: 6b09011f     	cmp	w8, w9
 4639c74: 54009aa0     	b.eq	0x463afc8 <_ChromeMain+0x4635d2c>
 4639c78: f94a0a75     	ldr	x21, [x19, #0x1410]
 4639c7c: 52800700     	mov	w0, #0x38               ; =56
 4639c80: 96e755ba     	bl	0xf368 <_ChromeMain+0xa0cc>
 4639c84: aa0003e3     	mov	x3, x0
 4639c88: 52800028     	mov	w8, #0x1                ; =1
 4639c8c: b9000008     	str	w8, [x0]
 4639c90: 101b70e8     	adr	x8, 0x4670aac <_ChromeMain+0x466b810>
 4639c94: d503201f     	nop
 4639c98: d0ffd069     	adrp	x9, 0x4047000 <_ChromeMain+0x4041d64>
 4639c9c: 91160129     	add	x9, x9, #0x580
 4639ca0: a900a408     	stp	x8, x9, [x0, #0x8]
 4639ca4: 90fef928     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 4639ca8: 912c0108     	add	x8, x8, #0xb00
 4639cac: f9000c08     	str	x8, [x0, #0x18]
 4639cb0: a902d414     	stp	x20, x21, [x0, #0x28]
 4639cb4: 910643e1     	add	x1, sp, #0x190
 4639cb8: 910ac3e2     	add	x2, sp, #0x2b0
 4639cbc: aa1303e0     	mov	x0, x19
 4639cc0: 940006e9     	bl	0x463b864 <_ChromeMain+0x46365c8>
 4639cc4: 394b23e8     	ldrb	w8, [sp, #0x2c8]
 4639cc8: 340000e8     	cbz	w8, 0x4639ce4 <_ChromeMain+0x4634a48>
 4639ccc: 39cb1fe8     	ldrsb	w8, [sp, #0x2c7]
 4639cd0: 36f800a8     	tbz	w8, #0x1f, 0x4639ce4 <_ChromeMain+0x4634a48>
 4639cd4: f9415be0     	ldr	x0, [sp, #0x2b0]
 4639cd8: f94163e8     	ldr	x8, [sp, #0x2c0]
 4639cdc: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 4639ce0: 96e73c76     	bl	0x8eb8 <_ChromeMain+0x3c1c>
