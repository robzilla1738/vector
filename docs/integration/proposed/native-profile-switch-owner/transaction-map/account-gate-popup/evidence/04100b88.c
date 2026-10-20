// func FUN_04100b88 @ 04100b88 size 6872

/* WARNING: Removing unreachable block (ram,0x04100fa0) */
/* WARNING: Removing unreachable block (ram,0x04101a78) */
/* WARNING: Removing unreachable block (ram,0x04100d7c) */
/* WARNING: Type propagation algorithm not settling */
/* WARNING: Restarted to delay deadcode elimination for space: stack */

void FUN_04100b88(undefined4 *param_1)

{
  ulong uVar1;
  byte *pbVar2;
  dword *pdVar3;
  qword *pqVar4;
  undefined8 *******pppppppuVar5;
  undefined8 *****pppppuVar6;
  qword qVar7;
  byte bVar8;
  char cVar9;
  undefined8 ******ppppppuVar10;
  bool bVar11;
  code *pcVar12;
  bool bVar13;
  undefined4 uVar14;
  long *plVar15;
  long *plVar16;
  undefined8 *puVar17;
  undefined8 *******pppppppuVar18;
  long *plVar19;
  ushort uVar20;
  int iVar21;
  long lVar22;
  long lVar23;
  undefined2 *puVar24;
  undefined4 *puVar25;
  ulong uVar26;
  ulong *puVar27;
  ulong uVar28;
  undefined8 ******ppppppuVar29;
  long lVar30;
  long lVar31;
  undefined8 *puVar32;
  undefined8 *******pppppppuVar33;
  undefined8 ******ppppppuVar34;
  ulong *puVar35;
  undefined8 uVar36;
  undefined8 uVar37;
  ulong local_290;
  undefined8 *******pppppppuStack_288;
  undefined8 ******ppppppuStack_280;
  undefined8 ******ppppppuStack_278;
  undefined8 *******pppppppuStack_270;
  undefined8 ******ppppppuStack_268;
  undefined8 ******local_260;
  undefined8 ******local_258;
  undefined8 *******pppppppuStack_250;
  undefined8 ******ppppppuStack_248;
  undefined8 ******local_240;
  undefined8 ******ppppppuStack_238;
  undefined8 ******local_230;
  undefined8 ******ppppppuStack_228;
  undefined8 ******ppppppuStack_220;
  undefined8 ******local_218;
  undefined8 ******local_210;
  undefined8 ******ppppppuStack_208;
  undefined8 ******local_200;
  undefined8 local_1f8;
  undefined8 ******local_1f0;
  undefined8 ******ppppppuStack_1e8;
  undefined8 ******local_1e0;
  ulong local_1d8;
  int local_1c4;
  undefined8 local_1c0;
  ulong uStack_1b8;
  undefined8 *******local_1b0;
  undefined8 ******ppppppuStack_1a8;
  undefined8 ******local_1a0;
  undefined8 *******pppppppuStack_198;
  undefined8 ******local_190;
  undefined8 ******local_188;
  undefined8 local_180;
  undefined8 *******pppppppuStack_178;
  undefined8 ******ppppppuStack_170;
  undefined8 ******local_168;
  undefined8 local_160;
  long local_158;
  long lStack_150;
  long local_148;
  long lStack_140;
  ulong local_138;
  ulong uStack_130;
  ulong local_128;
  long lStack_120;
  long local_118;
  ulong uStack_110;
  long local_108;
  long lStack_100;
  long local_f0;
  undefined8 uStack_e8;
  undefined8 local_e0;
  ulong local_d8;
  ulong local_d0;
  undefined8 *******local_c0;
  long lStack_b8;
  undefined8 local_b0;
  undefined8 local_a8;
  ulong local_a0;
  undefined8 local_98;
  undefined8 *******local_90;
  undefined8 *******local_88;
  undefined8 local_80;
  ulong local_78;
  
  local_a8 = 0;
  local_a0 = 0;
  local_98 = 0;
  FUN_04100adc(&local_a8);
  uVar26 = local_a0;
  if (-1 < (char)local_98._7_1_) {
    uVar26 = (ulong)local_98._7_1_;
  }
  if (uVar26 == 0) {
    *(undefined1 *)param_1 = 0;
    *(undefined1 *)(param_1 + 0x32) = 0;
    if (((uint)(int)(char)local_98._7_1_ >> 7 & 1) == 0) {
      return;
    }
  }
  else {
    local_c0 = (undefined8 *******)0x0;
    lStack_b8 = 0;
    local_b0 = 0;
    local_290 = 0;
    pppppppuStack_288 = (undefined8 *******)0x0;
    FUN_00050c80(&local_1c0,"ScopedAllowBlockingForAsideAccountsStateReader",
                 "../../chrome/browser/profiles/aside_accounts_state_reader.cc",0x12);
    FUN_025094a4(&local_290,&local_1c0);
    puVar32 = &local_a8;
    FUN_01f92b88(puVar32,&local_c0,0xffffffffffffffff);
    if (((ulong)puVar32 & 1) == 0) {
      *(undefined1 *)param_1 = 0;
      *(undefined1 *)(param_1 + 0x32) = 0;
      FUN_02509414(&local_290);
    }
    else {
      FUN_02509414(&local_290);
      local_d0 = 0;
      uStack_e8 = 0;
      local_f0 = 0;
      local_d8 = 0;
      local_e0 = 0;
      pppppppuVar33 = local_c0;
      if (-1 < (long)local_b0._7_1_) {
        pppppppuVar33 = &local_c0;
      }
      lVar30 = lStack_b8;
      if (-1 < local_b0) {
        lVar30 = (long)local_b0._7_1_;
      }
      FUN_01bc2028(&local_f0,pppppppuVar33,lVar30,0,200);
      if (((byte)local_d0 & (char)local_d8 == '\x06') == 0) {
        *(undefined1 *)param_1 = 0;
        *(undefined1 *)(param_1 + 0x32) = 0;
      }
      else {
        plVar15 = &local_f0;
        FUN_0095e840(plVar15,"sessions",8);
        pppppppuStack_178 = (undefined8 *******)0x0;
        local_180 = 0;
        local_168 = (undefined8 ******)0x0;
        ppppppuStack_170 = (undefined8 ******)0x0;
        pppppppuStack_198 = (undefined8 *******)0x0;
        local_1a0 = (undefined8 ******)0x0;
        local_188 = (undefined8 ******)0x0;
        local_190 = (undefined8 ******)0x0;
        uStack_1b8 = 0;
        local_1c0 = 0;
        ppppppuStack_1a8 = (undefined8 ******)0x0;
        local_1b0 = (undefined8 *******)0x0;
        local_160 = (undefined8 ******)0xffffffffffffffff;
        lStack_150 = 0;
        local_158 = 0;
        lStack_140 = 0;
        local_148 = 0;
        uStack_130 = 0;
        local_138 = 0;
        lStack_120 = 0;
        local_128 = 0;
        uStack_110 = 0;
        local_118 = 0;
        lStack_100 = 0;
        local_108 = 0;
        plVar16 = &local_f0;
        FUN_0095ec80(plVar16,"currentAccountId",0x10);
        uVar14 = 0;
        if (((ulong)plVar16 & 0x100000000) != 0) {
          uVar14 = SUB84(plVar16,0);
        }
        local_1c0 = CONCAT44(local_1c0._4_4_,uVar14);
        if ((plVar15 != (long *)0x0) && (lVar30 = plVar15[1] << 5, lVar30 != 0)) {
          plVar16 = (long *)(*plVar15 + 0x18);
          do {
            lVar31 = *plVar16;
            if ((lVar31 != 0) && (*(char *)(lVar31 + 0x18) == '\x06')) {
              lVar23 = lVar31;
              FUN_02029a80(lVar31,"accessToken",0xb);
              FUN_02029a80(lVar31,"refreshToken",0xc);
              if (lVar23 != 0) {
                lVar22 = (long)*(char *)(lVar23 + 0x17);
                if (lVar22 < 0) {
                  lVar22 = *(long *)(lVar23 + 8);
                }
                if ((lVar31 != 0) && (lVar22 != 0)) {
                  lVar23 = (long)*(char *)(lVar31 + 0x17);
                  if (lVar23 < 0) {
                    lVar23 = *(long *)(lVar31 + 8);
                  }
                  if (lVar23 != 0) {
                    local_1c0._0_5_ = CONCAT14(1,(undefined4)local_1c0);
                    break;
                  }
                }
              }
            }
            lVar30 = lVar30 + -0x20;
            plVar16 = plVar16 + 4;
          } while (lVar30 != 0);
        }
        plVar16 = &local_f0;
        FUN_0095e840(plVar16,"localBootstrap",0xe);
        if (plVar16 != (long *)0x0) {
          FUN_04102668(&local_290);
          uStack_1b8 = CONCAT62(uStack_1b8._2_6_,(undefined2)local_290);
          if ((long)local_1a0 < 0) {
            FUN_00008eb8(local_1b0,(ulong)local_1a0 & 0x7fffffffffffffff);
          }
          ppppppuStack_1a8 = ppppppuStack_280;
          local_1b0 = pppppppuStack_288;
          local_1a0 = ppppppuStack_278;
          ppppppuStack_278 = (undefined8 ******)((ulong)ppppppuStack_278 & 0xffffffffffffff);
          pppppppuStack_288 = (undefined8 *******)((ulong)pppppppuStack_288 & 0xffffffffffffff00);
          if ((long)local_188 < 0) {
            FUN_00008eb8(pppppppuStack_198,(ulong)local_188 & 0x7fffffffffffffff);
          }
          local_190 = ppppppuStack_268;
          pppppppuStack_198 = pppppppuStack_270;
          local_188 = local_260;
          local_260 = (undefined8 ******)((ulong)local_260 & 0xffffffffffffff);
          pppppppuStack_270 = (undefined8 *******)((ulong)pppppppuStack_270 & 0xffffffffffffff00);
          local_180 = CONCAT62(local_180._2_6_,local_258._0_2_);
          if ((long)local_168 < 0) {
            FUN_00008eb8(pppppppuStack_178,(ulong)local_168 & 0x7fffffffffffffff);
            ppppppuStack_170 = ppppppuStack_248;
            pppppppuStack_178 = pppppppuStack_250;
            local_168 = local_240;
            local_240 = (undefined8 ******)((ulong)local_240 & 0xffffffffffffff);
            pppppppuStack_250 = (undefined8 *******)((ulong)pppppppuStack_250 & 0xffffffffffffff00);
            local_160 = ppppppuStack_238;
            if ((long)local_260 < 0) {
              FUN_00008eb8(pppppppuStack_270,(ulong)local_260 & 0x7fffffffffffffff);
            }
          }
          else {
            ppppppuStack_170 = ppppppuStack_248;
            pppppppuStack_178 = pppppppuStack_250;
            local_168 = local_240;
            local_240 = (undefined8 ******)((ulong)local_240 & 0xffffffffffffff);
            pppppppuStack_250 = (undefined8 *******)((ulong)pppppppuStack_250 & 0xffffffffffffff00);
            local_160 = ppppppuStack_238;
          }
          if ((long)ppppppuStack_278 < 0) {
            FUN_00008eb8(pppppppuStack_288,(ulong)ppppppuStack_278 & 0x7fffffffffffffff);
          }
        }
        plVar16 = &local_f0;
        FUN_0095e840(plVar16,"localBootstraps",0xf);
        if ((plVar16 == (long *)0x0) || (lVar30 = plVar16[1] << 5, lVar30 == 0)) {
          bVar13 = false;
        }
        else {
          bVar13 = false;
          puVar32 = (undefined8 *)*plVar16;
          do {
            lVar23 = puVar32[3];
            local_1c4 = -1;
            lVar31 = (long)*(char *)((long)puVar32 + 0x17);
            puVar17 = puVar32;
            if (lVar31 < 0) {
              lVar31 = puVar32[1];
              puVar17 = (undefined8 *)*puVar32;
            }
            FUN_018bfee4(puVar17,lVar31,&local_1c4);
            if (((((int)puVar17 != 0) && (-1 < local_1c4)) && (lVar23 != 0)) &&
               (*(char *)(lVar23 + 0x18) == '\x06')) {
              ppppppuStack_248 = (undefined8 ******)0x0;
              pppppppuStack_250 = (undefined8 *******)0x0;
              ppppppuStack_238 = (undefined8 ******)0x0;
              local_240 = (undefined8 ******)0x0;
              ppppppuStack_268 = (undefined8 ******)0x0;
              pppppppuStack_270 = (undefined8 *******)0x0;
              local_258 = (undefined8 ******)0x0;
              local_260 = (undefined8 ******)0x0;
              pppppppuStack_288 = (undefined8 *******)0x0;
              local_290 = 0;
              ppppppuStack_278 = (undefined8 ******)0x0;
              ppppppuStack_280 = (undefined8 ******)0x0;
              FUN_04102668(&local_290,lVar23);
              if (local_1c4 == 0) {
                uStack_1b8 = CONCAT62(uStack_1b8._2_6_,(undefined2)local_290);
                if ((long)local_1a0 < 0) {
                  ppppppuVar34 = ppppppuStack_280;
                  pppppppuVar33 = pppppppuStack_288;
                  if (-1 < (long)ppppppuStack_278) {
                    ppppppuVar34 = (undefined8 ******)((ulong)ppppppuStack_278 >> 0x38);
                    pppppppuVar33 = &pppppppuStack_288;
                  }
                  FUN_004a8c00(&local_1b0,pppppppuVar33,ppppppuVar34);
                }
                else if ((long)ppppppuStack_278 < 0) {
                  FUN_004a8ab4(&local_1b0,pppppppuStack_288,ppppppuStack_280);
                }
                else {
                  ppppppuStack_1a8 = ppppppuStack_280;
                  local_1b0 = pppppppuStack_288;
                  local_1a0 = ppppppuStack_278;
                }
                if ((long)local_188 < 0) {
                  ppppppuVar34 = ppppppuStack_268;
                  pppppppuVar33 = pppppppuStack_270;
                  if (-1 < (long)local_260) {
                    ppppppuVar34 = (undefined8 ******)((ulong)local_260 >> 0x38);
                    pppppppuVar33 = &pppppppuStack_270;
                  }
                  FUN_004a8c00(&pppppppuStack_198,pppppppuVar33,ppppppuVar34);
                }
                else if ((long)local_260 < 0) {
                  FUN_004a8ab4(&pppppppuStack_198,pppppppuStack_270,ppppppuStack_268);
                }
                else {
                  local_190 = ppppppuStack_268;
                  pppppppuStack_198 = pppppppuStack_270;
                  local_188 = local_260;
                }
                local_180 = CONCAT62(local_180._2_6_,local_258._0_2_);
                if ((long)local_168 < 0) {
                  ppppppuVar34 = ppppppuStack_248;
                  pppppppuVar33 = pppppppuStack_250;
                  if (-1 < (long)local_240) {
                    ppppppuVar34 = (undefined8 ******)((ulong)local_240 >> 0x38);
                    pppppppuVar33 = &pppppppuStack_250;
                  }
                  FUN_004a8c00(&pppppppuStack_178,pppppppuVar33,ppppppuVar34);
                }
                else if ((long)local_240 < 0) {
                  FUN_004a8ab4(&pppppppuStack_178,pppppppuStack_250,ppppppuStack_248);
                }
                else {
                  ppppppuStack_170 = ppppppuStack_248;
                  pppppppuStack_178 = pppppppuStack_250;
                  local_168 = local_240;
                }
                local_160 = ppppppuStack_238;
                bVar13 = true;
              }
              uVar26 = local_138;
              if (local_138 == uStack_130) {
                uVar1 = local_138 + 1;
                if (0x2aaaaaaaaaaaaaa < uVar1) {
                    /* WARNING: Subroutine does not return */
                  FUN_01f13d80();
                }
                uVar28 = local_138 * 2;
                if (uVar28 < uVar1 || uVar28 - uVar1 == 0) {
                  uVar28 = uVar1;
                }
                if (0x155555555555554 < local_138) {
                  uVar28 = 0x2aaaaaaaaaaaaaa;
                }
                local_90 = (undefined8 *******)0x0;
                local_88 = (undefined8 *******)0x0;
                local_80 = 0;
                if (uVar28 != 0) {
                  if (0x2aaaaaaaaaaaaaa < uVar28) {
                    /* WARNING: Subroutine does not return */
                    FUN_04c06020();
                  }
                  pppppppuVar33 = (undefined8 *******)(uVar28 * 0x60);
                  FUN_0000f368();
                  local_90 = pppppppuVar33;
                }
                local_88 = local_90 + uVar26 * 0xc;
                local_78 = uVar28;
                if (local_88 == (undefined8 *******)0x0) goto LAB_04101574;
                *(undefined2 *)local_88 = (undefined2)local_290;
                local_88[3] = ppppppuStack_278;
                local_88[2] = ppppppuStack_280;
                local_88[1] = pppppppuStack_288;
                ppppppuStack_280 = (undefined8 ******)0x0;
                ppppppuStack_278 = (undefined8 ******)0x0;
                pppppppuStack_288 = (undefined8 *******)0x0;
                local_88[6] = local_260;
                local_88[5] = ppppppuStack_268;
                local_88[4] = pppppppuStack_270;
                ppppppuStack_268 = (undefined8 ******)0x0;
                local_260 = (undefined8 ******)0x0;
                pppppppuStack_270 = (undefined8 *******)0x0;
                *(undefined2 *)(local_88 + 7) = local_258._0_2_;
                local_88[10] = local_240;
                local_88[9] = ppppppuStack_248;
                local_88[8] = pppppppuStack_250;
                ppppppuStack_248 = (undefined8 ******)0x0;
                local_240 = (undefined8 ******)0x0;
                pppppppuStack_250 = (undefined8 *******)0x0;
                local_88[0xb] = ppppppuStack_238;
                pppppppuVar33 = local_88 + 0xc;
                local_80 = ((long)pppppppuVar33 - (long)local_88 >> 5) * -0x5555555555555555;
                FUN_04102888(&local_90,&lStack_140,&local_138,&uStack_130);
                FUN_04102a34(&local_90);
              }
              else {
                puVar24 = (undefined2 *)(lStack_140 + local_138 * 0x60);
                if (puVar24 == (undefined2 *)0x0) goto LAB_04101574;
                *puVar24 = (undefined2)local_290;
                *(undefined8 *******)(puVar24 + 0xc) = ppppppuStack_278;
                *(undefined8 *******)(puVar24 + 8) = ppppppuStack_280;
                *(undefined8 ********)(puVar24 + 4) = pppppppuStack_288;
                ppppppuStack_280 = (undefined8 ******)0x0;
                ppppppuStack_278 = (undefined8 ******)0x0;
                pppppppuStack_288 = (undefined8 *******)0x0;
                *(undefined8 *******)(puVar24 + 0x18) = local_260;
                *(undefined8 *******)(puVar24 + 0x14) = ppppppuStack_268;
                *(undefined8 ********)(puVar24 + 0x10) = pppppppuStack_270;
                ppppppuStack_268 = (undefined8 ******)0x0;
                local_260 = (undefined8 ******)0x0;
                pppppppuStack_270 = (undefined8 *******)0x0;
                puVar24[0x1c] = local_258._0_2_;
                *(undefined8 *******)(puVar24 + 0x28) = local_240;
                *(undefined8 *******)(puVar24 + 0x24) = ppppppuStack_248;
                *(undefined8 ********)(puVar24 + 0x20) = pppppppuStack_250;
                ppppppuStack_248 = (undefined8 ******)0x0;
                local_240 = (undefined8 ******)0x0;
                pppppppuStack_250 = (undefined8 *******)0x0;
                *(undefined8 *******)(puVar24 + 0x2c) = ppppppuStack_238;
                pppppppuVar33 = (undefined8 *******)(puVar24 + 0x30);
              }
              local_138 = ((long)pppppppuVar33 - lStack_140 >> 5) * -0x5555555555555555;
              if ((long)pppppppuVar33 - lStack_140 == 0) goto LAB_04101574;
              if ((long)local_240 < 0) {
                FUN_00008eb8(pppppppuStack_250,(ulong)local_240 & 0x7fffffffffffffff);
              }
              if ((long)local_260 < 0) {
                FUN_00008eb8(pppppppuStack_270,(ulong)local_260 & 0x7fffffffffffffff);
              }
              if ((long)ppppppuStack_278 < 0) {
                FUN_00008eb8(pppppppuStack_288,(ulong)ppppppuStack_278 & 0x7fffffffffffffff);
              }
            }
            puVar32 = puVar32 + 4;
            lVar30 = lVar30 + -0x20;
          } while (lVar30 != 0);
        }
        if (!bVar13 && (((byte)uStack_1b8 ^ 0xff) & 1) == 0) {
          if (local_138 == uStack_130) {
            plVar16 = &lStack_140;
            FUN_04102b1c(plVar16,(ulong)&local_1c0 | 8);
          }
          else {
            puVar24 = (undefined2 *)(lStack_140 + local_138 * 0x60);
            if (puVar24 == (undefined2 *)0x0) goto LAB_04101574;
            *puVar24 = (undefined2)uStack_1b8;
            if ((long)local_1a0 < 0) {
              FUN_00018218(puVar24 + 4,local_1b0,ppppppuStack_1a8);
            }
            else {
              *(undefined8 *******)(puVar24 + 0xc) = local_1a0;
              *(undefined8 *******)(puVar24 + 8) = ppppppuStack_1a8;
              *(undefined8 ********)(puVar24 + 4) = local_1b0;
            }
            if ((long)local_188 < 0) {
              FUN_00018218(puVar24 + 0x10,pppppppuStack_198,local_190);
            }
            else {
              *(undefined8 *******)(puVar24 + 0x18) = local_188;
              *(undefined8 *******)(puVar24 + 0x14) = local_190;
              *(undefined8 ********)(puVar24 + 0x10) = pppppppuStack_198;
            }
            puVar24[0x1c] = (undefined2)local_180;
            if ((long)local_168 < 0) {
              FUN_00018218(puVar24 + 0x20,pppppppuStack_178,ppppppuStack_170);
            }
            else {
              *(undefined8 *******)(puVar24 + 0x28) = local_168;
              *(undefined8 *******)(puVar24 + 0x24) = ppppppuStack_170;
              *(undefined8 ********)(puVar24 + 0x20) = pppppppuStack_178;
            }
            *(undefined8 *******)(puVar24 + 0x2c) = local_160;
            plVar16 = (long *)(puVar24 + 0x30);
          }
          local_138 = ((long)plVar16 - lStack_140 >> 5) * -0x5555555555555555;
          if ((long)plVar16 - lStack_140 == 0) {
LAB_04101574:
                    /* WARNING: Does not return */
            pcVar12 = (code *)SoftwareBreakpoint(1,0x4101578);
            (*pcVar12)();
          }
        }
        plVar16 = &local_f0;
        FUN_0192ca80(plVar16,"accounts",8);
        if (plVar16 == (long *)0x0) {
          ppppppuVar34 = local_190;
          if (((ulong)local_188 & 0x8000000000000000) == 0) {
            ppppppuVar34 = (undefined8 ******)((ulong)local_188 >> 0x38);
          }
          if (ppppppuVar34 != (undefined8 ******)0x0) {
            local_180 = CONCAT71(local_180._1_7_,1);
          }
          *param_1 = (undefined4)local_1c0;
          *(undefined1 *)(param_1 + 1) = local_1c0._4_1_;
          *(undefined2 *)(param_1 + 2) = (undefined2)uStack_1b8;
          *(undefined8 *******)(param_1 + 6) = ppppppuStack_1a8;
          *(undefined8 ********)(param_1 + 4) = local_1b0;
          *(undefined8 *******)(param_1 + 8) = local_1a0;
          *(undefined8 *******)(param_1 + 0xc) = local_190;
          *(undefined8 ********)(param_1 + 10) = pppppppuStack_198;
          *(undefined8 *******)(param_1 + 0xe) = local_188;
          *(undefined2 *)(param_1 + 0x10) = (undefined2)local_180;
          *(undefined8 *******)(param_1 + 0x14) = ppppppuStack_170;
          *(undefined8 ********)(param_1 + 0x12) = pppppppuStack_178;
          *(undefined8 *******)(param_1 + 0x16) = local_168;
          *(undefined8 *******)(param_1 + 0x18) = local_160;
          *(long *)(param_1 + 0x1a) = local_158;
          *(long *)(param_1 + 0x1e) = local_148;
          *(long *)(param_1 + 0x1c) = lStack_150;
          *(long *)(param_1 + 0x20) = lStack_140;
          *(ulong *)(param_1 + 0x22) = local_138;
        }
        else {
          pppppppuVar33 = (undefined8 *******)*plVar16;
          if (pppppppuVar33 + plVar16[1] * 4 < pppppppuVar33) {
                    /* WARNING: Does not return */
            pcVar12 = (code *)SoftwareBreakpoint(0,0x4102660);
            (*pcVar12)();
          }
          lVar30 = plVar16[1] << 5;
          if (lVar30 != 0) {
            do {
              if (((pppppppuVar33 != (undefined8 *******)0x0) &&
                  (*(char *)(pppppppuVar33 + 3) == '\x06')) &&
                 (pppppppuVar18 = pppppppuVar33, FUN_0095ec80(pppppppuVar33,"id",2),
                 ((ulong)pppppppuVar18 >> 0x20 & 1) != 0)) {
                ppppppuStack_1e8 = (undefined8 ******)0x0;
                local_1f0 = (undefined8 ******)0x0;
                local_1d8 = 0;
                local_1e0 = (undefined8 ******)0x0;
                ppppppuStack_208 = (undefined8 ******)0x0;
                local_210 = (undefined8 ******)0x0;
                local_1f8 = 0;
                local_200 = (undefined8 ******)0x0;
                ppppppuStack_228 = (undefined8 ******)0x0;
                local_230 = (undefined8 ******)0x0;
                local_218 = (undefined8 ******)0x0;
                ppppppuStack_220 = (undefined8 ******)0x0;
                ppppppuStack_248 = (undefined8 ******)0x0;
                pppppppuStack_250 = (undefined8 *******)0x0;
                ppppppuStack_238 = (undefined8 ******)0x0;
                local_240 = (undefined8 ******)0x0;
                ppppppuStack_268 = (undefined8 ******)0x0;
                pppppppuStack_270 = (undefined8 *******)0x0;
                local_258 = (undefined8 ******)0x0;
                local_260 = (undefined8 ******)0x0;
                pppppppuStack_288 = (undefined8 *******)0x0;
                ppppppuStack_278 = (undefined8 ******)0x0;
                ppppppuStack_280 = (undefined8 ******)0x0;
                local_290 = (ulong)pppppppuVar18 & 0xffffffff;
                pppppppuVar18 = pppppppuVar33;
                FUN_00f609c0(pppppppuVar33,"onboardingCompletedAt",0x15);
                if (pppppppuVar18 != (undefined8 *******)0x0) {
                  if (*(char *)(pppppppuVar18 + 3) == '\x04') {
                    ppppppuVar34 = pppppppuVar18[1];
                    if ((*(byte *)((long)pppppppuVar18 + 0x17) & 0x80) == 0) {
                      ppppppuVar34 = (undefined8 ******)(ulong)*(byte *)((long)pppppppuVar18 + 0x17)
                      ;
                    }
                    uVar20 = (ushort)(ppppppuVar34 != (undefined8 ******)0x0);
                  }
                  else {
                    uVar20 = 0;
                  }
                  local_1d8 = CONCAT62(local_1d8._2_6_,uVar20) | 0x100;
                }
                bVar13 = false;
                if ((plVar15 != (long *)0x0) && (-1 < (int)local_290)) {
                  FUN_01131240(&local_90);
                  pppppppuVar18 = local_90;
                  if (-1 < (long)local_80._7_1_) {
                    pppppppuVar18 = &local_90;
                  }
                  pppppppuVar5 = local_88;
                  if (-1 < local_80) {
                    pppppppuVar5 = (undefined8 *******)(long)local_80._7_1_;
                  }
                  plVar16 = plVar15;
                  FUN_0095e840(plVar15,pppppppuVar18,pppppppuVar5);
                  if (plVar16 != (long *)0x0) {
                    plVar19 = plVar16;
                    FUN_02029a80(plVar16,"accessToken",0xb);
                    FUN_02029a80(plVar16,"refreshToken",0xc);
                    if (plVar19 != (long *)0x0) {
                      lVar31 = (long)*(char *)((long)plVar19 + 0x17);
                      if (lVar31 < 0) {
                        lVar31 = plVar19[1];
                      }
                      bVar13 = false;
                      if ((plVar16 != (long *)0x0) && (lVar31 != 0)) {
                        lVar31 = (long)*(char *)((long)plVar16 + 0x17);
                        if (lVar31 < 0) {
                          lVar31 = plVar16[1];
                        }
                        bVar13 = lVar31 != 0;
                      }
                      goto LAB_04101aa0;
                    }
                  }
                  bVar13 = false;
                }
LAB_04101aa0:
                local_1f8 = CONCAT71(local_1f8._1_7_,bVar13);
                pppppppuVar18 = pppppppuVar33;
                FUN_02029a80(pppppppuVar33,"authStatus",10);
                if (pppppppuVar18 != (undefined8 *******)0x0) {
                  bVar8 = *(byte *)((long)pppppppuVar18 + 0x17);
                  ppppppuVar34 = pppppppuVar18[1];
                  if (-1 < (char)bVar8) {
                    ppppppuVar34 = (undefined8 ******)(ulong)bVar8;
                  }
                  if (ppppppuVar34 == (undefined8 ******)0x6) {
                    pppppppuVar5 = (undefined8 *******)*pppppppuVar18;
                    if (-1 < (char)bVar8) {
                      pppppppuVar5 = pppppppuVar18;
                    }
                    bVar13 = *(int *)pppppppuVar5 == 0x73756170 &&
                             *(short *)((long)pppppppuVar5 + 4) == 0x6465;
                  }
                  else {
                    bVar13 = false;
                  }
                  local_1f8._0_2_ = CONCAT11(bVar13,(undefined1)local_1f8);
                }
                pppppppuVar18 = pppppppuVar33;
                FUN_02029a80(pppppppuVar33,"authPausedReason",0x10);
                if (&local_1f0 != pppppppuVar18 && pppppppuVar18 != (undefined8 *******)0x0) {
                  bVar8 = *(byte *)((long)pppppppuVar18 + 0x17);
                  if ((long)local_1e0 < 0) {
                    ppppppuVar34 = pppppppuVar18[1];
                    pppppppuVar5 = (undefined8 *******)*pppppppuVar18;
                    if (-1 < (char)bVar8) {
                      ppppppuVar34 = (undefined8 ******)(ulong)bVar8;
                      pppppppuVar5 = pppppppuVar18;
                    }
                    FUN_004a8c00(&local_1f0,pppppppuVar5,ppppppuVar34);
                  }
                  else if ((char)bVar8 < '\0') {
                    FUN_004a8ab4(&local_1f0,*pppppppuVar18,pppppppuVar18[1]);
                  }
                  else {
                    ppppppuStack_1e8 = pppppppuVar18[1];
                    local_1f0 = *pppppppuVar18;
                    local_1e0 = pppppppuVar18[2];
                  }
                }
                pppppppuVar18 = pppppppuVar33;
                FUN_02029a80(pppppppuVar33,"name",4);
                if (&pppppppuStack_288 != (undefined8 ********)pppppppuVar18 &&
                    pppppppuVar18 != (undefined8 *******)0x0) {
                  bVar8 = *(byte *)((long)pppppppuVar18 + 0x17);
                  if ((long)ppppppuStack_278 < 0) {
                    ppppppuVar34 = pppppppuVar18[1];
                    pppppppuVar5 = (undefined8 *******)*pppppppuVar18;
                    if (-1 < (char)bVar8) {
                      ppppppuVar34 = (undefined8 ******)(ulong)bVar8;
                      pppppppuVar5 = pppppppuVar18;
                    }
                    FUN_004a8c00(&pppppppuStack_288,pppppppuVar5,ppppppuVar34);
                  }
                  else if ((char)bVar8 < '\0') {
                    FUN_004a8ab4(&pppppppuStack_288,*pppppppuVar18,pppppppuVar18[1]);
                  }
                  else {
                    ppppppuStack_280 = pppppppuVar18[1];
                    pppppppuStack_288 = (undefined8 *******)*pppppppuVar18;
                    ppppppuStack_278 = pppppppuVar18[2];
                  }
                }
                pppppppuVar18 = pppppppuVar33;
                FUN_02029a80(pppppppuVar33,"provider",8);
                if (&pppppppuStack_270 != (undefined8 ********)pppppppuVar18 &&
                    pppppppuVar18 != (undefined8 *******)0x0) {
                  bVar8 = *(byte *)((long)pppppppuVar18 + 0x17);
                  if ((long)local_260 < 0) {
                    ppppppuVar34 = pppppppuVar18[1];
                    pppppppuVar5 = (undefined8 *******)*pppppppuVar18;
                    if (-1 < (char)bVar8) {
                      ppppppuVar34 = (undefined8 ******)(ulong)bVar8;
                      pppppppuVar5 = pppppppuVar18;
                    }
                    FUN_004a8c00(&pppppppuStack_270,pppppppuVar5,ppppppuVar34);
                  }
                  else if ((char)bVar8 < '\0') {
                    FUN_004a8ab4(&pppppppuStack_270,*pppppppuVar18,pppppppuVar18[1]);
                  }
                  else {
                    ppppppuStack_268 = pppppppuVar18[1];
                    pppppppuStack_270 = (undefined8 *******)*pppppppuVar18;
                    local_260 = pppppppuVar18[2];
                  }
                }
                pppppppuVar18 = pppppppuVar33;
                FUN_02029a80(pppppppuVar33,"mode",4);
                if (&local_258 != pppppppuVar18 && pppppppuVar18 != (undefined8 *******)0x0) {
                  bVar8 = *(byte *)((long)pppppppuVar18 + 0x17);
                  if ((long)ppppppuStack_248 < 0) {
                    ppppppuVar34 = pppppppuVar18[1];
                    pppppppuVar5 = (undefined8 *******)*pppppppuVar18;
                    if (-1 < (char)bVar8) {
                      ppppppuVar34 = (undefined8 ******)(ulong)bVar8;
                      pppppppuVar5 = pppppppuVar18;
                    }
                    FUN_004a8c00(&local_258,pppppppuVar5,ppppppuVar34);
                  }
                  else if ((char)bVar8 < '\0') {
                    FUN_004a8ab4(&local_258,*pppppppuVar18,pppppppuVar18[1]);
                  }
                  else {
                    pppppppuStack_250 = (undefined8 *******)pppppppuVar18[1];
                    local_258 = *pppppppuVar18;
                    ppppppuStack_248 = pppppppuVar18[2];
                  }
                }
                pppppppuVar18 = pppppppuVar33;
                FUN_02029a80(pppppppuVar33,"userId",6);
                if (&local_240 != pppppppuVar18 && pppppppuVar18 != (undefined8 *******)0x0) {
                  bVar8 = *(byte *)((long)pppppppuVar18 + 0x17);
                  if ((long)local_230 < 0) {
                    ppppppuVar34 = pppppppuVar18[1];
                    pppppppuVar5 = (undefined8 *******)*pppppppuVar18;
                    if (-1 < (char)bVar8) {
                      ppppppuVar34 = (undefined8 ******)(ulong)bVar8;
                      pppppppuVar5 = pppppppuVar18;
                    }
                    FUN_004a8c00(&local_240,pppppppuVar5,ppppppuVar34);
                  }
                  else if ((char)bVar8 < '\0') {
                    FUN_004a8ab4(&local_240,*pppppppuVar18,pppppppuVar18[1]);
                  }
                  else {
                    ppppppuStack_238 = pppppppuVar18[1];
                    local_240 = *pppppppuVar18;
                    local_230 = pppppppuVar18[2];
                  }
                }
                pppppppuVar18 = pppppppuVar33;
                FUN_02029a80(pppppppuVar33,"email",5);
                if (&ppppppuStack_228 != pppppppuVar18 && pppppppuVar18 != (undefined8 *******)0x0)
                {
                  bVar8 = *(byte *)((long)pppppppuVar18 + 0x17);
                  if ((long)local_218 < 0) {
                    ppppppuVar34 = pppppppuVar18[1];
                    pppppppuVar5 = (undefined8 *******)*pppppppuVar18;
                    if (-1 < (char)bVar8) {
                      ppppppuVar34 = (undefined8 ******)(ulong)bVar8;
                      pppppppuVar5 = pppppppuVar18;
                    }
                    FUN_004a8c00(&ppppppuStack_228,pppppppuVar5,ppppppuVar34);
                  }
                  else if ((char)bVar8 < '\0') {
                    FUN_004a8ab4(&ppppppuStack_228,*pppppppuVar18,pppppppuVar18[1]);
                  }
                  else {
                    ppppppuStack_220 = pppppppuVar18[1];
                    ppppppuStack_228 = *pppppppuVar18;
                    local_218 = pppppppuVar18[2];
                  }
                }
                pppppppuVar18 = pppppppuVar33;
                FUN_02029a80(pppppppuVar33,"profileUrl",10);
                if (&local_210 != pppppppuVar18 && pppppppuVar18 != (undefined8 *******)0x0) {
                  bVar8 = *(byte *)((long)pppppppuVar18 + 0x17);
                  if ((long)local_200 < 0) {
                    ppppppuVar34 = pppppppuVar18[1];
                    pppppppuVar5 = (undefined8 *******)*pppppppuVar18;
                    if (-1 < (char)bVar8) {
                      ppppppuVar34 = (undefined8 ******)(ulong)bVar8;
                      pppppppuVar5 = pppppppuVar18;
                    }
                    FUN_004a8c00(&local_210,pppppppuVar5,ppppppuVar34);
                  }
                  else if ((char)bVar8 < '\0') {
                    FUN_004a8ab4(&local_210,*pppppppuVar18,pppppppuVar18[1]);
                  }
                  else {
                    ppppppuStack_208 = pppppppuVar18[1];
                    local_210 = *pppppppuVar18;
                    local_200 = pppppppuVar18[2];
                  }
                }
                if (lStack_150 == local_148) {
                  plVar16 = &local_158;
                  FUN_04102cb0(plVar16,&local_290);
                }
                else {
                  puVar25 = (undefined4 *)(local_158 + lStack_150 * 0xc0);
                  if (puVar25 == (undefined4 *)0x0) goto LAB_04101574;
                  *puVar25 = (int)local_290;
                  *(undefined8 *******)(puVar25 + 6) = ppppppuStack_278;
                  *(undefined8 *******)(puVar25 + 4) = ppppppuStack_280;
                  *(undefined8 ********)(puVar25 + 2) = pppppppuStack_288;
                  ppppppuStack_280 = (undefined8 ******)0x0;
                  ppppppuStack_278 = (undefined8 ******)0x0;
                  pppppppuStack_288 = (undefined8 *******)0x0;
                  *(undefined8 *******)(puVar25 + 0xc) = local_260;
                  *(undefined8 *******)(puVar25 + 10) = ppppppuStack_268;
                  *(undefined8 ********)(puVar25 + 8) = pppppppuStack_270;
                  ppppppuStack_268 = (undefined8 ******)0x0;
                  local_260 = (undefined8 ******)0x0;
                  pppppppuStack_270 = (undefined8 *******)0x0;
                  *(undefined8 *******)(puVar25 + 0x12) = ppppppuStack_248;
                  *(undefined8 ********)(puVar25 + 0x10) = pppppppuStack_250;
                  *(undefined8 *******)(puVar25 + 0xe) = local_258;
                  pppppppuStack_250 = (undefined8 *******)0x0;
                  ppppppuStack_248 = (undefined8 ******)0x0;
                  local_258 = (undefined8 ******)0x0;
                  *(undefined8 *******)(puVar25 + 0x18) = local_230;
                  *(undefined8 *******)(puVar25 + 0x16) = ppppppuStack_238;
                  *(undefined8 *******)(puVar25 + 0x14) = local_240;
                  local_240 = (undefined8 ******)0x0;
                  ppppppuStack_238 = (undefined8 ******)0x0;
                  local_230 = (undefined8 ******)0x0;
                  *(undefined8 *******)(puVar25 + 0x1e) = local_218;
                  *(undefined8 *******)(puVar25 + 0x1c) = ppppppuStack_220;
                  *(undefined8 *******)(puVar25 + 0x1a) = ppppppuStack_228;
                  ppppppuStack_228 = (undefined8 ******)0x0;
                  ppppppuStack_220 = (undefined8 ******)0x0;
                  local_218 = (undefined8 ******)0x0;
                  *(undefined8 *******)(puVar25 + 0x24) = local_200;
                  *(undefined8 *******)(puVar25 + 0x22) = ppppppuStack_208;
                  *(undefined8 *******)(puVar25 + 0x20) = local_210;
                  local_210 = (undefined8 ******)0x0;
                  ppppppuStack_208 = (undefined8 ******)0x0;
                  local_200 = (undefined8 ******)0x0;
                  *(undefined2 *)(puVar25 + 0x26) = (undefined2)local_1f8;
                  *(undefined8 *******)(puVar25 + 0x2c) = local_1e0;
                  *(undefined8 *******)(puVar25 + 0x2a) = ppppppuStack_1e8;
                  *(undefined8 *******)(puVar25 + 0x28) = local_1f0;
                  ppppppuStack_1e8 = (undefined8 ******)0x0;
                  local_1e0 = (undefined8 ******)0x0;
                  local_1f0 = (undefined8 ******)0x0;
                  *(undefined2 *)(puVar25 + 0x2e) = (undefined2)local_1d8;
                  plVar16 = (long *)(puVar25 + 0x30);
                }
                lStack_150 = ((long)plVar16 - local_158 >> 6) * -0x5555555555555555;
                if ((long)plVar16 - local_158 == 0) goto LAB_04101574;
                FUN_040ff338(&local_290);
              }
              pppppppuVar33 = pppppppuVar33 + 4;
              lVar30 = lVar30 + -0x20;
            } while (lVar30 != 0);
          }
          plVar15 = &local_f0;
          FUN_0095e840(plVar15,"profileBindings",0xf);
          if ((plVar15 != (long *)0x0) && (lVar30 = plVar15[1] << 5, lVar30 != 0)) {
            puVar35 = (ulong *)*plVar15;
            do {
              uVar26 = (ulong)*(char *)((long)puVar35 + 0x17);
              if ((long)uVar26 < 0) {
                uVar26 = puVar35[1];
              }
              ppppppuVar34 = (undefined8 ******)puVar35[3];
              if (((uVar26 != 0 && ppppppuVar34 != (undefined8 ******)0x0) &&
                  (*(char *)(ppppppuVar34 + 3) == '\x06')) &&
                 (ppppppuVar29 = ppppppuVar34, FUN_02029a80(ppppppuVar34,"userId",6),
                 ppppppuVar29 != (undefined8 ******)0x0)) {
                if (*(char *)((long)ppppppuVar29 + 0x17) < '\0') {
                  if (ppppppuVar29[1] != (undefined8 *****)0x0) goto LAB_04101c10;
                }
                else if (*(char *)((long)ppppppuVar29 + 0x17) != '\0') {
LAB_04101c10:
                  ppppppuStack_278 = (undefined8 ******)0x0;
                  ppppppuStack_280 = (undefined8 ******)0x0;
                  ppppppuStack_268 = (undefined8 ******)0x0;
                  pppppppuStack_270 = (undefined8 *******)0x0;
                  pppppppuStack_288 = (undefined8 *******)0x0;
                  local_290 = 0;
                  local_260 = (undefined8 ******)0xffffffff;
                  pppppppuStack_250 = (undefined8 *******)0x0;
                  ppppppuStack_248 = (undefined8 ******)0x0;
                  local_258 = (undefined8 ******)0x0;
                  if (puVar35 != &local_290) {
                    if (*(char *)((long)puVar35 + 0x17) < '\0') {
                      FUN_004a8ab4(&local_290,*puVar35,puVar35[1]);
                    }
                    else {
                      pppppppuStack_288 = (undefined8 *******)puVar35[1];
                      local_290 = *puVar35;
                      ppppppuStack_280 = (undefined8 ******)puVar35[2];
                    }
                  }
                  if (&ppppppuStack_278 != (undefined8 *******)ppppppuVar29) {
                    bVar8 = *(byte *)((long)ppppppuVar29 + 0x17);
                    if ((long)ppppppuStack_268 < 0) {
                      pppppuVar6 = ppppppuVar29[1];
                      ppppppuVar10 = (undefined8 ******)*ppppppuVar29;
                      if (-1 < (char)bVar8) {
                        pppppuVar6 = (undefined8 *****)(ulong)bVar8;
                        ppppppuVar10 = ppppppuVar29;
                      }
                      FUN_004a8c00(&ppppppuStack_278,ppppppuVar10,pppppuVar6);
                    }
                    else if ((char)bVar8 < '\0') {
                      FUN_004a8ab4(&ppppppuStack_278,*ppppppuVar29,ppppppuVar29[1]);
                    }
                    else {
                      pppppppuStack_270 = (undefined8 *******)ppppppuVar29[1];
                      ppppppuStack_278 = (undefined8 ******)*ppppppuVar29;
                      ppppppuStack_268 = (undefined8 ******)ppppppuVar29[2];
                    }
                  }
                  ppppppuVar29 = ppppppuVar34;
                  FUN_0095ec80(ppppppuVar34,"accountId",9);
                  uVar14 = SUB84(ppppppuVar29,0);
                  if (((ulong)ppppppuVar29 & 0x100000000) == 0) {
                    uVar14 = 0xffffffff;
                  }
                  local_260 = (undefined8 ******)CONCAT44(local_260._4_4_,uVar14);
                  FUN_02029a80(ppppppuVar34,"profilePath",0xb);
                  if (&local_258 != (undefined8 *******)ppppppuVar34 &&
                      ppppppuVar34 != (undefined8 ******)0x0) {
                    bVar8 = *(byte *)((long)ppppppuVar34 + 0x17);
                    if ((long)ppppppuStack_248 < 0) {
                      pppppuVar6 = ppppppuVar34[1];
                      ppppppuVar29 = (undefined8 ******)*ppppppuVar34;
                      if (-1 < (char)bVar8) {
                        pppppuVar6 = (undefined8 *****)(ulong)bVar8;
                        ppppppuVar29 = ppppppuVar34;
                      }
                      FUN_004a8c00(&local_258,ppppppuVar29,pppppuVar6);
                    }
                    else if ((char)bVar8 < '\0') {
                      FUN_004a8ab4(&local_258,*ppppppuVar34,ppppppuVar34[1]);
                    }
                    else {
                      pppppppuStack_250 = (undefined8 *******)ppppppuVar34[1];
                      local_258 = (undefined8 ******)*ppppppuVar34;
                      ppppppuStack_248 = (undefined8 ******)ppppppuVar34[2];
                    }
                  }
                  if (lStack_120 == local_118) {
                    puVar27 = &local_128;
                    FUN_04102f5c(puVar27,&local_290);
                  }
                  else {
                    puVar27 = (ulong *)(local_128 + lStack_120 * 0x50);
                    if (puVar27 == (ulong *)0x0) goto LAB_04101574;
                    puVar27[2] = (ulong)ppppppuStack_280;
                    puVar27[1] = (ulong)pppppppuStack_288;
                    *puVar27 = local_290;
                    pppppppuStack_288 = (undefined8 *******)0x0;
                    ppppppuStack_280 = (undefined8 ******)0x0;
                    local_290 = 0;
                    puVar27[5] = (ulong)ppppppuStack_268;
                    puVar27[4] = (ulong)pppppppuStack_270;
                    puVar27[3] = (ulong)ppppppuStack_278;
                    pppppppuStack_270 = (undefined8 *******)0x0;
                    ppppppuStack_268 = (undefined8 ******)0x0;
                    ppppppuStack_278 = (undefined8 ******)0x0;
                    *(undefined4 *)(puVar27 + 6) = local_260._0_4_;
                    puVar27[9] = (ulong)ppppppuStack_248;
                    puVar27[8] = (ulong)pppppppuStack_250;
                    puVar27[7] = (ulong)local_258;
                    pppppppuStack_250 = (undefined8 *******)0x0;
                    ppppppuStack_248 = (undefined8 ******)0x0;
                    local_258 = (undefined8 ******)0x0;
                    puVar27 = puVar27 + 10;
                  }
                  lStack_120 = ((long)((long)puVar27 - local_128) >> 4) * -0x3333333333333333;
                  if ((long)puVar27 - local_128 == 0) goto LAB_04101574;
                  if ((long)ppppppuStack_248 < 0) {
                    FUN_00008eb8(local_258,(ulong)ppppppuStack_248 & 0x7fffffffffffffff);
                  }
                  if ((long)ppppppuStack_268 < 0) {
                    FUN_00008eb8(ppppppuStack_278,(ulong)ppppppuStack_268 & 0x7fffffffffffffff);
                  }
                  if ((long)ppppppuStack_280 < 0) {
                    FUN_00008eb8(local_290,(ulong)ppppppuStack_280 & 0x7fffffffffffffff);
                  }
                }
              }
              puVar35 = puVar35 + 4;
              lVar30 = lVar30 + -0x20;
            } while (lVar30 != 0);
          }
          plVar15 = &local_f0;
          FUN_0095e840(plVar15,"profileAccountBindings",0x16);
          if ((plVar15 != (long *)0x0) && (lVar30 = plVar15[1] << 5, lVar30 != 0)) {
            puVar35 = (ulong *)*plVar15;
            do {
              uVar26 = (ulong)*(char *)((long)puVar35 + 0x17);
              if ((long)uVar26 < 0) {
                uVar26 = puVar35[1];
              }
              pppppppuVar33 = (undefined8 *******)puVar35[3];
              if (((uVar26 != 0 && pppppppuVar33 != (undefined8 *******)0x0) &&
                  (*(char *)(pppppppuVar33 + 3) == '\x06')) &&
                 ((pppppppuVar18 = pppppppuVar33, FUN_0095ec80(pppppppuVar33,"accountId",9),
                  ((ulong)pppppppuVar18 >> 0x20 & 1) != 0 && (-1 < (int)pppppppuVar18)))) {
                pppppppuStack_288 = (undefined8 *******)0x0;
                local_290 = 0;
                ppppppuStack_280 = (undefined8 ******)0x0;
                ppppppuStack_268 = (undefined8 ******)0x0;
                local_260 = (undefined8 ******)0x0;
                pppppppuStack_270 = (undefined8 *******)0x0;
                if (puVar35 != &local_290) {
                  if (*(char *)((long)puVar35 + 0x17) < '\0') {
                    FUN_004a8ab4(&local_290,*puVar35,puVar35[1]);
                  }
                  else {
                    pppppppuStack_288 = (undefined8 *******)puVar35[1];
                    local_290 = *puVar35;
                    ppppppuStack_280 = (undefined8 ******)puVar35[2];
                  }
                }
                ppppppuStack_278 = (undefined8 ******)((ulong)pppppppuVar18 & 0xffffffff);
                FUN_02029a80(pppppppuVar33,"profilePath",0xb);
                if (&pppppppuStack_270 != (undefined8 ********)pppppppuVar33 &&
                    pppppppuVar33 != (undefined8 *******)0x0) {
                  bVar8 = *(byte *)((long)pppppppuVar33 + 0x17);
                  if ((long)local_260 < 0) {
                    ppppppuVar34 = pppppppuVar33[1];
                    pppppppuVar18 = (undefined8 *******)*pppppppuVar33;
                    if (-1 < (char)bVar8) {
                      ppppppuVar34 = (undefined8 ******)(ulong)bVar8;
                      pppppppuVar18 = pppppppuVar33;
                    }
                    FUN_004a8c00(&pppppppuStack_270,pppppppuVar18,ppppppuVar34);
                  }
                  else if ((char)bVar8 < '\0') {
                    FUN_004a8ab4(&pppppppuStack_270,*pppppppuVar33,pppppppuVar33[1]);
                  }
                  else {
                    ppppppuStack_268 = pppppppuVar33[1];
                    pppppppuStack_270 = (undefined8 *******)*pppppppuVar33;
                    local_260 = pppppppuVar33[2];
                  }
                }
                if (local_108 == lStack_100) {
                  puVar27 = &uStack_110;
                  FUN_04103180(puVar27,&local_290);
                }
                else {
                  puVar27 = (ulong *)(uStack_110 + local_108 * 0x38);
                  if (puVar27 == (ulong *)0x0) goto LAB_04101574;
                  puVar27[2] = (ulong)ppppppuStack_280;
                  puVar27[1] = (ulong)pppppppuStack_288;
                  *puVar27 = local_290;
                  pppppppuStack_288 = (undefined8 *******)0x0;
                  ppppppuStack_280 = (undefined8 ******)0x0;
                  local_290 = 0;
                  *(undefined4 *)(puVar27 + 3) = ppppppuStack_278._0_4_;
                  puVar27[6] = (ulong)local_260;
                  puVar27[5] = (ulong)ppppppuStack_268;
                  puVar27[4] = (ulong)pppppppuStack_270;
                  ppppppuStack_268 = (undefined8 ******)0x0;
                  local_260 = (undefined8 ******)0x0;
                  pppppppuStack_270 = (undefined8 *******)0x0;
                  puVar27 = puVar27 + 7;
                }
                local_108 = ((long)((long)puVar27 - uStack_110) >> 3) * 0x6db6db6db6db6db7;
                if ((long)puVar27 - uStack_110 == 0) goto LAB_04101574;
                if ((long)local_260 < 0) {
                  FUN_00008eb8(pppppppuStack_270,(ulong)local_260 & 0x7fffffffffffffff);
                }
                if ((long)ppppppuStack_280 < 0) {
                  FUN_00008eb8(local_290,(ulong)ppppppuStack_280 & 0x7fffffffffffffff);
                }
              }
              puVar35 = puVar35 + 4;
              lVar30 = lVar30 + -0x20;
            } while (lVar30 != 0);
          }
          ppppppuVar34 = local_190;
          if (-1 < (long)local_188) {
            ppppppuVar34 = (undefined8 ******)((ulong)local_188 >> 0x38);
          }
          if (((ppppppuVar34 == (undefined8 ******)0x0) && (-1 < (long)local_160)) &&
             (lVar30 = lStack_150 * 0xc0, lVar30 != 0)) {
            pppppppuVar33 = (undefined8 *******)(local_158 + 0x50);
            do {
              if (*(int *)(pppppppuVar33 + -10) == local_160._4_4_) {
                if (pppppppuVar33 != (undefined8 *******)&segment_command_00000020.filesize) {
                  cVar9 = *(char *)((long)pppppppuVar33 + 0x17);
                  ppppppuVar29 = (undefined8 ******)(long)cVar9;
                  ppppppuVar34 = ppppppuVar29;
                  if ((long)ppppppuVar29 < 0) {
                    ppppppuVar34 = pppppppuVar33[1];
                  }
                  if (((undefined8 ********)pppppppuVar33 != &pppppppuStack_198) &&
                     (ppppppuVar34 != (undefined8 ******)0x0)) {
                    if ((long)local_188 < 0) {
                      ppppppuVar34 = pppppppuVar33[1];
                      pppppppuVar18 = (undefined8 *******)*pppppppuVar33;
                      if (-1 < cVar9) {
                        ppppppuVar34 = ppppppuVar29;
                        pppppppuVar18 = pppppppuVar33;
                      }
                      FUN_004a8c00(&pppppppuStack_198,pppppppuVar18,ppppppuVar34);
                    }
                    else if (cVar9 < '\0') {
                      FUN_004a8ab4(&pppppppuStack_198,*pppppppuVar33,pppppppuVar33[1]);
                    }
                    else {
                      local_188 = pppppppuVar33[2];
                      local_190 = pppppppuVar33[1];
                      pppppppuStack_198 = (undefined8 *******)*pppppppuVar33;
                    }
                  }
                }
                break;
              }
              pppppppuVar33 = pppppppuVar33 + 0x18;
              lVar30 = lVar30 + -0xc0;
            } while (lVar30 != 0);
          }
          ppppppuVar34 = local_190;
          if (((ulong)local_188 & 0x8000000000000000) == 0) {
            ppppppuVar34 = (undefined8 ******)((ulong)local_188 >> 0x38);
          }
          if (ppppppuVar34 != (undefined8 ******)0x0) {
            local_180 = CONCAT71(local_180._1_7_,1);
          }
          lVar30 = lStack_140;
          if ((local_138 * 3 & 0x7ffffffffffffff) != 0) {
            lVar31 = lStack_140 + local_138 * 0x60;
            do {
              bVar8 = *(byte *)(lVar30 + 0x37);
              uVar26 = *(ulong *)(lVar30 + 0x28);
              if (-1 < (char)bVar8) {
                uVar26 = (ulong)bVar8;
              }
              if (((uVar26 == 0) && (-1 < *(int *)(lVar30 + 0x5c))) &&
                 (lVar23 = lStack_150 * 0xc0, lVar23 != 0)) {
                puVar32 = (undefined8 *)(local_158 + 0x50);
                do {
                  if (*(int *)(puVar32 + -10) == *(int *)(lVar30 + 0x5c)) {
                    if (puVar32 != &segment_command_00000020.filesize) {
                      cVar9 = *(char *)((long)puVar32 + 0x17);
                      lVar22 = (long)cVar9;
                      lVar23 = lVar22;
                      if (lVar22 < 0) {
                        lVar23 = puVar32[1];
                      }
                      if ((lVar23 != 0) && (puVar32 != (undefined8 *)(lVar30 + 0x20))) {
                        if ((char)bVar8 < '\0') {
                          lVar23 = puVar32[1];
                          puVar17 = (undefined8 *)*puVar32;
                          if (-1 < cVar9) {
                            lVar23 = lVar22;
                            puVar17 = puVar32;
                          }
                          FUN_004a8c00(lVar30 + 0x20,puVar17,lVar23);
                        }
                        else if (cVar9 < '\0') {
                          FUN_004a8ab4(lVar30 + 0x20,*puVar32,puVar32[1]);
                        }
                        else {
                          uVar37 = puVar32[1];
                          uVar36 = *puVar32;
                          *(undefined8 *)(lVar30 + 0x30) = puVar32[2];
                          *(undefined8 *)(lVar30 + 0x28) = uVar37;
                          *(undefined8 *)(lVar30 + 0x20) = uVar36;
                        }
                      }
                    }
                    break;
                  }
                  puVar32 = puVar32 + 0x18;
                  lVar23 = lVar23 + -0xc0;
                } while (lVar23 != 0);
              }
              lVar23 = lStack_140;
              uVar26 = uStack_1b8;
              if (*(char *)(lVar30 + 0x37) < '\0') {
                if (*(long *)(lVar30 + 0x28) != 0) {
LAB_04102008:
                  *(undefined1 *)(lVar30 + 0x38) = 1;
                }
              }
              else if (*(char *)(lVar30 + 0x37) != '\0') goto LAB_04102008;
              lVar30 = lVar30 + 0x60;
            } while (lVar30 != lVar31);
            lVar30 = lStack_140;
            if (local_138 * 0x60 != 0) {
              lVar31 = 0;
              lVar30 = lStack_140 + local_138 * 0x60;
              do {
                if (*(int *)(lStack_140 + lVar31 + 0x58) == 0) {
                  lVar30 = lStack_140 + lVar31;
                  if (lVar30 == 0) goto LAB_04100e4c;
                  lVar22 = lStack_140 + lVar31;
                  puVar24 = (undefined2 *)(lStack_140 + lVar31);
                  pppppppuVar33 = (undefined8 *******)(puVar24 + 4);
                  uStack_1b8 = CONCAT62(uStack_1b8._2_6_,*puVar24);
                  if ((undefined8 ********)pppppppuVar33 != &local_1b0) {
                    bVar8 = *(byte *)(lVar22 + 0x1f);
                    if ((long)local_1a0 < 0) {
                      pppppppuVar18 = (undefined8 *******)*pppppppuVar33;
                      if (-1 < (char)bVar8) {
                        pppppppuVar18 = pppppppuVar33;
                      }
                      uVar1 = *(ulong *)(lStack_140 + lVar31 + 0x10);
                      if (-1 < (char)bVar8) {
                        uVar1 = (ulong)bVar8;
                      }
                      FUN_004a8c00(&local_1b0,pppppppuVar18,uVar1);
                    }
                    else if ((char)bVar8 < '\0') {
                      FUN_004a8ab4(&local_1b0,*pppppppuVar33,
                                   *(undefined8 *)(lStack_140 + lVar31 + 0x10));
                    }
                    else {
                      local_1a0 = *(undefined8 *******)(puVar24 + 0xc);
                      ppppppuStack_1a8 = *(undefined8 *******)(puVar24 + 8);
                      local_1b0 = (undefined8 *******)*pppppppuVar33;
                    }
                  }
                  pppppppuVar33 = (undefined8 *******)(lVar22 + 0x20);
                  if ((undefined8 ********)pppppppuVar33 == &pppppppuStack_198) {
LAB_04102160:
                    if ((uVar26 & 1) != 0) goto LAB_04102164;
LAB_0410216c:
                    bVar13 = false;
                  }
                  else {
                    bVar8 = *(byte *)(lVar23 + lVar31 + 0x37);
                    if (-1 < (long)local_188) {
                      if ((char)bVar8 < '\0') {
                        FUN_004a8ab4(&pppppppuStack_198,*pppppppuVar33,
                                     *(undefined8 *)(lVar23 + lVar31 + 0x28));
                      }
                      else {
                        local_188 = *(undefined8 *******)(lVar22 + 0x30);
                        local_190 = *(undefined8 *******)(lVar22 + 0x28);
                        pppppppuStack_198 = (undefined8 *******)*pppppppuVar33;
                      }
                      goto LAB_04102160;
                    }
                    pppppppuVar18 = (undefined8 *******)*pppppppuVar33;
                    if (-1 < (char)bVar8) {
                      pppppppuVar18 = pppppppuVar33;
                    }
                    uVar1 = *(ulong *)(lVar23 + lVar31 + 0x28);
                    if (-1 < (char)bVar8) {
                      uVar1 = (ulong)bVar8;
                    }
                    FUN_004a8c00(&pppppppuStack_198,pppppppuVar18,uVar1);
                    if ((uVar26 & 1) == 0) goto LAB_0410216c;
LAB_04102164:
                    bVar13 = true;
                  }
                  bVar11 = false;
                  local_180 = CONCAT62(local_180._2_6_,*(undefined2 *)(lVar23 + lVar31 + 0x38));
                  pppppppuVar33 = (undefined8 *******)(lVar23 + lVar31 + 0x40);
                  goto LAB_04100dd4;
                }
                lVar31 = lVar31 + 0x60;
              } while (local_138 * 0x60 - lVar31 != 0);
            }
          }
          if ((uStack_1b8 & 1) != 0) {
            bVar11 = true;
            bVar13 = true;
            pppppppuVar33 = &pppppppuStack_178;
LAB_04100dd4:
            pdVar3 = (dword *)&local_160;
            if (&pppppppuStack_178 != (undefined8 ********)pppppppuVar33) {
              pqVar4 = (qword *)&local_168;
              if (!bVar13) {
                pqVar4 = &segment_command_00000020.filesize;
              }
              pbVar2 = (byte *)((long)pqVar4 + 7);
              if (!bVar11) {
                pbVar2 = (byte *)(lVar30 + 0x57);
              }
              bVar8 = *pbVar2;
              if ((long)local_168 < 0) {
                pqVar4 = (qword *)&ppppppuStack_170;
                if (!bVar13) {
                  pqVar4 = &segment_command_00000020.fileoff;
                }
                if (!bVar11) {
                  pqVar4 = (qword *)(lVar30 + 0x48);
                }
                pppppppuVar18 = (undefined8 *******)*pppppppuVar33;
                if (-1 < (char)bVar8) {
                  pppppppuVar18 = pppppppuVar33;
                }
                qVar7 = *pqVar4;
                if (-1 < (char)bVar8) {
                  qVar7 = (ulong)bVar8;
                }
                FUN_004a8c00(&pppppppuStack_178,pppppppuVar18,qVar7);
              }
              else if ((char)bVar8 < '\0') {
                pqVar4 = (qword *)&ppppppuStack_170;
                if (!bVar13) {
                  pqVar4 = &segment_command_00000020.fileoff;
                }
                if (!bVar11) {
                  pqVar4 = (qword *)(lVar30 + 0x48);
                }
                FUN_004a8ab4(&pppppppuStack_178,*pppppppuVar33,*pqVar4);
              }
              else {
                ppppppuStack_170 = pppppppuVar33[1];
                pppppppuStack_178 = (undefined8 *******)*pppppppuVar33;
                local_168 = pppppppuVar33[2];
              }
            }
            if (!bVar13) {
              pdVar3 = &segment_command_00000020.maxprot;
            }
            if (!bVar11) {
              pdVar3 = (dword *)(lVar30 + 0x58);
            }
            local_160 = *(undefined8 *******)pdVar3;
          }
LAB_04100e4c:
          *param_1 = (undefined4)local_1c0;
          *(undefined1 *)(param_1 + 1) = local_1c0._4_1_;
          *(undefined2 *)(param_1 + 2) = (undefined2)uStack_1b8;
          *(undefined8 *******)(param_1 + 6) = ppppppuStack_1a8;
          *(undefined8 ********)(param_1 + 4) = local_1b0;
          *(undefined8 *******)(param_1 + 8) = local_1a0;
          *(undefined8 *******)(param_1 + 0xc) = local_190;
          *(undefined8 ********)(param_1 + 10) = pppppppuStack_198;
          *(undefined8 *******)(param_1 + 0xe) = local_188;
          *(undefined2 *)(param_1 + 0x10) = (undefined2)local_180;
          *(undefined8 *******)(param_1 + 0x14) = ppppppuStack_170;
          *(undefined8 ********)(param_1 + 0x12) = pppppppuStack_178;
          *(undefined8 *******)(param_1 + 0x16) = local_168;
          *(undefined8 *******)(param_1 + 0x18) = local_160;
          *(long *)(param_1 + 0x1a) = local_158;
          *(long *)(param_1 + 0x1e) = local_148;
          *(long *)(param_1 + 0x1c) = lStack_150;
          *(long *)(param_1 + 0x20) = lStack_140;
          *(ulong *)(param_1 + 0x22) = local_138;
        }
        lVar22 = lStack_100;
        lVar23 = local_108;
        uVar26 = uStack_110;
        lVar31 = local_118;
        lVar30 = lStack_120;
        local_168 = (undefined8 ******)0x0;
        ppppppuStack_170 = (undefined8 ******)0x0;
        pppppppuStack_178 = (undefined8 *******)0x0;
        local_188 = (undefined8 ******)0x0;
        local_190 = (undefined8 ******)0x0;
        pppppppuStack_198 = (undefined8 *******)0x0;
        local_1a0 = (undefined8 ******)0x0;
        ppppppuStack_1a8 = (undefined8 ******)0x0;
        local_1b0 = (undefined8 *******)0x0;
        local_138 = 0;
        lStack_140 = 0;
        local_148 = 0;
        lStack_150 = 0;
        local_158 = 0;
        *(ulong *)(param_1 + 0x24) = uStack_130;
        *(ulong *)(param_1 + 0x26) = local_128;
        local_128 = 0;
        uStack_130 = 0;
        local_118 = 0;
        lStack_120 = 0;
        *(long *)(param_1 + 0x2a) = lVar31;
        *(long *)(param_1 + 0x28) = lVar30;
        uStack_110 = 0;
        *(ulong *)(param_1 + 0x2c) = uVar26;
        lStack_100 = 0;
        local_108 = 0;
        *(long *)(param_1 + 0x30) = lVar22;
        *(long *)(param_1 + 0x2e) = lVar23;
        *(undefined1 *)(param_1 + 0x32) = 1;
        FUN_040ff504(&local_1c0);
      }
      if ((local_d0 & 1) != 0) {
        iVar21 = (int)(local_d8 & 0xff);
        if (((iVar21 != 0xff) && ((local_d8 & 0xfd) != 0)) && (iVar21 != 4)) {
          (*(code *)(&PTR_FUN_0e8c1878)[local_d8 & 0xff])(&local_1c0,&local_f0);
        }
      }
    }
    if (-1 < (long)local_98) {
      return;
    }
  }
  FUN_00008eb8(local_a8,local_98 & 0x7fffffffffffffff);
  return;
}


