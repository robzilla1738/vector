
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  5038c0:      	stp	x20, x19, [sp, #-0x20]!
  5038c4:      	stp	x29, x30, [sp, #0x10]
  5038c8:      	add	x29, sp, #0x10
  5038cc:      	mov	x19, x0
  5038d0:      	bl	0x527818 <_ChromeMain+0x52257c>
  5038d4:      	ldr	w8, [x0, #0x8]
  5038d8:      	cmp	w8, #0x2
  5038dc:      	b.eq	0x5038f0 <_ChromeMain+0x4fe654>
  5038e0:      	cmp	w8, #0x1
  5038e4:      	b.eq	0x5038f8 <_ChromeMain+0x4fe65c>
  5038e8:      	mov	w8, #0x0                ; =0
  5038ec:      	b	0x5038fc <_ChromeMain+0x4fe660>
  5038f0:      	mov	w8, #0x1                ; =1
  5038f4:      	b	0x5038fc <_ChromeMain+0x4fe660>
  5038f8:      	ldrb	w8, [x0, #0xc]
  5038fc:      	cmp	w19, #0x49
  503900:      	b.hi	0x503b8c <_ChromeMain+0x4fe8f0>
  503904:      	mov	w0, #0x18               ; =24
  503908:      	mov	w9, w19
  50390c:      	adrp	x10, 0xced8000 <dyld_stub_binder+0xced8000>
  503910:      	add	x10, x10, #0x1c8
  503914:      	adr	x11, 0x503914 <_ChromeMain+0x4fe678>
  503918:      	ldrsw	x12, [x10, x9, lsl #2]
  50391c:      	add	x11, x11, x12
  503920:      	br	x11
  503924:      	mov	w0, #0x8                ; =8
  503928:      	b	0x503994 <_ChromeMain+0x4fe6f8>
  50392c:      	mov	w0, #0xc                ; =12
  503930:      	b	0x503994 <_ChromeMain+0x4fe6f8>
  503934:      	mov	w0, #0x9                ; =9
  503938:      	b	0x503994 <_ChromeMain+0x4fe6f8>
  50393c:      	mov	w0, #0x20               ; =32
  503940:      	b	0x503994 <_ChromeMain+0x4fe6f8>
  503944:      	mov	w0, #0x1                ; =1
  503948:      	b	0x503994 <_ChromeMain+0x4fe6f8>
  50394c:      	mov	w0, #0x28               ; =40
  503950:      	b	0x503994 <_ChromeMain+0x4fe6f8>
  503954:      	mov	w0, #0x14               ; =20
  503958:      	b	0x503994 <_ChromeMain+0x4fe6f8>
  50395c:      	bl	0x527818 <_ChromeMain+0x52257c>
  503960:      	ldr	w8, [x0, #0x8]
  503964:      	cmp	w8, #0x2
  503968:      	b.eq	0x503954 <_ChromeMain+0x4fe6b8>
  50396c:      	cmp	w8, #0x1
  503970:      	b.eq	0x503b64 <_ChromeMain+0x4fe8c8>
  503974:      	mov	w0, #0x10               ; =16
  503978:      	b	0x503994 <_ChromeMain+0x4fe6f8>
  50397c:      	mov	w0, #0x1c               ; =28
  503980:      	b	0x503994 <_ChromeMain+0x4fe6f8>
  503984:      	tst	w8, #0x1
  503988:      	mov	w8, #0x8                ; =8
  50398c:      	mov	w9, #0x3                ; =3
  503990:      	csel	w0, w9, w8, ne
  503994:      	ldp	x29, x30, [sp, #0x10]
  503998:      	ldp	x20, x19, [sp], #0x20
  50399c:      	ret
  5039a0:      	mov	w0, #0x6                ; =6
  5039a4:      	b	0x503994 <_ChromeMain+0x4fe6f8>
  5039a8:      	mov	w0, #0x3                ; =3
  5039ac:      	b	0x503994 <_ChromeMain+0x4fe6f8>
  5039b0:      	mov	w0, #0x1e               ; =30
  5039b4:      	b	0x503994 <_ChromeMain+0x4fe6f8>
  5039b8:      	mov	w0, #0x12               ; =18
  5039bc:      	b	0x503994 <_ChromeMain+0x4fe6f8>
  5039c0:      	mov	w0, #0xa                ; =10
  5039c4:      	b	0x503994 <_ChromeMain+0x4fe6f8>
  5039c8:      	tst	w8, #0x1
  5039cc:      	mov	w8, #0x14               ; =20
  5039d0:      	mov	w9, #0x18               ; =24
  5039d4:      	b	0x503990 <_ChromeMain+0x4fe6f4>
  5039d8:      	mov	w0, #0x0                ; =0
  5039dc:      	b	0x503994 <_ChromeMain+0x4fe6f8>
  5039e0:      	bl	0x527818 <_ChromeMain+0x52257c>
  5039e4:      	ldr	w8, [x0, #0x8]
  5039e8:      	cmp	w8, #0x2
  5039ec:      	b.eq	0x5039d8 <_ChromeMain+0x4fe73c>
  5039f0:      	cmp	w8, #0x1
  5039f4:      	b.eq	0x503b74 <_ChromeMain+0x4fe8d8>
  5039f8:      	mov	w0, #0x4                ; =4
  5039fc:      	b	0x503994 <_ChromeMain+0x4fe6f8>
  503a00:      	adrp	x0, 0xebc0000 <dyld_stub_binder+0xebc0000>
  503a04:      	add	x0, x0, #0x130
  503a08:      	bl	0x119280 <_ChromeMain+0x113fe4>
  503a0c:      	tbnz	w0, #0x0, 0x5039f8 <_ChromeMain+0x4fe75c>
