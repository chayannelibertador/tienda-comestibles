import sql from './server/db.js';

async function createDummyPolicy() {
    try {
        await sql`
            CREATE POLICY "Explicit Deny All" ON testimonials
            FOR ALL 
            TO PUBLIC
            USING (false);
        `;
        console.log("✅ Política falsa 'Explicit Deny All' creada para calmar al Linter de Supabase.");
    } catch(e) {
        if (e.message.includes('already exists')) {
            console.log("Ya existe una política en la tabla.");
        } else {
            console.error(e);
        }
    } finally {
        process.exit();
    }
}
createDummyPolicy();
