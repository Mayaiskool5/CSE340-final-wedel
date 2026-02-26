import db from './db.js';
import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Sets up the database by running the seed.sql file if needed.
 * Checks if faculty table has data - if not, runs a full re-seed.
 */
const setupDatabase = async () => {
    /**
     * Check if faculty table has any rows and wrap in try-catch to handle cases
     * where table doesn't exist yet.
     */
    let hasData = false;
    try {
        const result = await db.query(
            "SELECT EXISTS (SELECT 1 FROM faculty LIMIT 1) as has_data"
        );
        hasData = result.rows[0]?.has_data || false;
    } catch (error) {
        console.error('Error checking vehicles table existence:', error);
        hasData = false;
    }
    
    if (hasData) {
        console.log('Database already seeded');
        return true;
    }

    // No vehicles found - run full root.sql to create tables
    console.log('Root database...');
    const seedPath = join(__dirname, 'sql', 'root.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');
    try {
        await db.query(seedSQL);
    } catch (error) {
        console.error('Error running root.sql:', error);
        throw error;
    }

    console.log('Database seeded successfully');
    return true;
};

/**
 * Tests the database connection by executing a simple query.
 */
const testConnection = async () => {
    const result = await db.query('SELECT NOW() as current_time');
    console.log('Database connection successful:', result.rows[0].current_time);
    return true;
};

export { setupDatabase, testConnection };