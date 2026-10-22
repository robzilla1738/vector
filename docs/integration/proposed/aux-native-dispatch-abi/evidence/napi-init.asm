out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
__ZN12_GLOBAL__N_14InitEP10napi_env__P12napi_value__:
    17f4:	ff c3 00 d1	sub	sp, sp, #0x30
    17f8:	fd 7b 02 a9	stp	x29, x30, [sp, #0x20]
    17fc:	fd 83 00 91	add	x29, sp, #0x20
    1800:	a0 83 1f f8	stur	x0, [x29, #-0x8]
    1804:	e1 0b 00 f9	str	x1, [sp, #0x10]
    1808:	a0 83 5f f8	ldur	x0, [x29, #-0x8]
    180c:	a1 28 00 f0	adrp	x1, 1303 ; 0x518000
    1810:	21 00 3a 91	add	x1, x1, #0xe80 ; literal pool for: "run"
    1814:	e1 03 00 f9	str	x1, [sp]
    1818:	02 00 80 92	mov	x2, #-0x1
    181c:	03 00 00 90	adrp	x3, 0 ; 0x1000
    1820:	63 80 21 91	add	x3, x3, #0x860
    1824:	04 00 80 d2	mov	x4, #0x0
    1828:	e5 23 00 91	add	x5, sp, #0x8
    182c:	8e 4f 14 94	bl	0x515664 ; symbol stub for: _napi_create_function
    1830:	e2 03 40 f9	ldr	x2, [sp]
    1834:	a0 83 5f f8	ldur	x0, [x29, #-0x8]
    1838:	e1 0b 40 f9	ldr	x1, [sp, #0x10]
    183c:	e3 07 40 f9	ldr	x3, [sp, #0x8]
    1840:	b6 4f 14 94	bl	0x515718 ; symbol stub for: _napi_set_named_property
    1844:	a0 83 5f f8	ldur	x0, [x29, #-0x8]
    1848:	e1 0b 40 f9	ldr	x1, [sp, #0x10]
    184c:	f4 01 00 94	bl	__Z14RegisterPdfApiP10napi_env__P12napi_value__
    1850:	e0 0b 40 f9	ldr	x0, [sp, #0x10]
    1854:	fd 7b 42 a9	ldp	x29, x30, [sp, #0x20]
    1858:	ff c3 00 91	add	sp, sp, #0x30
    185c:	c0 03 5f d6	ret
