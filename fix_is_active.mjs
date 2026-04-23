import sql from './server/db.js';

async function fix() {
    try {
        // 1. Ver cuántos productos tienen is_active = NULL
        const nullCount = await sql`SELECT COUNT(*) FROM products WHERE is_active IS NULL`;
        console.log(`Productos con is_active = NULL: ${nullCount[0].count}`);

        // 2. Ver cuántos tienen is_active = false (desactivados manualmente)
        const falseCount = await sql`SELECT COUNT(*) FROM products WHERE is_active = false`;
        console.log(`Productos con is_active = FALSE (desactivados): ${falseCount[0].count}`);

        // 3. Activar todos los que tienen NULL
        const updated = await sql`
            UPDATE products 
            SET is_active = true 
            WHERE is_active IS NULL
            RETURNING id, name
        `;
        console.log(`\n✅ Se activaron ${updated.length} productos:`);
        updated.forEach(p => console.log(`   - [${p.id}] ${p.name}`));

        // 4. Verificación final
        const total = await sql`SELECT COUNT(*) FROM products WHERE is_active = true`;
        console.log(`\nTotal de productos activos ahora: ${total[0].count}`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

fix();
