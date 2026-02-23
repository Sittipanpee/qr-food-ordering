/**
 * API Wrapper
 * Switch between mock API and Supabase API based on environment
 */

// Import Supabase API (real database)
import { supabaseAPI } from './supabase/api';

// Import Mock API (in-memory, for local development without database)
// import { api as mockAPI } from './mock-api';

// Use Supabase API by default
export const api = supabaseAPI;

// To switch back to mock API for testing, uncomment above and use:
// export const api = mockAPI;
