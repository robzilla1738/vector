
/* WARNING: Control flow encountered bad instruction data */
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

undefined8 * entry(undefined8 *param_1,undefined8 param_2,ulong param_3,ulong param_4,ulong param_5)

{
  int iVar1;
  int *piVar2;
  undefined8 *puVar3;
  undefined8 uVar4;
  ulong uVar5;
  undefined8 *puVar6;
  
  *param_1 = 0xe2b7f08;
  piVar2 = (int *)func_0x0000f368(8);
  *piVar2 = 0;
  *(undefined1 *)(piVar2 + 1) = 0;
  if ((piVar2 != (int *)0x0) && (iVar1 = *piVar2, *piVar2 = iVar1 + 1, iVar1 == 0x7fffffff)) {
                    /* WARNING: Bad instruction - Truncating control flow here */
    halt_baddata();
  }
  param_1[1] = piVar2;
  param_1[2] = param_1;
  *param_1 = 0xe291648;
  puVar6 = param_1 + 3;
  *puVar6 = 0xe2b7f08;
  piVar2 = (int *)func_0x0000f368(8);
  *piVar2 = 0;
  *(undefined1 *)(piVar2 + 1) = 0;
  if ((piVar2 != (int *)0x0) && (iVar1 = *piVar2, *piVar2 = iVar1 + 1, iVar1 == 0x7fffffff)) {
                    /* WARNING: Bad instruction - Truncating control flow here */
    halt_baddata();
  }
  param_1[3] = 0xe22e660;
  param_1[4] = piVar2;
  param_1[5] = puVar6;
  param_1[6] = 0xe119348;
  func_0x017ea0e0(param_1 + 7);
  *param_1 = 0xe119a30;
  param_1[3] = 0xe119a88;
  param_1[6] = 0xe119ac0;
  param_1[0x16] = param_3;
  param_1[0x17] = param_4;
  if ((param_5 & 0xfffffffc00000000) == _DAT_0ebb2088) {
                    /* WARNING: Bad instruction - Truncating control flow here */
    halt_baddata();
  }
  param_1[0x18] = param_5;
  *(undefined4 *)(param_1 + 0x19) = 0;
  puVar3 = (undefined8 *)func_0x0000f368(0x98);
  puVar3[1] = 0;
  *puVar3 = 0;
  puVar3[3] = 0;
  puVar3[2] = 0;
  puVar3[5] = 0;
  puVar3[4] = 0;
  puVar3[7] = 0;
  puVar3[6] = 0;
  puVar3[8] = 0;
  puVar3[9] = puVar3 + 9;
  puVar3[10] = puVar3 + 9;
  puVar3[0xb] = 0;
  *(undefined4 *)(puVar3 + 0xc) = 0;
  *(undefined4 *)(puVar3 + 0xd) = 0;
  puVar3[0xe] = 0;
  puVar3[0xf] = 0;
  *(undefined8 *)((long)puVar3 + 0x7e) = 0;
  if ((param_3 & 0xfffffffc00000000) == _DAT_0ebb2088) {
    func_0x000142fc(param_3);
  }
  puVar3[0x11] = param_3;
  if ((param_4 & 0xfffffffc00000000) == _DAT_0ebb2088) {
    func_0x000142fc(param_4);
  }
  puVar3[0x12] = param_4;
  param_1[0x1a] = puVar3;
  uVar4 = func_0x0000f368(0x98);
  uVar4 = func_0x02bdc7d8(uVar4,param_2);
  param_1[0x1e] = 0;
  param_1[0x1f] = 0;
  param_1[0x1d] = 0;
  param_1[0x1b] = uVar4;
  param_1[0x1c] = param_1 + 0x1d;
  param_1[0x20] = 0;
  param_1[0x21] = 0;
  param_1[0x22] = param_1 + 0x22;
  param_1[0x23] = param_1 + 0x22;
  param_1[0x24] = 0;
  *(undefined4 *)(param_1 + 0x25) = 0;
  param_1[0x26] = 0;
  if (((ulong)param_1 & 0xfffffffc00000000) == _DAT_0ebb2088) {
    func_0x000142fc(param_1);
  }
  uVar5 = _DAT_0ebb2088;
  param_1[0x27] = param_1;
  param_1[0x28] = 0;
  if (((ulong)param_1 & 0xfffffffc00000000) == uVar5) {
    func_0x000142fc(param_1);
    uVar5 = _DAT_0ebb2088;
  }
  param_1[0x29] = param_1;
  param_1[0x2a] = 0;
  if (((ulong)puVar6 & 0xfffffffc00000000) == uVar5) {
    func_0x000142fc(puVar6);
  }
  param_1[0x2b] = puVar6;
  param_1[0x2c] = 0;
  piVar2 = (int *)func_0x0000f368(8);
  *piVar2 = 0;
  *(undefined1 *)(piVar2 + 1) = 0;
  if ((piVar2 != (int *)0x0) && (iVar1 = *piVar2, *piVar2 = iVar1 + 1, iVar1 == 0x7fffffff)) {
                    /* WARNING: Bad instruction - Truncating control flow here */
    halt_baddata();
  }
  param_1[0x2d] = piVar2;
  param_1[0x2e] = param_1;
  return param_1;
}


