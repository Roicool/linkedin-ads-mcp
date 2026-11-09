import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { LinkedInApiClient } from '../lib/linkedin-api.js';

const FACET_PREFIX = 'urn:li:adTargetingFacet:';

/** Accepts "titles" or "urn:li:adTargetingFacet:titles". */
function toFacetUrn(facet: string): string {
  return facet.startsWith('urn:') ? facet : `${FACET_PREFIX}${facet}`;
}

// ==================== List Targeting Facets ====================

export const listTargetingFacetsTool: Tool = {
  name: 'list_targeting_facets',
  description: 'Lists the targeting facets LinkedIn supports (locations, titles, seniorities, industries, staffCountRanges, skills, jobFunctions, employers, …) and which lookup each facet supports (TYPEAHEAD for free-text search, AD_TARGETING_FACET for listing all values). Use this before search_targeting to pick the right facet.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export async function handleListTargetingFacets(client: LinkedInApiClient, _args: unknown): Promise<unknown> {
  const facets = await client.listTargetingFacets();
  return {
    facets: facets.map(f => ({
      name: f.facetName,
      urn: f.adTargetingFacetUrn,
      finders: f.availableEntityFinders,
      entityTypes: f.entityTypes,
    })),
    totalCount: facets.length,
  };
}

// ==================== Search Targeting ====================

export const searchTargetingTool: Tool = {
  name: 'search_targeting',
  description: 'Finds the URNs needed for campaign targetingCriteria. With "query", runs a typeahead search inside a facet (e.g., facet "titles", query "contact center manager"; facet "locations", query "Dubai"). Without "query", lists every value of a small facet (e.g., "seniorities", "staffCountRanges", "industries", "jobFunctions"). Put the returned URNs under targetingCriteria, e.g. {"include":{"and":[{"or":{"urn:li:adTargetingFacet:titles":["urn:li:title:123"]}}]}}.',
  inputSchema: {
    type: 'object',
    properties: {
      facet: {
        type: 'string',
        description: 'Facet name or URN, e.g. "titles", "locations", "industries", "seniorities", "staffCountRanges", "skills", "jobFunctions", "employers", or "urn:li:adTargetingFacet:titles"',
      },
      query: { type: 'string', description: 'Free-text search (typeahead). Omit to list all values of the facet.' },
      language: { type: 'string', description: 'Locale language for entity names. Default: en' },
      country: { type: 'string', description: 'Locale country for entity names. Default: US' },
      limit: { type: 'number', description: 'Maximum results to return. Default: 25' },
    },
    required: ['facet'],
  },
};

export async function handleSearchTargeting(client: LinkedInApiClient, args: unknown): Promise<unknown> {
  const input = args as { facet: string; query?: string; language?: string; country?: string; limit?: number };

  if (!input.facet) throw new Error('facet is required');

  const facetUrn = toFacetUrn(input.facet);
  const entities = await client.searchTargetingEntities({
    facetUrn,
    query: input.query,
    language: input.language || 'en',
    country: input.country || 'US',
  });
  const limit = input.limit ?? 25;

  return {
    facet: facetUrn,
    finder: input.query ? 'typeahead' : 'adTargetingFacet',
    query: input.query,
    results: entities.slice(0, limit).map(e => ({ urn: e.urn, name: e.name, facetUrn: e.facetUrn })),
    totalCount: entities.length,
  };
}
