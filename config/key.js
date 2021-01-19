if (process.env.ENVIRONMENT === 'production') {
    module.exports = require('./prod');
  } else {
    module.exports = require('./dev');
  }