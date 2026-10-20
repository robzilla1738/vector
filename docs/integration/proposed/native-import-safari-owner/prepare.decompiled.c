
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void entry(long param_1,undefined8 *param_2,undefined1 param_3)

{
  ulong *puVar1;
  code *pcVar2;
  int iVar3;
  undefined8 uVar4;
  long *plVar5;
  undefined4 *puVar6;
  undefined4 *puVar7;
  int *piVar8;
  ulong uVar9;
  ulong uVar10;
  ulong uVar11;
  ulong uVar12;
  undefined1 auStack_a0 [32];
  undefined8 local_80;
  ulong uStack_78;
  ulong local_70;
  
  uVar4 = (*_DAT_0ebb1d18)();
  *(undefined8 *)(param_1 + 0xc0) = uVar4;
  *(undefined1 *)(param_1 + 0x298) = param_3;
  local_80 = 0;
  uStack_78 = 0;
  local_70 = 0;
  if (*(char *)((long)param_2 + 0x17) < '\0') {
    func_0x00018218(&local_80,*param_2,param_2[1]);
  }
  else {
    uStack_78 = param_2[1];
    local_80 = *param_2;
    local_70 = param_2[2];
  }
  uVar10 = uStack_78;
  if ((local_70 & 0x8000000000000000) == 0) {
    uVar10 = local_70 >> 0x38;
  }
  if (uVar10 == 0) {
    plVar5 = (long *)func_0x0091d580(0xda89cb6,1,4,5,1);
    if (*(code **)(*plVar5 + 0x30) == (code *)&SUB_001b8ac0) {
      func_0x001b8ac0(plVar5,0);
    }
    else {
      (**(code **)(*plVar5 + 0x30))(plVar5,0);
    }
    if (*(long **)(param_1 + 0x28) == (long *)0x0) {
                    /* WARNING: Does not return */
      pcVar2 = (code *)SoftwareBreakpoint(0,0x40ee960);
      (*pcVar2)();
    }
    (**(code **)(**(long **)(param_1 + 0x28) + 0x10))();
  }
  else {
    puVar1 = (ulong *)(param_1 + 8);
    func_0x00050c80(auStack_a0,0xda89c69,0xda89c25,0x13c);
    uVar10 = (ulong)puVar1 & 0xfffffffc00000000;
    if (uVar10 == _DAT_0ebb2088) {
      func_0x000142fc(param_1 + 8);
    }
    uVar11 = (ulong)auStack_a0 & 0xfffffffc00000000;
    if (uVar11 == _DAT_0ebb2088) {
      func_0x000142fc(auStack_a0);
    }
    if (uVar10 == _DAT_0ebb2088) {
      func_0x00022a3c(param_1 + 8);
    }
    uVar9 = *puVar1;
    if ((uVar9 & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x000142fc(uVar9);
    }
    if ((uVar9 & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x000142fc(uVar9);
    }
    if ((uVar9 & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x00022a3c(uVar9);
    }
    puVar6 = (undefined4 *)func_0x0000f368(0x50);
    *puVar6 = 1;
    *(undefined8 *)(puVar6 + 2) = 0x40f2970;
    *(undefined8 *)(puVar6 + 4) = 0x40a9278;
    *(undefined8 *)(puVar6 + 6) = 0x255db00;
    *(code **)(puVar6 + 8) = FUN_040ee974;
    *(undefined8 *)(puVar6 + 10) = 0;
    *(ulong *)(puVar6 + 0xc) = uVar9;
    if (*(char *)((long)param_2 + 0x17) < '\0') {
      func_0x00018218(puVar6 + 0xe,*param_2,param_2[1]);
    }
    else {
      uVar4 = *param_2;
      *(undefined8 *)(puVar6 + 0x10) = param_2[1];
      *(undefined8 *)(puVar6 + 0xe) = uVar4;
      *(undefined8 *)(puVar6 + 0x12) = param_2[2];
    }
    if (uVar10 == _DAT_0ebb2088) {
      func_0x000142fc(param_1 + 8);
    }
    if (uVar11 == _DAT_0ebb2088) {
      func_0x000142fc(auStack_a0);
    }
    puVar7 = (undefined4 *)func_0x0000f368(0x30);
    *puVar7 = 1;
    *(undefined8 *)(puVar7 + 2) = 0x5a224c8;
    *(undefined8 *)(puVar7 + 4) = 0x1e2ef00;
    *(undefined8 *)(puVar7 + 6) = 0x255db00;
    *(undefined8 *)(puVar7 + 8) = 0x40ee9e8;
    func_0x0774f318(*(undefined8 *)(param_1 + 0x18),auStack_a0,puVar6,puVar7);
    if (uVar10 == _DAT_0ebb2088) {
      func_0x00022a3c(param_1 + 8);
    }
    if (uVar11 == _DAT_0ebb2088) {
      func_0x00022a3c(auStack_a0);
      if (uVar11 == _DAT_0ebb2088) {
        func_0x00022a3c(auStack_a0);
      }
    }
    func_0x00050c80(auStack_a0,0xda89c69,0xda89c25,0x140);
    if (uVar10 == _DAT_0ebb2088) {
      func_0x000142fc(param_1 + 8);
    }
    uVar11 = (ulong)auStack_a0 & 0xfffffffc00000000;
    if (uVar11 == _DAT_0ebb2088) {
      func_0x000142fc(auStack_a0);
    }
    if (uVar10 == _DAT_0ebb2088) {
      func_0x00022a3c(param_1 + 8);
    }
    uVar9 = *puVar1;
    if ((uVar9 & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x000142fc(uVar9);
    }
    if ((uVar9 & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x000142fc(uVar9);
    }
    if ((uVar9 & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x00022a3c(uVar9);
    }
    uVar12 = _DAT_0ebb2088;
    puVar6 = (undefined4 *)func_0x0000f368(0x50);
    *puVar6 = 1;
    *(undefined8 *)(puVar6 + 2) = 0x40f29c0;
    *(undefined8 *)(puVar6 + 4) = 0x398fb80;
    *(undefined8 *)(puVar6 + 6) = 0x255db00;
    *(undefined8 *)(puVar6 + 8) = 0x40eea44;
    *(undefined8 *)(puVar6 + 10) = 0;
    *(ulong *)(puVar6 + 0xc) = uVar9;
    *(ulong *)(puVar6 + 0x10) = uStack_78;
    *(undefined8 *)(puVar6 + 0xe) = local_80;
    *(ulong *)(puVar6 + 0x12) = local_70;
    local_80 = 0;
    uStack_78 = 0;
    local_70 = 0;
    if (uVar10 == uVar12) {
      func_0x000142fc(param_1 + 8);
      uVar12 = _DAT_0ebb2088;
    }
    if (uVar11 == uVar12) {
      func_0x000142fc(auStack_a0);
    }
    piVar8 = *(int **)(param_1 + 0x2b0);
    if ((piVar8 != (int *)0x0) && (iVar3 = *piVar8, *piVar8 = iVar3 + 1, iVar3 == 0x7fffffff)) {
                    /* WARNING: Does not return */
      pcVar2 = (code *)SoftwareBreakpoint(0,0x40ee96c);
      (*pcVar2)();
    }
    uVar4 = *(undefined8 *)(param_1 + 0x2b8);
    puVar7 = (undefined4 *)func_0x0000f368(0x40);
    *puVar7 = 1;
    *(undefined8 *)(puVar7 + 2) = 0x2979d00;
    *(undefined8 *)(puVar7 + 4) = 0x3f6cac0;
    *(undefined8 *)(puVar7 + 6) = 0x40ae6c0;
    *(undefined8 *)(puVar7 + 8) = 0x40eeb84;
    *(undefined8 *)(puVar7 + 10) = 0;
    *(int **)(puVar7 + 0xc) = piVar8;
    *(undefined8 *)(puVar7 + 0xe) = uVar4;
    func_0x01991228(*(undefined8 *)(param_1 + 0x18),auStack_a0,puVar6,puVar7);
    if (uVar10 == _DAT_0ebb2088) {
      func_0x00022a3c(puVar1);
    }
    if (uVar11 == _DAT_0ebb2088) {
      func_0x00022a3c(auStack_a0);
      if (uVar11 == _DAT_0ebb2088) {
        func_0x00022a3c(auStack_a0);
      }
    }
  }
  if ((long)local_70 < 0) {
    func_0x00008eb8(local_80,local_70 & 0x7fffffffffffffff);
  }
  return;
}


