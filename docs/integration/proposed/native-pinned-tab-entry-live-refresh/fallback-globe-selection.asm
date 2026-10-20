
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4607a2c: 39498288     	ldrb	w8, [x20, #0x260]
 4607a30: 7100011f     	cmp	w8, #0x0
 4607a34: 52801ba8     	mov	w8, #0xdd               ; =221
 4607a38: 1a881508     	cinc	w8, w8, eq
 4607a3c: f941ee73     	ldr	x19, [x19, #0x3d8]
 4607a40: b90003e8     	str	w8, [sp]
 4607a44: 390013ff     	strb	wzr, [sp, #0x4]
 4607a48: b0051120     	adrp	x0, 0xe82c000 <dyld_stub_binder+0xe82c000>
 4607a4c: 913c2000     	add	x0, x0, #0xf08
 4607a50: 910023e8     	add	x8, sp, #0x8
 4607a54: 910003e1     	mov	x1, sp
 4607a58: 52800202     	mov	w2, #0x10               ; =16
 4607a5c: d2800003     	mov	x3, #0x0                ; =0
 4607a60: 971fb3b0     	bl	0xdf4920 <_ChromeMain+0xdef684>
 4607a64: 910023e1     	add	x1, sp, #0x8
 4607a68: aa1303e0     	mov	x0, x19
 4607a6c: 96fe658d     	bl	0x5a10a0 <_ChromeMain+0x59be04>
 4607a70: 910023e0     	add	x0, sp, #0x8
 4607a74: 9708fb73     	bl	0x846840 <_ChromeMain+0x8415a4>
