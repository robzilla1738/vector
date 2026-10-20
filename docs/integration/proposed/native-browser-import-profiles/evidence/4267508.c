
void FUN_04267508(long *param_1,undefined8 param_2,undefined1 param_3)

{
  undefined8 ****ppppuVar1;
  long ****pppplVar2;
  ulong uVar3;
  code *pcVar4;
  int iVar5;
  long lVar6;
  undefined4 *puVar7;
  long lVar8;
  undefined8 uVar9;
  int *piVar10;
  long *plVar11;
  undefined4 local_e0;
  undefined4 uStack_dc;
  ulong uStack_d8;
  ulong uStack_d0;
  undefined8 local_c8;
  undefined8 local_c0;
  undefined8 uStack_b8;
  undefined8 local_b0;
  undefined8 local_a8;
  undefined8 uStack_a0;
  undefined8 local_98;
  long ***local_90;
  ulong uStack_88;
  undefined8 local_80;
  undefined8 ***local_78;
  undefined8 uStack_70;
  ulong local_68;
  
  param_1[1] = 0;
  *param_1 = 0;
  param_1[3] = 0;
  param_1[2] = 0;
  plVar11 = param_1 + 3;
  *(undefined1 *)plVar11 = param_3;
  local_78 = (undefined8 ****)0x0;
  uStack_70 = 0;
  local_68 = 0;
  func_0x042600fc(&local_78);
  ppppuVar1 = (undefined8 ****)local_78;
  if (-1 < (long)local_68) {
    ppppuVar1 = &local_78;
  }
  lVar6 = func_0x086ed3f0(ppppuVar1);
  if (lVar6 == 0) {
    piVar10 = (int *)func_0x08008d34();
    if (*piVar10 == 1) {
      param_3 = 1;
    }
    *(undefined1 *)plVar11 = param_3;
  }
  else {
    while( true ) {
      puVar7 = (undefined4 *)func_0x08008d34();
      *puVar7 = 0;
      lVar8 = func_0x086ed3fc(lVar6);
      if (lVar8 == 0) break;
      local_90 = (long ***)0x0;
      uStack_88 = 0;
      local_80 = 0;
      lVar8 = lVar8 + 0x15;
      if (lVar8 == 0) goto LAB_04267854;
      uVar9 = func_0x0800339c(lVar8);
      func_0x006ee850(&local_e0,lVar8,uVar9);
      uVar3 = uStack_d8;
      puVar7 = (undefined4 *)CONCAT44(uStack_dc,local_e0);
      if (-1 < (long)uStack_d0) {
        uVar3 = uStack_d0 >> 0x38;
        puVar7 = &local_e0;
      }
      iVar5 = func_0x0103eb5c(puVar7,uVar3);
      if (iVar5 == 0) {
        local_90 = (long ***)0x0;
        uStack_88 = 0;
        local_80 = 0;
LAB_04267714:
        if ((long)uStack_d0 < 0) {
          func_0x00008eb8(CONCAT44(uStack_dc,local_e0),uStack_d0 & 0x7fffffffffffffff);
        }
      }
      else {
        if ((long)uStack_d0 < 0) {
          func_0x00018218(&local_90,CONCAT44(uStack_dc,local_e0),uStack_d8);
          goto LAB_04267714;
        }
        local_90 = (long ***)CONCAT44(uStack_dc,local_e0);
        uStack_88 = uStack_d8;
        local_80 = uStack_d0;
      }
      pppplVar2 = (long ****)local_90;
      if (-1 < (long)local_80._7_1_) {
        pppplVar2 = &local_90;
      }
      uVar3 = uStack_88;
      if (-1 < (long)local_80) {
        uVar3 = (long)local_80._7_1_;
      }
      if (uVar3 == 7) {
        if (*(int *)pppplVar2 != 0x61666544 || *(int *)((long)pppplVar2 + 3) != 0x746c7561)
        goto LAB_042675ac;
LAB_042675d0:
        iVar5 = FUN_0426793c(param_2,&local_90,plVar11);
        if (iVar5 != 0) {
          FUN_04267a88(&local_e0,param_2,&local_90,0);
          if (param_1[1] == param_1[2]) {
            puVar7 = (undefined4 *)func_0x0426aa04(param_1,&local_e0);
            lVar8 = *param_1;
          }
          else {
            lVar8 = *param_1;
            puVar7 = (undefined4 *)(lVar8 + param_1[1] * 0x50);
            if (puVar7 == (undefined4 *)0x0) goto LAB_04267854;
            *puVar7 = local_e0;
            *(undefined8 *)(puVar7 + 6) = local_c8;
            *(ulong *)(puVar7 + 4) = uStack_d0;
            *(ulong *)(puVar7 + 2) = uStack_d8;
            uStack_d0 = 0;
            local_c8 = 0;
            uStack_d8 = 0;
            *(undefined8 *)(puVar7 + 0xc) = local_b0;
            *(undefined8 *)(puVar7 + 10) = uStack_b8;
            *(undefined8 *)(puVar7 + 8) = local_c0;
            uStack_b8 = 0;
            local_b0 = 0;
            local_c0 = 0;
            *(undefined8 *)(puVar7 + 0x12) = local_98;
            *(undefined8 *)(puVar7 + 0x10) = uStack_a0;
            *(undefined8 *)(puVar7 + 0xe) = local_a8;
            uStack_a0 = 0;
            local_98 = 0;
            local_a8 = 0;
            puVar7 = puVar7 + 0x14;
          }
          param_1[1] = ((long)puVar7 - lVar8 >> 4) * -0x3333333333333333;
          if ((long)puVar7 - lVar8 == 0) {
LAB_04267854:
                    /* WARNING: Does not return */
            pcVar4 = (code *)SoftwareBreakpoint(1,0x4267858);
            (*pcVar4)();
          }
          func_0x0424e054(&local_e0);
        }
      }
      else {
        if ((7 < uVar3) && (*pppplVar2 == (long ***)0x20656c69666f7250)) goto LAB_042675d0;
LAB_042675ac:
        if (((int)param_2 == 2) &&
           ((4 < uVar3 && (*(char *)((long)pppplVar2 + 4) == '-' && *(int *)pppplVar2 == 0x72657375)
            ))) goto LAB_042675d0;
      }
      if ((long)local_80 < 0) {
        func_0x00008eb8(local_90,local_80 & 0x7fffffffffffffff);
      }
    }
    piVar10 = (int *)func_0x08008d34();
    *(byte *)(param_1 + 3) = *(byte *)(param_1 + 3) | *piVar10 == 1;
    lVar8 = param_1[1] * 0x50;
    if (lVar8 != 0) {
      func_0x04268340(*param_1,*param_1 + lVar8,
                      LZCOUNT((lVar8 >> 4) * -0x3333333333333333) << 1 ^ 0x7e,1);
    }
    func_0x086ed8c0(lVar6);
  }
  if ((long)local_68 < 0) {
    func_0x00008eb8(local_78,local_68 & 0x7fffffffffffffff);
  }
  return;
}

