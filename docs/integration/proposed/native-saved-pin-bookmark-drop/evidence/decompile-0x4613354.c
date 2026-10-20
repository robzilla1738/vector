
/* WARNING: Control flow encountered bad instruction data */

long FUN_04613354(long param_1,long *param_2,undefined8 *param_3,long param_4,ulong param_5,
                 uint param_6)

{
  ulong uVar1;
  uint uVar2;
  byte bVar3;
  char cVar4;
  code *pcVar5;
  int iVar6;
  long lVar7;
  long *plVar8;
  long *plVar9;
  ulong uVar10;
  ulong uVar11;
  int *piVar12;
  uint uVar13;
  undefined8 local_68;
  undefined8 uStack_60;
  undefined8 local_58;
  
  if (*(long *)(param_1 + 0x530) == 0) {
    return 0;
  }
  if (*(char *)(*(long *)(param_1 + 0x530) + 0x21) == '\0') {
    return 0;
  }
  if ((*(byte *)(param_2 + 3) & 1) == 0) {
    return 0;
  }
  if ((param_4 == 0) || (*(int *)(param_4 + 0xf8) == 0)) {
    param_4 = entry(param_1);
    if (param_4 == 0) {
      return 0;
    }
    if (*(int *)(param_4 + 0xf8) == 0) {
      return 0;
    }
    uVar13 = 0;
  }
  else {
    uVar13 = 1;
  }
  if (*(char *)((long)param_3 + 0x17) < '\0') {
    if (param_3[1] != 0) goto LAB_046133c0;
  }
  else if (*(char *)((long)param_3 + 0x17) != '\0') goto LAB_046133c0;
  uVar2 = *(uint *)((long)param_2 + 0x3c);
  if ((int)uVar2 < 1) {
LAB_046134c4:
    plVar8 = (long *)func_0x0066ca88(param_2);
    cVar4 = *(char *)((long)plVar8 + 0x17);
    plVar9 = (long *)*plVar8;
    if (-1 < (long)cVar4) {
      plVar9 = plVar8;
    }
    uVar10 = plVar8[1];
    if (-1 < cVar4) {
      uVar10 = (long)cVar4;
    }
  }
  else {
    bVar3 = *(byte *)((long)param_2 + 0x17);
    uVar1 = param_2[1];
    if (-1 < (char)bVar3) {
      uVar1 = (ulong)bVar3;
    }
    uVar11 = (ulong)(int)param_2[7];
    uVar10 = uVar1 - uVar11;
    if (uVar1 < uVar11) {
      func_0x04c002d4(0xd7e4dd8);
                    /* WARNING: Bad instruction - Truncating control flow here */
      halt_baddata();
    }
    if (uVar10 == 0) goto LAB_046134c4;
    if (uVar2 <= uVar10) {
      uVar10 = (ulong)uVar2;
    }
    plVar9 = (long *)*param_2;
    if (-1 < (char)bVar3) {
      plVar9 = param_2;
    }
    plVar9 = (long *)((long)plVar9 + uVar11);
  }
  func_0x008e2310(&local_68,plVar9,uVar10);
  if (*(char *)((long)param_3 + 0x17) < '\0') {
    func_0x00008eb8(*param_3,param_3[2] << 1);
  }
  param_3[1] = uStack_60;
  *param_3 = local_68;
  param_3[2] = local_58;
LAB_046133c0:
  uVar10 = *(ulong *)(param_4 + 0x48);
  uVar1 = uVar10;
  if (param_5 <= uVar10) {
    uVar1 = param_5;
  }
  if ((uVar13 & param_6) == 0) {
    uVar1 = uVar10;
  }
  lVar7 = func_0x0a555298(*(undefined8 *)(param_1 + 0x530),param_4,uVar1,param_3,param_2,0);
  if (lVar7 != 0) {
    func_0x0461becc(param_1,lVar7);
    piVar12 = *(int **)(param_1 + 0x6c0);
    if (piVar12 != (int *)0x0) {
      iVar6 = *piVar12;
      *piVar12 = iVar6 + 1;
      if (iVar6 < 1) {
                    /* WARNING: Does not return */
        pcVar5 = (code *)SoftwareBreakpoint(0,0x461354c);
        (*pcVar5)();
      }
      if (iVar6 == 0x7fffffff) {
                    /* WARNING: Does not return */
        pcVar5 = (code *)SoftwareBreakpoint(0,0x4613558);
        (*pcVar5)();
      }
      (**(code **)(*(long *)(param_1 + 0x6c0) + 8))(piVar12);
      LOAcquire();
      iVar6 = *piVar12;
      *piVar12 = iVar6 + -1;
      LORelease();
      if (iVar6 == 1) {
        (**(code **)(piVar12 + 4))(piVar12);
      }
    }
  }
  return lVar7;
}

