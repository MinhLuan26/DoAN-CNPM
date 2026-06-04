const CONFIG = {
    EMOJIS: ['🍎','🍌','🍉','🍇','🍓','🍒','🍍','🥝','🥑','🌽','🥕','🍕','🍔','🍟','🌭','🍿','🍩','🍰','🧊','🚀'],
    DIFFICULTY_MAP: {
        16: { cols: 4, time: 60 },
        24: { cols: 6, time: 90 },
        36: { cols: 6, time: 120 }
    },
    POINTS_PER_MATCH: 10,
    COMBO_TIMEOUT: 3000 // 3 giây để giữ combo
};

// State chung của toàn bộ ứng dụng
const AppState = {
    currentUser: null,
    isMultiplayer: false,
    difficulty: 16
};