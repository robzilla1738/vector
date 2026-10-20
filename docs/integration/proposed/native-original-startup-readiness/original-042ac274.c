// func FUN_042ac274 @ 042ac274 size 576

void FUN_042ac274(long param_1,undefined8 param_2)

{
  undefined1 **ppuVar1;
  code *pcVar2;
  int iVar3;
  qword *pqVar4;
  long lVar5;
  int *piVar6;
  undefined1 *puVar7;
  undefined8 uVar8;
  undefined4 uVar9;
  undefined1 *local_170;
  long lStack_168;
  undefined7 local_160;
  char cStack_159;
  
  if (*(long *)(param_1 + 400) == 0) {
    puVar7 = (undefined1 *)0xfffffffe;
    uVar9 = 500;
  }
  else {
    lVar5 = *(long *)(*(long *)(param_1 + 400) + 0x120);
    puVar7 = (undefined1 *)(ulong)*(uint *)(lVar5 + 0x14);
    lVar5 = *(long *)(lVar5 + 0x20);
    if ((lVar5 == 0) || (lVar5 = *(long *)(lVar5 + 0x18), lVar5 == 0)) {
      uVar9 = 500;
    }
    else {
      uVar9 = *(undefined4 *)(lVar5 + 0x38);
    }
    *(undefined8 *)(param_1 + 400) = 0;
    FUN_0162db98();
    FUN_00008eb8();
  }
  if (*(int *)(param_1 + 0x390) == 1) {
    FUN_02029fe0(&local_170,param_1 + 0x98);
    ppuVar1 = (undefined1 **)local_170;
    if (-1 < (long)cStack_159) {
      ppuVar1 = &local_170;
    }
    if (-1 < cStack_159) {
      lStack_168 = (long)cStack_159;
    }
    FUN_042ad2ec(puVar7,uVar9,param_2,ppuVar1,lStack_168);
    iVar3 = (int)puVar7;
    if (cStack_159 < '\0') {
      FUN_00008eb8(local_170,CONCAT17(cStack_159,local_160) & 0x7fffffffffffffff);
      puVar7 = local_170;
    }
    if (iVar3 == 0) {
      (*(code *)PTR_FUN_0ebb1d18)();
      if ((long)puVar7 < *(long *)(param_1 + 0x388)) {
        FUN_00050c80(&local_170,"ScheduleStartupReadinessCheck",
                     "../../chrome/browser/component_updater/aside_component_update_service.cc",
                     0x6ef);
        piVar6 = *(int **)(param_1 + 0x420);
        if ((piVar6 != (int *)0x0) && (iVar3 = *piVar6, *piVar6 = iVar3 + 1, iVar3 == 0x7fffffff)) {
                    /* WARNING: Does not return */
          pcVar2 = (code *)SoftwareBreakpoint(0,0x42ac4b4);
          (*pcVar2)();
        }
        uVar8 = *(undefined8 *)(param_1 + 0x428);
        pqVar4 = &segment_command_00000020.vmsize;
        FUN_0000f368();
        *(undefined4 *)pqVar4 = 1;
        pqVar4[1] = (qword)&LAB_03fbb700;
        pqVar4[2] = (qword)FUN_03f9e440;
        pqVar4[3] = (qword)&LAB_0406a280;
        pqVar4[4] = (qword)FUN_042a5a28;
        pqVar4[5] = 0;
        pqVar4[6] = (qword)piVar6;
        pqVar4[7] = uVar8;
        FUN_004aa504(param_1 + 0x2b8,&local_170,250000,pqVar4);
      }
      else {
        lVar5 = param_1;
        FUN_042abc18();
        if ((int)lVar5 == 0) {
          FUN_042ac060(param_1);
        }
        else {
          if ((DAT_0ef080b0 < 2) && ((DAT_0ebb1b88 != 0 || (DAT_0ef080b8 != 0)))) {
            FUN_0060914c(&local_170,
                         "../../chrome/browser/component_updater/aside_component_update_service.cc",
                         0x72e,1);
            FUN_000254bc(&local_160,
                         "Aside Daemon did not become healthy before the startup readiness timeout; continuing browser startup because Aside extensions are ready"
                         ,0x87);
            FUN_00609080(&local_170);
          }
          FUN_042adc74("Aside Daemon did not become healthy before the startup readiness timeout; continuing browser startup because Aside extensions are ready"
                       ,0x87);
          FUN_042abe9c(param_1);
        }
      }
    }
    else {
      *(undefined1 *)(param_1 + 0x3a8) = 1;
      FUN_042a5a28(param_1);
    }
  }
  return;
}


