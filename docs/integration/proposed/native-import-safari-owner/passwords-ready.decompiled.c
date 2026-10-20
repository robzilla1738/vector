
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void entry(long param_1,byte *param_2)

{
  ulong uVar1;
  undefined4 *puVar2;
  code *pcVar3;
  long lVar4;
  long lVar5;
  undefined4 *puVar6;
  long lVar7;
  ulong uVar8;
  long lVar9;
  long lVar10;
  ulong uVar11;
  undefined8 local_78;
  undefined2 uStack_70;
  undefined6 uStack_6e;
  undefined7 local_68;
  undefined1 uStack_61;
  
  lVar9 = *(long *)(param_1 + 0xf8);
  *(undefined1 *)(param_1 + 0x112) = 1;
  lVar7 = *(long *)(param_1 + 0x100) * 4;
  if (lVar7 != 0) {
    lVar5 = *(long *)(param_1 + 0x100) * -4;
    lVar7 = lVar7 + lVar9;
    do {
      lVar7 = lVar7 + -4;
      if (lVar7 == 0) goto LAB_04278f80;
      lVar5 = lVar5 + 4;
    } while (lVar5 != 0);
  }
  *(undefined8 *)(param_1 + 0x100) = 0;
  if (*param_2 < 2) {
    if ((*param_2 == 0) && (lVar7 = *(long *)(param_2 + 0x28) * 0x58, lVar7 != 0)) {
      uVar11 = 0;
      puVar6 = (undefined4 *)(*(long *)(param_2 + 0x20) + 0x50);
      do {
        if (uVar11 == *(ulong *)(param_1 + 0x108)) {
          uVar1 = uVar11 + 1;
          if (uVar1 >> 0x3e != 0) {
            func_0x01f13d80();
LAB_04279028:
            func_0x04c06020();
            goto LAB_0427902c;
          }
          uVar8 = uVar11 * 2;
          if (uVar8 < uVar1 || uVar8 - uVar1 == 0) {
            uVar8 = uVar1;
          }
          if (0x1ffffffffffffffe < uVar11) {
            uVar8 = 0x3fffffffffffffff;
          }
          if (uVar8 == 0) {
            lVar9 = 0;
          }
          else {
            if (uVar8 >> 0x3e != 0) goto LAB_04279028;
            lVar9 = func_0x0000f368(uVar8 << 2);
          }
          puVar2 = (undefined4 *)(lVar9 + uVar11 * 4);
          if (puVar2 == (undefined4 *)0x0) goto LAB_04278f80;
          *puVar2 = *puVar6;
          lVar5 = *(long *)(param_1 + 0x100);
          lVar10 = lVar5 * 4;
          func_0x08009cf8(puVar2 + -lVar5,*(undefined8 *)(param_1 + 0xf8),lVar10);
          lVar4 = *(long *)(param_1 + 0xf8);
          *(undefined4 **)(param_1 + 0xf8) = puVar2 + -lVar5;
          *(long *)(param_1 + 0x100) = lVar10 + 4 >> 2;
          lVar5 = *(long *)(param_1 + 0x108);
          *(ulong *)(param_1 + 0x108) = uVar8;
          if (lVar4 != 0) {
            func_0x00008eb8(lVar4,lVar5 << 2);
          }
        }
        else {
          puVar2 = (undefined4 *)(lVar9 + uVar11 * 4);
          if (puVar2 == (undefined4 *)0x0) goto LAB_04278f80;
          *puVar2 = *puVar6;
        }
        lVar5 = lVar9 + uVar11 * 4;
        lVar9 = *(long *)(param_1 + 0xf8);
        lVar5 = (lVar5 + 4) - lVar9;
        uVar11 = lVar5 >> 2;
        *(ulong *)(param_1 + 0x100) = uVar11;
        if (lVar5 == 0) goto LAB_04278f80;
        puVar6 = puVar6 + 0x16;
        lVar7 = lVar7 + -0x58;
      } while (lVar7 != 0);
    }
    uStack_61 = 9;
    if ((undefined1 *)((long)&uStack_70 + 1) <= &DAT_0d9cf19f || &DAT_0d9cf19f < &local_78) {
      uStack_70 = 0x73;
      local_78 = _DAT_0d9cf19f;
      if (*(char *)(param_1 + 0x8f) < '\0') {
        func_0x00008eb8(*(undefined8 *)(param_1 + 0x78),
                        *(ulong *)(param_1 + 0x88) & 0x7fffffffffffffff);
      }
      *(ulong *)(param_1 + 0x80) = CONCAT62(uStack_6e,uStack_70);
      *(undefined8 *)(param_1 + 0x78) = local_78;
      *(ulong *)(param_1 + 0x88) = CONCAT17(uStack_61,local_68);
      func_0x042798c4(param_1);
      if (((((*(byte *)(param_1 + 0x118) & 1) == 0) && (*(long *)(param_1 + 0xf0) != 0)) &&
          (*(char *)(param_1 + 0x110) != '\0')) &&
         (((*(byte *)(param_1 + 200) & 1) != 0 ||
          (((*(char *)(param_1 + 0x111) != '\0' && (*(char *)(param_1 + 0x112) != '\0')) &&
           (*(char *)(param_1 + 0x113) != '\0')))))) {
        *(undefined1 *)(param_1 + 0x118) = 1;
        if (*(char *)(param_1 + 0x6f) < '\0') {
          *(undefined8 *)(param_1 + 0x60) = 7;
          puVar6 = *(undefined4 **)(param_1 + 0x58);
        }
        else {
          puVar6 = (undefined4 *)(param_1 + 0x58);
          *(undefined1 *)(param_1 + 0x6f) = 7;
        }
        *(undefined4 *)((long)puVar6 + 3) = 0x676e696e;
        *puVar6 = 0x6e6e7572;
        *(undefined1 *)((long)puVar6 + 7) = 0;
        *(undefined8 *)(param_1 + 0x70) = 0x3fe0000000000000;
        func_0x042798c4(param_1);
        func_0x040ef57c(*(undefined8 *)(param_1 + 0xf0),(long *)(param_1 + 0xf8));
      }
      return;
    }
LAB_04278f80:
                    /* WARNING: Does not return */
    pcVar3 = (code *)SoftwareBreakpoint(1,0x4278f84);
    (*pcVar3)();
  }
LAB_0427902c:
                    /* WARNING: Does not return */
  pcVar3 = (code *)SoftwareBreakpoint(0,0x4279030);
  (*pcVar3)();
}


