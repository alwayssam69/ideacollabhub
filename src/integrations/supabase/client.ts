// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://bsctzgzvzxrnexzpyhaq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzY3R6Z3p2enhybmV4enB5aGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3ODYwMjIsImV4cCI6MjA2MDM2MjAyMn0.5qtQ4RkSB-RBltakOZZJ_lwnfA95ekPRQgnoaOh7e0I";

// Create and export the Supabase client
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY); 