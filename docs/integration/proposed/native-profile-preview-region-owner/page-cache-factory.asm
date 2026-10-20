
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 465352c: d10343ff     	sub	sp, sp, #0xd0
 4653530: a9076ffc     	stp	x28, x27, [sp, #0x70]
 4653534: a90867fa     	stp	x26, x25, [sp, #0x80]
 4653538: a9095ff8     	stp	x24, x23, [sp, #0x90]
 465353c: a90a57f6     	stp	x22, x21, [sp, #0xa0]
 4653540: a90b4ff4     	stp	x20, x19, [sp, #0xb0]
 4653544: a90c7bfd     	stp	x29, x30, [sp, #0xc0]
 4653548: 910303fd     	add	x29, sp, #0xc0
 465354c: 39405c29     	ldrb	w9, [x1, #0x17]
 4653550: 13001d28     	sxtb	w8, w9
 4653554: f940042a     	ldr	x10, [x1, #0x8]
 4653558: 7100011f     	cmp	w8, #0x0
 465355c: 9a894157     	csel	x23, x10, x9, mi
 4653560: b4000157     	cbz	x23, 0x4653588 <_ChromeMain+0x464e2ec>
 4653564: aa0103f4     	mov	x20, x1
 4653568: aa0003f3     	mov	x19, x0
 465356c: 9117e019     	add	x25, x0, #0x5f8
 4653570: f942fc16     	ldr	x22, [x0, #0x5f8]
 4653574: b4000536     	cbz	x22, 0x4653618 <_ChromeMain+0x464e37c>
 4653578: f9400289     	ldr	x9, [x20]
 465357c: 7100011f     	cmp	w8, #0x0
 4653580: 9a944135     	csel	x21, x9, x20, mi
 4653584: 14000006     	b	0x465359c <_ChromeMain+0x464e300>
 4653588: d2800015     	mov	x21, #0x0               ; =0
 465358c: 1400001a     	b	0x46535f4 <_ChromeMain+0x464e358>
 4653590: 54000223     	b.lo	0x46535d4 <_ChromeMain+0x464e338>
 4653594: f94006d6     	ldr	x22, [x22, #0x8]
 4653598: b4000416     	cbz	x22, 0x4653618 <_ChromeMain+0x464e37c>
 465359c: aa1603e8     	mov	x8, x22
 46535a0: f8420d09     	ldr	x9, [x8, #0x20]!
 46535a4: 39805d0a     	ldrsb	x10, [x8, #0x17]
 46535a8: f100015f     	cmp	x10, #0x0
 46535ac: 9a884121     	csel	x1, x9, x8, mi
 46535b0: f9400508     	ldr	x8, [x8, #0x8]
 46535b4: 7100015f     	cmp	w10, #0x0
 46535b8: 9a8a4118     	csel	x24, x8, x10, mi
 46535bc: eb17031f     	cmp	x24, x23
 46535c0: 9a973302     	csel	x2, x24, x23, lo
 46535c4: aa1503e0     	mov	x0, x21
 46535c8: 94e6d8a6     	bl	0x8009860 <_ChromeMain+0x80045c4>
 46535cc: 340000a0     	cbz	w0, 0x46535e0 <_ChromeMain+0x464e344>
 46535d0: 36fffe20     	tbz	w0, #0x1f, 0x4653594 <_ChromeMain+0x464e2f8>
 46535d4: f94002d6     	ldr	x22, [x22]
 46535d8: b5fffe36     	cbnz	x22, 0x465359c <_ChromeMain+0x464e300>
 46535dc: 1400000f     	b	0x4653618 <_ChromeMain+0x464e37c>
 46535e0: eb1802ff     	cmp	x23, x24
 46535e4: 54fffd61     	b.ne	0x4653590 <_ChromeMain+0x464e2f4>
 46535e8: eb1902df     	cmp	x22, x25
 46535ec: 54000160     	b.eq	0x4653618 <_ChromeMain+0x464e37c>
 46535f0: f9401ed5     	ldr	x21, [x22, #0x38]
 46535f4: aa1503e0     	mov	x0, x21
 46535f8: a94c7bfd     	ldp	x29, x30, [sp, #0xc0]
 46535fc: a94b4ff4     	ldp	x20, x19, [sp, #0xb0]
