
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void entry(undefined8 *param_1,undefined8 *param_2,undefined8 param_3,long *param_4)

{
  ulong uVar1;
  byte bVar2;
  ulong uVar3;
  ulong *puVar4;
  code *pcVar5;
  int iVar6;
  undefined8 *puVar7;
  long lVar8;
  ulong *puVar9;
  ulong extraout_x1;
  undefined8 *puVar10;
  undefined8 *puVar11;
  ulong uVar12;
  ulong uVar13;
  undefined8 uVar14;
  ulong local_1b0;
  ulong uStack_1a8;
  ulong local_1a0;
  undefined8 local_190;
  undefined7 uStack_188;
  undefined1 uStack_181;
  undefined8 local_180;
  undefined8 uStack_178;
  undefined8 uStack_170;
  undefined8 uStack_168;
  undefined8 local_160;
  undefined8 uStack_158;
  undefined8 uStack_150;
  undefined8 uStack_148;
  undefined8 local_140;
  undefined8 uStack_138;
  undefined8 uStack_130;
  undefined8 uStack_128;
  undefined8 local_120 [2];
  ulong local_110;
  ulong uStack_108;
  ulong local_100;
  undefined8 local_f8;
  undefined8 uStack_f0;
  undefined8 local_e8;
  undefined8 uStack_e0;
  undefined8 local_d8;
  undefined8 uStack_d0;
  undefined8 local_c8;
  undefined8 uStack_c0;
  undefined8 local_b8;
  undefined8 uStack_b0;
  undefined8 local_a8;
  undefined8 uStack_a0;
  undefined8 local_98;
  undefined8 uStack_90;
  undefined8 local_88;
  ulong uStack_80;
  ulong local_78;
  ulong uStack_70;
  ulong local_68;
  
  func_0x00f0e580(param_3,param_3,param_2);
  if (((extraout_x1 & 1) != 0) && (uVar12 = param_1[1], 1 < uVar12)) {
    puVar11 = (undefined8 *)*param_1;
    puVar7 = (undefined8 *)*param_2;
    uVar3 = param_2[1];
    if (-1 < (char)*(byte *)((long)param_2 + 0x17)) {
      puVar7 = param_2;
      uVar3 = (ulong)*(byte *)((long)param_2 + 0x17);
    }
    uVar13 = 1;
    do {
      if (*(char *)(puVar11 + 3) == '\x04') {
        bVar2 = *(byte *)((long)puVar11 + 0x17);
        uVar1 = puVar11[1];
        if (-1 < (char)bVar2) {
          uVar1 = (ulong)bVar2;
        }
        if (uVar1 == uVar3) {
          puVar10 = (undefined8 *)*puVar11;
          if (-1 < (char)bVar2) {
            puVar10 = puVar11;
          }
          iVar6 = func_0x08009860(puVar10,puVar7,uVar3);
          if (iVar6 == 0) {
            if (*(char *)(puVar11 + 7) != '\x06') {
              return;
            }
            puVar7 = (undefined8 *)func_0x0095e840(puVar11 + 4,0xd7ef960,5);
            puVar11 = puVar11 + 4;
            if (puVar7 != (undefined8 *)0x0) {
              puVar11 = puVar7;
            }
            if (puVar11 == (undefined8 *)0x0) {
              return;
            }
            lVar8 = func_0x0046ad40(puVar11,0xdb2054e,9);
            if ((lVar8 == 0) || (*(char *)(lVar8 + 0x18) != '\x06')) {
              puVar7 = (undefined8 *)func_0x0046ad40(puVar11,0xdb20568,0x11);
              if (puVar7 == (undefined8 *)0x0) {
                return;
              }
              if (*(char *)(puVar7 + 3) != '\x04') {
                return;
              }
              local_120[0] = 0;
              uStack_138 = 0;
              local_140 = 0;
              uStack_128 = 0;
              uStack_130 = 0;
              uStack_158 = 0;
              local_160 = 0;
              uStack_148 = 0;
              uStack_150 = 0;
              uStack_178 = 0;
              local_180 = 0;
              uStack_168 = 0;
              uStack_170 = 0;
              uStack_188 = 0;
              uStack_181 = 0;
              local_190._0_1_ = 0;
              local_190._1_6_ = 0;
              local_190._7_1_ = 0;
              lVar8 = (long)*(char *)((long)puVar7 + 0x17);
              puVar10 = puVar7;
              if (lVar8 < 0) {
                puVar10 = (undefined8 *)*puVar7;
                lVar8 = puVar7[1];
              }
              func_0x003701d4(&local_190,puVar10,lVar8);
              if (((((char)uStack_178 != '\0') &&
                   (uVar12 = func_0x005a0390(&local_190,0xd7f42d3,6), (uVar12 & 1) == 0)) &&
                  (uVar12 = func_0x005a0390(&local_190,0xd8a2510,0x10), (uVar12 & 1) == 0)) &&
                 (uVar12 = func_0x005a0390(&local_190,0xd9cecf3,8), (uVar12 & 1) == 0)) {
                local_1b0 = 0;
                uStack_1a8 = 0;
                local_1a0 = 0;
                puVar9 = (ulong *)func_0x02029a80(puVar11,0xd7fcc1c,5);
                if ((puVar9 == (ulong *)0x0) &&
                   ((puVar9 = (ulong *)func_0x0046ad40(puVar11,0xdb2057a,0x13),
                    puVar9 == (ulong *)0x0 || ((char)puVar9[3] != '\x04')))) {
                  puVar9 = (ulong *)func_0x0066ca88(&local_190);
                }
                if (&local_1b0 != puVar9) {
                  bVar2 = *(byte *)((long)puVar9 + 0x17);
                  if ((long)local_1a0 < 0) {
                    uVar12 = puVar9[1];
                    puVar4 = (ulong *)*puVar9;
                    if (-1 < (char)bVar2) {
                      uVar12 = (ulong)bVar2;
                      puVar4 = puVar9;
                    }
                    func_0x004a8c00(&local_1b0,puVar4,uVar12);
                  }
                  else if ((char)bVar2 < '\0') {
                    func_0x004a8ab4(&local_1b0,*puVar9,puVar9[1]);
                  }
                  else {
                    uStack_1a8 = puVar9[1];
                    local_1b0 = *puVar9;
                    local_1a0 = puVar9[2];
                  }
                }
                uStack_70 = 0;
                local_78 = 0;
                uStack_80 = 0;
                local_88 = 0;
                uStack_90 = 0;
                local_98 = 0;
                uStack_a0 = 0;
                local_a8 = 0;
                uStack_b0 = 0;
                local_b8 = 0;
                uStack_c0 = 0;
                local_c8 = 0;
                uStack_d0 = 0;
                local_d8 = 0;
                uStack_e0 = 0;
                local_e8 = 0;
                uStack_f0 = 0;
                local_f8 = 0;
                uStack_108 = uStack_1a8;
                local_110 = local_1b0;
                local_68 = 0;
                local_100 = local_1a0;
                local_1a0 = local_1a0 & 0xffffffffffffff;
                local_1b0 = local_1b0 & 0xffffffffffffff00;
                func_0x001dae44(&local_f8,&local_190);
                uStack_80 = CONCAT71(uStack_80._1_7_,1);
                if (param_4[1] == param_4[2]) {
                  puVar9 = (ulong *)func_0x0426d97c(param_4,&local_110);
                }
                else {
                  puVar9 = (ulong *)(*param_4 + param_4[1] * 0xb0);
                  if (puVar9 == (ulong *)0x0) goto LAB_0426d92c;
                  puVar9[2] = local_100;
                  puVar9[1] = uStack_108;
                  *puVar9 = local_110;
                  uStack_108 = 0;
                  local_100 = 0;
                  local_110 = 0;
                  *(undefined1 *)(puVar9 + 3) = 0;
                  *(undefined1 *)(puVar9 + 0x12) = 0;
                  func_0x001dae44(puVar9 + 3,&local_f8);
                  uVar13 = local_68;
                  uVar3 = uStack_70;
                  uVar12 = local_78;
                  *(undefined1 *)(puVar9 + 0x12) = 1;
                  local_78 = 0;
                  puVar9[0x13] = uVar12;
                  uStack_70 = 0;
                  puVar9[0x14] = uVar3;
                  local_68 = 0;
                  puVar9[0x15] = uVar13;
                  puVar9 = puVar9 + 0x16;
                }
                param_4[1] = ((long)puVar9 - *param_4 >> 4) * 0x2e8ba2e8ba2e8ba3;
                if ((long)puVar9 - *param_4 == 0) goto LAB_0426d92c;
                func_0x0426b3c0(&local_110);
                if ((long)local_1a0 < 0) {
                  func_0x00008eb8(local_1b0,local_1a0 & 0x7fffffffffffffff);
                }
              }
              func_0x00027cb8(local_120,0);
              func_0x00027c78(&uStack_170);
            }
            else {
              local_190._0_1_ = 0;
              local_190._1_6_ = 0;
              local_190._7_1_ = 0;
              uStack_188 = 0;
              uStack_181 = 0;
              local_180 = 0;
              puVar7 = (undefined8 *)func_0x02029a80(puVar11,0xd7fcc1c,5);
              if (puVar7 == (undefined8 *)0x0) {
                local_180 = CONCAT17(0xf,(undefined7)local_180);
                local_190._0_1_ = (undefined1)_DAT_0db20558;
                local_190._1_6_ = (undefined6)((uint7)_DAT_0db20558 >> 8);
                local_190._7_1_ = DAT_0db2055f;
                uStack_188 = uRam000000000db20560;
                uStack_181 = 0;
              }
              else if (&local_190 != puVar7) {
                if (*(char *)((long)puVar7 + 0x17) < '\0') {
                  func_0x004a8ab4(&local_190,*puVar7,puVar7[1]);
                }
                else {
                  uVar14 = *puVar7;
                  local_180 = puVar7[2];
                  uStack_188 = (undefined7)puVar7[1];
                  uStack_181 = (undefined1)((ulong)puVar7[1] >> 0x38);
                  local_190._0_1_ = (undefined1)uVar14;
                  local_190._1_6_ = (undefined6)((ulong)uVar14 >> 8);
                  local_190._7_1_ = (undefined1)((ulong)uVar14 >> 0x38);
                }
              }
              uStack_70 = 0;
              local_78 = 0;
              uStack_80 = 0;
              local_88 = 0;
              uStack_90 = 0;
              local_98 = 0;
              uStack_a0 = 0;
              local_a8 = 0;
              uStack_b0 = 0;
              local_b8 = 0;
              uStack_c0 = 0;
              local_c8 = 0;
              uStack_d0 = 0;
              local_d8 = 0;
              uStack_e0 = 0;
              local_e8 = 0;
              uStack_f0 = 0;
              local_f8 = 0;
              uStack_108 = CONCAT17(uStack_181,uStack_188);
              local_110 = CONCAT17(local_190._7_1_,CONCAT61(local_190._1_6_,(undefined1)local_190));
              local_68 = 0;
              local_100 = local_180;
              local_180 = local_180 & 0xffffffffffffff;
              local_190._0_1_ = 0;
              puVar9 = (ulong *)func_0x0192ca80(puVar11,0xdb204fa,0xb);
              if (puVar9 != (ulong *)0x0) {
                uVar12 = *puVar9;
                if (uVar12 + puVar9[1] * 0x20 < uVar12) {
                    /* WARNING: Does not return */
                  pcVar5 = (code *)SoftwareBreakpoint(0,0x426d974);
                  (*pcVar5)();
                }
                for (lVar8 = puVar9[1] << 5; lVar8 != 0; lVar8 = lVar8 + -0x20) {
                  if (*(char *)(uVar12 + 0x18) == '\x04') {
                    entry(param_1,uVar12,param_3,&local_78);
                  }
                  uVar12 = uVar12 + 0x20;
                }
              }
              if (param_4[1] == param_4[2]) {
                puVar9 = (ulong *)func_0x0426d97c(param_4,&local_110);
              }
              else {
                puVar9 = (ulong *)(*param_4 + param_4[1] * 0xb0);
                if (puVar9 == (ulong *)0x0) goto LAB_0426d92c;
                puVar9[2] = local_100;
                puVar9[1] = uStack_108;
                *puVar9 = local_110;
                uStack_108 = 0;
                local_100 = 0;
                local_110 = 0;
                *(undefined1 *)(puVar9 + 3) = 0;
                *(undefined1 *)(puVar9 + 0x12) = 0;
                if ((uStack_80 & 1) != 0) {
                  func_0x001dae44(puVar9 + 3,&local_f8);
                  *(undefined1 *)(puVar9 + 0x12) = 1;
                }
                uVar13 = local_68;
                uVar3 = uStack_70;
                uVar12 = local_78;
                local_78 = 0;
                puVar9[0x13] = uVar12;
                uStack_70 = 0;
                puVar9[0x14] = uVar3;
                local_68 = 0;
                puVar9[0x15] = uVar13;
                puVar9 = puVar9 + 0x16;
              }
              param_4[1] = ((long)puVar9 - *param_4 >> 4) * 0x2e8ba2e8ba2e8ba3;
              if ((long)puVar9 - *param_4 == 0) {
LAB_0426d92c:
                    /* WARNING: Does not return */
                pcVar5 = (code *)SoftwareBreakpoint(1,0x426d930);
                (*pcVar5)();
              }
              func_0x0426b3c0(&local_110);
            }
            if (-1 < (long)local_180) {
              return;
            }
            func_0x00008eb8(CONCAT17(local_190._7_1_,CONCAT61(local_190._1_6_,(undefined1)local_190)
                                    ),local_180 & 0x7fffffffffffffff);
            return;
          }
        }
      }
      uVar13 = uVar13 + 2;
      puVar11 = puVar11 + 8;
    } while (uVar13 < uVar12);
  }
  return;
}

