
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 7fb4934: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 7fb4938: a9017bfd     	stp	x29, x30, [sp, #0x10]
 7fb493c: 910043fd     	add	x29, sp, #0x10
 7fb4940: aa0003f3     	mov	x19, x0
 7fb4944: 52800021     	mov	w1, #0x1                ; =1
 7fb4948: 949bdb6e     	bl	0xa6ab700 <_ChromeMain+0xa6a6464>
 7fb494c: b00336a8     	adrp	x8, 0xe689000 <dyld_stub_binder+0xe689000>
 7fb4950: 910cc108     	add	x8, x8, #0x330
 7fb4954: 91116109     	add	x9, x8, #0x458
 7fb4958: a9002408     	stp	x8, x9, [x0]
 7fb495c: 91120109     	add	x9, x8, #0x480
 7fb4960: f9000809     	str	x9, [x0, #0x10]
 7fb4964: 9112e109     	add	x9, x8, #0x4b8
 7fb4968: 9113a10a     	add	x10, x8, #0x4e8
 7fb496c: a906a809     	stp	x9, x10, [x0, #0x68]
 7fb4970: 9114e109     	add	x9, x8, #0x538
 7fb4974: f9005809     	str	x9, [x0, #0xb0]
 7fb4978: 91166109     	add	x9, x8, #0x598
 7fb497c: f9006c09     	str	x9, [x0, #0xd8]
 7fb4980: 91172109     	add	x9, x8, #0x5c8
 7fb4984: f9007c09     	str	x9, [x0, #0xf8]
 7fb4988: 9117c109     	add	x9, x8, #0x5f0
 7fb498c: f9018809     	str	x9, [x0, #0x310]
 7fb4990: 91184109     	add	x9, x8, #0x610
 7fb4994: f9018c09     	str	x9, [x0, #0x318]
 7fb4998: 9118e108     	add	x8, x8, #0x638
 7fb499c: f9019c08     	str	x8, [x0, #0x338]
 7fb49a0: 52800021     	mov	w1, #0x1                ; =1
 7fb49a4: 9710ee5d     	bl	0x43f0318 <_ChromeMain+0x43eb07c>
 7fb49a8: 52801f00     	mov	w0, #0xf8               ; =248
 7fb49ac: 96016a6f     	bl	0xf368 <_ChromeMain+0xa0cc>
 7fb49b0: aa0003f4     	mov	x20, x0
 7fb49b4: 96edc783     	bl	0x3b267c0 <_ChromeMain+0x3b21524>
 7fb49b8: aa1303e0     	mov	x0, x19
 7fb49bc: aa1403e1     	mov	x1, x20
 7fb49c0: 966f539e     	bl	0x1b89838 <_ChromeMain+0x1b8459c>
 7fb49c4: 52807300     	mov	w0, #0x398              ; =920
 7fb49c8: 9691e1db     	bl	0x242d134 <_ChromeMain+0x2427e98>
 7fb49cc: aa0003f4     	mov	x20, x0
 7fb49d0: aa1303e1     	mov	x1, x19
 7fb49d4: 97fffe5b     	bl	0x7fb4340 <_ChromeMain+0x7faf0a4>
 7fb49d8: aa1303e0     	mov	x0, x19
 7fb49dc: aa1403e1     	mov	x1, x20
 7fb49e0: 949bd79a     	bl	0xa6aa848 <_ChromeMain+0xa6a55ac>
 7fb49e4: aa1403e0     	mov	x0, x20
 7fb49e8: 97fffee9     	bl	0x7fb458c <_ChromeMain+0x7faf2f0>
 7fb49ec: aa1303e0     	mov	x0, x19
 7fb49f0: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 7fb49f4: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 7fb49f8: d65f03c0     	ret
