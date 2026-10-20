// func FUN_0417a8d8 @ 0417a8d8 size 504

void FUN_0417a8d8(long param_1)

{
  char cVar1;
  bool bVar2;
  code *pcVar3;
  long *plVar4;
  undefined8 *puVar5;
  long *plVar6;
  long lVar7;
  long lVar8;
  undefined8 local_88 [2];
  undefined7 local_78;
  char cStack_71;
  undefined8 local_70;
  undefined8 uStack_68;
  ulong local_60;
  undefined1 local_50;
  undefined7 uStack_4f;
  ulong local_48;
  long local_40;
  undefined1 local_38;
  
  if ((((((*(byte *)(param_1 + 0xe4) & 1) == 0) &&
        (plVar4 = *(long **)(param_1 + 0x30), plVar4 != (long *)0x0)) &&
       ((**(code **)(*plVar4 + 0x210))(), (int)plVar4 != 0)) &&
      (((*(byte *)(*(long *)(param_1 + 0x30) + 0x48) & 1) == 0 && (DAT_0eee6cf8 != 0)))) &&
     (lVar7 = DAT_0eee6cf8, FUN_01a1fb78(), lVar7 != 0)) {
    *(undefined1 *)(param_1 + 0xe4) = 1;
    lVar7 = DAT_0eee6cf8;
    FUN_01a1fb78(DAT_0eee6cf8);
    FUN_01a1fc10();
    (**(code **)(**(long **)(param_1 + 0x30) + 0x30))(local_88);
    FUN_01a215b0(&local_50,lVar7);
    plVar4 = (long *)CONCAT71(uStack_4f,local_50);
    lVar7 = local_48 << 3;
    bVar2 = false;
    if (lVar7 != 0) {
      do {
        lVar8 = *plVar4;
        if (lVar8 != 0) {
          if (*(char *)(lVar8 + 0x2f) < '\0') {
            FUN_00018218(&local_70,*(undefined8 *)(lVar8 + 0x18),*(undefined8 *)(lVar8 + 0x20));
          }
          else {
            uStack_68 = *(undefined8 *)(lVar8 + 0x20);
            local_70 = *(undefined8 *)(lVar8 + 0x18);
            local_60 = *(ulong *)(lVar8 + 0x28);
          }
          puVar5 = &local_70;
          FUN_010cc104(puVar5,local_88);
          if ((int)puVar5 == 0) {
            cVar1 = *(char *)(lVar8 + 0x60);
            if ((long)local_60 < 0) {
              FUN_00008eb8(local_70,local_60 & 0x7fffffffffffffff);
            }
            if (cVar1 == '\0') {
              bVar2 = true;
              break;
            }
          }
          else if ((long)local_60 < 0) {
            FUN_00008eb8(local_70,local_60 & 0x7fffffffffffffff);
          }
        }
        plVar4 = plVar4 + 1;
        lVar7 = lVar7 + -8;
        bVar2 = false;
      } while (lVar7 != 0);
      plVar4 = (long *)CONCAT71(uStack_4f,local_50);
    }
    if (plVar4 != (long *)0x0) {
      if ((local_48 & 0x1fffffffffffffff) != 0) {
        lVar7 = local_48 * -8;
        plVar6 = plVar4 + local_48;
        do {
          plVar6 = plVar6 + -1;
          if (plVar6 == (long *)0x0) {
                    /* WARNING: Does not return */
            pcVar3 = (code *)SoftwareBreakpoint(1,0x417aad0);
            (*pcVar3)();
          }
          lVar7 = lVar7 + 8;
        } while (lVar7 != 0);
      }
      local_48 = 0;
      FUN_00008eb8(plVar4,local_40 << 3);
    }
    if (cStack_71 < '\0') {
      FUN_00008eb8(local_88[0],CONCAT17(cStack_71,local_78) & 0x7fffffffffffffff);
    }
    if (((bVar2) && (plVar4 = *(long **)(param_1 + 0x30), plVar4 != (long *)0x0)) &&
       ((*(byte *)(plVar4 + 9) & 1) == 0)) {
      (**(code **)(*plVar4 + 0x168))();
      local_50 = 1;
      local_38 = 1;
      FUN_015098a8();
      FUN_0161e7d4(&local_50);
    }
  }
  return;
}


