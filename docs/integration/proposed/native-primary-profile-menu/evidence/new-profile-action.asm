
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 45718f8: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45718fc: a9017bfd     	stp	x29, x30, [sp, #0x10]
 4571900: 910043fd     	add	x29, sp, #0x10
 4571904: aa0003f3     	mov	x19, x0
 4571908: f9400008     	ldr	x8, [x0]
 457190c: b4000088     	cbz	x8, 0x457191c <_ChromeMain+0x456c680>
 4571910: f9403508     	ldr	x8, [x8, #0x68]
 4571914: 39412108     	ldrb	w8, [x8, #0x48]
 4571918: 340000a8     	cbz	w8, 0x457192c <_ChromeMain+0x456c690>
 457191c: aa1303e0     	mov	x0, x19
 4571920: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 4571924: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4571928: 17fff228     	b	0x456e1c8 <_ChromeMain+0x4568f2c>
 457192c: aa1303e0     	mov	x0, x19
 4571930: 97fff226     	bl	0x456e1c8 <_ChromeMain+0x4568f2c>
 4571934: f940c674     	ldr	x20, [x19, #0x188]
 4571938: b40000d4     	cbz	x20, 0x4571950 <_ChromeMain+0x456c6b4>
 457193c: 52800028     	mov	w8, #0x1                ; =1
 4571940: b8280288     	ldadd	w8, w8, [x20]
 4571944: 12b00009     	mov	w9, #0x7fffffff         ; =2147483647
 4571948: 6b09011f     	cmp	w8, w9
 457194c: 54000240     	b.eq	0x4571994 <_ChromeMain+0x456c6f8>
 4571950: f940ca73     	ldr	x19, [x19, #0x190]
 4571954: 52800700     	mov	w0, #0x38               ; =56
 4571958: 96ea7684     	bl	0xf368 <_ChromeMain+0xa0cc>
 457195c: 52800028     	mov	w8, #0x1                ; =1
 4571960: b9000008     	str	w8, [x0]
 4571964: 1008fca8     	adr	x8, 0x45838f8 <_ChromeMain+0x457e65c>
 4571968: d503201f     	nop
 457196c: d0ffd629     	adrp	x9, 0x4037000 <_ChromeMain+0x4031d64>
 4571970: 91130129     	add	x9, x9, #0x4c0
 4571974: a900a408     	stp	x8, x9, [x0, #0x8]
 4571978: 90feff68     	adrp	x8, 0x255d000 <_ChromeMain+0x2557d64>
 457197c: 912c0108     	add	x8, x8, #0xb00
 4571980: f9000c08     	str	x8, [x0, #0x18]
 4571984: a902cc14     	stp	x20, x19, [x0, #0x28]
 4571988: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 457198c: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 4571990: 17ee3277     	b	0x40fe36c <_ChromeMain+0x40f90d0>
 4571994: d4200000     	brk	#0
 4571998: d4400000     	hlt	#0
