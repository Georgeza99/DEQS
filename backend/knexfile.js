// Knex configuration, used by the knex CLI (npm run migrate) and by db.js.
try {
  process.loadEnvFile('./.env');
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

module.exports = {
  client: "pg",
  connection: process.env.DATABASE_URL || "postgresql://postgres:YOUR_PASSWORD@localhost:5432/YOUR_DB_NAME",
  migrations: { directory: "./migrations" },
};