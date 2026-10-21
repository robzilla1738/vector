// func FUN_041ef9b4 @ 041ef9b4 size 1616

long * FUN_041ef9b4(long *param_1,ulong param_2,ulong param_3)

{
  qword qVar1;
  long *plVar2;
  code *pcVar3;
  bool bVar4;
  bool bVar5;
  bool bVar6;
  bool bVar7;
  dword dVar8;
  qword *pqVar9;
  dword *pdVar10;
  long lVar11;
  long *plVar12;
  char *pcVar13;
  long *plVar14;
  long lVar15;
  ulong uVar16;
  qword *local_90;
  char local_88;
  long *local_80;
  long lStack_78;
  ulong local_70;
  
  *param_1 = (long)&PTR_LAB_0e5ff8d0;
  param_1[1] = (long)&PTR_LAB_0e5ffda8;
  param_1[2] = (long)&PTR_LAB_0e5ffdd0;
  param_1[0xd] = (long)&PTR_FUN_0e5ffe08;
  param_1[0xe] = (long)&PTR_LAB_0e5ffe38;
  param_1[0x16] = (long)&PTR_LAB_0e5ffe88;
  plVar14 = param_1 + 0x1b;
  *plVar14 = (long)&PTR_LAB_0e5ffee8;
  plVar12 = param_1 + 0x1f;
  *plVar12 = (long)&PTR_LAB_0e5fff18;
  param_1[0x62] = (long)&PTR_LAB_0e5fff40;
  param_1[99] = (long)&PTR_FUN_0e5fffc0;
  param_1[100] = (long)&PTR_FUN_0e600080;
  param_1[0x96] = (long)&PTR_LAB_0e6000b8;
  param_1[0x97] = (long)&PTR_LAB_0e600108;
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar9 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar9 = 1;
  pqVar9[1] = (qword)&LAB_03f6c9c0;
  pqVar9[2] = (qword)FUN_01ac4600;
  pqVar9[3] = (qword)FUN_0255db00;
  pqVar9[4] = (qword)FUN_07d80258;
  pqVar9[5] = 0;
  pqVar9[6] = (qword)param_1;
  local_88 = '\x01';
  local_90 = pqVar9;
  FUN_029745ac(param_1,&local_90,0,0,2);
  if ((local_88 != -1) && (local_90 != (qword *)0x0)) {
    LOAcquire();
    qVar1 = *local_90;
    *(int *)local_90 = (int)qVar1 + -1;
    LORelease();
    if ((int)qVar1 == 1) {
      (*(code *)local_90[2])();
    }
  }
  local_88 = 0xff;
  *param_1 = (long)&PTR_LAB_0e5ff8d0;
  param_1[1] = (long)&PTR_LAB_0e5ffda8;
  param_1[2] = (long)&PTR_LAB_0e5ffdd0;
  param_1[0xd] = (long)&PTR_FUN_0e5ffe08;
  param_1[0xe] = (long)&PTR_LAB_0e5ffe38;
  param_1[0x16] = (long)&PTR_LAB_0e5ffe88;
  param_1[0x1b] = (long)&PTR_LAB_0e5ffee8;
  param_1[0x1f] = (long)&PTR_LAB_0e5fff18;
  param_1[0x62] = (long)&PTR_LAB_0e5fff40;
  param_1[99] = (long)&PTR_FUN_0e5fffc0;
  param_1[100] = (long)&PTR_FUN_0e600080;
  param_1[0x96] = (long)&PTR_LAB_0e6000b8;
  param_1[0x97] = (long)&PTR_LAB_0e600108;
  param_1[0xc6] = 0;
  if ((param_2 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_2);
  }
  param_1[199] = param_2;
  if ((param_3 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_3);
  }
  param_1[200] = param_3;
  *(undefined1 *)(param_1 + 0xc9) = 0;
  *(undefined1 *)(param_1 + 0xce) = 0;
  *(undefined1 *)(param_1 + 0xd1) = 0;
  param_1[0xca] = 0;
  param_1[0xcc] = 0;
  param_1[0xcb] = 0;
  *(undefined1 *)(param_1 + 0xcd) = 0;
  pdVar10 = &MACH_HEADER.cpusubtype;
  FUN_0000f368();
  *pdVar10 = 0;
  *(undefined1 *)(pdVar10 + 1) = 0;
  if ((pdVar10 != (dword *)0x0) && (dVar8 = *pdVar10, *pdVar10 = dVar8 + 1, dVar8 == 0x7fffffff)) {
                    /* WARNING: Does not return */
    pcVar3 = (code *)SoftwareBreakpoint(0,0x41f0004);
    (*pcVar3)();
  }
  param_1[0xd2] = (long)pdVar10;
  param_1[0xd3] = (long)param_1;
  FUN_01aedf7c(param_1,0);
  if (*(char *)((long)param_1 + 0x46a) != '\0') {
    *(undefined1 *)((long)param_1 + 0x46a) = 0;
    FUN_00f27fd0(plVar12,(long)param_1 + 0x46a);
  }
  if ((*(byte *)((long)param_1 + 0x46b) & 1) == 0) {
    *(undefined1 *)((long)param_1 + 0x46b) = 1;
    FUN_00f27fd0(plVar12,(long)param_1 + 0x46b);
  }
  if ((int)param_1[0x2e] != 0x3f1) {
    *(undefined4 *)(param_1 + 0x2e) = 0x3f1;
    FUN_00f27fd0(plVar12,param_1 + 0x2e);
  }
  FUN_01c14c00(plVar14,&DAT_0ea05688,&PTR_s_kToolbarActionViewElementId_0ead34e8);
  lVar15 = param_1[199];
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar9 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar9 = 1;
  pqVar9[1] = (qword)&LAB_03f6c9c0;
  pqVar9[2] = (qword)FUN_01ac4600;
  pqVar9[3] = (qword)FUN_0255db00;
  pqVar9[4] = (qword)FUN_015dd0f4;
  pqVar9[5] = 0;
  pqVar9[6] = (qword)param_1;
  FUN_07c2b144(&local_80,lVar15,pqVar9);
  FUN_00846ad0(param_1 + 0xcc,&local_80);
  plVar2 = local_80;
  if (local_80 != (long *)0x0) {
    local_80 = (long *)0x0;
    (*(code *)plVar2[1])(plVar2);
    LOAcquire();
    lVar15 = *plVar2;
    *(int *)plVar2 = (int)lVar15 + -1;
    LORelease();
    if ((int)lVar15 == 1) {
      (*(code *)plVar2[2])(plVar2);
    }
    if (local_80 != (long *)0x0) {
      LOAcquire();
      lVar15 = *local_80;
      *(int *)local_80 = (int)lVar15 + -1;
      LORelease();
      if ((int)lVar15 == 1) {
        (*(code *)local_80[2])();
      }
    }
  }
  if (*(int *)((long)param_1 + 0x5f4) != 1) {
    *(undefined4 *)((long)param_1 + 0x5f4) = 1;
    FUN_007e1964(param_1,1);
    FUN_00f27fd0(plVar12,(long)param_1 + 0x5f4);
  }
  uVar16 = param_1[200];
  if ((uVar16 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(uVar16);
  }
  if ((param_1[0x57] & 0xfffffffc00000000U) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  param_1[0x57] = uVar16;
  *(undefined4 *)(param_1[0xc5] + 0x18) = 1;
  pdVar10 = &MACH_HEADER.ncmds;
  FUN_0000f368();
  *(undefined ***)pdVar10 = &PTR_LAB_0e228438;
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  *(long **)(pdVar10 + 2) = param_1;
  lVar15 = param_1[0xca];
  param_1[0xca] = (long)pdVar10;
  if (lVar15 != 0) {
    FUN_07d80c10();
  }
  lVar15 = 0x48;
  FUN_0000f368();
  FUN_07baeaf8();
  lVar11 = param_1[0xcb];
  param_1[0xcb] = lVar15;
  if (lVar11 != 0) {
    FUN_07baeb8c();
    FUN_00008eb8();
    lVar15 = param_1[0xcb];
  }
  FUN_01b8b0b8(param_1,lVar15);
  lVar15 = param_1[199];
  if (*(char *)(lVar15 + 0x37) < '\0') {
    FUN_00018218(&local_80,*(undefined8 *)(lVar15 + 0x20),*(undefined8 *)(lVar15 + 0x28));
  }
  else {
    lStack_78 = *(long *)(lVar15 + 0x28);
    local_80 = *(long **)(lVar15 + 0x20);
    local_70 = *(ulong *)(lVar15 + 0x30);
  }
  if (((long)local_70 < 0) && (lStack_78 == 0x20)) {
    bVar4 = *local_80 == s_fjdhphbdlfjogobdofoaagnlnkoibdge_0ce48949._0_8_;
    bVar5 = local_80[1] == s_fjdhphbdlfjogobdofoaagnlnkoibdge_0ce48949._8_8_;
    bVar6 = local_80[2] == s_fjdhphbdlfjogobdofoaagnlnkoibdge_0ce48949._16_8_;
    bVar7 = local_80[3] == s_fjdhphbdlfjogobdofoaagnlnkoibdge_0ce48949._24_8_;
    FUN_00008eb8(local_80,local_70 & 0x7fffffffffffffff);
    if (((bVar4 && bVar5) && bVar6) && bVar7) {
      if (*(int *)((long)param_1 + 0x5f4) != 1) {
        *(undefined4 *)((long)param_1 + 0x5f4) = 1;
        FUN_007e1964(param_1,1);
        FUN_00f27fd0(plVar12,(long)param_1 + 0x5f4);
      }
      if ((int)param_1[0xbe] != 0) {
        *(undefined4 *)(param_1 + 0xbe) = 0;
        FUN_007e1964(param_1,3);
        FUN_00f27fd0(plVar12,param_1 + 0xbe);
      }
      lStack_78 = 0x4479c0004479c000;
      local_80 = (long *)0x4479c0004479c000;
      FUN_02e6cd00(param_1,&local_80);
      plVar12 = param_1;
      FUN_041f000c(param_1);
      (**(code **)(*param_1 + 0x110))(param_1,plVar12);
      (**(code **)(*param_1 + 0x460))(param_1,L"Ask Aside",9);
      if (*(int *)(param_1[0x99] + 0x34c) != 0x101a) {
        *(undefined4 *)(param_1[0x99] + 0x34c) = 0x101a;
        FUN_02740540();
      }
      pcVar13 = segment_command_00000020.segname + 8;
      FUN_0000f368();
      *(qword *)(pcVar13 + 8) = 0;
      *(qword *)(pcVar13 + 0x10) = 0;
      *(undefined2 *)(pcVar13 + 0x18) = 0;
      *(undefined ***)pcVar13 = &PTR_FUN_0e34ed88;
      *(undefined8 *)(pcVar13 + 0x24) = 0x4479c0004479c000;
      *(undefined8 *)(pcVar13 + 0x1c) = 0x4479c0004479c000;
      FUN_00b6a19c(plVar14,&DAT_0ea05528,"kHighlightPathGeneratorKey",FUN_02e6cf00,pcVar13,0);
      if (plVar14 != (long *)0x0) {
        FUN_02e6cf00();
      }
    }
  }
  else if ((long)local_70 < 0) {
    FUN_00008eb8(local_80,local_70 & 0x7fffffffffffffff);
  }
  FUN_015dd0f4(param_1);
  return param_1;
}


