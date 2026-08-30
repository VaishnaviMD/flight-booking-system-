#!/usr/bin/env node
/**
 * SkyFlow Flight Assistant - Official Claude Desktop MCP Server
 * Standard stdio JSON-RPC 2.0 MCP Bridge connecting Claude Desktop to SkyFlow Backend.
 */

const http = require('http');
const readline = require('readline');

const BACKEND_URL = 'http://localhost:8080';

const TOOLS = [
  {
    name: 'search_flights',
    description: 'Search live scheduled flights, partner airlines, ticket prices (INR), and seat availability between any two airport IATA codes (e.g. DEL to BOM).',
    inputSchema: {
      type: 'object',
      properties: {
        origin: {
          type: 'string',
          description: '3-letter IATA origin airport code (e.g. DEL, BOM, BLR, MAA, HYD, CCU, GOI)'
        },
        destination: {
          type: 'string',
          description: '3-letter IATA destination airport code (e.g. BOM, DEL, BLR, MAA, HYD, CCU, GOI)'
        }
      },
      required: ['origin', 'destination']
    }
  },
  {
    name: 'get_baggage_allowance',
    description: 'Retrieve official check-in and cabin baggage weight limits for Economy and Business class on SkyFlow.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'get_cancellation_policy',
    description: 'Retrieve flight cancellation terms, free cancellation windows, cancellation fees, and refund processing timelines.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'get_airports_list',
    description: 'Retrieve the complete list of supported Indian metro airport hubs, city names, and IATA codes.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'get_passenger_age_rules',
    description: 'Retrieve passenger age calculation rules from Date of Birth and category definitions (Infant <2 yrs, Child 2-11 yrs, Adult 12+ yrs).',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

function callBackendMcp(toolName, args) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      name: toolName,
      arguments: args || {}
    });

    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/mcp/call',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 4000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          resolve({ error: 'Failed to parse response: ' + data });
        }
      });
    });

    req.on('error', (err) => {
      resolve({
        error: `Could not connect to SkyFlow Backend on ${BACKEND_URL}. Ensure Spring Boot backend is running.`
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ error: 'Request to SkyFlow Backend timed out.' });
    });

    req.write(postData);
    req.end();
  });
}

function sendResponse(id, result, error) {
  const response = {
    jsonrpc: '2.0',
    id: id
  };
  if (error) {
    response.error = error;
  } else {
    response.result = result;
  }
  process.stdout.write(JSON.stringify(response) + '\n');
}

// Read JSON-RPC lines from stdin
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', async (line) => {
  if (!line || !line.trim()) return;

  let request;
  try {
    request = JSON.parse(line);
  } catch (e) {
    sendResponse(null, null, { code: -32700, message: 'Parse error' });
    return;
  }

  const { id, method, params } = request;

  switch (method) {
    case 'initialize':
      sendResponse(id, {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: 'skyflow-flight-assistant',
          version: '1.0.0'
        }
      });
      break;

    case 'notifications/initialized':
      // Client confirmed initialization
      break;

    case 'tools/list':
      sendResponse(id, {
        tools: TOOLS
      });
      break;

    case 'tools/call':
      if (!params || !params.name) {
        sendResponse(id, null, { code: -32602, message: 'Invalid params: tool name required' });
        return;
      }

      const toolResult = await callBackendMcp(params.name, params.arguments || {});
      const textOutput = typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult, null, 2);

      sendResponse(id, {
        content: [
          {
            type: 'text',
            text: textOutput
          }
        ]
      });
      break;

    case 'ping':
      sendResponse(id, {});
      break;

    default:
      if (id !== undefined && id !== null) {
        sendResponse(id, null, { code: -32601, message: `Method not found: ${method}` });
      }
      break;
  }
});
