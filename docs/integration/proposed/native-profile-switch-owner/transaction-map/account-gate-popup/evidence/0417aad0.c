// func FUN_0417aad0 @ 0417aad0 size 364

/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void FUN_0417aad0(long param_1)

{
  long *plVar1;
  undefined8 uVar2;
  undefined8 uVar3;
  undefined8 uVar4;
  code *pcVar5;
  bool bVar6;
  ulong uVar7;
  char *pcVar8;
  long lVar9;
  char *local_50;
  undefined8 local_48;
  ulong uStack_40;
  undefined1 local_38;
  
  if (((((*(byte *)(param_1 + 0xe7) & 1) == 0) && (*(long *)(param_1 + 0x38) == 0)) &&
      (uVar7 = *(ulong *)(param_1 + 0x30), uVar7 != 0)) &&
     ((*(byte *)(*(long *)(uVar7 + 0x18) + 0x30) & 1) == 0)) {
    FUN_016a186c();
    if ((uVar7 & 0xfffffffc00000000) == DAT_0ebb2088) {
      FUN_000142fc(uVar7);
    }
    if ((*(ulong *)(param_1 + 0x38) & 0xfffffffc00000000) == DAT_0ebb2088) {
      FUN_00022a3c();
    }
    *(ulong *)(param_1 + 0x38) = uVar7;
    if (uVar7 != 0) {
      FUN_0163dd44(uVar7 + 0x98,param_1 + 0x28);
      plVar1 = *(long **)(param_1 + 0x30);
      lVar9 = *(long *)(param_1 + 0x38);
      bVar6 = false;
      if (lVar9 != 0) {
        pcVar8 = segment_command_00000020.segname + 8;
        FUN_0000f368();
        uVar4 = s_fjdhphbdlfjogobdofoaagnlnkoibdge_0cefeb27._24_8_;
        uVar3 = s_fjdhphbdlfjogobdofoaagnlnkoibdge_0cefeb27._16_8_;
        uVar2 = s_fjdhphbdlfjogobdofoaagnlnkoibdge_0cefeb27._0_8_;
        uStack_40 = _UNK_0df3b3e8;
        local_48 = _DAT_0df3b3e0;
        local_50 = pcVar8;
        if ((pcVar8 + 0x20 < pcVar8) ||
           ("fjdhphbdlfjogobdofoaagnlnkoibdge" < pcVar8 + 0x20 &&
            pcVar8 < "jdhphbdlfjogobdofoaagnlnkoibdge")) {
                    /* WARNING: Does not return */
          pcVar5 = (code *)SoftwareBreakpoint(1,0x417ac3c);
          (*pcVar5)();
        }
        *(undefined8 *)(pcVar8 + 8) = s_fjdhphbdlfjogobdofoaagnlnkoibdge_0cefeb27._8_8_;
        *(undefined8 *)pcVar8 = uVar2;
        *(undefined8 *)(pcVar8 + 0x18) = uVar4;
        *(undefined8 *)(pcVar8 + 0x10) = uVar3;
        pcVar8[0x20] = 0;
        lVar9 = lVar9 + 8;
        FUN_00bfd304(lVar9,&local_50);
        bVar6 = lVar9 != 0;
        if ((long)uStack_40 < 0) {
          FUN_00008eb8(local_50,uStack_40 & 0x7fffffffffffffff);
        }
      }
      if ((plVar1 != (long *)0x0) && ((*(byte *)(plVar1 + 9) & 1) == 0)) {
        (**(code **)(*plVar1 + 0x168))(plVar1);
        local_50 = (char *)CONCAT71(local_50._1_7_,bVar6);
        local_38 = 1;
        FUN_015098a8();
        FUN_0161e7d4(&local_50);
      }
      FUN_0417ac3c(param_1);
    }
  }
  return;
}


