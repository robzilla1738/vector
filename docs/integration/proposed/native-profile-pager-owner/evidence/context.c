
/* WARNING: Control flow encountered bad instruction data */

void entry(long param_1,long param_2,long *param_3)

{
  byte bVar1;
  char cVar2;
  long lVar3;
  undefined8 uVar4;
  
  if (param_3 == (long *)0x0) {
    return;
  }
  if (*(long *)(param_1 + 0x810) == 0) {
    return;
  }
  lVar3 = (**(code **)(*param_3 + 0x68))(param_3);
  if (lVar3 == 0) {
    return;
  }
  if (*(char *)(param_2 + 0x17) < '\0') {
    if (*(long *)(param_2 + 8) == 0) {
      return;
    }
  }
  else if (*(char *)(param_2 + 0x17) == '\0') {
    return;
  }
  if (*(char *)(*(long *)(param_1 + 0x848) + 0x90) == '\0') {
    func_0x0456ee5c(*(undefined8 *)(param_1 + 0x810),param_3,param_2);
  }
  else {
    if ((*(byte *)(param_1 + 0xa08) & 1) == 0) {
      bVar1 = *(byte *)(param_1 + 0xa0c);
      func_0x0456ee5c(*(undefined8 *)(param_1 + 0x810),param_3,param_2);
      if ((bVar1 & 1) == 0) goto LAB_046523cc;
    }
    else {
      func_0x0456ee5c(*(undefined8 *)(param_1 + 0x810),param_3,param_2);
    }
    if ((*(long *)(*(long *)(param_1 + 0x810) + 0x10) != 0) &&
       (*(long *)(*(long *)(param_1 + 0x810) + 0x20) != 0)) {
      cVar2 = *(char *)(param_1 + 0xf90);
      uVar4 = func_0x0000f368(0x18);
      lVar3 = 0;
      if (cVar2 == '\0') {
        lVar3 = param_1;
      }
      func_0x07fb63f4(uVar4,lVar3,2);
      lVar3 = *(long *)(param_1 + 0x818);
      *(undefined8 *)(param_1 + 0x818) = uVar4;
      goto joined_r0x04652480;
    }
  }
LAB_046523cc:
  lVar3 = *(long *)(param_1 + 0x818);
  *(undefined8 *)(param_1 + 0x818) = 0;
joined_r0x04652480:
  if (lVar3 == 0) {
    return;
  }
  func_0x07fb6458();
                    /* WARNING: Bad instruction - Truncating control flow here */
  halt_baddata();
}

