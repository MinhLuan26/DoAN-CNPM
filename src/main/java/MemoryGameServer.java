import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.util.*;

public class MemoryGameServer {
    // Đường dẫn giả lập Database
    private static final String USERS_FILE = "users.txt";
    private static final String SCORES_FILE = "scores.txt";

    public static void main(String[] args) throws Exception {
        // Đảm bảo file tồn tại
        new File(USERS_FILE).createNewFile();
        new File(SCORES_FILE).createNewFile();

        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        
        // Phục vụ tất cả các file HTML, CSS, JS
        server.createContext("/", new StaticFileHandler());
        
        // Các API Backend
        server.createContext("/api/auth", new AuthHandler());
        server.createContext("/api/score", new ScoreHandler());
        server.createContext("/api/leaderboard", new LeaderboardHandler());
        
        server.setExecutor(null);
        server.start();
        System.out.println("Backend Java đã khởi chạy thành công tại http://localhost:8080");
    }

    // Xử lý nạp các file giao diện (Cải tiến để đọc được cả thư mục CSS và JS)
    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange t) throws IOException {
            String path = t.getRequestURI().getPath();
            if (path.equals("/")) path = "/index.html";
            
            // Xóa dấu / ở đầu để tương thích đường dẫn file hệ thống
            File file = new File(path.substring(1));
            
            if (!file.exists()) {
                String response = "404 Not Found";
                t.sendResponseHeaders(404, response.getBytes().length);
                OutputStream os = t.getResponseBody();
                os.write(response.getBytes());
                os.close();
                return;
            }

            String mime = "text/plain";
            if (path.endsWith(".html")) mime = "text/html; charset=UTF-8";
            else if (path.endsWith(".css")) mime = "text/css; charset=UTF-8";
            else if (path.endsWith(".js")) mime = "application/javascript; charset=UTF-8";

            byte[] bytes = Files.readAllBytes(file.toPath());
            t.getResponseHeaders().add("Content-Type", mime);
            t.sendResponseHeaders(200, bytes.length);
            OutputStream os = t.getResponseBody();
            os.write(bytes);
            os.close();
        }
    }

    // Tính năng: Xử lý Đăng nhập / Đăng ký (Đọc/Ghi file)
    static class AuthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange t) throws IOException {
            if ("POST".equals(t.getRequestMethod())) {
                Map<String, String> params = parseQuery(new String(t.getRequestBody().readAllBytes()));
                String action = params.get("action");
                String user = params.get("user");
                String pass = params.get("pass");

                boolean success = false;
                String msg = "Lỗi hệ thống";

                Map<String, String> usersDB = readUsers();

                if ("register".equals(action)) {
                    if (usersDB.containsKey(user)) {
                        msg = "Tài khoản đã tồn tại!";
                    } else {
                        saveUser(user, pass);
                        success = true;
                        msg = "Đăng ký thành công!";
                    }
                } else if ("login".equals(action)) {
                    if (pass.equals(usersDB.get(user))) {
                        success = true;
                        msg = "Đăng nhập thành công!";
                    } else {
                        msg = "Sai tài khoản hoặc mật khẩu!";
                    }
                }

                sendJsonResponse(t, "{\"success\": " + success + ", \"msg\": \"" + msg + "\"}");
            }
        }
    }

    // Tính năng: Nhận điểm số từ Web và lưu trữ
    static class ScoreHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange t) throws IOException {
            if ("POST".equals(t.getRequestMethod())) {
                Map<String, String> params = parseQuery(new String(t.getRequestBody().readAllBytes()));
                String user = params.get("user");
                String score = params.get("score");

                try (FileWriter fw = new FileWriter(SCORES_FILE, true);
                     PrintWriter bw = new PrintWriter(fw)) {
                    bw.println(user + "," + score);
                }
                sendJsonResponse(t, "{\"success\": true}");
            }
        }
    }

    // Tính năng: Sắp xếp bảng xếp hạng toàn cầu
    static class LeaderboardHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange t) throws IOException {
            List<PlayerScore> scores = new ArrayList<>();
            try (BufferedReader br = new BufferedReader(new FileReader(SCORES_FILE))) {
                String line;
                while ((line = br.readLine()) != null) {
                    String[] parts = line.split(",");
                    if (parts.length == 2) {
                        scores.add(new PlayerScore(parts[0], Integer.parseInt(parts[1])));
                    }
                }
            }

            // Sắp xếp giảm dần theo điểm
            scores.sort((s1, s2) -> Integer.compare(s2.score, s1.score));

            // Chuyển Top 5 sang JSON thủ công (Tránh dùng thư viện ngoài)
            StringBuilder json = new StringBuilder("[");
            int limit = Math.min(5, scores.size());
            for (int i = 0; i < limit; i++) {
                json.append("{\"user\":\"").append(scores.get(i).user)
                    .append("\",\"score\":").append(scores.get(i).score).append("}");
                if (i < limit - 1) json.append(",");
            }
            json.append("]");

            sendJsonResponse(t, json.toString());
        }

        static class PlayerScore {
            String user; int score;
            PlayerScore(String user, int score) { this.user = user; this.score = score; }
        }
    }

    // --- Các hàm tiện ích (Utility) ---
    private static Map<String, String> parseQuery(String query) {
        Map<String, String> result = new HashMap<>();
        if (query == null || query.isEmpty()) return result;
        for (String param : query.split("&")) {
            String[] entry = param.split("=");
            if (entry.length > 1) result.put(entry[0], entry[1]);
        }
        return result;
    }

    private static Map<String, String> readUsers() throws IOException {
        Map<String, String> users = new HashMap<>();
        try (BufferedReader br = new BufferedReader(new FileReader(USERS_FILE))) {
            String line;
            while ((line = br.readLine()) != null) {
                String[] parts = line.split(",");
                if (parts.length == 2) users.put(parts[0], parts[1]);
            }
        }
        return users;
    }

    private static void saveUser(String user, String pass) throws IOException {
        try (FileWriter fw = new FileWriter(USERS_FILE, true);
             PrintWriter bw = new PrintWriter(fw)) {
            bw.println(user + "," + pass);
        }
    }

    private static void sendJsonResponse(HttpExchange t, String json) throws IOException {
        t.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
        byte[] bytes = json.getBytes("UTF-8");
        t.sendResponseHeaders(200, bytes.length);
        OutputStream os = t.getResponseBody();
        os.write(bytes);
        os.close();
    }
}