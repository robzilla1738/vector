// func FUN_04258618 @ 04258618 size 1572

/* WARNING: Removing unreachable block (ram,0x04258730) */
/* WARNING: Removing unreachable block (ram,0x0425880c) */

void FUN_04258618(long param_1,long *param_2)

{
  code *pcVar1;
  int iVar2;
  dword *pdVar3;
  long *plVar4;
  undefined8 ******ppppppuVar5;
  undefined4 *puVar6;
  qword *pqVar7;
  char *pcVar8;
  long lVar9;
  long lVar10;
  long lVar11;
  int *piVar12;
  long lVar13;
  int *piVar14;
  long lVar15;
  long lVar16;
  undefined8 uVar17;
  long local_1f8;
  long lStack_1f0;
  long local_1e8;
  long local_1e0;
  long local_1d8;
  long local_1d0;
  undefined8 *****local_1c8;
  long lStack_1c0;
  undefined7 local_1b8;
  char cStack_1b1;
  undefined4 local_1b0;
  undefined4 uStack_1ac;
  undefined4 uStack_1a8;
  undefined4 uStack_1a4;
  undefined4 uStack_1a0;
  int iStack_19c;
  undefined4 uStack_198;
  undefined4 local_194;
  undefined8 *****local_80;
  long lStack_78;
  char cStack_69;
  
  if ((param_2 == (long *)0x0) || (*(long *)(param_1 + 0x68) == 0)) {
    FUN_04253b3c(param_1);
    return;
  }
  pdVar3 = &MACH_HEADER.flags;
  FUN_0000f368();
  pdVar3[2] = 0;
  *(undefined ***)pdVar3 = &PTR_FUN_0e1b0438;
  if (((ulong)param_2 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_2);
  }
  *(long **)(pdVar3 + 4) = param_2;
  if ((pdVar3 != (dword *)0x0) && (iVar2 = pdVar3[2], pdVar3[2] = iVar2 + 1, iVar2 == 0x7fffffff)) {
                    /* WARNING: Does not return */
    pcVar1 = (code *)SoftwareBreakpoint(0,0x4258b84);
    (*pcVar1)();
  }
  if (*(long *)(*(long *)(param_1 + 0x68) + 0xa0) != 0) {
    plVar4 = param_2;
    FUN_00bfb87c();
    if (*(char *)((long)plVar4 + 0x21) == '\0') {
      if ((DAT_0ef080b0 < 2) && ((DAT_0ebb1b88 != 0 || (DAT_0ef080b8 != 0)))) {
        FUN_0060914c(&local_1b0,
                     "../../chrome/browser/ui/webui/aside_importer/chromium_profile_migrator.cc",
                     0x914,1);
        puVar6 = &uStack_1a0;
        FUN_000254bc(puVar6,"Bookmark model was not loaded. Skipping ",0x28);
        FUN_0425fe90(&local_1c8,*(undefined4 *)(param_1 + 0x18));
        ppppppuVar5 = (undefined8 ******)local_1c8;
        if (-1 < (long)cStack_1b1) {
          ppppppuVar5 = &local_1c8;
        }
        if (-1 < cStack_1b1) {
          lStack_1c0 = (long)cStack_1b1;
        }
        FUN_00fa2d08(&local_80,ppppppuVar5,lStack_1c0);
        if (-1 < (long)cStack_69) {
          local_80 = &local_80;
        }
        if (-1 < cStack_69) {
          lStack_78 = (long)cStack_69;
        }
        FUN_000254bc(puVar6,local_80,lStack_78);
        FUN_000254bc();
        if (cStack_1b1 < '\0') {
          FUN_00008eb8(local_1c8,CONCAT17(cStack_1b1,local_1b8) << 1);
        }
        FUN_00609080(&local_1b0);
      }
    }
    else {
      lVar11 = *(long *)(param_1 + 0x68);
      FUN_0425fe90(&local_80,*(undefined4 *)(param_1 + 0x18));
      ppppppuVar5 = &local_80;
      FUN_018a532c(ppppppuVar5,0,L"Imported from ",0xe);
      uStack_1a8 = SUB84(ppppppuVar5[1],0);
      uStack_1a4 = (undefined4)((ulong)ppppppuVar5[1] >> 0x20);
      local_1b0 = SUB84(*ppppppuVar5,0);
      uStack_1ac = (undefined4)((ulong)*ppppppuVar5 >> 0x20);
      uStack_1a0 = SUB84(ppppppuVar5[2],0);
      iStack_19c = (int)((ulong)ppppppuVar5[2] >> 0x20);
      ppppppuVar5[1] = (undefined8 *****)0x0;
      ppppppuVar5[2] = (undefined8 *****)0x0;
      *ppppppuVar5 = (undefined8 *****)0x0;
      FUN_041076f0(pdVar3,lVar11 + 0x98,&local_1b0);
      if (iStack_19c < 0) {
        FUN_00008eb8(CONCAT44(uStack_1ac,local_1b0),CONCAT44(iStack_19c,uStack_1a0) << 1);
      }
    }
  }
  lVar11 = *(long *)(param_1 + 0x68);
  if (*(long *)(lVar11 + 0x88) != 0) {
    FUN_07822c94(pdVar3,lVar11 + 0x80,1);
    lVar11 = *(long *)(param_1 + 0x68);
  }
  if ((*(long *)(lVar11 + 0x58) == 0) || (plVar4 = param_2, FUN_011aa148(), plVar4 == (long *)0x0))
  {
    *(undefined1 *)(param_1 + 0x11) = 1;
    FUN_04258c80(param_1);
  }
  else {
    local_194 = 1;
    local_1b0 = 0;
    uStack_1ac = 2;
    uStack_1a8 = 2;
    uStack_1a4 = 0;
    uStack_1a0 = 0;
    iStack_19c = 0;
    uStack_198 = 0;
    piVar14 = *(int **)(*(long *)(param_1 + 0x68) + 0x58);
    piVar12 = *(int **)(param_1 + 0x80);
    if ((piVar12 != (int *)0x0) && (iVar2 = *piVar12, *piVar12 = iVar2 + 1, iVar2 == 0x7fffffff)) {
                    /* WARNING: Does not return */
      pcVar1 = (code *)SoftwareBreakpoint(0,0x4258b90);
      (*pcVar1)();
    }
    uVar17 = *(undefined8 *)(param_1 + 0x88);
    pqVar7 = &segment_command_00000020.vmsize;
    FUN_0000f368();
    *(undefined4 *)pqVar7 = 1;
    pqVar7[1] = (qword)&LAB_03f6e8c0;
    pqVar7[2] = (qword)FUN_03f6cac0;
    pqVar7[3] = (qword)&LAB_040ae6c0;
    pqVar7[4] = (qword)&LAB_04258c60;
    pqVar7[5] = 0;
    pqVar7[6] = (qword)piVar12;
    pqVar7[7] = uVar17;
    FUN_01dcdef8(piVar14,pqVar7);
    FUN_02aa37a0();
    if (plVar4 == (long *)0x0) {
      *(undefined1 *)(param_1 + 0x11) = 1;
      FUN_04258c80(param_1);
    }
    else {
      lVar11 = *(long *)(*(long *)(param_1 + 0x68) + 0x58) * 0x1a8;
      if (lVar11 != 0) {
        lVar16 = *(long *)(*(long *)(param_1 + 0x68) + 0x50);
        lVar11 = lVar16 + lVar11;
        do {
          pcVar8 = segment_command_00000020.segname + 8;
          FUN_0000f368();
          pcVar8[0] = '\x01';
          pcVar8[1] = '\0';
          pcVar8[2] = '\0';
          pcVar8[3] = '\0';
          *(code **)(pcVar8 + 8) = FUN_0425f838;
          *(code **)(pcVar8 + 0x10) = FUN_03f72940;
          *(code **)(pcVar8 + 0x18) = FUN_0255db00;
          *(int **)(pcVar8 + 0x28) = piVar14;
          if (piVar14 != (int *)0x0) {
            iVar2 = *piVar14;
            *piVar14 = iVar2 + 1;
            if (iVar2 < 1) {
                    /* WARNING: Does not return */
              pcVar1 = (code *)SoftwareBreakpoint(0,0x4258b6c);
              (*pcVar1)();
            }
            if (iVar2 == 0x7fffffff) {
                    /* WARNING: Does not return */
              pcVar1 = (code *)SoftwareBreakpoint(0,0x4258b78);
              (*pcVar1)();
            }
          }
          (**(code **)(*plVar4 + 0x28))(plVar4,lVar16,lVar16 + 0x130,&local_1b0,pcVar8);
          lVar16 = lVar16 + 0x1a8;
        } while (lVar16 != lVar11);
      }
    }
    if (piVar14 != (int *)0x0) {
      LOAcquire();
      iVar2 = *piVar14;
      *piVar14 = iVar2 + -1;
      LORelease();
      if (iVar2 == 1) {
        (**(code **)(piVar14 + 4))(piVar14);
      }
    }
  }
  if ((*(long *)(*(long *)(param_1 + 0x68) + 0x70) == 0) ||
     (FUN_02f80b1c(param_2,0), param_2 == (long *)0x0)) {
    *(undefined1 *)(param_1 + 0x12) = 1;
    FUN_04258c80(param_1);
  }
  else {
    lVar10 = *(long *)(param_1 + 0x68);
    lVar16 = *(long *)(lVar10 + 0x68);
    lVar11 = *(long *)(lVar10 + 0x70);
    lVar15 = *(long *)(lVar10 + 0x78);
    *(undefined8 *)(lVar10 + 0x68) = 0;
    *(undefined8 *)(lVar10 + 0x70) = 0;
    *(undefined8 *)(lVar10 + 0x78) = 0;
    local_1f8 = lVar16;
    lStack_1f0 = lVar11;
    local_1e8 = lVar15;
    FUN_06d6c5dc(&local_1e0,&local_1f8);
    piVar14 = *(int **)(param_1 + 0x80);
    if ((piVar14 != (int *)0x0) && (iVar2 = *piVar14, *piVar14 = iVar2 + 1, iVar2 == 0x7fffffff)) {
                    /* WARNING: Does not return */
      pcVar1 = (code *)SoftwareBreakpoint(0,0x4258be0);
      (*pcVar1)();
    }
    uVar17 = *(undefined8 *)(param_1 + 0x88);
    pqVar7 = &segment_command_00000020.vmsize;
    FUN_0000f368();
    *(undefined4 *)pqVar7 = 1;
    pqVar7[1] = (qword)&LAB_03f6e8c0;
    pqVar7[2] = (qword)FUN_03f6cac0;
    pqVar7[3] = (qword)&LAB_040ae6c0;
    pqVar7[4] = (qword)&LAB_04258c6c;
    pqVar7[5] = 0;
    pqVar7[6] = (qword)piVar14;
    pqVar7[7] = uVar17;
    FUN_06d72bbc(param_2,&local_1e0,pqVar7);
    lVar10 = local_1e0;
    if (local_1e0 != 0) {
      if (local_1d8 * 0x7c0 != 0) {
        lVar9 = local_1d8 * 0x7c0 + local_1e0;
        lVar13 = local_1d8 * -0x7c0;
        do {
          lVar9 = lVar9 + -0x7c0;
          if (lVar9 == 0) goto LAB_04258be4;
          FUN_06d6e064();
          lVar13 = lVar13 + 0x7c0;
        } while (lVar13 != 0);
      }
      local_1d8 = (lVar10 - local_1e0 >> 6) * -0x1084210842108421;
      FUN_00008eb8(local_1e0,local_1d0 * 0x7c0);
    }
    if (lVar16 != 0) {
      if (lVar11 * 0x830 != 0) {
        lVar10 = lVar11 * 0x830 + lVar16;
        lVar11 = lVar11 * -0x830;
        do {
          lVar10 = lVar10 + -0x830;
          if (lVar10 == 0) {
LAB_04258be4:
                    /* WARNING: Does not return */
            pcVar1 = (code *)SoftwareBreakpoint(1,0x4258be8);
            (*pcVar1)();
          }
          FUN_06d6931c();
          lVar11 = lVar11 + 0x830;
        } while (lVar11 != 0);
      }
      FUN_00008eb8(lVar16,lVar15 * 0x830);
    }
    LOAcquire();
    iVar2 = (int)param_2[1];
    *(int *)(param_2 + 1) = iVar2 + -1;
    LORelease();
    if (iVar2 == 1) {
      FUN_026e835c(param_2);
    }
  }
  if (pdVar3 != (dword *)0x0) {
    LOAcquire();
    iVar2 = pdVar3[2];
    pdVar3[2] = iVar2 + -1;
    LORelease();
    if (iVar2 == 1) {
      FUN_07823394(pdVar3);
    }
  }
  return;
}


