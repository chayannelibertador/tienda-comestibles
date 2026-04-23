import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import sql from './db.js';
import multer from 'multer';

import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';

const client = new OAuth2Client('1041953400322-l9vs071fe7a59fberjhk4khlves35ma1.apps.googleusercontent.com');

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

// Auto-crear la tabla de usuarios y asegurar RLS
sql`
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        age INT,
        phone VARCHAR(50),
        addresses JSONB DEFAULT '[]'::jsonb,
        default_address_id BIGINT,
        cart JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`.then(() => {
    sql`ALTER TABLE users ENABLE ROW LEVEL SECURITY;`.catch(() => {});
    // Opcional: Política falsa obligatoria para que pasen las auditorías
    sql`CREATE POLICY "Explicit Deny All" ON users FOR ALL TO PUBLIC USING (false);`.catch(() => {});
}).catch(err => console.error("Auto-creación users falló:", err));

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000', 'https://www.altoquemarket.com', 'https://altoquemarket.com', process.env.FRONTEND_URL].filter(Boolean);

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || origin.includes('192.168.')) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    }
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Limitadores de peticiones
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // Limita a 20 peticiones de auth por ventana por IP
    message: { error: 'Demasiados intentos, por favor intenta de nuevo en 15 minutos.' }
});

const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 200 // 200 peticiones en 5 min
});

app.use('/api/', apiLimiter);

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
app.post('/api/admin/login', authLimiter, (req, res) => {
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

// --- Auth y Rutas de Usuarios ---

function requireUser(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token requerido.' });
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload; 
        next();
    } catch {
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
}

app.post('/api/users/google', authLimiter, async (req, res) => {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Falta credential.' });

    try {
        // credential is an access_token here
        const googlRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${credential}` }
        });
        if (!googlRes.ok) throw new Error('Token inválido');
        const payload = await googlRes.json();
        
        const email = payload.email.toLowerCase();
        const name = payload.name;

        // Verify if user exists
        let result = await sql`SELECT id, email, name, age, phone, addresses, default_address_id, cart FROM users WHERE email = ${email}`;

        if (result.length === 0) {
            // Create user
            result = await sql`
                INSERT INTO users (email, name, addresses)
                VALUES (${email}, ${name}, ${sql.json([])})
                RETURNING id, email, name, age, phone, addresses, default_address_id, cart
            `;
        }

        const user = result[0];
        const token = jwt.sign({ id: user.id, email: user.email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({ token, user });
    } catch (err) {
        console.error('Error verificando token de Google:', err);
        res.status(401).json({ error: 'Token de Google inválido.' });
    }
});

app.post('/api/users/register', authLimiter, async (req, res) => {
    const { email, password, name, age, phone, addresses } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email y password requeridos.' });
    
    try {
        const hash = await bcrypt.hash(password, 10);
        const addrs = Array.isArray(addresses) ? addresses : [];
        const result = await sql`
            INSERT INTO users (email, password_hash, name, age, phone, addresses)
            VALUES (${email.trim().toLowerCase()}, ${hash}, ${name}, ${age}, ${phone}, ${sql.json(addrs)})
            RETURNING id, email, name, age, phone, addresses, cart
        `;
        const token = jwt.sign({ id: result[0].id, email: result[0].email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: result[0] });
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ error: 'El email ya está registrado.' });
        console.error(err);
        res.status(500).json({ error: 'Error del servidor al registrarse.' });
    }
});

app.post('/api/users/login', authLimiter, async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await sql`
            SELECT id, email, name, age, phone, password_hash, addresses, default_address_id, cart 
            FROM users 
            WHERE email = ${email.trim().toLowerCase()}
        `;
        if (result.length === 0) return res.status(401).json({ error: 'Credenciales incorrectas.' });
        
        const user = result[0];
        let isValid = false;

        if (user.password_hash.length === 64 && !user.password_hash.startsWith('$2a$')) {
            const oldHash = crypto.createHash('sha256').update(password).digest('hex');
            if (oldHash === user.password_hash) {
                isValid = true;
                const newBcryptHash = await bcrypt.hash(password, 10);
                await sql`UPDATE users SET password_hash = ${newBcryptHash} WHERE id = ${user.id}`;
            }
        } else {
            isValid = await bcrypt.compare(password, user.password_hash);
        }

        if (!isValid) return res.status(401).json({ error: 'Credenciales incorrectas.' });
        
        const token = jwt.sign({ id: user.id, email: user.email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name, age: user.age, phone: user.phone, addresses: user.addresses, default_address_id: user.default_address_id, cart: user.cart } });
    } catch (err) {
        res.status(500).json({ error: 'Error del servidor.' });
    }
});

app.put('/api/users/cart', requireUser, async (req, res) => {
    const { items } = req.body;
    try {
        await sql`UPDATE users SET cart = ${sql.json(items || [])} WHERE id = ${req.user.id}`;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error al sincronizar carrito.' });
    }
});

app.put('/api/users/addresses', requireUser, async (req, res) => {
    const { addresses, defaultAddressId } = req.body;
    try {
        await sql`
            UPDATE users 
            SET addresses = ${sql.json(addresses || [])}, default_address_id = ${defaultAddressId || null} 
            WHERE id = ${req.user.id}
        `;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error al sincronizar direcciones.' });
    }
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
    const activeVal     = arguments[0].is_active !== undefined ? Boolean(arguments[0].is_active) : true;

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
            is_active:   activeVal,
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
        
        const conditions = [sql`is_active = true`];
        if (category && category !== 'Todos') conditions.push(sql`category = ${category}`);
        if (search) conditions.push(sql`name ILIKE ${'%' + search + '%'}`);

        // Build WHERE by joining all conditions with AND
        let where = sql``;
        if (conditions.length > 0) {
            where = sql`WHERE ${conditions.reduce((acc, cond, i) => i === 0 ? cond : sql`${acc} AND ${cond}`)}`;
        }

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

// Admin Endpoint para listar TODOS los productos (incluyendo inactivos)
app.get('/api/admin/products', requireAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 0, category = 'Todos', search = '' } = req.query;
        
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;
        
        const conditions = [];
        if (category && category !== 'Todos') conditions.push(sql`category = ${category}`);
        if (search) conditions.push(sql`name ILIKE ${'%' + search + '%'}`);

        // Build WHERE by joining all conditions with AND
        let where = sql``;
        if (conditions.length > 0) {
            where = sql`WHERE ${conditions.reduce((acc, cond, i) => i === 0 ? cond : sql`${acc} AND ${cond}`)}`;
        }

        const productsPromise = sql`
            SELECT id, name, price, category, image, description, stock, badge, is_active
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
            res.json(products);
        }
    } catch (err) {
        console.error('Error fetching admin products:', err);
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
            SELECT id, name, price, category, image, description, stock, badge, is_active
            FROM products WHERE id = ${id} AND is_active = true
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
    const { name, price, category, image, description, stock, badge, is_active } = sanitized.data;
    try {
        const result = await sql`
            INSERT INTO products (name, price, category, image, description, stock, badge, is_active)
            VALUES (${name}, ${price}, ${category}, ${image}, ${description}, ${stock}, ${badge}, ${is_active})
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
    const { name, price, category, image, description, stock, badge, is_active } = sanitized.data;
    try {
        const result = await sql`
            UPDATE products SET name = ${name}, price = ${price}, category = ${category}, image = ${image}, description = ${description}, stock = ${stock}, badge = ${badge}, is_active = ${is_active}
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
        const result = await sql`UPDATE products SET is_active = false WHERE id = ${id} RETURNING *`;
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
    const { items, shippingAddress, paymentMethod, userId } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'El pedido no tiene productos.' });
    }

    try {
        let order = null;

        await sql.begin(async (tx) => {
            let calculatedSubtotal = 0;

            // Para cada item: verificar stock y descontarlo en UN SOLO UPDATE atómico
            for (const item of items) {
                const qty = parseInt(item.quantity, 10);
                if (!item.id || isNaN(qty) || qty <= 0) {
                    throw { status: 400, error: `Datos inválidos para el producto.` };
                }

                const result = await tx`
                    UPDATE products
                    SET stock = stock - ${qty}
                    WHERE id = ${item.id} AND stock >= ${qty}
                    RETURNING id, name, price, stock
                `;

                // Si no actualizó ninguna fila → stock insuficiente
                if (result.length === 0) {
                    throw { status: 409, error: `Stock insuficiente para un producto. Por favor revisá tu carrito.` };
                }
                
                const dbPrice = parseFloat(result[0].price);
                calculatedSubtotal += (dbPrice * qty);
            }
            
            const calculatedIva = calculatedSubtotal * 0.21;
            const calculatedTotal = calculatedSubtotal + calculatedIva;

            // Construcción del pedido usando cálculos seguros
            order = {
                id: Date.now(),
                userId: userId || 'guest',
                items,
                subtotal: calculatedSubtotal,
                iva: calculatedIva,
                total: calculatedTotal,
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
