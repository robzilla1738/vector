// func FUN_04253b3c @ 04253b3c size 556

void FUN_04253b3c(long *param_1)

{
  long lVar1;
  int iVar2;
  qword *pqVar3;
  long lVar4;
  int *piVar5;
  undefined8 uVar6;
  char *local_58;
  long lStack_50;
  char local_31;
  
  iVar2 = *(int *)((long)param_1 + 0x1c);
  if (iVar2 == 0 && DAT_0eee6cf8 != 0) {
    lVar4 = DAT_0eee6cf8;
    FUN_01a1fb78();
    if (lVar4 != 0) {
      FUN_01a1fb78(DAT_0eee6cf8);
      FUN_01a1fc10();
      FUN_07acd600();
    }
    iVar2 = *(int *)((long)param_1 + 0x1c);
  }
  if (iVar2 == 0) {
    lVar4 = (long)*(char *)((long)param_1 + 0x37);
    if (lVar4 < 0) {
      lVar4 = param_1[5];
    }
    if (lVar4 != 0) {
      FUN_00050c80(&local_58,"FinishWithFailure",
                   "../../chrome/browser/ui/webui/aside_importer/chromium_profile_migrator.cc",0x98d
                  );
      pqVar3 = &segment_command_00000020.vmsize;
      FUN_0000f368();
      *(undefined4 *)pqVar3 = 1;
      pqVar3[1] = (qword)&LAB_0425fae8;
      pqVar3[2] = (qword)FUN_03fb9c40;
      pqVar3[3] = (qword)FUN_0255db00;
      if (*(char *)((long)param_1 + 0x37) < '\0') {
        FUN_00018218(pqVar3 + 5,param_1[4],param_1[5]);
      }
      else {
        lVar4 = param_1[4];
        pqVar3[6] = param_1[5];
        pqVar3[5] = lVar4;
        pqVar3[7] = param_1[6];
      }
      FUN_004bdf80(DAT_0ef091a8,&local_58,&DAT_0cf080fc,pqVar3,0);
    }
  }
  if (*(char *)((long)param_1 + 0x13) != '\0') {
    if (((*param_1 != 0) && (*(char *)(*param_1 + 4) == '\0')) && (param_1[1] != 0)) {
      uVar6 = *(undefined8 *)(*(long *)(DAT_0eee6cf8 + 0x290) + 8);
      if ((*param_1 == 0) || (*(char *)(*param_1 + 4) != '\0')) {
        lVar4 = 0;
      }
      else {
        lVar4 = param_1[1];
      }
      FUN_005a04f4();
      if ((lVar4 != 0) && ((*(long *)(lVar4 + 0x50) != 0 || (*(long *)(lVar4 + 0x48) != 0)))) {
        lVar1 = 0x48;
        if (*(long *)(lVar4 + 0x50) != 0) {
          lVar1 = 0x50;
        }
        lVar4 = *(long *)(*(long *)(*(long *)(lVar4 + lVar1) + 0x10) + 8);
        if (lVar4 != 0) {
          lStack_50 = lVar4 + 0x28;
          local_31 = '\0';
          local_58 = &local_31;
          FUN_00db1870(uVar6,&local_58,&LAB_00db1b70,0,0);
        }
      }
    }
    FUN_0458cf98();
  }
  *(undefined1 *)(param_1 + 2) = 0;
  lVar4 = param_1[0xd];
  param_1[0xd] = 0;
  if (lVar4 != 0) {
    FUN_042591e4();
    FUN_00008eb8();
  }
  piVar5 = (int *)param_1[0xf];
  if (piVar5 != (int *)0x0) {
    param_1[0xf] = 0;
    (**(code **)(piVar5 + 2))(piVar5,0);
    LOAcquire();
    iVar2 = *piVar5;
    *piVar5 = iVar2 + -1;
    LORelease();
    if (iVar2 == 1) {
      (**(code **)(piVar5 + 4))(piVar5);
    }
  }
  return;
}


