"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Получить строку из потока.
 * @param stream - поток.
 * @returns Promise<string> - строка.
 */
async function streamToString(stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
}
exports.default = streamToString;
