// func FUN_0417a7a0 @ 0417a7a0 size 304

void FUN_0417a7a0(long param_1)

{
  code *pcVar1;
  int iVar2;
  long lVar3;
  qword *pqVar4;
  undefined8 uVar5;
  long lVar6;
  int *piVar7;
  
  if (((((*(byte *)(param_1 + 0xe7) & 1) == 0) && (DAT_0eee6cf8 != 0)) &&
      (lVar6 = *(long *)(DAT_0eee6cf8 + 0x38), lVar6 != 0)) &&
     ((lVar3 = lVar6, FUN_004bcc4c(lVar6,"aside.onboarding_completed",0x1a), lVar3 != 0 &&
      (FUN_00306500(lVar6,"aside.onboarding_completed",0x1a), (int)lVar6 != 0)))) {
    *(undefined2 *)(param_1 + 0xd8) = 0x101;
    *(undefined1 *)(param_1 + 0xde) = 0;
    *(undefined1 *)(param_1 + 0xe2) = 0;
    *(undefined1 *)(param_1 + 0xda) = 0;
    FUN_0072e718(param_1 + 0xe8);
    FUN_0072e718(param_1 + 0x148);
    if (DAT_0eee6cf8 == 0) {
      lVar6 = 0;
    }
    else {
      lVar6 = *(long *)(DAT_0eee6cf8 + 0x38);
    }
    piVar7 = *(int **)(param_1 + 0x1a8);
    if (piVar7 != (int *)0x0) {
      iVar2 = *piVar7;
      *piVar7 = iVar2 + 1;
      if (iVar2 == 0x7fffffff) {
                    /* WARNING: Does not return */
        pcVar1 = (code *)SoftwareBreakpoint(0,0x417a8d0);
        (*pcVar1)();
      }
    }
    uVar5 = *(undefined8 *)(param_1 + 0x1b0);
    pqVar4 = &segment_command_00000020.vmsize;
    FUN_0000f368();
    *(undefined4 *)pqVar4 = 1;
    pqVar4[1] = (qword)&LAB_03fbb700;
    pqVar4[2] = (qword)FUN_03f9e440;
    pqVar4[3] = (qword)&LAB_0406a280;
    pqVar4[4] = (qword)&LAB_0417cf90;
    pqVar4[5] = 0;
    pqVar4[6] = (qword)piVar7;
    pqVar4[7] = uVar5;
                    /* WARNING: Could not recover jumptable at 0x0417a8c8. Too many branches */
                    /* WARNING: Treating indirect jump as call */
    (**(code **)(**(long **)(lVar6 + 0x18) + 0x98))(*(long **)(lVar6 + 0x18),pqVar4,0);
    return;
  }
  return;
}


