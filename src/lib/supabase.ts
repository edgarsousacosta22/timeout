import { createClient } from '@supabase/supabase-js';

// These should be replaced with actual environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aylsqoaxdvfbpmwsffbj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5bHNxb2F4ZHZmYnBtd3NmZmJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNDA0MjAsImV4cCI6MjA2NDgxNjQyMH0.T9Qa9pOX_DqfNSAOJTJTseYn7-1UrQDWwC7mp-blixI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
