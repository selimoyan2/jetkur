/**
 * JetKur Canonical Template Manifest & Design System Module
 *
 * Public API for the Template Manifest domain.
 */

export * from "./types";
export * from "./catalog";
export * from "./validator";
export * from "./switcher";

// Export individual canonical manifests
export { rapidServiceManifest } from "./manifests/rapidService";
export { corporatePrestigeManifest } from "./manifests/corporatePrestige";
export { clinicalPureManifest } from "./manifests/clinicalPure";
export { modernMinimalManifest } from "./manifests/modernMinimal";
export { artisanWarmManifest } from "./manifests/artisanWarm";
export { vipLuxuryManifest } from "./manifests/vipLuxury";
export { techDynamicManifest } from "./manifests/techDynamic";
export { formalLegalManifest } from "./manifests/formalLegal";
