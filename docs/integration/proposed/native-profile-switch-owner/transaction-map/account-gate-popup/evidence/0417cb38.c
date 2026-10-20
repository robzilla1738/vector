// func FUN_0417cb38 @ 0417cb38 size 612

void FUN_0417cb38(ulong param_1,uint param_2)

{
  uint uVar1;
  code *pcVar2;
  int iVar3;
  long lVar4;
  undefined8 uVar5;
  long *plVar6;
  long *plVar7;
  qword *pqVar8;
  ulong uVar9;
  long *plVar10;
  int *piVar11;
  long lVar12;
  undefined1 auStack_50 [32];
  
  if ((((*(byte *)(param_1 + 0xe7) & 1) == 0) && (*(long *)(param_1 + 0x30) != 0)) &&
     ((*(byte *)(*(long *)(*(long *)(param_1 + 0x30) + 0x18) + 0x30) & 1) == 0)) {
    if ((DAT_0eee6cf8 == 0) || (lVar12 = *(long *)(DAT_0eee6cf8 + 0x38), lVar12 == 0)) {
      iVar3 = 0;
    }
    else {
      lVar4 = lVar12;
      FUN_004bcc4c(lVar12,"aside.onboarding_completed",0x1a);
      iVar3 = 0;
      if (lVar4 != 0) {
        FUN_00306500(lVar12,"aside.onboarding_completed",0x1a);
        iVar3 = (int)lVar12;
      }
    }
    if ((param_2 & 0x1ff) == 0x101) {
      iVar3 = 1;
    }
    if (iVar3 != 0) {
      if (DAT_0eee6cf8 == 0) {
        uVar5 = 0;
      }
      else {
        uVar5 = *(undefined8 *)(DAT_0eee6cf8 + 0x38);
      }
      FUN_04103b7c(uVar5);
      FUN_0417a7a0(param_1);
      return;
    }
    *(undefined1 *)(param_1 + 0xd8) = 1;
    plVar6 = *(long **)(param_1 + 0x30);
    plVar10 = plVar6;
    if (plVar6 != (long *)0x0) {
      if ((*(byte *)(plVar6 + 9) & 1) == 0) {
        (**(code **)(*plVar6 + 0x168))();
        plVar10 = plVar6;
        if (plVar6 != (long *)0x0) {
          plVar7 = plVar6;
          FUN_004bcc4c();
          plVar10 = (long *)0x0;
          if (plVar7 != (long *)0x0) {
            FUN_00306500(plVar6,"aside.bootstrap_complete",0x18);
            plVar10 = plVar6;
          }
        }
      }
      else {
        plVar10 = (long *)0x0;
      }
    }
    uVar1 = (uint)plVar10;
    if ((param_2 & 0x100) != 0) {
      uVar1 = param_2;
    }
    *(byte *)(param_1 + 0xd9) = (byte)uVar1 & 1;
    if ((param_2 >> 8 & 1) == 0) {
      FUN_00050c80(auStack_50,"OnBootstrapStateLoaded",
                   "../../chrome/browser/profiles/aside_account_password_gate.cc",0x269);
      piVar11 = *(int **)(param_1 + 0x1a8);
      if ((piVar11 != (int *)0x0) && (iVar3 = *piVar11, *piVar11 = iVar3 + 1, iVar3 == 0x7fffffff))
      {
                    /* WARNING: Does not return */
        pcVar2 = (code *)SoftwareBreakpoint(0,0x417cd9c);
        (*pcVar2)();
      }
      uVar5 = *(undefined8 *)(param_1 + 0x1b0);
      pqVar8 = &segment_command_00000020.vmsize;
      FUN_0000f368();
      *(undefined4 *)pqVar8 = 1;
      pqVar8[1] = (qword)&LAB_03fbb700;
      pqVar8[2] = (qword)FUN_03f9e440;
      pqVar8[3] = (qword)&LAB_0406a280;
      pqVar8[4] = (qword)FUN_0417ad48;
      pqVar8[5] = 0;
      pqVar8[6] = (qword)piVar11;
      pqVar8[7] = uVar5;
      FUN_004aa504(param_1 + 0x148,auStack_50,1000000,pqVar8);
    }
    uVar9 = param_1;
    FUN_0417c5c4();
    if (((((uVar9 & 1) == 0) && ((*(byte *)(param_1 + 0xe2) & 1) == 0)) &&
        (*(char *)(param_1 + 0xdb) != '\0')) &&
       (((((*(byte *)(param_1 + 0xe1) & 1) != 0 ||
          (plVar10 = *(long **)(param_1 + 0x30), plVar10 == (long *)0x0)) ||
         (((*(byte *)(plVar10 + 9) & 1) != 0 ||
          (((**(code **)(*plVar10 + 0x168))(), plVar10 == (long *)0x0 ||
           (plVar6 = plVar10, FUN_004bcc4c(), plVar6 == (long *)0x0)))))) ||
        (FUN_00306500(plVar10,"aside.account_password_extension_available",0x2a),
        ((ulong)plVar10 & 1) == 0)))) {
      *(undefined1 *)(param_1 + 0xdb) = 0;
      FUN_0417cda4(param_1);
    }
  }
  return;
}


