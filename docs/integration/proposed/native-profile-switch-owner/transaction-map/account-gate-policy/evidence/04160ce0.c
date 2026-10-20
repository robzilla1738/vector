// func FUN_04160ce0 @ 04160ce0 size 5376

/* WARNING: Removing unreachable block (ram,0x041618c0) */
/* WARNING: Removing unreachable block (ram,0x04161c98) */
/* WARNING: Removing unreachable block (ram,0x04161fd0) */
/* WARNING: Removing unreachable block (ram,0x04161ad8) */
/* WARNING: Removing unreachable block (ram,0x04161004) */
/* WARNING: Removing unreachable block (ram,0x04161130) */
/* WARNING: Removing unreachable block (ram,0x04161fb0) */
/* WARNING: Removing unreachable block (ram,0x04161fe8) */
/* WARNING: Removing unreachable block (ram,0x041618a8) */
/* WARNING: Removing unreachable block (ram,0x04161584) */
/* WARNING: Type propagation algorithm not settling */

void FUN_04160ce0(long param_1,ulong *param_2)

{
  undefined8 *******pppppppuVar1;
  int *piVar2;
  undefined8 *puVar3;
  undefined8 *******pppppppuVar4;
  int *piVar5;
  long lVar6;
  char cVar7;
  byte bVar8;
  byte bVar9;
  char cVar10;
  bool bVar11;
  code *pcVar12;
  bool bVar13;
  int iVar14;
  int iVar15;
  long *plVar16;
  undefined1 *puVar17;
  int *piVar18;
  long *******ppppppplVar19;
  long *******ppppppplVar20;
  long *******ppppppplVar21;
  long *plVar22;
  long *****ppppplVar23;
  ulong uVar24;
  char *pcVar25;
  ulong uVar26;
  long ******pppppplVar27;
  long lVar28;
  size_t sVar29;
  ulong uVar30;
  uint uVar31;
  size_t sVar32;
  long ******pppppplVar33;
  uint uVar34;
  int *piVar35;
  undefined8 uVar36;
  long *****ppppplVar37;
  ulong uVar38;
  undefined8 *puVar39;
  long ******pppppplVar40;
  ulong local_300;
  ulong local_2f0;
  undefined1 local_2e8 [200];
  byte local_220;
  long ******local_210 [13];
  long local_1a8;
  long local_1a0;
  long local_178;
  long local_170;
  byte local_148;
  long *******local_140;
  long ******pppppplStack_138;
  undefined8 local_130;
  ulong local_128;
  undefined8 *******local_120;
  long lStack_118;
  undefined8 local_110;
  undefined8 *******local_108;
  ulong local_100;
  undefined8 local_f8;
  undefined8 *******local_f0;
  size_t sStack_e8;
  undefined8 local_e0;
  undefined8 local_d8;
  undefined8 uStack_d0;
  undefined8 local_c8;
  undefined8 *******local_c0;
  ulong uStack_b8;
  ulong local_b0;
  long ******local_a8;
  ulong local_a0;
  long local_98;
  long *******local_90;
  char acStack_88 [9];
  undefined5 uStack_7f;
  char cStack_7a;
  byte bStack_79;
  ulong local_78;
  
  piVar5 = *(int **)(param_1 + 0x28);
  lVar6 = *(long *)(param_1 + 0x30);
  *(undefined8 *)(param_1 + 0x28) = 0;
  cVar7 = *(char *)(param_1 + 0x38);
  uVar24 = param_2[1];
  uVar38 = *param_2;
  uVar26 = param_2[2];
  *param_2 = 0;
  param_2[1] = 0;
  param_2[2] = 0;
  local_2e8[0] = 0;
  local_220 = 0;
  bVar13 = (char)param_2[0x1c] != '\0';
  if (bVar13) {
    FUN_040ff400(local_2e8,param_2 + 3);
  }
  local_300 = uVar38;
  local_2f0 = uVar26;
  local_220 = bVar13;
  if (piVar5 == (int *)0x0) goto LAB_04160df8;
  if ((char)piVar5[1] == '\0' && lVar6 != 0) {
    if ((char)piVar5[1] != '\0') {
                    /* WARNING: Does not return */
      pcVar12 = (code *)SoftwareBreakpoint(0,0x4162160);
      (*pcVar12)();
    }
    local_2f0 = 0;
    local_300 = 0;
    local_210[0]._0_1_ = 0;
    local_148 = 0;
    if (bVar13) {
      FUN_040ff400(local_210,local_2e8);
    }
    *(undefined1 *)(lVar6 + 0xa0) = 0;
    cVar10 = *(char *)(lVar6 + 0x87);
    local_148 = bVar13;
    if (cVar10 < '\0') {
      if (*(long *)(lVar6 + 0x78) == 0) goto LAB_04160e6c;
LAB_04160db0:
      if (!bVar13) goto LAB_04160db4;
LAB_04160ea0:
      plVar16 = *(long **)(lVar6 + 0x28);
      if (plVar16 != (long *)0x0) {
        local_108 = (undefined8 *******)0x0;
        local_100 = 0;
        local_f8 = 0;
        if ((*(byte *)(plVar16 + 9) & 1) == 0) {
          (**(code **)(*plVar16 + 0x168))();
          FUN_0410347c(&local_108);
        }
        lStack_118 = 0;
        local_120 = (undefined8 *******)0x0;
        local_110 = 0;
        if (*(char *)(lVar6 + 0x4f) < '\0') {
          FUN_00018218(&local_120,*(undefined8 *)(lVar6 + 0x38),*(undefined8 *)(lVar6 + 0x40));
        }
        else {
          lStack_118 = *(long *)(lVar6 + 0x40);
          local_120 = *(undefined8 ********)(lVar6 + 0x38);
          local_110 = *(ulong *)(lVar6 + 0x48);
        }
        pppppppuVar4 = local_108;
        if (-1 < (long)(char)local_f8._7_1_) {
          pppppppuVar4 = &local_108;
        }
        uVar24 = local_100;
        if (-1 < (long)local_f8) {
          uVar24 = (long)(char)local_f8._7_1_;
        }
        pppppppuVar1 = local_120;
        if (-1 < (long)local_110._7_1_) {
          pppppppuVar1 = &local_120;
        }
        lVar28 = lStack_118;
        if (-1 < (long)local_110) {
          lVar28 = (long)local_110._7_1_;
        }
        plVar16 = *(long **)(lVar6 + 0x28);
        if ((plVar16 == (long *)0x0) || ((char)plVar16[9] != '\0')) {
          local_90 = (long *******)((ulong)local_90 & 0xffffffffffffff00);
          local_78 = local_78 & 0xffffffffffffff00;
LAB_04160f94:
          uVar31 = 0;
          local_140 = (long *******)0x0;
          pppppplStack_138 = (long ******)0x0;
          local_130 = (long ******)0x0;
        }
        else {
          (**(code **)(*plVar16 + 0x168))();
          FUN_0410374c(&local_90);
          bVar9 = bStack_79;
          if ((char)local_78 == '\0') goto LAB_04160f94;
          local_130 = (long ******)
                      CONCAT17(bStack_79,CONCAT16(cStack_7a,CONCAT51(uStack_7f,acStack_88[8])));
          pppppplStack_138 = (long ******)CONCAT26(acStack_88._6_2_,acStack_88._0_6_);
          local_140 = local_90;
          acStack_88[0] = '\0';
          acStack_88[1] = '\0';
          acStack_88[2] = '\0';
          acStack_88[3] = '\0';
          acStack_88[4] = '\0';
          acStack_88[5] = '\0';
          acStack_88[6] = '\0';
          acStack_88[7] = '\0';
          acStack_88[8] = '\0';
          uStack_7f = 0;
          cStack_7a = '\0';
          bStack_79 = 0;
          local_90 = (long *******)0x0;
          uVar31 = (uint)bVar9;
        }
        bVar13 = -1 < (char)uVar31;
        ppppppplVar20 = local_140;
        if (bVar13) {
          ppppppplVar20 = (long *******)&local_140;
        }
        pppppplVar27 = pppppplStack_138;
        if (bVar13) {
          pppppplVar27 = (long ******)(ulong)uVar31;
        }
        puVar17 = (undefined1 *)local_210;
        FUN_041007c4(puVar17,pppppppuVar4,uVar24,pppppppuVar1,lVar28,ppppppplVar20,pppppplVar27);
        if ((long)local_130 < 0) {
          FUN_00008eb8(local_140,(ulong)local_130 & 0x7fffffffffffffff);
        }
        if ((int)puVar17 != 0) {
          FUN_04103b7c(*(undefined8 *)(DAT_0eee6cf8 + 0x38));
        }
        piVar18 = (int *)local_210;
        FUN_040ff8dc();
        pppppppuVar4 = local_108;
        if (-1 < (long)(char)local_f8._7_1_) {
          pppppppuVar4 = &local_108;
        }
        uVar24 = local_100;
        if (-1 < (long)local_f8) {
          uVar24 = (long)(char)local_f8._7_1_;
        }
        pppppppuVar1 = local_120;
        if (-1 < (long)local_110._7_1_) {
          pppppppuVar1 = &local_120;
        }
        lVar28 = lStack_118;
        if (-1 < (long)local_110) {
          lVar28 = (long)local_110._7_1_;
        }
        ppppppplVar20 = local_210;
        FUN_040ff964(ppppppplVar20,pppppppuVar4,uVar24,pppppppuVar1,lVar28);
        if (ppppppplVar20 == (long *******)0x0) {
LAB_041610d4:
          local_130 = (long ******)0x0;
          pppppplStack_138 = (long ******)0x0;
          local_140 = (long *******)0x0;
          local_128 = 0;
          ppppppplVar19 = *(long ********)(lVar6 + 0x28);
          if ((ppppppplVar19 == (long *******)0x0) || (*(char *)(ppppppplVar19 + 9) != '\0')) {
            local_90 = (long *******)((ulong)local_90 & 0xffffffffffffff00);
            local_78 = local_78 & 0xffffffffffffff00;
          }
          else {
            (*(code *)(*ppppppplVar19)[0x2d])();
            FUN_0410374c(&local_90);
            if ((char)local_128 == (char)local_78) {
              if ((char)local_128 != '\0') {
                if ((long)local_130 < 0) {
                  FUN_00008eb8(local_140,(ulong)local_130 & 0x7fffffffffffffff);
                  ppppppplVar19 = local_140;
                }
                pppppplStack_138 = (long ******)CONCAT26(acStack_88._6_2_,acStack_88._0_6_);
                local_140 = local_90;
                local_130 = (long ******)
                            CONCAT17(bStack_79,CONCAT16(cStack_7a,CONCAT51(uStack_7f,acStack_88[8]))
                                    );
                bStack_79 = 0;
                local_90 = (long *******)((ulong)local_90 & 0xffffffffffffff00);
              }
            }
            else if ((char)local_128 == '\0') {
              pppppplStack_138 = (long ******)CONCAT26(acStack_88._6_2_,acStack_88._0_6_);
              local_140 = local_90;
              local_130 = (long ******)
                          CONCAT17(bStack_79,CONCAT16(cStack_7a,CONCAT51(uStack_7f,acStack_88[8])));
              acStack_88[0] = '\0';
              acStack_88[1] = '\0';
              acStack_88[2] = '\0';
              acStack_88[3] = '\0';
              acStack_88[4] = '\0';
              acStack_88[5] = '\0';
              acStack_88[6] = '\0';
              acStack_88[7] = '\0';
              acStack_88[8] = '\0';
              uStack_7f = 0;
              cStack_7a = '\0';
              bStack_79 = 0;
              local_90 = (long *******)0x0;
              local_128 = CONCAT71(local_128._1_7_,1);
            }
            else {
              if ((long)local_130 < 0) {
                ppppppplVar19 = local_140;
                FUN_00008eb8(local_140,(ulong)local_130 & 0x7fffffffffffffff);
              }
              local_128 = local_128 & 0xffffffffffffff00;
            }
          }
          if (((((local_128 & 1) == 0) &&
               (ppppppplVar20 = *(long ********)(lVar6 + 0x28), ppppppplVar19 = ppppppplVar20,
               ppppppplVar20 != (long *******)0x0)) && (((ulong)ppppppplVar20[9] & 1) == 0)) &&
             ((*(code *)(*ppppppplVar20)[0x2d])(), ppppppplVar19 = ppppppplVar20,
             ppppppplVar20 != (long *******)0x0)) {
            ppppppplVar21 = ppppppplVar20;
            FUN_004bcc4c();
            ppppppplVar19 = (long *******)0x0;
            if (ppppppplVar21 != (long *******)0x0) {
              FUN_002bea28(ppppppplVar20,"aside.account_id",0x10);
              ppppppplVar19 = ppppppplVar20;
              if ((-1 < (int)ppppppplVar20) && (local_1a0 = local_1a0 * 0xc0, local_1a0 != 0)) {
                ppppppplVar21 = (long *******)(local_1a8 + 0x50);
                do {
                  if (*(int *)(ppppppplVar21 + -10) == (int)ppppppplVar20) {
                    if (ppppppplVar21 != (long *******)&segment_command_00000020.filesize) {
                      cVar10 = *(char *)((long)ppppppplVar21 + 0x17);
                      pppppplVar33 = (long ******)(long)cVar10;
                      pppppplVar27 = pppppplVar33;
                      if ((long)pppppplVar33 < 0) {
                        pppppplVar27 = ppppppplVar21[1];
                      }
                      if (pppppplVar27 != (long ******)0x0) {
                        if ((char)local_128 == '\0') {
                          if (cVar10 < '\0') {
                            ppppppplVar20 = (long *******)&local_140;
                            FUN_00018218(ppppppplVar20,*ppppppplVar21,ppppppplVar21[1]);
                          }
                          else {
                            pppppplStack_138 = ppppppplVar21[1];
                            local_140 = (long *******)*ppppppplVar21;
                            local_130 = ppppppplVar21[2];
                          }
                          bVar13 = false;
                          local_128 = CONCAT71(local_128._1_7_,1);
                          goto LAB_041611cc;
                        }
                        if ((long ********)ppppppplVar21 != &local_140) {
                          if ((long)local_130 < 0) {
                            pppppplVar27 = ppppppplVar21[1];
                            ppppppplVar20 = (long *******)*ppppppplVar21;
                            if (-1 < cVar10) {
                              pppppplVar27 = pppppplVar33;
                              ppppppplVar20 = ppppppplVar21;
                            }
                            ppppppplVar19 = (long *******)&local_140;
                            FUN_004a8c00(ppppppplVar19,ppppppplVar20,pppppplVar27);
                          }
                          else {
                            if (-1 < cVar10) {
                              bVar13 = false;
                              pppppplStack_138 = ppppppplVar21[1];
                              local_140 = (long *******)*ppppppplVar21;
                              local_130 = ppppppplVar21[2];
                              goto LAB_041611cc;
                            }
                            ppppppplVar19 = (long *******)&local_140;
                            FUN_004a8ab4(ppppppplVar19,*ppppppplVar21,ppppppplVar21[1]);
                          }
                        }
                      }
                    }
                    break;
                  }
                  ppppppplVar21 = ppppppplVar21 + 0x18;
                  local_1a0 = local_1a0 + -0xc0;
                } while (local_1a0 != 0);
              }
            }
          }
          bVar13 = false;
          ppppppplVar20 = ppppppplVar19;
        }
        else {
          pppppplVar27 = (long ******)(long)*(char *)((long)ppppppplVar20 + 0x2f);
          if ((long)pppppplVar27 < 0) {
            pppppplVar27 = ppppppplVar20[4];
          }
          pppppplStack_138 = (long ******)0x0;
          local_140 = (long *******)0x0;
          local_128 = 0;
          local_130 = (long ******)0x0;
          if (pppppplVar27 == (long ******)0x0) goto LAB_041610d4;
          if (*(char *)((long)ppppppplVar20 + 0x2f) < '\0') {
            ppppppplVar19 = ppppppplVar20 + 3;
            ppppppplVar21 = ppppppplVar20 + 4;
            ppppppplVar20 = (long *******)&local_140;
            FUN_00018218(ppppppplVar20,*ppppppplVar19,*ppppppplVar21);
          }
          else {
            pppppplStack_138 = ppppppplVar20[4];
            local_140 = (long *******)ppppppplVar20[3];
            local_130 = ppppppplVar20[5];
          }
          bVar13 = true;
          local_128 = CONCAT71(local_128._1_7_,1);
        }
LAB_041611cc:
        if (((cVar7 != '\0') && (FUN_027a55f4(), piVar18 != (int *)0x0)) &&
           ((*(long ********)(lVar6 + 0x28) == ppppppplVar20 &&
            (((*(byte *)(piVar18 + 0x26) & 1) != 0 || (*(char *)((long)piVar18 + 0x99) != '\0'))))))
        {
          lVar28 = (long)*(char *)((long)piVar18 + 0x7f);
          if (lVar28 < 0) {
            lVar28 = *(long *)(piVar18 + 0x1c);
          }
          if (lVar28 != 0) {
            cVar7 = *(char *)((long)piVar18 + 0x67);
            sVar29 = (size_t)cVar7;
            sVar32 = sVar29;
            if ((long)sVar29 < 0) {
              sVar32 = *(size_t *)(piVar18 + 0x16);
            }
            if ((sVar32 != 0) && ((local_128 & 1) == 0)) {
              sVar32 = *(size_t *)(piVar18 + 0x16);
              if (-1 < cVar7) {
                sVar32 = sVar29;
              }
              if (sVar32 != 0) {
                plVar16 = (long *)(piVar18 + 0x14);
                lVar28 = local_170 * 0x50;
                if (lVar28 != 0) {
                  piVar35 = *(int **)(piVar18 + 0x14);
                  if (-1 < cVar7) {
                    piVar35 = piVar18 + 0x14;
                  }
                  iVar14 = *piVar18;
                  puVar39 = (undefined8 *)(local_178 + 0x18);
                  do {
                    bVar9 = *(byte *)((long)puVar39 + 0x17);
                    sVar29 = puVar39[1];
                    if (-1 < (char)bVar9) {
                      sVar29 = (ulong)bVar9;
                    }
                    if (sVar29 == sVar32) {
                      puVar3 = (void *)*puVar39;
                      if (-1 < (char)bVar9) {
                        puVar3 = puVar39;
                      }
                      iVar15 = _memcmp(puVar3,piVar35,sVar32);
                      if (iVar15 == 0) goto LAB_04161280;
                    }
                    if ((-1 < iVar14) && (*(int *)(puVar39 + 3) == iVar14)) goto LAB_04161280;
                    puVar39 = puVar39 + 10;
                    lVar28 = lVar28 + -0x50;
                  } while (lVar28 != 0);
                }
                if ((DAT_0eee6cf8 != 0) && (lVar28 = DAT_0eee6cf8, FUN_01a1fb78(), lVar28 != 0)) {
                  FUN_01a1fb78(DAT_0eee6cf8);
                  FUN_0221ad20(&local_a8);
                  lVar28 = local_a0 << 3;
                  if (lVar28 == 0) {
                    bVar11 = true;
                  }
                  else {
                    pppppplVar27 = local_a8;
                    do {
                      ppppplVar37 = *pppppplVar27;
                      if (((ppppplVar37 != (long *****)0x0) &&
                          (*(long ******)(lVar6 + 0x28) != ppppplVar37)) &&
                         (((ulong)ppppplVar37[9] & 1) == 0)) {
                        acStack_88[0] = '\0';
                        acStack_88[1] = '\0';
                        acStack_88[2] = '\0';
                        acStack_88[3] = '\0';
                        acStack_88[4] = '\0';
                        acStack_88[5] = '\0';
                        acStack_88[6] = '\0';
                        acStack_88[7] = '\0';
                        local_90 = (long *******)0x0;
                        local_78 = 0;
                        acStack_88[8] = '\0';
                        uStack_7f = 0;
                        cStack_7a = '\0';
                        bStack_79 = 0;
                        if (((ulong)ppppplVar37[9] & 1) == 0) {
                          (*(code *)(*ppppplVar37)[0x2d])(ppppplVar37);
                          FUN_0410374c(&local_90);
                          if ((char)local_78 == '\0') goto LAB_04161b98;
                          sVar32 = CONCAT26(acStack_88._6_2_,acStack_88._0_6_);
                          if (-1 < (char)bStack_79) {
                            sVar32 = (ulong)bStack_79;
                          }
                          bVar9 = *(byte *)((long)piVar18 + 0x67);
                          sVar29 = *(size_t *)(piVar18 + 0x16);
                          if (-1 < (char)bVar9) {
                            sVar29 = (ulong)bVar9;
                          }
                          if (sVar32 != sVar29) goto LAB_04161b98;
                          ppppppplVar20 = local_90;
                          if (-1 < (char)bStack_79) {
                            ppppppplVar20 = (long *******)&local_90;
                          }
                          piVar35 = *(int **)(piVar18 + 0x14);
                          if (-1 < (char)bVar9) {
                            piVar35 = piVar18 + 0x14;
                          }
                          iVar14 = _memcmp(ppppppplVar20,piVar35,sVar32);
                          if (iVar14 != 0) goto LAB_04161b98;
LAB_04161be8:
                          bVar11 = false;
                        }
                        else {
LAB_04161b98:
                          if (((((ulong)ppppplVar37[9] & 1) == 0) &&
                              ((*(code *)(*ppppplVar37)[0x2d])(), ppppplVar37 != (long *****)0x0))
                             && (ppppplVar23 = ppppplVar37, FUN_004bcc4c(),
                                ppppplVar23 != (long *****)0x0)) {
                            FUN_002bea28(ppppplVar37,"aside.account_id",0x10);
                            if ((-1 < (int)ppppplVar37) && (*piVar18 == (int)ppppplVar37))
                            goto LAB_04161be8;
                          }
                          bVar11 = true;
                        }
                        if (!bVar11) {
                          bVar11 = false;
                          goto LAB_041619c0;
                        }
                      }
                      pppppplVar27 = pppppplVar27 + 1;
                      lVar28 = lVar28 + -8;
                    } while (lVar28 != 0);
                    bVar11 = true;
                  }
LAB_041619c0:
                  if (local_a8 != (long ******)0x0) {
                    if ((local_a0 & 0x1fffffffffffffff) != 0) {
                      lVar28 = local_a0 * -8;
                      pppppplVar27 = local_a8 + local_a0;
                      do {
                        pppppplVar27 = pppppplVar27 + -1;
                        if (pppppplVar27 == (long ******)0x0) goto LAB_04162108;
                        lVar28 = lVar28 + 8;
                      } while (lVar28 != 0);
                    }
                    local_a0 = 0;
                    FUN_00008eb8(local_a8,local_98 << 3);
                  }
                  if (!bVar11) goto LAB_04161280;
                }
                plVar22 = *(long **)(lVar6 + 0x28);
                if ((plVar22 != (long *)0x0) && ((*(byte *)(plVar22 + 9) & 1) == 0)) {
                  (**(code **)(*plVar22 + 0x168))();
                  FUN_04103c38();
                  plVar22 = *(long **)(lVar6 + 0x28);
                }
                if (*(char *)((long)piVar18 + 0x99) != '\0') {
                  FUN_041042ec(plVar22,1);
                  plVar22 = *(long **)(lVar6 + 0x28);
                }
                if ((plVar22 != (long *)0x0) && ((*(byte *)(plVar22 + 9) & 1) == 0)) {
                  (**(code **)(*plVar22 + 0x168))();
                  FUN_041040a4();
                  plVar22 = *(long **)(lVar6 + 0x28);
                }
                if ((*(byte *)((long)piVar18 + 0x99) & 1) == 0) {
                  FUN_041042ec(plVar22,0);
                  plVar22 = *(long **)(lVar6 + 0x28);
                }
                FUN_041043ac(plVar22,piVar18 + 2,piVar18 + 0x20);
                FUN_04160630(lVar6);
                if ((char)local_128 == '\0') {
                  if (*(char *)((long)piVar18 + 0x67) < '\0') {
                    FUN_00018218(&local_140,*(undefined8 *)(piVar18 + 0x14),
                                 *(undefined8 *)(piVar18 + 0x16));
                  }
                  else {
                    pppppplStack_138 = *(long *******)(piVar18 + 0x16);
                    local_140 = (long *******)*plVar16;
                    local_130 = *(long *******)(piVar18 + 0x18);
                  }
                  local_128 = CONCAT71(local_128._1_7_,1);
                }
                else if (&local_140 != (long ********)(piVar18 + 0x14)) {
                  bVar9 = *(byte *)((long)piVar18 + 0x67);
                  if ((long)local_130 < 0) {
                    uVar24 = *(ulong *)(piVar18 + 0x16);
                    plVar22 = *(long **)(piVar18 + 0x14);
                    if (-1 < (char)bVar9) {
                      uVar24 = (ulong)bVar9;
                      plVar22 = plVar16;
                    }
                    FUN_004a8c00(&local_140,plVar22,uVar24);
                  }
                  else if ((char)bVar9 < '\0') {
                    FUN_004a8ab4(&local_140,*(undefined8 *)(piVar18 + 0x14),
                                 *(undefined8 *)(piVar18 + 0x16));
                  }
                  else {
                    pppppplStack_138 = *(long *******)(piVar18 + 0x16);
                    local_140 = (long *******)*plVar16;
                    local_130 = *(long *******)(piVar18 + 0x18);
                  }
                }
              }
            }
          }
        }
LAB_04161280:
        if ((local_128 & 1) == 0) {
          pppppppuVar4 = local_108;
          if (-1 < (long)(char)local_f8._7_1_) {
            pppppppuVar4 = &local_108;
          }
          uVar24 = local_100;
          if (-1 < (long)local_f8) {
            uVar24 = (long)(char)local_f8._7_1_;
          }
          pppppppuVar1 = local_120;
          if (-1 < (long)local_110._7_1_) {
            pppppppuVar1 = &local_120;
          }
          lVar28 = lStack_118;
          if (-1 < (long)local_110) {
            lVar28 = (long)local_110._7_1_;
          }
          puVar17 = (undefined1 *)local_210;
          FUN_040fff68(puVar17,pppppppuVar4,uVar24,pppppppuVar1,lVar28,0,0);
          uVar31 = (uint)puVar17;
          plVar16 = *(long **)(lVar6 + 0x28);
joined_r0x04161464:
          if (plVar16 != (long *)0x0) {
            if ((((*(byte *)(plVar16 + 9) & 1) == 0) &&
                ((**(code **)(*plVar16 + 0x168))(), plVar16 != (long *)0x0)) &&
               (plVar22 = plVar16, FUN_004bcc4c(), plVar22 != (long *)0x0)) {
              FUN_00306500(plVar16,"aside.bootstrap_complete",0x18);
              uVar34 = uVar31 | (uint)plVar16 ^ 1;
            }
            else {
              uVar34 = 1;
            }
            plVar16 = *(long **)(lVar6 + 0x28);
            if ((plVar16 != (long *)0x0) && ((*(byte *)(plVar16 + 9) & 1) == 0)) {
              (**(code **)(*plVar16 + 0x168))();
              local_90 = (long *******)CONCAT71(local_90._1_7_,(char)uVar31);
              local_78 = CONCAT71(local_78._1_7_,1);
              FUN_015098a8();
              FUN_0161e7d4(&local_90);
            }
            if ((uVar34 & 1) == 0) {
LAB_04161504:
              plVar22 = *(long **)(lVar6 + 0x28);
LAB_04161508:
              FUN_041603e4(plVar22);
            }
          }
LAB_0416150c:
          FUN_0415f828(lVar6);
          FUN_041603e4(*(undefined8 *)(lVar6 + 0x28));
          plVar16 = *(long **)(lVar6 + 0x28);
          if ((plVar16 != (long *)0x0) && ((*(byte *)(plVar16 + 9) & 1) == 0)) {
            (**(code **)(*plVar16 + 0x168))();
            FUN_04103d40();
          }
LAB_0416153c:
          FUN_0415fab4(lVar6);
        }
        else {
          ppppppplVar20 = local_140;
          if (-1 < (long)local_130._7_1_) {
            ppppppplVar20 = (long *******)&local_140;
          }
          pppppplVar27 = pppppplStack_138;
          if (-1 < (long)local_130) {
            pppppplVar27 = (long ******)(long)local_130._7_1_;
          }
          piVar18 = (int *)local_210;
          FUN_040ff848(piVar18,ppppppplVar20,pppppplVar27);
          if (piVar18 == (int *)0x0) {
            plVar16 = *(long **)(lVar6 + 0x28);
            if (plVar16 != (long *)0x0) {
              if ((*(byte *)(plVar16 + 9) & 1) == 0) {
                (**(code **)(*plVar16 + 0x168))();
                if (plVar16 != (long *)0x0) {
                  plVar22 = plVar16;
                  FUN_004bcc4c(plVar16,"aside.bootstrap_complete",0x18);
                  if (plVar22 == (long *)0x0) goto LAB_041613b0;
                  FUN_00306500(plVar16,"aside.bootstrap_complete",0x18);
                }
              }
              else {
LAB_041613b0:
                plVar16 = (long *)0x0;
              }
              plVar22 = *(long **)(lVar6 + 0x28);
              if ((plVar22 != (long *)0x0) && ((*(byte *)(plVar22 + 9) & 1) == 0)) {
                (**(code **)(*plVar22 + 0x168))();
                local_90 = (long *******)((ulong)local_90 & 0xffffffffffffff00);
                local_78 = CONCAT71(local_78._1_7_,1);
                FUN_015098a8();
                FUN_0161e7d4(&local_90);
                if ((int)plVar16 == 0) goto LAB_0416150c;
                goto LAB_04161504;
              }
              if ((int)plVar16 == 0) goto LAB_0416150c;
              goto LAB_04161508;
            }
            goto LAB_0416150c;
          }
          if (((!bVar13) && ((*(byte *)(piVar18 + 0x26) & 1) == 0)) &&
             ((*(byte *)((long)piVar18 + 0x99) & 1) == 0)) {
            pppppppuVar4 = local_108;
            if (-1 < (long)(char)local_f8._7_1_) {
              pppppppuVar4 = &local_108;
            }
            uVar24 = local_100;
            if (-1 < (long)local_f8) {
              uVar24 = (long)(char)local_f8._7_1_;
            }
            pppppppuVar1 = local_120;
            if (-1 < (long)local_110._7_1_) {
              pppppppuVar1 = &local_120;
            }
            lVar28 = lStack_118;
            if (-1 < (long)local_110) {
              lVar28 = (long)local_110._7_1_;
            }
            puVar17 = (undefined1 *)local_210;
            FUN_040fff68(puVar17,pppppppuVar4,uVar24,pppppppuVar1,lVar28,0,0);
            uVar31 = (uint)puVar17;
            plVar16 = *(long **)(lVar6 + 0x28);
            goto joined_r0x04161464;
          }
          if ((local_128 & 1) == 0) goto LAB_04162108;
          ppppppplVar20 = local_140;
          if (-1 < (long)local_130._7_1_) {
            ppppppplVar20 = (long *******)&local_140;
          }
          pppppplVar27 = pppppplStack_138;
          if (-1 < (long)local_130) {
            pppppplVar27 = (long ******)(long)local_130._7_1_;
          }
          puVar17 = (undefined1 *)local_210;
          FUN_040ffec0(puVar17,ppppppplVar20,pppppplVar27);
          plVar16 = *(long **)(lVar6 + 0x28);
          if (plVar16 != (long *)0x0) {
            if ((((*(byte *)(plVar16 + 9) & 1) == 0) &&
                ((**(code **)(*plVar16 + 0x168))(), plVar16 != (long *)0x0)) &&
               (plVar22 = plVar16, FUN_004bcc4c(), plVar22 != (long *)0x0)) {
              FUN_00306500(plVar16,"aside.bootstrap_complete",0x18);
              uVar31 = (uint)puVar17 | (uint)plVar16 ^ 1;
            }
            else {
              uVar31 = 1;
            }
            plVar16 = *(long **)(lVar6 + 0x28);
            if ((plVar16 != (long *)0x0) && ((*(byte *)(plVar16 + 9) & 1) == 0)) {
              (**(code **)(*plVar16 + 0x168))();
              local_90 = (long *******)CONCAT71(local_90._1_7_,(char)puVar17);
              local_78 = CONCAT71(local_78._1_7_,1);
              FUN_015098a8();
              FUN_0161e7d4(&local_90);
            }
            if ((uVar31 & 1) == 0) {
              FUN_041603e4(*(undefined8 *)(lVar6 + 0x28));
            }
          }
          uVar30 = (ulong)local_f8._7_1_;
          uVar24 = local_100;
          if (-1 < (long)local_f8) {
            uVar24 = uVar30;
          }
          if (uVar24 != 0) {
            uVar24 = *(ulong *)(piVar18 + 0x16);
            if ((*(byte *)((long)piVar18 + 0x67) & 0x80) == 0) {
              uVar24 = (ulong)*(byte *)((long)piVar18 + 0x67);
            }
            if (uVar24 != 0) {
              piVar35 = piVar18 + 0x14;
              local_f0 = (undefined8 *******)0x0;
              sStack_e8 = 0;
              local_e0 = 0;
              if (*(char *)(lVar6 + 0x4f) < '\0') {
                FUN_00018218(&local_f0,*(undefined8 *)(lVar6 + 0x38),*(undefined8 *)(lVar6 + 0x40));
                uVar30 = (ulong)local_f8._7_1_;
              }
              else {
                sStack_e8 = *(size_t *)(lVar6 + 0x40);
                local_f0 = *(undefined8 ********)(lVar6 + 0x38);
                local_e0 = *(ulong *)(lVar6 + 0x48);
              }
              uVar24 = local_100;
              pppppppuVar4 = local_108;
              if (-1 < (char)local_f8._7_1_) {
                uVar24 = uVar30;
                pppppppuVar4 = &local_108;
              }
              pppppppuVar1 = local_f0;
              if (-1 < (long)(char)local_e0._7_1_) {
                pppppppuVar1 = &local_f0;
              }
              sVar32 = sStack_e8;
              if (-1 < (long)local_e0) {
                sVar32 = (long)(char)local_e0._7_1_;
              }
              puVar17 = (undefined1 *)local_210;
              FUN_040ff964(puVar17,pppppppuVar4,uVar24,pppppppuVar1,sVar32);
              if (puVar17 == (undefined1 *)0x0) {
LAB_041616dc:
                if ((*(long *)(lVar6 + 0x28) != 0) &&
                   ((*(byte *)(*(long *)(lVar6 + 0x28) + 0x48) & 1) == 0)) {
                  uVar24 = local_100;
                  if (-1 < (long)local_f8) {
                    uVar24 = local_f8 >> 0x38;
                  }
                  if (uVar24 != 0) {
                    uVar24 = *(ulong *)(piVar18 + 0x16);
                    if ((*(byte *)((long)piVar18 + 0x67) & 0x80) == 0) {
                      uVar24 = (ulong)*(byte *)((long)piVar18 + 0x67);
                    }
                    if ((uVar24 != 0) && (DAT_0eee6cf8 != 0)) {
                      local_a8 = (long ******)0x0;
                      local_a0 = 0;
                      local_98 = 0;
                      pppppppuVar4 = local_108;
                      if (-1 < (long)local_f8) {
                        pppppppuVar4 = &local_108;
                      }
                      FUN_016a05c8(&local_a8,"profileId",9,pppppppuVar4);
                      lVar28 = (long)*(char *)((long)piVar18 + 0x67);
                      if (lVar28 < 0) {
                        piVar35 = *(int **)(piVar18 + 0x14);
                        lVar28 = *(long *)(piVar18 + 0x16);
                      }
                      FUN_016a05c8(&local_a8,"userId",6,piVar35,lVar28);
                      if (-1 < *piVar18) {
                        local_90 = (long *******)CONCAT44(local_90._4_4_,*piVar18);
                        local_78 = CONCAT71(local_78._1_7_,2);
                        FUN_0053aec0(&local_a8,"accountId",9,&local_90);
                        if (((char)local_78 != -1) && ((char)local_78 != '\x02')) {
                          (*(code *)(&PTR_FUN_0e8c1878)[local_78 & 0xff])(&local_c0,&local_90);
                        }
                      }
                      uVar24 = *(ulong *)(lVar6 + 0x28);
                      FUN_041035c0();
                      if ((uVar24 >> 0x20 & 1) != 0) {
                        local_90 = (long *******)CONCAT44(local_90._4_4_,(int)uVar24);
                        local_78 = CONCAT71(local_78._1_7_,2);
                        FUN_0053aec0(&local_a8,"profileIndex",0xc,&local_90);
                        if (((char)local_78 != -1) && ((char)local_78 != '\x02')) {
                          (*(code *)(&PTR_FUN_0e8c1878)[local_78 & 0xff])(&local_c0,&local_90);
                        }
                      }
                      local_c0 = (undefined8 *******)0x0;
                      uStack_b8 = 0;
                      local_b0 = 0;
                      if (*(char *)(lVar6 + 0x4f) < '\0') {
                        FUN_00018218(&local_c0,*(undefined8 *)(lVar6 + 0x38),
                                     *(undefined8 *)(lVar6 + 0x40));
                      }
                      else {
                        uStack_b8 = *(ulong *)(lVar6 + 0x40);
                        local_c0 = *(undefined8 ********)(lVar6 + 0x38);
                        local_b0 = *(ulong *)(lVar6 + 0x48);
                      }
                      uVar24 = uStack_b8;
                      if (-1 < (long)local_b0) {
                        uVar24 = local_b0 >> 0x38;
                      }
                      if (uVar24 != 0) {
                        pppppppuVar4 = local_c0;
                        if (-1 < (long)local_b0) {
                          pppppppuVar4 = &local_c0;
                        }
                        FUN_016a05c8(&local_a8,"profilePath",0xb,pppppppuVar4);
                      }
                      local_d8 = 0;
                      uStack_d0 = 0;
                      local_c8 = 0;
                      local_90 = &local_a8;
                      acStack_88[8] = '\x06';
                      ppppppplVar20 = (long *******)&local_90;
                      FUN_0274a7a0(ppppppplVar20,0,&local_d8,200);
                      iVar14 = (int)ppppppplVar20;
                      if (iVar14 != 0) {
                        if (((DAT_0ef008f8 == 0) && (FUN_02a79b5c(), DAT_0ef008f8 == 0)) &&
                           (FUN_00016cc0(), iVar14 == 0)) {
                    /* WARNING: Does not return */
                          pcVar12 = (code *)SoftwareBreakpoint(0,0x41621f8);
                          (*pcVar12)();
                        }
                        lVar28 = *(long *)(DAT_0ef008f8 + 0x458);
                        if ((lVar28 != 0) &&
                           (uVar31 = *(uint *)(lVar28 + 8), *(uint *)(lVar28 + 8) = uVar31 + 1,
                           0xfffffffe < uVar31)) {
                    /* WARNING: Does not return */
                          pcVar12 = (code *)SoftwareBreakpoint(0,0x41621c4);
                          (*pcVar12)();
                        }
                        piVar35 = *(int **)(lVar6 + 0xc0);
                        if ((piVar35 != (int *)0x0) &&
                           (iVar14 = *piVar35, *piVar35 = iVar14 + 1, iVar14 == 0x7fffffff)) {
                    /* WARNING: Does not return */
                          pcVar12 = (code *)SoftwareBreakpoint(0,0x41621d0);
                          (*pcVar12)();
                        }
                        uVar36 = *(undefined8 *)(lVar6 + 200);
                        bStack_79 = 0x16;
                        if ("http://127.0.0.1:21420" < &cStack_7a &&
                            &local_90 < (long *******)0xcefbef8) goto LAB_04162108;
                        acStack_88[0] = s_http___127_0_0_1_21420_0cefbef7[8];
                        acStack_88[1] = s_http___127_0_0_1_21420_0cefbef7[9];
                        acStack_88[2] = s_http___127_0_0_1_21420_0cefbef7[10];
                        acStack_88[3] = s_http___127_0_0_1_21420_0cefbef7[0xb];
                        acStack_88[4] = s_http___127_0_0_1_21420_0cefbef7[0xc];
                        acStack_88[5] = s_http___127_0_0_1_21420_0cefbef7[0xd];
                        local_90 = (long *******)s_http___127_0_0_1_21420_0cefbef7._0_8_;
                        acStack_88[6] = s_http___127_0_0_1_21420_0cefbef7[0xe];
                        acStack_88[7] = s_http___127_0_0_1_21420_0cefbef7[0xf];
                        acStack_88[8] = (char)s_http___127_0_0_1_21420_0cefbef7._16_6_;
                        uStack_7f = SUB65(s_http___127_0_0_1_21420_0cefbef7._16_6_,1);
                        cStack_7a = '\0';
                        ppppppplVar20 = (long *******)&local_90;
                        FUN_0009a420(ppppppplVar20,"/accounts/profile-binding",0x19);
                        pppppplVar40 = ppppppplVar20[1];
                        pppppplVar33 = *ppppppplVar20;
                        pppppplVar27 = ppppppplVar20[2];
                        ppppppplVar20[1] = (long ******)0x0;
                        ppppppplVar20[2] = (long ******)0x0;
                        *ppppppplVar20 = (long ******)0x0;
                        pcVar25 = section_00000068.sectname + 8;
                        FUN_0000f368();
                        pcVar25[0] = '\x01';
                        pcVar25[1] = '\0';
                        pcVar25[2] = '\0';
                        pcVar25[3] = '\0';
                        *(undefined1 **)(pcVar25 + 8) = &LAB_04162200;
                        *(code **)(pcVar25 + 0x10) = FUN_041622fc;
                        *(undefined1 **)(pcVar25 + 0x18) = &LAB_0406a280;
                        *(code **)(pcVar25 + 0x20) = FUN_04160700;
                        *(undefined8 *)(pcVar25 + 0x28) = 0;
                        *(int **)(pcVar25 + 0x30) = piVar35;
                        *(undefined8 *)(pcVar25 + 0x38) = uVar36;
                        *(long *******)(pcVar25 + 0x48) = pppppplVar40;
                        *(long *******)(pcVar25 + 0x40) = pppppplVar33;
                        *(long *******)(pcVar25 + 0x50) = pppppplVar27;
                        *(undefined8 *)(pcVar25 + 0x60) = uStack_d0;
                        *(undefined8 *)(pcVar25 + 0x58) = local_d8;
                        *(undefined8 *)(pcVar25 + 0x68) = local_c8;
                        local_d8 = 0;
                        uStack_d0 = 0;
                        local_c8 = 0;
                        FUN_0415c9e8(lVar28,pcVar25);
                      }
                      FUN_0095e480(&local_a8);
                    }
                  }
                }
                uVar31 = (uint)local_e0._7_1_;
              }
              else {
                bVar9 = puVar17[0x2f];
                sVar32 = *(size_t *)(puVar17 + 0x20);
                if (-1 < (char)bVar9) {
                  sVar32 = (ulong)bVar9;
                }
                bVar8 = *(byte *)((long)piVar18 + 0x67);
                sVar29 = *(size_t *)(piVar18 + 0x16);
                if (-1 < (char)bVar8) {
                  sVar29 = (ulong)bVar8;
                }
                if (sVar32 != sVar29) goto LAB_041616dc;
                puVar39 = *(void **)(puVar17 + 0x18);
                if (-1 < (char)bVar9) {
                  puVar39 = (undefined8 *)(puVar17 + 0x18);
                }
                piVar2 = *(int **)piVar35;
                if (-1 < (char)bVar8) {
                  piVar2 = piVar35;
                }
                iVar14 = _memcmp(puVar39,piVar2,sVar32);
                if ((iVar14 != 0) || (*(int *)(puVar17 + 0x30) != *piVar18)) goto LAB_041616dc;
                bVar9 = puVar17[0x4f];
                sVar32 = *(size_t *)(puVar17 + 0x40);
                if (-1 < (char)bVar9) {
                  sVar32 = (ulong)bVar9;
                }
                uVar31 = (uint)(char)local_e0._7_1_;
                sVar29 = sStack_e8;
                if (-1 < (int)uVar31) {
                  sVar29 = (ulong)local_e0._7_1_;
                }
                if (sVar32 != sVar29) goto LAB_041616dc;
                puVar39 = *(void **)(puVar17 + 0x38);
                if (-1 < (char)bVar9) {
                  puVar39 = (undefined8 *)(puVar17 + 0x38);
                }
                pppppppuVar4 = local_f0;
                if (-1 < (int)uVar31) {
                  pppppppuVar4 = &local_f0;
                }
                iVar14 = _memcmp(puVar39,pppppppuVar4,sVar32);
                if (iVar14 != 0) goto LAB_041616dc;
              }
              if ((uVar31 >> 7 & 1) != 0) {
                FUN_00008eb8(local_f0,local_e0 & 0x7fffffffffffffff);
              }
            }
          }
          if (((*(byte *)(piVar18 + 0x26) & 1) == 0) && (*(char *)((long)piVar18 + 0x99) == '\0')) {
LAB_041617f8:
            FUN_0415f828(lVar6);
            FUN_041603e4(*(undefined8 *)(lVar6 + 0x28));
            if ((local_128 & 1) == 0) {
LAB_04162108:
                    /* WARNING: Does not return */
              pcVar12 = (code *)SoftwareBreakpoint(1,0x416210c);
              (*pcVar12)();
            }
            plVar16 = *(long **)(lVar6 + 0x28);
            if ((plVar16 != (long *)0x0) && ((char)plVar16[9] == '\0')) {
              (**(code **)(*plVar16 + 0x168))();
              FUN_04103c38();
              plVar16 = *(long **)(lVar6 + 0x28);
              local_90 = (long *******)0x0;
              acStack_88[0] = '\0';
              acStack_88[1] = '\0';
              acStack_88[2] = '\0';
              acStack_88[3] = '\0';
              acStack_88[4] = '\0';
              acStack_88[5] = '\0';
              acStack_88[6] = '\0';
              acStack_88[7] = '\0';
              acStack_88[8] = '\0';
              uStack_7f = 0;
              cStack_7a = '\0';
              bStack_79 = 0;
              if ((plVar16 != (long *)0x0) && ((*(byte *)(plVar16 + 9) & 1) == 0)) {
                (**(code **)(*plVar16 + 0x168))();
                FUN_041040a4();
              }
            }
            FUN_041042ec(*(undefined8 *)(lVar6 + 0x28),0);
            local_90 = (long *******)0x0;
            acStack_88[0] = '\0';
            acStack_88[1] = '\0';
            acStack_88[2] = '\0';
            acStack_88[3] = '\0';
            acStack_88[4] = '\0';
            acStack_88[5] = '\0';
            acStack_88[6] = '\0';
            acStack_88[7] = '\0';
            acStack_88[8] = '\0';
            uStack_7f = 0;
            cStack_7a = '\0';
            bStack_79 = 0;
            local_a8 = (long ******)0x0;
            local_a0 = 0;
            local_98 = 0;
            FUN_041043ac(*(undefined8 *)(lVar6 + 0x28),&local_90,&local_a8);
            goto LAB_0416153c;
          }
          lVar28 = (long)*(char *)((long)piVar18 + 0x7f);
          if (lVar28 < 0) {
            lVar28 = *(long *)(piVar18 + 0x1c);
          }
          if (lVar28 == 0) goto LAB_041617f8;
          plVar16 = *(long **)(lVar6 + 0x28);
          if ((plVar16 != (long *)0x0) && ((*(byte *)(plVar16 + 9) & 1) == 0)) {
            (**(code **)(*plVar16 + 0x168))();
            FUN_04103c38();
            plVar16 = *(long **)(lVar6 + 0x28);
          }
          if (*(char *)((long)piVar18 + 0x99) != '\0') {
            FUN_041042ec(plVar16,1);
            plVar16 = *(long **)(lVar6 + 0x28);
          }
          if ((plVar16 != (long *)0x0) && ((*(byte *)(plVar16 + 9) & 1) == 0)) {
            (**(code **)(*plVar16 + 0x168))();
            FUN_041040a4();
            plVar16 = *(long **)(lVar6 + 0x28);
          }
          if ((*(byte *)((long)piVar18 + 0x99) & 1) == 0) {
            FUN_041042ec(plVar16,0);
            plVar16 = *(long **)(lVar6 + 0x28);
          }
          FUN_041043ac(plVar16,piVar18 + 2,piVar18 + 0x20);
          lVar28 = (long)*(char *)((long)piVar18 + 0x1f);
          if (lVar28 < 0) {
            lVar28 = *(long *)(piVar18 + 4);
          }
          piVar35 = piVar18 + 0x1a;
          if (lVar28 != 0) {
            piVar35 = piVar18 + 2;
          }
          FUN_0415fb9c(lVar6,piVar35,piVar18 + 0x1a);
          FUN_0415f2f4(lVar6,piVar18 + 0x20);
          FUN_04160630(lVar6);
        }
        if (((char)local_128 != '\0') && ((long)local_130 < 0)) {
          FUN_00008eb8(local_140,(ulong)local_130 & 0x7fffffffffffffff);
        }
        if ((long)local_110 < 0) {
          FUN_00008eb8(local_120,local_110 & 0x7fffffffffffffff);
        }
      }
    }
    else {
      if (cVar10 != '\0') goto LAB_04160db0;
LAB_04160e6c:
      uVar30 = uVar24;
      if (-1 < (long)uVar26) {
        uVar30 = uVar26 >> 0x38;
      }
      if (uVar30 == 0) goto LAB_04160db0;
      if (cVar10 < '\0') {
        FUN_00008eb8(*(undefined8 *)(lVar6 + 0x70),*(ulong *)(lVar6 + 0x80) & 0x7fffffffffffffff);
      }
      *(ulong *)(lVar6 + 0x70) = uVar38;
      *(ulong *)(lVar6 + 0x78) = uVar24;
      *(ulong *)(lVar6 + 0x80) = uVar26;
      uVar26 = uVar26 & 0xffffffffffffff;
      uVar38 = uVar38 & 0xffffffffffffff00;
      FUN_0415fec0(lVar6);
      if ((local_148 & 1) != 0) goto LAB_04160ea0;
LAB_04160db4:
      FUN_0415ea30(lVar6);
    }
    if (*(char *)(lVar6 + 0xa1) != '\0') {
      *(undefined1 *)(lVar6 + 0xa1) = 0;
      FUN_0415ebd0(lVar6,0);
    }
    if (local_148 != 0) {
      FUN_040ff504(local_210);
    }
    if ((long)uVar26 < 0) {
      FUN_00008eb8(uVar38,uVar26 & 0x7fffffffffffffff);
    }
  }
  LOAcquire();
  iVar14 = *piVar5;
  *piVar5 = iVar14 + -1;
  LORelease();
  if (iVar14 == 1) {
    FUN_00008eb8(piVar5,8);
  }
LAB_04160df8:
  if ((local_220 & 1) != 0) {
    FUN_040ff504(local_2e8);
  }
  if ((long)local_2f0 < 0) {
    FUN_00008eb8(local_300,local_2f0 & 0x7fffffffffffffff);
  }
  return;
}


