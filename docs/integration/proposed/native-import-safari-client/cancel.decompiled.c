
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void entry(long param_1)

{
  long *plVar1;
  ulong uVar2;
  long *plVar3;
  byte bVar4;
  code *pcVar5;
  long lVar6;
  long lVar7;
  undefined8 uVar8;
  long local_38;
  undefined2 uStack_30;
  undefined6 uStack_2e;
  undefined7 local_28;
  undefined1 uStack_21;
  
  if (*(long *)(param_1 + 0xf0) != 0) {
    func_0x040f0f7c();
  }
  uStack_21 = 9;
  if (&DAT_0cf0a410 < (undefined1 *)((long)&uStack_30 + 1) && &local_38 < (long *)0xcf0a411) {
LAB_04278908:
                    /* WARNING: Does not return */
    pcVar5 = (code *)SoftwareBreakpoint(1,0x427890c);
    (*pcVar5)();
  }
  uStack_30 = 100;
  local_38 = _DAT_0cf0a410;
  plVar1 = (long *)(param_1 + 0x58);
  if (*(char *)(param_1 + 0x6f) < '\0') {
    func_0x00008eb8(*(undefined8 *)(param_1 + 0x58),*(ulong *)(param_1 + 0x68) & 0x7fffffffffffffff)
    ;
  }
  *(ulong *)(param_1 + 0x60) = CONCAT62(uStack_2e,uStack_30);
  *plVar1 = local_38;
  *(ulong *)(param_1 + 0x68) = CONCAT17(uStack_21,local_28);
  if (*(char *)(param_1 + 0xa7) < '\0') {
    func_0x00008eb8(*(undefined8 *)(param_1 + 0x90),*(ulong *)(param_1 + 0xa0) & 0x7fffffffffffffff)
    ;
  }
  *(undefined8 *)(param_1 + 0x90) = 0;
  *(undefined8 *)(param_1 + 0x98) = 0;
  *(undefined8 *)(param_1 + 0xa0) = 0;
  if (*(char *)(param_1 + 0x8f) < '\0') {
    **(undefined1 **)(param_1 + 0x78) = 0;
    *(undefined8 *)(param_1 + 0x80) = 0;
  }
  else {
    *(undefined1 *)(param_1 + 0x78) = 0;
    *(undefined1 *)(param_1 + 0x8f) = 0;
  }
  bVar4 = *(byte *)(param_1 + 0x6f);
  uVar2 = *(ulong *)(param_1 + 0x60);
  if (-1 < (char)bVar4) {
    uVar2 = (ulong)bVar4;
  }
  if (uVar2 == 9) {
    plVar3 = (long *)*plVar1;
    if (-1 < (char)bVar4) {
      plVar3 = plVar1;
    }
    if (*(char *)(plVar3 + 1) == 'd' && *plVar3 == 0x6564656563637573) {
      uVar8 = 0x3ff0000000000000;
      goto LAB_04278868;
    }
  }
  uVar8 = *(undefined8 *)(param_1 + 0x70);
LAB_04278868:
  *(undefined8 *)(param_1 + 0x70) = uVar8;
  func_0x042798c4(param_1);
  lVar6 = *(long *)(param_1 + 0xf0);
  *(undefined8 *)(param_1 + 0xf0) = 0;
  if (lVar6 != 0) {
    uVar8 = func_0x0774dabc();
    func_0x00008eb8(uVar8,0x2c0);
  }
  lVar6 = *(long *)(param_1 + 0xe8);
  *(undefined8 *)(param_1 + 0xe8) = 0;
  if (lVar6 != 0) {
    uVar8 = func_0x03064228();
    func_0x00008eb8(uVar8,0x178);
  }
  lVar6 = *(long *)(param_1 + 0x100) * 4;
  if (lVar6 != 0) {
    lVar7 = *(long *)(param_1 + 0x100) * -4;
    lVar6 = lVar6 + *(long *)(param_1 + 0xf8);
    do {
      lVar6 = lVar6 + -4;
      if (lVar6 == 0) goto LAB_04278908;
      lVar7 = lVar7 + 4;
    } while (lVar7 != 0);
  }
  *(undefined8 *)(param_1 + 0x100) = 0;
  func_0x04279a54(param_1);
  return;
}


