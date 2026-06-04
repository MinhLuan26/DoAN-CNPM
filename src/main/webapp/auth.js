const Auth = {
    login: async (username, password) => {
        const res = await fetch('/api/auth', {
            method: 'POST',
            body: `action=login&user=${username}&pass=${password}`
        });
        const data = await res.json();
        if (data.success) AppState.currentUser = username;
        return data;
    },

    register: async (username, password) => {
        const res = await fetch('/api/auth', {
            method: 'POST',
            body: `action=register&user=${username}&pass=${password}`
        });
        return await res.json();
    },

    saveScore: async (score) => {
        if (!AppState.currentUser) return;
        await fetch('/api/score', {
            method: 'POST',
            body: `user=${AppState.currentUser}&score=${score}`
        });
    },

    getLeaderboard: async () => {
        const res = await fetch('/api/leaderboard');
        return await res.json();
    }
};