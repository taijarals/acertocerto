/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize Supabase client targeting the "acertocerto" schema, using environment secrets with safe storage wrapper for iframe previews
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      db: { schema: 'acertocerto' },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? {
          getItem: (key) => {
            try { return localStorage.getItem(key); } catch (e) { return null; }
          },
          setItem: (key, value) => {
            try { localStorage.setItem(key, value); } catch (e) {}
          },
          removeItem: (key) => {
            try { localStorage.removeItem(key); } catch (e) {}
          }
        } : undefined
      }
    })
  : null;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabase);
};
