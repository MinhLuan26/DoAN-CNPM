const Auth = {
    login: (username, password) => {
        const key = 'GameUser_' + username;
        const savedPass = localStorage.getItem(key);
        if (!savedPass) return { success: false, msg: "Tài khoản không tồn tại!" };
        if (savedPass !== password) return { success: false, msg: "Sai mật khẩu!" };
        
        AppState.currentUser = username;
        return { success: true };
    },

    register: (username, password) => {
        const key = 'GameUser_' + username;
        if (localStorage.getItem(key)) return { success: false, msg: "Tài khoản đã tồn tại!" };
        
        localStorage.setItem(key, password);
        return { success: true, msg: "Đăng ký thành công! Hãy đăng nhập." };
    },

    saveScore: (score) => {
        if (!AppState.currentUser) return;
        let lb = JSON.parse(localStorage.getItem('GameLeaderboard')) || [];
        lb.push({ user: AppState.currentUser, score: score, date: new Date().toLocaleDateString() });
        // Sắp xếp giảm dần và lấy top 5
        lb = lb.sort((a, b) => b.score - a.score).slice(0, 5);
        localStorage.setItem('GameLeaderboard', JSON.stringify(lb));
    },

    getLeaderboard: () => {
        return JSON.parse(localStorage.getItem('GameLeaderboard')) || [];
    }
};