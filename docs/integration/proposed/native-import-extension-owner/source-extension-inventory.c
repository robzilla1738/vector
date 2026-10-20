
/* WARNING: Removing unreachable block (ram,0x04259ed0) */

void entry(undefined8 *param_1,undefined8 param_2)

{
  ulong uVar1;
  undefined8 ***pppuVar2;
  int iVar3;
  long lVar4;
  byte bVar5;
  uint uVar6;
  undefined8 local_270;
  ulong uStack_268;
  ulong local_260;
  ulong local_258;
  undefined8 **local_250;
  long lStack_248;
  undefined8 local_240;
  undefined8 local_238;
  undefined8 uStack_230;
  ulong local_228;
  undefined8 local_220;
  ulong uStack_218;
  undefined8 local_210;
  undefined8 **local_200;
  ulong uStack_1f8;
  ulong local_1f0;
  undefined8 uStack_1e8;
  undefined8 uStack_1e0;
  undefined8 uStack_1d8;
  undefined8 local_1d0;
  undefined8 uStack_1c8;
  undefined8 uStack_1c0;
  undefined8 uStack_1b8;
  undefined8 local_1b0;
  undefined8 uStack_1a8;
  undefined8 uStack_1a0;
  undefined8 uStack_198;
  undefined8 local_190;
  undefined8 uStack_188;
  undefined8 uStack_180;
  undefined8 uStack_178;
  undefined8 local_170;
  undefined8 uStack_168;
  undefined8 uStack_160;
  undefined8 uStack_158;
  undefined8 **local_150;
  ulong uStack_148;
  undefined8 local_140;
  undefined8 **local_130;
  ulong uStack_128;
  undefined8 local_120;
  undefined8 local_110;
  undefined8 uStack_108;
  undefined8 local_100;
  undefined8 uStack_f8;
  undefined8 uStack_f0;
  undefined8 uStack_e8;
  undefined8 local_e0;
  undefined8 uStack_d8;
  undefined8 uStack_d0;
  undefined8 uStack_c8;
  undefined8 local_c0;
  undefined8 uStack_b8;
  undefined8 uStack_b0;
  undefined8 uStack_a8;
  undefined8 local_a0;
  undefined8 uStack_98;
  undefined8 uStack_90;
  undefined8 uStack_88;
  undefined8 local_80;
  undefined8 uStack_78;
  undefined8 uStack_70;
  undefined8 uStack_68;
  undefined8 local_58;
  undefined8 uStack_50;
  undefined8 local_48;
  
  param_1[2] = 0;
  param_1[1] = 0;
  *param_1 = param_1 + 1;
  local_58 = 0;
  uStack_50 = 0;
  local_48 = 0;
  func_0x01699414(&local_58,param_2,0xdb1f4fc,10);
  uStack_78 = 0;
  local_80 = 0;
  uStack_68 = 0;
  uStack_70 = 0;
  uStack_98 = 0;
  local_a0 = 0;
  uStack_88 = 0;
  uStack_90 = 0;
  uStack_b8 = 0;
  local_c0 = 0;
  uStack_a8 = 0;
  uStack_b0 = 0;
  uStack_d8 = 0;
  local_e0 = 0;
  uStack_c8 = 0;
  uStack_d0 = 0;
  uStack_f8 = 0;
  local_100 = 0;
  uStack_e8 = 0;
  uStack_f0 = 0;
  uStack_108 = 0;
  local_110 = 0;
  local_200 = (undefined8 ***)0x0;
  uStack_1f8 = 0;
  local_1f0 = 0;
  func_0x01fa1500(&local_110,&local_58,0,2,&local_200,0,0);
  local_130 = (undefined8 ***)0x0;
  uStack_128 = 0;
  local_120 = 0;
  func_0x006ee1a0(&local_130);
  uVar1 = uStack_128;
  if (-1 < (long)local_120) {
    uVar1 = (ulong)local_120._7_1_;
  }
  bVar5 = local_120._7_1_;
  if (uVar1 != 0) {
    do {
      local_150 = (undefined8 ***)0x0;
      uStack_148 = 0;
      local_140 = 0;
      func_0x0147166c(&local_200,&local_130);
      uVar1 = uStack_1f8;
      pppuVar2 = (undefined8 ***)local_200;
      if (-1 < (long)local_1f0) {
        uVar1 = local_1f0 >> 0x38;
        pppuVar2 = &local_200;
      }
      iVar3 = func_0x0103eb5c(pppuVar2,uVar1);
      if (iVar3 == 0) {
        local_150 = (undefined8 ***)0x0;
        uStack_148 = 0;
        local_140 = 0;
LAB_04259cd4:
        if ((long)local_1f0 < 0) {
          func_0x00008eb8(local_200,local_1f0 & 0x7fffffffffffffff);
        }
      }
      else {
        if ((long)local_1f0 < 0) {
          func_0x00018218(&local_150,local_200,uStack_1f8);
          goto LAB_04259cd4;
        }
        uStack_148 = uStack_1f8;
        local_150 = local_200;
        local_140 = local_1f0;
      }
      uVar6 = (uint)(char)local_140._7_1_;
      uVar1 = uStack_148;
      if (-1 < (int)uVar6) {
        uVar1 = (ulong)local_140._7_1_;
      }
      if (uVar1 != 0) {
        uStack_168 = 0;
        local_170 = 0;
        uStack_158 = 0;
        uStack_160 = 0;
        uStack_188 = 0;
        local_190 = 0;
        uStack_178 = 0;
        uStack_180 = 0;
        uStack_1a8 = 0;
        local_1b0 = 0;
        uStack_198 = 0;
        uStack_1a0 = 0;
        uStack_1c8 = 0;
        local_1d0 = 0;
        uStack_1b8 = 0;
        uStack_1c0 = 0;
        uStack_1e8 = 0;
        local_1f0 = 0;
        uStack_1d8 = 0;
        uStack_1e0 = 0;
        uStack_1f8 = 0;
        local_200 = (undefined8 ***)0x0;
        local_270 = 0;
        uStack_268 = 0;
        local_260 = 0;
        func_0x01fa1500(&local_200,&local_130,0,2,&local_270,0,0);
        local_220 = 0;
        uStack_218 = 0;
        local_210 = 0;
        func_0x006ee1a0(&local_220,&local_200);
LAB_04259dd8:
        uVar6 = (uint)(char)local_210._7_1_;
        uVar1 = uStack_218;
        if (-1 < (int)uVar6) {
          uVar1 = (ulong)local_210._7_1_;
        }
        if (uVar1 == 0) goto LAB_04259c2c;
        local_238 = 0;
        uStack_230 = 0;
        local_228 = 0;
        func_0x01699414(&local_238,&local_220,0xdb1f507,0xd);
        local_250 = (undefined8 ***)0x0;
        lStack_248 = 0;
        local_240 = 0;
        iVar3 = func_0x01f92b88(&local_238,&local_250,0xffffffffffffffff);
        if (iVar3 == 0) {
LAB_04259d94:
          if ((long)local_240 < 0) {
            func_0x00008eb8(local_250,local_240 & 0x7fffffffffffffff);
          }
          if ((long)local_228 < 0) {
            func_0x00008eb8(local_238,local_228 & 0x7fffffffffffffff);
          }
          func_0x006ee1a0(&local_270,&local_200);
          if ((long)local_210 < 0) {
            func_0x00008eb8(local_220,local_210 & 0x7fffffffffffffff);
          }
          local_210 = local_260;
          uStack_218 = uStack_268;
          local_220 = local_270;
          goto LAB_04259dd8;
        }
        uStack_268 = 0;
        local_270 = 0;
        local_258 = 0;
        local_260 = 0;
        pppuVar2 = (undefined8 ***)local_250;
        if (-1 < (long)local_240._7_1_) {
          pppuVar2 = &local_250;
        }
        lVar4 = lStack_248;
        if (-1 < (long)local_240) {
          lVar4 = (long)local_240._7_1_;
        }
        func_0x01bc1f3c(&local_270,pppuVar2,lVar4,0,200);
        if ((char)local_258 == '\0') goto LAB_04259d94;
        lVar4 = func_0x0095e840(&local_270,0xda21894,5);
        if (lVar4 == 0) {
          if ((local_258 & 1) != 0) {
            func_0x0095e480(&local_270);
          }
          goto LAB_04259d94;
        }
        func_0x00f0e580(param_1,param_1,&local_150);
        if ((local_258 & 1) != 0) {
          func_0x0095e480(&local_270);
        }
        if ((long)local_240 < 0) {
          func_0x00008eb8(local_250,local_240 & 0x7fffffffffffffff);
        }
        if ((long)local_228 < 0) {
          func_0x00008eb8(local_238,local_228 & 0x7fffffffffffffff);
        }
        uVar6 = (uint)local_210._7_1_;
LAB_04259c2c:
        if ((uVar6 >> 7 & 1) != 0) {
          func_0x00008eb8(local_220,local_210 & 0x7fffffffffffffff);
        }
        func_0x01f713d0(&local_200);
        uVar6 = (uint)local_140._7_1_;
      }
      if ((uVar6 >> 7 & 1) != 0) {
        func_0x00008eb8(local_150,local_140 & 0x7fffffffffffffff);
      }
      func_0x006ee1a0(&local_200,&local_110);
      if ((long)local_120 < 0) {
        func_0x00008eb8(local_130,local_120 & 0x7fffffffffffffff);
      }
      local_120 = local_1f0;
      uStack_128 = uStack_1f8;
      local_130 = local_200;
      bVar5 = (byte)(local_1f0 >> 0x38);
      uVar1 = uStack_1f8;
      if (-1 < (long)local_1f0) {
        uVar1 = local_1f0 >> 0x38;
      }
    } while (uVar1 != 0);
  }
  if ((char)bVar5 < '\0') {
    func_0x00008eb8(local_130,local_120 & 0x7fffffffffffffff);
  }
  func_0x01f713d0(&local_110);
  return;
}


