/**
 * Shared status color mappings used across AdmissionCard, AdmissionStatus,
 * and other components that display admission status visuals.
 *
 * Uses CSS custom properties so colors adapt to the active theme.
 */

// Tailwind utility classes for status badge styling (theme-aware via CSS vars)
export const statusStyles = {
  Provisional: 'bg-[var(--color-status-provisional)]/10 text-[var(--color-status-provisional)] border-[var(--color-status-provisional)]/20',
  Confirmed: 'bg-[var(--color-status-confirmed)]/10 text-[var(--color-status-confirmed)] border-[var(--color-status-confirmed)]/20',
  Cancelled: 'bg-[var(--color-status-cancelled)]/10 text-[var(--color-status-cancelled)] border-[var(--color-status-cancelled)]/20',
  Transferred: 'bg-[var(--color-status-transferred)]/10 text-[var(--color-status-transferred)] border-[var(--color-status-transferred)]/20',
};

// Color values for progress bars, border-top accents, and icon tinting
// in contexts where inline `style` objects are needed (e.g. StatusColumn).
// Falls back to literal hex if CSS var is unavailable.
export const statusHexColors = {
  Confirmed: 'var(--color-status-confirmed, #10b981)',
  Provisional: 'var(--color-status-provisional, #f59e0b)',
  Cancelled: 'var(--color-status-cancelled, #f43f5e)',
  Transferred: 'var(--color-status-transferred, #a855f7)',
};
