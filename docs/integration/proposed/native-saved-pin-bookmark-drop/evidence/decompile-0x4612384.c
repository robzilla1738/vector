
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void entry(ulong *param_1,long param_2,long param_3,undefined8 param_4,ulong *param_5)

{
  int iVar1;
  uint uVar2;
  uint uVar3;
  char cVar4;
  uint uVar5;
  code *pcVar6;
  bool bVar7;
  undefined4 extraout_var;
  ulong *puVar8;
  ulong *puVar9;
  ulong uVar10;
  ulong *puVar11;
  ulong *puVar12;
  long lVar13;
  ulong uVar14;
  ulong uVar15;
  ulong uVar16;
  ulong uVar17;
  long lVar18;
  ulong uVar19;
  ulong uVar20;
  long lVar21;
  ulong *puVar22;
  ulong uVar23;
  undefined8 uVar24;
  undefined1 auVar25 [16];
  long local_80 [2];
  undefined8 local_70;
  ulong uStack_68;
  
  if ((((*(char *)(param_3 + 0x18) == '\0') || (*(long *)(param_2 + 0x530) == 0)) ||
      (*(char *)(*(long *)(param_2 + 0x530) + 0x21) == '\0')) ||
     (*(char *)(param_2 + 0x1c8) == '\0')) goto LAB_0461240c;
  auVar25 = func_0x01427574(param_2);
  if (((int)*param_5 < auVar25._0_4_) || (auVar25._8_4_ + auVar25._0_4_ <= (int)*param_5))
  goto LAB_0461240c;
  if ((*(int *)((long)param_5 + 4) < auVar25._4_4_) ||
     (auVar25._4_4_ + auVar25._12_4_ <= *(int *)((long)param_5 + 4))) goto LAB_0461240c;
  if (((*(byte *)(param_2 + 0x743) & 1) == 0) && (*(long *)(param_2 + 0x538) != 0)) {
    lVar21 = *(long *)(param_2 + 0x540);
    if ((lVar21 != 0) && (*(long *)(lVar21 + 0xc0) != 0)) {
      do {
        func_0x08fdac44(*(undefined8 *)(*(long *)(lVar21 + 0xb0) + 0x48));
      } while (*(long *)(lVar21 + 0xc0) != 0);
      func_0x0a65daa8(lVar21,*(undefined8 *)(lVar21 + 0xa8));
    }
    lVar21 = *(long *)(param_2 + 0x750) * 0x18;
    if (lVar21 != 0) {
      lVar18 = *(long *)(param_2 + 0x750) * -0x18;
      lVar21 = lVar21 + *(long *)(param_2 + 0x748);
      do {
        lVar21 = lVar21 + -0x18;
        if (lVar21 == 0) goto LAB_04612cd8;
        lVar18 = lVar18 + 0x18;
      } while (lVar18 != 0);
    }
    *(undefined8 *)(param_2 + 0x750) = 0;
    if ((*(ulong *)(param_2 + 0x608) & 0x1fffffffffffffff) != 0) {
      puVar22 = *(ulong **)(param_2 + 0x600);
      puVar11 = puVar22 + *(ulong *)(param_2 + 0x608);
      do {
        local_70 = *puVar22;
        puVar12 = *(ulong **)(param_2 + 0x5d0);
        lVar21 = *(long *)(param_2 + 0x5d8) << 4;
        puVar9 = puVar12;
        if (lVar21 != 0) {
          uVar14 = lVar21 >> 4;
          puVar8 = puVar12;
          do {
            uVar15 = uVar14 >> 1;
            puVar9 = puVar8 + uVar15 * 2 + 2;
            uVar14 = uVar14 + ~(uVar14 >> 1);
            if (local_70 <= puVar8[uVar15 * 2]) {
              puVar9 = puVar8;
              uVar14 = uVar15;
            }
            puVar8 = puVar9;
          } while (uVar14 != 0);
        }
        if (((puVar9 != puVar12 + *(long *)(param_2 + 0x5d8) * 2) && (*puVar9 <= local_70)) &&
           (uVar14 = puVar9[1], uVar14 != 0)) {
          puVar12 = *(ulong **)(param_2 + 0x748);
          lVar21 = *(long *)(param_2 + 0x750) * 0x18;
          puVar9 = puVar12;
          if (lVar21 != 0) {
            uVar15 = (lVar21 >> 3) * -0x5555555555555555;
            puVar8 = puVar12;
            do {
              uVar16 = uVar15 >> 1;
              puVar9 = puVar8 + uVar16 * 3 + 3;
              uVar15 = uVar15 + ~(uVar15 >> 1);
              if (local_70 <= puVar8[uVar16 * 3]) {
                puVar9 = puVar8;
                uVar15 = uVar16;
              }
              puVar8 = puVar9;
            } while (uVar15 != 0);
          }
          if ((puVar9 == puVar12 + *(long *)(param_2 + 0x750) * 3) || (local_70 < *puVar9)) {
            func_0x04625590(param_2 + 0x748,puVar9,&local_70);
          }
          else {
            uVar15 = *(ulong *)(uVar14 + 0x1b8);
            puVar9[2] = *(ulong *)(uVar14 + 0x1c0);
            puVar9[1] = uVar15;
          }
        }
        puVar22 = puVar22 + 1;
      } while (puVar22 != puVar11);
    }
    func_0x007d5c80(*(undefined8 *)(param_2 + 0x538),0xd6e4fe8);
    *(undefined4 *)(param_2 + 0x760) = extraout_var;
    *(undefined1 *)(param_2 + 0x743) = 1;
    if (*(char *)(param_2 + 0x770) != '\0') {
      *(undefined1 *)(param_2 + 0x770) = 0;
    }
    if ((*(ulong *)(param_2 + 0x780) & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x00022a3c();
    }
    *(undefined8 *)(param_2 + 0x780) = 0;
  }
  uVar14 = *(ulong *)(param_2 + 0x780);
  if (uVar14 != 0) {
    puVar11 = *(ulong **)(param_2 + 0x5d0);
    lVar21 = *(long *)(param_2 + 0x5d8) << 4;
    puVar22 = puVar11;
    if (lVar21 != 0) {
      uVar15 = lVar21 >> 4;
      puVar9 = puVar11;
      do {
        uVar16 = uVar15 >> 1;
        puVar22 = puVar9 + uVar16 * 2 + 2;
        uVar15 = uVar15 + ~(uVar15 >> 1);
        if (uVar14 <= puVar9[uVar16 * 2]) {
          puVar22 = puVar9;
          uVar15 = uVar16;
        }
        puVar9 = puVar22;
      } while (uVar15 != 0);
    }
    if (((puVar22 != puVar11 + *(long *)(param_2 + 0x5d8) * 2) && (*puVar22 <= uVar14)) &&
       ((uVar15 = puVar22[1], uVar15 != 0 && (*(int *)(uVar15 + 0x454) != 0)))) {
      *(undefined4 *)(uVar15 + 0x454) = 0;
      func_0x005a117c(uVar15);
      uVar14 = *(ulong *)(param_2 + 0x780);
    }
    if ((uVar14 & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x00022a3c();
    }
    *(undefined8 *)(param_2 + 0x780) = 0;
  }
  local_70 = *param_5;
  func_0x016f00e0(*(undefined8 *)(param_2 + 0x538),&local_70);
  uVar14 = *(ulong *)(param_2 + 0x608);
  if (uVar14 != 0) {
    uVar15 = 0;
    lVar21 = *(long *)(param_2 + 0x600);
    lVar18 = *(long *)(param_2 + 0x750);
    uVar16 = uVar14;
LAB_04612840:
    uVar20 = *(ulong *)(lVar21 + uVar15 * 8);
    puVar22 = *(ulong **)(param_2 + 0x748);
    uVar19 = (lVar18 * 0x18 >> 3) * -0x5555555555555555;
    uVar23 = lVar18 * 3 & 0x1fffffffffffffff;
    while (puVar11 = puVar22, uVar23 != 0) {
      uVar10 = uVar19 >> 1;
      uVar19 = uVar19 + ~(uVar19 >> 1);
      puVar22 = puVar11 + uVar10 * 3 + 3;
      uVar23 = uVar19;
      if (uVar20 <= puVar11[uVar10 * 3]) {
        puVar22 = puVar11;
        uVar19 = uVar10;
        uVar23 = uVar10;
      }
    }
    if ((puVar11 == *(ulong **)(param_2 + 0x748) + lVar18 * 3) || (uVar20 == 0 || uVar20 < *puVar11)
       ) goto LAB_04612834;
    if ((uVar16 == uVar14) &&
       (uVar16 = uVar15,
       *(int *)((long)puVar11 + 0xc) + *(int *)((long)puVar11 + 0x14) / 2 <= local_70._4_4_)) {
      uVar16 = uVar14;
    }
    if ((((*(int *)(uVar20 + 0xf8) == 0) || ((int)local_70 < (int)puVar11[1])) ||
        ((int)puVar11[2] + (int)puVar11[1] <= (int)local_70)) ||
       ((local_70._4_4_ < *(int *)((long)puVar11 + 0xc) ||
        (*(int *)((long)puVar11 + 0x14) + *(int *)((long)puVar11 + 0xc) <= local_70._4_4_))))
    goto LAB_04612834;
    uVar16 = uVar15 + 1;
    puVar11 = *(ulong **)(param_2 + 0x5d0);
    lVar21 = *(long *)(param_2 + 0x5d8) << 4;
    puVar22 = puVar11;
    if (lVar21 != 0) {
      uVar14 = lVar21 >> 4;
      puVar9 = puVar11;
      do {
        uVar15 = uVar14 >> 1;
        puVar22 = puVar9 + uVar15 * 2 + 2;
        uVar14 = uVar14 + ~(uVar14 >> 1);
        if (uVar20 <= puVar9[uVar15 * 2]) {
          puVar22 = puVar9;
          uVar14 = uVar15;
        }
        puVar9 = puVar22;
      } while (uVar14 != 0);
    }
    if (((puVar22 == puVar11 + *(long *)(param_2 + 0x5d8) * 2) || (uVar20 < *puVar22)) ||
       (uVar14 = puVar22[1], uVar14 == 0)) {
      uVar14 = 0;
    }
    else {
      if (*(int *)(uVar14 + 0x454) != 1) {
        *(undefined4 *)(uVar14 + 0x454) = 1;
        func_0x005a117c();
      }
      if ((uVar20 & 0xfffffffc00000000) == _DAT_0ebb2088) {
        func_0x000142fc(uVar20);
      }
      if ((*(ulong *)(param_2 + 0x780) & 0xfffffffc00000000) == _DAT_0ebb2088) {
        func_0x00022a3c();
      }
      uVar14 = 0;
      *(ulong *)(param_2 + 0x780) = uVar20;
    }
    goto LAB_04612458;
  }
  uVar16 = 0;
LAB_04612444:
  uVar20 = func_0x04612dec(param_2);
  if (uVar20 == 0) goto LAB_0461240c;
  uVar14 = *(ulong *)(uVar20 + 0x48);
  goto LAB_04612458;
LAB_04612834:
  uVar15 = uVar15 + 1;
  if (uVar15 == uVar14) goto LAB_0461289c;
  goto LAB_04612840;
LAB_0461289c:
  if (((uVar16 < uVar14) && (lVar18 = *(long *)(lVar21 + uVar16 * 8), lVar18 != 0)) &&
     (uVar20 = *(ulong *)(lVar18 + 0x38), uVar20 != 0)) {
    uVar14 = *(ulong *)(uVar20 + 0x48);
    if (uVar14 * 8 != 0) {
      lVar21 = 0;
      do {
        if (*(long *)(*(long *)(uVar20 + 0x40) + lVar21) == lVar18) {
          uVar14 = lVar21 >> 3;
          break;
        }
        lVar21 = lVar21 + 8;
      } while (uVar14 * 8 - lVar21 != 0);
    }
  }
  else {
    lVar21 = *(long *)(lVar21 + uVar14 * 8 + -8);
    if ((lVar21 == 0) || (uVar20 = *(ulong *)(lVar21 + 0x38), uVar20 == 0)) goto LAB_04612444;
    lVar18 = *(long *)(uVar20 + 0x48);
    if (lVar18 * 8 != 0) {
      lVar13 = 0;
      do {
        if (*(long *)(*(long *)(uVar20 + 0x40) + lVar13) == lVar21) {
          lVar18 = lVar13 >> 3;
          break;
        }
        lVar13 = lVar13 + 8;
      } while (lVar18 * 8 - lVar13 != 0);
    }
    uVar14 = lVar18 + 1;
  }
LAB_04612458:
  if (*(int *)(uVar20 + 0xf8) == 0) {
LAB_0461240c:
    func_0x04613160(param_2,1);
    *(undefined1 *)param_1 = 0;
    *(undefined1 *)(param_1 + 2) = 0;
    return;
  }
  if ((uVar20 & 0xfffffffc00000000) == _DAT_0ebb2088) {
    func_0x000142fc(uVar20);
  }
  if ((*(ulong *)(param_2 + 0x778) & 0xfffffffc00000000) == _DAT_0ebb2088) {
    func_0x00022a3c();
  }
  *(ulong *)(param_2 + 0x778) = uVar20;
  uVar15 = *(ulong *)(uVar20 + 0x48);
  if (uVar14 <= *(ulong *)(uVar20 + 0x48)) {
    uVar15 = uVar14;
  }
  *(ulong *)(param_2 + 0x788) = uVar15;
  if ((*(long *)(param_2 + 0x538) != 0) && (*(char *)(param_2 + 0x743) != '\0')) {
    uVar15 = *(ulong *)(param_2 + 0x608);
    uVar14 = uVar15;
    if (uVar16 <= uVar15) {
      uVar14 = uVar16;
    }
    cVar4 = *(char *)(param_2 + 0x770);
    uVar19 = *(ulong *)(param_2 + 0x768);
    if ((cVar4 == '\0') || (uVar19 != uVar14)) {
      *(ulong *)(param_2 + 0x768) = uVar14;
      *(undefined1 *)(param_2 + 0x770) = 1;
      uVar10 = uVar19;
      uVar23 = uVar14;
      if (uVar19 <= uVar14) {
        uVar10 = uVar14;
        uVar23 = uVar19;
      }
      if (cVar4 == '\0') {
        uVar10 = uVar15;
        uVar23 = uVar14;
      }
      if (uVar23 < uVar10) {
        do {
          if (*(ulong *)(param_2 + 0x608) <= uVar23) {
LAB_04612cd8:
                    /* WARNING: Does not return */
            pcVar6 = (code *)SoftwareBreakpoint(1,0x4612cdc);
            (*pcVar6)();
          }
          uVar15 = *(ulong *)(*(long *)(param_2 + 0x600) + uVar23 * 8);
          puVar22 = *(ulong **)(param_2 + 0x5d0);
          lVar21 = *(long *)(param_2 + 0x5d8) << 4;
          puVar11 = puVar22;
          if (lVar21 != 0) {
            uVar19 = lVar21 >> 4;
            puVar9 = puVar22;
            do {
              uVar17 = uVar19 >> 1;
              puVar11 = puVar9 + uVar17 * 2 + 2;
              uVar19 = uVar19 + ~(uVar19 >> 1);
              if (uVar15 <= puVar9[uVar17 * 2]) {
                puVar11 = puVar9;
                uVar19 = uVar17;
              }
              puVar9 = puVar11;
            } while (uVar19 != 0);
          }
          puVar22 = puVar22 + *(long *)(param_2 + 0x5d8) * 2;
          if ((puVar11 == puVar22) || (uVar15 < *puVar11)) {
            puVar11 = puVar22;
          }
          puVar12 = *(ulong **)(param_2 + 0x748);
          lVar21 = *(long *)(param_2 + 0x750) * 0x18;
          puVar9 = puVar12;
          if (lVar21 != 0) {
            uVar19 = (lVar21 >> 3) * -0x5555555555555555;
            puVar8 = puVar12;
            do {
              uVar17 = uVar19 >> 1;
              puVar9 = puVar8 + uVar17 * 3 + 3;
              uVar19 = uVar19 + ~(uVar19 >> 1);
              if (uVar15 <= puVar8[uVar17 * 3]) {
                puVar9 = puVar8;
                uVar19 = uVar17;
              }
              puVar8 = puVar9;
            } while (uVar19 != 0);
          }
          puVar12 = puVar12 + *(long *)(param_2 + 0x750) * 3;
          if ((puVar9 == puVar12) || (uVar15 < *puVar9)) {
            puVar9 = puVar12;
          }
          if ((puVar11 != puVar22) && (puVar9 != puVar12 && puVar11[1] != 0)) {
            uStack_68 = puVar9[2];
            uVar15 = puVar9[1];
            local_70 = uVar15;
            if (uVar14 <= uVar23) {
              local_70._4_4_ = (int)(uVar15 >> 0x20);
              iVar1 = 0x7fffffff;
              if (!SCARRY4(local_70._4_4_,0x24)) {
                iVar1 = local_70._4_4_ + 0x24;
              }
              local_70._0_4_ = (int)uVar15;
              local_70 = CONCAT44(iVar1,(int)local_70);
              uVar24 = NEON_sqadd(CONCAT44(iVar1,(int)local_70),uStack_68,4);
              uVar24 = NEON_sqsub(uVar24,CONCAT44(iVar1,(int)local_70),4);
              uStack_68 = NEON_smax(uVar24,0,4);
            }
            if (*(long *)(param_2 + 0x540) == 0) {
              func_0x008a4b90(puVar11[1],&local_70);
            }
            else {
              func_0x0a65d684(*(long *)(param_2 + 0x540),puVar11[1],&local_70);
            }
          }
          uVar23 = uVar23 + 1;
        } while (uVar23 != uVar10);
      }
      bVar7 = false;
      if (*(long *)(param_2 + 0x540) != 0) {
        bVar7 = *(long *)(*(long *)(param_2 + 0x540) + 0xc0) != 0;
      }
      *(bool *)(param_2 + 0x862) = bVar7;
      func_0x005a117c(*(undefined8 *)(param_2 + 0x538));
    }
  }
  uVar14 = *(ulong *)(param_2 + 0x608);
  if (uVar16 < uVar14) {
    lVar21 = *(long *)(param_2 + 0x600);
    puVar22 = *(ulong **)(param_2 + 0x748);
    lVar18 = *(long *)(param_2 + 0x750);
    lVar13 = lVar18 * 0x18;
    puVar11 = puVar22;
    if (lVar13 != 0) {
      uVar15 = (lVar13 >> 3) * -0x5555555555555555;
      puVar9 = puVar22;
      do {
        uVar19 = uVar15 >> 1;
        puVar11 = puVar9 + uVar19 * 3 + 3;
        uVar15 = uVar15 + ~(uVar15 >> 1);
        if (*(ulong *)(lVar21 + uVar16 * 8) <= puVar9[uVar19 * 3]) {
          puVar11 = puVar9;
          uVar15 = uVar19;
        }
        puVar9 = puVar11;
      } while (uVar15 != 0);
    }
    if ((puVar11 != puVar22 + lVar18 * 3) && (*puVar11 <= *(ulong *)(lVar21 + uVar16 * 8))) {
      uVar14 = puVar11[1];
      uStack_68 = puVar11[2];
      uVar15 = uVar14 >> 0x20;
      goto LAB_04612bc4;
    }
LAB_04612b44:
    lVar21 = lVar21 + uVar14 * 8;
    puVar11 = puVar22;
    if (lVar13 != 0) {
      uVar14 = (lVar13 >> 3) * -0x5555555555555555;
      puVar9 = puVar22;
      do {
        uVar15 = uVar14 >> 1;
        puVar11 = puVar9 + uVar15 * 3 + 3;
        uVar14 = uVar14 + ~(uVar14 >> 1);
        if (*(ulong *)(lVar21 + -8) <= puVar9[uVar15 * 3]) {
          puVar11 = puVar9;
          uVar14 = uVar15;
        }
        puVar9 = puVar11;
      } while (uVar14 != 0);
    }
    if ((puVar11 != puVar22 + lVar18 * 3) && (*puVar11 <= *(ulong *)(lVar21 + -8))) {
      uVar14 = puVar11[1];
      iVar1 = (int)(puVar11[2] >> 0x20);
      uVar5 = (int)(uVar14 >> 0x20) + iVar1 + 4;
      uVar15 = (ulong)uVar5;
      uVar2 = (int)(uVar5 + iVar1) >> 0x1f ^ 0x80000000;
      if (!SCARRY4(uVar5,iVar1)) {
        uVar2 = uVar5 + iVar1;
      }
      uVar3 = (int)(uVar2 - uVar5) >> 0x1f ^ 0x80000000;
      if (!SBORROW4(uVar2,uVar5)) {
        uVar3 = uVar2 - uVar5;
      }
      uStack_68 = puVar11[2] & 0xffffffff |
                  (ulong)(uVar3 & ((int)uVar3 >> 0x1f ^ 0xffffffffU)) << 0x20;
      goto LAB_04612bc4;
    }
  }
  else if (uVar14 != 0) {
    lVar21 = *(long *)(param_2 + 0x600);
    puVar22 = *(ulong **)(param_2 + 0x748);
    lVar18 = *(long *)(param_2 + 0x750);
    lVar13 = lVar18 * 0x18;
    goto LAB_04612b44;
  }
  if (*(long *)(param_2 + 0x538) == 0) {
    uStack_68 = 0x2000000000;
  }
  else {
    uVar5 = *(int *)(*(long *)(param_2 + 0x538) + 0x1c0) - 0x10;
    uVar5 = uVar5 & ((int)uVar5 >> 0x1f ^ 0xffffffffU);
    iVar1 = 0x7fffffff;
    if (!SCARRY4(uVar5,8)) {
      iVar1 = uVar5 + 8;
    }
    uStack_68 = (ulong)(iVar1 - 8) | 0x2000000000;
  }
  uVar14 = 8;
  uVar15 = 1;
LAB_04612bc4:
  local_70 = uVar14 & 0xffffffff | uVar15 << 0x20;
  puVar11 = *(ulong **)(param_2 + 0x5e8);
  lVar21 = *(long *)(param_2 + 0x5f0) << 4;
  puVar22 = puVar11;
  if (lVar21 != 0) {
    uVar14 = lVar21 >> 4;
    puVar9 = puVar11;
    do {
      uVar15 = uVar14 >> 1;
      puVar22 = puVar9 + uVar15 * 2 + 2;
      uVar14 = uVar14 + ~(uVar14 >> 1);
      if (uVar20 <= puVar9[uVar15 * 2]) {
        puVar22 = puVar9;
        uVar14 = uVar15;
      }
      puVar9 = puVar22;
    } while (uVar14 != 0);
  }
  if ((puVar22 != puVar11 + *(long *)(param_2 + 0x5f0) * 2) && (*puVar22 <= uVar20)) {
    local_80[0] = (ulong)((int)puVar22[1] * 0xe + 0xe) << 0x20;
    local_80[1] = 0;
    func_0x003cd0b8(&local_70,local_80);
  }
  func_0x0a6dac08(*(undefined8 *)(param_2 + 0x538),&local_70);
  param_1[1] = uStack_68;
  *param_1 = local_70;
  *(undefined1 *)(param_1 + 2) = 1;
  return;
}

