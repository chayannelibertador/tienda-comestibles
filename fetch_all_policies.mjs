import sql from './server/db.js';

async function fetchPolicies() {
    try {
        const rows = await sql`
            SELECT schemaname, tablename, policyname, qual, with_check 
            FROM pg_policies 
            WHERE schemaname = 'public'
        `;
        console.log(JSON.stringify(rows, null, 2));
    } catch(e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
fetchPolicies();
