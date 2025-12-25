/**
 * Encryption & Hashing Utilities
 * Provides encryption and hashing functions
 */

const crypto = require('crypto');

/**
 * SHA256 hash
 * @param {string} data - Data to hash
 * @returns {string} Hash digest
 */
function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * SHA1 hash
 * @param {string} data - Data to hash
 * @returns {string} Hash digest
 */
function sha1(data) {
  return crypto.createHash('sha1').update(data).digest('hex');
}

/**
 * MD5 hash (not recommended for security)
 * @param {string} data - Data to hash
 * @returns {string} Hash digest
 */
function md5(data) {
  return crypto.createHash('md5').update(data).digest('hex');
}

/**
 * Encrypt data with key
 * @param {string} text - Text to encrypt
 * @param {string} key - Encryption key
 * @returns {string} Encrypted text
 */
function encrypt(text, key) {
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(key, 'hex'),
    Buffer.alloc(16)
  );
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

/**
 * Decrypt data with key
 * @param {string} encrypted - Encrypted text
 * @param {string} key - Decryption key
 * @returns {string} Decrypted text
 */
function decrypt(encrypted, key) {
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(key, 'hex'),
    Buffer.alloc(16)
  );
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Generate random token
 * @param {number} length - Token length in bytes
 * @returns {string} Random token
 */
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Sign data with key
 * @param {string} data - Data to sign
 * @param {string} privateKey - Private key
 * @returns {string} Signature
 */
function sign(data, privateKey) {
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(data);
  return sign.sign(privateKey, 'hex');
}

/**
 * Verify signature
 * @param {string} data - Original data
 * @param {string} signature - Signature to verify
 * @param {string} publicKey - Public key
 * @returns {boolean} True if valid
 */
function verify(data, signature, publicKey) {
  const verify = crypto.createVerify('RSA-SHA256');
  verify.update(data);
  return verify.verify(publicKey, signature, 'hex');
}

/**
 * HMAC signature
 * @param {string} data - Data to sign
 * @param {string} secret - Secret key
 * @returns {string} HMAC signature
 */
function hmac(data, secret) {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Generate hash for password
 * @param {string} password - Password to hash
 * @param {string} salt - Salt (optional)
 * @returns {string} Password hash
 */
function hashPassword(password, salt = generateToken(16)) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256');
  return `${salt}:${hash.toString('hex')}`;
}

/**
 * Verify password hash
 * @param {string} password - Password to verify
 * @param {string} hash - Hash to verify against
 * @returns {boolean} True if password matches
 */
function verifyPassword(password, hash) {
  const [salt, key] = hash.split(':');
  const hashedPassword = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256');
  return key === hashedPassword.toString('hex');
}

module.exports = {
  sha256,
  sha1,
  md5,
  encrypt,
  decrypt,
  generateToken,
  sign,
  verify,
  hmac,
  hashPassword,
  verifyPassword,
};
