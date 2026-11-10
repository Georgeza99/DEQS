// loan is in JOD with 3 decimals (1 JOD = 1000 fils). DECIMAL is exact, unlike float.
// With the pg driver it is returned as a string such as "15.000", so keep it a string.
// "user" is a reserved word in PostgreSQL. Knex quotes it automatically, but raw SQL must write "user".
exports.up = (knex) =>
  knex.schema.createTable("customers", (table) => {
    table.increments("id");
    table.string("user", 160).notNullable();
    table.decimal("loan", 12, 3).notNullable().defaultTo(0);
    table.string("phone_number", 20);
  });

exports.down = (knex) => knex.schema.dropTable("customers");
