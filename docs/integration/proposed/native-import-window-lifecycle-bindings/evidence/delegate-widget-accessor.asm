
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 28ad1d0: f9401808     	ldr	x8, [x0, #0x30]
 28ad1d4: b4000168     	cbz	x8, 0x28ad200 <_ChromeMain+0x28a7f64>
 28ad1d8: 19404108     	ldapurb	w8, [x8, #0x4]
 28ad1dc: 35000128     	cbnz	w8, 0x28ad200 <_ChromeMain+0x28a7f64>
 28ad1e0: f9401c08     	ldr	x8, [x0, #0x38]
 28ad1e4: b40000e8     	cbz	x8, 0x28ad200 <_ChromeMain+0x28a7f64>
 28ad1e8: f9401808     	ldr	x8, [x0, #0x30]
 28ad1ec: b40000e8     	cbz	x8, 0x28ad208 <_ChromeMain+0x28a7f6c>
 28ad1f0: 19404108     	ldapurb	w8, [x8, #0x4]
 28ad1f4: 350000a8     	cbnz	w8, 0x28ad208 <_ChromeMain+0x28a7f6c>
 28ad1f8: f9401c00     	ldr	x0, [x0, #0x38]
 28ad1fc: d65f03c0     	ret
 28ad200: d2800000     	mov	x0, #0x0                ; =0
 28ad204: d65f03c0     	ret
 28ad208: d4200000     	brk	#0
