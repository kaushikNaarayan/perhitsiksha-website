// Simulate browser environment for Supabase
global.fetch = require('@supabase/supabase-js/node_modules/cross-fetch/dist/node-ponyfill.js')().fetch;

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sxocorkwwbtuqpexfmdt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4b2Nvcmt3d2J0dXFwZXhmbWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTI3NDQsImV4cCI6MjA3MTI4ODc0NH0.SMkeC7WSZACXQBaT9cbxy3JfTi0bjHO97MLV_eaZYCI';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

console.log('🔍 Testing Supabase from component perspective...');

// Test increment (like the component does)
const testIncrement = async () => {
  try {
    console.log('Testing RPC increment...');
    const { data, error } = await supabase.rpc('increment_page_views', {
      page_name: 'home',
    });
    
    if (error) {
      console.log('❌ RPC Error:', error);
      throw error;
    }
    
    console.log('✅ RPC Success:', data);
    
    // Check if it returns the expected format
    if (data && Array.isArray(data) && data.length > 0 && typeof data[0].count === 'number') {
      console.log('✅ Data format correct, count:', data[0].count);
      return { count: data[0].count };
    } else {
      console.log('❌ Unexpected data format:', data);
      return null;
    }
    
  } catch (error) {
    console.log('❌ Exception:', error.message);
    throw error;
  }
};

testIncrement().catch(console.error);
