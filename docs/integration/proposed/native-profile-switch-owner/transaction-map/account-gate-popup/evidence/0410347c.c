// func FUN_0410347c @ 0410347c size 324

void FUN_0410347c(undefined8 *param_1,long param_2)

{
  ulong uVar1;
  undefined8 *puVar2;
  long lVar3;
  undefined8 local_40;
  undefined8 uStack_38;
  ulong local_30;
  undefined8 local_28;
  
  if (param_2 == 0) {
    *param_1 = 0;
    param_1[1] = 0;
    param_1[2] = 0;
  }
  else {
    uStack_38 = 0;
    local_40 = 0;
    local_28 = 0;
    local_30 = 0;
    FUN_04103374(&local_40);
    if ((char)local_28 == '\0') {
      *param_1 = 0;
      param_1[1] = 0;
      param_1[2] = 0;
      FUN_01a9cb04(&local_40);
      if ((long)local_30 < 0) {
        FUN_00018218(param_1,local_40,uStack_38);
        if ((long)local_30 < 0) {
          FUN_00008eb8(local_40,local_30 & 0x7fffffffffffffff);
        }
      }
      else {
        param_1[1] = uStack_38;
        *param_1 = local_40;
        param_1[2] = local_30;
      }
      lVar3 = param_2;
      FUN_004bcc4c(param_2,"aside.profile_id",0x10);
      if (lVar3 != 0) {
        uVar1 = param_1[1];
        puVar2 = (undefined8 *)*param_1;
        if (-1 < (char)*(byte *)((long)param_1 + 0x17)) {
          uVar1 = (ulong)*(byte *)((long)param_1 + 0x17);
          puVar2 = param_1;
        }
        FUN_00bddb80(&local_40,puVar2,uVar1);
        FUN_015098a8(param_2,"aside.profile_id",0x10,&local_40);
        FUN_0161e7d4(&local_40);
      }
    }
    else if ((long)local_30 < 0) {
      FUN_00018218(param_1,local_40,uStack_38);
      if (((char)local_28 != '\0') && ((long)local_30 < 0)) {
        FUN_00008eb8(local_40,local_30 & 0x7fffffffffffffff);
      }
    }
    else {
      param_1[1] = uStack_38;
      *param_1 = local_40;
      param_1[2] = local_30;
    }
  }
  return;
}


