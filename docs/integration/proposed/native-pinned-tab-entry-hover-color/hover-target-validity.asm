
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 460db50: f941e808     	ldr	x8, [x0, #0x3d0]
 460db54: b4000188     	cbz	x8, 0x460db84 <_ChromeMain+0x46088e8>
 460db58: f941f009     	ldr	x9, [x0, #0x3e0]
 460db5c: f941b50a     	ldr	x10, [x8, #0x368]
 460db60: eb0a013f     	cmp	x9, x10
 460db64: 54000063     	b.lo	0x460db70 <_ChromeMain+0x46088d4>
 460db68: 52800008     	mov	w8, #0x0                ; =0
 460db6c: 14000006     	b	0x460db84 <_ChromeMain+0x46088e8>
 460db70: f941b108     	ldr	x8, [x8, #0x360]
 460db74: 52804d0a     	mov	w10, #0x268             ; =616
 460db78: 9b0a2128     	madd	x8, x9, x10, x8
 460db7c: 39498108     	ldrb	w8, [x8, #0x260]
 460db80: 52000108     	eor	w8, w8, #0x1
 460db84: 12000100     	and	w0, w8, #0x1
 460db88: d65f03c0     	ret
 460db8c: 00000000     	udf	#0x0
 460db90: f941e808     	ldr	x8, [x0, #0x3d0]
 460db94: b4000108     	cbz	x8, 0x460dbb4 <_ChromeMain+0x4608918>
 460db98: 39544109     	ldrb	w9, [x8, #0x510]
 460db9c: 370000a9     	tbnz	w9, #0x0, 0x460dbb0 <_ChromeMain+0x4608914>
 460dba0: f941f009     	ldr	x9, [x0, #0x3e0]
 460dba4: f941b50a     	ldr	x10, [x8, #0x368]
 460dba8: eb0a013f     	cmp	x9, x10
 460dbac: 54000083     	b.lo	0x460dbbc <_ChromeMain+0x4608920>
 460dbb0: 52800008     	mov	w8, #0x0                ; =0
 460dbb4: 12000100     	and	w0, w8, #0x1
 460dbb8: d65f03c0     	ret
 460dbbc: f941b108     	ldr	x8, [x8, #0x360]
 460dbc0: 52804d0a     	mov	w10, #0x268             ; =616
 460dbc4: 9b0a2128     	madd	x8, x9, x10, x8
 460dbc8: 39425108     	ldrb	w8, [x8, #0x94]
 460dbcc: 17fffffa     	b	0x460dbb4 <_ChromeMain+0x4608918>
 460dbd0: a9bd57f6     	stp	x22, x21, [sp, #-0x30]!
 460dbd4: a9014ff4     	stp	x20, x19, [sp, #0x10]
 460dbd8: a9027bfd     	stp	x29, x30, [sp, #0x20]
 460dbdc: 910083fd     	add	x29, sp, #0x20
 460dbe0: aa0003f3     	mov	x19, x0
 460dbe4: d0050888     	adrp	x8, 0xe71f000 <dyld_stub_binder+0xe71f000>
 460dbe8: 912fc108     	add	x8, x8, #0xbf0
 460dbec: aa0003f4     	mov	x20, x0
 460dbf0: f81f8e88     	str	x8, [x20, #-0x8]!
 460dbf4: 91106109     	add	x9, x8, #0x418
 460dbf8: 9111010a     	add	x10, x8, #0x440
 460dbfc: a9002809     	stp	x9, x10, [x0]
 460dc00: 9111e109     	add	x9, x8, #0x478
 460dc04: 9112a10a     	add	x10, x8, #0x4a8
 460dc08: a9062809     	stp	x9, x10, [x0, #0x60]
 460dc0c: 9113e109     	add	x9, x8, #0x4f8
