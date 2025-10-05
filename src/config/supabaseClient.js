import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://txbkcfosweurilljggld.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4YmtjZm9zd2V1cmlsbGpnZ2xkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwNjUxMzgsImV4cCI6MjA3NDY0MTEzOH0.QCDl0VLRo0VjeZoz8btaXYMcefzpXF94Zow7xPxKDeM'; // Thay bằng anon key từ dashboard

export const supabase = createClient(supabaseUrl, supabaseAnonKey);