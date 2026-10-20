// func FUN_0417ad48 @ 0417ad48 size 804

/* WARNING: Removing unreachable block (ram,0x0417b054) */

void FUN_0417ad48(long param_1)

{
  code *pcVar1;
  int iVar2;
  long lVar3;
  long lVar4;
  long *plVar5;
  long *plVar6;
  char *pcVar7;
  qword *pqVar8;
  undefined8 uVar9;
  int *piVar10;
  undefined8 local_a0;
  undefined8 uStack_98;
  undefined7 local_90;
  char cStack_89;
  byte local_88;
  undefined8 local_80;
  undefined8 uStack_78;
  ulong local_70;
  undefined8 local_60;
  undefined8 uStack_58;
  ulong local_50;
  undefined8 local_48;
  undefined8 uStack_40;
  undefined8 local_38;
  
  if (((((*(byte *)(param_1 + 0xe7) & 1) != 0) || (lVar3 = *(long *)(param_1 + 0x30), lVar3 == 0))
      || ((*(byte *)(*(long *)(lVar3 + 0x18) + 0x30) & 1) != 0)) ||
     (FUN_0417b7a0(), (int)lVar3 != 0)) {
    *(undefined1 *)(param_1 + 0xd8) = 0;
    return;
  }
  if (((DAT_0eee6cf8 != 0) && (lVar3 = *(long *)(DAT_0eee6cf8 + 0x38), lVar3 != 0)) &&
     ((lVar4 = lVar3, FUN_004bcc4c(lVar3,"aside.onboarding_completed",0x1a), lVar4 != 0 &&
      (FUN_00306500(lVar3,"aside.onboarding_completed",0x1a), (int)lVar3 != 0)))) {
    FUN_0417a7a0(param_1);
    return;
  }
  plVar5 = *(long **)(param_1 + 0x30);
  plVar6 = (long *)0x0;
  if (plVar5 == (long *)0x0) {
LAB_0417aea8:
    local_48 = 0;
    uStack_40 = 0;
    local_38 = 0;
  }
  else {
    if ((((*(byte *)(plVar5 + 9) & 1) == 0) &&
        ((**(code **)(*plVar5 + 0x168))(), plVar5 != (long *)0x0)) &&
       ((plVar6 = plVar5, FUN_004bcc4c(), plVar6 != (long *)0x0 &&
        (FUN_00306500(plVar5,"aside.automatic_password_gate_suppressed",0x28), (int)plVar5 != 0))))
    {
      *(undefined1 *)(param_1 + 0xd8) = 1;
      return;
    }
    plVar5 = *(long **)(param_1 + 0x30);
    local_48 = 0;
    uStack_40 = 0;
    local_38 = 0;
    plVar6 = (long *)0x0;
    if ((plVar5 == (long *)0x0) || (plVar6 = plVar5, (char)plVar5[9] != '\0')) goto LAB_0417aea8;
    (**(code **)(*plVar5 + 0x168))(plVar5);
    FUN_0410347c(&local_48);
    plVar6 = *(long **)(param_1 + 0x30);
  }
  local_60 = 0;
  uStack_58 = 0;
  local_50 = 0;
  (**(code **)(*plVar6 + 0x30))(&local_a0);
  if (cStack_89 < '\0') {
    FUN_00018218(&local_60,local_a0,uStack_98);
    if (cStack_89 < '\0') {
      FUN_00008eb8(local_a0,CONCAT17(cStack_89,local_90) & 0x7fffffffffffffff);
    }
  }
  else {
    uStack_58 = uStack_98;
    local_60 = local_a0;
    local_50 = CONCAT17(cStack_89,local_90);
  }
  plVar6 = *(long **)(param_1 + 0x30);
  if ((plVar6 != (long *)0x0) && ((*(byte *)(plVar6 + 9) & 1) == 0)) {
    (**(code **)(*plVar6 + 0x168))();
    FUN_0410374c(&local_a0);
    if ((local_88 & 1) != 0) {
      uStack_78 = uStack_98;
      local_80 = local_a0;
      local_70 = CONCAT17(cStack_89,local_90);
      goto LAB_0417af40;
    }
  }
  local_80 = 0;
  uStack_78 = 0;
  local_70 = 0;
LAB_0417af40:
  FUN_00050c80(&local_a0,"RefreshBootstrapState",
               "../../chrome/browser/profiles/aside_account_password_gate.cc",0x24f);
  pcVar7 = section_00000068.sectname + 8;
  FUN_0000f368();
  pcVar7[0] = '\x01';
  pcVar7[1] = '\0';
  pcVar7[2] = '\0';
  pcVar7[3] = '\0';
  *(code **)(pcVar7 + 8) = FUN_0417f19c;
  *(code **)(pcVar7 + 0x10) = FUN_0417f264;
  *(code **)(pcVar7 + 0x18) = FUN_0255db00;
  *(undefined1 **)(pcVar7 + 0x20) = &LAB_0417b944;
  FUN_07bcfcb0(pcVar7 + 0x28,&local_48,&local_60,&local_80);
  piVar10 = *(int **)(param_1 + 0x1a8);
  if ((piVar10 != (int *)0x0) && (iVar2 = *piVar10, *piVar10 = iVar2 + 1, iVar2 == 0x7fffffff)) {
                    /* WARNING: Does not return */
    pcVar1 = (code *)SoftwareBreakpoint(0,0x417b06c);
    (*pcVar1)();
  }
  uVar9 = *(undefined8 *)(param_1 + 0x1b0);
  pqVar8 = &segment_command_00000020.vmsize;
  FUN_0000f368();
  *(undefined4 *)pqVar8 = 1;
  pqVar8[1] = (qword)&LAB_0417f410;
  pqVar8[2] = (qword)FUN_03f9e440;
  pqVar8[3] = (qword)&LAB_0406a280;
  pqVar8[4] = (qword)FUN_0417cb38;
  pqVar8[5] = 0;
  pqVar8[6] = (qword)piVar10;
  pqVar8[7] = uVar9;
  FUN_0417b854(&local_a0,&DAT_0cefeb21,pcVar7,pqVar8);
  if ((long)local_70 < 0) {
    FUN_00008eb8(local_80,local_70 & 0x7fffffffffffffff);
  }
  if ((long)local_50 < 0) {
    FUN_00008eb8(local_60,local_50 & 0x7fffffffffffffff);
  }
  return;
}


