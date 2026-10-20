// func FUN_0417dcdc @ 0417dcdc size 484

void FUN_0417dcdc(long **param_1)

{
  code *pcVar1;
  long lVar2;
  long *plVar3;
  long lVar4;
  undefined **ppuVar5;
  qword *pqVar6;
  undefined8 *puVar7;
  long *plVar8;
  long lVar9;
  long *local_68;
  long local_60;
  undefined8 local_58;
  long **local_50;
  long **pplStack_48;
  
  if (*(char *)((long)param_1 + 0xe2) == '\0') {
    return;
  }
  if (*(char *)((long)param_1 + 0xe3) == '\0') {
    return;
  }
  if ((*(byte *)((long)param_1 + 0xe7) & 1) != 0) {
    return;
  }
  if (param_1[6] == (long *)0x0) {
    return;
  }
  if ((*(byte *)(param_1[6][3] + 0x30) & 1) != 0) {
    return;
  }
  if ((DAT_0ef02650 & 1) != 0) {
    return;
  }
  if (DAT_0ef02640 != 0) {
    return;
  }
  local_68 = (long *)0x0;
  local_60 = 0;
  local_58 = 0;
  lVar4 = *(long *)(*(long *)(DAT_0eee6cf8 + 0x290) + 8);
  if (lVar4 != 0) {
    pplStack_48 = &local_68;
    local_50 = param_1;
    FUN_00db1870(lVar4,&local_50,&LAB_0417fab4,0,0);
    if (local_60 != 0) {
      plVar8 = local_68;
      for (lVar4 = local_60 << 3; lVar4 != 0; lVar4 = lVar4 + -8) {
        lVar9 = *plVar8;
        lVar2 = lVar9 + 0x158;
        FUN_001146ac(lVar2,&PTR_s_UnloadController_kDataKeyImpl_0ead4c50);
        if (((*(byte *)(lVar2 + 0x148) & 1) == 0) &&
           (plVar3 = *(long **)(lVar9 + 0x50), plVar3 != (long *)0x0)) {
          (**(code **)(*plVar3 + 0x60))();
        }
        plVar8 = plVar8 + 1;
      }
      goto LAB_0417dea4;
    }
  }
  FUN_0417ad48(param_1);
  ppuVar5 = &PTR___tlv_bootstrap_0ed03d80;
  (*(code *)PTR___tlv_bootstrap_0ed03d80)();
  if (((undefined8 *)*ppuVar5 == (undefined8 *)0x0) ||
     (puVar7 = *(undefined8 **)*ppuVar5, puVar7 == (undefined8 *)0x0)) {
                    /* WARNING: Does not return */
    pcVar1 = (code *)SoftwareBreakpoint(0,0x417debc);
    (*pcVar1)();
  }
  FUN_00050c80(&local_50,"PostMaybeShowBootstrapWindow",
               "../../chrome/browser/profiles/aside_account_password_gate.cc",0x326);
  plVar8 = param_1[0x35];
  if ((plVar8 != (long *)0x0) &&
     (lVar4 = *plVar8, *(int *)plVar8 = (int)lVar4 + 1, (int)lVar4 == 0x7fffffff)) {
                    /* WARNING: Does not return */
    pcVar1 = (code *)SoftwareBreakpoint(0,0x417dec8);
    (*pcVar1)();
  }
  plVar3 = param_1[0x36];
  pqVar6 = &segment_command_00000020.vmsize;
  FUN_0000f368();
  *(undefined4 *)pqVar6 = 1;
  pqVar6[1] = (qword)&LAB_03fbb700;
  pqVar6[2] = (qword)FUN_03f9e440;
  pqVar6[3] = (qword)&LAB_0406a280;
  pqVar6[4] = (qword)FUN_0417ac3c;
  pqVar6[5] = 0;
  pqVar6[6] = (qword)plVar8;
  pqVar6[7] = (qword)plVar3;
  (**(code **)*puVar7)(puVar7,&local_50,pqVar6,0);
LAB_0417dea4:
  local_50 = &local_68;
  FUN_06564740(&local_50);
  return;
}


