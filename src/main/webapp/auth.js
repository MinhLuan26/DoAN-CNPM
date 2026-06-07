const Auth = {
	// --- Bùi Đoàn Anh Duy phụ trách ---
	// Gọi API Đăng nhập
    login: async (username, password) => {
        const res = await fetch('/api/auth', {
            method: 'POST',
            body: `action=login&user=${username}&pass=${password}`
        });
        const data = await res.json();
        if (data.success) AppState.currentUser = username;
        return data;
    },
	
	// Gọi API Đăng ký
    register: async (username, password) => {
        const res = await fetch('/api/auth', {
            method: 'POST',
            body: `action=register&user=${username}&pass=${password}`
        });
        return await res.json();
    },
	
	// --- Nguyễn Minh Luân phụ trách ---
	// Gửi điểm lên server
    saveScore: async (score) => {
        if (!AppState.currentUser) return;
        await fetch('/api/score', {
            method: 'POST',
            body: `user=${AppState.currentUser}&score=${score}`
        });
    },
	
	// Lấy dữ liệu bảng xếp hạng
    getLeaderboard: async () => {
        const res = await fetch('/api/leaderboard');
        return await res.json();
    }
};