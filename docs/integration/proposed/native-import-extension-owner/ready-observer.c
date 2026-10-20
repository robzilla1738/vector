
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void entry(undefined8 *param_1,long param_2,long param_3)

{
  ulong uVar1;
  ulong uVar2;
  char cVar3;
  code *pcVar4;
  bool bVar5;
  int iVar6;
  undefined8 uVar7;
  long *plVar8;
  undefined4 *puVar9;
  undefined8 *puVar10;
  undefined8 *puVar11;
  undefined8 *puVar12;
  ulong uVar13;
  long lVar14;
  undefined8 *puVar15;
  undefined8 *puVar16;
  undefined8 *puVar17;
  undefined8 uVar18;
  undefined1 auVar19 [16];
  undefined8 *local_80 [4];
  
  lVar14 = param_1[1];
  if (lVar14 == param_2 && param_3 != 0) {
    puVar12 = (undefined8 *)param_1[3];
    if (puVar12 != (undefined8 *)0x0) {
      puVar16 = param_1 + 2;
      puVar10 = *(undefined8 **)(param_3 + 0x228);
      cVar3 = *(char *)((long)puVar10 + 0x17);
      puVar15 = (undefined8 *)*puVar10;
      if (-1 < (long)cVar3) {
        puVar15 = puVar10;
      }
      uVar13 = puVar10[1];
      if (-1 < cVar3) {
        uVar13 = (long)cVar3;
      }
      do {
        while( true ) {
          puVar17 = puVar12 + 4;
          cVar3 = *(char *)((long)puVar12 + 0x37);
          puVar10 = (undefined8 *)*puVar17;
          if (-1 < (long)cVar3) {
            puVar10 = puVar17;
          }
          uVar1 = puVar12[5];
          if (-1 < cVar3) {
            uVar1 = (long)cVar3;
          }
          uVar2 = uVar1;
          if (uVar13 <= uVar1) {
            uVar2 = uVar13;
          }
          iVar6 = func_0x08009860(puVar15,puVar10,uVar2);
          if (iVar6 == 0) break;
          if (iVar6 < 0) goto LAB_0425f388;
LAB_0425f35c:
          puVar12 = (undefined8 *)puVar12[1];
          if (puVar12 == (undefined8 *)0x0) {
            return;
          }
        }
        if (uVar13 == uVar1) {
          if (puVar12 == param_1 + 3) {
            return;
          }
          uVar7 = func_0x02208a74();
          lVar14 = func_0x00052d94(uVar7,lVar14,1);
          if (lVar14 != 0) {
            plVar8 = (long *)(*_DAT_0ed03d68)();
            if (((undefined8 *)*plVar8 == (undefined8 *)0x0) ||
               (puVar15 = *(undefined8 **)*plVar8, puVar15 == (undefined8 *)0x0)) {
                    /* WARNING: Does not return */
              pcVar4 = (code *)SoftwareBreakpoint(0,0x425f5a0);
              (*pcVar4)();
            }
            func_0x00050c80(local_80,0xdb1fa49,0xdb1f202,0x6e7);
            auVar19 = func_0x04df2300(lVar14 + 0x148);
            puVar10 = *(undefined8 **)(param_3 + 0x228);
            puVar9 = (undefined4 *)func_0x0000f368(0x50);
            *puVar9 = 1;
            *(undefined8 *)(puVar9 + 2) = 0x425f77c;
            *(undefined8 *)(puVar9 + 4) = 0x4028920;
            *(undefined8 *)(puVar9 + 6) = 0x255db00;
            *(undefined1 (*) [16])(puVar9 + 10) = auVar19;
            if (*(char *)((long)puVar10 + 0x17) < '\0') {
              func_0x00018218(puVar9 + 0xe,*puVar10,puVar10[1]);
            }
            else {
              uVar18 = puVar10[1];
              uVar7 = *puVar10;
              *(undefined8 *)(puVar9 + 0x12) = puVar10[2];
              *(undefined8 *)(puVar9 + 0x10) = uVar18;
              *(undefined8 *)(puVar9 + 0xe) = uVar7;
            }
            (**(code **)*puVar15)(puVar15,local_80,puVar9,0);
          }
          puVar15 = puVar12;
          puVar10 = (undefined8 *)puVar12[1];
          if ((undefined8 *)puVar12[1] == (undefined8 *)0x0) {
            do {
              puVar11 = (undefined8 *)puVar15[2];
              bVar5 = puVar15 != (undefined8 *)*puVar11;
              puVar15 = puVar11;
            } while (bVar5);
          }
          else {
            do {
              puVar11 = puVar10;
              puVar10 = (undefined8 *)*puVar11;
            } while ((undefined8 *)*puVar11 != (undefined8 *)0x0);
          }
          if ((undefined8 *)*puVar16 == puVar12) {
            *puVar16 = puVar11;
          }
          param_1[4] = param_1[4] + -1;
          func_0x001072cc(param_1[3],puVar12);
          if (puVar17 == (undefined8 *)0x0) {
                    /* WARNING: Does not return */
            pcVar4 = (code *)SoftwareBreakpoint(1,0x425f59c);
            (*pcVar4)();
          }
          if (*(char *)((long)puVar12 + 0x37) < '\0') {
            func_0x00008eb8(puVar12[4],puVar12[6] & 0x7fffffffffffffff);
          }
          func_0x00008eb8(puVar12,0x38);
          if (param_1[4] != 0) {
            return;
          }
          uVar13 = param_1[6];
          if (uVar13 != 0) {
            param_1[6] = 0;
            func_0x01819778(uVar13 + 0x98,param_1[5]);
            if ((uVar13 & 0xfffffffc00000000) == _DAT_0ebb2088) {
              func_0x00022a3c(uVar13);
            }
          }
          if (param_1 == (undefined8 *)0x0) {
            return;
          }
          *param_1 = 0xe266d28;
          func_0x018229c8(param_1 + 5);
          local_80[0] = puVar16;
          func_0x00720aac(local_80,param_1[3]);
          if ((param_1[1] & 0xfffffffc00000000) == _DAT_0ebb2088) {
            func_0x00022a3c();
          }
          func_0x00008eb8(param_1,0x38);
          return;
        }
        if (uVar1 <= uVar13) goto LAB_0425f35c;
LAB_0425f388:
        puVar12 = (undefined8 *)*puVar12;
      } while (puVar12 != (undefined8 *)0x0);
    }
  }
  return;
}


