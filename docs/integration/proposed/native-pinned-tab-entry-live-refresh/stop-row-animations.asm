
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 c78512c: d10143ff     	sub	sp, sp, #0x50
 c785130: a90257f6     	stp	x22, x21, [sp, #0x20]
 c785134: a9034ff4     	stp	x20, x19, [sp, #0x30]
 c785138: a9047bfd     	stp	x29, x30, [sp, #0x40]
 c78513c: 910103fd     	add	x29, sp, #0x40
 c785140: aa0003f3     	mov	x19, x0
 c785144: a9007fff     	stp	xzr, xzr, [sp]
 c785148: f9000bff     	str	xzr, [sp, #0x10]
 c78514c: f941dc01     	ldr	x1, [x0, #0x3b8]
 c785150: 910003e0     	mov	x0, sp
 c785154: 94102818     	bl	0xcb8f1b4 <_ChromeMain+0xcb89f18>
 c785158: f941d675     	ldr	x21, [x19, #0x3a8]
 c78515c: 910ec274     	add	x20, x19, #0x3b0
 c785160: eb1402bf     	cmp	x21, x20
 c785164: 540000e0     	b.eq	0xc785180 <_ChromeMain+0xc77fee4>
 c785168: 910003e0     	mov	x0, sp
 c78516c: 910082a1     	add	x1, x21, #0x20
 c785170: 9612b164     	bl	0x4c31700 <_ChromeMain+0x4c2c464>
 c785174: f94006a8     	ldr	x8, [x21, #0x8]
 c785178: b50002a8     	cbnz	x8, 0xc7851cc <_ChromeMain+0xc77ff30>
 c78517c: 14000018     	b	0xc7851dc <_ChromeMain+0xc77ff40>
 c785180: f94007e8     	ldr	x8, [sp, #0x8]
 c785184: d37df114     	lsl	x20, x8, #3
 c785188: b4000114     	cbz	x20, 0xc7851a8 <_ChromeMain+0xc77ff0c>
 c78518c: f94003f5     	ldr	x21, [sp]
 c785190: f84086a1     	ldr	x1, [x21], #0x8
 c785194: aa1303e0     	mov	x0, x19
 c785198: 52800022     	mov	w2, #0x1                ; =1
 c78519c: 9410aac8     	bl	0xcbafcbc <_ChromeMain+0xcbaaa20>
 c7851a0: f1002294     	subs	x20, x20, #0x8
 c7851a4: 54ffff61     	b.ne	0xc785190 <_ChromeMain+0xc77fef4>
 c7851a8: 910003e8     	mov	x8, sp
 c7851ac: f9000fe8     	str	x8, [sp, #0x18]
 c7851b0: 910063e0     	add	x0, sp, #0x18
 c7851b4: 940ff69b     	bl	0xcb82c20 <_ChromeMain+0xcb7d984>
 c7851b8: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 c7851bc: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 c7851c0: a94257f6     	ldp	x22, x21, [sp, #0x20]
 c7851c4: 910143ff     	add	sp, sp, #0x50
 c7851c8: d65f03c0     	ret
 c7851cc: aa0803f5     	mov	x21, x8
 c7851d0: f9400108     	ldr	x8, [x8]
 c7851d4: b5ffffc8     	cbnz	x8, 0xc7851cc <_ChromeMain+0xc77ff30>
 c7851d8: 17ffffe2     	b	0xc785160 <_ChromeMain+0xc77fec4>
 c7851dc: aa1503e8     	mov	x8, x21
 c7851e0: f9400ab5     	ldr	x21, [x21, #0x10]
 c7851e4: f94002a9     	ldr	x9, [x21]
 c7851e8: eb09011f     	cmp	x8, x9
 c7851ec: 54ffff81     	b.ne	0xc7851dc <_ChromeMain+0xc77ff40>
 c7851f0: 17ffffdc     	b	0xc785160 <_ChromeMain+0xc77fec4>
