// func FUN_04274bb4 @ 04274bb4 size 1008

/* WARNING: Removing unreachable block (ram,0x04274c30) */
/* WARNING: Removing unreachable block (ram,0x04274cb8) */
/* WARNING: Removing unreachable block (ram,0x04274dbc) */
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void FUN_04274bb4(undefined8 param_1,long param_2)

{
  ulong uVar1;
  undefined8 *****pppppuVar2;
  qword qVar3;
  undefined8 uVar4;
  undefined8 uVar5;
  code *pcVar6;
  long *plVar7;
  long *plVar8;
  undefined8 *puVar9;
  char *pcVar10;
  ulong uVar11;
  undefined1 uStack_c9;
  char *local_c8;
  undefined8 local_c0;
  ulong uStack_b8;
  undefined1 uStack_a9;
  undefined8 local_a8;
  undefined8 local_a0;
  undefined8 local_98;
  undefined8 ****local_90;
  ulong uStack_88;
  ulong local_80;
  undefined8 ****local_78;
  ulong local_70;
  ulong local_68;
  undefined8 ****local_60;
  ulong uStack_58;
  undefined8 local_50;
  ulong local_48;
  undefined1 uStack_31;
  
  plVar7 = *(long **)(param_2 + 0x1d0);
  if ((plVar7 == (long *)0x0) && (plVar7 = *(long **)(param_2 + 0x1c8), plVar7 == (long *)0x0)) {
    local_a8 = 0;
    local_a0 = 0;
    local_98 = 0;
  }
  else {
    (**(code **)(*plVar7 + 0x148))();
    local_a0 = 0;
    local_98 = 0;
    local_a8 = 0;
    if (plVar7 != (long *)0x0) {
      local_78 = (undefined8 *****)0x0;
      local_70 = 0;
      local_68 = 0;
      if ((*(byte *)(plVar7 + 9) & 1) == 0) {
        (**(code **)(*plVar7 + 0x168))(plVar7);
        FUN_0410347c(&local_78);
        uVar11 = local_68 >> 0x38;
      }
      else {
        uVar11 = 0;
      }
      uVar1 = local_70;
      if ((uVar11 & 0x80) == 0) {
        uVar1 = uVar11;
      }
      if (uVar1 != 0) {
        pppppuVar2 = (undefined8 *****)local_78;
        if ((uVar11 & 0x80) == 0) {
          pppppuVar2 = &local_78;
        }
        FUN_016a05c8(&local_a8,"profileId",9,pppppuVar2);
      }
      local_90 = (undefined8 ****)0x0;
      uStack_88 = 0;
      local_80 = 0;
      (**(code **)(*plVar7 + 0x30))(&local_60,plVar7);
      uStack_88 = uStack_58;
      local_90 = local_60;
      local_80 = local_50;
      if (-1 < (long)local_50) {
        uStack_58 = local_50 >> 0x38;
      }
      if (uStack_58 != 0) {
        pppppuVar2 = (undefined8 *****)local_60;
        if (-1 < (long)local_50) {
          pppppuVar2 = &local_90;
        }
        FUN_016a05c8(&local_a8,"profilePath",0xb,pppppuVar2);
      }
      plVar8 = plVar7;
      FUN_041035c0();
      if (((ulong)plVar8 >> 0x20 & 1) != 0) {
        local_60 = (undefined8 ****)CONCAT44(local_60._4_4_,(int)plVar8);
        local_48 = CONCAT71(local_48._1_7_,2);
        FUN_0053aec0(&local_a8,"profileIndex",0xc,&local_60);
        if (((char)local_48 != -1) && ((char)local_48 != '\x02')) {
          (*(code *)(&PTR_FUN_0e8c1878)[local_48 & 0xff])(&uStack_31,&local_60);
        }
      }
      uStack_58 = 0;
      local_60 = (undefined8 *****)0x0;
      local_48 = 0;
      local_50 = 0;
      if ((*(byte *)(plVar7 + 9) & 1) == 0) {
        (**(code **)(*plVar7 + 0x168))(plVar7);
        FUN_0410374c(&local_60);
        if ((char)local_48 != '\0') {
          pppppuVar2 = (undefined8 *****)local_60;
          if (-1 < (long)local_50._7_1_) {
            pppppuVar2 = &local_60;
          }
          uVar11 = uStack_58;
          if (-1 < (long)local_50) {
            uVar11 = (long)local_50._7_1_;
          }
          FUN_016a05c8(&local_a8,"boundUserId",0xb,pppppuVar2,uVar11);
        }
      }
      if ((((*(byte *)(plVar7 + 9) & 1) == 0) &&
          ((**(code **)(*plVar7 + 0x168))(), plVar7 != (long *)0x0)) &&
         (plVar8 = plVar7, FUN_004bcc4c(), plVar8 != (long *)0x0)) {
        FUN_002bea28(plVar7,"aside.account_id",0x10);
        if (-1 < (int)plVar7) {
          local_60 = (undefined8 ****)CONCAT44(local_60._4_4_,(int)plVar7);
          local_48 = CONCAT71(local_48._1_7_,2);
          FUN_0053aec0(&local_a8,"boundAccountId",0xe,&local_60);
          if (((char)local_48 != -1) && ((char)local_48 != '\x02')) {
            (*(code *)(&PTR_FUN_0e8c1878)[local_48 & 0xff])(&uStack_31,&local_60);
          }
        }
      }
      if ((long)local_80 < 0) {
        FUN_00008eb8(local_90,local_80 & 0x7fffffffffffffff);
      }
      if ((long)local_68 < 0) {
        FUN_00008eb8(local_78,local_68 & 0x7fffffffffffffff);
      }
    }
  }
  puVar9 = &local_a8;
  FUN_02922400(puVar9,"profileId",9);
  if (puVar9 == (undefined8 *)0x0) {
    pcVar10 = segment_command_00000020.segname + 8;
    FUN_0000f368();
    uVar5 = s_Aside_account_profile_context_un_0cf0a25e._16_8_;
    uVar4 = s_Aside_account_profile_context_un_0cf0a25e._0_8_;
    uStack_b8 = _UNK_0df3b538;
    local_c0 = _DAT_0df3b530;
    local_c8 = pcVar10;
    if ((pcVar10 + 0x29 < pcVar10) ||
       ("Aside account profile context unavailable" < pcVar10 + 0x29 &&
        pcVar10 <= "Aside account profile context unavailable")) {
                    /* WARNING: Does not return */
      pcVar6 = (code *)SoftwareBreakpoint(1,0x4274fa4);
      (*pcVar6)();
    }
    qVar3 = CONCAT71(s_Aside_account_profile_context_un_0cf0a25e._25_7_,
                     s_Aside_account_profile_context_un_0cf0a25e[0x18]);
    *(undefined8 *)(pcVar10 + 8) = s_Aside_account_profile_context_un_0cf0a25e._8_8_;
    *(undefined8 *)pcVar10 = uVar4;
    *(qword *)(pcVar10 + 0x18) = qVar3;
    *(undefined8 *)(pcVar10 + 0x10) = uVar5;
    uVar4 = CONCAT17(s_Aside_account_profile_context_un_0cf0a25e[0x20],
                     s_Aside_account_profile_context_un_0cf0a25e._25_7_);
    *(undefined8 *)(pcVar10 + 0x21) = s_Aside_account_profile_context_un_0cf0a25e._33_8_;
    *(undefined8 *)(pcVar10 + 0x19) = uVar4;
    pcVar10[0x29] = 0;
    FUN_06c77350(&uStack_a9,param_2,&local_c8);
    FUN_06c77554(param_1,param_2,&uStack_a9);
    if ((long)uStack_b8 < 0) {
      FUN_00008eb8(local_c8,uStack_b8 & 0x7fffffffffffffff);
    }
  }
  else {
    FUN_06ce6a8c(&uStack_c9,param_2,&local_a8);
    FUN_06c77554(param_1,param_2,&uStack_c9);
  }
  FUN_0095e480(&local_a8);
  return;
}


