// func FUN_041f01f8 @ 041f01f8 size 1504

void FUN_041f01f8(long *param_1)

{
  uint uVar1;
  code *pcVar2;
  uint uVar3;
  uint *puVar4;
  uint *puVar5;
  long *plVar6;
  undefined4 *puVar7;
  uint uVar8;
  uint *puVar9;
  long *plVar10;
  long *plVar11;
  undefined4 local_c0;
  undefined1 local_bc;
  undefined8 local_b8;
  undefined8 local_b0;
  undefined1 local_a8;
  undefined8 local_a0;
  undefined1 local_98;
  uint *local_90 [4];
  undefined1 local_70;
  char local_68;
  undefined4 local_60;
  undefined1 local_5c;
  undefined4 local_58;
  undefined1 local_54;
  undefined4 local_50;
  undefined1 local_4c;
  undefined4 local_48;
  undefined1 local_44;
  
  (**(code **)(*param_1 + 0x460))(param_1,L"Ask Aside",9);
  plVar10 = (long *)param_1[0x99];
  if (*(int *)((long)plVar10 + 0x34c) != 0x101a) {
    *(undefined4 *)((long)plVar10 + 0x34c) = 0x101a;
    FUN_02740540(plVar10);
    plVar10 = (long *)param_1[0x99];
  }
  puVar9 = *(uint **)(plVar10[0x6b] + 0x48);
  if (puVar9 != (uint *)0x0) {
    uVar3 = *puVar9;
    *puVar9 = uVar3 + 1;
    if (0xfffffffe < uVar3) {
                    /* WARNING: Does not return */
      pcVar2 = (code *)SoftwareBreakpoint(0,0x41f079c);
      (*pcVar2)();
    }
    plVar10 = (long *)param_1[0x99];
  }
  uVar3 = puVar9[0x11];
  if (uVar3 == 0xffffffff) {
    FUN_02226140(puVar9);
    uVar3 = puVar9[0x11];
  }
  uVar1 = puVar9[0x10];
  if (uVar1 == 0xffffffff) {
    FUN_02226140(puVar9);
    uVar1 = puVar9[0x10];
  }
  uVar8 = puVar9[0x12];
  if (uVar8 == 0xffffffff) {
    FUN_02226140(puVar9);
    uVar8 = puVar9[0x12];
  }
  puVar4 = puVar9;
  FUN_01ca7680(puVar9,0xe - uVar3,uVar1,uVar8);
  if ((puVar4 != (uint *)0x0) && (uVar3 = *puVar4, *puVar4 = uVar3 + 1, 0xfffffffe < uVar3)) {
                    /* WARNING: Does not return */
    pcVar2 = (code *)SoftwareBreakpoint(0,0x41f07a8);
    (*pcVar2)();
  }
  uVar3 = puVar4[0x10];
  if (uVar3 == 0xffffffff) {
    FUN_02226140(puVar4);
    uVar3 = puVar4[0x10];
  }
  puVar5 = puVar4;
  FUN_01ca7680(puVar4,0,uVar3,500);
  local_90[0] = puVar5;
  if ((puVar5 != (uint *)0x0) && (uVar3 = *puVar5, *puVar5 = uVar3 + 1, 0xfffffffe < uVar3)) {
                    /* WARNING: Does not return */
    pcVar2 = (code *)SoftwareBreakpoint(0,0x41f07b4);
    (*pcVar2)();
  }
  (**(code **)(*plVar10 + 0x3d8))(plVar10,local_90);
  if (local_90[0] != (uint *)0x0) {
    uVar3 = *local_90[0];
    uVar1 = uVar3 - 1;
    *local_90[0] = uVar1;
    if (uVar3 == 0) {
                    /* WARNING: Does not return */
      pcVar2 = (code *)SoftwareBreakpoint(0,0x41f07c0);
      (*pcVar2)();
    }
    if (uVar1 == 0) {
      FUN_0114c7c4();
      FUN_00008eb8();
    }
  }
  if (puVar4 != (uint *)0x0) {
    uVar3 = *puVar4;
    uVar1 = uVar3 - 1;
    *puVar4 = uVar1;
    if (uVar3 == 0) {
                    /* WARNING: Does not return */
      pcVar2 = (code *)SoftwareBreakpoint(0,0x41f07cc);
      (*pcVar2)();
    }
    if (uVar1 == 0) {
      FUN_0114c7c4(puVar4);
      FUN_00008eb8();
    }
  }
  if ((*(byte *)(param_1 + 0xcd) & 1) == 0) {
    plVar10 = param_1;
    FUN_041f4898();
    local_48 = 0x66a;
    if (plVar10 == (long *)0x0) {
      local_44 = 0;
    }
    else {
      (**(code **)(*plVar10 + 0x428))();
      local_48 = 0x66a;
      if (((ulong)plVar10 & 0x100000000) != 0) {
        local_48 = SUB84(plVar10,0);
      }
      local_44 = (undefined1)(((ulong)plVar10 & 0x100000000) >> 0x20);
    }
  }
  else {
    local_44 = 0;
    local_48 = 0xfe;
  }
  FUN_01eabb50(param_1,0,&local_48);
  if ((*(byte *)(param_1 + 0xcd) & 1) == 0) {
    plVar10 = param_1;
    FUN_041f4898();
    local_50 = 0x66d;
    if (plVar10 == (long *)0x0) {
      local_4c = 0;
    }
    else {
      (**(code **)(*plVar10 + 0x428))();
      local_50 = 0x66d;
      if (((ulong)plVar10 & 0x100000000) != 0) {
        local_50 = SUB84(plVar10,0);
      }
      local_4c = (undefined1)(((ulong)plVar10 & 0x100000000) >> 0x20);
    }
  }
  else {
    local_4c = 0;
    local_50 = 0xfe;
  }
  FUN_01eabb50(param_1,1,&local_50);
  if ((*(byte *)(param_1 + 0xcd) & 1) == 0) {
    plVar10 = param_1;
    FUN_041f4898();
    local_58 = 0x66f;
    if (plVar10 == (long *)0x0) {
      local_54 = 0;
    }
    else {
      (**(code **)(*plVar10 + 0x428))();
      local_58 = 0x66f;
      if (((ulong)plVar10 & 0x100000000) != 0) {
        local_58 = SUB84(plVar10,0);
      }
      local_54 = (undefined1)(((ulong)plVar10 & 0x100000000) >> 0x20);
    }
  }
  else {
    local_54 = 0;
    local_58 = 0xfe;
  }
  FUN_01eabb50(param_1,2,&local_58);
  plVar10 = param_1;
  FUN_041f4898();
  local_60 = 0x66e;
  if (plVar10 == (long *)0x0) {
    local_5c = 0;
  }
  else {
    (**(code **)(*plVar10 + 0x428))();
    local_60 = 0x66e;
    if (((ulong)plVar10 & 0x100000000) != 0) {
      local_60 = SUB84(plVar10,0);
    }
    local_5c = (undefined1)(((ulong)plVar10 & 0x100000000) >> 0x20);
  }
  FUN_01eabb50(param_1,3,&local_60);
  local_b8 = 0;
  local_b0 = 0xffff000000000000;
  local_a8 = 1;
  local_a0 = 0;
  local_98 = 0;
  local_90[0] = (uint *)((ulong)local_90[0] & 0xffffffffffffff00);
  local_70 = 0xff;
  FUN_00b6333c(local_90,&local_b8);
  local_68 = '\x01';
  (**(code **)(*param_1 + 0x458))(param_1,0,local_90);
  if (local_68 != '\0') {
    FUN_00846840(local_90);
  }
  FUN_00846840(&local_b8);
  local_b8 = 0;
  local_b0 = 0xffff000000000000;
  local_a8 = 1;
  local_a0 = 0;
  local_98 = 0;
  local_90[0] = (uint *)((ulong)local_90[0] & 0xffffffffffffff00);
  local_70 = 0xff;
  FUN_00b6333c(local_90,&local_b8);
  local_68 = '\x01';
  (**(code **)(*param_1 + 0x458))(param_1,1,local_90);
  if (local_68 != '\0') {
    FUN_00846840(local_90);
  }
  FUN_00846840(&local_b8);
  local_b8 = 0;
  local_b0 = 0xffff000000000000;
  local_a8 = 1;
  local_a0 = 0;
  local_98 = 0;
  local_90[0] = (uint *)((ulong)local_90[0] & 0xffffffffffffff00);
  local_70 = 0xff;
  FUN_00b6333c(local_90,&local_b8);
  local_68 = '\x01';
  (**(code **)(*param_1 + 0x458))(param_1,2,local_90);
  if (local_68 != '\0') {
    FUN_00846840(local_90);
  }
  FUN_00846840(&local_b8);
  local_b8 = 0;
  local_b0 = 0xffff000000000000;
  local_a8 = 1;
  local_a0 = 0;
  local_98 = 0;
  local_90[0] = (uint *)((ulong)local_90[0] & 0xffffffffffffff00);
  local_70 = 0xff;
  FUN_00b6333c(local_90,&local_b8);
  local_68 = '\x01';
  (**(code **)(*param_1 + 0x458))(param_1,3,local_90);
  if (local_68 != '\0') {
    FUN_00846840(local_90);
  }
  FUN_00846840(&local_b8);
  plVar10 = param_1;
  FUN_005a0ff0();
  if (plVar10 == (long *)0x0) goto LAB_041f0754;
  if ((char)param_1[0xcd] == '\0') {
    plVar10 = param_1;
    FUN_041f4898();
    if ((plVar10 == (long *)0x0) ||
       ((**(code **)(*plVar10 + 0x420))(), ((ulong)plVar10 >> 0x20 & 1) == 0)) {
      plVar10 = param_1;
      FUN_005a0ff0();
      local_c0 = 0;
      if (plVar10 == (long *)0x0) goto LAB_041f0728;
      FUN_00f281c8();
    }
    plVar6 = plVar10;
    FUN_018bb0c0();
    uVar3 = 0xff000000;
    if ((int)plVar6 != 0) {
      uVar3 = 0xffffffff;
    }
    plVar6 = param_1;
    FUN_005a0ff0();
    plVar11 = (long *)(ulong)uVar3;
    if (plVar6 != (long *)0x0) {
      FUN_00f281c8();
      plVar11 = plVar6;
    }
    plVar6 = param_1;
    FUN_041f4898();
    if (plVar6 != (long *)0x0) {
      (**(code **)(*plVar6 + 0x428))();
      uVar3 = (uint)plVar11;
      if (((ulong)plVar6 & 0x100000000) != 0) {
        uVar3 = (uint)plVar6;
      }
      plVar11 = (long *)(ulong)uVar3;
    }
    FUN_00dcec40(DAT_0df50c1c,plVar11,plVar10);
    local_c0 = SUB84(plVar11,0);
  }
  else {
    FUN_00f281c8();
    local_c0 = SUB84(plVar10,0);
  }
LAB_041f0728:
  local_bc = 1;
  puVar7 = &local_c0;
  FUN_0275f0c0(DAT_0df50c0c,puVar7,0);
  FUN_00f27a00(param_1,puVar7);
LAB_041f0754:
  if (puVar9 != (uint *)0x0) {
    uVar3 = *puVar9;
    uVar1 = uVar3 - 1;
    *puVar9 = uVar1;
    if (uVar3 == 0) {
                    /* WARNING: Does not return */
      pcVar2 = (code *)SoftwareBreakpoint(0,0x41f07d8);
      (*pcVar2)();
    }
    if (uVar1 == 0) {
      FUN_0114c7c4(puVar9);
      FUN_00008eb8();
    }
  }
  return;
}


