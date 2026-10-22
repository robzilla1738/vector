out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/Resources/native/aside-native.node:
(__TEXT,__text) section
__ZN12_GLOBAL__N_13RunEP10napi_env__P20napi_callback_info__:
    1860:	ff 03 03 d1	sub	sp, sp, #0xc0
    1864:	fd 7b 0b a9	stp	x29, x30, [sp, #0xb0]
    1868:	fd c3 02 91	add	x29, sp, #0xb0
    186c:	08 39 00 f0	adrp	x8, 1827 ; 0x724000
    1870:	08 fd 40 f9	ldr	x8, [x8, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
    1874:	08 01 40 f9	ldr	x8, [x8]
    1878:	a8 83 1f f8	stur	x8, [x29, #-0x8]
    187c:	a0 83 1d f8	stur	x0, [x29, #-0x28]
    1880:	a1 03 1d f8	stur	x1, [x29, #-0x30]
    1884:	a2 e3 00 d1	sub	x2, x29, #0x38
    1888:	48 00 80 d2	mov	x8, #0x2
    188c:	a8 83 1c f8	stur	x8, [x29, #-0x38]
    1890:	a0 83 5d f8	ldur	x0, [x29, #-0x28]
    1894:	a1 03 5d f8	ldur	x1, [x29, #-0x30]
    1898:	a3 63 00 d1	sub	x3, x29, #0x18
    189c:	05 00 80 d2	mov	x5, #0x0
    18a0:	e4 03 05 aa	mov	x4, x5
    18a4:	82 4f 14 94	bl	0x5156ac ; symbol stub for: _napi_get_cb_info
    18a8:	01 00 00 14	b	0x18ac
    18ac:	a8 83 5c f8	ldur	x8, [x29, #-0x38]
    18b0:	08 05 00 f1	subs	x8, x8, #0x1
    18b4:	42 01 00 54	b.hs	0x18dc
    18b8:	01 00 00 14	b	0x18bc
    18bc:	a0 83 5d f8	ldur	x0, [x29, #-0x28]
    18c0:	01 00 80 d2	mov	x1, #0x0
    18c4:	a2 28 00 f0	adrp	x2, 1303 ; 0x518000
    18c8:	42 10 3a 91	add	x2, x2, #0xe84 ; literal pool for: "run(command, input) requires a command"
    18cc:	99 4f 14 94	bl	0x515730 ; symbol stub for: _napi_throw_type_error
    18d0:	01 00 00 14	b	0x18d4
    18d4:	bf 03 1e f8	stur	xzr, [x29, #-0x20]
    18d8:	40 00 00 14	b	0x19d8
    18dc:	a0 83 5d f8	ldur	x0, [x29, #-0x28]
    18e0:	a1 83 5e f8	ldur	x1, [x29, #-0x18]
    18e4:	a8 43 01 d1	sub	x8, x29, #0x50
    18e8:	51 00 00 94	bl	__ZN12_GLOBAL__N_110ReadStringEP10napi_env__P12napi_value__
    18ec:	01 00 00 14	b	0x18f0
    18f0:	a8 83 5c f8	ldur	x8, [x29, #-0x38]
    18f4:	08 09 00 f1	subs	x8, x8, #0x2
    18f8:	03 01 00 54	b.lo	0x1918
    18fc:	01 00 00 14	b	0x1900
    1900:	a0 83 5d f8	ldur	x0, [x29, #-0x28]
    1904:	a1 03 5f f8	ldur	x1, [x29, #-0x10]
    1908:	e8 23 01 91	add	x8, sp, #0x48
    190c:	48 00 00 94	bl	__ZN12_GLOBAL__N_110ReadStringEP10napi_env__P12napi_value__
    1910:	01 00 00 14	b	0x1914
    1914:	07 00 00 14	b	0x1930
    1918:	e0 23 01 91	add	x0, sp, #0x48
    191c:	c1 28 00 90	adrp	x1, 1304 ; 0x519000
    1920:	21 20 1a 91	add	x1, x1, #0x688 ; literal pool for: ""
    1924:	84 00 00 94	bl	__ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEEC1B9nqe210106ILi0EEEPKc
    1928:	01 00 00 14	b	0x192c
    192c:	01 00 00 14	b	0x1930
    1930:	a0 43 01 d1	sub	x0, x29, #0x50
    1934:	8d 00 00 94	bl	__ZNKSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE5c_strB9nqe210106Ev
    1938:	e0 0f 00 f9	str	x0, [sp, #0x18]
    193c:	e0 23 01 91	add	x0, sp, #0x48
    1940:	8a 00 00 94	bl	__ZNKSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE5c_strB9nqe210106Ev
    1944:	e1 03 00 aa	mov	x1, x0
    1948:	e0 0f 40 f9	ldr	x0, [sp, #0x18]
    194c:	6b 20 01 94	bl	_AsideNativeRun
    1950:	e0 13 00 f9	str	x0, [sp, #0x20]
    1954:	01 00 00 14	b	0x1958
    1958:	e8 13 40 f9	ldr	x8, [sp, #0x20]
    195c:	e8 1b 00 f9	str	x8, [sp, #0x30]
    1960:	a0 83 5d f8	ldur	x0, [x29, #-0x28]
    1964:	e1 1b 40 f9	ldr	x1, [sp, #0x30]
    1968:	89 00 00 94	bl	__ZN12_GLOBAL__N_110MakeStringEP10napi_env__PKc
    196c:	e0 0b 00 f9	str	x0, [sp, #0x10]
    1970:	01 00 00 14	b	0x1974
    1974:	e8 0b 40 f9	ldr	x8, [sp, #0x10]
    1978:	e8 17 00 f9	str	x8, [sp, #0x28]
    197c:	e0 1b 40 f9	ldr	x0, [sp, #0x30]
    1980:	95 20 01 94	bl	_AsideNativeFree
    1984:	01 00 00 14	b	0x1988
    1988:	e8 17 40 f9	ldr	x8, [sp, #0x28]
    198c:	a8 03 1e f8	stur	x8, [x29, #-0x20]
    1990:	e0 23 01 91	add	x0, sp, #0x48
    1994:	af 4c 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    1998:	a0 43 01 d1	sub	x0, x29, #0x50
    199c:	ad 4c 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    19a0:	0e 00 00 14	b	0x19d8
    19a4:	e0 23 00 f9	str	x0, [sp, #0x40]
    19a8:	e8 03 01 aa	mov	x8, x1
    19ac:	e8 3f 00 b9	str	w8, [sp, #0x3c]
    19b0:	07 00 00 14	b	0x19cc
    19b4:	e0 23 00 f9	str	x0, [sp, #0x40]
    19b8:	e8 03 01 aa	mov	x8, x1
    19bc:	e8 3f 00 b9	str	w8, [sp, #0x3c]
    19c0:	e0 23 01 91	add	x0, sp, #0x48
    19c4:	a3 4c 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    19c8:	01 00 00 14	b	0x19cc
    19cc:	a0 43 01 d1	sub	x0, x29, #0x50
    19d0:	a0 4c 14 94	bl	0x514c50 ; symbol stub for: __ZNSt3__112basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEED1Ev
    19d4:	0f 00 00 14	b	0x1a10
    19d8:	a8 03 5e f8	ldur	x8, [x29, #-0x20]
    19dc:	e8 07 00 f9	str	x8, [sp, #0x8]
    19e0:	a9 83 5f f8	ldur	x9, [x29, #-0x8]
    19e4:	08 39 00 f0	adrp	x8, 1827 ; 0x724000
    19e8:	08 fd 40 f9	ldr	x8, [x8, #0x1f8] ; literal pool symbol address: ___stack_chk_guard
    19ec:	08 01 40 f9	ldr	x8, [x8]
    19f0:	08 01 09 eb	subs	x8, x8, x9
    19f4:	60 00 00 54	b.eq	0x1a00
    19f8:	01 00 00 14	b	0x19fc
    19fc:	42 4e 14 94	bl	0x515304 ; symbol stub for: ___stack_chk_fail
    1a00:	e0 07 40 f9	ldr	x0, [sp, #0x8]
    1a04:	fd 7b 4b a9	ldp	x29, x30, [sp, #0xb0]
    1a08:	ff 03 03 91	add	sp, sp, #0xc0
    1a0c:	c0 03 5f d6	ret
    1a10:	e0 23 40 f9	ldr	x0, [sp, #0x40]
    1a14:	e0 03 00 f9	str	x0, [sp]
    1a18:	03 00 00 14	b	0x1a24
    1a1c:	e0 03 00 f9	str	x0, [sp]
    1a20:	01 00 00 14	b	0x1a24
    1a24:	e0 03 40 f9	ldr	x0, [sp]
    1a28:	eb 4b 14 94	bl	0x5149d4 ; symbol stub for: __Unwind_Resume
