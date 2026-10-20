// func FUN_042a155c @ 042a155c size 1120

undefined8 FUN_042a155c(long param_1,int *param_2)

{
  long lVar1;
  byte bVar2;
  bool bVar3;
  int iVar4;
  ulong uVar5;
  cfstringStruct *pcVar6;
  cfstringStruct *pcVar7;
  cfstringStruct *pcVar8;
  long *plVar9;
  char *pcVar10;
  long lVar11;
  long lVar12;
  code *pcVar13;
  undefined8 uVar14;
  qword **local_70;
  int **ppiStack_68;
  long local_60;
  int *local_50;
  qword *local_48;
  
  uVar5 = DAT_0ef08030;
  FUN_001f557c(DAT_0ef08030,"test-type");
  if ((uVar5 & 1) != 0) {
LAB_042a15dc:
    if (param_2 != (int *)0x0) {
      LOAcquire();
      iVar4 = *param_2;
      *param_2 = iVar4 + -1;
      LORelease();
      if (iVar4 == 1) {
        (**(code **)(param_2 + 4))(param_2);
      }
    }
    return 0;
  }
  pcVar6 = &cf_disableBundledAsideComponent;
  _CFPreferencesCopyAppValue(&cf_disableBundledAsideComponent,&cf_at_studio_AsideBrowser);
  if (pcVar6 != (cfstringStruct *)0x0) {
    pcVar7 = pcVar6;
    _CFGetTypeID();
    pcVar8 = pcVar7;
    _CFBooleanGetTypeID();
    if (pcVar7 == pcVar8) {
      pcVar7 = pcVar6;
      _CFBooleanGetValue();
      _CFRelease(pcVar6);
      if ((int)pcVar7 != 0) goto LAB_042a15dc;
    }
    else {
      _CFRelease(pcVar6);
    }
  }
  if ((DAT_0ef06190 & 1) == 0) {
    iVar4 = 0xef06190;
    thunk_FUN_0cb3562c();
    if (iVar4 != 0) {
      DAT_0ef06188 = 0;
      DAT_0ef06190 = 1;
      iVar4 = _pthread_mutex_lock((pthread_mutex_t *)&DAT_0eceb9f0);
      bVar2 = DAT_0ef06191;
      if (iVar4 != 0) {
                    /* WARNING: Subroutine does not return */
        thunk_FUN_0cb335c4("%s failed to acquire mutex");
      }
      DAT_0ef06191 = 1;
      iVar4 = _pthread_mutex_unlock((pthread_mutex_t *)&DAT_0eceb9f0);
      if (iVar4 != 0) {
                    /* WARNING: Subroutine does not return */
        thunk_FUN_0cb335c4("%s failed to release mutex");
      }
      if (((bVar2 >> 2 & 1) != 0) &&
         (iVar4 = _pthread_cond_broadcast((pthread_cond_t *)&DAT_0eceba30), iVar4 != 0)) {
                    /* WARNING: Subroutine does not return */
        thunk_FUN_0cb335c4("%s failed to broadcast");
      }
    }
  }
  lVar1 = DAT_0ef06188;
  if (DAT_0ef06188 == 0) goto LAB_042a15dc;
  local_50 = param_2;
  if ((*(byte *)(DAT_0ef06188 + 0x49) & 1) != 0) {
    uVar14 = 0;
    goto joined_r0x042a16e0;
  }
  uVar5 = DAT_0ef08030;
  FUN_001f557c(DAT_0ef08030,"test-type");
  if ((uVar5 & 1) == 0) {
    pcVar6 = &cf_disableBundledAsideComponent;
    _CFPreferencesCopyAppValue(&cf_disableBundledAsideComponent,&cf_at_studio_AsideBrowser);
    if (pcVar6 == (cfstringStruct *)0x0) {
      bVar3 = false;
    }
    else {
      pcVar7 = pcVar6;
      _CFGetTypeID();
      pcVar8 = pcVar7;
      _CFBooleanGetTypeID();
      if (pcVar7 == pcVar8) {
        pcVar7 = pcVar6;
        _CFBooleanGetValue();
        bVar3 = (int)pcVar7 != 0;
      }
      else {
        bVar3 = false;
      }
      _CFRelease(pcVar6);
    }
    uVar14 = 0;
    if ((param_1 == 0) || (bVar3)) goto joined_r0x042a16e0;
    lVar12 = param_1;
    FUN_00f15110();
    if ((int)lVar12 != 0) {
      iVar4 = *(int *)(lVar1 + 0x390);
      if (iVar4 < 2) {
        if (iVar4 == 0) {
          *(undefined4 *)(lVar1 + 0x390) = 1;
          lVar11 = lVar1;
          FUN_042ac4bc(lVar1,param_1);
          (*(code *)PTR_FUN_0ebb1d18)();
          lVar12 = 0x7fffffffffffffff;
          if (!SCARRY8(lVar11,10000000)) {
            lVar12 = lVar11 + 10000000;
          }
          *(long *)(lVar1 + 0x388) = lVar12;
        }
        else if ((iVar4 == 1) &&
                (((*(long *)(lVar1 + 0x398) == 0 ||
                  (*(char *)(*(long *)(lVar1 + 0x398) + 4) != '\0')) ||
                 (*(long *)(lVar1 + 0x3a0) == 0)))) {
          FUN_042ac4bc(lVar1,param_1);
        }
      }
      else {
        if (iVar4 == 2) goto LAB_042a16d8;
        if (iVar4 == 3) {
          uVar14 = 1;
          if (param_2 != (int *)0x0) {
            plVar9 = (long *)&DAT_0cf0cb50;
            FUN_00bdc494();
            FUN_00050c80(&local_70,"RequestStartupReadinessGate",
                         "../../chrome/browser/component_updater/aside_component_update_service.cc",
                         0x32a);
            pcVar10 = segment_command_00000020.segname + 8;
            FUN_0000f368();
            pcVar10[0] = '\x01';
            pcVar10[1] = '\0';
            pcVar10[2] = '\0';
            pcVar10[3] = '\0';
            *(code **)(pcVar10 + 8) = FUN_03f72990;
            *(code **)(pcVar10 + 0x10) = FUN_03895c10;
            *(undefined1 **)(pcVar10 + 0x18) = &LAB_03f72a00;
            *(int **)(pcVar10 + 0x20) = param_2;
            local_50 = (int *)0x0;
            pcVar10[0x28] = 0;
            (**(code **)*plVar9)(plVar9,&local_70,pcVar10,0);
            if (plVar9 != (long *)0x0) {
              LOAcquire();
              iVar4 = (int)plVar9[1];
              *(int *)(plVar9 + 1) = iVar4 + -1;
              LORelease();
              if (iVar4 == 1) {
                pcVar13 = *(code **)(*plVar9 + 0x18);
                if (pcVar13 == (code *)&LAB_042caa8c) {
                  pcVar13 = *(code **)(*plVar9 + 0x10);
                }
                (*pcVar13)(plVar9);
              }
            }
          }
          goto joined_r0x042a16e0;
        }
      }
      if (param_2 != (int *)0x0) {
        local_60 = lVar1 + 0x3c0;
        local_48 = (qword *)(*(long *)(lVar1 + 0x3c0) + *(long *)(lVar1 + 0x3c8) * 8);
        local_70 = &local_48;
        ppiStack_68 = &local_50;
        if (*(long *)(lVar1 + 0x3c8) == *(long *)(lVar1 + 0x3d0)) {
          FUN_02d21900(&local_70);
        }
        else {
          if (local_48 == (qword *)0x0) goto LAB_042a1988;
          *local_48 = (qword)param_2;
          local_50 = (int *)0x0;
          local_48 = local_48 + 1;
        }
        lVar12 = (long)local_48 - *(long *)(lVar1 + 0x3c0);
        *(long *)(lVar1 + 0x3c8) = lVar12 >> 3;
        if (lVar12 == 0) {
LAB_042a1988:
                    /* WARNING: Does not return */
          pcVar13 = (code *)SoftwareBreakpoint(1,0x42a198c);
          (*pcVar13)();
        }
      }
      FUN_042a430c(lVar1);
      FUN_042a4148(lVar1,param_1);
      if ((*(byte *)(lVar1 + 0x3a9) & 1) == 0) {
        lVar12 = (long)*(char *)(lVar1 + 199);
        if (lVar12 < 0) {
          lVar12 = *(long *)(lVar1 + 0xb8);
        }
        if (lVar12 != 0) {
          *(undefined1 *)(lVar1 + 0x3a9) = 1;
          FUN_042a6c10(lVar1);
        }
      }
      FUN_042a5a28(lVar1);
      uVar14 = 1;
      goto joined_r0x042a16e0;
    }
  }
LAB_042a16d8:
  uVar14 = 0;
joined_r0x042a16e0:
  if (local_50 == (int *)0x0) {
    return uVar14;
  }
  LOAcquire();
  iVar4 = *local_50;
  *local_50 = iVar4 + -1;
  LORelease();
  if (iVar4 != 1) {
    return uVar14;
  }
  (**(code **)(local_50 + 4))(local_50);
  return uVar14;
}


