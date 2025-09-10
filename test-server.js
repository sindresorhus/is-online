import {createServer} from 'node:http';

// Simple test server for hostname testing
export function createTestServer(port = 0) {
	const server = createServer((request, response) => {
		// Always respond with 200 OK
		response.writeHead(200, {'Content-Type': 'text/plain'});
		response.end('OK');
	});

	return new Promise(resolve => {
		server.listen(port, () => {
			const {port: actualPort} = server.address();
			resolve({
				server,
				port: actualPort,
				url: `http://localhost:${actualPort}`,
				close: () => server.close(),
			});
		});
	});
}
