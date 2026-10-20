
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 16a186c:      	sub	sp, sp, #0x40
 16a1870:      	stp	x22, x21, [sp, #0x10]
 16a1874:      	stp	x20, x19, [sp, #0x20]
 16a1878:      	stp	x29, x30, [sp, #0x30]
 16a187c:      	add	x29, sp, #0x30
 16a1880:      	mov	x19, x0
 16a1884:      	adrp	x8, 0xeefc000 <dyld_stub_binder+0xeefc000>
 16a1888:      	add	x8, x8, #0xd0
 16a188c:      	ldaprb	w8, [x8]
 16a1890:      	tbz	w8, #0x0, 0x16a18b8 <_ChromeMain+0x169c61c>
 16a1894:      	adrp	x0, 0xeefc000 <dyld_stub_binder+0xeefc000>
 16a1898:      	add	x0, x0, #0x98
 16a189c:      	mov	x1, x19
 16a18a0:      	mov	w2, #0x1                ; =1
 16a18a4:      	ldp	x29, x30, [sp, #0x30]
 16a18a8:      	ldp	x20, x19, [sp, #0x20]
 16a18ac:      	ldp	x22, x21, [sp, #0x10]
 16a18b0:      	add	sp, sp, #0x40
 16a18b4:      	b	0x52d94 <_ChromeMain+0x4daf8>
 16a18b8:      	adrp	x20, 0xeefc000 <dyld_stub_binder+0xeefc000>
 16a18bc:      	add	x20, x20, #0xd0
 16a18c0:      	mov	x0, x20
 16a18c4:      	bl	0x80048c0 <_ChromeMain+0x7fff624>
 16a18c8:      	cbz	w0, 0x16a1894 <_ChromeMain+0x169c5f8>
 16a18cc:      	adrp	x21, 0xeefc000 <dyld_stub_binder+0xeefc000>
 16a18d0:      	add	x21, x21, #0x98
 16a18d4:      	bl	0x53f1c <_ChromeMain+0x4ec80>
 16a18d8:      	adrp	x8, 0xe2fa000 <dyld_stub_binder+0xe2fa000>
 16a18dc:      	add	x8, x8, #0x248
 16a18e0:      	adrp	x9, 0xeefc000 <dyld_stub_binder+0xeefc000>
 16a18e4:      	str	x8, [x9, #0x98]
 16a18e8:      	and	x8, x0, #0xfffffffc00000000
 16a18ec:      	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 16a18f0:      	ldr	x9, [x9, #0x88]
 16a18f4:      	cmp	x8, x9
 16a18f8:      	b.eq	0x16a19a8 <_ChromeMain+0x169c70c>
 16a18fc:      	adrp	x8, 0xd9ea000 <dyld_stub_binder+0xd9ea000>
 16a1900:      	add	x8, x8, #0xb97
 16a1904:      	stp	x0, x8, [x21, #0x8]
 16a1908:      	str	wzr, [x21, #0x18]
 16a190c:      	mov	x1, x21
 16a1910:      	bl	0x53e28 <_ChromeMain+0x4eb8c>
 16a1914:      	stp	xzr, xzr, [x21, #0x20]
 16a1918:      	str	xzr, [x21, #0x30]
 16a191c:      	adrp	x8, 0xe109000 <dyld_stub_binder+0xe109000>
 16a1920:      	add	x8, x8, #0x478
 16a1924:      	str	x8, [x21]
 16a1928:      	mov	w21, #0x1               ; =1
 16a192c:      	stlrb	w21, [x20]
 16a1930:      	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 16a1934:      	add	x0, x0, #0x9f0
 16a1938:      	bl	0x80048cc <_ChromeMain+0x7fff630>
 16a193c:      	cbnz	w0, 0x16a19b8 <_ChromeMain+0x169c71c>
 16a1940:      	adrp	x8, 0xeefc000 <dyld_stub_binder+0xeefc000>
 16a1944:      	ldrb	w20, [x8, #0xd1]
 16a1948:      	strb	w21, [x8, #0xd1]
 16a194c:      	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 16a1950:      	add	x0, x0, #0x9f0
 16a1954:      	bl	0x8004904 <_ChromeMain+0x7fff668>
 16a1958:      	cbnz	w0, 0x16a1988 <_ChromeMain+0x169c6ec>
 16a195c:      	tbz	w20, #0x2, 0x16a1894 <_ChromeMain+0x169c5f8>
 16a1960:      	adrp	x0, 0xeceb000 <dyld_stub_binder+0xeceb000>
 16a1964:      	add	x0, x0, #0xa30
 16a1968:      	bl	0x8004910 <_ChromeMain+0x7fff674>
 16a196c:      	cbz	w0, 0x16a1894 <_ChromeMain+0x169c5f8>
 16a1970:      	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 16a1974:      	add	x8, x8, #0x713
 16a1978:      	str	x8, [sp]
 16a197c:      	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
 16a1980:      	add	x0, x0, #0x727
 16a1984:      	bl	0x800491c <_ChromeMain+0x7fff680>
 16a1988:      	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 16a198c:      	add	x8, x8, #0x713
 16a1990:      	str	x8, [sp]
 16a1994:      	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
 16a1998:      	add	x0, x0, #0x6f8
 16a199c:      	bl	0x800491c <_ChromeMain+0x7fff680>
 16a19a0:      	b	0x16a19d0 <_ChromeMain+0x169c734>
 16a19a4:      	bl	0x8004ac4 <_ChromeMain+0x7fff828>
 16a19a8:      	str	x0, [sp, #0x8]
 16a19ac:      	bl	0x142fc <_ChromeMain+0xf060>
 16a19b0:      	ldr	x0, [sp, #0x8]
 16a19b4:      	b	0x16a18fc <_ChromeMain+0x169c660>
 16a19b8:      	adrp	x8, 0xdef4000 <dyld_stub_binder+0xdef4000>
 16a19bc:      	add	x8, x8, #0x713
 16a19c0:      	str	x8, [sp]
 16a19c4:      	adrp	x0, 0xdef4000 <dyld_stub_binder+0xdef4000>
 16a19c8:      	add	x0, x0, #0x6dd
 16a19cc:      	bl	0x800491c <_ChromeMain+0x7fff680>
 16a19d0:      	brk	#0x1
