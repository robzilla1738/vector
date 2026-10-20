// func FUN_0415ebd0 @ 0415ebd0 size 444

void FUN_0415ebd0(long param_1,byte param_2)

{
  code *pcVar1;
  int iVar2;
  char *pcVar3;
  qword *pqVar4;
  dword *pdVar5;
  qword *pqVar6;
  qword *pqVar7;
  int *piVar8;
  undefined8 uVar9;
  undefined1 auStack_70 [32];
  
  param_2 = *(byte *)(param_1 + 0xa2) | param_2;
  *(byte *)(param_1 + 0xa2) = param_2;
  if (*(char *)(param_1 + 0xa0) == '\0') {
    *(undefined1 *)(param_1 + 0xa0) = 1;
    *(undefined1 *)(param_1 + 0xa2) = 0;
    FUN_00050c80(auStack_70,"RefreshAccountsState",
                 "../../chrome/browser/signin/aside_profile_attributes_updater.cc",0x1dc);
    pcVar3 = segment_command_00000020.segname + 8;
    FUN_0000f368();
    pcVar3[0] = '\x01';
    pcVar3[1] = '\0';
    pcVar3[2] = '\0';
    pcVar3[3] = '\0';
    *(code **)(pcVar3 + 8) = FUN_01fbecc8;
    *(code **)(pcVar3 + 0x10) = FUN_03848fc0;
    *(code **)(pcVar3 + 0x18) = FUN_0255db00;
    *(undefined1 **)(pcVar3 + 0x20) = &LAB_0416033c;
    piVar8 = *(int **)(param_1 + 0xc0);
    if (piVar8 != (int *)0x0) {
      iVar2 = *piVar8;
      *piVar8 = iVar2 + 1;
      if (iVar2 == 0x7fffffff) {
                    /* WARNING: Does not return */
        pcVar1 = (code *)SoftwareBreakpoint(0,0x415ed8c);
        (*pcVar1)();
      }
    }
    uVar9 = *(undefined8 *)(param_1 + 200);
    pqVar4 = &segment_command_00000020.vmsize;
    FUN_0000f368();
    *(undefined4 *)pqVar4 = 1;
    pqVar4[1] = (qword)FUN_04160ce0;
    pqVar4[2] = (qword)FUN_040c6940;
    pqVar4[3] = (qword)FUN_0255db00;
    pqVar4[5] = (qword)piVar8;
    pqVar4[6] = uVar9;
    *(byte *)(pqVar4 + 7) = param_2;
    pdVar5 = &MACH_HEADER.cpusubtype;
    FUN_0000f368();
    *(undefined8 *)pdVar5 = 0;
    pqVar6 = &segment_command_00000020.vmaddr;
    FUN_0000f368();
    *(undefined4 *)pqVar6 = 1;
    pqVar6[1] = (qword)FUN_02b0fa40;
    pqVar6[2] = (qword)FUN_03fbb840;
    pqVar6[3] = (qword)FUN_0255db00;
    pqVar6[4] = (qword)&LAB_04162a84;
    pqVar6[5] = (qword)pcVar3;
    if (((ulong)pdVar5 & 0xfffffffc00000000) == DAT_0ebb2088) {
      FUN_000142fc(pdVar5);
    }
    pqVar6[6] = (qword)pdVar5;
    pqVar7 = &segment_command_00000020.vmaddr;
    FUN_0000f368();
    *(undefined4 *)pqVar7 = 1;
    pqVar7[1] = (qword)&LAB_02d83000;
    pqVar7[2] = (qword)FUN_04162c80;
    pqVar7[3] = (qword)FUN_0255db00;
    pqVar7[4] = (qword)FUN_04162ba8;
    pqVar7[5] = (qword)pqVar4;
    pqVar7[6] = (qword)pdVar5;
    FUN_023aad84(auStack_70,&DAT_0cefbef1,pqVar6,pqVar7);
  }
  else {
    *(undefined1 *)(param_1 + 0xa1) = 1;
  }
  return;
}


