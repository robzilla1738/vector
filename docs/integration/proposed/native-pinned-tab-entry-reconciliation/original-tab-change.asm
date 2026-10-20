
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41d78c0: d102c3ff     	sub	sp, sp, #0xb0
 41d78c4: a90857f6     	stp	x22, x21, [sp, #0x80]
 41d78c8: a9094ff4     	stp	x20, x19, [sp, #0x90]
 41d78cc: a90a7bfd     	stp	x29, x30, [sp, #0xa0]
 41d78d0: 910283fd     	add	x29, sp, #0xa0
 41d78d4: 121f7848     	and	w8, w2, #0xfffffffe
 41d78d8: 7100091f     	cmp	w8, #0x2
 41d78dc: fa401824     	ccmp	x1, #0x0, #0x4, ne
 41d78e0: 540000c0     	b.eq	0x41d78f8 <_ChromeMain+0x41d265c>
 41d78e4: aa0203f5     	mov	x21, x2
 41d78e8: aa0103f4     	mov	x20, x1
 41d78ec: aa0003f3     	mov	x19, x0
 41d78f0: 97ffff21     	bl	0x41d7574 <_ChromeMain+0x41d22d8>
 41d78f4: 340000d5     	cbz	w21, 0x41d790c <_ChromeMain+0x41d2670>
 41d78f8: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 41d78fc: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 41d7900: a94857f6     	ldp	x22, x21, [sp, #0x80]
 41d7904: 9102c3ff     	add	sp, sp, #0xb0
 41d7908: d65f03c0     	ret
 41d790c: 39418688     	ldrb	w8, [x20, #0x61]
 41d7910: 34ffff48     	cbz	w8, 0x41d78f8 <_ChromeMain+0x41d265c>
 41d7914: f9402288     	ldr	x8, [x20, #0x40]
 41d7918: b4ffff08     	cbz	x8, 0x41d78f8 <_ChromeMain+0x41d265c>
 41d791c: b00547e1     	adrp	x1, 0xead4000 <dyld_stub_binder+0xead4000>
 41d7920: 9126c021     	add	x1, x1, #0x9b0
 41d7924: 91002100     	add	x0, x8, #0x8
 41d7928: 96f9ee12     	bl	0x53170 <_ChromeMain+0x4ded4>
 41d792c: b4000080     	cbz	x0, 0x41d793c <_ChromeMain+0x41d26a0>
 41d7930: aa0003e8     	mov	x8, x0
 41d7934: 39408009     	ldrb	w9, [x0, #0x20]
 41d7938: 350002e9     	cbnz	w9, 0x41d7994 <_ChromeMain+0x41d26f8>
 41d793c: f9402260     	ldr	x0, [x19, #0x40]
 41d7940: 94e42115     	bl	0x7adfd94 <_ChromeMain+0x7adaaf8>
 41d7944: 3707fda0     	tbnz	w0, #0x0, 0x41d78f8 <_ChromeMain+0x41d265c>
 41d7948: f9402a88     	ldr	x8, [x20, #0x50]
 41d794c: b5000068     	cbnz	x8, 0x41d7958 <_ChromeMain+0x41d26bc>
 41d7950: f9402689     	ldr	x9, [x20, #0x48]
 41d7954: b4000449     	cbz	x9, 0x41d79dc <_ChromeMain+0x41d2740>
 41d7958: 52800a09     	mov	w9, #0x50               ; =80
 41d795c: 5280090a     	mov	w10, #0x48              ; =72
 41d7960: f100011f     	cmp	x8, #0x0
 41d7964: 9a890148     	csel	x8, x10, x9, eq
 41d7968: f8686a88     	ldr	x8, [x20, x8]
 41d796c: f9400908     	ldr	x8, [x8, #0x10]
 41d7970: f9400508     	ldr	x8, [x8, #0x8]
 41d7974: b4000348     	cbz	x8, 0x41d79dc <_ChromeMain+0x41d2740>
 41d7978: f9404501     	ldr	x1, [x8, #0x88]
 41d797c: aa1303e0     	mov	x0, x19
 41d7980: a94a7bfd     	ldp	x29, x30, [sp, #0xa0]
 41d7984: a9494ff4     	ldp	x20, x19, [sp, #0x90]
 41d7988: a94857f6     	ldp	x22, x21, [sp, #0x80]
 41d798c: 9102c3ff     	add	sp, sp, #0xb0
 41d7990: 17fffad0     	b	0x41d64d0 <_ChromeMain+0x41d1234>
 41d7994: 910003f3     	mov	x19, sp
 41d7998: 910003e0     	mov	x0, sp
 41d799c: 91002101     	add	x1, x8, #0x8
 41d79a0: 96fd897d     	bl	0x139f94 <_ChromeMain+0x134cf8>
 41d79a4: 52800028     	mov	w8, #0x1                ; =1
 41d79a8: 3901e3e8     	strb	w8, [sp, #0x78]
 41d79ac: 9101c260     	add	x0, x19, #0x70
 41d79b0: d2800001     	mov	x1, #0x0                ; =0
 41d79b4: 96f940c1     	bl	0x27cb8 <_ChromeMain+0x22a1c>
 41d79b8: 91008260     	add	x0, x19, #0x20
 41d79bc: 96f940af     	bl	0x27c78 <_ChromeMain+0x229dc>
 41d79c0: 39c05fe8     	ldrsb	w8, [sp, #0x17]
 41d79c4: 36fff9a8     	tbz	w8, #0x1f, 0x41d78f8 <_ChromeMain+0x41d265c>
 41d79c8: f94003e0     	ldr	x0, [sp]
 41d79cc: f9400be8     	ldr	x8, [sp, #0x10]
 41d79d0: 9240f901     	and	x1, x8, #0x7fffffffffffffff
 41d79d4: 96f8c539     	bl	0x8eb8 <_ChromeMain+0x3c1c>
 41d79d8: 17ffffc8     	b	0x41d78f8 <_ChromeMain+0x41d265c>
 41d79dc: d2800001     	mov	x1, #0x0                ; =0
 41d79e0: 17ffffe7     	b	0x41d797c <_ChromeMain+0x41d26e0>
 41d79e4: d1006000     	sub	x0, x0, #0x18
 41d79e8: 17ffffb6     	b	0x41d78c0 <_ChromeMain+0x41d2624>
