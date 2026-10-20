// func FUN_0417c5c4 @ 0417c5c4 size 932

/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

undefined8 FUN_0417c5c4(char *param_1)

{
  undefined8 uVar1;
  undefined8 uVar2;
  undefined8 uVar3;
  code *pcVar4;
  ulong uVar5;
  long *plVar6;
  long lVar7;
  char *pcVar8;
  long *plVar9;
  byte *pbVar10;
  ulong uVar11;
  byte bVar12;
  char local_59;
  char *local_58;
  char *local_50;
  ulong uStack_48;
  
  bVar12 = param_1[0xde];
  if (((((DAT_0eee6cf8 != 0) && (uVar11 = *(ulong *)(DAT_0eee6cf8 + 0x38), uVar11 != 0)) &&
       (uVar5 = uVar11, FUN_004bcc4c(uVar11,"aside.onboarding_completed",0x1a), uVar5 != 0)) &&
      (FUN_00306500(uVar11,"aside.onboarding_completed",0x1a), (uVar11 & 1) != 0)) ||
     ((((param_1[0xe7] & 1U) != 0 || ((param_1[0xda] & 1U) != 0)) ||
      (((param_1[0xdd] & 1U) != 0 || (plVar9 = *(long **)(param_1 + 0x30), plVar9 == (long *)0x0))))
     )) {
    return 0;
  }
  if ((*(byte *)(plVar9[3] + 0x30) & 1) != 0) {
    return 0;
  }
  if ((DAT_0ef02650 & 1) != 0) {
    return 0;
  }
  if (DAT_0ef02640 != 0) {
    return 0;
  }
  if ((((bVar12 & 1) == 0) && ((*(byte *)(plVar9 + 9) & 1) == 0)) &&
     (((**(code **)(*plVar9 + 0x168))(), plVar9 != (long *)0x0 &&
      ((plVar6 = plVar9, FUN_004bcc4c(), plVar6 != (long *)0x0 &&
       (FUN_00306500(plVar9,"aside.automatic_password_gate_suppressed",0x28),
       ((ulong)plVar9 & 1) != 0)))))) {
    return 0;
  }
  if ((param_1[0xe1] != '\0') && (param_1[0xe2] == '\0')) {
    return 0;
  }
  uVar11 = *(ulong *)(param_1 + 0x30);
  FUN_0417b7a0();
  if ((uVar11 & 1) != 0) {
    return 0;
  }
  if ((bVar12 & 1) == 0) {
    if (param_1[0xd8] == '\0') {
      return 0;
    }
    if ((param_1[0xd9] & 1U) != 0) {
      return 0;
    }
  }
  local_58 = *(char **)(param_1 + 0x30);
  local_59 = '\0';
  lVar7 = *(long *)(*(long *)(DAT_0eee6cf8 + 0x290) + 8);
  if (lVar7 == 0) {
    return 0;
  }
  local_50 = &local_59;
  FUN_00db1870(lVar7,&local_58,&LAB_0417f590,0,0);
  if (local_59 == '\0') {
    return 0;
  }
  lVar7 = *(long *)(param_1 + 0x38);
  if (lVar7 == 0) {
    return 0;
  }
  pcVar8 = segment_command_00000020.segname + 8;
  FUN_0000f368();
  uVar3 = s_fjdhphbdlfjogobdofoaagnlnkoibdge_0cefeb27._24_8_;
  uVar2 = s_fjdhphbdlfjogobdofoaagnlnkoibdge_0cefeb27._16_8_;
  uVar1 = s_fjdhphbdlfjogobdofoaagnlnkoibdge_0cefeb27._0_8_;
  uStack_48 = _UNK_0df3b3e8;
  local_50 = (char *)_DAT_0df3b3e0;
  local_58 = pcVar8;
  if ((pcVar8 + 0x20 < pcVar8) ||
     ("fjdhphbdlfjogobdofoaagnlnkoibdge" < pcVar8 + 0x20 &&
      pcVar8 < "jdhphbdlfjogobdofoaagnlnkoibdge")) {
                    /* WARNING: Does not return */
    pcVar4 = (code *)SoftwareBreakpoint(1,0x417c968);
    (*pcVar4)();
  }
  *(undefined8 *)(pcVar8 + 8) = s_fjdhphbdlfjogobdofoaagnlnkoibdge_0cefeb27._8_8_;
  *(undefined8 *)pcVar8 = uVar1;
  *(undefined8 *)(pcVar8 + 0x18) = uVar3;
  *(undefined8 *)(pcVar8 + 0x10) = uVar2;
  pcVar8[0x20] = 0;
  lVar7 = lVar7 + 8;
  FUN_00bfd304(lVar7,&local_58);
  if ((long)uStack_48 < 0) {
    FUN_00008eb8(local_58,uStack_48 & 0x7fffffffffffffff);
  }
  if (lVar7 == 0) {
    return 0;
  }
  pcVar8 = param_1;
  FUN_0417d6c4();
  if ((int)pcVar8 == 0) {
    if ((param_1[0xe2] != 0) && (param_1[0xe3] == '\0')) {
      return 0;
    }
    param_1[0xda] = 1;
    param_1[0xdd] = 1;
    uVar11 = *(ulong *)(param_1 + 0x30);
    FUN_0417bb1c();
    param_1[0xdd] = 0;
    if ((uVar11 & 1) == 0) {
      param_1[0xda] = 0;
      return 0;
    }
    param_1[0xdb] = 1;
    FUN_0417dbe8(param_1);
    param_1[0xde] = 0;
    lVar7 = *(long *)(*(long *)(DAT_0eee6cf8 + 0x290) + 8);
    if (lVar7 != 0) {
      local_58 = param_1;
      FUN_00db1870(lVar7,&local_58,&LAB_0417f7bc,0,0);
    }
    pbVar10 = (byte *)(param_1 + 0xe6);
    if ((*pbVar10 & 1) != 0) goto LAB_0417c950;
    uVar11 = (ulong)pbVar10 & 0xfffffffc00000000;
    if (uVar11 == DAT_0ebb2088) {
      FUN_000142fc(pbVar10);
      bVar12 = *pbVar10;
    }
    else {
      bVar12 = 0;
    }
    *pbVar10 = 1;
  }
  else {
    if ((param_1[0xe2] & 1U) != 0) {
      return 0;
    }
    *(undefined2 *)(param_1 + 0xda) = 0x101;
    FUN_0417dbe8(param_1);
    param_1[0xde] = 0;
    lVar7 = *(long *)(*(long *)(DAT_0eee6cf8 + 0x290) + 8);
    if (lVar7 != 0) {
      local_58 = param_1;
      FUN_00db1870(lVar7,&local_58,&LAB_0417f7bc,0,0);
    }
    pbVar10 = (byte *)(param_1 + 0xe6);
    if ((*pbVar10 & 1) != 0) goto LAB_0417c950;
    uVar11 = (ulong)pbVar10 & 0xfffffffc00000000;
    if (uVar11 == DAT_0ebb2088) {
      FUN_000142fc(pbVar10);
      bVar12 = *pbVar10;
    }
    else {
      bVar12 = 0;
    }
    *pbVar10 = 1;
  }
  lVar7 = *(long *)(*(long *)(DAT_0eee6cf8 + 0x290) + 8);
  if (lVar7 != 0) {
    local_58 = param_1;
    FUN_00db1870(lVar7,&local_58,&LAB_0417f944,0,0);
  }
  param_1[0xe6] = bVar12;
  if (uVar11 == DAT_0ebb2088) {
    FUN_00022a3c(param_1 + 0xe6);
  }
LAB_0417c950:
  FUN_0417d9ec(param_1);
  *(undefined2 *)(param_1 + 0xe2) = 0;
  return 1;
}


