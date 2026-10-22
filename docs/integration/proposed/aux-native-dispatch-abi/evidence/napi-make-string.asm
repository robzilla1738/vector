out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
__ZN12_GLOBAL__N_110MakeStringEP10napi_env__PKc:
    1b8c:	ff 03 01 d1	sub	sp, sp, #0x40
    1b90:	fd 7b 03 a9	stp	x29, x30, [sp, #0x30]
    1b94:	fd c3 00 91	add	x29, sp, #0x30
    1b98:	a0 83 1f f8	stur	x0, [x29, #-0x8]
    1b9c:	a1 03 1f f8	stur	x1, [x29, #-0x10]
    1ba0:	a8 83 5f f8	ldur	x8, [x29, #-0x8]
    1ba4:	e8 0b 00 f9	str	x8, [sp, #0x10]
    1ba8:	a8 03 5f f8	ldur	x8, [x29, #-0x10]
    1bac:	a8 00 00 b4	cbz	x8, 0x1bc0
    1bb0:	01 00 00 14	b	0x1bb4
    1bb4:	a8 03 5f f8	ldur	x8, [x29, #-0x10]
    1bb8:	e8 07 00 f9	str	x8, [sp, #0x8]
    1bbc:	05 00 00 14	b	0x1bd0
    1bc0:	c8 28 00 90	adrp	x8, 1304 ; 0x519000
    1bc4:	08 21 1a 91	add	x8, x8, #0x688 ; literal pool for: ""
    1bc8:	e8 07 00 f9	str	x8, [sp, #0x8]
    1bcc:	01 00 00 14	b	0x1bd0
    1bd0:	e0 0b 40 f9	ldr	x0, [sp, #0x10]
    1bd4:	e1 07 40 f9	ldr	x1, [sp, #0x8]
    1bd8:	02 00 80 92	mov	x2, #-0x1
    1bdc:	e3 63 00 91	add	x3, sp, #0x18
    1be0:	aa 4e 14 94	bl	0x515688 ; symbol stub for: _napi_create_string_utf8
    1be4:	e0 0f 40 f9	ldr	x0, [sp, #0x18]
    1be8:	fd 7b 43 a9	ldp	x29, x30, [sp, #0x30]
    1bec:	ff 03 01 91	add	sp, sp, #0x40
    1bf0:	c0 03 5f d6	ret
