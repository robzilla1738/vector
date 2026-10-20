
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 2d63b50: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 2d63b54: a9014ff4     	stp	x20, x19, [sp, #0x10]
 2d63b58: a9027bfd     	stp	x29, x30, [sp, #0x20]
 2d63b5c: 910083fd     	add	x29, sp, #0x20
 2d63b60: aa0003f3     	mov	x19, x0
 2d63b64: f9409814     	ldr	x20, [x0, #0x130]
 2d63b68: f9009801     	str	x1, [x0, #0x130]
 2d63b6c: b5000a34     	cbnz	x20, 0x2d63cb0 <_ChromeMain+0x2d5ea14>
 2d63b70: aa1303f4     	mov	x20, x19
 2d63b74: f84e8e80     	ldr	x0, [x20, #0xe8]!
 2d63b78: 940c0328     	bl	0x3064818 <_ChromeMain+0x305f57c>
 2d63b7c: a9007e9f     	stp	xzr, xzr, [x20]
 2d63b80: f81f8294     	stur	x20, [x20, #-0x8]
 2d63b84: f85f0280     	ldur	x0, [x20, #-0x10]
 2d63b88: 9400007a     	bl	0x2d63d70 <_ChromeMain+0x2d5ead4>
 2d63b8c: f85c8294     	ldur	x20, [x20, #-0x38]
 2d63b90: b4000cf4     	cbz	x20, 0x2d63d2c <_ChromeMain+0x2d5ea90>
 2d63b94: 925e7688     	and	x8, x20, #0xfffffffc00000000
 2d63b98: f005f275     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 2d63b9c: f94046a9     	ldr	x9, [x21, #0x88]
 2d63ba0: eb09011f     	cmp	x8, x9
 2d63ba4: 54000061     	b.ne	0x2d63bb0 <_ChromeMain+0x2d5e914>
 2d63ba8: aa1403e0     	mov	x0, x20
 2d63bac: 974ac1d4     	bl	0x142fc <_ChromeMain+0xf060>
 2d63bb0: f940a260     	ldr	x0, [x19, #0x140]
 2d63bb4: 925e7408     	and	x8, x0, #0xfffffffc00000000
 2d63bb8: f94046a9     	ldr	x9, [x21, #0x88]
 2d63bbc: eb09011f     	cmp	x8, x9
 2d63bc0: 54000be0     	b.eq	0x2d63d3c <_ChromeMain+0x2d5eaa0>
 2d63bc4: f900a274     	str	x20, [x19, #0x140]
 2d63bc8: f9409e61     	ldr	x1, [x19, #0x138]
 2d63bcc: 9100c280     	add	x0, x20, #0x30
 2d63bd0: 9758df74     	bl	0x39b9a0 <_ChromeMain+0x396704>
 2d63bd4: f9405e74     	ldr	x20, [x19, #0xb8]
 2d63bd8: b4000214     	cbz	x20, 0x2d63c18 <_ChromeMain+0x2d5e97c>
 2d63bdc: 925e7688     	and	x8, x20, #0xfffffffc00000000
 2d63be0: f94046a9     	ldr	x9, [x21, #0x88]
 2d63be4: eb09011f     	cmp	x8, x9
 2d63be8: 54000061     	b.ne	0x2d63bf4 <_ChromeMain+0x2d5e958>
 2d63bec: aa1403e0     	mov	x0, x20
 2d63bf0: 974ac1c3     	bl	0x142fc <_ChromeMain+0xf060>
 2d63bf4: f940aa60     	ldr	x0, [x19, #0x150]
 2d63bf8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 2d63bfc: f94046a9     	ldr	x9, [x21, #0x88]
 2d63c00: eb09011f     	cmp	x8, x9
 2d63c04: 54000a00     	b.eq	0x2d63d44 <_ChromeMain+0x2d5eaa8>
 2d63c08: f900aa74     	str	x20, [x19, #0x150]
 2d63c0c: f940a661     	ldr	x1, [x19, #0x148]
 2d63c10: 9100c280     	add	x0, x20, #0x30
 2d63c14: 9758df63     	bl	0x39b9a0 <_ChromeMain+0x396704>
 2d63c18: f9406261     	ldr	x1, [x19, #0xc0]
 2d63c1c: b5000981     	cbnz	x1, 0x2d63d4c <_ChromeMain+0x2d5eab0>
 2d63c20: b940ca68     	ldr	w8, [x19, #0xc8]
 2d63c24: 11000508     	add	w8, w8, #0x1
 2d63c28: b900ca68     	str	w8, [x19, #0xc8]
 2d63c2c: f9405a60     	ldr	x0, [x19, #0xb0]
 2d63c30: f940b661     	ldr	x1, [x19, #0x168]
 2d63c34: b40000c1     	cbz	x1, 0x2d63c4c <_ChromeMain+0x2d5e9b0>
 2d63c38: 52800028     	mov	w8, #0x1                ; =1
 2d63c3c: b8280028     	ldadd	w8, w8, [x1]
 2d63c40: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 2d63c44: 6b09011f     	cmp	w8, w9
 2d63c48: 54000880     	b.eq	0x2d63d58 <_ChromeMain+0x2d5eabc>
 2d63c4c: f940ba68     	ldr	x8, [x19, #0x170]
 2d63c50: 9100c109     	add	x9, x8, #0x30
 2d63c54: f100011f     	cmp	x8, #0x0
 2d63c58: 9a8903e2     	csel	x2, xzr, x9, eq
 2d63c5c: 94000066     	bl	0x2d63df4 <_ChromeMain+0x2d5eb58>
 2d63c60: f9405e60     	ldr	x0, [x19, #0xb8]
 2d63c64: b4000640     	cbz	x0, 0x2d63d2c <_ChromeMain+0x2d5ea90>
 2d63c68: b940ca68     	ldr	w8, [x19, #0xc8]
 2d63c6c: 11000508     	add	w8, w8, #0x1
 2d63c70: b900ca68     	str	w8, [x19, #0xc8]
 2d63c74: f940b661     	ldr	x1, [x19, #0x168]
 2d63c78: b40000c1     	cbz	x1, 0x2d63c90 <_ChromeMain+0x2d5e9f4>
 2d63c7c: 52800028     	mov	w8, #0x1                ; =1
 2d63c80: b8280028     	ldadd	w8, w8, [x1]
 2d63c84: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 2d63c88: 6b09011f     	cmp	w8, w9
 2d63c8c: 540006c0     	b.eq	0x2d63d64 <_ChromeMain+0x2d5eac8>
 2d63c90: f940ba68     	ldr	x8, [x19, #0x170]
 2d63c94: 9100c109     	add	x9, x8, #0x30
 2d63c98: f100011f     	cmp	x8, #0x0
 2d63c9c: 9a8903e2     	csel	x2, xzr, x9, eq
 2d63ca0: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 2d63ca4: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 2d63ca8: a8c357f6     	ldp	x22, x21, [sp], #0x30
 2d63cac: 14000052     	b	0x2d63df4 <_ChromeMain+0x2d5eb58>
 2d63cb0: 12800008     	mov	w8, #-0x1               ; =-1
 2d63cb4: b8e80288     	ldaddal	w8, w8, [x20]
 2d63cb8: 7100051f     	cmp	w8, #0x1
 2d63cbc: 54fff5a1     	b.ne	0x2d63b70 <_ChromeMain+0x2d5e8d4>
 2d63cc0: f9400a88     	ldr	x8, [x20, #0x10]
 2d63cc4: d0ff1209     	adrp	x9, 0xfa5000 <_ChromeMain+0xf9fd64>
 2d63cc8: 91190129     	add	x9, x9, #0x640
 2d63ccc: eb09011f     	cmp	x8, x9
 2d63cd0: 54000100     	b.eq	0x2d63cf0 <_ChromeMain+0x2d5ea54>
 2d63cd4: b0006049     	adrp	x9, 0x396c000 <_ChromeMain+0x3966d64>
 2d63cd8: 91180129     	add	x9, x9, #0x600
 2d63cdc: aa1403e0     	mov	x0, x20
 2d63ce0: eb09011f     	cmp	x8, x9
 2d63ce4: 54000120     	b.eq	0x2d63d08 <_ChromeMain+0x2d5ea6c>
 2d63ce8: d63f0100     	blr	x8
 2d63cec: 17ffffa1     	b	0x2d63b70 <_ChromeMain+0x2d5e8d4>
 2d63cf0: f9401a80     	ldr	x0, [x20, #0x30]
 2d63cf4: b50000e0     	cbnz	x0, 0x2d63d10 <_ChromeMain+0x2d5ea74>
 2d63cf8: aa1403e0     	mov	x0, x20
 2d63cfc: 52800901     	mov	w1, #0x48               ; =72
 2d63d00: 974a946e     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 2d63d04: 17ffff9b     	b	0x2d63b70 <_ChromeMain+0x2d5e8d4>
 2d63d08: 52800701     	mov	w1, #0x38               ; =56
 2d63d0c: 17fffffd     	b	0x2d63d00 <_ChromeMain+0x2d5ea64>
 2d63d10: 12800008     	mov	w8, #-0x1               ; =-1
 2d63d14: b8e80008     	ldaddal	w8, w8, [x0]
 2d63d18: 7100051f     	cmp	w8, #0x1
 2d63d1c: 54fffee1     	b.ne	0x2d63cf8 <_ChromeMain+0x2d5ea5c>
 2d63d20: 52800101     	mov	w1, #0x8                ; =8
 2d63d24: 974a9465     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 2d63d28: 17fffff4     	b	0x2d63cf8 <_ChromeMain+0x2d5ea5c>
 2d63d2c: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 2d63d30: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 2d63d34: a8c357f6     	ldp	x22, x21, [sp], #0x30
 2d63d38: d65f03c0     	ret
 2d63d3c: 974afb40     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 2d63d40: 17ffffa1     	b	0x2d63bc4 <_ChromeMain+0x2d5e928>
 2d63d44: 974afb3e     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 2d63d48: 17ffffb0     	b	0x2d63c08 <_ChromeMain+0x2d5e96c>
 2d63d4c: 91056260     	add	x0, x19, #0x158
 2d63d50: 9430d682     	bl	0x3999758 <_ChromeMain+0x39944bc>
 2d63d54: 17ffffb3     	b	0x2d63c20 <_ChromeMain+0x2d5e984>
 2d63d58: d4200000     	brk	#0
 2d63d5c: d4400000     	hlt	#0
 2d63d60: d4200020     	brk	#0x1
 2d63d64: d4200000     	brk	#0
 2d63d68: d4400000     	hlt	#0
 2d63d6c: d4200020     	brk	#0x1
