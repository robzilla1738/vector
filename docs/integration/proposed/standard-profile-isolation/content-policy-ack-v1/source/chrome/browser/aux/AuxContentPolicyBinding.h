#pragma once
#include <memory>
#include "base/command_line.h"
#include "content/public/browser/aux_sandbox_launch_binding.h"
namespace aux::peer {
std::shared_ptr<const content::AuxSandboxLaunchBinding>
CaptureContentPolicyBinding(const base::CommandLine& command);
}
