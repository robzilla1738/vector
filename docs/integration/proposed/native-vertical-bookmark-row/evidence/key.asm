
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4620eb4:      	stp	x20, x19, [sp, #-0x20]!
 4620eb8:      	stp	x29, x30, [sp, #0x10]
 4620ebc:      	add	x29, sp, #0x10
 4620ec0:      	ldrh	w8, [x1, #0x88]
 4620ec4:      	cmp	w8, #0x20
 4620ec8:      	ccmp	w8, #0xd, #0x4, ne
 4620ecc:      	b.ne	0x4620f38 <_ChromeMain+0x461bc9c>
 4620ed0:      	ldr	x19, [x0, #0x410]
 4620ed4:      	cbz	x19, 0x4620f40 <_ChromeMain+0x461bca4>
 4620ed8:      	mov	x2, x1
 4620edc:      	ldr	x1, [x0, #0x3e0]
 4620ee0:      	mov	w8, #0x1                ; =1
 4620ee4:      	ldadd	w8, w8, [x19]
 4620ee8:      	cmp	w8, #0x0
 4620eec:      	b.le	0x4620f4c <_ChromeMain+0x461bcb0>
 4620ef0:      	mov	w9, #0x7fffffff         ; =2147483647
 4620ef4:      	cmp	w8, w9
 4620ef8:      	b.eq	0x4620f58 <_ChromeMain+0x461bcbc>
 4620efc:      	ldr	x8, [x0, #0x410]
 4620f00:      	ldr	x8, [x8, #0x8]
 4620f04:      	mov	x0, x19
 4620f08:      	blr	x8
 4620f0c:      	mov	w8, #-0x1               ; =-1
 4620f10:      	ldaddal	w8, w8, [x19]
 4620f14:      	cmp	w8, #0x1
 4620f18:      	b.ne	0x4620f28 <_ChromeMain+0x461bc8c>
 4620f1c:      	ldr	x8, [x19, #0x10]
 4620f20:      	mov	x0, x19
 4620f24:      	blr	x8
 4620f28:      	mov	w0, #0x1                ; =1
 4620f2c:      	ldp	x29, x30, [sp, #0x10]
 4620f30:      	ldp	x20, x19, [sp], #0x20
 4620f34:      	ret
 4620f38:      	mov	w0, #0x0                ; =0
 4620f3c:      	b	0x4620f2c <_ChromeMain+0x461bc90>
 4620f40:      	brk	#0
 4620f44:      	hlt	#0
 4620f48:      	brk	#0x1
 4620f4c:      	brk	#0
 4620f50:      	hlt	#0
 4620f54:      	brk	#0x1
 4620f58:      	brk	#0
 4620f5c:      	hlt	#0
 4620f60:      	brk	#0x1
