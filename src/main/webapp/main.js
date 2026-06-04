document.addEventListener('DOMContentLoaded', () => {
    
    // Tham chiếu các màn hình
    const authScreen = document.getElementById('auth-screen');
    const menuScreen = document.getElementById('menu-screen');
    const gameScreen = document.getElementById('game-screen');
    const msgBox = document.getElementById('auth-msg');

    // Hàm chuyển màn hình
    const showScreen = (screen) => {
        authScreen.classList.add('hidden');
        menuScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');
        screen.classList.remove('hidden');
    };

    // Hàm load bảng xếp hạng
    const loadLeaderboard = () => {
        const lb = Auth.getLeaderboard();
        const list = document.getElementById('leaderboard-list');
        list.innerHTML = lb.length ? '' : '<li>Chưa có kỷ lục nào</li>';
        lb.forEach((entry, idx) => {
            list.innerHTML += `<li><span>#${idx+1} ${entry.user}</span> <strong>${entry.score} pts</strong></li>`;
        });
    };

    // --- SỰ KIỆN AUTH ---
    document.getElementById('btn-login').addEventListener('click', () => {
        const u = document.getElementById('username').value.trim();
        const p = document.getElementById('password').value;
        if(!u || !p) return msgBox.innerText = "Vui lòng nhập đủ thông tin!";
        
        let res = Auth.login(u, p);
        if (res.success) {
            document.getElementById('welcome-msg').innerText = `Xin chào, ${AppState.currentUser}!`;
            loadLeaderboard();
            showScreen(menuScreen);
            msgBox.innerText = "";
        } else {
            msgBox.innerText = res.msg;
        }
    });

    document.getElementById('btn-register').addEventListener('click', () => {
        const u = document.getElementById('username').value.trim();
        const p = document.getElementById('password').value;
        if(!u || !p) return msgBox.innerText = "Vui lòng nhập đủ thông tin!";
        
        let res = Auth.register(u, p);
        msgBox.innerText = res.msg;
    });

    document.getElementById('btn-logout').addEventListener('click', () => {
        AppState.currentUser = null;
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        showScreen(authScreen);
    });

    // --- SỰ KIỆN GAME ---
    document.getElementById('btn-start').addEventListener('click', () => {
        AppState.difficulty = parseInt(document.getElementById('difficulty').value);
        AppState.isMultiplayer = document.getElementById('mode').value === '2';
        
        document.getElementById('p2-score-box').classList.toggle('hidden', !AppState.isMultiplayer);
        showScreen(gameScreen);
        Game.init();
    });

    document.getElementById('btn-quit').addEventListener('click', () => {
        clearInterval(Game.timer);
        loadLeaderboard();
        showScreen(menuScreen);
    });
});