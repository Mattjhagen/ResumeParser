const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be defined');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function saveUserDomain(email, domainType, domainValue) {
  const { data, error: checkError } = await supabase
    .from('user_domains')
    .select('*')
    .eq('user_email', email)
    .eq('domain_value', domainValue)
    .maybeSingle();

  if (checkError) return console.error('❌ Error checking domain:', checkError.message);
  if (data) return console.log(`⚠️ Domain already exists for ${email}: ${domainValue}`);

  const { error: insertError } = await supabase
    .from('user_domains')
    .insert([{ user_email: email, domain_type: domainType, domain_value: domainValue }]);

  if (insertError) {
    console.error('❌ Failed to insert domain:', insertError.message);
  } else {
    console.log(`✅ Domain saved: ${domainValue} (${domainType}) for ${email}`);
  }
}

async function getDomainsForUser(email) {
  const { data, error } = await supabase
    .from('user_domains')
    .select('domain_type, domain_value')
    .eq('user_email', email);

  if (error) {
    console.error('❌ Failed to fetch domains:', error.message);
    return [];
  }

  return data;
}

module.exports = {
  saveUserDomain,
  getDomainsForUser
};
