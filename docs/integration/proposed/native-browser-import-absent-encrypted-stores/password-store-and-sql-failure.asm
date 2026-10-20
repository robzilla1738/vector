
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 425b4fc: 9106c3e0     	add	x0, sp, #0x1b0
 425b500: b004aec1     	adrp	x1, 0xd834000 <dyld_stub_binder+0xd834000>
 425b504: 91299421     	add	x1, x1, #0xa65
 425b508: 97b6d110     	bl	0x300f948 <_ChromeMain+0x300a6ac>
 425b50c: 9106c3e0     	add	x0, sp, #0x1b0
 425b510: 910b03e1     	add	x1, sp, #0x2c0
 425b514: 974c185c     	bl	0x1561684 <_ChromeMain+0x155c3e8>
 425b518: 35ffed80     	cbnz	w0, 0x425b2c8 <_ChromeMain+0x425602c>
 425b51c: 52800013     	mov	w19, #0x0               ; =0
 425b520: 9106c3e0     	add	x0, sp, #0x1b0
 425b524: 97684f30     	bl	0x1c6f1e4 <_ChromeMain+0x1c69f48>
 425b528: 39cb5fe8     	ldrsb	w8, [sp, #0x2d7]
 425b52c: 37f80288     	tbnz	w8, #0x1f, 0x425b57c <_ChromeMain+0x42562e0>
 425b530: 39cbbfe8     	ldrsb	w8, [sp, #0x2ef]
 425b534: 36f84968     	tbz	w8, #0x1f, 0x425be60 <_ChromeMain+0x4256bc4>
 425b538: f94173e8     	ldr	x8, [sp, #0x2e0]
 425b53c: b40002a8     	cbz	x8, 0x425b590 <_ChromeMain+0x42562f4>
 425b540: 910b63e0     	add	x0, sp, #0x2d8
 425b544: 97c04a79     	bl	0x326df28 <_ChromeMain+0x3268c8c>
 425b548: 39cbbfe8     	ldrsb	w8, [sp, #0x2ef]
 425b54c: 340000c0     	cbz	w0, 0x425b564 <_ChromeMain+0x42562c8>
 425b550: 36f800c8     	tbz	w8, #0x1f, 0x425b568 <_ChromeMain+0x42562cc>
 425b554: f9416fe8     	ldr	x8, [sp, #0x2d8]
 425b558: 3900011f     	strb	wzr, [x8]
 425b55c: f90173ff     	str	xzr, [sp, #0x2e0]
 425b560: 394bbfe8     	ldrb	w8, [sp, #0x2ef]
 425b564: 37380168     	tbnz	w8, #0x7, 0x425b590 <_ChromeMain+0x42562f4>
 425b568: 35000373     	cbnz	w19, 0x425b5d4 <_ChromeMain+0x4256338>
 425b56c: f94043f3     	ldr	x19, [sp, #0x80]
 425b570: b5004c13     	cbnz	x19, 0x425bef0 <_ChromeMain+0x4256c54>
 425b574: 52800013     	mov	w19, #0x0               ; =0
 425b578: 1400008a     	b	0x425b7a0 <_ChromeMain+0x4256504>
 425b57c: f94163e0     	ldr	x0, [sp, #0x2c0]
 425b580: f9416be8     	ldr	x8, [sp, #0x2d0]
 425b584: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425b588: 96f6b64c     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b58c: 17ffffe9     	b	0x425b530 <_ChromeMain+0x4256294>
 425b590: f9416fe0     	ldr	x0, [sp, #0x2d8]
 425b594: f94177e8     	ldr	x8, [sp, #0x2e8]
 425b598: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 425b59c: 96f6b647     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 425b5a0: 17fffff2     	b	0x425b568 <_ChromeMain+0x42562cc>
 425b5a4: a947ebf4     	ldp	x20, x26, [sp, #0x78]
 425b5a8: 910c83f5     	add	x21, sp, #0x320
 425b5ac: b50045fa     	cbnz	x26, 0x425be68 <_ChromeMain+0x4256bcc>
 425b5b0: 91006294     	add	x20, x20, #0x18
 425b5b4: f94037e8     	ldr	x8, [sp, #0x68]
 425b5b8: eb08029f     	cmp	x20, x8
 425b5bc: 54000e80     	b.eq	0x425b78c <_ChromeMain+0x42564f0>
 425b5c0: a9087fff     	stp	xzr, xzr, [sp, #0x80]
 425b5c4: f9004bff     	str	xzr, [sp, #0x90]
 425b5c8: aa1403e0     	mov	x0, x20
 425b5cc: 977f239d     	bl	0x2224440 <_ChromeMain+0x221f1a4>
 425b5d0: 35fff100     	cbnz	w0, 0x425b3f0 <_ChromeMain+0x4256154>
