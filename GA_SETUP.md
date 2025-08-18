# Google Analytics Real Data Setup

This document explains how to set up real Google Analytics data fetching for the visitor counter.

## Current Implementation

The visitor counter now:
- **Base Count**: 350 visitors
- **GA Data**: Attempts to fetch real visitor data from Google Analytics
- **Total**: Base (350) + Real GA visitors = Displayed count

## To Enable Real GA Data

### Option 1: Deploy API Function (Recommended)

1. **Deploy to Vercel/Netlify**
   - The `api/analytics.js` file is ready for serverless deployment
   - Supports Vercel Functions or Netlify Functions

2. **Set up Google Analytics Reporting API**
   ```bash
   # Enable the Analytics Reporting API in Google Cloud Console
   # Create a service account
   # Download the service account key JSON
   ```

3. **Configure Environment Variables**
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
   # OR set the key content as:
   GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account"...}
   ```

4. **Grant Access**
   - In GA4, go to Admin > Property Access Management
   - Add the service account email with "Viewer" permissions

### Option 2: Custom API Endpoint

Create your own API endpoint at `https://api.perhitsiksha.org/analytics` that returns:
```json
{
  "success": true,
  "visitors": 1234,
  "lastUpdated": "2024-08-18T10:30:00Z"
}
```

### Option 3: Third-Party Service

Use services like:
- Google Analytics Intelligence API
- Third-party analytics aggregators
- Custom webhook solutions

## Property Details

- **GA4 Property ID**: `463932967` (derived from G-4VMH1XGME6)
- **Tracking ID**: `G-4VMH1XGME6`
- **Metric Used**: `totalUsers` (unique visitors)
- **Date Range**: From 2024-01-01 to today

## Current Fallback Behavior

If real GA data is not available, the counter will:
1. Try multiple API endpoints
2. Check if gtag is working
3. Use conservative estimation (2 visitors per day since implementation)
4. Minimum fallback: Base (350) + 1 visitor = 351

## Testing

Check browser console for logs:
- `✅ Real GA data fetched: X visitors` - Success
- `📊 Using conservative GA estimation: X visitors` - gtag fallback
- `📋 Using cached GA data` - Cached result
- `🔄 Using minimal fallback count` - All methods failed

## Cache

- Real GA data is cached for 15 minutes to avoid API rate limits
- Cache keys: `ga_visitor_cache`, `ga_visitor_cache_time`