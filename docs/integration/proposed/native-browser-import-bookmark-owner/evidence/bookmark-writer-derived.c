
/* WARNING: Control flow encountered bad instruction data */
/* WARNING: Removing unreachable block (ram,0x0410787c) */

void entry(long param_1,undefined8 *param_2,undefined8 param_3)

{
  char *pcVar1;
  short *psVar2;
  long *plVar3;
  ulong uVar4;
  byte bVar5;
  byte bVar6;
  undefined8 *puVar7;
  bool bVar8;
  bool bVar9;
  long lVar10;
  ulong uVar11;
  long *plVar12;
  short *psVar13;
  short *psVar14;
  undefined8 *puVar15;
  undefined8 *puVar16;
  short *psVar17;
  long *plVar18;
  long lVar19;
  undefined8 uVar20;
  char *pcVar21;
  undefined1 local_120 [16];
  undefined7 local_110;
  char cStack_109;
  char local_108;
  undefined1 local_100 [16];
  undefined7 local_f0;
  char cStack_e9;
  char local_e8;
  undefined1 local_e0;
  undefined7 uStack_df;
  undefined7 local_d0;
  char cStack_c9;
  char local_c8;
  undefined8 *local_c0;
  undefined8 local_b8;
  undefined8 local_b0;
  undefined1 local_a8;
  undefined7 uStack_a7;
  undefined7 local_98;
  char cStack_91;
  char local_90;
  undefined8 **local_88;
  undefined8 **local_80 [3];
  undefined1 local_68;
  
  if (param_2[1] == 0) {
    return;
  }
  lVar10 = func_0x00bfb87c(*(undefined8 *)(param_1 + 0x10));
  plVar18 = (long *)(lVar10 + 0x50);
  if (*plVar18 != 0) {
    uVar11 = func_0x00119280(0xec2b288);
    if ((uVar11 & 1) == 0) {
                    /* WARNING: Bad instruction - Truncating control flow here */
      halt_baddata();
    }
    if (*plVar18 != 0) {
      uVar11 = func_0x00119280(0xec2b288);
      if ((uVar11 & 1) == 0) {
                    /* WARNING: Bad instruction - Truncating control flow here */
        halt_baddata();
      }
      goto LAB_04107804;
    }
  }
  plVar18 = (long *)(lVar10 + 0x38);
LAB_04107804:
  lVar19 = *plVar18;
  func_0x0a551e5c(lVar10);
  uVar20 = *(undefined8 *)(lVar19 + 0x48);
  func_0x041073c4(local_80,lVar19,param_3);
  local_a8 = 0;
  local_90 = '\0';
  local_88 = (undefined8 **)func_0x0a554ed4(lVar10,lVar19,uVar20,local_80,0,0,0,&local_a8);
  if ((local_90 != '\0') && (cStack_91 < '\0')) {
    func_0x00008eb8(CONCAT71(uStack_a7,local_a8),CONCAT17(cStack_91,local_98) & 0x7fffffffffffffff);
  }
  local_b8 = 0;
  local_b0 = 0;
  local_c0 = &local_b8;
  func_0x06caa7e0(&local_c0,&local_c0,&local_88);
  bVar9 = false;
  puVar16 = local_c0;
  if (param_2[1] * 0xf0 != 0) {
    pcVar21 = (char *)*param_2;
    pcVar1 = pcVar21 + param_2[1] * 0xf0;
    do {
      if (((pcVar21[1] & 1U) != 0) || (pcVar21[0x20] != '\0')) {
        bVar9 = *pcVar21 != '\0' || bVar9;
        local_80[0] = local_88;
        if ((*(long *)(pcVar21 + 0x88) * 3 & 0x1fffffffffffffffU) != 0) {
          psVar17 = *(short **)(pcVar21 + 0x80);
          psVar2 = psVar17 + *(long *)(pcVar21 + 0x88) * 0xc;
          do {
            plVar18 = local_80[0][8];
            puVar16 = local_80[0][9];
            plVar3 = plVar18 + (long)puVar16;
            plVar12 = plVar18;
            if (((ulong)puVar16 & 0x1fffffffffffffff) != 0) {
              do {
                lVar19 = *plVar18;
                if (*(int *)(lVar19 + 0xf8) != 0) {
                  bVar5 = *(byte *)(lVar19 + 0x1f);
                  uVar11 = *(ulong *)(lVar19 + 0x10);
                  if (-1 < (char)bVar5) {
                    uVar11 = (ulong)bVar5;
                  }
                  bVar6 = *(byte *)((long)psVar17 + 0x17);
                  uVar4 = *(ulong *)(psVar17 + 4);
                  if (-1 < (char)bVar6) {
                    uVar4 = (ulong)bVar6;
                  }
                  if (uVar11 == uVar4) {
                    plVar12 = plVar18;
                    if (uVar11 == 0) break;
                    psVar13 = *(short **)psVar17;
                    if (-1 < (char)bVar6) {
                      psVar13 = psVar17;
                    }
                    psVar14 = *(short **)(lVar19 + 8);
                    if (-1 < (char)bVar5) {
                      psVar14 = (short *)(lVar19 + 8);
                    }
                    while( true ) {
                      if (*psVar13 != *psVar14) break;
                      uVar11 = uVar11 - 1;
                      psVar13 = psVar13 + 1;
                      psVar14 = psVar14 + 1;
                      if (uVar11 == 0) goto LAB_04107a60;
                    }
                  }
                }
                plVar18 = plVar18 + 1;
                plVar12 = plVar3;
              } while (plVar18 != plVar3);
            }
LAB_04107a60:
            if (plVar12 == plVar3) {
              local_e0 = 0;
              local_c8 = '\0';
              local_80[0] = (undefined8 **)
                            func_0x0a554ed4(lVar10,local_80[0],puVar16,psVar17,0,0,0,&local_e0);
              if ((local_c8 != '\0') && (cStack_c9 < '\0')) {
                func_0x00008eb8(CONCAT71(uStack_df,local_e0),
                                CONCAT17(cStack_c9,local_d0) & 0x7fffffffffffffff);
              }
            }
            else {
              local_80[0] = (undefined8 **)*plVar12;
            }
            psVar17 = psVar17 + 0xc;
          } while (psVar17 != psVar2);
        }
        func_0x06caa7e0(&local_c0,&local_c0,local_80);
        if ((pcVar21[1] & 1U) == 0) {
          local_120[0] = 0;
          local_108 = '\0';
          func_0x0a5553f0(lVar10,local_80[0],local_80[0][9],pcVar21 + 0x98,pcVar21 + 8,0,
                          *(undefined8 *)(pcVar21 + 0xb0),1,local_120,0);
          if ((local_108 != '\0') && (cStack_109 < '\0')) {
            puVar16 = (undefined8 *)local_120;
            uVar11 = CONCAT17(cStack_109,local_110);
LAB_04107910:
            func_0x00008eb8(*puVar16,uVar11 & 0x7fffffffffffffff);
          }
        }
        else {
          local_100[0] = 0;
          local_e8 = '\0';
          func_0x0a554ed4(lVar10,local_80[0],local_80[0][9],pcVar21 + 0x98,0,0,0,local_100);
          if ((local_e8 != '\0') && (cStack_e9 < '\0')) {
            puVar16 = (undefined8 *)local_100;
            uVar11 = CONCAT17(cStack_e9,local_f0);
            goto LAB_04107910;
          }
        }
      }
      pcVar21 = pcVar21 + 0xf0;
      puVar16 = local_c0;
    } while (pcVar21 != pcVar1);
  }
  while (puVar16 != &local_b8) {
    func_0x0a555eb0(lVar10,puVar16[4]);
    puVar7 = (undefined8 *)puVar16[1];
    puVar15 = puVar16;
    if ((undefined8 *)puVar16[1] == (undefined8 *)0x0) {
      do {
        puVar16 = (undefined8 *)puVar15[2];
        bVar8 = puVar15 != (undefined8 *)*puVar16;
        puVar15 = puVar16;
      } while (bVar8);
    }
    else {
      do {
        puVar16 = puVar7;
        puVar7 = (undefined8 *)*puVar16;
      } while ((undefined8 *)*puVar16 != (undefined8 *)0x0);
    }
  }
  func_0x0a551fc4(lVar10);
  if (bVar9) {
    uVar20 = (**(code **)(**(long **)(param_1 + 0x10) + 0x168))();
    local_80[0] = (undefined8 **)CONCAT71(local_80[0]._1_7_,1);
    local_68 = 1;
    func_0x015098a8(uVar20,0xcedd773,0x1d,local_80);
    func_0x0161e7d4(local_80);
  }
  local_80[0] = &local_c0;
  func_0x008c2154(local_80,local_b8);
  return;
}

