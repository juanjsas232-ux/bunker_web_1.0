
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'bunker_supabase_url';
const STORAGE_KEY_ANON = 'bunker_supabase_anon_key';

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  const env = (import.meta as any).env || {};

  const envUrl = env.VITE_SUPABASE_URL || '';
  const envKey = env.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl =
    typeof window !== 'undefined'
      ? localStorage.getItem(STORAGE_KEY_URL) || ''
      : '';

  const storedKey =
    typeof window !== 'undefined'
      ? localStorage.getItem(STORAGE_KEY_ANON) || ''
      : '';

  return {
    url: (storedUrl || envUrl).trim(),
    anonKey: (storedKey || envKey).trim(),
  };
}

let supabaseInstance: SupabaseClient | null = null;
let currentUrl = '';
let currentKey = '';

export function saveSupabaseCredentials(url: string, anonKey: string) {
  if (typeof window === 'undefined') return;

  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();

  if (cleanUrl) {
    localStorage.setItem(STORAGE_KEY_URL, cleanUrl);
  } else {
    localStorage.removeItem(STORAGE_KEY_URL);
  }

  if (cleanKey) {
    localStorage.setItem(STORAGE_KEY_ANON, cleanKey);
  } else {
    localStorage.removeItem(STORAGE_KEY_ANON);
  }

  supabaseInstance = null;
  currentUrl = '';
  currentKey = '';
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();

  if (!url || !anonKey) return null;

  if (
    !supabaseInstance ||
    currentUrl !== url ||
    currentKey !== anonKey
  ) {
    try {
      supabaseInstance = createClient(url, anonKey);
      currentUrl = url;
      currentKey = anonKey;
    } catch (error) {
      console.warn('Error inicializando cliente de Supabase:', error);
      supabaseInstance = null;
      currentUrl = '';
      currentKey = '';
      return null;
    }
  }

  return supabaseInstance;
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey);
}
