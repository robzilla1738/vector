// func FUN_02d25d20 @ 02d25d20 size 1564

void FUN_02d25d20(long param_1,undefined8 param_2,undefined8 param_3,undefined8 *param_4,int param_5
                 )

{
  size_t sVar1;
  size_t sVar2;
  undefined8 *puVar3;
  byte bVar4;
  byte bVar5;
  code *pcVar6;
  int iVar7;
  undefined8 uVar8;
  long *plVar9;
  long lVar10;
  undefined8 *puVar11;
  undefined8 *puVar12;
  undefined8 *local_c8;
  long local_c0;
  ulong uStack_b8;
  undefined8 *local_b0;
  long local_a8;
  ulong uStack_a0;
  byte local_98;
  undefined8 *local_90;
  long local_88;
  ulong uStack_80;
  byte local_78;
  char local_70;
  byte local_62;
  undefined1 uStack_61;
  
  if (*(char *)(param_1 + 0x48) == '\0') {
    if (((*(char *)((long)param_4 + 0x17) < '\0') && (param_4[1] == 0x20)) &&
       (plVar9 = (long *)*param_4,
       ((*plVar9 == s_fjdhphbdlfjogobdofoaagnlnkoibdge_0ce48949._0_8_ &&
        plVar9[1] == s_fjdhphbdlfjogobdofoaagnlnkoibdge_0ce48949._8_8_) &&
       plVar9[2] == s_fjdhphbdlfjogobdofoaagnlnkoibdge_0ce48949._16_8_) &&
       plVar9[3] == s_fjdhphbdlfjogobdofoaagnlnkoibdge_0ce48949._24_8_)) {
      local_90 = (undefined8 *)0x0;
      local_88 = 0;
      uStack_80 = 0;
      FUN_02ede9a0(param_2,"extensions.pinned_extensions",&local_90);
      lVar10 = local_88 * 0x18;
      if (lVar10 != 0) {
        bVar5 = *(byte *)((long)param_4 + 0x17);
        puVar12 = local_90;
        sVar1 = param_4[1];
        if (-1 < (char)bVar5) {
          sVar1 = (ulong)bVar5;
        }
        do {
          bVar4 = *(byte *)((long)puVar12 + 0x17);
          sVar2 = puVar12[1];
          if (-1 < (char)bVar4) {
            sVar2 = (ulong)bVar4;
          }
          if (sVar2 == sVar1) {
            puVar3 = (void *)*puVar12;
            if (-1 < (char)bVar4) {
              puVar3 = puVar12;
            }
            puVar11 = (void *)*param_4;
            if (-1 < (char)bVar5) {
              puVar11 = param_4;
            }
            iVar7 = _memcmp(puVar3,puVar11,sVar1);
            if (iVar7 == 0) goto LAB_02d25ef8;
          }
          lVar10 = lVar10 + -0x18;
          puVar12 = puVar12 + 3;
        } while (lVar10 != 0);
      }
      FUN_00775c74(&local_90,param_4);
      uStack_a0 = uStack_80;
      local_a8 = local_88;
      local_b0 = local_90;
      local_90 = (undefined8 *)0x0;
      local_88 = 0;
      uStack_80 = 0;
      FUN_02d265a0(&local_b0);
      FUN_06c857ac(param_2,"extensions.pinned_extensions",&local_b0);
      puVar12 = local_b0;
      if (local_b0 != (undefined8 *)0x0) {
        if (local_a8 * 0x18 != 0) {
          lVar10 = local_a8 * -0x18;
          puVar3 = local_b0 + local_a8 * 3;
          do {
            puVar11 = puVar3 + -3;
            if (puVar11 == (undefined8 *)0x0) goto LAB_02d26338;
            if (*(char *)((long)puVar3 + -1) < '\0') {
              FUN_00008eb8(*puVar11,puVar3[-1] & 0x7fffffffffffffff);
            }
            lVar10 = lVar10 + 0x18;
            puVar3 = puVar11;
          } while (lVar10 != 0);
        }
        local_a8 = ((long)puVar12 - (long)local_b0 >> 3) * -0x5555555555555555;
        FUN_00008eb8(local_b0,uStack_a0 * 0x18);
      }
      if (param_5 != 0) {
        FUN_07627030(param_3,param_4,1);
      }
LAB_02d25ef8:
      puVar12 = local_90;
      if (local_90 != (undefined8 *)0x0) {
        if (local_88 * 0x18 != 0) {
          lVar10 = local_88 * -0x18;
          puVar3 = local_90 + local_88 * 3;
          do {
            puVar11 = puVar3 + -3;
            if (puVar11 == (undefined8 *)0x0) goto LAB_02d26338;
            if (*(char *)((long)puVar3 + -1) < '\0') {
              FUN_00008eb8(*puVar11,puVar3[-1] & 0x7fffffffffffffff);
            }
            lVar10 = lVar10 + 0x18;
            puVar3 = puVar11;
          } while (lVar10 != 0);
        }
        local_88 = ((long)puVar12 - (long)local_90 >> 3) * -0x5555555555555555;
        FUN_00008eb8(local_90,uStack_80 * 0x18);
      }
      if ((*(byte *)(param_1 + 0x48) & 1) != 0) {
        return;
      }
    }
    if (((*(char *)((long)param_4 + 0x17) < '\0') && (param_4[1] == 0x20)) &&
       (plVar9 = (long *)*param_4,
       ((*plVar9 == s_clcdgiameigmljcbkkcbjiljinmfkncl_0ce4896a._0_8_ &&
        plVar9[1] == s_clcdgiameigmljcbkkcbjiljinmfkncl_0ce4896a._8_8_) &&
       plVar9[2] == s_clcdgiameigmljcbkkcbjiljinmfkncl_0ce4896a._16_8_) &&
       plVar9[3] == s_clcdgiameigmljcbkkcbjiljinmfkncl_0ce4896a._24_8_)) {
      local_62 = 0;
      uVar8 = param_2;
      FUN_06c839a0(param_2,param_4,"aside_password_manager_toolbar_pin_initialized",0x2e,&local_62);
      if (((int)uVar8 == 0) || ((local_62 & 1) == 0)) {
        local_b0 = (undefined8 *)CONCAT71(local_b0._1_7_,1);
        local_98 = 1;
        FUN_0190ed80(&local_90,&local_b0);
        local_70 = '\x01';
        FUN_0261cf6c(param_2,param_4,"aside_password_manager_toolbar_pin_initialized",0x2e,&local_90
                    );
        if (local_70 != '\0') {
          if ((local_78 != 0xff) && ((local_78 & 0xfd) != 0)) {
            if (local_78 == 4) {
              if ((long)uStack_80 < 0) {
                FUN_00008eb8(local_90,uStack_80 & 0x7fffffffffffffff);
              }
            }
            else {
              (*(code *)(&PTR_FUN_0e8c1878)[(uint)local_78])(&uStack_61,&local_90);
            }
          }
          local_78 = 0xff;
        }
        if ((local_98 != 0xff) && ((local_98 & 0xfd) != 0)) {
          if (local_98 == 4) {
            if ((long)uStack_a0 < 0) {
              FUN_00008eb8(local_b0,uStack_a0 & 0x7fffffffffffffff);
            }
          }
          else {
            (*(code *)(&PTR_FUN_0e8c1878)[(uint)local_98])(&uStack_61,&local_b0);
          }
        }
        local_b0 = (undefined8 *)0x0;
        local_a8 = 0;
        uStack_a0 = 0;
        FUN_02ede9a0(param_2,"extensions.pinned_extensions",&local_b0);
        lVar10 = local_a8 * 0x18;
        if (lVar10 != 0) {
          bVar5 = *(byte *)((long)param_4 + 0x17);
          puVar12 = local_b0;
          sVar1 = param_4[1];
          if (-1 < (char)bVar5) {
            sVar1 = (ulong)bVar5;
          }
          do {
            bVar4 = *(byte *)((long)puVar12 + 0x17);
            sVar2 = puVar12[1];
            if (-1 < (char)bVar4) {
              sVar2 = (ulong)bVar4;
            }
            if (sVar2 == sVar1) {
              puVar3 = (undefined8 *)*puVar12;
              if (-1 < (char)bVar4) {
                puVar3 = puVar12;
              }
              puVar11 = (undefined8 *)*param_4;
              if (-1 < (char)bVar5) {
                puVar11 = param_4;
              }
              iVar7 = _memcmp(puVar3,puVar11,sVar1);
              if (iVar7 == 0) goto LAB_02d2626c;
            }
            lVar10 = lVar10 + -0x18;
            puVar12 = puVar12 + 3;
          } while (lVar10 != 0);
        }
        FUN_00775c74(&local_b0,param_4);
        uStack_b8 = uStack_a0;
        local_c0 = local_a8;
        local_c8 = local_b0;
        local_b0 = (undefined8 *)0x0;
        local_a8 = 0;
        uStack_a0 = 0;
        FUN_02d265a0(&local_c8);
        FUN_06c857ac(param_2,"extensions.pinned_extensions",&local_c8);
        puVar12 = local_c8;
        if (local_c8 != (undefined8 *)0x0) {
          if (local_c0 * 0x18 != 0) {
            lVar10 = local_c0 * -0x18;
            puVar3 = local_c8 + local_c0 * 3;
            do {
              puVar11 = puVar3 + -3;
              if (puVar11 == (undefined8 *)0x0) goto LAB_02d26338;
              if (*(char *)((long)puVar3 + -1) < '\0') {
                FUN_00008eb8(*puVar11,puVar3[-1] & 0x7fffffffffffffff);
              }
              lVar10 = lVar10 + 0x18;
              puVar3 = puVar11;
            } while (lVar10 != 0);
          }
          local_c0 = ((long)puVar12 - (long)local_c8 >> 3) * -0x5555555555555555;
          FUN_00008eb8(local_c8,uStack_b8 * 0x18);
        }
        if (param_5 != 0) {
          FUN_07627030(param_3,param_4,1);
        }
LAB_02d2626c:
        puVar12 = local_b0;
        if (local_b0 != (undefined8 *)0x0) {
          if (local_a8 * 0x18 != 0) {
            lVar10 = local_a8 * -0x18;
            puVar3 = local_b0 + local_a8 * 3;
            do {
              puVar11 = puVar3 + -3;
              if (puVar11 == (undefined8 *)0x0) {
LAB_02d26338:
                    /* WARNING: Does not return */
                pcVar6 = (code *)SoftwareBreakpoint(1,0x2d2633c);
                (*pcVar6)();
              }
              if (*(char *)((long)puVar3 + -1) < '\0') {
                FUN_00008eb8(*puVar11,puVar3[-1] & 0x7fffffffffffffff);
              }
              lVar10 = lVar10 + 0x18;
              puVar3 = puVar11;
            } while (lVar10 != 0);
          }
          local_a8 = ((long)puVar12 - (long)local_b0 >> 3) * -0x5555555555555555;
          FUN_00008eb8(local_b0,uStack_a0 * 0x18);
        }
      }
    }
  }
  return;
}


