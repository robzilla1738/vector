// func FUN_040fd7f4 @ 040fd7f4 size 1688

void FUN_040fd7f4(long *param_1,undefined8 param_2,undefined8 *param_3)

{
  undefined8 *puVar1;
  undefined8 ****ppppuVar2;
  undefined8 *****pppppuVar3;
  undefined8 *****pppppuVar4;
  undefined8 *****pppppuVar5;
  undefined8 *****pppppuVar6;
  char cVar7;
  code *pcVar8;
  int iVar9;
  long *plVar10;
  qword *pqVar11;
  long *plVar12;
  undefined8 *puVar13;
  long lVar14;
  undefined8 *puVar15;
  long lVar16;
  undefined8 *****pppppuVar17;
  undefined8 *****pppppuVar18;
  undefined8 ****ppppuVar19;
  undefined8 ****ppppuVar20;
  undefined8 local_110;
  undefined8 uStack_108;
  ulong local_100;
  undefined8 ****local_f0;
  undefined8 ****ppppuStack_e8;
  ulong local_e0;
  undefined8 ****local_d0;
  undefined8 ****ppppuStack_c8;
  ulong local_c0;
  undefined8 ****local_b0;
  undefined8 ****ppppuStack_a8;
  undefined8 local_a0;
  undefined8 ****local_98;
  undefined8 ****local_90;
  long local_88;
  long *local_80;
  ulong local_78;
  long local_70;
  
  local_80 = (long *)0x0;
  local_78 = 0;
  local_70 = 0;
  FUN_02b3cee0(&local_80);
  local_90 = (undefined8 *****)0x0;
  local_88 = 0;
  local_98 = &local_90;
  if ((local_78 & 0x1fffffffffffffff) != 0) {
    plVar12 = local_80 + local_78;
    plVar10 = local_80;
    do {
      lVar14 = *plVar10;
      if (lVar14 != 0) {
        if (*(char *)(lVar14 + 0x2f) < '\0') {
          FUN_00018218(&local_f0,*(undefined8 *)(lVar14 + 0x18),*(undefined8 *)(lVar14 + 0x20));
        }
        else {
          ppppuStack_e8 = *(undefined8 *****)(lVar14 + 0x20);
          local_f0 = *(undefined8 *****)(lVar14 + 0x18);
          local_e0 = *(ulong *)(lVar14 + 0x28);
        }
        FUN_0147166c(&local_d0,&local_f0);
        if ((long)local_c0 < 0) {
          FUN_00018218(&local_b0,local_d0,ppppuStack_c8);
        }
        else {
          ppppuStack_a8 = ppppuStack_c8;
          local_b0 = local_d0;
          local_a0 = local_c0;
        }
        if (*(char *)(lVar14 + 0x2f) < '\0') {
          FUN_00018218(&local_110,*(undefined8 *)(lVar14 + 0x18),*(undefined8 *)(lVar14 + 0x20));
        }
        else {
          uStack_108 = *(undefined8 *)(lVar14 + 0x20);
          local_110 = *(undefined8 *)(lVar14 + 0x18);
          local_100 = *(ulong *)(lVar14 + 0x28);
        }
        pppppuVar18 = &local_90;
        pppppuVar17 = &local_90;
        if ((undefined8 *****)local_90 != (undefined8 *****)0x0) {
          pppppuVar3 = (undefined8 *****)local_b0;
          if (-1 < (long)local_a0._7_1_) {
            pppppuVar3 = &local_b0;
          }
          pppppuVar5 = (undefined8 *****)local_90;
          pppppuVar4 = (undefined8 *****)ppppuStack_a8;
          if (-1 < (long)local_a0) {
            pppppuVar4 = (undefined8 *****)(long)local_a0._7_1_;
          }
          do {
            while( true ) {
              pppppuVar18 = pppppuVar5;
              cVar7 = *(char *)((long)pppppuVar18 + 0x37);
              pppppuVar17 = (undefined8 *****)pppppuVar18[4];
              if (-1 < (long)cVar7) {
                pppppuVar17 = pppppuVar18 + 4;
              }
              pppppuVar5 = (undefined8 *****)pppppuVar18[5];
              if (-1 < cVar7) {
                pppppuVar5 = (undefined8 *****)(long)cVar7;
              }
              pppppuVar6 = pppppuVar5;
              if (pppppuVar4 <= pppppuVar5) {
                pppppuVar6 = pppppuVar4;
              }
              iVar9 = _memcmp(pppppuVar3,pppppuVar17,(size_t)pppppuVar6);
              if (iVar9 != 0) break;
              if (pppppuVar4 == pppppuVar5) goto LAB_040fd918;
              if (pppppuVar5 <= pppppuVar4) goto LAB_040fde28;
LAB_040fde68:
              pppppuVar5 = (undefined8 *****)*pppppuVar18;
              pppppuVar17 = pppppuVar18;
              if ((undefined8 *****)*pppppuVar18 == (undefined8 *****)0x0) goto LAB_040fd89c;
            }
            if (iVar9 < 0) goto LAB_040fde68;
LAB_040fde28:
            pppppuVar5 = (undefined8 *****)pppppuVar18[1];
          } while ((undefined8 *****)pppppuVar18[1] != (undefined8 *****)0x0);
          pppppuVar17 = pppppuVar18 + 1;
        }
LAB_040fd89c:
        pqVar11 = &segment_command_00000020.filesize;
        FUN_0000f368();
        if ((pqVar11 == (qword *)0x0) || (pqVar11 + 4 == (qword *)0x0)) goto LAB_040fde00;
        pqVar11[5] = (qword)ppppuStack_a8;
        pqVar11[4] = (qword)local_b0;
        pqVar11[6] = local_a0;
        ppppuStack_a8 = (undefined8 *****)0x0;
        local_a0 = 0;
        local_b0 = (undefined8 *****)0x0;
        pqVar11[8] = uStack_108;
        pqVar11[7] = local_110;
        pqVar11[9] = local_100;
        local_110 = 0;
        uStack_108 = 0;
        local_100 = 0;
        *pqVar11 = 0;
        pqVar11[1] = 0;
        pqVar11[2] = (qword)pppppuVar18;
        *pppppuVar17 = (undefined8 ****)pqVar11;
        if ((undefined8 *****)*local_98 != (undefined8 *****)0x0) {
          pqVar11 = (qword *)*pppppuVar17;
          local_98 = (undefined8 ****)*local_98;
        }
        FUN_0005ba60(local_90,pqVar11);
        local_88 = local_88 + 1;
LAB_040fd918:
        if ((long)local_100 < 0) {
          FUN_00008eb8(local_110,local_100 & 0x7fffffffffffffff);
        }
        if ((long)local_a0 < 0) {
          FUN_00008eb8(local_b0,local_a0 & 0x7fffffffffffffff);
        }
        if ((long)local_c0 < 0) {
          FUN_00008eb8(local_d0,local_c0 & 0x7fffffffffffffff);
        }
        if ((long)local_e0 < 0) {
          FUN_00008eb8(local_f0,local_e0 & 0x7fffffffffffffff);
        }
      }
      plVar10 = plVar10 + 1;
    } while (plVar10 != plVar12);
  }
  *param_1 = 0;
  param_1[1] = 0;
  param_1[2] = 0;
  ppppuStack_a8 = (undefined8 *****)0x0;
  local_a0 = 0;
  local_b0 = &ppppuStack_a8;
  if (param_3 != (undefined8 *)0x0) {
    FUN_00481420(param_3,"aside.vertical_tabs.profile_order",0x21);
    puVar13 = (undefined8 *)*param_3;
    puVar1 = puVar13 + param_3[1] * 4;
    if (puVar1 < puVar13) {
                    /* WARNING: Does not return */
      pcVar8 = (code *)SoftwareBreakpoint(0,0x40fde8c);
      (*pcVar8)();
    }
    if ((param_3[1] & 0x7ffffffffffffff) != 0) {
      do {
        if ((puVar13 != (undefined8 *)0x0) && (*(char *)(puVar13 + 3) == '\x04')) {
          if ((undefined8 *****)ppppuStack_a8 != (undefined8 *****)0x0) {
            cVar7 = *(char *)((long)puVar13 + 0x17);
            puVar15 = (void *)*puVar13;
            if (-1 < (long)cVar7) {
              puVar15 = puVar13;
            }
            pppppuVar18 = (undefined8 *****)ppppuStack_a8;
            ppppuVar19 = (undefined8 ****)puVar13[1];
            if (-1 < cVar7) {
              ppppuVar19 = (undefined8 ****)(long)cVar7;
            }
            do {
              while( true ) {
                cVar7 = *(char *)((long)pppppuVar18 + 0x37);
                pppppuVar17 = (undefined8 *****)pppppuVar18[4];
                if (-1 < (long)cVar7) {
                  pppppuVar17 = pppppuVar18 + 4;
                }
                ppppuVar20 = pppppuVar18[5];
                if (-1 < cVar7) {
                  ppppuVar20 = (undefined8 ****)(long)cVar7;
                }
                ppppuVar2 = ppppuVar20;
                if (ppppuVar19 <= ppppuVar20) {
                  ppppuVar2 = ppppuVar19;
                }
                iVar9 = _memcmp(puVar15,pppppuVar17,(size_t)ppppuVar2);
                if (iVar9 != 0) break;
                if (ppppuVar19 == ppppuVar20) {
                  if (pppppuVar18 != &ppppuStack_a8) goto LAB_040fda6c;
                  goto LAB_040fdaf8;
                }
                if (ppppuVar20 <= ppppuVar19) goto LAB_040fdab0;
LAB_040fdaf0:
                pppppuVar18 = (undefined8 *****)*pppppuVar18;
                if (pppppuVar18 == (undefined8 *****)0x0) goto LAB_040fdaf8;
              }
              if (iVar9 < 0) goto LAB_040fdaf0;
LAB_040fdab0:
              pppppuVar17 = pppppuVar18 + 1;
              pppppuVar18 = (undefined8 *****)*pppppuVar17;
            } while ((undefined8 *****)*pppppuVar17 != (undefined8 *****)0x0);
          }
LAB_040fdaf8:
          if ((undefined8 *****)local_90 != (undefined8 *****)0x0) {
            cVar7 = *(char *)((long)puVar13 + 0x17);
            puVar15 = (undefined8 *)*puVar13;
            if (-1 < (long)cVar7) {
              puVar15 = puVar13;
            }
            pppppuVar18 = (undefined8 *****)local_90;
            ppppuVar19 = (undefined8 ****)puVar13[1];
            if (-1 < cVar7) {
              ppppuVar19 = (undefined8 ****)(long)cVar7;
            }
            do {
              while( true ) {
                cVar7 = *(char *)((long)pppppuVar18 + 0x37);
                pppppuVar17 = (undefined8 *****)pppppuVar18[4];
                if (-1 < (long)cVar7) {
                  pppppuVar17 = pppppuVar18 + 4;
                }
                ppppuVar20 = pppppuVar18[5];
                if (-1 < cVar7) {
                  ppppuVar20 = (undefined8 ****)(long)cVar7;
                }
                ppppuVar2 = ppppuVar20;
                if (ppppuVar19 <= ppppuVar20) {
                  ppppuVar2 = ppppuVar19;
                }
                iVar9 = _memcmp(puVar15,pppppuVar17,(size_t)ppppuVar2);
                if (iVar9 != 0) break;
                if (ppppuVar19 == ppppuVar20) {
                  if (pppppuVar18 != &local_90) {
                    FUN_00f0e580(&local_b0,&local_b0,puVar13);
                    if (param_1[1] == param_1[2]) {
                      plVar10 = param_1;
                      FUN_01797e38(param_1,pppppuVar18 + 7);
                    }
                    else {
                      puVar15 = (undefined8 *)(*param_1 + param_1[1] * 0x18);
                      if (puVar15 == (undefined8 *)0x0) goto LAB_040fde00;
                      if (*(char *)((long)pppppuVar18 + 0x4f) < '\0') {
                        FUN_00018218(puVar15,pppppuVar18[7],pppppuVar18[8]);
                      }
                      else {
                        ppppuVar20 = pppppuVar18[8];
                        ppppuVar19 = pppppuVar18[7];
                        puVar15[2] = pppppuVar18[9];
                        puVar15[1] = ppppuVar20;
                        *puVar15 = ppppuVar19;
                      }
                      plVar10 = puVar15 + 3;
                    }
                    param_1[1] = ((long)plVar10 - *param_1 >> 3) * -0x5555555555555555;
                    if ((long)plVar10 - *param_1 == 0) goto LAB_040fde00;
                  }
                  goto LAB_040fda6c;
                }
                if (ppppuVar20 <= ppppuVar19) goto LAB_040fdb20;
LAB_040fdb60:
                pppppuVar18 = (undefined8 *****)*pppppuVar18;
                if (pppppuVar18 == (undefined8 *****)0x0) goto LAB_040fda6c;
              }
              if (iVar9 < 0) goto LAB_040fdb60;
LAB_040fdb20:
              pppppuVar17 = pppppuVar18 + 1;
              pppppuVar18 = (undefined8 *****)*pppppuVar17;
            } while ((undefined8 *****)*pppppuVar17 != (undefined8 *****)0x0);
          }
        }
LAB_040fda6c:
        puVar13 = puVar13 + 4;
      } while (puVar13 != puVar1);
    }
  }
  plVar10 = local_80;
  for (lVar14 = local_78 << 3; lVar14 != 0; lVar14 = lVar14 + -8) {
    lVar16 = *plVar10;
    if (lVar16 != 0) {
      local_d0 = (undefined8 *****)0x0;
      ppppuStack_c8 = (undefined8 *****)0x0;
      local_c0 = 0;
      if (*(char *)(lVar16 + 0x2f) < '\0') {
        FUN_00018218(&local_110,*(undefined8 *)(lVar16 + 0x18),*(undefined8 *)(lVar16 + 0x20));
      }
      else {
        uStack_108 = *(undefined8 *)(lVar16 + 0x20);
        local_110 = *(undefined8 *)(lVar16 + 0x18);
        local_100 = *(ulong *)(lVar16 + 0x28);
      }
      FUN_0147166c(&local_f0,&local_110);
      if ((long)local_e0 < 0) {
        FUN_00018218(&local_d0,local_f0,ppppuStack_e8);
        if ((long)local_e0 < 0) {
          FUN_00008eb8(local_f0,local_e0 & 0x7fffffffffffffff);
        }
      }
      else {
        ppppuStack_c8 = ppppuStack_e8;
        local_d0 = local_f0;
        local_c0 = local_e0;
      }
      if ((long)local_100 < 0) {
        FUN_00008eb8(local_110,local_100 & 0x7fffffffffffffff);
      }
      pppppuVar18 = &local_b0;
      FUN_00f0e580(&local_b0,pppppuVar18,&local_d0);
      if (((ulong)pppppuVar18 & 1) != 0) {
        if (*(char *)(lVar16 + 0x2f) < '\0') {
          FUN_00018218(&local_f0,*(undefined8 *)(lVar16 + 0x18),*(undefined8 *)(lVar16 + 0x20));
        }
        else {
          ppppuStack_e8 = *(undefined8 *****)(lVar16 + 0x20);
          local_f0 = *(undefined8 *****)(lVar16 + 0x18);
          local_e0 = *(ulong *)(lVar16 + 0x28);
        }
        if (param_1[1] == param_1[2]) {
          plVar12 = param_1;
          FUN_01699d24(param_1,&local_f0);
        }
        else {
          plVar12 = (long *)(*param_1 + param_1[1] * 0x18);
          if (plVar12 == (long *)0x0) goto LAB_040fde00;
          plVar12[2] = local_e0;
          plVar12[1] = (long)ppppuStack_e8;
          *plVar12 = (long)local_f0;
          ppppuStack_e8 = (undefined8 *****)0x0;
          local_e0 = 0;
          local_f0 = (undefined8 *****)0x0;
          plVar12 = plVar12 + 3;
        }
        param_1[1] = ((long)plVar12 - *param_1 >> 3) * -0x5555555555555555;
        if ((long)plVar12 - *param_1 == 0) goto LAB_040fde00;
        if ((long)local_e0 < 0) {
          FUN_00008eb8(local_f0,local_e0 & 0x7fffffffffffffff);
        }
      }
      if ((long)local_c0 < 0) {
        FUN_00008eb8(local_d0,local_c0 & 0x7fffffffffffffff);
      }
    }
    plVar10 = plVar10 + 1;
  }
  local_d0 = &local_b0;
  FUN_00720aac(&local_d0,ppppuStack_a8);
  local_b0 = &local_98;
  FUN_02bad934(&local_b0,local_90);
  if (local_80 != (long *)0x0) {
    if ((local_78 & 0x1fffffffffffffff) != 0) {
      lVar14 = local_78 * -8;
      plVar10 = local_80 + local_78;
      do {
        plVar10 = plVar10 + -1;
        if (plVar10 == (long *)0x0) {
LAB_040fde00:
                    /* WARNING: Does not return */
          pcVar8 = (code *)SoftwareBreakpoint(1,0x40fde04);
          (*pcVar8)();
        }
        lVar14 = lVar14 + 8;
      } while (lVar14 != 0);
    }
    local_78 = 0;
    FUN_00008eb8(local_80,local_70 << 3);
  }
  return;
}


