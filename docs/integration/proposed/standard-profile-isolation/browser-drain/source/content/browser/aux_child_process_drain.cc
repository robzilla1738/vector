// Copyright 2026 The Aux Authors
#include "content/public/browser/aux_child_process_drain.h"
#include "content/browser/aux_child_lifetime.h"
namespace content::aux_migration {
void CloseContentChildLaunchAdmission() {
  internal::AuxChildLifetime::CloseAdmission();
}
ChildProcessDrainSnapshot InspectContentChildDrain() {
  const auto value = internal::AuxChildLifetime::Inspect();
  return {value.admission_closed, value.wrong_process, value.accounting_unknown,
          value.unresolved, value.unbound, value.uncertain, value.settled};
}
}
