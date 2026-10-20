
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void entry(undefined8 *param_1,long param_2,undefined8 param_3,long param_4,undefined8 param_5,
          undefined8 param_6,long param_7,int *param_8)

{
  int iVar1;
  uint uVar2;
  uint uVar3;
  ulong uVar4;
  byte bVar5;
  code *pcVar6;
  bool bVar7;
  int iVar8;
  long lVar9;
  int extraout_var;
  long lVar10;
  undefined8 uVar11;
  int extraout_var_00;
  int iVar12;
  long *plVar13;
  undefined8 *puVar14;
  double dVar15;
  double dVar16;
  double dVar17;
  undefined1 auVar18 [16];
  undefined8 local_70;
  undefined8 uStack_68;
  long lStack_60;
  
  lVar9 = *(long *)(param_2 + 0x668);
  if ((((lVar9 != 0) && (*(char *)(lVar9 + 0x3c0) != '\0')) && (*(char *)(lVar9 + 0x1c8) != '\0'))
     && ((*(long *)(param_2 + 0x6a0) != 0 && (*(char *)(*(long *)(param_2 + 0x6a0) + 0x1c8) != '\0')
         ))) {
    bVar5 = *(byte *)(*(long *)(param_2 + 0x848) + 0x90);
    if ((bVar5 == 0) ||
       (((*(byte *)(param_2 + 0xa08) & 1) == 0 && ((*(byte *)(param_2 + 0xa0c) & 1) == 0)))) {
      if ((*(byte *)(param_2 + 0xce0) & 1) == 0) {
        if ((*(byte *)(param_2 + 0xf78) & 1) == 0) {
          if ((bVar5 & 1) != 0) goto LAB_0462b614;
          goto LAB_0462b838;
        }
LAB_0462b814:
        iVar8 = *(int *)(param_2 + 0x1c0);
        iVar12 = iVar8;
      }
      else {
        if (*(byte *)(param_2 + 0xf78) != 0) goto LAB_0462b814;
        if (*(char *)(param_2 + 0xd28) == '\0') {
          dVar15 = *(double *)(param_2 + 0xd40);
          bVar7 = dVar15 == 1.0;
        }
        else {
          bVar7 = *(int *)(param_2 + 0xd24) == 0;
          dVar15 = *(double *)(param_2 + 0xd40);
        }
        pcVar6 = (code *)&SUB_035bc0d4;
        if (!bVar7) {
          pcVar6 = (code *)&SUB_08a01b6c;
        }
        dVar15 = (double)(*pcVar6)(dVar15 * (double)*(int *)(param_2 + 0x8c8));
        iVar12 = (int)dVar15;
        iVar8 = *(int *)(param_2 + 0x1c0);
      }
      iVar1 = iVar12;
      if (iVar8 <= iVar12) {
        iVar1 = iVar8;
      }
      if (iVar8 < 1) {
        iVar1 = iVar12;
      }
      if (iVar1 < 0x97) goto LAB_0462b614;
      lVar9 = *(long *)(param_2 + 0x668);
    }
LAB_0462b838:
    auVar18 = func_0x01427574(lVar9);
    if ((auVar18._0_4_ <= *param_8) && (*param_8 < auVar18._8_4_ + auVar18._0_4_)) {
      if ((auVar18._4_4_ <= param_8[1]) && (param_8[1] < auVar18._4_4_ + auVar18._12_4_)) {
        *param_1 = 0;
        param_1[1] = 0;
        *(undefined4 *)(param_1 + 2) = 0;
        func_0x04612384(param_1,*(undefined8 *)(param_2 + 0x6a0),param_3,param_4,param_8);
        if (*(char *)(param_1 + 2) != '\0') {
          if (*(char *)(param_2 + 0x6c0) == '\0') {
LAB_0462b984:
            if ((int)*(uint *)(param_7 + 0xc) < 1) {
              dVar15 = 0.5;
            }
            else {
              dVar16 = (double)(param_8[1] - *(int *)(param_7 + 4)) /
                       (double)*(uint *)(param_7 + 0xc);
              dVar17 = 1.0;
              if (dVar16 <= 1.0) {
                dVar17 = dVar16;
              }
              dVar15 = 0.0;
              if (0.0 <= dVar16) {
                dVar15 = dVar17;
              }
            }
            uStack_68._4_4_ = (int)((ulong)param_1[1] >> 0x20);
            iVar8 = param_8[1] - (int)(long)(dVar15 * (double)uStack_68._4_4_);
            uVar2 = iVar8 + uStack_68._4_4_ >> 0x1f ^ 0x80000000;
            if (!SCARRY4(iVar8,uStack_68._4_4_)) {
              uVar2 = iVar8 + uStack_68._4_4_;
            }
            uVar3 = (int)(uVar2 - iVar8) >> 0x1f ^ 0x80000000;
            if (!SBORROW4(uVar2,iVar8)) {
              uVar3 = uVar2 - iVar8;
            }
            local_70 = (undefined8 *)CONCAT44(iVar8,(int)*param_1);
            uStack_68 = CONCAT44(uVar3 & ((int)uVar3 >> 0x1f ^ 0xffffffffU),(int)param_1[1]);
            func_0x04651140(param_2,param_4,param_5,param_7,&local_70,0);
            return;
          }
          *(undefined1 *)(param_2 + 0x6c0) = 0;
          puVar14 = *(undefined8 **)(param_2 + 0x6d8);
          if (puVar14 == (undefined8 *)0x0) goto LAB_0462b984;
          if (((puVar14[0x1c] != 0) && (*(char *)(puVar14[0x1c] + 4) == '\0')) &&
             (puVar14[0x1d] != 0)) {
            if ((puVar14[0x1c] == 0) || (*(char *)(puVar14[0x1c] + 4) != '\0')) {
                    /* WARNING: Does not return */
              pcVar6 = (code *)SoftwareBreakpoint(0,0x462b948);
              (*pcVar6)();
            }
            if (*(long *)(puVar14[0x1d] + 0x48) != 0) {
              func_0x02b425fc(*(long *)(puVar14[0x1d] + 0x48),0);
            }
            uVar11 = func_0x02af7344();
            local_70 = puVar14;
            func_0x02219fc4(uVar11,0xa6dee24,0,&local_70);
          }
          if ((*(byte *)(param_1 + 2) & 1) != 0) goto LAB_0462b984;
          goto LAB_0462b94c;
        }
      }
    }
  }
LAB_0462b614:
  if (*(long *)(param_2 + 0x6a0) != 0) {
    func_0x04613160(*(long *)(param_2 + 0x6a0),1);
  }
  plVar13 = *(long **)(param_2 + 0x6b8);
  if (plVar13 != (long *)0x0) {
    if ((char)plVar13[0x67] != '\0') {
      *(undefined1 *)(plVar13 + 0x67) = 0;
      func_0x02109700(plVar13[0x69],plVar13 + 0x65);
      (**(code **)(plVar13[0x65] + 0x38))(plVar13 + 0x65);
      if (plVar13[0x68] != 0) {
        iVar8 = (**(code **)(plVar13[0x65] + 0x40))(plVar13 + 0x65);
        lVar9 = 0x20;
        if (iVar8 == 0) {
          lVar9 = 0x10;
        }
        (**(code **)(*(long *)plVar13[0x68] + lVar9))((long *)plVar13[0x68],plVar13 + 0x65);
      }
    }
    (**(code **)(*plVar13 + 0xa0))(plVar13,0);
  }
  lVar9 = *(long *)(param_2 + 0xca0);
  *(undefined8 *)(param_2 + 0xca0) = 0;
  if (lVar9 != 0) {
    uVar11 = func_0x07fb6458();
    func_0x00008eb8(uVar11,0x18);
  }
  if ((*(long *)(param_2 + 0x6a8) == 0) ||
     (iVar8 = param_8[1], func_0x01427574(), iVar8 <= extraout_var_00 + extraout_var + 0xc)) {
    if (*(char *)(param_2 + 0x6c0) != '\0') {
      *(undefined1 *)(param_2 + 0x6c0) = 0;
      lVar9 = *(long *)(param_2 + 0x6d8);
      if ((((lVar9 != 0) && (*(long *)(lVar9 + 0xe0) != 0)) &&
          (*(char *)(*(long *)(lVar9 + 0xe0) + 4) == '\0')) && (*(long *)(lVar9 + 0xe8) != 0)) {
        if ((*(long *)(lVar9 + 0xe0) == 0) || (*(char *)(*(long *)(lVar9 + 0xe0) + 4) != '\0')) {
                    /* WARNING: Does not return */
          pcVar6 = (code *)SoftwareBreakpoint(0,0x462ba90);
          (*pcVar6)();
        }
        lVar10 = *(long *)(*(long *)(lVar9 + 0xe8) + 0x48);
        if (lVar10 != 0) {
          func_0x02b425fc(lVar10,0);
        }
        uVar11 = func_0x02af7344();
        local_70 = (undefined8 *)lVar9;
        func_0x02219fc4(uVar11,0xa6dee24,0,&local_70);
      }
    }
    *(undefined1 *)param_1 = 0;
    *(undefined1 *)(param_1 + 2) = 0;
  }
  else {
    *(undefined1 *)(param_2 + 0x6c0) = 1;
    uVar4 = *(ulong *)(param_4 + 8);
    if ((*(byte *)(param_4 + 0x17) & 0x80) == 0) {
      uVar4 = (ulong)*(byte *)(param_4 + 0x17);
    }
    if (uVar4 == 0) {
      local_70 = (undefined8 *)func_0x0000f368(0x20);
      uVar11 = _DAT_0df87e4a;
      lStack_60 = lRam000000000df3f108;
      uStack_68 = _DAT_0df3f100;
      if (((undefined8 *)((long)local_70 + 0x1e) < local_70) ||
         (&DAT_0df87e4a < (undefined8 *)((long)local_70 + 0x1e) &&
          local_70 < (undefined8 *)0xdf87e4b)) {
LAB_0462b94c:
                    /* WARNING: Does not return */
        pcVar6 = (code *)SoftwareBreakpoint(1,0x462b950);
        (*pcVar6)();
      }
      local_70[1] = CONCAT26(_DAT_0df87e58,uRam000000000df87e52);
      *local_70 = uVar11;
      uVar11 = CONCAT62(uRam000000000df87e5a,_DAT_0df87e58);
      *(undefined8 *)((long)local_70 + 0x16) = uRam000000000df87e60;
      *(undefined8 *)((long)local_70 + 0xe) = uVar11;
      *(undefined2 *)((long)local_70 + 0x1e) = 0;
    }
    else {
      func_0x069dacd8(&local_70,0xdf87e6a,param_4);
    }
    func_0x04650ec0(param_2,&local_70,param_8);
    if (lStack_60 < 0) {
      func_0x00008eb8(local_70,lStack_60 << 1);
    }
    *param_1 = 0;
    param_1[1] = 0;
    *(undefined1 *)(param_1 + 2) = 1;
  }
  return;
}

