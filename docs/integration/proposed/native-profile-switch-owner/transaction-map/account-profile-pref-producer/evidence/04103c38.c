// func FUN_04103c38 @ 04103c38 size 264

void FUN_04103c38(long param_1,undefined8 *param_2,ulong param_3)

{
  ulong uVar1;
  long lVar2;
  undefined8 *puVar3;
  undefined4 local_50 [6];
  undefined1 local_38;
  
  if (param_1 != 0) {
    uVar1 = param_2[1];
    if ((*(byte *)((long)param_2 + 0x17) & 0x80) == 0) {
      uVar1 = (ulong)*(byte *)((long)param_2 + 0x17);
    }
    if (uVar1 == 0) {
      FUN_04103d40(param_1);
      return;
    }
    lVar2 = param_1;
    FUN_004bcc4c(param_1,"aside.account_user_id",0x15);
    if (lVar2 != 0) {
      lVar2 = (long)*(char *)((long)param_2 + 0x17);
      puVar3 = param_2;
      if (lVar2 < 0) {
        puVar3 = (undefined8 *)*param_2;
        lVar2 = param_2[1];
      }
      FUN_00bddb80(local_50,puVar3,lVar2);
      FUN_015098a8(param_1,"aside.account_user_id",0x15,local_50);
      FUN_0161e7d4(local_50);
    }
    lVar2 = param_1;
    FUN_004bcc4c(param_1,"aside.account_id",0x10);
    if (lVar2 != 0) {
      local_50[0] = (undefined4)param_3;
      if ((param_3 & 0x180000000) != 0x100000000) {
        local_50[0] = 0xffffffff;
      }
      local_38 = 2;
      FUN_015098a8(param_1,"aside.account_id",0x10,local_50);
      FUN_0161e7d4(local_50);
    }
  }
  return;
}


