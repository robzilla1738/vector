
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4136218: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 413621c: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4136220: 910043fd     	add	x29, sp, #0x10
 4136224: f0055da8     	adrp	x8, 0xeced000 <dyld_stub_binder+0xeced000>
 4136228: f945f100     	ldr	x0, [x8, #0xbe0]
 413622c: 95fffcdc     	bl	0xc13559c <_ChromeMain+0xc130300>
 4136230: 94fb3542     	bl	0x8003738 <_ChromeMain+0x7ffe49c>
 4136234: aa0003f3     	mov	x19, x0
 4136238: 52800042     	mov	w2, #0x2                ; =2
 413623c: 52800023     	mov	w3, #0x1                ; =1
 4136240: 95fffcff     	bl	0xc13563c <_ChromeMain+0xc1303a0>
 4136244: aa1303e0     	mov	x0, x19
 4136248: 52800042     	mov	w2, #0x2                ; =2
 413624c: 52800043     	mov	w3, #0x2                ; =2
 4136250: 95fffcfb     	bl	0xc13563c <_ChromeMain+0xc1303a0>
 4136254: aa1303e0     	mov	x0, x19
 4136258: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 413625c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4136260: 14fb353f     	b	0x800375c <_ChromeMain+0x7ffe4c0>
