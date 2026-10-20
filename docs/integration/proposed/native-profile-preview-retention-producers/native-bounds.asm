
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 43f1040: 39491408     	ldrb	w8, [x0, #0x245]
 43f1044: 36000048     	tbz	w8, #0x0, 0x43f104c <_ChromeMain+0x43ebdb0>
 43f1048: d65f03c0     	ret
 43f104c: f9407008     	ldr	x8, [x0, #0xe0]
 43f1050: b4000168     	cbz	x8, 0x43f107c <_ChromeMain+0x43ebde0>
 43f1054: 19404108     	ldapurb	w8, [x8, #0x4]
 43f1058: 35000128     	cbnz	w8, 0x43f107c <_ChromeMain+0x43ebde0>
 43f105c: f9407408     	ldr	x8, [x0, #0xe8]
 43f1060: b40000e8     	cbz	x8, 0x43f107c <_ChromeMain+0x43ebde0>
 43f1064: f9407008     	ldr	x8, [x0, #0xe0]
 43f1068: b40000e8     	cbz	x8, 0x43f1084 <_ChromeMain+0x43ebde8>
 43f106c: 19404108     	ldapurb	w8, [x8, #0x4]
 43f1070: 350000a8     	cbnz	w8, 0x43f1084 <_ChromeMain+0x43ebde8>
 43f1074: f9407400     	ldr	x0, [x0, #0xe8]
 43f1078: 175846fd     	b	0x1a02c6c <_ChromeMain+0x19fd9d0>
 43f107c: d2800000     	mov	x0, #0x0                ; =0
 43f1080: 17fffff2     	b	0x43f1048 <_ChromeMain+0x43ebdac>
 43f1084: d4200000     	brk	#0
 43f1088: d4400000     	hlt	#0
 43f108c: d4200020     	brk	#0x1
		...
 43f10a0: f9407008     	ldr	x8, [x0, #0xe0]
 43f10a4: b40001e8     	cbz	x8, 0x43f10e0 <_ChromeMain+0x43ebe44>
 43f10a8: 19404108     	ldapurb	w8, [x8, #0x4]
 43f10ac: 350001a8     	cbnz	w8, 0x43f10e0 <_ChromeMain+0x43ebe44>
 43f10b0: f9407408     	ldr	x8, [x0, #0xe8]
 43f10b4: b4000168     	cbz	x8, 0x43f10e0 <_ChromeMain+0x43ebe44>
 43f10b8: f9407008     	ldr	x8, [x0, #0xe0]
 43f10bc: b4000188     	cbz	x8, 0x43f10ec <_ChromeMain+0x43ebe50>
 43f10c0: 19404108     	ldapurb	w8, [x8, #0x4]
 43f10c4: 35000148     	cbnz	w8, 0x43f10ec <_ChromeMain+0x43ebe50>
 43f10c8: f9407408     	ldr	x8, [x0, #0xe8]
 43f10cc: f9402508     	ldr	x8, [x8, #0x48]
 43f10d0: b4000088     	cbz	x8, 0x43f10e0 <_ChromeMain+0x43ebe44>
 43f10d4: f9411900     	ldr	x0, [x8, #0x230]
 43f10d8: f9411d01     	ldr	x1, [x8, #0x238]
 43f10dc: d65f03c0     	ret
 43f10e0: d2800000     	mov	x0, #0x0                ; =0
 43f10e4: d2800001     	mov	x1, #0x0                ; =0
 43f10e8: d65f03c0     	ret
 43f10ec: d4200000     	brk	#0
 43f10f0: d4400000     	hlt	#0
 43f10f4: d4200020     	brk	#0x1
