// func FUN_042534e8 @ 042534e8 size 1588

void FUN_042534e8(long *param_1,long param_2,undefined8 *param_3)

{
  long *plVar1;
  long *plVar2;
  ulong uVar3;
  undefined1 uVar4;
  byte bVar5;
  char cVar6;
  code *pcVar7;
  int iVar8;
  char *pcVar9;
  long *plVar10;
  dword *pdVar11;
  qword *pqVar12;
  int *piVar13;
  int *piVar14;
  long lVar15;
  long lVar16;
  long lVar17;
  undefined8 uVar18;
  undefined1 auStack_220 [32];
  long local_200;
  long lStack_1f8;
  long local_1f0;
  long local_1e8;
  long lStack_1e0;
  long local_1d8;
  undefined8 local_1d0;
  undefined8 uStack_1c8;
  undefined8 local_1c0;
  undefined8 local_1b8;
  undefined8 uStack_1b0;
  undefined8 local_1a8;
  undefined8 local_1a0;
  long lStack_198;
  undefined8 uStack_190;
  undefined8 uStack_188;
  undefined8 local_180;
  undefined1 auStack_178 [56];
  undefined2 local_140;
  undefined1 local_13e;
  long local_130;
  long lStack_128;
  long local_120;
  long local_118;
  long lStack_110;
  long lStack_108;
  undefined8 local_100;
  undefined8 uStack_f8;
  undefined8 local_f0;
  undefined8 uStack_e8;
  undefined8 local_e0;
  undefined8 local_d8;
  undefined8 local_d0;
  long lStack_c8;
  undefined8 local_c0;
  undefined8 uStack_b8;
  undefined8 local_b0;
  undefined8 uStack_a8;
  undefined8 uStack_a0;
  undefined8 uStack_98;
  undefined8 local_90;
  undefined8 uStack_88;
  undefined8 uStack_80;
  undefined8 uStack_78;
  undefined8 local_70;
  
  if (*(int *)((long)param_1 + 0x1c) == 1) {
    if (((*param_1 != 0) && (*(char *)(*param_1 + 4) == '\0')) && (param_1[1] != 0)) {
      if ((*param_1 == 0) || (*(char *)(*param_1 + 4) != '\0')) {
                    /* WARNING: Does not return */
        pcVar7 = (code *)SoftwareBreakpoint(0,0x4253b10);
        (*pcVar7)();
      }
      lVar17 = *(long *)(param_1[1] + 0x270);
      if (lVar17 != 0) {
        lVar16 = param_1[0xe];
        FUN_00050c80(&local_130,"StartPreparation",
                     "../../chrome/browser/ui/webui/aside_importer/chromium_profile_migrator.cc",
                     0x85f);
        pcVar9 = section_00000068.sectname + 8;
        FUN_0000f368();
        pcVar9[0] = '\x01';
        pcVar9[1] = '\0';
        pcVar9[2] = '\0';
        pcVar9[3] = '\0';
        *(undefined1 **)(pcVar9 + 8) = &LAB_04259898;
        *(code **)(pcVar9 + 0x10) = FUN_04259920;
        *(code **)(pcVar9 + 0x18) = FUN_0255db00;
        *(code **)(pcVar9 + 0x20) = FUN_04253e58;
        *(dword *)(pcVar9 + 0x28) = *(dword *)(param_1 + 3);
        if (*(char *)(param_2 + 0x1f) < '\0') {
          FUN_00018218(pcVar9 + 0x30,*(undefined8 *)(param_2 + 8),*(undefined8 *)(param_2 + 0x10));
        }
        else {
          uVar18 = *(undefined8 *)(param_2 + 8);
          *(undefined8 *)(pcVar9 + 0x38) = *(undefined8 *)(param_2 + 0x10);
          *(undefined8 *)(pcVar9 + 0x30) = uVar18;
          *(undefined8 *)(pcVar9 + 0x40) = *(undefined8 *)(param_2 + 0x18);
        }
        uVar4 = *(undefined1 *)((long)param_1 + 0x14);
        pcVar9[0x50] = 0;
        pcVar9[0x48] = uVar4;
        pcVar9[0x68] = 0;
        if (*(char *)(param_3 + 3) != '\0') {
          uVar18 = *param_3;
          *(undefined8 *)(pcVar9 + 0x58) = param_3[1];
          *(undefined8 *)(pcVar9 + 0x50) = uVar18;
          *(undefined8 *)(pcVar9 + 0x60) = param_3[2];
          param_3[1] = 0;
          param_3[2] = 0;
          *param_3 = 0;
          pcVar9[0x68] = 1;
        }
        piVar14 = (int *)param_1[0x10];
        if ((piVar14 != (int *)0x0) && (iVar8 = *piVar14, *piVar14 = iVar8 + 1, iVar8 == 0x7fffffff)
           ) {
                    /* WARNING: Does not return */
          pcVar7 = (code *)SoftwareBreakpoint(0,0x4253b1c);
          (*pcVar7)();
        }
        lVar15 = param_1[0x11];
        piVar13 = *(int **)(lVar17 + 0xc0);
        if ((piVar13 != (int *)0x0) && (iVar8 = *piVar13, *piVar13 = iVar8 + 1, iVar8 == 0x7fffffff)
           ) {
                    /* WARNING: Does not return */
          pcVar7 = (code *)SoftwareBreakpoint(0,0x4253b28);
          (*pcVar7)();
        }
        uVar18 = *(undefined8 *)(lVar17 + 200);
        pqVar12 = &segment_command_00000020.filesize;
        FUN_0000f368();
        *(undefined4 *)pqVar12 = 1;
        pqVar12[1] = (qword)&LAB_0425d170;
        pqVar12[2] = (qword)FUN_0403b5e0;
        pqVar12[3] = (qword)&LAB_040ae6c0;
        pqVar12[4] = (qword)FUN_04255660;
        pqVar12[5] = 0;
        pqVar12[6] = (qword)piVar14;
        pqVar12[7] = lVar15;
        pqVar12[8] = (qword)piVar13;
        pqVar12[9] = uVar18;
        FUN_04253d68(lVar16,&local_130,pcVar9,pqVar12);
        return;
      }
    }
  }
  else {
    lVar17 = DAT_0eee6cf8;
    FUN_01a1fb78();
    if (lVar17 != 0) {
      lVar16 = lVar17;
      FUN_01a1fc10();
      FUN_07ac7730(&local_130,lVar17);
      plVar1 = param_1 + 4;
      if (*(char *)((long)param_1 + 0x37) < '\0') {
        FUN_00008eb8(param_1[4],param_1[6] & 0x7fffffffffffffff);
      }
      param_1[5] = lStack_128;
      *plVar1 = local_130;
      param_1[6] = local_120;
      lStack_128 = 0;
      local_120 = 0;
      local_130 = 0;
      FUN_0425fe90(&local_130,(int)param_1[3]);
      FUN_00c163e8(&local_130,&DAT_0df7a4c0,3);
      cVar6 = *(char *)(param_2 + 0x37);
      plVar2 = (long *)*(long *)(param_2 + 0x20);
      if (-1 < (long)cVar6) {
        plVar2 = (long *)(param_2 + 0x20);
      }
      lVar17 = *(long *)(param_2 + 0x28);
      if (-1 < cVar6) {
        lVar17 = (long)cVar6;
      }
      plVar10 = &local_130;
      FUN_00c163e8(plVar10,plVar2,lVar17);
      plVar2 = param_1 + 7;
      if (*(char *)((long)param_1 + 0x4f) < '\0') {
        plVar10 = (long *)param_1[7];
        FUN_00008eb8(plVar10,param_1[9] << 1);
      }
      param_1[8] = lStack_128;
      *plVar2 = local_130;
      param_1[9] = local_120;
      local_70 = 0;
      uStack_88 = 0;
      local_90 = 0;
      uStack_78 = 0;
      uStack_80 = 0;
      uStack_a8 = 0;
      local_b0 = 0;
      uStack_98 = 0;
      uStack_a0 = 0;
      lStack_c8 = 0;
      local_d0 = 0;
      uStack_b8 = 0;
      local_c0 = 0;
      uStack_e8 = 0;
      local_f0 = 0;
      local_d8 = 0;
      local_e0 = 0;
      lStack_108 = 0;
      lStack_110 = 0;
      uStack_f8 = 0;
      local_100 = 0;
      lStack_128 = 0;
      local_130 = 0;
      local_118 = 0;
      local_120 = 0;
      FUN_02dda444();
      FUN_02dda30c(&uStack_a8,plVar10);
      local_70 = local_70 & 0xffffffffff000000;
      if (&local_130 != plVar1) {
        bVar5 = *(byte *)((long)param_1 + 0x37);
        if (local_120 < 0) {
          uVar3 = param_1[5];
          plVar10 = (long *)param_1[4];
          if (-1 < (char)bVar5) {
            uVar3 = (ulong)bVar5;
            plVar10 = plVar1;
          }
          FUN_004a8c00(&local_130,plVar10,uVar3);
        }
        else if ((char)bVar5 < '\0') {
          FUN_004a8ab4(&local_130,param_1[4],param_1[5]);
        }
        else {
          lStack_128 = param_1[5];
          local_130 = *plVar1;
          local_120 = param_1[6];
        }
      }
      if (&local_118 != plVar2) {
        bVar5 = *(byte *)((long)param_1 + 0x4f);
        if (lStack_108 < 0) {
          uVar3 = param_1[8];
          plVar10 = (long *)param_1[7];
          if (-1 < (char)bVar5) {
            uVar3 = (ulong)bVar5;
            plVar10 = plVar2;
          }
          FUN_008ce834(&local_118,plVar10,uVar3);
        }
        else if ((char)bVar5 < '\0') {
          FUN_008ce6ec(&local_118,param_1[7],param_1[8]);
        }
        else {
          lStack_110 = param_1[8];
          local_118 = *plVar2;
          lStack_108 = param_1[9];
        }
      }
      lVar17 = lVar16;
      FUN_07acdf30();
      local_1f0 = local_120;
      local_1d8 = lStack_108;
      lStack_1f8 = lStack_128;
      local_200 = local_130;
      local_130 = 0;
      lStack_128 = 0;
      lStack_1e0 = lStack_110;
      local_1e8 = local_118;
      local_118 = 0;
      lStack_110 = 0;
      lStack_108 = 0;
      local_1c0 = local_f0;
      uStack_1c8 = uStack_f8;
      local_1d0 = local_100;
      local_120 = 0;
      local_100 = 0;
      uStack_f8 = 0;
      local_1a8 = local_d8;
      uStack_1b0 = local_e0;
      local_1b8 = uStack_e8;
      local_e0 = 0;
      local_d8 = 0;
      local_f0 = 0;
      uStack_e8 = 0;
      local_180 = local_b0;
      local_1a0 = local_d0;
      uStack_188 = uStack_b8;
      uStack_190 = local_c0;
      local_c0 = 0;
      uStack_b8 = 0;
      local_b0 = 0;
      lStack_198 = lVar17;
      lStack_c8 = lVar17;
      FUN_02dda30c(auStack_178,&uStack_a8);
      local_140 = (undefined2)local_70;
      local_13e = local_70._2_1_;
      FUN_028fe170(lVar16,&local_200);
      FUN_0294f504(&local_200);
      lVar17 = param_1[0xe];
      FUN_00050c80(auStack_220,"StartPreparation",
                   "../../chrome/browser/ui/webui/aside_importer/chromium_profile_migrator.cc",0x87b
                  );
      pdVar11 = &section_00000068.offset;
      FUN_0000f368();
      *pdVar11 = 1;
      *(undefined1 **)(pdVar11 + 2) = &LAB_0425d310;
      *(code **)(pdVar11 + 4) = FUN_0425d3a0;
      *(code **)(pdVar11 + 6) = FUN_0255db00;
      *(code **)(pdVar11 + 8) = FUN_04255868;
      pdVar11[10] = (int)param_1[3];
      if (*(char *)(param_2 + 0x1f) < '\0') {
        FUN_00018218(pdVar11 + 0xc,*(undefined8 *)(param_2 + 8),*(undefined8 *)(param_2 + 0x10));
      }
      else {
        uVar18 = *(undefined8 *)(param_2 + 8);
        *(undefined8 *)(pdVar11 + 0xe) = *(undefined8 *)(param_2 + 0x10);
        *(undefined8 *)(pdVar11 + 0xc) = uVar18;
        *(undefined8 *)(pdVar11 + 0x10) = *(undefined8 *)(param_2 + 0x18);
      }
      if (*(char *)((long)param_1 + 0x37) < '\0') {
        FUN_00018218(pdVar11 + 0x12,param_1[4],param_1[5]);
      }
      else {
        lVar16 = *plVar1;
        *(long *)(pdVar11 + 0x14) = param_1[5];
        *(long *)(pdVar11 + 0x12) = lVar16;
        *(long *)(pdVar11 + 0x16) = param_1[6];
      }
      if (*(char *)((long)param_1 + 0x4f) < '\0') {
        FUN_00046bd0(pdVar11 + 0x18,param_1[7],param_1[8]);
      }
      else {
        lVar16 = *plVar2;
        *(long *)(pdVar11 + 0x1a) = param_1[8];
        *(long *)(pdVar11 + 0x18) = lVar16;
        *(long *)(pdVar11 + 0x1c) = param_1[9];
      }
      *(undefined1 *)(pdVar11 + 0x1e) = 0;
      *(undefined1 *)(pdVar11 + 0x24) = 0;
      if (*(char *)(param_3 + 3) != '\0') {
        uVar18 = *param_3;
        *(undefined8 *)(pdVar11 + 0x20) = param_3[1];
        *(undefined8 *)(pdVar11 + 0x1e) = uVar18;
        *(undefined8 *)(pdVar11 + 0x22) = param_3[2];
        param_3[1] = 0;
        param_3[2] = 0;
        *param_3 = 0;
        *(undefined1 *)(pdVar11 + 0x24) = 1;
      }
      piVar14 = (int *)param_1[0x10];
      if ((piVar14 != (int *)0x0) && (iVar8 = *piVar14, *piVar14 = iVar8 + 1, iVar8 == 0x7fffffff))
      {
                    /* WARNING: Does not return */
        pcVar7 = (code *)SoftwareBreakpoint(0,0x4253b34);
        (*pcVar7)();
      }
      lVar16 = param_1[0x11];
      pqVar12 = &segment_command_00000020.vmsize;
      FUN_0000f368();
      *(undefined4 *)pqVar12 = 1;
      pqVar12[1] = (qword)&LAB_0425f03c;
      pqVar12[2] = (qword)FUN_03f6cac0;
      pqVar12[3] = (qword)&LAB_040ae6c0;
      pqVar12[4] = (qword)FUN_04257640;
      pqVar12[5] = 0;
      pqVar12[6] = (qword)piVar14;
      pqVar12[7] = lVar16;
      FUN_04253d68(lVar17,auStack_220,pdVar11,pqVar12);
      FUN_0294f504(&local_130);
      return;
    }
  }
  FUN_04253b3c(param_1);
  return;
}


