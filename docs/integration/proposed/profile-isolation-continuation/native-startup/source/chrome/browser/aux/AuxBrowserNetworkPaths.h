#pragma once
#include <string>
#include <vector>
namespace aux::peer {
// Coverage check over actual final native NetworkContext paths. This does not
// authorize browser owner IO or mint writer custody. No root input exists.
bool CanCreateContainedBrowserNetworkContext(const std::vector<std::string>& paths);
}
