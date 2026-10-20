
void entry(long param_1)

{
  long *plVar1;
  ulong uVar2;
  ulong uVar3;
  char cVar4;
  code *pcVar5;
  int iVar6;
  undefined8 *puVar7;
  long *plVar8;
  undefined8 *puVar9;
  ulong uVar10;
  long lVar11;
  undefined8 uVar12;
  long lVar13;
  long lVar14;
  long lVar15;
  long *plVar16;
  undefined8 local_68 [2];
  undefined7 local_58;
  char cStack_51;
  
  uVar12 = *(undefined8 *)(param_1 + 0x58);
  puVar7 = (undefined8 *)func_0x004bcc4c(uVar12,0xcedd55e,0x1c);
  if (puVar7 != (undefined8 *)0x0) {
    if (puVar7[4] == 0) {
                    /* WARNING: Does not return */
      pcVar5 = (code *)SoftwareBreakpoint(0,0x40f0f38);
      (*pcVar5)();
    }
    local_68[0] = 0;
    plVar8 = *(long **)(*(long *)(puVar7[4] + 0x10) + 0x28);
    if (plVar8 != (long *)0x0) {
      cVar4 = *(char *)((long)puVar7 + 0x17);
      puVar9 = (undefined8 *)*puVar7;
      if (-1 < (long)cVar4) {
        puVar9 = puVar7;
      }
      uVar10 = puVar7[1];
      if (-1 < cVar4) {
        uVar10 = (long)cVar4;
      }
      if (*(code **)(*plVar8 + 0x20) == (code *)0xa45dc) {
        if (plVar8[9] != 0) {
          plVar16 = (long *)(plVar8[9] + 0x10);
          plVar8 = (long *)*plVar16;
joined_r0x040f0d5c:
          if (plVar8 != (long *)0x0) {
            do {
              cVar4 = *(char *)((long)plVar8 + 0x37);
              plVar1 = (long *)plVar8[4];
              if (-1 < (long)cVar4) {
                plVar1 = plVar8 + 4;
              }
              uVar2 = plVar8[5];
              if (-1 < cVar4) {
                uVar2 = (long)cVar4;
              }
              uVar3 = uVar2;
              if (uVar10 <= uVar2) {
                uVar3 = uVar10;
              }
              iVar6 = func_0x08009860(puVar9,plVar1,uVar3);
              if (iVar6 == 0) {
                if (uVar10 == uVar2) {
                  if (plVar8 == plVar16) break;
                  goto LAB_040f0de4;
                }
                if (uVar2 <= uVar10) goto LAB_040f0d68;
              }
              else if (-1 < iVar6) goto LAB_040f0d68;
              plVar8 = (long *)*plVar8;
              if (plVar8 == (long *)0x0) break;
            } while( true );
          }
        }
      }
      else {
        uVar10 = (**(code **)(*plVar8 + 0x20))(plVar8,puVar9,uVar10,local_68);
        if ((uVar10 & 1) != 0) {
LAB_040f0de4:
          iVar6 = func_0x00306500(uVar12,0xcedd55e,0x1c);
          if (iVar6 == 0) goto LAB_040f0dfc;
        }
      }
    }
  }
  if (*(long *)(param_1 + 0x68) != 0) {
    lVar13 = 0;
    lVar15 = *(long *)(param_1 + 0x68) * 0x2b8;
    if (lVar15 != 0) {
      puVar7 = (undefined8 *)(*(long *)(param_1 + 0x60) + 0x28);
      do {
        iVar6 = func_0x0a325ac4(puVar7 + -5);
        if (iVar6 != 0) {
          lVar14 = *(long *)(param_1 + 0x30);
          if (lVar14 == 0) {
                    /* WARNING: Does not return */
            pcVar5 = (code *)SoftwareBreakpoint(0,0x40f0f50);
            (*pcVar5)();
          }
          lVar11 = (long)*(char *)((long)puVar7 + 0x17);
          puVar9 = puVar7;
          if (lVar11 < 0) {
            lVar11 = puVar7[1];
            puVar9 = (undefined8 *)*puVar7;
          }
          func_0x00fa2d08(local_68,puVar9,lVar11);
          lVar14 = func_0x043b9fac(lVar14,local_68);
          if (cStack_51 < '\0') {
            func_0x00008eb8(local_68[0],CONCAT17(cStack_51,local_58) & 0x7fffffffffffffff);
            if (lVar14 != 0) goto LAB_040f0eb0;
LAB_040f0e40:
            plVar8 = *(long **)(param_1 + 0x30);
            if (plVar8 == (long *)0x0) {
                    /* WARNING: Does not return */
              pcVar5 = (code *)SoftwareBreakpoint(0,0x40f0f68);
              (*pcVar5)();
            }
            lVar14 = 0xa8;
          }
          else {
            if (lVar14 == 0) goto LAB_040f0e40;
LAB_040f0eb0:
            if (*(int *)(lVar14 + 0x24) != 0) goto LAB_040f0e40;
            plVar8 = *(long **)(param_1 + 0x30);
            if (plVar8 == (long *)0x0) {
                    /* WARNING: Does not return */
              pcVar5 = (code *)SoftwareBreakpoint(0,0x40f0f74);
              (*pcVar5)();
            }
            lVar14 = 0xb8;
          }
          (**(code **)(*plVar8 + lVar14))(plVar8,puVar7 + -5);
          lVar13 = lVar13 + 1;
        }
        puVar7 = puVar7 + 0x57;
        lVar15 = lVar15 + -0x2b8;
      } while (lVar15 != 0);
    }
    func_0x040f5894(param_1 + 0x1d0,lVar13);
    func_0x040f5460(param_1 + 0x1d0,2);
    plVar8 = *(long **)(param_1 + 0x28);
    if (plVar8 != (long *)0x0) {
      (**(code **)(*plVar8 + 0x50))(plVar8,lVar13);
      return;
    }
                    /* WARNING: Does not return */
    pcVar5 = (code *)SoftwareBreakpoint(0,0x40f0f44);
    (*pcVar5)();
  }
LAB_040f0dfc:
  plVar8 = *(long **)(param_1 + 0x28);
  if (plVar8 != (long *)0x0) {
                    /* WARNING: Could not recover jumptable at 0x040f0e28. Too many branches */
                    /* WARNING: Treating indirect jump as call */
    (**(code **)(*plVar8 + 0x50))(plVar8,0);
    return;
  }
                    /* WARNING: Does not return */
  pcVar5 = (code *)SoftwareBreakpoint(0,0x40f0f5c);
  (*pcVar5)();
LAB_040f0d68:
  plVar8 = (long *)plVar8[1];
  goto joined_r0x040f0d5c;
}


