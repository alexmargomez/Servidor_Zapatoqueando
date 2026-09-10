module.exports = {
    async up(pool) {
        await pool.query(`
            ALTER TABLE places 
            ADD COLUMN IF NOT EXISTS description TEXT;
        `);
    }
};
