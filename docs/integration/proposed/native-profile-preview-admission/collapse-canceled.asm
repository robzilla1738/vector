
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 464bba0: 393de27f     	strb	wzr, [x19, #0xf78]
 464bba4: f9423e60     	ldr	x0, [x19, #0x478]
 464bba8: b4000060     	cbz	x0, 0x464bbb4 <_ChromeMain+0x4646918>
 464bbac: 52800001     	mov	w1, #0x0                ; =0
 464bbb0: 94c97d92     	bl	0x78ab1f8 <_ChromeMain+0x78a5f5c>
 464bbb4: f942da68     	ldr	x8, [x19, #0x5b0]
 464bbb8: b4000068     	cbz	x8, 0x464bbc4 <_ChromeMain+0x4646928>
 464bbbc: f941a114     	ldr	x20, [x8, #0x340]
 464bbc0: b5001334     	cbnz	x20, 0x464be24 <_ChromeMain+0x4646b88>
 464bbc4: f9435660     	ldr	x0, [x19, #0x6a8]
 464bbc8: b4000060     	cbz	x0, 0x464bbd4 <_ChromeMain+0x4646938>
 464bbcc: d2800001     	mov	x1, #0x0                ; =0
 464bbd0: 97feea2c     	bl	0x4606480 <_ChromeMain+0x46011e4>
 464bbd4: f942d668     	ldr	x8, [x19, #0x5a8]
 464bbd8: b4000048     	cbz	x8, 0x464bbe0 <_ChromeMain+0x4646944>
 464bbdc: 391e927f     	strb	wzr, [x19, #0x7a4]
 464bbe0: aa1303e0     	mov	x0, x19
 464bbe4: 52800021     	mov	w1, #0x1                ; =1
 464bbe8: 97fffb36     	bl	0x464a8c0 <_ChromeMain+0x4645624>
 464bbec: aa1303e0     	mov	x0, x19
 464bbf0: 52800001     	mov	w1, #0x0                ; =0
 464bbf4: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 464bbf8: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
 464bbfc: a94a57f6     	ldp	x22, x21, [sp, #0xa0]
 464bc00: 910343ff     	add	sp, sp, #0xd0
 464bc04: 16ff921c     	b	0x630474 <_ChromeMain+0x62b1d8>
