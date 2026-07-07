/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  RK Coaching LMS — Centralized Feature Flag Registry
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * This file is the single source of truth for all runtime feature flags.
 *
 * USAGE
 * ─────
 * UI components should NOT import from this file directly.
 * Instead, import from `src/lib/systemConfig.ts` which provides a
 * higher-level abstraction and can be migrated to database-controlled
 * settings in the future without touching any student-facing component.
 *
 * ENABLING A FEATURE
 * ──────────────────
 * Change the boolean from `false` to `true` here. No other code changes
 * are required. The corresponding UI flows activate automatically.
 *
 * FUTURE MIGRATION
 * ────────────────
 * When the Super Admin panel is complete, these values can be fetched from
 * the `admin_settings` Supabase table and merged here at startup, replacing
 * the static defaults without any refactor of consumer components.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const FEATURE_FLAGS = {

  // ── Premium & Monetisation ────────────────────────────────────────────────
  /**
   * Master gate for ALL premium content.
   * When false → students see "Premium Content Coming Soon" modal instead of
   *              any payment / checkout screen.
   * When true  → full Razorpay purchase flow activates automatically.
   */
  PREMIUM_SYSTEM_ENABLED: false,

  /**
   * Razorpay payment processing.
   * Requires PREMIUM_SYSTEM_ENABLED to also be true to have any effect.
   * Kept separate so we can enable premium display logic before payment is live.
   */
  PAYMENTS_ENABLED: false,

  // ── Content Modules ───────────────────────────────────────────────────────
  /** Live Quiz Arena — CBT-style quiz engine. Already built and stable. */
  LIVE_QUIZ_ENABLED: true,

  /** Previous Year Papers (PYQ) workflow. Already built and stable. */
  PYQ_ENABLED: true,

  /** Video lecture player (YouTube / GDrive / Supabase). Already built. */
  VIDEO_LECTURES_ENABLED: true,

  /** Study notes PDF reader. Already built and stable. */
  NOTES_ENABLED: true,

  /** Gamified student leaderboard. Paused — re-enable when ready. */
  LEADERBOARD_ENABLED: false,

  /** System-wide announcements banner. Active. */
  ANNOUNCEMENTS_ENABLED: true,

  // ── Role-Based Panels ─────────────────────────────────────────────────────
  /** Admin management dashboard. Existing placeholder in place. */
  ADMIN_PANEL_ENABLED: true,

  /** Teacher content management dashboard. Existing placeholder in place. */
  TEACHER_PANEL_ENABLED: true,

  /**
   * Super Admin — master controller of the entire platform.
   * NOT YET BUILT. Set to true only after the Super Admin sprint is complete.
   */
  SUPER_ADMIN_PANEL_ENABLED: false,

  // ── Advanced / AI Features ────────────────────────────────────────────────
  /**
   * AI-powered study assistant, smart recommendations, adaptive quizzes.
   * Planned feature — not yet implemented.
   */
  AI_FEATURES_ENABLED: false,

  /**
   * Certificate generation for completed courses.
   * Planned feature — not yet implemented.
   */
  CERTIFICATES_ENABLED: false,

  /**
   * Live classes / live streaming integration.
   * Planned feature — not yet implemented.
   */
  LIVE_CLASSES_ENABLED: false,

} as const;

/** Union type of all available feature flag keys */
export type FeatureFlag = keyof typeof FEATURE_FLAGS;

/**
 * Type-safe helper to read a feature flag value.
 * Prefer importing from systemConfig.ts in UI components.
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag];
}
