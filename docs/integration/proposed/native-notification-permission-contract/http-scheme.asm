
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  23b024: d10103ff     	sub	sp, sp, #0x40
  23b028: a90157f6     	stp	x22, x21, [sp, #0x10]
  23b02c: a9024ff4     	stp	x20, x19, [sp, #0x20]
  23b030: a9037bfd     	stp	x29, x30, [sp, #0x30]
  23b034: 9100c3fd     	add	x29, sp, #0x30
  23b038: b0076668     	adrp	x8, 0xef08000 <dyld_stub_binder+0xef08000>
  23b03c: f9402108     	ldr	x8, [x8, #0x40]
  23b040: b4000228     	cbz	x8, 0x23b084 <_ChromeMain+0x235de8>
  23b044: f0076688     	adrp	x8, 0xef0e000 <dyld_stub_binder+0xef0e000>
  23b048: 913de108     	add	x8, x8, #0xf78
  23b04c: 38bfc108     	ldaprb	w8, [x8]
  23b050: f0076694     	adrp	x20, 0xef0e000 <dyld_stub_binder+0xef0e000>
  23b054: 36000708     	tbz	w8, #0x0, 0x23b134 <_ChromeMain+0x235e98>
  23b058: 397dc288     	ldrb	w8, [x20, #0xf70]
  23b05c: 34000148     	cbz	w8, 0x23b084 <_ChromeMain+0x235de8>
  23b060: 39406808     	ldrb	w8, [x0, #0x1a]
  23b064: 34000108     	cbz	w8, 0x23b084 <_ChromeMain+0x235de8>
  23b068: 39406408     	ldrb	w8, [x0, #0x19]
  23b06c: 12000100     	and	w0, w8, #0x1
  23b070: a9437bfd     	ldp	x29, x30, [sp, #0x30]
  23b074: a9424ff4     	ldp	x20, x19, [sp, #0x20]
  23b078: a94157f6     	ldp	x22, x21, [sp, #0x10]
  23b07c: 910103ff     	add	sp, sp, #0x40
  23b080: d65f03c0     	ret
  23b084: b940240a     	ldr	w10, [x0, #0x24]
  23b088: 7100055f     	cmp	w10, #0x1
  23b08c: 540001eb     	b.lt	0x23b0c8 <_ChromeMain+0x235e2c>
  23b090: 39405c09     	ldrb	w9, [x0, #0x17]
  23b094: 13001d28     	sxtb	w8, w9
  23b098: f940040b     	ldr	x11, [x0, #0x8]
  23b09c: 7100011f     	cmp	w8, #0x0
  23b0a0: 9a89416b     	csel	x11, x11, x9, mi
  23b0a4: b9802009     	ldrsw	x9, [x0, #0x20]
  23b0a8: eb09016b     	subs	x11, x11, x9
  23b0ac: 54000923     	b.lo	0x23b1d0 <_ChromeMain+0x235f34>
  23b0b0: eb0a017f     	cmp	x11, x10
  23b0b4: 9a8a316a     	csel	x10, x11, x10, lo
  23b0b8: f100155f     	cmp	x10, #0x5
  23b0bc: 540001e0     	b.eq	0x23b0f8 <_ChromeMain+0x235e5c>
  23b0c0: f100115f     	cmp	x10, #0x4
  23b0c4: 54000060     	b.eq	0x23b0d0 <_ChromeMain+0x235e34>
  23b0c8: 52800008     	mov	w8, #0x0                ; =0
  23b0cc: 17ffffe8     	b	0x23b06c <_ChromeMain+0x235dd0>
  23b0d0: f940000a     	ldr	x10, [x0]
  23b0d4: 7100011f     	cmp	w8, #0x0
  23b0d8: 9a804148     	csel	x8, x10, x0, mi
  23b0dc: b8696908     	ldr	w8, [x8, x9]
  23b0e0: b0064f29     	adrp	x9, 0xcc20000 <dyld_stub_binder+0xcc20000>
  23b0e4: 91012d29     	add	x9, x9, #0x4b
  23b0e8: b9400129     	ldr	w9, [x9]
  23b0ec: 6b09011f     	cmp	w8, w9
  23b0f0: 1a9f17e8     	cset	w8, eq
  23b0f4: 17ffffde     	b	0x23b06c <_ChromeMain+0x235dd0>
  23b0f8: f940000a     	ldr	x10, [x0]
  23b0fc: 7100011f     	cmp	w8, #0x0
  23b100: 9a804148     	csel	x8, x10, x0, mi
  23b104: 8b090108     	add	x8, x8, x9
  23b108: b0064f29     	adrp	x9, 0xcc20000 <dyld_stub_binder+0xcc20000>
  23b10c: 91011529     	add	x9, x9, #0x45
  23b110: b940010a     	ldr	w10, [x8]
  23b114: b940012b     	ldr	w11, [x9]
  23b118: 39401108     	ldrb	w8, [x8, #0x4]
  23b11c: 39401129     	ldrb	w9, [x9, #0x4]
  23b120: 6b0b015f     	cmp	w10, w11
  23b124: 7a490100     	ccmp	w8, w9, #0x0, eq
  23b128: 54fffd01     	b.ne	0x23b0c8 <_ChromeMain+0x235e2c>
  23b12c: 52800028     	mov	w8, #0x1                ; =1
  23b130: 17ffffcf     	b	0x23b06c <_ChromeMain+0x235dd0>
