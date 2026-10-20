// func FUN_0427b60c @ 0427b60c size 512

void FUN_0427b60c(long param_1)

{
  code *pcVar1;
  int iVar2;
  char *pcVar3;
  qword *pqVar4;
  dword *pdVar5;
  qword *pqVar6;
  qword *pqVar7;
  undefined4 *puVar8;
  int *piVar9;
  undefined8 uVar10;
  undefined1 auStack_60 [32];
  
  if (*(char *)(param_1 + 0x6f) < '\0') {
    *(undefined8 *)(param_1 + 0x60) = 7;
    puVar8 = *(undefined4 **)(param_1 + 0x58);
  }
  else {
    puVar8 = (undefined4 *)(param_1 + 0x58);
    *(undefined1 *)(param_1 + 0x6f) = 7;
  }
  *(undefined4 *)((long)puVar8 + 3) = 0x676e696e;
  *puVar8 = 0x6e6e7572;
  *(undefined1 *)((long)puVar8 + 7) = 0;
  *(undefined8 *)(param_1 + 0x70) = 0x3f947ae147ae147b;
  FUN_042798c4(param_1);
  FUN_00050c80(auStack_60,"Start",
               "../../chrome/browser/extensions/api/aside_browser_import/aside_browser_import_api.cc"
               ,0x1d1);
  pcVar3 = segment_command_00000020.segname + 8;
  FUN_0000f368();
  pcVar3[0] = '\x01';
  pcVar3[1] = '\0';
  pcVar3[2] = '\0';
  pcVar3[3] = '\0';
  *(undefined1 **)(pcVar3 + 8) = &LAB_017a6a80;
  *(code **)(pcVar3 + 0x10) = FUN_03848fc0;
  *(code **)(pcVar3 + 0x18) = FUN_0255db00;
  *(code **)(pcVar3 + 0x20) = FUN_04266e60;
  *(dword *)(pcVar3 + 0x28) = *(dword *)(param_1 + 0xa8);
  piVar9 = *(int **)(param_1 + 0xe8);
  if (piVar9 != (int *)0x0) {
    iVar2 = *piVar9;
    *piVar9 = iVar2 + 1;
    if (iVar2 == 0x7fffffff) {
                    /* WARNING: Does not return */
      pcVar1 = (code *)SoftwareBreakpoint(0,0x427b80c);
      (*pcVar1)();
    }
  }
  uVar10 = *(undefined8 *)(param_1 + 0xf0);
  pqVar4 = &segment_command_00000020.vmsize;
  FUN_0000f368();
  *(undefined4 *)pqVar4 = 1;
  pqVar4[1] = (qword)FUN_0427c468;
  pqVar4[2] = (qword)FUN_03f9e440;
  pqVar4[3] = (qword)&LAB_0406a280;
  pqVar4[4] = (qword)FUN_0427b898;
  pqVar4[5] = 0;
  pqVar4[6] = (qword)piVar9;
  pqVar4[7] = uVar10;
  pdVar5 = &MACH_HEADER.cpusubtype;
  FUN_0000f368();
  *(undefined8 *)pdVar5 = 0;
  pqVar6 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar6 = 1;
  pqVar6[1] = (qword)FUN_02b0fa40;
  pqVar6[2] = (qword)FUN_03fbb840;
  pqVar6[3] = (qword)FUN_0255db00;
  pqVar6[4] = (qword)FUN_0427c0d4;
  pqVar6[5] = (qword)pcVar3;
  if (((ulong)pdVar5 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pdVar5);
  }
  pqVar6[6] = (qword)pdVar5;
  pqVar7 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar7 = 1;
  pqVar7[1] = (qword)&LAB_02d83000;
  pqVar7[2] = (qword)FUN_0427c354;
  pqVar7[3] = (qword)FUN_0255db00;
  pqVar7[4] = (qword)&LAB_0427c260;
  pqVar7[5] = (qword)pqVar4;
  pqVar7[6] = (qword)pdVar5;
  FUN_023aad84(auStack_60,&DAT_0cf0a472,pqVar6,pqVar7);
  return;
}


