// func FUN_04258c80 @ 04258c80 size 932

/* WARNING: Function: _objc_loadWeakRetained replaced with injection: _objc_load_fixup */
/* WARNING: Function: _objc_storeWeak replaced with injection: _objc_store_fixup */
/* WARNING: Function: _objc_release replaced with injection: _objc_release_fixup */

void FUN_04258c80(long *param_1)

{
  long lVar1;
  char *pcVar2;
  code *pcVar3;
  int iVar4;
  dword *pdVar5;
  undefined **ppuVar6;
  qword *pqVar7;
  dword *pdVar8;
  int extraout_w8;
  int *piVar9;
  undefined8 *puVar10;
  undefined8 uVar11;
  long lVar12;
  char *local_80;
  long lStack_78;
  long local_60;
  long lStack_58;
  ulong local_50;
  char local_41;
  
  if (*(char *)((long)param_1 + 0x11) == '\0') {
    return;
  }
  if (*(char *)((long)param_1 + 0x12) == '\0') {
    return;
  }
  *(undefined1 *)(param_1 + 2) = 0;
  piVar9 = (int *)param_1[0xf];
  if (piVar9 != (int *)0x0) {
    param_1[0xf] = 0;
    (**(code **)(piVar9 + 2))(piVar9,1);
    LOAcquire();
    iVar4 = *piVar9;
    *piVar9 = iVar4 + -1;
    LORelease();
    if (iVar4 == 1) {
      (**(code **)(piVar9 + 4))(piVar9);
    }
  }
  if (*(char *)((long)param_1 + 0x13) == '\0') {
    return;
  }
  local_60 = 0;
  lStack_58 = 0;
  local_50 = 0;
  if (*(char *)((long)param_1 + 0x37) < '\0') {
    FUN_00018218(&local_60,param_1[4],param_1[5]);
  }
  else {
    lStack_58 = param_1[5];
    local_60 = param_1[4];
    local_50 = param_1[6];
  }
  pdVar5 = &MACH_HEADER.cpusubtype;
  FUN_0000f368();
  *(undefined8 *)pdVar5 = 0;
  if (((*param_1 != 0) && (*(char *)(*param_1 + 4) == '\0')) && (param_1[1] != 0)) {
    uVar11 = *(undefined8 *)(*(long *)(DAT_0eee6cf8 + 0x290) + 8);
    if ((*param_1 == 0) || (*(char *)(*param_1 + 4) != '\0')) {
      lVar12 = 0;
    }
    else {
      lVar12 = param_1[1];
    }
    FUN_005a04f4();
    if ((lVar12 != 0) && ((*(long *)(lVar12 + 0x50) != 0 || (*(long *)(lVar12 + 0x48) != 0)))) {
      lVar1 = 0x48;
      if (*(long *)(lVar12 + 0x50) != 0) {
        lVar1 = 0x50;
      }
      lVar12 = *(long *)(*(long *)(*(long *)(lVar12 + lVar1) + 0x10) + 8);
      if (lVar12 != 0) {
        lStack_78 = lVar12 + 0x28;
        local_41 = '\0';
        local_80 = &local_41;
        FUN_00db1870(uVar11,&local_80,&LAB_00db1b70,0,0);
        if ((local_41 != '\0') && (*(long **)(lVar12 + 0x78) != (long *)0x0)) {
          (**(code **)(**(long **)(lVar12 + 0x78) + 0x20))(&local_80);
          lVar12 = lStack_78;
          pcVar2 = local_80;
          *(undefined8 *)pdVar5 = *(undefined8 *)local_80;
          local_80 = (char *)0x0;
          if (pcVar2 != (char *)0x0) {
            _objc_destroyWeak(pcVar2);
            FUN_00008eb8(pcVar2,8);
          }
          goto LAB_04258d34;
        }
      }
    }
  }
  lVar12 = 0;
LAB_04258d34:
  ppuVar6 = &PTR___tlv_bootstrap_0ed03d68;
  (*(code *)PTR___tlv_bootstrap_0ed03d68)(*(undefined4 *)((long)param_1 + 0x1c));
  if (((undefined8 *)*ppuVar6 != (undefined8 *)0x0) &&
     (puVar10 = *(undefined8 **)*ppuVar6, puVar10 != (undefined8 *)0x0)) {
    if (extraout_w8 == 1) {
      FUN_00050c80(&local_80,"MaybeSwitchToTargetProfile",
                   "../../chrome/browser/ui/webui/aside_importer/chromium_profile_migrator.cc",0x97a
                  );
      pqVar7 = &segment_command_00000020.vmsize;
      FUN_0000f368();
      *(undefined4 *)pqVar7 = 1;
      pqVar7[1] = (qword)FUN_0425f8e8;
      pqVar7[2] = (qword)FUN_0425f98c;
      pqVar7[3] = (qword)FUN_0255db00;
      pqVar7[4] = (qword)FUN_0425902c;
      *(int *)(pqVar7 + 5) = (int)param_1[3];
      pdVar8 = &MACH_HEADER.cpusubtype;
      FUN_0000f368();
      *(undefined8 *)pdVar8 = 0;
      pqVar7[6] = (qword)pdVar8;
      *(undefined8 *)pdVar8 = *(undefined8 *)pdVar5;
      pqVar7[7] = lVar12;
    }
    else {
      FUN_00050c80(&local_80,"MaybeSwitchToTargetProfile",
                   "../../chrome/browser/ui/webui/aside_importer/chromium_profile_migrator.cc",0x97e
                  );
      pqVar7 = (qword *)&segment_command_00000020.maxprot;
      FUN_0000f368();
      *(undefined4 *)pqVar7 = 1;
      pqVar7[1] = (qword)FUN_0425f9d8;
      pqVar7[2] = (qword)FUN_0425fa80;
      pqVar7[3] = (qword)FUN_0255db00;
      pqVar7[4] = (qword)FUN_04259100;
      *(int *)(pqVar7 + 5) = (int)param_1[3];
      pdVar8 = &MACH_HEADER.cpusubtype;
      FUN_0000f368();
      *(undefined8 *)pdVar8 = 0;
      pqVar7[6] = (qword)pdVar8;
      *(undefined8 *)pdVar8 = *(undefined8 *)pdVar5;
      pqVar7[7] = lVar12;
      if ((long)local_50 < 0) {
        FUN_00018218(pqVar7 + 8,local_60,lStack_58);
      }
      else {
        pqVar7[9] = lStack_58;
        pqVar7[8] = local_60;
        pqVar7[10] = local_50;
      }
    }
    (**(code **)*puVar10)(puVar10,&local_80,pqVar7,0);
    if (pdVar5 != (dword *)0x0) {
      _objc_destroyWeak(pdVar5);
      FUN_00008eb8(pdVar5,8);
    }
    if ((long)local_50 < 0) {
      FUN_00008eb8(local_60,local_50 & 0x7fffffffffffffff);
    }
    return;
  }
                    /* WARNING: Does not return */
  pcVar3 = (code *)SoftwareBreakpoint(0,0x4259024);
  (*pcVar3)();
}


