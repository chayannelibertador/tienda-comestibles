import sql from './server/db.js';

async function checkPolicy() {
    try {
        const rows = await sql`
            SELECT policyname, qual, with_check 
            FROM pg_policies 
            WHERE tablename = 'products' AND policyname = 'admin_full_access'
        `;
        console.log("POLICIES INFO:");
        console.log(JSON.stringify(rows, null, 2));
    } catch(e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
checkPolicy();
