/**
 * Write-safety switches for client accounts.
 *
 * By default, everything this server creates stays in DRAFT and the delete tools are hidden,
 * so no spend starts and nothing is removed from a conversation. Launching (DRAFT -> ACTIVE)
 * is done with the update tools or in Campaign Manager after a human review.
 *
 * LINKEDIN_ALLOW_ACTIVE_CREATE=true  lets create_* tools create entities directly as ACTIVE
 * LINKEDIN_ENABLE_DELETE=true        exposes delete_campaign / delete_campaign_group
 */

export const ALLOW_ACTIVE_CREATE = process.env.LINKEDIN_ALLOW_ACTIVE_CREATE === 'true';
export const ENABLE_DELETE = process.env.LINKEDIN_ENABLE_DELETE === 'true';

export const DELETE_TOOL_NAMES = new Set(['delete_campaign', 'delete_campaign_group']);

/** Throws if a create call asks for ACTIVE while active creation is disabled. */
export function assertDraftOnCreate(status: string | undefined, entity: string): void {
  if (status && status !== 'DRAFT' && !ALLOW_ACTIVE_CREATE) {
    throw new Error(
      `${entity} can only be created as DRAFT on this server (requested: ${status}). ` +
      'Review it in Campaign Manager and launch it with the update tool, ' +
      'or set LINKEDIN_ALLOW_ACTIVE_CREATE=true to allow active creation.'
    );
  }
}

export function assertDeleteEnabled(toolName: string): void {
  if (!ENABLE_DELETE) {
    throw new Error(
      `${toolName} is disabled on this server. Pause or archive instead, ` +
      'or set LINKEDIN_ENABLE_DELETE=true to enable delete tools.'
    );
  }
}
