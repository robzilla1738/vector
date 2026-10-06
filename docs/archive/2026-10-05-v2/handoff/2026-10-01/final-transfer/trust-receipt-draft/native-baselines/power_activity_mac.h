#ifndef CHROME_BROWSER_UI_AUX_POWER_ACTIVITY_MAC_H_
#define CHROME_BROWSER_UI_AUX_POWER_ACTIVITY_MAC_H_
#include <memory>
#include <string>
#include "base/values.h"
class Profile;
namespace aux {
class PowerActivityMac {
 public:
  explicit PowerActivityMac(Profile* profile);
  ~PowerActivityMac();
  void End();
  base::DictValue Status() const;
  base::DictValue Begin(const std::string& reason, int duration_sec);
 private:
  struct Impl;
  std::unique_ptr<Impl> impl_;
};
}
#endif
