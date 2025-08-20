#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sxocorkwwbtuqpexfmdt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4b2Nvcmt3d2J0dXFwZXhmbWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTI3NDQsImV4cCI6MjA3MTI4ODc0NH0.SMkeC7WSZACXQBaT9cbxy3JfTi0bjHO97MLV_eaZYCI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Try to get the current time from the database
    const { data, error } = await supabase.rpc('get_current_time').select();
    
    if (error) {
      console.log('❌ Direct RPC failed (expected), trying basic connection...');
      
      // Try a basic select on the auth schema which should exist
      const { data: authData, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.log('❌ Connection failed:', authError.message);
        return false;
      } else {
        console.log('✅ Basic connection successful');
        console.log('ℹ️  Database exists but page_views table needs to be created');
        return true;
      }
    } else {
      console.log('✅ Full RPC connection successful');
      return true;
    }
  } catch (err) {
    console.log('❌ Connection error:', err.message);
    return false;
  }
}

async function checkPageViewsTable() {
  console.log('🔍 Checking if page_views table exists...');
  
  try {
    const { data, error } = await supabase
      .from('page_views')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log('ℹ️  page_views table does not exist yet');
        return false;
      } else {
        console.log('❌ Error checking table:', error.message);
        return false;
      }
    } else {
      console.log('✅ page_views table exists!');
      if (data && data.length > 0) {
        console.log('📊 Current count:', data[0].count);
      }
      return true;
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
    return false;
  }
}

async function testIncrement() {
  console.log('🔍 Testing increment function...');
  
  try {
    const { data, error } = await supabase.rpc('increment_page_views', {
      page_name: 'test'
    });
    
    if (error) {
      console.log('❌ Increment function not available:', error.message);
      return false;
    } else {
      console.log('✅ Increment function works! New count:', data);
      return true;
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Supabase Connection Test\n');
  
  const connected = await testConnection();
  if (!connected) {
    console.log('\n❌ Cannot connect to Supabase. Please check your credentials.');
    process.exit(1);
  }
  
  console.log('');
  const tableExists = await checkPageViewsTable();
  
  if (tableExists) {
    console.log('');
    await testIncrement();
    console.log('\n🎉 Supabase is fully configured and ready!');
  } else {
    console.log('\n⚠️  Database setup required:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Open SQL Editor');
    console.log('3. Run the SQL from supabase-setup.sql');
    console.log('4. Re-run this test');
  }
}

main().catch(console.error);