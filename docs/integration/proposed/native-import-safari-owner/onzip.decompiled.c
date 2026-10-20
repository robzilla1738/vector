
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void entry(long param_1,ulong param_2)

{
  ulong *puVar1;
  char cVar2;
  code *pcVar3;
  int iVar4;
  long *plVar5;
  undefined8 uVar6;
  undefined4 *puVar7;
  undefined8 *puVar8;
  undefined4 *puVar9;
  undefined4 *puVar10;
  ulong **ppuVar11;
  ulong uVar12;
  int *piVar13;
  ulong uVar14;
  ulong uVar15;
  ulong uVar16;
  ulong *apuStack_a0 [4];
  ulong *local_80;
  ulong **local_78;
  undefined8 uStack_70;
  undefined8 local_68;
  
  if ((param_2 & 1) == 0) {
    plVar5 = (long *)func_0x0091d580(0xda89cb6,1,4,5,1);
    if (*(code **)(*plVar5 + 0x30) == (code *)&SUB_001b8ac0) {
      func_0x001b8ac0();
    }
    else {
      (**(code **)(*plVar5 + 0x30))(plVar5,2);
    }
    if (*(long **)(param_1 + 0x28) == (long *)0x0) {
                    /* WARNING: Does not return */
      pcVar3 = (code *)SoftwareBreakpoint(0,0x40ef520);
      (*pcVar3)();
    }
                    /* WARNING: Could not recover jumptable at 0x040eec14. Too many branches */
                    /* WARNING: Treating indirect jump as call */
    (**(code **)(**(long **)(param_1 + 0x28) + 0x10))();
    return;
  }
  cVar2 = *(char *)(param_1 + 0x298);
  uVar6 = (*_DAT_0ebb1d18)();
  if (cVar2 == '\0') {
    if (*(char *)(param_1 + 0x1b0) == '\0') {
      if ((undefined8 *)(param_1 + 0x1a8) == (undefined8 *)0x0) goto LAB_040ef518;
      *(undefined8 *)(param_1 + 0x1a8) = uVar6;
      *(undefined1 *)(param_1 + 0x1b0) = 1;
    }
    else {
      *(undefined8 *)(param_1 + 0x1a8) = uVar6;
    }
    func_0x00050c80(&local_80,0xda89c93,0xda89c25,0x23c);
    uVar16 = param_1 + 8U & 0xfffffffc00000000;
    if (uVar16 == _DAT_0ebb2088) {
      func_0x000142fc(param_1 + 8);
    }
    uVar15 = (ulong)&local_80 & 0xfffffffc00000000;
    if (uVar15 == _DAT_0ebb2088) {
      func_0x000142fc(&local_80);
    }
    if (uVar16 == _DAT_0ebb2088) {
      func_0x00022a3c(param_1 + 8);
    }
    uVar14 = *(ulong *)(param_1 + 8U);
    if ((uVar14 & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x000142fc(uVar14);
    }
    if ((uVar14 & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x000142fc(uVar14);
    }
    if ((uVar14 & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x00022a3c(uVar14);
    }
    uVar12 = _DAT_0ebb2088;
    puVar10 = (undefined4 *)func_0x0000f368(0x40);
    *puVar10 = 1;
    *(undefined8 *)(puVar10 + 2) = 0x40f2fc0;
    *(undefined8 *)(puVar10 + 4) = 0x3899100;
    *(undefined8 *)(puVar10 + 6) = 0x255db00;
    *(undefined8 *)(puVar10 + 8) = 0x40f1118;
    *(undefined8 *)(puVar10 + 10) = 0;
    *(ulong *)(puVar10 + 0xc) = uVar14;
    *(undefined1 *)(puVar10 + 0xe) = 1;
    if (uVar16 == uVar12) {
      func_0x000142fc(param_1 + 8);
      uVar12 = _DAT_0ebb2088;
    }
    if (uVar15 == uVar12) {
      func_0x000142fc(&local_80);
    }
    piVar13 = *(int **)(param_1 + 0x2b0);
    if ((piVar13 != (int *)0x0) && (iVar4 = *piVar13, *piVar13 = iVar4 + 1, iVar4 == 0x7fffffff)) {
                    /* WARNING: Does not return */
      pcVar3 = (code *)SoftwareBreakpoint(0,0x40ef52c);
      (*pcVar3)();
    }
    uVar6 = *(undefined8 *)(param_1 + 0x2b8);
    puVar7 = (undefined4 *)func_0x0000f368(0x40);
    *puVar7 = 1;
    *(undefined8 *)(puVar7 + 2) = 0x40f3028;
    *(undefined8 *)(puVar7 + 4) = 0x3f6cac0;
    *(undefined8 *)(puVar7 + 6) = 0x40ae6c0;
    *(undefined8 *)(puVar7 + 8) = 0x40f1bc4;
    *(undefined8 *)(puVar7 + 10) = 0;
    *(int **)(puVar7 + 0xc) = piVar13;
    *(undefined8 *)(puVar7 + 0xe) = uVar6;
    func_0x02e9ad14(*(undefined8 *)(param_1 + 0x18),&local_80,puVar10,puVar7);
    if (uVar16 == _DAT_0ebb2088) {
      func_0x00022a3c(param_1 + 8);
    }
    if ((uVar15 == _DAT_0ebb2088) && (func_0x00022a3c(&local_80), uVar15 == _DAT_0ebb2088)) {
      func_0x00022a3c(&local_80);
    }
    uVar6 = (*_DAT_0ebb1d18)();
    if (*(char *)(param_1 + 0x208) == '\0') {
      if ((undefined8 *)(param_1 + 0x200) == (undefined8 *)0x0) goto LAB_040ef518;
      *(undefined8 *)(param_1 + 0x200) = uVar6;
      *(undefined1 *)(param_1 + 0x208) = 1;
    }
    else {
      *(undefined8 *)(param_1 + 0x200) = uVar6;
    }
    func_0x00050c80(&local_80,0xda89c93,0xda89c25,0x242);
    if (uVar16 == _DAT_0ebb2088) {
      func_0x000142fc(param_1 + 8);
    }
    if (((ulong)&local_80 & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x000142fc(&local_80);
    }
    piVar13 = *(int **)(param_1 + 0x2b0);
    if ((piVar13 != (int *)0x0) && (iVar4 = *piVar13, *piVar13 = iVar4 + 1, iVar4 == 0x7fffffff)) {
                    /* WARNING: Does not return */
      pcVar3 = (code *)SoftwareBreakpoint(0,0x40ef550);
      (*pcVar3)();
    }
    uVar6 = *(undefined8 *)(param_1 + 0x2b8);
    puVar10 = (undefined4 *)func_0x0000f368(0x40);
    *puVar10 = 1;
    *(undefined8 *)(puVar10 + 2) = 0x40f30c8;
    *(undefined8 *)(puVar10 + 4) = 0x3f6cac0;
    *(undefined8 *)(puVar10 + 6) = 0x40ae6c0;
    *(undefined8 *)(puVar10 + 8) = 0x40f1efc;
    *(undefined8 *)(puVar10 + 10) = 0;
    *(int **)(puVar10 + 0xc) = piVar13;
    *(undefined8 *)(puVar10 + 0xe) = uVar6;
    uVar15 = *(ulong *)(param_1 + 8);
    if ((uVar15 & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x000142fc(uVar15);
    }
    if ((uVar15 & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x000142fc(uVar15);
    }
    if ((uVar15 & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x00022a3c(uVar15);
    }
    puVar7 = (undefined4 *)func_0x0000f368(0x38);
    *puVar7 = 1;
    *(undefined8 *)(puVar7 + 2) = 0x403de90;
    *(undefined8 *)(puVar7 + 4) = 0x1ac4600;
    *(undefined8 *)(puVar7 + 6) = 0x255db00;
    *(undefined8 *)(puVar7 + 8) = 0x40f13e0;
    *(undefined8 *)(puVar7 + 10) = 0;
    *(ulong *)(puVar7 + 0xc) = uVar15;
    uVar6 = *(undefined8 *)(param_1 + 0x18);
    puVar8 = (undefined8 *)func_0x0000f368(8);
    *puVar8 = 0;
    puVar9 = (undefined4 *)func_0x0000f368(0x38);
    *puVar9 = 1;
    *(undefined8 *)(puVar9 + 2) = 0x16a5640;
    *(undefined8 *)(puVar9 + 4) = 0x3fa9a40;
    *(undefined8 *)(puVar9 + 6) = 0x255db00;
    *(undefined8 *)(puVar9 + 8) = 0x40f3d54;
    *(undefined4 **)(puVar9 + 10) = puVar7;
    if (((ulong)puVar8 & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x000142fc(puVar8);
    }
    *(undefined8 **)(puVar9 + 0xc) = puVar8;
    puVar7 = (undefined4 *)func_0x0000f368(0x38);
    *puVar7 = 1;
    *(undefined8 *)(puVar7 + 2) = 0x17c5e00;
    *(undefined8 *)(puVar7 + 4) = 0x40f4028;
    *(undefined8 *)(puVar7 + 6) = 0x255db00;
    *(undefined8 *)(puVar7 + 8) = 0x40f3f10;
    *(undefined4 **)(puVar7 + 10) = puVar10;
    *(undefined8 **)(puVar7 + 0xc) = puVar8;
    func_0x01192ab0(uVar6,&local_80,puVar9,puVar7);
    if (uVar16 == _DAT_0ebb2088) {
      func_0x00022a3c(param_1 + 8);
    }
    puVar1 = (ulong *)(param_1 + 8);
    if (((ulong)&local_80 & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x00022a3c(&local_80);
    }
    uVar6 = (*_DAT_0ebb1d18)();
    if (*(char *)(param_1 + 0x100) == '\0') {
      if ((undefined8 *)(param_1 + 0xf8) == (undefined8 *)0x0) goto LAB_040ef518;
      *(undefined8 *)(param_1 + 0xf8) = uVar6;
      *(undefined1 *)(param_1 + 0x100) = 1;
    }
    else {
      *(undefined8 *)(param_1 + 0xf8) = uVar6;
    }
    uVar6 = (*_DAT_0ebb1d18)();
    if (*(char *)(param_1 + 0x260) == '\0') {
      if ((undefined8 *)(param_1 + 600) == (undefined8 *)0x0) goto LAB_040ef518;
      *(undefined8 *)(param_1 + 600) = uVar6;
      *(undefined1 *)(param_1 + 0x260) = 1;
    }
    else {
      *(undefined8 *)(param_1 + 600) = uVar6;
    }
    func_0x00050c80(apuStack_a0,0xda89c93,0xda89c25,0x248);
    if (uVar16 == _DAT_0ebb2088) {
      func_0x000142fc(param_1 + 8);
    }
    local_80 = puVar1;
    if (((ulong)apuStack_a0 & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x000142fc(apuStack_a0);
    }
    uStack_70 = 0x40f11b4;
    local_68 = 0;
    piVar13 = *(int **)(param_1 + 0x2b0);
    if ((piVar13 != (int *)0x0) && (iVar4 = *piVar13, *piVar13 = iVar4 + 1, iVar4 == 0x7fffffff)) {
                    /* WARNING: Does not return */
      pcVar3 = (code *)SoftwareBreakpoint(0,0x40ef568);
      local_78 = apuStack_a0;
      (*pcVar3)();
    }
    uVar6 = *(undefined8 *)(param_1 + 0x2b8);
    local_78 = apuStack_a0;
    puVar10 = (undefined4 *)func_0x0000f368(0x40);
    *puVar10 = 1;
    *(undefined8 *)(puVar10 + 2) = 0x40f2ef4;
    *(undefined8 *)(puVar10 + 4) = 0x3f6cac0;
    *(undefined8 *)(puVar10 + 6) = 0x40ae6c0;
    *(undefined8 *)(puVar10 + 8) = 0x40f169c;
    *(undefined8 *)(puVar10 + 10) = 0;
    *(int **)(puVar10 + 0xc) = piVar13;
    *(undefined8 *)(puVar10 + 0xe) = uVar6;
    func_0x040f1508(&local_80,puVar10);
    if (local_80 != (ulong *)0x0) {
                    /* WARNING: Does not return */
      pcVar3 = (code *)SoftwareBreakpoint(0,0x40ef55c);
      (*pcVar3)();
    }
    if (((ulong)local_78 & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x00022a3c();
    }
    uVar6 = (*_DAT_0ebb1d18)();
    if (*(char *)(param_1 + 0x158) == '\0') {
      if ((undefined8 *)(param_1 + 0x150) == (undefined8 *)0x0) goto LAB_040ef518;
      *(undefined8 *)(param_1 + 0x150) = uVar6;
      *(undefined1 *)(param_1 + 0x158) = 1;
    }
    else {
      *(undefined8 *)(param_1 + 0x150) = uVar6;
    }
    func_0x00050c80(&local_80,0xda89c93,0xda89c25,0x24d);
    if (uVar16 == _DAT_0ebb2088) {
      func_0x000142fc(param_1 + 8);
    }
    uVar15 = (ulong)&local_80 & 0xfffffffc00000000;
    if (uVar15 == _DAT_0ebb2088) {
      func_0x000142fc(&local_80);
    }
    if (uVar16 == _DAT_0ebb2088) {
      func_0x00022a3c(param_1 + 8);
    }
    uVar14 = *puVar1;
    if ((uVar14 & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x000142fc(uVar14);
    }
    if ((uVar14 & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x000142fc(uVar14);
    }
    if ((uVar14 & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x00022a3c(uVar14);
    }
    uVar12 = _DAT_0ebb2088;
    puVar10 = (undefined4 *)func_0x0000f368(0x40);
    *puVar10 = 1;
    *(undefined8 *)(puVar10 + 2) = 0x3f72b20;
    *(undefined8 *)(puVar10 + 4) = 0x3899100;
    *(undefined8 *)(puVar10 + 6) = 0x255db00;
    *(undefined8 *)(puVar10 + 8) = 0x40f119c;
    *(undefined8 *)(puVar10 + 10) = 0;
    *(ulong *)(puVar10 + 0xc) = uVar14;
    *(undefined1 *)(puVar10 + 0xe) = 3;
    if (uVar16 == uVar12) {
      func_0x000142fc(param_1 + 8);
      uVar12 = _DAT_0ebb2088;
    }
    if (uVar15 == uVar12) {
      func_0x000142fc(&local_80);
    }
    piVar13 = *(int **)(param_1 + 0x2b0);
    if ((piVar13 != (int *)0x0) && (iVar4 = *piVar13, *piVar13 = iVar4 + 1, iVar4 == 0x7fffffff)) {
                    /* WARNING: Does not return */
      pcVar3 = (code *)SoftwareBreakpoint(0,0x40ef574);
      (*pcVar3)();
    }
    uVar6 = *(undefined8 *)(param_1 + 0x2b8);
    puVar7 = (undefined4 *)func_0x0000f368(0x40);
    *puVar7 = 1;
    *(undefined8 *)(puVar7 + 2) = 0x2979d00;
    *(undefined8 *)(puVar7 + 4) = 0x3f6cac0;
    *(undefined8 *)(puVar7 + 6) = 0x40ae6c0;
    *(undefined8 *)(puVar7 + 8) = 0x40f236c;
    *(undefined8 *)(puVar7 + 10) = 0;
    *(int **)(puVar7 + 0xc) = piVar13;
    *(undefined8 *)(puVar7 + 0xe) = uVar6;
    func_0x040f4158(*(undefined8 *)(param_1 + 0x18),&local_80,puVar10,puVar7);
    if (uVar16 == _DAT_0ebb2088) {
      func_0x00022a3c(puVar1);
    }
    if (uVar15 != _DAT_0ebb2088) {
      return;
    }
    func_0x00022a3c(&local_80);
    if (uVar15 != _DAT_0ebb2088) {
      return;
    }
    ppuVar11 = &local_80;
  }
  else {
    if (*(char *)(param_1 + 0x100) == '\0') {
      if ((undefined8 *)(param_1 + 0xf8) == (undefined8 *)0x0) goto LAB_040ef518;
      *(undefined8 *)(param_1 + 0xf8) = uVar6;
      *(undefined1 *)(param_1 + 0x100) = 1;
    }
    else {
      *(undefined8 *)(param_1 + 0xf8) = uVar6;
    }
    uVar6 = (*_DAT_0ebb1d18)();
    if (*(char *)(param_1 + 0x260) == '\0') {
      if ((undefined8 *)(param_1 + 600) == (undefined8 *)0x0) {
LAB_040ef518:
                    /* WARNING: Does not return */
        pcVar3 = (code *)SoftwareBreakpoint(1,0x40ef51c);
        (*pcVar3)();
      }
      *(undefined8 *)(param_1 + 600) = uVar6;
      *(undefined1 *)(param_1 + 0x260) = 1;
    }
    else {
      *(undefined8 *)(param_1 + 600) = uVar6;
    }
    puVar1 = (ulong *)(param_1 + 8);
    func_0x00050c80(apuStack_a0,0xda89c93,0xda89c25,0x234);
    if (((ulong)puVar1 & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x000142fc(param_1 + 8);
    }
    local_80 = puVar1;
    if (((ulong)apuStack_a0 & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x000142fc(apuStack_a0);
    }
    uStack_70 = 0x40f11b4;
    local_68 = 0;
    piVar13 = *(int **)(param_1 + 0x2b0);
    if ((piVar13 != (int *)0x0) && (iVar4 = *piVar13, *piVar13 = iVar4 + 1, iVar4 == 0x7fffffff)) {
                    /* WARNING: Does not return */
      pcVar3 = (code *)SoftwareBreakpoint(0,0x40ef544);
      local_78 = apuStack_a0;
      (*pcVar3)();
    }
    uVar6 = *(undefined8 *)(param_1 + 0x2b8);
    local_78 = apuStack_a0;
    puVar10 = (undefined4 *)func_0x0000f368(0x40);
    *puVar10 = 1;
    *(undefined8 *)(puVar10 + 2) = 0x40f2ef4;
    *(undefined8 *)(puVar10 + 4) = 0x3f6cac0;
    *(undefined8 *)(puVar10 + 6) = 0x40ae6c0;
    *(undefined8 *)(puVar10 + 8) = 0x40f169c;
    *(undefined8 *)(puVar10 + 10) = 0;
    *(int **)(puVar10 + 0xc) = piVar13;
    *(undefined8 *)(puVar10 + 0xe) = uVar6;
    func_0x040f1508(&local_80,puVar10);
    if (local_80 != (ulong *)0x0) {
                    /* WARNING: Does not return */
      pcVar3 = (code *)SoftwareBreakpoint(0,0x40ef538);
      (*pcVar3)();
    }
    ppuVar11 = local_78;
    if (((ulong)local_78 & 0xfffffffc00000000) != _DAT_0ebb2088) {
      return;
    }
  }
  func_0x00022a3c(ppuVar11);
  return;
}


