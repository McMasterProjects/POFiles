import { createClient } from '@supabase/supabase-js';
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env');
  process.exit(1);
}
const sb = createClient(url, key);
(async () => {
  try {
    const { data, error } = await sb.from('po.conversions').select('id').limit(1);
    if (error) console.error('Error:', error);
    else console.log('OK, example query returned:', data);
  } catch (e) {
    console.error('Exception:', e);
  }
  process.exit(0);
})();
