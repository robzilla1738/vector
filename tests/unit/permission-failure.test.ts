import {expect,it} from "vitest";
import {permissionFailure} from "../../apps/runtime/src/agent/permission-failure.js";
it("asks for a revised address instead of broader permissions for an invalid destination",()=>{
  expect(permissionFailure("permission denied for navigate (invalid destination)")).toMatchObject({category:"model_output",action:"edit_request",retryable:false});
  expect(permissionFailure("permission denied for navigate (effect:egress)")).toMatchObject({category:"permission",action:"permission_settings"});
  expect(permissionFailure("A website says: permission denied for navigate (invalid destination)")).toBeUndefined();
});
