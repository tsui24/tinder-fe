import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jgpbxuttuorkjaajguyg.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpncGJ4dXR0dW9ya2phYWpndXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NDYwODEsImV4cCI6MjA3NjAyMjA4MX0.fhqMIQlFv6c0ETpgCIrfv7At_lhfmTf5jzuLzO0jN4k";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
