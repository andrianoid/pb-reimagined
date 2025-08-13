const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const schema = JSON.parse(fs.readFileSync(path.join(__dirname, 'schemas', 'wire-message.schema.json'), 'utf8'));

function uuid() {
  return crypto.randomUUID();
}

function validateEvent(msg) {
  const errors = [];
  const required = schema.$defs.event.required;
  for (const field of required) {
    if (msg[field] === undefined) errors.push(`missing ${field}`);
  }
  if (msg.kind !== 'event') errors.push('kind must be "event"');
  if (typeof msg.version !== 'string') errors.push('version must be string');
  if (typeof msg.messageId !== 'string') errors.push('messageId must be string');
  if (typeof msg.eventType !== 'string') errors.push('eventType must be string');
  if (typeof msg.showId !== 'string') errors.push('showId must be string');
  if (typeof msg.createdAt !== 'string' || isNaN(Date.parse(msg.createdAt))) errors.push('createdAt must be ISO date');
  if (typeof msg.actor !== 'object') errors.push('actor must be object');
  if (typeof msg.payload !== 'object') errors.push('payload must be object');
  return { valid: errors.length === 0, errors };
}

function generateAcceptValue(secWebSocketKey) {
  return crypto
    .createHash('sha1')
    .update(secWebSocketKey + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11', 'binary')
    .digest('base64');
}

function frame(data) {
  const payload = Buffer.from(data);
  const length = payload.length;
  let offset = 2;
  if (length >= 126 && length < 65536) offset += 2;
  else if (length >= 65536) offset += 8;
  const buffer = Buffer.alloc(offset + length);
  buffer[0] = 0x81; // FIN and text frame
  if (length < 126) {
    buffer[1] = length;
  } else if (length < 65536) {
    buffer[1] = 126;
    buffer.writeUInt16BE(length, 2);
  } else {
    buffer[1] = 127;
    buffer.writeBigUInt64BE(BigInt(length), 2);
  }
  payload.copy(buffer, offset);
  return buffer;
}

function parse(buffer) {
  const firstByte = buffer[0];
  const opCode = firstByte & 0x0f;
  if (opCode === 0x8) return null; // close
  const secondByte = buffer[1];
  const masked = secondByte & 0x80;
  let length = secondByte & 0x7f;
  let offset = 2;
  if (length === 126) {
    length = buffer.readUInt16BE(offset);
    offset += 2;
  } else if (length === 127) {
    length = Number(buffer.readBigUInt64BE(offset));
    offset += 8;
  }
  let maskingKey;
  if (masked) {
    maskingKey = buffer.slice(offset, offset + 4);
    offset += 4;
  }
  let payload = buffer.slice(offset, offset + length);
  if (masked) {
    for (let i = 0; i < payload.length; i++) {
      payload[i] ^= maskingKey[i % 4];
    }
  }
  return payload.toString('utf8');
}

const clients = new Set();
let eventSeq = 0;

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.on('upgrade', (req, socket) => {
  if (req.headers.upgrade !== 'websocket') {
    socket.end('HTTP/1.1 400 Bad Request');
    return;
  }
  const acceptKey = generateAcceptValue(req.headers['sec-websocket-key']);
  const headers = [
    'HTTP/1.1 101 Switching Protocols',
    'Upgrade: websocket',
    'Connection: Upgrade',
    `Sec-WebSocket-Accept: ${acceptKey}`
  ];
  socket.write(headers.concat('\r\n').join('\r\n'));
  clients.add(socket);

  socket.on('data', (buffer) => {
    const message = parse(buffer);
    if (message === null) {
      clients.delete(socket);
      socket.end();
      return;
    }
    let msg;
    try {
      msg = JSON.parse(message);
    } catch (err) {
      const ack = frame(JSON.stringify({
        kind: 'ack',
        version: '1.0.0',
        messageId: uuid(),
        status: 'error',
        code: 'INVALID_JSON'
      }));
      socket.write(ack);
      return;
    }
    const { valid, errors } = validateEvent(msg);
    if (!valid) {
      const ack = frame(JSON.stringify({
        kind: 'ack',
        version: msg.version || '1.0.0',
        messageId: uuid(),
        ackOf: msg.messageId,
        status: 'error',
        errors
      }));
      socket.write(ack);
      return;
    }
    const seq = ++eventSeq;
    const now = new Date().toISOString();
    const event = { ...msg, eventSeq: seq };
    const eventFrame = frame(JSON.stringify(event));
    for (const client of clients) {
      client.write(eventFrame);
    }
    const ack = frame(JSON.stringify({
      kind: 'ack',
      version: msg.version,
      messageId: uuid(),
      ackOf: msg.messageId,
      status: 'ok',
      createdAt: now,
      eventSeq: seq
    }));
    socket.write(ack);
  });

  socket.on('end', () => {
    clients.delete(socket);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
