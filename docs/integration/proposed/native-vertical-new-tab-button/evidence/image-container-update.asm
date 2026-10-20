
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  87b52c: d10183ff     	sub	sp, sp, #0x60
  87b530: a9044ff4     	stp	x20, x19, [sp, #0x40]
  87b534: a9057bfd     	stp	x29, x30, [sp, #0x50]
  87b538: 910143fd     	add	x29, sp, #0x50
  87b53c: f9400813     	ldr	x19, [x0, #0x10]
  87b540: b4000493     	cbz	x19, 0x87b5d0 <_ChromeMain+0x876334>
  87b544: aa0103f4     	mov	x20, x1
  87b548: aa0103e0     	mov	x0, x1
  87b54c: 94000036     	bl	0x87b624 <_ChromeMain+0x876388>
  87b550: aa0003e1     	mov	x1, x0
  87b554: f9400288     	ldr	x8, [x20]
  87b558: f9422909     	ldr	x9, [x8, #0x450]
  87b55c: 910003e8     	mov	x8, sp
  87b560: aa1403e0     	mov	x0, x20
  87b564: d63f0120     	blr	x9
  87b568: d10083a0     	sub	x0, x29, #0x20
  87b56c: 910003e1     	mov	x1, sp
  87b570: 9400d416     	bl	0x8b05c8 <_ChromeMain+0x8ab32c>
  87b574: f85e03b4     	ldur	x20, [x29, #-0x20]
  87b578: f90007f4     	str	x20, [sp, #0x8]
  87b57c: b4000374     	cbz	x20, 0x87b5e8 <_ChromeMain+0x87634c>
  87b580: b9400288     	ldr	w8, [x20]
  87b584: 31000509     	adds	w9, w8, #0x1
  87b588: b9000289     	str	w9, [x20]
  87b58c: 54000462     	b.hs	0x87b618 <_ChromeMain+0x87637c>
  87b590: 52800029     	mov	w9, #0x1                ; =1
  87b594: 3900a3e9     	strb	w9, [sp, #0x28]
  87b598: b9000288     	str	w8, [x20]
  87b59c: 340002c8     	cbz	w8, 0x87b5f4 <_ChromeMain+0x876358>
  87b5a0: 910023e1     	add	x1, sp, #0x8
  87b5a4: aa1303e0     	mov	x0, x19
  87b5a8: 97f496be     	bl	0x5a10a0 <_ChromeMain+0x59be04>
  87b5ac: 910023e0     	add	x0, sp, #0x8
  87b5b0: 97ff2ca4     	bl	0x846840 <_ChromeMain+0x8415a4>
  87b5b4: f94003e0     	ldr	x0, [sp]
  87b5b8: b40000c0     	cbz	x0, 0x87b5d0 <_ChromeMain+0x876334>
  87b5bc: 91002008     	add	x8, x0, #0x8
  87b5c0: 12800009     	mov	w9, #-0x1               ; =-1
  87b5c4: b8e90108     	ldaddal	w9, w8, [x8]
  87b5c8: 7100051f     	cmp	w8, #0x1
  87b5cc: 540000a0     	b.eq	0x87b5e0 <_ChromeMain+0x876344>
  87b5d0: a9457bfd     	ldp	x29, x30, [sp, #0x50]
  87b5d4: a9444ff4     	ldp	x20, x19, [sp, #0x40]
  87b5d8: 910183ff     	add	sp, sp, #0x60
  87b5dc: d65f03c0     	ret
  87b5e0: 9456585a     	bl	0x1e11748 <_ChromeMain+0x1e0c4ac>
  87b5e4: 17fffffb     	b	0x87b5d0 <_ChromeMain+0x876334>
  87b5e8: 52800028     	mov	w8, #0x1                ; =1
  87b5ec: 3900a3e8     	strb	w8, [sp, #0x28]
  87b5f0: 17ffffec     	b	0x87b5a0 <_ChromeMain+0x876304>
  87b5f4: 91002288     	add	x8, x20, #0x8
  87b5f8: f9400a81     	ldr	x1, [x20, #0x10]
  87b5fc: f81e83a8     	stur	x8, [x29, #-0x18]
  87b600: d10063a0     	sub	x0, x29, #0x18
  87b604: 97df5dc7     	bl	0x52d20 <_ChromeMain+0x4da84>
  87b608: aa1403e0     	mov	x0, x20
  87b60c: 52800401     	mov	w1, #0x20               ; =32
  87b610: 97de362a     	bl	0x8eb8 <_ChromeMain+0x3c1c>
  87b614: 17ffffe3     	b	0x87b5a0 <_ChromeMain+0x876304>
  87b618: d4200000     	brk	#0
  87b61c: d4400000     	hlt	#0
  87b620: d4200020     	brk	#0x1
  87b624: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
  87b628: a9017bfd     	stp	x29, x30, [sp, #0x10]
  87b62c: 910043fd     	add	x29, sp, #0x10
  87b630: aa0003f3     	mov	x19, x0
  87b634: f9400008     	ldr	x8, [x0]
  87b638: f9403108     	ldr	x8, [x8, #0x60]
  87b63c: d63f0100     	blr	x8
  87b640: b4000260     	cbz	x0, 0x87b68c <_ChromeMain+0x8763f0>
