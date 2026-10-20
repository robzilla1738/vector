// func FUN_041815c0 @ 041815c0 size 7164

/* WARNING: Removing unreachable block (ram,0x04181de4) */
/* WARNING: Removing unreachable block (ram,0x041826a8) */
/* WARNING: Removing unreachable block (ram,0x04182608) */
/* WARNING: Removing unreachable block (ram,0x04182568) */
/* WARNING: Removing unreachable block (ram,0x04182194) */
/* WARNING: Type propagation algorithm not settling */
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void FUN_041815c0(long param_1,ulong param_2,ulong param_3,int param_4)

{
  long lVar1;
  int *piVar2;
  long *****ppppplVar3;
  char *pcVar4;
  size_t sVar5;
  size_t sVar6;
  undefined1 *puVar7;
  long ****pppplVar8;
  long *****ppppplVar9;
  undefined8 *puVar10;
  long ****pppplVar11;
  uint uVar12;
  undefined4 uVar13;
  char cVar14;
  byte bVar15;
  byte bVar16;
  undefined1 uVar17;
  code *pcVar18;
  bool bVar19;
  int iVar20;
  undefined8 uVar21;
  ulong uVar22;
  undefined **ppuVar23;
  char *pcVar24;
  byte *pbVar25;
  long *plVar26;
  undefined ***pppuVar27;
  ulong uVar28;
  char *pcVar29;
  char *pcVar30;
  undefined1 *puVar31;
  undefined4 extraout_var;
  undefined4 extraout_var_00;
  int **ppiVar32;
  undefined4 *puVar33;
  undefined8 *puVar34;
  long *******ppppppplVar35;
  char *pcVar36;
  uint uVar37;
  uint uVar38;
  uint uVar39;
  long lVar40;
  long lVar41;
  long *****ppppplVar42;
  int *piVar43;
  int *piVar44;
  long *plVar45;
  undefined8 uVar46;
  long lVar47;
  long lVar48;
  byte *pbVar49;
  undefined1 *puVar50;
  long lVar51;
  long lVar52;
  int *piVar53;
  uint uVar54;
  long *****local_360;
  undefined8 *local_350;
  long *****local_348;
  long *****local_340;
  char *local_330;
  long *******local_320;
  undefined8 uStack_318;
  undefined8 local_310;
  char *local_300;
  ulong uStack_2f8;
  long local_2f0;
  undefined8 uStack_2e8;
  undefined **local_2d8;
  char *local_2d0;
  ulong local_2c8;
  long lStack_2c0;
  int *local_2b8;
  ulong local_2b0;
  ulong local_2a8;
  undefined1 auStack_298 [80];
  undefined1 auStack_248 [8];
  char *local_240;
  ulong uStack_238;
  undefined8 local_230;
  undefined8 local_228;
  undefined4 uStack_220;
  int iStack_21c;
  undefined4 uStack_218;
  undefined4 uStack_214;
  undefined4 uStack_210;
  undefined4 uStack_20c;
  undefined8 uStack_208;
  undefined4 local_200;
  undefined4 uStack_1fc;
  undefined4 uStack_1f8;
  undefined4 uStack_1f4;
  uint local_1f0;
  uint5 local_1ec;
  undefined4 local_1e4;
  undefined1 local_1d0;
  undefined1 local_1c8;
  undefined1 auStack_1b8 [8];
  undefined4 local_1b0;
  undefined1 local_1ac;
  undefined1 local_1a0;
  undefined8 local_198;
  undefined1 auStack_190 [152];
  undefined4 local_f8;
  undefined4 uStack_f4;
  undefined4 uStack_f0;
  int iStack_ec;
  undefined4 uStack_e8;
  undefined4 uStack_e4;
  int iStack_e0;
  undefined8 uStack_dc;
  undefined8 local_d4;
  undefined8 uStack_cc;
  undefined8 local_c4;
  undefined8 uStack_bc;
  undefined4 local_b4;
  undefined1 auStack_88 [8];
  undefined4 local_80;
  undefined1 local_7c;
  long local_78;
  
  local_78 = *(long *)PTR____stack_chk_guard_0e0281f0;
  if ((param_2 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_2);
  }
  if ((*(ulong *)(param_1 + 0x20) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(ulong *)(param_1 + 0x20) = param_2;
  piVar44 = *(int **)(param_2 + 0xc0);
  if (piVar44 == (int *)0x0) {
    FUN_04183b1c(param_2,FUN_042a111c);
LAB_041816e8:
    if ((*(ulong *)(param_1 + 0x20) & 0xfffffffc00000000) == DAT_0ebb2088) {
      FUN_00022a3c();
    }
    *(undefined8 *)(param_1 + 0x20) = 0;
    goto LAB_04181704;
  }
  iVar20 = *piVar44;
  *piVar44 = iVar20 + 1;
  if (iVar20 == 0x7fffffff) {
                    /* WARNING: Does not return */
    pcVar18 = (code *)SoftwareBreakpoint(0,0x4182adc);
    (*pcVar18)();
  }
  lVar47 = *(long *)(param_2 + 200);
  uVar21 = *(undefined8 *)(param_1 + 0x20);
  FUN_04183b1c(uVar21,FUN_042a111c);
  if ((char)piVar44[1] != '\0' || lVar47 == 0) goto LAB_041816e8;
  if ((char)piVar44[1] != '\0') {
                    /* WARNING: Does not return */
    pcVar18 = (code *)SoftwareBreakpoint(0,0x4182b78);
    (*pcVar18)();
  }
  if ((*(byte *)(*(long *)(lVar47 + 0x18) + 0x30) & 1) != 0) goto LAB_041816e8;
  if ((int)uVar21 == 0) goto LAB_041816c8;
  uVar39 = (uint)param_3;
  if (uVar39 == 0) goto LAB_04181770;
  uVar21 = *(undefined8 *)(param_1 + 0x20);
  FUN_04183b1c(uVar21,FUN_042a155c);
  if ((char)piVar44[1] == '\0') {
    if ((char)piVar44[1] != '\0') {
                    /* WARNING: Does not return */
      pcVar18 = (code *)SoftwareBreakpoint(0,0x4182b84);
      (*pcVar18)();
    }
    if (*(char *)(*(long *)(lVar47 + 0x18) + 0x30) != '\0') goto LAB_041816ac;
    if ((int)uVar21 != 0) {
      iVar20 = (int)*(undefined8 *)(param_1 + 0x20);
      FUN_0417ba04();
      if (iVar20 != 0) {
        uVar22 = *(ulong *)(param_1 + 0x20);
        FUN_0417bb1c();
        if ((uVar22 & 1) != 0) goto LAB_041816c8;
      }
LAB_04181770:
      ppuVar23 = &PTR_s_DseIntegrity_0da3a22a_1_0ebaa2d8;
      FUN_00119280();
      if ((int)ppuVar23 != 0) {
        FUN_02cc23f0();
        FUN_00052d94();
        if (ppuVar23 != (undefined **)0x0) {
          FUN_039d0618();
        }
      }
      lVar47 = *(long *)(param_1 + 0x18);
      if (lVar47 == 0) {
                    /* WARNING: Does not return */
        pcVar18 = (code *)SoftwareBreakpoint(0,0x4182b90);
        (*pcVar18)();
      }
      FUN_001f557c(lVar47,"no-startup-window");
      if ((int)lVar47 != 0) {
                    /* WARNING: Does not return */
        pcVar18 = (code *)SoftwareBreakpoint(0,0x4182b9c);
        (*pcVar18)();
      }
      lVar48 = *(long *)(param_1 + 0x20);
      uVar37 = (uint)*(byte *)(lVar48 + 0x48);
      FUN_0216a130();
      FUN_00052d94();
      if ((lVar47 == 0) || (*(int *)(lVar47 + 0x10) != 2)) {
LAB_04181804:
        uVar38 = 0;
      }
      else {
        uVar38 = (uint)*(byte *)(lVar47 + 0x18);
        if (*(byte *)(lVar47 + 0x18) != 0) {
          uVar22 = *(ulong *)(*(long *)(DAT_0eee6cf8 + 0x290) + 0x90);
          FUN_07bd2fe0(uVar22,lVar48);
          if ((uVar22 & 1) != 0) goto LAB_04181804;
          uVar22 = DAT_0ef08030;
          FUN_001f557c(DAT_0ef08030,"hide-crash-restore-bubble");
          uVar38 = (uint)uVar22 ^ 1;
        }
      }
      lVar47 = *(long *)(param_1 + 0x18);
      if (lVar47 == 0) {
                    /* WARNING: Does not return */
        pcVar18 = (code *)SoftwareBreakpoint(0,0x4182ba8);
        (*pcVar18)();
      }
      if ((DAT_0ef04238 & 1) == 0) {
        uVar46 = *(undefined8 *)(DAT_0eee6cf8 + 0x38);
        uVar21 = uVar46;
        FUN_00306500(uVar46,"was.restarted",0xd);
        DAT_0ef04239 = (byte)uVar21;
        FUN_01509828(uVar46,"was.restarted",0xd,0);
        DAT_0ef04238 = 1;
      }
      bVar15 = DAT_0ef04239;
      uVar22 = *(ulong *)(param_1 + 0x20);
      if ((uVar22 & 0xfffffffc00000000) == DAT_0ebb2088) {
        FUN_000142fc(uVar22);
      }
      pcVar24 = section_00000068.sectname + 8;
      FUN_0000f368();
      pcVar24[0] = '\x01';
      pcVar24[1] = '\0';
      pcVar24[2] = '\0';
      pcVar24[3] = '\0';
      *(code **)(pcVar24 + 8) = FUN_035cc170;
      *(code **)(pcVar24 + 0x10) = FUN_03a10400;
      *(code **)(pcVar24 + 0x18) = FUN_0255db00;
      FUN_027bdb44(pcVar24 + 0x28,lVar47);
      pcVar24[0x60] = *(undefined1 *)(param_1 + 0x30);
      pcVar24[0x61] = (char)uVar38;
      pcVar24[0x62] = bVar15;
      *(ulong *)(pcVar24 + 0x68) = uVar22;
      FUN_033019dc(*(undefined8 *)(param_1 + 0x20),pcVar24);
      pbVar49 = *(byte **)(DAT_0eee6cf8 + 0x38);
      if ((pbVar49 == (byte *)0x0) ||
         (pbVar25 = pbVar49, FUN_004bcc4c(pbVar49,"browser.promotions_enabled",0x1a),
         pbVar25 == (byte *)0x0)) {
LAB_0418190c:
        plVar26 = *(long **)(param_1 + 0x20);
        (**(code **)(*plVar26 + 0x168))();
        FUN_004bcc4c();
        if (plVar26[4] == 0) {
                    /* WARNING: Does not return */
          pcVar18 = (code *)SoftwareBreakpoint(0,0x4182bfc);
          (*pcVar18)();
        }
        uVar22 = *(ulong *)(plVar26[4] + 0x10);
        FUN_0109e6ec(uVar22,plVar26);
        if ((uVar22 & 1) == 0) {
          plVar26 = *(long **)(param_1 + 0x20);
          (**(code **)(*plVar26 + 0x168))();
          FUN_004bcc4c();
          local_228._0_4_ = 0;
          local_228._4_4_ = 0;
          if (plVar26[4] == 0) {
                    /* WARNING: Does not return */
            pcVar18 = (code *)SoftwareBreakpoint(0,0x4182dcc);
            (*pcVar18)();
          }
          uVar21 = *(undefined8 *)(plVar26[4] + 0x10);
          cVar14 = *(char *)((long)plVar26 + 0x17);
          plVar45 = (long *)*plVar26;
          if (-1 < (long)cVar14) {
            plVar45 = plVar26;
          }
          lVar47 = plVar26[1];
          if (-1 < cVar14) {
            lVar47 = (long)cVar14;
          }
          FUN_02ac4b10(uVar21,plVar45,lVar47,(char)plVar26[3],5,&local_228);
          uVar54 = (uint)uVar21 ^ 1;
          if (CONCAT44(local_228._4_4_,(int)local_228) == 0) {
            uVar54 = 1;
          }
        }
        else {
          uVar54 = 0;
        }
      }
      else {
        if (*(long *)(pbVar25 + 0x20) == 0) {
                    /* WARNING: Does not return */
          pcVar18 = (code *)SoftwareBreakpoint(0,0x4182e44);
          (*pcVar18)();
        }
        uVar21 = *(undefined8 *)(*(long *)(pbVar25 + 0x20) + 0x10);
        FUN_0109e6ec(uVar21,pbVar25);
        if ((int)uVar21 == 0) goto LAB_0418190c;
        FUN_0173df38();
        if (pbVar25[0x18] != 1) {
          if (pbVar25[0x18] == 0xff) {
                    /* WARNING: Subroutine does not return */
            FUN_04c27290("std::get: variant is valueless");
          }
                    /* WARNING: Subroutine does not return */
          FUN_04c27290("std::get: wrong alternative for variant");
        }
        uVar54 = (uint)*pbVar25;
      }
      FUN_042111b4(pbVar49,uVar54 & 1);
      local_2d8 = &PTR_FUN_0e207980;
      if (*(long *)(param_1 + 0x18) == 0) {
                    /* WARNING: Does not return */
        pcVar18 = (code *)SoftwareBreakpoint(0,0x4182bb4);
        (*pcVar18)();
      }
      local_f8 = 0;
      uStack_f4 = 0;
      uStack_f0 = 0;
      iStack_ec = 0;
      uStack_e8 = 0;
      uStack_e4 = 0;
      pppuVar27 = &local_2d8;
      FUN_030a9c10(&local_f8,pppuVar27,*(long *)(param_1 + 0x18),param_1,
                   *(undefined8 *)(param_1 + 0x20));
      lVar47 = CONCAT44(iStack_ec,uStack_f0);
      uVar12 = uVar37;
      if (lVar47 != 0) {
        uVar12 = 1;
      }
      if (((uint)pbVar49 & (uVar38 | uVar12)) != 0) {
        pppuVar27 = (undefined ***)((long)&MACH_HEADER.cputype + 1);
        FUN_07e161c8();
      }
      if (((uVar38 & 1) == 0) && (uVar37 == 0)) {
        FUN_02abd444();
        FUN_00052d94();
        if (pppuVar27 == (undefined ***)0x0) {
          local_2b8 = (int *)0x0;
          local_2b0 = 0;
          local_2a8 = 0;
        }
        else {
          local_2b0 = 0;
          local_2a8 = 0;
          local_2b8 = (int *)0x0;
          if (*(char *)(pppuVar27 + 1) != '\0') {
            thunk_FUN_0c6ebb10(&local_228,"triggeredResetProfileSettings",0x1d);
            FUN_07bd46d8(&local_2b8,&local_228);
            FUN_00027cb8(auStack_1b8,0);
            FUN_00027c78(&uStack_208);
            if (uStack_214 < 0) {
              FUN_00008eb8(CONCAT44(local_228._4_4_,(int)local_228),
                           CONCAT44(uStack_214,uStack_218) & 0x7fffffffffffffff);
            }
          }
        }
        FUN_04183dc0(&local_f8,CONCAT44(uStack_f4,local_f8),local_2b8,local_2b8 + local_2b0 * 0x20,
                     (long)(local_2b0 << 7) >> 7);
        if (*(long *)(param_1 + 0x18) == 0) {
                    /* WARNING: Does not return */
          pcVar18 = (code *)SoftwareBreakpoint(0,0x4182bcc);
          (*pcVar18)();
        }
        FUN_03435cb8(&local_228,&local_2d8,*(long *)(param_1 + 0x18),*(undefined8 *)(param_1 + 0x20)
                    );
        if (lVar47 != 0) goto LAB_04181a88;
        local_300 = (char *)0x0;
        uStack_2f8 = 0;
        local_2f0 = 0;
        FUN_07bd4180(&local_300,&local_2d8,*(undefined8 *)(param_1 + 0x28));
        lVar48 = local_2f0;
        uVar22 = uStack_2f8;
        pcVar24 = local_300;
        if (uStack_2f8 == 0) {
          if ((uVar54 & 1) != 0) {
            if (((*(byte *)(param_1 + 0x30) & 1) == 0) && (local_2b0 == 0)) {
              local_240 = (char *)0x0;
              uStack_238 = 0;
              local_230 = 0;
              FUN_07bd4570(&local_2d0,pbVar49);
              FUN_07274ad4(&local_240);
              local_240 = local_2d0;
              local_230 = lStack_2c0;
              uStack_238 = local_2c8;
              local_2c8 = 0;
              lStack_2c0 = 0;
              local_2d0 = (char *)0x0;
              local_320 = (long *******)&local_2d0;
              FUN_039c05ac(&local_320);
              FUN_04183dc0(&local_f8,
                           CONCAT44(uStack_f4,local_f8) + CONCAT44(iStack_ec,uStack_f0) * 0x80,
                           local_240,local_240 + uStack_238 * 0x80,(long)(uStack_238 << 7) >> 7);
              local_2d0 = (char *)&local_240;
              FUN_039c05ac(&local_2d0);
            }
            else if ((uint)pbVar49 != 0) {
              FUN_07e161c8(6);
            }
          }
          local_240 = (char *)0x0;
          uStack_238 = 0;
          local_230 = 0;
          if (*(long *)(param_1 + 0x18) == 0) {
                    /* WARNING: Does not return */
            pcVar18 = (code *)SoftwareBreakpoint(0,0x41831ec);
            (*pcVar18)();
          }
          FUN_07bd43c0(&local_240,&local_2d8,*(long *)(param_1 + 0x18),
                       *(undefined8 *)(param_1 + 0x20));
          uVar22 = uStack_238;
          local_360 = (long *****)local_240;
          local_348 = (long *****)local_240;
          if ((uStack_238 & 0x1ffffffffffffff) != 0) {
            ppppplVar3 = (long *****)((long)local_240 + uStack_238 * 0x10 * 8);
            lVar48 = CONCAT44(iStack_21c,uStack_220) << 7;
            local_348 = ppppplVar3;
            if (lVar48 != 0) {
              local_350 = (undefined8 *)CONCAT44(local_228._4_4_,(int)local_228);
              local_340 = (long *****)local_240;
              do {
                bVar15 = *(byte *)((long)local_340 + 0x17);
                puVar34 = local_350;
                lVar51 = lVar48;
                pppplVar11 = local_340[1];
                if (-1 < (char)bVar15) {
                  pppplVar11 = (long ****)(ulong)bVar15;
                }
                do {
                  bVar16 = *(byte *)((long)puVar34 + 0x17);
                  pppplVar8 = (long ****)puVar34[1];
                  if (-1 < (char)bVar16) {
                    pppplVar8 = (long ****)(ulong)bVar16;
                  }
                  if (pppplVar11 == pppplVar8) {
                    ppppplVar9 = (long *****)*local_340;
                    if (-1 < (char)bVar15) {
                      ppppplVar9 = local_340;
                    }
                    puVar10 = (undefined8 *)*puVar34;
                    if (-1 < (char)bVar16) {
                      puVar10 = puVar34;
                    }
                    iVar20 = _memcmp(ppppplVar9,puVar10,(size_t)pppplVar11);
                    if (iVar20 == 0) {
                      local_348 = local_340;
                      if (local_340 + 0x10 == ppppplVar3) goto LAB_04183010;
                      local_348 = local_340;
                      ppppplVar9 = local_340 + 0x10;
                      goto LAB_04182a5c;
                    }
                  }
                  lVar51 = lVar51 + -0x80;
                  puVar34 = puVar34 + 0x10;
                } while (lVar51 != 0);
                local_340 = local_340 + 0x10;
              } while (local_340 != ppppplVar3);
            }
          }
LAB_04183010:
          uVar28 = uVar22;
          goto LAB_04183014;
        }
        local_300 = (char *)0x0;
        uStack_2f8 = 0;
        local_2f0 = 0;
        uStack_238 = 0;
        local_230 = 0;
        local_240 = (char *)0x0;
        local_2d0 = (char *)&local_240;
        FUN_039c05ac(&local_2d0);
        local_2d0 = (char *)&local_300;
        FUN_039c05ac(&local_2d0);
        lVar51 = CONCAT44(local_228._4_4_,(int)local_228);
        goto joined_r0x04181ab8;
      }
      uVar22 = CONCAT44(iStack_ec,uStack_f0);
      if (uVar22 == 0) {
        FUN_01d42324();
        FUN_07465990(&local_228,pppuVar27,0);
        pcVar24 = section_00000068.segname + 8;
        FUN_0000f368();
        if (pcVar24 == (char *)0x0) goto LAB_041828d0;
        FUN_00139f94();
        *(undefined4 *)(pcVar24 + 0x78) = local_1b0;
        pcVar24[0x7c] = local_1ac;
        local_2b0 = 0;
        local_2a8 = 0;
        local_2b8 = (int *)0x0;
        local_300 = (char *)&local_2b8;
        FUN_039c05ac(&local_300);
        FUN_00027cb8(auStack_1b8,0);
        FUN_00027c78(&uStack_208);
        if (uStack_214 < 0) {
          FUN_00008eb8(CONCAT44(local_228._4_4_,(int)local_228),
                       CONCAT44(uStack_214,uStack_218) & 0x7fffffffffffffff);
        }
        uVar22 = 1;
        lVar48 = 1;
      }
      else {
        pcVar24 = (char *)CONCAT44(uStack_f4,local_f8);
        lVar48 = CONCAT44(uStack_e4,uStack_e8);
        local_f8 = 0;
        uStack_f4 = 0;
        uStack_f0 = 0;
        iStack_ec = 0;
        uStack_e8 = 0;
        uStack_e4 = 0;
        uStack_220 = 0;
        iStack_21c = 0;
        uStack_218 = 0;
        uStack_214 = 0;
        local_228._0_4_ = 0;
        local_228._4_4_ = 0;
        local_2b8 = (int *)&local_228;
        FUN_039c05ac(&local_2b8);
      }
      goto LAB_04181ac4;
    }
  }
  else {
LAB_041816ac:
    if ((*(ulong *)(param_1 + 0x20) & 0xfffffffc00000000) == DAT_0ebb2088) {
      FUN_00022a3c();
    }
    *(undefined8 *)(param_1 + 0x20) = 0;
  }
  goto LAB_041816c8;
joined_r0x041823a4:
  if (lVar48 + -0x80 == lVar51) goto LAB_041823b0;
  pcVar29 = pcVar24 + lVar51 + 0x80;
  FUN_01d42324();
  bVar15 = pcVar24[lVar51 + 0x97];
  sVar5 = *(size_t *)(pcVar24 + lVar51 + 0x88);
  if (-1 < (char)bVar15) {
    sVar5 = (ulong)bVar15;
  }
  bVar16 = pcVar30[0x17];
  sVar6 = *(size_t *)(pcVar30 + 8);
  if (-1 < (char)bVar16) {
    sVar6 = (ulong)bVar16;
  }
  if (sVar5 == sVar6) {
    pcVar36 = *(char **)pcVar29;
    if (-1 < (char)bVar15) {
      pcVar36 = pcVar29;
    }
    pcVar4 = *(char **)pcVar30;
    if (-1 < (char)bVar16) {
      pcVar4 = pcVar30;
    }
    iVar20 = _memcmp(pcVar36,pcVar4,sVar5);
    pcVar30 = (char *)CONCAT44(extraout_var,iVar20);
    if (iVar20 != 0) goto LAB_04182298;
  }
  else {
LAB_04182298:
    pcVar30 = pcVar24 + lVar51 + 0x80;
    FUN_005a0390(pcVar30,"chrome-search",0xd);
    if (((int)pcVar30 != 0) && (0 < *(int *)(pcVar24 + lVar51 + 0xbc))) {
      pcVar30 = pcVar24 + lVar51 + 0xb8;
      pcVar36 = pcVar24 + lVar51 + 0x80;
      FUN_01713bf8();
      if ((pcVar36 == "") &&
         (*(long *)pcVar30 == s_remote_ntp_0cedf4a0._0_8_ &&
          (short)*(qword *)(pcVar30 + 8) == s_remote_ntp_0cedf4a0._8_2_)) goto LAB_0418222c;
    }
    pcVar30 = pcVar24 + lVar51 + 0x80;
    FUN_00b1cd60();
    if (((ulong)pcVar30 & 1) == 0) {
      pcVar30 = pcVar24 + lVar51 + 0x80;
      FUN_00b1ce60();
      if (((ulong)pcVar30 & 1) == 0) {
        FUN_003701d4(&local_228,"about:blank",0xb);
        bVar15 = pcVar24[lVar51 + 0x97];
        sVar5 = *(size_t *)(pcVar24 + lVar51 + 0x88);
        if (-1 < (char)bVar15) {
          sVar5 = (ulong)bVar15;
        }
        sVar6 = CONCAT44(iStack_21c,uStack_220);
        if (-1 < uStack_214) {
          sVar6 = (ulong)uStack_214._3_1_;
        }
        if (sVar5 == sVar6) {
          pcVar30 = *(char **)pcVar29;
          if (-1 < (char)bVar15) {
            pcVar30 = pcVar29;
          }
          puVar34 = (undefined8 *)CONCAT44(local_228._4_4_,(int)local_228);
          if (-1 < uStack_214) {
            puVar34 = &local_228;
          }
          iVar20 = _memcmp(pcVar30,puVar34,sVar5);
          bVar19 = iVar20 == 0;
        }
        else {
          bVar19 = false;
        }
        FUN_00027cb8(auStack_1b8,0);
        pcVar30 = (char *)&uStack_208;
        FUN_00027c78();
        if (uStack_214 < 0) {
          pcVar30 = (char *)CONCAT44(local_228._4_4_,(int)local_228);
          FUN_00008eb8(pcVar30,CONCAT44(uStack_214,uStack_218) & 0x7fffffffffffffff);
        }
        if (!bVar19) {
          pcVar30 = local_330;
          FUN_004cb90c(local_330,pcVar29);
          cVar14 = pcVar24[lVar51 + 0xfc];
          *(undefined4 *)(local_330 + 0x78) = *(undefined4 *)(pcVar24 + lVar51 + 0xf8);
          local_330[0x7c] = cVar14;
          local_330 = local_330 + 0x80;
        }
      }
    }
  }
LAB_0418222c:
  lVar51 = lVar51 + 0x80;
  goto joined_r0x041823a4;
LAB_04182a5c:
  do {
    ppppplVar42 = ppppplVar9;
    lVar48 = CONCAT44(iStack_21c,uStack_220) << 7;
    if (lVar48 != 0) {
      bVar15 = *(byte *)((long)ppppplVar42 + 0x17);
      puVar34 = local_350;
      pppplVar11 = ppppplVar42[1];
      if (-1 < (char)bVar15) {
        pppplVar11 = (long ****)(ulong)bVar15;
      }
      do {
        bVar16 = *(byte *)((long)puVar34 + 0x17);
        pppplVar8 = (long ****)puVar34[1];
        if (-1 < (char)bVar16) {
          pppplVar8 = (long ****)(ulong)bVar16;
        }
        if (pppplVar11 == pppplVar8) {
          ppppplVar9 = (long *****)*ppppplVar42;
          if (-1 < (char)bVar15) {
            ppppplVar9 = ppppplVar42;
          }
          puVar10 = (void *)*puVar34;
          if (-1 < (char)bVar16) {
            puVar10 = puVar34;
          }
          iVar20 = _memcmp(ppppplVar9,puVar10,(size_t)pppplVar11);
          if (iVar20 == 0) goto LAB_04182a48;
        }
        lVar48 = lVar48 + -0x80;
        puVar34 = puVar34 + 0x10;
      } while (lVar48 != 0);
    }
    FUN_004cb90c(local_348,ppppplVar42);
    uVar17 = *(undefined1 *)((long)local_340 + 0xfc);
    *(undefined4 *)(local_348 + 0xf) = *(undefined4 *)(local_340 + 0x1f);
    *(undefined1 *)((long)local_348 + 0x7c) = uVar17;
    local_348 = local_348 + 0x10;
    local_350 = (undefined8 *)CONCAT44(local_228._4_4_,(int)local_228);
LAB_04182a48:
    ppppplVar9 = ppppplVar42 + 0x10;
    local_340 = ppppplVar42;
  } while (ppppplVar42 + 0x10 != ppppplVar3);
  local_360 = (long *****)local_240;
  uVar28 = uStack_238;
LAB_04183014:
  FUN_07bd3fac(&local_240,local_348,local_360 + uVar28 * 0x10);
  FUN_04183dc0(&local_f8,CONCAT44(uStack_f4,local_f8) + CONCAT44(iStack_ec,uStack_f0) * 0x80,
               local_240,(long *****)((long)local_240 + uStack_238 * 0x10 * 8),
               (long)(uStack_238 << 7) >> 7);
  if (uVar22 == 0) {
    if (*(long *)(param_1 + 0x18) == 0) {
                    /* WARNING: Does not return */
      pcVar18 = (code *)SoftwareBreakpoint(0,0x41831f8);
      (*pcVar18)();
    }
    FUN_07bd44dc(&local_2d0,&local_2d8,*(long *)(param_1 + 0x18),*(undefined8 *)(param_1 + 0x20));
    FUN_04183dc0(&local_f8,CONCAT44(uStack_f4,local_f8) + CONCAT44(iStack_ec,uStack_f0) * 0x80,
                 local_2d0,local_2d0 + local_2c8 * 0x80,(long)(local_2c8 << 7) >> 7);
    local_320 = (long *******)&local_2d0;
    FUN_039c05ac(&local_320);
  }
  local_2d0 = (char *)&local_240;
  FUN_039c05ac(&local_2d0);
  local_2d0 = (char *)&local_300;
  FUN_039c05ac(&local_2d0);
LAB_04181a88:
  lVar51 = CONCAT44(local_228._4_4_,(int)local_228);
  FUN_04183dc0(&local_f8,CONCAT44(uStack_f4,local_f8) + CONCAT44(iStack_ec,uStack_f0) * 0x80,lVar51,
               lVar51 + CONCAT44(iStack_21c,uStack_220) * 0x80,
               (CONCAT44(iStack_21c,uStack_220) << 7) >> 7);
  pcVar24 = (char *)CONCAT44(uStack_f4,local_f8);
  uVar22 = CONCAT44(iStack_ec,uStack_f0);
  lVar48 = CONCAT44(uStack_e4,uStack_e8);
  local_f8 = 0;
  uStack_f4 = 0;
  uStack_f0 = 0;
  iStack_ec = 0;
  uStack_e8 = 0;
  uStack_e4 = 0;
joined_r0x04181ab8:
  if (lVar51 != 0) {
    lVar40 = CONCAT44(iStack_21c,uStack_220) * 0x80;
    if (lVar40 != 0) {
      lVar41 = 0;
      lVar52 = lVar51;
      do {
        lVar1 = lVar52 + lVar40;
        if (lVar1 == 0x80) goto LAB_041828d0;
        FUN_00027cb8(lVar1 + -0x10,0);
        FUN_00027c78(lVar1 + -0x60);
        lVar52 = lVar52 + -0x80;
        lVar41 = lVar41 + 0x80;
      } while (lVar40 != lVar41);
    }
    FUN_00008eb8(lVar51,CONCAT44(uStack_214,uStack_218) << 7);
  }
  uVar28 = local_2b0;
  piVar43 = local_2b8;
  if (local_2b8 != (int *)0x0) {
    lVar51 = local_2b0 * 0x80;
    if (lVar51 != 0) {
      lVar40 = 0;
      piVar53 = local_2b8;
      do {
        piVar2 = piVar53 + uVar28 * 0x20;
        if (piVar2 == (int *)(section_00000068.segname + 8)) goto LAB_041828d0;
        FUN_00027cb8(piVar2 + -4,0);
        FUN_00027c78(piVar2 + -0x18);
        piVar53 = piVar53 + -0x20;
        lVar40 = lVar40 + 0x80;
      } while (lVar51 != lVar40);
    }
    local_2b0 = (long)piVar43 - (long)local_2b8 >> 7;
    FUN_00008eb8(local_2b8,local_2a8 << 7);
  }
LAB_04181ac4:
  lVar51 = CONCAT44(uStack_f4,local_f8);
  if (lVar51 != 0) {
    lVar41 = CONCAT44(iStack_ec,uStack_f0) * 0x80;
    lVar40 = lVar51;
    if (lVar41 != 0) {
      lVar40 = 0;
      lVar52 = lVar51;
      do {
        lVar1 = lVar52 + lVar41;
        if (lVar1 == 0x80) goto LAB_041828d0;
        FUN_00027cb8(lVar1 + -0x10,0);
        FUN_00027c78(lVar1 + -0x60);
        lVar52 = lVar52 + -0x80;
        lVar40 = lVar40 + 0x80;
      } while (lVar41 != lVar40);
      lVar40 = CONCAT44(uStack_f4,local_f8);
    }
    uStack_f0 = (undefined4)(lVar51 - lVar40 >> 7);
    iStack_ec = (int)(lVar51 - lVar40 >> 0x27);
    FUN_00008eb8(lVar40,CONCAT44(uStack_e4,uStack_e8) << 7);
  }
  uStack_2f8 = 0;
  local_300 = (char *)0x0;
  uStack_2e8 = 0;
  local_2f0 = 0;
  uVar28 = *(ulong *)(param_1 + 0x18);
  local_2d0 = pcVar24;
  local_2c8 = uVar22;
  lStack_2c0 = lVar48;
  if (uVar28 == 0) {
                    /* WARNING: Does not return */
    pcVar18 = (code *)SoftwareBreakpoint(0,0x4182bd8);
    (*pcVar18)();
  }
  FUN_02577af8(&local_300,uVar28,*(undefined8 *)(param_1 + 0x20));
  FUN_07bd7620();
  if ((uVar28 & 1) == 0) {
    pcVar29 = *(char **)(param_1 + 0x20);
    (**(code **)(*(long *)pcVar29 + 0x168))();
    pcVar24 = pcVar29;
    FUN_004bcc4c();
    if (pcVar24 == (char *)0x0) {
                    /* WARNING: Does not return */
      pcVar18 = (code *)SoftwareBreakpoint(0,0x4182cd8);
      (*pcVar18)();
    }
    if (*(long *)(pcVar24 + 0x20) == 0) {
                    /* WARNING: Does not return */
      pcVar18 = (code *)SoftwareBreakpoint(0,0x4182ce4);
      (*pcVar18)();
    }
    pcVar30 = *(char **)(*(long *)(pcVar24 + 0x20) + 0x10);
    FUN_01274d48(pcVar30,pcVar24);
    if (((ulong)pcVar30 & 1) == 0) {
      if (*(long *)(pcVar24 + 0x20) == 0) {
                    /* WARNING: Does not return */
        pcVar18 = (code *)SoftwareBreakpoint(0,0x4182e50);
        (*pcVar18)();
      }
      pcVar30 = *(char **)(*(long *)(pcVar24 + 0x20) + 0x10);
      FUN_02855204(pcVar30,pcVar24);
      if ((int)pcVar30 == 0) {
        uVar54 = 0;
      }
      else {
        FUN_043a9000(pcVar29,"session.restore_on_startup",0x1a);
        uVar54 = (uint)pcVar29 ^ 1;
        pcVar30 = pcVar29;
      }
    }
    else {
      uVar54 = 1;
    }
    pcVar24 = local_2d0;
    uVar12 = 0;
    if (*(char *)(param_1 + 0x30) == '\0' && uVar37 == 0) {
      uVar12 = uVar39;
    }
    uVar37 = 0;
    if ((int)local_300 == 0) {
      uVar37 = uVar12;
    }
    uVar54 = uVar54 & uVar37;
    if (uVar54 != 0) {
      lVar48 = local_2c8 * 0x80;
      local_330 = local_2d0;
      if (lVar48 != 0) {
        lVar51 = 0;
        local_330 = local_2d0 + local_2c8 * 0x80;
        do {
          pcVar29 = pcVar24 + lVar51;
          FUN_01d42324();
          bVar15 = pcVar29[0x17];
          sVar5 = *(size_t *)(pcVar29 + 8);
          if (-1 < (char)bVar15) {
            sVar5 = (ulong)bVar15;
          }
          bVar16 = pcVar30[0x17];
          sVar6 = *(size_t *)(pcVar30 + 8);
          if (-1 < (char)bVar16) {
            sVar6 = (ulong)bVar16;
          }
          if (sVar5 == sVar6) {
            pcVar36 = *(char **)pcVar29;
            if (-1 < (char)bVar15) {
              pcVar36 = pcVar29;
            }
            pcVar4 = *(char **)pcVar30;
            if (-1 < (char)bVar16) {
              pcVar4 = pcVar30;
            }
            iVar20 = _memcmp(pcVar36,pcVar4,sVar5);
            pcVar30 = (char *)CONCAT44(extraout_var_00,iVar20);
            if (iVar20 != 0) goto LAB_04182458;
LAB_04182394:
            local_330 = pcVar24 + lVar51;
            goto joined_r0x041823a4;
          }
LAB_04182458:
          pcVar30 = pcVar24 + lVar51;
          FUN_005a0390(pcVar30,"chrome-search",0xd);
          if (((int)pcVar30 != 0) && (0 < *(int *)(pcVar24 + lVar51 + 0x3c))) {
            pcVar30 = pcVar24 + lVar51 + 0x38;
            pcVar36 = pcVar24 + lVar51;
            FUN_01713bf8();
            if ((pcVar36 == "") &&
               (*(long *)pcVar30 == s_remote_ntp_0cedf4a0._0_8_ &&
                (short)*(qword *)(pcVar30 + 8) == s_remote_ntp_0cedf4a0._8_2_)) goto LAB_04182394;
          }
          pcVar30 = pcVar24 + lVar51;
          FUN_00b1cd60();
          if (((ulong)pcVar30 & 1) != 0) goto LAB_04182394;
          pcVar30 = pcVar24 + lVar51;
          FUN_00b1ce60();
          if ((int)pcVar30 != 0) goto LAB_04182394;
          FUN_003701d4(&local_228,"about:blank",0xb);
          bVar15 = pcVar29[0x17];
          sVar5 = *(size_t *)(pcVar29 + 8);
          if (-1 < (char)bVar15) {
            sVar5 = (ulong)bVar15;
          }
          sVar6 = CONCAT44(iStack_21c,uStack_220);
          if (-1 < uStack_214) {
            sVar6 = (ulong)uStack_214._3_1_;
          }
          if (sVar5 == sVar6) {
            pcVar30 = *(char **)pcVar29;
            if (-1 < (char)bVar15) {
              pcVar30 = pcVar29;
            }
            puVar34 = (undefined8 *)CONCAT44(local_228._4_4_,(int)local_228);
            if (-1 < uStack_214) {
              puVar34 = &local_228;
            }
            iVar20 = _memcmp(pcVar30,puVar34,sVar5);
            bVar19 = iVar20 == 0;
          }
          else {
            bVar19 = false;
          }
          FUN_00027cb8(auStack_1b8,0);
          pcVar30 = (char *)&uStack_208;
          FUN_00027c78();
          if (uStack_214 < 0) {
            pcVar30 = (char *)CONCAT44(local_228._4_4_,(int)local_228);
            FUN_00008eb8(pcVar30,CONCAT44(uStack_214,uStack_218) & 0x7fffffffffffffff);
          }
          if (bVar19) goto LAB_04182394;
          lVar51 = lVar51 + 0x80;
        } while (lVar48 - lVar51 != 0);
      }
LAB_041823b0:
      pcVar30 = (char *)&local_2d0;
      FUN_07bd3fac(pcVar30,local_330,local_2d0 + local_2c8 * 0x80);
    }
    if (((param_3 & 1) != 0) || ((uVar38 & 1) != 0)) goto LAB_04181bbc;
    FUN_0108d1d0();
    FUN_00052d94();
    if ((pcVar30 == (char *)0x0) || ((dword *)pcVar30 == &MACH_HEADER.ncmds)) {
      FUN_0108d1d0();
      FUN_04bca2ec();
      FUN_0108d1d0();
      FUN_00052d94();
      if ((pcVar30 == (char *)0x0) || ((dword *)pcVar30 == &MACH_HEADER.ncmds)) goto LAB_04181bbc;
    }
    if ((DAT_0ef04238 & 1) == 0) {
      pcVar30 = *(char **)(DAT_0eee6cf8 + 0x38);
      pcVar24 = pcVar30;
      FUN_00306500(pcVar30,"was.restarted",0xd);
      DAT_0ef04239 = (byte)pcVar24;
      FUN_01509828(pcVar30,"was.restarted",0xd,0);
      DAT_0ef04238 = 1;
    }
    bVar15 = DAT_0ef04239;
    FUN_0108d1d0();
    FUN_00052d94();
    if ((pcVar30 == (char *)0x0) || (pcVar30 = pcVar30 + -0x10, pcVar30 == (char *)0x0)) {
      lVar48 = 0;
      FUN_0108d1d0();
      FUN_04bca2ec();
      FUN_0108d1d0();
      FUN_00052d94();
      if ((lVar48 == 0) || (pcVar30 = (char *)(lVar48 + -0x10), pcVar30 == (char *)0x0))
      goto LAB_04181bbc;
    }
    FUN_0415b540(pcVar30,&local_2d0,0,bVar15);
    if (((ulong)pcVar30 & 1) == 0) goto LAB_04181bbc;
  }
  else {
    uVar54 = 0;
LAB_04181bbc:
    lVar48 = *(long *)(param_1 + 0x18);
    if (lVar48 == 0) {
                    /* WARNING: Does not return */
      pcVar18 = (code *)SoftwareBreakpoint(0,0x4182be4);
      (*pcVar18)();
    }
    FUN_001f557c(lVar48,"new-window");
    puVar31 = *(undefined1 **)(param_1 + 0x18);
    if (puVar31 == (undefined1 *)0x0) {
                    /* WARNING: Does not return */
      pcVar18 = (code *)SoftwareBreakpoint(0,0x4182bf0);
      (*pcVar18)();
    }
    uVar37 = uVar39 | 2;
    if (uVar38 == 0) {
      uVar37 = uVar39;
    }
    uVar39 = uVar37 | 4;
    if ((int)lVar48 == 0) {
      uVar39 = uVar37;
    }
    FUN_001f557c(puVar31,"same-tab");
    uVar37 = uVar39 | 0x10;
    if ((int)puVar31 == 0) {
      uVar37 = uVar39;
    }
    uVar39 = uVar37 | 8;
    if (lVar47 == 0) {
      uVar39 = uVar37;
    }
    uVar37 = uVar39 | 0x20;
    if (uVar54 == 0) {
      uVar37 = uVar39;
    }
    uVar39 = uVar37 | 0x40;
    if ((int)uVar28 == 0) {
      uVar39 = uVar37;
    }
    if ((uVar39 >> 6 & 1) == 0) {
      if ((uVar39 & 1) == 0) {
        if ((uVar39 & 0xc) != 8) goto LAB_04181c48;
        lVar47 = *(long *)(param_1 + 0x20);
        FUN_02104368();
        puVar31 = (undefined1 *)0x0;
        if (lVar47 != 0) {
          puVar31 = (undefined1 *)(lVar47 + 8);
        }
        FUN_022820d8();
        puVar7 = (undefined1 *)0x0;
        if (puVar31 != (undefined1 *)0x0) {
          puVar7 = puVar31 + -0x28;
        }
        puVar50 = (undefined1 *)0x0;
        if (puVar7 != (undefined1 *)0x0) {
          puVar50 = puVar7 + 0x28;
        }
        uVar37 = (uVar39 >> 4 ^ 0xffffffff) & 1;
        goto LAB_04181c50;
      }
      puVar50 = (undefined1 *)0x0;
      uVar54 = uVar39 >> 5 & 1;
      if ((int)local_300 == 2 || (int)local_300 == 4) {
        uVar54 = 1;
      }
      uVar37 = 1;
      if (((uVar39 & 0x22) == 2) || (uVar54 == 0)) goto LAB_04181c50;
      local_2b8 = (int *)0x200000000;
      _local_1ec = 0;
      uStack_1f4 = 0;
      local_1f0 = 0;
      uStack_1fc = 0;
      uStack_1f8 = 0;
      uStack_208._4_4_ = 0;
      local_200 = 0;
      uStack_20c = 0;
      uStack_208._0_4_ = 0;
      uStack_214 = 0;
      uStack_210 = 0;
      iStack_21c = 0;
      uStack_218 = 0;
      local_228._4_4_ = 0;
      uStack_220 = 0;
      local_1e4 = 0;
      local_228._0_4_ = 0x48;
      ppiVar32 = &local_2b8;
      _GetProcessInformation(ppiVar32,&local_228);
      if ((int)ppiVar32 == 0) {
        uStack_bc = 0;
        local_c4 = 0;
        uStack_cc = 0;
        local_d4 = 0;
        uStack_dc = 0;
        uStack_e4 = 0;
        iStack_e0 = 0;
        iStack_ec = 0;
        uStack_e8 = 0;
        uStack_f4 = 0;
        uStack_f0 = 0;
        local_b4 = 0;
        local_f8 = 0x48;
        puVar33 = &uStack_1f8;
        _GetProcessInformation(puVar33,&local_f8);
        bVar19 = iStack_e0 == 0x6c676e77;
        if ((int)puVar33 != 0) goto LAB_041827c8;
      }
      else {
LAB_041827c8:
        bVar19 = false;
      }
      FUN_001f557c(DAT_0ef08030,"create-browser-on-startup-for-tests");
      uVar39 = 0x14;
      if (param_4 == 0) {
        uVar39 = 4;
      }
      if (!bVar19) {
        uVar39 = uVar39 | 2;
      }
      if ((DAT_0ef04238 & 1) == 0) {
        uVar46 = *(undefined8 *)(DAT_0eee6cf8 + 0x38);
        uVar21 = uVar46;
        FUN_00306500(uVar46,"was.restarted",0xd);
        DAT_0ef04239 = (byte)uVar21;
        FUN_01509828(uVar46,"was.restarted",0xd,0);
        DAT_0ef04238 = 1;
      }
      lVar47 = *(long *)(param_1 + 0x20);
      FUN_03417b00(lVar47,0,uVar39 | (uint)DAT_0ef04239 << 3,&local_2d0);
      if (lVar47 == 0) {
        puVar31 = (undefined1 *)0x0;
        goto LAB_04181c48;
      }
    }
    else {
LAB_04181c48:
      puVar50 = (undefined1 *)0x0;
      uVar37 = 1;
LAB_04181c50:
      if (DAT_0ebb2088 == 0) {
        puVar31 = &DAT_0ef0423a;
        FUN_000142fc(&DAT_0ef0423a);
      }
      uVar22 = local_2c8;
      pcVar24 = local_2d0;
      uVar17 = DAT_0ef0423a;
      DAT_0ef0423a = 1;
      if (local_2c8 == 0) {
        FUN_01d42324();
        FUN_07465990(&local_f8,puVar31,0);
        lVar47 = 0x80;
        FUN_0000f368();
        local_228._0_4_ = (int)lVar47;
        local_228._4_4_ = (undefined4)((ulong)lVar47 >> 0x20);
        uStack_218 = (undefined4)_DAT_0df397f8;
        uStack_214 = (int)((ulong)_DAT_0df397f8 >> 0x20);
        uStack_220 = (undefined4)_DAT_0df397f0;
        iStack_21c = (int)((ulong)_DAT_0df397f0 >> 0x20);
        if (lVar47 == 0) goto LAB_041828d0;
        FUN_00139f94();
        *(undefined4 *)(lVar47 + 0x78) = local_80;
        *(undefined1 *)(lVar47 + 0x7c) = local_7c;
        lVar47 = (lVar47 - CONCAT44(local_228._4_4_,(int)local_228)) + 0x80;
        uStack_220 = (undefined4)(lVar47 >> 7);
        iStack_21c = (int)((ulong)lVar47 >> 0x20);
      }
      else {
        local_228._0_4_ = 0;
        local_228._4_4_ = 0;
        uStack_220 = 0;
        iStack_21c = 0;
        uStack_218 = 0;
        uStack_214 = 0;
        if (local_2c8 >> 0x39 != 0) {
                    /* WARNING: Subroutine does not return */
          FUN_04bbe000();
        }
        lVar51 = local_2c8 << 7;
        lVar47 = lVar51;
        FUN_0000f368();
        local_228._0_4_ = (int)lVar47;
        local_228._4_4_ = (undefined4)((ulong)lVar47 >> 0x20);
        uStack_220 = 0;
        iStack_21c = 0;
        uStack_218 = (undefined4)uVar22;
        uStack_214 = (int)(uVar22 >> 0x20);
        lVar48 = -lVar47;
        do {
          if (lVar47 == 0) goto LAB_041828d0;
          FUN_00139f94();
          uVar13 = *(undefined4 *)(pcVar24 + 0x78);
          *(char *)(lVar47 + 0x7c) = pcVar24[0x7c];
          *(undefined4 *)(lVar47 + 0x78) = uVar13;
          pcVar24 = pcVar24 + 0x80;
          lVar47 = lVar47 + 0x80;
          lVar48 = lVar48 + -0x80;
          lVar51 = lVar51 + -0x80;
        } while (lVar51 != 0);
        lVar48 = -CONCAT44(local_228._4_4_,(int)local_228) - lVar48;
        uStack_220 = (undefined4)(lVar48 >> 7);
        iStack_21c = (int)((ulong)lVar48 >> 0x20);
      }
      iStack_21c = iStack_21c >> 7;
      lVar47 = param_1;
      FUN_04183264(param_1,puVar50,param_3,&local_228,uVar37);
      local_2b8 = (int *)&local_228;
      FUN_039c05ac(&local_2b8);
      if (uVar22 == 0) {
        FUN_00027cb8(auStack_88,0);
        FUN_00027c78((long)&uStack_dc + 4);
      }
      if ((uVar38 & 1) == 0) {
        FUN_011aa148(*(undefined8 *)(param_1 + 0x20));
        FUN_02b19ba0();
      }
      DAT_0ef0423a = uVar17;
      if (DAT_0ebb2088 == 0) {
        FUN_00022a3c(&DAT_0ef0423a);
      }
    }
    FUN_02dcdebc(lVar47);
    FUN_03a1811c(lVar47);
    iVar20 = 0xebaa508;
    FUN_00119280();
    if (iVar20 != 0) {
      local_320 = (long *******)0x0;
      uStack_318 = 0;
      local_310 = 0;
      if (*(char *)(param_1 + 0x50) == '\0') {
        local_310 = 0x900000000000000;
        if ("1.0.928.1" < (char *)((long)&uStack_318 + 1U) && &local_320 < (long *******)0xda25364)
        {
LAB_041828d0:
                    /* WARNING: Does not return */
          pcVar18 = (code *)SoftwareBreakpoint(1,0x41828d4);
          (*pcVar18)();
        }
        uStack_318 = 0x31;
        local_320 = (long *******)s_1_0_928_1_0da25363._0_8_;
      }
      else if (*(char *)(param_1 + 0x4f) < '\0') {
        FUN_00018218(&local_320,*(undefined8 *)(param_1 + 0x38),*(undefined8 *)(param_1 + 0x40));
      }
      else {
        uStack_318 = *(ulong *)(param_1 + 0x40);
        local_320 = *(long ********)(param_1 + 0x38);
        local_310 = *(ulong *)(param_1 + 0x48);
      }
      if (lVar47 != 0) {
        plVar45 = *(long **)(DAT_0eee6cf8 + 0x38);
        local_240 = (char *)0x0;
        uStack_238 = 0;
        local_230 = 0;
        plVar26 = plVar45;
        FUN_00e8585c(plVar45,"toast.non_milestone_update_toast_version",0x28);
        if (*(char *)((long)plVar26 + 0x17) < '\0') {
          FUN_00018218(&local_240,*plVar26,plVar26[1]);
        }
        else {
          uStack_238 = plVar26[1];
          local_240 = (char *)*plVar26;
          local_230 = plVar26[2];
        }
        local_228._0_4_ = 0;
        local_228._4_4_ = 0;
        uStack_220 = 0;
        iStack_21c = 0;
        uStack_218 = 0;
        uStack_214 = 0;
        ppppplVar3 = (long *****)local_240;
        if (-1 < (long)local_230._7_1_) {
          ppppplVar3 = (long *****)&local_240;
        }
        uVar22 = uStack_238;
        if (-1 < (long)local_230) {
          uVar22 = (long)local_230._7_1_;
        }
        FUN_01aadc78(&local_228,ppppplVar3,uVar22);
        ppppppplVar35 = local_320;
        uVar22 = uStack_318;
        if (-1 < (long)local_310._7_1_) {
          ppppppplVar35 = (long *******)&local_320;
          uVar22 = (long)local_310._7_1_;
        }
        local_2b8 = (int *)0x0;
        local_2b0 = 0;
        local_2a8 = 0;
        FUN_01aadc78(&local_2b8,ppppppplVar35,uVar22);
        if ((CONCAT44(iStack_21c,uStack_220) == 0) || (local_2b0 == 0)) {
          iVar20 = 0;
        }
        else if (*(int *)CONCAT44(local_228._4_4_,(int)local_228) == *local_2b8) {
          puVar34 = &local_228;
          FUN_02b6b1ac(puVar34,&local_2b8);
          iVar20 = (int)puVar34;
        }
        else {
          iVar20 = 0;
        }
        if (local_2b8 != (int *)0x0) {
          if ((local_2b0 & 0x3fffffffffffffff) != 0) {
            lVar48 = local_2b0 * -4;
            piVar43 = local_2b8 + local_2b0;
            do {
              piVar43 = piVar43 + -1;
              if (piVar43 == (int *)0x0) goto LAB_041828d0;
              lVar48 = lVar48 + 4;
            } while (lVar48 != 0);
          }
          local_2b0 = 0;
          FUN_00008eb8(local_2b8,local_2a8 << 2);
        }
        lVar48 = CONCAT44(local_228._4_4_,(int)local_228);
        if (lVar48 != 0) {
          lVar51 = CONCAT44(iStack_21c,uStack_220) * 4;
          if (lVar51 != 0) {
            lVar40 = CONCAT44(iStack_21c,uStack_220) * -4;
            lVar51 = lVar51 + lVar48;
            do {
              lVar51 = lVar51 + -4;
              if (lVar51 == 0) goto LAB_041828d0;
              lVar40 = lVar40 + 4;
            } while (lVar40 != 0);
          }
          uStack_220 = 0;
          iStack_21c = 0;
          FUN_00008eb8(lVar48,CONCAT44(uStack_214,uStack_218) << 2);
        }
        if (iVar20 != 0) {
          lVar48 = *(long *)(*(long *)(lVar47 + 0x178) + 0x390);
          if (lVar48 == 0) {
            lVar48 = 0;
          }
          else {
            FUN_07d62640();
          }
          local_228._0_4_ = 5;
          uVar22 = (ulong)_local_1ec >> 0x28;
          uVar39 = (uint)_local_1ec;
          local_1ec = (uint5)(uVar39 & 0xffffff00);
          _local_1ec = CONCAT35((int3)uVar22,local_1ec);
          local_1d0 = 0;
          local_1c8 = 0;
          local_1a0 = 0;
          local_198 = 0;
          uStack_218 = 0;
          uStack_214 = 0;
          uStack_220 = 0;
          iStack_21c = 0;
          uStack_208._0_4_ = 0;
          uStack_208._4_4_ = 0;
          uStack_210 = 0;
          uStack_20c = 0;
          uStack_1f8 = 0;
          uStack_1f4 = 0;
          local_200 = 0;
          uStack_1fc = 0;
          local_1f0 = local_1f0 & 0xffffff00;
          FUN_00730580(auStack_190);
          FUN_07d627b4(lVar48,&local_228);
          FUN_07d625a4(&local_228);
          if ((int)lVar48 != 0) {
            FUN_003701d4(&local_2b8,"https://aside.com/whats-new",0x1b);
            thunk_FUN_0c6e16d8(lVar47 + -0x28,&local_2b8,3);
            FUN_00027cb8(auStack_248,0);
            FUN_00027c78(auStack_298);
            if ((long)local_2a8 < 0) {
              FUN_00008eb8(local_2b8,local_2a8 & 0x7fffffffffffffff);
            }
          }
        }
        uVar22 = uStack_318;
        ppppppplVar35 = local_320;
        if (-1 < (long)local_310) {
          uVar22 = local_310 >> 0x38;
          ppppppplVar35 = (long *******)&local_320;
        }
        FUN_00bddb80(&local_2b8,ppppppplVar35,uVar22);
        FUN_015098a8(plVar45,"toast.non_milestone_update_toast_version",0x28,&local_2b8);
        FUN_0161e7d4(&local_2b8);
        if ((long)local_230 < 0) {
          FUN_00008eb8(local_240,local_230 & 0x7fffffffffffffff);
        }
      }
      if ((long)local_310 < 0) {
        FUN_00008eb8(local_320,local_310 & 0x7fffffffffffffff);
      }
    }
  }
  FUN_02577a18(&local_300);
  uVar22 = local_2c8;
  pcVar24 = local_2d0;
  if (local_2d0 != (char *)0x0) {
    lVar47 = local_2c8 * 0x80;
    if (lVar47 != 0) {
      lVar48 = 0;
      pcVar29 = local_2d0;
      do {
        pcVar30 = pcVar29 + uVar22 * 0x80;
        if (pcVar30 == section_00000068.segname + 8) goto LAB_041828d0;
        FUN_00027cb8(pcVar30 + -0x10,0);
        FUN_00027c78(pcVar30 + -0x60);
        pcVar29 = pcVar29 + -0x80;
        lVar48 = lVar48 + 0x80;
      } while (lVar47 - lVar48 != 0);
    }
    local_2c8 = (long)pcVar24 - (long)local_2d0 >> 7;
    FUN_00008eb8(local_2d0,lStack_2c0 << 7);
  }
  local_300 = (char *)0x0;
  local_228 = &local_240;
  uStack_220 = 0x1ce0790;
  iStack_21c = 0;
  local_2b8 = (int *)&local_228;
  local_240 = (char *)&local_300;
  FUN_00db1870(*(undefined8 *)(*(long *)(DAT_0eee6cf8 + 0x290) + 8),&local_2b8,&LAB_01ce0784,1,0);
  pcVar24 = local_300;
  if (local_300 == (char *)0x0) {
    if (DAT_0ef080b0 < 3) {
      FUN_0060914c(&local_228,"../../chrome/browser/ui/startup/startup_browser_creator_impl.cc",
                   0x195,2);
      FUN_000254bc(&uStack_218,"No browser window found for startup.",0x24);
      FUN_00609080(&local_228);
    }
  }
  else {
    lVar47 = *(long *)(param_1 + 0x18);
    if (lVar47 == 0) {
                    /* WARNING: Does not return */
      pcVar18 = (code *)SoftwareBreakpoint(0,0x4182c6c);
      (*pcVar18)();
    }
    FUN_001f557c(lVar47,"install-chrome-app");
    if ((int)lVar47 != 0) {
      if (*(long *)(param_1 + 0x18) == 0) {
                    /* WARNING: Does not return */
        pcVar18 = (code *)SoftwareBreakpoint(0,0x4182dd8);
        (*pcVar18)();
      }
      FUN_00bf2f28(&local_228,*(long *)(param_1 + 0x18),"install-chrome-app",0x12);
      FUN_07a3c1d4(&local_228,pcVar24);
      if (uStack_214 < 0) {
        FUN_00008eb8(local_228,CONCAT44(uStack_214,uStack_218) & 0x7fffffffffffffff);
      }
    }
    uVar22 = DAT_0ef08030;
    FUN_001f557c(DAT_0ef08030,"kiosk");
    if ((uVar22 & 1) == 0) {
      uVar22 = DAT_0ef08030;
      FUN_001f557c(DAT_0ef08030,"start-fullscreen");
      if ((int)uVar22 == 0) goto LAB_04181704;
    }
    FUN_074f8fc4(*(long *)(*(long *)(pcVar24 + 0x178) + 0x100) + 200,0);
  }
LAB_04181704:
  if (piVar44 == (int *)0x0) goto LAB_04181708;
LAB_041816c8:
  LOAcquire();
  iVar20 = *piVar44;
  *piVar44 = iVar20 + -1;
  LORelease();
  if (iVar20 == 1) {
    FUN_00008eb8(piVar44,8);
  }
LAB_04181708:
  if (*(long *)PTR____stack_chk_guard_0e0281f0 == local_78) {
    return;
  }
                    /* WARNING: Subroutine does not return */
  ___stack_chk_fail();
}


