
/* WARNING: Control flow encountered bad instruction data */
/* WARNING: Possible PIC construction at 0x02d63c5c: Changing call to branch */
/* WARNING: Removing unreachable block (ram,0x02d63c60) */
/* WARNING: Removing unreachable block (ram,0x02d63c68) */
/* WARNING: Removing unreachable block (ram,0x02d63c7c) */
/* WARNING: Removing unreachable block (ram,0x02d63d64) */
/* WARNING: Removing unreachable block (ram,0x02d63c90) */
/* WARNING: Removing unreachable block (ram,0x02d63c9c) */
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void entry(long param_1,undefined8 param_2)

{
  code *pcVar1;
  int iVar2;
  int *piVar3;
  undefined8 uVar4;
  int *piVar5;
  undefined8 *puVar6;
  ulong uVar7;
  
  piVar5 = *(int **)(param_1 + 0x130);
  *(undefined8 *)(param_1 + 0x130) = param_2;
  if (piVar5 != (int *)0x0) {
    LOAcquire();
    iVar2 = *piVar5;
    *piVar5 = iVar2 + -1;
    LORelease();
    if (iVar2 == 1) {
      pcVar1 = *(code **)(piVar5 + 4);
      if (pcVar1 == (code *)0xfa5640) {
        piVar3 = *(int **)(piVar5 + 0xc);
        if (piVar3 != (int *)0x0) {
          LOAcquire();
          iVar2 = *piVar3;
          *piVar3 = iVar2 + -1;
          LORelease();
          if (iVar2 == 1) {
            func_0x00008eb8(piVar3,8);
          }
        }
        uVar4 = 0x48;
      }
      else {
        if (pcVar1 != (code *)0x396c600) {
          (*pcVar1)();
          goto LAB_02d63b70;
        }
        uVar4 = 0x38;
      }
      func_0x00008eb8(piVar5,uVar4);
    }
  }
LAB_02d63b70:
  puVar6 = (undefined8 *)(param_1 + 0xe8);
  func_0x03064818(*puVar6);
  *puVar6 = 0;
  *(undefined8 *)(param_1 + 0xf0) = 0;
  *(undefined8 **)(param_1 + 0xe0) = puVar6;
  func_0x02d63d70(*(undefined8 *)(param_1 + 0xd8));
  uVar7 = *(ulong *)(param_1 + 0xb0);
  if (uVar7 == 0) {
    return;
  }
  if ((uVar7 & 0xfffffffc00000000) == _DAT_0ebb2088) {
    func_0x000142fc(uVar7);
  }
  if ((*(ulong *)(param_1 + 0x140) & 0xfffffffc00000000) == _DAT_0ebb2088) {
    func_0x00022a3c();
  }
  *(ulong *)(param_1 + 0x140) = uVar7;
  func_0x0039b9a0(uVar7 + 0x30,*(undefined8 *)(param_1 + 0x138));
  uVar7 = *(ulong *)(param_1 + 0xb8);
  if (uVar7 != 0) {
    if ((uVar7 & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x000142fc(uVar7);
    }
    if ((*(ulong *)(param_1 + 0x150) & 0xfffffffc00000000) == _DAT_0ebb2088) {
      func_0x00022a3c();
    }
    *(ulong *)(param_1 + 0x150) = uVar7;
    func_0x0039b9a0(uVar7 + 0x30,*(undefined8 *)(param_1 + 0x148));
  }
  if (*(long *)(param_1 + 0xc0) != 0) {
    func_0x03999758(param_1 + 0x158);
  }
  *(int *)(param_1 + 200) = *(int *)(param_1 + 200) + 1;
  piVar5 = *(int **)(param_1 + 0x168);
  if ((piVar5 != (int *)0x0) && (iVar2 = *piVar5, *piVar5 = iVar2 + 1, iVar2 == 0x7fffffff)) {
                    /* WARNING: Does not return */
    pcVar1 = (code *)SoftwareBreakpoint(0,0x2d63d5c);
    (*pcVar1)();
  }
                    /* WARNING: Bad instruction - Truncating control flow here */
  halt_baddata();
}


