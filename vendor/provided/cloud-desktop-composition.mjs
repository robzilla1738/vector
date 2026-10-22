/** Explicit opt-in composition for the actual pinned1852 supplied stack.
 * No filesystem writes, environment reads, launch, credentials or signing. */
import { transformReviewedCloudServicePolicy } from './cloud-service-policy.mjs';
import { applyCloudDrive1852Adapter } from './cloud-drive-1852-adapter.mjs';
import { applyCloudAttachmentAdapter } from './cloud-attachment-adapter.mjs';
import { applyCloudSessionAdapter } from './cloud-session-adapter.mjs';
import { applyCloudInferenceUploadAdapter } from './cloud-inference-upload-adapter.mjs';
import { transformCloudBillingCopy } from './cloud-billing-adapter.mjs';

export function composeCloudDesktop(input, options = {}) {
  let result = transformReviewedCloudServicePolicy(input, options);
  if (result.policy.mode === 'local') return result;
  const anchors = [...result.anchors];
  const apply = transform => {
    const next = transform(result.text);
    anchors.push(...next.anchors);
    result = { ...result, text: next.text };
  };
  if (input.component === 'daemon') {
    apply(text => applyCloudDrive1852Adapter(text, { branding: 'aux' }));
    apply(text => applyCloudAttachmentAdapter(text, { branding: 'aux' }));
    apply(text => applyCloudInferenceUploadAdapter(text));
    apply(text => applyCloudSessionAdapter(text, { version: '1852', branding: 'aux' }));
  } else if (input.component === 'agent') {
    apply(text => transformCloudBillingCopy({ ...input, text }));
  }
  return { ...result, anchors };
}
