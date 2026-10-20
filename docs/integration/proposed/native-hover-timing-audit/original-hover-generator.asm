
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7704800: f9020bff     	str	xzr, [sp, #0x410]
 7704804: 5280021b     	mov	w27, #0x10              ; =16
 7704808: b90423fb     	str	w27, [sp, #0x420]
 770480c: 52800108     	mov	w8, #0x8                ; =8
 7704810: 52800389     	mov	w9, #0x1c               ; =28
 7704814: 7100031f     	cmp	w24, #0x0
 7704818: 1a881138     	csel	w24, w9, w8, ne
 770481c: 9110a3e8     	add	x8, sp, #0x428
 7704820: 910fc3e2     	add	x2, sp, #0x3f0
 7704824: d2e7fe00     	mov	x0, #0x3ff0000000000000 ; =4607182418800017408
 7704828: d2800001     	mov	x1, #0x0                ; =0
 770482c: 940001f9     	bl	0x7705010 <_ChromeMain+0x76ffd74>
 7704830: f0038ba0     	adrp	x0, 0xe87b000 <dyld_stub_binder+0xe87b000>
 7704834: 910a6000     	add	x0, x0, #0x298
 7704838: d102e3a8     	sub	x8, x29, #0xb8
 770483c: d10383a3     	sub	x3, x29, #0xe0
 7704840: 9115a3e4     	add	x4, sp, #0x568
 7704844: 911283e5     	add	x5, sp, #0x4a0
 7704848: 9110a3e6     	add	x6, sp, #0x428
 770484c: aa1703e1     	mov	x1, x23
 7704850: aa1803e2     	mov	x2, x24
 7704854: 9400015c     	bl	0x7704dc4 <_ChromeMain+0x76ffb28>
 7704858: 7100029f     	cmp	w20, #0x0
 770485c: 528ae608     	mov	w8, #0x5730             ; =22320
 7704860: 72a000a8     	movk	w8, #0x5, lsl #16
 7704864: 529a1209     	mov	w9, #0xd090             ; =53392
 7704868: 72a00069     	movk	w9, #0x3, lsl #16
 770486c: 9a881134     	csel	x20, x9, x8, ne
 7704870: 910e43e8     	add	x8, sp, #0x390
 7704874: aa1503e0     	mov	x0, x21
 7704878: d2e7fe01     	mov	x1, #0x3ff0000000000000 ; =4607182418800017408
 770487c: d2800002     	mov	x2, #0x0                ; =0
 7704880: d2800003     	mov	x3, #0x0                ; =0
 7704884: d2800004     	mov	x4, #0x0                ; =0
 7704888: 52800005     	mov	w5, #0x0                ; =0
 770488c: 97fffcaf     	bl	0x7703b48 <_ChromeMain+0x76fe8ac>
 7704890: 910d03e0     	add	x0, sp, #0x340
 7704894: 6f00e400     	movi.2d	v0, #0000000000000000
 7704898: 97fffa73     	bl	0x7703264 <_ChromeMain+0x76fdfc8>
 770489c: 3dc00be0     	ldr	q0, [sp, #0x20]
 77048a0: 3d80d7e0     	str	q0, [sp, #0x350]
 77048a4: b90363ff     	str	wzr, [sp, #0x360]
 77048a8: 910c63e0     	add	x0, sp, #0x318
 77048ac: 1e6a1000     	fmov	d0, #0.25000000
 77048b0: 97fffa6d     	bl	0x7703264 <_ChromeMain+0x76fdfc8>
 77048b4: 3dc007e0     	ldr	q0, [sp, #0x10]
 77048b8: 3d801b20     	str	q0, [x25, #0x60]
 77048bc: b9033bff     	str	wzr, [sp, #0x338]
 77048c0: 910bc3e0     	add	x0, sp, #0x2f0
 77048c4: 1e6d1000     	fmov	d0, #0.75000000
 77048c8: 97fffa67     	bl	0x7703264 <_ChromeMain+0x76fdfc8>
 77048cc: 3dc007e0     	ldr	q0, [sp, #0x10]
 77048d0: 3d80c3e0     	str	q0, [sp, #0x300]
 77048d4: b90313ff     	str	wzr, [sp, #0x310]
 77048d8: 910b23e0     	add	x0, sp, #0x2c8
 77048dc: 1e6e1000     	fmov	d0, #1.00000000
 77048e0: 97fffa61     	bl	0x7703264 <_ChromeMain+0x76fdfc8>
 77048e4: 3dc003e0     	ldr	q0, [sp]
 77048e8: 3d800720     	str	q0, [x25, #0x10]
 77048ec: b902ebff     	str	wzr, [sp, #0x2e8]
 77048f0: 910da3e8     	add	x8, sp, #0x368
 77048f4: 910d03e0     	add	x0, sp, #0x340
 77048f8: 910c63e1     	add	x1, sp, #0x318
 77048fc: 910bc3e2     	add	x2, sp, #0x2f0
 7704900: 910b23e3     	add	x3, sp, #0x2c8
 7704904: 94000189     	bl	0x7704f28 <_ChromeMain+0x76ffc8c>
 7704908: 9109e3e0     	add	x0, sp, #0x278
 770490c: 1e6a1000     	fmov	d0, #0.25000000
 7704910: 97fffa55     	bl	0x7703264 <_ChromeMain+0x76fdfc8>
 7704914: f9014bff     	str	xzr, [sp, #0x290]
 7704918: f90147ff     	str	xzr, [sp, #0x288]
 770491c: b9029bff     	str	wzr, [sp, #0x298]
 7704920: 910943e0     	add	x0, sp, #0x250
 7704924: 1e6d1000     	fmov	d0, #0.75000000
 7704928: 97fffa4f     	bl	0x7703264 <_ChromeMain+0x76fdfc8>
 770492c: 3dc00be0     	ldr	q0, [sp, #0x20]
 7704930: 3d809be0     	str	q0, [sp, #0x260]
 7704934: b90273ff     	str	wzr, [sp, #0x270]
 7704938: 910a83e8     	add	x8, sp, #0x2a0
 770493c: 9109e3e1     	add	x1, sp, #0x278
 7704940: 910943e2     	add	x2, sp, #0x250
 7704944: aa1603e0     	mov	x0, x22
 7704948: 97fffe5e     	bl	0x77042c0 <_ChromeMain+0x76ff024>
 770494c: 910ee3e8     	add	x8, sp, #0x3b8
 7704950: 910e43e2     	add	x2, sp, #0x390
 7704954: 910da3e3     	add	x3, sp, #0x368
 7704958: 910a83e4     	add	x4, sp, #0x2a0
 770495c: aa1403e0     	mov	x0, x20
 7704960: aa1803e1     	mov	x1, x24
 7704964: 940001da     	bl	0x77050cc <_ChromeMain+0x76ffe30>
 7704968: f0038bb4     	adrp	x20, 0xe87b000 <dyld_stub_binder+0xe87b000>
 770496c: 910b0294     	add	x20, x20, #0x2c0
 7704970: 9107c3e8     	add	x8, sp, #0x1f0
 7704974: aa1403e0     	mov	x0, x20
 7704978: d2800001     	mov	x1, #0x0                ; =0
 770497c: d2800002     	mov	x2, #0x0                ; =0
 7704980: d2e7fe03     	mov	x3, #0x3ff0000000000000 ; =4607182418800017408
 7704984: d2800004     	mov	x4, #0x0                ; =0
 7704988: 52800005     	mov	w5, #0x0                ; =0
 770498c: 97fffc6f     	bl	0x7703b48 <_ChromeMain+0x76fe8ac>
 7704990: f0038bb5     	adrp	x21, 0xe87b000 <dyld_stub_binder+0xe87b000>
 7704994: 910b62b5     	add	x21, x21, #0x2d8
 7704998: 52800038     	mov	w24, #0x1               ; =1
 770499c: 910723e8     	add	x8, sp, #0x1c8
 77049a0: aa1503e0     	mov	x0, x21
 77049a4: d2800001     	mov	x1, #0x0                ; =0
 77049a8: 52800022     	mov	w2, #0x1                ; =1
 77049ac: d2f7fe03     	mov	x3, #-0x4010000000000000 ; =-4616189618054758400
 77049b0: d2800004     	mov	x4, #0x0                ; =0
 77049b4: 52800005     	mov	w5, #0x0                ; =0
 77049b8: 97fffc64     	bl	0x7703b48 <_ChromeMain+0x76fe8ac>
 77049bc: f0038bb6     	adrp	x22, 0xe87b000 <dyld_stub_binder+0xe87b000>
 77049c0: 910b82d6     	add	x22, x22, #0x2e0
 77049c4: 910683fa     	add	x26, sp, #0x1a0
 77049c8: 910683e8     	add	x8, sp, #0x1a0
 77049cc: aa1603e0     	mov	x0, x22
 77049d0: d2e7fe01     	mov	x1, #0x3ff0000000000000 ; =4607182418800017408
 77049d4: d2800002     	mov	x2, #0x0                ; =0
 77049d8: d2f7fe03     	mov	x3, #-0x4010000000000000 ; =-4616189618054758400
 77049dc: d2800004     	mov	x4, #0x0                ; =0
 77049e0: 52800005     	mov	w5, #0x0                ; =0
 77049e4: 97fffc59     	bl	0x7703b48 <_ChromeMain+0x76fe8ac>
 77049e8: 910503f9     	add	x25, sp, #0x140
 77049ec: 910503e0     	add	x0, sp, #0x140
 77049f0: d2800001     	mov	x1, #0x0                ; =0
 77049f4: 972786c3     	bl	0x40e6500 <_ChromeMain+0x40e1264>
 77049f8: 91004320     	add	x0, x25, #0x10
 77049fc: 5290d401     	mov	w1, #0x86a0             ; =34464
 7704a00: 72a00021     	movk	w1, #0x1, lsl #16
 7704a04: 972786bf     	bl	0x40e6500 <_ChromeMain+0x40e1264>
 7704a08: 3dc00be0     	ldr	q0, [sp, #0x20]
 7704a0c: 3d805be0     	str	q0, [sp, #0x160]
 7704a10: b90173f8     	str	w24, [sp, #0x170]
 7704a14: 9105e3fc     	add	x28, sp, #0x178
 7704a18: 9105e3e8     	add	x8, sp, #0x178
 7704a1c: 910503e2     	add	x2, sp, #0x140
 7704a20: d2800000     	mov	x0, #0x0                ; =0
 7704a24: d2800001     	mov	x1, #0x0                ; =0
 7704a28: 9400017a     	bl	0x7705010 <_ChromeMain+0x76ffd74>
 7704a2c: f0038ba0     	adrp	x0, 0xe87b000 <dyld_stub_binder+0xe87b000>
 7704a30: 910aa000     	add	x0, x0, #0x2a8
 7704a34: 910863f9     	add	x25, sp, #0x218
 7704a38: 910863e8     	add	x8, sp, #0x218
 7704a3c: 9107c3e3     	add	x3, sp, #0x1f0
 7704a40: 910723e4     	add	x4, sp, #0x1c8
 7704a44: 910683e5     	add	x5, sp, #0x1a0
 7704a48: 9105e3e6     	add	x6, sp, #0x178
 7704a4c: 529a1201     	mov	w1, #0xd090             ; =53392
 7704a50: 72a00061     	movk	w1, #0x3, lsl #16
 7704a54: 52800102     	mov	w2, #0x8                ; =8
 7704a58: 940000db     	bl	0x7704dc4 <_ChromeMain+0x76ffb28>
 7704a5c: 910383f8     	add	x24, sp, #0xe0
 7704a60: 910383e8     	add	x8, sp, #0xe0
 7704a64: aa1403e0     	mov	x0, x20
 7704a68: d2e7fe01     	mov	x1, #0x3ff0000000000000 ; =4607182418800017408
 7704a6c: d2800002     	mov	x2, #0x0                ; =0
 7704a70: d2800003     	mov	x3, #0x0                ; =0
 7704a74: d2800004     	mov	x4, #0x0                ; =0
 7704a78: 52800005     	mov	w5, #0x0                ; =0
 7704a7c: 97fffc33     	bl	0x7703b48 <_ChromeMain+0x76fe8ac>
 7704a80: 9102e3f4     	add	x20, sp, #0xb8
 7704a84: 9102e3e8     	add	x8, sp, #0xb8
 7704a88: aa1503e0     	mov	x0, x21
 7704a8c: d2f7fe01     	mov	x1, #-0x4010000000000000 ; =-4616189618054758400
 7704a90: d2800002     	mov	x2, #0x0                ; =0
 7704a94: d2800003     	mov	x3, #0x0                ; =0
 7704a98: 52800024     	mov	w4, #0x1                ; =1
 7704a9c: 52800005     	mov	w5, #0x0                ; =0
 7704aa0: 97fffc2a     	bl	0x7703b48 <_ChromeMain+0x76fe8ac>
 7704aa4: 910243f5     	add	x21, sp, #0x90
 7704aa8: 910243e8     	add	x8, sp, #0x90
 7704aac: aa1603e0     	mov	x0, x22
 7704ab0: d2f7fe01     	mov	x1, #-0x4010000000000000 ; =-4616189618054758400
 7704ab4: d2800002     	mov	x2, #0x0                ; =0
 7704ab8: d2e7fe03     	mov	x3, #0x3ff0000000000000 ; =4607182418800017408
 7704abc: d2800004     	mov	x4, #0x0                ; =0
 7704ac0: 52800005     	mov	w5, #0x0                ; =0
 7704ac4: 97fffc21     	bl	0x7703b48 <_ChromeMain+0x76fe8ac>
 7704ac8: 9100c3f6     	add	x22, sp, #0x30
 7704acc: 9100c3e0     	add	x0, sp, #0x30
 7704ad0: 5290d401     	mov	w1, #0x86a0             ; =34464
 7704ad4: 72a00021     	movk	w1, #0x1, lsl #16
 7704ad8: 9727868a     	bl	0x40e6500 <_ChromeMain+0x40e1264>
 7704adc: 910042c0     	add	x0, x22, #0x10
 7704ae0: 5281a801     	mov	w1, #0xd40              ; =3392
 7704ae4: 72a00061     	movk	w1, #0x3, lsl #16
 7704ae8: 97278686     	bl	0x40e6500 <_ChromeMain+0x40e1264>
 7704aec: a9057fff     	stp	xzr, xzr, [sp, #0x50]
 7704af0: b90063fb     	str	w27, [sp, #0x60]
 7704af4: 9101a3f6     	add	x22, sp, #0x68
 7704af8: 9101a3e8     	add	x8, sp, #0x68
 7704afc: 9100c3e2     	add	x2, sp, #0x30
 7704b00: d2e7fe00     	mov	x0, #0x3ff0000000000000 ; =4607182418800017408
 7704b04: d2800001     	mov	x1, #0x0                ; =0
 7704b08: 94000142     	bl	0x7705010 <_ChromeMain+0x76ffd74>
 7704b0c: f0038ba0     	adrp	x0, 0xe87b000 <dyld_stub_binder+0xe87b000>
 7704b10: 910ac000     	add	x0, x0, #0x2b0
 7704b14: 910423fb     	add	x27, sp, #0x108
 7704b18: 910423e8     	add	x8, sp, #0x108
 7704b1c: 910383e3     	add	x3, sp, #0xe0
 7704b20: 9102e3e4     	add	x4, sp, #0xb8
 7704b24: 910243e5     	add	x5, sp, #0x90
 7704b28: 9101a3e6     	add	x6, sp, #0x68
 7704b2c: 5281a801     	mov	w1, #0xd40              ; =3392
 7704b30: 72a00061     	movk	w1, #0x3, lsl #16
 7704b34: 52800102     	mov	w2, #0x8                ; =8
 7704b38: 940000a3     	bl	0x7704dc4 <_ChromeMain+0x76ffb28>
 7704b3c: d10203b7     	sub	x23, x29, #0x80
 7704b40: d10203a8     	sub	x8, x29, #0x80
 7704b44: d102e3a0     	sub	x0, x29, #0xb8
 7704b48: 910ee3e1     	add	x1, sp, #0x3b8
 7704b4c: 910863e2     	add	x2, sp, #0x218
 7704b50: 910423e3     	add	x3, sp, #0x108
 7704b54: 94000047     	bl	0x7704c70 <_ChromeMain+0x76ff9d4>
 7704b58: f9000a7f     	str	xzr, [x19, #0x10]
 7704b5c: aa1303e8     	mov	x8, x19
 7704b60: f8008d1f     	str	xzr, [x8, #0x8]!
 7704b64: f9000268     	str	x8, [x19]
 7704b68: d10203a2     	sub	x2, x29, #0x80
 7704b6c: aa1303e0     	mov	x0, x19
 7704b70: aa1303e1     	mov	x1, x19
 7704b74: 97fffe77     	bl	0x7704550 <_ChromeMain+0x76ff2b4>
 7704b78: 910022e8     	add	x8, x23, #0x8
 7704b7c: f85903a1     	ldur	x1, [x29, #-0x70]
 7704b80: f81a03a8     	stur	x8, [x29, #-0x60]
 7704b84: d10183a0     	sub	x0, x29, #0x60
 7704b88: 97fff89d     	bl	0x7702dfc <_ChromeMain+0x76fdb60>
 7704b8c: 91002360     	add	x0, x27, #0x8
 7704b90: 970b5c47     	bl	0x39dbcac <_ChromeMain+0x39d6a10>
 7704b94: 910022c0     	add	x0, x22, #0x8
 7704b98: 97fffa25     	bl	0x770342c <_ChromeMain+0x76fe190>
 7704b9c: 910022a0     	add	x0, x21, #0x8
 7704ba0: 97fffa23     	bl	0x770342c <_ChromeMain+0x76fe190>
 7704ba4: 91002280     	add	x0, x20, #0x8
 7704ba8: 97fffa21     	bl	0x770342c <_ChromeMain+0x76fe190>
 7704bac: 91002300     	add	x0, x24, #0x8
 7704bb0: 97fffa1f     	bl	0x770342c <_ChromeMain+0x76fe190>
 7704bb4: 91002320     	add	x0, x25, #0x8
 7704bb8: 970b5c3d     	bl	0x39dbcac <_ChromeMain+0x39d6a10>
 7704bbc: 91002380     	add	x0, x28, #0x8
 7704bc0: 97fffa1b     	bl	0x770342c <_ChromeMain+0x76fe190>
 7704bc4: 91002340     	add	x0, x26, #0x8
 7704bc8: 97fffa19     	bl	0x770342c <_ChromeMain+0x76fe190>
 7704bcc: 910723e8     	add	x8, sp, #0x1c8
 7704bd0: 91002100     	add	x0, x8, #0x8
 7704bd4: 97fffa16     	bl	0x770342c <_ChromeMain+0x76fe190>
 7704bd8: 9107c3e8     	add	x8, sp, #0x1f0
 7704bdc: 91002100     	add	x0, x8, #0x8
 7704be0: 97fffa13     	bl	0x770342c <_ChromeMain+0x76fe190>
 7704be4: 910ee3e8     	add	x8, sp, #0x3b8
 7704be8: 91002100     	add	x0, x8, #0x8
 7704bec: 970b5c30     	bl	0x39dbcac <_ChromeMain+0x39d6a10>
 7704bf0: 910a83e8     	add	x8, sp, #0x2a0
 7704bf4: 91002100     	add	x0, x8, #0x8
 7704bf8: 97fffa0d     	bl	0x770342c <_ChromeMain+0x76fe190>
 7704bfc: 910da3e8     	add	x8, sp, #0x368
 7704c00: 91002100     	add	x0, x8, #0x8
 7704c04: 97fffa0a     	bl	0x770342c <_ChromeMain+0x76fe190>
 7704c08: 910e43e8     	add	x8, sp, #0x390
 7704c0c: 91002100     	add	x0, x8, #0x8
 7704c10: 97fffa07     	bl	0x770342c <_ChromeMain+0x76fe190>
 7704c14: d102e3a8     	sub	x8, x29, #0xb8
 7704c18: 91002100     	add	x0, x8, #0x8
 7704c1c: 970b5c24     	bl	0x39dbcac <_ChromeMain+0x39d6a10>
 7704c20: 9110a3e8     	add	x8, sp, #0x428
 7704c24: 91002100     	add	x0, x8, #0x8
 7704c28: 97fffa01     	bl	0x770342c <_ChromeMain+0x76fe190>
 7704c2c: 911283e8     	add	x8, sp, #0x4a0
 7704c30: 91002100     	add	x0, x8, #0x8
 7704c34: 97fff9fe     	bl	0x770342c <_ChromeMain+0x76fe190>
 7704c38: 9115a3e8     	add	x8, sp, #0x568
 7704c3c: 91002100     	add	x0, x8, #0x8
 7704c40: 97fff9fb     	bl	0x770342c <_ChromeMain+0x76fe190>
 7704c44: d10383a8     	sub	x8, x29, #0xe0
 7704c48: 91002100     	add	x0, x8, #0x8
 7704c4c: 97fff9f8     	bl	0x770342c <_ChromeMain+0x76fe190>
 7704c50: 911883ff     	add	sp, sp, #0x620
 7704c54: a9457bfd     	ldp	x29, x30, [sp, #0x50]
 7704c58: a9444ff4     	ldp	x20, x19, [sp, #0x40]
 7704c5c: a94357f6     	ldp	x22, x21, [sp, #0x30]
 7704c60: a9425ff8     	ldp	x24, x23, [sp, #0x20]
 7704c64: a94167fa     	ldp	x26, x25, [sp, #0x10]
 7704c68: a8c66ffc     	ldp	x28, x27, [sp], #0x60
 7704c6c: d65f03c0     	ret
 7704c70: d10543ff     	sub	sp, sp, #0x150
 7704c74: a9106ffc     	stp	x28, x27, [sp, #0x100]
 7704c78: a9115ff8     	stp	x24, x23, [sp, #0x110]
 7704c7c: a91257f6     	stp	x22, x21, [sp, #0x120]
