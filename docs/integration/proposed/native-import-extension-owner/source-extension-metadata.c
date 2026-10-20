
/* WARNING: Removing unreachable block (ram,0x04259fac) */
/* WARNING: Removing unreachable block (ram,0x04259fe4) */

void entry(long *param_1,undefined8 param_2,long param_3)

{
  undefined8 ****ppppuVar1;
  ulong uVar2;
  long *plVar3;
  ulong uVar4;
  ulong uVar5;
  char cVar6;
  code *pcVar7;
  int iVar8;
  uint uVar9;
  undefined8 *puVar10;
  long lVar11;
  undefined8 *puVar12;
  undefined8 *puVar13;
  long *plVar14;
  long lVar15;
  undefined8 *puVar16;
  undefined8 local_1f0;
  undefined8 uStack_1e8;
  ulong local_1e0;
  undefined8 uStack_1d8;
  undefined8 uStack_1d0;
  ulong local_1c8;
  undefined8 local_1c0;
  undefined8 uStack_1b8;
  undefined8 uStack_1b0;
  undefined8 uStack_1a8;
  undefined8 local_1a0;
  undefined8 uStack_198;
  undefined8 uStack_190;
  undefined8 uStack_188;
  undefined8 local_180 [3];
  undefined1 auStack_168 [8];
  undefined8 local_160;
  undefined8 uStack_158;
  ulong local_150;
  undefined8 uStack_148;
  undefined8 local_140;
  undefined8 uStack_138;
  undefined8 uStack_130;
  undefined8 uStack_128;
  undefined8 local_120;
  undefined8 uStack_118;
  undefined8 uStack_110;
  undefined8 uStack_108;
  undefined8 local_100;
  undefined8 local_f8;
  undefined8 auStack_f0 [2];
  undefined8 local_e0;
  undefined8 uStack_d8;
  undefined8 uStack_d0;
  undefined8 local_c8;
  undefined8 ***local_b8;
  long lStack_b0;
  undefined8 local_a8;
  undefined8 local_a0;
  undefined8 uStack_98;
  undefined8 local_90;
  undefined8 **local_88;
  undefined1 *puStack_80;
  long *local_78;
  undefined8 *local_70 [2];
  
  *param_1 = 0;
  param_1[1] = 0;
  param_1[2] = 0;
  local_a0 = 0;
  uStack_98 = 0;
  local_90 = 0;
  func_0x01699414(&local_a0,param_2,0xdb1f515,0x12);
  local_b8 = (undefined8 ****)0x0;
  lStack_b0 = 0;
  local_a8 = 0;
  iVar8 = func_0x01f92b88(&local_a0,&local_b8,0xffffffffffffffff);
  if (iVar8 != 0) {
    uStack_d8 = 0;
    local_e0 = 0;
    local_c8 = 0;
    uStack_d0 = 0;
    ppppuVar1 = (undefined8 ****)local_b8;
    if (-1 < (long)local_a8._7_1_) {
      ppppuVar1 = &local_b8;
    }
    lVar15 = lStack_b0;
    if (-1 < local_a8) {
      lVar15 = (long)local_a8._7_1_;
    }
    func_0x01bc1f3c(&local_e0,ppppuVar1,lVar15,0,200);
    if (((((char)local_c8 != '\0') &&
         (puVar10 = (undefined8 *)func_0x0046ad40(&local_e0,0xdb1f528,0x13),
         puVar10 != (undefined8 *)0x0)) && (*(char *)(puVar10 + 3) == '\x06')) &&
       ((puVar10[1] & 0x7ffffffffffffff) != 0)) {
      puVar16 = (undefined8 *)*puVar10;
      puVar10 = puVar16 + puVar10[1] * 4;
      do {
        lVar15 = puVar16[3];
        if (*(char *)(lVar15 + 0x18) == '\x06') {
          plVar14 = *(long **)(param_3 + 8);
          if (plVar14 != (long *)0x0) {
            cVar6 = *(char *)((long)puVar16 + 0x17);
            puVar12 = (undefined8 *)*puVar16;
            if (-1 < (long)cVar6) {
              puVar12 = puVar16;
            }
            uVar2 = puVar16[1];
            if (-1 < cVar6) {
              uVar2 = (long)cVar6;
            }
            do {
              while( true ) {
                cVar6 = *(char *)((long)plVar14 + 0x37);
                plVar3 = (long *)plVar14[4];
                if (-1 < (long)cVar6) {
                  plVar3 = plVar14 + 4;
                }
                uVar4 = plVar14[5];
                if (-1 < cVar6) {
                  uVar4 = (long)cVar6;
                }
                uVar5 = uVar4;
                if (uVar2 <= uVar4) {
                  uVar5 = uVar2;
                }
                iVar8 = func_0x08009860(puVar12,plVar3,uVar5);
                if (iVar8 != 0) break;
                if (uVar2 == uVar4) {
                  if (plVar14 != (long *)(param_3 + 8)) goto LAB_0425a05c;
                  goto LAB_0425a0d8;
                }
                if (uVar2 < uVar4) goto LAB_0425a040;
LAB_0425a0d0:
                plVar14 = (long *)plVar14[1];
                if (plVar14 == (long *)0x0) goto LAB_0425a0d8;
              }
              if (-1 < iVar8) goto LAB_0425a0d0;
LAB_0425a040:
              plVar14 = (long *)*plVar14;
            } while (plVar14 != (long *)0x0);
          }
LAB_0425a0d8:
          lVar11 = func_0x0095e840(lVar15,0xd8c1e79,8);
          if ((lVar11 == 0) || (lVar11 = func_0x0095e840(lVar11,0xda21894,5), lVar11 == 0)) {
            uStack_158 = 0;
            local_160 = 0;
            uStack_148 = 0;
            local_150 = 0;
            local_140 = 0xffffffff00000000;
            uStack_138 = 0xffffffff00000000;
            uStack_130 = 0xffffffff00000000;
            uStack_128 = 0xffffffff00000000;
            local_120 = 0xffffffff00000000;
            uStack_118 = 0xffffffff00000000;
            uStack_110 = 0xffffffff00000000;
            uStack_108 = 0xffffffff00000000;
            local_100 = 0;
            local_f8 = 0;
            auStack_f0[0] = 0;
            puVar12 = (undefined8 *)func_0x0046ad40(lVar15,0xdb1f53c,0x13);
            if ((puVar12 == (undefined8 *)0x0) || (*(char *)(puVar12 + 3) != '\x04')) {
              uVar9 = func_0x014e14c0(lVar15,0xdb1f550,0xd);
              if (((uVar9 ^ 0xffffffff) & 0x101) == 0) goto LAB_0425a17c;
            }
            else {
              local_180[0] = 0;
              uStack_198 = 0;
              local_1a0 = 0;
              uStack_188 = 0;
              uStack_190 = 0;
              uStack_1b8 = 0;
              local_1c0 = 0;
              uStack_1a8 = 0;
              uStack_1b0 = 0;
              uStack_1d8 = 0;
              local_1e0 = 0;
              local_1c8 = 0;
              uStack_1d0 = 0;
              uStack_1e8 = 0;
              local_1f0 = 0;
              lVar15 = (long)*(char *)((long)puVar12 + 0x17);
              puVar13 = puVar12;
              if (lVar15 < 0) {
                puVar13 = (undefined8 *)*puVar12;
                lVar15 = puVar12[1];
              }
              func_0x003701d4(&local_1f0,puVar13,lVar15);
              if ((char)uStack_1d8 == '\0') {
                func_0x00027cb8(local_180,0);
                func_0x00027c78(&uStack_1d0);
              }
              else {
                func_0x005f9ae0(&local_160,&local_1f0);
                func_0x00027cb8(local_180,0);
                func_0x00027c78(&uStack_1d0);
                if ((long)local_1e0 < 0) {
                  func_0x00008eb8(local_1f0,local_1e0 & 0x7fffffffffffffff);
                }
LAB_0425a17c:
                if (*(char *)((long)puVar16 + 0x17) < '\0') {
                  func_0x00018218(&local_1f0,*puVar16,puVar16[1]);
                }
                else {
                  uStack_1e8 = puVar16[1];
                  local_1f0 = *puVar16;
                  local_1e0 = puVar16[2];
                }
                func_0x001dae44(&uStack_1d8,&local_160);
                local_70[0] = (undefined8 *)(*param_1 + param_1[1] * 0x90);
                local_88 = local_70;
                local_78 = param_1;
                if (param_1[1] == param_1[2]) {
                  puStack_80 = (undefined1 *)&local_1f0;
                  func_0x0425ca60(&local_88);
                }
                else {
                  puStack_80 = (undefined1 *)&local_1f0;
                  if (local_70[0] == (undefined8 *)0x0) goto LAB_0425a358;
                  local_70[0][2] = local_1e0;
                  local_70[0][1] = uStack_1e8;
                  *local_70[0] = local_1f0;
                  uStack_1e8 = 0;
                  local_1e0 = 0;
                  local_1f0 = 0;
                  puStack_80 = (undefined1 *)&local_1f0;
                  func_0x001dae44(local_70[0] + 3,&uStack_1d8);
                  local_70[0] = local_70[0] + 0x12;
                }
                param_1[1] = ((long)local_70[0] - *param_1 >> 4) * -0x71c71c71c71c71c7;
                if ((long)local_70[0] - *param_1 == 0) {
LAB_0425a358:
                    /* WARNING: Does not return */
                  pcVar7 = (code *)SoftwareBreakpoint(1,0x425a35c);
                  (*pcVar7)();
                }
                func_0x00027cb8(auStack_168,0);
                func_0x00027c78(&uStack_1b8);
                if ((long)local_1c8 < 0) {
                  func_0x00008eb8(uStack_1d8,local_1c8 & 0x7fffffffffffffff);
                }
              }
              if ((long)local_1e0 < 0) {
                func_0x00008eb8(local_1f0,local_1e0 & 0x7fffffffffffffff);
              }
            }
            func_0x00027cb8(auStack_f0,0);
            func_0x00027c78(&local_140);
            if ((long)local_150 < 0) {
              func_0x00008eb8(local_160,local_150 & 0x7fffffffffffffff);
            }
          }
        }
LAB_0425a05c:
        puVar16 = puVar16 + 4;
      } while (puVar16 != puVar10);
    }
    if ((char)local_c8 != '\0') {
      func_0x0095e480(&local_e0);
    }
  }
  return;
}


