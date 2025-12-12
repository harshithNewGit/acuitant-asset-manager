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
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'asset_manager',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '5432', 10),
});

// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to PostgreSQL:', res.rows[0]);
    }
});

// GET all assets
app.get('/assets', async (req, res) => {
    try {
        const query = `
            SELECT
                a.id,
                a.asset_code,
                a.asset_name,
                a.model,
                a.fa_ledger,
                a.date_of_purchase,
                a.cost_of_asset,
                a.useful_life,
                a.number_marked,
                a.quantity,
                a.assigned_to,
                a.location,
                a.closing_stock_rs,
                a.status,
                a.remarks,
                a.category_id,
                a.is_subscription,
                a.subscription_vendor,
                a.subscription_renewal_date,
                a.subscription_billing_cycle,
                a.subscription_url,
                c.name as category
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
    const {
        asset_code,
        asset_name,
        model,
        fa_ledger,
        date_of_purchase,
        cost_of_asset,
        useful_life,
        number_marked,
        quantity,
        assigned_to,
        location,
        closing_stock_rs,
        status,
        remarks,
        category_id,
        is_subscription,
        subscription_vendor,
        subscription_renewal_date,
        subscription_billing_cycle,
        subscription_url,
    } = req.body;

    try {
        const query = `
            INSERT INTO assets (
                asset_code,
                asset_name,
                model,
                fa_ledger,
                date_of_purchase,
                cost_of_asset,
                useful_life,
                number_marked,
                quantity,
                assigned_to,
                location,
                closing_stock_rs,
                status,
                remarks,
                category_id,
                is_subscription,
                subscription_vendor,
                subscription_renewal_date,
                subscription_billing_cycle,
                subscription_url
            )
            VALUES (
                $1, $2, $3, $4, $5,
                $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15,
                $16, $17, $18, $19, $20
            )
            RETURNING *;
        `;

        const values = [
            asset_code,
            asset_name,
            model || null,
            fa_ledger || null,
            date_of_purchase || null,
            cost_of_asset,
            useful_life || null,
            number_marked || null,
            quantity ?? null,
            assigned_to || null,
            location || null,
            closing_stock_rs,
            status,
            remarks || null,
            category_id,
            is_subscription ?? false,
            subscription_vendor || null,
            subscription_renewal_date || null,
            subscription_billing_cycle || null,
            subscription_url || null,
        ];

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
    const {
        asset_code,
        asset_name,
        model,
        fa_ledger,
        date_of_purchase,
        cost_of_asset,
        useful_life,
        number_marked,
        quantity,
        assigned_to,
        location,
        closing_stock_rs,
        status,
        remarks,
        category_id,
        is_subscription,
        subscription_vendor,
        subscription_renewal_date,
        subscription_billing_cycle,
        subscription_url,
    } = req.body;

    try {
        const query = `
            UPDATE assets
            SET
                asset_code = $1,
                asset_name = $2,
                model = $3,
                fa_ledger = $4,
                date_of_purchase = $5,
                cost_of_asset = $6,
                useful_life = $7,
                number_marked = $8,
                quantity = $9,
                assigned_to = $10,
                location = $11,
                closing_stock_rs = $12,
                status = $13,
                remarks = $14,
                category_id = $15,
                is_subscription = $16,
                subscription_vendor = $17,
                subscription_renewal_date = $18,
                subscription_billing_cycle = $19,
                subscription_url = $20
            WHERE id = $21
            RETURNING *;
        `;

        const values = [
            asset_code,
            asset_name,
            model || null,
            fa_ledger || null,
            date_of_purchase || null,
            cost_of_asset,
            useful_life || null,
            number_marked || null,
            quantity ?? null,
            assigned_to || null,
            location || null,
            closing_stock_rs,
            status,
            remarks || null,
            category_id,
            is_subscription ?? false,
            subscription_vendor || null,
            subscription_renewal_date || null,
            subscription_billing_cycle || null,
            subscription_url || null,
            id,
        ];

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

// --- Todos API ---

// GET all todos
app.get('/todos', async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT id, text, done, note FROM todos ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (err) {
        console.error('Error fetching todos', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST a new todo
app.post('/todos', async (req, res) => {
    const { text, note } = req.body;

    if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Todo text is required' });
    }

    try {
        const { rows } = await pool.query(
            'INSERT INTO todos (text, note) VALUES ($1, $2) RETURNING id, text, done, note',
            [text.trim(), note ?? null]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Error creating todo', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// PATCH (update) a todo's done status and note
app.patch('/todos/:id', async (req, res) => {
    const { id } = req.params;
    const { done, note } = req.body;

    const todoId = Number(id);
    if (!Number.isInteger(todoId)) {
        return res.status(400).json({ error: 'Invalid todo id' });
    }

    try {
        const { rows } = await pool.query(
            'UPDATE todos SET done = $1, note = $2 WHERE id = $3 RETURNING id, text, done, note',
            [!!done, note ?? null, todoId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Error updating todo', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// DELETE a todo by ID
app.delete('/todos/:id', async (req, res) => {
    const { id } = req.params;

    const todoId = Number(id);
    if (!Number.isInteger(todoId)) {
        return res.status(400).json({ error: 'Invalid todo id' });
    }

    try {
        const deleteOp = await pool.query('DELETE FROM todos WHERE id = $1', [todoId]);
        if (deleteOp.rowCount === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.status(204).send();
    } catch (err) {
        console.error('Error deleting todo', err.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
