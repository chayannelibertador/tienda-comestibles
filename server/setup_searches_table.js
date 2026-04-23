import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL, { prepare: false });

async function setup() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS failed_searches (
                id SERIAL PRIMARY KEY,
                term VARCHAR(255) UNIQUE NOT NULL,
                search_count INT DEFAULT 1,
                last_searched TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        console.log("Table failed_searches created successfully.");
    } catch(err) {
        console.error("Error creating table:", err);
    } finally {
        process.exit(0);
    }
}
setup();
