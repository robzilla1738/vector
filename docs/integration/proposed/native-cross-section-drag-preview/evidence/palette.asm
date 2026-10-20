
/Users/rcourson/Documents/Vibe/aux-wt/prefs-reuse/out/prefs-reuse-analysis/Aside-Framework-arm64:	file format mach-o arm64

Disassembly of section __TEXT,__text:

000000000000529c <_ChromeMain>:
 35e6d40:      	sub	sp, sp, #0xb0
 35e6d44:      	stp	x28, x27, [sp, #0x50]
 35e6d48:      	stp	x26, x25, [sp, #0x60]
 35e6d4c:      	stp	x24, x23, [sp, #0x70]
 35e6d50:      	stp	x22, x21, [sp, #0x80]
 35e6d54:      	stp	x20, x19, [sp, #0x90]
 35e6d58:      	stp	x29, x30, [sp, #0xa0]
 35e6d5c:      	add	x29, sp, #0xa0
 35e6d60:      	mov	x20, x1
 35e6d64:      	mov	x19, x0
 35e6d68:      	mov	w23, #0xfafa            ; =64250
 35e6d6c:      	movk	w23, #0x14fa, lsl #16
 35e6d70:      	cmp	w1, #0x0
 35e6d74:      	csinv	w21, w23, wzr, ne
 35e6d78:      	mov	w22, #0x1               ; =1
 35e6d7c:      	strb	w22, [sp, #0x30]
 35e6d80:      	mov	w0, #0x28               ; =40
 35e6d84:      	bl	0xf368 <_ChromeMain+0xa0cc>
 35e6d88:      	str	w22, [x0]
 35e6d8c:      	adrp	x25, 0x2468000 <_ChromeMain+0x2462d64>
 35e6d90:      	add	x25, x25, #0x740
 35e6d94:      	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e6d98:      	add	x8, x8, #0x600
 35e6d9c:      	stp	x25, x8, [x0, #0x8]
 35e6da0:      	adrp	x26, 0x255d000 <_ChromeMain+0x2557d64>
 35e6da4:      	add	x26, x26, #0xb00
 35e6da8:      	str	x26, [x0, #0x18]
 35e6dac:      	str	w21, [x0, #0x24]
 35e6db0:      	str	x0, [sp, #0x28]
 35e6db4:      	stp	xzr, xzr, [sp, #0x40]
 35e6db8:      	str	xzr, [sp, #0x38]
 35e6dbc:      	mov	w0, #0x10               ; =16
 35e6dc0:      	bl	0xf368 <_ChromeMain+0xa0cc>
 35e6dc4:      	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e6dc8:      	mov	x21, x0
 35e6dcc:      	add	x1, sp, #0x28
 35e6dd0:      	bl	0xed750 <_ChromeMain+0xe84b4>
 35e6dd4:      	ldp	x22, x28, [sp, #0x38]
 35e6dd8:      	sub	x27, x0, x28, lsl #4
 35e6ddc:      	lsl	x24, x28, #4
 35e6de0:      	cbnz	x24, 0x35ed154 <_ChromeMain+0x35e7eb8>
 35e6de4:      	neg	x8, x28, lsl #4
 35e6de8:      	mov	w9, #0x10               ; =16
 35e6dec:      	sub	x8, x9, x8
 35e6df0:      	asr	x8, x8, #4
 35e6df4:      	stp	x27, x8, [sp, #0x38]
 35e6df8:      	ldr	x8, [sp, #0x48]
 35e6dfc:      	mov	w9, #0x1                ; =1
 35e6e00:      	str	x9, [sp, #0x48]
 35e6e04:      	cbnz	x22, 0x35ee7fc <_ChromeMain+0x35e9560>
 35e6e08:      	add	x8, x21, #0x10
 35e6e0c:      	subs	x8, x8, x27
 35e6e10:      	asr	x8, x8, #4
 35e6e14:      	str	x8, [sp, #0x40]
 35e6e18:      	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e6e1c:      	mov	x0, x19
 35e6e20:      	mov	w1, #0xd6               ; =214
 35e6e24:      	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e6e28:      	add	x1, sp, #0x38
 35e6e2c:      	bl	0x170010 <_ChromeMain+0x16ad74>
 35e6e30:      	add	x0, sp, #0x38
 35e6e34:      	bl	0x118c14 <_ChromeMain+0x113978>
 35e6e38:      	ldr	x0, [sp, #0x28]
 35e6e3c:      	cbnz	x0, 0x35eb6c4 <_ChromeMain+0x35e6428>
 35e6e40:      	mov	w9, #0xfafa             ; =64250
 35e6e44:      	movk	w9, #0x26fa, lsl #16
 35e6e48:      	mov	w8, #0xa0a              ; =2570
 35e6e4c:      	movk	w8, #0x1a0a, lsl #16
 35e6e50:      	cmp	w20, #0x0
 35e6e54:      	csel	w22, w9, w8, ne
 35e6e58:      	mov	w21, #0x1               ; =1
 35e6e5c:      	strb	w21, [sp, #0x30]
 35e6e60:      	mov	w0, #0x28               ; =40
 35e6e64:      	bl	0xf368 <_ChromeMain+0xa0cc>
 35e6e68:      	str	w21, [x0]
 35e6e6c:      	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e6e70:      	add	x8, x8, #0x600
 35e6e74:      	stp	x25, x8, [x0, #0x8]
 35e6e78:      	str	x26, [x0, #0x18]
 35e6e7c:      	str	w22, [sp, #0x20]
 35e6e80:      	str	w22, [x0, #0x24]
 35e6e84:      	str	x0, [sp, #0x28]
 35e6e88:      	stp	xzr, xzr, [sp, #0x40]
 35e6e8c:      	str	xzr, [sp, #0x38]
 35e6e90:      	mov	w0, #0x10               ; =16
 35e6e94:      	bl	0xf368 <_ChromeMain+0xa0cc>
 35e6e98:      	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e6e9c:      	mov	x21, x0
 35e6ea0:      	add	x1, sp, #0x28
 35e6ea4:      	bl	0xed750 <_ChromeMain+0xe84b4>
 35e6ea8:      	ldp	x22, x28, [sp, #0x38]
 35e6eac:      	sub	x27, x0, x28, lsl #4
 35e6eb0:      	lsl	x24, x28, #4
 35e6eb4:      	cbnz	x24, 0x35ed1c8 <_ChromeMain+0x35e7f2c>
 35e6eb8:      	neg	x8, x28, lsl #4
 35e6ebc:      	mov	w9, #0x10               ; =16
 35e6ec0:      	sub	x8, x9, x8
 35e6ec4:      	asr	x8, x8, #4
 35e6ec8:      	stp	x27, x8, [sp, #0x38]
 35e6ecc:      	ldr	x8, [sp, #0x48]
 35e6ed0:      	mov	w9, #0x1                ; =1
 35e6ed4:      	str	x9, [sp, #0x48]
 35e6ed8:      	cbnz	x22, 0x35ee810 <_ChromeMain+0x35e9574>
 35e6edc:      	add	x8, x21, #0x10
 35e6ee0:      	subs	x8, x8, x27
 35e6ee4:      	asr	x8, x8, #4
 35e6ee8:      	str	x8, [sp, #0x40]
 35e6eec:      	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e6ef0:      	mov	x0, x19
 35e6ef4:      	mov	w1, #0xd7               ; =215
 35e6ef8:      	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e6efc:      	add	x1, sp, #0x38
 35e6f00:      	bl	0x170010 <_ChromeMain+0x16ad74>
 35e6f04:      	add	x0, sp, #0x38
 35e6f08:      	bl	0x118c14 <_ChromeMain+0x113978>
 35e6f0c:      	ldr	x0, [sp, #0x28]
 35e6f10:      	cbnz	x0, 0x35eb6e0 <_ChromeMain+0x35e6444>
 35e6f14:      	mov	w9, #0xa0a              ; =2570
 35e6f18:      	movk	w9, #0x260a, lsl #16
 35e6f1c:      	mov	w8, #0xfafa             ; =64250
 35e6f20:      	movk	w8, #0x33fa, lsl #16
 35e6f24:      	cmp	w20, #0x0
 35e6f28:      	csel	w21, w8, w9, ne
 35e6f2c:      	mov	w22, #0x1               ; =1
 35e6f30:      	strb	w22, [sp, #0x30]
 35e6f34:      	mov	w0, #0x28               ; =40
 35e6f38:      	bl	0xf368 <_ChromeMain+0xa0cc>
 35e6f3c:      	str	w22, [x0]
 35e6f40:      	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e6f44:      	add	x8, x8, #0x600
 35e6f48:      	stp	x25, x8, [x0, #0x8]
 35e6f4c:      	str	x26, [x0, #0x18]
 35e6f50:      	str	w21, [x0, #0x24]
 35e6f54:      	str	x0, [sp, #0x28]
 35e6f58:      	stp	xzr, xzr, [sp, #0x40]
 35e6f5c:      	str	xzr, [sp, #0x38]
 35e6f60:      	mov	w0, #0x10               ; =16
 35e6f64:      	bl	0xf368 <_ChromeMain+0xa0cc>
 35e6f68:      	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e6f6c:      	mov	x21, x0
 35e6f70:      	add	x1, sp, #0x28
 35e6f74:      	bl	0xed750 <_ChromeMain+0xe84b4>
 35e6f78:      	ldp	x22, x28, [sp, #0x38]
 35e6f7c:      	sub	x27, x0, x28, lsl #4
 35e6f80:      	lsl	x24, x28, #4
 35e6f84:      	cbnz	x24, 0x35ed23c <_ChromeMain+0x35e7fa0>
 35e6f88:      	neg	x8, x28, lsl #4
 35e6f8c:      	mov	w9, #0x10               ; =16
 35e6f90:      	sub	x8, x9, x8
 35e6f94:      	asr	x8, x8, #4
 35e6f98:      	stp	x27, x8, [sp, #0x38]
 35e6f9c:      	ldr	x8, [sp, #0x48]
 35e6fa0:      	mov	w9, #0x1                ; =1
 35e6fa4:      	str	x9, [sp, #0x48]
 35e6fa8:      	cbnz	x22, 0x35ee824 <_ChromeMain+0x35e9588>
 35e6fac:      	add	x8, x21, #0x10
 35e6fb0:      	subs	x8, x8, x27
 35e6fb4:      	asr	x8, x8, #4
 35e6fb8:      	str	x8, [sp, #0x40]
 35e6fbc:      	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e6fc0:      	mov	w21, #0xd8              ; =216
 35e6fc4:      	mov	x0, x19
 35e6fc8:      	mov	w1, #0xd8               ; =216
 35e6fcc:      	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e6fd0:      	add	x1, sp, #0x38
 35e6fd4:      	bl	0x170010 <_ChromeMain+0x16ad74>
 35e6fd8:      	add	x0, sp, #0x38
 35e6fdc:      	bl	0x118c14 <_ChromeMain+0x113978>
 35e6fe0:      	ldr	x0, [sp, #0x28]
 35e6fe4:      	cbnz	x0, 0x35eb6fc <_ChromeMain+0x35e6460>
 35e6fe8:      	mov	w22, #0x1               ; =1
 35e6fec:      	strb	w22, [sp, #0x30]
 35e6ff0:      	mov	w0, #0x28               ; =40
 35e6ff4:      	bl	0xf368 <_ChromeMain+0xa0cc>
 35e6ff8:      	str	w22, [x0]
 35e6ffc:      	adrp	x8, 0x3a8b000 <_ChromeMain+0x3a85d64>
 35e7000:      	add	x8, x8, #0xa98
 35e7004:      	adrp	x9, 0x101f000 <_ChromeMain+0x1019d64>
 35e7008:      	add	x9, x9, #0x600
 35e700c:      	stp	x8, x9, [x0, #0x8]
 35e7010:      	str	x26, [x0, #0x18]
 35e7014:      	str	w21, [x0, #0x24]
 35e7018:      	str	x0, [sp, #0x28]
 35e701c:      	stp	xzr, xzr, [sp, #0x40]
 35e7020:      	str	xzr, [sp, #0x38]
 35e7024:      	mov	w0, #0x10               ; =16
 35e7028:      	bl	0xf368 <_ChromeMain+0xa0cc>
 35e702c:      	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e7030:      	mov	x21, x0
 35e7034:      	add	x1, sp, #0x28
 35e7038:      	bl	0xed750 <_ChromeMain+0xe84b4>
 35e703c:      	ldp	x22, x28, [sp, #0x38]
 35e7040:      	sub	x27, x0, x28, lsl #4
 35e7044:      	lsl	x24, x28, #4
 35e7048:      	cbnz	x24, 0x35ed2b0 <_ChromeMain+0x35e8014>
 35e704c:      	neg	x8, x28, lsl #4
 35e7050:      	mov	w9, #0x10               ; =16
 35e7054:      	sub	x8, x9, x8
 35e7058:      	asr	x8, x8, #4
 35e705c:      	stp	x27, x8, [sp, #0x38]
 35e7060:      	ldr	x8, [sp, #0x48]
 35e7064:      	mov	w9, #0x1                ; =1
 35e7068:      	str	x9, [sp, #0x48]
 35e706c:      	cbnz	x22, 0x35ee838 <_ChromeMain+0x35e959c>
 35e7070:      	add	x8, x21, #0x10
 35e7074:      	subs	x8, x8, x27
 35e7078:      	asr	x8, x8, #4
 35e707c:      	str	x8, [sp, #0x40]
 35e7080:      	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e7084:      	mov	x0, x19
 35e7088:      	mov	w1, #0xd9               ; =217
 35e708c:      	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e7090:      	add	x1, sp, #0x38
 35e7094:      	bl	0x170010 <_ChromeMain+0x16ad74>
 35e7098:      	add	x0, sp, #0x38
 35e709c:      	bl	0x118c14 <_ChromeMain+0x113978>
 35e70a0:      	ldr	x0, [sp, #0x28]
 35e70a4:      	cbnz	x0, 0x35eb718 <_ChromeMain+0x35e647c>
 35e70a8:      	mov	w9, #0xfafa             ; =64250
 35e70ac:      	movk	w9, #0xffa, lsl #16
 35e70b0:      	mov	w8, #-0x26000001        ; =-637534209
 35e70b4:      	cmp	w20, #0x0
 35e70b8:      	csel	w21, w9, w8, ne
 35e70bc:      	mov	w22, #0x1               ; =1
 35e70c0:      	strb	w22, [sp, #0x30]
 35e70c4:      	mov	w0, #0x28               ; =40
 35e70c8:      	bl	0xf368 <_ChromeMain+0xa0cc>
 35e70cc:      	str	w22, [x0]
 35e70d0:      	adrp	x8, 0x101f000 <_ChromeMain+0x1019d64>
 35e70d4:      	add	x8, x8, #0x600
 35e70d8:      	stp	x25, x8, [x0, #0x8]
 35e70dc:      	str	x26, [x0, #0x18]
 35e70e0:      	str	w21, [x0, #0x24]
 35e70e4:      	str	x0, [sp, #0x28]
 35e70e8:      	stp	xzr, xzr, [sp, #0x40]
 35e70ec:      	str	xzr, [sp, #0x38]
 35e70f0:      	mov	w0, #0x10               ; =16
 35e70f4:      	bl	0xf368 <_ChromeMain+0xa0cc>
 35e70f8:      	cbz	x0, 0x35eef18 <_ChromeMain+0x35e9c7c>
 35e70fc:      	mov	x21, x0
 35e7100:      	add	x1, sp, #0x28
 35e7104:      	bl	0xed750 <_ChromeMain+0xe84b4>
 35e7108:      	ldp	x22, x28, [sp, #0x38]
 35e710c:      	sub	x27, x0, x28, lsl #4
 35e7110:      	lsl	x24, x28, #4
 35e7114:      	cbnz	x24, 0x35ed324 <_ChromeMain+0x35e8088>
 35e7118:      	neg	x8, x28, lsl #4
 35e711c:      	mov	w9, #0x10               ; =16
 35e7120:      	sub	x8, x9, x8
 35e7124:      	asr	x8, x8, #4
 35e7128:      	stp	x27, x8, [sp, #0x38]
 35e712c:      	ldr	x8, [sp, #0x48]
 35e7130:      	mov	w9, #0x1                ; =1
 35e7134:      	str	x9, [sp, #0x48]
 35e7138:      	cbnz	x22, 0x35ee84c <_ChromeMain+0x35e95b0>
 35e713c:      	add	x8, x21, #0x10
 35e7140:      	subs	x8, x8, x27
 35e7144:      	asr	x8, x8, #4
 35e7148:      	str	x8, [sp, #0x40]
 35e714c:      	b.eq	0x35eef18 <_ChromeMain+0x35e9c7c>
 35e7150:      	mov	x0, x19
 35e7154:      	mov	w1, #0xda               ; =218
 35e7158:      	bl	0x334a6c <_ChromeMain+0x32f7d0>
 35e715c:      	add	x1, sp, #0x38
 35e7160:      	bl	0x170010 <_ChromeMain+0x16ad74>
 35e7164:      	add	x0, sp, #0x38
 35e7168:      	bl	0x118c14 <_ChromeMain+0x113978>
 35e716c:      	ldr	x0, [sp, #0x28]
 35e7170:      	cbnz	x0, 0x35eb734 <_ChromeMain+0x35e6498>
