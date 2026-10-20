// func FUN_04561570 @ 04561570 size 12784

/* WARNING: Removing unreachable block (ram,0x04562d70) */
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void FUN_04561570(long *param_1,undefined8 param_2,undefined8 param_3,undefined8 param_4)

{
  char cVar1;
  undefined8 uVar2;
  undefined8 uVar3;
  int iVar4;
  uint uVar5;
  undefined8 uVar6;
  int *piVar7;
  long *plVar8;
  undefined1 *puVar9;
  long *plVar10;
  char *pcVar11;
  long *plVar12;
  ulong uVar13;
  char **ppcVar14;
  undefined8 uVar15;
  code *UNRECOVERED_JUMPTABLE_00;
  long lVar16;
  char *pcVar17;
  undefined8 *puVar18;
  long lVar19;
  ulong uVar20;
  undefined4 *puVar21;
  dword dVar22;
  ulong uVar23;
  uint uVar24;
  ulong *puVar25;
  undefined4 local_600 [2];
  undefined8 local_5f8;
  undefined4 local_5f0 [2];
  undefined8 local_5e8;
  undefined4 local_5e0 [2];
  undefined8 local_5d8;
  undefined4 local_5d0 [2];
  undefined8 local_5c8;
  char *local_5c0;
  undefined8 local_5b8;
  ulong uStack_5b0;
  undefined1 local_5a8;
  undefined7 uStack_5a7;
  char local_5a0 [8];
  undefined7 local_598;
  char cStack_591;
  undefined8 local_590 [2];
  undefined7 local_580;
  char cStack_579;
  undefined1 auStack_550 [504];
  ulong local_358;
  undefined4 local_350;
  undefined4 local_2f8;
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
  undefined8 uStack_68;
  undefined8 uStack_60;
  undefined8 uStack_58;
  undefined8 local_50;
  undefined1 local_41;
  
  puVar21 = local_600;
  iVar4 = (int)param_2;
  if (iVar4 < 35000) {
    if (iVar4 < 0x80ef) {
      if (iVar4 < 0x80eb) {
        if (iVar4 == 0x80e9) {
          lVar16 = 0;
          if (param_1[7] != 0) {
            lVar16 = param_1[7] + 0x28;
          }
          thunk_FUN_0c6e2e14(lVar16,param_3);
          return;
        }
        if (iVar4 == 33000) {
          lVar16 = 0;
          if (param_1[7] != 0) {
            lVar16 = param_1[7] + 0x28;
          }
          thunk_FUN_0c6e2d00(lVar16,param_3);
          return;
        }
        if (iVar4 == 0x80ea) {
          lVar16 = 0;
          if (param_1[7] != 0) {
            lVar16 = param_1[7] + 0x28;
          }
          thunk_FUN_0c6e2fcc(lVar16,param_3);
          return;
        }
      }
      else {
        if (iVar4 == 0x80eb) {
          lVar16 = 0;
          if (param_1[7] != 0) {
            lVar16 = param_1[7] + 0x28;
          }
          FUN_04565584(lVar16,param_3);
          return;
        }
        if (iVar4 == 0x80ec) {
          piVar7 = (int *)0x0;
          if (param_1[7] != 0) {
            piVar7 = (int *)(param_1[7] + 0x28);
          }
          thunk_FUN_0c6e32cc();
          if (piVar7 == (int *)0x0) {
            return;
          }
          LOAcquire();
          iVar4 = *piVar7;
          *piVar7 = iVar4 + -1;
          LORelease();
          if (iVar4 != 1) {
            return;
          }
          FUN_00008eb8();
          return;
        }
        if (iVar4 == 0x80ee) {
          lVar16 = 0;
          if (param_1[7] != 0) {
            lVar16 = param_1[7] + 0x28;
          }
          thunk_FUN_0c6e3680(lVar16);
          return;
        }
      }
      goto switchD_0456189c_caseD_9c41;
    }
    switch(iVar4) {
    case 34000:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      thunk_FUN_0c6e3700(lVar16);
      return;
    case 0x84d1:
    case 0x84d2:
      thunk_FUN_0c6e3910(*(undefined8 *)(param_1[7] + 0x68));
      return;
    case 0x84d3:
    case 0x84d4:
    case 0x84d5:
    case 0x84d6:
    case 0x84d7:
    case 0x84d8:
    case 0x84d9:
    case 0x84da:
    case 0x84db:
    case 0x84dd:
    case 0x84f2:
    case 0x84f3:
    case 0x84f4:
    case 0x84f5:
    case 0x84f6:
    case 0x84f7:
    case 0x84f8:
    case 0x84f9:
    case 0x84fa:
    case 0x84fb:
    case 0x84fc:
    case 0x84fd:
    case 0x84fe:
    case 0x84ff:
    case 0x8500:
    case 0x8502:
    case 0x8503:
    case 0x8504:
    case 0x8505:
    case 0x8506:
    case 0x8510:
    case 0x8511:
    case 0x8515:
    case 0x8516:
    case 0x851b:
    case 0x851c:
    case 0x851d:
    case 0x851e:
    case 0x851f:
    case 0x8520:
    case 0x8521:
    case 0x8522:
    case 0x8523:
    case 0x8524:
    case 0x8525:
    case 0x8526:
    case 0x8527:
    case 0x8528:
    case 0x8529:
    case 0x852a:
    case 0x852b:
    case 0x852c:
    case 0x852d:
    case 0x852e:
    case 0x852f:
    case 0x8530:
    case 0x8531:
    case 0x8532:
    case 0x8533:
    case 0x853a:
      goto switchD_0456189c_caseD_9c41;
    case 0x84dc:
      local_5c0 = "CloseWindowByKey";
      FUN_01aee76c(&local_5c0);
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      local_5c0 = "CloseWindow";
      FUN_01aee76c(&local_5c0);
      UNRECOVERED_JUMPTABLE_00 = *(code **)(**(long **)(lVar16 + 0x50) + 0x60);
LAB_045624c0:
      (*UNRECOVERED_JUMPTABLE_00)();
      return;
    case 0x84de:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      FUN_045659e0(lVar16,1);
      return;
    case 0x84df:
      local_5c0 = "CloseTabByKey";
      FUN_01aee76c(&local_5c0);
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      FUN_04565d90(lVar16);
      return;
    case 0x84e2:
    case 0x84e3:
    case 0x84e4:
    case 0x84e5:
    case 0x84e6:
    case 0x84e7:
    case 0x84e8:
    case 0x84e9:
      local_5c0 = "Accel_SelectNumberedTab";
      FUN_01aee76c(&local_5c0);
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      FUN_04566174(lVar16,iVar4 + -0x84e2,3,param_4);
      return;
    case 0x84ea:
      local_5c0 = "Accel_SelectNumberedTab";
      FUN_01aee76c(&local_5c0);
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      FUN_04566660(lVar16,3,param_4);
      return;
    case 0x84eb:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      thunk_FUN_0c6e3bd0(lVar16);
      return;
    case 0x84ec:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      FUN_04568cc4(lVar16);
      return;
    case 0x84ed:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      thunk_FUN_0c6e5254(lVar16);
      return;
    case 0x84ee:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      FUN_074f8fc4(*(long *)(*(long *)(lVar16 + 0x178) + 0x100) + 200,1);
      return;
    case 0x84ef:
      thunk_FUN_0c6e53a0();
      return;
    case 0x84f0:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      thunk_FUN_0c6e3ac8(lVar16);
      return;
    case 0x84f1:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      thunk_FUN_0c6e3b08(lVar16);
      return;
    case 0x8501:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      FUN_07fe5754(lVar16 + -0x28);
      return;
    case 0x8507:
      local_5c0 = "OpenActiveTabInPwaWindow";
      FUN_01aee76c(&local_5c0);
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      FUN_07c8237c(lVar16);
      return;
    case 0x8508:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      thunk_FUN_0c6e3cc0(lVar16);
      return;
    case 0x8509:
      lVar16 = param_1[7];
      if ((*(byte *)(*(long *)(*(long *)(lVar16 + 0x88) + 0x90) + 0x78) & 1) != 0) {
        return;
      }
      lVar19 = 0;
      if (lVar16 != 0) {
        lVar19 = lVar16 + 0x28;
      }
      uVar6 = 0;
      goto LAB_04562864;
    case 0x850a:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      FUN_04566dd8(lVar16);
      return;
    case 0x850b:
      return;
    case 0x850c:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      thunk_FUN_0c6e6588(lVar16);
      return;
    case 0x850d:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      thunk_FUN_0c6e6600(lVar16);
      return;
    case 0x850e:
      iVar4 = 0;
      if (param_1[7] != 0) {
        iVar4 = (int)param_1[7] + 0x28;
      }
      thunk_FUN_0c6e3a74();
      if (iVar4 != 0) {
        local_5c0 = "Accel_CycleToNextTab";
LAB_04563a70:
        FUN_01aee76c(&local_5c0);
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        FUN_04565f10(lVar16,3,param_4);
        return;
      }
    case 0x84e0:
      local_5c0 = "Accel_SelectNextTab";
      FUN_01aee76c(&local_5c0);
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      thunk_FUN_0c6e39c4(lVar16,3,param_4);
      return;
    case 0x850f:
      iVar4 = 0;
      if (param_1[7] != 0) {
        iVar4 = (int)param_1[7] + 0x28;
      }
      thunk_FUN_0c6e3a74();
      if (iVar4 != 0) {
        local_5c0 = "Accel_CycleToPrevTab";
        goto LAB_04563a70;
      }
    case 0x84e1:
      local_5c0 = "Accel_SelectPreviousTab";
      FUN_01aee76c(&local_5c0);
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      thunk_FUN_0c6e3a1c(lVar16,3,param_4);
      return;
    case 0x8512:
      lVar16 = param_1[7];
      if ((*(byte *)(*(long *)(*(long *)(lVar16 + 0x88) + 0x90) + 0x78) & 1) != 0) {
        return;
      }
      lVar19 = 0;
      if (lVar16 != 0) {
        lVar19 = lVar16 + 0x28;
      }
      uVar6 = 1;
LAB_04562864:
      thunk_FUN_0c6e4810(lVar19,uVar6,9);
      return;
    case 0x8513:
      lVar16 = param_1[7];
      if (lVar16 == 0) {
        return;
      }
      iVar4 = (int)*(undefined8 *)(lVar16 + 0x68);
      FUN_00bfe218();
      if (iVar4 == 0) {
        return;
      }
      plVar10 = *(long **)(lVar16 + 0x68);
      if ((((plVar10 == (long *)0x0) || ((*(byte *)(plVar10 + 9) & 1) != 0)) ||
          (plVar8 = plVar10, (**(code **)(*plVar10 + 0x168))(), plVar8 == (long *)0x0)) ||
         (plVar12 = plVar8, FUN_004bcc4c(), plVar12 == (long *)0x0)) {
LAB_04562b9c:
        FUN_041035c0();
        uVar20 = (ulong)plVar10 & 0x100000000;
      }
      else {
        FUN_002bea28(plVar8,"aside.account_id",0x10);
        uVar5 = (uint)plVar8;
        uVar20 = 0x100000000;
        if ((int)uVar5 < 0) goto LAB_04562b9c;
        plVar10 = (long *)(ulong)(uVar5 & ((int)uVar5 >> 0x1f ^ 0xffffffffU));
      }
      local_50 = 0;
      puVar9 = (undefined1 *)(uVar20 | (ulong)plVar10 & 0xffffffff);
      uStack_68 = 0;
      local_70 = 0;
      uStack_58 = 0;
      uStack_60 = 0;
      if (puVar9 < &DAT_100000001) {
        puVar9 = (undefined1 *)0x100000000;
      }
      uStack_88 = 0;
      local_90 = 0;
      uStack_78 = 0;
      uStack_80 = 0;
      uStack_a8 = 0;
      local_b0 = 0;
      uStack_98 = 0;
      uStack_a0 = 0;
      uStack_b8 = 0;
      local_c0 = 0;
      FUN_04565100(&local_c0,"main.html",9,puVar9,"/tasks/new",10);
      if (((char)uStack_a8 != '\0') &&
         (puVar25 = *(ulong **)(lVar16 + 0x88), puVar25 != (ulong *)0x0)) {
        uVar20 = puVar25[0x12];
        if (uVar20 == 0) {
LAB_04562c5c:
          uVar13 = 0xffffffff;
        }
        else {
          uVar13 = *puVar25;
          FUN_0038a52c();
          uVar5 = (uint)uVar13;
          if (((uint)uVar20 & (uint)(uVar5 != 0xffffffff)) == 0) goto LAB_04562c5c;
          if (((int)uVar5 < 0) || (uVar20 = *puVar25, *(int *)(uVar20 + 0x18) <= (int)uVar5)) {
            uVar20 = 0;
          }
          else {
            FUN_0105e2f8(uVar20,uVar13 & 0x7fffffff);
            uVar20 = *(ulong *)(uVar20 + 0x40);
          }
          FUN_04564b14(uVar20,&local_c0);
          if ((int)uVar20 != 0) {
            uVar24 = uVar5 & 0xffffff00;
LAB_045645b0:
            uVar6 = *(undefined8 *)(lVar16 + 0x88);
            (*(code *)PTR_FUN_0ebb1d18)();
            FUN_07d4fae8(uVar6,uVar24 | uVar5 & 0xff,6,uVar20);
            goto LAB_04562d50;
          }
        }
        uVar20 = *puVar25;
        if (0 < *(int *)(uVar20 + 0x18)) {
          uVar23 = 0;
          do {
            if ((uVar13 & 0xffffffff) != uVar23) {
              FUN_0105e2f8(uVar20,uVar23);
              uVar20 = *(ulong *)(uVar20 + 0x40);
              FUN_04564b14(uVar20,&local_c0);
              if ((uVar20 & 1) != 0) {
                uVar5 = (uint)uVar23;
                uVar24 = uVar5 & 0x7fffff00;
                goto LAB_045645b0;
              }
              uVar20 = *puVar25;
            }
            uVar23 = uVar23 + 1;
          } while ((long)uVar23 < (long)*(int *)(uVar20 + 0x18));
        }
      }
      _bzero(&local_5c0,0x500);
      FUN_031cc6dc(&local_5c0,lVar16 + 0x28,&local_c0,0);
      local_350 = 3;
      lVar16 = *(long *)(*(long *)(lVar16 + 0x88) + 0x90);
      if (lVar16 == 0) {
        uVar20 = 0;
      }
      else {
        uVar20 = *(ulong *)(lVar16 + 0x40);
      }
      if ((uVar20 & 0xfffffffc00000000) == DAT_0ebb2088) {
        FUN_000142fc(uVar20);
      }
      if ((local_358 & 0xfffffffc00000000) == DAT_0ebb2088) {
        FUN_00026a44();
      }
      local_2f8 = 1;
      local_358 = uVar20;
      FUN_04569cf0(&local_5c0);
      local_41 = 0;
      ppcVar14 = &local_5c0;
      FUN_036c4d40(ppcVar14,&local_41);
      if (ppcVar14 != (char **)0x0) {
        LOAcquire();
        iVar4 = *(int *)ppcVar14;
        *(int *)ppcVar14 = iVar4 + -1;
        LORelease();
        if (iVar4 == 1) {
          FUN_00008eb8();
        }
      }
      FUN_031cc838(&local_5c0);
LAB_04562d50:
      FUN_00027cb8(&local_50,0);
      FUN_00027c78(&uStack_a0);
      return;
    case 0x8514:
      lVar19 = param_1[7];
      lVar16 = 0;
      if (lVar19 != 0) {
        lVar16 = lVar19 + 0x28;
      }
      lVar19 = *(long *)(*(long *)(lVar19 + 0x88) + 0x90);
      if (lVar19 == 0) {
        uVar6 = 0;
      }
      else {
        uVar6 = *(undefined8 *)(lVar19 + 0x40);
      }
      pcVar11 = segment_command_00000020.segname + 8;
      FUN_0000f368();
      uVar3 = s_fjdhphbdlfjogobdofoaagnlnkoibdge_0ce48949._24_8_;
      uVar2 = s_fjdhphbdlfjogobdofoaagnlnkoibdge_0ce48949._16_8_;
      uVar15 = s_fjdhphbdlfjogobdofoaagnlnkoibdge_0ce48949._0_8_;
      uStack_5b0 = _UNK_0df3b3e8;
      local_5b8 = _DAT_0df3b3e0;
      local_5c0 = pcVar11;
      if ((pcVar11 + 0x20 < pcVar11) ||
         ("fjdhphbdlfjogobdofoaagnlnkoibdge" < pcVar11 + 0x20 &&
          pcVar11 < "jdhphbdlfjogobdofoaagnlnkoibdge")) {
                    /* WARNING: Does not return */
        UNRECOVERED_JUMPTABLE_00 = (code *)SoftwareBreakpoint(1,0x4564644);
        (*UNRECOVERED_JUMPTABLE_00)();
      }
      *(undefined8 *)(pcVar11 + 8) = s_fjdhphbdlfjogobdofoaagnlnkoibdge_0ce48949._8_8_;
      *(undefined8 *)pcVar11 = uVar15;
      *(undefined8 *)(pcVar11 + 0x18) = uVar3;
      *(undefined8 *)(pcVar11 + 0x10) = uVar2;
      pcVar11[0x20] = 0;
      FUN_040df6a8(lVar16,uVar6,&local_5c0);
      goto LAB_04562f84;
    case 0x8517:
      lVar19 = param_1[7];
      lVar16 = 0;
      if (lVar19 != 0) {
        lVar16 = lVar19 + 0x28;
      }
      lVar19 = *(long *)(*(long *)(lVar19 + 0x88) + 0x90);
      if (lVar19 == 0) {
        uVar6 = 0;
      }
      else {
        uVar6 = *(undefined8 *)(lVar19 + 0x40);
      }
      thunk_FUN_0c6e7250(lVar16,uVar6);
      return;
    case 0x8518:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      thunk_FUN_0c6e737c(lVar16);
      return;
    case 0x8519:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      plVar10 = *(long **)(lVar16 + 0x160);
      if (plVar10 != (long *)0x0) {
        do {
          while ((undefined **)plVar10[4] < (undefined **)0xe8957b1) {
            if ((undefined **)plVar10[4] == &PTR_s_AppBrowserController_kDataKeyIm_0e8957b0) {
              if (plVar10 != (long *)(lVar16 + 0x160)) {
                uVar20 = plVar10[5];
                if ((uVar20 & 0xfffffffc00000000) == DAT_0ebb2088) {
                  FUN_000142fc(uVar20);
                }
                goto LAB_045635cc;
              }
              goto LAB_045635c8;
            }
            plVar10 = (long *)plVar10[1];
            if (plVar10 == (long *)0x0) goto LAB_045635c8;
          }
          plVar10 = (long *)*plVar10;
        } while (plVar10 != (long *)0x0);
      }
LAB_045635c8:
      uVar20 = 0;
LAB_045635cc:
      if ((uVar20 & 0xfffffffc00000000) == DAT_0ebb2088) {
        FUN_00022a3c(uVar20);
      }
      if (uVar20 == 0) {
                    /* WARNING: Does not return */
        UNRECOVERED_JUMPTABLE_00 = (code *)SoftwareBreakpoint(0,0x456472c);
        (*UNRECOVERED_JUMPTABLE_00)();
      }
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      plVar10 = *(long **)(lVar16 + 0x160);
      if (plVar10 != (long *)0x0) {
        do {
          while ((undefined **)plVar10[4] < (undefined **)0xe8957b1) {
            if ((undefined **)plVar10[4] == &PTR_s_AppBrowserController_kDataKeyIm_0e8957b0) {
              if (plVar10 != (long *)(lVar16 + 0x160)) {
                uVar20 = plVar10[5];
                if ((uVar20 & 0xfffffffc00000000) == DAT_0ebb2088) {
                  FUN_000142fc(uVar20);
                }
                goto LAB_04563630;
              }
              goto LAB_0456362c;
            }
            plVar10 = (long *)plVar10[1];
            if (plVar10 == (long *)0x0) goto LAB_0456362c;
          }
          plVar10 = (long *)*plVar10;
        } while (plVar10 != (long *)0x0);
      }
LAB_0456362c:
      uVar20 = 0;
LAB_04563630:
      if ((uVar20 & 0xfffffffc00000000) == DAT_0ebb2088) {
        FUN_00022a3c(uVar20);
      }
      thunk_FUN_0c6ecf78(lVar16,*(undefined8 *)(lVar16 + 0x40),uVar20 + 0x58,2);
      return;
    case 0x851a:
      lVar16 = *(long *)(*(long *)(param_1[7] + 0x88) + 0x90);
      if (lVar16 == 0) {
        return;
      }
      lVar16 = *(long *)(lVar16 + 0x40);
      if (lVar16 == 0) {
        return;
      }
      lVar19 = lVar16 + 8;
      FUN_00053170(lVar19,&DAT_0d4c9cf4);
      if (lVar19 == 0 || lVar19 == 0x20) {
        dVar22 = 0xffffffff;
      }
      else {
        dVar22 = *(dword *)(lVar19 + 0x54);
      }
      pcVar11 = segment_command_00000020.segname + 8;
      FUN_0000f368();
      pcVar11[0] = '\x01';
      pcVar11[1] = '\0';
      pcVar11[2] = '\0';
      pcVar11[3] = '\0';
      *(undefined1 **)(pcVar11 + 8) = &LAB_09e9fe00;
      *(code **)(pcVar11 + 0x10) = FUN_01e2ef00;
      *(code **)(pcVar11 + 0x18) = FUN_0255db00;
      *(code **)(pcVar11 + 0x20) = FUN_0c6e2458;
      *(dword *)(pcVar11 + 0x28) = dVar22;
      FUN_07bcb1ac(lVar16,pcVar11,1,0);
      return;
    case 0x8534:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      FUN_04566b80(lVar16);
      pcVar11 = "TabGroups.Shortcuts";
      FUN_0091d580("TabGroups.Shortcuts",1,5,6,1);
      UNRECOVERED_JUMPTABLE_00 = *(code **)(*(long *)pcVar11 + 0x30);
      break;
    case 0x8535:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      thunk_FUN_0c6e49f8(lVar16);
      pcVar11 = "TabGroups.Shortcuts";
      FUN_0091d580("TabGroups.Shortcuts",1,5,6,1);
      UNRECOVERED_JUMPTABLE_00 = *(code **)(*(long *)pcVar11 + 0x30);
      if (UNRECOVERED_JUMPTABLE_00 != FUN_001b8ac0) goto LAB_045626d8;
      goto LAB_04562644;
    case 0x8536:
      uVar20 = (ulong)DAT_0ef0e7a8;
      if (DAT_0ef0e7a8 == 0) {
        FUN_01768f64();
        cVar1 = *(char *)(uVar20 + 8);
        if (cVar1 == '\x01') {
          uVar5 = (int)uVar20 + 0x17;
        }
        else {
          uVar5 = 0xd7e5a64;
          if (cVar1 == '\x02') {
            pcVar17 = *(char **)(*(long *)(uVar20 + 0x20) + 8);
            pcVar11 = "";
            if (pcVar17 != (char *)0x0) {
              pcVar11 = pcVar17;
            }
            uVar5 = (uint)pcVar11;
          }
          else if (cVar1 != '\0') {
LAB_04564770:
                    /* WARNING: Subroutine does not return */
            _abort();
          }
        }
        FUN_0011b100();
        DAT_0ef0e7a8 = uVar5;
      }
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      if (DAT_0ef0e7a8 == 1) {
        thunk_FUN_0c6e4e2c(lVar16);
      }
      else {
        thunk_FUN_0c6e4b80(lVar16);
      }
      pcVar11 = "TabGroups.Shortcuts";
      FUN_0091d580("TabGroups.Shortcuts",1,5,6,1);
      UNRECOVERED_JUMPTABLE_00 = *(code **)(*(long *)pcVar11 + 0x30);
      break;
    case 0x8537:
      uVar20 = (ulong)DAT_0ef0e7a8;
      if (DAT_0ef0e7a8 == 0) {
        FUN_01768f64();
        cVar1 = *(char *)(uVar20 + 8);
        if (cVar1 == '\x01') {
          uVar5 = (int)uVar20 + 0x17;
        }
        else {
          uVar5 = 0xd7e5a64;
          if (cVar1 == '\x02') {
            pcVar17 = *(char **)(*(long *)(uVar20 + 0x20) + 8);
            pcVar11 = "";
            if (pcVar17 != (char *)0x0) {
              pcVar11 = pcVar17;
            }
            uVar5 = (uint)pcVar11;
          }
          else if (cVar1 != '\0') goto LAB_04564770;
        }
        FUN_0011b100();
        DAT_0ef0e7a8 = uVar5;
      }
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      if (DAT_0ef0e7a8 == 1) {
        thunk_FUN_0c6e4b80(lVar16);
      }
      else {
        thunk_FUN_0c6e4e2c(lVar16);
      }
      pcVar11 = "TabGroups.Shortcuts";
      FUN_0091d580("TabGroups.Shortcuts",1,5,6,1);
      UNRECOVERED_JUMPTABLE_00 = *(code **)(*(long *)pcVar11 + 0x30);
      break;
    case 0x8538:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      thunk_FUN_0c6e4a48(lVar16);
      pcVar11 = "TabGroups.Shortcuts";
      FUN_0091d580("TabGroups.Shortcuts",1,5,6,1);
      UNRECOVERED_JUMPTABLE_00 = *(code **)(*(long *)pcVar11 + 0x30);
      if (UNRECOVERED_JUMPTABLE_00 == FUN_001b8ac0) goto LAB_04562644;
      goto LAB_045626d8;
    case 0x8539:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      thunk_FUN_0c6e4fb0(lVar16);
      local_5c0 = "TabGroups_GroupAllUngroupedTabs";
      FUN_01aee76c(&local_5c0);
      return;
    case 0x853b:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      FUN_04566cc0(lVar16);
      return;
    case 0x853c:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      thunk_FUN_0c6e5078(lVar16,1);
      return;
    default:
      if (iVar4 != 0x80ef) {
        if (iVar4 != 0x80f1) goto switchD_0456189c_caseD_9c41;
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e7200(lVar16);
      }
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      thunk_FUN_0c6e3238(lVar16,param_3);
      return;
    }
    if (UNRECOVERED_JUMPTABLE_00 == FUN_001b8ac0) {
LAB_04562644:
      FUN_001b8ac0();
      return;
    }
LAB_045626d8:
                    /* WARNING: Could not recover jumptable at 0x045626ec. Too many branches */
                    /* WARNING: Treating indirect jump as call */
    (*UNRECOVERED_JUMPTABLE_00)();
    return;
  }
  if (iVar4 < 0x9d2c) {
    if (iVar4 < 0x8a17) {
      switch(iVar4) {
      case 35000:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e53e0(lVar16);
        return;
      case 0x88b9:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e56d4(lVar16);
        return;
      case 0x88ba:
        lVar16 = *(long *)(*(long *)(param_1[7] + 0x88) + 0x90);
        if (lVar16 == 0) {
          lVar16 = 0;
        }
        else {
          lVar16 = *(long *)(lVar16 + 0x40);
        }
        iVar4 = 0xecdc348;
        FUN_00119280();
        if (iVar4 != 0) {
          uVar20 = *(ulong *)(param_1[7] + 0x68);
          FUN_00bfb750(uVar20,lVar16);
          if ((uVar20 & 1) == 0) goto LAB_045627f4;
        }
                    /* WARNING: Could not recover jumptable at 0x0456279c. Too many branches */
                    /* WARNING: Treating indirect jump as call */
        (**(code **)(**(long **)(*(long *)(lVar16 + 0x8f8) + 0x118) + 0x1b8))();
        return;
      case 0x88bb:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e6270(lVar16);
        return;
      case 0x88bc:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e6188(lVar16);
        return;
      case 0x88bf:
        local_5c0 = "Accel_Advanced_Print";
        FUN_01aee76c(&local_5c0);
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        lVar16 = *(long *)(*(long *)(lVar16 + 0x60) + 0x90);
        if (lVar16 == 0) {
          uVar6 = 0;
        }
        else {
          uVar6 = *(undefined8 *)(lVar16 + 0x40);
        }
        FUN_08001c94(uVar6);
        return;
      case 0x88c0:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e5c18(lVar16);
        return;
      case 0x88c1:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e5e00(lVar16);
        return;
      case 0x88c2:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e5fe0(lVar16);
        return;
      case 0x88c3:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e62f0(lVar16);
        return;
      case 0x88c4:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e50d8(lVar16);
        return;
      case 0x88c5:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e4780(lVar16);
        return;
      case 0x88c6:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e47c4(lVar16);
        return;
      case 0x88c8:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        lVar16 = *(long *)(*(long *)(lVar16 + 0x60) + 0x90);
        if (lVar16 == 0) {
          uVar6 = 0;
        }
        else {
          uVar6 = *(undefined8 *)(lVar16 + 0x40);
        }
        FUN_07ba46a4(uVar6,4,0);
        return;
      case 0x88cd:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e6074(lVar16);
        return;
      case 0x88ce:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e5308(lVar16);
        return;
      case 0x88cf:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e534c(lVar16);
        return;
      case 0x88d0:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e3980(lVar16);
        return;
      case 0x88d1:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e5d00(lVar16);
        return;
      case 0x88d2:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e5bdc(lVar16);
        return;
      case 0x88d4:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e60e8(lVar16);
        return;
      case 0x88d6:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e5d58(lVar16);
        return;
      case 0x88d7:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e614c(lVar16);
        return;
      case 0x88d8:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e5d98(lVar16);
        return;
      case 0x88db:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e5c58(lVar16);
        return;
      case 0x88dc:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e5c94(lVar16);
        return;
      case 0x88e1:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6ec4b8(lVar16);
        return;
      case 0x88e2:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6ecb74(lVar16);
        return;
      case 0x88e3:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6ecadc(lVar16);
        return;
      case 0x88e6:
        return;
      case 0x88e7:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6ecbc0(lVar16);
        return;
      case 0x88e8:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6ecc0c(lVar16);
        return;
      case 0x88e9:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6ecb28(lVar16);
        return;
      case 0x88ea:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e511c(lVar16);
        return;
      case 0x88eb:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e516c(lVar16);
        return;
      case 0x88ec:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e51bc(lVar16);
        return;
      case 0x88ed:
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e520c(lVar16);
        return;
      }
      goto switchD_0456189c_caseD_9c41;
    }
    if (iVar4 < 0x9473) {
      if (0x8ca2 < iVar4) {
        if (0x91e5 < iVar4) {
          if (iVar4 == 0x9471) {
            lVar16 = 0;
            if (param_1[7] != 0) {
              lVar16 = param_1[7] + 0x28;
            }
            lVar16 = *(long *)(*(long *)(lVar16 + 0x60) + 0x90);
            if (lVar16 == 0) {
              uVar6 = 0;
            }
            else {
              uVar6 = *(undefined8 *)(lVar16 + 0x40);
            }
            uVar15 = 1;
          }
          else {
            if (iVar4 != 0x9472) {
              if (iVar4 == 0x91e6) goto LAB_04563114;
              goto switchD_0456189c_caseD_9c41;
            }
            lVar16 = 0;
            if (param_1[7] != 0) {
              lVar16 = param_1[7] + 0x28;
            }
            lVar16 = *(long *)(*(long *)(lVar16 + 0x60) + 0x90);
            if (lVar16 == 0) {
              uVar6 = 0;
            }
            else {
              uVar6 = *(undefined8 *)(lVar16 + 0x40);
            }
            uVar15 = 0;
          }
LAB_04561a74:
          FUN_0a5c5ae0(uVar6,uVar15);
          return;
        }
        if (iVar4 < 0x908a) {
          if (iVar4 == 0x8ca3) {
            lVar16 = 0;
            if (param_1[7] != 0) {
              lVar16 = param_1[7] + 0x28;
            }
            plVar10 = *(long **)(lVar16 + 0x160);
            if (plVar10 != (long *)0x0) {
              do {
                while ((undefined **)plVar10[4] < (undefined **)0xe8a7971) {
                  if ((undefined **)plVar10[4] == &PTR_s_BrowserActions_kDataKeyImpl_0e8a7970) {
                    if (plVar10 != (long *)(lVar16 + 0x160)) {
                      puVar18 = (undefined8 *)plVar10[5];
                      if (((ulong)puVar18 & 0xfffffffc00000000) == DAT_0ebb2088) {
                        FUN_000142fc(puVar18);
                      }
                      goto LAB_04562260;
                    }
                    goto LAB_0456225c;
                  }
                  plVar10 = (long *)plVar10[1];
                  if (plVar10 == (long *)0x0) goto LAB_0456225c;
                }
                plVar10 = (long *)*plVar10;
              } while (plVar10 != (long *)0x0);
            }
LAB_0456225c:
            puVar18 = (undefined8 *)0x0;
LAB_04562260:
            if (((ulong)puVar18 & 0xfffffffc00000000) == DAT_0ebb2088) {
              FUN_00022a3c(puVar18);
            }
            uVar15 = *puVar18;
            uVar6 = 2;
            goto LAB_04562284;
          }
          if (iVar4 == 37000) {
            lVar16 = 0;
            if (param_1[7] != 0) {
              lVar16 = param_1[7] + 0x28;
            }
            thunk_FUN_0c6e6328(lVar16);
            return;
          }
          if (iVar4 == 0x9089) {
            lVar16 = 0;
            if (param_1[7] != 0) {
              lVar16 = param_1[7] + 0x28;
            }
            thunk_FUN_0c6e6374(lVar16);
            return;
          }
        }
        else {
          if (iVar4 == 0x908b) {
            iVar4 = 0;
            if (param_1[7] != 0) {
              iVar4 = (int)param_1[7] + 0x28;
            }
            FUN_03ca21c0();
            if (iVar4 != 0) {
              lVar16 = 0;
              if (param_1[7] != 0) {
                lVar16 = param_1[7] + 0x28;
              }
              thunk_FUN_0c6e6640(lVar16);
              return;
            }
            plVar10 = (long *)param_1[9];
            (**(code **)(*plVar10 + 0x18))(plVar10,0x80ee);
            if ((int)plVar10 == 0) {
              return;
            }
            (*(code *)PTR_FUN_0ebb1d18)();
            local_5c0 = (char *)((ulong)local_5c0 & 0xffffffffffffff00);
            local_5a0[0] = '\0';
            (**(code **)(*param_1 + 0x50))(param_1,0x80ee,1,&local_5c0,plVar10);
            if (local_5a0[0] == '\0') {
              return;
            }
            FUN_03a7797c(&local_5c0);
            return;
          }
          if (iVar4 == 0x908a) {
            lVar16 = 0;
            if (param_1[7] != 0) {
              lVar16 = param_1[7] + 0x28;
            }
            thunk_FUN_0c6e63c0(lVar16);
            return;
          }
        }
        goto switchD_0456189c_caseD_9c41;
      }
      switch(iVar4) {
      case 0x8a17:
        iVar4 = (int)*(undefined8 *)(param_1[7] + 0x68);
        FUN_0113e788();
        if (iVar4 == 0) {
          FUN_07acac24(*(undefined8 *)(param_1[7] + 0x68));
          return;
        }
        FUN_079b816c(*(undefined8 *)(param_1[7] + 0x68),1);
        return;
      case 0x8a18:
        lVar19 = *(long *)(param_1[7] + 0x68);
        lVar16 = lVar19;
        FUN_0138b970();
        FUN_021aceb0(&local_5c0,*(undefined8 *)(lVar16 + 0x58),0);
        FUN_07bcc300(lVar19,local_590);
        if (cStack_579 < '\0') {
          FUN_00008eb8(local_590[0],CONCAT17(cStack_579,local_580) & 0x7fffffffffffffff);
        }
        if (cStack_591 < '\0') {
          FUN_00008eb8(CONCAT71(uStack_5a7,local_5a8),
                       CONCAT17(cStack_591,local_598) & 0x7fffffffffffffff);
        }
        goto LAB_04562f84;
      case 0x8a19:
        goto LAB_04563114;
      case 0x8a1a:
        uVar6 = *(undefined8 *)(param_1[7] + 0x68);
        FUN_07bcc5bc(&local_5c0,uVar6);
        FUN_07b08450(uVar6,&local_5c0,2,1);
        break;
      case 0x8a1b:
        FUN_07b08138(*(undefined8 *)(param_1[7] + 0x68),2);
        return;
      case 0x8a1c:
        FUN_07acabbc(0);
        return;
      case 0x8a1d:
        uVar6 = 0xf;
        goto LAB_04562e34;
      case 0x8a1e:
        uVar6 = 0xe;
LAB_04562e34:
        FUN_07bcd7dc(&local_5c0,uVar6);
        thunk_FUN_0c7034ac(&local_5c0);
        FUN_07bcd680(&local_5c0);
        return;
      case 0x8a1f:
        uVar6 = *(undefined8 *)(param_1[7] + 0x68);
        FUN_07bcc5bc(&local_5c0,uVar6);
        FUN_07b081fc(uVar6,&local_5c0,2);
        break;
      case 0x8a20:
        FUN_0743f49c(param_1[7] + 0x28);
        return;
      default:
        if (iVar4 == 36000) {
          lVar16 = 0;
          if (param_1[7] != 0) {
            lVar16 = param_1[7] + 0x28;
          }
          plVar10 = *(long **)(lVar16 + 0x160);
          if (plVar10 != (long *)0x0) {
            do {
              while ((undefined **)plVar10[4] < (undefined **)0xe8a7971) {
                if ((undefined **)plVar10[4] == &PTR_s_BrowserActions_kDataKeyImpl_0e8a7970) {
                  if (plVar10 != (long *)(lVar16 + 0x160)) {
                    puVar18 = (undefined8 *)plVar10[5];
                    if (((ulong)puVar18 & 0xfffffffc00000000) == DAT_0ebb2088) {
                      FUN_000142fc(puVar18);
                    }
                    goto LAB_04562314;
                  }
                  goto LAB_04562310;
                }
                plVar10 = (long *)plVar10[1];
                if (plVar10 == (long *)0x0) goto LAB_04562310;
              }
              plVar10 = (long *)*plVar10;
            } while (plVar10 != (long *)0x0);
          }
LAB_04562310:
          puVar18 = (undefined8 *)0x0;
LAB_04562314:
          if (((ulong)puVar18 & 0xfffffffc00000000) == DAT_0ebb2088) {
            FUN_00022a3c(puVar18);
          }
          uVar15 = *puVar18;
          uVar6 = 0;
        }
        else {
          if (iVar4 != 0x8ca1) goto switchD_0456189c_caseD_9c41;
          lVar16 = 0;
          if (param_1[7] != 0) {
            lVar16 = param_1[7] + 0x28;
          }
          plVar10 = *(long **)(lVar16 + 0x160);
          if (plVar10 != (long *)0x0) {
            do {
              while ((undefined **)plVar10[4] < (undefined **)0xe8a7971) {
                if ((undefined **)plVar10[4] == &PTR_s_BrowserActions_kDataKeyImpl_0e8a7970) {
                  if (plVar10 != (long *)(lVar16 + 0x160)) {
                    puVar18 = (undefined8 *)plVar10[5];
                    if (((ulong)puVar18 & 0xfffffffc00000000) == DAT_0ebb2088) {
                      FUN_000142fc(puVar18);
                    }
                    goto LAB_04562214;
                  }
                  goto LAB_04562210;
                }
                plVar10 = (long *)plVar10[1];
                if (plVar10 == (long *)0x0) goto LAB_04562210;
              }
              plVar10 = (long *)*plVar10;
            } while (plVar10 != (long *)0x0);
          }
LAB_04562210:
          puVar18 = (undefined8 *)0x0;
LAB_04562214:
          if (((ulong)puVar18 & 0xfffffffc00000000) == DAT_0ebb2088) {
            FUN_00022a3c(puVar18);
          }
          uVar15 = *puVar18;
          uVar6 = 1;
        }
LAB_04562284:
        thunk_FUN_0c6e2400(uVar6,uVar15);
        return;
      }
      FUN_014fb744(&local_5c0);
      return;
    }
    if (iVar4 < 0x9861) {
      if (iVar4 < 0x9859) {
        if (iVar4 == 0x9473) {
          lVar16 = 0;
          if (param_1[7] != 0) {
            lVar16 = param_1[7] + 0x28;
          }
          lVar16 = *(long *)(*(long *)(lVar16 + 0x60) + 0x90);
          if (lVar16 == 0) {
            uVar6 = 0;
          }
          else {
            uVar6 = *(undefined8 *)(lVar16 + 0x40);
          }
          uVar15 = 0xffffffff;
          goto LAB_04561a74;
        }
        if (iVar4 == 39000) {
          local_5c0 = "Accel_Focus_Toolbar";
          FUN_01aee76c(&local_5c0);
          lVar16 = 0;
          if (param_1[7] != 0) {
            lVar16 = param_1[7] + 0x28;
          }
          thunk_FUN_0c6e667c(lVar16);
          return;
        }
      }
      else {
        if (iVar4 < 0x985a) {
          lVar16 = param_1[7];
          if (lVar16 == 0) {
            plVar10 = (long *)0x0;
          }
          else {
            plVar10 = (long *)(lVar16 + 0x28);
            FUN_00786858();
            if (plVar10 == (long *)0x0) {
              plVar10 = (long *)(lVar16 + 0x28);
              FUN_0105e3d0();
              if (plVar10 == (long *)0x0) {
                plVar10 = *(long **)(lVar16 + 0x78);
              }
            }
          }
          (**(code **)(*plVar10 + 0x1c8))();
          if ((int)plVar10 == 0) {
            return;
          }
          local_5c0 = "Accel_Focus_Location";
          FUN_01aee76c(&local_5c0);
          lVar16 = 0;
          if (param_1[7] != 0) {
            lVar16 = param_1[7] + 0x28;
          }
          thunk_FUN_0c6e66d0(lVar16);
          return;
        }
        if (iVar4 < 0x985d) {
          if (iVar4 == 0x985a) {
            local_5c0 = "Accel_Focus_Search";
            FUN_01aee76c(&local_5c0);
            lVar16 = 0;
            if (param_1[7] != 0) {
              lVar16 = param_1[7] + 0x28;
            }
            thunk_FUN_0c6e6720(lVar16);
            return;
          }
          if (iVar4 == 0x985b) {
            lVar16 = 0;
            if (param_1[7] != 0) {
              lVar16 = param_1[7] + 0x28;
            }
            thunk_FUN_0c6e6778(lVar16);
            return;
          }
          if (iVar4 == 0x985c) {
            lVar16 = 0;
            if (param_1[7] != 0) {
              lVar16 = param_1[7] + 0x28;
            }
            thunk_FUN_0c6e6854(lVar16);
            return;
          }
        }
        else {
          if (iVar4 == 0x985d) {
            lVar16 = 0;
            if (param_1[7] != 0) {
              lVar16 = param_1[7] + 0x28;
            }
            thunk_FUN_0c6e689c(lVar16);
            return;
          }
          if (iVar4 == 0x985e) {
            local_5c0 = "Accel_Focus_Bookmarks";
            FUN_01aee76c(&local_5c0);
            lVar16 = 0;
            if (param_1[7] != 0) {
              lVar16 = param_1[7] + 0x28;
            }
            thunk_FUN_0c6e67c4(lVar16);
            return;
          }
          if (iVar4 == 0x985f) {
            lVar16 = 0;
            if (param_1[7] != 0) {
              lVar16 = param_1[7] + 0x28;
            }
            thunk_FUN_0c6e6808(lVar16);
            return;
          }
        }
      }
      goto switchD_0456189c_caseD_9c41;
    }
    switch(iVar4) {
    case 40000:
      FUN_07bb1288(*(undefined8 *)(*(long *)(param_1[7] + 0x1a0) + 0x78));
      return;
    case 0x9c41:
    case 0x9c43:
    case 0x9c48:
    case 0x9c5a:
    case 0x9c5b:
      goto switchD_0456189c_caseD_9c41;
    case 0x9c42:
      local_5c0 = "CreateShortcut";
      FUN_01aee76c(&local_5c0);
      FUN_07fe9b3c(param_1[7]);
      return;
    case 0x9c44:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      local_5d0[0] = 0;
      puVar21 = local_5d0;
      local_5c8 = 0;
      uVar6 = 1;
      break;
    case 0x9c45:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      local_5e0[0] = 1;
      puVar21 = local_5e0;
      local_5d8 = 0;
      uVar6 = 2;
      break;
    case 0x9c46:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      uVar6 = 0;
      goto LAB_045636f4;
    case 0x9c47:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      FUN_07da9fb8(lVar16);
      return;
    case 0x9c49:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      thunk_FUN_0c6e6ac0(lVar16);
      return;
    case 0x9c4a:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      FUN_07cac21c(lVar16);
      thunk_FUN_0c6eb650();
      return;
    case 0x9c4b:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      FUN_07cac21c(lVar16);
      thunk_FUN_0c6eb1e8();
      return;
    case 0x9c4c:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      FUN_07cac21c(lVar16);
      thunk_FUN_0c6eb700();
      return;
    case 0x9c4d:
      iVar4 = (int)*(undefined8 *)(param_1[7] + 0x68);
      FUN_0113e788();
      plVar10 = (long *)0x0;
      if (param_1[7] != 0) {
        plVar10 = (long *)(param_1[7] + 0x28);
      }
      FUN_07cac21c();
      if (iVar4 == 0) {
        thunk_FUN_0c6ec460(plVar10);
      }
      else {
        if (plVar10 == (long *)0x0) {
          plVar8 = (long *)0x0;
        }
        else {
          plVar8 = plVar10;
          FUN_00786858();
          if ((plVar8 == (long *)0x0) && (plVar8 = plVar10, FUN_0105e3d0(), plVar8 == (long *)0x0))
          {
            plVar8 = (long *)plVar10[10];
          }
        }
        (**(code **)(*plVar8 + 0x2d8))();
      }
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      plVar10 = *(long **)(lVar16 + 0x160);
      if (plVar10 != (long *)0x0) {
        do {
          while ((undefined **)plVar10[4] < (undefined **)0xe86de31) {
            if ((undefined **)plVar10[4] == &PTR_s_BrowserElements_kDataKeyImpl_0e86de30) {
              if (plVar10 != (long *)(lVar16 + 0x160)) {
                plVar10 = (long *)plVar10[5];
                if (((ulong)plVar10 & 0xfffffffc00000000) == DAT_0ebb2088) {
                  FUN_000142fc(plVar10);
                }
                goto LAB_045637f0;
              }
              goto LAB_045637ec;
            }
            plVar10 = (long *)plVar10[1];
            if (plVar10 == (long *)0x0) goto LAB_045637ec;
          }
          plVar10 = (long *)*plVar10;
        } while (plVar10 != (long *)0x0);
      }
LAB_045637ec:
      plVar10 = (long *)0x0;
LAB_045637f0:
      if (((ulong)plVar10 & 0xfffffffc00000000) == DAT_0ebb2088) {
        FUN_00022a3c(plVar10);
      }
      (**(code **)(*plVar10 + 0x28))();
      FUN_0188e850();
      FUN_090594c8();
      if (plVar10 == (long *)0x0) {
        return;
      }
      FUN_0188e850();
      FUN_02d66024();
      return;
    case 0x9c4e:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      thunk_FUN_0c6ec930(lVar16);
      return;
    case 0x9c4f:
      uVar20 = 0;
      if (param_1[7] != 0) {
        uVar20 = param_1[7] + 0x28;
      }
      FUN_07cac21c();
      uVar13 = uVar20;
      FUN_0456a318();
      if ((uVar13 & 1) != 0) {
        return;
      }
      thunk_FUN_0c6ebbc0(uVar20);
      return;
    case 0x9c50:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      FUN_07cac21c(lVar16);
      thunk_FUN_0c6ec9e0();
      return;
    case 0x9c51:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      FUN_07cac21c(lVar16);
      FUN_07735d14();
      return;
    case 0x9c52:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      FUN_07cac21c(lVar16);
      thunk_FUN_0c6ec97c();
      return;
    case 0x9c53:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      uVar6 = *(undefined8 *)(lVar16 + 0x40);
      uVar15 = 0;
      goto LAB_045638f4;
    case 0x9c54:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      uVar6 = *(undefined8 *)(lVar16 + 0x40);
      uVar15 = 1;
LAB_045638f4:
      thunk_FUN_0c6eb838(lVar16,uVar6,uVar15);
      return;
    case 0x9c55:
      local_5c0 = "Accel_Show_App_Menu";
      FUN_01aee76c(&local_5c0);
      lVar16 = param_1[7];
      if (lVar16 == 0) {
        plVar10 = (long *)0x0;
      }
      else {
        plVar10 = (long *)(lVar16 + 0x28);
        FUN_00786858();
        if (plVar10 == (long *)0x0) {
          plVar10 = (long *)(lVar16 + 0x28);
          FUN_0105e3d0();
          if (plVar10 == (long *)0x0) {
            plVar10 = *(long **)(lVar16 + 0x78);
          }
        }
      }
      UNRECOVERED_JUMPTABLE_00 = *(code **)(*plVar10 + 0x230);
      goto LAB_045624c0;
    case 0x9c56:
      goto switchD_0456189c_caseD_9c56;
    case 0x9c57:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      local_5f0[0] = 4;
      puVar21 = local_5f0;
      local_5e8 = 0;
      uVar6 = 4;
      break;
    case 0x9c58:
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      thunk_FUN_0c6e6d60(lVar16);
      return;
    case 0x9c59:
      lVar16 = *(long *)(*(long *)(param_1[7] + 0x1a0) + 0x390);
      if (lVar16 == 0) {
        uVar20 = 0;
      }
      else {
        plVar10 = *(long **)(lVar16 + 0x160);
        if (plVar10 != (long *)0x0) {
          do {
            while ((undefined **)plVar10[4] < (undefined **)0xe85d7d1) {
              if ((undefined **)plVar10[4] == &PTR_s_SidePanelUI_kDataKeyImpl_0e85d7d0) {
                if (plVar10 != (long *)(lVar16 + 0x160)) {
                  uVar20 = plVar10[5];
                  if ((uVar20 & 0xfffffffc00000000) == DAT_0ebb2088) {
                    FUN_000142fc(uVar20);
                  }
                  goto LAB_04563440;
                }
                goto LAB_0456343c;
              }
              plVar10 = (long *)plVar10[1];
              if (plVar10 == (long *)0x0) goto LAB_0456343c;
            }
            plVar10 = (long *)*plVar10;
          } while (plVar10 != (long *)0x0);
        }
LAB_0456343c:
        uVar20 = 0;
LAB_04563440:
        if ((uVar20 & 0xfffffffc00000000) == DAT_0ebb2088) {
          FUN_00022a3c(uVar20);
        }
      }
      uVar6 = 2;
      goto LAB_04563464;
    case 0x9c5c:
      FUN_05aabec0();
      return;
    default:
      if (iVar4 == 0x9cc6) {
        lVar16 = param_1[7];
        if (lVar16 == 0) {
          plVar10 = (long *)0x0;
        }
        else {
          plVar10 = (long *)(lVar16 + 0x28);
          FUN_00786858();
          if (plVar10 == (long *)0x0) {
            plVar10 = (long *)(lVar16 + 0x28);
            FUN_0105e3d0();
            if (plVar10 == (long *)0x0) {
              plVar10 = *(long **)(lVar16 + 0x78);
            }
          }
        }
        UNRECOVERED_JUMPTABLE_00 = *(code **)(*plVar10 + 0x278);
        goto LAB_045626d8;
      }
      if (iVar4 == 0x9861) {
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e68e4(lVar16);
        return;
      }
      goto switchD_0456189c_caseD_9c41;
    }
LAB_04563988:
    thunk_FUN_0c6e6930(lVar16,puVar21,uVar6);
    thunk_FUN_0c7f7d44(puVar21 + 2,0);
    return;
  }
  if (0xc750 < iVar4) {
    if (iVar4 < 0xcd1e) {
      if (iVar4 < 0xc753) {
        if (iVar4 == 0xc751) {
          local_5c0 = "WrenchMenu_Bookmarks_AlwaysHideBookmarkBar";
          FUN_01aee76c(&local_5c0);
          lVar16 = 0;
          if (param_1[7] != 0) {
            lVar16 = param_1[7] + 0x28;
          }
          (**(code **)(**(long **)(lVar16 + 0x40) + 0x168))();
        }
        else {
          if (iVar4 != 0xc752) goto switchD_0456189c_caseD_9c41;
          local_5c0 = "WrenchMenu_Bookmarks_AlwaysShowBookmarkBar";
          FUN_01aee76c(&local_5c0);
          lVar16 = 0;
          if (param_1[7] != 0) {
            lVar16 = param_1[7] + 0x28;
          }
          (**(code **)(**(long **)(lVar16 + 0x40) + 0x168))();
        }
      }
      else {
        if (iVar4 != 0xc753) {
          if (iVar4 == 0xcd14) {
            lVar16 = param_1[7];
            if (lVar16 == 0) {
              plVar10 = (long *)0x0;
            }
            else {
              plVar10 = (long *)(lVar16 + 0x28);
              FUN_00786858();
              if (plVar10 == (long *)0x0) {
                plVar10 = (long *)(lVar16 + 0x28);
                FUN_0105e3d0();
                if (plVar10 == (long *)0x0) {
                  plVar10 = *(long **)(lVar16 + 0x78);
                }
              }
            }
            UNRECOVERED_JUMPTABLE_00 = *(code **)(*plVar10 + 0x2c8);
          }
          else {
            if (iVar4 != 0xcd15) goto switchD_0456189c_caseD_9c41;
            lVar16 = param_1[7];
            if (lVar16 == 0) {
              plVar10 = (long *)0x0;
            }
            else {
              plVar10 = (long *)(lVar16 + 0x28);
              FUN_00786858();
              if (plVar10 == (long *)0x0) {
                plVar10 = (long *)(lVar16 + 0x28);
                FUN_0105e3d0();
                if (plVar10 == (long *)0x0) {
                  plVar10 = *(long **)(lVar16 + 0x78);
                }
              }
            }
            UNRECOVERED_JUMPTABLE_00 = *(code **)(*plVar10 + 0x2d0);
          }
          goto LAB_04561c20;
        }
        local_5c0 = "WrenchMenu_Bookmarks_OnlyShowBookmarkBarOnNtp";
        FUN_01aee76c(&local_5c0);
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        (**(code **)(**(long **)(lVar16 + 0x40) + 0x168))();
      }
      FUN_02e81234();
      return;
    }
    if (iVar4 < 0xd034) {
      if (iVar4 - 0xcd1eU < 5) {
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c73c0a4(param_2,lVar16);
        return;
      }
    }
    else {
      if (iVar4 == 0xd048) {
        plVar8 = *(long **)(param_1[7] + 0x68);
        (**(code **)(*plVar8 + 0x168))();
        plVar10 = plVar8;
        FUN_00306500();
        local_5c0 = (char *)(CONCAT71(local_5c0._1_7_,(char)plVar10) ^ 1);
        local_5a8 = 1;
        FUN_015098a8(plVar8,s_glic_pinned_to_tabstrip_0cee621e,0x17,&local_5c0);
        FUN_0161e7d4(&local_5c0);
        return;
      }
      if (iVar4 == 0xd034) {
        plVar10 = param_1;
        FUN_07252d08();
        pcVar11 = segment_command_00000020.segname;
        FUN_0000f368();
        pcVar11[0] = '\x01';
        pcVar11[1] = '\0';
        pcVar11[2] = '\0';
        pcVar11[3] = '\0';
        *(code **)(pcVar11 + 8) = CrashpadHTTPBodyStreamTransport::removeFromRunLoop_forMode_;
        *(code **)(pcVar11 + 0x10) = FUN_0359f680;
        *(code **)(pcVar11 + 0x18) = FUN_0255db00;
        FUN_0726ed24(plVar10,pcVar11);
        if (plVar10 != (long *)0x0) {
          LOAcquire();
          iVar4 = (int)plVar10[1];
          *(int *)(plVar10 + 1) = iVar4 + -1;
          LORelease();
          if (iVar4 == 1) {
            (**(code **)(*plVar10 + 8))(plVar10);
          }
        }
        puVar9 = *(undefined1 **)(param_1[7] + 0x68);
        FUN_07e7d04c();
        FUN_02bf8370();
        if (*(long **)(puVar9 + 8) != (long *)0x0) {
          (**(code **)(**(long **)(puVar9 + 8) + 0x40))();
          plVar10 = *(long **)(puVar9 + 8);
          *(undefined8 *)(puVar9 + 8) = 0;
          if (plVar10 != (long *)0x0) {
            (**(code **)(*plVar10 + 8))();
          }
        }
        *puVar9 = 0;
        return;
      }
      if (iVar4 == 0xd049) {
        lVar16 = 0;
        if (param_1[7] != 0) {
          lVar16 = param_1[7] + 0x28;
        }
        thunk_FUN_0c6e6444(lVar16);
        return;
      }
    }
    goto switchD_0456189c_caseD_9c41;
  }
  switch(iVar4) {
  case 0x9d2c:
    lVar16 = 0;
    if (param_1[7] != 0) {
      lVar16 = param_1[7] + 0x28;
    }
    thunk_FUN_0c6e6e60(lVar16);
    return;
  case 0x9d2d:
    lVar16 = 0;
    if (param_1[7] != 0) {
      lVar16 = param_1[7] + 0x28;
    }
    local_600[0] = 5;
    local_5f8 = 0;
    uVar6 = 5;
    goto LAB_04563988;
  case 0x9d2e:
  case 0x9d2f:
  case 0x9d30:
  case 0x9d31:
  case 0x9d32:
  case 0x9d33:
  case 0x9d34:
  case 0x9d35:
  case 0x9d36:
  case 0x9d37:
  case 0x9d38:
  case 0x9d39:
  case 0x9d3b:
  case 0x9d40:
  case 0x9d41:
  case 0x9d42:
  case 0x9d45:
  case 0x9d46:
  case 0x9d49:
  case 0x9d4b:
  case 0x9d4e:
  case 0x9d53:
  case 0x9d56:
  case 0x9d61:
  case 0x9d62:
  case 0x9d63:
  case 0x9d64:
  case 0x9d65:
  case 0x9d6c:
  case 0x9d6d:
  case 0x9d6e:
    goto switchD_0456189c_caseD_9c41;
  case 0x9d3a:
    thunk_FUN_0c715288(param_1[7]);
    return;
  case 0x9d3c:
    lVar16 = 0;
    if (param_1[7] != 0) {
      lVar16 = param_1[7] + 0x28;
    }
    thunk_FUN_0c6ebac4(lVar16);
    return;
  case 0x9d3d:
    lVar16 = *(long *)(*(long *)(param_1[7] + 0x88) + 0x90);
    if (lVar16 == 0) {
      lVar16 = 0;
    }
    else {
      lVar16 = *(long *)(lVar16 + 0x40);
    }
    iVar4 = 0xecdc348;
    FUN_00119280();
    if (iVar4 != 0) {
      uVar20 = *(ulong *)(param_1[7] + 0x68);
      FUN_00bfb750(uVar20,lVar16);
      if ((uVar20 & 1) == 0) {
LAB_045627f4:
        thunk_FUN_0c84158c(lVar16);
        return;
      }
    }
    thunk_FUN_0c715304(param_1[7]);
    return;
  case 0x9d3e:
    local_5c0 = "InstallWebAppFromMenu";
    FUN_01aee76c(&local_5c0);
    lVar16 = 0;
    if (param_1[7] != 0) {
      lVar16 = param_1[7] + 0x28;
    }
    FUN_07c749a0(lVar16,1);
    break;
  case 0x9d3f:
    lVar19 = param_1[7];
    lVar16 = 0;
    if (lVar19 != 0) {
      lVar16 = lVar19 + 0x28;
    }
    FUN_0787afa0(&local_5c0,*(undefined8 *)(lVar19 + 0x68));
    thunk_FUN_0c6eec38(lVar16,&local_5c0);
    FUN_00027cb8(auStack_550,0);
    FUN_00027c78(local_5a0);
    goto LAB_04562f84;
  case 0x9d43:
    lVar16 = 0;
    if (param_1[7] != 0) {
      lVar16 = param_1[7] + 0x28;
    }
    thunk_FUN_0c6e6b3c(lVar16);
    return;
  case 0x9d44:
    lVar16 = 0;
    if (param_1[7] != 0) {
      lVar16 = param_1[7] + 0x28;
    }
    thunk_FUN_0c6e7494(lVar16);
    return;
  case 0x9d47:
                    /* WARNING: Does not return */
    UNRECOVERED_JUMPTABLE_00 = (code *)SoftwareBreakpoint(0,0x4564690);
    (*UNRECOVERED_JUMPTABLE_00)();
  case 0x9d48:
                    /* WARNING: Does not return */
    UNRECOVERED_JUMPTABLE_00 = (code *)SoftwareBreakpoint(0,0x456463c);
    (*UNRECOVERED_JUMPTABLE_00)();
  case 0x9d4a:
    lVar16 = 0;
    if (param_1[7] != 0) {
      lVar16 = param_1[7] + 0x28;
    }
    FUN_07cac21c(lVar16);
    goto LAB_04563114;
  case 0x9d4c:
  case 0x9d59:
switchD_0456189c_caseD_9c56:
    lVar16 = 0;
    if (param_1[7] != 0) {
      lVar16 = param_1[7] + 0x28;
    }
    FUN_07cac21c(lVar16);
    local_5c0 = (char *)0x0;
    local_5b8 = 0;
    uStack_5b0 = 0;
    thunk_FUN_0c6eb7b4();
LAB_04562f84:
    if ((long)uStack_5b0 < 0) {
      FUN_00008eb8(local_5c0,uStack_5b0 & 0x7fffffffffffffff);
    }
    break;
  case 0x9d4d:
  case 0x9d67:
    lVar16 = 0;
    if (param_1[7] != 0) {
      lVar16 = param_1[7] + 0x28;
    }
    thunk_FUN_0c6eca50(lVar16,"ext_app_menu",0xc);
    return;
  case 0x9d4f:
    lVar16 = 0;
    if (param_1[7] != 0) {
      lVar16 = param_1[7] + 0x28;
    }
    thunk_FUN_0c6e5788(lVar16);
    return;
  case 0x9d50:
    lVar16 = *(long *)(*(long *)(param_1[7] + 0x1a0) + 0x390);
    if (lVar16 == 0) {
      uVar20 = 0;
    }
    else {
      plVar10 = *(long **)(lVar16 + 0x160);
      if (plVar10 != (long *)0x0) {
        do {
          while ((undefined **)plVar10[4] < (undefined **)0xe85d7d1) {
            if ((undefined **)plVar10[4] == &PTR_s_SidePanelUI_kDataKeyImpl_0e85d7d0) {
              if (plVar10 != (long *)(lVar16 + 0x160)) {
                uVar20 = plVar10[5];
                if ((uVar20 & 0xfffffffc00000000) == DAT_0ebb2088) {
                  FUN_000142fc(uVar20);
                }
                goto LAB_04563500;
              }
              goto LAB_045634fc;
            }
            plVar10 = (long *)plVar10[1];
            if (plVar10 == (long *)0x0) goto LAB_045634fc;
          }
          plVar10 = (long *)*plVar10;
        } while (plVar10 != (long *)0x0);
      }
LAB_045634fc:
      uVar20 = 0;
LAB_04563500:
      if ((uVar20 & 0xfffffffc00000000) == DAT_0ebb2088) {
        FUN_00022a3c(uVar20);
      }
    }
    uVar6 = 0;
    goto LAB_04563464;
  case 0x9d51:
    lVar16 = 0;
    if (param_1[7] != 0) {
      lVar16 = param_1[7] + 0x28;
    }
    FUN_07825e58(lVar16,0);
    return;
  case 0x9d52:
    lVar16 = *(long *)(*(long *)(param_1[7] + 0x1a0) + 0x390);
    if (lVar16 == 0) {
      uVar20 = 0;
    }
    else {
      plVar10 = *(long **)(lVar16 + 0x160);
      if (plVar10 != (long *)0x0) {
        do {
          while ((undefined **)plVar10[4] < (undefined **)0xe85d7d1) {
            if ((undefined **)plVar10[4] == &PTR_s_SidePanelUI_kDataKeyImpl_0e85d7d0) {
              if (plVar10 != (long *)(lVar16 + 0x160)) {
                uVar20 = plVar10[5];
                if ((uVar20 & 0xfffffffc00000000) == DAT_0ebb2088) {
                  FUN_000142fc(uVar20);
                }
                goto LAB_0456332c;
              }
              goto LAB_04563328;
            }
            plVar10 = (long *)plVar10[1];
            if (plVar10 == (long *)0x0) goto LAB_04563328;
          }
          plVar10 = (long *)*plVar10;
        } while (plVar10 != (long *)0x0);
      }
LAB_04563328:
      uVar20 = 0;
LAB_0456332c:
      if ((uVar20 & 0xfffffffc00000000) == DAT_0ebb2088) {
        FUN_00022a3c(uVar20);
      }
    }
    uVar6 = 1;
    goto LAB_04563464;
  case 0x9d54:
    lVar16 = param_1[7];
    if (lVar16 == 0) {
      plVar10 = (long *)0x0;
    }
    else {
      plVar10 = (long *)(lVar16 + 0x28);
      FUN_00786858();
      if (plVar10 == (long *)0x0) {
        plVar10 = (long *)(lVar16 + 0x28);
        FUN_0105e3d0();
        if (plVar10 == (long *)0x0) {
          plVar10 = *(long **)(lVar16 + 0x78);
        }
      }
    }
    UNRECOVERED_JUMPTABLE_00 = *(code **)(*plVar10 + 0x300);
LAB_04561c20:
                    /* WARNING: Could not recover jumptable at 0x04561c34. Too many branches */
                    /* WARNING: Treating indirect jump as call */
    (*UNRECOVERED_JUMPTABLE_00)();
    return;
  case 0x9d55:
    lVar16 = 0;
    if (param_1[7] != 0) {
      lVar16 = param_1[7] + 0x28;
    }
    FUN_07cac21c(lVar16);
    goto LAB_04563114;
  case 0x9d57:
    lVar16 = 0;
    if (param_1[7] != 0) {
      lVar16 = param_1[7] + 0x28;
    }
    FUN_07cac21c(lVar16);
LAB_04563114:
    thunk_FUN_0c6ebc08();
    return;
  case 0x9d58:
    lVar16 = 0;
    if (param_1[7] != 0) {
      lVar16 = param_1[7] + 0x28;
    }
    thunk_FUN_0c6ec748(lVar16);
    return;
  case 0x9d5a:
    lVar16 = 0;
    if (param_1[7] != 0) {
      lVar16 = param_1[7] + 0x28;
    }
    thunk_FUN_0c6e6ba4(lVar16);
    return;
  case 0x9d5b:
    puVar9 = &DAT_100000001;
    goto LAB_045638a8;
  case 0x9d5c:
    puVar9 = &DAT_100000005;
LAB_045638a8:
    thunk_FUN_0c6e2278(param_1,0xd,puVar9);
    return;
  case 0x9d5d:
    lVar16 = 0;
    if (param_1[7] != 0) {
      lVar16 = param_1[7] + 0x28;
    }
    uVar6 = 2;
    goto LAB_045636f4;
  case 0x9d5e:
    lVar16 = 0;
    if (param_1[7] != 0) {
      lVar16 = param_1[7] + 0x28;
    }
    uVar6 = 3;
    goto LAB_045636f4;
  case 0x9d5f:
    lVar16 = 0;
    if (param_1[7] != 0) {
      lVar16 = param_1[7] + 0x28;
    }
    uVar6 = 1;
    goto LAB_045636f4;
  case 0x9d60:
    lVar16 = 0;
    if (param_1[7] != 0) {
      lVar16 = param_1[7] + 0x28;
    }
    uVar6 = 4;
LAB_045636f4:
    thunk_FUN_0c6e69a0(lVar16,uVar6);
    return;
  case 0x9d66:
    lVar16 = *(long *)(param_1[7] + 0x68);
    FUN_01cdccb4(lVar16,0);
    if (lVar16 != 0) {
      FUN_01cdccb4(*(undefined8 *)(param_1[7] + 0x68),0);
      FUN_07971980();
      return;
    }
    break;
  case 0x9d68:
    lVar16 = 0;
    if (param_1[7] != 0) {
      lVar16 = param_1[7] + 0x28;
    }
    thunk_FUN_0c6e6c8c(lVar16);
    return;
  case 0x9d69:
    lVar16 = *(long *)(*(long *)(param_1[7] + 0x1a0) + 0x390);
    if (lVar16 == 0) {
      uVar20 = 0;
    }
    else {
      plVar10 = *(long **)(lVar16 + 0x160);
      if (plVar10 != (long *)0x0) {
        do {
          while ((undefined **)plVar10[4] < (undefined **)0xe85d7d1) {
            if ((undefined **)plVar10[4] == &PTR_s_SidePanelUI_kDataKeyImpl_0e85d7d0) {
              if (plVar10 != (long *)(lVar16 + 0x160)) {
                uVar20 = plVar10[5];
                if ((uVar20 & 0xfffffffc00000000) == DAT_0ebb2088) {
                  FUN_000142fc(uVar20);
                }
                goto LAB_045633cc;
              }
              goto LAB_045633c8;
            }
            plVar10 = (long *)plVar10[1];
            if (plVar10 == (long *)0x0) goto LAB_045633c8;
          }
          plVar10 = (long *)*plVar10;
        } while (plVar10 != (long *)0x0);
      }
LAB_045633c8:
      uVar20 = 0;
LAB_045633cc:
      if ((uVar20 & 0xfffffffc00000000) == DAT_0ebb2088) {
        FUN_00022a3c(uVar20);
      }
    }
    uVar6 = 0x11;
    goto LAB_04563464;
  case 0x9d6a:
    lVar16 = 0;
    if (param_1[7] != 0) {
      lVar16 = param_1[7] + 0x28;
    }
    FUN_07cac21c(lVar16);
    thunk_FUN_0c6eb690();
    return;
  case 0x9d6b:
    lVar16 = 0;
    if (param_1[7] != 0) {
      lVar16 = param_1[7] + 0x28;
    }
    thunk_FUN_0c6e6c18(lVar16);
    return;
  case 0x9d6f:
    lVar16 = 0;
    if (param_1[7] != 0) {
      lVar16 = param_1[7] + 0x28;
    }
    FUN_07825d70(lVar16,7);
    return;
  case 0x9d70:
    lVar16 = *(long *)(*(long *)(param_1[7] + 0x1a0) + 0x390);
    if (lVar16 == 0) {
      uVar20 = 0;
    }
    else {
      plVar10 = *(long **)(lVar16 + 0x160);
      if (plVar10 != (long *)0x0) {
        do {
          while ((undefined **)plVar10[4] < (undefined **)0xe85d7d1) {
            if ((undefined **)plVar10[4] == &PTR_s_SidePanelUI_kDataKeyImpl_0e85d7d0) {
              if (plVar10 != (long *)(lVar16 + 0x160)) {
                uVar20 = plVar10[5];
                if ((uVar20 & 0xfffffffc00000000) == DAT_0ebb2088) {
                  FUN_000142fc(uVar20);
                }
                goto LAB_0456328c;
              }
              goto LAB_04563288;
            }
            plVar10 = (long *)plVar10[1];
            if (plVar10 == (long *)0x0) goto LAB_04563288;
          }
          plVar10 = (long *)*plVar10;
        } while (plVar10 != (long *)0x0);
      }
LAB_04563288:
      uVar20 = 0;
LAB_0456328c:
      if ((uVar20 & 0xfffffffc00000000) == DAT_0ebb2088) {
        FUN_00022a3c(uVar20);
      }
    }
    uVar6 = 0x14;
LAB_04563464:
    FUN_076e9ac0(uVar20,uVar6,&DAT_10000000d,0);
    return;
  case 0x9d71:
    iVar4 = 0xebaa468;
    FUN_00119280();
    if (iVar4 != 0) {
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      thunk_FUN_0c6eb980(lVar16);
      return;
    }
    break;
  case 0x9d72:
    plVar10 = *(long **)(param_1[7] + 0x188);
    if (plVar10 != (long *)0x0) {
      do {
        while ((undefined **)plVar10[4] < (undefined **)0xe895061) {
          if ((undefined **)plVar10[4] == &PTR_s_ExtensionsContainer_kDataKeyImp_0e895060) {
            if (plVar10 != (long *)(param_1[7] + 0x188)) {
              plVar10 = (long *)plVar10[5];
              if (((ulong)plVar10 & 0xfffffffc00000000) == DAT_0ebb2088) {
                FUN_000142fc(plVar10);
              }
              goto LAB_04561c7c;
            }
            goto LAB_04561c78;
          }
          plVar10 = (long *)plVar10[1];
          if (plVar10 == (long *)0x0) goto LAB_04561c78;
        }
        plVar10 = (long *)*plVar10;
      } while (plVar10 != (long *)0x0);
    }
LAB_04561c78:
    plVar10 = (long *)0x0;
LAB_04561c7c:
    if (((ulong)plVar10 & 0xfffffffc00000000) == DAT_0ebb2088) {
      FUN_00022a3c(plVar10);
    }
    if (plVar10 != (long *)0x0) {
      UNRECOVERED_JUMPTABLE_00 = *(code **)(*plVar10 + 0x20);
      goto LAB_04561c20;
    }
    break;
  default:
    if (iVar4 == 0xc411) {
      lVar16 = 0;
      if (param_1[7] != 0) {
        lVar16 = param_1[7] + 0x28;
      }
      thunk_FUN_0c6e75bc(lVar16);
      return;
    }
    goto switchD_0456189c_caseD_9c41;
  }
  return;
switchD_0456189c_caseD_9c41:
  if (1 < DAT_0ef080b0) {
    return;
  }
  if ((DAT_0ebb1b88 == 0) && (DAT_0ef080b8 == 0)) {
    return;
  }
  FUN_0060914c(&local_5c0,"../../chrome/browser/ui/browser_command_controller.cc",0x652,1);
  FUN_000254bc(&uStack_5b0,"Received Unimplemented Command: ",0x20);
  FUN_001367a0();
  FUN_00609080(&local_5c0);
  return;
}


