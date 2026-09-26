/**
 * JetKur Canonical Data Architecture - Domain Index
 *
 * Root barrel exports for all domain models, adapters, and verification fixtures.
 */

// 1. Business Profile Domain
export * from "./businessProfile";

// 2. Industry Pack Domain
export * from "./industryPack";

// 3. Design Template Domain
export * from "./designTemplate";

// 4. Section Configuration Domain
export * from "./sectionConfiguration";

// 5. Site Content Domain
export * from "./siteContent";

// 6. Site Settings Domain
export * from "./siteSettings";

// 7. Canonical Site Root Aggregate
export * from "./site";

// 8. Legacy Migration Adapter
export * from "./legacyAdapter";

// 9. Fixtures
export * from "./fixtures";
