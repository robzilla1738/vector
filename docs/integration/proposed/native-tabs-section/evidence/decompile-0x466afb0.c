
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

undefined8 * entry(undefined8 *param_1,ulong param_2,undefined8 *param_3,undefined8 param_4)

{
  ulong *puVar1;
  uint uVar2;
  code *pcVar3;
  int iVar4;
  uint *puVar5;
  undefined8 *puVar6;
  long *plVar7;
  ulong uVar8;
  uint *puVar9;
  uint uVar10;
  uint uVar11;
  undefined8 uVar12;
  undefined8 *puVar13;
  long lVar14;
  undefined8 uVar15;
  undefined4 local_b8;
  undefined1 local_b4;
  undefined8 local_b0;
  undefined8 uStack_a8;
  long local_a0;
  int *local_98;
  char local_90;
  undefined4 local_88;
  undefined1 local_84;
  uint *local_80;
  undefined8 uStack_78;
  
  *param_1 = 0xe729150;
  param_1[1] = 0xe7295b0;
  param_1[2] = 0xe7295d8;
  param_1[0xd] = 0xe729610;
  param_1[0xe] = 0xe729640;
  param_1[0x16] = 0xe729690;
  param_1[0x1b] = 0xe7296f0;
  puVar6 = param_1 + 0x1f;
  *puVar6 = 0xe729720;
  param_1[0x62] = 0xe729748;
  param_1[99] = 0xe7297c8;
  param_1[100] = 0xe729888;
  if (((ulong)param_1 & 0xfffffffc00000000) == _DAT_0ebb2088) {
    func_0x000142fc(param_1);
  }
  local_98 = (int *)func_0x0000f368(0x38);
  *local_98 = 1;
  local_98[2] = 0x3fb3c00;
  local_98[3] = 0;
  *(undefined1 **)(local_98 + 4) = &SUB_03899b40;
  local_98[6] = 0x255db00;
  local_98[7] = 0;
  *(code **)(local_98 + 8) = FUN_0466baa4;
  local_98[10] = 0;
  local_98[0xb] = 0;
  *(undefined8 **)(local_98 + 0xc) = param_1;
  local_90 = '\x02';
  func_0x0136e480(param_1,&local_98);
  if ((local_90 != -1) && (local_98 != (int *)0x0)) {
    LOAcquire();
    iVar4 = *local_98;
    *local_98 = iVar4 + -1;
    LORelease();
    if (iVar4 == 1) {
      (**(code **)(local_98 + 4))();
    }
  }
  local_90 = 0xff;
  *param_1 = 0xe729150;
  param_1[1] = 0xe7295b0;
  param_1[2] = 0xe7295d8;
  param_1[0xd] = 0xe729610;
  param_1[0xe] = 0xe729640;
  param_1[0x16] = 0xe729690;
  param_1[0x1b] = 0xe7296f0;
  param_1[0x1f] = 0xe729720;
  param_1[0x62] = 0xe729748;
  param_1[99] = 0xe7297c8;
  param_1[100] = 0xe729888;
  uVar12 = param_3[2];
  uVar15 = *param_3;
  param_1[0x97] = param_3[1];
  param_1[0x96] = uVar15;
  param_1[0x98] = uVar12;
  param_3[1] = 0;
  param_3[2] = 0;
  *param_3 = 0;
  if ((param_2 & 0xfffffffc00000000) == _DAT_0ebb2088) {
    func_0x000142fc(param_2);
  }
  param_1[0x99] = param_2;
  param_1[0x9a] = param_4;
  *(undefined1 *)(param_1 + 0x9f) = 0;
  param_1[0xa0] = 0;
  param_1[0x9b] = 0;
  param_1[0x9d] = 0;
  param_1[0x9c] = 0;
  *(undefined1 *)(param_1 + 0x9e) = 0;
  if (*(char *)(param_1 + 0x8c) != '\0') {
    *(undefined1 *)(param_1 + 0x8c) = 0;
    func_0x00f27fd0(puVar6,param_1 + 0x8c);
  }
  *(undefined4 *)(param_1[0x90] + 0x18) = 1;
  if (*(int *)((long)param_1 + 0x464) != 0x800) {
    *(undefined4 *)((long)param_1 + 0x464) = 0x800;
    func_0x00f27fd0(puVar6,(long)param_1 + 0x464);
  }
  puVar13 = param_1 + 0x96;
  *(undefined1 *)((long)param_1 + 0x1cb) = 1;
  if (*(char *)((long)param_1 + 0x469) != '\0') {
    *(undefined1 *)((long)param_1 + 0x469) = 0;
    func_0x00f27fd0(puVar6,(long)param_1 + 0x469);
  }
  func_0x015377dc(param_1,1);
  func_0x00846944(param_1,param_1 + 0x96);
  lVar14 = param_1[0x59];
  if (lVar14 == 0) {
    iVar4 = func_0x00ee6100();
    if (iVar4 == 0) {
      lVar14 = func_0x012de654(param_1);
    }
    else {
      lVar14 = func_0x0000f368(0x1b0);
      func_0x00ee5b80(lVar14,param_1);
    }
    plVar7 = (long *)param_1[0x59];
    param_1[0x59] = lVar14;
    if (plVar7 != (long *)0x0) {
      (**(code **)(*plVar7 + 8))();
      lVar14 = param_1[0x59];
    }
  }
  if (*(char *)((long)param_1 + 0x4c7) < '\0') {
    func_0x00046bd0(&local_b0,param_1[0x96],param_1[0x97]);
  }
  else {
    uStack_a8 = param_1[0x97];
    local_b0 = *puVar13;
    local_a0 = param_1[0x98];
  }
  func_0x0116d8d8(lVar14,&local_b0);
  if (local_a0 < 0) {
    func_0x00008eb8(local_b0,local_a0 << 1);
  }
  lVar14 = func_0x0000f368(0x140);
  func_0x02a105d0();
  func_0x01b89838(param_1,lVar14);
  if (*(int *)(lVar14 + 0xf0) != 0) {
    *(undefined4 *)(lVar14 + 0xf0) = 0;
    func_0x01a652b0(lVar14,1);
  }
  local_80 = (uint *)CONCAT44(local_80._4_4_,1);
  func_0x01a651a4(lVar14 + 0x118,0xea05568,&local_80);
  if ((((*(int *)(lVar14 + 0xf8) != 2) || (*(int *)(lVar14 + 0xfc) != 6)) ||
      (*(int *)(lVar14 + 0x100) != 2)) || (*(int *)(lVar14 + 0x104) != 6)) {
    *(undefined8 *)(lVar14 + 0x100) = 0x600000002;
    *(undefined8 *)(lVar14 + 0xf8) = 0x600000002;
    func_0x01a652b0(lVar14,1);
  }
  if ((*(byte *)(lVar14 + 0xf4) & 1) == 0) {
    *(undefined1 *)(lVar14 + 0xf4) = 1;
    func_0x01a652b0(lVar14,1);
  }
  lVar14 = _DAT_0ef0a480;
  if (_DAT_0ef0a480 == 0) {
    lVar14 = func_0x042d36f8();
  }
  puVar5 = (uint *)func_0x000ab5b0(lVar14,0x380,0);
  puVar6 = (undefined8 *)func_0x0242d238();
  *puVar6 = 0xe6b2bd0;
  puVar6[1] = 0xe6b2fc0;
  puVar6[2] = 0xe6b2fe8;
  puVar6[0xd] = 0xe6b3020;
  puVar6[0xe] = 0xe6b3050;
  puVar6[0x16] = 0xe6b30a0;
  puVar6[0x1f] = 0xe6b3130;
  puVar6[0x1b] = 0xe6b3100;
  puVar6[0x69] = 0;
  puVar6[0x6a] = 0xffff000000000000;
  *(undefined1 *)(puVar6 + 0x6b) = 1;
  puVar6[0x6c] = 0;
  *(undefined1 *)(puVar6 + 0x6d) = 0;
  puVar6[0x6e] = 0;
  *(undefined4 *)(puVar6 + 0x6f) = 0;
  *(undefined1 *)((long)puVar6 + 0x37c) = 0;
  if (*(char *)((long)puVar6 + 0x169) != '\0') {
                    /* WARNING: Does not return */
    pcVar3 = (code *)SoftwareBreakpoint(0,0x466b9a8);
    (*pcVar3)();
  }
  puVar1 = param_1 + 0x9b;
  func_0x007793fc(param_1,puVar5,param_1[0x33]);
  if (((ulong)puVar5 & 0xfffffffc00000000) == _DAT_0ebb2088) {
    func_0x000142fc(puVar5);
  }
  if ((*puVar1 & 0xfffffffc00000000) == _DAT_0ebb2088) {
    func_0x00022a3c();
  }
  *puVar1 = (ulong)puVar5;
  if (*(char *)((long)puVar5 + 0x1a9) != '\0') {
    *(undefined1 *)((long)puVar5 + 0x1a9) = 0;
    func_0x00f27fd0(puVar6 + 0x1f,(long)puVar5 + 0x1a9);
    puVar5 = (uint *)*puVar1;
  }
  puVar9 = puVar5 + 0xc4;
  if ((char)puVar5[0xc6] == '\0') {
    if (puVar9 == (uint *)0x0) {
                    /* WARNING: Does not return */
      pcVar3 = (code *)SoftwareBreakpoint(1,0x466b9b0);
      (*pcVar3)();
    }
    puVar5[0xc4] = 0xc;
    puVar5[0xc5] = 0xc;
    *(undefined1 *)(puVar5 + 0xc6) = 1;
  }
  else {
    puVar9[0] = 0xc;
    puVar9[1] = 0xc;
  }
  plVar7 = *(long **)(puVar5 + 0x62);
  if (plVar7 != (long *)0x0) {
    (**(code **)(*plVar7 + 0x2f8))(plVar7,puVar5);
  }
  func_0x00630474(puVar5,0);
  local_80 = puVar5;
  func_0x008a71d0(puVar5 + 0x4c,0x18,1,&local_80);
  func_0x01256ae8(puVar5);
  func_0x027d1a60(*puVar1,0xc0000000c,1);
  uVar12 = uRam000000000df40a98;
  puVar5 = _DAT_0df40a90;
  uStack_78 = uRam000000000df40a98;
  local_80 = _DAT_0df40a90;
  func_0x01aede60(*puVar1 + 0xd8,0xea05488,&local_80);
  lVar14 = _DAT_0ef0a480;
  if (_DAT_0ef0a480 == 0) {
    lVar14 = func_0x042d36f8();
  }
  uVar8 = func_0x000ab5b0(lVar14,0x398,0);
  lVar14 = func_0x0a6c7d3c(uVar8,0xc);
  if (*(char *)(lVar14 + 0x169) != '\0') {
                    /* WARNING: Does not return */
    pcVar3 = (code *)SoftwareBreakpoint(0,0x466b9d8);
    (*pcVar3)();
  }
  func_0x007793fc(param_1,uVar8,param_1[0x33]);
  if ((uVar8 & 0xfffffffc00000000) == _DAT_0ebb2088) {
    func_0x000142fc(uVar8);
  }
  if ((param_1[0x9d] & 0xfffffffc00000000) == _DAT_0ebb2088) {
    func_0x00022a3c();
  }
  param_1[0x9d] = uVar8;
  if (*(char *)(uVar8 + 0x1a9) != '\0') {
    *(undefined1 *)(uVar8 + 0x1a9) = 0;
    func_0x00f27fd0(uVar8 + 0xf8,uVar8 + 0x1a9);
    uVar8 = param_1[0x9d];
  }
  *(undefined4 *)(uVar8 + 0x380) = 0xe2;
  *(undefined1 *)(uVar8 + 900) = 1;
  uStack_78 = uVar12;
  local_80 = puVar5;
  func_0x01aede60(param_1[0x9d] + 0xd8,0xea05488,&local_80);
  (**(code **)(*(long *)param_1[0x9d] + 0xa0))((long *)param_1[0x9d],0);
  lVar14 = _DAT_0ef0a480;
  if (_DAT_0ef0a480 == 0) {
    lVar14 = func_0x042d36f8();
  }
  uVar8 = func_0x000ab5b0(lVar14,0x460,0);
  lVar14 = (long)*(char *)((long)param_1 + 0x4c7);
  if (lVar14 < 0) {
    puVar13 = (undefined8 *)param_1[0x96];
    lVar14 = param_1[0x97];
  }
  func_0x01b8a8e0(uVar8,puVar13,lVar14,5,0x1000,0);
  if (*(char *)(uVar8 + 0x169) != '\0') {
                    /* WARNING: Does not return */
    pcVar3 = (code *)SoftwareBreakpoint(0,0x466b9e4);
    (*pcVar3)();
  }
  func_0x007793fc(param_1,uVar8,param_1[0x33]);
  if ((uVar8 & 0xfffffffc00000000) == _DAT_0ebb2088) {
    func_0x000142fc(uVar8);
  }
  if ((param_1[0x9c] & 0xfffffffc00000000) == _DAT_0ebb2088) {
    func_0x00022a3c();
  }
  param_1[0x9c] = uVar8;
  if (*(char *)(uVar8 + 0x1a9) != '\0') {
    *(undefined1 *)(uVar8 + 0x1a9) = 0;
    func_0x00f27fd0(uVar8 + 0xf8,uVar8 + 0x1a9);
    uVar8 = param_1[0x9c];
  }
  func_0x01b89d00(uVar8,3);
  func_0x005a0d40(param_1[0x9c],4);
  lVar14 = param_1[0x9c];
  if (*(char *)(lVar14 + 0x3b6) != '\0') {
    *(undefined1 *)(lVar14 + 0x3b6) = 0;
    func_0x00f28308(lVar14);
    func_0x007e1964(lVar14,2);
    func_0x00f27fd0(lVar14 + 0xf8,lVar14 + 0x3b6);
    lVar14 = param_1[0x9c];
  }
  func_0x0273f370(lVar14,0);
  local_b8 = 0;
  local_b4 = 1;
  func_0x008486f0(param_1[0x9c],&local_b8);
  plVar7 = (long *)param_1[0x9c];
  puVar5 = *(uint **)(plVar7[0x6b] + 0x48);
  if ((puVar5 != (uint *)0x0) && (uVar11 = *puVar5, *puVar5 = uVar11 + 1, 0xfffffffe < uVar11)) {
                    /* WARNING: Does not return */
    pcVar3 = (code *)SoftwareBreakpoint(0,0x466b9f0);
    (*pcVar3)();
  }
  uVar11 = puVar5[0x11];
  if (uVar11 == 0xffffffff) {
    func_0x02226140(puVar5);
    uVar11 = puVar5[0x11];
  }
  uVar2 = puVar5[0x10];
  if (uVar2 == 0xffffffff) {
    func_0x02226140(puVar5);
    uVar2 = puVar5[0x10];
  }
  uVar10 = puVar5[0x12];
  if (uVar10 == 0xffffffff) {
    func_0x02226140(puVar5);
    uVar10 = puVar5[0x12];
  }
  puVar9 = (uint *)func_0x01ca7680(puVar5,0xc - uVar11,uVar2,uVar10);
  if ((puVar9 != (uint *)0x0) && (uVar11 = *puVar9, *puVar9 = uVar11 + 1, 0xfffffffe < uVar11)) {
                    /* WARNING: Does not return */
    pcVar3 = (code *)SoftwareBreakpoint(0,0x466b9fc);
    (*pcVar3)();
  }
  uVar11 = puVar9[0x10];
  if (uVar11 == 0xffffffff) {
    func_0x02226140(puVar9);
    uVar11 = puVar9[0x10];
  }
  local_80 = (uint *)func_0x01ca7680(puVar9,0,uVar11,500);
  if ((local_80 != (uint *)0x0) && (uVar11 = *local_80, *local_80 = uVar11 + 1, 0xfffffffe < uVar11)
     ) {
                    /* WARNING: Does not return */
    pcVar3 = (code *)SoftwareBreakpoint(0,0x466ba08);
    (*pcVar3)();
  }
  if (puVar9 != (uint *)0x0) {
    uVar11 = *puVar9;
    uVar2 = uVar11 - 1;
    *puVar9 = uVar2;
    if (uVar11 == 0) {
                    /* WARNING: Does not return */
      pcVar3 = (code *)SoftwareBreakpoint(0,0x466ba14);
      (*pcVar3)();
    }
    if (uVar2 == 0) {
      uVar12 = func_0x0114c7c4(puVar9);
      func_0x00008eb8(uVar12,0x50);
    }
  }
  if (puVar5 != (uint *)0x0) {
    uVar11 = *puVar5;
    uVar2 = uVar11 - 1;
    *puVar5 = uVar2;
    if (uVar11 == 0) {
                    /* WARNING: Does not return */
      pcVar3 = (code *)SoftwareBreakpoint(0,0x466ba20);
      (*pcVar3)();
    }
    if (uVar2 == 0) {
      uVar12 = func_0x0114c7c4(puVar5);
      func_0x00008eb8(uVar12,0x50);
    }
  }
  (**(code **)(*plVar7 + 0x3d8))(plVar7,&local_80);
  if (local_80 != (uint *)0x0) {
    uVar11 = *local_80;
    uVar2 = uVar11 - 1;
    *local_80 = uVar2;
    if (uVar11 == 0) {
                    /* WARNING: Does not return */
      pcVar3 = (code *)SoftwareBreakpoint(0,0x466ba2c);
      (*pcVar3)();
    }
    if (uVar2 == 0) {
      uVar12 = func_0x0114c7c4();
      func_0x00008eb8(uVar12,0x50);
    }
  }
  local_80 = (uint *)0x0;
  uStack_78 = 0;
  func_0x0312bb58(param_1,&local_80,8);
  puVar13 = param_1 + 0x1d;
  puVar6 = (undefined8 *)*puVar13;
  lVar14 = 0;
  if (puVar6 != (undefined8 *)0x0) {
    do {
      while ((ulong)puVar6[4] < 0xea048d1) {
        if (0xea048cf < (ulong)puVar6[4]) {
          if (puVar6 == puVar13) {
            lVar14 = 0;
          }
          else {
            lVar14 = puVar6[6];
          }
          goto LAB_0466b87c;
        }
        puVar6 = (undefined8 *)puVar6[1];
        if (puVar6 == (undefined8 *)0x0) {
          lVar14 = 0;
          goto LAB_0466b87c;
        }
      }
      puVar6 = (undefined8 *)*puVar6;
    } while (puVar6 != (undefined8 *)0x0);
    lVar14 = 0;
  }
LAB_0466b87c:
  *(undefined4 *)(lVar14 + 0x10) = 0;
  plVar7 = *(long **)(lVar14 + 0x38);
  *(undefined8 *)(lVar14 + 0x38) = 0;
  if (plVar7 != (long *)0x0) {
    (**(code **)(*plVar7 + 8))();
  }
  func_0x0136ee40(param_1);
  for (puVar6 = (undefined8 *)param_1[0x1d]; puVar6 != (undefined8 *)0x0;
      puVar6 = (undefined8 *)*puVar6) {
    while ((ulong)puVar6[4] < 0xea04cb1) {
      if (0xea04caf < (ulong)puVar6[4]) {
        if (puVar6 == puVar13) goto LAB_0466b8bc;
        lVar14 = puVar6[6];
        goto LAB_0466b8c0;
      }
      puVar6 = (undefined8 *)puVar6[1];
      if (puVar6 == (undefined8 *)0x0) goto LAB_0466b8bc;
    }
  }
LAB_0466b8bc:
  lVar14 = 0;
LAB_0466b8c0:
  puVar6 = (undefined8 *)func_0x0000f368(0x30);
  puVar6[1] = 0;
  puVar6[2] = 0;
  *(undefined2 *)(puVar6 + 3) = 0;
  *puVar6 = 0xe34ed88;
  *(undefined8 *)((long)puVar6 + 0x24) = 0x4100000041000000;
  *(undefined8 *)((long)puVar6 + 0x1c) = 0x4100000041000000;
  plVar7 = *(long **)(lVar14 + 0x318);
  *(undefined8 **)(lVar14 + 0x318) = puVar6;
  if (plVar7 != (long *)0x0) {
    (**(code **)(*plVar7 + 8))();
  }
  func_0x00630474(lVar14,0);
  func_0x005a117c(lVar14);
  if (param_1[0x99] != 0) {
    uVar12 = param_1[0x9b];
    local_88 = 0xe2;
    local_84 = 0;
    func_0x00df4920(&local_80,param_1[0x99],&local_88,0xc,0);
    func_0x005a10a0(uVar12,&local_80);
    func_0x00846840(&local_80);
    local_80 = (uint *)CONCAT35(local_80._5_3_,0xe2);
    (**(code **)(*(long *)param_1[0x9c] + 1000))((long *)param_1[0x9c],&local_80);
    return param_1;
  }
                    /* WARNING: Does not return */
  pcVar3 = (code *)SoftwareBreakpoint(0,0x466ba38);
  (*pcVar3)();
}

