"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
const crypto_1 = __importDefault(require("crypto"));
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;
function encrypt(text) {
    const secret = process.env.ENCRYPTION_KEY;
    if (!secret)
        throw new Error('ENCRYPTION_KEY is not defined');
    const iv = crypto_1.default.randomBytes(IV_LENGTH);
    const salt = crypto_1.default.randomBytes(SALT_LENGTH);
    const key = crypto_1.default.pbkdf2Sync(secret, salt, ITERATIONS, KEY_LENGTH, 'sha512');
    const cipher = crypto_1.default.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
}
function decrypt(cipherText) {
    const secret = process.env.ENCRYPTION_KEY;
    if (!secret)
        throw new Error('ENCRYPTION_KEY is not defined');
    const bData = Buffer.from(cipherText, 'base64');
    const salt = bData.slice(0, SALT_LENGTH);
    const iv = bData.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = bData.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = bData.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const key = crypto_1.default.pbkdf2Sync(secret, salt, ITERATIONS, KEY_LENGTH, 'sha512');
    const decipher = crypto_1.default.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
}
