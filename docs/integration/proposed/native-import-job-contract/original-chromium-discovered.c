// func FUN_0427b898 @ 0427b898 size 2100

/* WARNING: Removing unreachable block (ram,0x0427be88) */
/* WARNING: Removing unreachable block (ram,0x0427bc5c) */
/* WARNING: Removing unreachable block (ram,0x0427c014) */
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void FUN_0427b898(ulong param_1,long *param_2)

{
  long *plVar1;
  size_t sVar2;
  size_t sVar3;
  undefined8 *puVar4;
  undefined8 *puVar5;
  undefined8 *****pppppuVar6;
  long *plVar7;
  int *piVar8;
  byte bVar9;
  byte bVar10;
  undefined8 uVar11;
  undefined8 ****ppppuVar12;
  code *pcVar13;
  int iVar14;
  uint uVar15;
  qword *pqVar17;
  char *pcVar18;
  ulong uVar19;
  undefined4 *puVar20;
  undefined8 uVar21;
  long lVar22;
  long lVar23;
  undefined8 uVar24;
  undefined4 local_1f8;
  undefined2 uStack_1f4;
  undefined1 uStack_1f2;
  undefined1 uStack_1f1;
  undefined8 uStack_1f0;
  undefined7 local_1e8;
  undefined1 uStack_1e1;
  undefined8 ****local_1e0;
  char acStack_1d8 [13];
  undefined2 uStack_1cb;
  char cStack_1c9;
  qword *pqStack_1c8;
  ulong local_1c0;
  undefined8 uStack_1b8;
  undefined8 local_1a8 [2];
  undefined7 local_198;
  char cStack_191;
  undefined8 ****local_190;
  long lStack_188;
  undefined8 local_180;
  undefined8 local_170;
  undefined8 uStack_168;
  undefined8 local_160;
  undefined8 uStack_158;
  undefined8 uStack_150;
  undefined8 uStack_148;
  undefined8 local_140;
  undefined8 uStack_138;
  undefined8 uStack_130;
  undefined8 uStack_128;
  ulong local_120;
  undefined4 local_110;
  undefined2 uStack_10c;
  undefined1 uStack_10a;
  undefined1 uStack_109;
  undefined8 uStack_108;
  undefined7 local_100;
  undefined1 uStack_f9;
  undefined8 ****local_f8;
  long lStack_f0;
  undefined8 local_e8;
  undefined8 ****local_e0;
  long lStack_d8;
  undefined8 ****local_d0;
  long lStack_c8;
  char *local_c0;
  undefined8 uStack_b8;
  undefined8 ****local_b0;
  long lStack_a8;
  char *local_a0;
  undefined8 uStack_98;
  undefined8 ****local_90;
  long lStack_88;
  char *local_80;
  undefined8 uStack_78;
  undefined1 auStack_70 [8];
  long local_68;
  ulong uVar16;
  
  local_68 = *(long *)PTR____stack_chk_guard_0e0281f0;
  if (*(long *)(param_1 + 0xd0) == 0) {
    uStack_f9 = 6;
    if ("failed" < (char *)((ulong)&local_110 | 6) && &local_110 < "ailed") goto LAB_0427c0c0;
    uStack_10c = 0x6465;
    local_110 = 0x6c696166;
    uStack_10a = 0;
    pcVar18 = segment_command_00000020.segname + 8;
    FUN_0000f368();
    if ((pcVar18 + 0x21 < pcVar18) ||
       ("Import requires an extension page" < pcVar18 + 0x21 &&
        pcVar18 < "mport requires an extension page")) goto LAB_0427c0c0;
    *(undefined2 *)(pcVar18 + 0x20) = 0x65;
    uVar11 = s_Import_requires_an_extension_pag_0cf0a3bd._24_8_;
    uVar21 = s_Import_requires_an_extension_pag_0cf0a3bd._16_8_;
    uVar24 = s_Import_requires_an_extension_pag_0cf0a3bd._0_8_;
    *(undefined8 *)(pcVar18 + 8) = s_Import_requires_an_extension_pag_0cf0a3bd._8_8_;
    *(undefined8 *)pcVar18 = uVar24;
    *(undefined8 *)(pcVar18 + 0x18) = uVar11;
    *(undefined8 *)(pcVar18 + 0x10) = uVar21;
    plVar1 = (long *)(param_1 + 0x58);
    if (*(char *)(param_1 + 0x6f) < '\0') {
      FUN_00008eb8(*(undefined8 *)(param_1 + 0x58),*(ulong *)(param_1 + 0x68) & 0x7fffffffffffffff);
    }
    *(undefined8 *)(param_1 + 0x60) = uStack_108;
    *plVar1 = CONCAT17(uStack_109,CONCAT16(uStack_10a,CONCAT24(uStack_10c,local_110)));
    *(ulong *)(param_1 + 0x68) = CONCAT17(uStack_f9,local_100);
    if (*(char *)(param_1 + 0xa7) < '\0') {
      FUN_00008eb8(*(undefined8 *)(param_1 + 0x90),*(ulong *)(param_1 + 0xa0) & 0x7fffffffffffffff);
    }
    *(char **)(param_1 + 0x90) = pcVar18;
    uVar24 = _DAT_0df3abc0;
    *(undefined8 *)(param_1 + 0xa0) = _UNK_0df3abc8;
    *(undefined8 *)(param_1 + 0x98) = uVar24;
    if (*(char *)(param_1 + 0x8f) < '\0') {
      **(undefined1 **)(param_1 + 0x78) = 0;
      *(undefined8 *)(param_1 + 0x80) = 0;
    }
    else {
      *(undefined1 *)(param_1 + 0x78) = 0;
      *(undefined1 *)(param_1 + 0x8f) = 0;
    }
    bVar9 = *(byte *)(param_1 + 0x6f);
    uVar16 = *(ulong *)(param_1 + 0x60);
    if (-1 < (char)bVar9) {
      uVar16 = (ulong)bVar9;
    }
    if (uVar16 == 9) {
      plVar7 = (long *)*plVar1;
      if (-1 < (char)bVar9) {
        plVar7 = plVar1;
      }
      if (*(char *)(plVar7 + 1) != 'd' || *plVar7 != 0x6564656563637573) goto LAB_0427bbc0;
      uVar24 = 0x3ff0000000000000;
    }
    else {
LAB_0427bbc0:
      uVar24 = *(undefined8 *)(param_1 + 0x70);
    }
    *(undefined8 *)(param_1 + 0x70) = uVar24;
    FUN_042798c4(param_1);
    goto LAB_0427bbd0;
  }
  local_120 = 0;
  uStack_138 = 0;
  local_140 = 0;
  uStack_128 = 0;
  uStack_130 = 0;
  uStack_158 = 0;
  local_160 = 0;
  uStack_148 = 0;
  uStack_150 = 0;
  uStack_168 = 0;
  local_170 = 0;
  lVar22 = *param_2;
  lVar23 = param_2[1] * 0x50;
  uVar16 = param_1;
  if (lVar23 == 0) {
    bVar9 = *(byte *)(param_1 + 200);
LAB_0427b98c:
    if ((param_2[1] == 0) || ((bVar9 & 1) != 0)) goto LAB_0427bcb0;
LAB_0427b994:
    FUN_0424dec8(&local_170,lVar22);
    local_120 = CONCAT71(local_120._1_7_,1);
    if (*(char *)(param_1 + 0x6f) < '\0') {
      *(undefined8 *)(param_1 + 0x60) = 7;
      puVar20 = *(undefined4 **)(param_1 + 0x58);
    }
    else {
      puVar20 = (undefined4 *)(param_1 + 0x58);
      *(undefined1 *)(param_1 + 0x6f) = 7;
    }
    *(undefined4 *)((long)puVar20 + 3) = 0x676e696e;
    *puVar20 = 0x6e6e7572;
    *(undefined1 *)((long)puVar20 + 7) = 0;
    *(undefined8 *)(param_1 + 0x70) = 0x3fb999999999999a;
    FUN_042798c4(param_1);
    lVar22 = 0x90;
    FUN_0000f368();
    FUN_04252ec0();
    lVar23 = *(long *)(param_1 + 0xe0);
    *(long *)(param_1 + 0xe0) = lVar22;
    if (lVar23 != 0) {
      FUN_04252f84(lVar23);
      FUN_00008eb8();
      lVar22 = *(long *)(param_1 + 0xe0);
    }
    *(undefined1 *)(lVar22 + 0x13) = 0;
    if ((local_120 & 1) == 0) goto LAB_0427c0c0;
    uVar24 = *(undefined8 *)(param_1 + 0xe0);
    piVar8 = *(int **)(param_1 + 0xe8);
    if ((piVar8 != (int *)0x0) && (iVar14 = *piVar8, *piVar8 = iVar14 + 1, iVar14 == 0x7fffffff)) {
                    /* WARNING: Does not return */
      pcVar13 = (code *)SoftwareBreakpoint(0,0x427c0cc);
      (*pcVar13)();
    }
    uVar21 = *(undefined8 *)(param_1 + 0xf0);
    pqVar17 = &segment_command_00000020.vmsize;
    FUN_0000f368();
    *(undefined4 *)pqVar17 = 1;
    pqVar17[1] = (qword)&LAB_03f6f060;
    pqVar17[2] = (qword)FUN_03f9e440;
    pqVar17[3] = (qword)&LAB_0406a280;
    pqVar17[4] = (qword)FUN_0427c570;
    pqVar17[5] = 0;
    pqVar17[6] = (qword)piVar8;
    pqVar17[7] = uVar21;
    FUN_042530c0(uVar24,&local_170,1,pqVar17);
  }
  else {
    bVar9 = 0;
    if (*(char *)(param_1 + 200) == '\0') goto LAB_0427b98c;
    bVar9 = *(byte *)(param_1 + 199);
    sVar2 = *(size_t *)(param_1 + 0xb8);
    if (-1 < (char)bVar9) {
      sVar2 = (ulong)bVar9;
    }
    do {
      bVar10 = *(byte *)(lVar22 + 0x1f);
      sVar3 = *(size_t *)(lVar22 + 0x10);
      if (-1 < (char)bVar10) {
        sVar3 = (ulong)bVar10;
      }
      if (sVar3 == sVar2) {
        puVar4 = *(void **)(lVar22 + 8);
        if (-1 < (char)bVar10) {
          puVar4 = (undefined8 *)(lVar22 + 8);
        }
        puVar5 = *(void **)(param_1 + 0xb0);
        if (-1 < (char)bVar9) {
          puVar5 = (undefined8 *)(param_1 + 0xb0);
        }
        uVar15 = _memcmp(puVar4,puVar5,sVar2);
        uVar16 = (ulong)uVar15;
        if (uVar15 == 0) goto LAB_0427b994;
      }
      lVar22 = lVar22 + 0x50;
      lVar23 = lVar23 + -0x50;
    } while (lVar23 != 0);
LAB_0427bcb0:
    iVar14 = (int)uVar16;
    FUN_01e71650();
    FUN_02de23d0(local_1a8);
    FUN_0147166c(&local_f8,local_1a8);
    FUN_022d8b50(&local_1e0,&local_f8);
    if (cStack_1c9 < '\0') {
      FUN_00018218(&local_e0,local_1e0,CONCAT35(acStack_1d8._5_3_,acStack_1d8._0_5_));
      lStack_188 = lStack_d8;
      local_190 = local_e0;
      local_180 = (undefined8 *****)local_d0;
      local_d0 = (undefined8 ****)((ulong)local_d0 & 0xffffffffffffff);
      local_e0 = (undefined8 ****)((ulong)local_e0 & 0xffffffffffffff00);
      if (cStack_1c9 < '\0') {
        FUN_00008eb8(local_1e0,
                     CONCAT17(cStack_1c9,CONCAT25(uStack_1cb,acStack_1d8._8_5_)) &
                     0x7fffffffffffffff);
      }
    }
    else {
      local_180 = (undefined8 *****)CONCAT17(cStack_1c9,CONCAT25(uStack_1cb,acStack_1d8._8_5_));
      lStack_188 = CONCAT35(acStack_1d8._5_3_,acStack_1d8._0_5_);
      local_190 = local_1e0;
      local_d0 = (undefined8 ****)(ulong)CONCAT25(uStack_1cb,acStack_1d8._8_5_);
      local_e0 = (undefined8 ****)((ulong)local_1e0 & 0xffffffffffffff00);
      lStack_d8 = lStack_188;
    }
    if (cStack_191 < '\0') {
      FUN_00008eb8(local_1a8[0],CONCAT17(cStack_191,local_198) & 0x7fffffffffffffff);
    }
    pqStack_1c8 = (qword *)0x0;
    acStack_1d8[8] = '\0';
    acStack_1d8[9] = '\0';
    acStack_1d8[10] = '\0';
    acStack_1d8[0xb] = '\0';
    acStack_1d8[0xc] = '\0';
    uStack_1cb = 0;
    cStack_1c9 = '\0';
    uStack_1b8 = 0;
    local_1c0 = 0;
    acStack_1d8[0] = '\0';
    acStack_1d8[1] = '\0';
    acStack_1d8[2] = '\0';
    acStack_1d8[3] = '\0';
    acStack_1d8[4] = '\0';
    acStack_1d8[5] = '\0';
    acStack_1d8[6] = '\0';
    acStack_1d8[7] = '\0';
    local_1e0 = (undefined8 *****)0x0;
    lVar22 = (long)*(char *)(param_1 + 0x37);
    if (lVar22 < 0) {
      uVar16 = *(ulong *)(param_1 + 0x20);
      lVar22 = *(long *)(param_1 + 0x28);
    }
    else {
      uVar16 = param_1 + 0x20;
    }
    pppppuVar6 = (undefined8 *****)local_190;
    if (-1 < (long)local_180._7_1_) {
      pppppuVar6 = &local_190;
    }
    lVar23 = lStack_188;
    if (-1 < (long)local_180) {
      lVar23 = (long)local_180._7_1_;
    }
    if ((((iVar14 < 270000) || (param_2[1] != 0)) || ((*(byte *)(param_2 + 3) & 1) == 0)) ||
       (uVar19 = uVar16, FUN_0427541c(uVar16,lVar22), uVar19 >> 0x20 == 0)) {
      cStack_1c9 = '\x15';
      if ("Invalid import source" < &uStack_1cb && &local_1e0 < (undefined8 *****)0xcf0a2fc)
      goto LAB_0427c0c0;
      acStack_1d8[0] = s_Invalid_import_source_0cf0a2fb[8];
      acStack_1d8[1] = s_Invalid_import_source_0cf0a2fb[9];
      acStack_1d8[2] = s_Invalid_import_source_0cf0a2fb[10];
      acStack_1d8[3] = s_Invalid_import_source_0cf0a2fb[0xb];
      acStack_1d8[4] = s_Invalid_import_source_0cf0a2fb[0xc];
      local_1e0 = (undefined8 ****)s_Invalid_import_source_0cf0a2fb._0_8_;
      acStack_1d8[5] = s_Invalid_import_source_0cf0a2fb[0xd];
      acStack_1d8[6] = s_Invalid_import_source_0cf0a2fb[0xe];
      acStack_1d8[7] = s_Invalid_import_source_0cf0a2fb[0xf];
      acStack_1d8[8] = s_Invalid_import_source_0cf0a2fb[0x10];
      acStack_1d8[9] = s_Invalid_import_source_0cf0a2fb[0x11];
      acStack_1d8[10] = s_Invalid_import_source_0cf0a2fb[0x12];
      acStack_1d8[0xb] = s_Invalid_import_source_0cf0a2fb[0x13];
      acStack_1d8[0xc] = s_Invalid_import_source_0cf0a2fb[0x14];
      local_1c0 = 0;
      uStack_1b8 = 0;
      pqStack_1c8 = (qword *)0x0;
    }
    else {
      local_f8 = (undefined8 *****)0x0;
      lStack_f0 = 0;
      local_e8 = 0;
      FUN_042755a0(&local_f8,uVar16,lVar22);
      local_e0 = (undefined8 ****)0xdb232ac;
      lStack_d8 = 0x34;
      local_d0 = local_f8;
      if (-1 < (long)local_e8._7_1_) {
        local_d0 = &local_f8;
      }
      lStack_c8 = lStack_f0;
      if (-1 < local_e8) {
        lStack_c8 = (long)local_e8._7_1_;
      }
      local_c0 = ". Open System Settings > Privacy & Security > Files & Folders > ";
      uStack_b8 = 0x40;
      local_b0 = (undefined8 ****)"Aside";
      if (lVar23 != 0) {
        local_b0 = pppppuVar6;
      }
      lStack_a8 = 5;
      if (lVar23 != 0) {
        lStack_a8 = lVar23;
      }
      local_a0 = ", then allow access to ";
      uStack_98 = 0x17;
      local_80 = " and try again.";
      uStack_78 = 0xf;
      local_90 = local_d0;
      lStack_88 = lStack_c8;
      FUN_0066ab54(&local_1e0,&local_e0,7);
      pqVar17 = &segment_command_00000020.filesize;
      FUN_0000f368();
      uStack_1b8 = _UNK_0df404e8;
      local_1c0 = _DAT_0df404e0;
      pqStack_1c8 = pqVar17;
      if (((char *)((long)pqVar17 + 0x4fU) < pqVar17) ||
         ("x-apple.systempreferences:com.apple.preference.security?Privacy_FilesAndFolders" <
          (char *)((long)pqVar17 + 0x4fU) &&
          pqVar17 < "-apple.systempreferences:com.apple.preference.security?Privacy_FilesAndFolders"
         )) goto LAB_0427c0c0;
      uVar24 = CONCAT71(s_x_apple_systempreferences_com_ap_0db2334a._64_7_,
                        s_x_apple_systempreferences_com_ap_0db2334a[0x3f]);
      *(undefined8 *)((long)pqVar17 + 0x47) = s_x_apple_systempreferences_com_ap_0db2334a._71_8_;
      *(undefined8 *)((long)pqVar17 + 0x3f) = uVar24;
      uVar11 = s_x_apple_systempreferences_com_ap_0db2334a._24_8_;
      uVar21 = s_x_apple_systempreferences_com_ap_0db2334a._16_8_;
      uVar24 = s_x_apple_systempreferences_com_ap_0db2334a._0_8_;
      pqVar17[1] = s_x_apple_systempreferences_com_ap_0db2334a._8_8_;
      *pqVar17 = uVar24;
      pqVar17[3] = uVar11;
      pqVar17[2] = uVar21;
      uVar11 = s_x_apple_systempreferences_com_ap_0db2334a._48_8_;
      uVar21 = s_x_apple_systempreferences_com_ap_0db2334a._32_8_;
      uVar24 = CONCAT17(s_x_apple_systempreferences_com_ap_0db2334a[0x3f],
                        s_x_apple_systempreferences_com_ap_0db2334a._56_7_);
      pqVar17[5] = s_x_apple_systempreferences_com_ap_0db2334a._40_8_;
      pqVar17[4] = uVar21;
      pqVar17[7] = uVar24;
      pqVar17[6] = uVar11;
      *(undefined1 *)((long)pqVar17 + 0x4f) = 0;
    }
    ppppuVar12 = local_1e0;
    uStack_1e1 = 6;
    if ("failed" < (char *)((ulong)&local_1f8 | 6) && &local_1f8 < "ailed") {
LAB_0427c0c0:
                    /* WARNING: Does not return */
      pcVar13 = (code *)SoftwareBreakpoint(1,0x427c0c4);
      (*pcVar13)();
    }
    uStack_1f4 = 0x6465;
    local_1f8 = 0x6c696166;
    uStack_1f2 = 0;
    uVar21 = CONCAT17(cStack_1c9,CONCAT25(uStack_1cb,acStack_1d8._8_5_));
    uVar24 = CONCAT35(acStack_1d8._5_3_,acStack_1d8._0_5_);
    local_1e0 = (undefined8 *****)0x0;
    acStack_1d8[0] = '\0';
    acStack_1d8[1] = '\0';
    acStack_1d8[2] = '\0';
    acStack_1d8[3] = '\0';
    acStack_1d8[4] = '\0';
    acStack_1d8[5] = '\0';
    acStack_1d8[6] = '\0';
    acStack_1d8[7] = '\0';
    acStack_1d8[8] = '\0';
    acStack_1d8[9] = '\0';
    acStack_1d8[10] = '\0';
    acStack_1d8[0xb] = '\0';
    acStack_1d8[0xc] = '\0';
    uStack_1cb = 0;
    cStack_1c9 = '\0';
    plVar1 = (long *)(param_1 + 0x58);
    if (*(char *)(param_1 + 0x6f) < '\0') {
      FUN_00008eb8(*(undefined8 *)(param_1 + 0x58),*(ulong *)(param_1 + 0x68) & 0x7fffffffffffffff);
    }
    *(undefined8 *)(param_1 + 0x60) = uStack_1f0;
    *plVar1 = CONCAT17(uStack_1f1,CONCAT16(uStack_1f2,CONCAT24(uStack_1f4,local_1f8)));
    *(ulong *)(param_1 + 0x68) = CONCAT17(uStack_1e1,local_1e8);
    if (*(char *)(param_1 + 0xa7) < '\0') {
      FUN_00008eb8(*(undefined8 *)(param_1 + 0x90),*(ulong *)(param_1 + 0xa0) & 0x7fffffffffffffff);
    }
    *(undefined8 *****)(param_1 + 0x90) = ppppuVar12;
    *(undefined8 *)(param_1 + 0xa0) = uVar21;
    *(undefined8 *)(param_1 + 0x98) = uVar24;
    if (*(char *)(param_1 + 0x8f) < '\0') {
      **(undefined1 **)(param_1 + 0x78) = 0;
      *(undefined8 *)(param_1 + 0x80) = 0;
    }
    else {
      *(undefined1 *)(param_1 + 0x78) = 0;
      *(undefined1 *)(param_1 + 0x8f) = 0;
    }
    bVar9 = *(byte *)(param_1 + 0x6f);
    uVar16 = *(ulong *)(param_1 + 0x60);
    if (-1 < (char)bVar9) {
      uVar16 = (ulong)bVar9;
    }
    if (uVar16 == 9) {
      plVar7 = (long *)*plVar1;
      if (-1 < (char)bVar9) {
        plVar7 = plVar1;
      }
      if (*(char *)(plVar7 + 1) != 'd' || *plVar7 != 0x6564656563637573) goto LAB_0427bfac;
      uVar24 = 0x3ff0000000000000;
    }
    else {
LAB_0427bfac:
      uVar24 = *(undefined8 *)(param_1 + 0x70);
    }
    *(undefined8 *)(param_1 + 0x70) = uVar24;
    FUN_042798c4(param_1);
    uVar15 = (uint)(char)uStack_1b8._7_1_;
    uVar16 = local_1c0;
    if (-1 < (int)uVar15) {
      uVar16 = (ulong)uStack_1b8._7_1_;
    }
    if (uVar16 != 0) {
      pqVar17 = pqStack_1c8;
      if (-1 < (int)uVar15) {
        pqVar17 = (qword *)&pqStack_1c8;
      }
      FUN_003701d4(&local_e0,pqVar17);
      FUN_07278724();
      FUN_00027cb8(auStack_70,0);
      FUN_00027c78(&local_c0);
      uVar15 = (uint)uStack_1b8._7_1_;
    }
    if ((uVar15 >> 7 & 1) != 0) {
      FUN_00008eb8(pqStack_1c8,uStack_1b8 & 0x7fffffffffffffff);
    }
    if (cStack_1c9 < '\0') {
      FUN_00008eb8(local_1e0,
                   CONCAT17(cStack_1c9,CONCAT25(uStack_1cb,acStack_1d8._8_5_)) & 0x7fffffffffffffff)
      ;
    }
    if ((long)local_180 < 0) {
      FUN_00008eb8(local_190,(ulong)local_180 & 0x7fffffffffffffff);
    }
  }
  if ((local_120 & 1) != 0) {
    FUN_0424e054(&local_170);
  }
LAB_0427bbd0:
  if (*(long *)PTR____stack_chk_guard_0e0281f0 != local_68) {
                    /* WARNING: Subroutine does not return */
    ___stack_chk_fail();
  }
  return;
}


