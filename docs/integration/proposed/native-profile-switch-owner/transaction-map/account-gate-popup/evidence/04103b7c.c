// func FUN_04103b7c @ 04103b7c size 188

void FUN_04103b7c(ulong param_1)

{
  ulong uVar1;
  undefined1 local_40 [24];
  undefined1 local_28;
  
  if (((param_1 != 0) &&
      (uVar1 = param_1, FUN_004bcc4c(param_1,"aside.onboarding_completed",0x1a), uVar1 != 0)) &&
     ((uVar1 = param_1, FUN_004bcc4c(param_1,"aside.onboarding_completed",0x1a), uVar1 == 0 ||
      (uVar1 = param_1, FUN_00306500(param_1,"aside.onboarding_completed",0x1a), (uVar1 & 1) == 0)))
     ) {
    local_40[0] = 1;
    local_28 = 1;
    FUN_015098a8(param_1,"aside.onboarding_completed",0x1a,local_40);
    FUN_0161e7d4(local_40);
                    /* WARNING: Could not recover jumptable at 0x04103c34. Too many branches */
                    /* WARNING: Treating indirect jump as call */
    (**(code **)(**(long **)(param_1 + 0x18) + 0x98))(*(long **)(param_1 + 0x18),0,0);
    return;
  }
  return;
}


