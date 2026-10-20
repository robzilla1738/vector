// func FUN_0415f2f4 @ 0415f2f4 size 900

void FUN_0415f2f4(long param_1,undefined8 *param_2)

{
  ulong uVar1;
  size_t sVar2;
  undefined8 *******pppppppuVar3;
  byte bVar4;
  byte bVar5;
  code *pcVar6;
  bool bVar7;
  int iVar8;
  long lVar9;
  long lVar10;
  long *plVar11;
  dword *pdVar12;
  undefined8 *puVar13;
  int *piVar14;
  undefined8 uVar15;
  undefined8 uVar16;
  char local_150 [8];
  char acStack_148 [8];
  undefined2 local_140;
  char local_13e [5];
  undefined1 local_139;
  undefined1 auStack_130 [88];
  undefined8 ******local_d8;
  size_t local_d0;
  undefined7 local_c8;
  byte bStack_c1;
  undefined8 local_c0;
  undefined8 uStack_b8;
  ulong local_b0;
  ulong uStack_a8;
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
  undefined8 local_50 [2];
  
  if ((undefined8 *)(param_1 + 0xa8) != param_2) {
    bVar4 = *(byte *)((long)param_2 + 0x17);
    if (*(char *)(param_1 + 0xbf) < '\0') {
      uVar1 = param_2[1];
      puVar13 = (undefined8 *)*param_2;
      if (-1 < (char)bVar4) {
        uVar1 = (ulong)bVar4;
        puVar13 = param_2;
      }
      FUN_004a8c00(param_1 + 0xa8,puVar13,uVar1);
    }
    else if ((char)bVar4 < '\0') {
      FUN_004a8ab4(param_1 + 0xa8,*param_2,param_2[1]);
    }
    else {
      uVar16 = param_2[1];
      uVar15 = *param_2;
      *(undefined8 *)(param_1 + 0xb8) = param_2[2];
      *(undefined8 *)(param_1 + 0xb0) = uVar16;
      *(undefined8 *)(param_1 + 0xa8) = uVar15;
    }
  }
  lVar9 = *(long *)(param_1 + 0x30);
  if (lVar9 == 0) {
    return;
  }
  FUN_01a1fd00(lVar9,param_1 + 0x38);
  if (lVar9 == 0) {
    return;
  }
  if (*(char *)((long)param_2 + 0x17) < '\0') {
    if (param_2[1] == 0) goto LAB_0415f418;
    puVar13 = (undefined8 *)*param_2;
  }
  else {
    puVar13 = param_2;
    if (*(char *)((long)param_2 + 0x17) == '\0') {
LAB_0415f418:
      FUN_0415f828(param_1);
      return;
    }
  }
  local_50[0] = 0;
  uStack_58 = 0;
  uStack_60 = 0;
  uStack_68 = 0;
  local_70 = 0;
  uStack_78 = 0;
  uStack_80 = 0;
  uStack_88 = 0;
  local_90 = 0;
  uStack_98 = 0;
  uStack_a0 = 0;
  uStack_a8 = 0;
  local_b0 = 0;
  uStack_b8 = 0;
  local_c0 = 0;
  FUN_003701d4(&local_c0,puVar13);
  if ((uStack_a8 & 1) == 0) {
    FUN_0415f828(param_1);
    goto LAB_0415f398;
  }
  FUN_07accc80(lVar9,1);
  FUN_01a213b4(&local_d8,lVar9,"last_downloaded_gaia_picture_url_with_size");
  bVar4 = bStack_c1;
  if (-1 < (char)bStack_c1) {
    local_d0 = (ulong)bStack_c1;
  }
  bVar5 = *(byte *)((long)param_2 + 0x17);
  sVar2 = param_2[1];
  if (-1 < (char)bVar5) {
    sVar2 = (ulong)bVar5;
  }
  if (local_d0 == sVar2) {
    pppppppuVar3 = (undefined8 *******)local_d8;
    if (-1 < (char)bStack_c1) {
      pppppppuVar3 = &local_d8;
    }
    puVar13 = (void *)*param_2;
    if (-1 < (char)bVar5) {
      puVar13 = param_2;
    }
    iVar8 = _memcmp(pppppppuVar3,puVar13,local_d0);
    bVar7 = iVar8 == 0;
  }
  else {
    bVar7 = false;
  }
  if ((char)bVar4 < '\0') {
    FUN_00008eb8(local_d8,CONCAT17(bStack_c1,local_c8) & 0x7fffffffffffffff);
  }
  if (bVar7) {
    lVar10 = lVar9;
    FUN_02743740();
    if (lVar10 != 0) goto LAB_0415f398;
    lVar10 = lVar9 + 0x30;
    FUN_07ace234(*(long *)(lVar9 + 8) + 0x50);
    if (lVar10 == 0) goto LAB_0415f398;
  }
  plVar11 = *(long **)(param_1 + 0x28);
  if ((((plVar11 != (long *)0x0) && ((*(byte *)(plVar11 + 9) & 1) == 0)) && (DAT_0eee6cf8 != 0)) &&
     ((**(code **)(*plVar11 + 0x198))(), plVar11 != (long *)0x0)) {
    plVar11 = *(long **)(param_1 + 0x28);
    (**(code **)(*plVar11 + 0x198))();
    if (plVar11[6] != 0) {
      plVar11 = *(long **)(param_1 + 0x28);
      (**(code **)(*plVar11 + 0x198))();
      FUN_03204354();
      if ((plVar11 != (long *)0x0) && (lVar9 = plVar11[2], lVar9 != 0)) {
        piVar14 = *(int **)(param_1 + 0xc0);
        if ((piVar14 != (int *)0x0) && (iVar8 = *piVar14, *piVar14 = iVar8 + 1, iVar8 == 0x7fffffff)
           ) {
                    /* WARNING: Does not return */
          pcVar6 = (code *)SoftwareBreakpoint(0,0x415f674);
          (*pcVar6)();
        }
        uVar15 = *(undefined8 *)(param_1 + 200);
        pdVar12 = &segment_command_00000020.maxprot;
        FUN_0000f368();
        *pdVar12 = 1;
        *(undefined1 **)(pdVar12 + 2) = &LAB_040a7838;
        *(code **)(pdVar12 + 4) = FUN_03faaa80;
        *(undefined1 **)(pdVar12 + 6) = &LAB_0406a280;
        *(undefined1 **)(pdVar12 + 8) = &LAB_0415fcfc;
        *(undefined8 *)(pdVar12 + 10) = 0;
        *(int **)(pdVar12 + 0xc) = piVar14;
        *(undefined8 *)(pdVar12 + 0xe) = uVar15;
        if (*(char *)((long)param_2 + 0x17) < '\0') {
          FUN_00018218(pdVar12 + 0x10,*param_2,param_2[1]);
        }
        else {
          uVar15 = *param_2;
          *(undefined8 *)(pdVar12 + 0x12) = param_2[1];
          *(undefined8 *)(pdVar12 + 0x10) = uVar15;
          *(undefined8 *)(pdVar12 + 0x14) = param_2[2];
        }
        local_139 = 0x12;
        if ("AsideProfileAvatar" < local_13e && local_150 < "sideProfileAvatar") {
                    /* WARNING: Does not return */
          pcVar6 = (code *)SoftwareBreakpoint(1,0x415f67c);
          (*pcVar6)();
        }
        local_140 = 0x7261;
        acStack_148[0] = s_AsideProfileAvatar_0cefbed8[8];
        acStack_148[1] = s_AsideProfileAvatar_0cefbed8[9];
        acStack_148[2] = s_AsideProfileAvatar_0cefbed8[10];
        acStack_148[3] = s_AsideProfileAvatar_0cefbed8[0xb];
        acStack_148[4] = s_AsideProfileAvatar_0cefbed8[0xc];
        acStack_148[5] = s_AsideProfileAvatar_0cefbed8[0xd];
        acStack_148[6] = s_AsideProfileAvatar_0cefbed8[0xe];
        acStack_148[7] = s_AsideProfileAvatar_0cefbed8[0xf];
        local_150[0] = s_AsideProfileAvatar_0cefbed8[0];
        local_150[1] = s_AsideProfileAvatar_0cefbed8[1];
        local_150[2] = s_AsideProfileAvatar_0cefbed8[2];
        local_150[3] = s_AsideProfileAvatar_0cefbed8[3];
        local_150[4] = s_AsideProfileAvatar_0cefbed8[4];
        local_150[5] = s_AsideProfileAvatar_0cefbed8[5];
        local_150[6] = s_AsideProfileAvatar_0cefbed8[6];
        local_150[7] = s_AsideProfileAvatar_0cefbed8[7];
        local_13e[0] = '\0';
        FUN_09add658(auStack_130,0x62a95c8,local_150);
        FUN_05a46c94(lVar9,&local_c0,pdVar12,auStack_130);
        FUN_09add7a8(auStack_130);
      }
    }
  }
LAB_0415f398:
  FUN_00027cb8(local_50,0);
  FUN_00027c78(&uStack_a0);
  if ((long)local_b0 < 0) {
    FUN_00008eb8(local_c0,local_b0 & 0x7fffffffffffffff);
  }
  return;
}


