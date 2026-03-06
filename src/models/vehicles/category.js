import db from '../db.js';

const getAllCategories = async () => {
    const result = await db.query('SELECT * FROM categories ORDER BY name ASC');
    return result.rows;
};

const createCategory = async (name) => {
    return await db.query('INSERT INTO categories (name) VALUES ($1) RETURNING *', [name]);
};

const updateCategory = async (id, name) => {
    return await db.query('UPDATE categories SET name = $1 WHERE id = $2 RETURNING *', [name, id]);
};

const deleteCategory = async (id) => {
    // Note: In your SQL, vehicles use ON DELETE SET NULL for category_id, 
    // so deleting a category won't delete the cars.
    return await db.query('DELETE FROM categories WHERE id = $1', [id]);
};

export {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
}