
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4604d00: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 4604d04: a9014ff4     	stp	x20, x19, [sp, #0x10]
 4604d08: a9027bfd     	stp	x29, x30, [sp, #0x20]
 4604d0c: 910083fd     	add	x29, sp, #0x20
 4604d10: f00546b5     	adrp	x21, 0xeedb000 <dyld_stub_binder+0xeedb000>
 4604d14: f9440ab3     	ldr	x19, [x21, #0x810]
 4604d18: b5000473     	cbnz	x19, 0x4604da4 <_ChromeMain+0x45ffb08>
 4604d1c: 52800d00     	mov	w0, #0x68               ; =104
 4604d20: 96e82992     	bl	0xf368 <_ChromeMain+0xa0cc>
 4604d24: aa0003f3     	mov	x19, x0
 4604d28: f004c621     	adrp	x1, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4604d2c: 91183021     	add	x1, x1, #0x60c
 4604d30: 528008e2     	mov	w2, #0x47               ; =71
 4604d34: 528018c3     	mov	w3, #0xc6               ; =198
 4604d38: 96fc8a10     	bl	0x527578 <_ChromeMain+0x5222dc>
 4604d3c: 9004f828     	adrp	x8, 0xe508000 <dyld_stub_binder+0xe508000>
 4604d40: 912b6108     	add	x8, x8, #0xad8
 4604d44: f004c629     	adrp	x9, 0xdecb000 <dyld_stub_binder+0xdecb000>
 4604d48: 9116b129     	add	x9, x9, #0x5ac
 4604d4c: a9002408     	stp	x8, x9, [x0]
 4604d50: 528004e8     	mov	w8, #0x27               ; =39
 4604d54: f9000808     	str	x8, [x0, #0x10]
 4604d58: f0054d56     	adrp	x22, 0xefaf000 <dyld_stub_binder+0xefaf000>
 4604d5c: f94062d4     	ldr	x20, [x22, #0xc0]
 4604d60: b40002d4     	cbz	x20, 0x4604db8 <_ChromeMain+0x45ffb1c>
 4604d64: 925e7688     	and	x8, x20, #0xfffffffc00000000
 4604d68: d0052d76     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4604d6c: f94046c9     	ldr	x9, [x22, #0x88]
 4604d70: eb09011f     	cmp	x8, x9
 4604d74: 54000061     	b.ne	0x4604d80 <_ChromeMain+0x45ffae4>
 4604d78: aa1403e0     	mov	x0, x20
 4604d7c: 96e83d60     	bl	0x142fc <_ChromeMain+0xf060>
 4604d80: f9402660     	ldr	x0, [x19, #0x48]
 4604d84: 925e7408     	and	x8, x0, #0xfffffffc00000000
 4604d88: f94046c9     	ldr	x9, [x22, #0x88]
 4604d8c: eb09011f     	cmp	x8, x9
 4604d90: 54000340     	b.eq	0x4604df8 <_ChromeMain+0x45ffb5c>
 4604d94: f9002674     	str	x20, [x19, #0x48]
 4604d98: aa1303e0     	mov	x0, x19
 4604d9c: 97468692     	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 4604da0: f9040ab3     	str	x19, [x21, #0x810]
 4604da4: aa1303e0     	mov	x0, x19
 4604da8: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 4604dac: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 4604db0: a8c357f6     	ldp	x22, x21, [sp], #0x30
 4604db4: d65f03c0     	ret
 4604db8: 52800d00     	mov	w0, #0x68               ; =104
 4604dbc: 96e8296b     	bl	0xf368 <_ChromeMain+0xa0cc>
 4604dc0: aa0003f4     	mov	x20, x0
 4604dc4: b004ba01     	adrp	x1, 0xdd45000 <dyld_stub_binder+0xdd45000>
 4604dc8: 91242c21     	add	x1, x1, #0x90b
 4604dcc: 528002a2     	mov	w2, #0x15               ; =21
 4604dd0: 528029e3     	mov	w3, #0x14f              ; =335
 4604dd4: 96fc89e9     	bl	0x527578 <_ChromeMain+0x5222dc>
 4604dd8: 9004ea88     	adrp	x8, 0xe354000 <dyld_stub_binder+0xe354000>
 4604ddc: 9120e108     	add	x8, x8, #0x838
 4604de0: f9000008     	str	x8, [x0]
 4604de4: 9775c30d     	bl	0x2375a18 <_ChromeMain+0x237077c>
 4604de8: aa1403e0     	mov	x0, x20
 4604dec: 9746867e     	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 4604df0: f90062d4     	str	x20, [x22, #0xc0]
 4604df4: 17ffffdc     	b	0x4604d64 <_ChromeMain+0x45ffac8>
 4604df8: 96e87711     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 4604dfc: 17ffffe6     	b	0x4604d94 <_ChromeMain+0x45ffaf8>
 4604e00: 17ffffc0     	b	0x4604d00 <_ChromeMain+0x45ffa64>
 4604e04: 00000000     	udf	#0x0
