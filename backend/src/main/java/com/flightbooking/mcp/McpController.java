package com.flightbooking.mcp;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mcp")
@RequiredArgsConstructor
public class McpController {

    private final McpFlightToolService mcpToolService;

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

    @PostMapping("/rpc")
    public ResponseEntity<Map<String, Object>> handleRpc(@RequestBody Map<String, Object> rpcPayload) {
        String method = (String) rpcPayload.getOrDefault("method", "");
        Object id = rpcPayload.get("id");

        if ("tools/list".equalsIgnoreCase(method)) {
            return ResponseEntity.ok(Map.of(
                    "jsonrpc", "2.0",
                    "id", id != null ? id : 1,
                    "result", Map.of("tools", mcpToolService.listTools())
            ));
        }

        if ("tools/call".equalsIgnoreCase(method)) {
            @SuppressWarnings("unchecked")
            Map<String, Object> params = (Map<String, Object>) rpcPayload.getOrDefault("params", Map.of());
            String name = (String) params.getOrDefault("name", "");
            @SuppressWarnings("unchecked")
            Map<String, Object> args = (Map<String, Object>) params.getOrDefault("arguments", Map.of());

            Map<String, Object> toolResult = mcpToolService.executeTool(name, args);
            return ResponseEntity.ok(Map.of(
                    "jsonrpc", "2.0",
                    "id", id != null ? id : 1,
                    "result", Map.of("content", List.of(Map.of("type", "text", "text", toolResult.toString())))
            ));
        }

        return ResponseEntity.badRequest().body(Map.of(
                "jsonrpc", "2.0",
                "id", id != null ? id : 1,
                "error", Map.of("code", -32601, "message", "Method not found: " + method)
        ));
    }
}
