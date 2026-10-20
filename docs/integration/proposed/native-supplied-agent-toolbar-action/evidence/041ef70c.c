// func FUN_041ef70c @ 041ef70c size 680

void FUN_041ef70c(long param_1,long param_2)

{
  ulong uVar1;
  uint uVar2;
  bool bVar3;
  bool bVar4;
  bool bVar5;
  bool bVar6;
  long *plVar7;
  undefined8 uVar8;
  long lVar9;
  long lVar10;
  wchar16 ****ppppwVar11;
  ulong uVar12;
  wchar16 ****ppppwVar13;
  wchar16 ***local_80;
  ulong uStack_78;
  ulong local_70;
  wchar16 ***local_60;
  ulong uStack_58;
  undefined8 local_50;
  wchar16 ***local_48;
  ulong uStack_40;
  undefined8 local_38;
  
  plVar7 = *(long **)(param_1 + 0x18);
  (**(code **)(*plVar7 + 0x468))();
  lVar9 = *(long *)(*(long *)(param_1 + 0x20) + 0x5f8);
  lVar10 = 0;
  if (lVar9 != 0) {
    lVar10 = *(long *)(lVar9 + 0x18);
  }
  if (lVar10 != param_2) {
    FUN_07d7ec64(0);
  }
  local_48 = (wchar16 ***)0x0;
  uStack_40 = 0;
  local_38 = 0;
  FUN_07c2b240(&local_48,*(undefined8 *)(param_2 + 0x638));
  local_60 = (wchar16 ***)0x0;
  uStack_58 = 0;
  local_50 = 0;
  FUN_0418d540(&local_60,*(undefined8 *)(param_2 + 0x638),plVar7);
  lVar10 = *(long *)(param_2 + 0x638);
  if (*(char *)(lVar10 + 0x37) < '\0') {
    FUN_00018218(&local_80,*(undefined8 *)(lVar10 + 0x20),*(undefined8 *)(lVar10 + 0x28));
  }
  else {
    uStack_78 = *(ulong *)(lVar10 + 0x28);
    local_80 = *(wchar16 ****)(lVar10 + 0x20);
    local_70 = *(ulong *)(lVar10 + 0x30);
  }
  if (((long)local_70 < 0) && (uStack_78 == 0x20)) {
    bVar3 = *local_80 == (wchar16 **)s_fjdhphbdlfjogobdofoaagnlnkoibdge_0ce48949._0_8_;
    bVar4 = local_80[1] == (wchar16 **)s_fjdhphbdlfjogobdofoaagnlnkoibdge_0ce48949._8_8_;
    bVar5 = local_80[2] == (wchar16 **)s_fjdhphbdlfjogobdofoaagnlnkoibdge_0ce48949._16_8_;
    bVar6 = local_80[3] == (wchar16 **)s_fjdhphbdlfjogobdofoaagnlnkoibdge_0ce48949._24_8_;
    FUN_00008eb8(local_80,local_70 & 0x7fffffffffffffff);
    if (((bVar3 && bVar4) && bVar5) && bVar6) {
      if ((long)local_38 < 0) {
        uStack_40 = 9;
        ppppwVar11 = (wchar16 ****)local_48;
      }
      else {
        local_38 = CONCAT17(9,(undefined7)local_38);
        ppppwVar11 = &local_48;
      }
      *(undefined4 *)(ppppwVar11 + 2) = 0x65;
      ppppwVar11[1] = (wchar16 ***)u_Ask_Aside_0df79bde._8_8_;
      *ppppwVar11 = (wchar16 ***)u_Ask_Aside_0df79bde._0_8_;
      if ((long)local_50 < 0) {
        FUN_00008eb8(local_60,local_50 << 1);
      }
      local_60 = (wchar16 ***)0x0;
      uStack_58 = 0;
      local_50 = 0;
      goto LAB_041ef930;
    }
  }
  else if ((long)local_70 < 0) {
    FUN_00008eb8(local_80,local_70 & 0x7fffffffffffffff);
  }
  uVar12 = uStack_40;
  if (-1 < (long)local_38) {
    uVar12 = local_38 >> 0x38;
  }
  uVar2 = (uint)(char)local_50._7_1_;
  uVar1 = uStack_58;
  if (-1 < (int)uVar2) {
    uVar1 = (ulong)local_50._7_1_;
  }
  if (uVar12 == uVar1) {
    if (uVar12 != 0) {
      ppppwVar11 = (wchar16 ****)local_60;
      if (-1 < (int)uVar2) {
        ppppwVar11 = &local_60;
      }
      ppppwVar13 = (wchar16 ****)local_48;
      if (-1 < (long)local_38) {
        ppppwVar13 = &local_48;
      }
      do {
        if (*(wchar16 *)ppppwVar11 != *(wchar16 *)ppppwVar13) goto LAB_041ef8ac;
        uVar12 = uVar12 - 1;
        ppppwVar11 = (wchar16 ****)((long)ppppwVar11 + 2);
        ppppwVar13 = (wchar16 ****)((long)ppppwVar13 + 2);
      } while (uVar12 != 0);
    }
    local_80 = (wchar16 ***)0x0;
    uStack_78 = 0;
    local_70 = 0;
    if ((uVar2 >> 7 & 1) != 0) {
LAB_041ef910:
      FUN_00008eb8(local_60,local_50 << 1);
    }
  }
  else {
LAB_041ef8ac:
    if ((int)uVar2 < 0) {
      FUN_00046bd0(&local_80,local_60);
      if ((long)local_50 < 0) goto LAB_041ef910;
    }
    else {
      uStack_78 = uStack_58;
      local_80 = local_60;
      local_70 = local_50;
    }
  }
  uStack_58 = uStack_78;
  local_60 = local_80;
  local_50 = local_70;
LAB_041ef930:
  uVar8 = *(undefined8 *)(param_2 + 0x638);
  FUN_07c2bbf0(uVar8,plVar7);
  FUN_07d7ecc4(*(undefined8 *)(param_1 + 0x20),&local_48,&local_60,uVar8,plVar7);
  if ((long)local_50 < 0) {
    FUN_00008eb8(local_60,local_50 << 1);
  }
  if ((long)local_38 < 0) {
    FUN_00008eb8(local_48,local_38 << 1);
  }
  return;
}


