import sql from './server/db.js';

sql`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;`
  .then(() => {
    console.log('Altered table users successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
