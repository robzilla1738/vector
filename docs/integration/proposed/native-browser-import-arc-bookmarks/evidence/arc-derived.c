
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void entry(long *param_1,undefined8 param_2,long *param_3)

{
  long lVar1;
  long *plVar2;
  ulong uVar3;
  undefined8 ******ppppppuVar4;
  byte bVar5;
  byte bVar6;
  undefined8 *******pppppppuVar7;
  code *pcVar8;
  int iVar9;
  uint uVar10;
  ulong *puVar11;
  undefined8 *puVar12;
  long *plVar13;
  long lVar14;
  long *plVar15;
  undefined8 *puVar16;
  undefined8 *******pppppppuVar17;
  long lVar18;
  ulong uVar19;
  long lVar20;
  ulong uVar21;
  ulong uVar22;
  undefined8 *puVar23;
  long lVar24;
  long local_190;
  long local_188;
  undefined8 ******local_160;
  undefined8 *****pppppuStack_158;
  undefined8 local_150;
  undefined8 uStack_148;
  undefined8 uStack_140;
  undefined8 uStack_138;
  undefined8 local_130;
  undefined8 uStack_128;
  undefined8 uStack_120;
  undefined8 uStack_118;
  undefined8 local_110;
  undefined8 uStack_108;
  undefined8 uStack_100;
  undefined8 uStack_f8;
  undefined8 local_f0;
  undefined8 uStack_e8;
  undefined8 uStack_e0;
  undefined8 uStack_d8;
  ulong local_d0;
  long lStack_c8;
  long local_c0;
  long local_b8;
  undefined8 *****local_b0;
  undefined8 ****local_a8;
  undefined8 uStack_a0;
  long local_98;
  long local_90;
  long local_88;
  undefined8 ******local_80;
  ulong uStack_78;
  undefined8 local_70;
  
  *param_1 = 0;
  param_1[1] = 0;
  param_1[2] = 0;
  puVar11 = (ulong *)func_0x0046ad40(param_2,0xdb2044a,0x12);
  if ((puVar11 != (ulong *)0x0) && ((char)puVar11[3] == '\a')) {
    uVar19 = *puVar11;
    if (uVar19 + puVar11[1] * 0x20 < uVar19) {
                    /* WARNING: Does not return */
      pcVar8 = (code *)SoftwareBreakpoint(0,0x426be28);
      (*pcVar8)();
    }
    for (lVar24 = puVar11[1] << 5; lVar24 != 0; lVar24 = lVar24 + -0x20) {
      if (*(char *)(uVar19 + 0x18) == '\x06') {
        puVar12 = (undefined8 *)func_0x0192ca80(uVar19,0xd96ce4b,5);
        plVar13 = (long *)func_0x0192ca80(uVar19,0xd91e78b,6);
        if ((((puVar12 != (undefined8 *)0x0) && (plVar13 != (long *)0x0)) && (puVar12[1] != 0)) &&
           (plVar13[1] != 0)) goto LAB_0426b62c;
      }
      uVar19 = uVar19 + 0x20;
    }
  }
  puVar12 = (undefined8 *)func_0x0046ad40(param_2,0xdb2045d,0x16);
  if (puVar12 == (undefined8 *)0x0) {
    puVar12 = (undefined8 *)0x0;
  }
  else if (*(char *)(puVar12 + 3) != '\a') {
    puVar12 = (undefined8 *)0x0;
  }
  plVar13 = (long *)func_0x0046ad40(param_2,0xdb20474,0x1c);
  if (((plVar13 == (long *)0x0) || (puVar12 == (undefined8 *)0x0)) || ((char)plVar13[3] != '\a')) {
    puVar12 = (undefined8 *)func_0x0046ad40(param_2,0xdb20491,0x20);
    if (puVar12 == (undefined8 *)0x0) {
      puVar12 = (undefined8 *)0x0;
    }
    else if (*(char *)(puVar12 + 3) != '\a') {
      puVar12 = (undefined8 *)0x0;
    }
    plVar13 = (long *)func_0x0046ad40(param_2,0xdb204b2,0x26);
    if (plVar13 == (long *)0x0) {
      return;
    }
    if ((char)plVar13[3] != '\a') {
      plVar13 = (long *)0x0;
    }
  }
LAB_0426b62c:
  if (((plVar13 == (long *)0x0) || (puVar12 == (undefined8 *)0x0)) || ((ulong)plVar13[1] < 2)) {
    return;
  }
  local_190 = 0;
  local_188 = 0;
  lVar24 = 0;
LAB_0426b754:
  lVar1 = *plVar13 + lVar24 * 0x20;
  if (*(char *)(lVar1 + 0x38) == '\x06') {
    lVar1 = lVar1 + 0x20;
    lVar14 = func_0x0095e840(lVar1,0xd7ef960,5);
    if (lVar14 != 0) {
      lVar1 = lVar14;
    }
    if ((lVar1 == 0) || (lVar14 = func_0x0095e840(lVar1,0xd899d54,7), lVar14 == 0))
    goto LAB_0426b740;
    bVar5 = *(byte *)((long)param_3 + 0x17);
    uVar19 = param_3[1];
    if (-1 < (char)bVar5) {
      uVar19 = (ulong)bVar5;
    }
    if (uVar19 != 7) {
LAB_0426b7ec:
      lVar14 = func_0x0095e840(lVar14,0xdadd5c5,6);
      if ((lVar14 != 0) &&
         ((lVar14 = func_0x0095e840(lVar14,0xdb20515,2), lVar14 != 0 &&
          (plVar15 = (long *)func_0x02029a80(lVar14,0xdb20518,0x11), plVar15 != (long *)0x0)))) {
        bVar5 = *(byte *)((long)plVar15 + 0x17);
        uVar19 = plVar15[1];
        if (-1 < (char)bVar5) {
          uVar19 = (ulong)bVar5;
        }
        bVar6 = *(byte *)((long)param_3 + 0x17);
        uVar22 = param_3[1];
        if (-1 < (char)bVar6) {
          uVar22 = (ulong)bVar6;
        }
        if (uVar19 == uVar22) {
          plVar2 = (long *)*plVar15;
          if (-1 < (char)bVar5) {
            plVar2 = plVar15;
          }
          plVar15 = (long *)*param_3;
          if (-1 < (char)bVar6) {
            plVar15 = param_3;
          }
          iVar9 = func_0x08009860(plVar2,plVar15);
          if (iVar9 == 0) goto LAB_0426b8a0;
        }
      }
      goto LAB_0426b740;
    }
    plVar15 = (long *)*param_3;
    if (-1 < (char)bVar5) {
      plVar15 = param_3;
    }
    if (((int)*plVar15 != 0x61666544 || *(int *)((long)plVar15 + 3) != 0x746c7561) ||
       (uVar10 = func_0x014e14c0(lVar14,0xd88ac3a,7), ((uVar10 ^ 0xffffffff) & 0x101) != 0))
    goto LAB_0426b7ec;
LAB_0426b8a0:
    local_80 = (undefined8 *******)0x0;
    uStack_78 = 0;
    local_70 = 0;
    plVar15 = (long *)func_0x0192ca80(lVar1,0xdb2052a,0xf);
    if ((plVar15 != (long *)0x0) && (uVar19 = plVar15[1], 1 < uVar19)) {
      lVar14 = 0;
      uVar22 = 1;
      do {
        lVar20 = *plVar15;
        if (*(char *)(lVar20 + lVar14 + 0x18) == '\x06' &&
            *(char *)(lVar20 + lVar14 + 0x38) == '\x04') {
          pppppuStack_158 = (undefined8 ******)0x6;
          local_160 = (undefined8 *******)0xdb2053a;
          uVar19 = func_0x01d3b840(lVar20 + lVar14,&local_160);
          if ((uVar19 & 1) != 0) {
            lVar18 = lVar20 + lVar14;
            if (*(char *)(lVar18 + 0x38) != '\x04') {
              if (*(char *)(lVar18 + 0x38) == -1) {
                func_0x04c27290(0xd7e4ef8);
              }
              func_0x04c27290(0xd7e4f18);
                    /* WARNING: Does not return */
              pcVar8 = (code *)UndefinedInstructionException(0,0x426be5c);
              (*pcVar8)();
            }
            if (*(char *)(lVar18 + 0x37) < '\0') {
              func_0x00018218(&local_80,*(undefined8 *)(lVar18 + 0x20),
                              *(undefined8 *)(lVar20 + lVar14 + 0x28));
            }
            else {
              uStack_78 = *(ulong *)(lVar18 + 0x28);
              local_80 = *(undefined8 *******)(lVar18 + 0x20);
              local_70 = *(ulong *)(lVar18 + 0x30);
            }
            goto LAB_0426b9b8;
          }
          uVar19 = plVar15[1];
        }
        uVar22 = uVar22 + 2;
        lVar14 = lVar14 + 0x40;
      } while (uVar22 < uVar19);
    }
    puVar23 = (undefined8 *)func_0x0192ca80(lVar1,0xdb20541,0xc);
    if (puVar23 == (undefined8 *)0x0) {
      local_80 = (undefined8 *******)0x0;
      uStack_78 = 0;
      local_70 = 0;
    }
    else {
      if (1 < (ulong)puVar23[1]) {
        plVar15 = (long *)*puVar23;
        uVar19 = 1;
        do {
          if ((char)plVar15[3] == '\x04' && (char)plVar15[7] == '\x04') {
            bVar5 = *(byte *)((long)plVar15 + 0x17);
            uVar22 = plVar15[1];
            if (-1 < (char)bVar5) {
              uVar22 = (ulong)bVar5;
            }
            if (uVar22 == 6) {
              plVar2 = (long *)*plVar15;
              if (-1 < (char)bVar5) {
                plVar2 = plVar15;
              }
              if ((int)*plVar2 == 0x6e6e6970 && *(short *)((long)plVar2 + 4) == 0x6465) {
                if (*(char *)((long)plVar15 + 0x37) < '\0') {
                  func_0x00018218(&local_80,plVar15[4],plVar15[5]);
                }
                else {
                  uStack_78 = plVar15[5];
                  local_80 = (undefined8 ******)plVar15[4];
                  local_70 = plVar15[6];
                }
                goto LAB_0426b9b8;
              }
            }
          }
          uVar19 = uVar19 + 2;
          plVar15 = plVar15 + 8;
        } while (uVar19 < (ulong)puVar23[1]);
      }
      local_80 = (undefined8 *******)0x0;
      uStack_78 = 0;
      local_70 = 0;
    }
LAB_0426b9b8:
    uVar10 = (uint)(char)local_70._7_1_;
    uVar19 = uStack_78;
    if (-1 < (int)uVar10) {
      uVar19 = (ulong)local_70._7_1_;
    }
    if (uVar19 != 0) {
      local_98 = 0;
      local_90 = 0;
      local_88 = 0;
      local_a8 = (undefined8 ****)0x0;
      uStack_a0 = 0;
      uVar22 = puVar12[1];
      local_b0 = &local_a8;
      if (1 < uVar22) {
        puVar23 = (undefined8 *)*puVar12;
        pppppppuVar17 = (undefined8 *******)local_80;
        if (-1 < (int)uVar10) {
          pppppppuVar17 = &local_80;
        }
        uVar21 = 1;
        do {
          if (*(char *)(puVar23 + 3) == '\x04') {
            bVar5 = *(byte *)((long)puVar23 + 0x17);
            uVar3 = puVar23[1];
            if (-1 < (char)bVar5) {
              uVar3 = (ulong)bVar5;
            }
            if (uVar3 == uVar19) {
              puVar16 = (undefined8 *)*puVar23;
              if (-1 < (char)bVar5) {
                puVar16 = puVar23;
              }
              iVar9 = func_0x08009860(puVar16,pppppppuVar17,uVar19);
              if (iVar9 == 0) {
                if (*(char *)(puVar23 + 7) == '\x06') {
                  puVar16 = (undefined8 *)func_0x0095e840(puVar23 + 4,0xd7ef960,5);
                  puVar23 = puVar23 + 4;
                  if (puVar16 != (undefined8 *)0x0) {
                    puVar23 = puVar16;
                  }
                  if ((puVar23 != (undefined8 *)0x0) &&
                     (puVar11 = (ulong *)func_0x0192ca80(puVar23,0xdb204fa,0xb),
                     puVar11 != (ulong *)0x0)) {
                    uVar19 = *puVar11;
                    if (uVar19 + puVar11[1] * 0x20 < uVar19) {
                    /* WARNING: Does not return */
                      pcVar8 = (code *)SoftwareBreakpoint(0,0x426be34);
                      (*pcVar8)();
                    }
                    lVar14 = puVar11[1] << 5;
                    if (lVar14 != 0) goto LAB_0426bb78;
                  }
                }
                break;
              }
            }
          }
          uVar21 = uVar21 + 2;
          puVar23 = puVar23 + 8;
        } while (uVar21 < uVar22);
      }
      goto LAB_0426b6c0;
    }
    if ((uVar10 >> 7 & 1) == 0) goto LAB_0426b740;
    goto LAB_0426b730;
  }
  goto LAB_0426b740;
LAB_0426bb78:
  do {
    if (*(char *)(uVar19 + 0x18) == '\x04') {
      func_0x0426d388(puVar12,uVar19,&local_b0,&local_98);
    }
    lVar20 = local_90;
    uVar19 = uVar19 + 0x20;
    lVar14 = lVar14 + -0x20;
  } while (lVar14 != 0);
  if (local_90 != 0) {
    lStack_c8 = 0;
    local_d0 = 0;
    local_b8 = 0;
    local_c0 = 0;
    uStack_e8 = 0;
    local_f0 = 0;
    uStack_d8 = 0;
    uStack_e0 = 0;
    uStack_108 = 0;
    local_110 = 0;
    uStack_f8 = 0;
    uStack_100 = 0;
    uStack_128 = 0;
    local_130 = 0;
    uStack_118 = 0;
    uStack_120 = 0;
    uStack_148 = 0;
    local_150 = (undefined8 ******)0x0;
    uStack_138 = 0;
    uStack_140 = 0;
    pppppuStack_158 = (undefined8 ******)0x0;
    local_160 = (undefined8 *******)0x0;
    pppppppuVar17 = (undefined8 *******)func_0x02029a80(lVar1,0xd7fcc1c,5);
    if (pppppppuVar17 == (undefined8 *******)0x0) {
      if ((long)local_150 < 0) {
        pppppuStack_158 = (undefined8 ******)0xe;
        pppppppuVar17 = (undefined8 *******)local_160;
      }
      else {
        local_150 = (undefined8 ******)CONCAT17(0xe,(undefined7)local_150);
        pppppppuVar17 = &local_160;
      }
      *pppppppuVar17 = (undefined8 ******)CONCAT26(_DAT_0db2050c,_DAT_0db20506);
      *(ulong *)((long)pppppppuVar17 + 6) = CONCAT62(uRam000000000db2050e,_DAT_0db2050c);
      *(undefined1 *)((long)pppppppuVar17 + 0xe) = 0;
    }
    else if (&local_160 != pppppppuVar17) {
      bVar5 = *(byte *)((long)pppppppuVar17 + 0x17);
      if ((long)local_150 < 0) {
        ppppppuVar4 = pppppppuVar17[1];
        pppppppuVar7 = (undefined8 *******)*pppppppuVar17;
        if (-1 < (char)bVar5) {
          ppppppuVar4 = (undefined8 ******)(ulong)bVar5;
          pppppppuVar7 = pppppppuVar17;
        }
        func_0x004a8c00(&local_160,pppppppuVar7,ppppppuVar4);
      }
      else if ((char)bVar5 < '\0') {
        func_0x004a8ab4(&local_160,*pppppppuVar17,pppppppuVar17[1]);
      }
      else {
        pppppuStack_158 = pppppppuVar17[1];
        local_160 = *pppppppuVar17;
        local_150 = pppppppuVar17[2];
      }
    }
    lVar1 = lStack_c8;
    if (lStack_c8 != 0) {
      if (local_c0 * 0xb0 != 0) {
        lVar18 = lStack_c8 + local_c0 * 0xb0;
        lVar14 = local_c0 * -0xb0;
        do {
          if (lVar18 == 0xb0) goto LAB_0426bdac;
          lVar18 = func_0x0426b3c0();
          lVar14 = lVar14 + 0xb0;
        } while (lVar14 != 0);
      }
      local_c0 = (lVar1 - lStack_c8 >> 4) * 0x2e8ba2e8ba2e8ba3;
      func_0x00008eb8(lStack_c8,local_b8 * 0xb0);
    }
    lStack_c8 = local_98;
    local_c0 = lVar20;
    local_b8 = local_88;
    local_90 = 0;
    local_88 = 0;
    local_98 = 0;
    if (local_188 == param_1[2]) {
      puVar23 = (undefined8 *)func_0x0426d97c(param_1,&local_160);
    }
    else {
      puVar23 = (undefined8 *)(local_190 + local_188 * 0xb0);
      if (puVar23 == (undefined8 *)0x0) goto LAB_0426bdac;
      puVar23[2] = local_150;
      puVar23[1] = pppppuStack_158;
      *puVar23 = local_160;
      pppppuStack_158 = (undefined8 ******)0x0;
      local_150 = (undefined8 ******)0x0;
      local_160 = (undefined8 *******)0x0;
      *(undefined1 *)(puVar23 + 3) = 0;
      *(undefined1 *)(puVar23 + 0x12) = 0;
      if ((local_d0 & 1) != 0) {
        func_0x001dae44(puVar23 + 3,&uStack_148);
        *(undefined1 *)(puVar23 + 0x12) = 1;
      }
      lVar20 = local_b8;
      lVar14 = local_c0;
      lVar1 = lStack_c8;
      lStack_c8 = 0;
      puVar23[0x13] = lVar1;
      local_c0 = 0;
      puVar23[0x14] = lVar14;
      local_b8 = 0;
      puVar23[0x15] = lVar20;
      puVar23 = puVar23 + 0x16;
    }
    local_190 = *param_1;
    local_188 = ((long)puVar23 - local_190 >> 4) * 0x2e8ba2e8ba2e8ba3;
    param_1[1] = local_188;
    if ((long)puVar23 - local_190 == 0) {
LAB_0426bdac:
                    /* WARNING: Does not return */
      pcVar8 = (code *)SoftwareBreakpoint(1,0x426bdb0);
      (*pcVar8)();
    }
    func_0x0426b3c0(&local_160);
  }
LAB_0426b6c0:
  local_160 = &local_b0;
  func_0x00720aac(&local_160,local_a8);
  lVar1 = local_98;
  if (local_98 != 0) {
    if (local_90 * 0xb0 != 0) {
      lVar20 = local_98 + local_90 * 0xb0;
      lVar14 = local_90 * -0xb0;
      do {
        if (lVar20 == 0xb0) goto LAB_0426bdac;
        lVar20 = func_0x0426b3c0();
        lVar14 = lVar14 + 0xb0;
      } while (lVar14 != 0);
    }
    local_90 = 0;
    func_0x00008eb8(lVar1,local_88 * 0xb0);
  }
  if ((long)local_70 < 0) {
LAB_0426b730:
    func_0x00008eb8(local_80,local_70 & 0x7fffffffffffffff);
  }
LAB_0426b740:
  uVar19 = lVar24 + 3;
  lVar24 = lVar24 + 2;
  if ((ulong)plVar13[1] <= uVar19) {
    return;
  }
  goto LAB_0426b754;
}

