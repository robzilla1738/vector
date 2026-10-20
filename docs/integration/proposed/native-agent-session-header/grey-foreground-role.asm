
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 41da630: 71000c1f     	cmp	w0, #0x3
 41da634: 540002cc     	b.gt	0x41da68c <_ChromeMain+0x41d53f0>
 41da638: 7100041f     	cmp	w0, #0x1
 41da63c: 5400014c     	b.gt	0x41da664 <_ChromeMain+0x41d53c8>
 41da640: 340000c0     	cbz	w0, 0x41da658 <_ChromeMain+0x41d53bc>
 41da644: 7100041f     	cmp	w0, #0x1
 41da648: 54000521     	b.ne	0x41da6ec <_ChromeMain+0x41d5450>
 41da64c: d2802480     	mov	x0, #0x124              ; =292
 41da650: f2c024a0     	movk	x0, #0x125, lsl #32
 41da654: d65f03c0     	ret
 41da658: d2801bc0     	mov	x0, #0xde               ; =222
 41da65c: f2c01bc0     	movk	x0, #0xde, lsl #32
 41da660: d65f03c0     	ret
