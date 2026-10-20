// func FUN_042a111c @ 042a111c size 1072

undefined8 FUN_042a111c(long param_1,int *param_2)

{
  byte bVar1;
  bool bVar2;
  int iVar3;
  ulong uVar4;
  cfstringStruct *pcVar5;
  cfstringStruct *pcVar6;
  cfstringStruct *pcVar7;
  ulong uVar8;
  long lVar9;
  long *plVar10;
  char *pcVar11;
  code *pcVar12;
  int *local_80;
  undefined8 uStack_78;
  int *local_70;
  undefined8 **local_68;
  int **ppiStack_60;
  long local_58;
  undefined8 *local_48;
  
  uVar4 = DAT_0ef08030;
  FUN_001f557c(DAT_0ef08030,"test-type");
  if ((uVar4 & 1) != 0) {
LAB_042a1288:
    if (param_2 != (int *)0x0) {
      LOAcquire();
      iVar3 = *param_2;
      *param_2 = iVar3 + -1;
      LORelease();
      if (iVar3 == 1) {
        (**(code **)(param_2 + 4))(param_2);
      }
    }
    return 0;
  }
  pcVar5 = &cf_disableBundledAsideComponent;
  _CFPreferencesCopyAppValue(&cf_disableBundledAsideComponent,&cf_at_studio_AsideBrowser);
  if (pcVar5 != (cfstringStruct *)0x0) {
    pcVar6 = pcVar5;
    _CFGetTypeID();
    pcVar7 = pcVar6;
    _CFBooleanGetTypeID();
    if (pcVar6 == pcVar7) {
      pcVar6 = pcVar5;
      _CFBooleanGetValue();
      _CFRelease(pcVar5);
      if ((int)pcVar6 != 0) goto LAB_042a1288;
    }
    else {
      _CFRelease(pcVar5);
    }
  }
  if ((DAT_0ef06190 & 1) == 0) {
    iVar3 = 0xef06190;
    thunk_FUN_0cb3562c();
    if (iVar3 != 0) {
      DAT_0ef06188 = 0;
      DAT_0ef06190 = 1;
      iVar3 = _pthread_mutex_lock((pthread_mutex_t *)&DAT_0eceb9f0);
      bVar1 = DAT_0ef06191;
      if (iVar3 != 0) {
                    /* WARNING: Subroutine does not return */
        thunk_FUN_0cb335c4("%s failed to acquire mutex");
      }
      DAT_0ef06191 = 1;
      iVar3 = _pthread_mutex_unlock((pthread_mutex_t *)&DAT_0eceb9f0);
      if (iVar3 != 0) {
                    /* WARNING: Subroutine does not return */
        thunk_FUN_0cb335c4("%s failed to release mutex");
      }
      if (((bVar1 >> 2 & 1) != 0) &&
         (iVar3 = _pthread_cond_broadcast((pthread_cond_t *)&DAT_0eceba30), iVar3 != 0)) {
                    /* WARNING: Subroutine does not return */
        thunk_FUN_0cb335c4("%s failed to broadcast");
      }
    }
  }
  if ((((DAT_0ef06188 == 0) && (FUN_042a0360(), DAT_0ef06188 == 0)) ||
      (uVar4 = DAT_0ef06188, (*(byte *)(DAT_0ef06188 + 0x49) & 1) != 0)) ||
     (uVar8 = DAT_0ef08030, FUN_001f557c(DAT_0ef08030,"test-type"), (uVar8 & 1) != 0))
  goto LAB_042a1288;
  pcVar5 = &cf_disableBundledAsideComponent;
  _CFPreferencesCopyAppValue(&cf_disableBundledAsideComponent,&cf_at_studio_AsideBrowser);
  if (pcVar5 == (cfstringStruct *)0x0) {
    bVar2 = false;
  }
  else {
    pcVar6 = pcVar5;
    _CFGetTypeID();
    pcVar7 = pcVar6;
    _CFBooleanGetTypeID();
    if (pcVar6 == pcVar7) {
      pcVar6 = pcVar5;
      _CFBooleanGetValue();
      bVar2 = (int)pcVar6 != 0;
    }
    else {
      bVar2 = false;
    }
    _CFRelease(pcVar5);
  }
  if (((param_1 == 0) || (bVar2)) || (lVar9 = param_1, FUN_00f15110(), (int)lVar9 == 0))
  goto LAB_042a1288;
  FUN_042a430c(uVar4);
  FUN_042a4148(uVar4,param_1);
  uVar8 = uVar4;
  FUN_042a6f58(uVar4,param_1);
  if ((uVar8 & 1) != 0) goto LAB_042a1288;
  if (*(char *)(uVar4 + 0x3ac) != '\0') {
    if (param_2 == (int *)0x0) {
      return 1;
    }
    plVar10 = (long *)&DAT_0cf0cb48;
    FUN_00bdc494();
    FUN_00050c80(&local_68,"RequestComponentReadinessGate",
                 "../../chrome/browser/component_updater/aside_component_update_service.cc",0x2e2);
    pcVar11 = segment_command_00000020.segname + 8;
    FUN_0000f368();
    pcVar11[0] = '\x01';
    pcVar11[1] = '\0';
    pcVar11[2] = '\0';
    pcVar11[3] = '\0';
    *(code **)(pcVar11 + 8) = FUN_03f72990;
    *(code **)(pcVar11 + 0x10) = FUN_03895c10;
    *(undefined1 **)(pcVar11 + 0x18) = &LAB_03f72a00;
    *(int **)(pcVar11 + 0x20) = param_2;
    pcVar11[0x28] = 0;
    (**(code **)*plVar10)(plVar10,&local_68,pcVar11,0);
    if (plVar10 == (long *)0x0) {
      return 1;
    }
    LOAcquire();
    iVar3 = (int)plVar10[1];
    *(int *)(plVar10 + 1) = iVar3 + -1;
    LORelease();
    if (iVar3 != 1) {
      return 1;
    }
    pcVar12 = *(code **)(*plVar10 + 0x18);
    if (pcVar12 == (code *)&LAB_042caa8c) {
      pcVar12 = *(code **)(*plVar10 + 0x10);
    }
    (*pcVar12)(plVar10);
    return 1;
  }
  local_80 = *(int **)(param_1 + 0xc0);
  if ((local_80 != (int *)0x0) && (iVar3 = *local_80, *local_80 = iVar3 + 1, iVar3 == 0x7fffffff)) {
                    /* WARNING: Does not return */
    pcVar12 = (code *)SoftwareBreakpoint(0,0x42a151c);
    (*pcVar12)();
  }
  local_58 = uVar4 + 0x3d8;
  uStack_78 = *(undefined8 *)(param_1 + 200);
  local_48 = (undefined8 *)(*(long *)(uVar4 + 0x3d8) + *(long *)(uVar4 + 0x3e0) * 0x18);
  local_68 = &local_48;
  ppiStack_60 = &local_80;
  local_70 = param_2;
  if (*(long *)(uVar4 + 0x3e0) == *(long *)(uVar4 + 1000)) {
    FUN_042a7360(&local_68);
  }
  else {
    if (local_48 == (undefined8 *)0x0) goto LAB_042a1490;
    *local_48 = local_80;
    local_80 = (int *)0x0;
    local_48[1] = uStack_78;
    local_48[2] = param_2;
    local_70 = (int *)0x0;
    local_48 = local_48 + 3;
  }
  lVar9 = (long)local_48 - *(long *)(uVar4 + 0x3d8);
  *(long *)(uVar4 + 0x3e0) = (lVar9 >> 3) * -0x5555555555555555;
  if (lVar9 != 0) {
    if (local_70 != (int *)0x0) {
      LOAcquire();
      iVar3 = *local_70;
      *local_70 = iVar3 + -1;
      LORelease();
      if (iVar3 == 1) {
        (**(code **)(local_70 + 4))();
      }
    }
    if (local_80 != (int *)0x0) {
      LOAcquire();
      iVar3 = *local_80;
      *local_80 = iVar3 + -1;
      LORelease();
      if (iVar3 == 1) {
        FUN_00008eb8(local_80,8);
      }
    }
    FUN_042adc74("Deferring browser launch until all bundled Aside components are ready",0x45);
    FUN_042a61ac(uVar4);
    return 1;
  }
LAB_042a1490:
                    /* WARNING: Does not return */
  pcVar12 = (code *)SoftwareBreakpoint(1,0x42a1494);
  (*pcVar12)();
}


