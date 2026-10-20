
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void entry(long param_1)

{
  long *plVar1;
  ulong uVar2;
  long *plVar3;
  byte bVar4;
  code *pcVar5;
  long lVar6;
  undefined8 uVar7;
  long lVar8;
  undefined8 local_50;
  undefined8 uStack_48;
  undefined4 local_40;
  undefined1 uStack_3c;
  undefined2 uStack_3b;
  undefined1 uStack_39;
  undefined4 local_38;
  undefined2 uStack_34;
  undefined1 uStack_32;
  undefined1 uStack_31;
  undefined8 uStack_30;
  undefined7 local_28;
  undefined1 uStack_21;
  
  lVar6 = *(long *)(param_1 + 0xf0);
  *(undefined8 *)(param_1 + 0xf0) = 0;
  if (lVar6 != 0) {
    uVar7 = func_0x0774dabc();
    func_0x00008eb8(uVar7,0x2c0);
  }
  lVar6 = *(long *)(param_1 + 0xe8);
  *(undefined8 *)(param_1 + 0xe8) = 0;
  if (lVar6 != 0) {
    uVar7 = func_0x03064228();
    func_0x00008eb8(uVar7,0x178);
  }
  lVar6 = *(long *)(param_1 + 0x100) * 4;
  if (lVar6 != 0) {
    lVar8 = *(long *)(param_1 + 0x100) * -4;
    lVar6 = lVar6 + *(long *)(param_1 + 0xf8);
    do {
      lVar6 = lVar6 + -4;
      if (lVar6 == 0) goto LAB_04278af4;
      lVar8 = lVar8 + 4;
    } while (lVar8 != 0);
  }
  *(undefined8 *)(param_1 + 0x100) = 0;
  func_0x04279a54(param_1);
  uStack_21 = 6;
  if (0xcf0a430 < ((ulong)&local_38 | 6) && &local_38 < (undefined4 *)0xcf0a431) {
LAB_04278af4:
                    /* WARNING: Does not return */
    pcVar5 = (code *)SoftwareBreakpoint(1,0x4278af8);
    (*pcVar5)();
  }
  uStack_34 = 0x6465;
  local_38 = 0x6c696166;
  uStack_32 = 0;
  uStack_39 = 0x14;
  if (&DAT_0db2347c < &uStack_3c && &local_50 < (undefined1 *)0xdb2347d) goto LAB_04278af4;
  local_40 = 0x64656c69;
  uStack_48 = uRam000000000db23484;
  local_50 = _DAT_0db2347c;
  uStack_3c = 0;
  plVar1 = (long *)(param_1 + 0x58);
  if (*(char *)(param_1 + 0x6f) < '\0') {
    func_0x00008eb8(*(undefined8 *)(param_1 + 0x58),*(ulong *)(param_1 + 0x68) & 0x7fffffffffffffff)
    ;
  }
  *(undefined8 *)(param_1 + 0x60) = uStack_30;
  *plVar1 = CONCAT17(uStack_31,CONCAT16(uStack_32,CONCAT24(uStack_34,local_38)));
  *(ulong *)(param_1 + 0x68) = CONCAT17(uStack_21,local_28);
  if (*(char *)(param_1 + 0xa7) < '\0') {
    func_0x00008eb8(*(undefined8 *)(param_1 + 0x90),*(ulong *)(param_1 + 0xa0) & 0x7fffffffffffffff)
    ;
  }
  *(undefined8 *)(param_1 + 0x98) = uStack_48;
  *(undefined8 *)(param_1 + 0x90) = local_50;
  *(ulong *)(param_1 + 0xa0) = CONCAT17(uStack_39,CONCAT25(uStack_3b,CONCAT14(uStack_3c,local_40)));
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
      uVar7 = 0x3ff0000000000000;
      goto LAB_04278ab0;
    }
  }
  uVar7 = *(undefined8 *)(param_1 + 0x70);
LAB_04278ab0:
  *(undefined8 *)(param_1 + 0x70) = uVar7;
  func_0x042798c4(param_1);
  return;
}


