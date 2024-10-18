var bcrypt = require('bcryptjs');

module.exports = {
    encrypt: function (value) {
        return bcrypt.hashSync(value, '$2y$12$h5NV4RlbSRgfFM4IUGoQeuEJyk45OGzEuiajncrmbSMFlftUe4r3C ') //tercespot
    }
}