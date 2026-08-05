// ============================================
// WALLET MANAGER - FINAL VERSION
// ============================================

class WalletManager {
    constructor() {
        this.isConnected = false;
        this.account = null;
        this.balance = 0;
        this.isProcessing = false;
        this.listeners = [];
        this.init();
    }

    async init() {
        console.log('🔷 Wallet Manager...');
        if (typeof web3Manager === 'undefined') {
            setTimeout(() => this.init(), 500);
            return;
        }
        await this.checkConnection();
    }

    async checkConnection() {
        try {
            if (typeof window.ethereum === 'undefined') return;
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
                this.account = accounts[0];
                this.isConnected = true;
                await web3Manager.initWeb3();
                await this.updateBalance();
                this.emit('connected', { account: this.account, balance: this.balance });
                console.log('✅ Wallet connected');
            }
        } catch (e) {}
    }

    async connect() {
        if (this.isProcessing) {
            return { success: false, error: 'Proses berjalan' };
        }
        
        try {
            this.isProcessing = true;
            
            if (typeof window.ethereum === 'undefined') {
                throw new Error('MetaMask tidak terdeteksi');
            }

            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (!accounts || accounts.length === 0) {
                throw new Error('Tidak ada akun');
            }

            this.account = accounts[0];
            this.isConnected = true;
            await web3Manager.initWeb3();
            await this.updateBalance();
            
            this.isProcessing = false;
            this.emit('connected', { account: this.account, balance: this.balance });
            
            return { success: true, account: this.account, balance: this.balance };
        } catch (error) {
            this.isConnected = false;
            this.isProcessing = false;
            return { success: false, error: error.message };
        }
    }

    disconnect() {
        this.isConnected = false;
        this.account = null;
        this.balance = 0;
        this.emit('disconnected');
    }

    async updateBalance() {
        if (!this.isConnected || !this.account) return 0;
        try {
            this.balance = await web3Manager.getTokenBalance(this.account);
            this.emit('balanceUpdated', { balance: this.balance });
            return this.balance;
        } catch (error) {
            console.error('Error balance:', error);
            return 0;
        }
    }

    // ============================================
    // 🔥 FIXED: PAYMENT - PASTI NO OVERFLOW
    // ============================================
    
    async payForLevel(priceInToken) {
        // Validasi
        if (!this.isConnected) {
            throw new Error('Wallet belum terhubung');
        }

        if (this.isProcessing) {
            throw new Error('Transaksi sedang berlangsung');
        }

        try {
            this.isProcessing = true;
            console.log(`💳 Bayar ${priceInToken} OJOL...`);
            
            const tokenContract = web3Manager.tokenContract;
            if (!tokenContract) {
                throw new Error('Contract belum siap');
            }

            // 🔥 KRUSIAL: Konversi dengan STRING
            const amountInWei = web3Manager.toWei(priceInToken);
            console.log(`💰 Wei: ${amountInWei}`);

            // Cek balance
            const balance = await tokenContract.methods.balanceOf(this.account).call();
            const balanceInToken = web3Manager.fromWei(balance);
            
            if (balanceInToken < priceInToken) {
                throw new Error(`Saldo tidak cukup! Saldo: ${balanceInToken.toFixed(2)} OJOL`);
            }

            // Cek allowance
            const allowance = await tokenContract.methods
                .allowance(this.account, CONFIG.paymentAddress)
                .call();
            
            const allowanceInToken = web3Manager.fromWei(allowance);
            console.log(`🔓 Allowance: ${allowanceInToken.toFixed(2)} OJOL`);

            // Approve jika perlu
            if (allowanceInToken < priceInToken) {
                console.log('🔓 Approve...');
                const approveTx = await tokenContract.methods
                    .approve(CONFIG.paymentAddress, amountInWei)
                    .send({ 
                        from: this.account,
                        gas: 100000
                    });
                console.log('✅ Approve OK:', approveTx.transactionHash);
            }

            // 🔥 KRUSIAL: Transfer dengan amountInWei (STRING)
            console.log('💸 Transfer...');
            const tx = await tokenContract.methods
                .transfer(CONFIG.paymentAddress, amountInWei)
                .send({ 
                    from: this.account,
                    gas: 200000
                });
            
            console.log('✅ Transfer OK:', tx.transactionHash);
            
            await this.updateBalance();
            this.isProcessing = false;
            
            return {
                success: true,
                txHash: tx.transactionHash,
                amount: priceInToken
            };

        } catch (error) {
            console.error('❌ Payment error:', error);
            this.isProcessing = false;
            
            let msg = error.message;
            if (msg.includes('overflow')) {
                msg = '❌ Error konversi. Gunakan angka yang lebih kecil.';
            } else if (msg.includes('insufficient funds')) {
                msg = '❌ BNB untuk gas tidak cukup!';
            } else if (msg.includes('user rejected')) {
                msg = '❌ Transaksi dibatalkan.';
            }
            throw new Error(msg);
        }
    }

    // ============================================
    // EVENT SYSTEM
    // ============================================
    
    on(event, callback) {
        this.listeners.push({ event, callback });
    }

    emit(event, data) {
        this.listeners.filter(l => l.event === event).forEach(l => {
            try { l.callback(data); } catch (e) {}
        });
    }

    getStatus() {
        return {
            isConnected: this.isConnected,
            account: this.account,
            balance: this.balance,
            isProcessing: this.isProcessing
        };
    }
}

// ============================================
// INISIALISASI
// ============================================

let walletManager = null;

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (!walletManager) {
            walletManager = new WalletManager();
            window.walletManager = walletManager;
            console.log('✅ Wallet Manager ready');
        }
    }, 300);
});

// Debug
window.__walletDebug = {
    connect: () => walletManager ? walletManager.connect() : null,
    balance: () => walletManager ? walletManager.updateBalance() : null,
    pay: (amount) => walletManager ? walletManager.payForLevel(amount) : null,
    status: () => walletManager ? walletManager.getStatus() : null
};

console.log('🛠️ Debug: __walletDebug.pay(10) - Bayar 10 OJOL');