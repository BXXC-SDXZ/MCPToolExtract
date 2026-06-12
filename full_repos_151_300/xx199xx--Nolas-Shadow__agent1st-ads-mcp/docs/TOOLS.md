# Tool Reference

Complete parameter reference for all Agent 1st Ads MCP tools.

---

## Setup Tools

### check_setup

**Always call first.** Returns license tier and platform connections.

```json
// Input
{}

// Output
{
  "license": {
    "tier": "operator",
    "description": "Operator ($69/mo) — Meta + TikTok",
    "valid": true
  },
  "meta": {
    "connected": true,
    "account_id": "act_123456789",
    "has_page": true,
    "available": true
  },
  "tiktok": {
    "connected": true,
    "advertiser_id": "7890123456",
    "available": true
  },
  "ready": true
}
```

---

### get_ad_account_info

Get balance, spend, and account status.

```json
// Input
{}

// Output
{
  "meta": {
    "name": "My Business Account",
    "account_status": 1,
    "currency": "USD",
    "balance": "500.00",
    "amount_spent": "1243.50"
  },
  "tiktok": {
    "data": {
      "name": "My TikTok Ads",
      "status": "STATUS_ENABLE",
      "balance": 320.00
    }
  }
}
```

---

## Meta Tools

### create_meta_campaign

Create a complete campaign in one call. Starts PAUSED.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | ✅ | Campaign name |
| `daily_budget_usd` | number | ✅ | Daily spend limit. Min: $1 |
| `destination_url` | string | ✅ | Landing page URL (include https://) |
| `ad_headline` | string | ✅ | Bold headline. Max 40 chars |
| `ad_body` | string | ✅ | Main copy. Max 125 chars |
| `objective` | string | | Default: `OUTCOME_TRAFFIC` |
| `targeting_countries` | array | | Default: `["US"]` |
| `age_min` | number | | Default: 18 |
| `age_max` | number | | Default: 65 |

```json
// Input
{
  "name": "Summer Sale — US",
  "daily_budget_usd": 25,
  "destination_url": "https://mysite.com/sale",
  "ad_headline": "50% Off Everything",
  "ad_body": "Limited time offer. Free shipping on all orders.",
  "targeting_countries": ["US", "CA"],
  "age_min": 25,
  "age_max": 54
}

// Output
{
  "success": true,
  "status": "PAUSED",
  "next_step": "Call enable_meta_campaign with campaign_id to start running.",
  "campaign_id": "120210001234567",
  "adset_id": "120210001234568",
  "creative_id": "120210001234569",
  "ad_id": "120210001234570",
  "daily_budget_usd": 25
}
```

**Objectives:**

| Value | Description |
|-------|-------------|
| `OUTCOME_TRAFFIC` | Drive clicks to website |
| `OUTCOME_LEADS` | Collect leads via forms |
| `OUTCOME_SALES` | Drive purchases (needs pixel) |
| `OUTCOME_ENGAGEMENT` | Boost likes/comments |
| `OUTCOME_AWARENESS` | Maximize reach |

---

### enable_meta_campaign

Activate a paused campaign. Starts spending immediately.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `campaign_id` | string | ✅ | Campaign ID to activate |

```json
// Input
{ "campaign_id": "120210001234567" }

// Output
{
  "success": true,
  "campaign_id": "120210001234567",
  "status": "ACTIVE",
  "message": "Campaign is now live and spending."
}
```

---

### pause_meta_campaign

Stop a live campaign. Settings preserved.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `campaign_id` | string | ✅ | Campaign ID to pause |

```json
// Input
{ "campaign_id": "120210001234567" }

// Output
{
  "success": true,
  "campaign_id": "120210001234567",
  "status": "PAUSED",
  "message": "Campaign paused. No spend until re-enabled."
}
```

---

### get_meta_campaign_stats

Get performance metrics.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `campaign_id` | string | ✅ | Campaign ID |
| `date_preset` | string | | Default: `last_7d` |

**Date presets:** `today`, `yesterday`, `last_7d`, `last_14d`, `last_30d`, `this_month`

```json
// Input
{ "campaign_id": "120210001234567", "date_preset": "last_7d" }

// Output
{
  "data": [{
    "campaign_name": "Summer Sale — US",
    "impressions": "14320",
    "clicks": "423",
    "spend": "47.82",
    "ctr": "2.954",
    "cpm": "3.34"
  }]
}
```

---

### update_meta_campaign_budget

Change daily budget. Takes effect immediately.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `campaign_id` | string | ✅ | Campaign ID |
| `daily_budget_usd` | number | ✅ | New budget. Min: $1 |

```json
// Input
{ "campaign_id": "120210001234567", "daily_budget_usd": 50 }

// Output
{
  "success": true,
  "campaign_id": "120210001234567",
  "new_daily_budget_usd": 50
}
```

---

### list_meta_campaigns

List all campaigns.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | | Default: 20 |
| `status` | string | | Filter: `ACTIVE`, `PAUSED`, `ARCHIVED` |

```json
// Input
{ "limit": 10, "status": "ACTIVE" }

// Output
{
  "data": [
    {
      "id": "120210001234567",
      "name": "Summer Sale — US",
      "status": "ACTIVE",
      "objective": "OUTCOME_TRAFFIC",
      "daily_budget": "2500"
    }
  ]
}
```

---

### delete_meta_campaign

Permanently delete. **Cannot be undone.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `campaign_id` | string | ✅ | Campaign ID to delete |

```json
// Input
{ "campaign_id": "120210001234567" }

// Output
{
  "success": true,
  "campaign_id": "120210001234567",
  "message": "Campaign permanently deleted."
}
```

---

## TikTok Tools

> **Requires Operator plan or higher ($69/mo)**

### create_tiktok_campaign

Create a complete campaign in one call. Starts DISABLE.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | ✅ | Campaign name |
| `budget_usd` | number | ✅ | Daily budget. **Min: $20** |
| `destination_url` | string | ✅ | Landing page URL (include https://) |
| `ad_text` | string | ✅ | Ad copy. Keep it punchy. |
| `objective` | string | | Default: `TRAFFIC` |
| `targeting_countries` | array | | Default: `["US"]` |
| `age_groups` | array | | Default: `["AGE_18_24", "AGE_25_34"]` |

**Age groups:** `AGE_13_17`, `AGE_18_24`, `AGE_25_34`, `AGE_35_44`, `AGE_45_54`, `AGE_55_100`

```json
// Input
{
  "name": "Product Launch — TikTok",
  "budget_usd": 30,
  "destination_url": "https://mysite.com/product",
  "ad_text": "This changed everything. Tap to see why.",
  "targeting_countries": ["US"],
  "age_groups": ["AGE_18_24", "AGE_25_34"]
}

// Output
{
  "success": true,
  "status": "DISABLE",
  "next_step": "Call enable_tiktok_campaign with campaign_id to start running.",
  "campaign_id": "1234567890123",
  "adgroup_id": "9876543210987",
  "ad_id": "1122334455667",
  "budget_usd": 30
}
```

**Objectives:**

| Value | Description |
|-------|-------------|
| `TRAFFIC` | Drive clicks to website |
| `LEAD_GENERATION` | Collect leads |
| `WEBSITE_CONVERSIONS` | Drive purchases |
| `ENGAGEMENT` | Boost video interactions |
| `APP_PROMOTION` | App installs |

---

### enable_tiktok_campaign

Activate a disabled campaign.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `campaign_id` | string | ✅ | Campaign ID to enable |

```json
// Input
{ "campaign_id": "1234567890123" }

// Output
{
  "success": true,
  "campaign_id": "1234567890123",
  "status": "ENABLE",
  "message": "Campaign is now live on TikTok."
}
```

---

### pause_tiktok_campaign

Stop a running campaign.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `campaign_id` | string | ✅ | Campaign ID to pause |

```json
// Input
{ "campaign_id": "1234567890123" }

// Output
{
  "success": true,
  "campaign_id": "1234567890123",
  "status": "DISABLE",
  "message": "Campaign paused."
}
```

---

### get_tiktok_campaign_stats

Get performance metrics.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `campaign_id` | string | ✅ | Campaign ID |
| `start_date` | string | | Format: YYYY-MM-DD. Default: 7 days ago |
| `end_date` | string | | Format: YYYY-MM-DD. Default: today |

```json
// Input
{
  "campaign_id": "1234567890123",
  "start_date": "2025-03-01",
  "end_date": "2025-03-07"
}

// Output
{
  "data": {
    "list": [{
      "dimensions": {
        "campaign_id": "1234567890123",
        "stat_time_day": "2025-03-07"
      },
      "metrics": {
        "spend": "28.40",
        "impressions": "9821",
        "clicks": "312",
        "ctr": "3.18"
      }
    }]
  }
}
```

---

### update_tiktok_campaign_budget

Change daily budget.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `campaign_id` | string | ✅ | Campaign ID |
| `budget_usd` | number | ✅ | New budget. **Min: $20** |

```json
// Input
{ "campaign_id": "1234567890123", "budget_usd": 60 }

// Output
{
  "success": true,
  "campaign_id": "1234567890123",
  "new_budget_usd": 60
}
```

---

### list_tiktok_campaigns

List all campaigns.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | | Default: 20 |

```json
// Input
{ "limit": 20 }

// Output
{
  "data": {
    "list": [
      {
        "campaign_id": "1234567890123",
        "campaign_name": "Product Launch — TikTok",
        "status": "ENABLE",
        "objective_type": "TRAFFIC",
        "budget": 30.00
      }
    ]
  }
}
```

---

## Error Responses

All tools return structured errors:

```json
{
  "error": true,
  "message": "Meta API: Invalid OAuth access token. (code 190)"
}
```

| Error | Meaning | Fix |
|-------|---------|-----|
| `License required` | No license key | Set `AGENT1ST_LICENSE_KEY` |
| `Your Scout plan supports one platform` | Scout can't use both | Upgrade to Operator |
| `Invalid OAuth access token (code 190)` | Token expired | Regenerate Meta token |
| `META_PAGE_ID required` | Missing Page ID | Add to env vars |
| `TikTok minimum is $20/day` | Budget too low | Set `budget_usd` ≥ 20 |
| `Meta credentials not set` | Missing env vars | Add all 3 Meta vars |
| `TikTok credentials not set` | Missing env vars | Add both TikTok vars |
