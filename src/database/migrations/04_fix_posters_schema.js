module.exports = {
    async up(pool) {
        await pool.query(`
            ALTER TABLE posters 
            ADD COLUMN IF NOT EXISTS description TEXT,
            ADD COLUMN IF NOT EXISTS imageUrl TEXT,
            ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'event';
        `);

        await pool.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'posters' AND column_name = 'image_url'
                ) THEN
                    ALTER TABLE posters ALTER COLUMN image_url DROP NOT NULL;
                    UPDATE posters SET imageurl = image_url WHERE imageurl IS NULL AND image_url IS NOT NULL;
                END IF;
            END $$;
        `);
    }
};
