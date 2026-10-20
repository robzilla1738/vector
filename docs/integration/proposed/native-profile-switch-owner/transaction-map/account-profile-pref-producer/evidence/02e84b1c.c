// func FUN_02e84b1c @ 02e84b1c size 288

/* WARNING: Globals starting with '_' overlap smaller symbols at the same address */

undefined8 * FUN_02e84b1c(void)

{
  byte bVar1;
  int iVar2;
  undefined1 *puVar3;
  
  if ((DAT_0ef039a0 & 1) == 0) {
    puVar3 = &DAT_0ef039a0;
    thunk_FUN_0cb3562c();
    if ((int)puVar3 != 0) {
      FUN_00053f1c();
      FUN_00a13fc8(&DAT_0ef03958,"AsideProfileAttributesUpdater",puVar3,0);
      DAT_0ef03978 = 0;
      DAT_0ef03980 = 0;
      DAT_0ef03988 = 0;
      uRam000000000ef03998 = _UNK_0df39a38;
      _DAT_0ef03990 = _DAT_0df39a30;
      DAT_0ef03958 = &PTR_LAB_0e1ee4d0;
      DAT_0ef039a0 = 1;
      iVar2 = _pthread_mutex_lock((pthread_mutex_t *)&DAT_0eceb9f0);
      bVar1 = DAT_0ef039a1;
      if (iVar2 != 0) {
                    /* WARNING: Subroutine does not return */
        thunk_FUN_0cb335c4("%s failed to acquire mutex");
      }
      DAT_0ef039a1 = 1;
      iVar2 = _pthread_mutex_unlock((pthread_mutex_t *)&DAT_0eceb9f0);
      if (iVar2 != 0) {
                    /* WARNING: Subroutine does not return */
        thunk_FUN_0cb335c4("%s failed to release mutex");
      }
      if (((bVar1 >> 2 & 1) != 0) &&
         (iVar2 = _pthread_cond_broadcast((pthread_cond_t *)&DAT_0eceba30), iVar2 != 0)) {
                    /* WARNING: Subroutine does not return */
        thunk_FUN_0cb335c4("%s failed to broadcast");
      }
    }
  }
  return &DAT_0ef03958;
}


