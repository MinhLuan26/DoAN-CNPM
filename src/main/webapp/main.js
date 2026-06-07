document.addEventListener('DOMContentLoaded', () => {
    const authScreen = document.getElementById('auth-screen');
    const menuScreen = document.getElementById('menu-screen');
    const gameScreen = document.getElementById('game-screen');
    const msgBox = document.getElementById('auth-msg');
    const showScreen = (screen) => {
        authScreen.classList.add('hidden');
        menuScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');
        screen.classList.remove('hidden');
    };

    const loadLeaderboard = () => {
        const lb = Auth.getLeaderboard();
        const list = document.getElementById('leaderboard-list');
        list.innerHTML = lb.length ? '' : '<li>Chưa có kỷ lục nào</li>';
        lb.forEach((entry, idx) => {
            list.innerHTML += `<li><span>#${idx+1} ${entry.user}</span> <strong>${entry.score} pts</strong></li>`;
        });
    };

	document.getElementById('btn-login').addEventListener('click', async () => {
	    const u = document.getElementById('username').value.trim();
	    const p = document.getElementById('password').value;
	    if(!u || !p) return msgBox.innerText = "Vui lòng nhập đủ thông tin!";
	    let res = await Auth.login(u, p); 
	    
	    if (res && res.success) {
	        document.getElementById('welcome-msg').innerText = `Chào mừng ${AppState.currentUser}!`;
	        resetUserDataForNewSession(); 
	        
	        loadLeaderboard();
	        showScreen(menuScreen);
	        msgBox.innerText = "";
	    } else {
	        msgBox.innerText = res ? res.msg : "Lỗi kết nối server!";
	    }
	});

	document.getElementById('btn-register').addEventListener('click', async () => {
	    const u = document.getElementById('username').value.trim();
	    const p = document.getElementById('password').value;
	    if(!u || !p) return msgBox.innerText = "Vui lòng nhập đủ thông tin!";
	    let res = await Auth.register(u, p);
	    if (res && res.success) {
	        msgBox.innerText = "Đăng ký thành công! Vui lòng đăng nhập.";
	    } else {
	        msgBox.innerText = res ? res.msg : "Lỗi đăng ký!";
	    }
	});

    document.getElementById('btn-logout').addEventListener('click', () => {
        AppState.currentUser = null;
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
		resetUserDataForNewSession();
        showScreen(authScreen);
    });
	
	document.getElementById('btn-start').addEventListener('click', () => {
	    AppState.difficulty = document.getElementById('difficulty').value; 
	    
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
	
	// ================= HIỆU ỨNG TƯƠNG TÁC ĐỈNH CAO (ULTIMATE UI) =================
	(function initUltimateUI() {
	    // 1. Tự động chèn thư viện Icon FontAwesome vào web
	    if (!document.querySelector('link[href*="font-awesome"]')) {
	        const fa = document.createElement('link');
	        fa.rel = 'stylesheet';
	        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
	        document.head.appendChild(fa);
	    }

	    // 2. Tự động cập nhật nội dung nút bấm sang dạng có Icon sắc nét
	    setTimeout(() => {
	        const btnLogin = document.getElementById('btn-login');
	        if(btnLogin && !btnLogin.innerHTML.includes('fa-')) btnLogin.innerHTML = '<i class="fas fa-sign-in-alt"></i> Đăng Nhập';
	        
	        const btnReg = document.getElementById('btn-register');
	        if(btnReg && !btnReg.innerHTML.includes('fa-')) btnReg.innerHTML = '<i class="fas fa-user-plus"></i> Đăng Ký';
	        
	        const btnStart = document.getElementById('btn-start');
	        if(btnStart && !btnStart.innerHTML.includes('fa-')) btnStart.innerHTML = '<i class="fas fa-gamepad"></i> Bắt Đầu Chơi';
	        
	        const btnQuit = document.getElementById('btn-quit');
	        if(btnQuit && !btnQuit.innerHTML.includes('fa-')) btnQuit.innerHTML = '<i class="fas fa-power-off"></i> Rời Bàn';

	        const btnLogout = document.getElementById('btn-logout');
	        if(btnLogout && !btnLogout.innerHTML.includes('fa-')) btnLogout.innerHTML = '<i class="fas fa-sign-out-alt"></i> Đăng Xuất';
	    }, 500);

	    // 3. Khởi tạo Không gian hạt ma thuật (Magic Particles Canvas)
	    const canvas = document.createElement('canvas');
	    canvas.style.position = 'fixed';
	    canvas.style.top = '0';
	    canvas.style.left = '0';
	    canvas.style.width = '100vw';
	    canvas.style.height = '100vh';
	    canvas.style.zIndex = '-2'; // Nằm dưới cùng để không che game
	    canvas.style.pointerEvents = 'none'; // Để chuột bấm xuyên qua được
	    document.body.prepend(canvas);

	    const ctx = canvas.getContext('2d');
	    let width = canvas.width = window.innerWidth;
	    let height = canvas.height = window.innerHeight;
	    let particles = [];

	    // Cập nhật lại kích thước canvas khi thu phóng cửa sổ
	    window.addEventListener('resize', () => {
	        width = canvas.width = window.innerWidth;
	        height = canvas.height = window.innerHeight;
	    });

	    class Particle {
	        constructor(x, y) {
	            this.x = x;
	            this.y = y;
	            this.size = Math.random() * 4 + 1; // Kích thước hạt
	            this.speedX = Math.random() * 3 - 1.5; // Tốc độ bay ngang
	            this.speedY = Math.random() * -3 - 1;  // Tốc độ bay lên
	            // Chọn ngẫu nhiên màu Xanh dương Neon hoặc Xanh lá Neon
	            this.color = Math.random() > 0.5 ? '#00D1FF' : '#00FF84';
	            this.life = 1.0; // Độ sáng
	        }
	        update() {
	            this.x += this.speedX;
	            this.y += this.speedY;
	            this.life -= 0.02; // Tốc độ mờ dần
	            if (this.size > 0.2) this.size -= 0.05; // Teo nhỏ dần
	        }
	        draw() {
	            ctx.globalAlpha = this.life;
	            ctx.fillStyle = this.color;
	            ctx.beginPath();
	            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
	            ctx.fill();
	            
	            // Viền sáng Glow cho hạt
	            ctx.shadowBlur = 15;
	            ctx.shadowColor = this.color;
	        }
	    }

	    // Bắn hạt ra mỗi khi người dùng rê chuột
	    window.addEventListener('mousemove', (e) => {
	        // Mỗi lần di chuột tạo ra 3 hạt
	        for (let i = 0; i < 3; i++) {
	            particles.push(new Particle(e.x, e.y));
	        }
	    });

	    // Vòng lặp vẽ liên tục (60 FPS)
	    function animate() {
	        ctx.clearRect(0, 0, width, height);
	        for (let i = 0; i < particles.length; i++) {
	            particles[i].update();
	            particles[i].draw();
	            // Xóa hạt khi nó mờ hết để đỡ giật lag
	            if (particles[i].life <= 0) {
	                particles.splice(i, 1);
	                i--;
	            }
	        }
	        requestAnimationFrame(animate);
	    }
	    animate();
	})();
});