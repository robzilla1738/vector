// func FUN_0424e0c0 @ 0424e0c0 size 1860

undefined8 * FUN_0424e0c0(undefined8 *param_1,ulong param_2)

{
  undefined8 *****pppppuVar1;
  qword **ppqVar2;
  qword qVar3;
  code *pcVar4;
  dword dVar5;
  int iVar6;
  dword *pdVar7;
  long lVar8;
  char *pcVar9;
  dword *pdVar10;
  qword **ppqVar11;
  qword *pqVar12;
  long lVar13;
  qword **ppqVar14;
  undefined8 uVar15;
  long *plVar16;
  qword *local_c0;
  undefined8 ****local_b8;
  long local_b0;
  undefined8 local_a8;
  qword *local_a0;
  undefined8 uStack_98;
  long local_90;
  undefined8 local_88;
  undefined8 uStack_80;
  ulong local_78;
  char *local_70;
  long lStack_68;
  char local_60;
  char cStack_5f;
  undefined5 uStack_5e;
  char cStack_59;
  char local_58;
  
  *param_1 = &PTR_thunk_FUN_02aa6270_0e088400;
  if ((param_2 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_2);
  }
  *param_1 = &PTR_FUN_0e266bd0;
  param_1[1] = param_2;
  plVar16 = param_1 + 2;
  *plVar16 = 0;
  param_1[3] = 0;
  param_1[4] = 0;
  *(undefined4 *)(param_1 + 5) = 0;
  pdVar7 = &MACH_HEADER.cpusubtype;
  FUN_0000f368();
  *pdVar7 = 0;
  *(undefined1 *)(pdVar7 + 1) = 0;
  if ((pdVar7 != (dword *)0x0) && (dVar5 = *pdVar7, *pdVar7 = dVar5 + 1, dVar5 == 0x7fffffff)) {
                    /* WARNING: Does not return */
    pcVar4 = (code *)SoftwareBreakpoint(0,0x424e7e8);
    (*pcVar4)();
  }
  param_1[6] = pdVar7;
  param_1[7] = param_1;
  local_88 = 0;
  uStack_80 = 0;
  local_78 = 0;
  FUN_01f08574(0x3ff,&local_88);
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar12 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar12 = 1;
  pqVar12[1] = (qword)FUN_03f6d140;
  pqVar12[2] = (qword)FUN_01ac4600;
  pqVar12[3] = (qword)FUN_0255db00;
  pqVar12[4] = (qword)&LAB_0424e820;
  pqVar12[5] = 0;
  pqVar12[6] = (qword)param_1;
  local_70 = "showProfilePicker";
  lStack_68 = 0x11;
  local_a0 = pqVar12;
  FUN_02390ac4(param_2 + 0x10,param_2 + 0x10,&local_70,&local_a0);
  if (local_a0 != (qword *)0x0) {
    LOAcquire();
    qVar3 = *local_a0;
    *(int *)local_a0 = (int)qVar3 + -1;
    LORelease();
    if ((int)qVar3 == 1) {
      (*(code *)local_a0[2])();
    }
  }
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar12 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar12 = 1;
  pqVar12[1] = (qword)FUN_03f6d140;
  pqVar12[2] = (qword)FUN_01ac4600;
  pqVar12[3] = (qword)FUN_0255db00;
  pqVar12[4] = (qword)FUN_0424edc8;
  pqVar12[5] = 0;
  pqVar12[6] = (qword)param_1;
  local_70 = "selectSafariExportZipFile";
  lStack_68 = 0x19;
  local_a0 = pqVar12;
  FUN_02390ac4(param_2 + 0x10,param_2 + 0x10,&local_70,&local_a0);
  if (local_a0 != (qword *)0x0) {
    LOAcquire();
    qVar3 = *local_a0;
    *(int *)local_a0 = (int)qVar3 + -1;
    LORelease();
    if ((int)qVar3 == 1) {
      (*(code *)local_a0[2])();
    }
  }
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar12 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar12 = 1;
  pqVar12[1] = (qword)FUN_03f6d140;
  pqVar12[2] = (qword)FUN_01ac4600;
  pqVar12[3] = (qword)FUN_0255db00;
  pqVar12[4] = (qword)FUN_0424eea4;
  pqVar12[5] = 0;
  pqVar12[6] = (qword)param_1;
  local_70 = "importFirefoxData";
  lStack_68 = 0x11;
  local_a0 = pqVar12;
  FUN_02390ac4(param_2 + 0x10,param_2 + 0x10,&local_70,&local_a0);
  if (local_a0 != (qword *)0x0) {
    LOAcquire();
    qVar3 = *local_a0;
    *(int *)local_a0 = (int)qVar3 + -1;
    LORelease();
    if ((int)qVar3 == 1) {
      (*(code *)local_a0[2])();
    }
  }
  local_a0 = (qword *)0x0;
  uStack_98 = 0;
  local_90 = 0;
  FUN_042653d0(&local_70);
  ppqVar2 = (qword **)local_70;
  ppqVar11 = (qword **)local_70;
  for (lVar13 = lStack_68 * 0x18; local_70 = (char *)ppqVar11, lVar13 != 0; lVar13 = lVar13 + -0x18)
  {
    pqVar12 = (qword *)(long)*(char *)((long)ppqVar2 + 0x17);
    ppqVar11 = ppqVar2;
    if ((long)pqVar12 < 0) {
      pqVar12 = ppqVar2[1];
      ppqVar11 = (qword **)*ppqVar2;
    }
    FUN_02929ee8(&local_a0,ppqVar11,pqVar12);
    ppqVar2 = ppqVar2 + 3;
    ppqVar11 = (qword **)local_70;
  }
  if (ppqVar11 != (qword **)0x0) {
    if (lStack_68 * 0x18 != 0) {
      lVar13 = lStack_68 * -0x18;
      ppqVar2 = ppqVar11 + lStack_68 * 3;
      do {
        ppqVar14 = ppqVar2 + -3;
        if (ppqVar14 == (qword **)0x0) goto LAB_0424e7ec;
        if (*(char *)((long)ppqVar2 + -1) < '\0') {
          FUN_00008eb8(*ppqVar14,(ulong)ppqVar2[-1] & 0x7fffffffffffffff);
        }
        lVar13 = lVar13 + 0x18;
        ppqVar2 = ppqVar14;
      } while (lVar13 != 0);
    }
    lStack_68 = ((long)ppqVar11 - (long)local_70 >> 3) * -0x5555555555555555;
    FUN_00008eb8(local_70,CONCAT17(cStack_59,CONCAT52(uStack_5e,CONCAT11(cStack_5f,local_60))) *
                          0x18);
  }
  local_b0 = 0;
  local_b8 = (undefined8 *****)0x0;
  local_a8 = 0x200000000000000;
  if ((char *)((ulong)&local_b8 | 2) <= "[]" || "[]" < &local_b8) {
    local_b8 = (undefined8 ****)&DAT_00005d5b;
    local_70 = (char *)&local_a0;
    local_60 = 7;
    FUN_0274a7a0(&local_70,0,&local_b8,200);
    lVar13 = *(long *)(param_2 + 0x60);
    if (("/System/Library/Frameworks/CoreText.framework/Versions/A/CoreText"[lVar13 + 0x34] == '\0')
       || (*(int *)("/System/Library/Frameworks/CoreText.framework/Versions/A/CoreText" +
                   lVar13 + 0x30) != -0xe7e7e5)) {
      pcVar9 = "/System/Library/Frameworks/CoreText.framework/Versions/A/CoreText" + lVar13 + 0x30;
      pcVar9[0] = '\x1b';
      pcVar9[1] = '\x18';
      pcVar9[2] = '\x18';
      pcVar9[3] = -1;
      "/System/Library/Frameworks/CoreText.framework/Versions/A/CoreText"[lVar13 + 0x34] = '\x01';
      local_70 = (char *)CONCAT35(local_70._5_3_,0x1ff18181b);
      FUN_02a6e990(lVar13,&local_70,&DAT_04058790);
      lVar13 = *(long *)(param_2 + 0x60);
    }
    FUN_02a62d00(lVar13,0xff18181b);
    uVar15 = *(undefined8 *)(*(long *)(param_2 + 0x60) + 0x270);
    cStack_59 = '\x11';
    if (&cStack_5f <= "aside-import-data" || "aside-import-data" < &local_70) {
      lStack_68._0_1_ = s_aside_import_data_0cf02924[8];
      lStack_68._1_1_ = s_aside_import_data_0cf02924[9];
      lStack_68._2_1_ = s_aside_import_data_0cf02924[10];
      lStack_68._3_1_ = s_aside_import_data_0cf02924[0xb];
      lStack_68._4_1_ = s_aside_import_data_0cf02924[0xc];
      lStack_68._5_1_ = s_aside_import_data_0cf02924[0xd];
      lStack_68._6_1_ = s_aside_import_data_0cf02924[0xe];
      lStack_68._7_1_ = s_aside_import_data_0cf02924[0xf];
      local_70 = (char *)s_aside_import_data_0cf02924._0_8_;
      local_60 = s_aside_import_data_0cf02924[0x10];
      cStack_5f = '\0';
      lVar8 = 0x180;
      FUN_0000f368();
      FUN_0260e08c();
      lVar13 = 0;
      if (lVar8 != 0) {
        lVar13 = lVar8 + 0x40;
      }
      FUN_0260e224(uVar15,lVar13);
      if (cStack_59 < '\0') {
        FUN_00008eb8(local_70,CONCAT17(cStack_59,CONCAT52(uStack_5e,CONCAT11(cStack_5f,local_60))) &
                              0x7fffffffffffffff);
      }
      FUN_02c7ff24(lVar13);
      if (*(char *)(lVar13 + 0x138) == '\0') {
        *(undefined1 *)(lVar13 + 0x20) = 1;
        pppppuVar1 = (undefined8 *****)local_b8;
        if (-1 < (long)local_a8._7_1_) {
          pppppuVar1 = &local_b8;
        }
        lVar8 = local_b0;
        if (-1 < (long)local_a8) {
          lVar8 = (long)local_a8._7_1_;
        }
        FUN_0205e1d0(lVar13 + -0x40,"installedBrowsers",0x11,pppppuVar1,lVar8);
        pcVar9 = segment_command_00000020.segname + 8;
        FUN_0000f368();
        pcVar9[0] = '\x01';
        pcVar9[1] = '\0';
        pcVar9[2] = '\0';
        pcVar9[3] = '\0';
        *(undefined1 **)(pcVar9 + 8) = &LAB_0245f140;
        *(code **)(pcVar9 + 0x10) = FUN_01e2ef00;
        *(code **)(pcVar9 + 0x18) = FUN_0255db00;
        *(code **)(pcVar9 + 0x20) = FUN_0424ef74;
        pqVar12 = &segment_command_00000020.vmsize;
        local_70 = pcVar9;
        FUN_0000f368();
        *(undefined4 *)pqVar12 = 1;
        pqVar12[1] = (qword)&LAB_0424fd28;
        pqVar12[2] = (qword)FUN_03fb9c40;
        pqVar12[3] = (qword)FUN_0255db00;
        pqVar12[4] = (qword)&LAB_0424f040;
        if ((long)local_78 < 0) {
          FUN_00018218(pqVar12 + 5,local_88,uStack_80);
        }
        else {
          pqVar12[6] = uStack_80;
          pqVar12[5] = local_88;
          pqVar12[7] = local_78;
        }
        local_c0 = pqVar12;
        FUN_02a85de0(lVar13,&local_70,&local_c0);
        if (local_c0 != (qword *)0x0) {
          LOAcquire();
          qVar3 = *local_c0;
          *(int *)local_c0 = (int)qVar3 + -1;
          LORelease();
          if ((int)qVar3 == 1) {
            (*(code *)local_c0[2])();
          }
        }
        if (local_70 != (char *)0x0) {
          LOAcquire();
          iVar6 = *(int *)local_70;
          *(int *)local_70 = iVar6 + -1;
          LORelease();
          if (iVar6 == 1) {
            (**(code **)(local_70 + 0x10))();
          }
        }
        lVar13 = 0x90;
        FUN_0000f368();
        FUN_04252ec0();
        lVar8 = *plVar16;
        *plVar16 = lVar13;
        if (lVar8 != 0) {
          FUN_04252f84();
          FUN_00008eb8();
        }
        uVar15 = 0xc0;
        FUN_0000f368();
        local_70 = (char *)((ulong)local_70 & 0xffffffffffffff00);
        local_58 = '\0';
        FUN_04262bc0();
        if ((local_58 != '\0') && (cStack_59 < '\0')) {
          FUN_00008eb8(local_70,CONCAT17(cStack_59,CONCAT52(uStack_5e,CONCAT11(cStack_5f,local_60)))
                                & 0x7fffffffffffffff);
        }
        lVar13 = param_1[3];
        param_1[3] = uVar15;
        if (lVar13 != 0) {
          FUN_04262cb4();
          FUN_00008eb8();
        }
        pdVar7 = &section_00000068.reloff;
        FUN_0000f368();
        *(undefined ***)pdVar7 = &PTR_LAB_0e266c30;
        *(undefined ***)(pdVar7 + 2) = &PTR_LAB_0e266cb8;
        if ((param_2 & 0xfffffffc00000000) == DAT_0ebb2088) {
          FUN_000142fc(param_2);
        }
        *(ulong *)(pdVar7 + 4) = param_2;
        *(undefined8 *)(pdVar7 + 8) = 0;
        *(undefined8 *)(pdVar7 + 6) = 0;
        *(undefined8 *)(pdVar7 + 0xc) = 0;
        *(undefined8 *)(pdVar7 + 10) = 0;
        *(undefined8 *)(pdVar7 + 0x10) = 0;
        *(undefined8 *)(pdVar7 + 0xe) = 0;
        pdVar7[0x12] = 1;
        *(undefined8 *)(pdVar7 + 0x16) = 0;
        *(undefined8 *)(pdVar7 + 0x14) = 0;
        *(undefined8 *)(pdVar7 + 0x1a) = 0;
        *(undefined8 *)(pdVar7 + 0x18) = 0;
        *(undefined8 *)(pdVar7 + 0x1e) = 0;
        *(undefined8 *)(pdVar7 + 0x1c) = 0;
        *(undefined8 *)((long)pdVar7 + 0x81) = 0;
        *(undefined8 *)((long)pdVar7 + 0x79) = 0;
        pdVar10 = &MACH_HEADER.cpusubtype;
        FUN_0000f368();
        *pdVar10 = 0;
        *(undefined1 *)(pdVar10 + 1) = 0;
        if ((pdVar10 != (dword *)0x0) &&
           (dVar5 = *pdVar10, *pdVar10 = dVar5 + 1, dVar5 == 0x7fffffff)) {
                    /* WARNING: Does not return */
          pcVar4 = (code *)SoftwareBreakpoint(0,0x424e800);
          (*pcVar4)();
        }
        *(dword **)(pdVar7 + 0x24) = pdVar10;
        *(dword **)(pdVar7 + 0x26) = pdVar7;
        lVar13 = param_1[4];
        param_1[4] = pdVar7;
        if (lVar13 != 0) {
          FUN_04251a24();
          FUN_00008eb8();
        }
        if ((long)local_a8 < 0) {
          FUN_00008eb8(local_b8,local_a8 & 0x7fffffffffffffff);
        }
        if (local_a0 != (qword *)0x0) {
          FUN_00b26ef0(&local_a0);
          FUN_00008eb8(local_a0,local_90 << 5);
        }
        if ((long)local_78 < 0) {
          FUN_00008eb8(local_88,local_78 & 0x7fffffffffffffff);
        }
        return param_1;
      }
                    /* WARNING: Does not return */
      pcVar4 = (code *)SoftwareBreakpoint(0,0x424e7f4);
      (*pcVar4)();
    }
  }
LAB_0424e7ec:
                    /* WARNING: Does not return */
  pcVar4 = (code *)SoftwareBreakpoint(1,0x424e7f0);
  (*pcVar4)();
}


