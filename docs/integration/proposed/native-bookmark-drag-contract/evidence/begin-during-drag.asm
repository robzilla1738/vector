
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4619134:      	ldr	x8, [x19, #0x6d0]
 4619138:      	cbz	x8, 0x4618ff4 <_ChromeMain+0x4613d58>
 461913c:      	mov	x0, x20
 4619140:      	mov	x1, x22
 4619144:      	bl	0x461baec <_ChromeMain+0x4616850>
 4619148:      	str	x0, [sp, #0x58]
 461914c:      	ldr	x24, [x19, #0x6f8]
 4619150:      	ldr	x8, [x20, #0x420]
 4619154:      	cbz	x8, 0x4619b24 <_ChromeMain+0x4614888>
 4619158:      	add	x0, sp, #0x30
 461915c:      	add	x1, x8, #0x348
 4619160:      	bl	0x6bed5c <_ChromeMain+0x6b9ac0>
 4619164:      	mov	x0, x20
 4619168:      	bl	0x1427574 <_ChromeMain+0x14222d8>
 461916c:      	stp	x0, x1, [sp, #0x20]
 4619170:      	ldr	x25, [x19, #0x6d0]
 4619174:      	cbz	x25, 0x4619c68 <_ChromeMain+0x46149cc>
 4619178:      	mov	w8, #0x1                ; =1
 461917c:      	ldadd	w8, w8, [x25]
 4619180:      	cmp	w8, #0x0
 4619184:      	b.le	0x4619c74 <_ChromeMain+0x46149d8>
 4619188:      	mov	w9, #0x7fffffff         ; =2147483647
 461918c:      	cmp	w8, w9
 4619190:      	b.eq	0x4619c80 <_ChromeMain+0x46149e4>
 4619194:      	ldr	x8, [x19, #0x6d0]
 4619198:      	ldr	x8, [x8, #0x8]
 461919c:      	add	x2, sp, #0x30
 46191a0:      	add	x3, sp, #0x20
 46191a4:      	add	x4, sp, #0x58
 46191a8:      	mov	x0, x25
 46191ac:      	mov	x1, x24
 46191b0:      	blr	x8
 46191b4:      	mov	x24, x0
 46191b8:      	mov	w8, #-0x1               ; =-1
 46191bc:      	ldaddal	w8, w8, [x25]
 46191c0:      	cmp	w8, #0x1
 46191c4:      	b.ne	0x46191d4 <_ChromeMain+0x4613f38>
 46191c8:      	ldr	x8, [x25, #0x10]
 46191cc:      	mov	x0, x25
 46191d0:      	blr	x8
 46191d4:      	add	x0, sp, #0x30
 46191d8:      	bl	0x846840 <_ChromeMain+0x8415a4>
 46191dc:      	cbz	w24, 0x4618ff4 <_ChromeMain+0x4613d58>
