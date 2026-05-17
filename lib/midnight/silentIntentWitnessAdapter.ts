/**
 * SilentIntent Witness Adapter for Midnight
 *
 * Converts the demo's vendor name + price into the Midnight circuit's
 * witness format (SilentIntentProofInput). Bridges demo data to real proof server.
 */

import { hashLabel } from '../proofHash';
import type { VendorId } from '../proofTypes';

export type SilentIntentProofInputForAdapter = {
  policy: {
    maxBudgetCents: number;
    requiredCategoryHash: string;
    requiredCredentialHash: string;
    forbiddenTermHash: string;
    salt: string;
  };
  offer: {
    priceCents: number;
    categoryHash: string;
    credentialHashes: string[];
    forbiddenTermHashes: string[];
    salt: string;
  };
  dealId: string;
  nonce: string;
};

// Policy salts per vendor (demo scenario)
const POLICY_SALT = 'midnight-silentintent-policy-v1';
const OFFER_SALT_BRIGHTREACH = 'brightreach-offer-salt';
const OFFER_SALT_CLEANLIST = 'cleanlist-offer-salt';

const NONCE_BRIGHTREACH = 'authorization-nonce-brightreach-v1';
const NONCE_CLEANLIST = 'authorization-nonce-cleanlist-v1';

function vendorIdFromName(vendorName: string): VendorId {
  return vendorName.toLowerCase().includes('cleanlist') ? 'cleanlist' : 'brightreach';
}

/**
 * Build the witness input for a SilentIntent authorization proof.
 * Called by the Midnight client when runSilentIntentAuthorization() executes.
 */
export function convertSilentIntentInputToProof(
  vendorName: string,
  priceCents: number,
): SilentIntentProofInputForAdapter {
  const vendorId = vendorIdFromName(vendorName);

  // Hidden policy (never disclosed publicly)
  const policy = {
    maxBudgetCents: 250000,
    requiredCategoryHash: hashLabel('lead_data'),
    requiredCredentialHash: hashLabel('freshness_verified'),
    forbiddenTermHash: hashLabel('campaign_metadata_reuse'),
    salt: POLICY_SALT,
  };

  // Offer facts extracted from vendor proposal
  const offerFacts = vendorId === 'cleanlist'
    ? {
        priceCents,
        categoryHash: hashLabel('lead_data'),
        credentialHashes: [
          hashLabel('freshness_verified'),
          hashLabel('delivery_72hr'),
          hashLabel('customer_siloed'),
        ],
        forbiddenTermHashes: [],
        salt: OFFER_SALT_CLEANLIST,
      }
    : {
        priceCents,
        categoryHash: hashLabel('lead_data'),
        credentialHashes: [
          hashLabel('freshness_verified'),
          hashLabel('delivery_72hr'),
          hashLabel('partner_enrichment'),
        ],
        forbiddenTermHashes: [hashLabel('campaign_metadata_reuse')],
        salt: OFFER_SALT_BRIGHTREACH,
      };

  const dealId = vendorId === 'cleanlist'
    ? 'vendor:cleanlist:pro:lead_data'
    : 'vendor:brightreach:data:lead_data';

  const nonce = vendorId === 'cleanlist' ? NONCE_CLEANLIST : NONCE_BRIGHTREACH;

  return {
    policy,
    offer: offerFacts,
    dealId,
    nonce,
  };
}
