
/* WARNING: Control flow encountered bad instruction data */
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void entry(long param_1,undefined8 param_2)

{
  ulong *puVar1;
  undefined8 *puVar2;
  long *plVar3;
  char cVar4;
  int iVar5;
  undefined4 *puVar6;
  undefined8 *puVar7;
  long lVar8;
  undefined4 *puVar9;
  long *plVar10;
  code *pcVar11;
  int *piVar12;
  undefined8 uVar13;
  long *plVar14;
  long lVar15;
  ulong uVar16;
  int *piVar17;
  undefined8 uVar18;
  ulong uVar19;
  int *piVar20;
  ulong uVar21;
  ulong uVar22;
  ulong local_b0;
  long lStack_a8;
  undefined8 local_a0;
  long local_98;
  undefined8 uStack_90;
  undefined8 local_88;
  undefined8 uStack_80;
  undefined8 local_78;
  undefined8 uStack_70;
  int *local_68;
  
  piVar12 = *(int **)(param_1 + 0x2b0);
  if (*(char *)(param_1 + 0x298) != '\0') {
    if ((piVar12 != (int *)0x0) && (iVar5 = *piVar12, *piVar12 = iVar5 + 1, iVar5 == 0x7fffffff)) {
                    /* WARNING: Does not return */
      pcVar11 = (code *)SoftwareBreakpoint(0,0x40f05fc);
      (*pcVar11)();
    }
    uVar13 = *(undefined8 *)(param_1 + 0x2b8);
    puVar6 = (undefined4 *)func_0x0000f368(0x40);
    *puVar6 = 1;
    *(undefined8 *)(puVar6 + 2) = 0x3f6e8c0;
    *(undefined1 **)(puVar6 + 4) = &SUB_03f6cac0;
    *(undefined8 *)(puVar6 + 6) = 0x40ae6c0;
    *(undefined8 *)(puVar6 + 8) = 0x40f07e4;
    *(undefined8 *)(puVar6 + 10) = 0;
    *(int **)(puVar6 + 0xc) = piVar12;
    *(undefined8 *)(puVar6 + 0xe) = uVar13;
    piVar12 = (int *)func_0x01dcdef8(1,puVar6);
    uVar13 = (*_DAT_0ebb1d18)();
    if (*(char *)(param_1 + 0x110) == '\0') {
      if ((undefined8 *)(param_1 + 0x108) == (undefined8 *)0x0) goto LAB_040f03e4;
      *(undefined8 *)(param_1 + 0x108) = uVar13;
      *(undefined1 *)(param_1 + 0x110) = 1;
    }
    else {
      *(undefined8 *)(param_1 + 0x108) = uVar13;
    }
    uVar13 = (*_DAT_0ebb1d18)();
    if (*(char *)(param_1 + 0x270) == '\0') {
      if ((undefined8 *)(param_1 + 0x268) == (undefined8 *)0x0) goto LAB_040f03e4;
      *(undefined8 *)(param_1 + 0x268) = uVar13;
      *(undefined1 *)(param_1 + 0x270) = 1;
    }
    else {
      *(undefined8 *)(param_1 + 0x268) = uVar13;
    }
    plVar10 = (long *)(*_DAT_0ed03d68)();
    if (((undefined8 *)*plVar10 == (undefined8 *)0x0) ||
       (plVar10 = *(long **)*plVar10, plVar10 == (long *)0x0)) {
                    /* WARNING: Does not return */
      pcVar11 = (code *)SoftwareBreakpoint(0,0x40f05b4);
      (*pcVar11)();
    }
    iVar5 = (int)plVar10[1];
    *(int *)(plVar10 + 1) = iVar5 + 1;
    if (iVar5 == 0x7fffffff) {
                    /* WARNING: Does not return */
      pcVar11 = (code *)SoftwareBreakpoint(0,0x40f0620);
      (*pcVar11)();
    }
    func_0x00050c80(&local_b0,0xda89c77,0xda89c25,0x154);
    piVar20 = *(int **)(param_1 + 0x2b0);
    if ((piVar20 != (int *)0x0) && (iVar5 = *piVar20, *piVar20 = iVar5 + 1, iVar5 == 0x7fffffff)) {
                    /* WARNING: Does not return */
      pcVar11 = (code *)SoftwareBreakpoint(0,0x40f062c);
      (*pcVar11)();
    }
    uVar13 = *(undefined8 *)(param_1 + 0x2b8);
    local_68 = (int *)func_0x0000f368(0x40);
    *local_68 = 1;
    local_68[2] = 0x3f6e8c0;
    local_68[3] = 0;
    *(undefined1 **)(local_68 + 4) = &SUB_03f6cac0;
    local_68[6] = 0x40ae6c0;
    local_68[7] = 0;
    local_68[8] = 0x40f07ec;
    local_68[9] = 0;
    local_68[10] = 0;
    local_68[0xb] = 0;
    *(int **)(local_68 + 0xc) = piVar20;
    *(undefined8 *)(local_68 + 0xe) = uVar13;
    if (piVar12 != (int *)0x0) {
      iVar5 = *piVar12;
      *piVar12 = iVar5 + 1;
      if (iVar5 < 1) {
                    /* WARNING: Bad instruction - Truncating control flow here */
        halt_baddata();
      }
      if (iVar5 == 0x7fffffff) {
                    /* WARNING: Bad instruction - Truncating control flow here */
        halt_baddata();
      }
    }
    uVar13 = func_0x06497704(&local_68,piVar12);
    (**(code **)*plVar10)(plVar10,&local_b0,uVar13,0);
    if (local_68 != (int *)0x0) {
      LOAcquire();
      iVar5 = *local_68;
      *local_68 = iVar5 + -1;
      LORelease();
      if (iVar5 == 1) {
        (**(code **)(local_68 + 4))();
      }
    }
    LOAcquire();
    iVar5 = (int)plVar10[1];
    *(int *)(plVar10 + 1) = iVar5 + -1;
    LORelease();
    if (iVar5 == 1) {
      pcVar11 = *(code **)(*plVar10 + 0x18);
      if (pcVar11 == (code *)0x42caa8c) {
        pcVar11 = *(code **)(*plVar10 + 0x10);
      }
      (*pcVar11)(plVar10);
    }
    if (piVar12 == (int *)0x0) {
      return;
    }
    LOAcquire();
    iVar5 = *piVar12;
    *piVar12 = iVar5 + -1;
    LORelease();
    goto LAB_040f021c;
  }
  if ((piVar12 != (int *)0x0) && (iVar5 = *piVar12, *piVar12 = iVar5 + 1, iVar5 == 0x7fffffff)) {
                    /* WARNING: Does not return */
    pcVar11 = (code *)SoftwareBreakpoint(0,0x40f0614);
    (*pcVar11)();
  }
  uVar13 = *(undefined8 *)(param_1 + 0x2b8);
  puVar6 = (undefined4 *)func_0x0000f368(0x40);
  *puVar6 = 1;
  *(undefined8 *)(puVar6 + 2) = 0x3f6e8c0;
  *(undefined1 **)(puVar6 + 4) = &SUB_03f6cac0;
  *(undefined8 *)(puVar6 + 6) = 0x40ae6c0;
  *(undefined8 *)(puVar6 + 8) = 0x40f07e4;
  *(undefined8 *)(puVar6 + 10) = 0;
  *(int **)(puVar6 + 0xc) = piVar12;
  *(undefined8 *)(puVar6 + 0xe) = uVar13;
  piVar12 = (int *)func_0x01dcdef8(4,puVar6);
  uVar13 = *(undefined8 *)(param_1 + 0x58);
  puVar7 = (undefined8 *)func_0x004bcc4c(uVar13,0xd472da7,0x17);
  if (puVar7 == (undefined8 *)0x0) {
LAB_040ef7a8:
    *(undefined8 *)(param_1 + 0x2a0) = 0;
    plVar10 = (long *)(*_DAT_0ed03d68)();
    if (((long *)*plVar10 == (long *)0x0) || (lVar15 = *(long *)*plVar10, lVar15 == 0)) {
                    /* WARNING: Does not return */
      pcVar11 = (code *)SoftwareBreakpoint(0,0x40f05d8);
      (*pcVar11)();
    }
    iVar5 = *(int *)(lVar15 + 8);
    *(int *)(lVar15 + 8) = iVar5 + 1;
    if (iVar5 == 0x7fffffff) {
                    /* WARNING: Does not return */
      pcVar11 = (code *)SoftwareBreakpoint(0,0x40f0698);
      (*pcVar11)();
    }
    piVar20 = *(int **)(param_1 + 0x2b0);
    if ((piVar20 != (int *)0x0) && (iVar5 = *piVar20, *piVar20 = iVar5 + 1, iVar5 == 0x7fffffff)) {
                    /* WARNING: Does not return */
      pcVar11 = (code *)SoftwareBreakpoint(0,0x40f06e0);
      (*pcVar11)();
    }
    uVar13 = *(undefined8 *)(param_1 + 0x2b8);
    puVar6 = (undefined4 *)func_0x0000f368(0x40);
    *puVar6 = 1;
    *(undefined8 *)(puVar6 + 2) = 0x40f2a4c;
    *(undefined1 **)(puVar6 + 4) = &SUB_03f6cac0;
    *(undefined8 *)(puVar6 + 6) = 0x40ae6c0;
    *(undefined8 *)(puVar6 + 8) = 0x774de30;
    *(undefined8 *)(puVar6 + 10) = 0;
    *(int **)(puVar6 + 0xc) = piVar20;
    *(undefined8 *)(puVar6 + 0xe) = uVar13;
    func_0x00050c80(&local_b0,0xda89c77,0xda89c25,0x165);
    plVar14 = (long *)func_0x0000f368(0x30);
    *plVar14 = lVar15;
    plVar14[2] = lStack_a8;
    plVar14[1] = local_b0;
    *(undefined4 *)(plVar14 + 3) = (undefined4)local_a0;
    plVar14[4] = local_98;
    plVar14[5] = (long)puVar6;
    if (puVar6 == (undefined4 *)0x0) {
                    /* WARNING: Does not return */
      pcVar11 = (code *)SoftwareBreakpoint(0,0x40f06a4);
      (*pcVar11)();
    }
    piVar20 = (int *)func_0x0000f368(0x38);
    *piVar20 = 1;
    piVar20[2] = 0x40f3804;
    piVar20[3] = 0;
    *(undefined1 **)(piVar20 + 4) = &SUB_040f386c;
    piVar20[6] = 0x255db00;
    piVar20[7] = 0;
    piVar20[8] = 0x40f3718;
    piVar20[9] = 0;
    piVar20[10] = 0;
    piVar20[0xb] = 0;
    *(long **)(piVar20 + 0xc) = plVar14;
    if (((long *)*plVar10 == (long *)0x0) || (lVar15 = *(long *)*plVar10, lVar15 == 0)) {
                    /* WARNING: Does not return */
      pcVar11 = (code *)SoftwareBreakpoint(0,0x40f05e4);
      (*pcVar11)();
    }
    iVar5 = *(int *)(lVar15 + 8);
    *(int *)(lVar15 + 8) = iVar5 + 1;
    if (iVar5 == 0x7fffffff) {
                    /* WARNING: Does not return */
      pcVar11 = (code *)SoftwareBreakpoint(0,0x40f06b0);
      (*pcVar11)();
    }
    piVar17 = *(int **)(param_1 + 0x2b0);
    if ((piVar17 != (int *)0x0) && (iVar5 = *piVar17, *piVar17 = iVar5 + 1, iVar5 == 0x7fffffff)) {
                    /* WARNING: Bad instruction - Truncating control flow here */
      halt_baddata();
    }
    uVar13 = *(undefined8 *)(param_1 + 0x2b8);
    local_68 = (int *)func_0x0000f368(0x40);
    *local_68 = 1;
    local_68[2] = 0x3f6e8c0;
    local_68[3] = 0;
    *(undefined1 **)(local_68 + 4) = &SUB_03f6cac0;
    local_68[6] = 0x40ae6c0;
    local_68[7] = 0;
    local_68[8] = 0x40f0aa8;
    local_68[9] = 0;
    local_68[10] = 0;
    local_68[0xb] = 0;
    *(int **)(local_68 + 0xc) = piVar17;
    *(undefined8 *)(local_68 + 0xe) = uVar13;
    if (piVar12 != (int *)0x0) {
      iVar5 = *piVar12;
      *piVar12 = iVar5 + 1;
      if (iVar5 < 1) {
                    /* WARNING: Bad instruction - Truncating control flow here */
        halt_baddata();
      }
      if (iVar5 == 0x7fffffff) {
                    /* WARNING: Does not return */
        pcVar11 = (code *)SoftwareBreakpoint(0,0x40f0444);
        (*pcVar11)();
      }
    }
    lVar8 = func_0x06497704(&local_68,piVar12);
    func_0x00050c80(&local_b0,0xda89c77,0xda89c25,0x16a);
    plVar14 = (long *)func_0x0000f368(0x30);
    *plVar14 = lVar15;
    plVar14[2] = lStack_a8;
    plVar14[1] = local_b0;
    *(undefined4 *)(plVar14 + 3) = (undefined4)local_a0;
    plVar14[4] = local_98;
    plVar14[5] = lVar8;
    if (lVar8 == 0) {
                    /* WARNING: Does not return */
      pcVar11 = (code *)SoftwareBreakpoint(0,0x40f06bc);
      (*pcVar11)();
    }
    puVar6 = (undefined4 *)func_0x0000f368(0x38);
    *puVar6 = 1;
    *(undefined8 *)(puVar6 + 2) = 0x153f9c0;
    *(undefined8 *)(puVar6 + 4) = 0x1085840;
    *(undefined8 *)(puVar6 + 6) = 0x255db00;
    *(undefined8 *)(puVar6 + 8) = 0x1540c40;
    *(undefined8 *)(puVar6 + 10) = 0;
    *(long **)(puVar6 + 0xc) = plVar14;
    if (local_68 != (int *)0x0) {
      LOAcquire();
      iVar5 = *local_68;
      *local_68 = iVar5 + -1;
      LORelease();
      if (iVar5 == 1) {
        (**(code **)(local_68 + 4))();
      }
    }
    if (((long *)*plVar10 == (long *)0x0) || (lVar15 = *(long *)*plVar10, lVar15 == 0)) {
                    /* WARNING: Does not return */
      pcVar11 = (code *)SoftwareBreakpoint(0,0x40f05f0);
      (*pcVar11)();
    }
    iVar5 = *(int *)(lVar15 + 8);
    *(int *)(lVar15 + 8) = iVar5 + 1;
    if (iVar5 == 0x7fffffff) {
                    /* WARNING: Does not return */
      pcVar11 = (code *)SoftwareBreakpoint(0,0x40f06c8);
      (*pcVar11)();
    }
    piVar17 = *(int **)(param_1 + 0x2b0);
    if ((piVar17 != (int *)0x0) && (iVar5 = *piVar17, *piVar17 = iVar5 + 1, iVar5 == 0x7fffffff)) {
                    /* WARNING: Bad instruction - Truncating control flow here */
      halt_baddata();
    }
    uVar13 = *(undefined8 *)(param_1 + 0x2b8);
    local_68 = (int *)func_0x0000f368(0x40);
    *local_68 = 1;
    local_68[2] = 0x3f6e8c0;
    local_68[3] = 0;
    *(undefined1 **)(local_68 + 4) = &SUB_03f6cac0;
    local_68[6] = 0x40ae6c0;
    local_68[7] = 0;
    local_68[8] = 0x40f0afc;
    local_68[9] = 0;
    local_68[10] = 0;
    local_68[0xb] = 0;
    *(int **)(local_68 + 0xc) = piVar17;
    *(undefined8 *)(local_68 + 0xe) = uVar13;
    if (piVar12 != (int *)0x0) {
      iVar5 = *piVar12;
      *piVar12 = iVar5 + 1;
      if (iVar5 < 1) {
                    /* WARNING: Bad instruction - Truncating control flow here */
        halt_baddata();
      }
      if (iVar5 == 0x7fffffff) {
                    /* WARNING: Does not return */
        pcVar11 = (code *)SoftwareBreakpoint(0,0x40f0468);
        (*pcVar11)();
      }
    }
    lVar8 = func_0x06497704(&local_68,piVar12);
    func_0x00050c80(&local_b0,0xda89c77,0xda89c25,0x170);
    plVar10 = (long *)func_0x0000f368(0x30);
    *plVar10 = lVar15;
    plVar10[2] = lStack_a8;
    plVar10[1] = local_b0;
    *(undefined4 *)(plVar10 + 3) = (undefined4)local_a0;
    plVar10[4] = local_98;
    plVar10[5] = lVar8;
    if (lVar8 == 0) {
                    /* WARNING: Does not return */
      pcVar11 = (code *)SoftwareBreakpoint(0,0x40f06d4);
      (*pcVar11)();
    }
    puVar9 = (undefined4 *)func_0x0000f368(0x38);
    *puVar9 = 1;
    *(undefined8 *)(puVar9 + 2) = 0x153f9c0;
    *(undefined8 *)(puVar9 + 4) = 0x1085840;
    *(undefined8 *)(puVar9 + 6) = 0x255db00;
    *(undefined8 *)(puVar9 + 8) = 0x1540c40;
    *(undefined8 *)(puVar9 + 10) = 0;
    *(long **)(puVar9 + 0xc) = plVar10;
    if (local_68 != (int *)0x0) {
      LOAcquire();
      iVar5 = *local_68;
      *local_68 = iVar5 + -1;
      LORelease();
      if (iVar5 == 1) {
        (**(code **)(local_68 + 4))();
      }
    }
    uVar13 = (*_DAT_0ebb1d18)();
    if (*(char *)(param_1 + 0x168) == '\0') {
      if ((undefined8 *)(param_1 + 0x160) == (undefined8 *)0x0) goto LAB_040f03e4;
      *(undefined8 *)(param_1 + 0x160) = uVar13;
      *(undefined1 *)(param_1 + 0x168) = 1;
    }
    else {
      *(undefined8 *)(param_1 + 0x160) = uVar13;
    }
    puVar1 = (ulong *)(param_1 + 8);
    func_0x00050c80(&local_b0,0xda89c77,0xda89c25,0x176);
    uVar22 = (ulong)puVar1 & 0xfffffffc00000000;
    if (uVar22 == _DAT_0ebb2088) {
      func_0x000142fc(param_1 + 8);
    }
    uVar16 = (ulong)&local_b0 & 0xfffffffc00000000;
    if (uVar16 == _DAT_0ebb2088) {
      func_0x000142fc(&local_b0);
    }
    puVar7 = (undefined8 *)func_0x0000f368(0x20);
    *puVar7 = 0xe1a1430;
    puVar7[1] = piVar20;
    if (piVar20 == (int *)0x0) {
      puVar7[2] = puVar6;
      puVar7[3] = puVar9;
    }
    else {
      iVar5 = *piVar20;
      *piVar20 = iVar5 + 1;
      if (iVar5 < 1) {
                    /* WARNING: Bad instruction - Truncating control flow here */
        halt_baddata();
      }
      if (iVar5 == 0x7fffffff) {
                    /* WARNING: Bad instruction - Truncating control flow here */
        halt_baddata();
      }
      puVar7[2] = puVar6;
      puVar7[3] = puVar9;
      LOAcquire();
      iVar5 = *piVar20;
      *piVar20 = iVar5 + -1;
      LORelease();
      if (iVar5 == 1) {
        (**(code **)(piVar20 + 4))(piVar20);
      }
    }
    if (uVar22 == _DAT_0ebb2088) {
      func_0x00022a3c(param_1 + 8);
    }
    uVar19 = *puVar1;
    if ((uVar19 & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x000142fc(uVar19);
    }
    if ((uVar19 & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x000142fc(uVar19);
    }
    if ((uVar19 & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x00022a3c(uVar19);
    }
    uVar21 = _DAT_0ebb2088;
    piVar20 = (int *)func_0x0000f368(0x48);
    *piVar20 = 1;
    piVar20[2] = 0x3f73c80;
    piVar20[3] = 0;
    *(undefined1 **)(piVar20 + 4) = &SUB_040f2bd0;
    piVar20[6] = 0x255db00;
    piVar20[7] = 0;
    piVar20[8] = 0x40f0b50;
    piVar20[9] = 0;
    piVar20[10] = 0;
    piVar20[0xb] = 0;
    *(ulong *)(piVar20 + 0xc) = uVar19;
    uVar13 = *(undefined8 *)(param_1 + 0x2a8);
    *(undefined8 **)(piVar20 + 0xe) = puVar7;
    *(undefined8 *)(piVar20 + 0x10) = uVar13;
    if (uVar22 == uVar21) {
      func_0x000142fc(param_1 + 8);
      uVar21 = _DAT_0ebb2088;
    }
    if (uVar16 == uVar21) {
      func_0x000142fc(&local_b0);
    }
    if (puVar1 == (ulong *)0x0) {
      if (piVar20 != (int *)0x0) {
        LOAcquire();
        iVar5 = *piVar20;
        *piVar20 = iVar5 + -1;
        LORelease();
        if (iVar5 == 1) {
          (**(code **)(piVar20 + 4))(piVar20);
        }
      }
    }
    else {
      (**(code **)**(undefined8 **)(param_1 + 0x18))
                (*(undefined8 **)(param_1 + 0x18),&local_b0,piVar20,0);
    }
    if (uVar16 == _DAT_0ebb2088) {
      func_0x00022a3c(&local_b0);
    }
    if (uVar22 == _DAT_0ebb2088) {
      func_0x00022a3c(param_1 + 8);
    }
    if (uVar16 == _DAT_0ebb2088) {
      func_0x00022a3c(&local_b0);
    }
  }
  else {
    if (puVar7[4] == 0) {
                    /* WARNING: Does not return */
      pcVar11 = (code *)SoftwareBreakpoint(0,0x40f0608);
      (*pcVar11)();
    }
    local_b0 = 0;
    plVar10 = *(long **)(*(long *)(puVar7[4] + 0x10) + 0x28);
    if (plVar10 == (long *)0x0) goto LAB_040ef7a8;
    cVar4 = *(char *)((long)puVar7 + 0x17);
    puVar2 = (undefined8 *)*puVar7;
    if (-1 < (long)cVar4) {
      puVar2 = puVar7;
    }
    uVar22 = puVar7[1];
    if (-1 < cVar4) {
      uVar22 = (long)cVar4;
    }
    if (*(code **)(*plVar10 + 0x20) == (code *)0xa45dc) {
      if (plVar10[9] != 0) {
        plVar14 = (long *)(plVar10[9] + 0x10);
        plVar10 = (long *)*plVar14;
joined_r0x040ef754:
        if (plVar10 != (long *)0x0) {
          do {
            cVar4 = *(char *)((long)plVar10 + 0x37);
            plVar3 = (long *)plVar10[4];
            if (-1 < (long)cVar4) {
              plVar3 = plVar10 + 4;
            }
            uVar16 = plVar10[5];
            if (-1 < cVar4) {
              uVar16 = (long)cVar4;
            }
            uVar19 = uVar16;
            if (uVar22 <= uVar16) {
              uVar19 = uVar22;
            }
            iVar5 = func_0x08009860(puVar2,plVar3,uVar19);
            if (iVar5 == 0) {
              if (uVar22 == uVar16) {
                if (plVar10 != plVar14) goto LAB_040f0480;
                break;
              }
              if (uVar16 <= uVar22) goto LAB_040ef760;
            }
            else if (-1 < iVar5) goto LAB_040ef760;
            plVar10 = (long *)*plVar10;
            if (plVar10 == (long *)0x0) break;
          } while( true );
        }
      }
      goto LAB_040ef7a8;
    }
    uVar22 = (**(code **)(*plVar10 + 0x20))(plVar10,puVar2,uVar22,&local_b0);
    if ((uVar22 & 1) == 0) goto LAB_040ef7a8;
LAB_040f0480:
    uVar22 = func_0x00306500(uVar13,0xd472da7,0x17);
    if ((uVar22 & 1) == 0) goto LAB_040ef7a8;
    plVar10 = *(long **)(param_1 + 0x28);
    if (plVar10 == (long *)0x0) {
                    /* WARNING: Bad instruction - Truncating control flow here */
      halt_baddata();
    }
    (**(code **)(*plVar10 + 0x40))(plVar10,0);
    if (piVar12 == (int *)0x0) {
                    /* WARNING: Bad instruction - Truncating control flow here */
      halt_baddata();
    }
    iVar5 = *piVar12;
    *piVar12 = iVar5 + 1;
    if (iVar5 < 1) {
                    /* WARNING: Bad instruction - Truncating control flow here */
      halt_baddata();
    }
    if (iVar5 == 0x7fffffff) {
                    /* WARNING: Bad instruction - Truncating control flow here */
      halt_baddata();
    }
    (**(code **)(piVar12 + 2))(piVar12);
    LOAcquire();
    iVar5 = *piVar12;
    *piVar12 = iVar5 + -1;
    LORelease();
    if (iVar5 == 1) {
      (**(code **)(piVar12 + 4))(piVar12);
    }
  }
  if ((*(long *)(param_1 + 0x20) == 0) || (*(int *)(*(long *)(param_1 + 0x20) + 0x30) != 2)) {
    plVar10 = *(long **)(param_1 + 0x28);
    if (plVar10 == (long *)0x0) {
                    /* WARNING: Bad instruction - Truncating control flow here */
      halt_baddata();
    }
    local_b0 = local_b0 & 0xffffffff00000000;
    local_a0 = 0;
    lStack_a8 = 0;
    uStack_90 = 0;
    local_98 = 0;
    uStack_80 = 0;
    local_88 = 0;
    uStack_70 = 0;
    local_78 = 0;
    (**(code **)(*plVar10 + 0x48))(plVar10,&local_b0);
    func_0x0774f78c(&local_b0);
    if (piVar12 == (int *)0x0) {
                    /* WARNING: Bad instruction - Truncating control flow here */
      halt_baddata();
    }
    iVar5 = *piVar12;
    *piVar12 = iVar5 + 1;
    if (iVar5 < 1) {
                    /* WARNING: Bad instruction - Truncating control flow here */
      halt_baddata();
    }
    if (iVar5 == 0x7fffffff) {
                    /* WARNING: Bad instruction - Truncating control flow here */
      halt_baddata();
    }
    (**(code **)(piVar12 + 2))(piVar12);
    LOAcquire();
    iVar5 = *piVar12;
    *piVar12 = iVar5 + -1;
    LORelease();
    if (iVar5 == 1) {
      (**(code **)(piVar12 + 4))(piVar12);
    }
  }
  else {
    uVar13 = *(undefined8 *)(param_1 + 0x58);
    puVar7 = (undefined8 *)func_0x004bcc4c(uVar13,0xcedd864,0x1a);
    if (puVar7 != (undefined8 *)0x0) {
      if (puVar7[4] == 0) {
                    /* WARNING: Bad instruction - Truncating control flow here */
        halt_baddata();
      }
      local_b0 = 0;
      plVar10 = *(long **)(*(long *)(puVar7[4] + 0x10) + 0x28);
      if (plVar10 != (long *)0x0) {
        cVar4 = *(char *)((long)puVar7 + 0x17);
        puVar2 = (undefined8 *)*puVar7;
        if (-1 < (long)cVar4) {
          puVar2 = puVar7;
        }
        uVar22 = puVar7[1];
        if (-1 < cVar4) {
          uVar22 = (long)cVar4;
        }
        if (*(code **)(*plVar10 + 0x20) == (code *)0xa45dc) {
          if (plVar10[9] != 0) {
            plVar14 = (long *)(plVar10[9] + 0x10);
            plVar10 = (long *)*plVar14;
joined_r0x040efd8c:
            if (plVar10 != (long *)0x0) {
              do {
                cVar4 = *(char *)((long)plVar10 + 0x37);
                plVar3 = (long *)plVar10[4];
                if (-1 < (long)cVar4) {
                  plVar3 = plVar10 + 4;
                }
                uVar16 = plVar10[5];
                if (-1 < cVar4) {
                  uVar16 = (long)cVar4;
                }
                uVar19 = uVar16;
                if (uVar22 <= uVar16) {
                  uVar19 = uVar22;
                }
                iVar5 = func_0x08009860(puVar2,plVar3,uVar19);
                if (iVar5 == 0) {
                  if (uVar22 == uVar16) {
                    if (plVar10 != plVar14) goto LAB_040f0548;
                    break;
                  }
                  if (uVar16 <= uVar22) goto LAB_040efd98;
                }
                else if (-1 < iVar5) goto LAB_040efd98;
                plVar10 = (long *)*plVar10;
                if (plVar10 == (long *)0x0) break;
              } while( true );
            }
          }
        }
        else {
          uVar22 = (**(code **)(*plVar10 + 0x20))(plVar10,puVar2,uVar22,&local_b0);
          if ((uVar22 & 1) != 0) {
LAB_040f0548:
            uVar22 = func_0x00306500(uVar13,0xcedd864,0x1a);
            if ((uVar22 & 1) == 0) {
                    /* WARNING: Does not return */
              pcVar11 = (code *)SoftwareBreakpoint(0,0x40f0568);
              (*pcVar11)();
            }
          }
        }
      }
    }
    uVar13 = (*_DAT_0ebb1d18)();
    if (*(char *)(param_1 + 0x1c0) == '\0') {
      if ((undefined8 *)(param_1 + 0x1b8) == (undefined8 *)0x0) goto LAB_040f03e4;
      *(undefined8 *)(param_1 + 0x1b8) = uVar13;
      *(undefined1 *)(param_1 + 0x1c0) = 1;
    }
    else {
      *(undefined8 *)(param_1 + 0x1b8) = uVar13;
    }
    uVar13 = *(undefined8 *)(param_1 + 0x20);
    piVar20 = *(int **)(param_1 + 0x2b0);
    if ((piVar20 != (int *)0x0) && (iVar5 = *piVar20, *piVar20 = iVar5 + 1, iVar5 == 0x7fffffff)) {
                    /* WARNING: Bad instruction - Truncating control flow here */
      halt_baddata();
    }
    uVar18 = *(undefined8 *)(param_1 + 0x2b8);
    puVar6 = (undefined4 *)func_0x0000f368(0x40);
    *puVar6 = 1;
    *(undefined8 *)(puVar6 + 2) = 0x2979d00;
    *(undefined1 **)(puVar6 + 4) = &SUB_03f6cac0;
    *(undefined8 *)(puVar6 + 6) = 0x40ae6c0;
    *(undefined8 *)(puVar6 + 8) = 0x40f0c64;
    *(undefined8 *)(puVar6 + 10) = 0;
    *(int **)(puVar6 + 0xc) = piVar20;
    *(undefined8 *)(puVar6 + 0xe) = uVar18;
    if (piVar12 == (int *)0x0) {
                    /* WARNING: Bad instruction - Truncating control flow here */
      halt_baddata();
    }
    iVar5 = *piVar12;
    *piVar12 = iVar5 + 1;
    if (iVar5 < 1) {
                    /* WARNING: Bad instruction - Truncating control flow here */
      halt_baddata();
    }
    if (iVar5 == 0x7fffffff) {
                    /* WARNING: Bad instruction - Truncating control flow here */
      halt_baddata();
    }
    puVar9 = (undefined4 *)func_0x0000f368(0x38);
    *puVar9 = 1;
    *(undefined8 *)(puVar9 + 2) = 0x165add0;
    *(undefined8 *)(puVar9 + 4) = 0x3f9f000;
    *(undefined8 *)(puVar9 + 6) = 0x255db00;
    *(undefined4 **)(puVar9 + 10) = puVar6;
    *(int **)(puVar9 + 0xc) = piVar12;
    func_0x07751080(uVar13,param_2,puVar9);
  }
  uVar13 = (*_DAT_0ebb1d18)();
  if (*(char *)(param_1 + 0x110) == '\0') {
    if ((undefined8 *)(param_1 + 0x108) == (undefined8 *)0x0) goto LAB_040f03e4;
    *(undefined8 *)(param_1 + 0x108) = uVar13;
    *(undefined1 *)(param_1 + 0x110) = 1;
  }
  else {
    *(undefined8 *)(param_1 + 0x108) = uVar13;
  }
  uVar13 = (*_DAT_0ebb1d18)();
  if (*(char *)(param_1 + 0x270) == '\0') {
    if ((undefined8 *)(param_1 + 0x268) == (undefined8 *)0x0) goto LAB_040f03e4;
    *(undefined8 *)(param_1 + 0x268) = uVar13;
    *(undefined1 *)(param_1 + 0x270) = 1;
  }
  else {
    *(undefined8 *)(param_1 + 0x268) = uVar13;
  }
  plVar10 = (long *)(*_DAT_0ed03d68)();
  if (((undefined8 *)*plVar10 == (undefined8 *)0x0) ||
     (plVar14 = *(long **)*plVar10, plVar14 == (long *)0x0)) {
                    /* WARNING: Does not return */
    pcVar11 = (code *)SoftwareBreakpoint(0,0x40f05c0);
    (*pcVar11)();
  }
  iVar5 = (int)plVar14[1];
  *(int *)(plVar14 + 1) = iVar5 + 1;
  if (iVar5 == 0x7fffffff) {
                    /* WARNING: Does not return */
    pcVar11 = (code *)SoftwareBreakpoint(0,0x40f0638);
    (*pcVar11)();
  }
  func_0x00050c80(&local_b0,0xda89c77,0xda89c25,0x199);
  piVar20 = *(int **)(param_1 + 0x2b0);
  if ((piVar20 != (int *)0x0) && (iVar5 = *piVar20, *piVar20 = iVar5 + 1, iVar5 == 0x7fffffff)) {
                    /* WARNING: Does not return */
    pcVar11 = (code *)SoftwareBreakpoint(0,0x40f065c);
    (*pcVar11)();
  }
  uVar13 = *(undefined8 *)(param_1 + 0x2b8);
  local_68 = (int *)func_0x0000f368(0x40);
  *local_68 = 1;
  local_68[2] = 0x3f6e8c0;
  local_68[3] = 0;
  *(undefined1 **)(local_68 + 4) = &SUB_03f6cac0;
  local_68[6] = 0x40ae6c0;
  local_68[7] = 0;
  local_68[8] = 0x40f07ec;
  local_68[9] = 0;
  local_68[10] = 0;
  local_68[0xb] = 0;
  *(int **)(local_68 + 0xc) = piVar20;
  *(undefined8 *)(local_68 + 0xe) = uVar13;
  iVar5 = *piVar12;
  *piVar12 = iVar5 + 1;
  if (iVar5 < 1) {
                    /* WARNING: Does not return */
    pcVar11 = (code *)SoftwareBreakpoint(0,0x40f0644);
    (*pcVar11)();
  }
  if (iVar5 == 0x7fffffff) {
                    /* WARNING: Does not return */
    pcVar11 = (code *)SoftwareBreakpoint(0,0x40f0650);
    (*pcVar11)();
  }
  uVar13 = func_0x06497704(&local_68,piVar12);
  (**(code **)*plVar14)(plVar14,&local_b0,uVar13,0);
  if (local_68 != (int *)0x0) {
    LOAcquire();
    iVar5 = *local_68;
    *local_68 = iVar5 + -1;
    LORelease();
    if (iVar5 == 1) {
      (**(code **)(local_68 + 4))();
    }
  }
  LOAcquire();
  iVar5 = (int)plVar14[1];
  *(int *)(plVar14 + 1) = iVar5 + -1;
  LORelease();
  if (iVar5 == 1) {
    pcVar11 = *(code **)(*plVar14 + 0x18);
    if (pcVar11 == (code *)0x42caa8c) {
      pcVar11 = *(code **)(*plVar14 + 0x10);
    }
    (*pcVar11)(plVar14);
  }
  uVar13 = (*_DAT_0ebb1d18)();
  if (*(char *)(param_1 + 0x218) == '\0') {
    if ((undefined8 *)(param_1 + 0x210) == (undefined8 *)0x0) {
LAB_040f03e4:
                    /* WARNING: Does not return */
      pcVar11 = (code *)SoftwareBreakpoint(1,0x40f03e8);
      (*pcVar11)();
    }
    *(undefined8 *)(param_1 + 0x210) = uVar13;
    *(undefined1 *)(param_1 + 0x218) = 1;
  }
  else {
    *(undefined8 *)(param_1 + 0x210) = uVar13;
  }
  if (((undefined8 *)*plVar10 == (undefined8 *)0x0) ||
     (plVar10 = *(long **)*plVar10, plVar10 == (long *)0x0)) {
                    /* WARNING: Does not return */
    pcVar11 = (code *)SoftwareBreakpoint(0,0x40f05cc);
    (*pcVar11)();
  }
  iVar5 = (int)plVar10[1];
  *(int *)(plVar10 + 1) = iVar5 + 1;
  if (iVar5 == 0x7fffffff) {
                    /* WARNING: Does not return */
    pcVar11 = (code *)SoftwareBreakpoint(0,0x40f0668);
    (*pcVar11)();
  }
  func_0x00050c80(&local_b0,0xda89c77,0xda89c25,0x19f);
  piVar20 = *(int **)(param_1 + 0x2b0);
  if ((piVar20 != (int *)0x0) && (iVar5 = *piVar20, *piVar20 = iVar5 + 1, iVar5 == 0x7fffffff)) {
                    /* WARNING: Does not return */
    pcVar11 = (code *)SoftwareBreakpoint(0,0x40f068c);
    (*pcVar11)();
  }
  uVar13 = *(undefined8 *)(param_1 + 0x2b8);
  local_68 = (int *)func_0x0000f368(0x40);
  *local_68 = 1;
  local_68[2] = 0x3f6e8c0;
  local_68[3] = 0;
  *(undefined1 **)(local_68 + 4) = &SUB_03f6cac0;
  local_68[6] = 0x40ae6c0;
  local_68[7] = 0;
  local_68[8] = 0x40f0cc8;
  local_68[9] = 0;
  local_68[10] = 0;
  local_68[0xb] = 0;
  *(int **)(local_68 + 0xc) = piVar20;
  *(undefined8 *)(local_68 + 0xe) = uVar13;
  iVar5 = *piVar12;
  *piVar12 = iVar5 + 1;
  if (iVar5 < 1) {
                    /* WARNING: Does not return */
    pcVar11 = (code *)SoftwareBreakpoint(0,0x40f0674);
    (*pcVar11)();
  }
  if (iVar5 == 0x7fffffff) {
                    /* WARNING: Does not return */
    pcVar11 = (code *)SoftwareBreakpoint(0,0x40f0680);
    (*pcVar11)();
  }
  uVar13 = func_0x06497704(&local_68,piVar12);
  (**(code **)*plVar10)(plVar10,&local_b0,uVar13,0);
  if (local_68 != (int *)0x0) {
    LOAcquire();
    iVar5 = *local_68;
    *local_68 = iVar5 + -1;
    LORelease();
    if (iVar5 == 1) {
      (**(code **)(local_68 + 4))();
    }
  }
  LOAcquire();
  iVar5 = (int)plVar10[1];
  *(int *)(plVar10 + 1) = iVar5 + -1;
  LORelease();
  if (iVar5 == 1) {
    pcVar11 = *(code **)(*plVar10 + 0x18);
    if (pcVar11 == (code *)0x42caa8c) {
      pcVar11 = *(code **)(*plVar10 + 0x10);
    }
    (*pcVar11)(plVar10);
  }
  LOAcquire();
  iVar5 = *piVar12;
  *piVar12 = iVar5 + -1;
  LORelease();
LAB_040f021c:
  if (iVar5 == 1) {
    (**(code **)(piVar12 + 4))(piVar12);
  }
  return;
LAB_040ef760:
  plVar10 = (long *)plVar10[1];
  goto joined_r0x040ef754;
LAB_040efd98:
  plVar10 = (long *)plVar10[1];
  goto joined_r0x040efd8c;
}


