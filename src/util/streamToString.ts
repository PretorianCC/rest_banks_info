/**
 * Получить строку из потока.
 * @param stream - поток.
 * @returns Promise<string> - строка.
 */
export default async function streamToString (stream: any): Promise<string> {
  const chunks: Uint8Array[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk: number[]) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err: string) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  })
}
