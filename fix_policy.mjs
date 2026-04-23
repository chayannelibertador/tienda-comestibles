import sql from './server/db.js';

async function updatePolicy() {
    try {
        await sql`DROP POLICY IF EXISTS admin_full_access ON products;`;
        console.log("✅ Política antigua borrada.");

        await sql`
            CREATE POLICY admin_full_access ON products
            FOR ALL
            USING ( ((select auth.jwt()) ->> 'email'::text) = 'chayannelibertador@gmail.com' )
            WITH CHECK ( ((select auth.jwt()) ->> 'email'::text) = 'chayannelibertador@gmail.com' );
        `;
        console.log("✅ Nueva política optimizada creada con éxito.");

    } catch(e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
updatePolicy();
