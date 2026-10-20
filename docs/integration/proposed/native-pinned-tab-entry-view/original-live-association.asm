
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4605ccc: 940006b5     	bl	0x46077a0 <_ChromeMain+0x4602504>
 4605cd0: b9023be0     	str	w0, [sp, #0x238]
 4605cd4: d360fc08     	lsr	x8, x0, #32
 4605cd8: 3908f3e8     	strb	w8, [sp, #0x23c]
 4605cdc: b4fff0a8     	cbz	x8, 0x4605af0 <_ChromeMain+0x4600854>
 4605ce0: f941a668     	ldr	x8, [x19, #0x348]
 4605ce4: b4fff068     	cbz	x8, 0x4605af0 <_ChromeMain+0x4600854>
 4605ce8: f9400108     	ldr	x8, [x8]
 4605cec: 93407c01     	sxtw	x1, w0
 4605cf0: aa0803e0     	mov	x0, x8
 4605cf4: 97296181     	bl	0x105e2f8 <_ChromeMain+0x105905c>
 4605cf8: b4ffefc0     	cbz	x0, 0x4605af0 <_ChromeMain+0x4600854>
 4605cfc: b9401008     	ldr	w8, [x0, #0x10]
 4605d00: 394913e9     	ldrb	w9, [sp, #0x244]
 4605d04: 37000049     	tbnz	w9, #0x0, 0x4605d0c <_ChromeMain+0x4600a70>
 4605d08: 390913fa     	strb	w26, [sp, #0x244]
 4605d0c: b90243e8     	str	w8, [sp, #0x240]
 4605d10: 910043e8     	add	x8, sp, #0x10
 4605d14: 972b9f5b     	bl	0x10eda80 <_ChromeMain+0x10e87e4>
 4605d18: 910282a0     	add	x0, x21, #0xa0
 4605d1c: 910043e1     	add	x1, sp, #0x10
 4605d20: 97ef4de0     	bl	0x41d94a0 <_ChromeMain+0x41d4204>
 4605d24: 910043e0     	add	x0, sp, #0x10
 4605d28: 972b9a56     	bl	0x10ec680 <_ChromeMain+0x10e73e4>
 4605d2c: 394a23e8     	ldrb	w8, [sp, #0x288]
 4605d30: 7100051f     	cmp	w8, #0x1
 4605d34: 54000f81     	b.ne	0x4605f24 <_ChromeMain+0x4600c88>
 4605d38: f94137e9     	ldr	x9, [sp, #0x268]
 4605d3c: b40005c9     	cbz	x9, 0x4605df4 <_ChromeMain+0x4600b58>
 4605d40: f9400d29     	ldr	x9, [x9, #0x18]
 4605d44: b4000589     	cbz	x9, 0x4605df4 <_ChromeMain+0x4600b58>
 4605d48: 394703e9     	ldrb	w9, [sp, #0x1c0]
 4605d4c: 34000429     	cbz	w9, 0x4605dd0 <_ChromeMain+0x4600b34>
 4605d50: 7100051f     	cmp	w8, #0x1
