// func FUN_041043ac @ 041043ac size 236

void FUN_041043ac(long *param_1,undefined8 *param_2,undefined8 *param_3)

{
  long *plVar1;
  long lVar2;
  undefined8 *puVar3;
  undefined1 auStack_50 [32];
  
  if ((param_1 != (long *)0x0) && ((*(byte *)(param_1 + 9) & 1) == 0)) {
    (**(code **)(*param_1 + 0x168))();
    if (param_1 != (long *)0x0) {
      plVar1 = param_1;
      FUN_004bcc4c();
      if (plVar1 != (long *)0x0) {
        lVar2 = (long)*(char *)((long)param_2 + 0x17);
        puVar3 = param_2;
        if (lVar2 < 0) {
          puVar3 = (undefined8 *)*param_2;
          lVar2 = param_2[1];
        }
        FUN_00bddb80(auStack_50,puVar3,lVar2);
        FUN_015098a8(param_1,"aside.account_display_name",0x1a,auStack_50);
        FUN_0161e7d4(auStack_50);
      }
      plVar1 = param_1;
      FUN_004bcc4c(param_1,"aside.account_profile_url",0x19);
      if (plVar1 != (long *)0x0) {
        lVar2 = (long)*(char *)((long)param_3 + 0x17);
        puVar3 = param_3;
        if (lVar2 < 0) {
          puVar3 = (undefined8 *)*param_3;
          lVar2 = param_3[1];
        }
        FUN_00bddb80(auStack_50,puVar3,lVar2);
        FUN_015098a8(param_1,"aside.account_profile_url",0x19,auStack_50);
        FUN_0161e7d4(auStack_50);
      }
    }
  }
  return;
}


