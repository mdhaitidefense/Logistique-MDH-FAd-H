import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ypcbqtaqphqtpxcpuxwn.supabase.co';
const supabaseAnonKey = 'sb_publishable_X1xz9cBc6S3akJe44R4PwQ_gSKst19l';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
