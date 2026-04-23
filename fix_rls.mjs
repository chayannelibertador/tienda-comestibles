import sql from './server/db.js';

async function fixRls() {
    try {
        await sql`ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;`;
        console.log('✅ RLS habilitado en: testimonials');
        
        await sql`ALTER TABLE products ENABLE ROW LEVEL SECURITY;`;
        console.log('✅ RLS habilitado en: products');
        
        await sql`ALTER TABLE failed_searches ENABLE ROW LEVEL SECURITY;`;
        console.log('✅ RLS habilitado en: failed_searches');

        console.log('Todas las tablas públicas han sido aseguradas.');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        process.exit(0);
    }
}

fixRls();
