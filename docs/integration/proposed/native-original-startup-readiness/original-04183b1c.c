// func FUN_04183b1c @ 04183b1c size 456

byte FUN_04183b1c(undefined8 param_1,code *param_2)

{
  int iVar1;
  qword *pqVar2;
  ulong uVar3;
  code *pcVar4;
  byte bVar5;
  undefined1 auStack_90 [32];
  ulong local_70 [2];
  long *local_60;
  int *local_58;
  undefined8 local_50;
  undefined2 local_42;
  
  local_42 = 0;
  local_50 = 0;
  local_70[1] = 0;
  local_70[0] = 0;
  local_58 = (int *)0x0;
  local_60 = (long *)0x0;
  FUN_01df31f4(local_70,0);
  pqVar2 = &segment_command_00000020.vmsize;
  FUN_0000f368();
  *(undefined4 *)pqVar2 = 1;
  pqVar2[1] = (qword)FUN_04183ce4;
  pqVar2[2] = (qword)FUN_03a2a6d0;
  pqVar2[3] = (qword)FUN_0255db00;
  if (((ulong)local_70 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(local_70);
  }
  uVar3 = DAT_0ebb2088;
  pqVar2[5] = (qword)local_70;
  if (((long)&local_42 + 1U & 0xfffffffc00000000) == uVar3) {
    FUN_000142fc((long)&local_42 + 1);
    uVar3 = DAT_0ebb2088;
  }
  pqVar2[6] = (long)&local_42 + 1U;
  if (((ulong)&local_42 & 0xfffffffc00000000) == uVar3) {
    FUN_000142fc(&local_42);
  }
  pqVar2[7] = (qword)&local_42;
  (*param_2)(param_1,pqVar2);
  if ((int)param_1 == 0) {
    bVar5 = 1;
  }
  else {
    if ((local_42 & 1) == 0) {
      FUN_00050c80(auStack_90,"WaitForAsideReadiness",
                   "../../chrome/browser/ui/startup/startup_browser_creator_impl.cc",0xc0);
      FUN_01df3978(local_70,auStack_90);
    }
    bVar5 = local_42._1_1_;
  }
  local_50 = 0;
  if (local_58 != (int *)0x0) {
    *(undefined1 *)(local_58 + 1) = 1;
    if (local_58 != (int *)0x0) {
      LOAcquire();
      iVar1 = *local_58;
      *local_58 = iVar1 + -1;
      LORelease();
      if (iVar1 == 1) {
        FUN_00008eb8(local_58,8);
      }
    }
  }
  if (local_60 != (long *)0x0) {
    LOAcquire();
    iVar1 = (int)local_60[1];
    *(int *)(local_60 + 1) = iVar1 + -1;
    LORelease();
    if (iVar1 == 1) {
      pcVar4 = *(code **)(*local_60 + 0x18);
      if (pcVar4 == (code *)&LAB_042caa8c) {
        pcVar4 = *(code **)(*local_60 + 0x10);
      }
      (*pcVar4)();
    }
  }
  if ((local_70[0] & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00026a44();
  }
  return bVar5 & 1;
}


