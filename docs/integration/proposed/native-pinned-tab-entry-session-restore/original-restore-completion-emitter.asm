
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 415b014: d104c3ff     	sub	sp, sp, #0x130
 415b018: a90e6ffc     	stp	x28, x27, [sp, #0xe0]
 415b01c: a90f5ff8     	stp	x24, x23, [sp, #0xf0]
 415b020: a91057f6     	stp	x22, x21, [sp, #0x100]
 415b024: a9114ff4     	stp	x20, x19, [sp, #0x110]
 415b028: a9127bfd     	stp	x29, x30, [sp, #0x120]
 415b02c: 910483fd     	add	x29, sp, #0x120
 415b030: aa0003f3     	mov	x19, x0
 415b034: a9007d1f     	stp	xzr, xzr, [x8]
 415b038: f900091f     	str	xzr, [x8, #0x10]
 415b03c: a9397fbf     	stp	xzr, xzr, [x29, #-0x70]
 415b040: f81a03bf     	stur	xzr, [x29, #-0x60]
 415b044: eb02003f     	cmp	x1, x2
 415b048: 540000e0     	b.eq	0x415b064 <_ChromeMain+0x4155dc8>
 415b04c: aa0203f4     	mov	x20, x2
 415b050: aa0103f5     	mov	x21, x1
 415b054: aa0803f6     	mov	x22, x8
 415b058: 910043f7     	add	x23, sp, #0x10
 415b05c: 910243f8     	add	x24, sp, #0x90
 415b060: 14000021     	b	0x415b0e4 <_ChromeMain+0x4155e48>
 415b064: d101c3b4     	sub	x20, x29, #0x70
 415b068: d101c3a3     	sub	x3, x29, #0x70
 415b06c: aa1303e0     	mov	x0, x19
 415b070: 52800021     	mov	w1, #0x1                ; =1
 415b074: 52800022     	mov	w2, #0x1                ; =1
 415b078: 97c1c342     	bl	0x31cbd80 <_ChromeMain+0x31c6ae4>
 415b07c: 94000076     	bl	0x415b254 <_ChromeMain+0x4155fb8>
 415b080: f85983a8     	ldur	x8, [x29, #-0x68]
 415b084: b90013e8     	str	w8, [sp, #0x10]
 415b088: 91006260     	add	x0, x19, #0x18
 415b08c: 910043e1     	add	x1, sp, #0x10
 415b090: 97a6fa6c     	bl	0x2b19a40 <_ChromeMain+0x2b147a4>
 415b094: f9000bf4     	str	x20, [sp, #0x10]
 415b098: 910043e0     	add	x0, sp, #0x10
 415b09c: 940000a9     	bl	0x415b340 <_ChromeMain+0x41560a4>
 415b0a0: a9527bfd     	ldp	x29, x30, [sp, #0x120]
 415b0a4: a9514ff4     	ldp	x20, x19, [sp, #0x110]
 415b0a8: a95057f6     	ldp	x22, x21, [sp, #0x100]
 415b0ac: a94f5ff8     	ldp	x24, x23, [sp, #0xf0]
 415b0b0: a94e6ffc     	ldp	x28, x27, [sp, #0xe0]
 415b0b4: 9104c3ff     	add	sp, sp, #0x130
 415b0b8: d65f03c0     	ret
