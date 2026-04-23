import sql from './db.js';

async function run() {
    try {
        await sql`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);`;
        console.log('Index created successfully');
    } catch (e) {
        console.error('Failed to create index:', e);
    } finally {
        process.exit(0);
    }
}
run();
