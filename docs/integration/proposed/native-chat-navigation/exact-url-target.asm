
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 4564b14: a9bb67fa     	stp	x26, x25, [sp, #-0x50]!
 4564b18: a9015ff8     	stp	x24, x23, [sp, #0x10]
 4564b1c: a90257f6     	stp	x22, x21, [sp, #0x20]
 4564b20: a9034ff4     	stp	x20, x19, [sp, #0x30]
 4564b24: a9047bfd     	stp	x29, x30, [sp, #0x40]
 4564b28: 910103fd     	add	x29, sp, #0x40
 4564b2c: b4001c40     	cbz	x0, 0x4564eb4 <_ChromeMain+0x455fc18>
 4564b30: aa0103f3     	mov	x19, x1
 4564b34: aa0003f4     	mov	x20, x0
 4564b38: f9414808     	ldr	x8, [x0, #0x290]
 4564b3c: b0ffd717     	adrp	x23, 0x4045000 <_ChromeMain+0x403fd64>
 4564b40: 913c82f7     	add	x23, x23, #0xf20
 4564b44: b5001d68     	cbnz	x8, 0x4564ef0 <_ChromeMain+0x455fc54>
 4564b48: f9413288     	ldr	x8, [x20, #0x260]
 4564b4c: f9401d09     	ldr	x9, [x8, #0x38]
 4564b50: b982b688     	ldrsw	x8, [x20, #0x2b4]
 4564b54: eb17013f     	cmp	x9, x23
 4564b58: 54001d81     	b.ne	0x4564f08 <_ChromeMain+0x455fc6c>
 4564b5c: 3100051f     	cmn	w8, #0x1
 4564b60: 540025a0     	b.eq	0x4565014 <_ChromeMain+0x455fd78>
 4564b64: f9414289     	ldr	x9, [x20, #0x280]
 4564b68: eb08013f     	cmp	x9, x8
 4564b6c: 540023e9     	b.ls	0x4564fe8 <_ChromeMain+0x455fd4c>
 4564b70: f9413e89     	ldr	x9, [x20, #0x278]
 4564b74: f8687928     	ldr	x8, [x9, x8, lsl #3]
 4564b78: b4002428     	cbz	x8, 0x4564ffc <_ChromeMain+0x455fd60>
 4564b7c: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 4564b80: b7f82369     	tbnz	x9, #0x3f, 0x4564fec <_ChromeMain+0x455fd50>
 4564b84: b5002389     	cbnz	x9, 0x4564ff4 <_ChromeMain+0x455fd58>
 4564b88: f9400d08     	ldr	x8, [x8, #0x18]
 4564b8c: f9400508     	ldr	x8, [x8, #0x8]
 4564b90: 91018100     	add	x0, x8, #0x60
 4564b94: 39405c09     	ldrb	w9, [x0, #0x17]
 4564b98: 13001d28     	sxtb	w8, w9
 4564b9c: f940040a     	ldr	x10, [x0, #0x8]
 4564ba0: 7100011f     	cmp	w8, #0x0
 4564ba4: 9a894142     	csel	x2, x10, x9, mi
 4564ba8: 39405e75     	ldrb	w21, [x19, #0x17]
 4564bac: 13001eb6     	sxtb	w22, w21
 4564bb0: f9400678     	ldr	x24, [x19, #0x8]
 4564bb4: 710002df     	cmp	w22, #0x0
 4564bb8: 9a954309     	csel	x9, x24, x21, mi
 4564bbc: eb09005f     	cmp	x2, x9
 4564bc0: 54000121     	b.ne	0x4564be4 <_ChromeMain+0x455f948>
 4564bc4: f9400009     	ldr	x9, [x0]
 4564bc8: 7100011f     	cmp	w8, #0x0
 4564bcc: 9a804120     	csel	x0, x9, x0, mi
 4564bd0: f9400268     	ldr	x8, [x19]
 4564bd4: 710002df     	cmp	w22, #0x0
 4564bd8: 9a934101     	csel	x1, x8, x19, mi
 4564bdc: 94ea9321     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4564be0: 34001680     	cbz	w0, 0x4564eb0 <_ChromeMain+0x455fc14>
 4564be4: b982b688     	ldrsw	x8, [x20, #0x2b4]
 4564be8: 3100051f     	cmn	w8, #0x1
 4564bec: 540021a0     	b.eq	0x4565020 <_ChromeMain+0x455fd84>
 4564bf0: f9414289     	ldr	x9, [x20, #0x280]
 4564bf4: eb08013f     	cmp	x9, x8
 4564bf8: 54001f89     	b.ls	0x4564fe8 <_ChromeMain+0x455fd4c>
 4564bfc: f9413e89     	ldr	x9, [x20, #0x278]
 4564c00: f8687928     	ldr	x8, [x9, x8, lsl #3]
 4564c04: b40021a8     	cbz	x8, 0x4565038 <_ChromeMain+0x455fd9c>
 4564c08: 3980fd09     	ldrsb	x9, [x8, #0x3f]
 4564c0c: b7f81fc9     	tbnz	x9, #0x3f, 0x4565004 <_ChromeMain+0x455fd68>
 4564c10: b5001fe9     	cbnz	x9, 0x456500c <_ChromeMain+0x455fd70>
 4564c14: f9400d08     	ldr	x8, [x8, #0x18]
 4564c18: f9400508     	ldr	x8, [x8, #0x8]
 4564c1c: 91018100     	add	x0, x8, #0x60
 4564c20: 39405c09     	ldrb	w9, [x0, #0x17]
 4564c24: 13001d28     	sxtb	w8, w9
 4564c28: f940040a     	ldr	x10, [x0, #0x8]
 4564c2c: 7100011f     	cmp	w8, #0x0
 4564c30: 9a894142     	csel	x2, x10, x9, mi
 4564c34: 721902df     	tst	w22, #0x80
 4564c38: 9a951315     	csel	x21, x24, x21, ne
 4564c3c: eb15005f     	cmp	x2, x21
 4564c40: 54000121     	b.ne	0x4564c64 <_ChromeMain+0x455f9c8>
 4564c44: f9400009     	ldr	x9, [x0]
 4564c48: 7100011f     	cmp	w8, #0x0
 4564c4c: 9a804120     	csel	x0, x9, x0, mi
 4564c50: f9400268     	ldr	x8, [x19]
 4564c54: 721902df     	tst	w22, #0x80
 4564c58: 9a931101     	csel	x1, x8, x19, ne
 4564c5c: 94ea9301     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4564c60: 34001280     	cbz	w0, 0x4564eb0 <_ChromeMain+0x455fc14>
 4564c64: f9414a98     	ldr	x24, [x20, #0x290]
 4564c68: b5001378     	cbnz	x24, 0x4564ed4 <_ChromeMain+0x455fc38>
 4564c6c: f9413288     	ldr	x8, [x20, #0x260]
 4564c70: f9401d09     	ldr	x9, [x8, #0x38]
 4564c74: b982b688     	ldrsw	x8, [x20, #0x2b4]
 4564c78: eb17013f     	cmp	x9, x23
 4564c7c: 540014c1     	b.ne	0x4564f14 <_ChromeMain+0x455fc78>
 4564c80: 3100051f     	cmn	w8, #0x1
 4564c84: 54001d40     	b.eq	0x456502c <_ChromeMain+0x455fd90>
 4564c88: f9414289     	ldr	x9, [x20, #0x280]
 4564c8c: eb08013f     	cmp	x9, x8
 4564c90: 54001ac9     	b.ls	0x4564fe8 <_ChromeMain+0x455fd4c>
 4564c94: f9413e89     	ldr	x9, [x20, #0x278]
 4564c98: f8687939     	ldr	x25, [x9, x8, lsl #3]
 4564c9c: b4000539     	cbz	x25, 0x4564d40 <_ChromeMain+0x455faa4>
 4564ca0: f9400f28     	ldr	x8, [x25, #0x18]
 4564ca4: f9400509     	ldr	x9, [x8, #0x8]
 4564ca8: 91018137     	add	x23, x9, #0x60
 4564cac: 3941dd2a     	ldrb	w10, [x9, #0x77]
 4564cb0: 13001d48     	sxtb	w8, w10
 4564cb4: f9403529     	ldr	x9, [x9, #0x68]
 4564cb8: 7100011f     	cmp	w8, #0x0
 4564cbc: 9a8a4129     	csel	x9, x9, x10, mi
 4564cc0: eb15013f     	cmp	x9, x21
 4564cc4: 54000141     	b.ne	0x4564cec <_ChromeMain+0x455fa50>
 4564cc8: f94002e9     	ldr	x9, [x23]
 4564ccc: 7100011f     	cmp	w8, #0x0
 4564cd0: 9a974120     	csel	x0, x9, x23, mi
 4564cd4: f9400268     	ldr	x8, [x19]
 4564cd8: 721902df     	tst	w22, #0x80
 4564cdc: 9a931101     	csel	x1, x8, x19, ne
 4564ce0: aa1503e2     	mov	x2, x21
 4564ce4: 94ea92df     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4564ce8: 34000e40     	cbz	w0, 0x4564eb0 <_ChromeMain+0x455fc14>
 4564cec: 9100a328     	add	x8, x25, #0x28
 4564cf0: 3980ff29     	ldrsb	x9, [x25, #0x3f]
 4564cf4: b7f81ac9     	tbnz	x9, #0x3f, 0x456504c <_ChromeMain+0x455fdb0>
 4564cf8: f100013f     	cmp	x9, #0x0
 4564cfc: 9a8802e8     	csel	x8, x23, x8, eq
 4564d00: 39405d0a     	ldrb	w10, [x8, #0x17]
 4564d04: 13001d49     	sxtb	w9, w10
 4564d08: f940050b     	ldr	x11, [x8, #0x8]
 4564d0c: 7100013f     	cmp	w9, #0x0
 4564d10: 9a8a416a     	csel	x10, x11, x10, mi
 4564d14: eb15015f     	cmp	x10, x21
 4564d18: 54000141     	b.ne	0x4564d40 <_ChromeMain+0x455faa4>
 4564d1c: f940010a     	ldr	x10, [x8]
 4564d20: 7100013f     	cmp	w9, #0x0
 4564d24: 9a884140     	csel	x0, x10, x8, mi
 4564d28: f9400268     	ldr	x8, [x19]
 4564d2c: 721902df     	tst	w22, #0x80
 4564d30: 9a931101     	csel	x1, x8, x19, ne
 4564d34: aa1503e2     	mov	x2, x21
 4564d38: 94ea92ca     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4564d3c: 34000ba0     	cbz	w0, 0x4564eb0 <_ChromeMain+0x455fc14>
 4564d40: b4000538     	cbz	x24, 0x4564de4 <_ChromeMain+0x455fb48>
 4564d44: f9400f08     	ldr	x8, [x24, #0x18]
 4564d48: f9400509     	ldr	x9, [x8, #0x8]
 4564d4c: 91018137     	add	x23, x9, #0x60
 4564d50: 3941dd2a     	ldrb	w10, [x9, #0x77]
 4564d54: 13001d48     	sxtb	w8, w10
 4564d58: f9403529     	ldr	x9, [x9, #0x68]
 4564d5c: 7100011f     	cmp	w8, #0x0
 4564d60: 9a8a4129     	csel	x9, x9, x10, mi
 4564d64: eb15013f     	cmp	x9, x21
 4564d68: 54000141     	b.ne	0x4564d90 <_ChromeMain+0x455faf4>
 4564d6c: f94002e9     	ldr	x9, [x23]
 4564d70: 7100011f     	cmp	w8, #0x0
 4564d74: 9a974120     	csel	x0, x9, x23, mi
 4564d78: f9400268     	ldr	x8, [x19]
 4564d7c: 721902df     	tst	w22, #0x80
 4564d80: 9a931101     	csel	x1, x8, x19, ne
 4564d84: aa1503e2     	mov	x2, x21
 4564d88: 94ea92b6     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4564d8c: 34000920     	cbz	w0, 0x4564eb0 <_ChromeMain+0x455fc14>
 4564d90: 9100a308     	add	x8, x24, #0x28
 4564d94: 3980ff09     	ldrsb	x9, [x24, #0x3f]
 4564d98: b7f81649     	tbnz	x9, #0x3f, 0x4565060 <_ChromeMain+0x455fdc4>
 4564d9c: f100013f     	cmp	x9, #0x0
 4564da0: 9a8802e8     	csel	x8, x23, x8, eq
 4564da4: 39405d0a     	ldrb	w10, [x8, #0x17]
 4564da8: 13001d49     	sxtb	w9, w10
 4564dac: f940050b     	ldr	x11, [x8, #0x8]
 4564db0: 7100013f     	cmp	w9, #0x0
 4564db4: 9a8a416a     	csel	x10, x11, x10, mi
 4564db8: eb15015f     	cmp	x10, x21
 4564dbc: 54000141     	b.ne	0x4564de4 <_ChromeMain+0x455fb48>
 4564dc0: f940010a     	ldr	x10, [x8]
 4564dc4: 7100013f     	cmp	w9, #0x0
 4564dc8: 9a884140     	csel	x0, x10, x8, mi
 4564dcc: f9400268     	ldr	x8, [x19]
 4564dd0: 721902df     	tst	w22, #0x80
 4564dd4: 9a931101     	csel	x1, x8, x19, ne
 4564dd8: aa1503e2     	mov	x2, x21
 4564ddc: 94ea92a1     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4564de0: 34000680     	cbz	w0, 0x4564eb0 <_ChromeMain+0x455fc14>
 4564de4: b982b688     	ldrsw	x8, [x20, #0x2b4]
 4564de8: 3100051f     	cmn	w8, #0x1
 4564dec: 54001340     	b.eq	0x4565054 <_ChromeMain+0x455fdb8>
 4564df0: f9414289     	ldr	x9, [x20, #0x280]
 4564df4: eb08013f     	cmp	x9, x8
 4564df8: 54000f89     	b.ls	0x4564fe8 <_ChromeMain+0x455fd4c>
 4564dfc: f9413e89     	ldr	x9, [x20, #0x278]
 4564e00: f8687937     	ldr	x23, [x9, x8, lsl #3]
 4564e04: b4000657     	cbz	x23, 0x4564ecc <_ChromeMain+0x455fc30>
 4564e08: f9400ee8     	ldr	x8, [x23, #0x18]
 4564e0c: f9400509     	ldr	x9, [x8, #0x8]
 4564e10: 91018134     	add	x20, x9, #0x60
 4564e14: 3941dd2a     	ldrb	w10, [x9, #0x77]
 4564e18: 13001d48     	sxtb	w8, w10
 4564e1c: f9403529     	ldr	x9, [x9, #0x68]
 4564e20: 7100011f     	cmp	w8, #0x0
 4564e24: 9a8a4129     	csel	x9, x9, x10, mi
 4564e28: eb15013f     	cmp	x9, x21
 4564e2c: 54000141     	b.ne	0x4564e54 <_ChromeMain+0x455fbb8>
 4564e30: f9400289     	ldr	x9, [x20]
 4564e34: 7100011f     	cmp	w8, #0x0
 4564e38: 9a944120     	csel	x0, x9, x20, mi
 4564e3c: f9400268     	ldr	x8, [x19]
 4564e40: 721902df     	tst	w22, #0x80
 4564e44: 9a931101     	csel	x1, x8, x19, ne
 4564e48: aa1503e2     	mov	x2, x21
 4564e4c: 94ea9285     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4564e50: 34000300     	cbz	w0, 0x4564eb0 <_ChromeMain+0x455fc14>
 4564e54: 9100a2e8     	add	x8, x23, #0x28
 4564e58: 3980fee9     	ldrsb	x9, [x23, #0x3f]
 4564e5c: b7f81069     	tbnz	x9, #0x3f, 0x4565068 <_ChromeMain+0x455fdcc>
 4564e60: f100013f     	cmp	x9, #0x0
 4564e64: 9a880288     	csel	x8, x20, x8, eq
 4564e68: 39405d0a     	ldrb	w10, [x8, #0x17]
 4564e6c: 13001d49     	sxtb	w9, w10
 4564e70: f940050b     	ldr	x11, [x8, #0x8]
 4564e74: 7100013f     	cmp	w9, #0x0
 4564e78: 9a8a416a     	csel	x10, x11, x10, mi
 4564e7c: eb15015f     	cmp	x10, x21
 4564e80: 54000261     	b.ne	0x4564ecc <_ChromeMain+0x455fc30>
 4564e84: f940010a     	ldr	x10, [x8]
 4564e88: 7100013f     	cmp	w9, #0x0
 4564e8c: 9a884140     	csel	x0, x10, x8, mi
 4564e90: f9400268     	ldr	x8, [x19]
 4564e94: 721902df     	tst	w22, #0x80
 4564e98: 9a931101     	csel	x1, x8, x19, ne
 4564e9c: aa1503e2     	mov	x2, x21
 4564ea0: 94ea9270     	bl	0x8009860 <_ChromeMain+0x80045c4>
 4564ea4: 7100001f     	cmp	w0, #0x0
 4564ea8: 1a9f17e0     	cset	w0, eq
 4564eac: 14000002     	b	0x4564eb4 <_ChromeMain+0x455fc18>
 4564eb0: 52800020     	mov	w0, #0x1                ; =1
 4564eb4: a9447bfd     	ldp	x29, x30, [sp, #0x40]
 4564eb8: a9434ff4     	ldp	x20, x19, [sp, #0x30]
 4564ebc: a94257f6     	ldp	x22, x21, [sp, #0x20]
 4564ec0: a9415ff8     	ldp	x24, x23, [sp, #0x10]
 4564ec4: a8c567fa     	ldp	x26, x25, [sp], #0x50
 4564ec8: d65f03c0     	ret
 4564ecc: 52800000     	mov	w0, #0x0                ; =0
 4564ed0: 17fffff9     	b	0x4564eb4 <_ChromeMain+0x455fc18>
 4564ed4: b942ba88     	ldr	w8, [x20, #0x2b8]
 4564ed8: 3100051f     	cmn	w8, #0x1
 4564edc: 540007a1     	b.ne	0x4564fd0 <_ChromeMain+0x455fd34>
 4564ee0: 394d2308     	ldrb	w8, [x24, #0x348]
 4564ee4: aa1803f9     	mov	x25, x24
 4564ee8: 34ffedc8     	cbz	w8, 0x4564ca0 <_ChromeMain+0x455fa04>
 4564eec: 14000021     	b	0x4564f70 <_ChromeMain+0x455fcd4>
 4564ef0: b942ba89     	ldr	w9, [x20, #0x2b8]
 4564ef4: 3100053f     	cmn	w9, #0x1
 4564ef8: 54000621     	b.ne	0x4564fbc <_ChromeMain+0x455fd20>
 4564efc: 394d2109     	ldrb	w9, [x8, #0x348]
 4564f00: 34ffe3e9     	cbz	w9, 0x4564b7c <_ChromeMain+0x455f8e0>
 4564f04: 14000009     	b	0x4564f28 <_ChromeMain+0x455fc8c>
 4564f08: 3100051f     	cmn	w8, #0x1
 4564f0c: 54ffe2c1     	b.ne	0x4564b64 <_ChromeMain+0x455f8c8>
 4564f10: 14000058     	b	0x4565070 <_ChromeMain+0x455fdd4>
 4564f14: 3100051f     	cmn	w8, #0x1
 4564f18: 54ffeb81     	b.ne	0x4564c88 <_ChromeMain+0x455f9ec>
 4564f1c: d4200000     	brk	#0
 4564f20: d4400000     	hlt	#0
 4564f24: d4200020     	brk	#0x1
 4564f28: 394ba289     	ldrb	w9, [x20, #0x2e8]
 4564f2c: 34ffe0e9     	cbz	w9, 0x4564b48 <_ChromeMain+0x455f8ac>
 4564f30: b982b689     	ldrsw	x9, [x20, #0x2b4]
 4564f34: 3100053f     	cmn	w9, #0x1
 4564f38: 54000a20     	b.eq	0x456507c <_ChromeMain+0x455fde0>
 4564f3c: f941428a     	ldr	x10, [x20, #0x280]
 4564f40: eb09015f     	cmp	x10, x9
 4564f44: 54000529     	b.ls	0x4564fe8 <_ChromeMain+0x455fd4c>
 4564f48: f9413e8a     	ldr	x10, [x20, #0x278]
 4564f4c: f8697949     	ldr	x9, [x10, x9, lsl #3]
 4564f50: b9443129     	ldr	w9, [x9, #0x430]
 4564f54: 7100093f     	cmp	w9, #0x2
 4564f58: 54ffdf80     	b.eq	0x4564b48 <_ChromeMain+0x455f8ac>
 4564f5c: f9413689     	ldr	x9, [x20, #0x268]
 4564f60: b4000949     	cbz	x9, 0x4565088 <_ChromeMain+0x455fdec>
 4564f64: 39458129     	ldrb	w9, [x9, #0x160]
 4564f68: 3707df09     	tbnz	w9, #0x0, 0x4564b48 <_ChromeMain+0x455f8ac>
 4564f6c: 17ffff04     	b	0x4564b7c <_ChromeMain+0x455f8e0>
 4564f70: 394ba288     	ldrb	w8, [x20, #0x2e8]
 4564f74: 34ffe7c8     	cbz	w8, 0x4564c6c <_ChromeMain+0x455f9d0>
 4564f78: b982b688     	ldrsw	x8, [x20, #0x2b4]
 4564f7c: 3100051f     	cmn	w8, #0x1
 4564f80: 540008a0     	b.eq	0x4565094 <_ChromeMain+0x455fdf8>
 4564f84: f9414289     	ldr	x9, [x20, #0x280]
 4564f88: eb08013f     	cmp	x9, x8
 4564f8c: 540002e9     	b.ls	0x4564fe8 <_ChromeMain+0x455fd4c>
 4564f90: f9413e89     	ldr	x9, [x20, #0x278]
 4564f94: f8687928     	ldr	x8, [x9, x8, lsl #3]
 4564f98: b9443108     	ldr	w8, [x8, #0x430]
 4564f9c: 7100091f     	cmp	w8, #0x2
 4564fa0: 54ffe660     	b.eq	0x4564c6c <_ChromeMain+0x455f9d0>
 4564fa4: f9413688     	ldr	x8, [x20, #0x268]
 4564fa8: b40007c8     	cbz	x8, 0x45650a0 <_ChromeMain+0x455fe04>
 4564fac: 39458108     	ldrb	w8, [x8, #0x160]
 4564fb0: aa1803f9     	mov	x25, x24
 4564fb4: 3707e5c8     	tbnz	w8, #0x0, 0x4564c6c <_ChromeMain+0x455f9d0>
 4564fb8: 17ffff3a     	b	0x4564ca0 <_ChromeMain+0x455fa04>
 4564fbc: 394ba289     	ldrb	w9, [x20, #0x2e8]
 4564fc0: 34ffdc49     	cbz	w9, 0x4564b48 <_ChromeMain+0x455f8ac>
 4564fc4: 394d2109     	ldrb	w9, [x8, #0x348]
 4564fc8: 35ffdc09     	cbnz	w9, 0x4564b48 <_ChromeMain+0x455f8ac>
 4564fcc: 17fffeec     	b	0x4564b7c <_ChromeMain+0x455f8e0>
 4564fd0: 394ba288     	ldrb	w8, [x20, #0x2e8]
 4564fd4: 34ffe4c8     	cbz	w8, 0x4564c6c <_ChromeMain+0x455f9d0>
 4564fd8: 394d2308     	ldrb	w8, [x24, #0x348]
 4564fdc: aa1803f9     	mov	x25, x24
 4564fe0: 35ffe468     	cbnz	w8, 0x4564c6c <_ChromeMain+0x455f9d0>
 4564fe4: 17ffff2f     	b	0x4564ca0 <_ChromeMain+0x455fa04>
 4564fe8: d4200020     	brk	#0x1
 4564fec: f9401909     	ldr	x9, [x8, #0x30]
 4564ff0: b4ffdcc9     	cbz	x9, 0x4564b88 <_ChromeMain+0x455f8ec>
 4564ff4: 9100a100     	add	x0, x8, #0x28
 4564ff8: 17fffee7     	b	0x4564b94 <_ChromeMain+0x455f8f8>
 4564ffc: 97d4169f     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 4565000: 17fffee5     	b	0x4564b94 <_ChromeMain+0x455f8f8>
 4565004: f9401909     	ldr	x9, [x8, #0x30]
 4565008: b4ffe069     	cbz	x9, 0x4564c14 <_ChromeMain+0x455f978>
 456500c: 9100a100     	add	x0, x8, #0x28
 4565010: 17ffff04     	b	0x4564c20 <_ChromeMain+0x455f984>
 4565014: d4200000     	brk	#0
 4565018: d4400000     	hlt	#0
 456501c: d4200020     	brk	#0x1
 4565020: d4200000     	brk	#0
 4565024: d4400000     	hlt	#0
 4565028: d4200020     	brk	#0x1
 456502c: d4200000     	brk	#0
 4565030: d4400000     	hlt	#0
 4565034: d4200020     	brk	#0x1
 4565038: 97d41690     	bl	0x3a6aa78 <_ChromeMain+0x3a657dc>
 456503c: 39405e75     	ldrb	w21, [x19, #0x17]
 4565040: f9400678     	ldr	x24, [x19, #0x8]
 4565044: aa1503f6     	mov	x22, x21
 4565048: 17fffef6     	b	0x4564c20 <_ChromeMain+0x455f984>
 456504c: f9401b29     	ldr	x9, [x25, #0x30]
 4565050: 17ffff2a     	b	0x4564cf8 <_ChromeMain+0x455fa5c>
 4565054: d4200000     	brk	#0
 4565058: d4400000     	hlt	#0
 456505c: d4200020     	brk	#0x1
 4565060: f9401b09     	ldr	x9, [x24, #0x30]
 4565064: 17ffff4e     	b	0x4564d9c <_ChromeMain+0x455fb00>
 4565068: f9401ae9     	ldr	x9, [x23, #0x30]
 456506c: 17ffff7d     	b	0x4564e60 <_ChromeMain+0x455fbc4>
 4565070: d4200000     	brk	#0
 4565074: d4400000     	hlt	#0
 4565078: d4200020     	brk	#0x1
 456507c: d4200000     	brk	#0
 4565080: d4400000     	hlt	#0
 4565084: d4200020     	brk	#0x1
 4565088: d4200000     	brk	#0
 456508c: d4400000     	hlt	#0
 4565090: d4200020     	brk	#0x1
 4565094: d4200000     	brk	#0
 4565098: d4400000     	hlt	#0
 456509c: d4200020     	brk	#0x1
 45650a0: d4200000     	brk	#0
 45650a4: d4400000     	hlt	#0
 45650a8: d4200020     	brk	#0x1
 45650ac: a9be4ff4     	stp	x20, x19, [sp, #-0x20]!
 45650b0: a9017bfd     	stp	x29, x30, [sp, #0x10]
 45650b4: 910043fd     	add	x29, sp, #0x10
 45650b8: aa0003f3     	mov	x19, x0
 45650bc: d004fca8     	adrp	x8, 0xe4fb000 <dyld_stub_binder+0xe4fb000>
 45650c0: 912ce108     	add	x8, x8, #0xb38
 45650c4: f8010408     	str	x8, [x0], #0x10
 45650c8: 974af640     	bl	0x18229c8 <_ChromeMain+0x181d72c>
 45650cc: f9400660     	ldr	x0, [x19, #0x8]
 45650d0: 925e7408     	and	x8, x0, #0xfffffffc00000000
 45650d4: b0053269     	adrp	x9, 0xebb2000 <dyld_stub_binder+0xebb2000>
 45650d8: f9404529     	ldr	x9, [x9, #0x88]
 45650dc: eb09011f     	cmp	x8, x9
 45650e0: 54000041     	b.ne	0x45650e8 <_ChromeMain+0x455fe4c>
 45650e4: 96eaf656     	bl	0x22a3c <_ChromeMain+0x1d7a0>
 45650e8: f900067f     	str	xzr, [x19, #0x8]
 45650ec: aa1303e0     	mov	x0, x19
 45650f0: a9417bfd     	ldp	x29, x30, [sp, #0x10]
 45650f4: a8c24ff4     	ldp	x20, x19, [sp], #0x20
 45650f8: d65f03c0     	ret
 45650fc: 00000000     	udf	#0x0
