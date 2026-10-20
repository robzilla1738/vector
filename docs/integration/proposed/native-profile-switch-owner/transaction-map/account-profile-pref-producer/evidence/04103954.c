// func FUN_04103954 @ 04103954 size 276

void FUN_04103954(undefined8 *param_1,undefined8 *param_2)

{
  ulong uVar1;
  undefined8 *puVar2;
  uint uVar3;
  undefined1 uVar4;
  undefined8 local_40;
  ulong uStack_38;
  undefined8 local_30;
  
  puVar2 = param_2;
  FUN_04103854();
  if (((ulong)puVar2 & 1) == 0) {
    *(undefined1 *)param_1 = 0;
    *(undefined1 *)(param_1 + 3) = 0;
  }
  else {
    local_40 = 0;
    uStack_38 = 0;
    local_30 = 0;
    if ((param_2 == (undefined8 *)0x0) ||
       (puVar2 = param_2, FUN_004bcc4c(param_2,"aside.account_display_name",0x1a),
       puVar2 == (undefined8 *)0x0)) {
      local_40 = 0;
      uStack_38 = 0;
      local_30 = 0;
    }
    else {
      FUN_00e8585c(param_2,"aside.account_display_name",0x1a);
      if (*(char *)((long)param_2 + 0x17) < '\0') {
        FUN_00018218(&local_40,*param_2,param_2[1]);
      }
      else {
        uStack_38 = param_2[1];
        local_40 = *param_2;
        local_30 = param_2[2];
      }
    }
    uVar3 = (uint)(char)local_30._7_1_;
    uVar1 = uStack_38;
    if (-1 < (int)uVar3) {
      uVar1 = (ulong)local_30._7_1_;
    }
    if (uVar1 == 0) {
      *(undefined1 *)param_1 = 0;
      uVar4 = 0;
    }
    else {
      if (-1 < (int)uVar3) {
        param_1[1] = uStack_38;
        *param_1 = local_40;
        param_1[2] = local_30;
        *(undefined1 *)(param_1 + 3) = 1;
        return;
      }
      FUN_00018218(param_1,local_40);
      uVar4 = 1;
      uVar3 = (uint)local_30._7_1_;
    }
    *(undefined1 *)(param_1 + 3) = uVar4;
    if ((uVar3 >> 7 & 1) != 0) {
      FUN_00008eb8(local_40,local_30 & 0x7fffffffffffffff);
    }
  }
  return;
}


