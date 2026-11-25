import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const vehicles = [
  { id: 1, vehicleName: 'Hyundai Creta', vehicleNumber: 'HR26AB1234', type: 'SUV', price: 1500000 },
  { id: 2, vehicleName: 'Honda City', vehicleNumber: 'DL3CAF4321', type: 'Sedan', price: 1350000 },
  { id: 3, vehicleName: 'Tata Nexon', vehicleNumber: 'UP16CD5678', type: 'Compact SUV', price: 1100000 }
];

const sendJSON = (res, statusCode, payload) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload, null, 2));
};

const server = http.createServer((req, res) => {
  const { method, url } = req;

  if (method === 'GET' && url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Welcome to the Vehicle Management Web Application</h1>');
    return;
  }

  if (method === 'GET' && url === '/vehicles') {
    sendJSON(res, 200, vehicles);
    return;
  }

  if (method === 'GET' && url === '/about') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>About</h1><p>Vehicle Management App built with Node.js HTTP & FS modules.</p>');
    return;
  }

  if (method === 'GET' && url === '/info') {
    const filePath = path.join(__dirname, 'public', 'info.html');
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        sendJSON(res, 500, { error: 'Internal Server Error: Unable to read info.html' });
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  if (method === 'POST' && url === '/add-vehicle') {
    let body = '';
    req.on('data', (chunk) => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const { id, vehicleName, vehicleNumber, type, price } = JSON.parse(body);
        if (id === undefined || !vehicleName || !vehicleNumber || !type || typeof price !== 'number' || price <= 0) {
          sendJSON(res, 400, { error: 'Missing required fields or invalid price' });
          return;
        }
        const newVehicle = { id, vehicleName, vehicleNumber, type, price };
        vehicles.push(newVehicle);
        sendJSON(res, 201, { message: 'Vehicle added successfully', vehicle: newVehicle });
      } catch {
        sendJSON(res, 400, { error: 'Invalid JSON format' });
      }
    });
    return;
  }

  sendJSON(res, 404, { error: `Route ${method} ${url} not found` });
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});