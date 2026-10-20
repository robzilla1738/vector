
uint entry(long param_1,long param_2,undefined8 *param_3,ulong param_4)

{
  code *pcVar1;
  uint uVar2;
  int iVar3;
  undefined8 uVar4;
  long *plVar5;
  long lVar6;
  long lVar7;
  undefined8 local_50;
  undefined8 uStack_48;
  long local_40;
  long local_38;
  
  lVar6 = *(long *)(param_1 + 0x6a0);
  if (lVar6 == 0) {
    return 0;
  }
  if ((*(byte *)(param_2 + 0x18) & 1) == 0) {
    return 0;
  }
  if (*(char *)(param_1 + 0x6c0) == '\0') {
    if (*(char *)((long)param_3 + 0x17) < '\0') {
      func_0x00046bd0(&local_50,*param_3,param_3[1]);
    }
    else {
      uStack_48 = param_3[1];
      local_50 = *param_3;
      local_40 = param_3[2];
    }
    lVar6 = func_0x04613074(lVar6,param_2,&local_50);
    if (local_40 < 0) {
      func_0x00008eb8(local_50,local_40 << 1);
    }
    if (lVar6 != 0) {
      if ((((param_4 >> 0x20 & 1) != 0) && (*(long **)(param_1 + 0x468) != (long *)0x0)) &&
         (lVar6 = **(long **)(param_1 + 0x468), 0 < *(int *)(lVar6 + 0x18))) {
        lVar7 = 0;
        do {
          lVar6 = func_0x0105e2f8(lVar6,lVar7);
          if ((lVar6 != 0) && (*(int *)(lVar6 + 0x10) == (int)param_4)) {
            lVar6 = func_0x0105e2f8(**(undefined8 **)(param_1 + 0x468),lVar7);
            if (*(char *)(lVar6 + 0x61) != '\0') {
              func_0x07d524cc(*(undefined8 *)(param_1 + 0x468),lVar7,0);
            }
            break;
          }
          lVar7 = lVar7 + 1;
          lVar6 = **(long **)(param_1 + 0x468);
        } while (lVar7 < *(int *)(lVar6 + 0x18));
      }
      if ((*(long *)(param_1 + 0x458) != 0) &&
         (lVar6 = *(long *)(*(long *)(param_1 + 0x458) + 0x538), lVar6 != 0)) {
        func_0x041d4f20(*(undefined8 *)(lVar6 + 0x68),param_2);
      }
      if (*(long *)(param_1 + 0x6a8) != 0) {
        func_0x046051e4();
      }
      plVar5 = *(long **)(param_1 + 0x6b8);
      if (plVar5 != (long *)0x0) {
        if ((char)plVar5[0x67] != '\0') {
          *(undefined1 *)(plVar5 + 0x67) = 0;
          func_0x02109700(plVar5[0x69],plVar5 + 0x65);
          (**(code **)(plVar5[0x65] + 0x38))(plVar5 + 0x65);
          if (plVar5[0x68] != 0) {
            iVar3 = (**(code **)(plVar5[0x65] + 0x40))(plVar5 + 0x65);
            lVar6 = 0x20;
            if (iVar3 == 0) {
              lVar6 = 0x10;
            }
            (**(code **)(*(long *)plVar5[0x68] + lVar6))((long *)plVar5[0x68],plVar5 + 0x65);
          }
        }
        (**(code **)(*plVar5 + 0xa0))(plVar5,0);
      }
      lVar6 = *(long *)(param_1 + 0xca0);
      *(undefined8 *)(param_1 + 0xca0) = 0;
      if (lVar6 != 0) {
        uVar4 = func_0x07fb6458();
        func_0x00008eb8(uVar4,0x18);
      }
      func_0x0462c188(param_1);
      func_0x04645400(param_1);
      func_0x00630474(param_1,0);
      return 1;
    }
    plVar5 = *(long **)(param_1 + 0x6b8);
    if (plVar5 != (long *)0x0) {
      if ((char)plVar5[0x67] != '\0') {
        *(undefined1 *)(plVar5 + 0x67) = 0;
        func_0x02109700(plVar5[0x69],plVar5 + 0x65);
        (**(code **)(plVar5[0x65] + 0x38))(plVar5 + 0x65);
        if (plVar5[0x68] != 0) {
          iVar3 = (**(code **)(plVar5[0x65] + 0x40))(plVar5 + 0x65);
          lVar6 = 0x20;
          if (iVar3 == 0) {
            lVar6 = 0x10;
          }
          (**(code **)(*(long *)plVar5[0x68] + lVar6))((long *)plVar5[0x68],plVar5 + 0x65);
        }
      }
      (**(code **)(*plVar5 + 0xa0))(plVar5,0);
    }
    lVar6 = *(long *)(param_1 + 0xca0);
    *(undefined8 *)(param_1 + 0xca0) = 0;
    if (lVar6 == 0) {
      return 0;
    }
    uVar4 = func_0x07fb6458();
    func_0x00008eb8(uVar4,0x18);
  }
  else {
    *(undefined1 *)(param_1 + 0x6c0) = 0;
    if ((((param_4 >> 0x20 & 1) != 0) && (*(long **)(param_1 + 0x468) != (long *)0x0)) &&
       (lVar6 = **(long **)(param_1 + 0x468), 0 < *(int *)(lVar6 + 0x18))) {
      lVar7 = 0;
      do {
        lVar6 = func_0x0105e2f8(lVar6,lVar7);
        if ((lVar6 != 0) && (*(int *)(lVar6 + 0x10) == (int)param_4)) {
          lVar6 = func_0x0105e2f8(**(undefined8 **)(param_1 + 0x468),lVar7);
          if (*(char *)(lVar6 + 0x61) != '\0') {
            func_0x07d524cc(*(undefined8 *)(param_1 + 0x468),lVar7,0);
          }
          break;
        }
        lVar7 = lVar7 + 1;
        lVar6 = **(long **)(param_1 + 0x468);
      } while (lVar7 < *(int *)(lVar6 + 0x18));
    }
    if ((*(long *)(param_1 + 0x458) != 0) &&
       (lVar6 = *(long *)(*(long *)(param_1 + 0x458) + 0x538), lVar6 != 0)) {
      func_0x041d4f20(*(undefined8 *)(lVar6 + 0x68),param_2);
    }
    if (*(long *)(param_1 + 0x6a8) != 0) {
      func_0x046051e4();
    }
    lVar6 = *(long *)(param_1 + 0x6d8);
    if ((((lVar6 != 0) && (*(long *)(lVar6 + 0xe0) != 0)) &&
        (*(char *)(*(long *)(lVar6 + 0xe0) + 4) == '\0')) && (*(long *)(lVar6 + 0xe8) != 0)) {
      if ((*(long *)(lVar6 + 0xe0) == 0) || (*(char *)(*(long *)(lVar6 + 0xe0) + 4) != '\0')) {
                    /* WARNING: Does not return */
        pcVar1 = (code *)SoftwareBreakpoint(0,0x462bea4);
        (*pcVar1)();
      }
      lVar7 = *(long *)(*(long *)(lVar6 + 0xe8) + 0x48);
      if (lVar7 != 0) {
        func_0x02b425fc(lVar7,0);
      }
      uVar4 = func_0x02af7344();
      local_38 = lVar6;
      func_0x02219fc4(uVar4,0xa6dee24,0,&local_38);
    }
    func_0x0462c188(param_1);
    func_0x04645400(param_1);
    func_0x00630474(param_1,0);
    if ((*(long *)(param_1 + 0x458) != 0) &&
       (lVar6 = *(long *)(*(long *)(param_1 + 0x458) + 0x538), lVar6 != 0)) {
      uVar2 = func_0x041d522c(*(undefined8 *)(lVar6 + 0x68),param_2);
      return uVar2 ^ 1;
    }
  }
  return 0;
}

