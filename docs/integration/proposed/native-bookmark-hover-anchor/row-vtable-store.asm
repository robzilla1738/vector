
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4624100:      	sub	sp, sp, #0xd0
 4624104:      	stp	x28, x27, [sp, #0x70]
 4624108:      	stp	x26, x25, [sp, #0x80]
 462410c:      	stp	x24, x23, [sp, #0x90]
 4624110:      	stp	x22, x21, [sp, #0xa0]
 4624114:      	stp	x20, x19, [sp, #0xb0]
 4624118:      	stp	x29, x30, [sp, #0xc0]
 462411c:      	add	x29, sp, #0xc0
 4624120:      	mov	x22, x7
 4624124:      	mov	x23, x6
 4624128:      	mov	x24, x5
 462412c:      	str	w4, [sp, #0x4]
 4624130:      	mov	x25, x3
 4624134:      	mov	x26, x2
 4624138:      	mov	x27, x1
 462413c:      	mov	x19, x0
 4624140:      	bl	0x136f140 <_ChromeMain+0x1369ea4>
 4624144:      	adrp	x21, 0xe720000 <dyld_stub_binder+0xe720000>
 4624148:      	add	x21, x21, #0xd30
 462414c:      	add	x8, x21, #0x408
 4624150:      	stp	x21, x8, [x0]
 4624154:      	add	x8, x21, #0x430
 4624158:      	str	x8, [x0, #0x10]
 462415c:      	add	x8, x21, #0x468
 4624160:      	add	x9, x21, #0x498
 4624164:      	stp	x8, x9, [x0, #0x68]
 4624168:      	add	x8, x21, #0x4e8
 462416c:      	str	x8, [x0, #0xb0]
 4624170:      	add	x8, x21, #0x548
 4624174:      	str	x8, [x0, #0xd8]
 4624178:      	add	x8, x21, #0x578
 462417c:      	adrp	x9, 0xe50b000 <dyld_stub_binder+0xe50b000>
 4624180:      	add	x9, x9, #0xb50
 4624184:      	str	x8, [x0, #0xf8]
 4624188:      	str	x9, [x0, #0x310]
 462418c:      	and	x9, x0, #0xfffffffc00000000
 4624190:      	adrp	x28, 0xebb2000 <dyld_stub_binder+0xebb2000>
 4624194:      	ldr	x8, [x28, #0x88]
 4624198:      	cmp	x9, x8
 462419c:      	b.ne	0x46241a8 <_ChromeMain+0x461ef0c>
 46241a0:      	mov	x0, x19
 46241a4:      	bl	0x142fc <_ChromeMain+0xf060>
 46241a8:      	str	x19, [x19, #0x318]
 46241ac:      	strb	wzr, [x19, #0x3c8]
 46241b0:      	cbz	x19, 0x4624c80 <_ChromeMain+0x461f9e4>
 46241b4:      	ldr	x20, [x29, #0x18]
 46241b8:      	add	x8, x21, #0x408
 46241bc:      	stp	x21, x8, [x19]
 46241c0:      	add	x8, x21, #0x430
 46241c4:      	str	x8, [x19, #0x10]
 46241c8:      	add	x8, x21, #0x468
 46241cc:      	add	x9, x21, #0x498
 46241d0:      	stp	x8, x9, [x19, #0x68]
 46241d4:      	add	x8, x21, #0x4e8
 46241d8:      	str	x8, [x19, #0xb0]
 46241dc:      	add	x8, x21, #0x548
 46241e0:      	str	x8, [x19, #0xd8]
 46241e4:      	add	x8, x21, #0x578
 46241e8:      	str	x8, [x19, #0xf8]
 46241ec:      	add	x8, x21, #0x5a0
 46241f0:      	str	x8, [x19, #0x310]
