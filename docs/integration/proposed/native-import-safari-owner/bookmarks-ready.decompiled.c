
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void entry(long param_1)

{
  code *pcVar1;
  undefined4 *puVar2;
  undefined8 local_38;
  undefined2 uStack_30;
  undefined6 uStack_2e;
  undefined7 local_28;
  undefined1 uStack_21;
  
  *(undefined1 *)(param_1 + 0x110) = 1;
  uStack_21 = 9;
  if ((undefined1 *)((long)&uStack_30 + 1) <= &DAT_0da1f537 || &DAT_0da1f537 < &local_38) {
    uStack_30 = 0x73;
    local_38 = _DAT_0da1f537;
    if (*(char *)(param_1 + 0x8f) < '\0') {
      func_0x00008eb8(*(undefined8 *)(param_1 + 0x78),
                      *(ulong *)(param_1 + 0x88) & 0x7fffffffffffffff);
    }
    *(ulong *)(param_1 + 0x80) = CONCAT62(uStack_2e,uStack_30);
    *(undefined8 *)(param_1 + 0x78) = local_38;
    *(ulong *)(param_1 + 0x88) = CONCAT17(uStack_21,local_28);
    func_0x042798c4(param_1);
    if (((((*(byte *)(param_1 + 0x118) & 1) == 0) && (*(long *)(param_1 + 0xf0) != 0)) &&
        (*(char *)(param_1 + 0x110) != '\0')) &&
       (((*(byte *)(param_1 + 200) & 1) != 0 ||
        (((*(char *)(param_1 + 0x111) != '\0' && (*(char *)(param_1 + 0x112) != '\0')) &&
         (*(char *)(param_1 + 0x113) != '\0')))))) {
      *(undefined1 *)(param_1 + 0x118) = 1;
      if (*(char *)(param_1 + 0x6f) < '\0') {
        *(undefined8 *)(param_1 + 0x60) = 7;
        puVar2 = *(undefined4 **)(param_1 + 0x58);
      }
      else {
        puVar2 = (undefined4 *)(param_1 + 0x58);
        *(undefined1 *)(param_1 + 0x6f) = 7;
      }
      *(undefined4 *)((long)puVar2 + 3) = 0x676e696e;
      *puVar2 = 0x6e6e7572;
      *(undefined1 *)((long)puVar2 + 7) = 0;
      *(undefined8 *)(param_1 + 0x70) = 0x3fe0000000000000;
      func_0x042798c4(param_1);
      func_0x040ef57c(*(undefined8 *)(param_1 + 0xf0),param_1 + 0xf8);
    }
    return;
  }
                    /* WARNING: Does not return */
  pcVar1 = (code *)SoftwareBreakpoint(1,0x4278c54);
  (*pcVar1)();
}


