
/* WARNING: Removing unreachable block (ram,0x046569f0) */
/* WARNING: Type propagation algorithm not settling */
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void entry(long param_1,ulong *param_2,ulong *param_3)

{
  long *plVar1;
  uint uVar2;
  int iVar3;
  int iVar4;
  int iVar5;
  undefined8 *****pppppuVar6;
  undefined1 auVar7 [16];
  long lVar8;
  undefined1 *puVar9;
  code *pcVar10;
  bool bVar11;
  bool bVar12;
  int iVar13;
  undefined8 *******pppppppuVar14;
  undefined8 *puVar15;
  undefined8 *******pppppppuVar16;
  byte bVar17;
  ulong *puVar18;
  undefined1 (*pauVar19) [16];
  undefined1 (*pauVar20) [16];
  ulong *puVar21;
  undefined8 *extraout_x8;
  long lVar22;
  undefined8 *******pppppppuVar23;
  undefined1 (*pauVar24) [16];
  long lVar25;
  undefined8 ******ppppppuVar26;
  ulong *puVar27;
  ulong uVar28;
  ulong *puVar29;
  long lVar30;
  undefined1 (*pauVar31) [16];
  undefined8 ******ppppppuVar32;
  undefined8 *******pppppppuVar33;
  undefined8 *puVar34;
  undefined8 *puVar35;
  long *plVar36;
  undefined8 ******ppppppuVar37;
  undefined8 *puVar38;
  float fVar39;
  float fVar43;
  ulong uVar40;
  undefined8 ******ppppppuVar41;
  undefined1 auVar42 [16];
  undefined8 uVar44;
  uint uVar46;
  undefined1 auVar45 [16];
  undefined8 *******local_168;
  undefined8 *******local_160;
  long local_158;
  ulong local_150 [2];
  ulong local_140;
  byte bStack_139;
  undefined8 *******local_138;
  undefined8 *******local_130;
  long local_128;
  undefined8 *******local_120;
  undefined1 (*pauStack_118) [16];
  undefined8 local_110;
  undefined1 (*local_108) [16];
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
  
  auVar7 = _DAT_0df3a040;
  if (param_2 == param_3) {
    return;
  }
  if (*(long *)(param_1 + 0x5e0) == 0) {
    return;
  }
  puVar18 = *(ulong **)(param_1 + 0x718);
  if (puVar18 <= param_2 || puVar18 <= param_3) {
    return;
  }
  if (*(ulong **)(param_1 + 0x730) != puVar18) {
    return;
  }
  puVar34 = *(undefined8 **)(param_1 + 0x710);
  ppppppuVar37 = (undefined8 ******)puVar34[(long)param_2];
  local_130 = (undefined8 *******)0x0;
  local_128 = 0;
  local_138 = &local_130;
  if (((ulong)puVar18 & 0x1fffffffffffffff) != 0) {
    puVar35 = puVar34 + (long)puVar18;
    do {
      ppppppuVar32 = (undefined8 ******)*puVar34;
      pppppppuVar23 = &local_130;
      if (ppppppuVar32 == (undefined8 ******)0x0) {
        ppppppuVar26 = (undefined8 ******)0x0;
        ppppppuVar41 = (undefined8 ******)0x0;
        pppppppuVar16 = local_130;
      }
      else {
        auVar42._8_8_ = ppppppuVar32[0x37];
        auVar42._0_8_ = ppppppuVar32[0x37];
        auVar42 = NEON_ushl(auVar42,auVar7,8);
        pppppuVar6 = ppppppuVar32[0x38];
        auVar45 = auVar7;
        func_0x043efb20(&local_120,ppppppuVar32);
        fVar39 = (float)func_0x0043deac(&local_120);
        fVar39 = (float)(int)(fVar39 + 0.5);
        fVar43 = (float)(int)(auVar45._0_4_ + 0.5);
        uVar40 = CONCAT44(fVar43,fVar39) ^
                 (CONCAT44(fVar43,fVar39) ^ 0xcf000000cf000000) &
                 ~CONCAT44(-(uint)(-2.1474836e+09 < fVar43),-(uint)(-2.1474836e+09 < fVar39));
        uVar40 = CONCAT44((int)(float)(uVar40 >> 0x20),(int)(float)uVar40);
        ppppppuVar41 = (undefined8 ******)
                       NEON_sqadd(CONCAT44(auVar42._8_4_,auVar42._0_4_),
                                  uVar40 ^ (uVar40 ^ CONCAT44(-(uint)(-2.1474836e+09 <= fVar43),
                                                              -(uint)(-2.1474836e+09 <= fVar39)) &
                                                     0x7fffffff7fffffff) &
                                           ~CONCAT44(-(uint)(fVar43 <= 2.1474835e+09),
                                                     -(uint)(fVar39 <= 2.1474835e+09)),4);
        auVar45._8_8_ = pppppuVar6;
        auVar45._0_8_ = pppppuVar6;
        auVar45 = NEON_ushl(auVar45,auVar7,8);
        uVar44 = NEON_sqadd(ppppppuVar41,CONCAT44(auVar45._8_4_,auVar45._0_4_),4);
        uVar44 = NEON_sqsub(uVar44,ppppppuVar41,4);
        uVar46 = (uint)((ulong)uVar44 >> 0x20);
        ppppppuVar26 = (undefined8 ******)
                       CONCAT44(uVar46 & ((int)uVar46 >> 0x1f ^ 0xffffffffU),
                                (uint)uVar44 & ((int)(uint)uVar44 >> 0x1f ^ 0xffffffffU));
        pppppppuVar16 = local_130;
      }
      while (pppppppuVar33 = pppppppuVar23, pppppppuVar16 != (undefined8 *******)0x0) {
        while (pppppppuVar14 = pppppppuVar16, pppppppuVar14[4] <= ppppppuVar32) {
          if (ppppppuVar32 <= pppppppuVar14[4]) goto LAB_04656868;
          pppppppuVar16 = (undefined8 *******)pppppppuVar14[1];
          if ((undefined8 *******)pppppppuVar14[1] == (undefined8 *******)0x0) {
            pppppppuVar23 = pppppppuVar14 + 1;
            pppppppuVar33 = pppppppuVar14;
            goto LAB_04656810;
          }
        }
        pppppppuVar23 = pppppppuVar14;
        pppppppuVar16 = (undefined8 *******)*pppppppuVar14;
      }
LAB_04656810:
      pppppppuVar14 = (undefined8 *******)func_0x0000f368(0x38);
      if ((pppppppuVar14 == (undefined8 *******)0x0) ||
         (pppppppuVar14 == (undefined8 *******)0xffffffffffffffe0)) goto LAB_046570a4;
      *pppppppuVar14 = (undefined8 ******)0x0;
      pppppppuVar14[1] = (undefined8 ******)0x0;
      pppppppuVar14[5] = (undefined8 ******)0x0;
      pppppppuVar14[6] = (undefined8 ******)0x0;
      pppppppuVar14[4] = ppppppuVar32;
      pppppppuVar14[2] = pppppppuVar33;
      *pppppppuVar23 = pppppppuVar14;
      pppppppuVar16 = pppppppuVar14;
      if ((undefined8 *******)*local_138 != (undefined8 *******)0x0) {
        pppppppuVar16 = (undefined8 *******)*pppppppuVar23;
        local_138 = (undefined8 *******)*local_138;
      }
      func_0x0005ba60(local_130,pppppppuVar16);
      local_128 = local_128 + 1;
LAB_04656868:
      pppppppuVar14[5] = ppppppuVar41;
      pppppppuVar14[6] = ppppppuVar26;
      puVar34 = puVar34 + 1;
    } while (puVar34 != puVar35);
    puVar18 = *(ulong **)(param_1 + 0x730);
  }
  plVar36 = (long *)(param_1 + 0x730);
  local_150[0] = 0;
  local_150[1] = 0;
  local_140 = 0;
  if (param_2 < puVar18) {
    plVar1 = (long *)(param_1 + 0x728);
    lVar22 = *plVar1;
    pauVar24 = (undefined1 (*) [16])(lVar22 + (long)param_2 * 0x18);
    if ((char)pauVar24[1][7] < '\0') {
      func_0x00018218(local_150,*(undefined8 *)*pauVar24,*(undefined8 *)(*pauVar24 + 8));
      lVar22 = *plVar1;
      puVar18 = (ulong *)*plVar36;
    }
    else {
      local_140 = *(ulong *)pauVar24[1];
      local_150[1] = SUB168(*pauVar24,8);
      local_150[0] = SUB168(*pauVar24,0);
    }
    lVar25 = (long)param_2 * 0x18;
    if (lVar25 + (long)puVar18 * -0x18 != 0) {
      pauVar24 = (undefined1 (*) [16])(lVar22 + lVar25);
      if (lVar25 + 0x18 != (long)puVar18 * 0x18) {
        lVar22 = (long)puVar18 * 0x18 + (long)param_2 * -0x18 + -0x18;
        do {
          if ((char)pauVar24[1][7] < '\0') {
            func_0x00008eb8(*(undefined8 *)*pauVar24,*(ulong *)pauVar24[1] & 0x7fffffffffffffff);
          }
          *(long *)(*pauVar24 + 8) = SUB168(*(undefined1 (*) [16])(pauVar24[1] + 8),8);
          *(long *)*pauVar24 = SUB168(*(undefined1 (*) [16])(pauVar24[1] + 8),0);
          *(undefined8 *)pauVar24[1] = *(undefined8 *)(pauVar24[2] + 8);
          pauVar24[2][0xf] = 0;
          pauVar24 = (undefined1 (*) [16])(pauVar24[1] + 8);
          (*pauVar24)[0] = 0;
          lVar22 = lVar22 + -0x18;
        } while (lVar22 != 0);
        lVar22 = *plVar1;
        puVar18 = (ulong *)*plVar36;
      }
      pauVar19 = (undefined1 (*) [16])(lVar22 + (long)puVar18 * 0x18);
      if (pauVar24 != pauVar19) {
        do {
          pauVar19 = (undefined1 (*) [16])(pauVar19[-2] + 8);
          if (pauVar19 == (undefined1 (*) [16])0x0) goto LAB_046570a4;
        } while (pauVar19 != pauVar24);
        lVar22 = *plVar1;
      }
      lVar25 = (long)pauVar24 - lVar22 >> 3;
      uVar40 = lVar25 * -0x5555555555555555;
      *(ulong *)(param_1 + 0x730) = uVar40;
      puVar18 = (ulong *)((long)param_3 * 3);
      pauVar19 = (undefined1 (*) [16])(lVar22 + (long)param_3 * 0x18);
      if (uVar40 - *(long *)(param_1 + 0x738) == 0) {
        pauVar20 = (undefined1 (*) [16])(uVar40 + 1);
        if (pauVar20 < (undefined1 (*) [16])0xaaaaaaaaaaaaaab) {
          pauVar24 = (undefined1 (*) [16])(lVar25 * 0x5555555555555556);
          if (pauVar24 < pauVar20 || (long)pauVar24 - (long)pauVar20 == 0) {
            pauVar24 = pauVar20;
          }
          if (0x555555555555554 < uVar40) {
            pauVar24 = (undefined1 (*) [16])0xaaaaaaaaaaaaaaa;
          }
          local_120 = (undefined8 *******)0x0;
          if (pauVar24 != (undefined1 (*) [16])0x0) {
            if ((undefined1 (*) [16])0xaaaaaaaaaaaaaaa < pauVar24) goto LAB_0465739c;
            local_120 = (undefined8 *******)func_0x0000f368((long)pauVar24 * 0x18);
          }
          pauStack_118 = (undefined1 (*) [16])(local_120 + (long)param_3 * 3);
          local_110 = 0;
          local_108 = pauVar24;
          func_0x073f5164(&local_120,local_150);
          func_0x07276aec(&local_120,pauVar19,param_1 + 0x728,param_1 + 0x730,param_1 + 0x738);
          puVar18 = (ulong *)(local_110 * 0x18);
          pauVar24 = pauStack_118;
          if (puVar18 != (ulong *)0x0) goto LAB_046573bc;
          pauVar24 = (undefined1 (*) [16])((long)pauStack_118 + local_110 * 0x18);
          goto LAB_0465721c;
        }
        func_0x01f13d80();
        goto LAB_0465739c;
      }
      puVar27 = (ulong *)(lVar22 + ((long)pauVar24 - lVar22));
      puVar29 = param_2;
      if (pauVar24 == pauVar19) {
        if (pauVar19 != (undefined1 (*) [16])0x0) {
          if ((long)local_140 < 0) {
            func_0x00018218(puVar27,local_150[0],local_150[1]);
          }
          else {
            puVar27[2] = local_140;
            puVar27[1] = local_150[1];
            *puVar27 = local_150[0];
          }
          *plVar36 = ((long)puVar27 + (0x18 - *plVar1) >> 3) * -0x5555555555555555;
LAB_04656a98:
          lVar25 = (long)puVar29 * 8;
          lVar22 = *(long *)(param_1 + 0x718);
          if (lVar25 + lVar22 * -8 != 0) {
            pauVar24 = *(undefined1 (**) [16])(param_1 + 0x710);
            param_2 = (ulong *)(*pauVar24 + lVar25);
            if (lVar25 + 8 != lVar22 * 8) {
              lVar22 = lVar22 * 8 + (long)puVar29 * -8 + -8;
              puVar27 = param_2;
              do {
                if ((*puVar27 & 0xfffffffc00000000) == _DAT_0ebb2088) {
                  func_0x00022a3c();
                }
                param_2 = puVar27 + 1;
                *puVar27 = *param_2;
                *param_2 = 0;
                lVar22 = lVar22 + -8;
                puVar27 = param_2;
              } while (lVar22 != 0);
              pauVar24 = *(undefined1 (**) [16])(param_1 + 0x710);
              lVar22 = *(long *)(param_1 + 0x718);
            }
            if (param_2 != (ulong *)(*pauVar24 + lVar22 * 8)) {
              puVar27 = (ulong *)((long)(*pauVar24 + lVar22 * 8) + -8);
              do {
                if (puVar27 == (ulong *)0x0) goto LAB_046570a4;
                puVar18 = puVar27 + -1;
                if ((*puVar27 & 0xfffffffc00000000) == _DAT_0ebb2088) {
                  func_0x00022a3c();
                }
                *puVar27 = 0;
                bVar12 = puVar27 != param_2;
                puVar27 = puVar18;
              } while (bVar12);
              pauVar24 = *(undefined1 (**) [16])(param_1 + 0x710);
            }
            uVar40 = (long)param_2 - (long)pauVar24 >> 3;
            *(ulong *)(param_1 + 0x718) = uVar40;
            pauVar19 = (undefined1 (*) [16])(*pauVar24 + (long)param_3 * 8);
            if (((ulong)ppppppuVar37 & 0xfffffffc00000000) == _DAT_0ebb2088) {
              func_0x000142fc(ppppppuVar37);
              pauVar24 = *(undefined1 (**) [16])(param_1 + 0x710);
              uVar40 = *(ulong *)(param_1 + 0x718);
            }
            lVar22 = (long)pauVar19 - (long)pauVar24;
            puVar27 = (ulong *)((long)pauVar24 + lVar22);
            if (uVar40 == *(ulong *)(param_1 + 0x720)) {
              puVar29 = (ulong *)(uVar40 + 1);
              if ((ulong)puVar29 >> 0x3d != 0) goto LAB_046573a0;
              puVar18 = (ulong *)(uVar40 * 2);
              if (puVar18 < puVar29 || (long)puVar18 - (long)puVar29 == 0) {
                puVar18 = puVar29;
              }
              puVar29 = puVar18;
              if (0xffffffffffffffe < uVar40) {
                puVar29 = (ulong *)0x1fffffffffffffff;
              }
              if (puVar29 == (ulong *)0x0) {
                lVar25 = 0;
              }
              else {
                if ((ulong)puVar29 >> 0x3d != 0) {
LAB_0465739c:
                  func_0x04c06020();
                  goto LAB_046573a0;
                }
                lVar25 = func_0x0000f368((long)puVar29 << 3);
              }
              puVar34 = (undefined8 *)(lVar25 + lVar22);
              puVar21 = puVar29;
              puVar35 = puVar34;
              if (puVar29 == (ulong *)(lVar22 >> 3)) {
                if (pauVar24 == pauVar19) {
                  puVar21 = (ulong *)((long)puVar29 * 2);
                  if (puVar21 < (ulong *)0x2) {
                    puVar21 = (ulong *)0x1;
                  }
                  lVar22 = func_0x0000f368((long)puVar21 << 3);
                  puVar35 = (undefined8 *)(lVar22 + ((ulong)puVar21 >> 2) * 8);
                  if (lVar25 != 0) {
                    func_0x00008eb8(lVar25,(long)puVar29 << 3);
                  }
                }
                else {
                  puVar34 = (undefined8 *)
                            ((long)puVar34 - ((long)puVar29 * 4 + 4U & 0xfffffffffffffff8));
                  puVar21 = puVar18;
                  puVar35 = puVar34;
                }
              }
              if (puVar34 != (undefined8 *)0x0) {
                *puVar34 = ppppppuVar37;
                lVar22 = (long)puVar34 + (8 - (long)puVar35);
                pauVar24 = *(undefined1 (**) [16])(param_1 + 0x710);
                lVar25 = *(long *)(param_1 + 0x718);
                puVar18 = (ulong *)(*pauVar24 + lVar25 * 8);
                if ((long)puVar18 - (long)pauVar19 == 0) goto LAB_04656d04;
                lVar25 = 0;
                goto LAB_04656ca4;
              }
            }
            else {
              pauVar20 = (undefined1 (*) [16])(*pauVar24 + uVar40 * 8);
              if (pauVar20 != pauVar19) {
                pauVar31 = (undefined1 (*) [16])(pauVar20[-1] + 8);
                if (pauVar31 < pauVar20) {
                  uVar44 = *(undefined8 *)(pauVar20[-1] + 8);
                  *(undefined8 *)(pauVar20[-1] + 8) = 0;
                  *(undefined8 *)*pauVar20 = uVar44;
                  pauVar20 = (undefined1 (*) [16])(*pauVar20 + 8);
                  pauVar24 = *(undefined1 (**) [16])(param_1 + 0x710);
                }
                *(long *)(param_1 + 0x718) = (long)pauVar20 - (long)pauVar24 >> 3;
                if (uVar40 * 8 - (lVar22 + 8) != 0) {
                  do {
                    pauVar24 = pauVar31 + -1;
                    if ((*(ulong *)*pauVar31 & 0xfffffffc00000000) == _DAT_0ebb2088) {
                      func_0x00022a3c();
                    }
                    uVar44 = *(undefined8 *)(pauVar31[-1] + 8);
                    *(undefined8 *)(pauVar31[-1] + 8) = 0;
                    *(undefined8 *)*pauVar31 = uVar44;
                    pauVar31 = (undefined1 (*) [16])(*pauVar24 + 8);
                  } while ((undefined1 (*) [16])(*pauVar24 + 8) != pauVar19);
                }
                if ((*puVar27 & 0xfffffffc00000000) == _DAT_0ebb2088) {
                  func_0x00022a3c();
                }
                *puVar27 = (ulong)ppppppuVar37;
                goto LAB_04656dc8;
              }
              if (pauVar19 != (undefined1 (*) [16])0x0) {
                *(undefined8 *******)*pauVar20 = ppppppuVar37;
                *(long *)(param_1 + 0x718) = (long)pauVar20 + (8 - *(long *)(param_1 + 0x710)) >> 3;
                goto LAB_04656dc8;
              }
            }
          }
        }
      }
      else {
        func_0x07276a14(param_1 + 0x728,pauVar19,puVar27,pauVar19[1] + 8);
        if (pauVar19 <= pauVar24) {
          bVar12 = (undefined1 (*) [16])local_150 < pauVar19;
          bVar11 = pauVar24 <= (undefined1 (*) [16])local_150;
          lVar22 = 0x18;
          if (bVar12 || bVar11) {
            lVar22 = 0;
          }
          pauVar24 = (undefined1 (*) [16])(*(undefined1 (*) [16])local_150 + lVar22);
          if (pauVar24 != pauVar19) {
            lVar25 = 0x2f;
            if (bVar12 || bVar11) {
              lVar25 = 0x17;
            }
            bVar17 = (*(undefined1 (*) [16])local_150)[lVar25];
            if ((char)pauVar19[1][7] < '\0') {
              lVar22 = 0x20;
              if (bVar12 || bVar11) {
                lVar22 = 8;
              }
              pauVar20 = *(undefined1 (**) [16])*pauVar24;
              if (-1 < (char)bVar17) {
                pauVar20 = pauVar24;
              }
              uVar40 = *(ulong *)((long)local_150 + lVar22);
              if (-1 < (char)bVar17) {
                uVar40 = (ulong)bVar17;
              }
              func_0x004a8c00(pauVar19,pauVar20,uVar40);
            }
            else if ((char)bVar17 < '\0') {
              lVar22 = 0x20;
              if (bVar12 || bVar11) {
                lVar22 = 8;
              }
              func_0x004a8ab4(pauVar19,*(undefined8 *)*pauVar24,
                              *(undefined8 *)((long)local_150 + lVar22));
            }
            else {
              auVar7 = *pauVar24;
              *(undefined8 *)pauVar19[1] = *(undefined8 *)((long)&stack0xfffffffffffffec0 + lVar22);
              *(long *)(*pauVar19 + 8) = auVar7._8_8_;
              *(long *)*pauVar19 = auVar7._0_8_;
            }
          }
          goto LAB_04656a98;
        }
      }
    }
  }
LAB_046570a4:
                    /* WARNING: Does not return */
  pcVar10 = (code *)SoftwareBreakpoint(1,0x46570a8);
  (*pcVar10)();
LAB_046573a0:
  func_0x04bbe000();
  func_0x00008eb8(*extraout_x8,*(ulong *)((long)puVar18 + (long)*pauVar24 + -8) & 0x7fffffffffffffff
                 );
  while (puVar18 = puVar18 + -3, puVar18 != (ulong *)0x0) {
LAB_046573bc:
    if (*pauVar24 + (long)puVar18 == (undefined1 *)0x18) goto LAB_046570a4;
  }
LAB_0465721c:
  local_110 = ((long)pauVar24 - (long)pauStack_118 >> 3) * -0x5555555555555555;
  puVar29 = param_2;
  if (local_120 != (undefined8 *******)0x0) {
    func_0x00008eb8(local_120,(long)local_108 * 0x18);
  }
  goto LAB_04656a98;
  while (puVar34 = (undefined8 *)*puVar15, puVar35 = puVar15,
        (undefined8 *)*puVar15 != (undefined8 *)0x0) {
LAB_04657074:
    puVar15 = puVar34;
    puVar38 = puVar15;
    if ((undefined8 ******)puVar15[4] <= ppppppuVar32) {
      if (ppppppuVar32 <= (undefined8 ******)puVar15[4]) goto LAB_04657044;
      puVar34 = (undefined8 *)puVar15[1];
      if ((undefined8 *)puVar15[1] == (undefined8 *)0x0) {
        puVar35 = puVar15 + 1;
        break;
      }
      goto LAB_04657074;
    }
  }
LAB_04656ff0:
  puVar15 = (undefined8 *)func_0x0000f368(0x30);
  if ((puVar15 == (undefined8 *)0x0) || (puVar15 == (undefined8 *)0xffffffffffffffe0))
  goto LAB_046570a4;
  puVar15[4] = ppppppuVar32;
  puVar15[5] = 0;
  *puVar15 = 0;
  puVar15[1] = 0;
  puVar15[2] = puVar38;
  *puVar35 = puVar15;
  puVar34 = puVar15;
  if (**(long **)(param_1 + 0x7e0) != 0) {
    *(long *)(param_1 + 0x7e0) = **(long **)(param_1 + 0x7e0);
    puVar34 = (undefined8 *)*puVar35;
  }
  func_0x0005ba60(*(undefined8 *)(param_1 + 0x7e8),puVar34);
  *(long *)(param_1 + 0x7f0) = *(long *)(param_1 + 0x7f0) + 1;
LAB_04657044:
  puVar15[5] = CONCAT44(uVar2,uVar46);
LAB_04656f18:
  local_a0 = 0;
  local_108 = (undefined1 (*) [16])0x0;
  local_120 = (undefined8 *******)0x0;
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
  local_110 = CONCAT44((float)(int)uVar2,(float)(int)uVar46);
  pauStack_118 = pauVar24;
  func_0x0a6da0fc(ppppppuVar32,&local_120);
LAB_04656f40:
  uVar40 = *(ulong *)(param_1 + 0x718);
LAB_04656f6c:
  uVar28 = uVar28 + 1;
  if (uVar40 <= uVar28) goto LAB_04656724;
  goto LAB_04656f78;
  while( true ) {
    *puVar34 = *(undefined8 *)((long)puVar27 + lVar25);
    *(undefined8 *)((long)puVar27 + lVar25) = 0;
    lVar25 = lVar25 + 8;
    if ((ulong *)((long)puVar27 + lVar25) == puVar18) break;
LAB_04656ca4:
    puVar34 = (undefined8 *)((long)puVar35 + lVar25 + lVar22);
    if (puVar34 == (undefined8 *)0x0) goto LAB_046570a4;
  }
  do {
    if (puVar27 == (ulong *)0x0) goto LAB_046570a4;
    if ((*puVar27 & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x00022a3c();
    }
    puVar29 = puVar27 + 1;
    *puVar27 = 0;
    puVar27 = puVar29;
  } while (puVar29 != puVar18);
  lVar25 = *(long *)(param_1 + 0x718);
  pauVar24 = *(undefined1 (**) [16])(param_1 + 0x710);
LAB_04656d04:
  lVar30 = (long)puVar18 - (long)pauVar19 >> 3;
  lVar25 = lVar25 - lVar30;
  *(long *)(param_1 + 0x718) = lVar25;
  lVar8 = -lVar25;
  pauVar20 = pauVar24;
  puVar34 = puVar35 + lVar8;
  if (pauVar24 != pauVar19) {
    do {
      if (puVar34 == (undefined8 *)0x0) goto LAB_046570a4;
      *puVar34 = *(undefined8 *)*pauVar20;
      puVar9 = *pauVar20;
      *(undefined8 *)*pauVar20 = 0;
      pauVar20 = (undefined1 (*) [16])(puVar9 + 8);
      puVar34 = puVar34 + 1;
    } while ((undefined1 (*) [16])(puVar9 + 8) != pauVar19);
    do {
      if (pauVar24 == (undefined1 (*) [16])0x0) goto LAB_046570a4;
      if ((*(ulong *)*pauVar24 & 0xfffffffc00000000) == _DAT_0ebb2088) {
        func_0x00022a3c();
      }
      puVar9 = *pauVar24;
      *(undefined8 *)*pauVar24 = 0;
      pauVar24 = (undefined1 (*) [16])(puVar9 + 8);
    } while ((undefined1 (*) [16])(puVar9 + 8) != pauVar19);
    pauVar24 = *(undefined1 (**) [16])(param_1 + 0x710);
    lVar25 = *(long *)(param_1 + 0x718);
  }
  *(undefined8 **)(param_1 + 0x710) = puVar35 + lVar8;
  *(long *)(param_1 + 0x718) = (lVar22 >> 3) + lVar30 + lVar25;
  lVar22 = *(long *)(param_1 + 0x720);
  *(ulong **)(param_1 + 0x720) = puVar21;
  if (pauVar24 != (undefined1 (*) [16])0x0) {
    func_0x00008eb8(pauVar24,lVar22 << 3);
  }
LAB_04656dc8:
  func_0x0364f578(*(undefined8 *)(param_1 + 0x5e0),ppppppuVar37,param_3);
  *(ulong **)(param_1 + 0x7b8) = param_3;
  bVar17 = 1;
  *(undefined1 *)(param_1 + 0x7c0) = 1;
  if (*(long *)(param_1 + 0x730) == *(long *)(param_1 + 2000)) {
    lVar22 = *(long *)(param_1 + 0x730) * 0x18;
    bVar17 = 0;
    if (lVar22 != 0) {
      lVar25 = *(long *)(param_1 + 0x728);
      lVar30 = *(long *)(param_1 + 0x7c8);
      do {
        lVar22 = lVar22 + -0x18;
        iVar13 = func_0x010cc104(lVar25,lVar30);
        if (iVar13 == 0) break;
        lVar25 = lVar25 + 0x18;
        lVar30 = lVar30 + 0x18;
      } while (lVar22 != 0);
      bVar17 = (byte)iVar13 ^ 1;
    }
  }
  *(byte *)(param_1 + 0x808) = bVar17;
  local_168 = local_138;
  local_160 = local_130;
  local_158 = local_128;
  pppppppuVar23 = &local_160;
  if (local_128 != 0) {
    local_130[2] = &local_160;
    local_130 = (undefined8 *******)0x0;
    local_128 = 0;
    pppppppuVar23 = local_168;
    local_138 = &local_130;
  }
  local_168 = pppppppuVar23;
  func_0x04651c08(param_1);
  uVar40 = *(ulong *)(param_1 + 0x718);
  if (uVar40 != 0) {
    iVar13 = 0;
    uVar28 = 0;
    do {
      if (*(long *)(param_1 + 0x5e0) == 0) {
        local_120 = (undefined8 *******)0x0;
        pauStack_118 = (undefined1 (*) [16])0x0;
      }
      else {
        uVar46 = iVar13 + (*(int *)(*(long *)(param_1 + 0x5e0) + 0x1c0) + (int)uVar40 * -0x18) / 2;
        local_120 = (undefined8 *******)(ulong)uVar46;
        iVar3 = 0x7fffffff;
        if (!SCARRY4(uVar46,0x18)) {
          iVar3 = uVar46 + 0x18;
        }
        uVar2 = (int)(iVar3 - uVar46) >> 0x1f ^ 0x80000000;
        if (!SBORROW4(iVar3,uVar46)) {
          uVar2 = iVar3 - uVar46;
        }
        pauStack_118 = (undefined1 (*) [16])
                       ((ulong)(uVar2 & ((int)uVar2 >> 0x1f ^ 0xffffffffU)) | 0x1800000000);
      }
      func_0x008a4b90(*(undefined8 *)(*(long *)(param_1 + 0x710) + uVar28 * 8),&local_120);
      uVar28 = uVar28 + 1;
      uVar40 = *(ulong *)(param_1 + 0x718);
      iVar13 = iVar13 + 0x18;
    } while (uVar28 < uVar40);
    if (uVar40 != 0) {
      uVar28 = 0;
      pauVar24 = (undefined1 (*) [16])NEON_fmov(0x3f800000,4);
LAB_04656f78:
      if (local_160 != (undefined8 *******)0x0) {
        ppppppuVar32 = *(undefined8 *******)(*(long *)(param_1 + 0x710) + uVar28 * 8);
        pppppppuVar23 = local_160;
        do {
          while (pppppppuVar23[4] <= ppppppuVar32) {
            if (ppppppuVar32 <= pppppppuVar23[4]) {
              if ((undefined8 ********)pppppppuVar23 != &local_160) {
                iVar4 = *(int *)(ppppppuVar32 + 0x37);
                iVar13 = *(int *)(pppppppuVar23 + 5);
                iVar3 = *(int *)((long)pppppppuVar23 + 0x2c);
                uVar46 = iVar13 - iVar4 >> 0x1f ^ 0x80000000;
                if (!SBORROW4(iVar13,iVar4)) {
                  uVar46 = iVar13 - iVar4;
                }
                iVar5 = *(int *)((long)ppppppuVar32 + 0x1bc);
                uVar2 = iVar3 - iVar5 >> 0x1f ^ 0x80000000;
                if (!SBORROW4(iVar3,iVar5)) {
                  uVar2 = iVar3 - iVar5;
                }
                if (ppppppuVar32 == ppppppuVar37) goto LAB_04656f18;
                if ((iVar13 == iVar4) && (iVar3 == iVar5)) goto LAB_04656f40;
                puVar34 = *(undefined8 **)(param_1 + 0x7e8);
                puVar35 = (undefined8 *)(param_1 + 0x7e8);
                puVar38 = (undefined8 *)(param_1 + 0x7e8);
                if (*(undefined8 **)(param_1 + 0x7e8) == (undefined8 *)0x0) goto LAB_04656ff0;
                goto LAB_04657074;
              }
              goto LAB_04656f6c;
            }
            pppppppuVar23 = (undefined8 *******)pppppppuVar23[1];
            if (pppppppuVar23 == (undefined8 *******)0x0) goto LAB_04656f6c;
          }
          pppppppuVar23 = (undefined8 *******)*pppppppuVar23;
        } while (pppppppuVar23 != (undefined8 *******)0x0);
      }
      goto LAB_04656f6c;
    }
  }
LAB_04656724:
  if (*(long *)(param_1 + 0x7f0) != 0) {
    if (*(char *)(param_1 + 0xec0) != '\0') {
      *(undefined1 *)(param_1 + 0xec0) = 0;
    }
    *(undefined8 *)(param_1 + 0xed8) = 0;
    if (*(char *)(param_1 + 0xe78) != '\0') {
      *(undefined1 *)(param_1 + 0xe78) = 0;
      func_0x02109700(*(undefined8 *)(param_1 + 0xe88),param_1 + 0xe68);
      (**(code **)(*(long *)(param_1 + 0xe68) + 0x38))(param_1 + 0xe68);
      if (*(long *)(param_1 + 0xe80) != 0) {
        iVar13 = (**(code **)(*(long *)(param_1 + 0xe68) + 0x40))(param_1 + 0xe68);
        lVar22 = 0x20;
        if (iVar13 == 0) {
          lVar22 = 0x10;
        }
        (**(code **)(**(long **)(param_1 + 0xe80) + lVar22))
                  (*(long **)(param_1 + 0xe80),param_1 + 0xe68);
      }
    }
    func_0x0239e964(param_1 + 0xe68,0);
  }
  local_120 = &local_168;
  func_0x02ea5b40(&local_120,local_160);
  func_0x04136218();
  func_0x005a117c(*(undefined8 *)(param_1 + 0x5e0));
  if ((long)local_140 < 0) {
    func_0x00008eb8(local_150[0],local_140 & 0x7fffffffffffffff);
  }
  local_120 = &local_138;
  func_0x02ea5b40(&local_120,local_130);
  return;
}

