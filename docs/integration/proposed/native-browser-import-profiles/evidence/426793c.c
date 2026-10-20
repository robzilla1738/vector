
byte FUN_0426793c(undefined8 param_1,undefined8 *param_2,byte *param_3)

{
  undefined8 ***pppuVar1;
  int iVar2;
  int *piVar3;
  long lVar4;
  undefined8 *puVar5;
  undefined8 local_180 [2];
  undefined7 local_170;
  char cStack_169;
  undefined8 **local_168 [2];
  undefined7 local_158;
  char cStack_151;
  undefined8 local_150;
  undefined8 uStack_148;
  undefined8 uStack_140;
  undefined8 uStack_138;
  undefined8 local_130;
  undefined8 local_120;
  undefined8 uStack_118;
  undefined8 local_110;
  undefined8 uStack_108;
  undefined8 uStack_100;
  undefined8 uStack_f8;
  undefined8 local_f0;
  undefined8 uStack_e8;
  undefined8 uStack_e0;
  undefined8 uStack_d8;
  undefined8 local_d0;
  undefined8 uStack_c8;
  undefined8 uStack_c0;
  undefined8 uStack_b8;
  undefined8 local_b0;
  undefined8 uStack_a8;
  undefined8 uStack_a0;
  undefined8 uStack_98;
  undefined1 auStack_90 [32];
  undefined8 local_70;
  undefined8 uStack_68;
  undefined8 uStack_60;
  undefined8 uStack_58;
  undefined8 local_50;
  undefined8 uStack_48;
  undefined8 uStack_40;
  undefined8 uStack_38;
  
  local_130 = 0;
  uStack_148 = 0;
  local_150 = 0;
  uStack_138 = 0;
  uStack_140 = 0;
  func_0x042600fc(local_180);
  lVar4 = (long)*(char *)((long)param_2 + 0x17);
  puVar5 = param_2;
  if (lVar4 < 0) {
    puVar5 = (undefined8 *)*param_2;
    lVar4 = param_2[1];
  }
  func_0x01699414(local_168,local_180,puVar5,lVar4);
  uStack_a8 = 0;
  local_b0 = 0;
  uStack_98 = 0;
  uStack_a0 = 0;
  uStack_c8 = 0;
  local_d0 = 0;
  uStack_b8 = 0;
  uStack_c0 = 0;
  uStack_e8 = 0;
  local_f0 = 0;
  uStack_d8 = 0;
  uStack_e0 = 0;
  uStack_108 = 0;
  local_110 = 0;
  uStack_f8 = 0;
  uStack_100 = 0;
  uStack_118 = 0;
  local_120 = 0;
  uStack_48 = 0;
  local_50 = 0;
  uStack_38 = 0;
  uStack_40 = 0;
  uStack_68 = 0;
  local_70 = 0;
  uStack_58 = 0;
  uStack_60 = 0;
  func_0x00050c80(auStack_90,0xdb6a642,0xdb6a5ab,0x2d1);
  func_0x00891604(&local_70,auStack_90,0);
  pppuVar1 = (undefined8 ***)local_168[0];
  if (-1 < cStack_151) {
    pppuVar1 = local_168;
  }
  iVar2 = func_0x086edc84(pppuVar1,&local_120);
  func_0x00a6eb84(&local_70);
  if (iVar2 == 0) {
    func_0x00dc0490(&local_150,&local_120);
  }
  if (cStack_151 < '\0') {
    func_0x00008eb8(local_168[0],CONCAT17(cStack_151,local_158) & 0x7fffffffffffffff);
  }
  if (cStack_169 < '\0') {
    func_0x00008eb8(local_180[0],CONCAT17(cStack_169,local_170) & 0x7fffffffffffffff);
  }
  if (iVar2 == 0) {
  }
  else {
    piVar3 = (int *)func_0x08008d34();
    uStack_148._0_1_ = 0;
    *param_3 = *param_3 | *piVar3 == 1;
  }
  return (byte)uStack_148 & 1;
}

