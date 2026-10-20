// func FUN_041040a4 @ 041040a4 size 584

void FUN_041040a4(undefined8 *param_1,undefined8 *param_2,int param_3)

{
  size_t sVar1;
  size_t sVar2;
  void **ppvVar3;
  byte bVar4;
  ulong uVar5;
  bool bVar6;
  int iVar7;
  undefined8 *puVar8;
  long lVar9;
  void *local_60;
  size_t sStack_58;
  ulong local_50;
  undefined1 local_48;
  
  if (param_1 != (undefined8 *)0x0) {
    puVar8 = param_1;
    FUN_004bcc4c(param_1,"aside.account_email",0x13);
    if (puVar8 == (undefined8 *)0x0) {
      local_60 = (void *)0x0;
      sStack_58 = 0;
      local_50 = 0;
    }
    else {
      puVar8 = param_1;
      FUN_00e8585c(param_1,"aside.account_email",0x13);
      if (*(char *)((long)puVar8 + 0x17) < '\0') {
        FUN_00018218(&local_60,*puVar8,puVar8[1]);
      }
      else {
        sStack_58 = puVar8[1];
        local_60 = (void *)*puVar8;
        local_50 = puVar8[2];
      }
    }
    uVar5 = local_50;
    sVar1 = sStack_58;
    if (-1 < (long)local_50) {
      sVar1 = local_50 >> 0x38;
    }
    bVar4 = *(byte *)((long)param_2 + 0x17);
    sVar2 = param_2[1];
    if (-1 < (char)bVar4) {
      sVar2 = (ulong)bVar4;
    }
    if (sVar1 == sVar2) {
      ppvVar3 = local_60;
      if (-1 < (long)local_50) {
        ppvVar3 = &local_60;
      }
      puVar8 = (void *)*param_2;
      if (-1 < (char)bVar4) {
        puVar8 = param_2;
      }
      iVar7 = _memcmp(ppvVar3,puVar8,sVar1);
      bVar6 = iVar7 == 0;
    }
    else {
      bVar6 = false;
    }
    if ((long)uVar5 < 0) {
      FUN_00008eb8(local_60,local_50 & 0x7fffffffffffffff);
    }
    if ((!bVar6) &&
       (puVar8 = param_1, FUN_004bcc4c(param_1,"aside.account_email",0x13),
       puVar8 != (undefined8 *)0x0)) {
      lVar9 = (long)*(char *)((long)param_2 + 0x17);
      puVar8 = param_2;
      if (lVar9 < 0) {
        lVar9 = param_2[1];
        puVar8 = (undefined8 *)*param_2;
      }
      FUN_00bddb80(&local_60,puVar8,lVar9);
      FUN_015098a8(param_1,"aside.account_email",0x13,&local_60);
      FUN_0161e7d4(&local_60);
    }
    if (param_3 == 0) {
      puVar8 = param_1;
      FUN_004bcc4c(param_1,"aside.account_has_persisted_session",0x23);
      if (puVar8 == (undefined8 *)0x0) {
        return;
      }
      puVar8 = param_1;
      FUN_00306500(param_1,"aside.account_has_persisted_session",0x23);
      if (((ulong)puVar8 & 1) == 0) {
        return;
      }
      bVar6 = false;
    }
    else {
      lVar9 = (long)*(char *)((long)param_2 + 0x17);
      if (lVar9 < 0) {
        lVar9 = param_2[1];
      }
      bVar6 = lVar9 != 0;
      puVar8 = param_1;
      FUN_004bcc4c(param_1,"aside.account_has_persisted_session",0x23);
      if (puVar8 == (undefined8 *)0x0) {
        if (lVar9 == 0) {
          return;
        }
        bVar6 = true;
      }
      else {
        puVar8 = param_1;
        FUN_00306500(param_1,"aside.account_has_persisted_session",0x23);
        if ((uint)(lVar9 != 0) == (uint)puVar8) {
          return;
        }
      }
    }
    puVar8 = param_1;
    FUN_004bcc4c(param_1,"aside.account_has_persisted_session",0x23);
    if (puVar8 != (undefined8 *)0x0) {
      local_60 = (void *)CONCAT71(local_60._1_7_,bVar6);
      local_48 = 1;
      FUN_015098a8(param_1,"aside.account_has_persisted_session",0x23,&local_60);
      FUN_0161e7d4(&local_60);
    }
  }
  return;
}


