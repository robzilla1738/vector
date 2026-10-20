
/* WARNING: Control flow encountered bad instruction data */
/* WARNING: Removing unreachable block (ram,0x0427729c) */
/* WARNING: Removing unreachable block (ram,0x04277264) */
/* WARNING: Removing unreachable block (ram,0x04276ab0) */
/* WARNING: Removing unreachable block (ram,0x04276ac4) */
/* WARNING: Removing unreachable block (ram,0x04277284) */
/* WARNING: Removing unreachable block (ram,0x042772b4) */
/* WARNING: Removing unreachable block (ram,0x0427664c) */
/* WARNING: Type propagation algorithm not settling */
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void entry(undefined1 *param_1,long *******param_2)

{
  int *piVar1;
  byte bVar2;
  char cVar3;
  undefined8 uVar4;
  undefined8 uVar5;
  long ****pppplVar6;
  long ****pppplVar7;
  long ****pppplVar8;
  long *******ppppppplVar9;
  ulong uVar10;
  ulong uVar11;
  code *pcVar12;
  bool bVar13;
  int iVar14;
  undefined8 uVar15;
  long ******pppppplVar16;
  long lVar17;
  int *piVar18;
  int *piVar19;
  undefined8 *puVar20;
  long *******ppppppplVar21;
  ulong uVar22;
  ulong uVar23;
  undefined8 *puVar24;
  undefined1 uVar25;
  long *plVar26;
  long *plVar27;
  long *******ppppppplVar28;
  uint uVar29;
  int *unaff_x24;
  long *****ppppplVar30;
  long *******unaff_x25;
  long *******unaff_x26;
  int unaff_w28;
  undefined1 local_250;
  undefined1 local_249;
  undefined8 *local_248;
  undefined8 local_240;
  ulong uStack_238;
  undefined8 *local_230;
  undefined5 uStack_228;
  undefined3 uStack_223;
  undefined5 uStack_220;
  undefined1 uStack_21b;
  undefined1 uStack_21a;
  char cStack_219;
  undefined8 *local_210;
  undefined8 local_208;
  ulong uStack_200;
  undefined8 *local_1f8;
  undefined8 local_1f0;
  ulong uStack_1e8;
  long *******local_1e0;
  int *piStack_1d8;
  undefined8 local_1d0;
  long *******local_1c0;
  undefined6 uStack_1b8;
  undefined2 uStack_1b2;
  undefined6 uStack_1b0;
  undefined1 uStack_1aa;
  char cStack_1a9;
  long *******local_1a0;
  undefined6 uStack_198;
  undefined2 uStack_192;
  undefined6 uStack_190;
  undefined1 uStack_18a;
  char cStack_189;
  long *******local_180;
  undefined8 uStack_178;
  ulong local_170;
  undefined8 local_168;
  undefined8 local_158;
  undefined5 uStack_150;
  undefined1 uStack_14b;
  undefined2 uStack_14a;
  undefined8 local_148;
  undefined8 *local_140;
  undefined5 uStack_138;
  undefined3 uStack_133;
  undefined5 uStack_130;
  undefined1 uStack_12b;
  undefined1 uStack_12a;
  char cStack_129;
  undefined8 *local_128;
  undefined8 local_120;
  ulong uStack_118;
  long *******local_110;
  undefined6 uStack_108;
  undefined2 uStack_102;
  undefined6 uStack_100;
  undefined1 uStack_fa;
  undefined1 uStack_f9;
  long ****local_f0;
  long ****pppplStack_e8;
  long ****local_e0;
  long *******local_d0;
  int *piStack_c8;
  undefined8 local_c0;
  char local_b8;
  long *******local_b0;
  long lStack_a8;
  ulong local_a0;
  long *******local_90;
  int *piStack_88;
  ulong local_80;
  
  if (((ulong)param_2[6] & 1) == 0) goto LAB_042774a4;
  if ((param_2[4] == (long ******)0x0) || (*(char *)(param_2[3] + 3) != '\x06')) {
    uStack_f9 = 0x16;
    if (&uStack_fa <= &DAT_0cf0a347 || (long *******)0xcf0a347 < &local_110) {
      uStack_108 = uRam000000000cf0a34f;
      local_110 = _DAT_0cf0a347;
      uStack_102 = _DAT_0cf0a355;
      uStack_100 = uRam000000000cf0a357;
      uStack_fa = 0;
      func_0x06c77350(param_1,param_2,&local_110);
      local_d0 = (long *******)0x6c77e5c;
      piStack_c8 = (int *)0x0;
      local_180 = param_2;
      uVar15 = func_0x06c78bd8(0x56a1480,&local_d0,&local_180);
      *(undefined8 *)(param_1 + 8) = uVar15;
      param_1[0x10] = 1;
      return;
    }
    goto LAB_042774a4;
  }
  pppppplVar16 = param_2[0x3a];
  if (((pppppplVar16 == (long ******)0x0) &&
      (pppppplVar16 = param_2[0x39], pppppplVar16 == (long ******)0x0)) ||
     (lVar17 = (*(code *)(*pppppplVar16)[0x29])(), lVar17 == 0)) {
    local_128 = (undefined8 *)func_0x0000f368(0x20);
    uVar15 = _DAT_0cf0a35e;
    uStack_118 = uRam000000000df3b3c8;
    local_120 = _DAT_0df3b3c0;
    if (((undefined8 *)((long)local_128 + 0x1b) < local_128) ||
       (&DAT_0cf0a35e < (undefined8 *)((long)local_128 + 0x1b) &&
        local_128 < (undefined8 *)0xcf0a35f)) goto LAB_042774a4;
    local_128[1] = CONCAT53(_DAT_0cf0a369,uRam000000000cf0a366);
    *local_128 = uVar15;
    uVar15 = CONCAT35(uRam000000000cf0a36e,_DAT_0cf0a369);
    *(undefined8 *)((long)local_128 + 0x13) = uRam000000000cf0a371;
    *(undefined8 *)((long)local_128 + 0xb) = uVar15;
    *(undefined1 *)((long)local_128 + 0x1b) = 0;
    func_0x06c77350(param_1,param_2,&local_128);
    local_d0 = (long *******)0x6c77e5c;
    piStack_c8 = (int *)0x0;
    local_180 = param_2;
    uVar15 = func_0x06c78bd8(0x56a1480,&local_d0,&local_180);
    *(undefined8 *)(param_1 + 8) = uVar15;
    param_1[0x10] = 1;
    puVar20 = local_128;
    uVar22 = uStack_118;
    if (-1 < (long)uStack_118) {
      return;
    }
    goto LAB_04276654;
  }
  if (((ulong)param_2[6] & 1) == 0) goto LAB_042774a4;
  if (param_2[4] == (long ******)0x0) {
                    /* WARNING: Bad instruction - Truncating control flow here */
    halt_baddata();
  }
  pppppplVar16 = param_2[3];
  if (*(char *)(pppppplVar16 + 3) != '\x06') {
                    /* WARNING: Bad instruction - Truncating control flow here */
    halt_baddata();
  }
  piVar18 = (int *)func_0x02029a80(pppppplVar16,0xda0e734,8);
  if (piVar18 == (int *)0x0) {
LAB_04276798:
    cStack_129 = '\x15';
    if (&DAT_0cf0a2fb < &uStack_12b && &local_140 < (undefined8 **)0xcf0a2fc) goto LAB_042774a4;
    uStack_138 = uRam000000000cf0a303;
    local_140 = _DAT_0cf0a2fb;
    uStack_133 = _DAT_0cf0a308;
    uStack_130 = uRam000000000cf0a30b;
    uStack_12b = 0;
    func_0x06c77350(param_1,param_2,&local_140);
    local_d0 = (long *******)0x6c77e5c;
    piStack_c8 = (int *)0x0;
    local_180 = param_2;
    uVar15 = func_0x06c78bd8(0x56a1480,&local_d0,&local_180);
    *(undefined8 *)(param_1 + 8) = uVar15;
    param_1[0x10] = 1;
    if (-1 < cStack_129) {
      return;
    }
    uVar22 = CONCAT17(cStack_129,CONCAT16(uStack_12a,CONCAT15(uStack_12b,uStack_130)));
    puVar20 = local_140;
    goto LAB_04276654;
  }
  ppppppplVar28 = (long *******)(long)*(char *)((long)piVar18 + 0x17);
  if ((long)ppppppplVar28 < 0) {
    ppppppplVar28 = *(long ********)(piVar18 + 2);
    if (ppppppplVar28 == (long *******)0x0) goto LAB_04276798;
    piVar18 = *(int **)piVar18;
  }
  else if (*(char *)((long)piVar18 + 0x17) == '\0') goto LAB_04276798;
  local_148 = 0;
  uStack_14a = 0;
  uStack_14b = 0;
  uStack_150 = 0;
  local_158._5_3_ = 0;
  local_158._0_5_ = 0;
  if (ppppppplVar28 == (long *******)0x5) {
    if ((char)piVar18[1] == 's' && *piVar18 == 0x616c7461) {
      local_148 = 0xd00000000000000;
      if (&DAT_0cf0a3f5 < &uStack_14b && &local_158 < (undefined8 *)0xcf0a3f6) goto LAB_042774a4;
      local_158._0_5_ = _DAT_0cf0a3f5;
      local_158._5_3_ = _DAT_0cf0a3fa;
      uStack_150 = uRam000000000cf0a3fd;
      uStack_14b = 0;
    }
    else {
LAB_042768cc:
      local_148 = (long)ppppppplVar28 << 0x38;
      piVar19 = (int *)&local_158;
LAB_042768d4:
      if (((int *)((long)piVar19 + (long)ppppppplVar28) < piVar19) ||
         ((piVar19 <= piVar18 && (piVar18 < (int *)((long)piVar19 + (long)ppppppplVar28)))))
      goto LAB_042774a4;
      func_0x0800f2cc(piVar19,piVar18,ppppppplVar28);
      *(undefined1 *)((long)piVar19 + (long)ppppppplVar28) = 0;
    }
    uStack_178 = 0;
    local_180 = (long *******)0x0;
    local_168 = 0;
    local_170 = 0;
    puVar20 = (undefined8 *)func_0x02029a80(pppppplVar16,0xdb233ef,0xf);
    if (puVar20 == (undefined8 *)0x0) {
LAB_04276960:
      uVar25 = 0;
      local_180 = (long *******)((ulong)local_180 & 0xffffffffffffff00);
    }
    else {
      if (*(char *)((long)puVar20 + 0x17) < '\0') {
        if (puVar20[1] == 0) goto LAB_04276960;
        func_0x00018218(&local_180,*puVar20);
      }
      else {
        if (*(char *)((long)puVar20 + 0x17) == '\0') goto LAB_04276960;
        uStack_178 = puVar20[1];
        local_180 = (long *******)*puVar20;
        local_170 = puVar20[2];
      }
      uVar25 = 1;
    }
    unaff_x26 = (long *******)&local_b0;
    local_168 = CONCAT71(local_168._1_7_,uVar25);
    puVar20 = (undefined8 *)func_0x00f609c0(pppppplVar16,0xcf0a37a,9);
    if (puVar20 == (undefined8 *)0x0) {
      local_250 = 0;
LAB_04276a98:
      local_1e0 = (long *******)0x0;
      piStack_1d8 = (int *)0x0;
      local_1d0 = 0;
      func_0x01a9cb04(&local_d0);
      piStack_1d8 = piStack_c8;
      local_1e0 = local_d0;
      local_1d0 = local_c0;
      unaff_w28 = (int)(char)local_148._7_1_;
      ppppppplVar28 = (long *******)CONCAT35(local_158._5_3_,(undefined5)local_158);
      piVar18 = (int *)CONCAT26(uStack_14a,CONCAT15(uStack_14b,uStack_150));
      unaff_x25 = ppppppplVar28;
      unaff_x24 = piVar18;
      if (-1 < unaff_w28) {
        unaff_x25 = (long *******)&local_158;
        unaff_x24 = (int *)(ulong)local_148._7_1_;
      }
      if (unaff_x24 == (int *)0x7) {
        if (*(int *)unaff_x25 != 0x65726966 || *(int *)((long)unaff_x25 + 3) != 0x786f6665) {
LAB_04276e24:
          local_c0 = CONCAT17((char)unaff_x24,(undefined7)local_c0);
          ppppppplVar21 = (long *******)&local_d0;
LAB_04276e2c:
          if (((long *******)((long)ppppppplVar21 + (long)unaff_x24) < ppppppplVar21) ||
             ((ppppppplVar21 <= unaff_x25 &&
              (unaff_x25 < (long *******)((long)ppppppplVar21 + (long)unaff_x24)))))
          goto LAB_042774a4;
          func_0x0800f2cc(ppppppplVar21,unaff_x25,unaff_x24);
          *(undefined1 *)((long)ppppppplVar21 + (long)unaff_x24) = 0;
          uVar29 = (uint)local_c0._7_1_;
          goto LAB_04276e60;
        }
        if ((param_2[0x3c] != (long ******)0x0) && (lVar17 = func_0x00471a30(), lVar17 != 0)) {
                    /* WARNING: Bad instruction - Truncating control flow here */
          halt_baddata();
        }
        local_210 = (undefined8 *)func_0x0000f368(0x30);
        uStack_200 = uRam000000000df3abc8;
        local_208 = _DAT_0df3abc0;
        if (((undefined8 *)((long)local_210 + 0x21) < local_210) ||
           (&DAT_0cf0a3bd < (undefined8 *)((long)local_210 + 0x21) &&
            local_210 < (undefined8 *)0xcf0a3be)) goto LAB_042774a4;
        *(undefined2 *)(local_210 + 4) = 0x65;
        uVar4 = uRam000000000cf0a3d5;
        uVar5 = _DAT_0cf0a3cd;
        uVar15 = _DAT_0cf0a3bd;
        local_210[1] = uRam000000000cf0a3c5;
        *local_210 = uVar15;
        local_210[3] = uVar4;
        local_210[2] = uVar5;
        func_0x06c77350(param_1,param_2,&local_210);
        local_d0 = (long *******)0x6c77e5c;
        piStack_c8 = (int *)0x0;
        local_90 = param_2;
        uVar15 = func_0x06c78bd8(0x56a1480,&local_d0,&local_90);
        *(undefined8 *)(param_1 + 8) = uVar15;
        param_1[0x10] = 1;
        puVar20 = local_210;
        uVar22 = uStack_200;
      }
      else {
        if (unaff_x24 != (int *)0x6) {
          if (unaff_x24 == (int *)0xd) goto LAB_04276c24;
          if ((int *)0x7fffffffffffffee < unaff_x24) goto LAB_04276c20;
          if (unaff_x24 < (int *)0x17) goto LAB_04276e24;
          ppppppplVar21 =
               (long *******)func_0x0000f368(((ulong)unaff_x24 & 0x7ffffffffffffff0) + 0x10);
          local_c0 = ((ulong)unaff_x24 & 0x7ffffffffffffff0) + 0x8000000000000010;
          unaff_x26 = (long *******)&local_b0;
          local_d0 = ppppppplVar21;
          piStack_c8 = unaff_x24;
          goto LAB_04276e2c;
        }
        if (*(int *)unaff_x25 != 0x61666173 || *(short *)((long)unaff_x25 + 4) != 0x6972)
        goto LAB_04276e24;
        lVar17 = func_0x0095e840(pppppplVar16,0xdb23441,0xd);
        if (((lVar17 != 0) && (lVar17 = func_0x087feee0(lVar17,0xd7ef4ca,4), lVar17 != 0)) &&
           (*(long *)(lVar17 + 8) != 0)) {
                    /* WARNING: Bad instruction - Truncating control flow here */
          halt_baddata();
        }
        local_1f8 = (undefined8 *)func_0x0000f368(0x30);
        uVar5 = _DAT_0cf0a39b;
        uVar15 = _DAT_0cf0a38b;
        uStack_1e8 = uRam000000000df3b538;
        local_1f0 = _DAT_0df3b530;
        if (((undefined8 *)((long)local_1f8 + 0x29) < local_1f8) ||
           (&DAT_0cf0a38b < (undefined8 *)((long)local_1f8 + 0x29) &&
            local_1f8 < (undefined8 *)0xcf0a38c)) goto LAB_042774a4;
        uVar4 = CONCAT71(_DAT_0cf0a3a4,uRam000000000cf0a3a3);
        local_1f8[1] = uRam000000000cf0a393;
        *local_1f8 = uVar15;
        local_1f8[3] = uVar4;
        local_1f8[2] = uVar5;
        uVar15 = CONCAT17(uRam000000000cf0a3ab,_DAT_0cf0a3a4);
        *(undefined8 *)((long)local_1f8 + 0x21) = uRam000000000cf0a3ac;
        *(undefined8 *)((long)local_1f8 + 0x19) = uVar15;
        *(undefined1 *)((long)local_1f8 + 0x29) = 0;
        func_0x06c77350(param_1,param_2,&local_1f8);
        local_d0 = (long *******)0x6c77e5c;
        piStack_c8 = (int *)0x0;
        local_90 = param_2;
        uVar15 = func_0x06c78bd8(0x56a1480,&local_d0,&local_90);
        *(undefined8 *)(param_1 + 8) = uVar15;
        param_1[0x10] = 1;
        puVar20 = local_1f8;
        uVar22 = uStack_1e8;
      }
joined_r0x04276d58:
      if ((long)uVar22 < 0) goto LAB_04276fd4;
      goto LAB_04276fdc;
    }
    if (*(char *)(puVar20 + 3) != '\a') {
      cStack_189 = '\x16';
      if (&DAT_0cf0a347 < &uStack_18a && &local_1a0 < (long *******)0xcf0a348) goto LAB_042774a4;
      uStack_198 = uRam000000000cf0a34f;
      local_1a0 = _DAT_0cf0a347;
      uStack_192 = _DAT_0cf0a355;
      uStack_190 = uRam000000000cf0a357;
      uStack_18a = 0;
      func_0x06c77350(param_1,param_2,&local_1a0);
      local_d0 = (long *******)0x6c77e5c;
      piStack_c8 = (int *)0x0;
      local_90 = param_2;
      uVar15 = func_0x06c78bd8(0x56a1480,&local_d0,&local_90);
      *(undefined8 *)(param_1 + 8) = uVar15;
      param_1[0x10] = 1;
      if (-1 < cStack_189) goto LAB_04276ff4;
      ppppppplVar28 = local_1a0;
      uVar22 = CONCAT17(cStack_189,CONCAT16(uStack_18a,uStack_190));
      goto LAB_04276fec;
    }
    if ((puVar20[1] == 1) && (plVar26 = (long *)*puVar20, (char)plVar26[3] == '\x04')) {
      bVar2 = *(byte *)((long)plVar26 + 0x17);
      uVar22 = plVar26[1];
      if (-1 < (char)bVar2) {
        uVar22 = (ulong)bVar2;
      }
      if (uVar22 == 9) {
        plVar27 = (long *)*plVar26;
        if (-1 < (char)bVar2) {
          plVar27 = plVar26;
        }
        if (*(char *)(plVar27 + 1) == 's' && *plVar27 == 0x6b72616d6b6f6f62) {
          local_250 = 1;
          goto LAB_04276a98;
        }
      }
    }
    cStack_1a9 = '\x16';
    if (&DAT_0cf0a347 < &uStack_1aa && &local_1c0 < (long *******)0xcf0a348) goto LAB_042774a4;
    uStack_1b8 = uRam000000000cf0a34f;
    local_1c0 = _DAT_0cf0a347;
    uStack_1b2 = _DAT_0cf0a355;
    uStack_1b0 = uRam000000000cf0a357;
    uStack_1aa = 0;
    func_0x06c77350(param_1,param_2,&local_1c0);
    local_d0 = (long *******)0x6c77e5c;
    piStack_c8 = (int *)0x0;
    local_90 = param_2;
    uVar15 = func_0x06c78bd8(0x56a1480,&local_d0,&local_90);
    *(undefined8 *)(param_1 + 8) = uVar15;
    param_1[0x10] = 1;
    if (cStack_1a9 < '\0') {
      ppppppplVar28 = local_1c0;
      uVar22 = CONCAT17(cStack_1a9,CONCAT16(uStack_1aa,uStack_1b0));
      goto LAB_04276fec;
    }
  }
  else {
    if (ppppppplVar28 < (long *******)0x7fffffffffffffef) {
      if (ppppppplVar28 < (long *******)0x17) goto LAB_042768cc;
      piVar19 = (int *)func_0x0000f368(((ulong)ppppppplVar28 & 0x7ffffffffffffff0) + 0x10);
      local_148 = ((ulong)ppppppplVar28 & 0x7ffffffffffffff0) + 0x8000000000000010;
      local_158._0_5_ = SUB85(piVar19,0);
      local_158._5_3_ = (undefined3)((ulong)piVar19 >> 0x28);
      uStack_150 = SUB85(ppppppplVar28,0);
      uStack_14b = (undefined1)((ulong)ppppppplVar28 >> 0x28);
      uStack_14a = (undefined2)((ulong)ppppppplVar28 >> 0x30);
      goto LAB_042768d4;
    }
LAB_04276c20:
    func_0x04c0038c();
LAB_04276c24:
    if (*unaff_x25 != (long ******)0x2d74706774616863 ||
        *(long *)((long)unaff_x25 + 5) != 0x73616c74612d7470) goto LAB_04276e24;
    local_c0 = CONCAT17(5,(undefined7)local_c0);
    if (0xcf0a403 < ((ulong)&local_d0 | 5) && &local_d0 < (long *******)0xcf0a404)
    goto LAB_042774a4;
    local_d0 = (long *******)CONCAT26(local_d0._6_2_,0x73616c7461);
    uVar29 = 5;
LAB_04276e60:
    ppppppplVar9 = local_d0;
    bVar13 = -1 < (char)uVar29;
    ppppppplVar21 = local_d0;
    if (bVar13) {
      ppppppplVar21 = (long *******)&local_d0;
    }
    piVar19 = piStack_c8;
    if (bVar13) {
      piVar19 = (int *)(ulong)uVar29;
    }
    uVar22 = func_0x0427541c(ppppppplVar21,piVar19);
    if (uVar29 >> 7 != 0) {
      func_0x00008eb8(ppppppplVar9,local_c0 & 0x7fffffffffffffff);
    }
    if (uVar22 >> 0x20 == 0) {
      cStack_219 = '\x15';
      if (&DAT_0cf0a2fb < &uStack_21b && &local_230 < (undefined8 **)0xcf0a2fc) goto LAB_042774a4;
      uStack_228 = uRam000000000cf0a303;
      local_230 = _DAT_0cf0a2fb;
      uStack_223 = _DAT_0cf0a308;
      uStack_220 = uRam000000000cf0a30b;
      uStack_21b = 0;
      func_0x06c77350(param_1,param_2,&local_230);
      local_d0 = (long *******)0x6c77e5c;
      piStack_c8 = (int *)0x0;
      unaff_x26[4] = (long ******)param_2;
      uVar15 = func_0x06c78bd8(0x56a1480,&local_d0,&local_90);
      *(undefined8 *)(param_1 + 8) = uVar15;
      param_1[0x10] = 1;
      if (-1 < cStack_219) goto LAB_04276fdc;
      uVar22 = CONCAT17(cStack_219,CONCAT16(uStack_21a,CONCAT15(uStack_21b,uStack_220)));
      puVar20 = local_230;
LAB_04276fd4:
      func_0x00008eb8(puVar20,uVar22 & 0x7fffffffffffffff);
    }
    else {
      if ((param_2[0x3c] == (long ******)0x0) || (uVar23 = func_0x00471a30(), uVar23 == 0)) {
        local_248 = (undefined8 *)func_0x0000f368(0x30);
        uStack_238 = uRam000000000df3abc8;
        local_240 = _DAT_0df3abc0;
        if (((undefined8 *)((long)local_248 + 0x21) < local_248) ||
           (&DAT_0cf0a3bd < (undefined8 *)((long)local_248 + 0x21) &&
            local_248 < (undefined8 *)0xcf0a3be)) goto LAB_042774a4;
        *(undefined2 *)(local_248 + 4) = 0x65;
        uVar4 = uRam000000000cf0a3d5;
        uVar5 = _DAT_0cf0a3cd;
        uVar15 = _DAT_0cf0a3bd;
        local_248[1] = uRam000000000cf0a3c5;
        *local_248 = uVar15;
        local_248[3] = uVar4;
        local_248[2] = uVar5;
        func_0x06c77350(param_1,param_2,&local_248);
        local_d0 = (long *******)0x6c77e5c;
        piStack_c8 = (int *)0x0;
        unaff_x26[4] = (long ******)param_2;
        uVar15 = func_0x06c78bd8(0x56a1480,&local_d0,&local_90);
        *(undefined8 *)(param_1 + 8) = uVar15;
        param_1[0x10] = 1;
        puVar20 = local_248;
        uVar22 = uStack_238;
        goto joined_r0x04276d58;
      }
      pppppplVar16 = param_2[0x3a];
      if (pppppplVar16 == (long ******)0x0) {
        pppppplVar16 = param_2[0x39];
      }
      ppppplVar30 = param_2[2][0x45];
      plVar26 = (long *)func_0x0000f368(0xf8);
      if ((long)local_1d0 < 0) {
        func_0x00018218(&local_90,local_1e0,piStack_1d8);
      }
      else {
        piStack_88 = piStack_1d8;
        local_90 = local_1e0;
        local_80 = local_1d0;
      }
      if (unaff_w28 < 0) {
        func_0x00018218(&local_b0,ppppppplVar28,piVar18);
      }
      else {
        lStack_a8 = CONCAT26(uStack_14a,CONCAT15(uStack_14b,uStack_150));
        local_b0 = (long *******)CONCAT35(local_158._5_3_,(undefined5)local_158);
        local_a0 = local_148;
      }
      local_d0 = (long *******)((ulong)local_d0 & 0xffffffffffffff00);
      local_b8 = '\0';
      if ((char)local_168 != '\0') {
        if (-1 < (long)local_170) {
                    /* WARNING: Bad instruction - Truncating control flow here */
          halt_baddata();
        }
        func_0x00018218(&local_d0,local_180,uStack_178);
        local_b8 = '\x01';
      }
      if (*(char *)((long)ppppplVar30 + 0x17) < '\0') {
        func_0x00018218(&local_f0,*ppppplVar30,ppppplVar30[1]);
      }
      else {
        pppplStack_e8 = ppppplVar30[1];
        local_f0 = *ppppplVar30;
        local_e0 = ppppplVar30[2];
      }
      uVar11 = local_80;
      piVar18 = piStack_88;
      ppppppplVar21 = local_90;
      uVar10 = local_a0;
      lVar17 = lStack_a8;
      ppppppplVar28 = local_b0;
      pppplVar8 = local_e0;
      pppplVar7 = pppplStack_e8;
      pppplVar6 = local_f0;
      piStack_88 = (int *)0x0;
      local_80 = 0;
      local_90 = (long *******)0x0;
      local_b0 = (long *******)0x0;
      lStack_a8 = 0;
      local_a0 = 0;
      local_f0 = (long ****)0x0;
      pppplStack_e8 = (long ****)0x0;
      local_e0 = (long ****)0x0;
      plVar26[1] = (long)ppppppplVar21;
      plVar26[3] = uVar11;
      plVar26[2] = (long)piVar18;
      plVar26[4] = (long)ppppppplVar28;
      plVar26[6] = uVar10;
      plVar26[5] = lVar17;
      if (((ulong)pppppplVar16 & 0xfffffffc00000000) == _DAT_0ebb2088) {
        func_0x000142fc(pppppplVar16);
      }
      plVar26[7] = (long)pppppplVar16;
      plVar26[8] = (long)pppplVar6;
      plVar26[10] = (long)pppplVar8;
      plVar26[9] = (long)pppplVar7;
      plVar27 = plVar26 + 0xb;
      *(undefined1 *)((long)plVar26 + 0x6f) = 6;
      if (((long *)((long)plVar26 + 0x5e) < plVar27) ||
         ((long *)0xcf0a409 < (long *)((long)plVar26 + 0x5e) && plVar27 < (long *)0xcf0a40a)) {
LAB_042774a4:
                    /* WARNING: Does not return */
        pcVar12 = (code *)SoftwareBreakpoint(1,0x42774a8);
        (*pcVar12)();
      }
      *(undefined2 *)((long)plVar26 + 0x5c) = 0x6465;
      *(undefined4 *)plVar27 = 0x75657571;
      *(undefined1 *)((long)plVar26 + 0x5e) = 0;
      plVar26[0xf] = 0;
      plVar26[0xe] = 0;
      plVar26[0x11] = 0;
      plVar26[0x10] = 0;
      plVar26[0x13] = 0;
      plVar26[0x12] = 0;
      plVar26[0x14] = 0;
      *plVar26 = 0xe26eef8;
      *(int *)(plVar26 + 0x15) = (int)uVar22;
      *(undefined1 *)(plVar26 + 0x16) = 0;
      *(undefined1 *)(plVar26 + 0x19) = 0;
      if (local_b8 != '\0') {
        plVar26[0x17] = (long)piStack_c8;
        plVar26[0x16] = (long)local_d0;
        plVar26[0x18] = local_c0;
        piStack_c8 = (int *)0x0;
        local_c0 = 0;
        local_d0 = (long *******)0x0;
        *(undefined1 *)(plVar26 + 0x19) = 1;
      }
      if ((uVar23 & 0xfffffffc00000000) == _DAT_0ebb2088) {
        func_0x000142fc(uVar23);
      }
      plVar26[0x1a] = uVar23;
      *(undefined1 *)(plVar26 + 0x1b) = local_250;
      plVar26[0x1c] = 0;
      piVar18 = (int *)func_0x0000f368(8);
      *piVar18 = 0;
      *(undefined1 *)(piVar18 + 1) = 0;
      if ((piVar18 != (int *)0x0) &&
         (iVar14 = *piVar18, *piVar18 = iVar14 + 1, iVar14 == 0x7fffffff)) {
                    /* WARNING: Bad instruction - Truncating control flow here */
        halt_baddata();
      }
      plVar26[0x1d] = (long)piVar18;
      plVar26[0x1e] = (long)plVar26;
      if ((DAT_0ed45308 & 1) == 0) {
                    /* WARNING: Bad instruction - Truncating control flow here */
        halt_baddata();
      }
      puVar20 = (undefined8 *)&DAT_0ed452f8;
      if (_DAT_0ed452f8 != (undefined8 *)0x0) {
        ppppppplVar28 = local_1e0;
        if (-1 < (long)local_1d0._7_1_) {
          ppppppplVar28 = (long *******)&local_1e0;
        }
        puVar24 = _DAT_0ed452f8;
        piVar18 = piStack_1d8;
        if (-1 < (long)local_1d0) {
          piVar18 = (int *)(long)local_1d0._7_1_;
        }
        do {
          while( true ) {
            puVar20 = puVar24;
            cVar3 = *(char *)((long)puVar20 + 0x37);
            puVar24 = (undefined8 *)puVar20[4];
            if (-1 < (long)cVar3) {
              puVar24 = puVar20 + 4;
            }
            piVar19 = (int *)puVar20[5];
            if (-1 < cVar3) {
              piVar19 = (int *)(long)cVar3;
            }
            piVar1 = piVar19;
            if (piVar18 <= piVar19) {
              piVar1 = piVar18;
            }
            iVar14 = func_0x08009860(ppppppplVar28,puVar24,piVar1);
            if (iVar14 == 0) {
              plVar27 = plVar26;
              if (piVar18 != piVar19) {
                    /* WARNING: Bad instruction - Truncating control flow here */
                halt_baddata();
              }
              goto LAB_042773f4;
            }
            if (iVar14 < 0) break;
            puVar24 = (undefined8 *)puVar20[1];
            if ((undefined8 *)puVar20[1] == (undefined8 *)0x0) {
                    /* WARNING: Bad instruction - Truncating control flow here */
              halt_baddata();
            }
          }
          puVar24 = (undefined8 *)*puVar20;
        } while ((undefined8 *)*puVar20 != (undefined8 *)0x0);
      }
      puVar24 = (undefined8 *)func_0x0000f368(0x40);
      if (puVar24 == (undefined8 *)0x0) goto LAB_042774a4;
      plVar27 = puVar24 + 4;
      *puVar24 = 0;
      if (plVar27 == (long *)0x0) goto LAB_042774a4;
      if ((long)local_1d0 < 0) {
        func_0x00018218(plVar27,local_1e0,piStack_1d8);
      }
      else {
        puVar24[5] = piStack_1d8;
        *plVar27 = (long)local_1e0;
        puVar24[6] = local_1d0;
      }
      puVar24[7] = plVar26;
      *puVar24 = 0;
      puVar24[1] = 0;
      puVar24[2] = puVar20;
      *puVar20 = puVar24;
      if ((long *)*_DAT_0ed452f0 != (long *)0x0) {
        puVar24 = (undefined8 *)*puVar20;
        _DAT_0ed452f0 = (long *)*_DAT_0ed452f0;
      }
      func_0x0005ba60(_DAT_0ed452f8,puVar24);
      _DAT_0ed45300 = _DAT_0ed45300 + 1;
      plVar27 = (long *)0x0;
LAB_042773f4:
      (**(code **)(*plVar26 + 0x10))(plVar26);
      local_d0 = (long *******)0x0;
      piStack_c8 = (int *)0x0;
      local_c0 = 0;
      ppppppplVar28 = local_1e0;
      if (-1 < (long)local_1d0._7_1_) {
        ppppppplVar28 = (long *******)&local_1e0;
      }
      piVar18 = piStack_1d8;
      if (-1 < (long)local_1d0) {
        piVar18 = (int *)(long)local_1d0._7_1_;
      }
      func_0x016a05c8(&local_d0,0xdadd507,5,ppppppplVar28,piVar18);
      func_0x06ce6a8c(&local_249,param_2,&local_d0);
      local_90 = (long *******)0x6c77e5c;
      piStack_88 = (int *)0x0;
      local_b0 = param_2;
      uVar15 = func_0x06c78bd8(0x56a1480,&local_90,&local_b0);
      *param_1 = local_249;
      *(undefined8 *)(param_1 + 8) = uVar15;
      param_1[0x10] = 1;
      func_0x0095e480(&local_d0);
      if (plVar27 != (long *)0x0) {
        (**(code **)(*plVar27 + 8))(plVar27);
      }
    }
LAB_04276fdc:
    ppppppplVar28 = local_1e0;
    uVar22 = local_1d0;
    if ((long)local_1d0 < 0) {
LAB_04276fec:
      func_0x00008eb8(ppppppplVar28,uVar22 & 0x7fffffffffffffff);
    }
  }
LAB_04276ff4:
  if (((char)local_168 != '\0') && ((long)local_170 < 0)) {
    func_0x00008eb8(local_180,local_170 & 0x7fffffffffffffff);
  }
  if (-1 < (long)local_148) {
    return;
  }
  puVar20 = (undefined8 *)CONCAT35(local_158._5_3_,(undefined5)local_158);
  uVar22 = local_148;
LAB_04276654:
  func_0x00008eb8(puVar20,uVar22 & 0x7fffffffffffffff);
  return;
}


