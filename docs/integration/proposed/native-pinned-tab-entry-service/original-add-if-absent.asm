
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41d4ccc: d10283ff     	sub	sp, sp, #0xa0
 41d4cd0: a9046ffc     	stp	x28, x27, [sp, #0x40]
 41d4cd4: a90567fa     	stp	x26, x25, [sp, #0x50]
 41d4cd8: a9065ff8     	stp	x24, x23, [sp, #0x60]
 41d4cdc: a90757f6     	stp	x22, x21, [sp, #0x70]
 41d4ce0: a9084ff4     	stp	x20, x19, [sp, #0x80]
 41d4ce4: a9097bfd     	stp	x29, x30, [sp, #0x90]
 41d4ce8: 910243fd     	add	x29, sp, #0x90
 41d4cec: 39406028     	ldrb	w8, [x1, #0x18]
 41d4cf0: 34000be8     	cbz	w8, 0x41d4e6c <_ChromeMain+0x41cfbd0>
 41d4cf4: aa0203f5     	mov	x21, x2
 41d4cf8: aa0103f4     	mov	x20, x1
 41d4cfc: aa0003f3     	mov	x19, x0
 41d4d00: 910023e8     	add	x8, sp, #0x8
 41d4d04: 97fffe57     	bl	0x41d4660 <_ChromeMain+0x41cf3c4>
 41d4d08: a940ebf7     	ldp	x23, x26, [sp, #0x8]
 41d4d0c: 8b1a0f48     	add	x8, x26, x26, lsl #3
 41d4d10: d37ced19     	lsl	x25, x8, #4
 41d4d14: b40004d9     	cbz	x25, 0x41d4dac <_ChromeMain+0x41cfb10>
 41d4d18: 39405e88     	ldrb	w8, [x20, #0x17]
 41d4d1c: 13001d1b     	sxtb	w27, w8
 41d4d20: f9400689     	ldr	x9, [x20, #0x8]
 41d4d24: 7100037f     	cmp	w27, #0x0
 41d4d28: 9a884136     	csel	x22, x9, x8, mi
 41d4d2c: aa1903fc     	mov	x28, x25
 41d4d30: aa1703f8     	mov	x24, x23
 41d4d34: 14000004     	b	0x41d4d44 <_ChromeMain+0x41cfaa8>
 41d4d38: 91024318     	add	x24, x24, #0x90
 41d4d3c: f102439c     	subs	x28, x28, #0x90
 41d4d40: 54000360     	b.eq	0x41d4dac <_ChromeMain+0x41cfb10>
 41d4d44: 39405f09     	ldrb	w9, [x24, #0x17]
 41d4d48: 13001d28     	sxtb	w8, w9
 41d4d4c: f940070a     	ldr	x10, [x24, #0x8]
 41d4d50: 7100011f     	cmp	w8, #0x0
 41d4d54: 9a894149     	csel	x9, x10, x9, mi
 41d4d58: eb16013f     	cmp	x9, x22
 41d4d5c: 54fffee1     	b.ne	0x41d4d38 <_ChromeMain+0x41cfa9c>
 41d4d60: f9400309     	ldr	x9, [x24]
 41d4d64: 7100011f     	cmp	w8, #0x0
 41d4d68: 9a984120     	csel	x0, x9, x24, mi
 41d4d6c: f9400288     	ldr	x8, [x20]
 41d4d70: 7100037f     	cmp	w27, #0x0
 41d4d74: 9a944101     	csel	x1, x8, x20, mi
 41d4d78: aa1603e2     	mov	x2, x22
 41d4d7c: 94f8d2b9     	bl	0x8009860 <_ChromeMain+0x80045c4>
 41d4d80: 35fffdc0     	cbnz	w0, 0x41d4d38 <_ChromeMain+0x41cfa9c>
 41d4d84: d291c738     	mov	x24, #0x8e39            ; =36409
 41d4d88: f2a71c78     	movk	x24, #0x38e3, lsl #16
 41d4d8c: f2dc71d8     	movk	x24, #0xe38e, lsl #32
 41d4d90: f2f1c718     	movk	x24, #0x8e38, lsl #48
 41d4d94: b5000517     	cbnz	x23, 0x41d4e34 <_ChromeMain+0x41cfb98>
 41d4d98: 14000035     	b	0x41d4e6c <_ChromeMain+0x41cfbd0>
 41d4d9c: a9400aa1     	ldp	x1, x2, [x21]
 41d4da0: 910083e0     	add	x0, sp, #0x20
 41d4da4: 96f9c78b     	bl	0x46bd0 <_ChromeMain+0x41934>
 41d4da8: 1400000d     	b	0x41d4ddc <_ChromeMain+0x41cfb40>
 41d4dac: f9400fe8     	ldr	x8, [sp, #0x18]
 41d4db0: eb08035f     	cmp	x26, x8
 41d4db4: 54000a40     	b.eq	0x41d4efc <_ChromeMain+0x41cfc60>
 41d4db8: 52801208     	mov	w8, #0x90               ; =144
 41d4dbc: 9b085f56     	madd	x22, x26, x8, x23
 41d4dc0: b40009d6     	cbz	x22, 0x41d4ef8 <_ChromeMain+0x41cfc5c>
 41d4dc4: 39c05ea8     	ldrsb	w8, [x21, #0x17]
 41d4dc8: 37fffea8     	tbnz	w8, #0x1f, 0x41d4d9c <_ChromeMain+0x41cfb00>
 41d4dcc: 3dc002a0     	ldr	q0, [x21]
 41d4dd0: 3d800be0     	str	q0, [sp, #0x20]
 41d4dd4: f9400aa8     	ldr	x8, [x21, #0x10]
 41d4dd8: f9001be8     	str	x8, [sp, #0x30]
 41d4ddc: d291c738     	mov	x24, #0x8e39            ; =36409
 41d4de0: f2a71c78     	movk	x24, #0x38e3, lsl #16
 41d4de4: f2dc71d8     	movk	x24, #0xe38e, lsl #32
 41d4de8: f2f1c718     	movk	x24, #0x8e38, lsl #48
 41d4dec: aa1603e0     	mov	x0, x22
 41d4df0: aa1403e1     	mov	x1, x20
 41d4df4: 96fd9468     	bl	0x139f94 <_ChromeMain+0x134cf8>
 41d4df8: 3dc00be0     	ldr	q0, [sp, #0x20]
 41d4dfc: f9401be8     	ldr	x8, [sp, #0x30]
 41d4e00: f90046c8     	str	x8, [x22, #0x88]
 41d4e04: 3c8782c0     	stur	q0, [x22, #0x78]
 41d4e08: 910242c0     	add	x0, x22, #0x90
 41d4e0c: f94007f7     	ldr	x23, [sp, #0x8]
 41d4e10: eb170019     	subs	x25, x0, x23
 41d4e14: 9344ff28     	asr	x8, x25, #4
 41d4e18: 9b187d08     	mul	x8, x8, x24
 41d4e1c: f9000be8     	str	x8, [sp, #0x10]
 41d4e20: 540006c0     	b.eq	0x41d4ef8 <_ChromeMain+0x41cfc5c>
 41d4e24: 910023e1     	add	x1, sp, #0x8
 41d4e28: aa1303e0     	mov	x0, x19
 41d4e2c: 97fffefe     	bl	0x41d4a24 <_ChromeMain+0x41cf788>
 41d4e30: b40001f7     	cbz	x23, 0x41d4e6c <_ChromeMain+0x41cfbd0>
 41d4e34: aa1703e0     	mov	x0, x23
 41d4e38: b40000b9     	cbz	x25, 0x41d4e4c <_ChromeMain+0x41cfbb0>
 41d4e3c: d2800013     	mov	x19, #0x0               ; =0
 41d4e40: aa1703f4     	mov	x20, x23
 41d4e44: 14000027     	b	0x41d4ee0 <_ChromeMain+0x41cfc44>
 41d4e48: f94007e0     	ldr	x0, [sp, #0x8]
 41d4e4c: cb0002e8     	sub	x8, x23, x0
 41d4e50: 9344fd08     	asr	x8, x8, #4
 41d4e54: 9b187d08     	mul	x8, x8, x24
 41d4e58: f9000be8     	str	x8, [sp, #0x10]
 41d4e5c: f9400fe8     	ldr	x8, [sp, #0x18]
 41d4e60: 8b080d08     	add	x8, x8, x8, lsl #3
 41d4e64: d37ced01     	lsl	x1, x8, #4
 41d4e68: 96f8d014     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d4e6c: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 41d4e70: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 41d4e74: a94757f6     	ldp	x22, x21, [sp, #0x70]
 41d4e78: a9465ff8     	ldp	x24, x23, [sp, #0x60]
 41d4e7c: a94567fa     	ldp	x26, x25, [sp, #0x50]
 41d4e80: a9446ffc     	ldp	x28, x27, [sp, #0x40]
 41d4e84: 910283ff     	add	sp, sp, #0xa0
 41d4e88: d65f03c0     	ret
 41d4e8c: 8b190288     	add	x8, x20, x25
 41d4e90: f85e8100     	ldur	x0, [x8, #-0x18]
 41d4e94: f85f8108     	ldur	x8, [x8, #-0x8]
 41d4e98: d37ff901     	lsl	x1, x8, #1
 41d4e9c: 96f8d007     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d4ea0: 8b190296     	add	x22, x20, x25
 41d4ea4: d10082c0     	sub	x0, x22, #0x20
 41d4ea8: d2800001     	mov	x1, #0x0                ; =0
 41d4eac: 96f94b83     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 41d4eb0: d101c2c0     	sub	x0, x22, #0x70
 41d4eb4: 96f94b71     	bl	0x27c78 <_ChromeMain+0x229dc>
 41d4eb8: 38d872c8     	ldursb	w8, [x22, #-0x79]
 41d4ebc: 36f800a8     	tbz	w8, #0x1f, 0x41d4ed0 <_ChromeMain+0x41cfc34>
 41d4ec0: f94002a0     	ldr	x0, [x21]
 41d4ec4: f85802c8     	ldur	x8, [x22, #-0x80]
 41d4ec8: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41d4ecc: 96f8cffb     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d4ed0: d1024294     	sub	x20, x20, #0x90
 41d4ed4: 91024273     	add	x19, x19, #0x90
 41d4ed8: eb13033f     	cmp	x25, x19
 41d4edc: 54fffb60     	b.eq	0x41d4e48 <_ChromeMain+0x41cfbac>
 41d4ee0: 8b190288     	add	x8, x20, x25
 41d4ee4: f1024115     	subs	x21, x8, #0x90
 41d4ee8: 54000080     	b.eq	0x41d4ef8 <_ChromeMain+0x41cfc5c>
 41d4eec: 38dff108     	ldursb	w8, [x8, #-0x1]
 41d4ef0: 36fffd88     	tbz	w8, #0x1f, 0x41d4ea0 <_ChromeMain+0x41cfc04>
 41d4ef4: 17ffffe6     	b	0x41d4e8c <_ChromeMain+0x41cfbf0>
 41d4ef8: d4200020     	brk	#0x1
 41d4efc: 910023e0     	add	x0, sp, #0x8
 41d4f00: aa1403e1     	mov	x1, x20
 41d4f04: aa1503e2     	mov	x2, x21
 41d4f08: 940001f9     	bl	0x41d56ec <_ChromeMain+0x41d0450>
 41d4f0c: d291c738     	mov	x24, #0x8e39            ; =36409
 41d4f10: f2a71c78     	movk	x24, #0x38e3, lsl #16
 41d4f14: f2dc71d8     	movk	x24, #0xe38e, lsl #32
 41d4f18: f2f1c718     	movk	x24, #0x8e38, lsl #48
 41d4f1c: 17ffffbc     	b	0x41d4e0c <_ChromeMain+0x41cfb70>
