import sql from './server/db.js';

async function fetchTables() {
    try {
        const rows = await sql`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
        `;
        console.log(JSON.stringify(rows, null, 2));
    } catch(e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
fetchTables();
