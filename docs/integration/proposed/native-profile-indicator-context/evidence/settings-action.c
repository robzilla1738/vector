// func FUN_0457290c @ 0457290c size 932

/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void FUN_0457290c(long *param_1,undefined8 param_2)

{
  undefined8 *****pppppuVar1;
  bool bVar2;
  undefined8 uVar3;
  undefined8 uVar4;
  undefined8 uVar5;
  code *pcVar6;
  bool bVar7;
  int iVar8;
  uint uVar9;
  long *plVar10;
  long *plVar11;
  char *pcVar12;
  dword *pdVar13;
  long lVar14;
  int *piVar15;
  ulong uVar16;
  long lVar17;
  undefined1 *local_150;
  long lStack_148;
  undefined7 local_140;
  char cStack_139;
  undefined8 ****local_138;
  long lStack_130;
  undefined7 local_128;
  char cStack_121;
  char *local_120;
  undefined8 uStack_118;
  ulong uStack_110;
  undefined8 uStack_108;
  undefined8 uStack_100;
  undefined8 uStack_f8;
  undefined8 local_f0;
  undefined8 uStack_e8;
  undefined8 uStack_e0;
  undefined8 uStack_d8;
  undefined8 local_d0;
  undefined8 uStack_c8;
  undefined8 uStack_c0;
  undefined8 uStack_b8;
  undefined8 local_b0;
  char *local_a8;
  undefined8 uStack_a0;
  char *local_98;
  undefined8 uStack_90;
  char *local_88;
  undefined8 uStack_80;
  undefined1 *local_78;
  long lStack_70;
  char *local_68;
  undefined8 uStack_60;
  long local_58;
  
  local_58 = *(long *)PTR____stack_chk_guard_0e0281f0;
  if (((DAT_0eee6cf8 == (long *)0x0) ||
      (plVar10 = DAT_0eee6cf8, FUN_01a1fb78(), plVar10 == (long *)0x0)) ||
     (FUN_027a56a4(), plVar10 == (long *)0x0)) {
    bVar7 = false;
  }
  else {
    plVar11 = plVar10;
    (**(code **)(*plVar10 + 0x148))();
    FUN_016a186c();
    if (plVar11 == (long *)0x0) {
      bVar7 = false;
    }
    else {
      pcVar12 = segment_command_00000020.segname + 8;
      FUN_0000f368();
      uVar5 = s_fjdhphbdlfjogobdofoaagnlnkoibdge_0ce48949._24_8_;
      uVar4 = s_fjdhphbdlfjogobdofoaagnlnkoibdge_0ce48949._16_8_;
      uVar3 = s_fjdhphbdlfjogobdofoaagnlnkoibdge_0ce48949._0_8_;
      uStack_110 = _UNK_0df3b3e8;
      uStack_118 = _DAT_0df3b3e0;
      local_120 = pcVar12;
      if ((pcVar12 + 0x20 < pcVar12) ||
         ("fjdhphbdlfjogobdofoaagnlnkoibdge" < pcVar12 + 0x20 &&
          pcVar12 < "jdhphbdlfjogobdofoaagnlnkoibdge")) {
                    /* WARNING: Does not return */
        pcVar6 = (code *)SoftwareBreakpoint(1,0x4572cb0);
        (*pcVar6)();
      }
      *(undefined8 *)(pcVar12 + 8) = s_fjdhphbdlfjogobdofoaagnlnkoibdge_0ce48949._8_8_;
      *(undefined8 *)pcVar12 = uVar3;
      *(undefined8 *)(pcVar12 + 0x18) = uVar5;
      *(undefined8 *)(pcVar12 + 0x10) = uVar4;
      pcVar12[0x20] = 0;
      FUN_020c5a1c(plVar11,&local_120,0x1f);
      bVar7 = plVar11 != (long *)0x0;
      if ((long)uStack_110 < 0) {
        FUN_00008eb8(local_120,uStack_110 & 0x7fffffffffffffff);
      }
    }
    if ((((*(byte *)(plVar10 + 9) & 1) == 0) &&
        ((**(code **)(*plVar10 + 0x168))(), plVar10 != (long *)0x0)) &&
       (plVar11 = plVar10, FUN_004bcc4c(), plVar11 != (long *)0x0)) {
      FUN_002bea28(plVar10,"aside.account_id",0x10);
      uVar9 = (uint)plVar10;
      uVar16 = 0x100000000;
      if (0x7fffffff < uVar9) {
        uVar16 = 0;
      }
      uVar16 = uVar16 | uVar9 & ((int)uVar9 >> 0x1f ^ 0xffffffffU);
      goto LAB_04572a6c;
    }
  }
  uVar16 = 0;
LAB_04572a6c:
  lVar14 = *param_1;
  if (lVar14 == 0) {
    piVar15 = (int *)0x0;
    lVar17 = 0;
  }
  else {
    piVar15 = *(int **)(lVar14 + 0x1b0);
    if ((piVar15 != (int *)0x0) && (iVar8 = *piVar15, *piVar15 = iVar8 + 1, iVar8 == 0x7fffffff)) {
                    /* WARNING: Does not return */
      pcVar6 = (code *)SoftwareBreakpoint(0,0x4572ca8);
      (*pcVar6)();
    }
    lVar17 = 0;
    if (*(long *)(lVar14 + 0x1b8) != 0) {
      lVar17 = *(long *)(lVar14 + 0x1b8) + 0x28;
    }
  }
  FUN_0456e1c8(param_1);
  bVar2 = false;
  if ((uVar16 & 0xffffffff00000000) != 0) {
    bVar2 = bVar7;
  }
  if (bVar2) {
    local_b0 = 0;
    uStack_c8 = 0;
    local_d0 = 0;
    uStack_b8 = 0;
    uStack_c0 = 0;
    uStack_e8 = 0;
    local_f0 = 0;
    uStack_d8 = 0;
    uStack_e0 = 0;
    uStack_108 = 0;
    uStack_110 = 0;
    uStack_f8 = 0;
    uStack_100 = 0;
    uStack_118 = 0;
    local_120 = (char *)0x0;
    local_a8 = "chrome-extension://";
    uStack_a0 = 0x13;
    local_98 = "fjdhphbdlfjogobdofoaagnlnkoibdge";
    uStack_90 = 0x20;
    local_88 = "/newtab.html#/u/";
    uStack_80 = 0x10;
    FUN_01131240(&local_150,uVar16);
    local_78 = local_150;
    if (-1 < (long)cStack_139) {
      local_78 = (undefined1 *)&local_150;
    }
    lStack_70 = lStack_148;
    if (-1 < cStack_139) {
      lStack_70 = (long)cStack_139;
    }
    local_68 = "/settings/general";
    uStack_60 = 0x11;
    FUN_0066ab54(&local_138,&local_a8,5);
    pppppuVar1 = (undefined8 *****)local_138;
    if (-1 < (long)cStack_121) {
      pppppuVar1 = &local_138;
    }
    if (-1 < cStack_121) {
      lStack_130 = (long)cStack_121;
    }
    FUN_003701d4(&local_120,pppppuVar1,lStack_130);
    if (cStack_121 < '\0') {
      FUN_00008eb8(local_138,CONCAT17(cStack_121,local_128) & 0x7fffffffffffffff);
    }
    if (cStack_139 < '\0') {
      FUN_00008eb8(local_150,CONCAT17(cStack_139,local_140) & 0x7fffffffffffffff);
    }
    if ((char)uStack_108 != '\0') {
      lVar14 = 0;
      if (((piVar15 != (int *)0x0) && ((char)piVar15[1] == '\0')) && (lVar17 != 0)) {
        if ((char)piVar15[1] != '\0') {
                    /* WARNING: Does not return */
          pcVar6 = (code *)SoftwareBreakpoint(0,0x4572cb4);
          (*pcVar6)();
        }
        lVar14 = lVar17 + -0x28;
      }
      pdVar13 = &section_00000068.reloff;
      FUN_0000f368();
      *pdVar13 = 1;
      *(undefined1 **)(pdVar13 + 2) = &LAB_04583ae0;
      *(code **)(pdVar13 + 4) = FUN_039a0508;
      *(code **)(pdVar13 + 6) = FUN_0255db00;
      FUN_00139f94(pdVar13 + 10,&local_120);
      FUN_040fe7a4(lVar14,param_2,pdVar13);
    }
    FUN_00027cb8(&local_b0,0);
    FUN_00027c78(&uStack_100);
    if ((long)uStack_110 < 0) {
      FUN_00008eb8(local_120,uStack_110 & 0x7fffffffffffffff);
    }
  }
  if (piVar15 != (int *)0x0) {
    LOAcquire();
    iVar8 = *piVar15;
    *piVar15 = iVar8 + -1;
    LORelease();
    if (iVar8 == 1) {
      FUN_00008eb8(piVar15,8);
    }
  }
  if (*(long *)PTR____stack_chk_guard_0e0281f0 != local_58) {
                    /* WARNING: Subroutine does not return */
    ___stack_chk_fail();
  }
  return;
}


