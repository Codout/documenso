import { IS_SELF_HOSTED_PREMIUM } from '../constants/app-branding';

/**
 * Returns `true` if the per-organisation claim flag is enabled OR if this
 * deployment is a self-hosted Codout-branded build running without
 * billing. Use this at the gate site instead of reading the raw claim
 * directly so that the AGPL self-hosted scenario gets the feature.
 *
 * **Do not** use this for compliance gates (21 CFR Part 11, HIPAA). Those
 * have legal weight beyond licensing — keep them tied to the explicit
 * per-organisation claim.
 */
export const isLiberatedClaimFlag = (flag: boolean | undefined): boolean => {
  if (flag === true) {
    return true;
  }

  return IS_SELF_HOSTED_PREMIUM();
};

/**
 * Equivalent for the `IS_BILLING_ENABLED` style of gate. Returns `true`
 * if billing is enabled (the upstream behaviour) OR if this is a
 * self-hosted Codout build (where the feature should be available
 * without payment).
 */
export const isLiberatedBillingGate = (billingEnabled: boolean): boolean => {
  if (billingEnabled) {
    return true;
  }

  return IS_SELF_HOSTED_PREMIUM();
};
