const { program } = require('commander');
const fs = require('fs').promises;
const http = require('http');
const path = require('path');
const superagent = require('superagent');

program
  .requiredOption('-h, --host <host>', 'адреса сервера')
  .requiredOption('-p, --port <port>', 'порт сервера')
  .requiredOption('-c, --cache <cache>', 'шлях до директорії кешу')
  .parse();

const options = program.opts();

const host = options.host
const port = options.port
const cache = options.cache

const server = http.createServer(async (req, res) => {
    if (!['GET', 'PUT', 'DELETE'].includes(req.method)) {
        res.writeHead(405, { 'Allow': 'GET, PUT, DELETE' });
        return res.end();
    }

    const code = req.url.slice(1);

    const filePath = path.join(cache, `${code}.jpg`);

    switch (req.method) {
        case 'GET':
            try {
                const image = await fs.readFile(filePath);
                res.writeHead(200, { 'Content-Type': 'image/jpeg' });
                return res.end(image);
            } catch {
                try {
                    const response = await superagent.get(`https://http.cat/${code}`)
                        .responseType('blob');

                    await fs.writeFile(filePath, response.body);
                    res.writeHead(200, { 'Content-Type': 'image/jpeg' });
                    return res.end(response.body);
                } catch {
                    res.writeHead(404);
                    return res.end();
                }
            }

        case 'PUT':
            const chunks = [];
            for await (const chunk of req) {
            chunks.push(chunk);
            }
            await fs.writeFile(filePath, Buffer.concat(chunks));
            res.writeHead(201);
            return res.end();

        case 'DELETE':
            try {
                await fs.unlink(filePath);
                res.writeHead(200);
                return res.end();
                } catch {
                    res.writeHead(404);
                    return res.end();
                }
            }
        });

server.listen(port, host, () => {
  console.log(`Server is running on http://${options.host}:${options.port}`);
  console.log(`Cache dir: ${options.cache}`);
});
