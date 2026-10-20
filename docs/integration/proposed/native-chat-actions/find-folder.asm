
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4670990: b4000180     	cbz	x0, 0x46709c0 <_ChromeMain+0x466b724>
 4670994: b940f808     	ldr	w8, [x0, #0xf8]
 4670998: 34000128     	cbz	w8, 0x46709bc <_ChromeMain+0x466b720>
 467099c: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 46709a0: a9017bfd     	stp	x29, x30, [sp, #0x10]
 46709a4: 910043fd     	add	x29, sp, #0x10
 46709a8: f9402408     	ldr	x8, [x0, #0x48]
 46709ac: d37df113     	lsl	x19, x8, #3
 46709b0: b40000b3     	cbz	x19, 0x46709c4 <_ChromeMain+0x466b728>
 46709b4: f9402014     	ldr	x20, [x0, #0x40]
 46709b8: 1400000c     	b	0x46709e8 <_ChromeMain+0x466b74c>
 46709bc: d2800000     	mov	x0, #0x0                ; =0
 46709c0: d65f03c0     	ret
 46709c4: d2800000     	mov	x0, #0x0                ; =0
 46709c8: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 46709cc: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 46709d0: d65f03c0     	ret
 46709d4: 97ffffef     	bl	0x4670990 <_ChromeMain+0x466b6f4>
 46709d8: b5ffff80     	cbnz	x0, 0x46709c8 <_ChromeMain+0x466b72c>
 46709dc: 91002294     	add	x20, x20, #0x8
 46709e0: f1002273     	subs	x19, x19, #0x8
 46709e4: 54ffff00     	b.eq	0x46709c4 <_ChromeMain+0x466b728>
 46709e8: f9400280     	ldr	x0, [x20]
 46709ec: b4ffff80     	cbz	x0, 0x46709dc <_ChromeMain+0x466b740>
 46709f0: b940f808     	ldr	w8, [x0, #0xf8]
 46709f4: 34ffff48     	cbz	w8, 0x46709dc <_ChromeMain+0x466b740>
 46709f8: 39407c09     	ldrb	w9, [x0, #0x1f]
 46709fc: 13001d28     	sxtb	w8, w9
 4670a00: f940080a     	ldr	x10, [x0, #0x10]
 4670a04: 7100011f     	cmp	w8, #0x0
 4670a08: 9a894149     	csel	x9, x10, x9, mi
 4670a0c: f1002d3f     	cmp	x9, #0xb
 4670a10: 54fffe21     	b.ne	0x46709d4 <_ChromeMain+0x466b738>
 4670a14: aa0003e9     	mov	x9, x0
 4670a18: f8408d2a     	ldr	x10, [x9, #0x8]!
 4670a1c: 7100011f     	cmp	w8, #0x0
 4670a20: 9a894148     	csel	x8, x10, x9, mi
 4670a24: 79400109     	ldrh	w9, [x8]
 4670a28: 7101053f     	cmp	w9, #0x41
 4670a2c: 54fffd41     	b.ne	0x46709d4 <_ChromeMain+0x466b738>
 4670a30: 79400509     	ldrh	w9, [x8, #0x2]
 4670a34: 7101cd3f     	cmp	w9, #0x73
 4670a38: 54fffce1     	b.ne	0x46709d4 <_ChromeMain+0x466b738>
 4670a3c: 79400909     	ldrh	w9, [x8, #0x4]
 4670a40: 7101a53f     	cmp	w9, #0x69
 4670a44: 54fffc81     	b.ne	0x46709d4 <_ChromeMain+0x466b738>
 4670a48: 79400d09     	ldrh	w9, [x8, #0x6]
 4670a4c: 7101913f     	cmp	w9, #0x64
 4670a50: 54fffc21     	b.ne	0x46709d4 <_ChromeMain+0x466b738>
 4670a54: 79401109     	ldrh	w9, [x8, #0x8]
 4670a58: 7101953f     	cmp	w9, #0x65
 4670a5c: 54fffbc1     	b.ne	0x46709d4 <_ChromeMain+0x466b738>
 4670a60: 79401509     	ldrh	w9, [x8, #0xa]
 4670a64: 7100813f     	cmp	w9, #0x20
 4670a68: 54fffb61     	b.ne	0x46709d4 <_ChromeMain+0x466b738>
 4670a6c: 79401909     	ldrh	w9, [x8, #0xc]
 4670a70: 7101513f     	cmp	w9, #0x54
 4670a74: 54fffb01     	b.ne	0x46709d4 <_ChromeMain+0x466b738>
 4670a78: 79401d09     	ldrh	w9, [x8, #0xe]
 4670a7c: 7101853f     	cmp	w9, #0x61
 4670a80: 54fffaa1     	b.ne	0x46709d4 <_ChromeMain+0x466b738>
 4670a84: 79402109     	ldrh	w9, [x8, #0x10]
 4670a88: 7101cd3f     	cmp	w9, #0x73
 4670a8c: 54fffa41     	b.ne	0x46709d4 <_ChromeMain+0x466b738>
 4670a90: 79402509     	ldrh	w9, [x8, #0x12]
 4670a94: 7101ad3f     	cmp	w9, #0x6b
 4670a98: 54fff9e1     	b.ne	0x46709d4 <_ChromeMain+0x466b738>
 4670a9c: 79402908     	ldrh	w8, [x8, #0x14]
 4670aa0: 7101cd1f     	cmp	w8, #0x73
 4670aa4: 54fff920     	b.eq	0x46709c8 <_ChromeMain+0x466b72c>
 4670aa8: 17ffffcb     	b	0x46709d4 <_ChromeMain+0x466b738>
