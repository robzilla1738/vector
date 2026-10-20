
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 425b800: 39463fe8     	ldrb	w8, [sp, #0x18f]
 425b804: f940c3e9     	ldr	x9, [sp, #0x180]
 425b808: 7219011f     	tst	w8, #0x80
 425b80c: 9a881128     	csel	x8, x9, x8, ne
 425b810: f100011f     	cmp	x8, #0x0
 425b814: f9402be8     	ldr	x8, [sp, #0x50]
 425b818: 9a880508     	cinc	x8, x8, ne
 425b81c: f9002be8     	str	x8, [sp, #0x50]
 425b820: 910c83e0     	add	x0, sp, #0x320
 425b824: 52810601     	mov	w1, #0x830              ; =2096
 425b828: 94f6b7fa     	bl	0x8009810 <_ChromeMain+0x8004574>
 425b82c: 910c83e0     	add	x0, sp, #0x320
 425b830: 94ac3449     	bl	0x6d68954 <_ChromeMain+0x6d636b8>
 425b834: 910643e0     	add	x0, sp, #0x190
 425b838: 52800001     	mov	w1, #0x0                ; =0
 425b83c: 9711e9e9     	bl	0x6d5fe0 <_ChromeMain+0x6d0d44>
 425b840: aa0003e2     	mov	x2, x0
 425b844: aa0103e3     	mov	x3, x1
 425b848: 9103a3e0     	add	x0, sp, #0xe8
 425b84c: aa0203e1     	mov	x1, x2
