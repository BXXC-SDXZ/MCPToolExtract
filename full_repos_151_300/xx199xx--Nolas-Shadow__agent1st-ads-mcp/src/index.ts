#!/usr/bin/env node
/**
 * Agent 1st Ads MCP Server v1.0.1
 * Meta (Facebook/Instagram) + TikTok ad campaign management for AI agents.
 * https://agent1st.io/ads/
 *
 * License required — plans from $29/mo at https://agent1st.io/ads/
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    type Tool,
} from '@modelcontextprotocol/sdk/types.js';

// ── Types ─────────────────────────────────────────────────────────────────────

type Tier = 'starter' | 'pro' | 'premium' | 'elite' | 'none';

interface MetaApiError {
    error: {
        message: string;
        code: number;
    };
}

interface MetaApiResponse {
    id?: string;
    data?: unknown[];
    error?: MetaApiError['error'];
    [key: string]: unknown;
}

interface TikTokApiResponse {
    code: number;
    message: string;
    data?: {
        campaign_id?: string;
        adgroup_id?: string;
        ad_id?: string;
        list?: unknown[];
        [key: string]: unknown;
    };
}

interface CheckSetupResult {
    license: { tier: Tier; description: string; valid: boolean };
    meta: { connected: boolean; account_id?: string; has_page?: boolean; available?: boolean; message?: string };
    tiktok: { connected: boolean; advertiser_id?: string; available?: boolean; message?: string };
    ready: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const META_MIN_BUDGET_USD = 1;
const TIKTOK_MIN_BUDGET_USD = 20;

// ── License Enforcement ───────────────────────────────────────────────────────

const TIERS: Record<string, Tier> = {
    'a1s_': 'starter',  // Starter  — $29/mo — 1 platform
    'a1o_': 'pro',      // Pro      — $69/mo — both platforms
    'a1c_': 'premium',  // Premium  — $149/mo — both + advanced
    'a1a_': 'elite',    // Elite    — $399/mo — unlimited
};

function getLicenseTier(): Tier {
    const key = process.env.AGENT1ST_LICENSE_KEY || '';
    if (!key) return 'none';
    for (const [prefix, tier] of Object.entries(TIERS)) {
        if (key.startsWith(prefix) && key.length >= 24) return tier;
    }
    return 'none';
}

function tierAllows(tier: Tier, feature: 'meta' | 'tiktok' | 'both'): boolean {
    if (tier === 'none') return false;
    if (feature === 'both') return tier !== 'starter';
    // Starter can use Meta OR TikTok — whichever is configured, not both simultaneously
    if (tier === 'starter' && feature === 'tiktok' && cfg.hasMeta()) return false;
    return true;
}

const NO_LICENSE =
    'License required. Get your Agent 1st Ads key at https://agent1st.io/ads/ — plans from $29/mo.\n' +
    'Set AGENT1ST_LICENSE_KEY=<your-key> in your environment variables.';

const STARTER_UPGRADE =
    'Your Starter plan ($29/mo) supports one ad platform. ' +
    'Upgrade to Pro ($69/mo) or higher to run both Meta and TikTok. ' +
    'Upgrade at https://agent1st.io/ads/';

function licenseCheck(platform?: 'meta' | 'tiktok'): string | null {
    const tier = getLicenseTier();
    if (tier === 'none') return NO_LICENSE;
    if (platform === 'meta' && !tierAllows(tier, 'meta')) return STARTER_UPGRADE;
    if (platform === 'tiktok' && !tierAllows(tier, 'tiktok')) return STARTER_UPGRADE;
    return null; // licensed — proceed
}

// ── Config ────────────────────────────────────────────────────────────────────

const META_API   = 'https://graph.facebook.com/v19.0';
const TIKTOK_API = 'https://business-api.tiktok.com/open_api/v1.3';

const cfg = {
    metaToken:   () => process.env.META_ADS_ACCESS_TOKEN   || '',
    metaAccount: () => process.env.META_ADS_ACCOUNT_ID     || '',
    metaPage:    () => process.env.META_PAGE_ID            || '',
    tikTokToken: () => process.env.TIKTOK_ADS_ACCESS_TOKEN || '',
    tikTokAdvId: () => process.env.TIKTOK_ADVERTISER_ID    || '',
    hasMeta:     () => !!(process.env.META_ADS_ACCESS_TOKEN && process.env.META_ADS_ACCOUNT_ID),
    hasTikTok:   () => !!(process.env.TIKTOK_ADS_ACCESS_TOKEN && process.env.TIKTOK_ADVERTISER_ID),
};

// ── Validation Helpers ────────────────────────────────────────────────────────

function validateMetaBudget(budget: unknown): string | null {
    if (typeof budget !== 'number' || budget < META_MIN_BUDGET_USD) {
        return `Meta minimum daily budget is $${META_MIN_BUDGET_USD}/day. Got: $${budget}`;
    }
    return null;
}

function validateTikTokBudget(budget: unknown): string | null {
    if (typeof budget !== 'number' || budget < TIKTOK_MIN_BUDGET_USD) {
        return `TikTok minimum daily budget is $${TIKTOK_MIN_BUDGET_USD}/day. Got: $${budget}`;
    }
    return null;
}

function validateUrl(url: unknown): string | null {
    if (typeof url !== 'string' || !url.startsWith('https://')) {
        return 'destination_url must start with https://';
    }
    return null;
}

// ── HTTP Helpers ──────────────────────────────────────────────────────────────

function ok(data: unknown): string { return JSON.stringify(data, null, 2); }
function fail(msg: string): string { return JSON.stringify({ error: true, message: msg }); }

async function metaGet(path: string, params: Record<string, string> = {}): Promise<MetaApiResponse> {
    const url = new URL(`${META_API}${path}`);
    url.searchParams.set('access_token', cfg.metaToken());
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    const response = await fetch(url.toString());
    const json = await response.json() as MetaApiResponse;
    if (json.error) throw new Error(`Meta API: ${json.error.message} (code ${json.error.code})`);
    return json;
}

async function metaPost(path: string, body: Record<string, unknown>): Promise<MetaApiResponse> {
    const url = new URL(`${META_API}${path}`);
    url.searchParams.set('access_token', cfg.metaToken());
    const response = await fetch(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const json = await response.json() as MetaApiResponse;
    if (json.error) throw new Error(`Meta API: ${json.error.message} (code ${json.error.code})`);
    return json;
}

async function metaDelete(path: string): Promise<MetaApiResponse> {
    const url = new URL(`${META_API}${path}`);
    url.searchParams.set('access_token', cfg.metaToken());
    const response = await fetch(url.toString(), { method: 'DELETE' });
    const json = await response.json() as MetaApiResponse;
    if (json.error) throw new Error(`Meta API: ${json.error.message} (code ${json.error.code})`);
    return json;
}

async function tikTokGet(path: string, params: Record<string, string> = {}): Promise<TikTokApiResponse> {
    const url = new URL(`${TIKTOK_API}${path}`);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    const response = await fetch(url.toString(), {
        headers: { 'Access-Token': cfg.tikTokToken() }
    });
    const json = await response.json() as TikTokApiResponse;
    if (json.code !== 0) throw new Error(`TikTok API: ${json.message} (code ${json.code})`);
    return json;
}

async function tikTokPost(path: string, body: Record<string, unknown>): Promise<TikTokApiResponse> {
    const response = await fetch(`${TIKTOK_API}${path}`, {
        method: 'POST',
        headers: { 'Access-Token': cfg.tikTokToken(), 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const json = await response.json() as TikTokApiResponse;
    if (json.code !== 0) throw new Error(`TikTok API: ${json.message} (code ${json.code})`);
    return json;
}

// ── Tool Definitions ──────────────────────────────────────────────────────────

const TOOLS: Tool[] = [
    {
        name: 'check_setup',
        description: 'ALWAYS call this first. Verifies license tier and which ad platforms are connected. Shows what is available based on your plan (Starter/Pro/Premium/Elite). Use this before any other tool.',
        inputSchema: { type: 'object', properties: {}, required: [] },
    },
    {
        name: 'get_ad_account_info',
        description: 'Get current balance, total spend, currency, and account status for all connected ad accounts (Meta and/or TikTok). Call before creating campaigns to confirm account is active and has sufficient funds. Requires valid license.',
        inputSchema: { type: 'object', properties: {}, required: [] },
    },
    {
        name: 'list_meta_campaigns',
        description: 'List all campaigns in the Meta (Facebook/Instagram) ad account with campaign ID, name, status (ACTIVE/PAUSED/ARCHIVED), objective, and daily budget. Use campaign IDs to get stats, adjust budgets, or pause/enable. Requires Starter plan or higher.',
        inputSchema: {
            type: 'object',
            properties: {
                limit:  { type: 'number', description: 'Max campaigns to return. Default: 20.' },
                status: { type: 'string', description: 'Filter by status: ACTIVE, PAUSED, or ARCHIVED. Omit to return all.' },
            },
            required: [],
        },
    },
    {
        name: 'create_meta_campaign',
        description: 'Create a complete Meta (Facebook/Instagram) ad campaign in one call — campaign + ad set with targeting + creative + ad. Created in PAUSED state. Call enable_meta_campaign to activate. Minimum budget $1/day. Requires Starter plan or higher.',
        inputSchema: {
            type: 'object',
            properties: {
                name:                { type: 'string', description: 'Campaign name. Example: "Spring Sale — Traffic — US"' },
                objective:           { type: 'string', description: 'Objective: OUTCOME_TRAFFIC, OUTCOME_LEADS, OUTCOME_SALES, OUTCOME_ENGAGEMENT, OUTCOME_AWARENESS. Default: OUTCOME_TRAFFIC' },
                daily_budget_usd:    { type: 'number', description: 'Daily spend limit in USD. Minimum: 1.' },
                destination_url:     { type: 'string', description: 'Full URL (including https://) users land on after clicking.' },
                ad_headline:         { type: 'string', description: 'Bold ad headline. Max 40 characters.' },
                ad_body:             { type: 'string', description: 'Main ad copy. Max 125 characters.' },
                targeting_countries: { type: 'array', items: { type: 'string' }, description: 'Country codes. Example: ["US","CA","GB"]. Default: ["US"].' },
                age_min:             { type: 'number', description: 'Minimum target age. Default: 18.' },
                age_max:             { type: 'number', description: 'Maximum target age. Default: 65.' },
            },
            required: ['name', 'daily_budget_usd', 'destination_url', 'ad_headline', 'ad_body'],
        },
    },
    {
        name: 'enable_meta_campaign',
        description: 'Activate a paused Meta campaign so it starts spending. Use campaign_id from create_meta_campaign or list_meta_campaigns. Requires Starter plan or higher.',
        inputSchema: {
            type: 'object',
            properties: { campaign_id: { type: 'string', description: 'Meta campaign ID to activate.' } },
            required: ['campaign_id'],
        },
    },
    {
        name: 'pause_meta_campaign',
        description: 'Pause a live Meta campaign to stop all spending immediately. Campaign and settings are preserved — use enable_meta_campaign to resume. Requires Starter plan or higher.',
        inputSchema: {
            type: 'object',
            properties: { campaign_id: { type: 'string', description: 'Meta campaign ID to pause.' } },
            required: ['campaign_id'],
        },
    },
    {
        name: 'get_meta_campaign_stats',
        description: 'Get performance metrics for a Meta campaign: impressions, clicks, spend (USD), CTR, CPM, and conversions. Use to evaluate performance before budget decisions. Requires Starter plan or higher.',
        inputSchema: {
            type: 'object',
            properties: {
                campaign_id: { type: 'string', description: 'Meta campaign ID.' },
                date_preset: { type: 'string', description: 'Time range: today, yesterday, last_7d, last_14d, last_30d, this_month. Default: last_7d.' },
            },
            required: ['campaign_id'],
        },
    },
    {
        name: 'update_meta_campaign_budget',
        description: 'Change the daily budget of a Meta campaign. Takes effect immediately. Increase to scale a winning campaign, decrease to throttle spend. Minimum $1/day. Requires Starter plan or higher.',
        inputSchema: {
            type: 'object',
            properties: {
                campaign_id:      { type: 'string', description: 'Meta campaign ID.' },
                daily_budget_usd: { type: 'number', description: 'New daily budget in USD. Minimum: 1.' },
            },
            required: ['campaign_id', 'daily_budget_usd'],
        },
    },
    {
        name: 'delete_meta_campaign',
        description: 'Permanently delete a Meta campaign and all its ad sets and ads. Cannot be undone. Use pause_meta_campaign to stop spending temporarily. Requires Starter plan or higher.',
        inputSchema: {
            type: 'object',
            properties: { campaign_id: { type: 'string', description: 'Meta campaign ID to permanently delete.' } },
            required: ['campaign_id'],
        },
    },
    {
        name: 'list_tiktok_campaigns',
        description: 'List all campaigns in the TikTok ad account with campaign ID, name, status, objective, and budget. Requires Pro plan or higher ($69/mo).',
        inputSchema: {
            type: 'object',
            properties: { limit: { type: 'number', description: 'Max campaigns to return. Default: 20.' } },
            required: [],
        },
    },
    {
        name: 'create_tiktok_campaign',
        description: 'Create a complete TikTok ad campaign in one call — campaign + ad group with targeting + ad. Created in DISABLE state. Call enable_tiktok_campaign to activate. TikTok minimum budget is $20/day. Requires Pro plan or higher ($69/mo).',
        inputSchema: {
            type: 'object',
            properties: {
                name:                { type: 'string',  description: 'Campaign name.' },
                objective:           { type: 'string',  description: 'Objective: TRAFFIC, LEAD_GENERATION, WEBSITE_CONVERSIONS, ENGAGEMENT, APP_PROMOTION. Default: TRAFFIC.' },
                budget_usd:          { type: 'number',  description: 'Daily budget in USD. TikTok minimum: 20.' },
                destination_url:     { type: 'string',  description: 'Landing page URL (must include https://).' },
                ad_text:             { type: 'string',  description: 'Ad copy text. Keep it punchy — TikTok is a fast-scroll platform.' },
                targeting_countries: { type: 'array',   items: { type: 'string' }, description: 'Country codes. Example: ["US"]. Default: ["US"].' },
                age_groups:          { type: 'array',   items: { type: 'string' }, description: 'Age brackets: AGE_13_17, AGE_18_24, AGE_25_34, AGE_35_44, AGE_45_54, AGE_55_100. Default: [AGE_18_24, AGE_25_34].' },
            },
            required: ['name', 'budget_usd', 'destination_url', 'ad_text'],
        },
    },
    {
        name: 'enable_tiktok_campaign',
        description: 'Activate a disabled TikTok campaign so it starts running. Requires Pro plan or higher ($69/mo).',
        inputSchema: {
            type: 'object',
            properties: { campaign_id: { type: 'string', description: 'TikTok campaign ID to enable.' } },
            required: ['campaign_id'],
        },
    },
    {
        name: 'pause_tiktok_campaign',
        description: 'Pause a running TikTok campaign to stop all spending. Settings preserved — use enable_tiktok_campaign to resume. Requires Pro plan or higher ($69/mo).',
        inputSchema: {
            type: 'object',
            properties: { campaign_id: { type: 'string', description: 'TikTok campaign ID to pause.' } },
            required: ['campaign_id'],
        },
    },
    {
        name: 'get_tiktok_campaign_stats',
        description: 'Get performance metrics for a TikTok campaign: impressions, clicks, spend, CTR, CPC, conversions. Requires Pro plan or higher ($69/mo).',
        inputSchema: {
            type: 'object',
            properties: {
                campaign_id: { type: 'string', description: 'TikTok campaign ID.' },
                start_date:  { type: 'string', description: 'Start date YYYY-MM-DD. Default: 7 days ago.' },
                end_date:    { type: 'string', description: 'End date YYYY-MM-DD. Default: today.' },
            },
            required: ['campaign_id'],
        },
    },
    {
        name: 'update_tiktok_campaign_budget',
        description: 'Change the daily budget of a TikTok campaign. TikTok minimum is $20/day. Requires Pro plan or higher ($69/mo).',
        inputSchema: {
            type: 'object',
            properties: {
                campaign_id: { type: 'string', description: 'TikTok campaign ID.' },
                budget_usd:  { type: 'number', description: 'New daily budget in USD. Minimum: 20.' },
            },
            required: ['campaign_id', 'budget_usd'],
        },
    },
];

// ── Tool Handlers ─────────────────────────────────────────────────────────────

async function handleTool(name: string, args: Record<string, unknown>): Promise<string> {
    try {
        switch (name) {

        case 'check_setup': {
            const tier = getLicenseTier();
            const tierLabels: Record<Tier, string> = {
                starter: 'Starter ($29/mo) — Meta OR TikTok',
                pro:     'Pro ($69/mo) — Meta + TikTok',
                premium: 'Premium ($149/mo) — Meta + TikTok + Advanced',
                elite:   'Elite ($399/mo) — Unlimited',
                none:    'No license — purchase at https://agent1st.io/ads/',
            };
            const result: CheckSetupResult = {
                license: { tier, description: tierLabels[tier], valid: tier !== 'none' },
                meta: cfg.hasMeta()
                    ? { connected: true, account_id: cfg.metaAccount(), has_page: !!cfg.metaPage(), available: tier !== 'none' }
                    : { connected: false, message: 'Set META_ADS_ACCESS_TOKEN, META_ADS_ACCOUNT_ID, META_PAGE_ID' },
                tiktok: cfg.hasTikTok()
                    ? { connected: true, advertiser_id: cfg.tikTokAdvId(), available: tier !== 'none' && tier !== 'starter' }
                    : { connected: false, message: 'Set TIKTOK_ADS_ACCESS_TOKEN, TIKTOK_ADVERTISER_ID' },
                ready: tier !== 'none' && (cfg.hasMeta() || cfg.hasTikTok()),
            };
            return ok(result);
        }

        case 'get_ad_account_info': {
            const denied = licenseCheck();
            if (denied) return fail(denied);
            const tier = getLicenseTier();
            const results: Record<string, unknown> = {};
            if (cfg.hasMeta()) {
                results.meta = await metaGet(`/${cfg.metaAccount()}`, {
                    fields: 'name,account_status,currency,balance,amount_spent,spend_cap,timezone_name',
                });
            }
            if (cfg.hasTikTok() && tier !== 'starter') {
                results.tiktok = await tikTokGet('/advertiser/info/', {
                    advertiser_id: cfg.tikTokAdvId(),
                    fields: '["name","status","currency","balance","timezone"]',
                });
            } else if (tier === 'starter') {
                results.tiktok = { message: 'TikTok requires Pro plan or higher. Upgrade at https://agent1st.io/ads/' };
            }
            return ok(results);
        }

        case 'list_meta_campaigns': {
            const denied = licenseCheck('meta');
            if (denied) return fail(denied);
            if (!cfg.hasMeta()) return fail('Meta credentials not set. Add META_ADS_ACCESS_TOKEN, META_ADS_ACCOUNT_ID, META_PAGE_ID.');
            const params: Record<string, string> = {
                fields: 'id,name,status,objective,daily_budget,spend_cap,start_time',
                limit: String(args.limit ?? 20),
            };
            if (args.status) params.effective_status = `["${args.status}"]`;
            return ok(await metaGet(`/${cfg.metaAccount()}/campaigns`, params));
        }

        case 'create_meta_campaign': {
            const denied = licenseCheck('meta');
            if (denied) return fail(denied);
            if (!cfg.hasMeta()) return fail('Meta credentials not set.');
            if (!cfg.metaPage()) return fail('META_PAGE_ID required to create ads.');
            if (!args.name || !args.daily_budget_usd || !args.destination_url || !args.ad_headline || !args.ad_body)
                return fail('Required: name, daily_budget_usd, destination_url, ad_headline, ad_body');

            // Validate budget
            const budgetError = validateMetaBudget(args.daily_budget_usd);
            if (budgetError) return fail(budgetError);

            // Validate URL
            const urlError = validateUrl(args.destination_url);
            if (urlError) return fail(urlError);

            const campaignRes = await metaPost(`/${cfg.metaAccount()}/campaigns`, {
                name: args.name, objective: args.objective || 'OUTCOME_TRAFFIC',
                status: 'PAUSED', special_ad_categories: [],
            });

            const adSetRes = await metaPost(`/${cfg.metaAccount()}/adsets`, {
                name: `${args.name} — Ad Set`, campaign_id: campaignRes.id,
                daily_budget: Math.round((args.daily_budget_usd as number) * 100),
                billing_event: 'IMPRESSIONS', optimization_goal: 'LINK_CLICKS',
                targeting: {
                    geo_locations: { countries: (args.targeting_countries as string[]) || ['US'] },
                    age_min: (args.age_min as number) || 18,
                    age_max: (args.age_max as number) || 65,
                },
                status: 'PAUSED',
            });

            const creativeRes = await metaPost(`/${cfg.metaAccount()}/adcreatives`, {
                name: `${args.name} — Creative`,
                object_story_spec: {
                    page_id: cfg.metaPage(),
                    link_data: {
                        message: args.ad_body, link: args.destination_url, name: args.ad_headline,
                        call_to_action: { type: 'LEARN_MORE', value: { link: args.destination_url } },
                    },
                },
            });

            const adRes = await metaPost(`/${cfg.metaAccount()}/ads`, {
                name: `${args.name} — Ad`, adset_id: adSetRes.id,
                creative: { creative_id: creativeRes.id }, status: 'PAUSED',
            });

            return ok({
                success: true, status: 'PAUSED',
                next_step: 'Call enable_meta_campaign with campaign_id to start running.',
                campaign_id: campaignRes.id, adset_id: adSetRes.id,
                creative_id: creativeRes.id, ad_id: adRes.id,
                daily_budget_usd: args.daily_budget_usd,
            });
        }

        case 'enable_meta_campaign': {
            const denied = licenseCheck('meta');
            if (denied) return fail(denied);
            if (!args.campaign_id) return fail('campaign_id required.');
            await metaPost(`/${args.campaign_id}`, { status: 'ACTIVE' });
            return ok({ success: true, campaign_id: args.campaign_id, status: 'ACTIVE', message: 'Campaign is now live and spending.' });
        }

        case 'pause_meta_campaign': {
            const denied = licenseCheck('meta');
            if (denied) return fail(denied);
            if (!args.campaign_id) return fail('campaign_id required.');
            await metaPost(`/${args.campaign_id}`, { status: 'PAUSED' });
            return ok({ success: true, campaign_id: args.campaign_id, status: 'PAUSED', message: 'Campaign paused. No spend until re-enabled.' });
        }

        case 'delete_meta_campaign': {
            const denied = licenseCheck('meta');
            if (denied) return fail(denied);
            if (!args.campaign_id) return fail('campaign_id required.');
            await metaDelete(`/${args.campaign_id}`);
            return ok({ success: true, campaign_id: args.campaign_id, message: 'Campaign permanently deleted.' });
        }

        case 'get_meta_campaign_stats': {
            const denied = licenseCheck('meta');
            if (denied) return fail(denied);
            if (!args.campaign_id) return fail('campaign_id required.');
            return ok(await metaGet(`/${args.campaign_id}/insights`, {
                fields: 'campaign_name,impressions,clicks,spend,ctr,cpm,actions',
                date_preset: (args.date_preset as string) || 'last_7d',
            }));
        }

        case 'update_meta_campaign_budget': {
            const denied = licenseCheck('meta');
            if (denied) return fail(denied);
            if (!args.campaign_id || !args.daily_budget_usd) return fail('campaign_id and daily_budget_usd required.');

            // Validate budget
            const budgetError = validateMetaBudget(args.daily_budget_usd);
            if (budgetError) return fail(budgetError);

            await metaPost(`/${args.campaign_id}`, { daily_budget: Math.round((args.daily_budget_usd as number) * 100) });
            return ok({ success: true, campaign_id: args.campaign_id, new_daily_budget_usd: args.daily_budget_usd });
        }

        case 'list_tiktok_campaigns': {
            const denied = licenseCheck('tiktok');
            if (denied) return fail(denied);
            if (!cfg.hasTikTok()) return fail('TikTok credentials not set. Add TIKTOK_ADS_ACCESS_TOKEN and TIKTOK_ADVERTISER_ID.');
            return ok(await tikTokGet('/campaign/get/', {
                advertiser_id: cfg.tikTokAdvId(),
                page_size: String(args.limit ?? 20),
                fields: '["campaign_id","campaign_name","status","objective_type","budget","create_time"]',
            }));
        }

        case 'create_tiktok_campaign': {
            const denied = licenseCheck('tiktok');
            if (denied) return fail(denied);
            if (!cfg.hasTikTok()) return fail('TikTok credentials not set.');
            if (!args.name || !args.budget_usd || !args.destination_url || !args.ad_text)
                return fail('Required: name, budget_usd, destination_url, ad_text');

            // Validate budget
            const budgetError = validateTikTokBudget(args.budget_usd);
            if (budgetError) return fail(budgetError);

            // Validate URL
            const urlError = validateUrl(args.destination_url);
            if (urlError) return fail(urlError);

            const campaignRes = await tikTokPost('/campaign/create/', {
                advertiser_id: cfg.tikTokAdvId(), campaign_name: args.name,
                objective_type: args.objective || 'TRAFFIC',
                budget_mode: 'BUDGET_MODE_DAY', budget: args.budget_usd, operation_status: 'DISABLE',
            });
            const campaignId = campaignRes.data?.campaign_id;

            const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
            const adGroupRes = await tikTokPost('/adgroup/create/', {
                advertiser_id: cfg.tikTokAdvId(), campaign_id: campaignId,
                adgroup_name: `${args.name} — Group`, placement_type: 'PLACEMENT_TYPE_AUTOMATIC',
                location_ids: [2840], age: (args.age_groups as string[]) || ['AGE_18_24', 'AGE_25_34'],
                budget_mode: 'BUDGET_MODE_DAY', budget: args.budget_usd,
                schedule_type: 'SCHEDULE_START_END', schedule_start_time: `${today} 00:00:00`,
                schedule_end_time: '20380101 00:00:00', optimization_goal: 'CLICK',
                billing_event: 'CPC', operation_status: 'DISABLE',
            });

            const adRes = await tikTokPost('/ad/create/', {
                advertiser_id: cfg.tikTokAdvId(), adgroup_id: adGroupRes.data?.adgroup_id,
                ad_name: `${args.name} — Ad`, ad_text: args.ad_text,
                landing_page_url: args.destination_url, call_to_action: 'LEARN_MORE', operation_status: 'DISABLE',
            });

            return ok({
                success: true, status: 'DISABLE',
                next_step: 'Call enable_tiktok_campaign with campaign_id to start running.',
                campaign_id: campaignId, adgroup_id: adGroupRes.data?.adgroup_id, ad_id: adRes.data?.ad_id,
                budget_usd: args.budget_usd,
            });
        }

        case 'enable_tiktok_campaign': {
            const denied = licenseCheck('tiktok');
            if (denied) return fail(denied);
            if (!args.campaign_id) return fail('campaign_id required.');
            await tikTokPost('/campaign/status/update/', {
                advertiser_id: cfg.tikTokAdvId(), campaign_ids: [args.campaign_id], operation_status: 'ENABLE',
            });
            return ok({ success: true, campaign_id: args.campaign_id, status: 'ENABLE', message: 'Campaign is now live on TikTok.' });
        }

        case 'pause_tiktok_campaign': {
            const denied = licenseCheck('tiktok');
            if (denied) return fail(denied);
            if (!args.campaign_id) return fail('campaign_id required.');
            await tikTokPost('/campaign/status/update/', {
                advertiser_id: cfg.tikTokAdvId(), campaign_ids: [args.campaign_id], operation_status: 'DISABLE',
            });
            return ok({ success: true, campaign_id: args.campaign_id, status: 'DISABLE', message: 'Campaign paused.' });
        }

        case 'get_tiktok_campaign_stats': {
            const denied = licenseCheck('tiktok');
            if (denied) return fail(denied);
            if (!args.campaign_id) return fail('campaign_id required.');
            const now = new Date(), weekAgo = new Date(now.getTime() - 7 * 86400000);
            const fmt = (d: Date) => d.toISOString().split('T')[0];
            return ok(await tikTokGet('/report/integrated/get/', {
                advertiser_id: cfg.tikTokAdvId(), report_type: 'BASIC',
                dimensions: '["campaign_id","stat_time_day"]',
                metrics: '["spend","impressions","clicks","ctr","cpc","conversion","cost_per_conversion"]',
                data_level: 'AUCTION_CAMPAIGN',
                start_date: (args.start_date as string) || fmt(weekAgo),
                end_date:   (args.end_date   as string) || fmt(now),
                filtering: JSON.stringify([{ field_name: 'campaign_ids', filter_type: 'IN', filter_value: `["${args.campaign_id}"]` }]),
            }));
        }

        case 'update_tiktok_campaign_budget': {
            const denied = licenseCheck('tiktok');
            if (denied) return fail(denied);
            if (!args.campaign_id || !args.budget_usd) return fail('campaign_id and budget_usd required.');

            // Validate budget
            const budgetError = validateTikTokBudget(args.budget_usd);
            if (budgetError) return fail(budgetError);

            await tikTokPost('/campaign/update/', {
                advertiser_id: cfg.tikTokAdvId(), campaign_id: args.campaign_id,
                budget: args.budget_usd, budget_mode: 'BUDGET_MODE_DAY',
            });
            return ok({ success: true, campaign_id: args.campaign_id, new_budget_usd: args.budget_usd });
        }

        default:
            return fail(`Unknown tool: ${name}`);
        }
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        return fail(message);
    }
}

// ── MCP Server ────────────────────────────────────────────────────────────────

const server = new Server(
    { name: 'meta-tiktok-ads-from-agent1st', version: '1.0.1' },
    { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;
    const result = await handleTool(name, args as Record<string, unknown>);
    return { content: [{ type: 'text', text: result }] };
});

const transport = new StdioServerTransport();
await server.connect(transport);
