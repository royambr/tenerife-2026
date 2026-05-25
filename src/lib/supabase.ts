import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://owzjaocsrsbbrgzatpln.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93emphb2NzcnNiYnJnemF0cGxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MTU2MzgsImV4cCI6MjA5NTI5MTYzOH0.gneWQA5DCxqi4QCjyIKotJ6EBosTBTvOAKsh5OCY-wk'
);
