const CONFIG = {
	EMOJIS: [
	        '🍎','🍌','🍉','🍇','🍓',
	        '🍒','🍍','🥝','🥑','🌽',
	        '🥕','🍕','🍔','🍟','🌭',
	        '🍿','🍩','🍰','🧊','🚀',
	        '🌟','🎈','🎨','🎸','🎮',
	        '🐼','🦁','🦊','🐱','🐨'
	],
	
	DIFFICULTY_MAP: {
		'2': { size: 2, time: 30, skills: { hint: 1, freeze: 0 } },
		    '3': { size: 3, time: 50, skills: { hint: 1, freeze: 1 } },
		    '4': { size: 4, time: 90, skills: { hint: 2, freeze: 1 } },
		    '5': { size: 5, time: 140, skills: { hint: 2, freeze: 1 } },
		    '6_1': { size: 6, time: 180, skills: { hint: 3, freeze: 2 } },
		    '6_2': { size: 6, time: 140, skills: { hint: 2, freeze: 1 } },
		    '6_3': { size: 6, time: 100, skills: { hint: 1, freeze: 0 } },
		    '6_4': { size: 6, time: 70,  skills: { hint: 0, freeze: 0 } }
	},

    POINTS_PER_MATCH: 10,

    COMBO_TIMEOUT: 3000
};

const AppState = {
    currentUser: null,
    isMultiplayer: false,
    difficulty: 4
};