// func FUN_040daccc @ 040daccc size 1544

/* WARNING: Function: _objc_retain replaced with injection: _objc_retain_fixup */
/* WARNING: Function: _objc_claimAutoreleasedReturnValue replaced with injection: _objc_retain_fixup
    */
/* WARNING: Function: _objc_release replaced with injection: _objc_release_fixup */
/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

void FUN_040daccc(undefined8 *param_1)

{
  long lVar1;
  qword qVar2;
  undefined8 uVar3;
  ulong uVar4;
  code *pcVar5;
  int iVar6;
  segment_command *psVar7;
  char *pcVar8;
  char *pcVar9;
  undefined *self;
  ID IVar10;
  char *pcVar11;
  segment_command *psVar12;
  undefined1 uVar13;
  long *plVar14;
  undefined8 *puVar15;
  byte bVar16;
  undefined8 uVar17;
  ulong local_280;
  char *pcStack_278;
  long local_270;
  ulong uStack_268;
  char *local_258;
  long local_250;
  undefined8 uStack_248;
  ulong local_240;
  char *pcStack_238;
  long local_230;
  ulong local_228;
  undefined **local_220 [2];
  undefined1 auStack_210 [284];
  int local_f4;
  undefined8 local_f0;
  undefined8 local_e8;
  undefined8 local_e0;
  undefined8 local_d8;
  undefined8 local_d0;
  undefined8 local_c8;
  undefined8 local_c0;
  undefined8 local_b8;
  undefined8 local_b0;
  char *local_a8;
  char *local_a0;
  char *local_98;
  undefined8 local_90;
  undefined *local_88;
  ID local_80;
  undefined *local_78;
  long local_70;
  
  local_70 = *(long *)PTR____stack_chk_guard_0e0281f0;
  pcStack_278 = (char *)0x0;
  local_280 = 0;
  uStack_268 = 0;
  local_270 = 0;
  pcStack_238 = (char *)0x0;
  local_240 = 0;
  local_228 = 0;
  local_230 = 0;
  FUN_040da744(&local_240,"Aside Agent Master Key",0x16,"Aside Agent",0xb,0,0,0);
  if (1 < (byte)local_240) {
                    /* WARNING: Does not return */
    pcVar5 = (code *)SoftwareBreakpoint(0,0x40db33c);
    (*pcVar5)();
  }
  if ((local_240 & 1) == 0) {
    bVar16 = 0;
    local_280 = (ulong)local_280._1_7_ << 8;
    local_240 = CONCAT71(local_240._1_7_,2);
    plVar14 = (long *)((ulong)&local_240 | 8);
    local_270 = local_230;
    pcStack_278 = pcStack_238;
    uStack_268 = local_228;
  }
  else {
    if ((((long)local_228 < 0) && (local_230 == 0x18)) &&
       ((*(long *)pcStack_238 == 0x6e6961686379654b &&
        *(qword *)(pcStack_238 + 8) == 0x6f6e206d65746920) &&
        *(qword *)(pcStack_238 + 0x10) == 0x2e646e756f662074)) {
      local_258 = (char *)0x0;
      local_250 = 0;
      uStack_248 = 0;
      psVar7 = &segment_command_00000020;
      FUN_0000f368();
      if ((undefined1 *)0xffffffffffffffdf < (undefined1 *)((long)&psVar7[-1].flags + 3)) {
LAB_040db340:
                    /* WARNING: Does not return */
        pcVar5 = (code *)SoftwareBreakpoint(1,0x40db344);
        (*pcVar5)();
      }
      psVar7->segname[0] = '\0';
      psVar7->segname[1] = '\0';
      psVar7->segname[2] = '\0';
      psVar7->segname[3] = '\0';
      psVar7->segname[4] = '\0';
      psVar7->segname[5] = '\0';
      psVar7->segname[6] = '\0';
      psVar7->segname[7] = '\0';
      psVar7->cmd = 0;
      psVar7->cmdsize = 0;
      psVar7->vmaddr = 0;
      psVar7->segname[8] = '\0';
      psVar7->segname[9] = '\0';
      psVar7->segname[10] = '\0';
      psVar7->segname[0xb] = '\0';
      psVar7->segname[0xc] = '\0';
      psVar7->segname[0xd] = '\0';
      psVar7->segname[0xe] = '\0';
      psVar7->segname[0xf] = '\0';
      if (DAT_0ef093f8 == '\0') {
        psVar12 = psVar7;
        _getentropy(psVar7,0x20);
        if ((int)psVar12 != 0) {
          FUN_08805928();
          FUN_021d7af8();
          if (((ulong)psVar12 & 1) == 0) {
                    /* WARNING: Does not return */
            pcVar5 = (code *)SoftwareBreakpoint(0,0x40db2d0);
            (*pcVar5)();
          }
        }
      }
      else {
        FUN_000d3fb0(psVar7,0x20);
      }
      FUN_01700470(&local_258,psVar7,0x20);
      if (psVar7 != (segment_command *)0x0) {
        FUN_00008eb8(psVar7,0x20);
      }
      pcVar11 = local_258;
      if (-1 < (long)uStack_248._7_1_) {
        pcVar11 = (char *)&local_258;
      }
      lVar1 = local_250;
      if (-1 < (long)uStack_248) {
        lVar1 = (long)uStack_248._7_1_;
      }
      local_f0 = *(undefined8 *)PTR__kSecClass_0e029ec0;
      local_b0 = *(undefined8 *)PTR__kSecClassGenericPassword_0e029eb8;
      local_e8 = *(undefined8 *)PTR__kSecAttrService_0e029eb0;
      pcVar8 = "Aside Agent Master Key";
      FUN_0267b10c("Aside Agent Master Key",0x16);
      local_e0 = *(undefined8 *)PTR__kSecAttrAccount_0e029ea8;
      pcVar9 = "Aside Agent";
      local_a8 = pcVar8;
      FUN_0267b10c("Aside Agent",0xb);
      local_d8 = *(undefined8 *)PTR__kSecAttrLabel_0e029ef0;
      pcVar8 = "Aside Agent Master Key";
      local_a0 = pcVar9;
      FUN_0267b10c("Aside Agent Master Key",0x16);
      local_d0 = *(undefined8 *)PTR__kSecAttrAccessible_0e029ee8;
      local_90 = *(undefined8 *)PTR__kSecAttrAccessibleWhenUnlocked_0e029ee0;
      local_c8 = *(undefined8 *)PTR__kSecAttrIsInvisible_0e029ed8;
      local_88 = PTR____kCFBooleanTrue_0e028b98;
      local_c0 = *(undefined8 *)PTR__kSecValueData_0e029ed0;
      local_98 = pcVar8;
      local_80 = objc_stub::dataWithBytes_length_
                           ((ID)PTR__OBJC_CLASS___NSData_0eced828,pcVar11,lVar1);
      local_b8 = *(undefined8 *)PTR__kSecUseAuthenticationContext_0e029e90;
      self = PTR__OBJC_CLASS___LAContext_0ecedb00;
      _objc_alloc_init();
      objc_stub::setInteractionNotAllowed_((ID)self,1);
      local_78 = self;
      IVar10 = objc_stub::dictionaryWithObjects_forKeys_count_
                         ((ID)PTR__OBJC_CLASS___NSDictionary_0eced6b8,&local_b0,&local_f0,8);
      _SecItemAdd(IVar10,0);
      uVar4 = uStack_248;
      lVar1 = local_250;
      pcVar11 = local_258;
      iVar6 = (int)IVar10;
      if (iVar6 == -0x62d3) {
        FUN_040da744(&local_280,"Aside Agent Master Key",0x16,"Aside Agent",0xb,0,0,0);
      }
      else if (iVar6 == 0) {
        local_258 = (char *)0x0;
        local_250 = 0;
        uStack_248 = 0;
        local_280 = local_280 & 0xffffffffffffff00;
        pcStack_278 = pcVar11;
        uStack_268 = uVar4;
        local_270 = lVar1;
      }
      else {
        if (DAT_0ef080b0 < 3) {
          FUN_087d35e8(local_220,
                       "../../chrome/browser/devtools/secure_remote_debugging_credentials_mac.mm",
                       0xbc,2);
          local_220[0] = &PTR_thunk_FUN_0880a92c_0e2b9a18;
          local_f4 = iVar6;
          FUN_000254bc(auStack_210,"Failed to create secure remote debugging Keychain item.",0x37);
          FUN_0880a92c(local_220);
        }
        local_280 = CONCAT71(local_280._1_7_,1);
        pcVar11 = segment_command_00000020.segname + 8;
        FUN_0000f368();
        uVar3 = s_Failed_to_create_secure_remote_d_0da813a7._16_8_;
        uVar17 = s_Failed_to_create_secure_remote_d_0da813a7._0_8_;
        uStack_268 = _UNK_0df3ab18;
        local_270 = _DAT_0df3ab10;
        pcStack_278 = pcVar11;
        if ((pcVar11 + 0x2d < pcVar11) ||
           ("Failed to create secure remote debugging key." < pcVar11 + 0x2d &&
            pcVar11 < (long *)0xda813a8)) goto LAB_040db340;
        qVar2 = CONCAT35(s_Failed_to_create_secure_remote_d_0da813a7._29_3_,
                         s_Failed_to_create_secure_remote_d_0da813a7._24_5_);
        *(undefined8 *)(pcVar11 + 8) = s_Failed_to_create_secure_remote_d_0da813a7._8_8_;
        *(undefined8 *)pcVar11 = uVar17;
        *(qword *)(pcVar11 + 0x18) = qVar2;
        *(undefined8 *)(pcVar11 + 0x10) = uVar3;
        uVar17 = CONCAT53(s_Failed_to_create_secure_remote_d_0da813a7._32_5_,
                          s_Failed_to_create_secure_remote_d_0da813a7._29_3_);
        *(undefined8 *)(pcVar11 + 0x25) = s_Failed_to_create_secure_remote_d_0da813a7._37_8_;
        *(undefined8 *)(pcVar11 + 0x1d) = uVar17;
        pcVar11[0x2d] = 0;
      }
      if ((long)uStack_248 < 0) {
        FUN_00008eb8(local_258,uStack_248 & 0x7fffffffffffffff);
      }
      bVar16 = (byte)local_280;
      FUN_0719f1b4(&local_240);
      if (1 < bVar16) {
                    /* WARNING: Does not return */
        pcVar5 = (code *)SoftwareBreakpoint(0,0x40db2a0);
        (*pcVar5)();
      }
      goto LAB_040dae08;
    }
    plVar14 = (long *)((ulong)&local_240 | 8);
    bVar16 = 1;
    local_280 = CONCAT71(local_280._1_7_,1);
    local_240 = CONCAT71(local_240._1_7_,3);
    local_270 = plVar14[1];
    pcStack_278 = (char *)*plVar14;
    uStack_268 = plVar14[2];
  }
  *plVar14 = 0;
  plVar14[1] = 0;
  plVar14[2] = 0;
  FUN_0719f1b4(&local_240);
LAB_040dae08:
  if (bVar16 == 0) {
    if ((long)uStack_268 < 0) {
      FUN_00018218(param_1,pcStack_278,local_270);
    }
    else {
      puVar15 = (undefined8 *)((ulong)&local_280 | 8);
      uVar17 = *puVar15;
      param_1[1] = puVar15[1];
      *param_1 = uVar17;
      param_1[2] = puVar15[2];
    }
    uVar13 = 1;
  }
  else {
    uVar13 = 0;
    *(undefined1 *)param_1 = 0;
  }
  *(undefined1 *)(param_1 + 3) = uVar13;
  FUN_0719f1b4(&local_280);
  if (*(long *)PTR____stack_chk_guard_0e0281f0 == local_70) {
    return;
  }
                    /* WARNING: Subroutine does not return */
  ___stack_chk_fail();
}


