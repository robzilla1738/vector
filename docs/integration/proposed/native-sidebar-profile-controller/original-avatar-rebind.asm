
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 423f6b0: d10103ff     	sub	sp, sp, #0x40
 423f6b4: a90157f6     	stp	x22, x21, [sp, #0x10]
 423f6b8: a9024ff4     	stp	x20, x19, [sp, #0x20]
 423f6bc: a9037bfd     	stp	x29, x30, [sp, #0x30]
 423f6c0: 9100c3fd     	add	x29, sp, #0x30
 423f6c4: b4000801     	cbz	x1, 0x423f7c4 <_ChromeMain+0x423a528>
 423f6c8: aa0103f4     	mov	x20, x1
 423f6cc: aa0003f3     	mov	x19, x0
 423f6d0: 911f6015     	add	x21, x0, #0x7d8
 423f6d4: 91202000     	add	x0, x0, #0x808
 423f6d8: 52800201     	mov	w1, #0x10               ; =16
 423f6dc: 52800022     	mov	w2, #0x1                ; =1
 423f6e0: 978dc828     	bl	0x25b1780 <_ChromeMain+0x25ac4e4>
 423f6e4: 91202260     	add	x0, x19, #0x808
 423f6e8: 97b6740c     	bl	0x2fdc718 <_ChromeMain+0x2fd747c>
 423f6ec: b4000715     	cbz	x21, 0x423f7cc <_ChromeMain+0x423a530>
 423f6f0: 911f6260     	add	x0, x19, #0x7d8
 423f6f4: 9799eeb5     	bl	0x28bb1c8 <_ChromeMain+0x28b5f2c>
 423f6f8: 911f6260     	add	x0, x19, #0x7d8
 423f6fc: 911f4261     	add	x1, x19, #0x7d0
 423f700: aa1403e2     	mov	x2, x20
 423f704: 979fb613     	bl	0x2a2cf50 <_ChromeMain+0x2a27cb4>
 423f708: 911f6260     	add	x0, x19, #0x7d8
 423f70c: 97990fd1     	bl	0x2883650 <_ChromeMain+0x287e3b4>
 423f710: aa1303e0     	mov	x0, x19
 423f714: 9400003c     	bl	0x423f804 <_ChromeMain+0x423a568>
