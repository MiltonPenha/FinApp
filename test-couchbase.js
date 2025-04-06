const { connect } = require('couchbase');

async function test() {
  const cluster = await connect('couchbase://cb-server', {
    username: 'Administrator',
    password: 'password'
  });
  console.log('Conectado com sucesso!');
}

test().catch(console.error);