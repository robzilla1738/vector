// func FUN_0417d9ec @ 0417d9ec size 268

void FUN_0417d9ec(long param_1)

{
  code *pcVar1;
  int iVar2;
  undefined **ppuVar3;
  qword *pqVar4;
  undefined8 *puVar5;
  undefined8 uVar6;
  int *piVar7;
  undefined1 auStack_50 [32];
  
  if ((((*(byte *)(param_1 + 0xe5) & 1) == 0) && ((*(byte *)(param_1 + 0xe7) & 1) == 0)) &&
     (*(char *)(param_1 + 0xda) != '\0')) {
    *(undefined1 *)(param_1 + 0xe5) = 1;
    ppuVar3 = &PTR___tlv_bootstrap_0ed03d80;
    (*(code *)PTR___tlv_bootstrap_0ed03d80)();
    if (((undefined8 *)*ppuVar3 == (undefined8 *)0x0) ||
       (puVar5 = *(undefined8 **)*ppuVar3, puVar5 == (undefined8 *)0x0)) {
                    /* WARNING: Does not return */
      pcVar1 = (code *)SoftwareBreakpoint(0,0x417daf4);
      (*pcVar1)();
    }
    FUN_00050c80(auStack_50,"PostHideNormalBrowsers",
                 "../../chrome/browser/profiles/aside_account_password_gate.cc",0x315);
    piVar7 = *(int **)(param_1 + 0x1a8);
    if ((piVar7 != (int *)0x0) && (iVar2 = *piVar7, *piVar7 = iVar2 + 1, iVar2 == 0x7fffffff)) {
                    /* WARNING: Does not return */
      pcVar1 = (code *)SoftwareBreakpoint(0,0x417db00);
      (*pcVar1)();
    }
    uVar6 = *(undefined8 *)(param_1 + 0x1b0);
    pqVar4 = &segment_command_00000020.vmsize;
    FUN_0000f368();
    *(undefined4 *)pqVar4 = 1;
    pqVar4[1] = (qword)&LAB_03fbb700;
    pqVar4[2] = (qword)FUN_03f9e440;
    pqVar4[3] = (qword)&LAB_0406a280;
    pqVar4[4] = (qword)&LAB_0417db08;
    pqVar4[5] = 0;
    pqVar4[6] = (qword)piVar7;
    pqVar4[7] = uVar6;
    (**(code **)*puVar5)(puVar5,auStack_50,pqVar4,0);
  }
  return;
}


