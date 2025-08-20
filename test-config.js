const config = {
  supabase: {
    url: "https://sxocorkwwbtuqpexfmdt.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4b2Nvcmt3d2J0dXFwZXhmbWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTI3NDQsImV4cCI6MjA3MTI4ODc0NH0.SMkeC7WSZACXQBaT9cbxy3JfTi0bjHO97MLV_eaZYCI",
    enabled: !!(("https://sxocorkwwbtuqpexfmdt.supabase.co") && ("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4b2Nvcmt3d2J0dXFwZXhmbWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTI3NDQsImV4cCI6MjA3MTI4ODc0NH0.SMkeC7WSZACXQBaT9cbxy3JfTi0bjHO97MLV_eaZYCI"))
  },
  features: {
    useSupabase: !!(("https://sxocorkwwbtuqpexfmdt.supabase.co") && ("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4b2Nvcmt3d2J0dXFwZXhmbWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MTI3NDQsImV4cCI6MjA3MTI4ODc0NH0.SMkeC7WSZACXQBaT9cbxy3JfTi0bjHO97MLV_eaZYCI"))
  }
};

console.log("Supabase configuration test:");
console.log("URL:", config.supabase.url);
console.log("AnonKey length:", config.supabase.anonKey.length);
console.log("Enabled:", config.supabase.enabled);
console.log("UseSupabase:", config.features.useSupabase);
console.log("Both strings truthy:", !!(config.supabase.url && config.supabase.anonKey));
