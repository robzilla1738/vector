
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
  66ca88: 39406008     	ldrb	w8, [x0, #0x18]
  66ca8c: 36000048     	tbz	w8, #0x0, 0x66ca94 <_ChromeMain+0x6677f8>
  66ca90: d65f03c0     	ret
  66ca94: 39805c08     	ldrsb	x8, [x0, #0x17]
  66ca98: b7f80328     	tbnz	x8, #0x3f, 0x66cafc <_ChromeMain+0x667860>
  66ca9c: b4ffffa8     	cbz	x8, 0x66ca90 <_ChromeMain+0x6677f4>
  66caa0: d10103ff     	sub	sp, sp, #0x40
  66caa4: a9037bfd     	stp	x29, x30, [sp, #0x30]
  66caa8: 9100c3fd     	add	x29, sp, #0x30
  66caac: b006a8c0     	adrp	x0, 0xdb85000 <dyld_stub_binder+0xdb85000>
  66cab0: 910b7c00     	add	x0, x0, #0x2df
  66cab4: 910023e8     	add	x8, sp, #0x8
  66cab8: 52801601     	mov	w1, #0xb0               ; =176
  66cabc: 95e9b241     	bl	0x80d93c0 <_ChromeMain+0x80d4124>
  66cac0: d10023a8     	sub	x8, x29, #0x8
  66cac4: 910023e0     	add	x0, sp, #0x8
  66cac8: 95ee780b     	bl	0x820aaf4 <_ChromeMain+0x8205858>
  66cacc: d10023a0     	sub	x0, x29, #0x8
  66cad0: 95f7c7d9     	bl	0x845ea34 <_ChromeMain+0x8459798>
  66cad4: b006a8c1     	adrp	x1, 0xdb85000 <dyld_stub_binder+0xdb85000>
  66cad8: 910bc421     	add	x1, x1, #0x2f1
  66cadc: 52800522     	mov	w2, #0x29               ; =41
  66cae0: 97e6e277     	bl	0x254bc <_ChromeMain+0x20220>
  66cae4: d10023a0     	sub	x0, x29, #0x8
  66cae8: 95ee7806     	bl	0x820ab00 <_ChromeMain+0x8205864>
  66caec: 9404403b     	bl	0x77cbd8 <_ChromeMain+0x77793c>
  66caf0: a9437bfd     	ldp	x29, x30, [sp, #0x30]
  66caf4: 910103ff     	add	sp, sp, #0x40
  66caf8: 17ffffe6     	b	0x66ca90 <_ChromeMain+0x6677f4>
  66cafc: f9400408     	ldr	x8, [x0, #0x8]
  66cb00: 17ffffe7     	b	0x66ca9c <_ChromeMain+0x667800>
