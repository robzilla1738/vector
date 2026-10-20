
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4609668: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 460966c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4609670: 910043fd     	add	x29, sp, #0x10
 4609674: aa0803f3     	mov	x19, x8
 4609678: 39423c09     	ldrb	w9, [x0, #0x8f]
 460967c: 13001d28     	sxtb	w8, w9
 4609680: f9404002     	ldr	x2, [x0, #0x80]
 4609684: 7100011f     	cmp	w8, #0x0
 4609688: 9a894049     	csel	x9, x2, x9, mi
 460968c: b40001c9     	cbz	x9, 0x46096c4 <_ChromeMain+0x4604428>
 4609690: 37f80108     	tbnz	w8, #0x1f, 0x46096b0 <_ChromeMain+0x4604414>
 4609694: 3cc78000     	ldur	q0, [x0, #0x78]
 4609698: 3d800260     	str	q0, [x19]
 460969c: f8488008     	ldur	x8, [x0, #0x88]
 46096a0: f9000a68     	str	x8, [x19, #0x10]
 46096a4: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 46096a8: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 46096ac: d65f03c0     	ret
 46096b0: f8478001     	ldur	x1, [x0, #0x78]
 46096b4: aa1303e0     	mov	x0, x19
 46096b8: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 46096bc: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 46096c0: 16e8f544     	b	0x46bd0 <_ChromeMain+0x41934>
 46096c4: b9403c08     	ldr	w8, [x0, #0x3c]
 46096c8: 7100051f     	cmp	w8, #0x1
 46096cc: 5400022b     	b.lt	0x4609710 <_ChromeMain+0x4604474>
 46096d0: 39405c0a     	ldrb	w10, [x0, #0x17]
 46096d4: 13001d49     	sxtb	w9, w10
 46096d8: f940040b     	ldr	x11, [x0, #0x8]
 46096dc: 7100013f     	cmp	w9, #0x0
 46096e0: 9a8a416b     	csel	x11, x11, x10, mi
 46096e4: b980380a     	ldrsw	x10, [x0, #0x38]
 46096e8: eb0a016b     	subs	x11, x11, x10
 46096ec: 54000283     	b.lo	0x460973c <_ChromeMain+0x46044a0>
 46096f0: 54000100     	b.eq	0x4609710 <_ChromeMain+0x4604474>
 46096f4: eb08017f     	cmp	x11, x8
 46096f8: 9a883161     	csel	x1, x11, x8, lo
 46096fc: f9400008     	ldr	x8, [x0]
 4609700: 7100013f     	cmp	w9, #0x0
 4609704: 9a804108     	csel	x8, x8, x0, mi
 4609708: 8b0a0100     	add	x0, x8, x10
 460970c: 14000008     	b	0x460972c <_ChromeMain+0x4604490>
 4609710: 97018cde     	bl	0x66ca88 <_ChromeMain+0x6677ec>
 4609714: 39805c08     	ldrsb	x8, [x0, #0x17]
 4609718: a9402809     	ldp	x9, x10, [x0]
 460971c: f100011f     	cmp	x8, #0x0
 4609720: 9a804120     	csel	x0, x9, x0, mi
 4609724: 7100011f     	cmp	w8, #0x0
 4609728: 9a884141     	csel	x1, x10, x8, mi
 460972c: aa1303e8     	mov	x8, x19
 4609730: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4609734: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4609738: 170b62f6     	b	0x8e2310 <_ChromeMain+0x8dd074>
 460973c: f0048ec0     	adrp	x0, 0xd7e4000 <dyld_stub_binder+0xd7e4000>
 4609740: 91376000     	add	x0, x0, #0xdd8
 4609744: 9417dae4     	bl	0x4c002d4 <_ChromeMain+0x4bfb038>
