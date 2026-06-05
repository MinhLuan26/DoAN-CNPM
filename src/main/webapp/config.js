const CONFIG = {
    // Danh sách biểu tượng dùng để tạo cặp thẻ
    // Lưu ý: 20 emoji = tối đa 40 thẻ, vì mỗi emoji xuất hiện 2 lần
    EMOJIS: [
        '🍎','🍌','🍉','🍇','🍓',
        '🍒','🍍','🥝','🥑','🌽',
        '🥕','🍕','🍔','🍟','🌭',
        '🍿','🍩','🍰','🧊','🚀'
    ],

    // Cấu hình 10 màn chơi
    // Số bên trái là tổng số thẻ
    // cols: số cột của bàn chơi
    // time: thời gian hoàn thành màn, tính bằng giây
    DIFFICULTY_MAP: {
        4:  { cols: 2, time: 30 },   // Màn 1: 2 cặp, rất dễ để làm quen
        6:  { cols: 3, time: 40 },   // Màn 2: tăng nhẹ số cặp
        8:  { cols: 4, time: 50 },   // Màn 3: bàn 4 cột, dễ nhìn
        10: { cols: 5, time: 60 },   // Màn 4: bắt đầu cần nhớ vị trí tốt hơn
        12: { cols: 4, time: 70 },   // Màn 5: nhiều cặp hơn
        16: { cols: 4, time: 90 },   // Màn 6: dạng 4x4 quen thuộc
        20: { cols: 5, time: 110 },  // Màn 7: 10 cặp, độ khó trung bình
        24: { cols: 6, time: 130 },  // Màn 8: bàn lớn hơn
        30: { cols: 6, time: 160 },  // Màn 9: khó, cần nhớ nhiều vị trí
        40: { cols: 8, time: 210 }   // Màn 10: khó nhất, dùng đủ 20 emoji
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