// func FUN_042a5a28 @ 042a5a28 size 1244

void FUN_042a5a28(long param_1)

{
  code *pcVar1;
  int iVar2;
  long *plVar3;
  qword *pqVar4;
  char *pcVar5;
  ulong uVar6;
  long lVar7;
  int *piVar8;
  undefined8 uVar9;
  ulong uVar10;
  undefined8 uVar11;
  undefined1 auStack_170 [16];
  undefined1 auStack_160 [288];
  
  if (*(int *)(param_1 + 0x390) != 1) {
    return;
  }
  if (*(long *)(param_1 + 400) != 0) {
    return;
  }
  FUN_0072e718(param_1 + 0x2b8);
  if (((*(long *)(param_1 + 0x398) != 0) && (*(char *)(*(long *)(param_1 + 0x398) + 4) == '\0')) &&
     (*(long *)(param_1 + 0x3a0) != 0)) {
    FUN_042a4148(param_1);
  }
  lVar7 = param_1;
  FUN_042abc18();
  iVar2 = (int)lVar7;
  if ((iVar2 != 0) && ((*(byte *)(param_1 + 0x3a8) & 1) != 0)) {
    FUN_042abe9c(param_1);
    return;
  }
  (*(code *)PTR_FUN_0ebb1d18)();
  if (*(long *)(param_1 + 0x388) <= lVar7) {
    if (iVar2 != 0) {
      if ((DAT_0ef080b0 < 2) && ((DAT_0ebb1b88 != 0 || (DAT_0ef080b8 != 0)))) {
        FUN_0060914c(auStack_170,
                     "../../chrome/browser/component_updater/aside_component_update_service.cc",
                     0x72e,1);
        FUN_000254bc(auStack_160,
                     "Aside Daemon did not become healthy before the startup readiness timeout; continuing browser startup because Aside extensions are ready"
                     ,0x87);
        FUN_00609080(auStack_170);
      }
      FUN_042adc74("Aside Daemon did not become healthy before the startup readiness timeout; continuing browser startup because Aside extensions are ready"
                   ,0x87);
      FUN_042abe9c(param_1);
      return;
    }
    FUN_042ac060(param_1);
    return;
  }
  lVar7 = (long)*(char *)(param_1 + 0xf7);
  if (lVar7 < 0) {
    lVar7 = *(long *)(param_1 + 0xe8);
  }
  if (((lVar7 != 0) || (*(long *)(param_1 + 0x188) != 0)) || (*(long *)(param_1 + 0x180) != 0))
  goto LAB_042a5b28;
  plVar3 = *(long **)(param_1 + 0x288);
  if (plVar3 == (long *)0x0) {
LAB_042a5ae4:
    lVar7 = (long)*(char *)(param_1 + 0x16f);
    if (lVar7 < 0) {
      lVar7 = *(long *)(param_1 + 0x160);
    }
    if (lVar7 == 0) {
      if (*(char *)(param_1 + 0x3a8) != '\0') {
        *(undefined1 *)(param_1 + 0x3a8) = 0;
        FUN_00050c80(auStack_170,"ScheduleStartupReadinessCheck",
                     "../../chrome/browser/component_updater/aside_component_update_service.cc",
                     0x6ef);
        piVar8 = *(int **)(param_1 + 0x420);
        if ((piVar8 != (int *)0x0) && (iVar2 = *piVar8, *piVar8 = iVar2 + 1, iVar2 == 0x7fffffff)) {
                    /* WARNING: Does not return */
          pcVar1 = (code *)SoftwareBreakpoint(0,0x42a5cdc);
          (*pcVar1)();
        }
        goto LAB_042a5b60;
      }
      lVar7 = (long)*(char *)(param_1 + 199);
      if (lVar7 < 0) {
        lVar7 = *(long *)(param_1 + 0xb8);
      }
      if (lVar7 == 0) {
        FUN_00050c80(auStack_170,"ScheduleStartupReadinessCheck",
                     "../../chrome/browser/component_updater/aside_component_update_service.cc",
                     0x6ef);
        piVar8 = *(int **)(param_1 + 0x420);
        if ((piVar8 != (int *)0x0) && (iVar2 = *piVar8, *piVar8 = iVar2 + 1, iVar2 == 0x7fffffff)) {
                    /* WARNING: Does not return */
          pcVar1 = (code *)SoftwareBreakpoint(0,0x42a5ee4);
          (*pcVar1)();
        }
        goto LAB_042a5b60;
      }
      if (DAT_0eee6cf8 != 0) {
        if ((DAT_0ef008f8 == 0) && (FUN_02a79b5c(), DAT_0ef008f8 == 0)) {
          uVar6 = DAT_0ef008f8;
          FUN_00016cc0();
          if ((uVar6 & 1) == 0) {
                    /* WARNING: Does not return */
            pcVar1 = (code *)SoftwareBreakpoint(0,0x42a5f2c);
            (*pcVar1)();
          }
          if (DAT_0ef008f8 == 0) goto LAB_042a5d20;
        }
        uVar6 = DAT_0ef008f8;
        FUN_02cc1274();
        if (uVar6 != 0) {
          uVar10 = uVar6;
          FUN_042a3a04();
          lVar7 = *(long *)(param_1 + 400);
          *(ulong *)(param_1 + 400) = uVar10;
          if (lVar7 != 0) {
            FUN_0162db98();
            FUN_00008eb8();
            uVar10 = *(ulong *)(param_1 + 400);
          }
          piVar8 = *(int **)(param_1 + 0x420);
          if ((piVar8 != (int *)0x0) && (iVar2 = *piVar8, *piVar8 = iVar2 + 1, iVar2 == 0x7fffffff))
          {
                    /* WARNING: Does not return */
            pcVar1 = (code *)SoftwareBreakpoint(0,0x42a5f10);
            (*pcVar1)();
          }
          uVar9 = *(undefined8 *)(param_1 + 0x428);
          pqVar4 = &segment_command_00000020.vmsize;
          FUN_0000f368();
          *(undefined4 *)pqVar4 = 1;
          pqVar4[1] = (qword)&LAB_0406a1ac;
          pqVar4[2] = (qword)FUN_03f9e440;
          pqVar4[3] = (qword)&LAB_0406a280;
          pqVar4[4] = (qword)FUN_042ac274;
          pqVar4[5] = 0;
          pqVar4[6] = (qword)piVar8;
          pqVar4[7] = uVar9;
          lVar7 = *(long *)(uVar10 + 0x28);
          pcVar5 = section_00000068.segname;
          FUN_0000f368();
          if ((uVar10 & 0xfffffffc00000000) == DAT_0ebb2088) {
            FUN_000142fc(uVar10);
          }
          pcVar5[0x10] = lVar7 != 0;
          *(undefined ***)pcVar5 = &PTR_FUN_0e2fea50;
          *(ulong *)(pcVar5 + 8) = uVar10;
          *(undefined ***)(pcVar5 + 0x18) = &PTR_LAB_0e2feaa0;
          *(undefined8 *)(pcVar5 + 0x20) = 0x4000;
          pcVar5[0x28] = 0;
          pcVar5[0x40] = 0;
          *(qword **)(pcVar5 + 0x48) = pqVar4;
          uVar11 = *(undefined8 *)(uVar10 + 0x68);
          uVar9 = *(undefined8 *)(uVar10 + 0x60);
          *(undefined4 *)(pcVar5 + 0x60) = *(undefined4 *)(uVar10 + 0x70);
          *(undefined8 *)(pcVar5 + 0x58) = uVar11;
          *(undefined8 *)(pcVar5 + 0x50) = uVar9;
          *(undefined8 *)(pcVar5 + 0x68) = *(undefined8 *)(uVar10 + 0x78);
          *(undefined8 *)(pcVar5 + 0x70) = 0;
          plVar3 = *(long **)(uVar10 + 0xb0);
          *(char **)(uVar10 + 0xb0) = pcVar5;
          if (plVar3 != (long *)0x0) {
            (**(code **)(*plVar3 + 8))();
          }
          FUN_02195d00(uVar10,uVar6);
          return;
        }
      }
LAB_042a5d20:
      FUN_00050c80(auStack_170,"ScheduleStartupReadinessCheck",
                   "../../chrome/browser/component_updater/aside_component_update_service.cc",0x6ef)
      ;
      piVar8 = *(int **)(param_1 + 0x420);
      if ((piVar8 != (int *)0x0) && (iVar2 = *piVar8, *piVar8 = iVar2 + 1, iVar2 == 0x7fffffff)) {
                    /* WARNING: Does not return */
        pcVar1 = (code *)SoftwareBreakpoint(0,0x42a5ed8);
        (*pcVar1)();
      }
      goto LAB_042a5b60;
    }
  }
  else if (*(code **)(*plVar3 + 0x10) == (code *)&LAB_042c88ec) {
    if ((plVar3[4] == 0) || (*(int *)plVar3[3] == 1)) goto LAB_042a5ae4;
  }
  else {
    (**(code **)(*plVar3 + 0x10))();
    if (((ulong)plVar3 & 1) == 0) goto LAB_042a5ae4;
  }
LAB_042a5b28:
  FUN_00050c80(auStack_170,"ScheduleStartupReadinessCheck",
               "../../chrome/browser/component_updater/aside_component_update_service.cc",0x6ef);
  piVar8 = *(int **)(param_1 + 0x420);
  if ((piVar8 != (int *)0x0) && (iVar2 = *piVar8, *piVar8 = iVar2 + 1, iVar2 == 0x7fffffff)) {
                    /* WARNING: Does not return */
    pcVar1 = (code *)SoftwareBreakpoint(0,0x42a5ecc);
    (*pcVar1)();
  }
LAB_042a5b60:
  uVar9 = *(undefined8 *)(param_1 + 0x428);
  pqVar4 = &segment_command_00000020.vmsize;
  FUN_0000f368();
  *(undefined4 *)pqVar4 = 1;
  pqVar4[1] = (qword)&LAB_03fbb700;
  pqVar4[2] = (qword)FUN_03f9e440;
  pqVar4[3] = (qword)&LAB_0406a280;
  pqVar4[4] = (qword)FUN_042a5a28;
  pqVar4[5] = 0;
  pqVar4[6] = (qword)piVar8;
  pqVar4[7] = uVar9;
  FUN_004aa504(param_1 + 0x2b8,auStack_170,250000,pqVar4);
  return;
}


