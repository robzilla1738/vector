
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41200e8: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 41200ec: a9014ff4     	stp	x20, x19, [sp, #0x10]
 41200f0: a9027bfd     	stp	x29, x30, [sp, #0x20]
 41200f4: 910083fd     	add	x29, sp, #0x20
 41200f8: d0056115     	adrp	x21, 0xed42000 <dyld_stub_binder+0xed42000>
 41200fc: f94312b3     	ldr	x19, [x21, #0x620]
 4120100: b5000653     	cbnz	x19, 0x41201c8 <_ChromeMain+0x411af2c>
 4120104: 52800d00     	mov	w0, #0x68               ; =104
 4120108: 96fbbc98     	bl	0xf368 <_ChromeMain+0xa0cc>
 412010c: aa0003f3     	mov	x19, x0
 4120110: f004cbc1     	adrp	x1, 0xda9b000 <dyld_stub_binder+0xda9b000>
 4120114: 91331021     	add	x1, x1, #0xcc4
 4120118: 52800842     	mov	w2, #0x42               ; =66
 412011c: 52801323     	mov	w3, #0x99               ; =153
 4120120: 97101d16     	bl	0x527578 <_ChromeMain+0x5222dc>
 4120124: b00504c8     	adrp	x8, 0xe1b9000 <dyld_stub_binder+0xe1b9000>
 4120128: 911cc108     	add	x8, x8, #0x730
 412012c: f004cbc9     	adrp	x9, 0xda9b000 <dyld_stub_binder+0xda9b000>
 4120130: 91346d29     	add	x9, x9, #0xd1b
 4120134: a9002408     	stp	x8, x9, [x0]
 4120138: 52800288     	mov	w8, #0x14               ; =20
 412013c: f9000808     	str	x8, [x0, #0x10]
 4120140: f0057476     	adrp	x22, 0xefaf000 <dyld_stub_binder+0xefaf000>
 4120144: f9405ad4     	ldr	x20, [x22, #0xb0]
 4120148: b5000214     	cbnz	x20, 0x4120188 <_ChromeMain+0x411aeec>
 412014c: 52800d00     	mov	w0, #0x68               ; =104
 4120150: 96fbbc86     	bl	0xf368 <_ChromeMain+0xa0cc>
 4120154: aa0003f4     	mov	x20, x0
 4120158: b004e121     	adrp	x1, 0xdd45000 <dyld_stub_binder+0xdd45000>
 412015c: 9112ec21     	add	x1, x1, #0x4bb
 4120160: 52800502     	mov	w2, #0x28               ; =40
 4120164: 528002a3     	mov	w3, #0x15               ; =21
 4120168: 97101d04     	bl	0x527578 <_ChromeMain+0x5222dc>
 412016c: f0051188     	adrp	x8, 0xe353000 <dyld_stub_binder+0xe353000>
 4120170: 9118a108     	add	x8, x8, #0x628
 4120174: f9000008     	str	x8, [x0]
 4120178: 97c0d8bd     	bl	0x315646c <_ChromeMain+0x31511d0>
 412017c: aa1403e0     	mov	x0, x20
 4120180: 975a1999     	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 4120184: f9005ad4     	str	x20, [x22, #0xb0]
 4120188: 925e7688     	and	x8, x20, #0xfffffffc00000000
 412018c: d0055496     	adrp	x22, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4120190: f94046c9     	ldr	x9, [x22, #0x88]
 4120194: eb09011f     	cmp	x8, x9
 4120198: 54000061     	b.ne	0x41201a4 <_ChromeMain+0x411af08>
 412019c: aa1403e0     	mov	x0, x20
 41201a0: 96fbd057     	bl	0x142fc <_ChromeMain+0xf060>
 41201a4: f9402660     	ldr	x0, [x19, #0x48]
 41201a8: 925e7408     	and	x8, x0, #0xfffffffc00000000
 41201ac: f94046c9     	ldr	x9, [x22, #0x88]
 41201b0: eb09011f     	cmp	x8, x9
 41201b4: 54000140     	b.eq	0x41201dc <_ChromeMain+0x411af40>
 41201b8: f9002674     	str	x20, [x19, #0x48]
 41201bc: aa1303e0     	mov	x0, x19
 41201c0: 975a1989     	bl	0x17a67e4 <_ChromeMain+0x17a1548>
 41201c4: f90312b3     	str	x19, [x21, #0x620]
 41201c8: aa1303e0     	mov	x0, x19
 41201cc: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 41201d0: a9414ff4     	ldp	x20, x19, [sp, #0x10]
 41201d4: a8c357f6     	ldp	x22, x21, [sp], #0x30
 41201d8: d65f03c0     	ret
 41201dc: 96fc0a18     	bl	0x22a3c <_ChromeMain+0x1d7a0>
