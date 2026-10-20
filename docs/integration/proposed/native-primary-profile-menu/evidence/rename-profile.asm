
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 40feffc: d10103ff     	sub	sp, sp, #0x40
 40ff000: a9024ff4     	stp	x20, x19, [sp, #0x20]
 40ff004: a9037bfd     	stp	x29, x30, [sp, #0x30]
 40ff008: 9100c3fd     	add	x29, sp, #0x30
 40ff00c: aa0003f3     	mov	x19, x0
 40ff010: f0056f28     	adrp	x8, 0xeee6000 <dyld_stub_binder+0xeee6000>
 40ff014: f9467d00     	ldr	x0, [x8, #0xcf8]
 40ff018: b4000400     	cbz	x0, 0x40ff098 <_ChromeMain+0x40f9dfc>
 40ff01c: aa0103f4     	mov	x20, x1
 40ff020: 976482d6     	bl	0x1a1fb78 <_ChromeMain+0x1a1a8dc>
 40ff024: b40003a0     	cbz	x0, 0x40ff098 <_ChromeMain+0x40f9dfc>
 40ff028: 976482fa     	bl	0x1a1fc10 <_ChromeMain+0x1a1a974>
 40ff02c: aa1303e1     	mov	x1, x19
 40ff030: 97648334     	bl	0x1a1fd00 <_ChromeMain+0x1a1aa64>
 40ff034: b4000320     	cbz	x0, 0x40ff098 <_ChromeMain+0x40f9dfc>
 40ff038: aa0003f3     	mov	x19, x0
 40ff03c: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 40ff040: f9000fff     	str	xzr, [sp, #0x18]
 40ff044: 39805e81     	ldrsb	x1, [x20, #0x17]
 40ff048: b6f80041     	tbz	x1, #0x3f, 0x40ff050 <_ChromeMain+0x40f9db4>
 40ff04c: a9400694     	ldp	x20, x1, [x20]
 40ff050: 910023e8     	add	x8, sp, #0x8
 40ff054: aa1403e0     	mov	x0, x20
 40ff058: 52800022     	mov	w2, #0x1                ; =1
 40ff05c: 971f8364     	bl	0x8dfdec <_ChromeMain+0x8dab50>
 40ff060: 39407fe9     	ldrb	w9, [sp, #0x1f]
 40ff064: 13001d28     	sxtb	w8, w9
 40ff068: f9400bea     	ldr	x10, [sp, #0x10]
 40ff06c: 7100011f     	cmp	w8, #0x0
 40ff070: 9a894149     	csel	x9, x10, x9, mi
 40ff074: f100013f     	cmp	x9, #0x0
 40ff078: 1a9f07f4     	cset	w20, ne
 40ff07c: b50001a9     	cbnz	x9, 0x40ff0b0 <_ChromeMain+0x40f9e14>
 40ff080: 363800e8     	tbz	w8, #0x7, 0x40ff09c <_ChromeMain+0x40f9e00>
 40ff084: f94007e0     	ldr	x0, [sp, #0x8]
 40ff088: f9400fe8     	ldr	x8, [sp, #0x18]
 40ff08c: d37ff901     	lsl	x1, x8, #1
 40ff090: 96fc278a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 40ff094: 14000002     	b	0x40ff09c <_ChromeMain+0x40f9e00>
 40ff098: 52800014     	mov	w20, #0x0               ; =0
 40ff09c: aa1403e0     	mov	x0, x20
 40ff0a0: a9437bfd     	ldp	x29, x30, [sp, #0x30]
 40ff0a4: a9424ff4     	ldp	x20, x19, [sp, #0x20]
 40ff0a8: 910103ff     	add	sp, sp, #0x40
 40ff0ac: d65f03c0     	ret
 40ff0b0: 910023e1     	add	x1, sp, #0x8
 40ff0b4: aa1303e0     	mov	x0, x19
 40ff0b8: 52800002     	mov	w2, #0x0                ; =0
 40ff0bc: 94e7354a     	bl	0x7acc5e4 <_ChromeMain+0x7ac7348>
 40ff0c0: 39407fe8     	ldrb	w8, [sp, #0x1f]
 40ff0c4: 373ffe08     	tbnz	w8, #0x7, 0x40ff084 <_ChromeMain+0x40f9de8>
 40ff0c8: 17fffff5     	b	0x40ff09c <_ChromeMain+0x40f9e00>
