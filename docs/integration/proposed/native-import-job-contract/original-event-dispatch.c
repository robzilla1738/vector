// func FUN_042798c4 @ 042798c4 size 400

/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void FUN_042798c4(long param_1)

{
  qword qVar1;
  undefined8 uVar2;
  code *pcVar3;
  long lVar4;
  char *pcVar5;
  long lVar6;
  undefined8 uVar7;
  char *local_60;
  undefined8 local_58;
  long lStack_50;
  char *local_48;
  undefined8 local_40;
  ulong uStack_38;
  
  lVar4 = param_1;
  FUN_00f29c18();
  FUN_00052d94();
  if (lVar4 != 0) {
    pcVar5 = segment_command_00000020.segname + 8;
    FUN_0000f368();
    uVar2 = s_asideBrowserImport_onImportProgr_0d6d4e33._16_8_;
    uVar7 = s_asideBrowserImport_onImportProgr_0d6d4e33._0_8_;
    uStack_38 = _UNK_0df3ab98;
    local_40 = _DAT_0df3ab90;
    local_48 = pcVar5;
    if ((pcVar5 + 0x23 < pcVar5) ||
       ("asideBrowserImport.onImportProgress" < pcVar5 + 0x23 &&
        pcVar5 < "sideBrowserImport.onImportProgress")) {
                    /* WARNING: Does not return */
      pcVar3 = (code *)SoftwareBreakpoint(1,0x4279a54);
      (*pcVar3)();
    }
    qVar1 = CONCAT17(s_asideBrowserImport_onImportProgr_0d6d4e33[0x1f],
                     s_asideBrowserImport_onImportProgr_0d6d4e33._24_7_);
    *(undefined8 *)(pcVar5 + 8) = s_asideBrowserImport_onImportProgr_0d6d4e33._8_8_;
    *(undefined8 *)pcVar5 = uVar7;
    *(qword *)(pcVar5 + 0x18) = qVar1;
    *(undefined8 *)(pcVar5 + 0x10) = uVar2;
    *(undefined4 *)(pcVar5 + 0x1f) = s_asideBrowserImport_onImportProgr_0d6d4e33._31_4_;
    pcVar5[0x23] = 0;
    lVar6 = lVar4 + 0x80;
    FUN_0297d344(lVar6,param_1 + 0x40,&local_48);
    if ((long)uStack_38 < 0) {
      FUN_00008eb8(local_48,uStack_38 & 0x7fffffffffffffff);
    }
    if ((int)lVar6 != 0) {
      local_60 = (char *)0x0;
      local_58 = 0;
      lStack_50 = 0;
      FUN_04277dc8(&local_48,param_1);
      FUN_00a1e1a4(&local_60,&local_48);
      FUN_0095e480(&local_48);
      uVar7 = 0x110;
      FUN_0000f368(0x110);
      uStack_38 = lStack_50;
      local_40 = local_58;
      local_48 = local_60;
      local_60 = (char *)0x0;
      local_58 = 0;
      lStack_50 = 0;
      FUN_016a0924();
      if (local_48 != (char *)0x0) {
        FUN_00b26ef0(&local_48);
        FUN_00008eb8(local_48,uStack_38 << 5);
      }
      FUN_0261cae8(lVar4,param_1 + 0x40,uVar7);
      if (local_60 != (char *)0x0) {
        FUN_00b26ef0(&local_60);
        FUN_00008eb8(local_60,lStack_50 << 5);
      }
    }
  }
  return;
}


