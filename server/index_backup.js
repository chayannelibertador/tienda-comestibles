import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import sql from './db.js';
import multer from 'multer';

import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

// Auto-crear la columna badge si no existe
sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS badge VARCHAR(50);`.catch(err => console.error("Auto-migración badge falló:", err));

// Auto-crear la tabla de testimonios
sql`
    CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        comment TEXT NOT NULL,
        rating INT DEFAULT 5,
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`.catch(err => console.error("Auto-creación testimonios falló:", err));

sql`ALTER TABLE testimonials ALTER COLUMN avatar TYPE TEXT;`.catch(err => console.error("Auto-migración testimonios avatar falló:", err));

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// --- Middleware de autenticación JWT ---
function requireAdmin(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null;

    if (!token) {
        return res.status(401).json({ error: 'Token requerido.' });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        if (payload.role !== 'admin') {
            return res.status(403).json({ error: 'Acceso denegado.' });
        }
        req.admin = payload;
        next();
    } catch {
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
}

// Ruta de login del administrador
app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    if (
        email === process.env.ADMIN_EMAIL &&
        password === process.env.ADMIN_PASSWORD
    ) {
        const token = jwt.sign(
            { email, role: 'admin' },
            JWT_SECRET,
            { expiresIn: '8h' }
        );
        return res.json({ token });
    }
    return res.status(401).json({ error: 'Credenciales incorrectas.' });
});
// ---------------------------------------


// --- Sanitización y validación de productos ---
function stripTags(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/<[^>]*>/g, '').trim();
}

function sanitizeProduct({ name, price, category, image, description, stock, badge }) {
    const errors = [];

    // Validar y limpiar strings
    const cleanName     = stripTags(name);
    const cleanCategory = stripTags(category);
    const cleanImage    = stripTags(image);
    const cleanDesc     = stripTags(description);
    const cleanBadge    = stripTags(badge);

    if (!cleanName || cleanName.length > 200)
        errors.push('name: requerido y máximo 200 caracteres.');
    if (!cleanCategory || cleanCategory.length > 100)
        errors.push('category: requerido y máximo 100 caracteres.');

    // Validar precio
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0)
        errors.push('price: debe ser un número positivo.');

    // Validar stock
    const parsedStock = parseInt(stock, 10);
    if (isNaN(parsedStock) || parsedStock < 0)
        errors.push('stock: debe ser un número entero no negativo.');

    if (errors.length > 0) return { valid: false, errors };

    return {
        valid: true,
        data: {
            name:        cleanName,
            price:       parsedPrice,
            category:    cleanCategory,
            image:       cleanImage || null,
            description: cleanDesc  || null,
            stock:       parsedStock,
            badge:       cleanBadge || null,
        },
    };
}
// -------------------------------------------------

// Obtener productos (con paginación, búsqueda, y filtro por categoría)
app.get('/api/products', async (req, res) => {
    try {
        const { page = 1, limit = 0, category = 'Todos', search = '' } = req.query;
        
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;
        
        const conditions = [];
        if (category && category !== 'Todos') conditions.push(sql`category = ${category}`);
        if (search) conditions.push(sql`name ILIKE ${'%' + search + '%'}`);

        const where = conditions.length > 0
            ? sql`WHERE ${conditions[0]} ${conditions[1] ? sql`AND ${conditions[1]}` : sql``}`
            : sql``;

        const productsPromise = sql`
            SELECT id, name, price, category, image, description, stock, badge
            FROM products
            ${where}
            ORDER BY id ASC
            ${limitNum > 0 ? sql`LIMIT ${limitNum} OFFSET ${offset}` : sql``}
        `;

        const totalPromise = sql`
            SELECT COUNT(*) FROM products ${where}
        `;

        const [products, [{ count }]] = await Promise.all([productsPromise, totalPromise]);

        if (limitNum > 0) {
            res.json({
                data: products,
                total: parseInt(count),
                page: pageNum,
                totalPages: Math.ceil(parseInt(count) / limitNum)
            });
        } else {
            // Compatibilidad hacia atrás para componentes sin límite configurado
            res.json(products);
        }
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint de Búsquedas Fallidas
app.post('/api/failed-searches', async (req, res) => {
    const { term } = req.body;
    if (!term || typeof term !== 'string' || term.trim() === '') {
        return res.status(400).json({ error: 'Término inválido' });
    }
    const cleanTerm = term.trim().toLowerCase();

    try {
        await sql`
            CREATE TABLE IF NOT EXISTS failed_searches (
                id SERIAL PRIMARY KEY,
                term VARCHAR(255) UNIQUE NOT NULL,
                search_count INT DEFAULT 1,
                last_searched TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        await sql`
            INSERT INTO failed_searches (term, search_count)
            VALUES (${cleanTerm}, 1)
            ON CONFLICT (term) DO UPDATE 
            SET search_count = failed_searches.search_count + 1,
                last_searched = CURRENT_TIMESTAMP
        `;
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Error logging failed search:', err);
        res.status(500).json({ error: 'Error interno' });
    }
});

// Admin Endpoint para Búsquedas Fallidas
app.get('/api/admin/failed-searches', requireAdmin, async (req, res) => {
    try {
        const results = await sql`
            SELECT id, term, search_count, last_searched
            FROM failed_searches
            ORDER BY search_count DESC, last_searched DESC
            LIMIT 50
        `;
        res.json(results);
    } catch (err) {
        console.error('Error fetching failed searches:', err);
        res.status(500).json({ error: 'Error interno' });
    }
});

// ================= TESTIMONIALS ENDPOINTS =================
app.get('/api/testimonials', async (req, res) => {
    try {
        const data = await sql`SELECT * FROM testimonials ORDER BY created_at DESC`;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching testimonials' });
    }
});

app.post('/api/testimonials', requireAdmin, async (req, res) => {
    const { name, comment, rating, avatar } = req.body;
    try {
        const result = await sql`
            INSERT INTO testimonials (name, comment, rating, avatar) 
            VALUES (${name || 'Anónimo'}, ${comment || ''}, ${rating || 5}, ${avatar || null}) 
            RETURNING *
        `;
        res.status(201).json(result[0]);
    } catch (err) {
        console.error('Error creating testimonial:', err);
        res.status(500).json({ error: 'Error creating testimonial: ' + err.message });
    }
});

app.put('/api/testimonials/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, comment, rating, avatar } = req.body;
    try {
        const result = await sql`
            UPDATE testimonials 
            SET name = ${name}, comment = ${comment}, rating = ${rating}, avatar = ${avatar}
            WHERE id = ${id} RETURNING *
        `;
        if (result.length === 0) return res.status(404).json({ error: 'Testimonio no encontrado' });
        res.json(result[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error updating testimonial' });
    }
});

app.delete('/api/testimonials/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await sql`DELETE FROM testimonials WHERE id = ${id}`;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting testimonial' });
    }
});

// Obtener un producto por ID (campos públicos)
app.get('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql`
            SELECT id, name, price, category, image, description, stock, badge
            FROM products WHERE id = ${id}
        `;
        if (result.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(result[0]);
    } catch (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Reporte de márgenes (solo admin)
app.get('/api/admin/products/margins', requireAdmin, async (req, res) => {
    try {
        const products = await sql`
            SELECT id, name, price, cost, iva_rate,
                   ROUND(((price - COALESCE(cost,0)) / NULLIF(price,0)) * 100, 2) AS margin_pct
            FROM products ORDER BY margin_pct ASC
        `;
        res.json(products);
    } catch (err) {
        console.error('Error fetching margins:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint para optimizar y subir imágenes
app.post('/api/admin/upload', requireAdmin, upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se recibió ninguna imagen.' });
    }

    try {
        const optimizedBuffer = await sharp(req.file.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .webp({ quality: 80 })
            .toBuffer();

        const fileName = `product-${Date.now()}-${Math.floor(Math.random() * 1000)}.webp`;

        const { data, error } = await supabase.storage
            .from('productos')
            .upload(fileName, optimizedBuffer, {
                contentType: 'image/webp',
                upsert: true
            });

        if (error) {
            console.error('Supabase upload error:', error);
            throw new Error('Error al subir a Supabase');
        }

        const publicUrl = `${supabaseUrl}/storage/v1/object/public/productos/${fileName}`;
        res.status(200).json({ url: publicUrl });

    } catch (err) {
        console.error('Error procesando imagen con sharp:', err);
        res.status(500).json({ error: 'Fallo al optimizar o subir la imagen al bucket.' });
    }
});

// Crear un nuevo producto
app.post('/api/products', requireAdmin, async (req, res) => {
    const sanitized = sanitizeProduct(req.body);
    if (!sanitized.valid) {
        return res.status(400).json({ errors: sanitized.errors });
    }
    const { name, price, category, image, description, stock, badge } = sanitized.data;
    try {
        const result = await sql`
            INSERT INTO products (name, price, category, image, description, stock, badge)
            VALUES (${name}, ${price}, ${category}, ${image}, ${description}, ${stock}, ${badge})
            RETURNING *
        `;
        res.status(201).json(result[0]);
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Actualizar un producto existente
app.put('/api/products/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    const sanitized = sanitizeProduct(req.body);
    if (!sanitized.valid) {
        return res.status(400).json({ errors: sanitized.errors });
    }
    const { name, price, category, image, description, stock, badge } = sanitized.data;
    try {
        const result = await sql`
            UPDATE products SET name = ${name}, price = ${price}, category = ${category}, image = ${image}, description = ${description}, stock = ${stock}, badge = ${badge}
            WHERE id = ${id} RETURNING *
        `;
        if (result.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(result[0]);
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Eliminar un producto
app.delete('/api/products/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await sql`DELETE FROM products WHERE id = ${id} RETURNING *`;
        if (result.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Confirmar pedido con descuento de stock atómico
app.post('/api/orders', async (req, res) => {
    const { items, shippingAddress, paymentMethod, subtotal, iva, total, userId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'El pedido no tiene productos.' });
    }

    try {
        let order = null;

        await sql.begin(async (tx) => {
            // Para cada item: verificar stock y descontarlo en UN SOLO UPDATE atómico
            for (const item of items) {
                const qty = parseInt(item.quantity, 10);
                if (!item.id || isNaN(qty) || qty <= 0) {
                    throw { status: 400, error: `Datos inválidos para el producto "${item.name}".` };
                }

                const result = await tx`
                    UPDATE products
                    SET stock = stock - ${qty}
                    WHERE id = ${item.id} AND stock >= ${qty}
                    RETURNING id, name, stock
                `;

                // Si no actualizó ninguna fila → stock insuficiente
                if (result.length === 0) {
                    throw { status: 409, error: `Stock insuficiente para "${item.name}". Por favor revisá tu carrito.` };
                }
            }

            // Construcción del pedido (sin tabla orders por ahora, devolvemos los datos)
            order = {
                id: Date.now(),
                userId: userId || 'guest',
                items,
                subtotal,
                iva,
                total,
                shippingAddress,
                paymentMethod,
                paymentStatus: paymentMethod === 'tarjeta' ? 'paid' : 'pending',
                status: 'pendiente',
                createdAt: new Date().toISOString(),
                estimatedDelivery: new Date(
                    Date.now() + (3 + Math.floor(Math.random() * 3)) * 24 * 60 * 60 * 1000
                ).toISOString(),
            };
        });

        res.status(201).json(order);
    } catch (err) {
        // Errores de stock o validación lanzados dentro de la transacción
        if (err.status) {
            return res.status(err.status).json({ error: err.error });
        }
        console.error('Error creating order:', err);
        res.status(500).json({ error: 'Error interno al procesar el pedido.' });
    }
});

app.listen(port, () => {
    console.log(`Backend server listening on port ${port}`);
});
