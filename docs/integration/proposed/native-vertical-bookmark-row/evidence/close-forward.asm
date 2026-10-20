
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4624d6c:      	stp	x20, x19, [sp, #-0x20]!
 4624d70:      	stp	x29, x30, [sp, #0x10]
 4624d74:      	add	x29, sp, #0x10
 4624d78:      	mov	x2, x1
 4624d7c:      	ldr	x1, [x0, #0x3e0]
 4624d80:      	ldr	w8, [x1, #0xf8]
 4624d84:      	cbz	w8, 0x4624d94 <_ChromeMain+0x461faf8>
 4624d88:      	ldp	x29, x30, [sp, #0x10]
 4624d8c:      	ldp	x20, x19, [sp], #0x20
 4624d90:      	ret
 4624d94:      	ldr	x19, [x0, #0x418]
 4624d98:      	cbz	x19, 0x4624d88 <_ChromeMain+0x461faec>
 4624d9c:      	mov	w8, #0x1                ; =1
 4624da0:      	ldadd	w8, w8, [x19]
 4624da4:      	cmp	w8, #0x0
 4624da8:      	b.le	0x4624dec <_ChromeMain+0x461fb50>
 4624dac:      	mov	w9, #0x7fffffff         ; =2147483647
 4624db0:      	cmp	w8, w9
 4624db4:      	b.eq	0x4624df8 <_ChromeMain+0x461fb5c>
 4624db8:      	ldr	x8, [x0, #0x418]
 4624dbc:      	ldr	x8, [x8, #0x8]
 4624dc0:      	mov	x0, x19
 4624dc4:      	blr	x8
 4624dc8:      	mov	w8, #-0x1               ; =-1
 4624dcc:      	ldaddal	w8, w8, [x19]
 4624dd0:      	cmp	w8, #0x1
 4624dd4:      	b.ne	0x4624d88 <_ChromeMain+0x461faec>
 4624dd8:      	ldr	x1, [x19, #0x10]
 4624ddc:      	mov	x0, x19
 4624de0:      	ldp	x29, x30, [sp, #0x10]
 4624de4:      	ldp	x20, x19, [sp], #0x20
 4624de8:      	br	x1
 4624dec:      	brk	#0
 4624df0:      	hlt	#0
 4624df4:      	brk	#0x1
 4624df8:      	brk	#0
 4624dfc:      	hlt	#0
 4624e00:      	brk	#0x1
