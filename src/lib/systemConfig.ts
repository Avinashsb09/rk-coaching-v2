/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  RK Coaching LMS — System Configuration Layer
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * This module is the ONLY place student-facing UI components should read
 * system behaviour from.  It translates raw feature flags into typed,
 * domain-meaningful configuration objects and convenience helpers.
 *
 * WHY THIS EXISTS
 * ───────────────
 * When the Super Admin panel is complete, the flags in featureFlags.ts can
 * be replaced by database-fetched values at runtime.  Because all UI
 * components depend on *this* file (not featureFlags.ts directly), that
 * migration requires zero refactoring of any consumer component.
 *
 * USAGE IN COMPONENTS
 * ───────────────────
 *   import { SystemConfig, isPremiumEnabled } from '../../lib/systemConfig';
 *
 *   if (!isPremiumEnabled()) {
 *     setComingSoonOpen(true);
 *     return;
 *   }
 *   // ... real payment flow
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { FEATURE_FLAGS } from './featureFlags';

// ─────────────────────────────────────────────────────────────────────────────
//  Premium / Monetisation configuration
// ─────────────────────────────────────────────────────────────────────────────

export const PremiumConfig = {
  /** True when premium content is fully activated. */
  isEnabled: FEATURE_FLAGS.PREMIUM_SYSTEM_ENABLED,

  /**
   * True only when BOTH premium AND payments are enabled.
   * Use this to decide whether to mount <RazorpayGatewayModal />.
   */
  isPaymentEnabled:
    FEATURE_FLAGS.PREMIUM_SYSTEM_ENABLED && FEATURE_FLAGS.PAYMENTS_ENABLED,

  // ── Coming Soon modal copy ─────────────────────────────────────────────────
  comingSoon: {
    title: 'Premium Content Coming Soon',
    message:
      'This feature is currently under development. ' +
      'Our team is working hard to complete the Premium Learning System. ' +
      'Please visit again soon. Thank you for your patience.',
    /** Items listed inside the modal to preview what premium will include */
    features: [
      '📝  Premium Notes & Handwritten Study Materials',
      '🎥  HD Video Lectures by Expert Teachers',
      '🧠  Premium Quiz Series & Chapter Tests',
      '📄  Premium Previous Year Papers (PYQs)',
    ] as const,
  },

  // ── UI copy overrides (used when premium is disabled) ─────────────────────
  ui: {
    /** Replaces "Enroll & Pay via Razorpay" when disabled */
    enrollButtonLabel: FEATURE_FLAGS.PREMIUM_SYSTEM_ENABLED
      ? 'Enroll & Pay via Razorpay'
      : 'Premium Content — Coming Soon',

    /** Replaces "₹30 LIFETIME" badge label when disabled */
    notesUnlockLabel: FEATURE_FLAGS.PREMIUM_SYSTEM_ENABLED
      ? 'Unlock — ₹30 Lifetime'
      : 'Premium — Coming Soon',

    /** Replaces the locked note CTA button when disabled */
    notesCTALabel: FEATURE_FLAGS.PREMIUM_SYSTEM_ENABLED
      ? 'Unlock All Subject Notes'
      : 'Premium Content — Coming Soon',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
//  Content module availability
// ─────────────────────────────────────────────────────────────────────────────

export const ModuleConfig = {
  quiz:          FEATURE_FLAGS.LIVE_QUIZ_ENABLED,
  pyq:           FEATURE_FLAGS.PYQ_ENABLED,
  videos:        FEATURE_FLAGS.VIDEO_LECTURES_ENABLED,
  notes:         FEATURE_FLAGS.NOTES_ENABLED,
  leaderboard:   FEATURE_FLAGS.LEADERBOARD_ENABLED,
  announcements: FEATURE_FLAGS.ANNOUNCEMENTS_ENABLED,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
//  Role-based panel availability
// ─────────────────────────────────────────────────────────────────────────────

export const PanelConfig = {
  admin:      FEATURE_FLAGS.ADMIN_PANEL_ENABLED,
  teacher:    FEATURE_FLAGS.TEACHER_PANEL_ENABLED,
  superAdmin: FEATURE_FLAGS.SUPER_ADMIN_PANEL_ENABLED,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
//  Advanced / AI features
// ─────────────────────────────────────────────────────────────────────────────

export const AdvancedConfig = {
  ai:           FEATURE_FLAGS.AI_FEATURES_ENABLED,
  certificates: FEATURE_FLAGS.CERTIFICATES_ENABLED,
  liveClasses:  FEATURE_FLAGS.LIVE_CLASSES_ENABLED,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
//  Top-level namespace (optional convenience import)
// ─────────────────────────────────────────────────────────────────────────────

export const SystemConfig = {
  premium:  PremiumConfig,
  modules:  ModuleConfig,
  panels:   PanelConfig,
  advanced: AdvancedConfig,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
//  Convenience boolean helpers — use these in JSX conditionals
// ─────────────────────────────────────────────────────────────────────────────

/** Returns true when premium content is fully active */
export const isPremiumEnabled  = () => PremiumConfig.isEnabled;

/** Returns true when Razorpay payment UI should be shown */
export const isPaymentEnabled  = () => PremiumConfig.isPaymentEnabled;

/** Returns true when the given module is switched on */
export const isModuleEnabled   = (mod: keyof typeof ModuleConfig) =>
  ModuleConfig[mod];

/** Returns true when the given role panel is switched on */
export const isPanelEnabled    = (panel: keyof typeof PanelConfig) =>
  PanelConfig[panel];
