import { nanoid } from 'nanoid';

/**
 * Generates a human-readable Forge referral code.
 * Format: F-XXXXXX  (6 uppercase alphanumeric chars)
 */
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no confusable chars (0O I1)
  let code = 'F-';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
