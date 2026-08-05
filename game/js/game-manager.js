// ============================================
// GAME MANAGER
// Ojol Game Portal - Game Manager
// Version: 1.0.0
// ============================================

class GameManager {
    constructor() {
        // State
        this.games = [];
        this.unlockedLevels = {};
        this.currentGame = null;
        this.currentLevel = 0;
        this.gamesPlayed = 0;
        this.isLoaded = false;
        this.loadingPromise = null;
        
        // Inisialisasi
        this.loadFromStorage();
        this.init();
    }

    // ============================================
    // INISIALISASI
    // ============================================
    
    async init() {
        console.log('🎮 Inisialisasi Game Manager...');
        
        try {
            await this.loadGamesConfig();
            this.isLoaded = true;
            console.log(`✅ ${this.games.length} game dimuat`);
            this.updateUI();
        } catch (error) {
            console.error('❌ Gagal load games config:', error);
            // Gunakan default games jika gagal load
            this.setDefaultGames();
        }
    }

    // ============================================
    // LOAD CONFIGURATION
    // ============================================
    
    async loadGamesConfig() {
        try {
            // Coba load dari berbagai path
            const paths = [
                'config/games.json',
                '../config/games.json',
                '../../config/games.json',
                './config/games.json'
            ];
            
            let data = null;
            let lastError = null;
            
            for (const path of paths) {
                try {
                    console.log(`📁 Mencoba load config dari: ${path}`);
                    const response = await fetch(path);
                    
                    if (response.ok) {
                        data = await response.json();
                        console.log(`✅ Config loaded dari: ${path}`);
                        break;
                    }
                } catch (error) {
                    lastError = error;
                    // Lanjut ke path berikutnya
                }
            }
            
            if (data && data.games) {
                this.games = data.games;
                return;
            }
            
            // Jika semua path gagal, coba gunakan data inline
            console.warn('⚠️ Gagal load dari file, menggunakan data inline');
            this.setDefaultGames();
            
        } catch (error) {
            console.error('❌ Error loading config:', error);
            this.setDefaultGames();
        }
    }

    setDefaultGames() {
        // Default games jika config tidak ditemukan
        this.games = [
            {
                id: 'tebak-angka',
                title: 'Tebak Angka Premium',
                description: 'Tebak angka yang benar dengan batas waktu!',
                thumbnail: 'https://alyne.id/hybrid/game/assets/images/tebak-angka.jpg',
                price: 10,
                levels: 5,
                level1Free: true,
                contractAddress: '0x0cCB00abb35109FF33F0AbaB1C07915900954695',
                paymentAddress: '0x0F451D746EFD63397d413eD6d4A994356ba61421'
            }
        ];
        console.log('📋 Menggunakan default games');
    }

    // ============================================
    // STORAGE MANAGEMENT
    // ============================================
    
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('ojolGamePortalData');
            if (saved) {
                const data = JSON.parse(saved);
                this.unlockedLevels = data.unlockedLevels || {};
                this.gamesPlayed = data.gamesPlayed || 0;
                console.log('💾 Data dimuat dari storage:', this.unlockedLevels);
            } else {
                // Initialize dengan level 1 selalu unlocked
                this.unlockedLevels = {};
                console.log('📝 Data storage kosong, inisialisasi baru');
            }
        } catch (error) {
            console.error('❌ Error loading from storage:', error);
            this.unlockedLevels = {};
            this.gamesPlayed = 0;
        }
    }

    saveToStorage() {
        try {
            const data = {
                unlockedLevels: this.unlockedLevels,
                gamesPlayed: this.gamesPlayed
            };
            localStorage.setItem('ojolGamePortalData', JSON.stringify(data));
            console.log('💾 Data tersimpan:', data);
        } catch (error) {
            console.error('❌ Error saving to storage:', error);
        }
    }

    // ============================================
    // GAME OPERATIONS
    // ============================================
    
    getGame(gameId) {
        return this.games.find(g => g.id === gameId) || null;
    }

    getAllGames() {
        return this.games;
    }

    isLevelUnlocked(gameId, level) {
        // Level 1 selalu gratis
        if (level === 1) return true;
        
        const key = `${gameId}-level-${level}`;
        return this.unlockedLevels[key] === true;
    }

    getUnlockedLevels(gameId) {
        const game = this.getGame(gameId);
        if (!game) return [];
        
        const unlocked = [];
        for (let level = 1; level <= game.levels; level++) {
            if (this.isLevelUnlocked(gameId, level)) {
                unlocked.push(level);
            }
        }
        return unlocked;
    }

    getUnlockCount(gameId) {
        const game = this.getGame(gameId);
        if (!game) return 0;
        
        let count = 0;
        for (let level = 2; level <= game.levels; level++) {
            if (this.isLevelUnlocked(gameId, level)) count++;
        }
        return count;
    }

    isFullyUnlocked(gameId) {
        const game = this.getGame(gameId);
        if (!game) return false;
        
        const unlocked = this.getUnlockedLevels(gameId);
        return unlocked.length === game.levels;
    }

    // ============================================
    // UNLOCK SYSTEM
    // ============================================
    
// ============================================
// GAME MANAGER - FIXED UNLOCK
// ============================================

async unlockLevel(gameId, level) {
    console.log(`🔓 Attempting to unlock ${gameId} level ${level}`);
    
    const game = this.getGame(gameId);
    if (!game) {
        return { success: false, error: 'Game tidak ditemukan' };
    }
    
    if (this.isLevelUnlocked(gameId, level)) {
        return { success: true, message: 'Level sudah terbuka' };
    }
    
    if (level === 1) {
        return { success: true, message: 'Level 1 gratis' };
    }
    
    // Cek wallet
    if (typeof walletManager === 'undefined' || !walletManager.isConnected) {
        return { success: false, error: 'Wallet belum terhubung' };
    }
    
    // Cek saldo
    const balance = walletManager.balance || 0;
    const price = game.price || 10;
    
    if (balance < price) {
        return { 
            success: false, 
            error: `Saldo tidak cukup! Saldo: ${balance.toFixed(2)} OJOL, Harga: ${price} OJOL` 
        };
    }
    
    try {
        // Proses pembayaran via walletManager
        console.log(`💳 Memproses pembayaran ${price} OJOL...`);
        
        // Pastikan price adalah number yang valid
        const priceNumber = Number(price);
        if (isNaN(priceNumber) || priceNumber <= 0) {
            return { success: false, error: 'Harga tidak valid' };
        }
        
        const result = await walletManager.payForLevel(priceNumber);
        
        if (result.success) {
            // Simpan unlock
            const key = `${gameId}-level-${level}`;
            this.unlockedLevels[key] = true;
            this.saveToStorage();
            
            this.updateUI();
            
            console.log(`✅ Level ${level} berhasil di-unlock!`);
            return { 
                success: true, 
                message: `Level ${level} berhasil dibuka!`,
                txHash: result.txHash 
            };
        } else {
            return { 
                success: false, 
                error: result.error || 'Pembayaran gagal' 
            };
        }
        
    } catch (error) {
        console.error('❌ Unlock error:', error);
        return { 
            success: false, 
            error: error.message || 'Terjadi kesalahan saat unlock' 
        };
    }
}
    unlockAllLevels(gameId) {
        const game = this.getGame(gameId);
        if (!game) return;
        
        let unlocked = 0;
        for (let level = 2; level <= game.levels; level++) {
            const key = `${gameId}-level-${level}`;
            if (!this.unlockedLevels[key]) {
                this.unlockedLevels[key] = true;
                unlocked++;
            }
        }
        
        if (unlocked > 0) {
            this.saveToStorage();
            this.updateUI();
            console.log(`✅ ${unlocked} level di-unlock untuk ${gameId}`);
        }
    }

    // ============================================
    // STATISTICS
    // ============================================
    
    incrementGamesPlayed() {
        this.gamesPlayed++;
        this.saveToStorage();
        this.updateUI();
        console.log(`📊 Total game dimainkan: ${this.gamesPlayed}`);
    }

    getGamesPlayed() {
        return this.gamesPlayed;
    }

    getTotalUnlocked() {
        let total = 0;
        this.games.forEach(game => {
            total += this.getUnlockCount(game.id);
        });
        return total;
    }

    getGameProgress(gameId) {
        const game = this.getGame(gameId);
        if (!game) return { total: 0, unlocked: 0, percentage: 0 };
        
        const unlocked = this.getUnlockedLevels(gameId);
        const total = game.levels;
        return {
            total,
            unlocked: unlocked.length,
            percentage: Math.round((unlocked.length / total) * 100)
        };
    }

    // ============================================
    // UI UPDATE
    // ============================================
    
    updateUI() {
        console.log('🔄 Updating UI...');
        
        // Update stats di portal
        this.updateStatsUI();
        
        // Update game cards
        this.renderGameCards();
    }

    updateStatsUI() {
        // Update elemen statistik di portal
        const totalGamesEl = document.getElementById('total-games');
        const gamesPlayedEl = document.getElementById('games-played');
        const totalUnlockedEl = document.getElementById('total-unlocked');
        
        if (totalGamesEl) {
            totalGamesEl.textContent = this.games.length;
        }
        
        if (gamesPlayedEl) {
            gamesPlayedEl.textContent = this.gamesPlayed;
        }
        
        if (totalUnlockedEl) {
            totalUnlockedEl.textContent = this.getTotalUnlocked();
        }
    }

    renderGameCards() {
        const grid = document.getElementById('game-grid');
        if (!grid) return;
        
        if (this.games.length === 0) {
            grid.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <p>Belum ada game tersedia</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = '';
        this.games.forEach(game => {
            const card = this.createGameCard(game);
            grid.appendChild(card);
        });
    }

createGameCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.dataset.gameId = game.id;
    
    const progress = this.getGameProgress(game.id);
    const isFullUnlocked = progress.unlocked === progress.total;
    
    // Status text
    let statusText = '🔓 Gratis';
    let statusClass = 'status-free';
    
    if (isFullUnlocked) {
        statusText = '✅ Full Unlocked';
        statusClass = 'status-unlocked';
    } else if (progress.unlocked > 1) {
        statusText = `${progress.unlocked - 1}/${game.levels - 1} Unlocked`;
        statusClass = 'status-unlocked';
    } else {
        statusText = `${game.price} OJOL`;
        statusClass = 'status-locked';
    }
    
    const progressPercentage = progress.percentage;
    
    // 🔥 FIX: Tampilkan thumbnail dengan benar
    let thumbnailContent = '';
    const thumbnail = game.thumbnail || '🎮';
    
    // Cek apakah thumbnail adalah emoji atau path gambar
    const isImagePath = thumbnail && (thumbnail.startsWith('http') || thumbnail.startsWith('/') || thumbnail.startsWith('assets/') || thumbnail.startsWith('./'));
    
    if (isImagePath) {
        // Thumbnail adalah path gambar
        thumbnailContent = `
            <img src="${thumbnail}" alt="${game.title}" loading="lazy">
            <div class="thumbnail-overlay"></div>
            <div class="thumbnail-emoji" style="position:absolute;z-index:2;font-size:48px;opacity:0.3;">${game.emoji || '🎮'}</div>
        `;
    } else {
        // Thumbnail adalah emoji
        thumbnailContent = `
            <span class="thumbnail-emoji">${thumbnail}</span>
        `;
    }
    
    card.innerHTML = `
        <div class="game-thumbnail" style="background: linear-gradient(135deg, var(--gojek-green-bg), #d4edda);">
            ${thumbnailContent}
            <span class="level-badge">${game.levels} Levels</span>
            ${progressPercentage > 0 && progressPercentage < 100 ? `
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercentage}%;"></div>
                </div>
            ` : ''}
        </div>
        <div class="game-info">
            <div class="game-title">${game.title}</div>
            <div class="game-description">${game.description || 'Game seru dengan 5 level!'}</div>
            <div class="game-meta">
                <span class="game-price">${statusText}</span>
                <span class="game-status ${statusClass}">${statusText}</span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        this.openGame(game.id);
    });
    
    return card;
}
    // ============================================
    // NAVIGATION
    // ============================================
    
    openGame(gameId) {
        this.currentGame = gameId;
        const game = this.getGame(gameId);
        if (!game) {
            console.error(`❌ Game ${gameId} tidak ditemukan`);
            alert('Game tidak ditemukan!');
            return;
        }
        
        console.log(`🚀 Membuka game: ${game.title}`);
        
        // Navigate ke halaman game
        // Coba berbagai path
        const paths = [
            `games/${gameId}/index.html?gameId=${gameId}`,
            `../games/${gameId}/index.html?gameId=${gameId}`,
            `./games/${gameId}/index.html?gameId=${gameId}`
        ];
        
        for (const path of paths) {
            try {
                // Cek apakah file exists dengan fetch
                fetch(path, { method: 'HEAD' })
                    .then(response => {
                        if (response.ok) {
                            window.location.href = path;
                        }
                    })
                    .catch(() => {
                        // Coba path berikutnya
                    });
            } catch (e) {
                // Skip
            }
        }
        
        // Fallback: langsung redirect
        setTimeout(() => {
            window.location.href = `games/${gameId}/index.html?gameId=${gameId}`;
        }, 100);
    }

    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    
    getGameById(gameId) {
        return this.getGame(gameId);
    }

    getGameTitle(gameId) {
        const game = this.getGame(gameId);
        return game ? game.title : gameId;
    }

    getGamePrice(gameId) {
        const game = this.getGame(gameId);
        return game ? game.price : 0;
    }

    getMaxLevel(gameId) {
        const game = this.getGame(gameId);
        return game ? game.levels : 0;
    }

    // ============================================
    // RESET & MAINTENANCE
    // ============================================
    
    resetProgress(gameId = null) {
        if (gameId) {
            // Reset progress untuk game tertentu
            const game = this.getGame(gameId);
            if (game) {
                for (let level = 2; level <= game.levels; level++) {
                    const key = `${gameId}-level-${level}`;
                    delete this.unlockedLevels[key];
                }
                console.log(`🔄 Progress reset untuk ${gameId}`);
            }
        } else {
            // Reset semua progress
            this.unlockedLevels = {};
            this.gamesPlayed = 0;
            console.log('🔄 Semua progress direset');
        }
        
        this.saveToStorage();
        this.updateUI();
    }

    reload() {
        console.log('🔄 Reloading Game Manager...');
        this.loadFromStorage();
        this.loadGamesConfig();
        this.updateUI();
    }
}

// ============================================
// INISIALISASI GLOBAL
// ============================================

// Buat instance global
let gameManager = null;

// Inisialisasi saat DOM siap
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM ready, initializing Game Manager...');
    
    // Tunggu sebentar agar wallet manager siap
    setTimeout(() => {
        if (typeof gameManager === 'undefined' || gameManager === null) {
            gameManager = new GameManager();
            console.log('✅ Game Manager initialized');
        }
    }, 100);
});

// Jika gameManager belum terdefinisi, inisialisasi sekarang
if (typeof gameManager === 'undefined' || gameManager === null) {
    // Tunggu sampai DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof gameManager === 'undefined' || gameManager === null) {
                gameManager = new GameManager();
            }
        });
    } else {
        gameManager = new GameManager();
    }
}

// ============================================
// EXPOSE UNTUK DEBUGGING
// ============================================

window.__gameManagerDebug = {
    manager: () => gameManager,
    games: () => gameManager ? gameManager.getAllGames() : [],
    unlocked: () => gameManager ? gameManager.unlockedLevels : {},
    reset: (gameId) => gameManager ? gameManager.resetProgress(gameId) : null,
    unlockAll: (gameId) => gameManager ? gameManager.unlockAllLevels(gameId) : null,
    reload: () => gameManager ? gameManager.reload() : null
};

console.log('🛠️ Debug: Type __gameManagerDebug di console untuk testing');

// ============================================
// END OF FILE
// ============================================