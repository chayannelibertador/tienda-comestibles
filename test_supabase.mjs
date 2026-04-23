const SUPABASE_URL = "https://fwtuqnfpajkglwuvrwey.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3dHVxbmZwYWprZ2x3dXZyd2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NjU3ODEsImV4cCI6MjA4ODA0MTc4MX0.Si_y0QB9p6eak4L6zVQZozF0NveHG5F5zHSTQbw2lsM";

fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
    headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
})
.then(res => res.json())
.then(data => {
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
})
.catch(err => {
    console.error(err);
    process.exit(1);
});
