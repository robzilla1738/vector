
/* WARNING: Control flow encountered bad instruction data */
/* WARNING: Removing unreachable block (ram,0x0426c370) */
/* WARNING: Removing unreachable block (ram,0x0426c26c) */
/* WARNING: Removing unreachable block (ram,0x0426c1b0) */
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void entry(undefined8 *param_1,long *param_2,undefined8 param_3)

{
  undefined8 *puVar1;
  char cVar2;
  undefined8 ****ppppuVar3;
  double dVar4;
  code *pcVar5;
  long *plVar6;
  undefined8 *puVar7;
  ulong uVar8;
  undefined8 *puVar9;
  long lVar10;
  ulong uVar11;
  long *plVar12;
  long *plVar13;
  undefined8 *puVar14;
  long lVar15;
  double dVar16;
  ulong uVar17;
  long lVar18;
  double dVar19;
  double dVar20;
  ulong local_200;
  ulong uStack_1f8;
  long *local_1e8;
  long local_1e0;
  ulong local_1d8;
  undefined8 ***local_1d0;
  ulong uStack_1c8;
  undefined8 local_1c0;
  ulong local_1b0;
  undefined8 uStack_1a8;
  undefined8 local_1a0;
  undefined8 uStack_198;
  undefined8 uStack_190;
  undefined8 uStack_188;
  undefined8 local_180;
  undefined8 uStack_178;
  undefined8 uStack_170;
  undefined8 uStack_168;
  undefined8 local_160;
  undefined8 uStack_158;
  undefined8 uStack_150;
  undefined8 uStack_148;
  undefined8 local_140;
  undefined8 uStack_138;
  undefined8 local_130;
  undefined8 uStack_128;
  undefined8 local_120;
  undefined8 ***pppuStack_118;
  ulong local_110;
  undefined1 uStack_108;
  undefined6 uStack_107;
  byte bStack_101;
  undefined1 local_100;
  undefined7 uStack_ff;
  undefined1 uStack_f8;
  undefined7 uStack_f7;
  ulong local_f0;
  ulong local_e8;
  undefined8 local_e0;
  undefined8 uStack_d8;
  ulong local_d0;
  ulong local_c8;
  undefined8 ***local_b8;
  ulong uStack_b0;
  undefined8 local_a8;
  
  dVar4 = _DAT_0df4bb58;
  if (param_1[1] * 0xb0 != 0) {
    puVar14 = (undefined8 *)*param_1;
    puVar1 = puVar14 + param_1[1] * 0x16;
    uVar17 = 0xd7f42d3;
    dVar20 = *_DAT_0e028890;
    do {
      plVar6 = (long *)0xd9cecf3;
      local_b8 = (undefined8 ****)0x0;
      uStack_b0 = 0;
      local_a8 = 0;
      lVar10 = (long)*(char *)((long)puVar14 + 0x17);
      puVar7 = puVar14;
      if (lVar10 < 0) {
        lVar10 = puVar14[1];
        puVar7 = (undefined8 *)*puVar14;
      }
      func_0x008e2310(&local_b8,puVar7,lVar10);
      if (*(char *)(puVar14 + 0x12) == '\0') {
        uVar8 = param_2[1];
        if (uVar8 == 0) {
          plVar6 = (long *)0x0;
          uStack_1f8 = 0;
          local_200 = 0;
        }
        else {
          uVar11 = uVar17;
          if (0xaaaaaaaaaaaaaaa < uVar8) goto LAB_0426c5d8;
          plVar12 = (long *)*param_2;
          lVar10 = uVar8 * 0x18;
          plVar6 = (long *)func_0x0000f368(lVar10);
          plVar13 = plVar6;
          for (; lVar10 != 0; lVar10 = lVar10 + -0x18) {
            if (plVar13 == (long *)0x0) goto LAB_0426c5d4;
            if (*(char *)((long)plVar12 + 0x17) < '\0') {
              func_0x00046bd0(plVar13,*plVar12,plVar12[1]);
            }
            else {
              lVar18 = plVar12[1];
              lVar15 = *plVar12;
              plVar13[2] = plVar12[2];
              plVar13[1] = lVar18;
              *plVar13 = lVar15;
            }
            plVar12 = plVar12 + 3;
            plVar13 = plVar13 + 3;
          }
          local_200 = ((long)plVar13 - (long)plVar6 >> 3) * -0x5555555555555555;
          uVar17 = 0xd7f42d3;
          uStack_1f8 = uVar8;
        }
        uStack_d8 = 0;
        local_e0 = 0;
        local_c8 = 0;
        local_d0 = 0;
        uStack_f8 = 0;
        uStack_f7 = 0;
        local_100 = 0;
        uStack_ff = 0;
        local_e8 = 0;
        local_f0 = 0;
        pppuStack_118 = (undefined8 ***)0x0;
        local_120 = 0;
        uStack_108 = 0;
        uStack_107 = 0;
        bStack_101 = 0;
        local_110 = 0;
        uStack_138 = 0;
        local_140 = 0;
        uStack_128 = 0;
        local_130 = 0;
        uStack_158 = 0;
        local_160 = 0;
        uStack_148 = 0;
        uStack_150 = 0;
        uStack_178 = 0;
        local_180 = 0;
        uStack_168 = 0;
        uStack_170 = 0;
        uStack_198 = 0;
        local_1a0 = 0;
        uStack_188 = 0;
        uStack_190 = 0;
        uStack_1a8 = 0;
        local_1b0 = 0;
        func_0x02758480(&uStack_1a8);
        local_f0 = local_f0 & 0xffffffffffffff00;
        local_e8 = local_e8 & 0xffffffffffffff00;
        local_d0 = local_d0 & 0xffffffffffffff00;
        local_c8 = local_c8 & 0xffffffffffff0000;
        uStack_128 = 0;
        local_130 = 0;
        pppuStack_118 = (undefined8 ****)0x0;
        local_120 = 0;
        uStack_108 = 0;
        local_110 = 0;
        uStack_ff = 0;
        uStack_f8 = 0;
        uStack_107 = 0;
        bStack_101 = 0;
        local_100 = 0;
        local_1b0 = CONCAT62(local_1b0._2_6_,0x100);
        func_0x02c4de40(&local_130,*param_2,*param_2 + param_2[1] * 0x18,
                        (param_2[1] * 0x18 >> 3) * -0x5555555555555555);
        if ((char)bStack_101 < '\0') {
          uVar8 = uStack_b0;
          ppppuVar3 = (undefined8 ****)local_b8;
          if (-1 < (long)local_a8) {
            uVar8 = (ulong)local_a8._7_1_;
            ppppuVar3 = &local_b8;
          }
          func_0x008ce834(&pppuStack_118,ppppuVar3,uVar8);
        }
        else if ((long)local_a8 < 0) {
          func_0x008ce6ec(&pppuStack_118,local_b8,uStack_b0);
        }
        else {
          local_110 = uStack_b0;
          pppuStack_118 = local_b8;
          uStack_108 = (undefined1)local_a8;
          uStack_107 = (undefined6)(local_a8 >> 8);
          bStack_101 = local_a8._7_1_;
        }
        if (_DAT_0ebb1d08 == (code *)0x42cfe30) {
          dVar16 = (double)func_0x08031990();
          if (dVar16 == 0.0) goto LAB_0426c5e0;
          if (dVar16 == INFINITY) {
            lVar10 = 0x7fffffffffffffff;
          }
          else {
            dVar16 = (dVar16 + dVar20) * dVar4;
            lVar10 = 0;
            if (-9.223372036854776e+18 <= dVar16) {
              lVar10 = 0x7fffffffffffffff;
            }
            dVar19 = dVar16;
            if (dVar16 <= -9.223372036854776e+18) {
              dVar19 = -9.223372036854776e+18;
            }
            lVar15 = (long)dVar19;
            if (9.223372036854775e+18 < dVar16) {
              lVar15 = lVar10;
            }
            lVar10 = lVar15;
            if (1 < lVar15 + 0x8000000000000001U) {
              lVar10 = 0x7fffffffffffffff;
              if (!SCARRY8(lVar15,0x295e9648864000)) {
                lVar10 = lVar15 + 0x295e9648864000;
              }
            }
          }
        }
        else {
          lVar10 = (*_DAT_0ebb1d08)();
        }
        while( true ) {
          local_100 = (undefined1)lVar10;
          uStack_ff = (undefined7)((ulong)lVar10 >> 8);
          func_0x078233e0(param_3,&local_1b0);
          if (local_200 != uStack_1f8) break;
          uVar8 = local_200 + 1;
          uVar11 = uVar17;
          if (uVar8 < 0xaaaaaaaaaaaaaab) {
            uVar11 = local_200 * 2;
            if (uVar11 < uVar8 || uVar11 - uVar8 == 0) {
              uVar11 = uVar8;
            }
            if (0x555555555555554 < local_200) {
              uVar11 = 0xaaaaaaaaaaaaaaa;
            }
            if (uVar11 == 0) {
              lVar10 = 0;
            }
            else {
              if (0xaaaaaaaaaaaaaaa < uVar11) goto LAB_0426c5dc;
              lVar10 = func_0x0000f368(uVar11 * 0x18);
            }
            plVar12 = (long *)(lVar10 + local_200 * 0x18);
            if (plVar12 == (long *)0x0) goto LAB_0426c5d4;
            plVar12[2] = local_a8;
            plVar12[1] = uStack_b0;
            *plVar12 = (long)local_b8;
            plVar13 = plVar12 + local_200 * -3;
            func_0x08009cf8(plVar13,plVar6,local_200 * 0x18);
            local_200 = ((long)(local_200 * 0x18 + 0x18) >> 3) * -0x5555555555555555;
            if (plVar6 != (long *)0x0) {
              func_0x00008eb8(plVar6,uStack_1f8 * 0x18);
            }
            uVar17 = 0xd7f42d3;
            goto LAB_0426c148;
          }
LAB_0426c5d8:
          func_0x01f13d80();
LAB_0426c5dc:
          func_0x04c06020();
          uVar17 = uVar11;
LAB_0426c5e0:
          lVar10 = 0;
        }
        plVar12 = plVar6 + local_200 * 3;
        if (plVar12 == (long *)0x0) {
LAB_0426c5d4:
                    /* WARNING: Does not return */
          pcVar5 = (code *)SoftwareBreakpoint(1,0x426c5d8);
          (*pcVar5)();
        }
        plVar12[2] = local_a8;
        plVar12[1] = uStack_b0;
        *plVar12 = (long)local_b8;
        plVar13 = plVar6;
        uVar11 = uStack_1f8;
LAB_0426c148:
        lVar10 = (long)plVar12 + (0x18 - (long)plVar13);
        if (lVar10 == 0) goto LAB_0426c5d4;
        local_1e0 = (lVar10 >> 3) * -0x5555555555555555;
        local_1e8 = plVar13;
        local_1d8 = uVar11;
        entry(puVar14 + 0x13,&local_1e8,param_3);
        if (plVar13 != (long *)0x0) {
          lVar10 = (long)plVar12 - (long)plVar13;
          uVar17 = local_200;
          do {
            if ((long)plVar13 + lVar10 == 0) goto LAB_0426c5d4;
            puVar7 = (undefined8 *)((long)plVar13 + lVar10);
            if (*(char *)((long)puVar7 + 0x17) < '\0') {
              uVar17 = func_0x00008eb8(uVar17,*puVar7,puVar7[2] << 1);
            }
            lVar10 = lVar10 + -0x18;
          } while (lVar10 != -0x18);
          local_1e0 = 0;
          func_0x00008eb8(uVar17,plVar13,uVar11 * 0x18);
          uVar17 = 0xd7f42d3;
        }
        func_0x071f2c18(&local_1b0);
        uStack_1f8 = uVar11;
      }
      else if ((((*(char *)(puVar14 + 6) != '\0') &&
                (uVar8 = func_0x005a0390(puVar14 + 3,uVar17,6), (uVar8 & 1) == 0)) &&
               (uVar8 = func_0x005a0390(puVar14 + 3,0xd8a2510,0x10), (uVar8 & 1) == 0)) &&
              (uVar8 = func_0x005a0390(puVar14 + 3,0xd9cecf3,8), (uVar8 & 1) == 0)) {
        uStack_d8 = 0;
        local_e0 = 0;
        local_c8 = 0;
        local_d0 = 0;
        uStack_f8 = 0;
        uStack_f7 = 0;
        local_100 = 0;
        uStack_ff = 0;
        local_e8 = 0;
        local_f0 = 0;
        pppuStack_118 = (undefined8 ***)0x0;
        local_120 = 0;
        uStack_108 = 0;
        uStack_107 = 0;
        bStack_101 = 0;
        local_110 = 0;
        uStack_138 = 0;
        local_140 = 0;
        uStack_128 = 0;
        local_130 = 0;
        uStack_158 = 0;
        local_160 = 0;
        uStack_148 = 0;
        uStack_150 = 0;
        uStack_178 = 0;
        local_180 = 0;
        uStack_168 = 0;
        uStack_170 = 0;
        uStack_198 = 0;
        local_1a0 = 0;
        uStack_188 = 0;
        uStack_190 = 0;
        uStack_1a8 = 0;
        local_1b0 = 0;
        func_0x02758480(&uStack_1a8);
        local_f0 = local_f0 & 0xffffffffffffff00;
        local_e8 = local_e8 & 0xffffffffffffff00;
        local_d0 = local_d0 & 0xffffffffffffff00;
        local_c8 = local_c8 & 0xffffffffffff0000;
        uStack_128 = 0;
        local_130 = 0;
        pppuStack_118 = (undefined8 ****)0x0;
        local_120 = 0;
        uStack_108 = 0;
        local_110 = 0;
        uStack_ff = 0;
        uStack_f8 = 0;
        uStack_107 = 0;
        bStack_101 = 0;
        local_100 = 0;
        local_1b0 = local_1b0 & 0xffffffffffff0000;
        if ((*(byte *)(puVar14 + 0x12) & 1) == 0) goto LAB_0426c5d4;
        func_0x004cb90c(&uStack_1a8,puVar14 + 3);
        func_0x02c4de40(&local_130,*param_2,*param_2 + param_2[1] * 0x18,
                        (param_2[1] * 0x18 >> 3) * -0x5555555555555555);
        uVar8 = uStack_b0;
        if (-1 < (long)local_a8) {
          uVar8 = local_a8 >> 0x38;
        }
        if (uVar8 == 0) {
          puVar9 = (undefined8 *)func_0x0066ca88(&uStack_1a8);
          cVar2 = *(char *)((long)puVar9 + 0x17);
          puVar7 = (undefined8 *)*puVar9;
          if (-1 < (long)cVar2) {
            puVar7 = puVar9;
          }
          lVar10 = puVar9[1];
          if (-1 < cVar2) {
            lVar10 = (long)cVar2;
          }
          func_0x008e2310(&local_1d0,puVar7,lVar10);
        }
        else if ((long)local_a8 < 0) {
          func_0x00046bd0(&local_1d0,local_b8);
        }
        else {
          uStack_1c8 = uStack_b0;
          local_1d0 = local_b8;
          local_1c0 = local_a8;
        }
        if ((char)bStack_101 < '\0') {
          uVar8 = uStack_1c8;
          ppppuVar3 = (undefined8 ****)local_1d0;
          if (-1 < (long)local_1c0) {
            uVar8 = (ulong)local_1c0._7_1_;
            ppppuVar3 = &local_1d0;
          }
          func_0x008ce834(&pppuStack_118,ppppuVar3,uVar8);
LAB_0426c550:
          if ((long)local_1c0 < 0) {
            func_0x00008eb8(local_1d0,local_1c0 << 1);
          }
        }
        else {
          if ((long)local_1c0 < 0) {
            func_0x008ce6ec(&pppuStack_118,local_1d0,uStack_1c8);
            goto LAB_0426c550;
          }
          local_110 = uStack_1c8;
          pppuStack_118 = local_1d0;
          uStack_108 = (undefined1)local_1c0;
          uStack_107 = (undefined6)(local_1c0 >> 8);
          bStack_101 = local_1c0._7_1_;
        }
        if (_DAT_0ebb1d08 == (code *)0x42cfe30) {
          dVar16 = (double)func_0x08031990();
          if (dVar16 == 0.0) {
            lVar10 = 0;
          }
          else {
            if (dVar16 == INFINITY) {
                    /* WARNING: Bad instruction - Truncating control flow here */
              halt_baddata();
            }
            dVar16 = (dVar16 + dVar20) * dVar4;
            lVar10 = 0;
            if (-9.223372036854776e+18 <= dVar16) {
              lVar10 = 0x7fffffffffffffff;
            }
            dVar19 = dVar16;
            if (dVar16 <= -9.223372036854776e+18) {
              dVar19 = -9.223372036854776e+18;
            }
            lVar15 = (long)dVar19;
            if (9.223372036854775e+18 < dVar16) {
              lVar15 = lVar10;
            }
            lVar10 = lVar15;
            if (1 < lVar15 + 0x8000000000000001U) {
              lVar10 = 0x7fffffffffffffff;
              if (!SCARRY8(lVar15,0x295e9648864000)) {
                lVar10 = lVar15 + 0x295e9648864000;
              }
            }
          }
        }
        else {
          lVar10 = (*_DAT_0ebb1d08)();
        }
        local_100 = (undefined1)lVar10;
        uStack_ff = (undefined7)((ulong)lVar10 >> 8);
        func_0x078233e0(param_3,&local_1b0);
        func_0x071f2c18(&local_1b0);
      }
      puVar14 = puVar14 + 0x16;
    } while (puVar14 != puVar1);
  }
  return;
}

