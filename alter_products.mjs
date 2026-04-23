import sql from './server/db.js';

sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;`
  .then(() => {
    console.log('Altered table products successfully (is_active)');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
