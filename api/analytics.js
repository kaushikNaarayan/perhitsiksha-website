// Serverless function for Vercel/Netlify to fetch GA data
// This file can be used with Vercel Functions or Netlify Functions

import { BetaAnalyticsDataClient } from '@google-analytics/data';

const propertyId = '463932967'; // Your GA4 Property ID (from G-4VMH1XGME6)

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Initialize the Analytics Data API client
    // Note: This requires GOOGLE_APPLICATION_CREDENTIALS environment variable
    // or service account key to be configured
    const analyticsDataClient = new BetaAnalyticsDataClient();

    // Run a simple report to get total users
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '2024-01-01', // When GA tracking started
          endDate: 'today',
        },
      ],
      metrics: [
        {
          name: 'totalUsers',
        },
      ],
    });

    const totalUsers = response.rows?.[0]?.metricValues?.[0]?.value || '0';
    const visitorCount = parseInt(totalUsers, 10);

    res.status(200).json({
      success: true,
      visitors: visitorCount,
      lastUpdated: new Date().toISOString(),
    });

  } catch (error) {
    console.error('GA API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics data',
      fallback: true,
    });
  }
}