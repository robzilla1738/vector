
/* WARNING: Removing unreachable block (ram,0x0425d73c) */
/* WARNING: Removing unreachable block (ram,0x0425d878) */
/* WARNING: Removing unreachable block (ram,0x0425e508) */
/* WARNING: Type propagation algorithm not settling */
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

undefined8
entry(ulong *******param_1,undefined8 param_2,undefined8 param_3,undefined8 *param_4,long param_5)

{
  ulong *******pppppppuVar1;
  long *plVar2;
  char cVar3;
  char cVar4;
  code *pcVar5;
  bool bVar6;
  int iVar7;
  ulong uVar8;
  ulong *******pppppppuVar9;
  ulong *******pppppppuVar10;
  ulong ******ppppppuVar11;
  ulong *******pppppppuVar12;
  long lVar13;
  ulong *******pppppppuVar14;
  ulong ******ppppppuVar15;
  undefined8 uVar16;
  ulong *******pppppppuVar17;
  long *plVar18;
  ulong *******pppppppuVar19;
  long *plVar20;
  uint uVar21;
  long *plVar22;
  undefined8 *puVar23;
  undefined8 local_278;
  ulong local_270;
  ulong local_268;
  undefined8 local_260;
  undefined8 uStack_258;
  undefined8 uStack_250;
  undefined8 uStack_248;
  undefined8 local_240;
  ulong *******local_230;
  ulong *******pppppppuStack_228;
  ulong local_220;
  undefined8 local_210;
  undefined8 uStack_208;
  undefined8 uStack_200;
  undefined8 uStack_1f8;
  undefined8 local_1f0;
  undefined8 uStack_1e8;
  undefined8 local_1e0;
  undefined8 uStack_1d8;
  undefined8 uStack_1d0;
  undefined8 uStack_1c8;
  undefined8 local_1c0;
  undefined8 uStack_1b8;
  undefined8 uStack_1b0;
  undefined8 uStack_1a8;
  undefined8 local_1a0;
  undefined8 uStack_198;
  undefined8 uStack_190;
  undefined8 uStack_188;
  undefined8 local_180;
  undefined8 uStack_178;
  undefined8 uStack_170;
  undefined8 uStack_168;
  ulong *******local_158;
  ulong *******pppppppuStack_150;
  undefined7 local_148;
  byte bStack_141;
  ulong *******local_140;
  ulong *******pppppppuStack_138;
  undefined8 local_130;
  ulong *******local_120;
  ulong *******pppppppuStack_118;
  undefined8 local_110;
  ulong *******local_100;
  ulong *******pppppppuStack_f8;
  ulong local_f0;
  undefined8 uStack_e8;
  undefined8 uStack_e0;
  undefined8 uStack_d8;
  undefined8 local_d0;
  undefined8 uStack_c8;
  undefined8 uStack_c0;
  undefined8 uStack_b8;
  undefined8 local_b0;
  undefined8 uStack_a8;
  undefined8 uStack_a0;
  undefined8 uStack_98;
  undefined8 local_90;
  undefined8 uStack_88;
  undefined8 uStack_80;
  undefined8 uStack_78;
  
  iVar7 = func_0x0218bd88(param_3,0);
  if (iVar7 == 0) {
    uVar16 = 0;
  }
  else {
    uStack_178 = 0;
    local_180 = 0;
    uStack_168 = 0;
    uStack_170 = 0;
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
    uStack_1c8 = 0;
    uStack_1d0 = 0;
    uStack_1e8 = 0;
    local_1f0 = 0;
    uStack_208 = 0;
    local_210 = 0;
    uStack_1f8 = 0;
    uStack_200 = 0;
    local_100 = (ulong *******)0x0;
    pppppppuStack_f8 = (ulong *******)0x0;
    local_f0 = 0;
    func_0x01fa1500(&local_210,param_2,0,3,&local_100,0,0);
    local_230 = (ulong *******)0x0;
    pppppppuStack_228 = (ulong *******)0x0;
    local_220 = 0;
    func_0x006ee1a0(&local_230,&local_210);
    pppppppuVar14 = pppppppuStack_228;
    if ((local_220 & 0x8000000000000000) == 0) {
      pppppppuVar14 = (ulong *******)(local_220 >> 0x38);
    }
    if (pppppppuVar14 != (ulong *******)0x0) {
      plVar20 = param_4 + 1;
      pppppppuVar14 = param_1;
      puVar23 = param_4;
LAB_0425d7cc:
      local_240 = 0;
      uStack_258 = 0;
      local_260 = 0;
      uStack_248 = 0;
      uStack_250 = 0;
      uStack_88 = 0;
      local_90 = 0;
      uStack_78 = 0;
      uStack_80 = 0;
      uStack_a8 = 0;
      local_b0 = 0;
      uStack_98 = 0;
      uStack_a0 = 0;
      uStack_c8 = 0;
      local_d0 = 0;
      uStack_b8 = 0;
      uStack_c0 = 0;
      uStack_e8 = 0;
      local_f0 = 0;
      uStack_d8 = 0;
      uStack_e0 = 0;
      pppppppuStack_f8 = (ulong *******)0x0;
      local_100 = (ulong *******)0x0;
      iVar7 = func_0x006ee96c(&local_230,&local_100);
      if (iVar7 == 0) {
        func_0x00dc0490(&local_260,&local_100);
        local_278 = 0;
        local_270 = 0;
        local_268 = 0;
        iVar7 = func_0x010cc528(pppppppuVar14,&local_230,&local_278);
        if (iVar7 != 0) {
          uVar8 = local_270;
          if ((local_268 & 0x8000000000000000) == 0) {
            uVar8 = local_268 >> 0x38;
          }
          if (uVar8 == 0) goto LAB_0425d690;
          cVar4 = (char)uStack_258;
          if (puVar23[2] != 0) {
            local_100 = (ulong *******)0x0;
            pppppppuStack_f8 = (ulong *******)0x0;
            local_f0 = 0;
            func_0x010cc964(&local_100,&local_278);
            if (((long)pppppppuStack_f8 * 3 & 0x1fffffffffffffffU) != 0) {
              pppppppuVar12 = local_100 + (long)pppppppuStack_f8 * 3;
              pppppppuVar17 = local_100;
              pppppppuVar10 = pppppppuVar12;
              do {
                local_120 = (ulong *******)0x0;
                pppppppuStack_118 = (ulong *******)0x0;
                local_110 = 0;
                ppppppuVar11 = (ulong ******)(long)*(char *)((long)pppppppuVar17 + 0x17);
                pppppppuVar14 = pppppppuVar17;
                if ((long)ppppppuVar11 < 0) {
                  ppppppuVar11 = pppppppuVar17[1];
                  pppppppuVar14 = (ulong *******)*pppppppuVar17;
                }
                func_0x006ee850(&local_140,pppppppuVar14,ppppppuVar11);
                pppppppuVar14 = pppppppuStack_138;
                pppppppuVar19 = local_140;
                if (-1 < (long)local_130) {
                  pppppppuVar14 = (ulong *******)(local_130 >> 0x38);
                  pppppppuVar19 = (ulong *******)&local_140;
                }
                iVar7 = func_0x0103eb5c(pppppppuVar19,pppppppuVar14);
                if (iVar7 == 0) goto LAB_0425e5a4;
                if (-1 < (long)local_130) {
                  pppppppuStack_118 = pppppppuStack_138;
                  local_120 = local_140;
                  local_110 = local_130;
                  goto LAB_0425da3c;
                }
                func_0x00018218(&local_120,local_140,pppppppuStack_138);
                while( true ) {
                  if ((long)local_130 < 0) {
                    func_0x00008eb8(local_140,local_130 & 0x7fffffffffffffff);
                  }
LAB_0425da3c:
                  uVar21 = (uint)(char)local_110._7_1_;
                  pppppppuVar14 = pppppppuStack_118;
                  if (-1 < (int)uVar21) {
                    pppppppuVar14 = (ulong *******)(ulong)local_110._7_1_;
                  }
                  if (pppppppuVar14 == (ulong *******)0x0) break;
                  plVar22 = (long *)*plVar20;
                  if (plVar22 != (long *)0x0) {
                    pppppppuVar19 = local_120;
                    if (-1 < (int)uVar21) {
                      pppppppuVar19 = (ulong *******)&local_120;
                    }
                    do {
                      while( true ) {
                        cVar3 = *(char *)((long)plVar22 + 0x37);
                        plVar2 = (long *)plVar22[4];
                        if (-1 < (long)cVar3) {
                          plVar2 = plVar22 + 4;
                        }
                        pppppppuVar1 = (ulong *******)plVar22[5];
                        if (-1 < cVar3) {
                          pppppppuVar1 = (ulong *******)(long)cVar3;
                        }
                        pppppppuVar9 = pppppppuVar1;
                        if (pppppppuVar14 <= pppppppuVar1) {
                          pppppppuVar9 = pppppppuVar14;
                        }
                        iVar7 = func_0x08009860(pppppppuVar19,plVar2,pppppppuVar9);
                        if (iVar7 != 0) break;
                        if (pppppppuVar14 == pppppppuVar1) {
                          if (plVar22 != plVar20) goto LAB_0425dc44;
                          goto LAB_0425d9ac;
                        }
                        if (pppppppuVar14 < pppppppuVar1) goto LAB_0425dab0;
LAB_0425daa0:
                        plVar22 = (long *)plVar22[1];
                        if (plVar22 == (long *)0x0) goto LAB_0425d9ac;
                      }
                      if (-1 < iVar7) goto LAB_0425daa0;
LAB_0425dab0:
                      plVar22 = (long *)*plVar22;
                    } while (plVar22 != (long *)0x0);
                  }
LAB_0425d9ac:
                  plVar22 = (long *)*param_4;
                  puVar23 = param_4;
                  if (plVar22 == plVar20) break;
LAB_0425db18:
                  pppppppuVar14 = local_120;
                  if (-1 < (long)(char)local_110._7_1_) {
                    pppppppuVar14 = (ulong *******)&local_120;
                  }
                  pppppppuVar19 = pppppppuStack_118;
                  if (-1 < (long)local_110) {
                    pppppppuVar19 = (ulong *******)(long)(char)local_110._7_1_;
                  }
                  cVar3 = *(char *)((long)plVar22 + 0x37);
                  pppppppuVar1 = (ulong *******)plVar22[4];
                  if (-1 < (long)cVar3) {
                    pppppppuVar1 = (ulong *******)(plVar22 + 4);
                  }
                  puVar23 = (undefined8 *)plVar22[5];
                  if (-1 < cVar3) {
                    puVar23 = (undefined8 *)(long)cVar3;
                  }
                  local_140 = (ulong *******)0x0;
                  pppppppuStack_138 = (ulong *******)0x0;
                  local_130 = 0;
                  pppppppuVar10 = (ulong *******)((long)puVar23 + 0x11);
                  if (pppppppuVar10 < (ulong *******)0x7fffffffffffffef) {
                    if (pppppppuVar10 < (ulong *******)0x17) {
                      local_130 = (long)pppppppuVar10 << 0x38;
                      pppppppuVar9 = (ulong *******)&local_140;
                    }
                    else {
                      pppppppuVar9 = (ulong *******)
                                     func_0x0000f368(((ulong)pppppppuVar10 & 0x7ffffffffffffff0) +
                                                     0x10);
                      local_130 = ((ulong)pppppppuVar10 & 0x7ffffffffffffff0) + 0x8000000000000010;
                      local_140 = pppppppuVar9;
                      pppppppuStack_138 = pppppppuVar10;
                    }
                    pppppppuVar10 = (ulong *******)((long)pppppppuVar9 + 0x11);
                    if ((pppppppuVar9 <= pppppppuVar10) &&
                       (pppppppuVar10 <= &DAT_0db1f93d || &DAT_0db1f93d < pppppppuVar9)) {
                      *(undefined1 *)(pppppppuVar9 + 2) = 0x5f;
                      pppppppuVar9[1] = ppppppuRam000000000db1f945;
                      *pppppppuVar9 = _DAT_0db1f93d;
                      if ((pppppppuVar10 <= (ulong *******)((long)pppppppuVar10 + (long)puVar23)) &&
                         ((pppppppuVar1 < pppppppuVar10 ||
                          ((ulong *******)((long)pppppppuVar10 + (long)puVar23) <= pppppppuVar1))))
                      {
                        func_0x0800f2cc(pppppppuVar10,pppppppuVar1,puVar23);
                        *(undefined1 *)((long)pppppppuVar10 + (long)puVar23) = 0;
                        pppppppuVar10 = local_140;
                        if (-1 < (long)local_130._7_1_) {
                          pppppppuVar10 = (ulong *******)&local_140;
                        }
                        pppppppuVar1 = pppppppuStack_138;
                        if (-1 < (long)local_130) {
                          pppppppuVar1 = (ulong *******)(long)local_130._7_1_;
                        }
                        uVar8 = func_0x00c17368(pppppppuVar14,pppppppuVar19,pppppppuVar10,
                                                pppppppuVar1,0);
                        if ((long)local_130 < 0) {
                          func_0x00008eb8(local_140,local_130 & 0x7fffffffffffffff);
                        }
                        if ((uVar8 & 1) == 0) goto code_r0x0425dc20;
                        uVar21 = (uint)local_110._7_1_;
LAB_0425dc44:
                        if ((uVar21 >> 7 & 1) != 0) {
                          func_0x00008eb8(local_120,local_110 & 0x7fffffffffffffff);
                        }
                        pppppppuVar17 = local_100;
                        pppppppuVar14 = param_1;
                        puVar23 = param_4;
                        if (local_100 != (ulong *******)0x0) {
                          pppppppuVar10 = local_100;
                          if ((long)pppppppuStack_f8 * 0x18 != 0) {
                            lVar13 = (long)pppppppuStack_f8 * -0x18;
                            pppppppuVar12 = local_100 + (long)pppppppuStack_f8 * 3;
                            do {
                              pppppppuVar19 = pppppppuVar12 + -3;
                              if (pppppppuVar19 == (ulong *******)0x0) goto LAB_0425dfa0;
                              if (*(char *)((long)pppppppuVar12 + -1) < '\0') {
                                func_0x00008eb8(*pppppppuVar19,
                                                (ulong)pppppppuVar12[-1] & 0x7fffffffffffffff);
                              }
                              lVar13 = lVar13 + 0x18;
                              pppppppuVar10 = local_100;
                              pppppppuVar12 = pppppppuVar19;
                            } while (lVar13 != 0);
                          }
                          goto LAB_0425dca4;
                        }
                        goto LAB_0425d788;
                      }
                    }
                    goto LAB_0425dfa0;
                  }
                  func_0x04c0038c();
LAB_0425e5a4:
                  local_120 = (ulong *******)0x0;
                  pppppppuStack_118 = (ulong *******)0x0;
                  local_110 = 0;
                }
LAB_0425d9bc:
                if ((uVar21 >> 7 & 1) != 0) {
                  func_0x00008eb8(local_120,local_110 & 0x7fffffffffffffff);
                }
                pppppppuVar17 = pppppppuVar17 + 3;
                pppppppuVar14 = param_1;
              } while (pppppppuVar17 != pppppppuVar10);
            }
            pppppppuVar17 = local_100;
            if (local_100 != (ulong *******)0x0) {
              if ((long)pppppppuStack_f8 * 0x18 != 0) {
                lVar13 = (long)pppppppuStack_f8 * -0x18;
                pppppppuVar10 = local_100 + (long)pppppppuStack_f8 * 3;
                do {
                  pppppppuVar12 = pppppppuVar10 + -3;
                  if (pppppppuVar12 == (ulong *******)0x0) goto LAB_0425dfa0;
                  if (*(char *)((long)pppppppuVar10 + -1) < '\0') {
                    func_0x00008eb8(*pppppppuVar12,(ulong)pppppppuVar10[-1] & 0x7fffffffffffffff);
                  }
                  lVar13 = lVar13 + 0x18;
                  pppppppuVar10 = pppppppuVar12;
                } while (lVar13 != 0);
              }
              pppppppuStack_f8 =
                   (ulong *******)
                   (((long)pppppppuVar17 - (long)local_100 >> 3) * -0x5555555555555555);
              func_0x00008eb8(local_100,local_f0 * 0x18);
            }
          }
          if (cVar4 == '\0') {
LAB_0425d630:
            if (*(long *)(param_5 + 0x10) != 0) {
              local_100 = (ulong *******)0x0;
              pppppppuStack_f8 = (ulong *******)0x0;
              local_f0 = 0;
              func_0x010cc964(&local_100,&local_278);
              if ((ulong *******)0x1 < pppppppuStack_f8) {
                ppppppuVar11 = (ulong ******)(long)*(char *)((long)local_100 + 0x17);
                pppppppuVar17 = local_100;
                if ((long)ppppppuVar11 < 0) {
                  pppppppuVar17 = (ulong *******)*local_100;
                  ppppppuVar11 = local_100[1];
                }
                func_0x006ee850(&local_140,pppppppuVar17,ppppppuVar11);
                pppppppuVar17 = pppppppuStack_138;
                pppppppuVar10 = local_140;
                if (-1 < (long)local_130) {
                  pppppppuVar17 = (ulong *******)(local_130 >> 0x38);
                  pppppppuVar10 = (ulong *******)&local_140;
                }
                iVar7 = func_0x0103eb5c(pppppppuVar10,pppppppuVar17);
                if (iVar7 == 0) {
                  pppppppuVar17 = (ulong *******)0x0;
                  local_120 = (ulong *******)0x0;
                  pppppppuStack_118 = (ulong *******)0x0;
                  local_110 = 0;
                }
                else {
                  if ((long)local_130 < 0) {
                    func_0x00018218(&local_120,local_140,pppppppuStack_138);
                  }
                  else {
                    pppppppuStack_118 = pppppppuStack_138;
                    local_120 = local_140;
                    local_110 = local_130;
                  }
                  pppppppuVar17 = (ulong *******)(local_110 >> 0x38);
                }
                cVar4 = (char)pppppppuVar17;
                pppppppuVar10 = pppppppuStack_118;
                if (-1 < cVar4) {
                  pppppppuVar10 = pppppppuVar17;
                }
                if (pppppppuVar10 == (ulong *******)0xa) {
                  pppppppuVar17 = local_120;
                  if (-1 < cVar4) {
                    pppppppuVar17 = (ulong *******)&local_120;
                  }
                  bVar6 = *pppppppuVar17 != (ulong ******)0x6f69736e65747845 ||
                          *(short *)(pppppppuVar17 + 1) != 0x736e;
                }
                else {
                  bVar6 = true;
                }
                if (cVar4 < '\0') {
                  func_0x00008eb8(local_120,local_110 & 0x7fffffffffffffff);
                }
                if ((long)local_130 < 0) {
                  func_0x00008eb8(local_140,local_130 & 0x7fffffffffffffff);
                }
                if (!bVar6) {
                  local_120 = (ulong *******)0x0;
                  pppppppuStack_118 = (ulong *******)0x0;
                  local_110 = 0;
                  if (pppppppuStack_f8 < (ulong *******)0x2) {
LAB_0425dfa0:
                    /* WARNING: Does not return */
                    pcVar5 = (code *)SoftwareBreakpoint(1,0x425dfa4);
                    (*pcVar5)();
                  }
                  ppppppuVar11 = (ulong ******)(long)*(char *)((long)local_100 + 0x2f);
                  if ((long)ppppppuVar11 < 0) {
                    pppppppuVar17 = (ulong *******)local_100[3];
                    ppppppuVar11 = local_100[4];
                  }
                  else {
                    pppppppuVar17 = local_100 + 3;
                  }
                  func_0x006ee850(&local_140,pppppppuVar17,ppppppuVar11);
                  pppppppuVar17 = pppppppuStack_138;
                  pppppppuVar10 = local_140;
                  if (-1 < (long)local_130) {
                    pppppppuVar17 = (ulong *******)(local_130 >> 0x38);
                    pppppppuVar10 = (ulong *******)&local_140;
                  }
                  iVar7 = func_0x0103eb5c(pppppppuVar10,pppppppuVar17);
                  if (iVar7 == 0) {
                    local_120 = (ulong *******)0x0;
                    pppppppuStack_118 = (ulong *******)0x0;
                    local_110 = 0;
LAB_0425e110:
                    if ((long)local_130 < 0) {
                      func_0x00008eb8(local_140,local_130 & 0x7fffffffffffffff);
                    }
                  }
                  else {
                    if ((long)local_130 < 0) {
                      func_0x00018218(&local_120,local_140,pppppppuStack_138);
                      goto LAB_0425e110;
                    }
                    pppppppuStack_118 = pppppppuStack_138;
                    local_120 = local_140;
                    local_110 = local_130;
                  }
                  uVar8 = local_110;
                  pppppppuVar17 = pppppppuStack_118;
                  if (-1 < (long)local_110) {
                    pppppppuVar17 = (ulong *******)(local_110 >> 0x38);
                  }
                  if (pppppppuVar17 == (ulong *******)0x0) {
                    bVar6 = false;
                  }
                  else {
                    plVar22 = *(long **)(param_5 + 8);
                    if (plVar22 != (long *)0x0) {
                      pppppppuVar10 = local_120;
                      if (-1 < (long)local_110) {
                        pppppppuVar10 = (ulong *******)&local_120;
                      }
                      do {
                        while( true ) {
                          cVar4 = *(char *)((long)plVar22 + 0x37);
                          plVar2 = (long *)plVar22[4];
                          if (-1 < (long)cVar4) {
                            plVar2 = plVar22 + 4;
                          }
                          pppppppuVar12 = (ulong *******)plVar22[5];
                          if (-1 < cVar4) {
                            pppppppuVar12 = (ulong *******)(long)cVar4;
                          }
                          pppppppuVar14 = pppppppuVar12;
                          if (pppppppuVar17 <= pppppppuVar12) {
                            pppppppuVar14 = pppppppuVar17;
                          }
                          iVar7 = func_0x08009860(pppppppuVar10,plVar2,pppppppuVar14);
                          if (iVar7 == 0) break;
                          if (iVar7 < 0) goto LAB_0425e194;
LAB_0425e184:
                          plVar22 = (long *)plVar22[1];
                          pppppppuVar14 = param_1;
                          if (plVar22 == (long *)0x0) goto LAB_0425e1c8;
                        }
                        pppppppuVar14 = param_1;
                        if (pppppppuVar17 == pppppppuVar12) break;
                        if (pppppppuVar12 <= pppppppuVar17) goto LAB_0425e184;
LAB_0425e194:
                        plVar22 = (long *)*plVar22;
                        pppppppuVar14 = param_1;
                      } while (plVar22 != (long *)0x0);
                    }
LAB_0425e1c8:
                    bVar6 = plVar22 != (long *)0x0 && plVar22 != (long *)(param_5 + 8);
                  }
                  if ((long)uVar8 < 0) {
                    func_0x00008eb8(local_120,local_110 & 0x7fffffffffffffff);
                  }
                  pppppppuVar17 = local_100;
                  if (local_100 != (ulong *******)0x0) {
                    if ((long)pppppppuStack_f8 * 0x18 != 0) {
                      lVar13 = (long)pppppppuStack_f8 * -0x18;
                      pppppppuVar10 = local_100 + (long)pppppppuStack_f8 * 3;
                      do {
                        pppppppuVar12 = pppppppuVar10 + -3;
                        if (pppppppuVar12 == (ulong *******)0x0) goto LAB_0425dfa0;
                        if (*(char *)((long)pppppppuVar10 + -1) < '\0') {
                          func_0x00008eb8(*pppppppuVar12,
                                          (ulong)pppppppuVar10[-1] & 0x7fffffffffffffff);
                        }
                        lVar13 = lVar13 + 0x18;
                        pppppppuVar10 = pppppppuVar12;
                      } while (lVar13 != 0);
                    }
                    pppppppuStack_f8 =
                         (ulong *******)
                         (((long)pppppppuVar17 - (long)local_100 >> 3) * -0x5555555555555555);
                    func_0x00008eb8(local_100,local_f0 * 0x18);
                  }
                  if (bVar6) goto LAB_0425d788;
                  goto LAB_0425d664;
                }
              }
              pppppppuVar17 = local_100;
              if (local_100 != (ulong *******)0x0) {
                if ((long)pppppppuStack_f8 * 0x18 != 0) {
                  lVar13 = (long)pppppppuStack_f8 * -0x18;
                  pppppppuVar10 = local_100 + (long)pppppppuStack_f8 * 3;
                  do {
                    pppppppuVar12 = pppppppuVar10 + -3;
                    if (pppppppuVar12 == (ulong *******)0x0) goto LAB_0425dfa0;
                    if (*(char *)((long)pppppppuVar10 + -1) < '\0') {
                      func_0x00008eb8(*pppppppuVar12,(ulong)pppppppuVar10[-1] & 0x7fffffffffffffff);
                    }
                    lVar13 = lVar13 + 0x18;
                    pppppppuVar10 = pppppppuVar12;
                  } while (lVar13 != 0);
                }
                pppppppuStack_f8 =
                     (ulong *******)
                     (((long)pppppppuVar17 - (long)local_100 >> 3) * -0x5555555555555555);
                func_0x00008eb8(local_100,local_f0 * 0x18);
              }
            }
LAB_0425d664:
            local_100 = (ulong *******)0x0;
            pppppppuStack_f8 = (ulong *******)0x0;
            local_f0 = 0;
            func_0x010cc964(&local_100,&local_278);
            pppppppuVar17 = local_100;
            if ((undefined1 *)((long)pppppppuStack_f8 + -3) < (undefined1 *)0xfffffffffffffffe) {
              if (local_100 != (ulong *******)0x0) {
                if ((long)pppppppuStack_f8 * 0x18 != 0) {
                  lVar13 = (long)pppppppuStack_f8 * -0x18;
                  pppppppuVar10 = local_100 + (long)pppppppuStack_f8 * 3;
                  do {
                    pppppppuVar12 = pppppppuVar10 + -3;
                    if (pppppppuVar12 == (ulong *******)0x0) goto LAB_0425dfa0;
                    if (*(char *)((long)pppppppuVar10 + -1) < '\0') {
                      func_0x00008eb8(*pppppppuVar12,(ulong)pppppppuVar10[-1] & 0x7fffffffffffffff);
                    }
                    lVar13 = lVar13 + 0x18;
                    pppppppuVar10 = pppppppuVar12;
                  } while (lVar13 != 0);
                }
                pppppppuStack_f8 =
                     (ulong *******)
                     (((long)pppppppuVar17 - (long)local_100 >> 3) * -0x5555555555555555);
                func_0x00008eb8(local_100,local_f0 * 0x18);
              }
              goto LAB_0425d690;
            }
            local_120 = (ulong *******)0x0;
            pppppppuStack_118 = (ulong *******)0x0;
            local_110 = 0;
            func_0x0147166c(&local_140,&local_278);
            pppppppuVar17 = pppppppuStack_138;
            pppppppuVar10 = local_140;
            if (-1 < (long)local_130) {
              pppppppuVar17 = (ulong *******)(local_130 >> 0x38);
              pppppppuVar10 = (ulong *******)&local_140;
            }
            iVar7 = func_0x0103eb5c(pppppppuVar10,pppppppuVar17);
            if (iVar7 == 0) {
              local_120 = (ulong *******)0x0;
              pppppppuStack_118 = (ulong *******)0x0;
              local_110 = 0;
LAB_0425dd38:
              if ((long)local_130 < 0) {
                func_0x00008eb8(local_140,local_130 & 0x7fffffffffffffff);
              }
            }
            else {
              if ((long)local_130 < 0) {
                func_0x00018218(&local_120,local_140,pppppppuStack_138);
                goto LAB_0425dd38;
              }
              pppppppuStack_118 = pppppppuStack_138;
              local_120 = local_140;
              local_110 = local_130;
            }
            pppppppuVar12 = (ulong *******)(ulong)local_110._7_1_;
            uVar21 = (uint)(char)local_110._7_1_;
            pppppppuVar17 = (ulong *******)(ulong)uVar21;
            pppppppuVar10 = pppppppuStack_118;
            if (-1 < (int)uVar21) {
              pppppppuVar10 = pppppppuVar12;
            }
            if (pppppppuVar10 != (ulong *******)0x0) {
              if (pppppppuStack_f8 == (ulong *******)0x2) {
                ppppppuVar11 = (ulong ******)(long)*(char *)((long)local_100 + 0x17);
                pppppppuVar14 = local_100;
                if ((long)ppppppuVar11 < 0) {
                  pppppppuVar14 = (ulong *******)*local_100;
                  ppppppuVar11 = local_100[1];
                }
                func_0x006ee850(&local_158,pppppppuVar14,ppppppuVar11);
                pppppppuVar14 = pppppppuStack_150;
                pppppppuVar17 = local_158;
                if (-1 < (char)bStack_141) {
                  pppppppuVar14 = (ulong *******)(ulong)bStack_141;
                  pppppppuVar17 = (ulong *******)&local_158;
                }
                iVar7 = func_0x0103eb5c(pppppppuVar17,pppppppuVar14);
                if (iVar7 == 0) {
                  pppppppuVar14 = (ulong *******)0x0;
                  local_140 = (ulong *******)0x0;
                  pppppppuStack_138 = (ulong *******)0x0;
                  local_130 = 0;
                }
                else {
                  if ((char)bStack_141 < '\0') {
                    func_0x00018218(&local_140,local_158,pppppppuStack_150);
                  }
                  else {
                    pppppppuStack_138 = pppppppuStack_150;
                    local_140 = local_158;
                    local_130 = CONCAT17(bStack_141,local_148);
                  }
                  pppppppuVar14 = (ulong *******)(local_130 >> 0x38);
                }
                cVar4 = (char)pppppppuVar14;
                pppppppuVar17 = pppppppuStack_138;
                if (-1 < cVar4) {
                  pppppppuVar17 = pppppppuVar14;
                }
                if (pppppppuVar17 == (ulong *******)0x7) {
                  pppppppuVar14 = local_140;
                  if (-1 < cVar4) {
                    pppppppuVar14 = (ulong *******)&local_140;
                  }
                  bVar6 = *(int *)pppppppuVar14 == 0x7774654e &&
                          *(int *)((long)pppppppuVar14 + 3) == 0x6b726f77;
                }
                else {
                  bVar6 = false;
                }
                if (cVar4 < '\0') {
                  func_0x00008eb8(local_140,local_130 & 0x7fffffffffffffff);
                }
                if ((char)bStack_141 < '\0') {
                  func_0x00008eb8(local_158,CONCAT17(bStack_141,local_148) & 0x7fffffffffffffff);
                }
                pppppppuVar12 = (ulong *******)(local_110 >> 0x38);
                pppppppuVar17 = pppppppuVar12;
              }
              else {
                bVar6 = false;
              }
              lVar13 = 0;
              uVar21 = (uint)pppppppuVar17;
              pppppppuVar14 = local_120;
              pppppppuVar10 = pppppppuStack_118;
              if (-1 < (char)pppppppuVar17) {
                pppppppuVar14 = (ulong *******)&local_120;
                pppppppuVar10 = pppppppuVar12;
              }
              if (pppppppuStack_f8 == (ulong *******)0x1) {
                bVar6 = true;
              }
LAB_0425de90:
              puVar23 = *(undefined8 **)(lVar13 + 0xe8a72b0);
              if (puVar23 != (undefined8 *)0x0) {
                pppppppuVar12 = (ulong *******)func_0x0800339c(puVar23);
                if (pppppppuVar12 != pppppppuVar10) goto LAB_0425de84;
                if (pppppppuVar10 == (ulong *******)0xffffffffffffffff) {
                  func_0x04c002c0();
                  plVar20 = (long *)0xffffffffffffffff;
                  pppppppuVar10 = pppppppuVar17;
LAB_0425dca4:
                  pppppppuStack_f8 =
                       (ulong *******)
                       (((long)pppppppuVar17 - (long)pppppppuVar10 >> 3) * -0x5555555555555555);
                  func_0x00008eb8(pppppppuVar10,local_f0 * 0x18);
                  goto LAB_0425d788;
                }
                iVar7 = func_0x08009860(pppppppuVar14,puVar23,pppppppuVar10);
                if (!(bool)(iVar7 == 0 & bVar6)) goto LAB_0425de84;
                bVar6 = true;
                puVar23 = param_4;
                pppppppuVar14 = param_1;
                goto joined_r0x0425def8;
              }
              goto LAB_0425dfa0;
            }
            bVar6 = false;
            goto joined_r0x0425def8;
          }
          func_0x0147166c(&local_120,&local_278);
          pppppppuVar17 = pppppppuStack_118;
          pppppppuVar10 = local_120;
          if (-1 < (long)local_110) {
            pppppppuVar17 = (ulong *******)(local_110 >> 0x38);
            pppppppuVar10 = (ulong *******)&local_120;
          }
          iVar7 = func_0x0103eb5c(pppppppuVar10,pppppppuVar17);
          if (iVar7 == 0) {
            pppppppuVar17 = (ulong *******)0x0;
            local_100 = (ulong *******)0x0;
            pppppppuStack_f8 = (ulong *******)0x0;
            local_f0 = 0;
          }
          else {
            if ((long)local_110 < 0) {
              func_0x00018218(&local_100,local_120,pppppppuStack_118);
            }
            else {
              pppppppuStack_f8 = pppppppuStack_118;
              local_100 = local_120;
              local_f0 = local_110;
            }
            pppppppuVar17 = (ulong *******)(local_f0 >> 0x38);
          }
          pppppppuVar10 = pppppppuStack_f8;
          pppppppuVar12 = local_100;
          if (-1 < (char)pppppppuVar17) {
            pppppppuVar10 = pppppppuVar17;
            pppppppuVar12 = (ulong *******)&local_100;
          }
          if ((long)pppppppuVar10 < 10) {
            if (pppppppuVar10 != (ulong *******)0x5) {
              if (pppppppuVar10 == (ulong *******)0x8) {
                if (*pppppppuVar12 == (ulong ******)0x6568636143555047) goto LAB_0425d5b4;
              }
              else if (pppppppuVar10 == (ulong *******)0x9) {
                ppppppuVar11 = *pppppppuVar12;
                bVar6 = *(char *)(pppppppuVar12 + 1) == 'e';
                ppppppuVar15 = (ulong ******)0x686361436e776144;
                goto LAB_0425d608;
              }
              goto LAB_0425d610;
            }
            if (*(char *)((long)pppppppuVar12 + 4) != 'e' || *(int *)pppppppuVar12 != 0x68636143)
            goto LAB_0425d610;
LAB_0425d5b4:
            bVar6 = false;
          }
          else {
            if ((long)pppppppuVar10 < 0xd) {
              if (pppppppuVar10 == (ulong *******)0xa) {
                if (*pppppppuVar12 == (ulong ******)0x6361432065646f43 &&
                    *(short *)(pppppppuVar12 + 1) == 0x6568) goto LAB_0425d5b4;
              }
              else if (pppppppuVar10 == (ulong *******)0xb) {
                ppppppuVar11 = *pppppppuVar12;
                lVar13 = *(long *)((long)pppppppuVar12 + 3);
                ppppppuVar15 = (ulong ******)0x6143726564616853;
                goto LAB_0425d598;
              }
            }
            else if (pppppppuVar10 == (ulong *******)0xd) {
              ppppppuVar11 = *pppppppuVar12;
              lVar13 = *(long *)((long)pppppppuVar12 + 5);
              ppppppuVar15 = (ulong ******)0x7265646168537247;
LAB_0425d598:
              if (ppppppuVar11 == ppppppuVar15 && lVar13 == 0x6568636143726564) goto LAB_0425d5b4;
            }
            else if (pppppppuVar10 == (ulong *******)0x11) {
              ppppppuVar11 = *pppppppuVar12;
              bVar6 = *(char *)(pppppppuVar12 + 2) == 'e' &&
                      pppppppuVar12[1] == (ulong ******)0x6863614365746968;
              ppppppuVar15 = (ulong ******)0x706172476e776144;
LAB_0425d608:
              if (bVar6 && ppppppuVar11 == ppppppuVar15) goto LAB_0425d5b4;
            }
LAB_0425d610:
            bVar6 = true;
          }
          if ((char)pppppppuVar17 < '\0') {
            func_0x00008eb8(local_100,local_f0 & 0x7fffffffffffffff);
          }
          if ((long)local_110 < 0) {
            func_0x00008eb8(local_120,local_110 & 0x7fffffffffffffff);
          }
          if (bVar6) goto LAB_0425d630;
          goto LAB_0425d788;
        }
        goto LAB_0425d524;
      }
      goto LAB_0425d52c;
    }
LAB_0425d514:
    uVar16 = 1;
LAB_0425d530:
    if ((long)local_220 < 0) {
      func_0x00008eb8(local_230,local_220 & 0x7fffffffffffffff);
    }
    func_0x01f713d0(&local_210);
  }
  return uVar16;
code_r0x0425dc20:
  plVar2 = (long *)plVar22[1];
  plVar18 = plVar22;
  if ((long *)plVar22[1] == (long *)0x0) {
    do {
      plVar22 = (long *)plVar18[2];
      bVar6 = plVar18 != (long *)*plVar22;
      plVar18 = plVar22;
    } while (bVar6);
  }
  else {
    do {
      plVar22 = plVar2;
      plVar2 = (long *)*plVar22;
    } while ((long *)*plVar22 != (long *)0x0);
  }
  if (plVar22 == plVar20) {
    uVar21 = (uint)local_110._7_1_;
    puVar23 = param_4;
    pppppppuVar10 = pppppppuVar12;
    goto LAB_0425d9bc;
  }
  goto LAB_0425db18;
LAB_0425de84:
  lVar13 = lVar13 + 8;
  if (lVar13 == 0x40) goto LAB_0425deec;
  goto LAB_0425de90;
LAB_0425deec:
  bVar6 = false;
  puVar23 = param_4;
  pppppppuVar14 = param_1;
joined_r0x0425def8:
  if ((uVar21 >> 7 & 1) != 0) {
    func_0x00008eb8(local_120,local_110 & 0x7fffffffffffffff);
  }
  pppppppuVar17 = local_100;
  if (local_100 != (ulong *******)0x0) {
    if ((long)pppppppuStack_f8 * 0x18 != 0) {
      lVar13 = (long)pppppppuStack_f8 * -0x18;
      pppppppuVar10 = local_100 + (long)pppppppuStack_f8 * 3;
      do {
        pppppppuVar12 = pppppppuVar10 + -3;
        if (pppppppuVar12 == (ulong *******)0x0) goto LAB_0425dfa0;
        if (*(char *)((long)pppppppuVar10 + -1) < '\0') {
          func_0x00008eb8(*pppppppuVar12,(ulong)pppppppuVar10[-1] & 0x7fffffffffffffff);
        }
        lVar13 = lVar13 + 0x18;
        pppppppuVar10 = pppppppuVar12;
      } while (lVar13 != 0);
    }
    pppppppuStack_f8 =
         (ulong *******)(((long)pppppppuVar17 - (long)local_100 >> 3) * -0x5555555555555555);
    func_0x00008eb8(local_100,local_f0 * 0x18);
  }
  if (bVar6) {
LAB_0425d788:
    if ((long)local_268 < 0) {
      func_0x00008eb8(local_278,local_268 & 0x7fffffffffffffff);
    }
LAB_0425d794:
    func_0x006ee1a0(&local_100,&local_210);
    if ((long)local_220 < 0) {
      func_0x00008eb8(local_230,local_220 & 0x7fffffffffffffff);
    }
    local_220 = local_f0;
    pppppppuStack_228 = pppppppuStack_f8;
    local_230 = local_100;
    pppppppuVar17 = pppppppuStack_f8;
    if ((local_f0 >> 0x38 & 0x80) == 0) {
      pppppppuVar17 = (ulong *******)(local_f0 >> 0x38);
    }
    if (pppppppuVar17 == (ulong *******)0x0) goto LAB_0425d514;
    goto LAB_0425d7cc;
  }
LAB_0425d690:
  local_100 = (ulong *******)0x0;
  pppppppuStack_f8 = (ulong *******)0x0;
  local_f0 = 0;
  func_0x0147166c(&local_120,&local_230);
  pppppppuVar17 = local_120;
  if (-1 < (long)(char)local_110._7_1_) {
    pppppppuVar17 = (ulong *******)&local_120;
  }
  pppppppuVar10 = pppppppuStack_118;
  if (-1 < (long)local_110) {
    pppppppuVar10 = (ulong *******)(long)(char)local_110._7_1_;
  }
  func_0x01699414(&local_100,param_3,pppppppuVar17,pppppppuVar10);
  if ((long)local_110 < 0) {
    func_0x00008eb8(local_120,local_110 & 0x7fffffffffffffff);
  }
  if ((char)uStack_258 == '\0') {
    func_0x010ccca4(&local_120,&local_100);
    uVar8 = func_0x0218bd88(&local_120,0);
    if ((uVar8 & 1) != 0) {
      uVar8 = func_0x0880a9c0(&local_230,&local_100);
      if ((long)local_110 < 0) {
        func_0x00008eb8(local_120,local_110 & 0x7fffffffffffffff);
      }
      if ((long)local_268 < 0) {
        func_0x00008eb8(local_278,local_268 & 0x7fffffffffffffff);
        if ((uVar8 & 1) == 0) goto LAB_0425d52c;
        goto LAB_0425d794;
      }
      if ((uVar8 & 1) != 0) goto LAB_0425d794;
      goto LAB_0425d52c;
    }
    if ((long)local_110 < 0) {
      func_0x00008eb8(local_120,local_110 & 0x7fffffffffffffff);
    }
  }
  else {
    uVar8 = entry(pppppppuVar14,&local_230,&local_100,puVar23,param_5);
    if ((uVar8 & 1) != 0) goto LAB_0425d788;
  }
LAB_0425d524:
  if ((long)local_268 < 0) {
    func_0x00008eb8(local_278,local_268 & 0x7fffffffffffffff);
  }
LAB_0425d52c:
  uVar16 = 0;
  goto LAB_0425d530;
}


