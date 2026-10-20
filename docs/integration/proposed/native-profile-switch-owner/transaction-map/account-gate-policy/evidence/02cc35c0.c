// func FUN_02cc35c0 @ 02cc35c0 size 8048

void FUN_02cc35c0(undefined8 param_1)

{
  ulong local_68;
  undefined8 uStack_60;
  ulong local_58;
  undefined8 local_50;
  undefined8 uStack_48;
  ulong local_40;
  undefined1 local_38;
  
  local_50 = local_50 & 0xffffffffffffff00;
  local_38 = 1;
  FUN_00bddc50(param_1,"aside.onboarding_completed",0x1a,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = local_50 & 0xffffffff00000000;
  local_38 = 2;
  FUN_00bddc50(param_1,"aside.browser_preferences.browser_color_scheme",0x2e,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = local_50 & 0xffffffffffffff00;
  local_38 = 1;
  FUN_00bddc50(param_1,"aside.browser_preferences.horizontal_tab_strip_shrink_to_fit_enabled",0x44,
               &local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_00bddb80(&local_50,"Alt+Space",9);
  FUN_00bddc50(param_1,"aside.mini_popup.shortcut",0x19,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = local_50 & 0xffffffffffffff00;
  local_38 = 1;
  FUN_00bddc50(param_1,"aside.mini_popup.enabled",0x18,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50._0_1_ = 1;
  local_38 = 1;
  FUN_00bddc50(param_1,"aside.browser_preferences.vertical_tabs_enabled",0x2f,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_00bddb80(&local_50,&DAT_0cef64bf,3);
  FUN_00bddc50(param_1,"aside.browser_preferences.vertical_tab_insertion_position",0x39,&local_50,0,
               0);
  FUN_0161e7d4(&local_50);
  FUN_005cf5b0(&local_50,7);
  FUN_00bddc50(param_1,"aside.vertical_tabs.profile_order",0x21,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_00bddb80(&local_50,"",0);
  FUN_00bddc50(param_1,"autofill.ablation_seed",0x16,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_02cc59b8(param_1);
  local_50._0_1_ = 0;
  local_38 = 1;
  FUN_00bddc50(param_1,"restart.last.session.on.shutdown",0x20,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = (ulong)local_50._1_7_ << 8;
  local_38 = 1;
  FUN_00bddc50(param_1,"restart.in.background.on.shutdown",0x21,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_02cc6d20(param_1);
  FUN_03491ec8(param_1);
  local_50 = CONCAT44(local_50._4_4_,0xffffffff);
  local_38 = 2;
  FUN_00bddc50(param_1,"chrome_labs_activation_threshold",0x20,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_005cf5b0(&local_50,6);
  FUN_00bddc50(param_1,"chrome_labs_new_badge_dict",0x1a,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = local_50 & 0xffffffffffffff00;
  local_38 = 1;
  FUN_00bddc50(param_1,"internal_only_uis_enabled",0x19,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_02fa82ac(param_1);
  FUN_02cc62d0(param_1);
  FUN_005cf5b0(&local_50,7);
  FUN_00bddc50(param_1,"enterprise_groups.browser",0x19,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_005cf5b0(&local_50,6);
  FUN_00bddc50(param_1,"enterprise_groups.profiles",0x1a,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_005cf5b0(&local_50,7);
  FUN_00bddc50(param_1,"profile.managed_auto_select_certificate_for_urls",0x30,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50._0_1_ = 1;
  local_38 = 1;
  FUN_00bddc50(param_1,"component_updates.component_updates_enabled",0x2b,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_02cc5754(param_1);
  FUN_02cc568c(param_1);
  local_50._0_1_ = 1;
  local_38 = 1;
  FUN_00bddc50(param_1,"domain_reliability.allowed_by_policy",0x24,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_02cc5a7c(param_1);
  FUN_033458cc(param_1);
  FUN_005cf5b0(&local_50,6);
  FUN_00bddc50(param_1,"protocol_handler.allowed_origin_protocol_pairs",0x2e,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_005cf5b0(&local_50,7);
  FUN_00bddc50(param_1,"protocol_handler.policy.auto_launch_protocols_from_origins",0x3a,&local_50,0
               ,0);
  FUN_0161e7d4(&local_50);
  FUN_005cf5b0(&local_50,7);
  FUN_00bddc50(param_1,"browser.enabled_labs_experiments",0x20,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_005cf5b0(&local_50,6);
  FUN_00bddc50(param_1,"browser.enabled_labs_experiments_origin_lists",0x2d,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50._0_1_ = 1;
  local_38 = 1;
  FUN_00bddc50(param_1,"hardware_acceleration_mode.enabled",0x22,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = CONCAT71(local_50._1_7_,1);
  local_38 = 1;
  FUN_00bddc50(param_1,"hardware_acceleration_mode_previous",0x23,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_68 = 0;
  uStack_60 = 0;
  local_58 = 0;
  FUN_00bddb80(&local_50,&local_68,0);
  FUN_00bddc50(param_1,"google.services.username_pattern",0x20,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  if ((long)local_58 < 0) {
    FUN_00008eb8(local_68,local_58 & 0x7fffffffffffffff);
  }
  FUN_005cf5b0(&local_50,6);
  FUN_00bddc50(param_1,"invalidation.per_sender_registered_for_invalidation",0x33,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_005cf5b0(&local_50,6);
  FUN_00bddc50(param_1,"invalidation.per_sender_active_registration_tokens",0x32,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_005cf5b0(&local_50,7);
  FUN_00bddc50(param_1,"language.geo_language_provider.cached_geo_languages",0x33,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_0109bb40(0,&local_50);
  local_38 = 3;
  FUN_00bddc50(param_1,"language.geo_language_provider.time_of_last_geo_languages_update",0x40,
               &local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_005cf5b0(&local_50,7);
  FUN_00bddc50(param_1,"language.ulp_language_code_locator.cached_geo_languages",0x37,&local_50,
               0x100,0);
  FUN_0161e7d4(&local_50);
  local_50._0_4_ = 0x400;
  local_38 = 2;
  FUN_00bddc50(param_1,"total_memory_limit_mb",0x15,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = CONCAT44(local_50._4_4_,100);
  local_38 = 2;
  FUN_00bddc50(param_1,"demographics_birth_year_offset",0x1e,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_02ed7a0c(param_1);
  FUN_005cf5b0(&local_50,6);
  FUN_00bddc50(param_1,"network_time.network_time_mapping",0x21,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50._0_1_ = 1;
  local_38 = 1;
  FUN_00bddc50(param_1,"network_time.network_time_queries_enabled",0x29,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = (ulong)local_50._1_7_ << 8;
  local_38 = 1;
  FUN_00bddc50(param_1,"omnibox.is_in_bottom_position",0x1d,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = local_50 & 0xffffffff00000000;
  local_38 = 2;
  FUN_00bddc50(param_1,"browser.intranet_redirect_behavior",0x22,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_02cc5d04(param_1);
  FUN_02cc6b68(param_1);
  FUN_0346633c(param_1);
  local_50 = local_50 & 0xffffffffffffff00;
  local_38 = 1;
  FUN_00bddc50(param_1,"password_manager.had_biometrics_available",0x29,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_005cf5b0(&local_50,7);
  FUN_00bddc50(param_1,"local.password_hash_data_list",0x1d,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = CONCAT44(local_50._4_4_,10800000);
  local_38 = 2;
  FUN_00bddc50(param_1,"policy.user_refresh_rate",0x18,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = local_50 & 0xffffffffffffff00;
  local_38 = 1;
  FUN_00bddc50(param_1,"policy.cloud_management_enrollment_mandatory",0x2c,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_68 = 0;
  uStack_60 = 0;
  local_58 = 0;
  FUN_00bddb80(&local_50,&local_68,0);
  FUN_00bddc50(param_1,"local_test_policies_for_next_startup",0x24,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  if ((long)local_58 < 0) {
    FUN_00008eb8(local_68,local_58 & 0x7fffffffffffffff);
  }
  local_50 = local_50 & 0xffffffff00000000;
  local_38 = 2;
  FUN_00bddc50(param_1,"management.platform.enterprise_mdm_mac",0x26,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_0190d6a4(&local_68,0);
  uStack_48 = uStack_60;
  local_50 = local_68;
  local_40 = local_58;
  uStack_60 = 0;
  local_58 = 0;
  local_68 = 0;
  local_38 = 4;
  FUN_00bddc50(param_1,"policy.last_statistics_update",0x1d,&local_50,0,2);
  FUN_0161e7d4(&local_50);
  if ((long)local_58 < 0) {
    FUN_00008eb8(local_68,local_58 & 0x7fffffffffffffff);
  }
  FUN_02cc6490(param_1);
  local_50._0_4_ = 1;
  local_38 = 2;
  FUN_00bddc50(param_1,"profile.metrics.next_bucket_index",0x21,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_02cc6768(param_1);
  local_50 = (ulong)local_50._4_4_ << 0x20;
  local_38 = 2;
  FUN_00bddc50(param_1,"auth.ambient_auth_in_private_modes",0x22,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_03379918(param_1);
  local_50 = local_50 & 0xffffffffffffff00;
  local_38 = 1;
  FUN_00bddc50(param_1,"feature_engagement.profile_to_device_event_migration_completed",0x3e,
               &local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = local_50 & 0xffffffffffffff00;
  local_38 = 1;
  FUN_00bddc50(param_1,"disable_screenshots",0x13,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_005cf5b0(&local_50,6);
  FUN_00bddc50(param_1,"safebrowsing.trigger_event_timestamps",0x25,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_0190d6a4(&local_68,0);
  uStack_48 = uStack_60;
  local_50 = local_68;
  local_40 = local_58;
  uStack_60 = 0;
  local_58 = 0;
  local_68 = 0;
  local_38 = 4;
  FUN_00bddc50(param_1,"default_search_provider.guest_mode_prepopulated_id",0x32,&local_50,0,1);
  FUN_0161e7d4(&local_50);
  if ((long)local_58 < 0) {
    FUN_00008eb8(local_68,local_58 & 0x7fffffffffffffff);
  }
  FUN_00bddb80(&local_50,"",0);
  FUN_00bddc50(param_1,"unsafely_treat_insecure_origin_as_secure",0x28,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_02cc61d0(param_1);
  FUN_005cf5b0(&local_50,7);
  FUN_00bddc50(param_1,"managed.serial_allow_all_ports_for_urls",0x27,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_005cf5b0(&local_50,7);
  FUN_00bddc50(param_1,"managed.serial_allow_usb_devices_for_urls",0x29,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_02cc5df0(param_1);
  FUN_0190d6a4(&local_68,0);
  uStack_48 = uStack_60;
  local_50 = local_68;
  local_40 = local_58;
  uStack_60 = 0;
  local_58 = 0;
  local_68 = 0;
  local_38 = 4;
  FUN_00bddc50(param_1,"session_id_generator_last_value",0x1f,&local_50,0,1);
  FUN_0161e7d4(&local_50);
  if ((long)local_58 < 0) {
    FUN_00008eb8(local_68,local_58 & 0x7fffffffffffffff);
  }
  FUN_02cc5fd8(param_1);
  FUN_03376f80(param_1);
  FUN_02cc73b0(param_1,"subresource_filter",0x12);
  FUN_0349a1c0(param_1);
  FUN_005cf5b0(&local_50,6);
  FUN_00bddc50(param_1,"background_tracing.session_state",0x20,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_02cc5530(param_1);
  FUN_02cc70a0(param_1);
  FUN_0190d6a4(&local_68,0);
  uStack_48 = uStack_60;
  local_50 = local_68;
  local_40 = local_58;
  uStack_60 = 0;
  local_58 = 0;
  local_68 = 0;
  local_38 = 4;
  FUN_00bddc50(param_1,"media.audio_input_stream_last_time_created",0x2a,&local_50,0x100,2);
  FUN_0161e7d4(&local_50);
  if ((long)local_58 < 0) {
    FUN_00008eb8(local_68,local_58 & 0x7fffffffffffffff);
  }
  local_50 = local_50 & 0xffffffffffffff00;
  local_38 = 1;
  FUN_00bddc50(param_1,"policy.intensive_wake_up_throttling_enabled",0x2b,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = CONCAT71(local_50._1_7_,1);
  local_38 = 1;
  FUN_00bddc50(param_1,"background_mode.enabled",0x17,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_68 = 0;
  uStack_60 = 0;
  local_58 = 0;
  FUN_00bddb80(&local_50,&local_68,0);
  FUN_00bddc50(param_1,"gcm.product_category_for_subtypes",0x21,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  if ((long)local_58 < 0) {
    FUN_00008eb8(local_68,local_58 & 0x7fffffffffffffff);
  }
  local_50 = CONCAT44(local_50._4_4_,1);
  local_38 = 2;
  FUN_00bddc50(param_1,"headless.mode",0xd,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_02cc5844(param_1);
  local_50 = local_50 & 0xffffffffffffff00;
  local_38 = 1;
  FUN_00bddc50(param_1,"media_router.cast_allow_all_ips",0x1f,&local_50,0x200,0);
  FUN_0161e7d4(&local_50);
  local_50 = local_50 & 0xffffffffffffff00;
  local_38 = 1;
  FUN_00bddc50(param_1,"media_router.suppress_local_discovery_permission_error",0x36,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_034ca36c(param_1);
  FUN_02cc60d4(param_1);
  FUN_03566174(param_1);
  FUN_0190d2a8(param_1);
  FUN_02cc5c20(param_1);
  FUN_02cc5ee4(param_1);
  local_50 = local_50 & 0xffffffffffffff00;
  local_38 = 1;
  FUN_00bddc50(param_1,"browser.attempted_to_enable_autoupdate",0x26,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = local_50 & 0xffffffff00000000;
  local_38 = 2;
  FUN_00bddc50(param_1,"browser.last_whats_new_version",0x1e,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = local_50 & 0xffffffffffffff00;
  local_38 = 1;
  FUN_00bddc50(param_1,"extensions.install.cloud_policy_checks_enabled",0x2e,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_02cc6898(param_1);
  FUN_02cc58f8(param_1);
  local_50 = local_50 & 0xffffffffffffff00;
  local_38 = 1;
  FUN_00bddc50(param_1,"browser.first_run_finished",0x1a,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50._0_1_ = 1;
  local_38 = 1;
  FUN_00bddc50(param_1,"browser.confirm_to_quit",0x17,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50._0_1_ = 1;
  local_38 = 1;
  FUN_00bddc50(param_1,"apps.notify-when-apps-keep-chrome-alive",0x27,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_02cc6ec8(param_1);
  FUN_03031e10();
  FUN_005cf5b0(&local_50,6);
  FUN_00bddc50(param_1,"app_shims",9,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_00bddb80(&local_50,"",0);
  FUN_00bddc50(param_1,"app_shims_cdhash_hmac_key",0x19,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50._0_1_ = 1;
  local_38 = 1;
  FUN_00bddc50(param_1,"glass_frame.enabled",0x13,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50._0_1_ = 0;
  local_38 = 1;
  FUN_00bddc50(param_1,"web_apps.use_adhoc_code_signing_for_app_shims",0x2d,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = CONCAT71(local_50._1_7_,1);
  local_38 = 1;
  FUN_00bddc50(param_1,"policy.update_on_zero_window_enabled",0x24,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = CONCAT44(local_50._4_4_,3);
  local_38 = 2;
  FUN_00bddc50(param_1,"downgrade.snapshot_retention_limit",0x22,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_68 = 0;
  uStack_60 = 0;
  local_58 = 0;
  FUN_00bddb80(&local_50,&local_68,0);
  FUN_00bddc50(param_1,"browser.suppress_default_browser_prompt_for_version",0x33,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  if ((long)local_58 < 0) {
    FUN_00008eb8(local_68,local_58 & 0x7fffffffffffffff);
  }
  FUN_02cc5b44(param_1);
  FUN_0190d6a4(&local_68,0);
  uStack_48 = uStack_60;
  local_50 = local_68;
  local_40 = local_58;
  uStack_60 = 0;
  local_58 = 0;
  local_68 = 0;
  local_38 = 4;
  FUN_00bddc50(param_1,"accessibility.screen_ai.last_used_time",0x26,&local_50,0,2);
  FUN_0161e7d4(&local_50);
  if ((long)local_58 < 0) {
    FUN_00008eb8(local_68,local_58 & 0x7fffffffffffffff);
  }
  FUN_02cc663c(param_1);
  local_50._0_1_ = 1;
  local_38 = 1;
  FUN_00bddc50(param_1,"printing.oop_print_drivers_allowed_by_policy",0x2c,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50._0_1_ = 1;
  local_38 = 1;
  FUN_00bddc50(param_1,"pdf.enable_out_of_process_iframe_viewer",0x27,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_00bddb80(&local_50,"",0);
  FUN_00bddc50(param_1,"pdf.restrict_save_to_drive_accounts_to_pattern",0x2e,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50._0_1_ = 1;
  local_38 = 1;
  FUN_00bddc50(param_1,"chrome_for_testing.allowed",0x1a,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = CONCAT71(local_50._1_7_,1);
  local_38 = 1;
  FUN_00bddc50(param_1,"qr_code_generator_enabled",0x19,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = local_50 & 0xffffffff00000000;
  local_38 = 2;
  FUN_00bddc50(param_1,"chrome_data_region_setting",0x1a,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_02ece0cc(param_1);
  local_50 = local_50 & 0xffffffff00000000;
  local_38 = 2;
  FUN_00bddc50(param_1,"settings.toast.alert_level",0x1a,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_00bddb80(&local_50,"",0);
  FUN_00bddc50(param_1,"toast.non_milestone_update_toast_version",0x28,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = local_50 & 0xffffffffffffff00;
  local_38 = 1;
  FUN_00bddc50(param_1,"printing.silent_printing_enabled",0x20,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_005cf5b0(&local_50,7);
  FUN_00bddc50(param_1,"managed_local_network_access_ip_address_space_overrides",0x37,&local_50,0,0)
  ;
  FUN_0161e7d4(&local_50);
  local_50 = local_50 & 0xffffffffffffff00;
  local_38 = 1;
  FUN_00bddc50(param_1,"policy.local_network_access_permissions_policy_default_enabled",0x3e,
               &local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_005cf5b0(&local_50,6);
  FUN_00bddc50(param_1,"invalidation.per_sender_client_id_cache",0x27,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_005cf5b0(&local_50,6);
  FUN_00bddc50(param_1,"invalidation.per_sender_topics_to_handler",0x29,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = local_50 & 0xffffffffffffff00;
  local_38 = 1;
  FUN_00bddc50(param_1,"renderer_code_integrity_enabled",0x1f,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_68 = 0;
  uStack_60 = 0;
  local_58 = 0;
  FUN_00bddb80(&local_50,&local_68,0);
  FUN_00bddc50(param_1,"fingerprinting_protection_filter.ruleset_version.content",0x38,&local_50,0,0
              );
  FUN_0161e7d4(&local_50);
  if ((long)local_58 < 0) {
    FUN_00008eb8(local_68,local_58 & 0x7fffffffffffffff);
  }
  local_50 = local_50 & 0xffffffff00000000;
  local_38 = 2;
  FUN_00bddc50(param_1,"fingerprinting_protection_filter.ruleset_version.format",0x37,&local_50,0,0)
  ;
  FUN_0161e7d4(&local_50);
  FUN_008fa60c(&local_68,0);
  uStack_48 = uStack_60;
  local_50 = local_68;
  local_40 = local_58;
  uStack_60 = 0;
  local_58 = 0;
  local_68 = 0;
  local_38 = 4;
  FUN_00bddc50(param_1,"fingerprinting_protection_filter.ruleset_version.checksum",0x39,&local_50,0,
               0);
  FUN_0161e7d4(&local_50);
  if ((long)local_58 < 0) {
    FUN_00008eb8(local_68,local_58 & 0x7fffffffffffffff);
  }
  local_50 = local_50 & 0xffffffff00000000;
  local_38 = 2;
  FUN_00bddc50(param_1,"privacy_budget.generation",0x19,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_68 = 0;
  uStack_60 = 0;
  local_58 = 0;
  FUN_00bddb80(&local_50,&local_68,0);
  FUN_00bddc50(param_1,"privacy_budget.seen",0x13,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  if ((long)local_58 < 0) {
    FUN_00008eb8(local_68,local_58 & 0x7fffffffffffffff);
  }
  local_68 = 0;
  uStack_60 = 0;
  local_58 = 0;
  FUN_00bddb80(&local_50,&local_68,0);
  FUN_00bddc50(param_1,"privacy_budget.selected",0x17,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  if ((long)local_58 < 0) {
    FUN_00008eb8(local_68,local_58 & 0x7fffffffffffffff);
  }
  local_50 = local_50 & 0xffffffffffffff00;
  local_38 = 1;
  FUN_00bddc50(param_1,"glic.multi_instance_enabled_by_tier",0x23,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = CONCAT44(local_50._4_4_,0xffffffff);
  local_38 = 2;
  FUN_00bddc50(param_1,"privacy_budget.block_offset",0x1b,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_0109bb40(0,&local_50);
  local_38 = 3;
  FUN_00bddc50(param_1,"privacy_budget.meta_experiment_activation_salt",0x2e,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_68 = 0;
  uStack_60 = 0;
  local_58 = 0;
  FUN_00bddb80(&local_50,&local_68,0);
  FUN_00bddc50(param_1,"autofill.states_data_dir",0x18,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  if ((long)local_58 < 0) {
    FUN_00008eb8(local_68,local_58 & 0x7fffffffffffffff);
  }
  local_50 = local_50 & 0xffffffffffffff00;
  local_38 = 1;
  FUN_00bddc50(param_1,"tracking_protection.fingerprinting_protection_enabled",0x35,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = local_50 & 0xffffffffffffff00;
  local_38 = 1;
  FUN_00bddc50(param_1,"tracking_protection.ip_protection_enabled",0x29,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = local_50 & 0xffffffffffffff00;
  local_38 = 1;
  FUN_00bddc50(param_1,"tracking_protection.allow_all_3pc_toggle_enabled",0x30,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = local_50 & 0xffffffffffffff00;
  local_38 = 1;
  FUN_00bddc50(param_1,"tracking_protection.user_bypass_3pc_exceptions_migrated",0x37,&local_50,0,0)
  ;
  FUN_0161e7d4(&local_50);
  local_50 = local_50 & 0xffffffff00000000;
  local_38 = 2;
  FUN_00bddc50(param_1,"tracking_protection.tracking_protection_level",0x2d,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_0190d6a4(&local_68,0);
  uStack_48 = uStack_60;
  local_50 = local_68;
  local_40 = local_58;
  uStack_60 = 0;
  local_58 = 0;
  local_68 = 0;
  local_38 = 4;
  FUN_00bddc50(param_1,"tracking_protection.tracking_protection_silent_onboarded_since",0x3e,
               &local_50,0,2);
  FUN_0161e7d4(&local_50);
  if ((long)local_58 < 0) {
    FUN_00008eb8(local_68,local_58 & 0x7fffffffffffffff);
  }
  FUN_0190d6a4(&local_68,0);
  uStack_48 = uStack_60;
  local_50 = local_68;
  local_40 = local_58;
  uStack_60 = 0;
  local_58 = 0;
  local_68 = 0;
  local_38 = 4;
  FUN_00bddc50(param_1,"tracking_protection.tracking_protection_silent_eligible_since",0x3d,
               &local_50,0,2);
  FUN_0161e7d4(&local_50);
  if ((long)local_58 < 0) {
    FUN_00008eb8(local_68,local_58 & 0x7fffffffffffffff);
  }
  FUN_0190d6a4(&local_68,0);
  uStack_48 = uStack_60;
  local_50 = local_68;
  local_40 = local_58;
  uStack_60 = 0;
  local_58 = 0;
  local_68 = 0;
  local_38 = 4;
  FUN_00bddc50(param_1,"tracking_protection.tracking_protection_eligible_since",0x36,&local_50,0,2);
  FUN_0161e7d4(&local_50);
  if ((long)local_58 < 0) {
    FUN_00008eb8(local_68,local_58 & 0x7fffffffffffffff);
  }
  FUN_0190d6a4(&local_68,0);
  uStack_48 = uStack_60;
  local_50 = local_68;
  local_40 = local_58;
  uStack_60 = 0;
  local_58 = 0;
  local_68 = 0;
  local_38 = 4;
  FUN_00bddc50(param_1,"tracking_protection.tracking_protection_onboarded_since",0x37,&local_50,0,2)
  ;
  FUN_0161e7d4(&local_50);
  if ((long)local_58 < 0) {
    FUN_00008eb8(local_68,local_58 & 0x7fffffffffffffff);
  }
  FUN_0190d6a4(&local_68,0);
  uStack_48 = uStack_60;
  local_50 = local_68;
  local_40 = local_58;
  uStack_60 = 0;
  local_58 = 0;
  local_68 = 0;
  local_38 = 4;
  FUN_00bddc50(param_1,"tracking_protection.tracking_protection_notice_last_shown",0x39,&local_50,0,
               2);
  FUN_0161e7d4(&local_50);
  if ((long)local_58 < 0) {
    FUN_00008eb8(local_68,local_58 & 0x7fffffffffffffff);
  }
  FUN_0190d6a4(&local_68,0);
  uStack_48 = uStack_60;
  local_50 = local_68;
  local_40 = local_58;
  uStack_60 = 0;
  local_58 = 0;
  local_68 = 0;
  local_38 = 4;
  FUN_00bddc50(param_1,"tracking_protection.tracking_protection_onboarding_acked_since",0x3e,
               &local_50,0,2);
  FUN_0161e7d4(&local_50);
  if ((long)local_58 < 0) {
    FUN_00008eb8(local_68,local_58 & 0x7fffffffffffffff);
  }
  local_50 = local_50 & 0xffffffffffffff00;
  local_38 = 1;
  FUN_00bddc50(param_1,"tracking_protection.tracking_protection_onboarding_acked",0x38,&local_50,0,0
              );
  FUN_0161e7d4(&local_50);
  local_50 = local_50 & 0xffffffff00000000;
  local_38 = 2;
  FUN_00bddc50(param_1,"tracking_protection.tracking_protection_onboarding_ack_action",0x3d,
               &local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = local_50 & 0xffffffffffffff00;
  local_38 = 1;
  FUN_00bddc50(param_1,"tracking_protection.ip_protection_initialized_by_dogfood",0x38,&local_50,0,0
              );
  FUN_0161e7d4(&local_50);
  local_50 = local_50 & 0xffffffff00000000;
  local_38 = 2;
  FUN_00bddc50(param_1,"tracking_protection.tracking_protection_silent_onboarding_status",0x40,
               &local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = local_50 & 0xffffffff00000000;
  local_38 = 2;
  FUN_00bddc50(param_1,"tracking_protection.tracking_protection_onboarding_status",0x39,&local_50,0,
               0);
  FUN_0161e7d4(&local_50);
  local_50 = local_50 & 0xffffffff00000000;
  local_38 = 2;
  FUN_00bddc50(param_1,"tpcd_experiment.client_state",0x1c,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = local_50 & 0xffffffff00000000;
  local_38 = 2;
  FUN_00bddc50(param_1,"tpcd_experiment.client_state_version",0x24,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = local_50 & 0xffffffff00000000;
  local_38 = 2;
  FUN_00bddc50(param_1,"tpcd_experiment.profile_state",0x1d,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_005cf5b0(&local_50,7);
  FUN_00bddc50(param_1,"profiles.profiles_deleted",0x19,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_005cf5b0(&local_50,6);
  FUN_00bddc50(param_1,"tpcd.metadata.cohorts",0x15,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = local_50 & 0xffffffffffffff00;
  local_38 = 1;
  FUN_00bddc50(param_1,"webfeed.has_seen_feed",0x15,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  FUN_0190d6a4(&local_68,0);
  uStack_48 = uStack_60;
  local_50 = local_68;
  local_40 = local_58;
  uStack_60 = 0;
  local_58 = 0;
  local_68 = 0;
  local_38 = 4;
  FUN_00bddc50(param_1,"webfeed.last_badge_animation_time",0x21,&local_50,0,2);
  FUN_0161e7d4(&local_50);
  if ((long)local_58 < 0) {
    FUN_00008eb8(local_68,local_58 & 0x7fffffffffffffff);
  }
  FUN_00bddb80(&local_50,"",0);
  FUN_00bddc50(param_1,"profile_network_context_service.http_cache_finch_experiment_groups",0x42,
               &local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = local_50 & 0xffffffff00000000;
  local_38 = 2;
  FUN_00bddc50(param_1,"user_experience_metrics.reporting_level",0x27,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50._0_1_ = 1;
  local_38 = 1;
  FUN_00bddc50(param_1,"proxy_override_rules_affiliation",0x20,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50._0_1_ = 0;
  local_38 = 1;
  FUN_00bddc50(param_1,"user_experience_metrics.consent_migration_done",0x2e,&local_50,0,0);
  FUN_0161e7d4(&local_50);
  local_50 = (ulong)local_50._1_7_ << 8;
  local_38 = 1;
  FUN_00bddc50(param_1,"user_experience_metrics.consent_restructure_feature_state",0x39,&local_50,0,
               0);
  FUN_0161e7d4(&local_50);
  FUN_0190d6a4(&local_68,0);
  uStack_48 = uStack_60;
  local_50 = local_68;
  local_40 = local_58;
  uStack_60 = 0;
  local_58 = 0;
  local_68 = 0;
  local_38 = 4;
  FUN_00bddc50(param_1,"management.platform.last_log_time",0x21,&local_50,0,2);
  FUN_0161e7d4(&local_50);
  if ((long)local_58 < 0) {
    FUN_00008eb8(local_68,local_58 & 0x7fffffffffffffff);
  }
  return;
}


