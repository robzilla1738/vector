
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 461a078:      	ldr	x8, [x19, #0x6d0]
 461a07c:      	cbz	x8, 0x4619f3c <_ChromeMain+0x4614ca0>
 461a080:      	ldr	x8, [x22, #0x420]
 461a084:      	cbz	x8, 0x461a1dc <_ChromeMain+0x4614f40>
 461a088:      	add	x0, sp, #0x20
 461a08c:      	add	x1, x8, #0x348
 461a090:      	bl	0x6bed5c <_ChromeMain+0x6b9ac0>
 461a094:      	mov	x0, x22
 461a098:      	bl	0x1427574 <_ChromeMain+0x14222d8>
 461a09c:      	stp	x0, x1, [sp, #0x10]
 461a0a0:      	ldr	x22, [x19, #0x6d0]
 461a0a4:      	cbz	x22, 0x461a2a4 <_ChromeMain+0x4615008>
 461a0a8:      	mov	w8, #0x1                ; =1
 461a0ac:      	ldadd	w8, w8, [x22]
 461a0b0:      	cmp	w8, #0x0
 461a0b4:      	b.le	0x461a2b0 <_ChromeMain+0x4615014>
 461a0b8:      	mov	w9, #0x7fffffff         ; =2147483647
 461a0bc:      	cmp	w8, w9
 461a0c0:      	b.eq	0x461a2bc <_ChromeMain+0x4615020>
 461a0c4:      	ldr	x8, [x19, #0x6d0]
 461a0c8:      	ldr	x8, [x8, #0x8]
 461a0cc:      	add	x2, sp, #0x20
 461a0d0:      	add	x3, sp, #0x10
 461a0d4:      	add	x4, sp, #0x48
 461a0d8:      	mov	x0, x22
 461a0dc:      	mov	x1, x20
 461a0e0:      	blr	x8
 461a0e4:      	mov	x23, x0
 461a0e8:      	mov	w8, #-0x1               ; =-1
 461a0ec:      	ldaddal	w8, w8, [x22]
 461a0f0:      	cmp	w8, #0x1
 461a0f4:      	b.ne	0x461a104 <_ChromeMain+0x4614e68>
 461a0f8:      	ldr	x8, [x22, #0x10]
 461a0fc:      	mov	x0, x22
 461a100:      	blr	x8
 461a104:      	add	x0, sp, #0x20
 461a108:      	bl	0x846840 <_ChromeMain+0x8415a4>
 461a10c:      	b	0x4619f40 <_ChromeMain+0x4614ca4>
