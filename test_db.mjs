import sql from './server/db.js';
async function test() {
    try {
        const rows = await sql`SELECT * FROM products LIMIT 2`;
        console.log(JSON.stringify(rows, null, 2));
    } catch(err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
test();
