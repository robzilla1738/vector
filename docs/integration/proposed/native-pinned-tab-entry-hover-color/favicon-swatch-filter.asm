
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45e4ac0: b9400000     	ldr	w0, [x0]
 45e4ac4: 37f80060     	tbnz	w0, #0x1f, 0x45e4ad0 <_ChromeMain+0x45df834>
 45e4ac8: 52800000     	mov	w0, #0x0                ; =0
 45e4acc: d65f03c0     	ret
 45e4ad0: d100c3ff     	sub	sp, sp, #0x30
 45e4ad4: a9027bfd     	stp	x29, x30, [sp, #0x20]
 45e4ad8: 910083fd     	add	x29, sp, #0x20
 45e4adc: a900ffff     	stp	xzr, xzr, [sp, #0x8]
 45e4ae0: f9000fff     	str	xzr, [sp, #0x18]
 45e4ae4: 910023e1     	add	x1, sp, #0x8
 45e4ae8: 97718a76     	bl	0x22474c0 <_ChromeMain+0x2242224>
 45e4aec: b004cb48     	adrp	x8, 0xdf4d000 <dyld_stub_binder+0xdf4d000>
 45e4af0: fd406500     	ldr	d0, [x8, #0xc8]
 45e4af4: 6d410be1     	ldp	d1, d2, [sp, #0x10]
 45e4af8: 1e602020     	fcmp	d1, d0
 45e4afc: 1a9fb7e8     	cset	w8, ge
 45e4b00: b004cb49     	adrp	x9, 0xdf4d000 <dyld_stub_binder+0xdf4d000>
 45e4b04: fd406920     	ldr	d0, [x9, #0xd0]
 45e4b08: 1e602040     	fcmp	d2, d0
 45e4b0c: 1a9fb7e9     	cset	w9, ge
 45e4b10: b004cb4a     	adrp	x10, 0xdf4d000 <dyld_stub_binder+0xdf4d000>
 45e4b14: fd406d40     	ldr	d0, [x10, #0xd8]
 45e4b18: 1e602040     	fcmp	d2, d0
 45e4b1c: 1a8983e9     	csel	w9, wzr, w9, hi
 45e4b20: 0a090100     	and	w0, w8, w9
 45e4b24: a9427bfd     	ldp	x29, x30, [sp, #0x20]
 45e4b28: 9100c3ff     	add	sp, sp, #0x30
 45e4b2c: d65f03c0     	ret
