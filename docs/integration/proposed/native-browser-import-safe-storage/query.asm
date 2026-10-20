
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 8918fdc: d10283ff     	sub	sp, sp, #0xa0
 8918fe0: a90757f6     	stp	x22, x21, [sp, #0x70]
 8918fe4: a9084ff4     	stp	x20, x19, [sp, #0x80]
 8918fe8: a9097bfd     	stp	x29, x30, [sp, #0x90]
 8918fec: 910243fd     	add	x29, sp, #0x90
 8918ff0: aa0303f4     	mov	x20, x3
 8918ff4: aa0203f5     	mov	x21, x2
 8918ff8: aa0803f3     	mov	x19, x8
 8918ffc: 9002b888     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 8919000: f940f908     	ldr	x8, [x8, #0x1f0]
 8919004: f9400108     	ldr	x8, [x8]
 8919008: f81d83a8     	stur	x8, [x29, #-0x28]
 891900c: 9002b888     	adrp	x8, 0xe029000 <dyld_stub_binder+0xe029000>
 8919010: f9476108     	ldr	x8, [x8, #0xec0]
 8919014: f9400108     	ldr	x8, [x8]
 8919018: 9002b889     	adrp	x9, 0xe029000 <dyld_stub_binder+0xe029000>
 891901c: f9475d29     	ldr	x9, [x9, #0xeb8]
 8919020: f9400129     	ldr	x9, [x9]
 8919024: f9001fe9     	str	x9, [sp, #0x38]
 8919028: 9002b889     	adrp	x9, 0xe029000 <dyld_stub_binder+0xe029000>
 891902c: f9475929     	ldr	x9, [x9, #0xeb0]
 8919030: f9400129     	ldr	x9, [x9]
 8919034: a900a7e8     	stp	x8, x9, [sp, #0x8]
 8919038: 96758835     	bl	0x267b10c <_ChromeMain+0x2675e70>
 891903c: 950a71d3     	bl	0xcbb5788 <dyld_stub_binder+0xcbb5788>
 8919040: aa0003f6     	mov	x22, x0
 8919044: f90023e0     	str	x0, [sp, #0x40]
 8919048: 9002b888     	adrp	x8, 0xe029000 <dyld_stub_binder+0xe029000>
 891904c: f9475508     	ldr	x8, [x8, #0xea8]
 8919050: f9400108     	ldr	x8, [x8]
 8919054: f9000fe8     	str	x8, [sp, #0x18]
 8919058: aa1503e0     	mov	x0, x21
 891905c: aa1403e1     	mov	x1, x20
 8919060: 9675882b     	bl	0x267b10c <_ChromeMain+0x2675e70>
 8919064: 950a71c9     	bl	0xcbb5788 <dyld_stub_binder+0xcbb5788>
 8919068: aa0003f4     	mov	x20, x0
 891906c: 9002b888     	adrp	x8, 0xe029000 <dyld_stub_binder+0xe029000>
 8919070: f9475108     	ldr	x8, [x8, #0xea0]
 8919074: f9400108     	ldr	x8, [x8]
 8919078: 9002b889     	adrp	x9, 0xe029000 <dyld_stub_binder+0xe029000>
 891907c: f9474d29     	ldr	x9, [x9, #0xe98]
 8919080: f9400129     	ldr	x9, [x9]
 8919084: a904a7e0     	stp	x0, x9, [sp, #0x48]
 8919088: 9002b889     	adrp	x9, 0xe029000 <dyld_stub_binder+0xe029000>
 891908c: f9473d29     	ldr	x9, [x9, #0xe78]
 8919090: f9400129     	ldr	x9, [x9]
 8919094: a90227e8     	stp	x8, x9, [sp, #0x20]
 8919098: f002b868     	adrp	x8, 0xe028000 <dyld_stub_binder+0xe028000>
 891909c: f945cd08     	ldr	x8, [x8, #0xb98]
 89190a0: b002b889     	adrp	x9, 0xe02a000 <dyld_stub_binder+0xe02a000>
 89190a4: f945e129     	ldr	x9, [x9, #0xbc0]
 89190a8: f9400129     	ldr	x9, [x9]
 89190ac: f9001be9     	str	x9, [sp, #0x30]
 89190b0: a905a3e8     	stp	x8, x8, [sp, #0x58]
 89190b4: 90031ea8     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 89190b8: f9435d00     	ldr	x0, [x8, #0x6b8]
 89190bc: 9100e3e2     	add	x2, sp, #0x38
 89190c0: 910023e3     	add	x3, sp, #0x8
 89190c4: 528000c4     	mov	w4, #0x6                ; =6
 89190c8: 950a8636     	bl	0xcbba9a0 <dyld_stub_binder+0xcbba9a0>
 89190cc: 950a71af     	bl	0xcbb5788 <dyld_stub_binder+0xcbb5788>
 89190d0: aa0003f5     	mov	x21, x0
 89190d4: aa1403e0     	mov	x0, x20
 89190d8: 950a70dd     	bl	0xcbb544c <dyld_stub_binder+0xcbb544c>
 89190dc: aa1603e0     	mov	x0, x22
 89190e0: 950a70db     	bl	0xcbb544c <dyld_stub_binder+0xcbb544c>
 89190e4: f9000275     	str	x21, [x19]
 89190e8: f85d83a8     	ldur	x8, [x29, #-0x28]
 89190ec: f002b869     	adrp	x9, 0xe028000 <dyld_stub_binder+0xe028000>
 89190f0: f940f929     	ldr	x9, [x9, #0x1f0]
 89190f4: f9400129     	ldr	x9, [x9]
 89190f8: eb08013f     	cmp	x9, x8
 89190fc: 540000c1     	b.ne	0x8919114 <_ChromeMain+0x8913e78>
 8919100: a9497bfd     	ldp	x29, x30, [sp, #0x90]
 8919104: a9484ff4     	ldp	x20, x19, [sp, #0x80]
 8919108: a94757f6     	ldp	x22, x21, [sp, #0x70]
 891910c: 910283ff     	add	sp, sp, #0xa0
 8919110: d65f03c0     	ret
 8919114: 950a715b     	bl	0xcbb5680 <dyld_stub_binder+0xcbb5680>
