const CONFIG = {
    // Danh sách biểu tượng dùng để tạo cặp thẻ
    // Lưu ý: 20 emoji = tối đa 40 thẻ, vì mỗi emoji xuất hiện 2 lần
	EMOJIS: [
	        '🍎','🍌','🍉','🍇','🍓',
	        '🍒','🍍','🥝','🥑','🌽',
	        '🥕','🍕','🍔','🍟','🌭',
	        '🍿','🍩','🍰','🧊','🚀',
	        '🌟','🎈','🎨','🎸','🎮',
	        '🐼','🦁','🦊','🐱','🐨'
	],

	    // Cấu hình dựa trên kích thước cạnh lưới X (2x2, 3x3, 4x4...)
	DIFFICULTY_MAP: {
	        2: { time: 30 },   // Lưới 2x2 (4 ô - 2 cặp)
	        3: { time: 50 },   // Lưới 3x3 (9 ô - 4 cặp + 1 ô trống trung tâm)
	        4: { time: 90 },   // Lưới 4x4 (16 ô - 8 cặp)
	        5: { time: 140 },  // Lưới 5x5 (25 ô - 12 cặp + 1 ô trống trung tâm)
	        6: { time: 180 }   // Lưới 6x6 (36 ô - 18 cặp)
	},

    POINTS_PER_MATCH: 10,

    // Trong 3 giây nếu lật đúng tiếp thì được giữ combo
    COMBO_TIMEOUT: 3000
};

// State chung của toàn bộ ứng dụng
const AppState = {
    currentUser: null,
    isMultiplayer: false,

    // Màn mặc định khi vào game
    difficulty: 4
};