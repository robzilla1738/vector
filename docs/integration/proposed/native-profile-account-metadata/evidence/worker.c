
/* WARNING: Removing unreachable block (ram,0x04652f84) */
/* WARNING: Removing unreachable block (ram,0x04653164) */

void entry(undefined8 *param_1)

{
  long lVar1;
  code *pcVar2;
  int *piVar3;
  long lVar4;
  long lVar5;
  long lVar6;
  long lVar7;
  undefined8 local_140;
  undefined8 uStack_138;
  undefined8 local_130;
  undefined8 uStack_128;
  undefined8 uStack_120;
  undefined8 uStack_118;
  undefined8 local_110;
  undefined8 uStack_108;
  undefined8 uStack_100;
  undefined8 uStack_f8;
  undefined8 local_f0;
  undefined8 uStack_e8;
  undefined8 uStack_e0;
  int *local_d8;
  long local_d0;
  undefined8 uStack_c8;
  undefined8 uStack_c0;
  undefined8 uStack_b8;
  undefined8 local_b0;
  long lStack_a8;
  long local_a0;
  undefined8 uStack_98;
  long local_90;
  long lStack_88;
  undefined8 uStack_80;
  ulong local_78;
  undefined1 local_68 [24];
  int *local_50;
  undefined1 *puStack_48;
  
  param_1[2] = 0;
  param_1[1] = 0;
  *param_1 = param_1 + 1;
  lStack_88 = 0;
  local_90 = 0;
  local_78 = 0;
  uStack_80 = 0;
  lStack_a8 = 0;
  local_b0 = 0;
  uStack_98 = 0;
  local_a0 = 0;
  uStack_c8 = 0;
  local_d0 = 0;
  uStack_b8 = 0;
  uStack_c0 = 0;
  uStack_e8 = 0;
  local_f0 = 0;
  local_d8 = (int *)0x0;
  uStack_e0 = 0;
  uStack_108 = 0;
  local_110 = 0;
  uStack_f8 = 0;
  uStack_100 = 0;
  uStack_128 = 0;
  local_130 = 0;
  uStack_118 = 0;
  uStack_120 = 0;
  uStack_138 = 0;
  local_140 = 0;
  func_0x04100b88(&local_140);
  if ((char)local_78 != '\0') {
    if ((local_a0 * 5 & 0xfffffffffffffffU) != 0) {
      lVar1 = lStack_a8 + local_a0 * 0x50;
      lVar7 = lStack_a8;
      do {
        if ((local_78 & 1) == 0) goto LAB_04653128;
        lVar5 = (long)*(char *)(lVar7 + 0x2f);
        if (lVar5 < 0) {
          lVar4 = *(long *)(lVar7 + 0x18);
          lVar5 = *(long *)(lVar7 + 0x20);
        }
        else {
          lVar4 = lVar7 + 0x18;
        }
        piVar3 = (int *)func_0x040ff848(&local_140,lVar4,lVar5);
        if (piVar3 == (int *)0x0) {
          if (-1 < *(int *)(lVar7 + 0x30)) {
            if ((local_78 & 1) == 0) goto LAB_04653128;
            piVar3 = local_d8;
            for (lVar5 = local_d0 * 0xc0; lVar5 != 0; lVar5 = lVar5 + -0xc0) {
              if (*piVar3 == *(int *)(lVar7 + 0x30)) goto LAB_04653010;
              piVar3 = piVar3 + 0x30;
            }
          }
          piVar3 = (int *)0x0;
        }
LAB_04653010:
        lVar5 = (long)*(char *)(lVar7 + 0x4f);
        if (lVar5 < 0) {
          lVar4 = *(long *)(lVar7 + 0x38);
          lVar5 = *(long *)(lVar7 + 0x40);
        }
        else {
          lVar4 = lVar7 + 0x38;
        }
        if ((piVar3 != (int *)0x0) && (lVar5 != 0)) {
          if (*(char *)((long)piVar3 + 0x7f) < '\0') {
            if (*(long *)(piVar3 + 0x1c) != 0) {
LAB_04652f94:
              if (((*(byte *)(piVar3 + 0x26) & 1) != 0) || (*(char *)((long)piVar3 + 0x99) != '\0'))
              {
                func_0x00b69378(local_68,lVar4);
                local_50 = piVar3 + 0x1a;
                puStack_48 = local_68;
                func_0x0c652370(param_1,&puStack_48,&local_50);
              }
            }
          }
          else if (*(char *)((long)piVar3 + 0x7f) != '\0') goto LAB_04652f94;
        }
        lVar7 = lVar7 + 0x50;
      } while (lVar7 != lVar1);
      if ((local_78 & 1) == 0) {
LAB_04653128:
                    /* WARNING: Does not return */
        pcVar2 = (code *)SoftwareBreakpoint(1,0x465312c);
        (*pcVar2)();
      }
    }
    if (lStack_88 * 0x38 != 0) {
      lVar1 = local_90 + lStack_88 * 0x38;
      lVar7 = local_90;
      do {
        lVar5 = (long)*(char *)(lVar7 + 0x37);
        if (lVar5 < 0) {
          lVar4 = *(long *)(lVar7 + 0x20);
          lVar5 = *(long *)(lVar7 + 0x28);
        }
        else {
          lVar4 = lVar7 + 0x20;
        }
        if ((local_78 & 1) == 0) goto LAB_04653128;
        lVar6 = local_d0 * 0xc0;
        if (lVar6 != 0) {
          piVar3 = local_d8 + 0x1a;
          do {
            if (piVar3[-0x1a] == *(int *)(lVar7 + 0x18)) {
              if ((lVar5 == 0) || (piVar3 == (int *)0x68)) break;
              if (*(char *)((long)piVar3 + 0x17) < '\0') {
                if (*(long *)(piVar3 + 2) == 0) break;
              }
              else if (*(char *)((long)piVar3 + 0x17) == '\0') break;
              if (((*(byte *)(piVar3 + 0xc) & 1) != 0) || (*(char *)((long)piVar3 + 0x31) != '\0'))
              {
                func_0x00b69378(local_68,lVar4);
                local_50 = piVar3;
                puStack_48 = local_68;
                func_0x0c652370(param_1,&puStack_48,&local_50);
              }
              break;
            }
            piVar3 = piVar3 + 0x30;
            lVar6 = lVar6 + -0xc0;
          } while (lVar6 != 0);
        }
        lVar7 = lVar7 + 0x38;
      } while (lVar7 != lVar1);
      if ((char)local_78 == '\0') {
        return;
      }
    }
    func_0x040ff504(&local_140);
  }
  return;
}

