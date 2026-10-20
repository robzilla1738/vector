// func FUN_042ac060 @ 042ac060 size 524

void FUN_042ac060(long param_1)

{
  code *pcVar1;
  int iVar2;
  long lVar3;
  int *piVar4;
  undefined8 *puVar5;
  ulong uVar6;
  long lVar7;
  long lVar8;
  long lVar9;
  long lVar10;
  undefined1 auStack_180 [16];
  undefined1 auStack_170 [288];
  
  if (DAT_0ef080b0 < 3) {
    FUN_0060914c(auStack_180,
                 "../../chrome/browser/component_updater/aside_component_update_service.cc",0x735,2)
    ;
    FUN_000254bc(auStack_170,
                 "Aside startup extensions did not become ready before the startup readiness timeout"
                 ,0x52);
    FUN_00609080(auStack_180);
  }
  *(undefined4 *)(param_1 + 0x390) = 3;
  FUN_0072e718(param_1 + 0x2b8);
  lVar3 = *(long *)(param_1 + 400);
  *(undefined8 *)(param_1 + 400) = 0;
  if (lVar3 != 0) {
    FUN_0162db98();
    FUN_00008eb8();
  }
  if (((*(long *)(param_1 + 0x398) != 0) && (*(char *)(*(long *)(param_1 + 0x398) + 4) == '\0')) &&
     (*(long *)(param_1 + 0x3a0) != 0)) {
    uVar6 = *(ulong *)(param_1 + 0x418);
    if (uVar6 != 0) {
      *(undefined8 *)(param_1 + 0x418) = 0;
      FUN_01d79ba4(uVar6 + 0x80,*(undefined8 *)(param_1 + 0x410));
      if ((uVar6 & 0xfffffffc00000000) == DAT_0ebb2088) {
        FUN_00022a3c(uVar6);
      }
    }
    piVar4 = *(int **)(param_1 + 0x398);
    *(undefined8 *)(param_1 + 0x398) = 0;
    if (piVar4 != (int *)0x0) {
      LOAcquire();
      iVar2 = *piVar4;
      *piVar4 = iVar2 + -1;
      LORelease();
      if (iVar2 == 1) {
        FUN_00008eb8(piVar4,8);
      }
    }
    *(undefined8 *)(param_1 + 0x3a0) = 0;
  }
  if ((*(byte *)(param_1 + 0x3aa) & 1) == 0) {
    *(undefined1 *)(param_1 + 0x3aa) = 1;
    FUN_042a71f0();
  }
  lVar7 = *(long *)(param_1 + 0x3c0);
  *(undefined8 *)(param_1 + 0x3c0) = 0;
  lVar3 = *(long *)(param_1 + 0x3c8);
  lVar8 = *(long *)(param_1 + 0x3d0);
  *(undefined8 *)(param_1 + 0x3d0) = 0;
  *(undefined8 *)(param_1 + 0x3c8) = 0;
  lVar9 = lVar3 * 8;
  if (lVar9 == 0) {
    if (lVar7 == 0) {
      return;
    }
  }
  else {
    lVar10 = 0;
    do {
      piVar4 = *(int **)(lVar7 + lVar10);
      if (piVar4 == (int *)0x0) {
                    /* WARNING: Does not return */
        pcVar1 = (code *)SoftwareBreakpoint(0,0x42ac26c);
        (*pcVar1)();
      }
      *(undefined8 *)(lVar7 + lVar10) = 0;
      (**(code **)(piVar4 + 2))(piVar4,0);
      LOAcquire();
      iVar2 = *piVar4;
      *piVar4 = iVar2 + -1;
      LORelease();
      if (iVar2 == 1) {
        (**(code **)(piVar4 + 4))(piVar4);
      }
      lVar10 = lVar10 + 8;
    } while (lVar9 - lVar10 != 0);
    if (lVar7 == 0) {
      return;
    }
    puVar5 = (undefined8 *)(lVar9 + lVar7);
    lVar3 = lVar3 * -8;
    do {
      puVar5 = puVar5 + -1;
      if (puVar5 == (undefined8 *)0x0) {
                    /* WARNING: Does not return */
        pcVar1 = (code *)SoftwareBreakpoint(1,0x42ac268);
        (*pcVar1)();
      }
      piVar4 = (int *)*puVar5;
      if (piVar4 != (int *)0x0) {
        LOAcquire();
        iVar2 = *piVar4;
        *piVar4 = iVar2 + -1;
        LORelease();
        if (iVar2 == 1) {
          (**(code **)(piVar4 + 4))();
        }
      }
      lVar3 = lVar3 + 8;
    } while (lVar3 != 0);
  }
  FUN_00008eb8(lVar7,lVar8 << 3);
  return;
}


