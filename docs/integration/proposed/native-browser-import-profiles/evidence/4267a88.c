
/* WARNING: Removing unreachable block (ram,0x04267df4) */
/* WARNING: Removing unreachable block (ram,0x04267dfc) */
/* WARNING: Removing unreachable block (ram,0x04267e00) */
/* WARNING: Removing unreachable block (ram,0x04267c64) */

void FUN_04267a88(undefined4 *param_1,undefined4 param_2,long *param_3,long param_4)

{
  undefined8 **ppuVar1;
  long *plVar2;
  byte bVar3;
  char cVar4;
  undefined8 ***pppuVar5;
  int iVar6;
  undefined8 ***pppuVar7;
  undefined8 **ppuVar8;
  undefined8 **ppuVar9;
  undefined8 **ppuVar10;
  undefined8 local_e0;
  undefined8 uStack_d8;
  undefined8 local_d0;
  undefined8 local_c8;
  undefined8 uStack_c0;
  undefined8 local_b8;
  long local_b0;
  long lStack_a8;
  long local_a0;
  undefined8 **local_90;
  undefined8 *puStack_88;
  undefined8 local_80;
  undefined8 **local_70;
  undefined8 *puStack_68;
  undefined8 local_60;
  
  local_70 = (undefined8 ***)0x0;
  puStack_68 = (undefined8 **)0x0;
  local_60 = (undefined8 **)0x0;
  if (*(char *)((long)param_3 + 0x17) < '\0') {
    func_0x00018218(&local_70,*param_3,param_3[1]);
  }
  else {
    puStack_68 = (undefined8 *)param_3[1];
    local_70 = (undefined8 **)*param_3;
    local_60 = (undefined8 **)param_3[2];
  }
  local_90 = (undefined8 ***)0x0;
  puStack_88 = (undefined8 **)0x0;
  local_80 = (undefined8 **)0x0;
  if (param_4 == 0) goto LAB_04267b80;
  pppuVar7 = (undefined8 ***)func_0x02029a80(param_4,0xd7f2e37,4);
  if (pppuVar7 != (undefined8 ***)0x0) {
    ppuVar8 = (undefined8 **)(long)*(char *)((long)pppuVar7 + 0x17);
    if ((long)ppuVar8 < 0) {
      ppuVar8 = pppuVar7[1];
    }
    if ((&local_70 != pppuVar7) && (ppuVar8 != (undefined8 **)0x0)) {
      if (*(char *)((long)pppuVar7 + 0x17) < '\0') {
        func_0x004a8ab4(&local_70,*pppuVar7,pppuVar7[1]);
      }
      else {
        puStack_68 = pppuVar7[1];
        local_70 = *pppuVar7;
        local_60 = pppuVar7[2];
      }
    }
  }
  pppuVar7 = (undefined8 ***)func_0x02029a80(param_4,0xdaa1638,9);
  if (pppuVar7 == (undefined8 ***)0x0) {
LAB_04267cc0:
    pppuVar7 = (undefined8 ***)func_0x02029a80(param_4,0xdb1ff23,9);
    if (pppuVar7 != (undefined8 ***)0x0) {
      cVar4 = *(char *)((long)pppuVar7 + 0x17);
      ppuVar9 = (undefined8 **)(long)cVar4;
      ppuVar8 = ppuVar9;
      if ((long)ppuVar9 < 0) {
        ppuVar8 = pppuVar7[1];
      }
      if ((&local_90 != pppuVar7) && (ppuVar8 != (undefined8 **)0x0)) {
        if ((long)local_80 < 0) {
          ppuVar8 = pppuVar7[1];
          pppuVar5 = (undefined8 ***)*pppuVar7;
          if (-1 < cVar4) {
            ppuVar8 = ppuVar9;
            pppuVar5 = pppuVar7;
          }
          func_0x004a8c00(&local_90,pppuVar5,ppuVar8);
        }
        else {
          if (-1 < cVar4) goto LAB_04267b70;
          func_0x004a8ab4(&local_90,*pppuVar7,pppuVar7[1]);
        }
      }
    }
  }
  else {
    cVar4 = *(char *)((long)pppuVar7 + 0x17);
    ppuVar9 = (undefined8 **)(long)cVar4;
    ppuVar8 = ppuVar9;
    if ((long)ppuVar9 < 0) {
      ppuVar8 = pppuVar7[1];
    }
    if (ppuVar8 == (undefined8 **)0x0) goto LAB_04267cc0;
    if (&local_90 != pppuVar7) {
      if ((long)local_80 < 0) {
        ppuVar8 = pppuVar7[1];
        pppuVar5 = (undefined8 ***)*pppuVar7;
        if (-1 < cVar4) {
          ppuVar8 = ppuVar9;
          pppuVar5 = pppuVar7;
        }
        func_0x004a8c00(&local_90,pppuVar5,ppuVar8);
        goto LAB_04267b80;
      }
      if (cVar4 < '\0') {
        func_0x004a8ab4(&local_90,*pppuVar7,pppuVar7[1]);
        goto LAB_04267b80;
      }
LAB_04267b70:
      puStack_88 = pppuVar7[1];
      local_90 = *pppuVar7;
      local_80 = pppuVar7[2];
    }
  }
LAB_04267b80:
  ppuVar9 = local_80;
  ppuVar8 = (undefined8 **)puStack_88;
  if (-1 < (long)local_80) {
    ppuVar8 = (undefined8 **)((ulong)local_80 >> 0x38);
  }
  if (ppuVar8 == (undefined8 **)0x0) {
    ppuVar8 = (undefined8 **)puStack_68;
    if (-1 < (long)local_60) {
      ppuVar8 = (undefined8 **)((ulong)local_60 >> 0x38);
    }
    bVar3 = *(byte *)((long)param_3 + 0x17);
    ppuVar10 = (undefined8 **)param_3[1];
    ppuVar1 = ppuVar10;
    if (-1 < (char)bVar3) {
      ppuVar1 = (undefined8 **)(ulong)bVar3;
    }
    if (ppuVar8 == ppuVar1) {
      pppuVar7 = (undefined8 ***)local_70;
      if (-1 < (long)local_60) {
        pppuVar7 = &local_70;
      }
      plVar2 = (long *)*param_3;
      if (-1 < (char)bVar3) {
        plVar2 = param_3;
      }
      iVar6 = func_0x08009860(pppuVar7,plVar2);
      if (iVar6 == 0) goto LAB_04267b98;
    }
    if ((long)ppuVar9 < 0) {
      plVar2 = (long *)*param_3;
      if (-1 < (char)bVar3) {
        plVar2 = param_3;
      }
      func_0x004a8c00(&local_90,plVar2,ppuVar1);
    }
    else if ((char)bVar3 < '\0') {
      func_0x004a8ab4(&local_90,*param_3,ppuVar10);
    }
    else {
      puStack_88 = (undefined8 *)param_3[1];
      local_90 = (undefined8 **)*param_3;
      local_80 = (undefined8 **)param_3[2];
    }
  }
LAB_04267b98:
  if (*(char *)((long)param_3 + 0x17) < '\0') {
    func_0x00018218(&local_b0,*param_3,param_3[1]);
  }
  else {
    lStack_a8 = param_3[1];
    local_b0 = *param_3;
    local_a0 = param_3[2];
  }
  pppuVar7 = (undefined8 ***)local_70;
  if (-1 < (long)local_60._7_1_) {
    pppuVar7 = &local_70;
  }
  ppuVar8 = (undefined8 **)puStack_68;
  if (-1 < (long)local_60) {
    ppuVar8 = (undefined8 **)(long)local_60._7_1_;
  }
  func_0x008e2310(&local_c8,pppuVar7,ppuVar8);
  pppuVar7 = (undefined8 ***)local_90;
  if (-1 < (long)local_80._7_1_) {
    pppuVar7 = &local_90;
  }
  ppuVar8 = (undefined8 **)puStack_88;
  if (-1 < (long)local_80) {
    ppuVar8 = (undefined8 **)(long)local_80._7_1_;
  }
  func_0x008e2310(&local_e0,pppuVar7,ppuVar8);
  *param_1 = param_2;
  *(long *)(param_1 + 4) = lStack_a8;
  *(long *)(param_1 + 2) = local_b0;
  *(long *)(param_1 + 6) = local_a0;
  local_b0 = 0;
  lStack_a8 = 0;
  local_a0 = 0;
  *(undefined8 *)(param_1 + 10) = uStack_c0;
  *(undefined8 *)(param_1 + 8) = local_c8;
  *(undefined8 *)(param_1 + 0xc) = local_b8;
  local_c8 = 0;
  uStack_c0 = 0;
  local_b8 = 0;
  *(undefined8 *)(param_1 + 0x10) = uStack_d8;
  *(undefined8 *)(param_1 + 0xe) = local_e0;
  *(undefined8 *)(param_1 + 0x12) = local_d0;
  local_e0 = 0;
  uStack_d8 = 0;
  local_d0 = 0;
  if ((long)local_80 < 0) {
    func_0x00008eb8(local_90,(ulong)local_80 & 0x7fffffffffffffff);
  }
  return;
}

