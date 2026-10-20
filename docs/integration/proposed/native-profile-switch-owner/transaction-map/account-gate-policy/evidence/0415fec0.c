// func FUN_0415fec0 @ 0415fec0 size 1016

void FUN_0415fec0(long param_1)

{
  int iVar1;
  long lVar2;
  long *plVar3;
  qword *pqVar4;
  undefined **ppuVar5;
  char *pcVar6;
  dword *pdVar7;
  code *pcVar8;
  long *plVar9;
  int *piVar10;
  long lVar11;
  undefined8 uVar12;
  ulong uVar13;
  ulong uVar14;
  qword local_a0;
  qword qStack_98;
  undefined4 local_90;
  qword local_88;
  undefined1 auStack_80 [32];
  
  if (*(char *)(param_1 + 0x87) < '\0') {
    if (*(long *)(param_1 + 0x78) == 0) {
      return;
    }
  }
  else if (*(char *)(param_1 + 0x87) == '\0') {
    return;
  }
  plVar9 = (long *)(param_1 + 0x88);
  if (*plVar9 == 0) {
    lVar2 = 0x20;
    FUN_0000f368();
    lVar11 = lVar2;
    FUN_00cdf6c0();
    if ((lVar11 != 0) &&
       (iVar1 = *(int *)(lVar2 + 8), *(int *)(lVar2 + 8) = iVar1 + 1, iVar1 == 0x7fffffff)) {
                    /* WARNING: Does not return */
      pcVar8 = (code *)SoftwareBreakpoint(0,0x41602e0);
      (*pcVar8)();
    }
    FUN_07af9ebc(plVar9);
    plVar3 = *(long **)(param_1 + 0x98);
    *(long *)(param_1 + 0x98) = lVar2;
    if (plVar3 != (long *)0x0) {
      LOAcquire();
      iVar1 = (int)plVar3[1];
      *(int *)(plVar3 + 1) = iVar1 + -1;
      LORelease();
      if (iVar1 == 1) {
        pcVar8 = *(code **)(*plVar3 + 0x18);
        if (pcVar8 == (code *)&LAB_042caa8c) {
          pcVar8 = *(code **)(*plVar3 + 0x10);
        }
        (*pcVar8)();
      }
    }
    FUN_04162520(plVar9,*(undefined8 *)(param_1 + 0x98));
    FUN_00050c80(auStack_80,"StartWatchingAccountsState",
                 "../../chrome/browser/signin/aside_profile_attributes_updater.cc",0x1ae);
    uVar14 = (ulong)plVar9 & 0xfffffffc00000000;
    if (uVar14 == DAT_0ebb2088) {
      FUN_000142fc(plVar9);
    }
    uVar13 = (ulong)auStack_80 & 0xfffffffc00000000;
    if (uVar13 == DAT_0ebb2088) {
      FUN_000142fc(auStack_80);
    }
    piVar10 = *(int **)(param_1 + 0xc0);
    if ((piVar10 != (int *)0x0) && (iVar1 = *piVar10, *piVar10 = iVar1 + 1, iVar1 == 0x7fffffff)) {
                    /* WARNING: Does not return */
      pcVar8 = (code *)SoftwareBreakpoint(0,0x41602c8);
      (*pcVar8)();
    }
    uVar12 = *(undefined8 *)(param_1 + 200);
    pqVar4 = &segment_command_00000020.vmsize;
    FUN_0000f368();
    *(undefined4 *)pqVar4 = 1;
    pqVar4[1] = (qword)&LAB_03fbb7c0;
    pqVar4[2] = (qword)FUN_03f9e440;
    pqVar4[3] = (qword)&LAB_0406a280;
    pqVar4[4] = (qword)FUN_041602e8;
    pqVar4[5] = 0;
    pqVar4[6] = (qword)piVar10;
    pqVar4[7] = uVar12;
    FUN_00050c80(&local_a0,"StartWatchingAccountsState",
                 "../../chrome/browser/signin/aside_profile_attributes_updater.cc",0x1b1);
    ppuVar5 = &PTR___tlv_bootstrap_0ed03d68;
    (*(code *)PTR___tlv_bootstrap_0ed03d68)();
    if (((long *)*ppuVar5 == (long *)0x0) || (lVar11 = *(long *)*ppuVar5, lVar11 == 0)) {
                    /* WARNING: Does not return */
      pcVar8 = (code *)SoftwareBreakpoint(0,0x41602a4);
      (*pcVar8)();
    }
    iVar1 = *(int *)(lVar11 + 8);
    *(int *)(lVar11 + 8) = iVar1 + 1;
    if (iVar1 == 0x7fffffff) {
                    /* WARNING: Does not return */
      pcVar8 = (code *)SoftwareBreakpoint(0,0x41602b0);
      (*pcVar8)();
    }
    pcVar6 = segment_command_00000020.segname + 8;
    FUN_0000f368();
    *(long *)pcVar6 = lVar11;
    *(qword *)(pcVar6 + 0x10) = qStack_98;
    *(qword *)(pcVar6 + 8) = local_a0;
    *(undefined4 *)(pcVar6 + 0x18) = local_90;
    *(qword *)(pcVar6 + 0x20) = local_88;
    *(qword **)(pcVar6 + 0x28) = pqVar4;
    if (pqVar4 == (qword *)0x0) {
                    /* WARNING: Does not return */
      pcVar8 = (code *)SoftwareBreakpoint(0,0x41602bc);
      (*pcVar8)();
    }
    pqVar4 = &segment_command_00000020.vmaddr;
    FUN_0000f368();
    *(undefined4 *)pqVar4 = 1;
    pqVar4[1] = (qword)&LAB_03fa3ac0;
    pqVar4[2] = (qword)FUN_041627ac;
    pqVar4[3] = (qword)FUN_0255db00;
    pqVar4[4] = (qword)FUN_041626ac;
    pqVar4[5] = 0;
    pqVar4[6] = (qword)pcVar6;
    if (uVar14 == DAT_0ebb2088) {
      FUN_00022a3c(plVar9);
    }
    plVar3 = plVar9;
    FUN_066b1140();
    pdVar7 = &segment_command_00000020.nsects;
    FUN_0000f368();
    *pdVar7 = 1;
    *(undefined1 **)(pdVar7 + 2) = &LAB_07af9f30;
    *(undefined **)(pdVar7 + 4) = &DAT_07af9f90;
    *(code **)(pdVar7 + 6) = FUN_0255db00;
    *(code **)(pdVar7 + 8) = FUN_042d23a0;
    *(undefined8 *)(pdVar7 + 10) = 0;
    *(long **)(pdVar7 + 0xc) = plVar3;
    if (*(char *)(param_1 + 0x87) < '\0') {
      FUN_00018218(pdVar7 + 0xe,*(undefined8 *)(param_1 + 0x70),*(undefined8 *)(param_1 + 0x78));
    }
    else {
      uVar12 = *(undefined8 *)(param_1 + 0x70);
      *(undefined8 *)(pdVar7 + 0x10) = *(undefined8 *)(param_1 + 0x78);
      *(undefined8 *)(pdVar7 + 0xe) = uVar12;
      *(undefined8 *)(pdVar7 + 0x12) = *(undefined8 *)(param_1 + 0x80);
    }
    pdVar7[0x14] = 0;
    *(qword **)(pdVar7 + 0x16) = pqVar4;
    if (uVar14 == DAT_0ebb2088) {
      FUN_000142fc(plVar9);
    }
    if (uVar13 == DAT_0ebb2088) {
      FUN_000142fc(auStack_80);
    }
    piVar10 = *(int **)(param_1 + 0xc0);
    if ((piVar10 != (int *)0x0) && (iVar1 = *piVar10, *piVar10 = iVar1 + 1, iVar1 == 0x7fffffff)) {
                    /* WARNING: Does not return */
      pcVar8 = (code *)SoftwareBreakpoint(0,0x41602d4);
      (*pcVar8)();
    }
    uVar12 = *(undefined8 *)(param_1 + 200);
    pqVar4 = &segment_command_00000020.vmsize;
    FUN_0000f368();
    *(undefined4 *)pqVar4 = 1;
    pqVar4[1] = (qword)&LAB_03f6f060;
    pqVar4[2] = (qword)FUN_03f9e440;
    pqVar4[3] = (qword)&LAB_0406a280;
    pqVar4[4] = (qword)&LAB_0416032c;
    pqVar4[5] = 0;
    pqVar4[6] = (qword)piVar10;
    pqVar4[7] = uVar12;
    FUN_01991228(*(undefined8 *)(param_1 + 0x98),auStack_80,pdVar7,pqVar4);
    if (uVar14 == DAT_0ebb2088) {
      FUN_00022a3c(plVar9);
    }
    if ((uVar13 == DAT_0ebb2088) && (FUN_00022a3c(auStack_80), uVar13 == DAT_0ebb2088)) {
      FUN_00022a3c(auStack_80);
    }
  }
  return;
}


