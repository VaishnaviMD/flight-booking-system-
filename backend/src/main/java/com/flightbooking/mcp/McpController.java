package com.flightbooking.mcp;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * SkyFlow MCP Server over HTTP.
 *
 * Exposes three endpoints:
 *   GET  /api/mcp/tools   - simple discovery (backwards compatible)
 *   POST /api/mcp/call    - simple tool invocation (backwards compatible)
 *   POST /api/mcp/rpc     - standard MCP JSON-RPC 2.0 endpoint supporting the
 *                           official handshake (initialize / ping / notifications)
 *                           plus tools/list and tools/call, so real MCP clients
 *                           (Cline, ChatGPT, Claude Desktop, VS Code, Codex, ...)
 *                           can connect out of the box.
 */
@RestController
@RequestMapping("/api/mcp")
@RequiredArgsConstructor
public class McpController {

    private static final Logger log = LoggerFactory.getLogger(McpController.class);

    private static final String PROTOCOL_VERSION   = "2024-11-05";
    private static final String SERVER_NAME        = "skyflow-flight-tools";
    private static final String SERVER_VERSION     = "1.0.0";

    private final McpFlightToolService mcpToolService;

    /* ------------------------------------------------ */
    /* Simple endpoints (kept for the app itself + tests) */
    /* ------------------------------------------------ */

    @GetMapping("/tools")
    public ResponseEntity<List<McpTool>> listTools() {
        return ResponseEntity.ok(mcpToolService.listTools());
    }

    @PostMapping("/call")
    public ResponseEntity<Map<String, Object>> callTool(@RequestBody Map<String, Object> payload) {
        String toolName = payload.getOrDefault("name", "").toString();
        @SuppressWarnings("unchecked")
        Map<String, Object> args = (Map<String, Object>) payload.getOrDefault("arguments", Map.of());
        return ResponseEntity.ok(mcpToolService.executeTool(toolName, args));
    }

    /* ------------------------------------------------ */
    /* Standard MCP JSON-RPC 2.0 handshake                */
    /* ------------------------------------------------ */

    @PostMapping("/rpc")
    public ResponseEntity<Map<String, Object>> handleRpc(@RequestBody Map<String, Object> rpcPayload) {
        String method = (String) rpcPayload.getOrDefault("method", "");
        Object id = rpcPayload.getOrDefault("id", null);

        log.debug("MCP RPC received: method={}, id={}", method, id);

        // Notifications get no response per spec - acknowledge silently.
        if (method.startsWith("notifications/")) {
            return ResponseEntity.ok(Map.of("jsonrpc", "2.0"));
        }

        switch (method) {
            case "initialize" -> {
                return ok(id, Map.of(
                        "protocolVersion", PROTOCOL_VERSION,
                        "capabilities", Map.of("tools", Map.of()),
                        "serverInfo", Map.of(
                                "name", SERVER_NAME,
                                "version", SERVER_VERSION
                        )
                ));
            }

            case "ping" -> {
                return ok(id, Map.of());
            }

            case "tools/list" -> {
                return ok(id, Map.of("tools", mcpToolService.listTools()));
            }

            case "tools/call" -> {
                @SuppressWarnings("unchecked")
                Map<String, Object> params = (Map<String, Object>) rpcPayload.getOrDefault("params", Map.of());
                String name = (String) params.getOrDefault("name", "");
                @SuppressWarnings("unchecked")
                Map<String, Object> args = (Map<String, Object>) params.getOrDefault("arguments", Map.of());

                Object toolResult = mcpToolService.executeTool(name, args);
                return ok(id, Map.of(
                        "content", List.of(Map.of(
                                "type", "text",
                                "text", toolResult.toString()
                        )),
                        "isError", false
                ));
            }

            default -> {
                return error(id, -32601, "Method not found: " + method);
            }
        }
    }

    /* ------------------------------------------------ */
    /* JSON-RPC response helpers                          */
    /* ------------------------------------------------ */

    private ResponseEntity<Map<String, Object>> ok(Object id, Map<String, Object> result) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("jsonrpc", "2.0");
        resp.put("id", id);
        resp.put("result", result);
        return ResponseEntity.ok(resp);
    }

    private ResponseEntity<Map<String, Object>> error(Object id, int code, String message) {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("jsonrpc", "2.0");
        resp.put("id", id);
        resp.put("error", Map.of("code", code, "message", message));
        return ResponseEntity.badRequest().body(resp);
    }
}