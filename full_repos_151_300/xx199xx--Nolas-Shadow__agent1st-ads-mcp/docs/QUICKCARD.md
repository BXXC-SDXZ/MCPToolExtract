# Agent 1st Ads — Quick Card

> Copy-paste examples for AI agents. All tools return JSON.

---

## First Thing — Always Run

```
check_setup
```

---

## Create + Launch Meta Campaign

```json
create_meta_campaign {
  "name": "My Campaign",
  "daily_budget_usd": 10,
  "destination_url": "https://example.com",
  "ad_headline": "Check This Out",
  "ad_body": "Click to learn more."
}
```

Then:

```json
enable_meta_campaign { "campaign_id": "<id_from_above>" }
```

---

## Create + Launch TikTok Campaign

```json
create_tiktok_campaign {
  "name": "My TikTok Campaign",
  "budget_usd": 20,
  "destination_url": "https://example.com",
  "ad_text": "You need to see this."
}
```

Then:

```json
enable_tiktok_campaign { "campaign_id": "<id_from_above>" }
```

---

## Check Stats

```json
get_meta_campaign_stats { "campaign_id": "123", "date_preset": "last_7d" }
```

```json
get_tiktok_campaign_stats { "campaign_id": "123" }
```

---

## Pause

```json
pause_meta_campaign { "campaign_id": "123" }
```

```json
pause_tiktok_campaign { "campaign_id": "123" }
```

---

## Change Budget

```json
update_meta_campaign_budget { "campaign_id": "123", "daily_budget_usd": 50 }
```

```json
update_tiktok_campaign_budget { "campaign_id": "123", "budget_usd": 50 }
```

---

## List All

```json
list_meta_campaigns {}
```

```json
list_tiktok_campaigns {}
```

---

## Delete (Permanent!)

```json
delete_meta_campaign { "campaign_id": "123" }
```

---

## Minimums

- **Meta:** $1/day
- **TikTok:** $20/day

---

## License Tiers

| Prefix | Plan | Platforms |
|--------|------|-----------|
| `a1s_` | Scout $29 | Meta OR TikTok |
| `a1o_` | Operator $69 | Both |
| `a1c_` | Commander $149 | Both + Advanced |
| `a1a_` | Agency $399 | Unlimited |
