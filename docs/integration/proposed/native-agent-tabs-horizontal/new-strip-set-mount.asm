
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45deeb0: d102c3ff     	sub	sp, sp, #0xb0
 45deeb4: a90667fa     	stp	x26, x25, [sp, #0x60]
 45deeb8: a9075ff8     	stp	x24, x23, [sp, #0x70]
 45deebc: a90857f6     	stp	x22, x21, [sp, #0x80]
 45deec0: a9094ff4     	stp	x20, x19, [sp, #0x90]
 45deec4: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 45deec8: 910283fd     	add	x29, sp, #0xa0
 45deecc: aa0003f3     	mov	x19, x0
 45deed0: f942a800     	ldr	x0, [x0, #0x550]
 45deed4: b5000c00     	cbnz	x0, 0x45df054 <_ChromeMain+0x45d9db8>
 45deed8: f9423e68     	ldr	x8, [x19, #0x478]
 45deedc: b4002928     	cbz	x8, 0x45df400 <_ChromeMain+0x45da164>
 45deee0: 52800034     	mov	w20, #0x1               ; =1
 45deee4: b90033f4     	str	w20, [sp, #0x30]
 45deee8: f0052121     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 45deeec: 9115a021     	add	x1, x1, #0x568
 45deef0: 91036100     	add	x0, x8, #0xd8
 45deef4: 9100c3e2     	add	x2, sp, #0x30
 45deef8: 97b2b748     	bl	0x328cc18 <_ChromeMain+0x328797c>
 45deefc: f9423e75     	ldr	x21, [x19, #0x478]
 45def00: 9100c3e0     	add	x0, sp, #0x30
 45def04: 52800001     	mov	w1, #0x0                ; =0
 45def08: 52800002     	mov	w2, #0x0                ; =0
 45def0c: 52800003     	mov	w3, #0x0                ; =0
 45def10: 52800004     	mov	w4, #0x0                ; =0
 45def14: 528000a5     	mov	w5, #0x5                ; =5
 45def18: 97d520aa     	bl	0x3b271c0 <_ChromeMain+0x3b21f24>
 45def1c: f0052121     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 45def20: 91152021     	add	x1, x1, #0x548
 45def24: 910362a0     	add	x0, x21, #0xd8
 45def28: 9100c3e2     	add	x2, sp, #0x30
 45def2c: 9758d518     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 45def30: 9100c3e0     	add	x0, sp, #0x30
 45def34: 9745af7c     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 45def38: f9423e68     	ldr	x8, [x19, #0x478]
 45def3c: f941991a     	ldr	x26, [x8, #0x330]
 45def40: 925e7668     	and	x8, x19, #0xfffffffc00000000
 45def44: 90052eb5     	adrp	x21, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45def48: f94046a9     	ldr	x9, [x21, #0x88]
 45def4c: eb09011f     	cmp	x8, x9
 45def50: 54000061     	b.ne	0x45def5c <_ChromeMain+0x45d9cc0>
 45def54: aa1303e0     	mov	x0, x19
 45def58: 96e8d4e9     	bl	0x142fc <_ChromeMain+0xf060>
 45def5c: 52800700     	mov	w0, #0x38               ; =56
 45def60: 96e8c102     	bl	0xf368 <_ChromeMain+0xa0cc>
 45def64: aa0003e1     	mov	x1, x0
 45def68: b9000014     	str	w20, [x0]
 45def6c: d0ffcc77     	adrp	x23, 0x3f6c000 <_ChromeMain+0x3f66d64>
 45def70: 912702f7     	add	x23, x23, #0x9c0
 45def74: d0fea738     	adrp	x24, 0x1ac4000 <_ChromeMain+0x1abed64>
 45def78: 91180318     	add	x24, x24, #0x600
 45def7c: a900e017     	stp	x23, x24, [x0, #0x8]
 45def80: f0fefbf6     	adrp	x22, 0x255d000 <_ChromeMain+0x2557d64>
 45def84: 912c02d6     	add	x22, x22, #0xb00
 45def88: 10ffdcd9     	adr	x25, 0x45deb20 <_ChromeMain+0x45d9884>
 45def8c: d503201f     	nop
 45def90: a901e416     	stp	x22, x25, [x0, #0x18]
 45def94: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 45def98: 9100c3e8     	add	x8, sp, #0x30
 45def9c: 910f0340     	add	x0, x26, #0x3c0
 45defa0: 9758b3d4     	bl	0x1c0bef0 <_ChromeMain+0x1c06c54>
 45defa4: 9116c260     	add	x0, x19, #0x5b0
 45defa8: 9100c3e1     	add	x1, sp, #0x30
 45defac: 97099ec9     	bl	0x846ad0 <_ChromeMain+0x841834>
 45defb0: f9401bf4     	ldr	x20, [sp, #0x30]
 45defb4: b5000594     	cbnz	x20, 0x45df064 <_ChromeMain+0x45d9dc8>
 45defb8: f9423e68     	ldr	x8, [x19, #0x478]
 45defbc: f941ad14     	ldr	x20, [x8, #0x358]
 45defc0: 925e7668     	and	x8, x19, #0xfffffffc00000000
 45defc4: f94046a9     	ldr	x9, [x21, #0x88]
 45defc8: eb09011f     	cmp	x8, x9
 45defcc: 54000061     	b.ne	0x45defd8 <_ChromeMain+0x45d9d3c>
 45defd0: aa1303e0     	mov	x0, x19
 45defd4: 96e8d4ca     	bl	0x142fc <_ChromeMain+0xf060>
 45defd8: 52800700     	mov	w0, #0x38               ; =56
 45defdc: 96e8c0e3     	bl	0xf368 <_ChromeMain+0xa0cc>
 45defe0: aa0003e1     	mov	x1, x0
 45defe4: 52800028     	mov	w8, #0x1                ; =1
 45defe8: b9000008     	str	w8, [x0]
 45defec: a900e017     	stp	x23, x24, [x0, #0x8]
 45deff0: a901e416     	stp	x22, x25, [x0, #0x18]
 45deff4: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 45deff8: 9100c3e8     	add	x8, sp, #0x30
 45deffc: 910f0280     	add	x0, x20, #0x3c0
 45df000: 9758b3bc     	bl	0x1c0bef0 <_ChromeMain+0x1c06c54>
 45df004: 9116e260     	add	x0, x19, #0x5b8
 45df008: 9100c3e1     	add	x1, sp, #0x30
 45df00c: 97099eb1     	bl	0x846ad0 <_ChromeMain+0x841834>
 45df010: f9401bf4     	ldr	x20, [sp, #0x30]
 45df014: b5000514     	cbnz	x20, 0x45df0b4 <_ChromeMain+0x45d9e18>
 45df018: f9429e68     	ldr	x8, [x19, #0x538]
 45df01c: b4000748     	cbz	x8, 0x45df104 <_ChromeMain+0x45d9e68>
 45df020: f940ce69     	ldr	x9, [x19, #0x198]
 45df024: d37df129     	lsl	x9, x9, #3
 45df028: b4001f29     	cbz	x9, 0x45df40c <_ChromeMain+0x45da170>
 45df02c: d280000a     	mov	x10, #0x0               ; =0
 45df030: f940ca6b     	ldr	x11, [x19, #0x190]
 45df034: 52800022     	mov	w2, #0x1                ; =1
 45df038: f86a696c     	ldr	x12, [x11, x10]
 45df03c: eb08019f     	cmp	x12, x8
 45df040: 54000660     	b.eq	0x45df10c <_ChromeMain+0x45d9e70>
 45df044: 9100214a     	add	x10, x10, #0x8
 45df048: eb0a013f     	cmp	x9, x10
 45df04c: 54ffff61     	b.ne	0x45df038 <_ChromeMain+0x45d9d9c>
 45df050: 14000031     	b	0x45df114 <_ChromeMain+0x45d9e78>
 45df054: f9423e68     	ldr	x8, [x19, #0x478]
 45df058: f941ad01     	ldr	x1, [x8, #0x358]
 45df05c: 95fffcff     	bl	0xc5de458 <_ChromeMain+0xc5d91bc>
 45df060: 17ffff9e     	b	0x45deed8 <_ChromeMain+0x45d9c3c>
 45df064: f9001bff     	str	xzr, [sp, #0x30]
 45df068: f9400688     	ldr	x8, [x20, #0x8]
 45df06c: aa1403e0     	mov	x0, x20
 45df070: d63f0100     	blr	x8
 45df074: 12800008     	mov	w8, #-0x1               ; =-1
 45df078: b8e80288     	ldaddal	w8, w8, [x20]
 45df07c: 7100051f     	cmp	w8, #0x1
 45df080: 54000081     	b.ne	0x45df090 <_ChromeMain+0x45d9df4>
 45df084: f9400a88     	ldr	x8, [x20, #0x10]
 45df088: aa1403e0     	mov	x0, x20
 45df08c: d63f0100     	blr	x8
 45df090: f9401be0     	ldr	x0, [sp, #0x30]
 45df094: b4fff920     	cbz	x0, 0x45defb8 <_ChromeMain+0x45d9d1c>
 45df098: 12800008     	mov	w8, #-0x1               ; =-1
 45df09c: b8e80008     	ldaddal	w8, w8, [x0]
 45df0a0: 7100051f     	cmp	w8, #0x1
 45df0a4: 54fff8a1     	b.ne	0x45defb8 <_ChromeMain+0x45d9d1c>
 45df0a8: f9400808     	ldr	x8, [x0, #0x10]
 45df0ac: d63f0100     	blr	x8
 45df0b0: 17ffffc2     	b	0x45defb8 <_ChromeMain+0x45d9d1c>
 45df0b4: f9001bff     	str	xzr, [sp, #0x30]
 45df0b8: f9400688     	ldr	x8, [x20, #0x8]
 45df0bc: aa1403e0     	mov	x0, x20
 45df0c0: d63f0100     	blr	x8
 45df0c4: 12800008     	mov	w8, #-0x1               ; =-1
 45df0c8: b8e80288     	ldaddal	w8, w8, [x20]
 45df0cc: 7100051f     	cmp	w8, #0x1
 45df0d0: 54000081     	b.ne	0x45df0e0 <_ChromeMain+0x45d9e44>
 45df0d4: f9400a88     	ldr	x8, [x20, #0x10]
 45df0d8: aa1403e0     	mov	x0, x20
 45df0dc: d63f0100     	blr	x8
 45df0e0: f9401be0     	ldr	x0, [sp, #0x30]
 45df0e4: b4fff9a0     	cbz	x0, 0x45df018 <_ChromeMain+0x45d9d7c>
 45df0e8: 12800008     	mov	w8, #-0x1               ; =-1
 45df0ec: b8e80008     	ldaddal	w8, w8, [x0]
 45df0f0: 7100051f     	cmp	w8, #0x1
 45df0f4: 54fff921     	b.ne	0x45df018 <_ChromeMain+0x45d9d7c>
 45df0f8: f9400808     	ldr	x8, [x0, #0x10]
 45df0fc: d63f0100     	blr	x8
 45df100: 17ffffc6     	b	0x45df018 <_ChromeMain+0x45d9d7c>
 45df104: d2800002     	mov	x2, #0x0                ; =0
 45df108: 14000003     	b	0x45df114 <_ChromeMain+0x45d9e78>
 45df10c: 9343fd48     	asr	x8, x10, #3
 45df110: 91000502     	add	x2, x8, #0x1
 45df114: f9423e61     	ldr	x1, [x19, #0x478]
 45df118: aa1303e0     	mov	x0, x19
 45df11c: 97c1c117     	bl	0x364f578 <_ChromeMain+0x364a2dc>
 45df120: f9429e77     	ldr	x23, [x19, #0x538]
 45df124: b4000337     	cbz	x23, 0x45df188 <_ChromeMain+0x45d9eec>
 45df128: 925e7668     	and	x8, x19, #0xfffffffc00000000
 45df12c: f94046a9     	ldr	x9, [x21, #0x88]
 45df130: eb09011f     	cmp	x8, x9
 45df134: 54000061     	b.ne	0x45df140 <_ChromeMain+0x45d9ea4>
 45df138: aa1303e0     	mov	x0, x19
 45df13c: 96e8d470     	bl	0x142fc <_ChromeMain+0xf060>
 45df140: 52800700     	mov	w0, #0x38               ; =56
 45df144: 96e8c089     	bl	0xf368 <_ChromeMain+0xa0cc>
 45df148: 52800028     	mov	w8, #0x1                ; =1
 45df14c: b9000008     	str	w8, [x0]
 45df150: b0ffcde8     	adrp	x8, 0x3f9c000 <_ChromeMain+0x3f96d64>
 45df154: 91390108     	add	x8, x8, #0xe40
 45df158: b0fea729     	adrp	x9, 0x1ac4000 <_ChromeMain+0x1abed64>
 45df15c: 91180129     	add	x9, x9, #0x600
 45df160: a900a408     	stp	x8, x9, [x0, #0x8]
 45df164: 10ffd1c8     	adr	x8, 0x45deb9c <_ChromeMain+0x45d9900>
 45df168: d503201f     	nop
 45df16c: a901a016     	stp	x22, x8, [x0, #0x18]
 45df170: a902cc1f     	stp	xzr, x19, [x0, #0x28]
 45df174: f9427af4     	ldr	x20, [x23, #0x4f0]
 45df178: f9027ae0     	str	x0, [x23, #0x4f0]
 45df17c: b50006f4     	cbnz	x20, 0x45df258 <_ChromeMain+0x45d9fbc>
 45df180: f9429e60     	ldr	x0, [x19, #0x538]
 45df184: 97ffe358     	bl	0x45d7ee4 <_ChromeMain+0x45d2c48>
 45df188: f9400268     	ldr	x8, [x19]
 45df18c: f9407508     	ldr	x8, [x8, #0xe8]
 45df190: d00527a1     	adrp	x1, 0xead5000 <dyld_stub_binder+0xead5000>
 45df194: 91218021     	add	x1, x1, #0x860
 45df198: aa1303e0     	mov	x0, x19
 45df19c: d63f0100     	blr	x8
 45df1a0: b40001a0     	cbz	x0, 0x45df1d4 <_ChromeMain+0x45d9f38>
 45df1a4: aa1303e0     	mov	x0, x19
 45df1a8: 97fff18c     	bl	0x45db7d8 <_ChromeMain+0x45d653c>
 45df1ac: aa1303e0     	mov	x0, x19
 45df1b0: 52800001     	mov	w1, #0x0                ; =0
 45df1b4: 970144b0     	bl	0x630474 <_ChromeMain+0x62b1d8>
 45df1b8: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 45df1bc: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 45df1c0: a94857f6     	ldp	x22, x21, [sp, #0x80]
 45df1c4: a9475ff8     	ldp	x24, x23, [sp, #0x70]
 45df1c8: a94667fa     	ldp	x26, x25, [sp, #0x60]
 45df1cc: 9102c3ff     	add	sp, sp, #0xb0
 45df1d0: d65f03c0     	ret
 45df1d4: f942b668     	ldr	x8, [x19, #0x568]
 45df1d8: b4fffe68     	cbz	x8, 0x45df1a4 <_ChromeMain+0x45d9f08>
 45df1dc: f9422e68     	ldr	x8, [x19, #0x458]
 45df1e0: f9429d17     	ldr	x23, [x8, #0x538]
 45df1e4: b4fffe17     	cbz	x23, 0x45df1a4 <_ChromeMain+0x45d9f08>
 45df1e8: b94062e8     	ldr	w8, [x23, #0x60]
 45df1ec: 35fffdc8     	cbnz	w8, 0x45df1a4 <_ChromeMain+0x45d9f08>
 45df1f0: f94046f5     	ldr	x21, [x23, #0x88]
 45df1f4: f0054948     	adrp	x8, 0xef0a000 <dyld_stub_binder+0xef0a000>
 45df1f8: 91120108     	add	x8, x8, #0x480
 45df1fc: f8bfc100     	ldapr	x0, [x8]
 45df200: b40010a0     	cbz	x0, 0x45df414 <_ChromeMain+0x45da178>
 45df204: 5280ae01     	mov	w1, #0x570              ; =1392
 45df208: d2800002     	mov	x2, #0x0                ; =0
 45df20c: 96eb30e9     	bl	0xab5b0 <_ChromeMain+0xa6314>
 45df210: aa0003f4     	mov	x20, x0
 45df214: 9100a2e1     	add	x1, x23, #0x28
 45df218: aa1503e2     	mov	x2, x21
 45df21c: d2800003     	mov	x3, #0x0                ; =0
 45df220: 94029448     	bl	0x4684340 <_ChromeMain+0x467f0a4>
 45df224: f940ce62     	ldr	x2, [x19, #0x198]
 45df228: d37df048     	lsl	x8, x2, #3
 45df22c: b4000568     	cbz	x8, 0x45df2d8 <_ChromeMain+0x45da03c>
 45df230: d2800009     	mov	x9, #0x0                ; =0
 45df234: f942b66a     	ldr	x10, [x19, #0x568]
 45df238: f940ca6b     	ldr	x11, [x19, #0x190]
 45df23c: f869696c     	ldr	x12, [x11, x9]
 45df240: eb0a019f     	cmp	x12, x10
 45df244: 54000480     	b.eq	0x45df2d4 <_ChromeMain+0x45da038>
 45df248: 91002129     	add	x9, x9, #0x8
 45df24c: eb09011f     	cmp	x8, x9
 45df250: 54ffff61     	b.ne	0x45df23c <_ChromeMain+0x45d9fa0>
 45df254: 14000021     	b	0x45df2d8 <_ChromeMain+0x45da03c>
 45df258: 12800008     	mov	w8, #-0x1               ; =-1
 45df25c: b8e80288     	ldaddal	w8, w8, [x20]
 45df260: 7100051f     	cmp	w8, #0x1
 45df264: 54fff8e1     	b.ne	0x45df180 <_ChromeMain+0x45d9ee4>
 45df268: f9400a88     	ldr	x8, [x20, #0x10]
 45df26c: d0fe4e29     	adrp	x9, 0xfa5000 <_ChromeMain+0xf9fd64>
 45df270: 91190129     	add	x9, x9, #0x640
 45df274: eb09011f     	cmp	x8, x9
 45df278: 54000140     	b.eq	0x45df2a0 <_ChromeMain+0x45da004>
 45df27c: b0ff9c69     	adrp	x9, 0x396c000 <_ChromeMain+0x3966d64>
 45df280: 91180129     	add	x9, x9, #0x600
 45df284: aa1403e0     	mov	x0, x20
 45df288: eb09011f     	cmp	x8, x9
 45df28c: 54000060     	b.eq	0x45df298 <_ChromeMain+0x45d9ffc>
 45df290: d63f0100     	blr	x8
 45df294: 17ffffbb     	b	0x45df180 <_ChromeMain+0x45d9ee4>
 45df298: 52800701     	mov	w1, #0x38               ; =56
 45df29c: 14000005     	b	0x45df2b0 <_ChromeMain+0x45da014>
 45df2a0: f9401a80     	ldr	x0, [x20, #0x30]
 45df2a4: b50000a0     	cbnz	x0, 0x45df2b8 <_ChromeMain+0x45da01c>
 45df2a8: aa1403e0     	mov	x0, x20
 45df2ac: 52800901     	mov	w1, #0x48               ; =72
 45df2b0: 96e8a702     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45df2b4: 17ffffb3     	b	0x45df180 <_ChromeMain+0x45d9ee4>
 45df2b8: 12800008     	mov	w8, #-0x1               ; =-1
 45df2bc: b8e80008     	ldaddal	w8, w8, [x0]
 45df2c0: 7100051f     	cmp	w8, #0x1
 45df2c4: 54ffff21     	b.ne	0x45df2a8 <_ChromeMain+0x45da00c>
 45df2c8: 52800101     	mov	w1, #0x8                ; =8
 45df2cc: 96e8a6fb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 45df2d0: 17fffff6     	b	0x45df2a8 <_ChromeMain+0x45da00c>
 45df2d4: 9343fd22     	asr	x2, x9, #3
 45df2d8: 3945a688     	ldrb	w8, [x20, #0x169]
 45df2dc: 35000a08     	cbnz	w8, 0x45df41c <_ChromeMain+0x45da180>
 45df2e0: aa1303e0     	mov	x0, x19
 45df2e4: aa1403e1     	mov	x1, x20
 45df2e8: 97066845     	bl	0x7793fc <_ChromeMain+0x774160>
 45df2ec: 52800035     	mov	w21, #0x1               ; =1
 45df2f0: b90033f5     	str	w21, [sp, #0x30]
 45df2f4: d0052121     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 45df2f8: 9115a021     	add	x1, x1, #0x568
 45df2fc: 91036280     	add	x0, x20, #0xd8
 45df300: 9100c3e2     	add	x2, sp, #0x30
 45df304: 97b2b645     	bl	0x328cc18 <_ChromeMain+0x328797c>
 45df308: b004cb08     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 45df30c: 3dc02500     	ldr	q0, [x8, #0x90]
 45df310: 3d800fe0     	str	q0, [sp, #0x30]
 45df314: d0052121     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 45df318: 91122021     	add	x1, x1, #0x488
 45df31c: 9100c3f7     	add	x23, sp, #0x30
 45df320: 91036280     	add	x0, x20, #0xd8
 45df324: 9100c3e2     	add	x2, sp, #0x30
 45df328: 97543ace     	bl	0x1aede60 <_ChromeMain+0x1ae8bc4>
 45df32c: 52800800     	mov	w0, #0x40               ; =64
 45df330: 96e8c00e     	bl	0xf368 <_ChromeMain+0xa0cc>
 45df334: b9000015     	str	w21, [x0]
 45df338: 90fe5248     	adrp	x8, 0x1027000 <_ChromeMain+0x1021d64>
 45df33c: 91260108     	add	x8, x8, #0x980
 45df340: f0fde889     	adrp	x9, 0x2f2000 <_ChromeMain+0x2ecd64>
 45df344: 91220129     	add	x9, x9, #0x880
 45df348: a900a408     	stp	x8, x9, [x0, #0x8]
 45df34c: f0ffaa28     	adrp	x8, 0x3b26000 <_ChromeMain+0x3b20d64>
 45df350: 91310108     	add	x8, x8, #0xc40
 45df354: a901a016     	stp	x22, x8, [x0, #0x18]
 45df358: b004cb08     	adrp	x8, 0xdf40000 <dyld_stub_binder+0xdf40000>
 45df35c: 3dc01900     	ldr	q0, [x8, #0x60]
 45df360: 3c828000     	stur	q0, [x0, #0x28]
 45df364: 3900e01f     	strb	wzr, [x0, #0x38]
 45df368: f90003e0     	str	x0, [sp]
 45df36c: 0f000420     	movi.2s	v0, #0x1
 45df370: fd0007e0     	str	d0, [sp, #0x8]
 45df374: 52800068     	mov	w8, #0x3                ; =3
 45df378: b90013e8     	str	w8, [sp, #0x10]
 45df37c: a9027fff     	stp	xzr, xzr, [sp, #0x20]
 45df380: f9000fff     	str	xzr, [sp, #0x18]
 45df384: f90023ff     	str	xzr, [sp, #0x40]
 45df388: f9001be0     	str	x0, [sp, #0x30]
 45df38c: b5000280     	cbnz	x0, 0x45df3dc <_ChromeMain+0x45da140>
 45df390: 910003e8     	mov	x8, sp
 45df394: f8408109     	ldur	x9, [x8, #0x8]
 45df398: f80082e9     	stur	x9, [x23, #0x8]
 45df39c: b8410108     	ldur	w8, [x8, #0x10]
 45df3a0: b80102e8     	stur	w8, [x23, #0x10]
 45df3a4: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 45df3a8: f90027ff     	str	xzr, [sp, #0x48]
 45df3ac: 528000a8     	mov	w8, #0x5                ; =5
 45df3b0: b9003be8     	str	w8, [sp, #0x38]
 45df3b4: d0052121     	adrp	x1, 0xea05000 <dyld_stub_binder+0xea05000>
 45df3b8: 91152021     	add	x1, x1, #0x548
 45df3bc: 91036280     	add	x0, x20, #0xd8
 45df3c0: 9100c3e2     	add	x2, sp, #0x30
 45df3c4: 9758d3f2     	bl	0x1c1438c <_ChromeMain+0x1c0f0f0>
 45df3c8: 9100c3e0     	add	x0, sp, #0x30
 45df3cc: 9745ae56     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 45df3d0: 910003e0     	mov	x0, sp
 45df3d4: 9745ae54     	bl	0x174ad24 <_ChromeMain+0x1745a88>
 45df3d8: 17ffff73     	b	0x45df1a4 <_ChromeMain+0x45d9f08>
 45df3dc: b8350008     	ldadd	w21, w8, [x0]
 45df3e0: 7100011f     	cmp	w8, #0x0
 45df3e4: 5400022d     	b.le	0x45df428 <_ChromeMain+0x45da18c>
 45df3e8: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 45df3ec: 6b09011f     	cmp	w8, w9
 45df3f0: 54fffd01     	b.ne	0x45df390 <_ChromeMain+0x45da0f4>
 45df3f4: d4200000     	brk	#0
 45df3f8: d4400000     	hlt	#0
 45df3fc: d4200020     	brk	#0x1
 45df400: d4200000     	brk	#0
 45df404: d4400000     	hlt	#0
 45df408: d4200020     	brk	#0x1
 45df40c: 52800022     	mov	w2, #0x1                ; =1
 45df410: 17ffff41     	b	0x45df114 <_ChromeMain+0x45d9e78>
 45df414: 97f3d0b9     	bl	0x42d36f8 <_ChromeMain+0x42ce45c>
 45df418: 17ffff7b     	b	0x45df204 <_ChromeMain+0x45d9f68>
 45df41c: d4200000     	brk	#0
 45df420: d4400000     	hlt	#0
 45df424: d4200020     	brk	#0x1
 45df428: d4200000     	brk	#0
 45df42c: d4400000     	hlt	#0
 45df430: d4200020     	brk	#0x1
