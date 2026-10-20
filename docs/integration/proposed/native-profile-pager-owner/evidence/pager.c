
/* WARNING: Removing unreachable block (ram,0x04632958) */
/* WARNING: Removing unreachable block (ram,0x04632678) */
/* WARNING: Removing unreachable block (ram,0x046329a0) */
/* WARNING: Removing unreachable block (ram,0x04631a4c) */
/* WARNING: Removing unreachable block (ram,0x04632520) */
/* WARNING: Removing unreachable block (ram,0x04631f14) */
/* WARNING: Removing unreachable block (ram,0x0463208c) */
/* WARNING: Removing unreachable block (ram,0x046326a8) */
/* WARNING: Removing unreachable block (ram,0x046321d4) */
/* WARNING: Type propagation algorithm not settling */
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void entry(long ******param_1)

{
  short *psVar1;
  int iVar2;
  undefined8 *******pppppppuVar3;
  char cVar4;
  bool bVar5;
  undefined1 uVar6;
  code *pcVar7;
  bool bVar8;
  bool bVar9;
  int iVar10;
  uint uVar11;
  long *****ppppplVar12;
  long *plVar13;
  undefined8 uVar14;
  long ******pppppplVar15;
  long ******pppppplVar16;
  long *******ppppppplVar17;
  long *******ppppppplVar18;
  long lVar19;
  long *****ppppplVar20;
  long ***ppplVar21;
  undefined8 uVar22;
  undefined8 *extraout_x1;
  byte bVar23;
  int iVar24;
  uint uVar25;
  long ****pppplVar26;
  long *****ppppplVar27;
  long ******pppppplVar28;
  ulong uVar29;
  ulong extraout_x8;
  undefined1 uVar30;
  long *****ppppplVar31;
  long *****ppppplVar32;
  long *******ppppppplVar33;
  long ***ppplVar34;
  long *******ppppppplVar35;
  long lVar36;
  long *******ppppppplVar37;
  double dVar38;
  long *****ppppplVar39;
  long ******pppppplVar40;
  long ******local_178;
  long *******local_170;
  long *******ppppppplStack_168;
  long ******local_160;
  long *******local_150;
  long *******ppppppplStack_148;
  long ******local_140;
  long *******local_138;
  long *******ppppppplStack_130;
  undefined8 local_128;
  long *******local_120;
  long *******ppppppplStack_118;
  long *****local_110;
  long *******local_108;
  long ******local_100;
  undefined8 local_f8;
  long *******local_f0;
  long *******ppppppplStack_e8;
  long ******local_e0;
  ulong local_d8;
  undefined8 *******local_c8;
  long lStack_c0;
  char cStack_b1;
  long *******local_b0;
  long *******ppppppplStack_a8;
  undefined8 local_a0;
  char local_98;
  long *******local_90;
  long *******ppppppplStack_88;
  undefined8 local_80;
  ulong local_78;
  
  if (param_1[0xbc] == (long *****)0x0) {
    return;
  }
  if ((((ulong)param_1[0xf8] & 1) != 0) || (param_1[0xff] != (long *****)0x0)) {
    *(undefined1 *)((long)param_1 + 0x809) = 1;
    return;
  }
  if (_DAT_0eee6cf8 == 0) {
    ppppplVar12 = (long *****)0x0;
  }
  else {
    ppppplVar12 = (long *****)func_0x01a1fb78();
  }
  ppppppplStack_e8 = (long *******)0x0;
  local_f0 = (long *******)0x0;
  local_d8 = 0;
  local_e0 = (long ******)0x0;
  if (((param_1[0x8b] == (long *****)0x0) ||
      (pppplVar26 = param_1[0x8b][0xa7], pppplVar26 == (long ****)0x0)) ||
     (plVar13 = (long *)(*(code *)(*pppplVar26[0xd])[0x29])(), plVar13 == (long *)0x0)) {
    local_f0 = (long *******)((ulong)local_f0 & 0xffffffffffffff00);
    local_d8 = local_d8 & 0xffffffffffffff00;
  }
  else {
    (**(code **)(*plVar13 + 0x30))(&local_90);
    ppppppplStack_e8 = ppppppplStack_88;
    local_f0 = local_90;
    local_e0 = local_80;
    local_d8 = CONCAT71(local_d8._1_7_,1);
    if (ppppplVar12 != (long *****)0x0) {
      uVar14 = func_0x01a1fc10(ppppplVar12);
      pppppplVar15 = (long ******)func_0x046518d8(param_1);
      ppppplVar27 = pppppplVar15[1];
      if ((long *****)0x1 < ppppplVar27) {
        if (param_1[0xe6] == ppppplVar27) {
          lVar36 = (long)ppppplVar27 * 0x18;
          if (lVar36 != 0) {
            ppppplVar27 = param_1[0xe5];
            ppppplVar32 = *pppppplVar15;
            do {
              iVar10 = func_0x010cc104(ppppplVar27,ppppplVar32);
              if (iVar10 == 0) goto LAB_0463183c;
              ppppplVar27 = ppppplVar27 + 3;
              ppppplVar32 = ppppplVar32 + 3;
              lVar36 = lVar36 + -0x18;
            } while (lVar36 != 0);
            ppppplVar27 = pppppplVar15[1];
          }
          if (param_1[0xe3] != ppppplVar27) goto LAB_0463183c;
          bVar5 = false;
        }
        else {
LAB_0463183c:
          func_0x04651c08(param_1);
          func_0x01e51518(param_1[0xbc]);
          ppppplVar31 = param_1[0xe2];
          ppppplVar32 = param_1[0xe3];
          ppppplVar27 = ppppplVar31;
          if (((ulong)ppppplVar32 & 0x1fffffffffffffff) != 0) {
            ppppplVar27 = ppppplVar31 + (long)ppppplVar32;
            lVar36 = (long)ppppplVar32 * -8;
            do {
              ppppplVar27 = ppppplVar27 + -1;
              if (ppppplVar27 == (long *****)0x0) goto LAB_046325c0;
              if (((ulong)*ppppplVar27 & 0xfffffffc00000000) == _DAT_0ebb2088) {
                func_0x00022a3c();
              }
              *ppppplVar27 = (long ****)0x0;
              lVar36 = lVar36 + 8;
            } while (lVar36 != 0);
            ppppplVar27 = param_1[0xe2];
          }
          param_1[0xe3] = (long *****)((long)ppppplVar31 - (long)ppppplVar27 >> 3);
          ppppplVar27 = pppppplVar15[1];
          if (param_1 + 0xe5 != pppppplVar15) {
            func_0x034a7e80(param_1 + 0xe5,*pppppplVar15,*pppppplVar15 + (long)ppppplVar27 * 3,
                            ((long)ppppplVar27 * 0x18 >> 3) * -0x5555555555555555);
            ppppplVar27 = pppppplVar15[1];
          }
          bVar5 = true;
        }
        if (ppppplVar27 != (long *****)0x0) {
          ppppplVar27 = (long *****)0x0;
          ppppplVar32 = ppppplVar12;
LAB_04631f64:
          ppppplVar20 = *pppppplVar15 + (long)ppppplVar27 * 3;
          ppppplVar31 = (long *****)func_0x01a1fd00(uVar14,ppppplVar20);
          ppppppplVar17 = (long *******)func_0x027a56a4(ppppplVar12,ppppplVar20);
          if ((local_d8 & 1) == 0) {
LAB_046325c0:
                    /* WARNING: Does not return */
            pcVar7 = (code *)SoftwareBreakpoint(1,0x46325c4);
            (*pcVar7)();
          }
          uVar11 = func_0x010cc104(ppppplVar20,&local_f0);
          local_100 = (long ******)0x0;
          local_f8 = 0;
          local_108 = (long *******)0x0;
          func_0x040fde94(&local_108,ppppplVar31,ppppppplVar17,pppppplVar15[1]);
          func_0x04c36100(param_1 + 0xe8,ppppplVar20);
          pppppplVar28 = (long ******)*extraout_x1;
          if (pppppplVar28 == (long ******)0x0 || pppppplVar28 == param_1 + 0xe9) {
            ppppppplVar37 = (long *******)0x0;
            ppppppplVar18 = (long *******)0x0;
          }
          else {
            ppppppplVar37 = (long *******)(long)*(char *)((long)pppppplVar28 + 0x4f);
            if ((long)ppppppplVar37 < 0) {
              ppppppplVar18 = (long *******)pppppplVar28[7];
              ppppppplVar37 = (long *******)pppppplVar28[8];
            }
            else {
              ppppppplVar18 = (long *******)(pppppplVar28 + 7);
            }
          }
          ppppppplStack_118 = (long *******)0x0;
          local_110 = (long *****)0x0;
          cVar4 = *(char *)(param_1 + 0x112);
          local_138 = (long *******)0x0;
          ppppppplStack_130 = (long *******)0x0;
          local_128 = (long *****)0x0;
          local_120 = (long *******)0x0;
          func_0x040fde94(&local_138,ppppplVar31,ppppppplVar17,pppppplVar15[1]);
          if (cVar4 != '\0') {
            ppppppplStack_88 = (long *******)0x0;
            local_90 = (long *******)0x0;
            local_78 = 0;
            local_80 = (long ******)0x0;
            if (ppppppplVar17 == (long *******)0x0) {
              uVar29 = 0;
            }
            else if (((ulong)ppppppplVar17[9] & 1) == 0) {
              plVar13 = (long *)(*(code *)(*ppppppplVar17)[0x29])(ppppppplVar17);
              (**(code **)(*plVar13 + 0x168))();
              func_0x030e1b80(&local_b0);
              if ((char)local_78 == local_98) {
                if ((char)local_78 != '\0') {
                  ppppppplStack_88 = ppppppplStack_a8;
                  local_90 = local_b0;
                  local_80 = local_a0;
                  local_a0 = (long ******)((ulong)local_a0 & 0xffffffffffffff);
                  local_b0 = (long *******)((ulong)local_b0 & 0xffffffffffffff00);
                }
              }
              else if ((char)local_78 == '\0') {
                ppppppplStack_88 = ppppppplStack_a8;
                local_90 = local_b0;
                local_80 = local_a0;
                ppppppplStack_a8 = (long *******)0x0;
                local_a0 = (long ******)0x0;
                local_b0 = (long *******)0x0;
                local_78 = CONCAT71(local_78._1_7_,1);
              }
              else {
                local_78 = (ulong)local_78._1_7_ << 8;
              }
              uVar29 = local_78 & 0xff;
            }
            else {
              uVar29 = 0;
            }
            ppppppplVar33 = (long *******)0x1;
            if (((uVar29 & 1) == 0) && (ppppppplVar37 != (long *******)0x0)) {
              if (ppppppplVar37 < (long *******)0x7fffffffffffffef) {
                if (ppppppplVar37 < (long *******)0x17) {
                  local_a0 = (long ******)CONCAT17((char)ppppppplVar37,(undefined7)local_a0);
                  ppppppplVar17 = (long *******)&local_b0;
                }
                else {
                  ppppppplVar17 =
                       (long *******)
                       func_0x0000f368(((ulong)ppppppplVar37 & 0x7ffffffffffffff0) + 0x10);
                  local_a0 = (long ******)
                             (((ulong)ppppppplVar37 & 0x7ffffffffffffff0) + 0x8000000000000010);
                  local_b0 = ppppppplVar17;
                  ppppppplStack_a8 = ppppppplVar37;
                }
                if ((ppppppplVar17 <= (long *******)((long)ppppppplVar17 + (long)ppppppplVar37)) &&
                   ((ppppppplVar18 < ppppppplVar17 ||
                    ((long *******)((long)ppppppplVar17 + (long)ppppppplVar37) <= ppppppplVar18))))
                {
                  func_0x0800f2cc(ppppppplVar17,ppppppplVar18,ppppppplVar37);
                  *(undefined1 *)((long)ppppppplVar17 + (long)ppppppplVar37) = 0;
                  ppppppplStack_88 = ppppppplStack_a8;
                  local_90 = local_b0;
                  local_80 = local_a0;
                  local_78 = CONCAT71(local_78._1_7_,1);
                  goto LAB_04632148;
                }
                goto LAB_046325c0;
              }
              func_0x04c0038c();
              ppppplVar39 = local_128;
LAB_046328e8:
              func_0x00008eb8(local_138,(long)ppppplVar39 << 1);
              ppppplVar32 = ppppplVar39;
LAB_04632818:
              local_128 = (long *****)((ulong)ppppppplVar37 | 0x8000000000000000);
              ppppppplVar18 = ppppppplVar33;
              local_138 = ppppppplVar17;
LAB_04632234:
              ppppppplStack_130 = (long *******)((long)ppppppplVar18 + 1);
              ppppppplVar17 = local_138;
LAB_0463223c:
              *(undefined4 *)((long)ppppppplVar17 + (long)ppppppplVar18 * 2) = 0x1f;
              ppppplVar39 = local_128;
              pppppplVar28 = (long ******)(ulong)(uint)local_128._7_1_;
              if ((long)local_128 < 0) {
                uVar29 = (ulong)local_128 & 0x7fffffffffffffff;
                ppppppplVar33 = (long *******)(uVar29 - 1);
                ppppppplVar35 = ppppppplStack_130;
                ppppplVar32 = local_128;
                if (ppppppplStack_130 == ppppppplVar33) {
                  if (uVar29 < 0x7fffffffffffffef) {
                    if (uVar29 <= (ulong)((long)ppppppplVar33 * 2)) {
                      uVar29 = (long)ppppppplVar33 * 2;
                    }
                    if (ppppppplVar33 < (long *******)0x3fffffffffffffe8) {
                      ppppppplVar37 = (long *******)((uVar29 & 0xfffffffffffffff8) + 8);
                      if ((long)ppppppplVar37 < 0) goto LAB_04632774;
                      lVar36 = (long)ppppppplVar37 * 2;
                    }
                    else {
                      ppppppplVar37 = (long *******)0x7ffffffffffffff0;
                      lVar36 = -0x20;
                    }
                    ppppppplVar18 = (long *******)func_0x0000f368(lVar36);
                    ppppppplVar17 = local_138;
                    ppppplVar32 = ppppplVar39;
                    if (ppppppplVar33 != (long *******)0x0) goto LAB_04632844;
                    goto LAB_04632904;
                  }
                  goto LAB_04632934;
                }
LAB_04632270:
                ppppppplStack_130 = (long *******)((long)ppppppplVar35 + 1);
                ppppppplVar17 = local_138;
              }
              else {
                if (local_128._7_1_ == 10) {
                  ppppppplVar18 = (long *******)func_0x0000f368(0x30);
                  ppppppplVar17 = (long *******)&local_138;
                  ppppppplVar37 = (long *******)0x18;
                  ppppppplVar33 = (long *******)0xa;
LAB_04632844:
                  ppppppplVar35 = (long *******)((long)ppppppplVar18 + (long)ppppppplVar33 * 2);
                  if ((ppppppplVar18 <= ppppppplVar35) &&
                     ((ppppppplVar17 < ppppppplVar18 || (ppppppplVar35 <= ppppppplVar17)))) {
                    func_0x0800f2cc(ppppppplVar18,ppppppplVar17,(long)ppppppplVar33 << 1);
                    bVar9 = (long)ppppplVar39 < 0;
                    ppppplVar39 = local_128;
                    if (bVar9) {
LAB_04632904:
                      func_0x00008eb8(local_138,(long)ppppplVar39 << 1);
                      ppppplVar32 = ppppplVar39;
                    }
                    local_128 = (long *****)((ulong)ppppppplVar37 | 0x8000000000000000);
                    ppppppplVar35 = ppppppplVar33;
                    local_138 = ppppppplVar18;
                    goto LAB_04632270;
                  }
                  goto LAB_046325c0;
                }
                ppppppplVar35 = (long *******)(ulong)local_128._7_1_;
                local_128 = (long *****)
                            (CONCAT17(local_128._7_1_ + 1,(undefined7)local_128) &
                            0x7fffffffffffffff);
                ppppppplVar17 = (long *******)&local_138;
              }
              *(undefined4 *)((long)ppppppplVar17 + (long)ppppppplVar35 * 2) = 0x2303;
              pppppplVar28 = (long ******)(ulong)(uint)local_128._7_1_;
              if ((long)local_128 < 0) {
                uVar29 = (ulong)local_128 & 0x7fffffffffffffff;
                ppppppplVar33 = (long *******)(uVar29 - 1);
                ppppppplVar35 = ppppppplStack_130;
                ppppplVar39 = local_128;
                ppppplVar32 = local_128;
                if (ppppppplStack_130 == ppppppplVar33) {
                  while (ppppplVar32 = ppppplVar39, uVar29 < 0x7fffffffffffffef) {
                    if (uVar29 <= (ulong)((long)ppppppplVar33 * 2)) {
                      uVar29 = (long)ppppppplVar33 << 1;
                    }
                    if ((long *******)0x3fffffffffffffe7 < ppppppplVar33) {
                      ppppppplVar37 = (long *******)0x7ffffffffffffff0;
                      lVar36 = -0x20;
LAB_046327c0:
                      ppppppplVar18 = (long *******)func_0x0000f368(lVar36);
                      ppppppplVar17 = local_138;
                      if (ppppppplVar33 == (long *******)0x0) goto LAB_04632920;
                      goto LAB_0463289c;
                    }
                    ppppppplVar37 = (long *******)((uVar29 & 0xfffffffffffffff8) + 8);
                    if (-1 < (long)ppppppplVar37) {
                      lVar36 = (long)ppppppplVar37 * 2;
                      goto LAB_046327c0;
                    }
LAB_04632774:
                    func_0x04c06020();
                    uVar29 = extraout_x8;
                  }
                  goto LAB_04632934;
                }
LAB_046322ac:
                ppppppplStack_130 = (long *******)((long)ppppppplVar35 + 1);
                ppppppplVar17 = local_138;
              }
              else {
                if (local_128._7_1_ == 10) {
                  ppppppplVar18 = (long *******)func_0x0000f368(0x30);
                  ppppppplVar17 = (long *******)&local_138;
                  ppppppplVar37 = (long *******)0x18;
                  ppppppplVar33 = (long *******)0xa;
LAB_0463289c:
                  ppppppplVar35 = (long *******)((long)ppppppplVar18 + (long)ppppppplVar33 * 2);
                  if ((ppppppplVar18 <= ppppppplVar35) &&
                     ((ppppppplVar17 < ppppppplVar18 || (ppppppplVar35 <= ppppppplVar17)))) {
                    func_0x0800f2cc(ppppppplVar18,ppppppplVar17,(long)ppppppplVar33 << 1);
                    ppppplVar39 = local_128;
                    if ((uint)pppppplVar28 >> 7 != 0) {
LAB_04632920:
                      func_0x00008eb8(local_138,(long)ppppplVar39 << 1);
                      ppppplVar32 = ppppplVar39;
                    }
                    local_128 = (long *****)((ulong)ppppppplVar37 | 0x8000000000000000);
                    ppppppplVar35 = ppppppplVar33;
                    local_138 = ppppppplVar18;
                    goto LAB_046322ac;
                  }
                  goto LAB_046325c0;
                }
                ppppppplVar35 = (long *******)(ulong)local_128._7_1_;
                local_128 = (long *****)
                            (CONCAT17(local_128._7_1_ + 1,(undefined7)local_128) &
                            0x7fffffffffffffff);
                ppppppplVar17 = (long *******)&local_138;
              }
              psVar1 = (short *)((long)ppppppplVar17 + (long)ppppppplVar35 * 2);
              *psVar1 = (short)ppppplVar27 + 0x31;
              psVar1[1] = 0;
LAB_046322c4:
              ppppppplStack_118 = ppppppplStack_130;
              local_120 = local_138;
              local_110 = local_128;
              ppppppplStack_130 = (long *******)0x0;
              local_128 = (long *****)0x0;
              local_138 = (long *******)0x0;
              ppppppplVar17 = local_108;
              if (-1 < (long)local_f8._7_1_) {
                ppppppplVar17 = (long *******)&local_108;
              }
              pppppplVar28 = local_100;
              if (-1 < local_f8) {
                pppppplVar28 = (long ******)(long)local_f8._7_1_;
              }
              ppppppplStack_a8 = (long *******)0x0;
              local_a0 = (long ******)0x0;
              local_b0 = (long *******)0x0;
              ppppppplVar33 = (long *******)((long)pppppplVar28 + 10);
              if ((long *******)0x7fffffffffffffee < ppppppplVar33) goto LAB_04632934;
              if (ppppppplVar33 < (long *******)0xb) {
                local_a0 = (long ******)((long)ppppppplVar33 << 0x38);
                ppppppplVar18 = (long *******)&local_b0;
              }
              else {
                ppppppplVar18 =
                     (long *******)
                     func_0x0000f368(((ulong)ppppppplVar33 & 0x7ffffffffffffff8) * 2 + 0x10);
                local_a0 = (long ******)
                           (((ulong)ppppppplVar33 & 0x7ffffffffffffff8) + 0x8000000000000008);
                local_b0 = ppppppplVar18;
                ppppppplStack_a8 = ppppppplVar33;
              }
              ppppppplVar37 = (long *******)((long)ppppppplVar18 + 0x14);
              if ((ppppppplVar37 < ppppppplVar18) ||
                 (&DAT_0df87e8e < ppppppplVar37 && ppppppplVar18 < (long *******)0xdf87e8f))
              goto LAB_046325c0;
              *(undefined4 *)(ppppppplVar18 + 2) = 0x20006f;
              ppppppplVar18[1] = pppppplRam000000000df87e96;
              *ppppppplVar18 = _DAT_0df87e8e;
              ppppppplVar18 = (long *******)((long)ppppppplVar37 + (long)pppppplVar28 * 2);
              if ((ppppppplVar18 < ppppppplVar37) ||
                 ((ppppppplVar37 <= ppppppplVar17 && (ppppppplVar17 < ppppppplVar18))))
              goto LAB_046325c0;
              func_0x0800f2cc(ppppppplVar37,ppppppplVar17,(long)pppppplVar28 << 1);
              *(undefined2 *)((long)ppppppplVar37 + (long)pppppplVar28 * 2) = 0;
              ppppplVar31 = (long *****)func_0x0456d980(ppppplVar31);
              if (bVar5) {
                uVar29 = (ulong)param_1 & 0xfffffffc00000000;
                if (uVar29 == _DAT_0ebb2088) {
                  func_0x000142fc(param_1);
                }
                pppppplVar28 = (long ******)func_0x0000f368(0x50);
                *(int *)pppppplVar28 = 1;
                pppppplVar28[1] = (long *****)0x467ccc4;
                pppppplVar28[2] = (long *****)&SUB_0396bd00;
                pppppplVar28[3] = (long *****)0x255db00;
                pppppplVar28[4] = (long *****)0x46520e4;
                pppppplVar28[5] = (long *****)0x0;
                pppppplVar28[6] = (long *****)param_1;
                if (*(char *)((long)ppppplVar20 + 0x17) < '\0') {
                  func_0x00018218(pppppplVar28 + 7,*ppppplVar20,ppppplVar20[1]);
                }
                else {
                  ppppplVar39 = (long *****)ppppplVar20[1];
                  ppppplVar32 = (long *****)*ppppplVar20;
                  pppppplVar28[9] = (long *****)ppppplVar20[2];
                  pppppplVar28[8] = ppppplVar39;
                  pppppplVar28[7] = ppppplVar32;
                }
                if (uVar29 == _DAT_0ebb2088) {
                  func_0x000142fc(param_1);
                }
                ppppppplVar37 = (long *******)func_0x0000f368(0x50);
                *(undefined4 *)ppppppplVar37 = 1;
                ppppppplVar37[1] = (long ******)0x467cd60;
                ppppppplVar37[2] = (long ******)&SUB_0396bd00;
                ppppppplVar37[3] = (long ******)0x255db00;
                ppppppplVar37[4] = (long ******)0x4652368;
                ppppppplVar37[5] = (long ******)0x0;
                ppppppplVar37[6] = param_1;
                if (*(char *)((long)ppppplVar20 + 0x17) < '\0') {
                  func_0x00018218(ppppppplVar37 + 7,*ppppplVar20,ppppplVar20[1]);
                }
                else {
                  pppppplVar40 = (long ******)ppppplVar20[1];
                  pppppplVar16 = (long ******)*ppppplVar20;
                  ppppppplVar37[9] = (long ******)ppppplVar20[2];
                  ppppppplVar37[8] = pppppplVar40;
                  ppppppplVar37[7] = pppppplVar16;
                }
                if (uVar29 == _DAT_0ebb2088) {
                  func_0x000142fc(param_1);
                  bVar9 = uVar29 == _DAT_0ebb2088;
                }
                else {
                  bVar9 = false;
                }
                ppppppplVar17 = (long *******)func_0x0000f368(0x38);
                *(undefined4 *)ppppppplVar17 = 1;
                ppppppplVar17[1] = (long ******)0x3fb3c00;
                ppppppplVar17[2] = (long ******)0x3899b40;
                ppppppplVar17[3] = (long ******)0x255db00;
                ppppppplVar17[4] = (long ******)0x4652488;
                ppppppplVar17[5] = (long ******)0x0;
                ppppppplVar17[6] = param_1;
                bVar8 = false;
                if (bVar9) {
                  func_0x000142fc(param_1);
                  bVar8 = ((ulong)param_1 & 0xfffffffc00000000) == _DAT_0ebb2088;
                }
                ppppplVar32 = (long *****)func_0x0000f368(0x38);
                *(undefined4 *)ppppplVar32 = 1;
                ppppplVar32[1] = (long ****)0x4050298;
                ppppplVar32[2] = (long ****)0x3899b40;
                ppppplVar32[3] = (long ****)0x255db00;
                ppppplVar32[4] = (long ****)0x4652600;
                ppppplVar32[5] = (long ****)0x0;
                ppppplVar32[6] = (long ****)param_1;
                if (bVar8) {
                  func_0x000142fc(param_1);
                }
                ppppppplVar33 = (long *******)func_0x0000f368(0x38);
                uVar30 = 1;
                *(undefined4 *)ppppppplVar33 = 1;
                ppppppplVar33[1] = (long ******)0x3fb9300;
                ppppppplVar33[2] = (long ******)0x3899b40;
                ppppppplVar33[3] = (long ******)0x255db00;
                ppppppplVar33[4] = (long ******)0x4652918;
                ppppppplVar33[5] = (long ******)0x0;
                ppppppplVar33[6] = param_1;
                lVar36 = _DAT_0ef0a480;
                uVar6 = 1;
                if (_DAT_0ef0a480 == 0) goto LAB_04632938;
                goto LAB_04631c9c;
              }
              if (param_1[0xe3] <= ppppplVar27) goto LAB_046325c0;
              pppplVar26 = param_1[0xe2][(long)ppppplVar27];
              if (pppplVar26 != (long ****)0x0) {
                lVar36 = (*(code *)(*pppplVar26)[0xb])(pppplVar26);
                lVar19 = func_0x0467cbc8();
                bVar9 = lVar36 != 0;
                if (lVar36 != lVar19 && lVar36 != 0) {
                  do {
                    lVar36 = *(long *)(lVar36 + 0x48);
                    bVar9 = lVar36 != 0;
                  } while (bVar9 && lVar36 != lVar19);
                }
                if (bVar9) {
                  if (*(byte *)(pppplVar26 + 0x96) != uVar11) {
                    *(char *)(pppplVar26 + 0x96) = (char)uVar11;
                    func_0x005a117c(pppplVar26);
                  }
                  ppppplVar20 = (long *****)pppplVar26[0x97];
                  if (ppppplVar20 != ppppplVar31) {
                    if (((ulong)ppppplVar31 & 0xfffffffc00000000) == _DAT_0ebb2088) {
                      func_0x000142fc(ppppplVar31);
                      ppppplVar20 = (long *****)pppplVar26[0x97];
                    }
                    if (((ulong)ppppplVar20 & 0xfffffffc00000000) == _DAT_0ebb2088) {
                      func_0x00022a3c();
                    }
                    pppplVar26[0x97] = (long ***)ppppplVar31;
                    func_0x005a117c(pppplVar26);
                  }
                }
              }
              if ((param_1[0xe3] <= ppppplVar27) ||
                 (func_0x00846944(param_1[0xe2][(long)ppppplVar27],&local_120),
                 param_1[0xe3] <= ppppplVar27)) goto LAB_046325c0;
              pppplVar26 = param_1[0xe2][(long)ppppplVar27];
              ppplVar34 = pppplVar26[0x59];
              if (ppplVar34 == (long ***)0x0) {
                iVar10 = func_0x00ee6100();
                if (iVar10 == 0) {
                  ppplVar34 = (long ***)func_0x012de654(pppplVar26);
                }
                else {
                  ppplVar34 = (long ***)func_0x0000f368(0x1b0);
                  func_0x00ee5b80(ppplVar34,pppplVar26);
                }
                ppplVar21 = pppplVar26[0x59];
                pppplVar26[0x59] = ppplVar34;
                if (ppplVar21 != (long ***)0x0) {
                  (*(code *)(*ppplVar21)[1])();
                  ppplVar34 = pppplVar26[0x59];
                }
              }
              ppppppplStack_148 = ppppppplStack_a8;
              local_150 = local_b0;
              local_140 = local_a0;
              func_0x0116d8d8(ppplVar34,&local_150);
              if ((long)local_140 < 0) {
                func_0x00008eb8(local_150,(long)local_140 << 1);
              }
              if (param_1[0xe3] <= ppppplVar27) goto LAB_046325c0;
              func_0x04651e04(param_1[0xe2][(long)ppppplVar27],ppppplVar27);
              goto LAB_04631f10;
            }
            if (ppppplVar31 != (long *****)0x0 && (uVar29 & 1) == 0) {
              func_0x022086c0(&local_b0,ppppplVar31,0xcefb67b);
              ppppppplVar17 = ppppppplStack_a8;
              if (-1 < (long)local_a0) {
                ppppppplVar17 = (long *******)(long)local_a0._7_1_;
              }
              if ((long)local_a0._7_1_ < 0) {
                func_0x00008eb8(local_b0,(long)local_a0 << 1);
              }
              if (ppppppplVar17 != (long *******)0x0) {
                func_0x022086c0(&local_c8,ppppplVar31,0xcefb67b);
                pppppppuVar3 = local_c8;
                if (-1 < (long)cStack_b1) {
                  pppppppuVar3 = &local_c8;
                }
                lVar36 = lStack_c0;
                if (-1 < cStack_b1) {
                  lVar36 = (long)cStack_b1;
                }
                func_0x00fa2d08(&local_b0,pppppppuVar3,lVar36);
                local_80 = local_a0;
                ppppppplStack_88 = ppppppplStack_a8;
                local_90 = local_b0;
                if ((char)local_78 == '\0') {
                  ppppppplStack_a8 = (long *******)0x0;
                  local_a0 = (long ******)0x0;
                  local_b0 = (long *******)0x0;
                  local_78 = CONCAT71(local_78._1_7_,1);
                }
                else {
                  local_a0 = (long ******)((ulong)local_a0 & 0xffffffffffffff);
                  local_b0 = (long *******)((ulong)local_b0 & 0xffffffffffffff00);
                }
              }
            }
LAB_04632148:
            if ((char)local_78 == '\0') goto LAB_04632204;
            uVar25 = (uint)(char)local_80._7_1_;
            ppppppplVar18 = ppppppplStack_88;
            if (-1 < (int)uVar25) {
              ppppppplVar18 = (long *******)(ulong)local_80._7_1_;
            }
            if (ppppppplVar18 == (long *******)0x0) {
              uVar29 = 1;
            }
            else {
              func_0x00c163e8(&local_138,0xdf8800e,1);
              if ((local_78 & 1) == 0) goto LAB_046325c0;
              ppppppplVar18 = local_90;
              if (-1 < (long)(char)local_80._7_1_) {
                ppppppplVar18 = (long *******)&local_90;
              }
              ppppppplVar33 = ppppppplStack_88;
              if (-1 < (long)local_80) {
                ppppppplVar33 = (long *******)(long)(char)local_80._7_1_;
              }
              func_0x008e2310(&local_b0,ppppppplVar18,ppppppplVar33);
              ppppppplVar18 = local_b0;
              if (-1 < (long)local_a0._7_1_) {
                ppppppplVar18 = (long *******)&local_b0;
              }
              ppppppplVar33 = ppppppplStack_a8;
              if (-1 < (long)local_a0) {
                ppppppplVar33 = (long *******)(long)local_a0._7_1_;
              }
              func_0x00c163e8(&local_138,ppppppplVar18,ppppppplVar33);
              uVar25 = (uint)local_80._7_1_;
              uVar29 = local_78 & 0xff;
            }
            if (((uVar29 & 1) != 0) && ((uVar25 >> 7 & 1) != 0)) {
              func_0x00008eb8(local_90,(ulong)local_80 & 0x7fffffffffffffff);
            }
          }
LAB_04632204:
          ppppplVar39 = local_128;
          if ((long *****)0x8 < ppppplVar27) goto LAB_046322c4;
          pppppplVar28 = (long ******)(ulong)(uint)local_128._7_1_;
          if (-1 < (long)local_128) {
            if (local_128._7_1_ != 10) {
              ppppppplVar18 = (long *******)(ulong)local_128._7_1_;
              local_128 = (long *****)
                          (CONCAT17(local_128._7_1_ + 1,(undefined7)local_128) & 0x7fffffffffffffff)
              ;
              ppppppplVar17 = (long *******)&local_138;
              goto LAB_0463223c;
            }
            ppppppplVar17 = (long *******)func_0x0000f368(0x30);
            ppppppplVar18 = (long *******)&local_138;
            ppppppplVar37 = (long *******)0x18;
            ppppppplVar33 = (long *******)0xa;
LAB_046327ec:
            ppppppplVar35 = (long *******)((long)ppppppplVar17 + (long)ppppppplVar33 * 2);
            if ((ppppppplVar17 <= ppppppplVar35) &&
               ((ppppppplVar18 < ppppppplVar17 || (ppppppplVar35 <= ppppppplVar18)))) {
              func_0x0800f2cc(ppppppplVar17,ppppppplVar18,(long)ppppppplVar33 << 1);
              bVar9 = (long)ppppplVar39 < 0;
              ppppplVar39 = local_128;
              if (bVar9) goto LAB_046328e8;
              goto LAB_04632818;
            }
            goto LAB_046325c0;
          }
          uVar29 = (ulong)local_128 & 0x7fffffffffffffff;
          ppppppplVar33 = (long *******)(uVar29 - 1);
          ppppppplVar18 = ppppppplStack_130;
          ppppplVar32 = local_128;
          if (ppppppplStack_130 != ppppppplVar33) goto LAB_04632234;
          if (uVar29 < 0x7fffffffffffffef) {
            if (uVar29 <= (ulong)((long)ppppppplVar33 * 2)) {
              uVar29 = (long)ppppppplVar33 * 2;
            }
            if (ppppppplVar33 < (long *******)0x3fffffffffffffe8) {
              ppppppplVar37 = (long *******)((uVar29 & 0xfffffffffffffff8) + 8);
              if ((long)ppppppplVar37 < 0) goto LAB_04632774;
              lVar36 = (long)ppppppplVar37 * 2;
            }
            else {
              ppppppplVar37 = (long *******)0x7ffffffffffffff0;
              lVar36 = -0x20;
            }
            ppppppplVar17 = (long *******)func_0x0000f368(lVar36);
            ppppppplVar18 = local_138;
            ppppplVar32 = ppppplVar39;
            if (ppppppplVar33 == (long *******)0x0) goto LAB_046328e8;
            goto LAB_046327ec;
          }
LAB_04632934:
          func_0x04d241a8();
          uVar6 = (char)&local_f0;
LAB_04632938:
          uVar30 = uVar6;
          lVar36 = func_0x042d36f8();
LAB_04631c9c:
          pppppplVar16 = (long ******)func_0x000ab5b0(lVar36,0x4f8,0);
          ppppppplStack_88 = (long *******)CONCAT71(ppppppplStack_88._1_7_,uVar30);
          local_90 = (long *******)pppppplVar28;
          func_0x0136e480(pppppplVar16,&local_90);
          if (((char)ppppppplStack_88 != -1) && (local_90 != (long *******)0x0)) {
            LOAcquire();
            iVar10 = *(int *)local_90;
            *(int *)local_90 = iVar10 + -1;
            LORelease();
            if (iVar10 == 1) {
              (*(code *)local_90[2])();
            }
          }
          ppppppplStack_88 = (long *******)CONCAT71(ppppppplStack_88._1_7_,0xff);
          *pppppplVar16 = (long *****)0xe72ccf0;
          pppppplVar16[1] = (long *****)0xe72d150;
          pppppplVar16[2] = (long *****)0xe72d178;
          pppppplVar16[0xd] = (long *****)0xe72d1b0;
          pppppplVar16[0xe] = (long *****)0xe72d1e0;
          pppppplVar16[0x16] = (long *****)0xe72d230;
          pppppplVar16[0x1b] = (long *****)0xe72d290;
          pppppplVar16[0x1f] = (long *****)0xe72d2c0;
          pppppplVar16[0x62] = (long *****)0xe72d2e8;
          pppppplVar16[99] = (long *****)0xe72d368;
          pppppplVar16[100] = (long *****)0xe72d428;
          *(char *)(pppppplVar16 + 0x96) = (char)uVar11;
          if (((ulong)ppppplVar31 & 0xfffffffc00000000) == _DAT_0ebb2088) {
            func_0x000142fc(ppppplVar31);
          }
          pppppplVar16[0x97] = ppppplVar31;
          pppppplVar16[0x98] = (long *****)ppppppplVar37;
          pppppplVar16[0x99] = (long *****)ppppppplVar17;
          pppppplVar16[0x9a] = ppppplVar32;
          pppppplVar16[0x9b] = (long *****)ppppppplVar33;
          pppppplVar16[0x9d] = (long *****)0x0;
          pppppplVar16[0x9c] = (long *****)0x0;
          *(undefined4 *)((long)pppppplVar16 + 0x4ef) = 0;
          if (*(char *)(pppppplVar16 + 0x8c) != '\0') {
            *(undefined1 *)(pppppplVar16 + 0x8c) = 0;
            func_0x00f27fd0(pppppplVar16 + 0x1f,pppppplVar16 + 0x8c);
          }
          func_0x027d1a60(pppppplVar16,0x1800000018,1);
          func_0x01c1588c(pppppplVar16,1);
          ppppplVar31 = pppppplVar16[4];
          if (*(int *)(ppppplVar31 + 1) == 2) {
                    /* WARNING: Does not return */
            pcVar7 = (code *)SoftwareBreakpoint(0,0x4632944);
            (*pcVar7)();
          }
          if (*(char *)((long)ppppplVar31 + 0x8a) != '\0') {
            *(undefined1 *)((long)ppppplVar31 + 0x8a) = 0;
            func_0x00dcdb40(ppppplVar31[0x2d],0);
          }
          func_0x015377dc(pppppplVar16,2);
          func_0x0136ee40(pppppplVar16);
          ppppplVar31 = pppppplVar16[0x59];
          if (ppppplVar31 == (long *****)0x0) {
            iVar10 = func_0x00ee6100();
            if (iVar10 == 0) {
              ppppplVar31 = (long *****)func_0x012de654(pppppplVar16);
            }
            else {
              uVar22 = func_0x0000f368(0x1b0);
              ppppplVar31 = (long *****)func_0x00ee5b80(uVar22,pppppplVar16);
            }
            ppppplVar20 = pppppplVar16[0x59];
            pppppplVar16[0x59] = ppppplVar31;
            if (ppppplVar20 != (long *****)0x0) {
              (*(code *)(*ppppplVar20)[1])(ppppplVar20);
              ppppplVar31 = pppppplVar16[0x59];
            }
          }
          func_0x0168e4e0(ppppplVar31,9);
          func_0x00846944(pppppplVar16,&local_120);
          ppppplVar31 = pppppplVar16[0x59];
          if (ppppplVar31 == (long *****)0x0) {
            iVar10 = func_0x00ee6100();
            if (iVar10 == 0) {
              ppppplVar31 = (long *****)func_0x012de654(pppppplVar16);
            }
            else {
              ppppplVar31 = (long *****)func_0x0000f368(0x1b0);
              func_0x00ee5b80(ppppplVar31,pppppplVar16);
            }
            ppppplVar20 = pppppplVar16[0x59];
            pppppplVar16[0x59] = ppppplVar31;
            if (ppppplVar20 != (long *****)0x0) {
              (*(code *)(*ppppplVar20)[1])();
              ppppplVar31 = pppppplVar16[0x59];
            }
          }
          ppppppplStack_168 = ppppppplStack_a8;
          local_170 = local_b0;
          local_160 = local_a0;
          func_0x0116d8d8(ppppplVar31,&local_170);
          if ((long)local_160 < 0) {
            func_0x00008eb8(local_170,(long)local_160 << 1);
          }
          func_0x04651e04(pppppplVar16,ppppplVar27);
          if (((ulong)pppppplVar16 & 0xfffffffc00000000) == _DAT_0ebb2088) {
            func_0x000142fc(pppppplVar16);
          }
          local_c8 = (undefined8 *******)(param_1[0xe2] + (long)param_1[0xe3]);
          local_90 = (long *******)&local_c8;
          ppppppplStack_88 = &local_178;
          local_80 = param_1 + 0xe2;
          local_178 = pppppplVar16;
          if (param_1[0xe3] == param_1[0xe4]) {
            func_0x0467ce20(&local_90);
          }
          else {
            if (local_c8 == (undefined8 *******)0x0) goto LAB_046325c0;
            *local_c8 = pppppplVar16;
            local_178 = (long ******)0x0;
            local_c8 = local_c8 + 1;
          }
          param_1[0xe3] = (long *****)((long)local_c8 - (long)param_1[0xe2] >> 3);
          if ((long)local_c8 - (long)param_1[0xe2] == 0) goto LAB_046325c0;
          if (((ulong)local_178 & 0xfffffffc00000000) == _DAT_0ebb2088) {
            func_0x00022a3c();
          }
          if (*(char *)((long)pppppplVar16 + 0x169) != '\0') {
                    /* WARNING: Does not return */
            pcVar7 = (code *)SoftwareBreakpoint(0,0x4632950);
            (*pcVar7)();
          }
          func_0x007793fc(param_1[0xbc],pppppplVar16,param_1[0xbc][0x33]);
LAB_04631f10:
          if ((long)local_110 < 0) {
            func_0x00008eb8(local_120,(long)local_110 << 1);
          }
          if (local_f8 < 0) {
            func_0x00008eb8(local_108,local_f8 << 1);
          }
          ppppplVar27 = (long *****)((long)ppppplVar27 + 1);
          if (pppppplVar15[1] <= ppppplVar27) goto LAB_04631914;
          goto LAB_04631f64;
        }
LAB_04631914:
        bVar23 = *(byte *)(param_1[0x109] + 0x12);
        if ((bVar23 == 0) ||
           ((((ulong)param_1[0x141] & 1) == 0 && ((*(byte *)((long)param_1 + 0xa0c) & 1) == 0)))) {
          if (((ulong)param_1[0x19c] & 1) == 0) {
            if ((*(byte *)(param_1 + 0x1ef) & 1) != 0) goto LAB_04631998;
          }
          else {
            if (*(byte *)(param_1 + 0x1ef) == 0) {
              if (*(char *)(param_1 + 0x1a5) == '\0') {
                ppppplVar12 = param_1[0x1a8];
                bVar9 = (double)ppppplVar12 == 1.0;
              }
              else {
                bVar9 = *(int *)((long)param_1 + 0xd24) == 0;
                ppppplVar12 = param_1[0x1a8];
              }
              pcVar7 = (code *)&SUB_035bc0d4;
              if (!bVar9) {
                pcVar7 = (code *)&SUB_08a01b6c;
              }
              dVar38 = (double)(*pcVar7)((double)ppppplVar12 * (double)*(int *)(param_1 + 0x119));
              iVar10 = (int)dVar38;
              iVar24 = *(int *)(param_1 + 0x38);
            }
            else {
LAB_04631998:
              iVar10 = *(int *)(param_1 + 0x38);
              iVar24 = iVar10;
            }
            iVar2 = iVar10;
            if (iVar24 <= iVar10) {
              iVar2 = iVar24;
            }
            if (iVar24 < 1) {
              iVar2 = iVar10;
            }
            bVar23 = iVar2 < 0x97;
          }
        }
        else {
          bVar23 = 0;
        }
        ppppplVar12 = param_1[0xbc];
        if (ppppplVar12 != (long *****)0x0) {
          bVar23 = bVar23 ^ 1;
          if ((*(char *)((long)param_1 + 0x7a4) != '\0') && (*(char *)(param_1 + 0xf4) != '\0')) {
            bVar23 = *(byte *)((long)param_1 + 0x79c);
          }
          (*(code *)(*ppppplVar12)[0x14])(ppppplVar12,bVar23 & 1);
        }
        if (bVar5) {
          func_0x00630474(param_1[0xbc],0);
        }
        goto LAB_04631718;
      }
    }
  }
  ppppplVar12 = param_1[0xbc];
  if (ppppplVar12 != (long *****)0x0) {
    bVar23 = 0;
    if ((*(char *)((long)param_1 + 0x7a4) != '\0') &&
       (bVar23 = 0, *(char *)(param_1 + 0xf4) != '\0')) {
      bVar23 = *(byte *)((long)param_1 + 0x79c);
    }
    (*(code *)(*ppppplVar12)[0x14])(ppppplVar12,bVar23 & 1);
  }
LAB_04631718:
  if (((char)local_d8 != '\0') && ((long)local_e0 < 0)) {
    func_0x00008eb8(local_f0,(ulong)local_e0 & 0x7fffffffffffffff);
  }
  return;
}

