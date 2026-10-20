
long * entry(long param_1)

{
  code *pcVar1;
  int iVar2;
  ulong uVar3;
  long lVar4;
  long *plVar5;
  
  lVar4 = *(long *)(param_1 + 0x530);
  if (lVar4 != 0) {
    plVar5 = *(long **)(lVar4 + 0x38);
    if (plVar5 != (long *)0x0) {
      uVar3 = (**(code **)(*plVar5 + 0x28))(plVar5);
      if ((uVar3 & 1) != 0) {
        return plVar5;
      }
      lVar4 = *(long *)(param_1 + 0x530);
    }
    plVar5 = *(long **)(lVar4 + 0x40);
    if (plVar5 != (long *)0x0) {
      uVar3 = (**(code **)(*plVar5 + 0x28))(plVar5);
      if ((uVar3 & 1) != 0) {
        return plVar5;
      }
      lVar4 = *(long *)(param_1 + 0x530);
    }
    plVar5 = *(long **)(lVar4 + 0x48);
    if (plVar5 != (long *)0x0) {
      uVar3 = (**(code **)(*plVar5 + 0x28))(plVar5);
      if ((uVar3 & 1) != 0) {
        return plVar5;
      }
      lVar4 = *(long *)(param_1 + 0x530);
    }
    if (*(long *)(lVar4 + 0x50) != 0) {
      uVar3 = func_0x00119280(0xec2b288);
      if ((uVar3 & 1) == 0) {
                    /* WARNING: Does not return */
        pcVar1 = (code *)SoftwareBreakpoint(0,0x4613018);
        (*pcVar1)();
      }
      plVar5 = *(long **)(lVar4 + 0x50);
      if ((plVar5 != (long *)0x0) &&
         (uVar3 = (**(code **)(*plVar5 + 0x28))(plVar5), (uVar3 & 1) != 0)) {
        return plVar5;
      }
    }
    lVar4 = *(long *)(param_1 + 0x530);
    if (*(long *)(lVar4 + 0x58) != 0) {
      uVar3 = func_0x00119280(0xec2b288);
      if ((uVar3 & 1) == 0) {
                    /* WARNING: Does not return */
        pcVar1 = (code *)SoftwareBreakpoint(0,0x4613024);
        (*pcVar1)();
      }
      plVar5 = *(long **)(lVar4 + 0x58);
      if ((plVar5 != (long *)0x0) &&
         (uVar3 = (**(code **)(*plVar5 + 0x28))(plVar5), (uVar3 & 1) != 0)) {
        return plVar5;
      }
    }
    lVar4 = *(long *)(param_1 + 0x530);
    if (*(long *)(lVar4 + 0x60) != 0) {
      uVar3 = func_0x00119280(0xec2b288);
      if ((uVar3 & 1) == 0) {
                    /* WARNING: Does not return */
        pcVar1 = (code *)SoftwareBreakpoint(0,0x4613030);
        (*pcVar1)();
      }
      plVar5 = *(long **)(lVar4 + 0x60);
      if ((plVar5 != (long *)0x0) &&
         (uVar3 = (**(code **)(*plVar5 + 0x28))(plVar5), (uVar3 & 1) != 0)) {
        return plVar5;
      }
    }
    lVar4 = *(long *)(param_1 + 0x530);
    if (*(long **)(lVar4 + 0x38) != (long *)0x0) {
      return *(long **)(lVar4 + 0x38);
    }
    if (*(long **)(lVar4 + 0x40) != (long *)0x0) {
      return *(long **)(lVar4 + 0x40);
    }
    if (*(long **)(lVar4 + 0x48) != (long *)0x0) {
      return *(long **)(lVar4 + 0x48);
    }
    if (*(long *)(lVar4 + 0x50) != 0) {
      uVar3 = func_0x00119280(0xec2b288);
      if ((uVar3 & 1) == 0) {
                    /* WARNING: Does not return */
        pcVar1 = (code *)SoftwareBreakpoint(0,0x461303c);
        (*pcVar1)();
      }
      plVar5 = (long *)(lVar4 + 0x50);
      lVar4 = *(long *)(param_1 + 0x530);
      if (*plVar5 != 0) {
        if (*(long *)(lVar4 + 0x50) == 0) {
          return (long *)0x0;
        }
        iVar2 = func_0x00119280(0xec2b288);
        if (iVar2 == 0) {
                    /* WARNING: Does not return */
          pcVar1 = (code *)SoftwareBreakpoint(0,0x4613048);
          (*pcVar1)();
        }
        return *(long **)(lVar4 + 0x50);
      }
    }
    if (*(long *)(lVar4 + 0x58) != 0) {
      uVar3 = func_0x00119280(0xec2b288);
      if ((uVar3 & 1) == 0) {
                    /* WARNING: Does not return */
        pcVar1 = (code *)SoftwareBreakpoint(0,0x4613054);
        (*pcVar1)();
      }
      plVar5 = (long *)(lVar4 + 0x58);
      lVar4 = *(long *)(param_1 + 0x530);
      if (*plVar5 != 0) {
        if (*(long *)(lVar4 + 0x58) == 0) {
          return (long *)0x0;
        }
        iVar2 = func_0x00119280(0xec2b288);
        if (iVar2 == 0) {
                    /* WARNING: Does not return */
          pcVar1 = (code *)SoftwareBreakpoint(0,0x4613060);
          (*pcVar1)();
        }
        return *(long **)(lVar4 + 0x58);
      }
    }
    if (*(long *)(lVar4 + 0x60) != 0) {
      iVar2 = func_0x00119280(0xec2b288);
      if (iVar2 == 0) {
                    /* WARNING: Does not return */
        pcVar1 = (code *)SoftwareBreakpoint(0,0x461306c);
        (*pcVar1)();
      }
      return *(long **)(lVar4 + 0x60);
    }
  }
  return (long *)0x0;
}

