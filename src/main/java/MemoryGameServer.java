import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.Map;

public class MemoryGameServer {
    // Lưu trữ tài khoản tạm thời trong RAM (Username -> Password)
    private static final Map<String, String> usersDB = new HashMap<>();

    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        
        // Cung cấp file index.html
        server.createContext("/", new StaticFileHandler());
        
        // API Đăng nhập / Đăng ký đơn giản
        server.createContext("/api/auth", new AuthHandler());
        
        server.setExecutor(null);
        server.start();
        System.out.println("Máy chủ game đã khởi chạy!");
        System.out.println("Hãy mở trình duyệt và truy cập: http://localhost:8080");
    }

    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange t) throws IOException {
            File file = new File("index.html");
            if (!file.exists()) {
                String response = "Không tìm thấy file index.html. Vui lòng đặt nó cùng thư mục với server.";
                t.sendResponseHeaders(404, response.getBytes().length);
                OutputStream os = t.getResponseBody();
                os.write(response.getBytes());
                os.close();
                return;
            }
            byte[] bytes = Files.readAllBytes(file.toPath());
            t.getResponseHeaders().add("Content-Type", "text/html; charset=UTF-8");
            t.sendResponseHeaders(200, bytes.length);
            OutputStream os = t.getResponseBody();
            os.write(bytes);
            os.close();
        }
    }

    static class AuthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange t) throws IOException {
            if ("POST".equals(t.getRequestMethod())) {
                String query = new String(t.getRequestBody().readAllBytes());
                // Phân tích dữ liệu dạng action=login&user=abc&pass=123
                Map<String, String> params = parseQuery(query);
                String action = params.get("action");
                String user = params.get("user");
                String pass = params.get("pass");

                String response = "{\"success\": false, \"msg\": \"Lỗi không xác định\"}";

                if ("register".equals(action)) {
                    if (usersDB.containsKey(user)) {
                        response = "{\"success\": false, \"msg\": \"Tài khoản đã tồn tại!\"}";
                    } else {
                        usersDB.put(user, pass);
                        response = "{\"success\": true, \"msg\": \"Đăng ký thành công!\"}";
                    }
                } else if ("login".equals(action)) {
                    if (pass.equals(usersDB.get(user))) {
                        response = "{\"success\": true, \"msg\": \"Đăng nhập thành công!\"}";
                    } else {
                        response = "{\"success\": false, \"msg\": \"Sai tài khoản hoặc mật khẩu!\"}";
                    }
                }

                t.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
                t.sendResponseHeaders(200, response.getBytes("UTF-8").length);
                OutputStream os = t.getResponseBody();
                os.write(response.getBytes("UTF-8"));
                os.close();
            }
        }

        private Map<String, String> parseQuery(String query) {
            Map<String, String> result = new HashMap<>();
            for (String param : query.split("&")) {
                String[] entry = param.split("=");
                if (entry.length > 1) {
                    result.put(entry[0], entry[1]);
                }
            }
            return result;
        }
    }
}