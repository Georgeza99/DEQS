// Test User
exports.up = async (knex) => {
  await knex('customers').insert({
    user: 'test_user',
    loan: 10,
    phone_number: '0790000000'
  });
};

//del Test User 
exports.down = async (knex) => {
  await knex('customers')
    .where({ user: 'test_user' })
    .del();
};