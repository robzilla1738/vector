
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  87b6c8:      	ldrb	w8, [x0, #0x228]
  87b6cc:      	tbnz	w8, #0x0, 0x87b6f0 <_ChromeMain+0x876454>
  87b6d0:      	ldrb	w8, [x0, #0x1d0]
  87b6d4:      	tbnz	w8, #0x0, 0x87b6f8 <_ChromeMain+0x87645c>
  87b6d8:      	ldr	x8, [x0, #0x1d8]
  87b6dc:      	cbnz	x8, 0x87b6f8 <_ChromeMain+0x87645c>
  87b6e0:      	ldr	x8, [x0, #0x178]
  87b6e4:      	cbz	x8, 0x87b6f0 <_ChromeMain+0x876454>
  87b6e8:      	ldapurb	w8, [x8, #0x4]
  87b6ec:      	cbz	w8, 0x87b700 <_ChromeMain+0x876464>
  87b6f0:      	mov	w0, #0x0                ; =0
  87b6f4:      	ret
  87b6f8:      	mov	w0, #0x1                ; =1
  87b6fc:      	ret
  87b700:      	ldr	x8, [x0, #0x180]
  87b704:      	cbz	x8, 0x87b6f0 <_ChromeMain+0x876454>
  87b708:      	ldr	x8, [x0, #0x178]
  87b70c:      	cbz	x8, 0x87b728 <_ChromeMain+0x87648c>
  87b710:      	ldapurb	w8, [x8, #0x4]
  87b714:      	cbnz	w8, 0x87b728 <_ChromeMain+0x87648c>
  87b718:      	ldr	x0, [x0, #0x180]
  87b71c:      	ldrb	w8, [x0, #0x228]
  87b720:      	cbnz	w8, 0x87b6f0 <_ChromeMain+0x876454>
  87b724:      	b	0x87b6d0 <_ChromeMain+0x876434>
  87b728:      	mov	x0, #0x0                ; =0
  87b72c:      	b	0x87b71c <_ChromeMain+0x876480>
