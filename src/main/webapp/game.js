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
        const diffConfig = CONFIG.DIFFICULTY_MAP[AppState.difficulty];
        Game.timeLeft = diffConfig.time;
        Game.matchesFound = 0;
        Game.scores = [0, 0];
        Game.currentPlayer = 1;
        Game.comboCount = 1;
        Game.resetBoard();
        
        Game.renderBoard(AppState.difficulty, diffConfig.cols);
        Game.updateUI();
        Game.startTimer();
    },

    renderBoard: (numCards, cols) => {
        const board = document.getElementById('game-board');
        board.innerHTML = '';
        board.style.gridTemplateColumns = `repeat(${cols}, 70px)`;

        let gameEmojis = CONFIG.EMOJIS.slice(0, numCards / 2);
        let deck = [...gameEmojis, ...gameEmojis].sort(() => Math.random() - 0.5);

        deck.forEach(emoji => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.val = emoji;
            card.innerHTML = `<div class="card-front"></div><div class="card-back">${emoji}</div>`;
            card.addEventListener('click', Game.flipCard);
            board.appendChild(card);
        });
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
        let points = CONFIG.POINTS_PER_MATCH * Game.comboCount;
        Game.scores[Game.currentPlayer - 1] += points;
        Game.matchesFound++;
        
        // Tăng combo
        Game.comboCount++;
        clearTimeout(Game.comboTimer);
        Game.comboTimer = setTimeout(() => {
            Game.comboCount = 1;
            Game.updateUI();
        }, CONFIG.COMBO_TIMEOUT);

        Game.resetBoard();
        Game.updateUI();

        if (Game.matchesFound === AppState.difficulty / 2) {
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
                Auth.saveScore(Game.scores[0]);
            } else {
                let msg = Game.scores[0] > Game.scores[1] ? "P1 Thắng!" : 
                          (Game.scores[1] > Game.scores[0] ? "P2 Thắng!" : "Hòa!");
                alert(`Trận đấu kết thúc!\n${msg}`);
            }
            document.getElementById('btn-quit').click(); // Trigger quit
        }, 500);
    }
};