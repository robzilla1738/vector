
/* WARNING: Removing unreachable block (ram,0x04266f24) */
/* WARNING: Removing unreachable block (ram,0x04266f70) */

void entry(long *param_1,undefined8 param_2)

{
  undefined8 ***pppuVar1;
  undefined8 ****ppppuVar2;
  undefined8 ***pppuVar3;
  undefined8 ***pppuVar4;
  undefined8 *puVar5;
  ulong *puVar6;
  ulong *puVar7;
  char cVar8;
  code *pcVar9;
  int iVar10;
  long lVar11;
  ulong uVar12;
  int *piVar13;
  undefined8 *puVar14;
  undefined8 *puVar15;
  long lVar16;
  undefined4 *puVar17;
  undefined8 ****ppppuVar18;
  long lVar19;
  undefined8 ***local_148;
  undefined8 local_140;
  ulong uStack_138;
  undefined8 local_130;
  undefined8 local_128;
  undefined8 uStack_120;
  undefined8 local_118;
  undefined8 local_110;
  undefined8 uStack_108;
  undefined8 local_100;
  undefined8 ***local_f8;
  undefined8 ***local_f0;
  undefined8 uStack_e8;
  long local_e0;
  long lStack_d8;
  long local_d0;
  ulong local_c8;
  undefined8 local_c0;
  undefined8 uStack_b8;
  undefined8 uStack_b0;
  ulong local_a8;
  undefined8 ***local_a0;
  long lStack_98;
  undefined8 local_90;
  undefined8 local_88;
  undefined8 uStack_80;
  undefined8 local_78;
  
  local_88 = 0;
  uStack_80 = 0;
  local_78 = 0;
  func_0x042600fc(&local_148);
  func_0x01699414(&local_88,&local_148,0xdb1fa26,0xb);
  if ((long)uStack_138 < 0) {
    func_0x00008eb8(local_148,uStack_138 & 0x7fffffffffffffff);
  }
  local_a0 = (undefined8 ****)0x0;
  lStack_98 = 0;
  local_90 = 0;
  lVar11 = func_0x01f92cac(&local_88,0xd7e7202,2);
  if (lVar11 != 0) {
    uVar12 = func_0x042cdd68(lVar11,0xffffffffffffffff,&local_a0);
    if ((uVar12 & 1) != 0) {
      uStack_b8 = 0;
      local_c0 = 0;
      local_a8 = 0;
      uStack_b0 = 0;
      ppppuVar18 = (undefined8 ****)local_a0;
      if (-1 < (long)local_90._7_1_) {
        ppppuVar18 = &local_a0;
      }
      lVar19 = lStack_98;
      if (-1 < local_90) {
        lVar19 = (long)local_90._7_1_;
      }
      func_0x01bc1f3c(&local_c0,ppppuVar18,lVar19,0,200);
      if ((local_a8 & 1) == 0) {
        FUN_04267508(param_1,param_2,0);
      }
      else {
        puVar14 = (undefined8 *)func_0x0046ad40(&local_c0,0xdb1fef1,0x12);
        if ((puVar14 == (undefined8 *)0x0) || (*(char *)(puVar14 + 3) != '\x06')) {
          FUN_04267508(param_1,param_2,0);
        }
        else {
          lStack_d8 = 0;
          local_e0 = 0;
          local_c8 = 0;
          local_d0 = 0;
          local_f0 = (undefined8 ****)0x0;
          uStack_e8 = 0;
          local_f8 = &local_f0;
          if ((local_a8 & 1) == 0) {
LAB_042673bc:
                    /* WARNING: Does not return */
            pcVar9 = (code *)SoftwareBreakpoint(1,0x42673c0);
            (*pcVar9)();
          }
          puVar15 = (undefined8 *)func_0x0046ad40(&local_c0,0xdb1ff04,0x16);
          if ((puVar15 != (undefined8 *)0x0) && (*(char *)(puVar15 + 3) == '\a')) {
            puVar7 = (ulong *)*puVar15;
            if (puVar7 + puVar15[1] * 4 < puVar7) {
LAB_042674fc:
                    /* WARNING: Does not return */
              pcVar9 = (code *)SoftwareBreakpoint(0,0x4267500);
              (*pcVar9)();
            }
            for (lVar19 = puVar15[1] << 5; lVar19 != 0; lVar19 = lVar19 + -0x20) {
              if ((char)puVar7[3] == '\x04') {
                cVar8 = *(char *)((long)puVar7 + 0x17);
                puVar6 = (ulong *)*puVar7;
                if (-1 < (long)cVar8) {
                  puVar6 = puVar7;
                }
                uVar12 = puVar7[1];
                if (-1 < cVar8) {
                  uVar12 = (long)cVar8;
                }
                lVar16 = func_0x0095e840(puVar14,puVar6,uVar12);
                if ((lVar16 != 0) &&
                   (uVar12 = FUN_0426793c(param_2,puVar7,&local_c8), (uVar12 & 1) != 0)) {
                  FUN_04267a88(&local_148,param_2,puVar7,lVar16);
                  if (lStack_d8 == local_d0) {
                    puVar17 = (undefined4 *)func_0x0426aa04(&local_e0,&local_148);
                  }
                  else {
                    puVar17 = (undefined4 *)(local_e0 + lStack_d8 * 0x50);
                    if (puVar17 == (undefined4 *)0x0) goto LAB_042673bc;
                    *puVar17 = local_148._0_4_;
                    *(undefined8 *)(puVar17 + 6) = local_130;
                    *(ulong *)(puVar17 + 4) = uStack_138;
                    *(undefined8 *)(puVar17 + 2) = local_140;
                    uStack_138 = 0;
                    local_130 = 0;
                    local_140 = 0;
                    *(undefined8 *)(puVar17 + 0xc) = local_118;
                    *(undefined8 *)(puVar17 + 10) = uStack_120;
                    *(undefined8 *)(puVar17 + 8) = local_128;
                    uStack_120 = 0;
                    local_118 = 0;
                    local_128 = 0;
                    *(undefined8 *)(puVar17 + 0x12) = local_100;
                    *(undefined8 *)(puVar17 + 0x10) = uStack_108;
                    *(undefined8 *)(puVar17 + 0xe) = local_110;
                    uStack_108 = 0;
                    local_100 = 0;
                    local_110 = 0;
                    puVar17 = puVar17 + 0x14;
                  }
                  lStack_d8 = ((long)puVar17 - local_e0 >> 4) * -0x3333333333333333;
                  if ((long)puVar17 - local_e0 == 0) goto LAB_042673bc;
                  func_0x0424e054(&local_148);
                  func_0x00f0e580(&local_f8,&local_f8,puVar7);
                }
              }
              puVar7 = puVar7 + 4;
            }
          }
          if ((puVar14[1] & 0x7ffffffffffffff) != 0) {
            puVar15 = (undefined8 *)*puVar14;
            puVar14 = puVar15 + puVar14[1] * 4;
            do {
              lVar19 = puVar15[3];
              if ((undefined8 ****)local_f0 != (undefined8 ****)0x0) {
                cVar8 = *(char *)((long)puVar15 + 0x17);
                puVar5 = (undefined8 *)*puVar15;
                if (-1 < (long)cVar8) {
                  puVar5 = puVar15;
                }
                ppppuVar18 = (undefined8 ****)local_f0;
                pppuVar1 = (undefined8 ***)puVar15[1];
                if (-1 < cVar8) {
                  pppuVar1 = (undefined8 ***)(long)cVar8;
                }
                do {
                  while( true ) {
                    cVar8 = *(char *)((long)ppppuVar18 + 0x37);
                    ppppuVar2 = (undefined8 ****)ppppuVar18[4];
                    if (-1 < (long)cVar8) {
                      ppppuVar2 = ppppuVar18 + 4;
                    }
                    pppuVar3 = ppppuVar18[5];
                    if (-1 < cVar8) {
                      pppuVar3 = (undefined8 ***)(long)cVar8;
                    }
                    pppuVar4 = pppuVar3;
                    if (pppuVar1 <= pppuVar3) {
                      pppuVar4 = pppuVar1;
                    }
                    iVar10 = func_0x08009860(puVar5,ppppuVar2,pppuVar4);
                    if (iVar10 != 0) break;
                    if (pppuVar1 == pppuVar3) {
                      if (ppppuVar18 != &local_f0) goto LAB_0426726c;
                      goto LAB_04267194;
                    }
                    if (pppuVar3 <= pppuVar1) goto LAB_04267134;
LAB_04267174:
                    ppppuVar18 = (undefined8 ****)*ppppuVar18;
                    if (ppppuVar18 == (undefined8 ****)0x0) goto LAB_04267194;
                  }
                  if (iVar10 < 0) goto LAB_04267174;
LAB_04267134:
                  ppppuVar2 = ppppuVar18 + 1;
                  ppppuVar18 = (undefined8 ****)*ppppuVar2;
                } while ((undefined8 ****)*ppppuVar2 != (undefined8 ****)0x0);
              }
LAB_04267194:
              if ((*(char *)(lVar19 + 0x18) == '\x06') &&
                 (uVar12 = FUN_0426793c(param_2,puVar15,&local_c8), (uVar12 & 1) != 0)) {
                if (*(char *)(lVar19 + 0x18) != '\x06') {
                  if (*(char *)(lVar19 + 0x18) == -1) {
                    func_0x04c27290(0xd7e4ef8);
                  }
                  func_0x04c27290(0xd7e4f18);
                  goto LAB_042674fc;
                }
                FUN_04267a88(&local_148,param_2,puVar15,lVar19);
                if (lStack_d8 == local_d0) {
                  puVar17 = (undefined4 *)func_0x0426aa04(&local_e0,&local_148);
                }
                else {
                  puVar17 = (undefined4 *)(local_e0 + lStack_d8 * 0x50);
                  if (puVar17 == (undefined4 *)0x0) goto LAB_042673bc;
                  *puVar17 = local_148._0_4_;
                  *(undefined8 *)(puVar17 + 6) = local_130;
                  *(ulong *)(puVar17 + 4) = uStack_138;
                  *(undefined8 *)(puVar17 + 2) = local_140;
                  uStack_138 = 0;
                  local_130 = 0;
                  local_140 = 0;
                  *(undefined8 *)(puVar17 + 0xc) = local_118;
                  *(undefined8 *)(puVar17 + 10) = uStack_120;
                  *(undefined8 *)(puVar17 + 8) = local_128;
                  uStack_120 = 0;
                  local_118 = 0;
                  local_128 = 0;
                  *(undefined8 *)(puVar17 + 0x12) = local_100;
                  *(undefined8 *)(puVar17 + 0x10) = uStack_108;
                  *(undefined8 *)(puVar17 + 0xe) = local_110;
                  uStack_108 = 0;
                  local_100 = 0;
                  local_110 = 0;
                  puVar17 = puVar17 + 0x14;
                }
                lStack_d8 = ((long)puVar17 - local_e0 >> 4) * -0x3333333333333333;
                if ((long)puVar17 - local_e0 == 0) goto LAB_042673bc;
                func_0x0424e054(&local_148);
              }
LAB_0426726c:
              puVar15 = puVar15 + 4;
            } while (puVar15 != puVar14);
          }
          lVar19 = local_d0;
          if (lStack_d8 == 0) {
            FUN_04267508(param_1,param_2,local_c8 & 0xff);
          }
          else {
            *param_1 = local_e0;
            param_1[1] = lStack_d8;
            local_e0 = 0;
            local_d0 = 0;
            param_1[2] = lVar19;
            *(undefined1 *)(param_1 + 3) = (undefined1)local_c8;
          }
          lVar19 = local_e0;
          local_148 = &local_f8;
          func_0x00720aac(&local_148,local_f0);
          if (lVar19 != 0) {
            lStack_d8 = 0;
            func_0x00008eb8(lVar19,local_d0 * 0x50);
          }
        }
      }
      if ((char)local_a8 != '\0') {
        func_0x0095e480(&local_c0);
      }
      goto LAB_04266f10;
    }
  }
  piVar13 = (int *)func_0x08008d34();
  FUN_04267508(param_1,param_2,*piVar13 == 1);
LAB_04266f10:
  if (lVar11 != 0) {
    func_0x0821d1d8(lVar11);
  }
  return;
}

