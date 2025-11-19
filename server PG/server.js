// server.js
import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to PostgreSQL:', res.rows[0]);
    }
});

// --- API endpoints will go here ---

// GET all assets
app.get('/assets', async (req, res) => {
    try {
        const query = `
            SELECT a.id, a.asset_code, a.asset_name, a.model, a.fa_ledger, a.date_of_purchase, a.cost_of_asset, a.useful_life, a.number_marked, a.quantity, a.assigned_to, a.location, a.closing_stock_rs, a.status, a.remarks, a.category_id, c.name as category
            FROM assets a
            LEFT JOIN categories c ON a.category_id = c.id
            ORDER BY a.asset_name;
        `;
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- Categories API ---

// GET all categories
app.get('/categories', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT id, name FROM categories ORDER BY name');
        res.json(rows);
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST a new category
app.post('/categories', async (req, res) => {
    const { name, description } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Category name is required' });
    }
    try {
        const { rows } = await pool.query('INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *', [name, description || null]);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE a category by ID
app.delete('/categories/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // The ON DELETE SET NULL constraint on the assets table will automatically handle updating associated assets.
        const deleteOp = await pool.query('DELETE FROM categories WHERE id = $1', [id]);
        if (deleteOp.rowCount === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(204).send(); // No Content
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- Assets API ---

// GET a single asset by ID
app.get('/assets/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await pool.query('SELECT * FROM assets WHERE id = $1', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Asset not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST a new asset
app.post('/assets', async (req, res) => {
    const { asset_code, asset_name, model, fa_ledger, date_of_purchase, cost_of_asset, useful_life, number_marked, quantity, assigned_to, location, closing_stock_rs, status, remarks, category_id } = req.body;
    try {
        const query = `
            INSERT INTO assets (asset_code, asset_name, model, fa_ledger, date_of_purchase, cost_of_asset, useful_life, number_marked, quantity, assigned_to, location, closing_stock_rs, status, remarks, category_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *;
        `;
        const values = [asset_code, asset_name, model || null, fa_ledger || null, date_of_purchase || null, cost_of_asset, useful_life || null, number_marked || null, quantity, assigned_to || null, location || null, closing_stock_rs, status, remarks || null, category_id];
        const { rows } = await pool.query(query, values);
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
});

// PUT (update) an asset by ID
app.put('/assets/:id', async (req, res) => {
    const { id } = req.params;
    const { asset_code, asset_name, model, fa_ledger, date_of_purchase, cost_of_asset, useful_life, number_marked, quantity, assigned_to, location, closing_stock_rs, status, remarks, category_id } = req.body;
    try {
        const query = `
            UPDATE assets
            SET asset_code = $1, asset_name = $2, model = $3, fa_ledger = $4, date_of_purchase = $5, cost_of_asset = $6, useful_life = $7, number_marked = $8, quantity = $9, assigned_to = $10, location = $11, closing_stock_rs = $12, status = $13, remarks = $14, category_id = $15
            WHERE id = $16
            RETURNING *;
        `;
        const values = [asset_code, asset_name, model || null, fa_ledger || null, date_of_purchase || null, cost_of_asset, useful_life || null, number_marked || null, quantity, assigned_to || null, location || null, closing_stock_rs, status, remarks || null, category_id, id];
        const { rows } = await pool.query(query, values);
        res.json(rows[0]);
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE an asset by ID
app.delete('/assets/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deleteOp = await pool.query('DELETE FROM assets WHERE id = $1', [id]);
        if (deleteOp.rowCount === 0) {
            return res.status(404).json({ error: 'Asset not found' });
        }
        res.status(204).send(); // No Content
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
