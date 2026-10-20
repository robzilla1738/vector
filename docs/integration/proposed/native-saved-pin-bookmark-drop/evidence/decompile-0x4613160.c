
/* WARNING: Control flow encountered bad instruction data */
/* WARNING: Possible PIC construction at 0x046131fc: Changing call to branch */
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void FUN_04613160(long param_1,uint param_2)

{
  ulong *puVar1;
  code *pcVar2;
  bool bVar3;
  ulong *puVar4;
  ulong *puVar5;
  long lVar6;
  ulong *puVar7;
  ulong uVar8;
  ulong uVar9;
  long lVar10;
  ulong *puVar11;
  long *plVar12;
  
  if (*(char *)(param_1 + 0x743) != '\0') {
    *(undefined1 *)(param_1 + 0x743) = 0;
    if (*(char *)(param_1 + 0x770) != '\0') {
      *(undefined1 *)(param_1 + 0x770) = 0;
    }
    if ((*(ulong *)(param_1 + 0x778) & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x00022a3c();
    }
    *(undefined8 *)(param_1 + 0x778) = 0;
    if ((*(ulong *)(param_1 + 0x780) & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x00022a3c();
    }
    *(undefined8 *)(param_1 + 0x780) = 0;
    *(undefined8 *)(param_1 + 0x788) = 0;
    lVar10 = *(long *)(param_1 + 0x5d8) << 4;
    if (lVar10 != 0) {
      plVar12 = (long *)(*(long *)(param_1 + 0x5d0) + 8);
      do {
        if (*(int *)(*plVar12 + 0x454) != 0) {
          *(undefined4 *)(*plVar12 + 0x454) = 0;
          halt_baddata();
        }
        lVar10 = lVar10 + -0x10;
        plVar12 = plVar12 + 2;
      } while (lVar10 != 0);
    }
    if ((*(long *)(param_1 + 0x750) * 3 & 0x1fffffffffffffffU) != 0) {
      puVar11 = *(ulong **)(param_1 + 0x748);
      puVar1 = puVar11 + *(long *)(param_1 + 0x750) * 3;
      do {
        puVar7 = *(ulong **)(param_1 + 0x5d0);
        lVar10 = *(long *)(param_1 + 0x5d8) << 4;
        puVar5 = puVar7;
        if (lVar10 != 0) {
          uVar8 = lVar10 >> 4;
          puVar4 = puVar7;
          do {
            uVar9 = uVar8 >> 1;
            puVar5 = puVar4 + uVar9 * 2 + 2;
            uVar8 = uVar8 + ~(uVar8 >> 1);
            if (*puVar11 <= puVar4[uVar9 * 2]) {
              puVar5 = puVar4;
              uVar8 = uVar9;
            }
            puVar4 = puVar5;
          } while (uVar8 != 0);
        }
        if (((puVar5 != puVar7 + *(long *)(param_1 + 0x5d8) * 2) && (*puVar5 <= *puVar11)) &&
           (uVar8 = puVar5[1], uVar8 != 0)) {
          if ((param_2 == 0) || (*(long *)(param_1 + 0x540) == 0)) {
            func_0x008a4b90(uVar8,puVar11 + 1);
          }
          else {
            func_0x0a65d684(*(long *)(param_1 + 0x540),uVar8,puVar11 + 1);
          }
        }
        puVar11 = puVar11 + 3;
      } while (puVar11 != puVar1);
    }
    if ((param_2 & 1) == 0) {
      bVar3 = false;
    }
    else {
      bVar3 = false;
      if (*(long *)(param_1 + 0x540) != 0) {
        bVar3 = *(long *)(*(long *)(param_1 + 0x540) + 0xc0) != 0;
      }
    }
    *(bool *)(param_1 + 0x862) = bVar3;
    lVar10 = *(long *)(param_1 + 0x750) * 0x18;
    if (lVar10 != 0) {
      lVar6 = *(long *)(param_1 + 0x750) * -0x18;
      lVar10 = lVar10 + *(long *)(param_1 + 0x748);
      do {
        lVar10 = lVar10 + -0x18;
        if (lVar10 == 0) {
                    /* WARNING: Does not return */
          pcVar2 = (code *)SoftwareBreakpoint(1,0x4613354);
          (*pcVar2)();
        }
        lVar6 = lVar6 + 0x18;
      } while (lVar6 != 0);
    }
    *(undefined8 *)(param_1 + 0x750) = 0;
    *(undefined4 *)(param_1 + 0x760) = 0;
    if (*(long *)(param_1 + 0x538) != 0) {
                    /* WARNING: Bad instruction - Truncating control flow here */
      halt_baddata();
    }
  }
  return;
}

