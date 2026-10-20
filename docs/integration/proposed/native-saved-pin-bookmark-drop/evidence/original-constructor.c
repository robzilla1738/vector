// func FUN_037dfc80 @ 037dfc80 size 23316

/* WARNING: Removing unreachable block (ram,0x037e1e4c) */
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

char * FUN_037dfc80(char *param_1,ulong param_2,undefined8 param_3,undefined8 param_4)

{
  ulong *puVar1;
  byte bVar2;
  qword qVar3;
  undefined8 uVar4;
  qword qVar5;
  undefined8 uVar6;
  undefined8 uVar7;
  code *pcVar8;
  dword dVar9;
  int iVar10;
  uint uVar11;
  int iVar12;
  dword *pdVar13;
  segment_command *psVar14;
  undefined8 uVar15;
  long lVar16;
  int *piVar17;
  dword *pdVar18;
  long lVar19;
  char *pcVar20;
  qword *pqVar21;
  long *plVar22;
  char *pcVar23;
  long *plVar24;
  qword *pqVar25;
  qword *pqVar26;
  qword *pqVar27;
  qword *pqVar28;
  qword *pqVar29;
  qword *pqVar30;
  char *pcVar31;
  int *piVar32;
  qword **ppqVar33;
  char *pcVar34;
  undefined4 uVar35;
  qword *pqVar36;
  qword qVar37;
  long lVar38;
  ulong uVar39;
  ulong *puVar40;
  undefined8 uVar41;
  long *plVar42;
  undefined8 uVar43;
  undefined8 *puVar44;
  char *pcVar45;
  qword *pqVar46;
  undefined1 *puVar47;
  long lVar48;
  ulong uVar49;
  undefined1 auVar50 [16];
  undefined8 local_200;
  undefined1 local_1f4;
  undefined8 local_1c8;
  undefined8 uStack_1c0;
  long local_1b8;
  qword *local_1b0;
  undefined8 uStack_1a8;
  undefined8 local_1a0;
  long local_198;
  undefined8 local_190;
  ulong uStack_188;
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
  qword *local_120;
  undefined1 *puStack_118;
  ulong local_110;
  long local_108;
  ulong local_100;
  undefined8 uStack_f8;
  qword *local_f0;
  char local_e8;
  undefined8 local_e0;
  undefined8 uStack_d8;
  undefined8 uStack_d0;
  undefined8 uStack_c8;
  undefined4 local_b8;
  undefined1 local_b4;
  wchar16 local_b0 [4];
  undefined4 local_a8;
  undefined1 uStack_99;
  undefined4 local_98;
  undefined1 local_94;
  qword *local_90;
  char local_88;
  
  pcVar34 = param_1;
  FUN_03ca3b40(param_1,param_4,param_3,1);
  *(undefined ***)(pcVar34 + 0x518) = &PTR_FUN_0e508ef0;
  *(undefined ***)(pcVar34 + 0x520) = &PTR_FUN_0e2b7f08;
  pdVar13 = &MACH_HEADER.cpusubtype;
  FUN_0000f368();
  *pdVar13 = 0;
  *(undefined1 *)(pdVar13 + 1) = 0;
  if ((pdVar13 != (dword *)0x0) && (dVar9 = *pdVar13, *pdVar13 = dVar9 + 1, dVar9 == 0x7fffffff)) {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e5598);
    (*pcVar8)();
  }
  uVar39 = (long)param_1 + 0x520;
  *(dword **)(param_1 + 0x528) = pdVar13;
  *(ulong *)(param_1 + 0x530) = uVar39;
  *(undefined8 *)(param_1 + 0x558) = 0;
  *(undefined8 *)(param_1 + 0x550) = 0;
  *(long *)(param_1 + 0x548) = (long)param_1 + 0x550;
  *(undefined ***)param_1 = &PTR_LAB_0e722bd0;
  *(undefined ***)(param_1 + 8) = &PTR_LAB_0e7231f8;
  *(undefined ***)(param_1 + 0x10) = &PTR_LAB_0e723220;
  *(undefined ***)(param_1 + 0x68) = &PTR_LAB_0e723258;
  *(undefined ***)(param_1 + 0x70) = &PTR_LAB_0e723288;
  *(undefined ***)(param_1 + 0xb0) = &PTR_LAB_0e7232d8;
  *(undefined ***)(param_1 + 0xd8) = &PTR_LAB_0e723338;
  *(undefined ***)(param_1 + 0xf8) = &PTR_LAB_0e723368;
  *(undefined ***)(param_1 + 0x310) = &PTR_FUN_0e723390;
  *(undefined ***)(param_1 + 0x318) = &PTR_FUN_0e7233c8;
  *(undefined ***)(param_1 + 0x430) = &PTR_FUN_0e723400;
  *(undefined ***)(param_1 + 0x438) = &PTR_LAB_0e723448;
  *(undefined ***)(param_1 + 0x518) = &PTR_LAB_0e723510;
  *(undefined ***)(param_1 + 0x520) = &PTR_LAB_0e723538;
  *(undefined ***)(param_1 + 0x538) = &PTR_FUN_0e723578;
  *(undefined ***)(param_1 + 0x540) = &PTR_LAB_0e7235a0;
  *(undefined ***)(param_1 + 0x560) = &PTR_LAB_0e723640;
  *(undefined ***)(param_1 + 0x568) = &PTR_LAB_0e7236a0;
  *(undefined ***)(param_1 + 0x570) = &PTR_FUN_0e7236c8;
  *(undefined ***)(param_1 + 0x578) = &PTR_LAB_0e723748;
  *(undefined ***)(param_1 + 0x580) = &PTR_LAB_0e723788;
  *(undefined ***)(param_1 + 0x588) = &PTR_LAB_0e723818;
  *(undefined8 *)(param_1 + 0x600) = 0;
  *(undefined8 *)(param_1 + 0x5f8) = 0;
  *(undefined8 *)(param_1 + 0x5e8) = 0;
  *(undefined8 *)(param_1 + 0x5e0) = 0;
  *(undefined8 *)(param_1 + 0x5d8) = 0;
  *(undefined8 *)(param_1 + 0x5d0) = 0;
  *(undefined8 *)(param_1 + 0x5c8) = 0;
  *(undefined8 *)(param_1 + 0x5c0) = 0;
  *(undefined8 *)(param_1 + 0x5b8) = 0;
  *(undefined8 *)(param_1 + 0x5b0) = 0;
  *(undefined8 *)(param_1 + 0x5a8) = 0;
  *(undefined8 *)(param_1 + 0x5a0) = 0;
  *(undefined8 *)(param_1 + 0x598) = 0;
  *(undefined8 *)(param_1 + 0x590) = 0;
  *(char **)(param_1 + 0x5f0) = param_1 + 0x5f8;
  *(undefined ***)(param_1 + 0x608) = &PTR_FUN_0e2b7f08;
  pdVar13 = &MACH_HEADER.cpusubtype;
  FUN_0000f368();
  *pdVar13 = 0;
  *(undefined1 *)(pdVar13 + 1) = 0;
  if ((pdVar13 != (dword *)0x0) && (dVar9 = *pdVar13, *pdVar13 = dVar9 + 1, dVar9 == 0x7fffffff)) {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e55a4);
    (*pcVar8)();
  }
  *(dword **)(param_1 + 0x610) = pdVar13;
  *(long *)(param_1 + 0x618) = (long)param_1 + 0x608;
  *(undefined ***)(param_1 + 0x608) = &PTR_FUN_0e2e7490;
  *(undefined8 *)(param_1 + 0x620) = 0;
  *(undefined8 *)(param_1 + 0x630) = 0;
  *(undefined ***)(param_1 + 0x638) = &PTR_FUN_0e2b7f08;
  pdVar13 = &MACH_HEADER.cpusubtype;
  FUN_0000f368();
  *pdVar13 = 0;
  *(undefined1 *)(pdVar13 + 1) = 0;
  if ((pdVar13 != (dword *)0x0) && (dVar9 = *pdVar13, *pdVar13 = dVar9 + 1, dVar9 == 0x7fffffff)) {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e55b0);
    (*pcVar8)();
  }
  *(dword **)(param_1 + 0x640) = pdVar13;
  *(long *)(param_1 + 0x648) = (long)param_1 + 0x638;
  *(undefined ***)(param_1 + 0x638) = &PTR_FUN_0e2e7490;
  *(undefined8 *)(param_1 + 0x650) = 0;
  *(undefined8 *)(param_1 + 0x668) = 0;
  *(undefined8 *)(param_1 + 0x660) = 0;
  *(undefined8 *)(param_1 + 0x678) = 0;
  *(undefined8 *)(param_1 + 0x670) = 0;
  *(undefined8 *)(param_1 + 0x688) = 0;
  *(undefined8 *)(param_1 + 0x680) = 0;
  *(undefined8 *)(param_1 + 0x690) = 0;
  *(undefined8 *)(param_1 + 0x698) = 15000000;
  *(undefined8 *)(param_1 + 0x6a8) = 0;
  *(undefined8 *)(param_1 + 0x6a0) = 0;
  *(undefined8 *)(param_1 + 0x6b8) = 0;
  *(undefined8 *)(param_1 + 0x6b0) = 0;
  param_1[0x6c0] = 0;
  *(undefined8 *)(param_1 + 0x738) = 0;
  *(undefined8 *)(param_1 + 0x6d0) = 0;
  *(undefined8 *)(param_1 + 0x6c8) = 0;
  *(undefined8 *)(param_1 + 0x6e0) = 0;
  *(undefined8 *)(param_1 + 0x6d8) = 0;
  *(undefined8 *)(param_1 + 0x6f0) = 0;
  *(undefined8 *)(param_1 + 0x6e8) = 0;
  *(undefined8 *)(param_1 + 0x700) = 0;
  *(undefined8 *)(param_1 + 0x6f8) = 0;
  *(undefined8 *)(param_1 + 0x710) = 0;
  *(undefined8 *)(param_1 + 0x708) = 0;
  *(undefined8 *)(param_1 + 0x720) = 0;
  *(undefined8 *)(param_1 + 0x718) = 0;
  *(undefined8 *)(param_1 + 0x730) = 0;
  *(undefined8 *)(param_1 + 0x728) = 0;
  *(undefined8 *)(param_1 + 0x750) = 0;
  *(undefined8 *)(param_1 + 0x748) = 0;
  *(char **)(param_1 + 0x740) = param_1 + 0x748;
  *(undefined2 *)(param_1 + 0x758) = 0;
  param_1[0x75c] = 0;
  param_1[0x7a0] = 0;
  param_1[0x7a4] = 0;
  param_1[0x7a8] = 0;
  param_1[0x7b0] = 0;
  param_1[0x7b8] = 0;
  param_1[0x7c0] = 0;
  *(undefined8 *)(param_1 + 0x7d8) = 0;
  *(undefined8 *)(param_1 + 2000) = 0;
  *(undefined8 *)(param_1 + 0x7c8) = 0;
  *(undefined8 *)(param_1 + 0x7f0) = 0;
  *(undefined8 *)(param_1 + 0x7e8) = 0;
  *(char **)(param_1 + 0x7e0) = param_1 + 0x7e8;
  plVar22 = (long *)(param_1 + 0x810);
  *(undefined8 *)(param_1 + 0x800) = 0;
  *(undefined8 *)(param_1 + 0x7f8) = 0;
  *(undefined2 *)(param_1 + 0x808) = 0;
  *(undefined8 *)(param_1 + 0x818) = 0;
  *(undefined8 *)(param_1 + 0x810) = 0;
  *(undefined8 *)(param_1 + 0x828) = 0;
  *(undefined8 *)(param_1 + 0x820) = 0;
  *(undefined8 *)(param_1 + 0x832) = 0;
  *(undefined8 *)(param_1 + 0x82a) = 0;
  *(undefined4 *)(param_1 + 0x83c) = 5;
  *(undefined8 *)(param_1 + 0x840) = 0;
  if ((param_2 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_2);
  }
  *(ulong *)(param_1 + 0x848) = param_2;
  psVar14 = &segment_command_00000020;
  FUN_0000f368();
  pcVar34 = psVar14->segname + 8;
  pcVar34[0] = '\0';
  pcVar34[1] = '\0';
  pcVar34[2] = '\0';
  pcVar34[3] = '\0';
  pcVar34[4] = '\0';
  pcVar34[5] = '\0';
  pcVar34[6] = '\0';
  pcVar34[7] = '\0';
  psVar14->vmaddr = 0;
  *(undefined ***)psVar14 = &PTR_FUN_0e34a598;
  *(char **)psVar14->segname = pcVar34;
  *(segment_command **)(param_1 + 0x850) = psVar14;
  param_1[0x858] = 0;
  param_1[0x860] = 0;
  *(undefined8 *)(param_1 + 0x868) = 0;
  param_1[0x870] = 0;
  param_1[0x878] = 0;
  if ((uVar39 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc((long)param_1 + 0x520);
  }
  uVar49 = DAT_0ebb2088;
  *(ulong *)(param_1 + 0x880) = uVar39;
  *(undefined8 *)(param_1 + 0x888) = 0;
  param_1[0x890] = 0;
  if (((long)param_1 + 0x560U & 0xfffffffc00000000) == uVar49) {
    FUN_000142fc((long)param_1 + 0x560);
    uVar49 = DAT_0ebb2088;
  }
  *(ulong *)(param_1 + 0x898) = (long)param_1 + 0x560U;
  *(undefined8 *)(param_1 + 0x8a0) = 0;
  if (((long)param_1 + 0x588U & 0xfffffffc00000000) == uVar49) {
    FUN_000142fc((long)param_1 + 0x588);
  }
  uVar39 = (long)param_1 + 0x578;
  *(ulong *)(param_1 + 0x8a8) = (long)param_1 + 0x588U;
  *(undefined8 *)(param_1 + 0x8b0) = 0;
  param_1[0x8b8] = 0;
  param_1[0x8bc] = 0;
  *(undefined4 *)(param_1 + 0x8c0) = 0;
  param_1[0x8c4] = 0;
  *(undefined4 *)(param_1 + 0x8c8) = 0x118;
  *(undefined8 *)(param_1 + 0x8e8) = 0;
  *(undefined8 *)(param_1 + 0x8f8) = 0;
  *(undefined8 *)(param_1 + 0x8f0) = 0;
  *(undefined8 *)(param_1 + 0x8d8) = 0;
  *(undefined8 *)(param_1 + 0x8d0) = 0;
  *(undefined4 *)(param_1 + 0x900) = 0xffffffff;
  *(undefined8 *)(param_1 + 0x910) = 0;
  *(undefined8 *)(param_1 + 0x908) = 0;
  *(undefined8 *)(param_1 + 0x920) = 0;
  *(undefined8 *)(param_1 + 0x918) = 0;
  *(undefined8 *)(param_1 + 0x930) = 0;
  *(undefined8 *)(param_1 + 0x928) = 0;
  *(undefined ***)(param_1 + 0x8e0) = &PTR_FUN_0e2b9520;
  *(undefined8 *)(param_1 + 0x938) = 0;
  *(undefined8 *)(param_1 + 0x958) = 0;
  *(undefined8 *)(param_1 + 0x950) = 0;
  *(undefined8 *)(param_1 + 0x948) = 0;
  *(undefined4 *)(param_1 + 0x960) = 0xffffffff;
  *(undefined8 *)(param_1 + 0x970) = 0;
  *(undefined8 *)(param_1 + 0x968) = 0;
  *(undefined8 *)(param_1 + 0x980) = 0;
  *(undefined8 *)(param_1 + 0x978) = 0;
  *(undefined8 *)(param_1 + 0x990) = 0;
  *(undefined8 *)(param_1 + 0x988) = 0;
  *(undefined ***)(param_1 + 0x940) = &PTR_FUN_0e2b9520;
  *(undefined8 *)(param_1 + 0x998) = 0;
  *(undefined8 *)(param_1 + 0x9b8) = 0;
  *(undefined8 *)(param_1 + 0x9b0) = 0;
  *(undefined8 *)(param_1 + 0x9a8) = 0;
  *(undefined4 *)(param_1 + 0x9c0) = 0xffffffff;
  *(undefined8 *)(param_1 + 0x9d0) = 0;
  *(undefined8 *)(param_1 + 0x9c8) = 0;
  *(undefined8 *)(param_1 + 0x9e0) = 0;
  *(undefined8 *)(param_1 + 0x9d8) = 0;
  *(undefined8 *)(param_1 + 0x9f0) = 0;
  *(undefined8 *)(param_1 + 0x9e8) = 0;
  *(undefined ***)(param_1 + 0x9a0) = &PTR_FUN_0e2b9580;
  param_1[0xa30] = 0;
  param_1[0xa48] = 0;
  *(undefined8 *)(param_1 + 0xa50) = 0;
  *(undefined8 *)(param_1 + 0xa10) = 0;
  *(undefined4 *)(param_1 + 0xa17) = 0;
  *(undefined8 *)(param_1 + 0xa24) = 0;
  *(undefined8 *)(param_1 + 0xa1c) = 0;
  *(undefined8 *)(param_1 + 0xa70) = 0;
  *(undefined8 *)(param_1 + 0xa68) = 0;
  *(undefined8 *)(param_1 + 0xa60) = 0;
  *(undefined8 *)(param_1 + 0xa05) = 0;
  *(undefined8 *)(param_1 + 0xa00) = 0;
  *(undefined8 *)(param_1 + 0x9f8) = 0;
  *(undefined4 *)(param_1 + 0xa78) = 0xffffffff;
  *(undefined8 *)(param_1 + 0xaa8) = 0;
  *(undefined8 *)(param_1 + 0xaa0) = 0;
  *(undefined8 *)(param_1 + 0xa98) = 0;
  *(undefined8 *)(param_1 + 0xa90) = 0;
  *(undefined8 *)(param_1 + 0xa88) = 0;
  *(undefined8 *)(param_1 + 0xa80) = 0;
  *(undefined ***)(param_1 + 0xa58) = &PTR_FUN_0e2b9520;
  *(undefined8 *)(param_1 + 0xab0) = 0;
  if (((long)param_1 + 0x580U & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc((long)param_1 + 0x580);
  }
  *(ulong *)(param_1 + 0xab8) = (long)param_1 + 0x580U;
  *(undefined8 *)(param_1 + 0xac0) = 0;
  *(undefined8 *)(param_1 + 0xad8) = 0;
  *(undefined8 *)(param_1 + 0xad0) = 0;
  *(long *)(param_1 + 0xac8) = (long)param_1 + 0xad0;
  *(undefined8 *)(param_1 + 0xae8) = 0;
  *(undefined8 *)(param_1 + 0xae0) = 0;
  *(undefined8 *)(param_1 + 0xaf8) = 0;
  *(undefined8 *)(param_1 + 0xaf0) = 0;
  *(undefined8 *)(param_1 + 0xb08) = 0;
  *(undefined8 *)(param_1 + 0xb00) = 0;
  *(undefined8 *)(param_1 + 0xb18) = 0;
  *(undefined8 *)(param_1 + 0xb28) = 0;
  *(undefined8 *)(param_1 + 0xb20) = 0;
  *(undefined4 *)(param_1 + 0xb30) = 0xffffffff;
  *(undefined8 *)(param_1 + 0xb40) = 0;
  *(undefined8 *)(param_1 + 0xb38) = 0;
  *(undefined8 *)(param_1 + 0xb50) = 0;
  *(undefined8 *)(param_1 + 0xb48) = 0;
  *(undefined8 *)(param_1 + 0xb60) = 0;
  *(undefined8 *)(param_1 + 0xb58) = 0;
  *(undefined ***)(param_1 + 0xb10) = &PTR_FUN_0e2b9520;
  *(undefined8 *)(param_1 + 0xb68) = 0;
  param_1[0xb70] = 0;
  *(undefined8 *)(param_1 + 0xb88) = 0;
  *(undefined4 *)(param_1 + 0xb8f) = 0;
  *(undefined8 *)(param_1 + 0xb80) = 0;
  *(undefined8 *)(param_1 + 0xb78) = 0;
  *(undefined8 *)(param_1 + 3000) = 0;
  *(undefined8 *)(param_1 + 0xba0) = 0;
  *(undefined8 *)(param_1 + 0xb98) = 0;
  *(undefined8 *)(param_1 + 0xbb0) = 0;
  *(undefined8 *)(param_1 + 0xba8) = 0;
  *(undefined8 *)(param_1 + 0xbd0) = 0;
  *(undefined8 *)(param_1 + 0xbc8) = 0;
  *(undefined8 *)(param_1 + 0xbe0) = 0;
  *(undefined8 *)(param_1 + 0xbd8) = 0;
  *(undefined ***)(param_1 + 0xbc0) = &PTR_FUN_0e508db0;
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  *(char **)(param_1 + 0xbe8) = param_1;
  param_1[0xbf0] = 0;
  param_1[0xbf8] = 0;
  *(undefined8 *)(param_1 + 0xc08) = 0;
  *(undefined8 *)(param_1 + 0xc18) = 0;
  *(undefined4 *)(param_1 + 0xc20) = 0xffffffff;
  *(undefined8 *)(param_1 + 0xc30) = 0;
  *(undefined8 *)(param_1 + 0xc28) = 0;
  *(undefined8 *)(param_1 + 0xc40) = 0;
  *(undefined8 *)(param_1 + 0xc38) = 0;
  *(undefined8 *)(param_1 + 0xc50) = 0;
  *(undefined8 *)(param_1 + 0xc48) = 0;
  *(undefined8 *)(param_1 + 0xc10) = 0;
  *(undefined ***)(param_1 + 0xc00) = &PTR_FUN_0e2b95d8;
  *(undefined8 *)(param_1 + 0xc58) = 0;
  param_1[0xc60] = 0;
  param_1[0xc68] = 0;
  param_1[0xc70] = 0;
  param_1[0xc78] = 0;
  *(undefined8 *)(param_1 + 0xc88) = 0;
  *(undefined8 *)(param_1 + 0xc80) = 0;
  *(undefined8 *)(param_1 + 0xc98) = 0;
  *(undefined8 *)(param_1 + 0xc90) = 0;
  *(undefined8 *)(param_1 + 0xca8) = 0;
  *(undefined8 *)(param_1 + 0xca0) = 0;
  *(undefined8 *)(param_1 + 0xcb8) = 0;
  *(undefined8 *)(param_1 + 0xcb0) = 0;
  *(undefined8 *)(param_1 + 0xcc8) = 0;
  *(undefined8 *)(param_1 + 0xcc0) = 0;
  FUN_0136ec00((long)param_1 + 0xcd0,(long)param_1 + 0x578,0x3c);
  *(undefined ***)(param_1 + 0xcd0) = &PTR_FUN_0e2e1900;
  uVar49 = uVar39 & 0xfffffffc00000000;
  if (uVar49 == DAT_0ebb2088) {
    FUN_000142fc((long)param_1 + 0x578);
  }
  *(ulong *)(param_1 + 0xd18) = uVar39;
  *(undefined4 *)(param_1 + 0xd20) = 1;
  param_1[0xd24] = 0;
  param_1[0xd28] = 0;
  *(undefined8 *)(param_1 + 0xd30) = 0;
  *(undefined8 *)(param_1 + 0xd40) = 0;
  *(undefined8 *)(param_1 + 0xd38) = 0;
  *(undefined8 *)(param_1 + 0xd48) = 120000;
  *(undefined8 *)(param_1 + 0xd50) = 0x3ff0000000000000;
  FUN_0136ec00((long)param_1 + 0xd58,(long)param_1 + 0x578,0x3c);
  *(undefined ***)(param_1 + 0xd58) = &PTR_FUN_0e2e1900;
  if (uVar49 == DAT_0ebb2088) {
    FUN_000142fc((long)param_1 + 0x578);
  }
  *(ulong *)(param_1 + 0xda0) = uVar39;
  *(undefined4 *)(param_1 + 0xda8) = 1;
  param_1[0xdac] = 0;
  param_1[0xdb0] = 0;
  *(undefined8 *)(param_1 + 0xdb8) = 0;
  *(undefined8 *)(param_1 + 0xdc8) = 0;
  *(undefined8 *)(param_1 + 0xdc0) = 0;
  *(undefined8 *)(param_1 + 0xdd0) = 120000;
  *(undefined8 *)(param_1 + 0xdd8) = 0x3ff0000000000000;
  FUN_0136ec00((long)param_1 + 0xde0,(long)param_1 + 0x578,0x3c);
  *(undefined ***)(param_1 + 0xde0) = &PTR_FUN_0e2e1900;
  if (uVar49 == DAT_0ebb2088) {
    FUN_000142fc((long)param_1 + 0x578);
  }
  *(ulong *)(param_1 + 0xe28) = uVar39;
  *(undefined4 *)(param_1 + 0xe30) = 1;
  param_1[0xe34] = 0;
  param_1[0xe38] = 0;
  *(undefined8 *)(param_1 + 0xe40) = 0;
  *(undefined8 *)(param_1 + 0xe50) = 0;
  *(undefined8 *)(param_1 + 0xe48) = 0;
  *(undefined8 *)(param_1 + 0xe58) = 120000;
  *(undefined8 *)(param_1 + 0xe60) = 0x3ff0000000000000;
  FUN_0136ec00((long)param_1 + 0xe68,(long)param_1 + 0x578,0x3c);
  *(undefined ***)(param_1 + 0xe68) = &PTR_FUN_0e2e1900;
  if (uVar49 == DAT_0ebb2088) {
    FUN_000142fc((long)param_1 + 0x578);
  }
  *(ulong *)(param_1 + 0xeb0) = uVar39;
  *(undefined4 *)(param_1 + 0xeb8) = 1;
  param_1[0xebc] = 0;
  param_1[0xec0] = 0;
  *(undefined8 *)(param_1 + 0xec8) = 0;
  *(undefined8 *)(param_1 + 0xed8) = 0;
  *(undefined8 *)(param_1 + 0xed0) = 0;
  *(undefined8 *)(param_1 + 0xee0) = 120000;
  *(undefined8 *)(param_1 + 0xee8) = 0x3ff0000000000000;
  FUN_0136ec00((long)param_1 + 0xef0,(long)param_1 + 0x578,0x3c);
  *(undefined ***)(param_1 + 0xef0) = &PTR_FUN_0e2e1900;
  if (uVar49 == DAT_0ebb2088) {
    FUN_000142fc((long)param_1 + 0x578);
  }
  *(ulong *)(param_1 + 0xf38) = uVar39;
  *(undefined4 *)(param_1 + 0xf40) = 1;
  param_1[0xf44] = 0;
  param_1[0xf48] = 0;
  *(undefined8 *)(param_1 + 0xf50) = 0;
  *(undefined8 *)(param_1 + 0xf60) = 0;
  *(undefined8 *)(param_1 + 0xf58) = 0;
  *(undefined8 *)(param_1 + 0xf68) = 120000;
  *(undefined8 *)(param_1 + 0xf70) = 0x3ff0000000000000;
  param_1[0xf78] = 0;
  param_1[0xf80] = 0;
  param_1[0xf88] = 0;
  param_1[0xf90] = 0;
  param_1[0xff8] = 0;
  param_1[0x101c] = 0;
  param_1[0x1020] = 0;
  param_1[0x1024] = 0;
  param_1[0x1028] = 0;
  param_1[0x102c] = 0;
  *(undefined8 *)(param_1 + 0xfd9) = 0;
  *(undefined8 *)(param_1 + 0xfd1) = 0;
  *(undefined8 *)(param_1 + 0xfc0) = 0;
  *(undefined8 *)(param_1 + 0xfb8) = 0;
  *(undefined8 *)(param_1 + 0xfd0) = 0;
  *(undefined8 *)(param_1 + 0xfc8) = 0;
  *(undefined8 *)(param_1 + 4000) = 0;
  *(undefined8 *)(param_1 + 0xf98) = 0;
  *(undefined8 *)(param_1 + 0xfb0) = 0;
  *(undefined8 *)(param_1 + 0xfa8) = 0;
  *(undefined8 *)(param_1 + 0x1010) = 0;
  *(undefined8 *)(param_1 + 0x1008) = 0;
  *(undefined8 *)(param_1 + 0x1000) = 0;
  param_1[0x1018] = 0;
  *(undefined8 *)(param_1 + 0x1040) = 0;
  *(undefined8 *)(param_1 + 0x1038) = 0;
  *(undefined8 *)(param_1 + 0x1048) = 0;
  *(undefined4 *)(param_1 + 0x1050) = 0xffffffff;
  *(undefined8 *)(param_1 + 0x1060) = 0;
  *(undefined8 *)(param_1 + 0x1058) = 0;
  *(undefined8 *)(param_1 + 0x1070) = 0;
  *(undefined8 *)(param_1 + 0x1068) = 0;
  *(undefined8 *)(param_1 + 0x1080) = 0;
  *(undefined8 *)(param_1 + 0x1078) = 0;
  *(undefined ***)(param_1 + 0x1030) = &PTR_FUN_0e2b9520;
  *(undefined8 *)(param_1 + 0x1090) = 0;
  *(undefined8 *)(param_1 + 0x1088) = 0;
  *(undefined8 *)(param_1 + 0x10a0) = 0;
  *(undefined8 *)(param_1 + 0x1098) = 0;
  *(undefined8 *)(param_1 + 0x10b0) = 0;
  *(undefined8 *)(param_1 + 0x10a8) = 0;
  *(undefined8 *)(param_1 + 0x10c0) = 0;
  *(undefined8 *)(param_1 + 0x10b8) = 0;
  *(undefined8 *)(param_1 + 0x10d0) = 0;
  *(undefined8 *)(param_1 + 0x10c8) = 0;
  *(undefined8 *)(param_1 + 0x10e0) = 0;
  *(undefined8 *)(param_1 + 0x10d8) = 0;
  *(undefined8 *)(param_1 + 0x10e8) = 0;
  *(undefined ***)(param_1 + 0x10f0) = &PTR_FUN_0e508d18;
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  *(char **)(param_1 + 0x10f8) = param_1;
  *(undefined8 *)(param_1 + 0x1110) = 0;
  *(undefined8 *)(param_1 + 0x1108) = 0;
  *(undefined8 *)(param_1 + 0x1120) = 0;
  *(undefined8 *)(param_1 + 0x1118) = 0;
  *(undefined ***)(param_1 + 0x1100) = &PTR_LAB_0e508d50;
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  *(char **)(param_1 + 0x1128) = param_1;
  *(undefined8 *)(param_1 + 0x1130) = 0;
  *(undefined8 *)(param_1 + 0x1140) = 0;
  *(undefined8 *)(param_1 + 0x1150) = 0;
  *(undefined8 *)(param_1 + 0x1148) = 0;
  *(undefined4 *)(param_1 + 0x1158) = 0xffffffff;
  *(undefined8 *)(param_1 + 0x1168) = 0;
  *(undefined8 *)(param_1 + 0x1160) = 0;
  *(undefined8 *)(param_1 + 0x1178) = 0;
  *(undefined8 *)(param_1 + 0x1170) = 0;
  *(undefined8 *)(param_1 + 0x1188) = 0;
  *(undefined8 *)(param_1 + 0x1180) = 0;
  *(undefined ***)(param_1 + 0x1138) = &PTR_FUN_0e2b9520;
  *(undefined8 *)(param_1 + 0x1190) = 0;
  param_1[0x11f0] = 0;
  param_1[0x1280] = 0;
  param_1[0x1288] = 0;
  param_1[0x12a0] = 0;
  param_1[0x12a8] = 0;
  param_1[0x12c0] = 0;
  *(undefined4 *)(param_1 + 0x1198) = 0;
  *(undefined8 *)(param_1 + 0x11d8) = 0;
  *(undefined8 *)(param_1 + 0x11d0) = 0;
  *(undefined8 *)(param_1 + 0x11c8) = 0;
  *(undefined8 *)(param_1 + 0x11c0) = 0;
  *(undefined8 *)(param_1 + 0x11b8) = 0;
  *(undefined8 *)(param_1 + 0x11b0) = 0;
  *(undefined8 *)(param_1 + 0x11a8) = 0;
  *(undefined8 *)(param_1 + 0x11a0) = 0;
  *(undefined8 *)(param_1 + 0x11e2) = 0;
  *(undefined8 *)(param_1 + 0x11da) = 0;
  *(undefined8 *)(param_1 + 0x1308) = 0;
  *(undefined8 *)(param_1 + 0x12f0) = 0;
  *(undefined8 *)(param_1 + 0x12e8) = 0;
  *(undefined8 *)(param_1 + 0x1300) = 0;
  *(undefined8 *)(param_1 + 0x12f8) = 0;
  *(undefined8 *)(param_1 + 0x1320) = 0;
  *(undefined8 *)(param_1 + 0x1318) = 0;
  *(undefined8 *)(param_1 + 0x12d0) = 0;
  *(undefined8 *)(param_1 + 0x12c8) = 0;
  *(undefined8 *)(param_1 + 0x12e0) = 0;
  *(undefined8 *)(param_1 + 0x12d8) = 0;
  *(undefined8 *)(param_1 + 0x1328) = 0;
  *(undefined4 *)(param_1 + 0x1330) = 0xffffffff;
  *(undefined8 *)(param_1 + 0x1340) = 0;
  *(undefined8 *)(param_1 + 0x1338) = 0;
  *(undefined8 *)(param_1 + 0x1350) = 0;
  *(undefined8 *)(param_1 + 0x1348) = 0;
  *(undefined8 *)(param_1 + 0x1360) = 0;
  *(undefined8 *)(param_1 + 0x1358) = 0;
  *(undefined ***)(param_1 + 0x1310) = &PTR_FUN_0e2b9520;
  *(undefined8 *)(param_1 + 0x1368) = 0;
  *(undefined4 *)(param_1 + 0x1370) = 0;
  param_1[0x13a0] = 0;
  param_1[0x13d0] = 0;
  param_1[0x13f8] = 0;
  *(undefined8 *)(param_1 + 0x1380) = 0;
  *(undefined8 *)(param_1 + 0x1378) = 0;
  param_1[5000] = 0;
  *(undefined4 *)(param_1 + 0x13c8) = 0;
  *(undefined8 *)(param_1 + 0x13b0) = 0;
  *(undefined8 *)(param_1 + 0x13a8) = 0;
  *(undefined8 *)(param_1 + 0x13c0) = 0;
  *(undefined8 *)(param_1 + 0x13b8) = 0;
  *(undefined8 *)(param_1 + 0x1400) = 0;
  pdVar13 = &MACH_HEADER.cpusubtype;
  FUN_0000f368();
  *pdVar13 = 0;
  *(undefined1 *)(pdVar13 + 1) = 0;
  if ((pdVar13 != (dword *)0x0) && (dVar9 = *pdVar13, *pdVar13 = dVar9 + 1, dVar9 == 0x7fffffff)) {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e55bc);
    (*pcVar8)();
  }
  *(dword **)(param_1 + 0x1408) = pdVar13;
  *(char **)(param_1 + 0x1410) = param_1;
  uVar15 = 0x188;
  FUN_0000f368();
  FUN_03340e40();
  lVar16 = *(long *)(param_1 + 0x4a0);
  *(undefined8 *)(param_1 + 0x4a0) = uVar15;
  if (lVar16 != 0) {
    FUN_0319ed4c();
    FUN_00008eb8();
  }
  psVar14 = &segment_command_00000020;
  FUN_0000f368();
  uVar39 = *(ulong *)(param_1 + 0x468);
  if ((uVar39 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(uVar39);
  }
  psVar14->cmd = (int)uVar39;
  psVar14->cmdsize = (int)(uVar39 >> 0x20);
  psVar14->segname[0] = -1;
  psVar14->segname[1] = -1;
  psVar14->segname[2] = -1;
  psVar14->segname[3] = -1;
  pdVar13 = &MACH_HEADER.cpusubtype;
  FUN_0000f368();
  *pdVar13 = 0;
  *(undefined1 *)(pdVar13 + 1) = 0;
  if ((pdVar13 != (dword *)0x0) && (dVar9 = *pdVar13, *pdVar13 = dVar9 + 1, dVar9 == 0x7fffffff)) {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e55c8);
    (*pcVar8)();
  }
  *(dword **)(psVar14->segname + 8) = pdVar13;
  psVar14->vmaddr = (qword)psVar14;
  puVar40 = *(ulong **)(param_1 + 0x4a8);
  *(segment_command **)(param_1 + 0x4a8) = psVar14;
  if (puVar40 != (ulong *)0x0) {
    puVar40[3] = 0;
    if (puVar40[2] != 0) {
      *(undefined1 *)(puVar40[2] + 4) = 1;
      piVar17 = (int *)puVar40[2];
      if (piVar17 != (int *)0x0) {
        LOAcquire();
        iVar10 = *piVar17;
        *piVar17 = iVar10 + -1;
        LORelease();
        if (iVar10 == 1) {
          FUN_00008eb8(piVar17,8);
        }
      }
    }
    if ((*puVar40 & 0xfffffffc00000000) == DAT_0ebb2088) {
      FUN_00022a3c();
    }
    FUN_00008eb8(puVar40,0x20);
  }
  lVar16 = *(long *)(param_1 + 0x848);
  uVar39 = 0;
  FUN_00119280();
  if ((uVar39 & 1) == 0) {
    iVar10 = 0xebaa648;
    FUN_00119280();
    if (iVar10 != 0) goto LAB_037e06f0;
LAB_037e06f8:
    uVar15 = 8;
    FUN_0000f368();
    thunk_FUN_0c7aa9d4();
    lVar16 = *(long *)(param_1 + 0xcc0);
    *(undefined8 *)(param_1 + 0xcc0) = uVar15;
    if (lVar16 != 0) {
      thunk_FUN_0c7aaa34();
      FUN_00008eb8();
    }
  }
  else {
LAB_037e06f0:
    if ((*(byte *)(lVar16 + 0x1e0) & 1) == 0) goto LAB_037e06f8;
  }
  pdVar13 = &section_00000108.offset;
  FUN_0000f368();
  *(undefined ***)pdVar13 = &PTR_LAB_0e508f60;
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  uVar39 = DAT_0ebb2088;
  pdVar18 = pdVar13 + 4;
  *(undefined ***)pdVar18 = &PTR_FUN_0e3549f8;
  *(char **)(pdVar13 + 2) = param_1;
  *(undefined8 *)(pdVar13 + 6) = 0;
  *(undefined8 *)(pdVar13 + 8) = 0;
  *(undefined1 *)(pdVar13 + 10) = 0;
  if (((ulong)pdVar18 & 0xfffffffc00000000) == uVar39) {
    FUN_000142fc(pdVar18);
  }
  *(dword **)(pdVar13 + 0xc) = pdVar18;
  *(undefined8 *)(pdVar13 + 0xe) = 0;
  FUN_01edeca0(pdVar18,0);
  *(undefined8 *)(pdVar13 + 0x10) = 0;
  *(undefined8 *)(pdVar13 + 0x12) = 0;
  *(undefined4 *)((long)pdVar13 + 0x57) = 0;
  *(undefined8 *)(pdVar13 + 0x14) = 0;
  *(undefined8 *)(pdVar13 + 0x1a) = 0xffffffff00000000;
  *(undefined8 *)(pdVar13 + 0x18) = 0xffffffff00000000;
  *(undefined8 *)(pdVar13 + 0x1e) = 0xffffffff00000000;
  *(undefined8 *)(pdVar13 + 0x1c) = 0xffffffff00000000;
  *(undefined8 *)(pdVar13 + 0x22) = 0xffffffff00000000;
  *(undefined8 *)(pdVar13 + 0x20) = 0xffffffff00000000;
  *(undefined8 *)(pdVar13 + 0x26) = 0xffffffff00000000;
  *(undefined8 *)(pdVar13 + 0x24) = 0xffffffff00000000;
  *(undefined2 *)(pdVar13 + 0x28) = 0;
  lVar16 = (long)(pdVar13 + 0x34);
  *(undefined8 *)(pdVar13 + 0x2c) = 0;
  *(undefined8 *)(pdVar13 + 0x2a) = 0;
  *(undefined8 *)(pdVar13 + 0x30) = 0;
  *(undefined8 *)(pdVar13 + 0x2e) = 0;
  *(undefined8 *)(pdVar13 + 0x32) = 0;
  *(long *)(pdVar13 + 0x34) = lVar16;
  *(long *)(pdVar13 + 0x36) = lVar16;
  *(undefined8 *)(pdVar13 + 0x38) = 0;
  *(undefined1 *)(pdVar13 + 0x3a) = 0;
  *(undefined8 *)(pdVar13 + 0x3c) = 0;
  pdVar18 = &MACH_HEADER.cpusubtype;
  FUN_0000f368();
  *pdVar18 = 0;
  *(undefined1 *)(pdVar18 + 1) = 0;
  if ((pdVar18 != (dword *)0x0) && (dVar9 = *pdVar18, *pdVar18 = dVar9 + 1, dVar9 == 0x7fffffff)) {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e55d4);
    (*pcVar8)();
  }
  *(dword **)(pdVar13 + 0x3e) = pdVar18;
  *(long *)(pdVar13 + 0x40) = lVar16;
  *(dword **)(pdVar13 + 0x42) = pdVar13 + 0x42;
  *(dword **)(pdVar13 + 0x44) = pdVar13 + 0x42;
  *(undefined8 *)(pdVar13 + 0x48) = 0;
  *(undefined8 *)(pdVar13 + 0x46) = 0;
  *(undefined8 *)(pdVar13 + 0x4c) = 0;
  *(undefined8 *)(pdVar13 + 0x4a) = 0;
  lVar16 = *(long *)(param_1 + 0x6b0);
  *(dword **)(param_1 + 0x6b0) = pdVar13;
  if (lVar16 != 0) {
    FUN_04660ac4();
    FUN_00008eb8();
  }
  lVar16 = 0x198;
  FUN_0000f368();
  FUN_0456db84();
  lVar19 = *plVar22;
  *plVar22 = lVar16;
  if (lVar19 != 0) {
    FUN_0456dd48();
    FUN_00008eb8();
    lVar16 = *plVar22;
  }
  piVar17 = *(int **)(param_1 + 0x1408);
  if ((piVar17 != (int *)0x0) && (iVar10 = *piVar17, *piVar17 = iVar10 + 1, iVar10 == 0x7fffffff)) {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e558c);
    (*pcVar8)();
  }
  uVar15 = *(undefined8 *)(param_1 + 0x1410);
  pqVar46 = &segment_command_00000020.vmsize;
  FUN_0000f368();
  *(undefined4 *)pqVar46 = 1;
  pqVar46[1] = (qword)&LAB_03fbb700;
  pqVar46[2] = (qword)FUN_03f9e440;
  pqVar46[3] = (qword)&LAB_0406a280;
  pqVar46[4] = (qword)&DAT_0462b440;
  pqVar46[5] = 0;
  pqVar46[6] = (qword)piVar17;
  pqVar46[7] = uVar15;
  piVar17 = *(int **)(lVar16 + 0x178);
  *(qword **)(lVar16 + 0x178) = pqVar46;
  if (piVar17 != (int *)0x0) {
    LOAcquire();
    iVar10 = *piVar17;
    *piVar17 = iVar10 + -1;
    LORelease();
    if (iVar10 == 1) {
      pcVar8 = *(code **)(piVar17 + 4);
      if (pcVar8 == FUN_00fa5640) {
        piVar32 = *(int **)(piVar17 + 0xc);
        if (piVar32 != (int *)0x0) {
          LOAcquire();
          iVar10 = *piVar32;
          *piVar32 = iVar10 + -1;
          LORelease();
          if (iVar10 == 1) {
            FUN_00008eb8(piVar32,8);
          }
        }
        uVar15 = 0x48;
      }
      else {
        if (pcVar8 != FUN_0396c600) {
          (*pcVar8)();
          goto LAB_037e08d0;
        }
        uVar15 = 0x38;
      }
      FUN_00008eb8(piVar17,uVar15);
    }
  }
LAB_037e08d0:
  uVar39 = 0x140;
  FUN_0000f368();
  FUN_02a105d0();
  FUN_01b89838(param_1,uVar39);
  if ((uVar39 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(uVar39);
  }
  if ((*(ulong *)(param_1 + 0x840) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(ulong *)(param_1 + 0x840) = uVar39;
  if (*(int *)(uVar39 + 0xf0) != 1) {
    *(undefined4 *)(uVar39 + 0xf0) = 1;
    FUN_01a652b0(uVar39,1);
  }
  if ((*(byte *)(uVar39 + 0xf4) & 1) == 0) {
    *(undefined1 *)(uVar39 + 0xf4) = 1;
    FUN_01a652b0(uVar39,1);
  }
  FUN_03b271c0(&local_1b0,1,5,0,0,5);
  FUN_01c1438c(uVar39 + 0x118,&DAT_0ea05548,&local_1b0);
  FUN_0174ad24(&local_1b0);
  pcVar34 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  pcVar20 = pcVar34;
  FUN_03555540();
  if (pcVar20[0x169] != '\0') {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e5568);
    (*pcVar8)();
  }
  FUN_007793fc(param_1,pcVar34,*(undefined8 *)(param_1 + 0x198));
  if (((ulong)pcVar34 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar34);
  }
  if ((*(ulong *)(param_1 + 0x590) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(char **)(param_1 + 0x590) = pcVar34;
  pcVar34 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  pcVar20 = pcVar34;
  FUN_04604e08();
  if (pcVar20[0x169] != '\0') {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e5574);
    (*pcVar8)();
  }
  FUN_007793fc(param_1,pcVar34,*(undefined8 *)(param_1 + 0x198));
  if (((ulong)pcVar34 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar34);
  }
  if ((*(ulong *)(param_1 + 0x6a8) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(char **)(param_1 + 0x6a8) = pcVar34;
  pqVar46 = &segment_command_00000020.vmsize;
  FUN_0000f368();
  *(undefined4 *)pqVar46 = 1;
  pqVar46[1] = (qword)FUN_01027980;
  pqVar46[2] = (qword)FUN_002f2880;
  pqVar46[3] = (qword)FUN_0255db00;
  pqVar46[4] = (qword)&LAB_03b26c40;
  uVar4 = _UNK_0df40068;
  uVar15 = _DAT_0df40060;
  pqVar46[6] = _UNK_0df40068;
  pqVar46[5] = uVar15;
  *(undefined1 *)(pqVar46 + 7) = 0;
  uStack_1a8 = &DAT_100000001;
  local_1a0 = CONCAT44(local_1a0._4_4_,3);
  local_190 = 0;
  uStack_188 = 0;
  local_198 = 0;
  local_1b0 = pqVar46;
  FUN_01c1438c((long)pcVar34 + 0xd8,&DAT_0ea05548,&local_1b0);
  FUN_0174ad24(&local_1b0);
  uStack_1a8 = (undefined1 *)_UNK_0df47a58;
  local_1b0 = _DAT_0df47a50;
  FUN_01aede60(*(long *)(param_1 + 0x6a8) + 0xd8,&DAT_0ea05488,&local_1b0);
  uVar41 = *(undefined8 *)(param_1 + 0x6a8);
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pcVar34 = segment_command_00000020.segname + 8;
  FUN_0000f368();
  pcVar34[0] = '\x01';
  pcVar34[1] = '\0';
  pcVar34[2] = '\0';
  pcVar34[3] = '\0';
  *(code **)(pcVar34 + 8) = FUN_04660f34;
  *(code **)(pcVar34 + 0x10) = FUN_03963480;
  *(code **)(pcVar34 + 0x18) = FUN_0255db00;
  *(char **)(pcVar34 + 0x28) = param_1;
  FUN_046060ac(uVar41,pcVar34);
  lVar16 = *(long *)(param_1 + 0x6a8);
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar46 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar46 = 1;
  pqVar46[1] = (qword)&LAB_03f39e80;
  pqVar46[2] = (qword)FUN_03899b40;
  pqVar46[3] = (qword)FUN_0255db00;
  pqVar46[4] = (qword)FUN_0462b470;
  pqVar46[5] = 0;
  pqVar46[6] = (qword)param_1;
  piVar17 = *(int **)(lVar16 + 0x528);
  *(qword **)(lVar16 + 0x528) = pqVar46;
  if (piVar17 != (int *)0x0) {
    LOAcquire();
    iVar10 = *piVar17;
    *piVar17 = iVar10 + -1;
    LORelease();
    if (iVar10 == 1) {
      pcVar8 = *(code **)(piVar17 + 4);
      if (pcVar8 == FUN_00fa5640) {
        piVar32 = *(int **)(piVar17 + 0xc);
        if (piVar32 != (int *)0x0) {
          LOAcquire();
          iVar10 = *piVar32;
          *piVar32 = iVar10 + -1;
          LORelease();
          if (iVar10 == 1) {
            FUN_00008eb8(piVar32,8);
          }
        }
        uVar41 = 0x48;
      }
      else {
        if (pcVar8 != FUN_0396c600) {
          (*pcVar8)();
          goto LAB_037e0bd8;
        }
        uVar41 = 0x38;
      }
      FUN_00008eb8(piVar17,uVar41);
    }
  }
LAB_037e0bd8:
  uVar41 = *(undefined8 *)(param_1 + 0x6a8);
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar46 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar46 = 1;
  pqVar46[1] = (qword)&LAB_04660f80;
  pqVar46[2] = (qword)FUN_03899b40;
  pqVar46[3] = (qword)FUN_0255db00;
  pqVar46[4] = (qword)&LAB_0462b5c0;
  pqVar46[5] = 0;
  pqVar46[6] = (qword)param_1;
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar36 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar36 = 1;
  pqVar36[1] = (qword)&LAB_0466102c;
  pqVar36[2] = (qword)FUN_03899b40;
  pqVar36[3] = (qword)FUN_0255db00;
  pqVar36[4] = (qword)FUN_0462ba98;
  pqVar36[5] = 0;
  pqVar36[6] = (qword)param_1;
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar21 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar21 = 1;
  pqVar21[1] = (qword)&LAB_03f39e80;
  pqVar21[2] = (qword)FUN_03899b40;
  pqVar21[3] = (qword)FUN_0255db00;
  pqVar21[4] = (qword)FUN_0462beac;
  pqVar21[5] = 0;
  pqVar21[6] = (qword)param_1;
  FUN_04606ee0(uVar41,pqVar46,pqVar36,pqVar21);
  pcVar34 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  pcVar20 = pcVar34;
  FUN_042455c0();
  if (pcVar20[0x169] != '\0') {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e5580);
    (*pcVar8)();
  }
  FUN_007793fc(param_1,pcVar34,*(undefined8 *)(param_1 + 0x198));
  if (((ulong)pcVar34 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar34);
  }
  if ((*(ulong *)(param_1 + 0x5b0) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(char **)(param_1 + 0x5b0) = pcVar34;
  FUN_0a6a7bcc(pcVar34,1);
  plVar22 = *(long **)(param_1 + 0x5b0);
  if ((*(int *)((long)plVar22 + 0x38c) != 0) || ((int)plVar22[0x72] != 0)) {
    *(undefined8 *)((long)plVar22 + 0x38c) = 0;
    (**(code **)(*plVar22 + 0x308))();
    plVar22 = *(long **)(param_1 + 0x5b0);
  }
  local_1b0 = (qword *)((ulong)local_1b0 & 0xffffffffffffff00);
  uStack_1a8 = (undefined1 *)((ulong)uStack_1a8 & 0xffffffffffffff00);
  FUN_0a6a5dc0(plVar22,&local_1b0);
  FUN_0a6a5fd8(*(undefined8 *)(param_1 + 0x5b0),0);
  pcVar34 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  pcVar20 = pcVar34;
  FUN_07fb6840();
  if (pcVar20[0x409] != '\0') {
    pcVar34[0x409] = 0;
    (**(code **)(**(long **)(pcVar34 + 0x358) + 0xa0))(*(long **)(pcVar34 + 0x358),0);
    FUN_00630474(pcVar34,0);
    FUN_005a117c(pcVar34);
  }
  FUN_0a6a66f0(*(undefined8 *)(param_1 + 0x5b0),pcVar34);
  *(undefined4 *)(*(long *)(param_1 + 0x5b0) + 0x440) = 2;
  FUN_043e9734();
  lVar19 = *(long *)(param_1 + 0x5b0);
  FUN_03b271c0(&local_120,1,3,2,0,5);
  uVar39 = local_100;
  lVar16 = local_108;
  local_1a0 = 0;
  local_1b0 = local_120;
  if (local_120 != (qword *)0x0) {
    iVar10 = (int)*local_120;
    *(int *)local_120 = iVar10 + 1;
    if (iVar10 < 1) {
                    /* WARNING: Does not return */
      pcVar8 = (code *)SoftwareBreakpoint(0,0x37e58b0);
      (*pcVar8)();
    }
    if (iVar10 == 0x7fffffff) {
                    /* WARNING: Does not return */
      pcVar8 = (code *)SoftwareBreakpoint(0,0x37e4b98);
      (*pcVar8)();
    }
  }
  uStack_1a8 = puStack_118;
  local_1a0 = local_110 & 0xffffffff;
  local_190 = 0;
  uStack_188 = 0;
  local_198 = 0;
  if (local_100 != 0) {
    if (0xaaaaaaaaaaaaaaa < local_100) {
                    /* WARNING: Subroutine does not return */
      FUN_04bbe000();
    }
    lVar48 = local_108 + local_100 * 0x18;
    lVar38 = local_100 * 0x18;
    FUN_0000f368();
    local_190 = 0;
    uStack_188 = uVar39;
    local_198 = lVar38;
    FUN_0a6d35c0(&local_198,lVar16,lVar48,uVar39);
  }
  uStack_1a8 = (undefined1 *)CONCAT44(1,(undefined4)uStack_1a8);
  FUN_01c1438c(lVar19 + 0xd8,&DAT_0ea05548,&local_1b0);
  FUN_0174ad24(&local_1b0);
  FUN_0174ad24(&local_120);
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar46 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar46 = 1;
  pqVar46[1] = (qword)&LAB_03fb9300;
  pqVar46[2] = (qword)FUN_03899b40;
  pqVar46[3] = (qword)FUN_0255db00;
  pqVar46[4] = (qword)&LAB_0462bffc;
  pqVar46[5] = 0;
  pqVar46[6] = (qword)param_1;
  pcVar34 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  pcVar20 = pcVar34;
  FUN_0136f140();
  *(undefined ***)pcVar20 = &PTR_LAB_0e724750;
  *(undefined ***)(pcVar20 + 8) = &PTR_LAB_0e724b38;
  *(undefined ***)(pcVar20 + 0x10) = &PTR_FUN_0e724b60;
  *(undefined ***)(pcVar20 + 0x68) = &PTR_setProperty_forKey__0e724b98;
  *(undefined ***)(pcVar20 + 0x70) = &PTR_FUN_0e724bc8;
  *(undefined ***)(pcVar20 + 0xb0) = &PTR_FUN_0e724c18;
  *(undefined ***)(pcVar20 + 0xd8) = &PTR_FUN_0e724c78;
  *(undefined ***)(pcVar20 + 0xf8) = &PTR_FUN_0e724ca8;
  *(qword **)(pcVar20 + 0x310) = pqVar46;
  *(undefined8 *)(pcVar20 + 800) = 0;
  *(undefined8 *)(pcVar20 + 0x330) = 0;
  *(undefined8 *)(pcVar20 + 0x328) = 0;
  *(long *)(pcVar20 + 0x318) = (long)pcVar20 + 800;
  lVar16 = 0x140;
  FUN_0000f368();
  FUN_02a105d0();
  FUN_01b89838(pcVar34,lVar16);
  if (*(int *)(lVar16 + 0xf0) != 1) {
    *(undefined4 *)(lVar16 + 0xf0) = 1;
    FUN_01a652b0(lVar16,1);
  }
  if ((*(byte *)(lVar16 + 0xf4) & 1) == 0) {
    *(undefined1 *)(lVar16 + 0xf4) = 1;
    FUN_01a652b0(lVar16,1);
  }
  local_1b0 = (qword *)CONCAT44(local_1b0._4_4_,3);
  FUN_01a651a4(lVar16 + 0x118,&DAT_0ea05568,&local_1b0);
  FUN_03b271c0(&local_1b0,1,5,0,0,5);
  FUN_01c1438c(lVar16 + 0x118,&DAT_0ea05548,&local_1b0);
  FUN_0174ad24(&local_1b0);
  FUN_0a6a4fc0(*(undefined8 *)(param_1 + 0x5b0),pcVar34);
  if (((ulong)pcVar34 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar34);
  }
  if ((*(ulong *)(param_1 + 0x5c0) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(char **)(param_1 + 0x5c0) = pcVar34;
  lVar16 = *(long *)(param_1 + 0x5b0);
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pcVar34 = segment_command_00000020.segname + 8;
  FUN_0000f368();
  pcVar34[0] = '\x01';
  pcVar34[1] = '\0';
  pcVar34[2] = '\0';
  pcVar34[3] = '\0';
  *(code **)(pcVar34 + 8) = FUN_04661d80;
  *(code **)(pcVar34 + 0x10) = FUN_03963480;
  *(code **)(pcVar34 + 0x18) = FUN_0255db00;
  *(char **)(pcVar34 + 0x28) = param_1;
  FUN_01c0bef0(&local_1b0,lVar16 + 0x3c0,pcVar34);
  FUN_00846ad0((long)param_1 + 0x5b8,&local_1b0);
  pqVar46 = local_1b0;
  if (local_1b0 != (qword *)0x0) {
    local_1b0 = (qword *)0x0;
    (*(code *)pqVar46[1])(pqVar46);
    LOAcquire();
    qVar37 = *pqVar46;
    *(int *)pqVar46 = (int)qVar37 + -1;
    LORelease();
    if ((int)qVar37 == 1) {
      (*(code *)pqVar46[2])(pqVar46);
    }
    if (local_1b0 != (qword *)0x0) {
      LOAcquire();
      qVar37 = *local_1b0;
      *(int *)local_1b0 = (int)qVar37 + -1;
      LORelease();
      if ((int)qVar37 == 1) {
        (*(code *)local_1b0[2])();
      }
    }
  }
  pcVar34 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  FUN_0460f608();
  if ((*(long *)(param_1 + 0x458) == 0) ||
     (plVar22 = *(long **)(*(long *)(*(long *)(param_1 + 0x458) + 0x538) + 0x68),
     plVar22 == (long *)0x0)) {
LAB_037e1104:
    uVar11 = 1;
  }
  else {
    (**(code **)(*plVar22 + 0x148))();
    (**(code **)(*plVar22 + 0x168))();
    if (plVar22 == (long *)0x0) goto LAB_037e1104;
    FUN_00306500();
    uVar11 = (uint)plVar22;
  }
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar46 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar46 = 1;
  pqVar46[1] = (qword)&LAB_03fb3c00;
  pqVar46[2] = (qword)FUN_03899b40;
  pqVar46[3] = (qword)FUN_0255db00;
  pqVar46[4] = (qword)FUN_0462c0a8;
  pqVar46[5] = 0;
  pqVar46[6] = (qword)param_1;
  pcVar20 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  *(undefined ***)pcVar20 = &PTR_LAB_0e724cd0;
  *(undefined ***)(pcVar20 + 8) = &PTR_LAB_0e7250d0;
  *(undefined ***)(pcVar20 + 0x10) = &PTR_FUN_0e7250f8;
  *(undefined ***)(pcVar20 + 0x68) = &PTR_setProperty_forKey__0e725130;
  *(undefined ***)(pcVar20 + 0x70) = &PTR_FUN_0e725160;
  *(undefined ***)(pcVar20 + 0xb0) = &PTR_FUN_0e7251b0;
  *(undefined ***)(pcVar20 + 0xd8) = &PTR_FUN_0e725210;
  *(undefined ***)(pcVar20 + 0xf8) = &PTR_FUN_0e725240;
  *(undefined ***)(pcVar20 + 800) = &PTR_FUN_0e725268;
  local_1a0 = CONCAT17(9,(undefined7)local_1a0);
  if (L"Bookmarks" < (wchar16 *)((long)&local_1a0 + 2U) &&
      &local_1b0 < (qword **)((long)L"Bookmarks" + 1U)) goto LAB_037e1c14;
  local_1a0 = CONCAT44(local_1a0._4_4_,0x73);
  uStack_1a8 = (undefined1 *)u_Bookmarks_0df87ec4._8_8_;
  local_1b0 = (qword *)u_Bookmarks_0df87ec4._0_8_;
  if (((ulong)pcVar20 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar20);
  }
  pqVar36 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar36 = 1;
  pqVar36[1] = (qword)&LAB_03f39e80;
  pqVar36[2] = (qword)FUN_03899b40;
  pqVar36[3] = (qword)FUN_0255db00;
  pqVar36[4] = (qword)FUN_04661df8;
  pqVar36[5] = 0;
  pqVar36[6] = (qword)pcVar20;
  FUN_04662010(pcVar20,&local_1b0,1,pqVar36,4,8,0,0,4);
  if ((long)local_1a0 < 0) {
    FUN_00008eb8(local_1b0,local_1a0 << 1);
  }
  *(undefined ***)pcVar20 = &PTR_LAB_0e724cd0;
  *(undefined ***)(pcVar20 + 8) = &PTR_LAB_0e7250d0;
  *(undefined ***)(pcVar20 + 0x10) = &PTR_FUN_0e7250f8;
  *(undefined ***)(pcVar20 + 0x68) = &PTR_setProperty_forKey__0e725130;
  *(undefined ***)(pcVar20 + 0x70) = &PTR_FUN_0e725160;
  *(undefined ***)(pcVar20 + 0xb0) = &PTR_FUN_0e7251b0;
  *(undefined ***)(pcVar20 + 0xd8) = &PTR_FUN_0e725210;
  *(undefined ***)(pcVar20 + 0xf8) = &PTR_FUN_0e725240;
  *(undefined ***)(pcVar20 + 800) = &PTR_FUN_0e725268;
  *(undefined8 *)(pcVar20 + 0x330) = 0;
  *(ulong *)(pcVar20 + 0x328) = 0;
  FUN_0136ec00((long)pcVar20 + 0x338,(long)pcVar20 + 800,0x3c);
  *(undefined ***)(pcVar20 + 0x338) = &PTR_FUN_0e2e1900;
  if (((long)pcVar20 + 800U & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc((long)pcVar20 + 800);
  }
  *(ulong *)(pcVar20 + 0x380) = (long)pcVar20 + 800U;
  *(undefined4 *)(pcVar20 + 0x388) = 1;
  pcVar20[0x38c] = 0;
  pcVar20[0x390] = 0;
  *(undefined8 *)(pcVar20 + 0x398) = 0;
  *(undefined8 *)(pcVar20 + 0x3a8) = 0;
  *(undefined8 *)(pcVar20 + 0x3a0) = 0;
  *(undefined8 *)(pcVar20 + 0x3b0) = 120000;
  *(undefined8 *)(pcVar20 + 0x3b8) = 0x3ff0000000000000;
  pcVar20[0x3c0] = (char)uVar11;
  pcVar20[0x3c4] = 0;
  pcVar20[0x3c8] = 0;
  *(qword **)(pcVar20 + 0x3d0) = pqVar46;
  lVar16 = *(long *)(*(long *)(pcVar20 + 0x310) + 0x4e0);
  if ((lVar16 != 0) && (*(byte *)(lVar16 + 0x410) != uVar11)) {
    *(char *)(lVar16 + 0x410) = (char)uVar11;
    FUN_0239e964(lVar16 + 0x388,uVar11 ^ 1);
    FUN_005a117c(lVar16);
  }
  if (((ulong)pcVar34 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar34);
  }
  if ((*(ulong *)(pcVar20 + 0x330) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(char **)(pcVar20 + 0x330) = pcVar34;
  lVar16 = *(long *)(pcVar20 + 0x318);
  pcVar34 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  pcVar23 = pcVar34;
  FUN_04666440();
  if (pcVar23[0x169] != '\0') {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e55e0);
    (*pcVar8)();
  }
  FUN_007793fc(lVar16,pcVar34,*(undefined8 *)(lVar16 + 0x198));
  if (((ulong)pcVar34 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar34);
  }
  if ((*(ulong *)(pcVar20 + 0x328) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(char **)(pcVar20 + 0x328) = pcVar34;
  puStack_118 = (undefined1 *)_UNK_0df3abf8;
  local_120 = _DAT_0df3abf0;
  FUN_01aede60(*(long *)(pcVar20 + 0x318) + 0xd8,&DAT_0ea05488,&local_120);
  local_120 = (qword *)0x0;
  puStack_118 = (undefined1 *)0x0;
  FUN_01aede60(*(long *)(pcVar20 + 0x328) + 0xd8,&DAT_0ea05488,&local_120);
  uVar39 = DAT_0ef08030;
  uVar49 = DAT_0ef08030;
  FUN_001f557c(DAT_0ef08030,"force-prefers-reduced-motion");
  if ((uVar49 & 1) == 0) {
    FUN_001f557c(uVar39,"force-prefers-no-reduced-motion");
    if ((uVar39 & 1) == 0) {
      if (((DAT_0ef10329 & 1) == 0) && (FUN_0293e4a4(), (DAT_0ef10329 & 1) == 0)) goto LAB_037e5414;
      if ((DAT_0ef10328 & 1) != 0) goto LAB_037e543c;
    }
    uVar41 = 180000;
  }
  else {
LAB_037e543c:
    uVar41 = 0;
  }
  *(undefined8 *)(pcVar20 + 0x3b0) = uVar41;
  uVar41 = 0x3ff0000000000000;
  if (pcVar20[0x3c0] == '\0') {
    uVar41 = 0;
  }
  if (pcVar20[0x390] != '\0') {
    pcVar20[0x390] = 0;
  }
  *(undefined8 *)(pcVar20 + 0x3a8) = uVar41;
  if (pcVar20[0x348] != '\0') {
    pcVar20[0x348] = 0;
    FUN_02109700(*(undefined8 *)(pcVar20 + 0x358),(long)pcVar20 + 0x338);
    (**(code **)(*(long *)(pcVar20 + 0x338) + 0x38))((long)pcVar20 + 0x338);
    if (*(long *)(pcVar20 + 0x350) != 0) {
      iVar10 = (int)pcVar20 + 0x338;
      (**(code **)(*(long *)(pcVar20 + 0x338) + 0x40))();
      lVar16 = 0x20;
      if (iVar10 == 0) {
        lVar16 = 0x10;
      }
      (**(code **)(**(long **)(pcVar20 + 0x350) + lVar16))
                (*(long **)(pcVar20 + 0x350),(long)pcVar20 + 0x338);
    }
  }
  FUN_046598b0(pcVar20,pcVar20[0x3c0]);
  if (((ulong)pcVar20 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar20);
  }
  if ((*(ulong *)(param_1 + 0x668) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(char **)(param_1 + 0x668) = pcVar20;
  uVar39 = *(ulong *)(pcVar20 + 0x330);
  if ((uVar39 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(uVar39);
  }
  if ((*(ulong *)(param_1 + 0x6a0) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(ulong *)(param_1 + 0x6a0) = uVar39;
  if (pcVar20[0x169] != '\0') {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e55ec);
    (*pcVar8)();
  }
  FUN_007793fc(*(long *)(param_1 + 0x5c0),pcVar20,
               *(undefined8 *)(*(long *)(param_1 + 0x5c0) + 0x198));
  plVar42 = *(long **)(param_1 + 0x668);
  plVar22 = (long *)((long)&MACH_HEADER.magic + 1);
  if ((*(long *)(param_1 + 0x458) != 0) &&
     (plVar24 = *(long **)(*(long *)(*(long *)(param_1 + 0x458) + 0x538) + 0x68),
     plVar24 != (long *)0x0)) {
    (**(code **)(*plVar24 + 0x148))(plVar24,1);
    (**(code **)(*plVar24 + 0x168))();
    if (plVar24 == (long *)0x0) {
      plVar22 = (long *)((long)&MACH_HEADER.magic + 1);
    }
    else {
      FUN_00306500();
      plVar22 = plVar24;
    }
  }
  local_200 = 180000;
  (**(code **)(*plVar42 + 0xa0))(plVar42,plVar22);
  lVar16 = *(long *)(param_1 + 0x668);
  pqVar46 = &segment_command_00000020.vmsize;
  FUN_0000f368();
  *(undefined4 *)pqVar46 = 1;
  pqVar46[1] = (qword)FUN_01027980;
  pqVar46[2] = (qword)FUN_002f2880;
  pqVar46[3] = (qword)FUN_0255db00;
  pqVar46[4] = (qword)&LAB_03b26c40;
  pqVar46[6] = uVar4;
  pqVar46[5] = uVar15;
  *(undefined1 *)(pqVar46 + 7) = 0;
  uStack_1a8 = &DAT_100000001;
  local_1a0._0_4_ = 3;
  local_190 = 0;
  uStack_188 = 0;
  local_198 = 0;
  local_1b0 = pqVar46;
  FUN_01c1438c(lVar16 + 0xd8,&DAT_0ea05548,&local_1b0);
  FUN_0174ad24(&local_1b0);
  FUN_0a6a60f4(*(undefined8 *)(param_1 + 0x6a0),0);
  FUN_0a6a6044(*(undefined8 *)(param_1 + 0x6a0),0);
  lVar16 = *(long *)(param_1 + 0x6a0);
  pqVar46 = &segment_command_00000020.vmsize;
  FUN_0000f368();
  *(undefined4 *)pqVar46 = 1;
  pqVar46[1] = (qword)FUN_01027980;
  pqVar46[2] = (qword)FUN_002f2880;
  pqVar46[3] = (qword)FUN_0255db00;
  pqVar46[4] = (qword)&LAB_03b26c40;
  pqVar46[6] = uVar4;
  pqVar46[5] = uVar15;
  *(undefined1 *)(pqVar46 + 7) = 0;
  uStack_1a8 = &DAT_100000001;
  local_1a0 = CONCAT44(local_1a0._4_4_,3);
  local_190 = 0;
  uStack_188 = 0;
  local_198 = 0;
  local_1b0 = pqVar46;
  FUN_01c1438c(lVar16 + 0xd8,&DAT_0ea05548,&local_1b0);
  FUN_0174ad24(&local_1b0);
  uVar41 = *(undefined8 *)(param_1 + 0x6a0);
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pcVar34 = segment_command_00000020.segname + 8;
  FUN_0000f368();
  pcVar34[0] = '\x01';
  pcVar34[1] = '\0';
  pcVar34[2] = '\0';
  pcVar34[3] = '\0';
  *(code **)(pcVar34 + 8) = FUN_046671a0;
  *(code **)(pcVar34 + 0x10) = FUN_03963480;
  *(code **)(pcVar34 + 0x18) = FUN_0255db00;
  *(char **)(pcVar34 + 0x28) = param_1;
  FUN_04611e20(uVar41,pcVar34);
  uVar41 = *(undefined8 *)(param_1 + 0x6a0);
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar46 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar46 = 1;
  pqVar46[1] = (qword)&LAB_03f39e80;
  pqVar46[2] = (qword)FUN_03899b40;
  pqVar46[3] = (qword)FUN_0255db00;
  pqVar46[4] = (qword)FUN_0462c188;
  pqVar46[5] = 0;
  pqVar46[6] = (qword)param_1;
  FUN_04611f4c(uVar41,pqVar46);
  lVar16 = *(long *)(param_1 + 0x6a0);
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar46 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar46 = 1;
  pqVar46[1] = (qword)&LAB_03f39e80;
  pqVar46[2] = (qword)FUN_03899b40;
  pqVar46[3] = (qword)FUN_0255db00;
  pqVar46[4] = (qword)FUN_0462c2c0;
  pqVar46[5] = 0;
  pqVar46[6] = (qword)param_1;
  piVar17 = *(int **)(lVar16 + 0x898);
  *(qword **)(lVar16 + 0x898) = pqVar46;
  if (piVar17 != (int *)0x0) {
    LOAcquire();
    iVar10 = *piVar17;
    *piVar17 = iVar10 + -1;
    LORelease();
    if (iVar10 == 1) {
      pcVar8 = *(code **)(piVar17 + 4);
      if (pcVar8 == FUN_00fa5640) {
        piVar32 = *(int **)(piVar17 + 0xc);
        if (piVar32 != (int *)0x0) {
          LOAcquire();
          iVar10 = *piVar32;
          *piVar32 = iVar10 + -1;
          LORelease();
          if (iVar10 == 1) {
            FUN_00008eb8(piVar32,8);
          }
        }
        uVar41 = 0x48;
      }
      else {
        if (pcVar8 != FUN_0396c600) {
          (*pcVar8)();
          goto LAB_037e17e8;
        }
        uVar41 = 0x38;
      }
      FUN_00008eb8(piVar17,uVar41);
    }
  }
LAB_037e17e8:
  uVar41 = *(undefined8 *)(param_1 + 0x6a0);
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar46 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar46 = 1;
  pqVar46[1] = (qword)&LAB_03f39e80;
  pqVar46[2] = (qword)FUN_03899b40;
  pqVar46[3] = (qword)FUN_0255db00;
  pqVar46[4] = (qword)FUN_0462ce28;
  pqVar46[5] = 0;
  pqVar46[6] = (qword)param_1;
  FUN_04612080(uVar41,pqVar46);
  uVar41 = *(undefined8 *)(param_1 + 0x6a0);
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar46 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar46 = 1;
  pqVar46[1] = (qword)FUN_046671f0;
  pqVar46[2] = (qword)FUN_03899b40;
  pqVar46[3] = (qword)FUN_0255db00;
  pqVar46[4] = (qword)&LAB_0462d1c0;
  pqVar46[5] = 0;
  pqVar46[6] = (qword)param_1;
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar36 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar36 = 1;
  pqVar36[1] = (qword)&LAB_03fb3c00;
  pqVar36[2] = (qword)FUN_03899b40;
  pqVar36[3] = (qword)FUN_0255db00;
  pqVar36[4] = (qword)FUN_0462d5e0;
  pqVar36[5] = 0;
  pqVar36[6] = (qword)param_1;
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar21 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar21 = 1;
  pqVar21[1] = (qword)&LAB_03f39e80;
  pqVar21[2] = (qword)FUN_03899b40;
  pqVar21[3] = (qword)FUN_0255db00;
  pqVar21[4] = (qword)FUN_0462d8a4;
  pqVar21[5] = 0;
  pqVar21[6] = (qword)param_1;
  FUN_046121ac(uVar41,pqVar46,pqVar36,pqVar21);
  lVar16 = *(long *)(param_1 + 0x5c0);
  pcVar34 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  pcVar20 = pcVar34;
  FUN_0136f140();
  *(undefined ***)pcVar20 = &PTR_LAB_0e726ab0;
  *(undefined ***)(pcVar20 + 8) = &PTR_LAB_0e726e98;
  *(undefined ***)(pcVar20 + 0x10) = &PTR_LAB_0e726ec0;
  *(undefined ***)(pcVar20 + 0x68) = &PTR_setProperty_forKey__0e726ef8;
  *(undefined ***)(pcVar20 + 0x70) = &PTR_LAB_0e726f28;
  *(undefined ***)(pcVar20 + 0xb0) = &PTR_LAB_0e726f78;
  *(undefined ***)(pcVar20 + 0xd8) = &PTR_LAB_0e726fd8;
  *(undefined ***)(pcVar20 + 0xf8) = &PTR_LAB_0e727008;
  FUN_027d1a60();
  if (pcVar34[0x1a9] != '\0') {
    pcVar34[0x1a9] = 0;
    FUN_00f27fd0(pcVar20 + 0xf8,(long)pcVar34 + 0x1a9);
  }
  if (pcVar34[0x169] != '\0') {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e55f8);
    (*pcVar8)();
  }
  FUN_007793fc(lVar16,pcVar34,*(undefined8 *)(lVar16 + 0x198));
  if (((ulong)pcVar34 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar34);
  }
  if ((*(ulong *)(param_1 + 0x6d0) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(char **)(param_1 + 0x6d0) = pcVar34;
  (**(code **)(*(long *)pcVar34 + 0xa0))(pcVar34,0);
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar46 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar46 = 1;
  pqVar46[1] = (qword)&LAB_0466ada0;
  pqVar46[2] = (qword)FUN_03899b40;
  pqVar46[3] = (qword)FUN_0255db00;
  pqVar46[4] = (qword)FUN_0462d99c;
  pqVar46[5] = 0;
  pqVar46[6] = (qword)param_1;
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar36 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar36 = 1;
  pqVar36[1] = (qword)&LAB_0466ada0;
  pqVar36[2] = (qword)FUN_03899b40;
  pqVar36[3] = (qword)FUN_0255db00;
  pqVar36[4] = (qword)&LAB_0462e4bc;
  pqVar36[5] = 0;
  pqVar36[6] = (qword)param_1;
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar21 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar21 = 1;
  pqVar21[1] = (qword)&LAB_0466ada0;
  pqVar21[2] = (qword)FUN_03899b40;
  pqVar21[3] = (qword)FUN_0255db00;
  pqVar21[4] = (qword)&LAB_0462e9d8;
  pqVar21[5] = 0;
  pqVar21[6] = (qword)param_1;
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar25 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar25 = 1;
  pqVar25[1] = (qword)&LAB_0466ae30;
  pqVar25[2] = (qword)FUN_03899b40;
  pqVar25[3] = (qword)FUN_0255db00;
  pqVar25[4] = (qword)&LAB_0462ea30;
  pqVar25[5] = 0;
  pqVar25[6] = (qword)param_1;
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar26 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar26 = 1;
  pqVar26[1] = (qword)&LAB_03f39e80;
  pqVar26[2] = (qword)FUN_03899b40;
  pqVar26[3] = (qword)FUN_0255db00;
  pqVar26[4] = (qword)FUN_0c7859a8;
  pqVar26[5] = 0;
  pqVar26[6] = (qword)param_1;
  if ((*(long *)(param_1 + 0x458) == 0) ||
     (plVar22 = *(long **)(*(long *)(*(long *)(param_1 + 0x458) + 0x538) + 0x68),
     plVar22 == (long *)0x0)) {
LAB_037e1c18:
    local_1f4 = 1;
  }
  else {
    (**(code **)(*plVar22 + 0x148))();
    (**(code **)(*plVar22 + 0x168))();
    if (plVar22 == (long *)0x0) goto LAB_037e1c18;
    FUN_00306500();
    local_1f4 = SUB81(plVar22,0);
  }
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar27 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar27 = 1;
  pqVar27[1] = (qword)&LAB_03fb3c00;
  pqVar27[2] = (qword)FUN_03899b40;
  pqVar27[3] = (qword)FUN_0255db00;
  pqVar27[4] = (qword)FUN_0462f2f8;
  pqVar27[5] = 0;
  pqVar27[6] = (qword)param_1;
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar28 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar28 = 1;
  pqVar28[1] = (qword)&LAB_03f39e80;
  pqVar28[2] = (qword)FUN_03899b40;
  pqVar28[3] = (qword)FUN_0255db00;
  pqVar28[4] = (qword)FUN_0462f3d8;
  pqVar28[5] = 0;
  pqVar28[6] = (qword)param_1;
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar29 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar29 = 1;
  pqVar29[1] = (qword)&LAB_03fb9300;
  pqVar29[2] = (qword)FUN_03899b40;
  pqVar29[3] = (qword)FUN_0255db00;
  pqVar29[4] = (qword)FUN_0462fb38;
  pqVar29[5] = 0;
  pqVar29[6] = (qword)param_1;
  pcVar34 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  *(undefined ***)pcVar34 = &PTR_LAB_0e727030;
  *(undefined ***)(pcVar34 + 8) = &PTR_LAB_0e727430;
  *(undefined ***)(pcVar34 + 0x10) = &PTR_LAB_0e727458;
  *(undefined ***)(pcVar34 + 0x68) = &PTR_setProperty_forKey__0e727490;
  *(undefined ***)(pcVar34 + 0x70) = &PTR_LAB_0e7274c0;
  *(undefined ***)(pcVar34 + 0xb0) = &PTR_LAB_0e727510;
  *(undefined ***)(pcVar34 + 0xd8) = &PTR_LAB_0e727570;
  *(undefined ***)(pcVar34 + 0xf8) = &PTR_LAB_0e7275a0;
  *(undefined ***)(pcVar34 + 800) = &PTR_LAB_0e7275c8;
  uStack_99 = 5;
  if (L"Chats" < (wchar16 *)((long)&local_a8 + 2U) && local_b0 < (wchar16 *)((long)L"Chats" + 1U))
  goto LAB_037e1c14;
  local_a8 = 0x73;
  local_b0[0] = u_Chats_0df87ed8[0];
  local_b0[1] = u_Chats_0df87ed8[1];
  local_b0[2] = u_Chats_0df87ed8[2];
  local_b0[3] = u_Chats_0df87ed8[3];
  if (((ulong)pcVar34 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar34);
  }
  pqVar30 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar30 = 1;
  pqVar30[1] = (qword)&LAB_03f39e80;
  pqVar30[2] = (qword)FUN_03899b40;
  pqVar30[3] = (qword)FUN_0255db00;
  pqVar30[4] = (qword)FUN_04667530;
  pqVar30[5] = 0;
  pqVar30[6] = (qword)pcVar34;
  FUN_04662010(pcVar34,local_b0,1,pqVar30,4,8,pqVar29,0,2);
  *(undefined ***)pcVar34 = &PTR_LAB_0e727030;
  *(undefined ***)(pcVar34 + 8) = &PTR_LAB_0e727430;
  *(undefined ***)(pcVar34 + 0x10) = &PTR_LAB_0e727458;
  *(undefined ***)(pcVar34 + 0x68) = &PTR_setProperty_forKey__0e727490;
  *(undefined ***)(pcVar34 + 0x70) = &PTR_LAB_0e7274c0;
  *(undefined ***)(pcVar34 + 0xb0) = &PTR_LAB_0e727510;
  *(undefined ***)(pcVar34 + 0xd8) = &PTR_LAB_0e727570;
  *(undefined ***)(pcVar34 + 0xf8) = &PTR_LAB_0e7275a0;
  *(undefined ***)(pcVar34 + 800) = &PTR_LAB_0e7275c8;
  *(qword **)(pcVar34 + 0x328) = pqVar46;
  *(qword **)(pcVar34 + 0x330) = pqVar36;
  *(qword **)(pcVar34 + 0x338) = pqVar21;
  *(qword **)(pcVar34 + 0x340) = pqVar25;
  *(qword **)(pcVar34 + 0x348) = pqVar27;
  *(qword **)(pcVar34 + 0x350) = pqVar28;
  puVar40 = (ulong *)(pcVar34 + 0x358);
  *(undefined8 *)(pcVar34 + 0x3a8) = 0;
  *(undefined8 *)(pcVar34 + 0x360) = 0;
  *puVar40 = 0;
  *(undefined8 *)(pcVar34 + 0x370) = 0;
  *(undefined8 *)(pcVar34 + 0x368) = 0;
  *(undefined8 *)(pcVar34 + 0x380) = 0;
  *(undefined8 *)(pcVar34 + 0x378) = 0;
  *(undefined8 *)(pcVar34 + 0x390) = 0;
  *(undefined8 *)(pcVar34 + 0x388) = 0;
  *(undefined8 *)(pcVar34 + 0x3a0) = 0;
  *(undefined8 *)(pcVar34 + 0x398) = 0;
  FUN_0136ec00((long)pcVar34 + 0x3b0,(long)pcVar34 + 800,0x3c);
  *(undefined ***)(pcVar34 + 0x3b0) = &PTR_FUN_0e2e1900;
  if (((long)pcVar34 + 800U & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc((long)pcVar34 + 800);
  }
  *(ulong *)(pcVar34 + 0x3f8) = (long)pcVar34 + 800U;
  *(undefined4 *)(pcVar34 + 0x400) = 1;
  pcVar34[0x404] = 0;
  pcVar34[0x408] = 0;
  *(undefined8 *)(pcVar34 + 0x410) = 0;
  *(undefined8 *)(pcVar34 + 0x420) = 0;
  *(undefined8 *)(pcVar34 + 0x418) = 0;
  *(undefined8 *)(pcVar34 + 0x428) = 120000;
  *(undefined8 *)(pcVar34 + 0x430) = 0x3ff0000000000000;
  pcVar34[0x438] = local_1f4;
  uVar43 = *(undefined8 *)(pcVar34 + 0x310);
  pqVar46 = (qword *)(segment_command_00000020.segname + 8);
  FUN_0000f368();
  uVar7 = u_Chats_with_Aside_0df87ee4._24_8_;
  uVar6 = u_Chats_with_Aside_0df87ee4._16_8_;
  uVar41 = u_Chats_with_Aside_0df87ee4._0_8_;
  uStack_1a8 = _DAT_0df40020;
  local_1a0 = _UNK_0df40028;
  local_1b0 = pqVar46;
  if ((pqVar46 + 4 < pqVar46) ||
     (L"Chats with Aside" < pqVar46 + 4 && pqVar46 < (undefined4 *)((long)L"Chats with Aside" + 1)))
  goto LAB_037e1c14;
  pqVar46[1] = u_Chats_with_Aside_0df87ee4._8_8_;
  *pqVar46 = uVar41;
  pqVar46[3] = uVar7;
  pqVar46[2] = uVar6;
  *(undefined2 *)(pqVar46 + 4) = 0;
  FUN_00846944(uVar43,&local_1b0);
  if ((long)local_1a0 < 0) {
    FUN_00008eb8(local_1b0,local_1a0 << 1);
  }
  lVar16 = *(long *)(*(long *)(pcVar34 + 0x310) + 0x4e0);
  if ((lVar16 != 0) && (bVar2 = pcVar34[0x438], *(byte *)(lVar16 + 0x410) != bVar2)) {
    *(byte *)(lVar16 + 0x410) = bVar2;
    FUN_0239e964(lVar16 + 0x388,bVar2 ^ 1);
    FUN_005a117c(lVar16);
  }
  uStack_1a8 = _UNK_0df39a38;
  local_1b0 = _DAT_0df39a30;
  FUN_01aede60(*(long *)(pcVar34 + 0x318) + 0xd8,&DAT_0ea05488,&local_1b0);
  pcVar20 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  pcVar23 = pcVar20;
  FUN_04242e5c();
  *(undefined ***)pcVar23 = &PTR_LAB_0e727610;
  *(undefined ***)(pcVar23 + 8) = &PTR_LAB_0e727af0;
  *(undefined ***)(pcVar23 + 0x10) = &PTR_LAB_0e727b18;
  *(undefined ***)(pcVar23 + 0x68) = &PTR_FUN_0e727b50;
  *(undefined ***)(pcVar23 + 0x70) = &PTR_LAB_0e727b80;
  *(undefined ***)(pcVar23 + 0xb0) = &PTR_LAB_0e727bd0;
  *(undefined ***)(pcVar23 + 0xd8) = &PTR_LAB_0e727c30;
  *(undefined ***)(pcVar23 + 0xf8) = &PTR_LAB_0e727c60;
  *(undefined ***)(pcVar23 + 0x310) = &PTR_LAB_0e727c88;
  *(undefined ***)(pcVar23 + 0x318) = &PTR_FUN_0e727d08;
  *(undefined ***)(pcVar23 + 800) = &PTR_FUN_0e727dc8;
  *(undefined ***)(pcVar23 + 0x4b0) = &PTR_LAB_0e727e00;
  *(undefined ***)(pcVar23 + 0x4b8) = &PTR_LAB_0e727e50;
  *(undefined ***)(pcVar23 + 0x628) = &PTR_LAB_0e727e80;
  plVar22 = *(long **)(pcVar23 + 0x4c8);
  lVar16 = plVar22[0x6b];
  pqVar46 = *(qword **)(lVar16 + 0x48);
  uVar11 = *(uint *)((long)pqVar46 + 0x44);
  if (uVar11 == 0xffffffff) {
    FUN_02226140(pqVar46);
    uVar11 = *(uint *)((long)pqVar46 + 0x44);
    pqVar46 = *(qword **)(lVar16 + 0x48);
  }
  FUN_01ca7680(pqVar46,0xe - uVar11,0,400);
  local_1b0 = pqVar46;
  if ((pqVar46 != (qword *)0x0) &&
     (qVar37 = *pqVar46, *(uint *)pqVar46 = (uint)qVar37 + 1, 0xfffffffe < (uint)qVar37)) {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e5604);
    (*pcVar8)();
  }
  (**(code **)(*plVar22 + 0x3d8))(plVar22,&local_1b0);
  if (local_1b0 != (qword *)0x0) {
    qVar37 = *local_1b0;
    uVar11 = (uint)qVar37 - 1;
    *(uint *)local_1b0 = uVar11;
    if ((uint)qVar37 == 0) {
                    /* WARNING: Does not return */
      pcVar8 = (code *)SoftwareBreakpoint(0,0x37e5610);
      (*pcVar8)();
    }
    if (uVar11 == 0) {
      FUN_0114c7c4();
      FUN_00008eb8();
    }
  }
  local_100 = 0;
  puStack_118 = (undefined1 *)0x0;
  local_120 = (qword *)0x0;
  local_108 = 0;
  local_110 = 0;
  local_b8 = 0xec;
  local_b4 = 0;
  FUN_00df4920(&local_120,&PTR_PTR_0e9d4e60,&local_b8,0x10,0);
  local_1b0 = (qword *)((ulong)local_1b0 & 0xffffffffffffff00);
  local_190 = CONCAT71(local_190._1_7_,0xff);
  FUN_006bed8c(&local_1b0,&local_120);
  uStack_188 = CONCAT71(uStack_188._1_7_,1);
  (**(code **)(*(long *)pcVar20 + 0x458))(pcVar20,0,&local_1b0);
  if ((char)uStack_188 != '\0') {
    FUN_00846840(&local_1b0);
  }
  (**(code **)(*(long *)pcVar20 + 0x460))(pcVar20,L"New Chat",8);
  local_1a0 = CONCAT17(8,(undefined7)local_1a0);
  if (L"New Chat" < &local_1a0 && &local_1b0 < (qword **)((long)L"New Chat" + 1U))
  goto LAB_037e1c14;
  uStack_1a8 = (undefined1 *)u_New_Chat_0df87f06._8_8_;
  local_1b0 = (qword *)u_New_Chat_0df87f06._0_8_;
  local_1a0 = local_1a0 & 0xffffffffffff0000;
  FUN_00846944(pcVar20,&local_1b0);
  if ((long)local_1a0 < 0) {
    FUN_00008eb8(local_1b0,local_1a0 << 1);
  }
  uStack_d8 = 0;
  local_e0 = 0;
  uStack_d0 = 0;
  uStack_c8 = 0xffffffff00000000;
  iVar10 = 0x8513;
  FUN_02986c5c(&DAT_00008513,&local_e0);
  if (iVar10 != 0) {
    FUN_033a1504(&local_1b0,&local_e0);
    ppqVar33 = (qword **)local_1b0;
    if (-1 < (long)local_1a0._7_1_) {
      ppqVar33 = &local_1b0;
    }
    puVar47 = uStack_1a8;
    if (-1 < (long)local_1a0) {
      puVar47 = (undefined1 *)(long)local_1a0._7_1_;
    }
    FUN_04244850(pcVar20,ppqVar33,puVar47);
    if ((long)local_1a0 < 0) {
      FUN_00008eb8(local_1b0,local_1a0 << 1);
    }
  }
  if (pqVar26 != (qword *)0x0) {
    iVar10 = (int)*pqVar26;
    *(int *)pqVar26 = iVar10 + 1;
    if (iVar10 < 1) {
                    /* WARNING: Does not return */
      pcVar8 = (code *)SoftwareBreakpoint(0,0x37e58bc);
      (*pcVar8)();
    }
    if (iVar10 == 0x7fffffff) {
                    /* WARNING: Does not return */
      pcVar8 = (code *)SoftwareBreakpoint(0,0x37e4bfc);
      (*pcVar8)();
    }
  }
  local_e8 = '\x01';
  local_f0 = pqVar26;
  (**(code **)(*(long *)pcVar20 + 0x3d8))(pcVar20,&local_f0);
  if ((local_e8 != -1) && (local_f0 != (qword *)0x0)) {
    LOAcquire();
    qVar37 = *local_f0;
    *(int *)local_f0 = (int)qVar37 + -1;
    LORelease();
    if ((int)qVar37 == 1) {
      (*(code *)local_f0[2])();
    }
  }
  local_e8 = 0xff;
  pcVar23 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  if (pqVar26 != (qword *)0x0) {
    iVar10 = (int)*pqVar26;
    *(int *)pqVar26 = iVar10 + 1;
    if (iVar10 < 1) {
                    /* WARNING: Does not return */
      pcVar8 = (code *)SoftwareBreakpoint(0,0x37e58c8);
      (*pcVar8)();
    }
    if (iVar10 == 0x7fffffff) {
                    /* WARNING: Does not return */
      pcVar8 = (code *)SoftwareBreakpoint(0,0x37e4bc0);
      (*pcVar8)();
    }
  }
  *(undefined ***)pcVar23 = &PTR_LAB_0e728450;
  *(undefined ***)(pcVar23 + 8) = &PTR_LAB_0e7288b0;
  *(undefined ***)(pcVar23 + 0x10) = &PTR_LAB_0e7288d8;
  *(undefined ***)(pcVar23 + 0x68) = &PTR_FUN_0e728910;
  *(undefined ***)(pcVar23 + 0x70) = &PTR_LAB_0e728940;
  *(undefined ***)(pcVar23 + 0xb0) = &PTR_LAB_0e728990;
  plVar22 = (long *)(pcVar23 + 0xd8);
  *plVar22 = (long)&PTR_LAB_0e7289f0;
  puVar44 = (undefined8 *)(pcVar23 + 0xf8);
  *puVar44 = &PTR_LAB_0e728a20;
  *(undefined ***)(pcVar23 + 0x310) = &PTR_LAB_0e728a48;
  *(undefined ***)(pcVar23 + 0x318) = &PTR_FUN_0e728ac8;
  *(undefined ***)(pcVar23 + 800) = &PTR_FUN_0e728b88;
  if (((ulong)pcVar23 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar23);
  }
  pqVar46 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar46 = 1;
  pqVar46[1] = (qword)&LAB_03fb3c00;
  pqVar46[2] = (qword)FUN_03899b40;
  pqVar46[3] = (qword)FUN_0255db00;
  pqVar46[4] = (qword)FUN_046695b0;
  pqVar46[5] = 0;
  pqVar46[6] = (qword)pcVar23;
  local_88 = '\x02';
  local_90 = pqVar46;
  FUN_0136e480(pcVar23,&local_90);
  if ((local_88 != -1) && (local_90 != (qword *)0x0)) {
    LOAcquire();
    qVar37 = *local_90;
    *(int *)local_90 = (int)qVar37 + -1;
    LORelease();
    if ((int)qVar37 == 1) {
      (*(code *)local_90[2])();
    }
  }
  local_88 = 0xff;
  *(undefined ***)pcVar23 = &PTR_LAB_0e728450;
  *(undefined ***)(pcVar23 + 8) = &PTR_LAB_0e7288b0;
  *(undefined ***)(pcVar23 + 0x10) = &PTR_LAB_0e7288d8;
  *(undefined ***)(pcVar23 + 0x68) = &PTR_FUN_0e728910;
  *(undefined ***)(pcVar23 + 0x70) = &PTR_LAB_0e728940;
  *(undefined ***)(pcVar23 + 0xb0) = &PTR_LAB_0e728990;
  *(undefined ***)(pcVar23 + 0xd8) = &PTR_LAB_0e7289f0;
  *(undefined ***)(pcVar23 + 0xf8) = &PTR_LAB_0e728a20;
  *(undefined ***)(pcVar23 + 0x310) = &PTR_LAB_0e728a48;
  *(undefined ***)(pcVar23 + 0x318) = &PTR_FUN_0e728ac8;
  *(undefined ***)(pcVar23 + 800) = &PTR_FUN_0e728b88;
  pcVar23[0x4b0] = 0;
  pcVar23[0x4b4] = 0;
  pcVar23[0x4b8] = 0;
  *(qword **)(pcVar23 + 0x4c0) = pqVar26;
  puVar1 = (ulong *)(pcVar23 + 0x4c8);
  *(undefined8 *)(pcVar23 + 0x4d0) = 0;
  *puVar1 = 0;
  if (pcVar23[0x460] != '\0') {
    pcVar23[0x460] = 0;
    FUN_00f27fd0(puVar44,(long)pcVar23 + 0x460);
  }
  *(undefined4 *)(*(long *)(pcVar23 + 0x480) + 0x18) = 1;
  if (*(int *)(pcVar23 + 0x464) != 0x800) {
    *(undefined4 *)(pcVar23 + 0x464) = 0x800;
    FUN_00f27fd0(puVar44,(long)pcVar23 + 0x464);
  }
  pcVar23[0x1cb] = 1;
  FUN_015377dc(pcVar23,1);
  (**(code **)(*(long *)pcVar23 + 0xa0))(pcVar23,0);
  lVar16 = 0x140;
  FUN_0000f368();
  FUN_02a105d0();
  FUN_01b89838(pcVar23,lVar16);
  if (*(int *)(lVar16 + 0xf0) != 0) {
    *(undefined4 *)(lVar16 + 0xf0) = 0;
    FUN_01a652b0(lVar16,1);
  }
  local_1b0 = (qword *)CONCAT44(local_1b0._4_4_,1);
  FUN_01a651a4(lVar16 + 0x118,&DAT_0ea05568,&local_1b0);
  if ((*(byte *)(lVar16 + 0xf4) & 1) == 0) {
    *(undefined1 *)(lVar16 + 0xf4) = 1;
    FUN_01a652b0(lVar16,1);
  }
  if ((((*(int *)(lVar16 + 0xf8) != 6) || (*(int *)(lVar16 + 0xfc) != 8)) ||
      (*(int *)(lVar16 + 0x100) != 6)) || (*(int *)(lVar16 + 0x104) != 8)) {
    *(undefined8 *)(lVar16 + 0x100) = 0x800000006;
    *(undefined8 *)(lVar16 + 0xf8) = 0x800000006;
    FUN_01a652b0(lVar16,1);
  }
  pcVar45 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  pcVar31 = pcVar45;
  FUN_0242d238();
  *(undefined ***)pcVar31 = &PTR_LAB_0e6b2bd0;
  *(undefined ***)(pcVar31 + 8) = &PTR_LAB_0e6b2fc0;
  *(undefined ***)(pcVar31 + 0x10) = &PTR_FUN_0e6b2fe8;
  *(undefined ***)(pcVar31 + 0x68) = &PTR_setProperty_forKey__0e6b3020;
  *(undefined ***)(pcVar31 + 0x70) = &PTR_FUN_0e6b3050;
  *(undefined ***)(pcVar31 + 0xb0) = &PTR_FUN_0e6b30a0;
  *(undefined ***)(pcVar31 + 0xf8) = &PTR_FUN_0e6b3130;
  *(undefined ***)(pcVar31 + 0xd8) = &PTR_FUN_0e6b3100;
  *(undefined8 *)(pcVar31 + 0x348) = 0;
  *(undefined8 *)(pcVar31 + 0x350) = 0xffff000000000000;
  pcVar31[0x358] = 1;
  *(undefined8 *)(pcVar31 + 0x360) = 0;
  pcVar31[0x368] = 0;
  *(undefined8 *)(pcVar31 + 0x370) = 0;
  *(undefined4 *)(pcVar31 + 0x378) = 0;
  pcVar31[0x37c] = 0;
  if (pcVar31[0x169] != '\0') {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e561c);
    (*pcVar8)();
  }
  FUN_007793fc(pcVar23,pcVar45,*(undefined8 *)(pcVar23 + 0x198));
  if (((ulong)pcVar45 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar45);
  }
  if ((*puVar1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *puVar1 = (ulong)pcVar45;
  if (pcVar45[0x1a9] != '\0') {
    pcVar45[0x1a9] = 0;
    FUN_00f27fd0(pcVar31 + 0xf8,(long)pcVar45 + 0x1a9);
    pcVar45 = (char *)*puVar1;
  }
  if (pcVar45[0x318] == '\0') {
    if (pcVar45 + 0x310 == (char *)0x0) goto LAB_037e1c14;
    *(undefined8 *)(pcVar45 + 0x310) = 0x1000000010;
    pcVar45[0x318] = 1;
  }
  else {
    *(undefined8 *)(pcVar45 + 0x310) = 0x1000000010;
  }
  plVar42 = *(long **)(pcVar45 + 0x188);
  if (plVar42 != (long *)0x0) {
    (**(code **)(*plVar42 + 0x2f8))(plVar42,pcVar45);
  }
  FUN_00630474(pcVar45,0);
  local_1b0 = (qword *)pcVar45;
  FUN_008a71d0((long)pcVar45 + 0x130,0x18,1,&local_1b0);
  FUN_01256ae8(pcVar45);
  FUN_027d1a60(*puVar1,0x1000000010,1);
  uStack_1a8 = (undefined1 *)_UNK_0df40098;
  local_1b0 = _DAT_0df40090;
  FUN_01aede60(*puVar1 + 0xd8,&DAT_0ea05488,&local_1b0);
  pcVar45 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  pcVar31 = pcVar45;
  FUN_01b8a8e0();
  if (pcVar31[0x169] != '\0') {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e5634);
    (*pcVar8)();
  }
  FUN_007793fc(pcVar23,pcVar45,*(undefined8 *)(pcVar23 + 0x198));
  if (((ulong)pcVar45 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar45);
  }
  if ((*(ulong *)(pcVar23 + 0x4d0) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(char **)(pcVar23 + 0x4d0) = pcVar45;
  if (pcVar45[0x1a9] != '\0') {
    pcVar45[0x1a9] = 0;
    FUN_00f27fd0((long)pcVar45 + 0xf8,(long)pcVar45 + 0x1a9);
    pcVar45 = *(char **)(pcVar23 + 0x4d0);
  }
  FUN_01b89d00(pcVar45,3);
  FUN_005a0d40(*(undefined8 *)(pcVar23 + 0x4d0),6);
  lVar16 = *(long *)(pcVar23 + 0x4d0);
  if (*(char *)(lVar16 + 0x3d8) != '\0') {
    *(undefined1 *)(lVar16 + 0x3d8) = 0;
    FUN_005a383c(lVar16);
    FUN_00f27fd0(lVar16 + 0xf8,lVar16 + 0x3d8);
    lVar16 = *(long *)(pcVar23 + 0x4d0);
  }
  if (*(char *)(lVar16 + 0x3b6) != '\0') {
    *(undefined1 *)(lVar16 + 0x3b6) = 0;
    FUN_00f28308(lVar16);
    FUN_007e1964(lVar16,2);
    FUN_00f27fd0(lVar16 + 0xf8,lVar16 + 0x3b6);
    lVar16 = *(long *)(pcVar23 + 0x4d0);
  }
  FUN_0273f370(lVar16,0);
  local_98 = 0;
  local_94 = 1;
  FUN_008486f0(*(undefined8 *)(pcVar23 + 0x4d0),&local_98);
  plVar42 = *(long **)(pcVar23 + 0x4d0);
  lVar16 = plVar42[0x6b];
  pqVar46 = *(qword **)(lVar16 + 0x48);
  uVar11 = *(uint *)((long)pqVar46 + 0x44);
  if (uVar11 == 0xffffffff) {
    FUN_02226140(pqVar46);
    uVar11 = *(uint *)((long)pqVar46 + 0x44);
    pqVar46 = *(qword **)(lVar16 + 0x48);
  }
  FUN_01ca7680(pqVar46,0xe - uVar11,0,400);
  local_1b0 = pqVar46;
  if ((pqVar46 != (qword *)0x0) &&
     (qVar37 = *pqVar46, *(uint *)pqVar46 = (uint)qVar37 + 1, 0xfffffffe < (uint)qVar37)) {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e5640);
    (*pcVar8)();
  }
  (**(code **)(*plVar42 + 0x3d8))(plVar42,&local_1b0);
  if (local_1b0 != (qword *)0x0) {
    qVar37 = *local_1b0;
    uVar11 = (uint)qVar37 - 1;
    *(uint *)local_1b0 = uVar11;
    if ((uint)qVar37 == 0) {
                    /* WARNING: Does not return */
      pcVar8 = (code *)SoftwareBreakpoint(0,0x37e564c);
      (*pcVar8)();
    }
    if (uVar11 == 0) {
      FUN_0114c7c4();
      FUN_00008eb8();
    }
  }
  lVar16 = *(long *)(pcVar23 + 0x4d0);
  pqVar46 = &segment_command_00000020.vmsize;
  FUN_0000f368();
  *(undefined4 *)pqVar46 = 1;
  pqVar46[1] = (qword)FUN_01027980;
  pqVar46[2] = (qword)FUN_002f2880;
  pqVar46[3] = (qword)FUN_0255db00;
  pqVar46[4] = (qword)&LAB_03b26c40;
  uVar41 = _DAT_0df3ff60;
  pqVar46[6] = _UNK_0df3ff68;
  pqVar46[5] = uVar41;
  *(undefined1 *)(pqVar46 + 7) = 0;
  uStack_1a8 = &DAT_100000001;
  local_1a0 = CONCAT44(local_1a0._4_4_,3);
  local_190 = 0;
  uStack_188 = 0;
  local_198 = 0;
  local_1b0 = pqVar46;
  FUN_01c1438c(lVar16 + 0xd8,&DAT_0ea05548,&local_1b0);
  FUN_0174ad24(&local_1b0);
  pcVar45 = segment_command_00000020.segname + 8;
  FUN_0000f368();
  *(qword *)(pcVar45 + 8) = 0;
  *(qword *)(pcVar45 + 0x10) = 0;
  *(undefined2 *)(pcVar45 + 0x18) = 0;
  *(undefined ***)pcVar45 = &PTR_FUN_0e34ed88;
  auVar50 = NEON_fmov(0x41200000,4);
  *(long *)(pcVar45 + 0x24) = auVar50._8_8_;
  *(long *)(pcVar45 + 0x1c) = auVar50._0_8_;
  FUN_00b6a19c(plVar22,&DAT_0ea05528,"kHighlightPathGeneratorKey",FUN_02e6cf00,pcVar45,0);
  if (plVar22 != (long *)0x0) {
    (**(code **)(*plVar22 + 8))();
  }
  FUN_0136ee40(pcVar23);
  for (plVar22 = *(long **)(pcVar23 + 0xe8); plVar22 != (long *)0x0; plVar22 = (long *)*plVar22) {
    while ((undefined *)plVar22[4] < &UNK_0ea04cb1) {
      if (&UNK_0ea04caf < (undefined *)plVar22[4]) {
        if (plVar22 == (long *)(pcVar23 + 0xe8)) goto LAB_037e292c;
        lVar16 = plVar22[6];
        goto LAB_037e2930;
      }
      plVar22 = (long *)plVar22[1];
      if (plVar22 == (long *)0x0) goto LAB_037e292c;
    }
  }
LAB_037e292c:
  lVar16 = 0;
LAB_037e2930:
  pcVar45 = segment_command_00000020.segname + 8;
  FUN_0000f368();
  *(qword *)(pcVar45 + 8) = 0;
  *(qword *)(pcVar45 + 0x10) = 0;
  *(undefined2 *)(pcVar45 + 0x18) = 0;
  *(undefined ***)pcVar45 = &PTR_FUN_0e34ed88;
  auVar50 = NEON_fmov(0x41200000,4);
  *(long *)(pcVar45 + 0x24) = auVar50._8_8_;
  *(long *)(pcVar45 + 0x1c) = auVar50._0_8_;
  plVar22 = *(long **)(lVar16 + 0x318);
  *(char **)(lVar16 + 0x318) = pcVar45;
  if (plVar22 != (long *)0x0) {
    (**(code **)(*plVar22 + 8))();
  }
  FUN_00630474(lVar16,0);
  FUN_005a117c(lVar16);
  lVar16 = *(long *)(pcVar23 + 0x2c8);
  if (lVar16 == 0) {
    FUN_00ee6100();
    if ((int)lVar16 == 0) {
      pcVar45 = pcVar23;
      FUN_012de654();
    }
    else {
      pcVar45 = section_000001a8.sectname + 8;
      FUN_0000f368();
      FUN_00ee5b80();
    }
    plVar22 = *(long **)(pcVar23 + 0x2c8);
    *(char **)(pcVar23 + 0x2c8) = pcVar45;
    if (plVar22 != (long *)0x0) {
      (**(code **)(*plVar22 + 8))(plVar22);
    }
  }
  FUN_0168e4e0();
  lVar16 = *(long *)(pcVar23 + 0x2c8);
  if (lVar16 == 0) {
    FUN_00ee6100();
    if ((int)lVar16 == 0) {
      pcVar45 = pcVar23;
      FUN_012de654();
    }
    else {
      pcVar45 = section_000001a8.sectname + 8;
      FUN_0000f368();
      FUN_00ee5b80();
    }
    plVar22 = *(long **)(pcVar23 + 0x2c8);
    *(char **)(pcVar23 + 0x2c8) = pcVar45;
    if (plVar22 != (long *)0x0) {
      (**(code **)(*plVar22 + 8))(plVar22);
    }
  }
  local_1a0 = CONCAT17(8,(undefined7)local_1a0);
  if (L"New Chat" < &local_1a0 && &local_1b0 < (qword **)((long)L"New Chat" + 1U))
  goto LAB_037e1c14;
  uStack_1a8._0_2_ = u_New_Chat_0df87f06[4];
  uStack_1a8._2_2_ = u_New_Chat_0df87f06[5];
  uStack_1a8._4_2_ = u_New_Chat_0df87f06[6];
  uStack_1a8._6_2_ = u_New_Chat_0df87f06[7];
  local_1b0 = (qword *)u_New_Chat_0df87f06._0_8_;
  local_1a0 = local_1a0 & 0xffffffffffff0000;
  FUN_0116d8d8();
  if ((long)local_1a0 < 0) {
    FUN_00008eb8(local_1b0,local_1a0 << 1);
  }
  FUN_04669640(pcVar23);
  pcVar45 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  pcVar31 = pcVar45;
  FUN_0136f140();
  *(undefined ***)pcVar31 = &PTR_LAB_0e727ed0;
  *(undefined ***)(pcVar31 + 8) = &PTR_LAB_0e7282b8;
  *(undefined ***)(pcVar31 + 0x10) = &PTR_FUN_0e7282e0;
  *(undefined ***)(pcVar31 + 0x68) = &PTR_setProperty_forKey__0e728318;
  *(undefined ***)(pcVar31 + 0x70) = &PTR_FUN_0e728348;
  *(undefined ***)(pcVar31 + 0xb0) = &PTR_FUN_0e728398;
  *(undefined ***)(pcVar31 + 0xd8) = &PTR_FUN_0e7283f8;
  *(undefined ***)(pcVar31 + 0xf8) = &PTR_FUN_0e728428;
  *(undefined8 *)(pcVar31 + 0x318) = 0;
  *(undefined8 *)(pcVar31 + 0x310) = 0;
  lVar16 = 0x140;
  FUN_0000f368();
  FUN_02a105d0();
  FUN_01b89838(pcVar45,lVar16);
  if (*(int *)(lVar16 + 0xf0) != 1) {
    *(undefined4 *)(lVar16 + 0xf0) = 1;
    FUN_01a652b0(lVar16,1);
  }
  local_1b0 = (qword *)CONCAT44(local_1b0._4_4_,3);
  FUN_01a651a4(lVar16 + 0x118,&DAT_0ea05568,&local_1b0);
  uVar41 = _DAT_0df3e7d0;
  if (((*(int *)(lVar16 + 0xf8) != 1) || (*(int *)(lVar16 + 0xfc) != 1)) ||
     ((*(int *)(lVar16 + 0x100) != 0 || (*(int *)(lVar16 + 0x104) != 1)))) {
    *(undefined8 *)(lVar16 + 0x100) = _UNK_0df3e7d8;
    *(undefined8 *)(lVar16 + 0xf8) = uVar41;
    FUN_01a652b0(lVar16,1);
  }
  if (pcVar20[0x169] != '\0') {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e5658);
    (*pcVar8)();
  }
  FUN_007793fc(pcVar45,pcVar20,*(undefined8 *)(pcVar45 + 0x198));
  if (((ulong)pcVar20 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar20);
  }
  if ((*(ulong *)(pcVar45 + 0x310) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(char **)(pcVar45 + 0x310) = pcVar20;
  if (pcVar23[0x169] != '\0') {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e5664);
    (*pcVar8)();
  }
  FUN_007793fc(pcVar45,pcVar23,*(undefined8 *)(pcVar45 + 0x198));
  if (((ulong)pcVar23 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar23);
  }
  if ((*(ulong *)(pcVar45 + 0x318) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(char **)(pcVar45 + 0x318) = pcVar23;
  uVar39 = *(ulong *)(pcVar45 + 0x310);
  if ((uVar39 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(uVar39);
  }
  if ((*puVar40 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *puVar40 = uVar39;
  uVar39 = *(ulong *)(pcVar45 + 0x318);
  if ((uVar39 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(uVar39);
  }
  if ((*(ulong *)(pcVar34 + 0x368) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(ulong *)(pcVar34 + 0x368) = uVar39;
  if (pcVar45[0x169] != '\0') {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e5670);
    (*pcVar8)();
  }
  FUN_007793fc(*(long *)(pcVar34 + 0x318),pcVar45,
               *(undefined8 *)(*(long *)(pcVar34 + 0x318) + 0x198));
  if (((ulong)pcVar45 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar45);
  }
  if ((*(ulong *)(pcVar34 + 0x360) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(char **)(pcVar34 + 0x360) = pcVar45;
  uStack_1a8 = (undefined1 *)0x700000000;
  local_1b0 = (qword *)0x700000000;
  FUN_01aede60(pcVar31 + 0xd8,&DAT_0ea05488,&local_1b0);
  pcVar20 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  _bzero(pcVar20,0x310);
  FUN_0136f140(pcVar20);
  *(undefined ***)pcVar20 = &PTR_LAB_0e728bd0;
  *(undefined ***)(pcVar20 + 8) = &PTR_LAB_0e728fb8;
  *(undefined ***)(pcVar20 + 0x10) = &PTR_LAB_0e728fe0;
  *(undefined ***)(pcVar20 + 0x68) = &PTR_setProperty_forKey__0e729018;
  *(undefined ***)(pcVar20 + 0x70) = &PTR_LAB_0e729048;
  *(undefined ***)(pcVar20 + 0xb0) = &PTR_LAB_0e729098;
  *(undefined ***)(pcVar20 + 0xd8) = &PTR_LAB_0e7290f8;
  *(undefined ***)(pcVar20 + 0xf8) = &PTR_LAB_0e729128;
  if (((ulong)pcVar20 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar20);
  }
  if ((*(ulong *)(pcVar34 + 0x370) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(char **)(pcVar34 + 0x370) = pcVar20;
  lVar16 = 0x140;
  FUN_0000f368();
  FUN_02a105d0();
  FUN_01b89838(pcVar20,lVar16);
  if (*(int *)(lVar16 + 0xf0) != 1) {
    *(undefined4 *)(lVar16 + 0xf0) = 1;
    FUN_01a652b0(lVar16,1);
  }
  local_1b0 = (qword *)CONCAT44(local_1b0._4_4_,3);
  FUN_01a651a4(lVar16 + 0x118,&DAT_0ea05568,&local_1b0);
  uVar41 = _DAT_0df3e7d0;
  if ((((*(int *)(lVar16 + 0xf8) != 1) || (*(int *)(lVar16 + 0xfc) != 1)) ||
      (*(int *)(lVar16 + 0x100) != 0)) || (*(int *)(lVar16 + 0x104) != 1)) {
    *(undefined8 *)(lVar16 + 0x100) = _UNK_0df3e7d8;
    *(undefined8 *)(lVar16 + 0xf8) = uVar41;
    FUN_01a652b0(lVar16,1);
  }
  if ((*(byte *)(lVar16 + 0x111) & 1) == 0) {
    *(undefined1 *)(lVar16 + 0x111) = 1;
    FUN_01a652b0(lVar16,1);
  }
  lVar16 = *(long *)(pcVar34 + 0x318);
  pcVar20 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  pcVar23 = pcVar20;
  FUN_04666440();
  if (pcVar23[0x169] != '\0') {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e567c);
    (*pcVar8)();
  }
  FUN_007793fc(lVar16,pcVar20,*(undefined8 *)(lVar16 + 0x198));
  if (((ulong)pcVar20 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar20);
  }
  if ((*(ulong *)(pcVar34 + 0x378) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(char **)(pcVar34 + 0x378) = pcVar20;
  uStack_1a8 = _UNK_0df47a68;
  local_1b0 = _DAT_0df47a60;
  FUN_01aede60((long)pcVar20 + 0xd8,&DAT_0ea05488,&local_1b0);
  uVar39 = DAT_0ef08030;
  uVar49 = DAT_0ef08030;
  FUN_001f557c(DAT_0ef08030,"force-prefers-reduced-motion");
  if ((uVar49 & 1) == 0) {
    FUN_001f557c(uVar39,"force-prefers-no-reduced-motion");
    if ((uVar39 & 1) == 0) {
      if (((DAT_0ef10329 & 1) == 0) && (FUN_0293e4a4(), (DAT_0ef10329 & 1) == 0)) goto LAB_037e5414;
      if ((DAT_0ef10328 & 1) != 0) goto LAB_037e5444;
    }
  }
  else {
LAB_037e5444:
    local_200 = 0;
  }
  *(undefined8 *)(pcVar34 + 0x428) = local_200;
  uVar41 = 0x3ff0000000000000;
  if (pcVar34[0x438] == '\0') {
    uVar41 = 0;
  }
  if (pcVar34[0x408] != '\0') {
    pcVar34[0x408] = 0;
  }
  *(undefined8 *)(pcVar34 + 0x420) = uVar41;
  if (pcVar34[0x3c0] != '\0') {
    pcVar34[0x3c0] = 0;
    FUN_02109700(*(undefined8 *)(pcVar34 + 0x3d0),(long)pcVar34 + 0x3b0);
    (**(code **)(*(long *)(pcVar34 + 0x3b0) + 0x38))((long)pcVar34 + 0x3b0);
    if (*(long *)(pcVar34 + 0x3c8) != 0) {
      iVar10 = (int)pcVar34 + 0x3b0;
      (**(code **)(*(long *)(pcVar34 + 0x3b0) + 0x40))();
      lVar16 = 0x20;
      if (iVar10 == 0) {
        lVar16 = 0x10;
      }
      (**(code **)(**(long **)(pcVar34 + 0x3c8) + lVar16))
                (*(long **)(pcVar34 + 0x3c8),(long)pcVar34 + 0x3b0);
    }
  }
  FUN_04667640(pcVar34);
  FUN_00846840(&local_120);
  if (pqVar26 != (qword *)0x0) {
    LOAcquire();
    qVar37 = *pqVar26;
    *(int *)pqVar26 = (int)qVar37 + -1;
    LORelease();
    if ((int)qVar37 == 1) {
      (*(code *)pqVar26[2])(pqVar26);
    }
  }
  if (pcVar34[0x169] != '\0') {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e5688);
    (*pcVar8)();
  }
  FUN_007793fc(*(long *)(param_1 + 0x5c0),pcVar34,
               *(undefined8 *)(*(long *)(param_1 + 0x5c0) + 0x198));
  if (((ulong)pcVar34 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar34);
  }
  if ((*(ulong *)(param_1 + 0x5c8) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(char **)(param_1 + 0x5c8) = pcVar34;
  pqVar46 = &segment_command_00000020.vmsize;
  FUN_0000f368();
  *(undefined4 *)pqVar46 = 1;
  pqVar46[1] = (qword)FUN_01027980;
  pqVar46[2] = (qword)FUN_002f2880;
  pqVar46[3] = (qword)FUN_0255db00;
  pqVar46[4] = (qword)&LAB_03b26c40;
  pqVar46[6] = uVar4;
  pqVar46[5] = uVar15;
  *(undefined1 *)(pqVar46 + 7) = 0;
  uStack_1a8 = &DAT_100000001;
  local_1a0 = CONCAT44(local_1a0._4_4_,3);
  local_190 = 0;
  uStack_188 = 0;
  local_198 = 0;
  local_1b0 = pqVar46;
  FUN_01c1438c(pcVar34 + 0xd8,&DAT_0ea05548,&local_1b0);
  FUN_0174ad24(&local_1b0);
  lVar16 = *(long *)(param_1 + 0x5c0);
  pcVar34 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  pcVar20 = pcVar34;
  FUN_0136f140();
  *(undefined ***)pcVar20 = &PTR_LAB_0e726ab0;
  *(undefined ***)(pcVar20 + 8) = &PTR_LAB_0e726e98;
  *(undefined ***)(pcVar20 + 0x10) = &PTR_LAB_0e726ec0;
  *(undefined ***)(pcVar20 + 0x68) = &PTR_setProperty_forKey__0e726ef8;
  *(undefined ***)(pcVar20 + 0x70) = &PTR_LAB_0e726f28;
  *(undefined ***)(pcVar20 + 0xb0) = &PTR_LAB_0e726f78;
  *(undefined ***)(pcVar20 + 0xd8) = &PTR_LAB_0e726fd8;
  *(undefined ***)(pcVar20 + 0xf8) = &PTR_LAB_0e727008;
  FUN_027d1a60();
  if (pcVar34[0x1a9] != '\0') {
    pcVar34[0x1a9] = 0;
    FUN_00f27fd0(pcVar20 + 0xf8,(long)pcVar34 + 0x1a9);
  }
  if (pcVar34[0x169] != '\0') {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e5694);
    (*pcVar8)();
  }
  FUN_007793fc(lVar16,pcVar34,*(undefined8 *)(lVar16 + 0x198));
  if (((ulong)pcVar34 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar34);
  }
  if ((*(ulong *)(param_1 + 0x5d8) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(char **)(param_1 + 0x5d8) = pcVar34;
  (**(code **)(*(long *)pcVar34 + 0xa0))(pcVar34,0);
  pcVar34 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  FUN_0136f140();
  lVar16 = 0x140;
  FUN_0000f368();
  FUN_02a105d0();
  FUN_01b89838(pcVar34,lVar16);
  if (*(int *)(lVar16 + 0xf0) != 0) {
    *(undefined4 *)(lVar16 + 0xf0) = 0;
    FUN_01a652b0(lVar16,1);
  }
  local_1b0 = (qword *)CONCAT44(local_1b0._4_4_,1);
  FUN_01a651a4(lVar16 + 0x118,&DAT_0ea05568,&local_1b0);
  if ((*(byte *)(lVar16 + 0xf4) & 1) == 0) {
    *(undefined1 *)(lVar16 + 0xf4) = 1;
    FUN_01a652b0(lVar16,1);
  }
  uStack_1a8 = _UNK_0df40a98;
  local_1b0 = _DAT_0df40a90;
  FUN_01aede60(lVar16 + 0x118,&DAT_0ea05488,&local_1b0);
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar46 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar46 = 1;
  pqVar46[1] = (qword)&LAB_03f39e80;
  pqVar46[2] = (qword)FUN_03899b40;
  pqVar46[3] = (qword)FUN_0255db00;
  pqVar46[4] = (qword)FUN_04630098;
  pqVar46[5] = 0;
  pqVar46[6] = (qword)param_1;
  pcVar20 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  local_1a0 = CONCAT17(4,(undefined7)local_1a0);
  if (&UNK_0df87a00 < &uStack_1a8 && &local_1b0 < &UNK_0df87a01) goto LAB_037e1c14;
  local_1b0 = (qword *)0x79006400690054;
  uStack_1a8 = (undefined1 *)((ulong)uStack_1a8 & 0xffffffffffff0000);
  FUN_0466afb0();
  if ((long)local_1a0 < 0) {
    FUN_00008eb8(local_1b0,local_1a0 << 1);
  }
  if (pcVar20[0x169] != '\0') {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e56a0);
    (*pcVar8)();
  }
  FUN_007793fc(pcVar34,pcVar20,*(undefined8 *)(pcVar34 + 0x198));
  if (((ulong)pcVar20 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar20);
  }
  if ((*(ulong *)(param_1 + 0x688) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(char **)(param_1 + 0x688) = pcVar20;
  pqVar46 = (qword *)(segment_command_00000020.segname + 8);
  FUN_0000f368();
  qVar5 = _DAT_0df87a1a;
  qVar37 = _DAT_0df87a0a;
  local_1a0 = _UNK_0df3f5b8;
  uStack_1a8 = _DAT_0df3f5b0;
  local_1b0 = pqVar46;
  if (((undefined4 *)((long)pqVar46 + 0x2a) < pqVar46) ||
     (&DAT_0df87a0a < (undefined4 *)((long)pqVar46 + 0x2a) && pqVar46 < &UNK_0df87a0b))
  goto LAB_037e1c14;
  qVar3 = CONCAT62(_DAT_0df87a24,_UNK_0df87a22);
  pqVar46[1] = _UNK_0df87a12;
  *pqVar46 = qVar37;
  pqVar46[3] = qVar3;
  pqVar46[2] = qVar5;
  uVar41 = CONCAT26(_UNK_0df87a2a,_DAT_0df87a24);
  *(undefined8 *)((long)pqVar46 + 0x22) = _UNK_0df87a2c;
  *(undefined8 *)((long)pqVar46 + 0x1a) = uVar41;
  *(undefined2 *)((long)pqVar46 + 0x2a) = 0;
  FUN_00846944(pcVar20,&local_1b0);
  if ((long)local_1a0 < 0) {
    FUN_00008eb8(local_1b0,local_1a0 << 1);
  }
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar46 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar46 = 1;
  pqVar46[1] = (qword)&LAB_03f39e80;
  pqVar46[2] = (qword)FUN_03899b40;
  pqVar46[3] = (qword)FUN_0255db00;
  pqVar46[4] = (qword)FUN_04630b48;
  pqVar46[5] = 0;
  pqVar46[6] = (qword)param_1;
  pcVar20 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  local_1a0 = CONCAT17(5,(undefined7)local_1a0);
  if (L"Clear" < (wchar16 *)((long)&uStack_1a8 + 2U) && &local_1b0 < (qword **)((long)L"Clear" + 1U)
     ) goto LAB_037e1c14;
  uStack_1a8 = (undefined1 *)CONCAT44(uStack_1a8._4_4_,0x72);
  local_1b0 = (qword *)u_Clear_0df87a36._0_8_;
  FUN_0466afb0();
  if ((long)local_1a0 < 0) {
    FUN_00008eb8(local_1b0,local_1a0 << 1);
  }
  if (pcVar20[0x169] != '\0') {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e56ac);
    (*pcVar8)();
  }
  FUN_007793fc(pcVar34,pcVar20,*(undefined8 *)(pcVar34 + 0x198));
  local_1b0 = (qword *)0x0;
  uStack_1a8 = (undefined1 *)0x0;
  FUN_01aede60((long)pcVar20 + 0xd8,&DAT_0ea05488,&local_1b0);
  pcVar34 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  local_1a0 = CONCAT17(4,(undefined7)local_1a0);
  if (&UNK_0df87a42 < &uStack_1a8 && &local_1b0 < &UNK_0df87a43) goto LAB_037e1c14;
  local_1b0 = (qword *)0x73006200610054;
  uStack_1a8 = (undefined1 *)((ulong)uStack_1a8 & 0xffffffffffff0000);
  FUN_04662010();
  if ((long)local_1a0 < 0) {
    FUN_00008eb8(local_1b0,local_1a0 << 1);
  }
  if (((ulong)pcVar34 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar34);
  }
  if ((*(ulong *)(param_1 + 0x670) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(char **)(param_1 + 0x670) = pcVar34;
  uVar39 = *(ulong *)(pcVar34 + 0x310);
  if ((uVar39 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(uVar39);
  }
  if ((*(ulong *)(param_1 + 0x678) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(ulong *)(param_1 + 0x678) = uVar39;
  uVar39 = *(ulong *)(pcVar34 + 0x318);
  if ((uVar39 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(uVar39);
  }
  if ((*(ulong *)(param_1 + 0x680) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(ulong *)(param_1 + 0x680) = uVar39;
  uVar39 = *(ulong *)(*(long *)(pcVar34 + 0x310) + 0x4c8);
  if ((uVar39 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(uVar39);
  }
  if ((*(ulong *)(param_1 + 0x690) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(ulong *)(param_1 + 0x690) = uVar39;
  if (pcVar34[0x169] != '\0') {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e56b8);
    (*pcVar8)();
  }
  FUN_007793fc(*(long *)(param_1 + 0x5c0),pcVar34,
               *(undefined8 *)(*(long *)(param_1 + 0x5c0) + 0x198));
  (**(code **)(**(long **)(param_1 + 0x678) + 0xa0))(*(long **)(param_1 + 0x678),1);
  FUN_01c1588c(*(undefined8 *)(param_1 + 0x690),1);
  lVar16 = *(long *)(param_1 + 0x690);
  lVar19 = *(long *)(lVar16 + 0x20);
  if (*(int *)(lVar19 + 8) == 2) {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e56c4);
    (*pcVar8)();
  }
  if (*(char *)(lVar19 + 0x8a) != '\0') {
    *(undefined1 *)(lVar19 + 0x8a) = 0;
    FUN_00dcdb40(*(undefined8 *)(lVar19 + 0x168),0);
    lVar16 = *(long *)(param_1 + 0x690);
  }
  local_1b0 = (qword *)0x0;
  local_198 = 0;
  local_130 = 0;
  uStack_138 = 0;
  local_140 = 0;
  uStack_158 = 0;
  local_160 = 0;
  uStack_148 = 0;
  uStack_150 = 0;
  uStack_178 = 0;
  local_180 = 0;
  uStack_168 = 0;
  uStack_170 = 0;
  uStack_188 = 0;
  local_190 = 0;
  local_1a0 = _UNK_0df47a78;
  uStack_1a8 = _DAT_0df47a70;
  lVar19 = *(long *)(lVar16 + 0x20);
  lVar16 = *(long *)(lVar19 + 0x160);
  if (lVar16 == 0) {
    lVar38 = 0x120;
    FUN_0000f368();
    lVar16 = lVar38;
    FUN_0107a2d8();
    if ((lVar16 != 0) &&
       (uVar11 = *(uint *)(lVar38 + 8), *(uint *)(lVar38 + 8) = uVar11 + 1, 0xfffffffe < uVar11)) {
                    /* WARNING: Does not return */
      pcVar8 = (code *)SoftwareBreakpoint(0,0x37e5964);
      (*pcVar8)();
    }
    FUN_0127c1fc(lVar19,lVar38);
    lVar16 = *(long *)(lVar19 + 0x160);
  }
  FUN_022b7284(lVar16,&local_1b0);
  pcVar34 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  pcVar20 = pcVar34;
  FUN_04242e5c();
  FUN_00bfb2ec();
  FUN_00bfb18c();
  if (pcVar20 == (char *)0x0) {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e56d0);
    (*pcVar8)();
  }
  lVar16 = *(long *)(param_1 + 0x850);
  piVar17 = *(int **)(pcVar20 + 0x168);
  if (piVar17 == (int *)0x0) {
    lVar19 = *(long *)(pcVar20 + 0x170);
    pdVar13 = &segment_command_00000020.maxprot;
    FUN_0000f368();
  }
  else {
    iVar10 = *piVar17;
    *piVar17 = iVar10 + 1;
    if (iVar10 == 0x7fffffff) {
                    /* WARNING: Does not return */
      pcVar8 = (code *)SoftwareBreakpoint(0,0x37e5790);
      (*pcVar8)();
    }
    lVar19 = *(long *)(pcVar20 + 0x170);
    pdVar13 = &segment_command_00000020.maxprot;
    FUN_0000f368();
    iVar10 = *piVar17;
    *piVar17 = iVar10 + 1;
    if (iVar10 == 0x7fffffff) {
                    /* WARNING: Does not return */
      pcVar8 = (code *)SoftwareBreakpoint(0,0x37e579c);
      (*pcVar8)();
    }
  }
  *(undefined ***)pdVar13 = &PTR_FUN_0e509698;
  pdVar18 = pdVar13 + 2;
  *(undefined ***)pdVar18 = &PTR_FUN_0e3549f8;
  *(undefined8 *)(pdVar13 + 4) = 0;
  *(undefined8 *)(pdVar13 + 6) = 0;
  *(undefined1 *)(pdVar13 + 8) = 0;
  if (((ulong)pdVar18 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pdVar18);
  }
  *(dword **)(pdVar13 + 10) = pdVar18;
  *(undefined8 *)(pdVar13 + 0xc) = 0;
  FUN_01edeca0(pdVar18,0);
  plVar22 = (long *)(pdVar13 + 0xe);
  *(undefined8 *)(pdVar13 + 0x10) = 0;
  *plVar22 = 0;
  *(undefined8 *)(pdVar13 + 0x14) = 0;
  *(undefined8 *)(pdVar13 + 0x12) = 0;
  if (*(undefined1 **)(pdVar13 + 4) != pcVar34) {
    FUN_01edeca0(pdVar18,pcVar34);
    pcVar20 = pcVar34;
    FUN_04243bbc();
    if (((ulong)pdVar13 & 0xfffffffc00000000) == DAT_0ebb2088) {
      FUN_000142fc(pdVar13);
    }
    pqVar46 = &segment_command_00000020.vmaddr;
    FUN_0000f368();
    *(undefined4 *)pqVar46 = 1;
    pqVar46[1] = (qword)&LAB_03f39e80;
    pqVar46[2] = (qword)FUN_03899b40;
    pqVar46[3] = (qword)FUN_0255db00;
    pqVar46[4] = (qword)FUN_04681d70;
    pqVar46[5] = 0;
    pqVar46[6] = (qword)pdVar13;
    (**(code **)(*(long *)pcVar20 + 0x18))(pcVar20,pqVar46);
    if (pcVar20 != (char *)0x0) {
      (**(code **)(*(long *)pcVar20 + 8))(pcVar20);
    }
    if (((ulong)pdVar13 & 0xfffffffc00000000) == DAT_0ebb2088) {
      FUN_000142fc(pdVar13);
    }
    pqVar46 = &segment_command_00000020.vmaddr;
    FUN_0000f368();
    *(undefined4 *)pqVar46 = 1;
    pqVar46[1] = (qword)&LAB_03f39e80;
    pqVar46[2] = (qword)FUN_03899b40;
    pqVar46[3] = (qword)FUN_0255db00;
    pqVar46[4] = (qword)FUN_04681e00;
    pqVar46[5] = 0;
    pqVar46[6] = (qword)pdVar13;
    FUN_01c0bef0(&local_120,(long)pcVar34 + 0x2d8,pqVar46);
    FUN_00846ad0(pdVar13 + 0x14,&local_120);
    pqVar46 = local_120;
    if (local_120 != (qword *)0x0) {
      local_120 = (qword *)0x0;
      (*(code *)pqVar46[1])(pqVar46);
      LOAcquire();
      qVar37 = *pqVar46;
      *(int *)pqVar46 = (int)qVar37 + -1;
      LORelease();
      if ((int)qVar37 == 1) {
        (*(code *)pqVar46[2])(pqVar46);
      }
      if (local_120 != (qword *)0x0) {
        LOAcquire();
        qVar37 = *local_120;
        *(int *)local_120 = (int)qVar37 + -1;
        LORelease();
        if ((int)qVar37 == 1) {
          (*(code *)local_120[2])();
        }
      }
    }
    FUN_04681e70(pdVar13);
  }
  if ((piVar17 != (int *)0x0) && (iVar10 = *piVar17, *piVar17 = iVar10 + 1, iVar10 == 0x7fffffff)) {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e57a8);
    (*pcVar8)();
  }
  if ((*plVar22 == 0) || (*(char *)(*plVar22 + 4) != '\0')) {
    lVar38 = 0;
    if (piVar17 == (int *)0x0) goto LAB_037e4a28;
LAB_037e3780:
    lVar48 = lVar19;
    if ((char)piVar17[1] != '\0') {
      lVar48 = 0;
    }
    if (lVar38 != lVar48) {
      iVar10 = *piVar17;
      *piVar17 = iVar10 + 1;
      if (iVar10 == 0x7fffffff) {
                    /* WARNING: Does not return */
        pcVar8 = (code *)SoftwareBreakpoint(0,0x37e57c4);
        (*pcVar8)();
      }
LAB_037e37a8:
      piVar32 = (int *)*plVar22;
      *plVar22 = (long)piVar17;
      if (piVar32 != (int *)0x0) {
        LOAcquire();
        iVar10 = *piVar32;
        *piVar32 = iVar10 + -1;
        LORelease();
        if (iVar10 == 1) {
          FUN_00008eb8(piVar32,8);
        }
      }
      *(long *)(pdVar13 + 0x10) = lVar19;
      local_120 = (qword *)0x0;
      FUN_00846ad0(pdVar13 + 0x12,&local_120);
      pqVar46 = local_120;
      if (local_120 != (qword *)0x0) {
        local_120 = (qword *)0x0;
        (*(code *)pqVar46[1])(pqVar46);
        LOAcquire();
        qVar37 = *pqVar46;
        *(int *)pqVar46 = (int)qVar37 + -1;
        LORelease();
        if ((int)qVar37 == 1) {
          (*(code *)pqVar46[2])(pqVar46);
        }
        if (local_120 != (qword *)0x0) {
          LOAcquire();
          qVar37 = *local_120;
          *(int *)local_120 = (int)qVar37 + -1;
          LORelease();
          if ((int)qVar37 == 1) {
            (*(code *)local_120[2])();
          }
        }
      }
      FUN_04681e70(pdVar13);
      if (piVar17 == (int *)0x0) goto LAB_037e37dc;
    }
    LOAcquire();
    iVar10 = *piVar17;
    *piVar17 = iVar10 + -1;
    LORelease();
    if (iVar10 == 1) {
      FUN_00008eb8(piVar17,8);
    }
    LOAcquire();
    iVar10 = *piVar17;
    *piVar17 = iVar10 + -1;
    LORelease();
    if (iVar10 == 1) {
      FUN_00008eb8(piVar17,8);
    }
  }
  else {
    lVar38 = *(long *)(pdVar13 + 0x10);
    if (piVar17 != (int *)0x0) goto LAB_037e3780;
LAB_037e4a28:
    if (lVar38 != 0) goto LAB_037e37a8;
  }
LAB_037e37dc:
  pqVar36 = *(qword **)(lVar16 + 0x10);
  pqVar46 = (qword *)(lVar16 + 0x10);
  while (pqVar21 = pqVar46, pqVar36 != (qword *)0x0) {
    while (pqVar25 = pqVar36, pqVar46 = pqVar25, (undefined1 *)pqVar25[4] <= pcVar34) {
      if (pcVar34 <= (undefined1 *)pqVar25[4]) goto LAB_037e3844;
      pqVar36 = (qword *)pqVar25[1];
      if ((qword *)pqVar25[1] == (qword *)0x0) {
        pqVar21 = pqVar25 + 1;
        goto LAB_037e37f0;
      }
    }
    pqVar36 = (qword *)*pqVar25;
  }
LAB_037e37f0:
  pqVar25 = (qword *)(segment_command_00000020.segname + 8);
  FUN_0000f368();
  if ((pqVar25 == (qword *)0x0) || (pqVar25 == (qword *)&DAT_ffffffffffffffe0)) {
LAB_037e1c14:
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(1,0x37e1c18);
    (*pcVar8)();
  }
  pqVar25[4] = (qword)pcVar34;
  pqVar25[5] = 0;
  *pqVar25 = 0;
  pqVar25[1] = 0;
  pqVar25[2] = (qword)pqVar46;
  *pqVar21 = (qword)pqVar25;
  pqVar46 = pqVar25;
  if (**(long **)(lVar16 + 8) != 0) {
    *(long *)(lVar16 + 8) = **(long **)(lVar16 + 8);
    pqVar46 = (qword *)*pqVar21;
  }
  FUN_0005ba60(*(undefined8 *)(lVar16 + 0x10),pqVar46);
  *(long *)(lVar16 + 0x18) = *(long *)(lVar16 + 0x18) + 1;
LAB_037e3844:
  plVar22 = (long *)pqVar25[5];
  pqVar25[5] = (qword)pdVar13;
  if (plVar22 != (long *)0x0) {
    (**(code **)(*plVar22 + 8))();
  }
  if (piVar17 != (int *)0x0) {
    LOAcquire();
    iVar10 = *piVar17;
    *piVar17 = iVar10 + -1;
    LORelease();
    if (iVar10 == 1) {
      FUN_00008eb8(piVar17,8);
    }
  }
  if (pcVar34[0x169] != '\0') {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e56dc);
    (*pcVar8)();
  }
  FUN_007793fc(*(long *)(param_1 + 0x680),pcVar34,
               *(undefined8 *)(*(long *)(param_1 + 0x680) + 0x198));
  if (((ulong)pcVar34 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar34);
  }
  if ((*(ulong *)(param_1 + 0x6e8) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(char **)(param_1 + 0x6e8) = pcVar34;
  FUN_01c14c00((long)pcVar34 + 0xd8,&DAT_0ea05688,&PTR_s_kNewTabButtonElementId_0ead32d8);
  lVar16 = *(long *)(param_1 + 0x6e8);
  pqVar46 = &segment_command_00000020.vmsize;
  FUN_0000f368();
  *(undefined4 *)pqVar46 = 1;
  pqVar46[1] = (qword)FUN_01027980;
  pqVar46[2] = (qword)FUN_002f2880;
  pqVar46[3] = (qword)FUN_0255db00;
  pqVar46[4] = (qword)&LAB_03b26c40;
  pqVar46[6] = uVar4;
  pqVar46[5] = uVar15;
  *(undefined1 *)(pqVar46 + 7) = 0;
  puStack_118 = &DAT_100000001;
  local_110 = CONCAT44(local_110._4_4_,3);
  local_100 = 0;
  uStack_f8 = 0;
  local_108 = 0;
  local_120 = pqVar46;
  FUN_01c1438c(lVar16 + 0xd8,&DAT_0ea05548,&local_120);
  FUN_0174ad24(&local_120);
  lVar16 = *(long *)(param_1 + 0x6e8);
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar46 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar46 = 1;
  pqVar46[1] = (qword)&LAB_03f39e80;
  pqVar46[2] = (qword)FUN_03899b40;
  pqVar46[3] = (qword)FUN_0255db00;
  pqVar46[4] = (qword)&LAB_04630edc;
  pqVar46[5] = 0;
  pqVar46[6] = (qword)param_1;
  FUN_01c0bef0(&local_120,lVar16 + 0x640,pqVar46);
  FUN_00846ad0((long)param_1 + 0x868,&local_120);
  pqVar46 = local_120;
  if (local_120 != (qword *)0x0) {
    local_120 = (qword *)0x0;
    (*(code *)pqVar46[1])(pqVar46);
    LOAcquire();
    qVar37 = *pqVar46;
    *(int *)pqVar46 = (int)qVar37 + -1;
    LORelease();
    if ((int)qVar37 == 1) {
      (*(code *)pqVar46[2])(pqVar46);
    }
    if (local_120 != (qword *)0x0) {
      LOAcquire();
      qVar37 = *local_120;
      *(int *)local_120 = (int)qVar37 + -1;
      LORelease();
      if ((int)qVar37 == 1) {
        (*(code *)local_120[2])();
      }
    }
  }
  lVar16 = *(long *)(param_1 + 0x680);
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pcVar34 = segment_command_00000020.segname + 8;
  FUN_0000f368();
  pcVar34[0] = '\x01';
  pcVar34[1] = '\0';
  pcVar34[2] = '\0';
  pcVar34[3] = '\0';
  *(undefined1 **)(pcVar34 + 8) = &LAB_0466c38c;
  *(code **)(pcVar34 + 0x10) = FUN_03963480;
  *(code **)(pcVar34 + 0x18) = FUN_0255db00;
  *(char **)(pcVar34 + 0x28) = param_1;
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar46 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar46 = 1;
  pqVar46[1] = (qword)&LAB_03f39e80;
  pqVar46[2] = (qword)FUN_03899b40;
  pqVar46[3] = (qword)FUN_0255db00;
  pqVar46[4] = (qword)FUN_0462c188;
  pqVar46[5] = 0;
  pqVar46[6] = (qword)param_1;
  pcVar34 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  pcVar20 = pcVar34;
  FUN_04625d00();
  if (pcVar20[0x169] != '\0') {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e56e8);
    (*pcVar8)();
  }
  FUN_007793fc(lVar16,pcVar34,*(undefined8 *)(lVar16 + 0x198));
  if (((ulong)pcVar34 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar34);
  }
  if ((*(ulong *)(param_1 + 0x5d0) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(char **)(param_1 + 0x5d0) = pcVar34;
  pcVar34 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  pcVar20 = pcVar34;
  FUN_0136f140();
  if (pcVar20[0x1a9] != '\0') {
    pcVar34[0x1a9] = 0;
    FUN_00f27fd0((long)pcVar34 + 0xf8,(long)pcVar34 + 0x1a9);
  }
  FUN_027d1a60(pcVar34,0x1400000000,1);
  pqVar46 = &segment_command_00000020.vmsize;
  FUN_0000f368();
  *(undefined4 *)pqVar46 = 1;
  pqVar46[1] = (qword)FUN_01027980;
  pqVar46[2] = (qword)FUN_002f2880;
  pqVar46[3] = (qword)FUN_0255db00;
  pqVar46[4] = (qword)&LAB_03b26c40;
  pqVar46[6] = uVar4;
  pqVar46[5] = uVar15;
  *(undefined1 *)(pqVar46 + 7) = 0;
  puStack_118 = &DAT_100000001;
  local_110 = CONCAT44(local_110._4_4_,3);
  local_100 = 0;
  uStack_f8 = 0;
  local_108 = 0;
  local_120 = pqVar46;
  FUN_01c1438c((long)pcVar34 + 0xd8,&DAT_0ea05548,&local_120);
  FUN_0174ad24(&local_120);
  if (pcVar34[0x169] != '\0') {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e56f4);
    (*pcVar8)();
  }
  FUN_007793fc(*(long *)(param_1 + 0x5c0),pcVar34,
               *(undefined8 *)(*(long *)(param_1 + 0x5c0) + 0x198));
  pcVar34 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  pcVar20 = pcVar34;
  FUN_0136f140();
  if (((ulong)pcVar20 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar34);
  }
  if ((*(ulong *)(param_1 + 0x5a8) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(char **)(param_1 + 0x5a8) = pcVar34;
  psVar14 = &segment_command_00000020;
  FUN_0000f368();
  psVar14->segname[0] = '\0';
  psVar14->segname[1] = '\0';
  psVar14->segname[2] = -1;
  psVar14->segname[3] = -1;
  psVar14->segname[4] = '\x01';
  *(undefined ***)psVar14 = &PTR_FUN_0e34c110;
  uVar41 = _DAT_0d6e5150;
  psVar14->vmaddr = _UNK_0d6e5158;
  *(undefined8 *)(psVar14->segname + 8) = uVar41;
  (**(code **)(*(long *)pcVar34 + 0x110))(pcVar34,psVar14);
  FUN_027d1a60(*(undefined8 *)(param_1 + 0x5a8),0x2a00000000,1);
  FUN_01c1588c(*(undefined8 *)(param_1 + 0x5a8),1);
  lVar16 = *(long *)(*(long *)(param_1 + 0x5a8) + 0x20);
  if (*(int *)(lVar16 + 8) == 2) {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e5700);
    (*pcVar8)();
  }
  if (*(char *)(lVar16 + 0x8a) != '\0') {
    *(undefined1 *)(lVar16 + 0x8a) = 0;
    FUN_00dcdb40(*(undefined8 *)(lVar16 + 0x168),0);
    lVar16 = *(long *)(*(long *)(param_1 + 0x5a8) + 0x20);
  }
  FUN_02218844(*(undefined8 *)(lVar16 + 0x168),1);
  lVar16 = *(long *)(param_1 + 0x5a8);
  pqVar46 = &segment_command_00000020.vmsize;
  FUN_0000f368();
  *(undefined4 *)pqVar46 = 1;
  pqVar46[1] = (qword)FUN_01027980;
  pqVar46[2] = (qword)FUN_002f2880;
  pqVar46[3] = (qword)FUN_0255db00;
  pqVar46[4] = (qword)&LAB_03b26c40;
  pqVar46[6] = uVar4;
  pqVar46[5] = uVar15;
  *(undefined1 *)(pqVar46 + 7) = 0;
  puStack_118 = &DAT_100000001;
  local_110 = CONCAT44(local_110._4_4_,3);
  local_100 = 0;
  uStack_f8 = 0;
  local_108 = 0;
  local_120 = pqVar46;
  FUN_01c1438c(lVar16 + 0xd8,&DAT_0ea05548,&local_120);
  FUN_0174ad24(&local_120);
  if (pcVar34[0x169] != '\0') {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e570c);
    (*pcVar8)();
  }
  FUN_007793fc(param_1,pcVar34,*(undefined8 *)(param_1 + 0x198));
  pcVar34 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  pcVar20 = pcVar34;
  FUN_0465c5f0();
  if (((ulong)pcVar20 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar34);
  }
  if ((*(ulong *)(param_1 + 0x598) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(char **)(param_1 + 0x598) = pcVar34;
  if ((pcVar34[0x531] & 1U) == 0) {
    pcVar34[0x531] = 1;
    (**(code **)(**(long **)(pcVar34 + 0x518) + 0xa0))(*(long **)(pcVar34 + 0x518),0);
    (**(code **)(**(long **)(pcVar34 + 0x528) + 0xa0))
              (*(long **)(pcVar34 + 0x528),(pcVar34[0x530] ^ 0xffU) & 1);
    plVar22 = *(long **)(pcVar34 + 0x520);
    if (((((pcVar34[0x530] & 1U) == 0) && ((pcVar34[0x531] & 1U) == 0)) &&
        (plVar42 = *(long **)(*(long *)(*(long *)(pcVar34 + 0x4d0) + 0x538) + 0x68),
        plVar42 != (long *)0x0)) &&
       (((**(code **)(*plVar42 + 0x170))(), plVar42 != (long *)0x0 &&
        (plVar24 = plVar42, FUN_004bcc4c(), plVar24 != (long *)0x0)))) {
      FUN_00306500(plVar42,"aside.account_auth_paused",0x19);
    }
    else {
      plVar42 = (long *)0x0;
    }
    (**(code **)(*plVar22 + 0xa0))(plVar22,plVar42);
    if (pcVar34[0x558] != '\0') {
      pcVar34[0x558] = 0;
    }
    (**(code **)(*(long *)pcVar34 + 0x308))(pcVar34);
    FUN_00630474(pcVar34,0);
  }
  pcVar20 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  FUN_0136f140();
  lVar16 = 0x140;
  FUN_0000f368();
  FUN_02a105d0();
  FUN_01b89838(pcVar20,lVar16);
  if (*(int *)(lVar16 + 0xf0) != 0) {
    *(undefined4 *)(lVar16 + 0xf0) = 0;
    FUN_01a652b0(lVar16,1);
  }
  if (*(int *)(lVar16 + 0x108) != 1) {
    *(undefined4 *)(lVar16 + 0x108) = 1;
    FUN_01a652b0(lVar16,1);
  }
  local_120 = (qword *)CONCAT44(local_120._4_4_,1);
  FUN_01a651a4(lVar16 + 0x118,&DAT_0ea05568,&local_120);
  FUN_027d1a60(pcVar20,0x1800000000,1);
  FUN_01c1588c(pcVar20,1);
  qVar37 = *(qword *)(pcVar20 + 0x20);
  if (*(int *)(qVar37 + 8) == 2) {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e5718);
    (*pcVar8)();
  }
  if (*(char *)(qVar37 + 0x8a) != '\0') {
    *(undefined1 *)(qVar37 + 0x8a) = 0;
    FUN_00dcdb40(*(undefined8 *)(qVar37 + 0x168),0);
  }
  if (pcVar20[0x169] != '\0') {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e5724);
    (*pcVar8)();
  }
  FUN_007793fc(*(long *)(param_1 + 0x5a8),pcVar20,
               *(undefined8 *)(*(long *)(param_1 + 0x5a8) + 0x198));
  if (((ulong)pcVar20 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar20);
  }
  if ((*(ulong *)(param_1 + 0x5e0) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(char **)(param_1 + 0x5e0) = pcVar20;
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar46 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar46 = 1;
  pqVar46[1] = (qword)&LAB_03f39e80;
  pqVar46[2] = (qword)FUN_03899b40;
  pqVar46[3] = (qword)FUN_0255db00;
  pqVar46[4] = (qword)&DAT_04631518;
  pqVar46[5] = 0;
  pqVar46[6] = (qword)param_1;
  ppqVar33 = &local_120;
  local_120 = pqVar46;
  FUN_04630f80();
  if (local_120 != (qword *)0x0) {
    LOAcquire();
    qVar37 = *local_120;
    *(int *)local_120 = (int)qVar37 + -1;
    LORelease();
    if ((int)qVar37 == 1) {
      (*(code *)local_120[2])();
    }
  }
  if (((ulong)ppqVar33 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(ppqVar33);
  }
  if ((*(ulong *)(param_1 + 0x5a0) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(qword ***)(param_1 + 0x5a0) = ppqVar33;
  if (pcVar34[0x169] != '\0') {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e5730);
    (*pcVar8)();
  }
  FUN_007793fc(*(undefined8 *)(param_1 + 0x5a8),pcVar34,0);
  if (*(char *)((long)ppqVar33 + 0x169) != '\0') {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e573c);
    (*pcVar8)();
  }
  FUN_007793fc(*(long *)(param_1 + 0x5a8),ppqVar33,
               *(undefined8 *)(*(long *)(param_1 + 0x5a8) + 0x198));
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar46 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar46 = 1;
  pqVar46[1] = (qword)&LAB_03f39e80;
  pqVar46[2] = (qword)FUN_03899b40;
  pqVar46[3] = (qword)FUN_0255db00;
  pqVar46[4] = (qword)&LAB_04630edc;
  pqVar46[5] = 0;
  pqVar46[6] = (qword)param_1;
  pcVar34 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  pcVar20 = pcVar34;
  FUN_03621b00();
  if (pcVar20[0x169] != '\0') {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e5748);
    (*pcVar8)();
  }
  FUN_007793fc(param_1,pcVar34,*(undefined8 *)(param_1 + 0x198));
  if (((ulong)pcVar34 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar34);
  }
  if ((*(ulong *)(param_1 + 0x6f0) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(char **)(param_1 + 0x6f0) = pcVar34;
  pqVar46 = &segment_command_00000020.vmsize;
  FUN_0000f368();
  *(undefined4 *)pqVar46 = 1;
  pqVar46[1] = (qword)FUN_01027980;
  pqVar46[2] = (qword)FUN_002f2880;
  pqVar46[3] = (qword)FUN_0255db00;
  pqVar46[4] = (qword)&LAB_03b26c40;
  pqVar46[6] = uVar4;
  pqVar46[5] = uVar15;
  *(undefined1 *)(pqVar46 + 7) = 0;
  puStack_118 = &DAT_100000001;
  local_110 = CONCAT44(local_110._4_4_,3);
  local_100 = 0;
  uStack_f8 = 0;
  local_108 = 0;
  local_120 = pqVar46;
  FUN_01c1438c((long)pcVar34 + 0xd8,&DAT_0ea05548,&local_120);
  FUN_0174ad24(&local_120);
  pcVar34 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  pcVar20 = pcVar34;
  FUN_0136f140();
  if (pcVar20[0x169] != '\0') {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e5754);
    (*pcVar8)();
  }
  FUN_007793fc(param_1,pcVar34,*(undefined8 *)(param_1 + 0x198));
  if (((ulong)pcVar34 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar34);
  }
  if ((*(ulong *)(param_1 + 0x6f8) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(char **)(param_1 + 0x6f8) = pcVar34;
  pcVar34 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  pcVar20 = pcVar34;
  FUN_02f98600();
  *(undefined ***)pcVar20 = &PTR_LAB_0e72a050;
  *(undefined ***)(pcVar20 + 8) = &PTR_LAB_0e72a438;
  *(undefined ***)(pcVar20 + 0x10) = &PTR_FUN_0e72a460;
  *(undefined ***)(pcVar20 + 0x68) = &PTR_setProperty_forKey__0e72a498;
  *(undefined ***)(pcVar20 + 0x70) = &PTR_FUN_0e72a4c8;
  *(undefined ***)(pcVar20 + 0xb0) = &PTR_FUN_0e72a518;
  *(undefined ***)(pcVar20 + 0xd8) = &PTR_FUN_0e72a578;
  *(undefined ***)(pcVar20 + 0xf8) = &PTR_FUN_0e72a5a8;
  *(undefined8 *)(pcVar20 + 0x328) = 0;
  FUN_01c1588c();
  qVar37 = *(qword *)(pcVar34 + 0x20);
  if (*(int *)(qVar37 + 8) == 2) {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e5760);
    (*pcVar8)();
  }
  if (*(char *)(qVar37 + 0x8a) != '\0') {
    *(undefined1 *)(qVar37 + 0x8a) = 0;
    FUN_00dcdb40(*(undefined8 *)(qVar37 + 0x168),0);
  }
  lVar16 = 0x140;
  FUN_0000f368();
  FUN_02a105d0();
  FUN_01b89838(pcVar34,lVar16);
  if (*(int *)(lVar16 + 0xf0) != 1) {
    *(undefined4 *)(lVar16 + 0xf0) = 1;
    FUN_01a652b0(lVar16,1);
  }
  if (*(int *)(lVar16 + 0x108) != 1) {
    *(undefined4 *)(lVar16 + 0x108) = 1;
    FUN_01a652b0(lVar16,1);
  }
  local_120 = (qword *)((ulong)local_120 & 0xffffffff00000000);
  FUN_01a651a4(lVar16 + 0x118,&DAT_0ea05568,&local_120);
  pcVar23 = DAT_0ef0a480;
  if (DAT_0ef0a480 == (char *)0x0) {
    FUN_042d36f8();
  }
  FUN_000ab5b0();
  pcVar45 = pcVar23;
  FUN_040e4500();
  if (pcVar45[0x169] != '\0') {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e576c);
    (*pcVar8)();
  }
  FUN_007793fc(pcVar34,pcVar23,*(undefined8 *)(pcVar34 + 0x198));
  if (((ulong)pcVar23 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar23);
  }
  if ((*(ulong *)(pcVar34 + 0x328) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(char **)(pcVar34 + 0x328) = pcVar23;
  if (pcVar34[0x169] != '\0') {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e5778);
    (*pcVar8)();
  }
  FUN_007793fc(param_1,pcVar34,*(undefined8 *)(param_1 + 0x198));
  if (((ulong)pcVar34 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(pcVar34);
  }
  if ((*(ulong *)(param_1 + 0x700) & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_00022a3c();
  }
  *(char **)(param_1 + 0x700) = pcVar34;
  FUN_00b6a19c(pcVar20 + 0xd8,&DAT_0ea055e8,"kViewIgnoredByLayoutKey",0,1,0);
  FUN_015377dc(*(undefined8 *)(param_1 + 0x700),2);
  iVar10 = (int)*(undefined8 *)(param_1 + 0x700);
  FUN_0136ee40();
  lVar19 = *(long *)(param_1 + 0x700);
  lVar16 = *(long *)(lVar19 + 0x2c8);
  if (lVar16 == 0) {
    FUN_00ee6100();
    if (iVar10 == 0) {
      lVar16 = lVar19;
      FUN_012de654();
    }
    else {
      lVar16 = 0x1b0;
      FUN_0000f368();
      FUN_00ee5b80();
    }
    plVar22 = *(long **)(lVar19 + 0x2c8);
    *(long *)(lVar19 + 0x2c8) = lVar16;
    if (plVar22 != (long *)0x0) {
      (**(code **)(*plVar22 + 8))();
      lVar16 = *(long *)(lVar19 + 0x2c8);
    }
  }
  if (DAT_0ef0fde8 == 0) {
                    /* WARNING: Does not return */
    pcVar8 = (code *)SoftwareBreakpoint(0,0x37e5784);
    (*pcVar8)();
  }
  local_1c8 = 0;
  uStack_1c0 = 0;
  local_1b8 = 0;
  FUN_012b46dc(&local_1c8,DAT_0ef0fde8,&DAT_00002c2b);
  FUN_0116d8d8(lVar16,&local_1c8);
  if (local_1b8 < 0) {
    FUN_00008eb8(local_1c8,local_1b8 << 1);
  }
  lVar19 = *(long *)(param_1 + 0x700);
  lVar16 = *(long *)(lVar19 + 0x2c8);
  if (lVar16 == 0) {
    FUN_00ee6100();
    if ((int)lVar16 == 0) {
      lVar16 = lVar19;
      FUN_012de654();
    }
    else {
      lVar16 = 0x1b0;
      FUN_0000f368();
      FUN_00ee5b80();
    }
    plVar22 = *(long **)(lVar19 + 0x2c8);
    *(long *)(lVar19 + 0x2c8) = lVar16;
    if (plVar22 != (long *)0x0) {
      (**(code **)(*plVar22 + 8))(plVar22);
    }
  }
  FUN_0168e4e0();
  if (DAT_0eee6cf8 != 0) {
    uVar39 = DAT_0eee6cf8;
    FUN_01a1fb78();
    if (uVar39 != 0) {
      FUN_01a1fc10();
      if ((uVar39 & 0xfffffffc00000000) == DAT_0ebb2088) {
        FUN_000142fc(uVar39);
      }
      if ((*(ulong *)(param_1 + 0x8b0) & 0xfffffffc00000000) == DAT_0ebb2088) {
        FUN_00022a3c();
      }
      *(ulong *)(param_1 + 0x8b0) = uVar39;
      FUN_014c3a90(uVar39 + 0x18,*(undefined8 *)(param_1 + 0x8a8));
    }
    if ((DAT_0eee6cf8 != 0) && (uVar39 = *(ulong *)(DAT_0eee6cf8 + 0x38), uVar39 != 0)) {
      if ((uVar39 & 0xfffffffc00000000) == DAT_0ebb2088) {
        FUN_000142fc(uVar39);
      }
      if ((*(ulong *)(param_1 + 0x660) & 0xfffffffc00000000) == DAT_0ebb2088) {
        FUN_00026a44();
      }
      *(ulong *)(param_1 + 0x660) = uVar39;
      piVar17 = *(int **)(param_1 + 0x1408);
      if ((piVar17 != (int *)0x0) &&
         (iVar10 = *piVar17, *piVar17 = iVar10 + 1, iVar10 == 0x7fffffff)) {
                    /* WARNING: Does not return */
        pcVar8 = (code *)SoftwareBreakpoint(0,0x37e5898);
        (*pcVar8)();
      }
      uVar15 = *(undefined8 *)(param_1 + 0x1410);
      pqVar46 = &segment_command_00000020.vmsize;
      FUN_0000f368();
      *(undefined4 *)pqVar46 = 1;
      pqVar46[1] = (qword)&LAB_03fbb700;
      pqVar46[2] = (qword)FUN_03f9e440;
      pqVar46[3] = (qword)&LAB_0406a280;
      pqVar46[4] = (qword)FUN_04631534;
      pqVar46[5] = 0;
      pqVar46[6] = (qword)piVar17;
      pqVar46[7] = uVar15;
      if (pqVar46 == (qword *)0x0) {
        pcVar34 = (char *)0x0;
      }
      else {
        pcVar34 = segment_command_00000020.segname + 8;
        FUN_0000f368();
        pcVar34[0] = '\x01';
        pcVar34[1] = '\0';
        pcVar34[2] = '\0';
        pcVar34[3] = '\0';
        *(code **)(pcVar34 + 8) = FUN_0250445c;
        *(code **)(pcVar34 + 0x10) = FUN_038981c0;
        *(code **)(pcVar34 + 0x18) = FUN_0255db00;
        *(qword **)(pcVar34 + 0x28) = pqVar46;
      }
      FUN_010eac30((long)param_1 + 0x638,"aside.vertical_tabs.profile_order",0x21,pcVar34);
    }
  }
  FUN_04631680(param_1);
  FUN_04632a8c(param_1);
  FUN_04632c48(param_1);
  FUN_04633088(param_1,150000);
  iVar10 = 0xebaa418;
  FUN_00119280();
  uVar39 = DAT_0ef08030;
  puVar47 = &LAB_00055730;
  if (iVar10 == 0) {
    puVar47 = (undefined1 *)0x6ddd0;
  }
  uVar49 = DAT_0ef08030;
  FUN_001f557c(DAT_0ef08030,"force-prefers-reduced-motion");
  if ((uVar49 & 1) == 0) {
    FUN_001f557c(uVar39,"force-prefers-no-reduced-motion");
    if ((uVar39 & 1) == 0) {
      if (((DAT_0ef10329 & 1) == 0) && (FUN_0293e4a4(), (DAT_0ef10329 & 1) == 0)) goto LAB_037e5414;
      if ((DAT_0ef10328 & 1) != 0) goto LAB_037e544c;
    }
  }
  else {
LAB_037e544c:
    puVar47 = (undefined1 *)0x0;
  }
  *(undefined1 **)(param_1 + 0xd48) = puVar47;
  iVar10 = 0xebaa418;
  FUN_00119280();
  uVar35 = 0x17;
  if (iVar10 == 0) {
    uVar35 = 8;
  }
  *(undefined4 *)(param_1 + 0xd20) = uVar35;
  bVar2 = *(byte *)(*(long *)(param_1 + 0x848) + 0x90);
  if (param_1[0xd28] != '\0') {
    param_1[0xd28] = 0;
  }
  *(double *)(param_1 + 0xd40) = (double)((bVar2 ^ 0xff) & 1);
  iVar10 = (int)param_1;
  if (param_1[0xce0] != '\0') {
    param_1[0xce0] = 0;
    FUN_02109700(*(undefined8 *)(param_1 + 0xcf0),(long)param_1 + 0xcd0);
    (**(code **)(*(long *)(param_1 + 0xcd0) + 0x38))((long)param_1 + 0xcd0);
    if (*(long *)(param_1 + 0xce8) != 0) {
      iVar12 = iVar10 + 0xcd0;
      (**(code **)(*(long *)(param_1 + 0xcd0) + 0x40))();
      lVar16 = 0x20;
      if (iVar12 == 0) {
        lVar16 = 0x10;
      }
      (**(code **)(**(long **)(param_1 + 0xce8) + lVar16))
                (*(long **)(param_1 + 0xce8),(long)param_1 + 0xcd0);
    }
  }
  *(undefined8 *)(param_1 + 0xdd0) = 170000;
  *(undefined4 *)(param_1 + 0xda8) = 1;
  if (param_1[0xdb0] != '\0') {
    param_1[0xdb0] = 0;
  }
  *(undefined8 *)(param_1 + 0xdc8) = 0x3ff0000000000000;
  if (param_1[0xd68] != '\0') {
    param_1[0xd68] = 0;
    FUN_02109700(*(undefined8 *)(param_1 + 0xd78),(long)param_1 + 0xd58);
    (**(code **)(*(long *)(param_1 + 0xd58) + 0x38))((long)param_1 + 0xd58);
    if (*(long *)(param_1 + 0xd70) != 0) {
      iVar12 = iVar10 + 0xd58;
      (**(code **)(*(long *)(param_1 + 0xd58) + 0x40))();
      lVar16 = 0x20;
      if (iVar12 == 0) {
        lVar16 = 0x10;
      }
      (**(code **)(**(long **)(param_1 + 0xd70) + lVar16))
                (*(long **)(param_1 + 0xd70),(long)param_1 + 0xd58);
    }
  }
  *(undefined1 **)(param_1 + 0xe58) = &LAB_0001adb0;
  *(undefined4 *)(param_1 + 0xe30) = 1;
  if (param_1[0xe38] != '\0') {
    param_1[0xe38] = 0;
  }
  *(undefined8 *)(param_1 + 0xe50) = 0x3ff0000000000000;
  if (param_1[0xdf0] != '\0') {
    param_1[0xdf0] = 0;
    FUN_02109700(*(undefined8 *)(param_1 + 0xe00),(long)param_1 + 0xde0);
    (**(code **)(*(long *)(param_1 + 0xde0) + 0x38))((long)param_1 + 0xde0);
    if (*(long *)(param_1 + 0xdf8) != 0) {
      iVar12 = iVar10 + 0xde0;
      (**(code **)(*(long *)(param_1 + 0xde0) + 0x40))();
      lVar16 = 0x20;
      if (iVar12 == 0) {
        lVar16 = 0x10;
      }
      (**(code **)(**(long **)(param_1 + 0xdf8) + lVar16))
                (*(long **)(param_1 + 0xdf8),(long)param_1 + 0xde0);
    }
  }
  uVar39 = DAT_0ef08030;
  uVar49 = DAT_0ef08030;
  FUN_001f557c(DAT_0ef08030,"force-prefers-reduced-motion");
  if ((uVar49 & 1) == 0) {
    FUN_001f557c(uVar39,"force-prefers-no-reduced-motion");
    if ((uVar39 & 1) == 0) {
      if (((DAT_0ef10329 & 1) == 0) && (FUN_0293e4a4(), (DAT_0ef10329 & 1) == 0)) goto LAB_037e5414;
      if ((DAT_0ef10328 & 1) != 0) goto LAB_037e5454;
    }
    uVar15 = 140000;
  }
  else {
LAB_037e5454:
    uVar15 = 0;
  }
  *(undefined8 *)(param_1 + 0xee0) = uVar15;
  *(undefined4 *)(param_1 + 0xeb8) = 0xb;
  if (param_1[0xec0] != '\0') {
    param_1[0xec0] = 0;
  }
  *(undefined8 *)(param_1 + 0xed8) = 0x3ff0000000000000;
  if (param_1[0xe78] != '\0') {
    param_1[0xe78] = 0;
    FUN_02109700(*(undefined8 *)(param_1 + 0xe88),(long)param_1 + 0xe68);
    (**(code **)(*(long *)(param_1 + 0xe68) + 0x38))((long)param_1 + 0xe68);
    if (*(long *)(param_1 + 0xe80) != 0) {
      iVar12 = iVar10 + 0xe68;
      (**(code **)(*(long *)(param_1 + 0xe68) + 0x40))();
      lVar16 = 0x20;
      if (iVar12 == 0) {
        lVar16 = 0x10;
      }
      (**(code **)(**(long **)(param_1 + 0xe80) + lVar16))
                (*(long **)(param_1 + 0xe80),(long)param_1 + 0xe68);
    }
  }
  uVar39 = DAT_0ef08030;
  uVar49 = DAT_0ef08030;
  FUN_001f557c(DAT_0ef08030,"force-prefers-reduced-motion");
  if ((uVar49 & 1) == 0) {
    FUN_001f557c(uVar39,"force-prefers-no-reduced-motion");
    if ((uVar39 & 1) == 0) {
      if (((DAT_0ef10329 & 1) == 0) && (FUN_0293e4a4(), (DAT_0ef10329 & 1) == 0)) {
LAB_037e5414:
                    /* WARNING: Subroutine does not return */
        FUN_04c0031c();
      }
      if ((DAT_0ef10328 & 1) != 0) goto LAB_037e545c;
    }
    uVar15 = 160000;
  }
  else {
LAB_037e545c:
    uVar15 = 0;
  }
  *(undefined8 *)(param_1 + 0xf68) = uVar15;
  *(undefined4 *)(param_1 + 0xf40) = 1;
  if (param_1[0xf48] != '\0') {
    param_1[0xf48] = 0;
  }
  *(undefined8 *)(param_1 + 0xf60) = 0x3ff0000000000000;
  if (param_1[0xf00] != '\0') {
    param_1[0xf00] = 0;
    FUN_02109700(*(undefined8 *)(param_1 + 0xf10),(long)param_1 + 0xef0);
    (**(code **)(*(long *)(param_1 + 0xef0) + 0x38))((long)param_1 + 0xef0);
    if (*(long *)(param_1 + 0xf08) != 0) {
      iVar10 = iVar10 + 0xef0;
      (**(code **)(*(long *)(param_1 + 0xef0) + 0x40))();
      lVar16 = 0x20;
      if (iVar10 == 0) {
        lVar16 = 0x10;
      }
      (**(code **)(**(long **)(param_1 + 0xf08) + lVar16))
                (*(long **)(param_1 + 0xf08),(long)param_1 + 0xef0);
    }
  }
  FUN_03a17b24(*(undefined8 *)(param_1 + 0x848),(long)param_1 + 0x538);
  *(undefined8 *)(param_1 + 0x8c4) = *(undefined8 *)(*(long *)(param_1 + 0x848) + 0x90);
  FUN_046331d4(param_1);
  FUN_04633340(param_1,*(undefined8 *)(param_1 + 0x848));
  lVar16 = *(long *)(param_1 + 0x848);
  if (((ulong)param_1 & 0xfffffffc00000000) == DAT_0ebb2088) {
    FUN_000142fc(param_1);
  }
  pqVar46 = &segment_command_00000020.vmaddr;
  FUN_0000f368();
  *(undefined4 *)pqVar46 = 1;
  pqVar46[1] = (qword)&LAB_03fb3c00;
  pqVar46[2] = (qword)FUN_03899b40;
  pqVar46[3] = (qword)FUN_0255db00;
  pqVar46[4] = (qword)&LAB_046333d8;
  pqVar46[5] = 0;
  pqVar46[6] = (qword)param_1;
  FUN_01c142ac(&local_120,lVar16 + 0x98,pqVar46);
  FUN_00846ad0((long)param_1 + 0x8d0,&local_120);
  pqVar46 = local_120;
  if (local_120 != (qword *)0x0) {
    local_120 = (qword *)0x0;
    (*(code *)pqVar46[1])(pqVar46);
    LOAcquire();
    qVar37 = *pqVar46;
    *(int *)pqVar46 = (int)qVar37 + -1;
    LORelease();
    if ((int)qVar37 == 1) {
      (*(code *)pqVar46[2])(pqVar46);
    }
    if (local_120 != (qword *)0x0) {
      LOAcquire();
      qVar37 = *local_120;
      *(int *)local_120 = (int)qVar37 + -1;
      LORelease();
      if ((int)qVar37 == 1) {
        (*(code *)local_120[2])();
      }
    }
  }
  lVar16 = *(long *)(param_1 + 0x468);
  if (lVar16 != 0) {
    FUN_01a6ce10(lVar16 + 0x20,(long)param_1 + 0x540);
    FUN_01a6cf50((long)param_1 + 0x540,lVar16);
    lVar16 = **(long **)(param_1 + 0x468);
    if (0 < *(int *)(lVar16 + 0x18)) {
      lVar19 = 0;
      do {
        FUN_0105e2f8(lVar16,lVar19);
        FUN_046333e0(param_1,lVar16);
        lVar19 = lVar19 + 1;
        lVar16 = **(long **)(param_1 + 0x468);
      } while (lVar19 < *(int *)(lVar16 + 0x18));
    }
  }
  FUN_01c14c00(param_1 + 0xd8,&DAT_0ea05688,&PTR_s_kTabStripRegionElementId_0ead34c8);
  lVar16 = *(long *)(param_1 + 0x2c8);
  if (lVar16 == 0) {
    FUN_00ee6100();
    if ((int)lVar16 == 0) {
      pcVar34 = param_1;
      FUN_012de654();
    }
    else {
      pcVar34 = section_000001a8.sectname + 8;
      FUN_0000f368();
      FUN_00ee5b80();
    }
    plVar22 = *(long **)(param_1 + 0x2c8);
    *(char **)(param_1 + 0x2c8) = pcVar34;
    if (plVar22 != (long *)0x0) {
      (**(code **)(*plVar22 + 8))(plVar22);
    }
  }
  FUN_0168e4e0();
  uVar15 = 0x128;
  FUN_0000f368(0x128);
  FUN_028246f4();
  FUN_00f27a00(param_1,uVar15);
  iVar10 = 0xebaa558;
  FUN_00119280();
  if (iVar10 != 0) {
    uVar15 = 0x48;
    FUN_0000f368();
    FUN_07fb64d0();
    lVar16 = *(long *)(param_1 + 0x1130);
    *(undefined8 *)(param_1 + 0x1130) = uVar15;
    if (lVar16 != 0) {
      FUN_07fb6548();
      FUN_00008eb8();
    }
  }
  param_1[0x1cb] = 1;
  lVar16 = *(long *)(param_1 + 0x218);
  if (lVar16 != 0) {
    if ((*(byte *)(lVar16 + 0x48) & 1) == 0) {
      *(undefined1 *)(lVar16 + 0x48) = 1;
      if (*(long *)(lVar16 + 0x120) == 0) {
                    /* WARNING: Does not return */
        pcVar8 = (code *)SoftwareBreakpoint(0,0x37e5924);
        (*pcVar8)();
      }
      FUN_005a117c();
    }
    if (*(float *)(lVar16 + 100) != 0.0) {
      *(undefined4 *)(lVar16 + 100) = 0;
      if (*(long *)(lVar16 + 0x120) == 0) {
                    /* WARNING: Does not return */
        pcVar8 = (code *)SoftwareBreakpoint(0,0x37e58a4);
        (*pcVar8)();
      }
      FUN_005a117c();
    }
  }
  FUN_04633800(param_1);
  FUN_04633e10(param_1);
  FUN_04634090(param_1);
  FUN_04634874(param_1);
  return param_1;
}


