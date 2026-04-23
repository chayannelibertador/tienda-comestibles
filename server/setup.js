import { pool } from './db.js';

const INITIAL_MOCK_PRODUCTS = [
    { name: 'Manzanas Rojas', price: 1200, category: 'Frutas', image: '🍎', description: 'Manzanas frescas por kilo', stock: 50 },
    { name: 'Pan de Masa Madre', price: 2500, category: 'Panadería', image: '🍞', description: 'Pan artesanal recién horneado', stock: 20 },
    { name: 'Leche Entera', price: 900, category: 'Lácteos', image: '🥛', description: 'Leche entera de litro', stock: 100 },
    { name: 'Cerveza IPA', price: 1800, category: 'Bebidas', image: '🍺', description: 'Cerveza artesanal IPA lata', stock: 40 },
    { name: 'Zanahorias', price: 800, category: 'Verduras', image: '🥕', description: 'Zanahorias por kilo', stock: 60 },
    { name: 'Queso Fresco', price: 4500, category: 'Lácteos', image: '🧀', description: 'Queso fresco por 500g', stock: 15 },
    { name: 'Jugo de Naranja', price: 1500, category: 'Bebidas', image: '🧃', description: 'Jugo natural exprimido', stock: 30 },
    { name: 'Croissants', price: 600, category: 'Panadería', image: '🥐', description: 'Medialunas de manteca', stock: 50 },
    { name: 'Papas', price: 600, category: 'Verduras', image: '🥔', description: 'Papas cepilladas por kilo', stock: 80 }
];

async function setup() {
    console.log('Starting database setup...');

    try {
        // Drop table if exists to start fresh (be careful with this in production!)
        // console.log('Dropping existing table if necessary...');
        // await pool.query('DROP TABLE IF EXISTS products;');

        console.log('Creating products table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                price INTEGER NOT NULL,
                category VARCHAR(255) NOT NULL,
                image VARCHAR(255),
                description TEXT,
                stock INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Products table created or already exists.');

        console.log('Checking if table is empty...');
        const result = await pool.query('SELECT COUNT(*) FROM products');

        if (parseInt(result.rows[0].count) === 0) {
            console.log('Table is empty. Inserting initial mock products...');
            for (const product of INITIAL_MOCK_PRODUCTS) {
                await pool.query(
                    'INSERT INTO products (name, price, category, image, description, stock) VALUES ($1, $2, $3, $4, $5, $6)',
                    [product.name, product.price, product.category, product.image, product.description, product.stock]
                );
            }
            console.log('Initial products inserted successfully.');
        } else {
            console.log(`Table already contains ${result.rows[0].count} records. Skipping initial insertion.`);
        }

    } catch (err) {
        console.error('Error during database setup:', err);
    } finally {
        await pool.end();
        console.log('Database connection closed.');
    }
}

setup();
