const Game = {
    timer: null,
    timeLeft: 0,
    cards: [],
    hasFlippedCard: false,
    lockBoard: false,
    firstCard: null,
    secondCard: null,
    matchesFound: 0,
    scores: [0, 0],
    currentPlayer: 1,
    comboCount: 1,
    comboTimer: null,

    init: () => {
        const size = parseInt(AppState.difficulty) || 4; // Lấy kích thước lưới, mặc định là 4 nếu lỗi
        // Lấy config thời gian tương ứng với size (VD: size 6 lấy config của màn 6x6)
        const diffConfig = CONFIG.DIFFICULTY_MAP[size] || { time: 180 };
        
        Game.timeLeft = diffConfig.time;
        Game.matchesFound = 0;
        Game.scores = [0, 0];
        Game.currentPlayer = 1;
        Game.comboCount = 1;
        Game.resetBoard();
        
        // Truyền cạnh của lưới (size) vào hàm render
        Game.renderBoard(size);
        Game.updateUI();
        Game.startTimer();
    },

    renderBoard: (size) => {
        const board = document.getElementById('game-board');
        board.innerHTML = '';
        
        // Tự động chia cột dựa trên kích thước lưới
        board.style.gridTemplateColumns = `repeat(${size}, 70px)`;

        const totalCells = size * size;
        const numPairs = Math.floor(totalCells / 2); // Tổng số cặp thẻ cần tạo

        // Mẹo an toàn: Lặp lại mảng EMOJIS nếu số lượng cặp bài cần thiết lớn hơn kho emoji có trong config.
        // Giúp màn 6x6 (cần 18 cặp) không bị lỗi thẻ trắng nếu config chỉ khai báo 10 emoji.
        let gameEmojis = [];
        for (let i = 0; i < numPairs; i++) {
            gameEmojis.push(CONFIG.EMOJIS[i % CONFIG.EMOJIS.length]);
        }
        
        let deck = [...gameEmojis, ...gameEmojis].sort(() => Math.random() - 0.5);

        // Tìm vị trí ô trung tâm nếu tổng số ô là lẻ (VD: lưới 3x3, 5x5)
        const centerIndex = (totalCells % 2 !== 0) ? Math.floor(totalCells / 2) : -1;
        let deckIdx = 0;

        for (let i = 0; i < totalCells; i++) {
            const card = document.createElement('div');
            
            if (i === centerIndex) {
                // Biến ô chính giữa thành ô trang trí
                card.classList.add('card');
                card.style.pointerEvents = 'none';
                card.style.opacity = '0.4';
                card.innerHTML = `
                    <div class="card-front" style="background: rgba(255,255,255,0.05); border: 1px dashed rgba(255,255,255,0.2); box-shadow: none;"></div>
                    <div class="card-back" style="font-size: 20px;">⭐</div>
                `;
            } else {
                // Các ô thẻ bài bình thường
                let emoji = deck[deckIdx++];
                card.classList.add('card');
                card.dataset.val = emoji; 
                card.innerHTML = `<div class="card-front"></div><div class="card-back">${emoji}</div>`;
                card.addEventListener('click', Game.flipCard);
            }
            board.appendChild(card);
        }
    },

    flipCard: function() {
        if (Game.lockBoard || this === Game.firstCard || this.classList.contains('matched')) return;

        this.classList.add('flipped');

        if (!Game.hasFlippedCard) {
            Game.hasFlippedCard = true;
            Game.firstCard = this;
            return;
        }
        Game.secondCard = this;
        Game.checkMatch();
    },

    checkMatch: () => {
        let isMatch = Game.firstCard.dataset.val === Game.secondCard.dataset.val;

        if (isMatch) {
            Game.handleMatchSuccess();
        } else {
            Game.handleMatchFail();
        }
    },

    handleMatchSuccess: () => {
        Game.firstCard.classList.add('matched');
        Game.secondCard.classList.add('matched');
        
        // Tính điểm và Combo
        let points = (CONFIG.POINTS_PER_MATCH || 10) * Game.comboCount;
        Game.scores[Game.currentPlayer - 1] += points;
        Game.matchesFound++;
        
        // Tăng combo
        Game.comboCount++;
        clearTimeout(Game.comboTimer);
        Game.comboTimer = setTimeout(() => {
            Game.comboCount = 1;
            Game.updateUI();
        }, CONFIG.COMBO_TIMEOUT || 3000);

        Game.resetBoard();
        Game.updateUI();

        // Kiểm tra điều kiện thắng dựa trên số cặp bài trên lưới thực tế
        const size = parseInt(AppState.difficulty) || 4;
        const totalPairsNeeded = Math.floor((size * size) / 2);
        
        if (Game.matchesFound === totalPairsNeeded) {
            Game.endGame(true);
        }
    },

    handleMatchFail: () => {
        Game.lockBoard = true;
        Game.comboCount = 1; // Mất combo
        clearTimeout(Game.comboTimer);

        setTimeout(() => {
            Game.firstCard.classList.remove('flipped');
            Game.secondCard.classList.remove('flipped');
            
            if (AppState.isMultiplayer) {
                Game.currentPlayer = Game.currentPlayer === 1 ? 2 : 1;
            }
            Game.resetBoard();
            Game.updateUI();
        }, 800);
    },

    resetBoard: () => {
        [Game.hasFlippedCard, Game.lockBoard] = [false, false];
        [Game.firstCard, Game.secondCard] = [null, null];
    },

    startTimer: () => {
        clearInterval(Game.timer);
        document.getElementById('time-left').innerText = Game.timeLeft;
        Game.timer = setInterval(() => {
            Game.timeLeft--;
            document.getElementById('time-left').innerText = Game.timeLeft;
            if (Game.timeLeft <= 0) {
                Game.endGame(false);
            }
        }, 1000);
    },

    updateUI: () => {
        document.getElementById('score1').innerText = Game.scores[0];
        document.getElementById('score2').innerText = Game.scores[1];
        document.getElementById('combo-display').innerText = `Combo x${Game.comboCount}`;
        
        if (AppState.isMultiplayer) {
            document.getElementById('p1-score-box').classList.toggle('active', Game.currentPlayer === 1);
            document.getElementById('p2-score-box').classList.toggle('active', Game.currentPlayer === 2);
        }
    },

    endGame: (completed) => {
        clearInterval(Game.timer);
        Game.lockBoard = true;

        setTimeout(() => {
            if (!completed) {
                alert("Hết giờ! Bạn đã thua.");
            } else if (!AppState.isMultiplayer) {
                alert(`Chiến thắng! Tổng điểm: ${Game.scores[0]}`);
                if(typeof Auth !== 'undefined' && Auth.saveScore) Auth.saveScore(Game.scores[0]);
            } else {
                let msg = Game.scores[0] > Game.scores[1] ? "P1 Thắng!" : 
                          (Game.scores[1] > Game.scores[0] ? "P2 Thắng!" : "Hòa!");
                alert(`Trận đấu kết thúc!\n${msg}`);
            }
            document.getElementById('btn-quit').click(); // Trở về menu
        }, 500);
    }
};