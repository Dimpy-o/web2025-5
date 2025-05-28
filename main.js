const { program } = require('commander');
const fs = require('fs');
const http = require('http');

program
	.requiredOption('-h, --host <host>', 'Server ip address')
    .requiredOption('-p, --port <port>', 'Server port')
    .requiredOption('-c, --cache <file>', 'Cache file')
    .parse();

const options = program.opts();

const host = options.host
const port = options.port
const cache = options.cache

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello, World!\n');
});

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
    console.log(`Cache dir: ${cache}`)
});
