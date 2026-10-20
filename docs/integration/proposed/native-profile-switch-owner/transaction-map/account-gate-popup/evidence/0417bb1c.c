// func FUN_0417bb1c @ 0417bb1c size 2092

/* WARNING: Function: _objc_loadWeakRetained replaced with injection: _objc_load_fixup */
/* WARNING: Function: _objc_release replaced with injection: _objc_release_fixup */
/* WARNING: Function: _objc_storeWeak replaced with injection: _objc_store_fixup */
/* WARNING: Removing unreachable block (ram,0x0417c06c) */
/* WARNING: Type propagation algorithm not settling */
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

bool FUN_0417bb1c(ulong param_1)

{
  undefined8 uVar1;
  undefined8 uVar2;
  byte bVar3;
  long *plVar4;
  long *******ppppppplVar5;
  code *pcVar6;
  int iVar7;
  ulong uVar8;
  char *pcVar9;
  long lVar10;
  dword *pdVar11;
  undefined1 *puVar12;
  long *******ppppppplVar13;
  ulong uVar14;
  undefined8 uVar15;
  undefined1 auStack_320 [240];
  ulong local_230;
  long *plStack_228;
  long *local_220;
  undefined1 auStack_210 [8];
  undefined1 local_208 [64];
  int *local_1c8;
  undefined1 auStack_1c0 [16];
  undefined8 local_1b0;
  undefined7 local_1a0;
  char cStack_199;
  char *local_190;
  undefined8 uStack_188;
  long *******ppppppplStack_180;
  dword *pdStack_178;
  undefined8 local_170;
  undefined8 uStack_168;
  undefined8 local_160;
  undefined8 uStack_158;
  undefined8 uStack_150;
  undefined8 uStack_148;
  undefined8 local_140;
  undefined8 uStack_138;
  undefined8 uStack_130;
  undefined8 uStack_128;
  undefined8 local_120;
  undefined8 uStack_118;
  undefined8 uStack_110;
  undefined8 uStack_108;
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
  dword *local_a0;
  undefined8 local_98;
  long local_90;
  long lStack_88;
  long *******local_80;
  dword *pdStack_78;
  char cStack_69;
  
  if (param_1 == 0) {
    return false;
  }
  if ((((*(byte *)(param_1 + 0x48) & 1) != 0) ||
      ((((DAT_0eee6cf8 != 0 && (uVar14 = *(ulong *)(DAT_0eee6cf8 + 0x38), uVar14 != 0)) &&
        (uVar8 = uVar14, FUN_004bcc4c(uVar14,"aside.onboarding_completed",0x1a), uVar8 != 0)) &&
       (FUN_00306500(uVar14,"aside.onboarding_completed",0x1a), (uVar14 & 1) != 0)))) ||
     ((uVar14 = param_1, FUN_0417b7a0(), (uVar14 & 1) != 0 ||
      (uVar14 = param_1, FUN_016a186c(), uVar14 == 0)))) {
    return false;
  }
  pcVar9 = segment_command_00000020.segname + 8;
  FUN_0000f368();
  uVar2 = s_fjdhphbdlfjogobdofoaagnlnkoibdge_0cefeb27._24_8_;
  uVar1 = s_fjdhphbdlfjogobdofoaagnlnkoibdge_0cefeb27._16_8_;
  uVar15 = s_fjdhphbdlfjogobdofoaagnlnkoibdge_0cefeb27._0_8_;
  ppppppplStack_180 = _UNK_0df3b3e8;
  uStack_188 = _DAT_0df3b3e0;
  local_190 = pcVar9;
  if ((pcVar9 + 0x20 < pcVar9) ||
     ("fjdhphbdlfjogobdofoaagnlnkoibdge" < pcVar9 + 0x20 &&
      pcVar9 < "jdhphbdlfjogobdofoaagnlnkoibdge")) {
                    /* WARNING: Does not return */
    pcVar6 = (code *)SoftwareBreakpoint(1,0x417c1d4);
    (*pcVar6)();
  }
  *(undefined8 *)(pcVar9 + 8) = s_fjdhphbdlfjogobdofoaagnlnkoibdge_0cefeb27._8_8_;
  *(undefined8 *)pcVar9 = uVar15;
  *(undefined8 *)(pcVar9 + 0x18) = uVar2;
  *(undefined8 *)(pcVar9 + 0x10) = uVar1;
  pcVar9[0x20] = 0;
  lVar10 = uVar14 + 8;
  FUN_00bfd304(lVar10,&local_190);
  if ((long)ppppppplStack_180 < 0) {
    FUN_00008eb8(local_190,(ulong)ppppppplStack_180 & 0x7fffffffffffffff);
  }
  if (lVar10 == 0) {
    return false;
  }
  if ((DAT_0ed43b28 & 1) == 0) {
    iVar7 = 0xed43b28;
    thunk_FUN_0cb3562c();
    if (iVar7 != 0) {
      DAT_0ed43b20 = 0;
      DAT_0ed43b08 = 0;
      _DAT_0ed43b00 = 0;
      DAT_0ed43b18 = 0;
      DAT_0ed43b10 = 0;
      DAT_0ed43b28 = 1;
      iVar7 = _pthread_mutex_lock((pthread_mutex_t *)&DAT_0eceb9f0);
      bVar3 = DAT_0ed43b29;
      if (iVar7 != 0) goto LAB_0417c350;
      DAT_0ed43b29 = 1;
      iVar7 = _pthread_mutex_unlock((pthread_mutex_t *)&DAT_0eceb9f0);
      if (iVar7 != 0) {
                    /* WARNING: Subroutine does not return */
        thunk_FUN_0cb335c4("%s failed to release mutex");
      }
      if (((bVar3 >> 2 & 1) != 0) &&
         (iVar7 = _pthread_cond_broadcast((pthread_cond_t *)&DAT_0eceba30), iVar7 != 0))
      goto LAB_0417c14c;
    }
  }
  if ((_DAT_0ed43b00 & 1) != 0) {
    return true;
  }
  if (DAT_0ed43b18 != 0) {
    lVar10 = DAT_0ed43b18 + 0x158;
    FUN_001146ac(lVar10,&PTR_s_UnloadController_kDataKeyImpl_0ead4c50);
    if (*(char *)(lVar10 + 0x148) == '\0') {
      return true;
    }
  }
  local_230 = local_230 & 0xffffffffffffff00;
  lVar10 = *(long *)(*(long *)(DAT_0eee6cf8 + 0x290) + 8);
  if (lVar10 != 0) {
    local_190 = (char *)&local_230;
    FUN_00db1870(lVar10,&local_190,FUN_0417f31c,0,0);
    if ((local_230 & 1) != 0) {
      return true;
    }
  }
  uVar14 = param_1;
  FUN_029a6fc0();
  if ((int)uVar14 != 0) {
    return false;
  }
  if ((DAT_0ed43b28 & 1) == 0) {
    iVar7 = 0xed43b28;
    thunk_FUN_0cb3562c();
    if (iVar7 != 0) {
      DAT_0ed43b20 = 0;
      DAT_0ed43b08 = 0;
      _DAT_0ed43b00 = 0;
      DAT_0ed43b18 = 0;
      DAT_0ed43b10 = 0;
      DAT_0ed43b28 = 1;
      iVar7 = _pthread_mutex_lock((pthread_mutex_t *)&DAT_0eceb9f0);
      bVar3 = DAT_0ed43b29;
      if (iVar7 != 0) goto LAB_0417c350;
      DAT_0ed43b29 = 1;
      iVar7 = _pthread_mutex_unlock((pthread_mutex_t *)&DAT_0eceb9f0);
      if (iVar7 != 0) {
                    /* WARNING: Subroutine does not return */
        thunk_FUN_0cb335c4("%s failed to release mutex");
      }
      if (((bVar3 >> 2 & 1) != 0) &&
         (iVar7 = _pthread_cond_broadcast((pthread_cond_t *)&DAT_0eceba30), iVar7 != 0))
      goto LAB_0417c14c;
    }
  }
  _DAT_0ed43b00 = CONCAT71(DAT_0ed43b00_1,1);
  if ((param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  if ((DAT_0ed43b08 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
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
  uStack_118 = 0;
  local_120 = 0;
  uStack_108 = 0;
  uStack_110 = 0;
  uStack_138 = 0;
  local_140 = 0;
  uStack_128 = 0;
  uStack_130 = 0;
  uStack_158 = 0;
  local_160 = 0;
  uStack_148 = 0;
  uStack_150 = 0;
  pdStack_178 = (dword *)0x0;
  ppppppplStack_180 = (long *******)0x0;
  uStack_168 = 0;
  local_170 = 0;
  uStack_188 = 0;
  local_190 = (char *)0x0;
  DAT_0ed43b08 = param_1;
  FUN_07b63de0(&local_190,4,param_1,1);
  pcVar9 = "aside-account-password-popup";
  FUN_013f7b44(&uStack_168);
  plVar4 = DAT_0ef105e8;
  local_170 = CONCAT71(local_170._1_7_,1);
  uStack_150._0_5_ = CONCAT14(1,(undefined4)uStack_150);
  if (DAT_0ef105e8 == (long *)0x0) {
    pdStack_78 = (dword *)_UNK_0df40608;
    local_80 = (long *******)ram0x0df40600;
    FUN_0241f370(&local_230,0xfffffffffffffffe,&local_80);
  }
  else {
    local_90 = 0;
    lStack_88 = 0;
    lVar10 = *(long *)(*(long *)(DAT_0eee6cf8 + 0x290) + 8);
    if (lVar10 != 0) {
      plStack_228 = &lStack_88;
      local_220 = &local_90;
      pcVar9 = (char *)&local_230;
      local_230 = param_1;
      FUN_00db1870(lVar10,pcVar9,FUN_0417f37c,0,0);
    }
    lVar10 = local_90;
    if (lStack_88 != 0) {
      lVar10 = lStack_88;
    }
    if ((lVar10 == 0) ||
       (ppppppplVar13 = *(long ********)(lVar10 + 0x50), ppppppplVar13 == (long *******)0x0)) {
LAB_0417bf0c:
      FUN_0905e278(&local_230,plVar4);
    }
    else {
      local_80 = (long *******)0x0;
      pdStack_78 = (dword *)0x0;
      (*(code *)(*ppppppplVar13)[4])(&local_80,ppppppplVar13);
      ppppppplVar5 = local_80;
      if (*local_80 == (long ******)0x0) {
        local_80 = (long *******)0x0;
        if (ppppppplVar5 != (long *******)0x0) {
          _objc_destroyWeak(ppppppplVar5);
          pcVar9 = (char *)&MACH_HEADER.cpusubtype;
          FUN_00008eb8(ppppppplVar5);
        }
        (*(code *)(*ppppppplVar13)[7])();
        local_80 = ppppppplVar13;
        pdStack_78 = (dword *)pcVar9;
        if (((ulong)pcVar9 >> 0x20 == 0) || (((ulong)pcVar9 & 0xffffffff) == 0)) goto LAB_0417bf0c;
        (**(code **)(*plVar4 + 0x60))(&local_230,plVar4,&local_80);
      }
      else {
        pdVar11 = &MACH_HEADER.cpusubtype;
        FUN_0000f368();
        *(undefined8 *)pdVar11 = 0;
        *(long *******)pdVar11 = *local_80;
        local_98 = pdStack_78;
        local_a0 = pdVar11;
        (**(code **)(*plVar4 + 0x48))(&local_230,plVar4,&local_a0);
        pdVar11 = local_a0;
        local_a0 = (dword *)0x0;
        if (pdVar11 != (dword *)0x0) {
          _objc_destroyWeak(pdVar11);
          FUN_00008eb8(pdVar11,8);
        }
        ppppppplVar13 = local_80;
        local_80 = (long *******)0x0;
        if (ppppppplVar13 != (long *******)0x0) {
          _objc_destroyWeak(ppppppplVar13);
          FUN_00008eb8(ppppppplVar13,8);
        }
      }
    }
  }
  local_80 = (long *******)
             CONCAT44(SUB84(local_208._0_8_,4) + (SUB84(local_208._8_8_,4) + -0x230) / 2,
                      (int)local_208._0_8_ + ((int)local_208._8_8_ + -900) / 2);
  uVar15 = NEON_sqadd(local_80,0x23000000384,4);
  uVar15 = NEON_sqsub(uVar15,local_80,4);
  pdStack_78 = (dword *)NEON_smax(uVar15,0,4);
  FUN_01c0cc80(&local_80,local_208);
  pdStack_178 = pdStack_78;
  ppppppplStack_180 = local_80;
  if (cStack_199 < '\0') {
    FUN_00008eb8(local_1b0,CONCAT17(cStack_199,local_1a0) & 0x7fffffffffffffff);
  }
  if (local_1c8 != (int *)0x0) {
    LOAcquire();
    iVar7 = *local_1c8;
    *local_1c8 = iVar7 + -1;
    LORelease();
    if (iVar7 == 1) {
      FUN_00008eb8(local_1c8,500);
    }
  }
  FUN_031cc340(auStack_320,&local_190);
  puVar12 = auStack_320;
  FUN_031cc200();
  FUN_0237c7e0(auStack_320);
  if (puVar12 == (undefined1 *)0x0) {
    if ((DAT_0ed43b28 & 1) == 0) {
      iVar7 = 0xed43b28;
      thunk_FUN_0cb3562c();
      if (iVar7 != 0) {
        DAT_0ed43b20 = 0;
        DAT_0ed43b08 = 0;
        _DAT_0ed43b00 = 0;
        DAT_0ed43b18 = 0;
        DAT_0ed43b10 = 0;
        DAT_0ed43b28 = 1;
        iVar7 = _pthread_mutex_lock((pthread_mutex_t *)&DAT_0eceb9f0);
        bVar3 = DAT_0ed43b29;
        if (iVar7 != 0) {
LAB_0417c350:
                    /* WARNING: Subroutine does not return */
          thunk_FUN_0cb335c4("%s failed to acquire mutex");
        }
        DAT_0ed43b29 = 1;
        iVar7 = _pthread_mutex_unlock((pthread_mutex_t *)&DAT_0eceb9f0);
        if (iVar7 != 0) {
                    /* WARNING: Subroutine does not return */
          thunk_FUN_0cb335c4("%s failed to release mutex");
        }
        if (((bVar3 >> 2 & 1) != 0) &&
           (iVar7 = _pthread_cond_broadcast((pthread_cond_t *)&DAT_0eceba30), iVar7 != 0)) {
LAB_0417c14c:
                    /* WARNING: Subroutine does not return */
          thunk_FUN_0cb335c4("%s failed to broadcast");
        }
      }
    }
    _DAT_0ed43b00 = _DAT_0ed43b00 & 0xffffffffffffff00;
    if ((DAT_0ed43b08 & 0xfffffffc00000000) == DAT_0ebb2088) {
      FUN_00022a3c();
    }
    DAT_0ed43b08 = 0;
  }
  else {
    if ((DAT_0ed43b28 & 1) == 0) {
      iVar7 = 0xed43b28;
      thunk_FUN_0cb3562c();
      if (iVar7 != 0) {
        DAT_0ed43b20 = 0;
        DAT_0ed43b08 = 0;
        _DAT_0ed43b00 = 0;
        DAT_0ed43b18 = 0;
        DAT_0ed43b10 = 0;
        DAT_0ed43b28 = 1;
        iVar7 = _pthread_mutex_lock((pthread_mutex_t *)&DAT_0eceb9f0);
        bVar3 = DAT_0ed43b29;
        if (iVar7 != 0) goto LAB_0417c350;
        DAT_0ed43b29 = 1;
        iVar7 = _pthread_mutex_unlock((pthread_mutex_t *)&DAT_0eceb9f0);
        if (iVar7 != 0) {
                    /* WARNING: Subroutine does not return */
          thunk_FUN_0cb335c4("%s failed to release mutex");
        }
        if (((bVar3 >> 2 & 1) != 0) &&
           (iVar7 = _pthread_cond_broadcast((pthread_cond_t *)&DAT_0eceba30), iVar7 != 0))
        goto LAB_0417c14c;
      }
    }
    FUN_0417c368(puVar12);
    FUN_0066ab54(&local_80,&PTR_s_chrome_extension____0e8944a0,3);
    ppppppplVar13 = local_80;
    if (-1 < (long)cStack_69) {
      ppppppplVar13 = (long *******)&local_80;
    }
    pdVar11 = pdStack_78;
    if (-1 < cStack_69) {
      pdVar11 = (dword *)(long)cStack_69;
    }
    FUN_003701d4(&local_230,ppppppplVar13,pdVar11);
    thunk_FUN_0c6e16d8(puVar12 + -0x28,&local_230,1);
    FUN_00027cb8(auStack_1c0,0);
    FUN_00027c78(auStack_210);
    if ((long)local_220 < 0) {
      FUN_00008eb8(local_230,(ulong)local_220 & 0x7fffffffffffffff);
    }
    if (*(long **)(puVar12 + 0x50) != (long *)0x0) {
      (**(code **)(**(long **)(puVar12 + 0x50) + 0x40))();
    }
  }
  FUN_0237c7e0(&local_190);
  return puVar12 != (undefined1 *)0x0;
}


