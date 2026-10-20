
/* WARNING: Control flow encountered bad instruction data */
/* WARNING: Removing unreachable block (ram,0x0425c258) */
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void entry(ulong *param_1,undefined8 *param_2,undefined4 param_3,undefined8 param_4)

{
  ulong uVar1;
  uint uVar2;
  long *plVar3;
  long lVar4;
  undefined8 ******ppppppuVar5;
  byte bVar6;
  char cVar7;
  double dVar8;
  code *pcVar9;
  uint uVar10;
  ulong uVar11;
  undefined8 *puVar12;
  long *plVar13;
  undefined8 *puVar14;
  undefined8 *puVar15;
  undefined8 ******ppppppuVar16;
  long lVar17;
  ulong uVar18;
  ulong uVar19;
  ulong uVar20;
  long lVar21;
  ulong uVar22;
  undefined8 *puVar23;
  undefined8 *puVar24;
  undefined8 uVar25;
  double dVar26;
  undefined8 uVar27;
  double dVar28;
  double dVar29;
  undefined8 *****local_250;
  ulong uStack_248;
  ulong local_240;
  long local_230;
  undefined8 uStack_228;
  ulong local_220;
  undefined8 uStack_218;
  undefined8 uStack_210;
  undefined8 uStack_208;
  undefined8 local_200;
  undefined8 uStack_1f8;
  undefined8 uStack_1f0;
  undefined8 uStack_1e8;
  undefined8 local_1e0;
  undefined8 uStack_1d8;
  undefined8 uStack_1d0;
  undefined8 uStack_1c8;
  undefined8 local_1c0 [2];
  undefined8 local_1b0;
  ulong uStack_1a8;
  ulong local_1a0;
  undefined8 uStack_198;
  undefined8 local_190;
  undefined8 uStack_188;
  undefined8 uStack_180;
  undefined8 uStack_178;
  undefined8 local_170;
  undefined8 uStack_168;
  undefined8 uStack_160;
  undefined8 uStack_158;
  undefined8 local_150;
  undefined8 uStack_148;
  undefined8 local_140;
  undefined8 uStack_138;
  undefined8 *local_130;
  ulong uStack_128;
  ulong local_120;
  undefined8 *****pppppuStack_118;
  ulong uStack_110;
  undefined1 local_108;
  undefined6 uStack_107;
  byte bStack_101;
  undefined1 uStack_100;
  undefined7 uStack_ff;
  undefined1 uStack_f8;
  undefined7 uStack_f7;
  undefined8 uStack_f0;
  undefined8 local_e8;
  undefined8 local_e0;
  undefined8 uStack_d8;
  undefined8 uStack_d0;
  undefined8 local_c8;
  undefined8 *****local_b8;
  ulong uStack_b0;
  undefined8 local_a8;
  
  dVar8 = _DAT_0df4bb58;
  uVar20 = *param_1;
  uVar1 = uVar20 + param_1[1] * 0x20;
  if (uVar1 < uVar20) {
                    /* WARNING: Bad instruction - Truncating control flow here */
    halt_baddata();
  }
  if ((param_1[1] & 0x7ffffffffffffff) != 0) {
    dVar29 = *_DAT_0e028890;
    do {
      if ((uVar20 != 0) && (*(char *)(uVar20 + 0x18) == '\x06')) {
        uVar19 = param_2[1];
        lVar21 = uVar19 * 0x18;
        if (uVar19 != 0) {
          if (uVar19 < 0xaaaaaaaaaaaaaab) {
            puVar23 = (undefined8 *)*param_2;
            puVar12 = (undefined8 *)func_0x0000f368(lVar21);
            puVar24 = puVar12;
            for (lVar17 = lVar21; lVar17 != 0; lVar17 = lVar17 + -0x18) {
              if (puVar24 == (undefined8 *)0x0) goto LAB_0425c994;
              if (*(char *)((long)puVar23 + 0x17) < '\0') {
                func_0x00046bd0(puVar24,*puVar23,puVar23[1]);
              }
              else {
                uVar27 = puVar23[1];
                uVar25 = *puVar23;
                puVar24[2] = puVar23[2];
                puVar24[1] = uVar27;
                *puVar24 = uVar25;
              }
              puVar23 = puVar23 + 3;
              puVar24 = puVar24 + 3;
            }
            uVar22 = ((long)puVar24 - (long)puVar12 >> 3) * -0x5555555555555555;
            goto LAB_0425c304;
          }
LAB_0425c990:
          func_0x01f13d80();
LAB_0425c994:
                    /* WARNING: Does not return */
          pcVar9 = (code *)SoftwareBreakpoint(1,0x425c998);
          (*pcVar9)();
        }
        uVar22 = 0;
        puVar12 = (undefined8 *)0x0;
LAB_0425c304:
        plVar13 = (long *)func_0x02029a80(uVar20,0xd7e4737,4);
        if (plVar13 == (long *)0x0) goto LAB_0425c268;
        puVar23 = (undefined8 *)func_0x02029a80(uVar20,0xd7f2e37,4);
        local_b8 = (undefined8 ******)0x0;
        uStack_b0 = 0;
        local_a8 = 0;
        if (puVar23 != (undefined8 *)0x0) {
          lVar17 = (long)*(char *)((long)puVar23 + 0x17);
          puVar24 = puVar23;
          if (lVar17 < 0) {
            puVar24 = (undefined8 *)*puVar23;
            lVar17 = puVar23[1];
          }
          func_0x008e2310(&local_b8,puVar24,lVar17);
        }
        bVar6 = *(byte *)((long)plVar13 + 0x17);
        uVar11 = plVar13[1];
        if (-1 < (char)bVar6) {
          uVar11 = (ulong)bVar6;
        }
        if (uVar11 == 3) {
          plVar3 = (long *)*plVar13;
          if (-1 < (char)bVar6) {
            plVar3 = plVar13;
          }
          if ((*(char *)((long)plVar3 + 2) != 'l' || (short)*plVar3 != 0x7275) ||
             (puVar23 = (undefined8 *)func_0x02029a80(uVar20,0xd7fd716,3),
             puVar23 == (undefined8 *)0x0)) goto LAB_0425c268;
          local_1c0[0] = 0;
          uStack_1d8 = 0;
          local_1e0 = 0;
          uStack_1c8 = 0;
          uStack_1d0 = 0;
          uStack_1f8 = 0;
          local_200 = 0;
          uStack_1e8 = 0;
          uStack_1f0 = 0;
          uStack_218 = 0;
          local_220 = 0;
          uStack_208 = 0;
          uStack_210 = 0;
          uStack_228 = 0;
          local_230 = 0;
          lVar21 = (long)*(char *)((long)puVar23 + 0x17);
          puVar24 = puVar23;
          if (lVar21 < 0) {
            puVar24 = (undefined8 *)*puVar23;
            lVar21 = puVar23[1];
          }
          func_0x003701d4(&local_230,puVar24,lVar21);
          if (((((char)uStack_218 != '\0') &&
               (uVar11 = func_0x005a0390(&local_230,0xd7f42d3,6), (uVar11 & 1) == 0)) &&
              (uVar11 = func_0x005a0390(&local_230,0xd8a2510,0x10), (uVar11 & 1) == 0)) &&
             (uVar11 = func_0x005a0390(&local_230,0xd9cecf3,8), (uVar11 & 1) == 0)) {
            local_190 = 0;
            uStack_d8 = 0;
            local_e0 = 0;
            uStack_d0 = 0;
            uStack_f7 = 0;
            uStack_f0 = 0;
            uStack_1a8 = 0;
            uStack_198 = 0;
            local_1a0 = 0;
            uStack_188 = 0xffffffff00000000;
            uStack_180 = 0xffffffff00000000;
            uStack_178 = 0xffffffff00000000;
            local_170 = 0xffffffff00000000;
            uStack_168 = 0xffffffff00000000;
            uStack_160 = 0xffffffff00000000;
            uStack_158 = 0xffffffff00000000;
            local_150 = 0xffffffff00000000;
            uStack_148 = 0;
            local_e8 = 0;
            local_c8 = 0;
            uStack_ff = 0;
            uStack_f8 = 0;
            uStack_100 = 0;
            pppppuStack_118 = (undefined8 *****)0x0;
            local_120 = 0;
            local_108 = 0;
            uStack_107 = 0;
            bStack_101 = '\0';
            uStack_110 = 0;
            uStack_138 = 0;
            local_140 = 0;
            uStack_128 = 0;
            local_130 = (undefined8 *)0x0;
            local_1b0 = (undefined8 *)(ulong)(byte)param_3;
            func_0x005f9ae0(&uStack_1a8,&local_230);
            if (local_130 != (undefined8 *)0x0) {
                    /* WARNING: Bad instruction - Truncating control flow here */
              halt_baddata();
            }
            uVar11 = uStack_b0;
            if ((local_a8 & 0x8000000000000000) == 0) {
              uVar11 = local_a8 >> 0x38;
            }
            local_130 = puVar12;
            uStack_128 = uVar22;
            local_120 = uVar19;
            if (uVar11 == 0) {
              puVar24 = (undefined8 *)func_0x0066ca88(&uStack_1a8);
              cVar7 = *(char *)((long)puVar24 + 0x17);
              puVar23 = (undefined8 *)*puVar24;
              if (-1 < (long)cVar7) {
                puVar23 = puVar24;
              }
              lVar21 = puVar24[1];
              if (-1 < cVar7) {
                lVar21 = (long)cVar7;
              }
              func_0x008e2310(&local_250,puVar23,lVar21);
            }
            else {
              uStack_248 = uStack_b0;
              local_250 = local_b8;
              local_240 = local_a8;
              uStack_b0 = 0;
              local_a8 = 0;
              local_b8 = (undefined8 ******)0x0;
            }
            if ((char)bStack_101 < '\0') {
              func_0x00008eb8(pppppuStack_118,
                              CONCAT17(bStack_101,CONCAT61(uStack_107,local_108)) << 1);
            }
            uStack_110 = uStack_248;
            pppppuStack_118 = local_250;
            local_108 = (undefined1)local_240;
            uStack_107 = (undefined6)(local_240 >> 8);
            bStack_101 = (byte)(local_240 >> 0x38);
            puVar23 = (undefined8 *)func_0x02029a80(uVar20,0xdb1f48d,10);
            local_250 = (undefined8 ******)0x0;
            if (puVar23 == (undefined8 *)0x0) {
LAB_0425c87c:
              if (_DAT_0ebb1d08 == (code *)0x42cfe30) {
                dVar26 = (double)func_0x08031990();
                if (dVar26 == 0.0) {
                    /* WARNING: Bad instruction - Truncating control flow here */
                  halt_baddata();
                }
                if (dVar26 == INFINITY) {
                    /* WARNING: Bad instruction - Truncating control flow here */
                  halt_baddata();
                }
                dVar26 = (dVar26 + dVar29) * dVar8;
                ppppppuVar16 = (undefined8 ******)0x0;
                if (-9.223372036854776e+18 <= dVar26) {
                  ppppppuVar16 = (undefined8 ******)0x7fffffffffffffff;
                }
                dVar28 = dVar26;
                if (dVar26 <= -9.223372036854776e+18) {
                  dVar28 = -9.223372036854776e+18;
                }
                ppppppuVar5 = (undefined8 ******)(long)dVar28;
                if (9.223372036854775e+18 < dVar26) {
                  ppppppuVar5 = ppppppuVar16;
                }
                ppppppuVar16 = ppppppuVar5;
                if (1 < (long)ppppppuVar5 + 0x8000000000000001U) {
                  ppppppuVar16 = (undefined8 ******)0x7fffffffffffffff;
                  if (!SCARRY8((long)ppppppuVar5,0x295e9648864000)) {
                    ppppppuVar16 = ppppppuVar5 + 0x52bd2c910c800;
                  }
                }
              }
              else {
                ppppppuVar16 = (undefined8 ******)(*_DAT_0ebb1d08)();
              }
            }
            else {
              lVar21 = (long)*(char *)((long)puVar23 + 0x17);
              puVar24 = puVar23;
              if (lVar21 < 0) {
                puVar24 = (undefined8 *)*puVar23;
                lVar21 = puVar23[1];
              }
              uVar10 = func_0x010a11bc(puVar24,lVar21,&local_250);
              uVar2 = 0;
              if (0 < (long)local_250) {
                uVar2 = uVar10;
              }
              ppppppuVar16 = (undefined8 ******)local_250;
              if ((uVar2 & 1) == 0) goto LAB_0425c87c;
            }
            uStack_100 = SUB81(ppppppuVar16,0);
            uStack_ff = (undefined7)((ulong)ppppppuVar16 >> 8);
            func_0x078233e0(param_4,&local_1b0);
            func_0x071f2c18(&local_1b0);
            uVar19 = 0;
            uVar22 = 0;
            puVar12 = (undefined8 *)0x0;
          }
          func_0x00027cb8(local_1c0,0);
          func_0x00027c78(&uStack_210);
          if ((long)local_220 < 0) {
            func_0x00008eb8(local_230,local_220 & 0x7fffffffffffffff);
          }
        }
        else if (uVar11 == 6) {
          plVar3 = (long *)*plVar13;
          if (-1 < (char)bVar6) {
            plVar3 = plVar13;
          }
          if ((int)*plVar3 == 0x646c6f66 && *(short *)((long)plVar3 + 4) == 0x7265) {
            uVar11 = uStack_b0;
            if ((local_a8 & 0x8000000000000000) == 0) {
              uVar11 = local_a8 >> 0x38;
            }
            uVar18 = uVar19;
            puVar23 = puVar12;
            if (uVar11 != 0) {
              local_190 = 0;
              uStack_d8 = 0;
              local_e0 = 0;
              uStack_d0 = 0;
              uStack_f7 = 0;
              uStack_f0 = 0;
              uStack_1a8 = 0;
              uStack_198 = 0;
              local_1a0 = 0;
              uStack_188 = 0xffffffff00000000;
              uStack_180 = 0xffffffff00000000;
              uStack_178 = 0xffffffff00000000;
              local_170 = 0xffffffff00000000;
              uStack_168 = 0xffffffff00000000;
              uStack_160 = 0xffffffff00000000;
              uStack_158 = 0xffffffff00000000;
              local_150 = 0xffffffff00000000;
              uStack_148 = 0;
              local_e8 = 0;
              local_c8 = 0;
              uStack_ff = 0;
              uStack_f8 = 0;
              uStack_100 = 0;
              pppppuStack_118 = (undefined8 ******)0x0;
              local_120 = 0;
              local_108 = 0;
              uStack_107 = 0;
              bStack_101 = 0;
              uStack_110 = 0;
              uStack_138 = 0;
              local_140 = 0;
              uStack_128 = 0;
              local_130 = (undefined8 *)0x0;
              puVar24 = puVar12 + uVar22 * 3;
              local_1b0 = (undefined8 *)(ulong)CONCAT11(1,(byte)param_3);
              func_0x02c4de40(&local_130,puVar12,puVar24,uVar22);
              if ((char)bStack_101 < '\0') {
                uVar11 = uStack_b0;
                ppppppuVar16 = (undefined8 ******)local_b8;
                if (-1 < (long)local_a8) {
                  uVar11 = (ulong)local_a8._7_1_;
                  ppppppuVar16 = &local_b8;
                }
                func_0x008ce834(&pppppuStack_118,ppppppuVar16,uVar11);
              }
              else if ((long)local_a8 < 0) {
                func_0x008ce6ec(&pppppuStack_118,local_b8,uStack_b0);
              }
              else {
                uStack_110 = uStack_b0;
                pppppuStack_118 = local_b8;
                local_108 = (undefined1)local_a8;
                uStack_107 = (undefined6)(local_a8 >> 8);
                bStack_101 = local_a8._7_1_;
              }
              puVar14 = (undefined8 *)func_0x02029a80(uVar20,0xdb1f48d,10);
              local_230 = 0;
              if (puVar14 == (undefined8 *)0x0) {
LAB_0425c594:
                if (_DAT_0ebb1d08 == (code *)0x42cfe30) {
                  dVar26 = (double)func_0x08031990();
                  if (dVar26 == 0.0) {
                    /* WARNING: Bad instruction - Truncating control flow here */
                    halt_baddata();
                  }
                  if (dVar26 == INFINITY) {
                    /* WARNING: Bad instruction - Truncating control flow here */
                    halt_baddata();
                  }
                  dVar26 = (dVar26 + dVar29) * dVar8;
                  lVar17 = 0;
                  if (-9.223372036854776e+18 <= dVar26) {
                    lVar17 = 0x7fffffffffffffff;
                  }
                  dVar28 = dVar26;
                  if (dVar26 <= -9.223372036854776e+18) {
                    dVar28 = -9.223372036854776e+18;
                  }
                  lVar4 = (long)dVar28;
                  if (9.223372036854775e+18 < dVar26) {
                    lVar4 = lVar17;
                  }
                  lVar17 = lVar4;
                  if (1 < lVar4 + 0x8000000000000001U) {
                    lVar17 = 0x7fffffffffffffff;
                    if (!SCARRY8(lVar4,0x295e9648864000)) {
                      lVar17 = lVar4 + 0x295e9648864000;
                    }
                  }
                }
                else {
                  lVar17 = (*_DAT_0ebb1d08)();
                }
              }
              else {
                lVar17 = (long)*(char *)((long)puVar14 + 0x17);
                puVar15 = puVar14;
                if (lVar17 < 0) {
                  puVar15 = (undefined8 *)*puVar14;
                  lVar17 = puVar14[1];
                }
                uVar10 = func_0x010a11bc(puVar15,lVar17,&local_230);
                uVar2 = 0;
                if (0 < local_230) {
                  uVar2 = uVar10;
                }
                lVar17 = local_230;
                if ((uVar2 & 1) == 0) goto LAB_0425c594;
              }
              uStack_100 = (undefined1)lVar17;
              uStack_ff = (undefined7)((ulong)lVar17 >> 8);
              func_0x078233e0(param_4,&local_1b0);
              if (uVar22 == uVar19) {
                uVar11 = uVar19 + 1;
                if (0xaaaaaaaaaaaaaaa < uVar11) goto LAB_0425c990;
                uVar18 = uVar19 * 2;
                if (uVar18 < uVar11 || uVar18 - uVar11 == 0) {
                  uVar18 = uVar11;
                }
                if (0x555555555555554 < uVar19) {
                  uVar18 = 0xaaaaaaaaaaaaaaa;
                }
                if (uVar18 == 0) {
                    /* WARNING: Bad instruction - Truncating control flow here */
                  halt_baddata();
                }
                if (0xaaaaaaaaaaaaaaa < uVar18) {
                  func_0x04c06020();
                  halt_baddata();
                }
                lVar17 = func_0x0000f368(uVar18 * 0x18);
                puVar24 = (undefined8 *)(lVar17 + uVar19 * 0x18);
                if (puVar24 == (undefined8 *)0x0) goto LAB_0425c994;
                puVar24[2] = local_a8;
                puVar24[1] = uStack_b0;
                *puVar24 = local_b8;
                uStack_b0 = 0;
                local_a8 = 0;
                local_b8 = (undefined8 ******)0x0;
                puVar23 = puVar24 + uVar19 * -3;
                func_0x08009cf8(puVar23,puVar12,uVar22 * 0x18);
                if (puVar12 != (undefined8 *)0x0) {
                  func_0x00008eb8(puVar12,lVar21);
                }
              }
              else {
                if (puVar24 == (undefined8 *)0x0) goto LAB_0425c994;
                puVar24[2] = local_a8;
                puVar24[1] = uStack_b0;
                *puVar24 = local_b8;
                uStack_b0 = 0;
                local_a8 = 0;
                local_b8 = (undefined8 ******)0x0;
              }
              lVar21 = (long)puVar24 + (0x18 - (long)puVar23);
              if (lVar21 == 0) goto LAB_0425c994;
              uVar22 = (lVar21 >> 3) * -0x5555555555555555;
              func_0x071f2c18(&local_1b0);
            }
            lVar21 = func_0x0192ca80(uVar20,0xd94f272,8);
            uVar19 = uVar18;
            puVar12 = puVar23;
            if (lVar21 != 0) {
              local_1b0 = puVar23;
              uStack_1a8 = uVar22;
              local_1a0 = uVar18;
              entry(lVar21,&local_1b0,param_3,param_4);
              if (puVar23 == (undefined8 *)0x0) {
                uVar19 = 0;
                uVar22 = 0;
              }
              else {
                if (uVar22 != 0) {
                  lVar21 = uVar22 * -0x18;
                  puVar24 = puVar23 + uVar22 * 3;
                  do {
                    puVar12 = puVar24 + -3;
                    if (puVar12 == (undefined8 *)0x0) goto LAB_0425c994;
                    if (*(char *)((long)puVar24 + -1) < '\0') {
                      func_0x00008eb8(*puVar12,puVar24[-1] << 1);
                    }
                    lVar21 = lVar21 + 0x18;
                    puVar24 = puVar12;
                  } while (lVar21 != 0);
                }
                uStack_1a8 = 0;
                func_0x00008eb8(puVar23,uVar18 * 0x18);
                uVar19 = 0;
                uVar22 = 0;
                puVar12 = (undefined8 *)0x0;
              }
            }
          }
        }
LAB_0425c268:
        if (puVar12 != (undefined8 *)0x0) {
          if (uVar22 != 0) {
            lVar21 = uVar22 * -0x18;
            puVar23 = puVar12 + uVar22 * 3;
            do {
              puVar24 = puVar23 + -3;
              if (puVar24 == (undefined8 *)0x0) goto LAB_0425c994;
              if (*(char *)((long)puVar23 + -1) < '\0') {
                func_0x00008eb8(*puVar24,puVar23[-1] << 1);
              }
              lVar21 = lVar21 + 0x18;
              puVar23 = puVar24;
            } while (lVar21 != 0);
          }
          func_0x00008eb8(puVar12,uVar19 * 0x18);
        }
      }
      uVar20 = uVar20 + 0x20;
    } while (uVar20 != uVar1);
  }
  return;
}

