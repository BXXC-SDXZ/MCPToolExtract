# Setup Guide

Complete setup instructions for Agent 1st Ads MCP.

---

## Step 1: Get Your License Key

1. Go to [agent1st.io/ads](https://agent1st.io/ads/)
2. Choose a plan:
   - **Scout** ($29/mo) — Meta OR TikTok
   - **Operator** ($69/mo) — Meta + TikTok
   - **Commander** ($149/mo) — Both + Advanced
   - **Agency** ($399/mo) — Unlimited
3. Complete purchase
4. Copy your license key (starts with `a1s_`, `a1o_`, `a1c_`, or `a1a_`)

---

## Step 2: Get Meta Credentials

### Access Token

1. Go to [developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer)
2. Select your app (or create one)
3. Click "Generate Access Token"
4. Add permissions:
   - `ads_management`
   - `pages_read_engagement`
5. Copy the token

> ⚠️ Tokens expire after ~60 days. Regenerate when you see `Invalid OAuth access token` errors.

### Ad Account ID

1. Go to [business.facebook.com](https://business.facebook.com)
2. Open Ads Manager
3. Click ⚙️ Settings
4. Copy the Account ID (format: `act_XXXXXXXXXX`)

### Page ID

1. Go to your Facebook Page
2. Click "About" (or "More" → "About")
3. Scroll to "Page ID"
4. Copy the number

---

## Step 3: Get TikTok Credentials (Optional)

> Requires Operator plan or higher

### Access Token

1. Go to [business-api.tiktok.com](https://business-api.tiktok.com)
2. Sign in with your TikTok Business account
3. Go to "My Apps"
4. Create an app or select existing
5. Copy the Access Token

### Advertiser ID

1. Go to [ads.tiktok.com](https://ads.tiktok.com)
2. Click your profile → "Account"
3. Find "Advertiser ID" in Basic Information
4. Copy the number

---

## Step 4: Configure Your Agent

### Claude Desktop

**Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "agent1st-ads": {
      "command": "npx",
      "args": ["meta-tiktok-ads-from-agent1st"],
      "env": {
        "AGENT1ST_LICENSE_KEY": "a1o_your_license_key_here",
        "META_ADS_ACCESS_TOKEN": "EAAxxxxxxxxxxxxxxxx",
        "META_ADS_ACCOUNT_ID": "act_123456789",
        "META_PAGE_ID": "987654321",
        "TIKTOK_ADS_ACCESS_TOKEN": "your_tiktok_token",
        "TIKTOK_ADVERTISER_ID": "7890123456"
      }
    }
  }
}
```

**Restart Claude Desktop after saving.**

### Cursor / Windsurf

Open Settings → MCP (or MCP Servers) and add the same config block.

### Other MCP Clients

Use the environment variables:

```bash
export AGENT1ST_LICENSE_KEY="a1o_your_license_key"
export META_ADS_ACCESS_TOKEN="EAAxxxxxxxx"
export META_ADS_ACCOUNT_ID="act_123456789"
export META_PAGE_ID="987654321"
export TIKTOK_ADS_ACCESS_TOKEN="your_tiktok_token"
export TIKTOK_ADVERTISER_ID="7890123456"
```

Then run:

```bash
npx meta-tiktok-ads-from-agent1st
```

---

## Step 5: Verify Setup

Ask your agent:

> "Run check_setup"

You should see:

```json
{
  "license": {
    "tier": "operator",
    "valid": true
  },
  "meta": {
    "connected": true,
    "available": true
  },
  "tiktok": {
    "connected": true,
    "available": true
  },
  "ready": true
}
```

---

## Environment Variables Summary

| Variable | Required | Description |
|----------|----------|-------------|
| `AGENT1ST_LICENSE_KEY` | ✅ | License key from agent1st.io/ads |
| `META_ADS_ACCESS_TOKEN` | For Meta | From Graph API Explorer |
| `META_ADS_ACCOUNT_ID` | For Meta | Format: `act_XXXXXXXXXX` |
| `META_PAGE_ID` | For Meta | Your Facebook Page ID |
| `TIKTOK_ADS_ACCESS_TOKEN` | For TikTok | From TikTok Business API |
| `TIKTOK_ADVERTISER_ID` | For TikTok | From TikTok Ads Manager |

---

## Troubleshooting Setup

### "License required"

- `AGENT1ST_LICENSE_KEY` is missing or invalid
- Key must be at least 24 characters
- Key must start with `a1s_`, `a1o_`, `a1c_`, or `a1a_`

### "Meta credentials not set"

Missing one or more of:
- `META_ADS_ACCESS_TOKEN`
- `META_ADS_ACCOUNT_ID`
- `META_PAGE_ID`

### "Invalid OAuth access token"

- Token expired (happens every ~60 days)
- Regenerate at [developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer)

### "Your Scout plan supports one platform"

- Scout ($29/mo) only allows one platform
- You have both Meta and TikTok configured
- Either remove one platform's credentials, or upgrade to Operator

### TikTok not available

- TikTok requires Operator plan or higher ($69/mo)
- Upgrade at [agent1st.io/ads](https://agent1st.io/ads/)

---

## Need Help?

Email: Info@Agent1st.io
