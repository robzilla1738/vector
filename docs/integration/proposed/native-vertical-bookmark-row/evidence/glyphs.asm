
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4623fe4:      	sub	sp, sp, #0x70
 4623fe8:      	stp	x22, x21, [sp, #0x40]
 4623fec:      	stp	x20, x19, [sp, #0x50]
 4623ff0:      	stp	x29, x30, [sp, #0x60]
 4623ff4:      	add	x29, sp, #0x60
 4623ff8:      	mov	x19, x0
 4623ffc:      	ldrb	w8, [x0, #0x440]
 4624000:      	cmp	w8, #0x0
 4624004:      	mov	w8, #0xdd               ; =221
 4624008:      	cinc	w21, w8, eq
 462400c:      	ldr	x8, [x0, #0x3e0]
 4624010:      	ldr	w8, [x8, #0xf8]
 4624014:      	cbz	w8, 0x46240a8 <_ChromeMain+0x461ee0c>
 4624018:      	ldr	x20, [x19, #0x420]
 462401c:      	str	w21, [sp, #0x10]
 4624020:      	strb	wzr, [sp, #0x14]
 4624024:      	adrp	x0, 0xe9d4000 <dyld_stub_binder+0xe9d4000>
 4624028:      	add	x0, x0, #0xac8
 462402c:      	add	x8, sp, #0x18
 4624030:      	add	x1, sp, #0x10
 4624034:      	mov	w2, #0x10               ; =16
 4624038:      	mov	x3, #0x0                ; =0
 462403c:      	bl	0xdf4920 <_ChromeMain+0xdef684>
 4624040:      	add	x1, sp, #0x18
 4624044:      	mov	x0, x20
 4624048:      	bl	0x5a10a0 <_ChromeMain+0x59be04>
 462404c:      	add	x0, sp, #0x18
 4624050:      	bl	0x846840 <_ChromeMain+0x8415a4>
 4624054:      	ldr	x19, [x19, #0x430]
 4624058:      	cbz	x19, 0x4624094 <_ChromeMain+0x461edf8>
 462405c:      	str	w21, [sp, #0x8]
 4624060:      	strb	wzr, [sp, #0xc]
 4624064:      	adrp	x0, 0xe9d4000 <dyld_stub_binder+0xe9d4000>
 4624068:      	add	x0, x0, #0xf50
 462406c:      	add	x8, sp, #0x18
 4624070:      	add	x1, sp, #0x8
 4624074:      	mov	w2, #0x10               ; =16
 4624078:      	mov	x3, #0x0                ; =0
 462407c:      	bl	0xdf4920 <_ChromeMain+0xdef684>
 4624080:      	add	x1, sp, #0x18
 4624084:      	mov	x0, x19
 4624088:      	bl	0x5a10a0 <_ChromeMain+0x59be04>
 462408c:      	add	x0, sp, #0x18
 4624090:      	bl	0x846840 <_ChromeMain+0x8415a4>
 4624094:      	ldp	x29, x30, [sp, #0x60]
 4624098:      	ldp	x20, x19, [sp, #0x50]
 462409c:      	ldp	x22, x21, [sp, #0x40]
 46240a0:      	add	sp, sp, #0x70
 46240a4:      	ret
 46240a8:      	ldrb	w8, [x19, #0x442]
 46240ac:      	tbnz	w8, #0x0, 0x4624094 <_ChromeMain+0x461edf8>
 46240b0:      	ldr	x19, [x19, #0x420]
 46240b4:      	str	w21, [sp]
 46240b8:      	strb	wzr, [sp, #0x4]
 46240bc:      	adrp	x0, 0xe82c000 <dyld_stub_binder+0xe82c000>
 46240c0:      	add	x0, x0, #0xf08
 46240c4:      	add	x8, sp, #0x18
 46240c8:      	mov	x1, sp
 46240cc:      	b	0x4624074 <_ChromeMain+0x461edd8>
 46240d0:      	nop
 46240d4:      	nop
 46240d8:      	nop
 46240dc:      	nop
 46240e0:      	nop
 46240e4:      	nop
 46240e8:      	nop
 46240ec:      	nop
 46240f0:      	nop
 46240f4:      	nop
 46240f8:      	nop
 46240fc:      	nop
