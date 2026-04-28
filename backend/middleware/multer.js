const multer = require('multer');

// Memory storage keeps the file in RAM temporarily for the AI to read [cite: 145-147]
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Max 10MB [cite: 151]
});

module.exports = upload;