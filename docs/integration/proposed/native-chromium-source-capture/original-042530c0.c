// func FUN_042530c0 @ 042530c0 size 1044

void FUN_042530c0(long *param_1,undefined4 *param_2,undefined4 param_3,int *param_4)

{
  int iVar1;
  int *piVar2;
  long lVar3;
  long lVar4;
  long *plVar5;
  qword *pqVar6;
  qword *pqVar7;
  byte bVar8;
  int *piVar9;
  code *pcVar10;
  undefined8 uVar11;
  char *local_68;
  long lStack_60;
  char local_41;
  
  if ((*(byte *)(param_1 + 2) & 1) != 0) {
    if (param_4 == (int *)0x0) {
      return;
    }
    LOAcquire();
    iVar1 = *param_4;
    *param_4 = iVar1 + -1;
    LORelease();
    if (iVar1 != 1) {
      return;
    }
                    /* WARNING: Could not recover jumptable at 0x0425312c. Too many branches */
                    /* WARNING: Treating indirect jump as call */
    (**(code **)(param_4 + 4))(param_4);
    return;
  }
  *(undefined4 *)(param_1 + 3) = *param_2;
  *(undefined4 *)((long)param_1 + 0x1c) = param_3;
  if (*(char *)((long)param_1 + 0x37) < '\0') {
    *(undefined1 *)param_1[4] = 0;
    param_1[5] = 0;
  }
  else {
    *(undefined1 *)(param_1 + 4) = 0;
    *(undefined1 *)((long)param_1 + 0x37) = 0;
  }
  if (*(char *)((long)param_1 + 0x4f) < '\0') {
    *(undefined2 *)param_1[7] = 0;
    param_1[8] = 0;
  }
  else {
    *(undefined2 *)(param_1 + 7) = 0;
    *(undefined1 *)((long)param_1 + 0x4f) = 0;
  }
  FUN_013f7b44(param_1 + 10,"Chromium browser import failed");
  piVar2 = (int *)param_1[0xf];
  param_1[0xf] = (long)param_4;
  if (piVar2 != (int *)0x0) {
    LOAcquire();
    iVar1 = *piVar2;
    *piVar2 = iVar1 + -1;
    LORelease();
    if (iVar1 == 1) {
      pcVar10 = *(code **)(piVar2 + 4);
      if (pcVar10 == FUN_00fa5640) {
        piVar9 = *(int **)(piVar2 + 0xc);
        if (piVar9 != (int *)0x0) {
          LOAcquire();
          iVar1 = *piVar9;
          *piVar9 = iVar1 + -1;
          LORelease();
          if (iVar1 == 1) {
            FUN_00008eb8(piVar9,8);
          }
        }
        uVar11 = 0x48;
      }
      else {
        if (pcVar10 != FUN_0396c600) {
          (*pcVar10)();
          goto LAB_042531f4;
        }
        uVar11 = 0x38;
      }
      FUN_00008eb8(piVar2,uVar11);
    }
  }
LAB_042531f4:
  *(undefined2 *)((long)param_1 + 0x11) = 0;
  lVar3 = param_1[0xd];
  param_1[0xd] = 0;
  if (lVar3 != 0) {
    FUN_042591e4();
    FUN_00008eb8();
  }
  *(undefined1 *)(param_1 + 2) = 1;
  if (param_1[0xe] == 0) {
    lVar4 = 0x20;
    FUN_0000f368();
    lVar3 = lVar4;
    FUN_00cdf6c0();
    if ((lVar3 != 0) &&
       (iVar1 = *(int *)(lVar4 + 8), *(int *)(lVar4 + 8) = iVar1 + 1, iVar1 == 0x7fffffff)) {
                    /* WARNING: Does not return */
      pcVar10 = (code *)SoftwareBreakpoint(0,0x42534dc);
      (*pcVar10)();
    }
    plVar5 = (long *)param_1[0xe];
    param_1[0xe] = lVar4;
    if (plVar5 != (long *)0x0) {
      LOAcquire();
      iVar1 = (int)plVar5[1];
      *(int *)(plVar5 + 1) = iVar1 + -1;
      LORelease();
      if (iVar1 == 1) {
        pcVar10 = *(code **)(*plVar5 + 0x18);
        if (pcVar10 == (code *)&LAB_042caa8c) {
          pcVar10 = *(code **)(*plVar5 + 0x10);
        }
        (*pcVar10)();
      }
    }
  }
  if (*(char *)((long)param_1 + 0x13) != '\0') {
    if (((*param_1 != 0) && (*(char *)(*param_1 + 4) == '\0')) && (param_1[1] != 0)) {
      uVar11 = *(undefined8 *)(*(long *)(DAT_0eee6cf8 + 0x290) + 8);
      if ((*param_1 == 0) || (*(char *)(*param_1 + 4) != '\0')) {
        lVar3 = 0;
      }
      else {
        lVar3 = param_1[1];
      }
      FUN_005a04f4();
      if ((lVar3 != 0) && ((*(long *)(lVar3 + 0x50) != 0 || (*(long *)(lVar3 + 0x48) != 0)))) {
        lVar4 = 0x48;
        if (*(long *)(lVar3 + 0x50) != 0) {
          lVar4 = 0x50;
        }
        lVar3 = *(long *)(*(long *)(*(long *)(lVar3 + lVar4) + 0x10) + 8);
        if (lVar3 != 0) {
          lStack_60 = lVar3 + 0x28;
          local_41 = '\0';
          local_68 = &local_41;
          FUN_00db1870(uVar11,&local_68,&LAB_00db1b70,0,0);
        }
      }
    }
    FUN_0458cf98();
  }
  FUN_00050c80(&local_68,"Start",
               "../../chrome/browser/ui/webui/aside_importer/chromium_profile_migrator.cc",0x838);
  if (*(int *)((long)param_1 + 0x1c) == 1) {
    bVar8 = *(byte *)((long)param_1 + 0x14);
  }
  else {
    bVar8 = 0;
  }
  pqVar6 = &segment_command_00000020.filesize;
  FUN_0000f368();
  *(undefined4 *)pqVar6 = 1;
  pqVar6[1] = (qword)&LAB_0425957c;
  pqVar6[2] = (qword)FUN_042597f4;
  pqVar6[3] = (qword)FUN_0255db00;
  *(int *)(pqVar6 + 5) = (int)param_1[3];
  if (*(char *)((long)param_2 + 0x1f) < '\0') {
    FUN_00018218(pqVar6 + 6,*(undefined8 *)(param_2 + 2),*(undefined8 *)(param_2 + 4));
  }
  else {
    uVar11 = *(undefined8 *)(param_2 + 2);
    pqVar6[7] = *(undefined8 *)(param_2 + 4);
    pqVar6[6] = uVar11;
    pqVar6[8] = *(undefined8 *)(param_2 + 6);
  }
  *(byte *)(pqVar6 + 9) = bVar8 & 1;
  piVar2 = (int *)param_1[0x10];
  if ((piVar2 != (int *)0x0) && (iVar1 = *piVar2, *piVar2 = iVar1 + 1, iVar1 == 0x7fffffff)) {
                    /* WARNING: Does not return */
    pcVar10 = (code *)SoftwareBreakpoint(0,0x42534d0);
    (*pcVar10)();
  }
  lVar3 = param_1[0x11];
  pqVar7 = &section_00000068.size;
  FUN_0000f368();
  *(undefined4 *)pqVar7 = 1;
  pqVar7[1] = (qword)&LAB_041b06c8;
  pqVar7[2] = (qword)FUN_04259840;
  pqVar7[3] = (qword)&LAB_040ae6c0;
  pqVar7[4] = (qword)FUN_042534e8;
  pqVar7[5] = 0;
  pqVar7[6] = (qword)piVar2;
  pqVar7[7] = lVar3;
  FUN_0424dec8(pqVar7 + 8,param_2);
  FUN_07c0a770(&local_68,&DAT_0cf080f6,pqVar6,pqVar7);
  return;
}


