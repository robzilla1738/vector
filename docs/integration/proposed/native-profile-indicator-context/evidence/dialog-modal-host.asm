
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 a66b0c0: d10183ff     	sub	sp, sp, #0x60
 a66b0c4: a9025ff8     	stp	x24, x23, [sp, #0x20]
 a66b0c8: a90357f6     	stp	x22, x21, [sp, #0x30]
 a66b0cc: a9044ff4     	stp	x20, x19, [sp, #0x40]
 a66b0d0: a9057bfd     	stp	x29, x30, [sp, #0x50]
 a66b0d4: 910143fd     	add	x29, sp, #0x50
 a66b0d8: aa0303f3     	mov	x19, x3
 a66b0dc: aa0203f4     	mov	x20, x2
 a66b0e0: aa0103f5     	mov	x21, x1
 a66b0e4: aa0003f6     	mov	x22, x0
 a66b0e8: 910003e0     	mov	x0, sp
 a66b0ec: 96a36a05     	bl	0x4f45900 <_ChromeMain+0x4f40664>
 a66b0f0: 52809400     	mov	w0, #0x4a0              ; =1184
 a66b0f4: 94945dd2     	bl	0xcb8283c <_ChromeMain+0xcb7d5a0>
 a66b0f8: aa0003f7     	mov	x23, x0
 a66b0fc: 910043e0     	add	x0, sp, #0x10
 a66b100: 910003e1     	mov	x1, sp
 a66b104: 97ffe225     	bl	0xa663998 <_ChromeMain+0xa65e6fc>
 a66b108: 910043e2     	add	x2, sp, #0x10
 a66b10c: aa1703e0     	mov	x0, x23
 a66b110: aa1603e1     	mov	x1, x22
 a66b114: 52800203     	mov	w3, #0x10               ; =16
 a66b118: aa1503e4     	mov	x4, x21
 a66b11c: aa1403e5     	mov	x5, x20
 a66b120: aa1303e6     	mov	x6, x19
 a66b124: 97fffbf7     	bl	0xa66a100 <_ChromeMain+0xa664e64>
 a66b128: 910043e0     	add	x0, sp, #0x10
 a66b12c: 96224354     	bl	0x2efbe7c <_ChromeMain+0x2ef6be0>
 a66b130: 910003e0     	mov	x0, sp
 a66b134: 96224352     	bl	0x2efbe7c <_ChromeMain+0x2ef6be0>
 a66b138: aa1703e0     	mov	x0, x23
 a66b13c: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 a66b140: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 a66b144: a94357f6     	ldp	x22, x21, [sp, #0x30]
 a66b148: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 a66b14c: 910183ff     	add	sp, sp, #0x60
 a66b150: d65f03c0     	ret
