// ============================================
// GAME: TEBAK ANGKA PREMIUM
// Version: 4.0.0 (Using Event Delegation)
// ============================================

class GuessNumberGame {
    constructor() {
        // Konfigurasi dasar
        this.gameId = 'tebak-angka';
        this.currentLevel = 1;
        this.targetNumber = 0;
        this.attempts = 0;
        this.maxAttempts = 5;
        this.timeLimit = 30;
        this.timeRemaining = 30;
        this.timerInterval = null;
        this.isPlaying = false;
        this.gameOver = false;
        this.isProcessing = false;
        this.isInitialized = false;
        this.retryCount = 0;
        this.maxRetries = 5;
        
        // Data game
        this.gameConfig = null;
        this.unlockedLevels = [];
        this.bestScores = this.loadBestScores();
        
        // DOM Elements cache
        this.elements = {};
        
        // Binding methods
        this.handleGuess = this.handleGuess.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleModalClick = this.handleModalClick.bind(this);
        this.handleEscKey = this.handleEscKey.bind(this);
        this.handleGlobalClick = this.handleGlobalClick.bind(this);
        
        // Mulai inisialisasi
        this.init();
    }

    // ============================================
    // INISIALISASI
    // ============================================
    
    async init() {
        console.log('🎮 Inisialisasi Game Tebak Angka...');
        
        // Tunggu DOM siap
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }
        
        // Tunggu sebentar agar elemen benar-benar siap
        await this.waitForElements();
        
        // Cache DOM elements
        this.cacheElements();
        
        // Cek apakah elemen penting ada
        if (!this.validateElements()) {
            console.warn('⚠️ Elemen belum siap, mencoba lagi...');
            this.retryCount++;
            if (this.retryCount < this.maxRetries) {
                setTimeout(() => this.init(), 500);
                return;
            } else {
                this.showError('Gagal memuat game. Silakan refresh halaman.');
                return;
            }
        }
        
        // Cek koneksi wallet
        const isConnected = await this.checkWalletConnection();
        
        if (!isConnected) {
            this.showConnectWalletUI();
            return;
        }
        
        // Load data game
        this.loadGameData();
        
        // Render UI
        this.renderLevelButtons();
        this.setupEventListeners();
        this.startLevel(1);
        this.updateWalletStatus();
        
        // Auto-refresh balance setiap 10 detik
        this.balanceInterval = setInterval(() => this.updateWalletStatus(), 10000);
        
        this.isInitialized = true;
        console.log('✅ Game siap dimainkan!');
    }

    // ============================================
    // WAIT FOR ELEMENTS
    // ============================================
    
    async waitForElements() {
        const requiredIds = [
            'game-play-area',
            'level-selector',
            'guess-input',
            'guess-btn'
        ];
        
        let attempts = 0;
        const maxAttempts = 20;
        
        while (attempts < maxAttempts) {
            const allFound = requiredIds.every(id => document.getElementById(id) !== null);
            if (allFound) {
                console.log('✅ Semua elemen ditemukan');
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 200));
            attempts++;
        }
        
        console.warn('⚠️ Tidak semua elemen ditemukan setelah menunggu');
        return false;
    }

    // ============================================
    // DOM ELEMENTS CACHING
    // ============================================
    
    cacheElements() {
        console.log('📦 Caching DOM elements...');
        
        // Daftar elemen yang dibutuhkan
        const elementIds = [
            'game-play-area',
            'level-selector',
            'current-level-display',
            'attempts-display',
            'timer-display',
            'guess-display',
            'hint-text',
            'guess-input',
            'guess-btn',
            'message-area',
            'score-level',
            'score-attempts',
            'score-best',
            'unlock-modal',
            'unlock-price',
            'unlock-balance',
            'unlock-message',
            'unlock-confirm-btn'
        ];
        
        // Cache semua elemen
        let found = 0;
        elementIds.forEach(id => {
            const element = document.getElementById(id);
            this.elements[id] = element;
            if (element) {
                found++;
            } else {
                console.warn(`⚠️ Elemen tidak ditemukan: #${id}`);
            }
        });
        
        console.log(`✅ ${found}/${elementIds.length} elemen ditemukan`);
    }

    validateElements() {
        // Elemen wajib
        const required = [
            'game-play-area',
            'level-selector',
            'guess-input',
            'guess-btn'
        ];
        
        const missing = required.filter(id => !this.elements[id]);
        
        if (missing.length > 0) {
            console.warn(`⚠️ Elemen wajib hilang: ${missing.join(', ')}`);
            return false;
        }
        
        return true;
    }

    // ============================================
    // ERROR HANDLING
    // ============================================
    
    showError(message) {
        const playArea = this.elements['game-play-area'] || document.getElementById('game-play-area');
        if (playArea) {
            playArea.innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                    <h3 style="color: var(--danger-color);">Error</h3>
                    <p style="color: var(--text-secondary); margin: 20px 0;">${message}</p>
                    <button class="btn-connect" onclick="window.location.reload()" style="font-size: 16px; padding: 12px 30px;">
                        🔄 Reload Halaman
                    </button>
                </div>
            `;
        }
    }

    // ============================================
    // WALLET MANAGEMENT
    // ============================================
    
    async checkWalletConnection() {
        try {
            if (typeof walletManager === 'undefined') {
                console.warn('Wallet Manager tidak ditemukan');
                return false;
            }
            
            if (walletManager.isConnected) {
                console.log('✅ Wallet sudah terhubung:', walletManager.account);
                return true;
            }
            
            console.log('⏳ Mencoba menghubungkan wallet...');
            const result = await walletManager.connect();
            
            if (result && result.success) {
                console.log('✅ Wallet berhasil terhubung:', result.account);
                return true;
            } else {
                console.warn('❌ Gagal konek wallet:', result?.error || 'Unknown error');
                return false;
            }
        } catch (error) {
            console.error('Error checking wallet:', error);
            return false;
        }
    }

    showConnectWalletUI() {
        const playArea = this.elements['game-play-area'] || document.getElementById('game-play-area');
        if (!playArea) return;
        
        playArea.innerHTML = `
            <div class="connect-wallet-ui">
                <div class="icon">🔗</div>
                <h3>Hubungkan Wallet</h3>
                <p>
                    Untuk memainkan game ini, Anda perlu menghubungkan wallet terlebih dahulu.<br>
                    <span style="font-size: 14px; color: var(--text-secondary);">
                        🦊 Pastikan menggunakan <strong>MetaMask</strong> di jaringan <strong>BSC Mainnet</strong>
                    </span>
                </p>
                <button class="btn-connect" onclick="window.handleConnectWallet()" 
                        style="font-size: 18px; padding: 14px 40px; margin-top: 10px;">
                    🔌 Hubungkan Wallet
                </button>
                <div class="connect-status" id="connect-status">
                    ⏳ Klik tombol di atas untuk menghubungkan
                </div>
            </div>
        `;
        
        // Update status
        const statusEl = document.getElementById('connect-status');
        if (statusEl) {
            if (typeof window.ethereum === 'undefined') {
                statusEl.innerHTML = '❌ MetaMask tidak terdeteksi. <a href="https://metamask.io/download/" target="_blank" style="color: var(--accent-color); text-decoration: underline;">Install MetaMask</a>';
                statusEl.style.color = 'var(--danger-color)';
            }
        }
    }

    async updateWalletStatus() {
        if (!walletManager || !walletManager.isConnected) return;
        
        try {
            await walletManager.updateBalance();
            const balance = walletManager.balance || 0;
            
            const unlockBalance = this.elements['unlock-balance'] || document.getElementById('unlock-balance');
            if (unlockBalance) {
                unlockBalance.textContent = `${balance.toFixed(2)} OJOL`;
            }
        } catch (error) {
            console.error('Error updating wallet status:', error);
        }
    }

    // ============================================
    // GAME DATA
    // ============================================
    
    loadGameData() {
        const params = new URLSearchParams(window.location.search);
        const gameId = params.get('gameId');
        if (gameId) {
            this.gameId = gameId;
        }
        
        if (typeof gameManager !== 'undefined' && gameManager) {
            this.gameConfig = gameManager.getGame(this.gameId);
            if (!this.gameConfig) {
                console.warn('Game tidak ditemukan, menggunakan default');
                this.gameConfig = {
                    id: 'tebak-angka',
                    title: 'Tebak Angka Premium',
                    levels: 5,
                    price: 10,
                    description: 'Tebak angka yang benar dengan batas waktu!'
                };
            }
            
            this.unlockedLevels = [];
            if (this.gameConfig) {
                for (let level = 1; level <= this.gameConfig.levels; level++) {
                    if (gameManager.isLevelUnlocked(this.gameId, level)) {
                        this.unlockedLevels.push(level);
                    }
                }
            }
        } else {
            this.gameConfig = {
                id: 'tebak-angka',
                title: 'Tebak Angka Premium',
                levels: 5,
                price: 10,
                description: 'Tebak angka yang benar dengan batas waktu!'
            };
            this.unlockedLevels = [1];
        }
        
        console.log('📋 Game config:', this.gameConfig);
        console.log('🔓 Unlocked levels:', this.unlockedLevels);
    }

    loadBestScores() {
        try {
            const saved = localStorage.getItem(`bestScores_${this.gameId}`);
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    }

    saveBestScore(level, attempts) {
        if (!this.bestScores[level] || attempts < this.bestScores[level]) {
            this.bestScores[level] = attempts;
            try {
                localStorage.setItem(`bestScores_${this.gameId}`, JSON.stringify(this.bestScores));
            } catch (error) {
                console.error('Error saving best score:', error);
            }
        }
    }

    // ============================================
    // DIFFICULTY CONFIG
    // ============================================
    
    getDifficulty(level) {
        const difficulties = {
            1: { max: 10, attempts: 5, timeLimit: 30, label: 'Mudah' },
            2: { max: 25, attempts: 4, timeLimit: 20, label: 'Sedang' },
            3: { max: 50, attempts: 4, timeLimit: 15, label: 'Sulit' },
            4: { max: 75, attempts: 3, timeLimit: 12, label: 'Sangat Sulit' },
            5: { max: 100, attempts: 3, timeLimit: 10, label: 'Expert' }
        };
        return difficulties[level] || difficulties[1];
    }

    // ============================================
    // UI RENDER
    // ============================================
    
    renderLevelButtons() {
        const container = this.elements['level-selector'] || document.getElementById('level-selector');
        if (!container) {
            console.warn('Level selector container not found');
            return;
        }
        
        container.innerHTML = '';
        
        if (!this.gameConfig) {
            container.innerHTML = '<p style="color: var(--text-secondary);">Error loading game config</p>';
            return;
        }
        
        for (let level = 1; level <= this.gameConfig.levels; level++) {
            const btn = document.createElement('button');
            btn.className = 'level-btn';
            btn.dataset.level = level;
            btn.id = `level-btn-${level}`;
            
            const isUnlocked = level === 1 || this.unlockedLevels.includes(level);
            if (isUnlocked) {
                btn.classList.add('unlocked');
                btn.textContent = `Level ${level}`;
            } else {
                btn.classList.add('locked');
                btn.textContent = `Level ${level} 🔒`;
                btn.title = `Buka dengan ${this.gameConfig.price} OJOL`;
            }
            
            if (level === this.currentLevel) {
                btn.classList.add('active');
            }
            
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const levelNum = parseInt(btn.dataset.level);
                this.selectLevel(levelNum);
            });
            
            container.appendChild(btn);
        }
    }

    renderGameUI(level) {
        const difficulty = this.getDifficulty(level);
        
        // Update header
        const currentLevelEl = this.elements['current-level-display'] || document.getElementById('current-level-display');
        if (currentLevelEl) currentLevelEl.textContent = level;
        
        // Update hint
        const hintTextEl = this.elements['hint-text'] || document.getElementById('hint-text');
        if (hintTextEl) {
            hintTextEl.textContent = `Tebak angka antara 1 - ${difficulty.max} (${difficulty.label})`;
        }
        
        // Update input
        const guessInputEl = this.elements['guess-input'] || document.getElementById('guess-input');
        if (guessInputEl) {
            guessInputEl.max = difficulty.max;
            guessInputEl.placeholder = `1-${difficulty.max}`;
            guessInputEl.min = 1;
            guessInputEl.disabled = false;
            guessInputEl.value = '';
            setTimeout(() => guessInputEl.focus(), 100);
            // Update cache
            this.elements['guess-input'] = guessInputEl;
        }
        
        // Update button
        const guessBtnEl = this.elements['guess-btn'] || document.getElementById('guess-btn');
        if (guessBtnEl) {
            guessBtnEl.disabled = false;
            this.elements['guess-btn'] = guessBtnEl;
        }
        
        // Update score
        const scoreLevelEl = this.elements['score-level'] || document.getElementById('score-level');
        if (scoreLevelEl) scoreLevelEl.textContent = level;
        
        const scoreBestEl = this.elements['score-best'] || document.getElementById('score-best');
        if (scoreBestEl) {
            const best = this.bestScores[level];
            scoreBestEl.textContent = best ? `${best}x` : '-';
        }
        
        // Reset display
        const guessDisplayEl = this.elements['guess-display'] || document.getElementById('guess-display');
        if (guessDisplayEl) guessDisplayEl.textContent = '?';
        
        const attemptsEl = this.elements['attempts-display'] || document.getElementById('attempts-display');
        if (attemptsEl) attemptsEl.textContent = '0';
        
        const scoreAttemptsEl = this.elements['score-attempts'] || document.getElementById('score-attempts');
        if (scoreAttemptsEl) scoreAttemptsEl.textContent = '0';
        
        const messageAreaEl = this.elements['message-area'] || document.getElementById('message-area');
        if (messageAreaEl) messageAreaEl.innerHTML = '';
        
        // Update timer
        const timerEl = this.elements['timer-display'] || document.getElementById('timer-display');
        if (timerEl) {
            timerEl.textContent = `${this.timeLimit}s`;
            timerEl.style.color = 'var(--accent-color)';
        }
    }

    // ============================================
    // LEVEL MANAGEMENT
    // ============================================
    
    selectLevel(level) {
        const isUnlocked = level === 1 || this.unlockedLevels.includes(level);
        
        if (!isUnlocked) {
            this.showUnlockModal(level);
            return;
        }
        
        if (this.isPlaying && !this.gameOver) {
            if (!confirm('Game sedang berlangsung. Yakin ingin pindah level?')) {
                return;
            }
        }
        
        this.currentLevel = level;
        this.startLevel(level);
        this.renderLevelButtons();
    }

    startLevel(level) {
        this.stopTimer();
        
        this.currentLevel = level;
        this.attempts = 0;
        this.gameOver = false;
        this.isPlaying = true;
        this.isProcessing = false;
        
        const difficulty = this.getDifficulty(level);
        this.targetNumber = Math.floor(Math.random() * difficulty.max) + 1;
        this.maxAttempts = difficulty.attempts;
        this.timeLimit = difficulty.timeLimit;
        this.timeRemaining = this.timeLimit;
        
        this.renderGameUI(level);
        this.startTimer();
        
        console.log(`🎯 Level ${level} dimulai! Target: ${this.targetNumber} (1-${difficulty.max})`);
    }

    // ============================================
    // TIMER
    // ============================================
    
    startTimer() {
        this.stopTimer();
        this.timeRemaining = this.timeLimit;
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();
            
            const timerEl = this.elements['timer-display'] || document.getElementById('timer-display');
            if (timerEl) {
                timerEl.style.color = this.timeRemaining <= 5 ? 'var(--danger-color)' : 'var(--accent-color)';
            }
            
            if (this.timeRemaining <= 0) {
                this.endGame(false, '⏰ Waktu habis!');
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        const timerEl = this.elements['timer-display'] || document.getElementById('timer-display');
        if (timerEl) {
            timerEl.textContent = `${this.timeRemaining}s`;
        }
    }

    // ============================================
    // GAME LOGIC
    // ============================================
    
    handleGuess() {
        if (!this.isPlaying || this.gameOver || this.isProcessing) return;
        
        const guessInputEl = this.elements['guess-input'] || document.getElementById('guess-input');
        if (!guessInputEl) return;
        
        const input = guessInputEl;
        const guess = parseInt(input.value);
        const difficulty = this.getDifficulty(this.currentLevel);
        
        if (isNaN(guess) || guess < 1 || guess > difficulty.max) {
            this.showMessage(`Masukkan angka antara 1 - ${difficulty.max}!`, 'error');
            input.value = '';
            input.focus();
            return;
        }
        
        this.isProcessing = true;
        this.attempts++;
        
        const attemptsEl = this.elements['attempts-display'] || document.getElementById('attempts-display');
        if (attemptsEl) attemptsEl.textContent = this.attempts;
        
        const scoreAttemptsEl = this.elements['score-attempts'] || document.getElementById('score-attempts');
        if (scoreAttemptsEl) scoreAttemptsEl.textContent = this.attempts;
        
        const guessDisplayEl = this.elements['guess-display'] || document.getElementById('guess-display');
        if (guessDisplayEl) guessDisplayEl.textContent = guess;
        
        if (guess === this.targetNumber) {
            this.endGame(true);
        } else {
            const hint = guess < this.targetNumber ? '📈 Terlalu kecil!' : '📉 Terlalu besar!';
            const remaining = this.maxAttempts - this.attempts;
            this.showMessage(`${hint} (Sisa ${remaining} percobaan)`, 'info');
            
            setTimeout(() => {
                if (guessDisplayEl) guessDisplayEl.textContent = '?';
            }, 500);
            
            input.value = '';
            input.focus();
            
            if (this.attempts >= this.maxAttempts) {
                this.endGame(false, `😅 Percobaan habis! Angka yang benar adalah ${this.targetNumber}`);
            }
        }
        
        this.isProcessing = false;
    }

    endGame(win, customMessage = null) {
        if (this.gameOver) return;
        
        this.gameOver = true;
        this.isPlaying = false;
        this.stopTimer();
        
        const guessInputEl = this.elements['guess-input'] || document.getElementById('guess-input');
        if (guessInputEl) guessInputEl.disabled = true;
        
        const guessBtnEl = this.elements['guess-btn'] || document.getElementById('guess-btn');
        if (guessBtnEl) guessBtnEl.disabled = true;
        
        const guessDisplayEl = this.elements['guess-display'] || document.getElementById('guess-display');
        
        if (win) {
            this.saveBestScore(this.currentLevel, this.attempts);
            this.showMessage(`🎉 Selamat! Anda menebak dengan ${this.attempts} percobaan!`, 'success');
            if (guessDisplayEl) guessDisplayEl.textContent = this.targetNumber;
            
            const scoreBestEl = this.elements['score-best'] || document.getElementById('score-best');
            if (scoreBestEl) {
                const best = this.bestScores[this.currentLevel];
                scoreBestEl.textContent = best ? `${best}x` : '-';
            }
            
            if (typeof gameManager !== 'undefined' && gameManager) {
                gameManager.incrementGamesPlayed();
            }
            
            const nextLevel = this.currentLevel + 1;
            if (nextLevel <= this.gameConfig.levels && !this.unlockedLevels.includes(nextLevel)) {
                this.unlockedLevels.push(nextLevel);
                if (typeof gameManager !== 'undefined' && gameManager) {
                    gameManager.unlockAllLevels(this.gameId);
                }
                this.renderLevelButtons();
                
                setTimeout(() => {
                    if (confirm(`🎯 Level ${nextLevel} sekarang terbuka! Lanjutkan?`)) {
                        this.selectLevel(nextLevel);
                    }
                }, 1000);
            }
        } else {
            const message = customMessage || '😅 Coba lagi!';
            this.showMessage(message, 'error');
            if (guessDisplayEl) guessDisplayEl.textContent = this.targetNumber;
            
            setTimeout(() => {
                if (confirm('🔄 Coba lagi?')) {
                    this.startLevel(this.currentLevel);
                }
            }, 800);
        }
    }

    showMessage(text, type = 'info') {
        const messageAreaEl = this.elements['message-area'] || document.getElementById('message-area');
        if (!messageAreaEl) return;
        
        const icons = { success: '✅', error: '❌', info: 'ℹ️' };
        messageAreaEl.innerHTML = `
            <div class="message ${type}">
                ${icons[type] || 'ℹ️'} ${text}
            </div>
        `;
    }

    // ============================================
    // UNLOCK MODAL
    // ============================================
    
    showUnlockModal(level) {
        const modal = this.elements['unlock-modal'] || document.getElementById('unlock-modal');
        if (!modal) {
            console.warn('Modal not found');
            return;
        }
        
        const price = this.gameConfig.price;
        const balance = walletManager && walletManager.isConnected ? 
            (walletManager.balance || 0) : 0;
        
        const unlockPriceEl = this.elements['unlock-price'] || document.getElementById('unlock-price');
        if (unlockPriceEl) unlockPriceEl.textContent = `${price} OJOL`;
        
        const unlockBalanceEl = this.elements['unlock-balance'] || document.getElementById('unlock-balance');
        if (unlockBalanceEl) unlockBalanceEl.textContent = `${balance.toFixed(2)} OJOL`;
        
        const unlockMessageEl = this.elements['unlock-message'] || document.getElementById('unlock-message');
        if (unlockMessageEl) unlockMessageEl.innerHTML = '';
        
        const confirmBtn = this.elements['unlock-confirm-btn'] || document.getElementById('unlock-confirm-btn');
        if (confirmBtn) {
            confirmBtn.onclick = async () => {
                await this.processUnlock(level);
            };
            confirmBtn.disabled = false;
            confirmBtn.textContent = `Bayar ${price} OJOL`;
        }
        
        modal.classList.add('active');
    }

    closeUnlockModal() {
        const modal = this.elements['unlock-modal'] || document.getElementById('unlock-modal');
        if (modal) modal.classList.remove('active');
        
        const unlockMessageEl = this.elements['unlock-message'] || document.getElementById('unlock-message');
        if (unlockMessageEl) unlockMessageEl.innerHTML = '';
        
        const confirmBtn = this.elements['unlock-confirm-btn'] || document.getElementById('unlock-confirm-btn');
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.textContent = `Bayar ${this.gameConfig.price} OJOL`;
        }
    }

    async processUnlock(level) {
        const confirmBtn = this.elements['unlock-confirm-btn'] || document.getElementById('unlock-confirm-btn');
        const messageEl = this.elements['unlock-message'] || document.getElementById('unlock-message');
        
        if (!confirmBtn || !messageEl) return;
        
        if (!walletManager || !walletManager.isConnected) {
            messageEl.innerHTML = `<div class="message error">❌ Wallet belum terhubung!</div>`;
            return;
        }
        
        const balance = walletManager.balance || 0;
        if (balance < this.gameConfig.price) {
            messageEl.innerHTML = `
                <div class="message error">
                    ❌ Saldo tidak cukup! Saldo: ${balance.toFixed(2)} OJOL, 
                    Harga: ${this.gameConfig.price} OJOL
                </div>
            `;
            return;
        }
        
        confirmBtn.disabled = true;
        confirmBtn.textContent = '⏳ Memproses...';
        messageEl.innerHTML = `<div class="message info">⏳ Memproses pembayaran...</div>`;
        
        try {
            const result = await gameManager.unlockLevel(this.gameId, level);
            
            if (result.success) {
                messageEl.innerHTML = `<div class="message success">✅ ${result.message}</div>`;
                
                if (!this.unlockedLevels.includes(level)) {
                    this.unlockedLevels.push(level);
                }
                
                this.renderLevelButtons();
                this.updateWalletStatus();
                
                setTimeout(() => {
                    this.closeUnlockModal();
                    this.startLevel(level);
                }, 1500);
            } else {
                messageEl.innerHTML = `<div class="message error">❌ ${result.error}</div>`;
                confirmBtn.disabled = false;
                confirmBtn.textContent = `Bayar ${this.gameConfig.price} OJOL`;
            }
        } catch (error) {
            console.error('Unlock error:', error);
            messageEl.innerHTML = `<div class="message error">❌ Error: ${error.message}</div>`;
            confirmBtn.disabled = false;
            confirmBtn.textContent = `Bayar ${this.gameConfig.price} OJOL`;
        }
    }

    // ============================================
    // EVENT LISTENERS - MENGGUNAKAN EVENT DELEGATION
    // ============================================
    
    setupEventListeners() {
        console.log('🔗 Setting up event listeners (using delegation)...');
        
        // === EVENT DELEGATION: Gunakan document body ===
        // Ini lebih aman karena tidak bergantung pada elemen spesifik
        
        // 1. Guess button - menggunakan event delegation
        document.removeEventListener('click', this.handleGlobalClick);
        document.addEventListener('click', this.handleGlobalClick);
        
        // 2. Guess input - menggunakan event delegation untuk keypress
        document.removeEventListener('keydown', this.handleKeyPress);
        document.addEventListener('keydown', this.handleKeyPress);
        
        // 3. Modal close - menggunakan event delegation
        document.removeEventListener('click', this.handleModalClick);
        document.addEventListener('click', this.handleModalClick);
        
        // 4. ESC key
        document.removeEventListener('keydown', this.handleEscKey);
        document.addEventListener('keydown', this.handleEscKey);
        
        console.log('✅ Event listeners set up with delegation');
    }

    // ============================================
    // GLOBAL EVENT HANDLERS (Event Delegation)
    // ============================================
    
    handleGlobalClick(e) {
        const target = e.target;
        
        // Cek jika yang diklik adalah guess button
        if (target && (target.id === 'guess-btn' || target.closest('#guess-btn'))) {
            e.preventDefault();
            this.handleGuess();
            return;
        }
        
        // Cek jika yang diklik adalah level button
        if (target && target.classList && target.classList.contains('level-btn')) {
            // Di-handle oleh listener individual di renderLevelButtons
            return;
        }
        
        // Cek jika yang diklik adalah unlock confirm button
        if (target && (target.id === 'unlock-confirm-btn' || target.closest('#unlock-confirm-btn'))) {
            // Di-handle oleh listener individual di showUnlockModal
            return;
        }
    }

    handleKeyPress(e) {
        // Hanya handle jika target adalah guess input
        const input = e.target;
        if (input && input.id === 'guess-input' && e.key === 'Enter') {
            e.preventDefault();
            this.handleGuess();
        }
    }

    handleModalClick(e) {
        const target = e.target;
        const modal = this.elements['unlock-modal'] || document.getElementById('unlock-modal');
        
        // Jika klik di luar modal (pada overlay)
        if (target === modal) {
            this.closeUnlockModal();
        }
        
        // Jika klik tombol close
        if (target && (target.classList && target.classList.contains('modal-close'))) {
            this.closeUnlockModal();
        }
    }

    handleEscKey(e) {
        if (e.key === 'Escape') {
            this.closeUnlockModal();
        }
    }

    // ============================================
    // CLEANUP
    // ============================================
    
    destroy() {
        this.stopTimer();
        if (this.balanceInterval) {
            clearInterval(this.balanceInterval);
            this.balanceInterval = null;
        }
        
        // Remove global event listeners
        document.removeEventListener('click', this.handleGlobalClick);
        document.removeEventListener('keydown', this.handleKeyPress);
        document.removeEventListener('click', this.handleModalClick);
        document.removeEventListener('keydown', this.handleEscKey);
        
        console.log('🧹 Game destroyed');
    }
}

// ============================================
// GLOBAL FUNCTIONS
// ============================================

window.handleConnectWallet = async function() {
    const statusEl = document.getElementById('connect-status');
    
    try {
        if (statusEl) {
            statusEl.textContent = '⏳ Menghubungkan...';
            statusEl.style.color = 'var(--accent-color)';
        }

        if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask tidak terdeteksi. Silakan install MetaMask!');
        }

        if (typeof walletManager === 'undefined') {
            throw new Error('Wallet Manager tidak ditemukan. Silakan reload halaman!');
        }

        const result = await walletManager.connect();
        
        if (result && result.success) {
            if (statusEl) {
                statusEl.textContent = '✅ Wallet terhubung! Memuat game...';
                statusEl.style.color = 'var(--success-color)';
            }
            
            showToast('Wallet berhasil terhubung!', 'success');
            
            setTimeout(() => {
                if (window.gameInstance) {
                    window.gameInstance.destroy();
                    window.gameInstance = null;
                }
                window.gameInstance = new GuessNumberGame();
            }, 500);
        } else {
            throw new Error(result?.error || 'Gagal menghubungkan wallet');
        }
    } catch (error) {
        console.error('Connection error:', error);
        if (statusEl) {
            statusEl.textContent = `❌ ${error.message}`;
            statusEl.style.color = 'var(--danger-color)';
        }
        showToast('Error: ' + error.message, 'error');
    }
};

function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
            width: 100%;
        `;
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.cssText = `
        background: var(--bg-secondary);
        border: 1px solid ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--danger-color)' : '#3498db'};
        padding: 15px 20px;
        border-radius: 10px;
        margin-bottom: 10px;
        color: var(--text-primary);
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    `;
    toast.textContent = message;
    
    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }
    }, 4000);
}

// ============================================
// DEBUG TOOLS
// ============================================

window.debugGame = {
    game: () => window.gameInstance,
    wallet: () => walletManager,
    manager: () => gameManager,
    forceUnlock: (level) => {
        if (window.gameInstance) {
            if (!window.gameInstance.unlockedLevels.includes(level)) {
                window.gameInstance.unlockedLevels.push(level);
            }
            window.gameInstance.renderLevelButtons();
            console.log(`✅ Level ${level} di-unlock (debug)`);
            showToast(`Level ${level} di-unlock (debug)`, 'info');
        }
    },
    reset: () => {
        if (window.gameInstance) {
            window.gameInstance.unlockedLevels = [1];
            window.gameInstance.renderLevelButtons();
            window.gameInstance.startLevel(1);
            console.log('🔄 Game direset ke level 1');
            showToast('Game direset ke level 1', 'info');
        }
    },
    skipLevel: () => {
        if (window.gameInstance) {
            const current = window.gameInstance.currentLevel;
            const next = current + 1;
            if (next <= window.gameInstance.gameConfig.levels) {
                if (!window.gameInstance.unlockedLevels.includes(next)) {
                    window.gameInstance.unlockedLevels.push(next);
                }
                window.gameInstance.renderLevelButtons();
                window.gameInstance.selectLevel(next);
                console.log(`⏩ Skip ke level ${next}`);
                showToast(`Skip ke level ${next}`, 'info');
            }
        }
    },
    destroy: () => {
        if (window.gameInstance) {
            window.gameInstance.destroy();
            window.gameInstance = null;
            console.log('🧹 Game destroyed');
            showToast('Game destroyed', 'info');
        }
    },
    retry: () => {
        if (window.gameInstance) {
            window.gameInstance.destroy();
            window.gameInstance = null;
        }
        setTimeout(() => {
            window.gameInstance = new GuessNumberGame();
            console.log('🔄 Game re-initialized');
            showToast('Game re-initialized', 'info');
        }, 300);
    }
};

console.log('🛠️ Debug: Ketik debugGame di console untuk bantuan');
console.log('   - debugGame.game() -> Lihat instance game');
console.log('   - debugGame.forceUnlock(2) -> Unlock level 2');
console.log('   - debugGame.skipLevel() -> Skip ke level berikutnya');
console.log('   - debugGame.reset() -> Reset ke level 1');
console.log('   - debugGame.retry() -> Re-initialize game');

// ============================================
// AUTO-INIT
// ============================================

window.gameInstance = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM ready, initializing game...');
    
    // Tunggu elemen siap dengan interval
    let attempts = 0;
    const maxAttempts = 30;
    
    const checkInterval = setInterval(() => {
        attempts++;
        const playArea = document.getElementById('game-play-area');
        const levelSelector = document.getElementById('level-selector');
        const guessInput = document.getElementById('guess-input');
        const guessBtn = document.getElementById('guess-btn');
        
        if (playArea && levelSelector && guessInput && guessBtn) {
            clearInterval(checkInterval);
            console.log('✅ Semua elemen siap');
            
            setTimeout(() => {
                if (typeof walletManager !== 'undefined' && walletManager.isConnected) {
                    try {
                        window.gameInstance = new GuessNumberGame();
                        console.log('✅ Game auto-initialized');
                    } catch (error) {
                        console.error('❌ Auto-init failed:', error);
                        showToast('Error: ' + error.message, 'error');
                    }
                } else {
                    console.log('ℹ️ Wallet not connected, menunggu user action');
                    try {
                        // Ini akan menampilkan UI connect
                        window.gameInstance = new GuessNumberGame();
                        console.log('✅ Game instance created (waiting for wallet)');
                    } catch (e) {
                        console.log('⏳ Menunggu connect wallet...');
                    }
                }
            }, 200);
        } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            console.error('❌ Timeout: Elemen tidak ditemukan setelah 30 attempts');
            showToast('Gagal memuat game. Silakan refresh halaman.', 'error');
        }
    }, 200);
});

// ============================================
// END OF FILE
// ============================================