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
	skills: { hint: 2, freeze: 1 },
	isFrozen: false,

	init: () => {
	        const diffKey = AppState.difficulty || '4';
	        const diffConfig = CONFIG.DIFFICULTY_MAP[diffKey] || { size: 4, time: 90, skills: { hint: 2, freeze: 1 } };
	        const size = diffConfig.size;
	        Game.timeLeft = diffConfig.time;
	        Game.skills = { ...diffConfig.skills };
	        Game.matchesFound = 0;
	        Game.scores = [0, 0];
	        Game.currentPlayer = 1;
	        Game.comboCount = 1;
	        Game.isFrozen = false;
	        if(document.getElementById('hint-count')) {
	            document.getElementById('hint-count').innerText = Game.skills.hint;
	            document.getElementById('freeze-count').innerText = Game.skills.freeze;
	        }

	        Game.resetBoard();
	        Game.renderBoard(size);
	        Game.updateUI();
	        Game.startTimer();
	    },

    renderBoard: (size) => {
        const board = document.getElementById('game-board');
        board.innerHTML = '';
        board.style.gridTemplateColumns = `repeat(${size}, 70px)`;

        const totalCells = size * size;
        const numPairs = Math.floor(totalCells / 2);
        let gameEmojis = [];
        for (let i = 0; i < numPairs; i++) {
            gameEmojis.push(CONFIG.EMOJIS[i % CONFIG.EMOJIS.length]);
        }
        
        let deck = [...gameEmojis, ...gameEmojis].sort(() => Math.random() - 0.5);
        const centerIndex = (totalCells % 2 !== 0) ? Math.floor(totalCells / 2) : -1;
        let deckIdx = 0;

        for (let i = 0; i < totalCells; i++) {
            const card = document.createElement('div');
            
            if (i === centerIndex) {
                card.classList.add('card');
                card.style.pointerEvents = 'none';
                card.style.opacity = '0.4';
                card.innerHTML = `
                    <div class="card-front" style="background: rgba(255,255,255,0.05); border: 1px dashed rgba(255,255,255,0.2); box-shadow: none;"></div>
                    <div class="card-back" style="font-size: 20px;">⭐</div>
                `;
            } else {
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
        let points = (CONFIG.POINTS_PER_MATCH || 10) * Game.comboCount;
        Game.scores[Game.currentPlayer - 1] += points;
        Game.matchesFound++;
        Game.comboCount++;
        clearTimeout(Game.comboTimer);
        Game.comboTimer = setTimeout(() => {
            Game.comboCount = 1;
            Game.updateUI();
        }, CONFIG.COMBO_TIMEOUT || 3000);

        Game.resetBoard();
        Game.updateUI();
        const size = parseInt(AppState.difficulty) || 4;
        const totalPairsNeeded = Math.floor((size * size) / 2);
        
        if (Game.matchesFound === totalPairsNeeded) {
            Game.endGame(true);
        }
    },

    handleMatchFail: () => {
        Game.lockBoard = true;
        Game.comboCount = 1;
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
            document.getElementById('btn-quit').click();
        }, 500);
    },
	
	resetSkills: () => {
		Game.skills = { hint: 2, freeze: 1 };
	    Game.isFrozen = false;
	    if(document.getElementById('hint-count')) {
			document.getElementById('hint-count').innerText = Game.skills.hint;
			document.getElementById('freeze-count').innerText = Game.skills.freeze;
	    }
	},
	
	useHint: () => {
		if (Game.skills.hint <= 0 || Game.lockBoard) return;
	    Game.skills.hint--;
	    document.getElementById('hint-count').innerText = Game.skills.hint;
	    let unflipped = Array.from(document.querySelectorAll('.card:not(.flipped)'));
	    if (unflipped.length < 2) return;
	    let pairs = {};
	    unflipped.forEach(card => {
			let val = card.dataset.value;
	        if (!pairs[val]) pairs[val] = [];
	        pairs[val].push(card);
	    });
	    let targetPair = Object.values(pairs).find(p => p.length === 2);
	    if (targetPair) {
			targetPair[0].classList.add('flipped');
	        targetPair[1].classList.add('flipped');
	        Game.lockBoard = true;

	        setTimeout(() => {
				targetPair[0].classList.remove('flipped');
	            targetPair[1].classList.remove('flipped');
	            Game.lockBoard = false;
	        }, 1500);
	    }
	},

	useFreeze: () => {
		if (Game.skills.freeze <= 0 || Game.isFrozen) return;
	    Game.skills.freeze--;
	    document.getElementById('freeze-count').innerText = Game.skills.freeze;
	    Game.isFrozen = true;
	    clearInterval(Game.timer);
	    document.getElementById('game-board').classList.add('frozen-effect');
	    setTimeout(() => {
			Game.isFrozen = false;
	        Game.startTimer();
	        document.getElementById('game-board').classList.remove('frozen-effect');
	    }, 5000);
	},
};