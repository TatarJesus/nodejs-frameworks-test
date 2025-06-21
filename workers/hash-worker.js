const crypto = require('crypto');

module.exports = () => {
    let hash = '';
    for (let i = 0; i < 10000; i++) {
        hash = crypto.createHash('sha256').update(`data-${i}`).digest('hex');
    }
    return hash;
};

