// func FUN_0417b2a0 @ 0417b2a0 size 1272

/* WARNING: Removing unreachable block (ram,0x0417b690) */

uint FUN_0417b2a0(long *param_1)

{
  int iVar1;
  ulong uVar2;
  long *plVar3;
  long *plVar4;
  char *pcVar5;
  qword *pqVar6;
  undefined8 uVar7;
  long lVar8;
  code *pcVar9;
  ulong uVar10;
  int *piVar11;
  uint uVar12;
  long lVar13;
  undefined1 auStack_110 [32];
  ulong local_f0;
  undefined8 uStack_e8;
  long *local_e0;
  int *local_d8;
  undefined8 local_d0;
  ulong local_c0;
  undefined8 uStack_b8;
  ulong local_b0;
  ulong local_a0;
  undefined8 uStack_98;
  ulong local_90;
  undefined8 local_80;
  undefined8 uStack_78;
  undefined8 local_70;
  undefined2 local_62;
  
  if (((((param_1 == (long *)0x0) || ((*(byte *)(param_1 + 9) & 1) != 0)) ||
       ((DAT_0eee6cf8 != 0 &&
        (((uVar10 = *(ulong *)(DAT_0eee6cf8 + 0x38), uVar10 != 0 &&
          (uVar2 = uVar10, FUN_004bcc4c(uVar10,"aside.onboarding_completed",0x1a), uVar2 != 0)) &&
         (FUN_00306500(uVar10,"aside.onboarding_completed",0x1a), (uVar10 & 1) != 0)))))) ||
      ((((*(byte *)(param_1 + 9) & 1) == 0 &&
        (plVar3 = param_1, (**(code **)(*param_1 + 0x168))(), plVar3 != (long *)0x0)) &&
       ((plVar4 = plVar3, FUN_004bcc4c(), plVar4 != (long *)0x0 &&
        (FUN_00306500(plVar3,"aside.automatic_password_gate_suppressed",0x28),
        ((ulong)plVar3 & 1) != 0)))))) ||
     (plVar3 = param_1, FUN_0417b7a0(), ((ulong)plVar3 & 1) != 0)) {
    return 0;
  }
  local_62 = 0;
  piVar11 = (int *)param_1[0x18];
  if ((piVar11 != (int *)0x0) && (iVar1 = *piVar11, *piVar11 = iVar1 + 1, iVar1 == 0x7fffffff)) {
                    /* WARNING: Does not return */
    pcVar9 = (code *)SoftwareBreakpoint(0,0x417b798);
    (*pcVar9)();
  }
  lVar13 = param_1[0x19];
  local_80 = 0;
  uStack_78 = 0;
  local_70 = 0;
  if ((*(byte *)(param_1 + 9) & 1) == 0) {
    (**(code **)(*param_1 + 0x168))(param_1);
    FUN_0410347c(&local_80);
  }
  local_a0 = 0;
  uStack_98 = 0;
  local_90 = 0;
  (**(code **)(*param_1 + 0x30))(&local_f0,param_1);
  if ((long)local_e0 < 0) {
    FUN_00018218(&local_a0,local_f0,uStack_e8);
    if ((long)local_e0 < 0) {
      FUN_00008eb8(local_f0,(ulong)local_e0 & 0x7fffffffffffffff);
    }
  }
  else {
    uStack_98 = uStack_e8;
    local_a0 = local_f0;
    local_90 = (ulong)local_e0;
  }
  if ((*(byte *)(param_1 + 9) & 1) == 0) {
    (**(code **)(*param_1 + 0x168))(param_1);
    FUN_0410374c(&local_f0);
    if (((byte)local_d8 & 1) == 0) goto LAB_0417b47c;
    uStack_b8 = uStack_e8;
    local_c0 = local_f0;
    local_b0 = (ulong)local_e0;
  }
  else {
LAB_0417b47c:
    local_c0 = 0;
    uStack_b8 = 0;
    local_b0 = 0;
  }
  local_d0 = 0;
  uStack_e8 = 0;
  local_f0 = 0;
  local_d8 = (int *)0x0;
  local_e0 = (long *)0x0;
  FUN_01df31f4(&local_f0,1);
  FUN_00050c80(auStack_110,"IsBootstrapWindowRequired",
               "../../chrome/browser/profiles/aside_account_password_gate.cc",0x170);
  pcVar5 = section_00000068.sectname + 8;
  FUN_0000f368();
  pcVar5[0] = '\x01';
  pcVar5[1] = '\0';
  pcVar5[2] = '\0';
  pcVar5[3] = '\0';
  *(code **)(pcVar5 + 8) = FUN_0417f19c;
  *(code **)(pcVar5 + 0x10) = FUN_0417f264;
  *(code **)(pcVar5 + 0x18) = FUN_0255db00;
  *(undefined1 **)(pcVar5 + 0x20) = &LAB_0417b944;
  FUN_07bcfcb0(pcVar5 + 0x28,&local_80,&local_a0,&local_c0);
  pqVar6 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar6 = 1;
  pqVar6[1] = (qword)FUN_0417f2d8;
  pqVar6[2] = (qword)FUN_0396bf70;
  pqVar6[3] = (qword)FUN_0255db00;
  if (((ulong)&local_62 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(&local_62);
  }
  uVar10 = DAT_0ebb2088;
  pqVar6[5] = (qword)&local_62;
  if (((ulong)&local_f0 & 0xfffffffc00000000) == uVar10) {
    FUN_000142fc(&local_f0);
  }
  pqVar6[6] = (qword)&local_f0;
  FUN_0417b854(auStack_110,&DAT_0cefeb1b,pcVar5,pqVar6);
  FUN_00050c80(auStack_110,"IsBootstrapWindowRequired",
               "../../chrome/browser/profiles/aside_account_password_gate.cc",0x17a);
  FUN_01df3978(&local_f0,auStack_110);
  if (piVar11 != (int *)0x0) {
    uVar12 = 0;
    if (((char)piVar11[1] != '\0') || (lVar13 == 0)) goto LAB_0417b5f0;
    if ((local_62._1_1_ == '\0') || ((char)local_62 == '\0')) {
      if (((((local_62 & 0x100) != 0) || ((*(byte *)(param_1 + 9) & 1) != 0)) ||
          ((**(code **)(*param_1 + 0x168))(), param_1 == (long *)0x0)) ||
         ((plVar3 = param_1, FUN_004bcc4c(), plVar3 == (long *)0x0 ||
          (FUN_00306500(param_1,"aside.bootstrap_complete",0x18), ((ulong)param_1 & 1) == 0)))) {
        if ((DAT_0eee6cf8 == 0) ||
           ((lVar13 = *(long *)(DAT_0eee6cf8 + 0x38), lVar13 == 0 ||
            (lVar8 = lVar13, FUN_004bcc4c(lVar13,"aside.onboarding_completed",0x1a), lVar8 == 0))))
        {
          uVar12 = 1;
        }
        else {
          FUN_00306500(lVar13,"aside.onboarding_completed",0x1a);
          uVar12 = (uint)lVar13 ^ 1;
        }
        goto LAB_0417b5f0;
      }
    }
    else {
      if (DAT_0eee6cf8 == 0) {
        uVar7 = 0;
      }
      else {
        uVar7 = *(undefined8 *)(DAT_0eee6cf8 + 0x38);
      }
      FUN_04103b7c(uVar7);
    }
  }
  uVar12 = 0;
LAB_0417b5f0:
  local_d0 = 0;
  if ((local_d8 != (int *)0x0) && (*(undefined1 *)(local_d8 + 1) = 1, local_d8 != (int *)0x0)) {
    LOAcquire();
    iVar1 = *local_d8;
    *local_d8 = iVar1 + -1;
    LORelease();
    if (iVar1 == 1) {
      FUN_00008eb8(local_d8,8);
    }
  }
  if (local_e0 != (long *)0x0) {
    LOAcquire();
    iVar1 = (int)local_e0[1];
    *(int *)(local_e0 + 1) = iVar1 + -1;
    LORelease();
    if (iVar1 == 1) {
      pcVar9 = *(code **)(*local_e0 + 0x18);
      if (pcVar9 == (code *)&LAB_042caa8c) {
        pcVar9 = *(code **)(*local_e0 + 0x10);
      }
      (*pcVar9)();
    }
  }
  if ((local_f0 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00026a44();
  }
  if ((long)local_b0 < 0) {
    FUN_00008eb8(local_c0,local_b0 & 0x7fffffffffffffff);
  }
  if ((long)local_90 < 0) {
    FUN_00008eb8(local_a0,local_90 & 0x7fffffffffffffff);
  }
  if (piVar11 != (int *)0x0) {
    LOAcquire();
    iVar1 = *piVar11;
    *piVar11 = iVar1 + -1;
    LORelease();
    if (iVar1 == 1) {
      FUN_00008eb8(piVar11,8);
    }
  }
  return uVar12;
}


