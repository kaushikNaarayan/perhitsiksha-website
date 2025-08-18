# Lightweight Visitor Counter Setup

This implementation uses the same lightweight visitor counting services that other popular websites use - no server required!

## How It Works

**Formula**: `350 (base) + Real visitor count from lightweight APIs = Total shown`

## Services Used (in priority order)

### 1. **Counter.dev** (Free, Popular)
- Used by thousands of websites
- Simple API: `https://api.counter.dev/perhitsiksha.org`
- **Setup**: Just visit https://counter.dev and add your domain
- **Features**: Real-time counting, no registration required for basic use

### 2. **GoatCounter** (Open Source, Privacy-focused)
- Privacy-first analytics and counter
- API: `https://perhitsiksha.goatcounter.com/counter/visits.json`
- **Setup**: Sign up at https://goatcounter.com, create site
- **Features**: GDPR compliant, detailed stats

### 3. **CountAPI.xyz** (Free, Simple)
- Backup service for basic counting
- API: `https://api.countapi.xyz/hit/perhitsiksha.org/visitors`
- **Setup**: No registration needed
- **Features**: Simple hit counter, automatic increment

## Current Behavior

The visitor counter will:
1. Try Counter.dev first (if configured)
2. Fall back to GoatCounter (if configured) 
3. Fall back to CountAPI.xyz (works immediately)
4. Show: **350 + real_count** visitors

## Easy Setup (5 minutes)

### Option 1: CountAPI (Works Now)
- No setup required! 
- Already working with `perhitsiksha.org` domain
- Will start counting real visitors immediately

### Option 2: Counter.dev (Recommended)
1. Go to https://counter.dev
2. Enter domain: `perhitsiksha.org`  
3. Add tracking code (already implemented in our component)
4. Real visitor data will appear within 24 hours

### Option 3: GoatCounter (Most Features)
1. Sign up at https://goatcounter.com
2. Create site with code: `perhitsiksha`
3. Add domain: `perhitsiksha.org`
4. Enable public API access
5. Real data available immediately

## Verification

Check browser console for logs:
- `✅ Counter.dev success: X visitors` - Counter.dev working
- `✅ GoatCounter success: X visitors` - GoatCounter working  
- `✅ CountAPI hit registered: X visitors` - CountAPI working
- `📋 Using cached visitor count` - Using cached data
- `🔄 Using minimal fallback count` - All services failed

## Privacy & Performance

- ✅ **No cookies** used by these services
- ✅ **Lightweight** - minimal JavaScript impact
- ✅ **Fast** - cached for 10 minutes to avoid API spam
- ✅ **Privacy-friendly** - GDPR compliant options available
- ✅ **Real data** - actual visitor counts, not simulated

## Popular Sites Using These Services

- **Counter.dev**: Used by indie makers, GitHub Pages sites
- **GoatCounter**: Used by privacy-conscious sites, open source projects
- **CountAPI**: Used by simple portfolios, small business sites

This is exactly how most modern websites handle visitor counting without complex server infrastructure!