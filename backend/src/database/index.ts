// src/database/index.ts — Database access entry point
export { supabase } from '../config/supabase';
export * as userQueries from './queries/users';
export * as contentQueries from './queries/content';
export * as chatQueries from './queries/chats';
