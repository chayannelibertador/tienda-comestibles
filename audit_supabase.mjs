import sql from './server/db.js';

async function auditDatabase() {
    try {
        console.log("=== AUDITORÍA DE SEGURIDAD SUPABASE ===");

        // 1. Estado de RLS en todas las tablas
        console.log("\n1. Estado de RLS por tabla:");
        const tables = await sql`
            SELECT tablename, rowsecurity 
            FROM pg_tables 
            WHERE schemaname = 'public'
        `;
        console.table(tables);

        // 2. Políticas detalladas
        console.log("\n2. Políticas activas:");
        const policies = await sql`
            SELECT tablename, policyname, roles, cmd, qual, with_check 
            FROM pg_policies 
            WHERE schemaname = 'public'
        `;
        if (policies.length === 0) {
            console.log("No hay ninguna política configurada.");
        } else {
            console.log(JSON.stringify(policies, null, 2));
        }

    } catch(e) {
        console.error("Error auditando:", e.message);
    } finally {
        process.exit();
    }
}
auditDatabase();
