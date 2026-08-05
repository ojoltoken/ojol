// ============================================
// WEB3 CONFIGURATION - FINAL VERSION
// ============================================

const CONFIG = {
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    rpcUrlBackup: 'https://bsc-dataseed1.binance.org/',
    chainId: 56,
    chainIdHex: '0x38',
    tokenContract: '0x0cCB00abb35109FF33F0AbaB1C07915900954695',
    paymentAddress: '0x0F451D746EFD63397d413eD6d4A994356ba61421',
    tokenSymbol: 'OJOL',
    tokenDecimals: 18,
    gasLimit: 200000
};

// ABI Token - PASTIKAN INI DIGUNAKAN
const TOKEN_ABI = [
    {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "symbol",
        "outputs": [{"name": "", "type": "string"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "name",
        "outputs": [{"name": "", "type": "string"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {"name": "_owner", "type": "address"},
            {"name": "_spender", "type": "address"}
        ],
        "name": "allowance",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {"name": "_to", "type": "address"},
            {"name": "_value", "type": "uint256"}
        ],
        "name": "transfer",
        "outputs": [{"name": "success", "type": "bool"}],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {"name": "_spender", "type": "address"},
            {"name": "_value", "type": "uint256"}
        ],
        "name": "approve",
        "outputs": [{"name": "success", "type": "bool"}],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {"name": "_from", "type": "address"},
            {"name": "_to", "type": "address"},
            {"name": "_value", "type": "uint256"}
        ],
        "name": "transferFrom",
        "outputs": [{"name": "success", "type": "bool"}],
        "type": "function"
    }
];

// ============================================
// STATE - Web3.js ONLY
// ============================================

let web3 = null;
let tokenContract = null;
let userAccount = null;
let isInitialized = false;

// ============================================
// 🔥 KRUSIAL: SEMUA KONVERSI PAKAI STRING
// ============================================

function toWei(amount) {
    if (!web3) throw new Error('Web3 belum siap');
    // 🔥 PASTIKAN STRING
    return web3.utils.toWei(amount.toString(), 'ether');
}

function fromWei(wei) {
    if (!web3) throw new Error('Web3 belum siap');
    // 🔥 PASTIKAN STRING
    return parseFloat(web3.utils.fromWei(wei.toString(), 'ether'));
}

// ============================================
// INIT WEB3
// ============================================

async function initWeb3() {
    try {
        console.log('🔄 Init Web3...');
        
        if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask tidak terdeteksi');
        }

        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        if (!accounts || accounts.length === 0) {
            throw new Error('Tidak ada akun');
        }

        web3 = new Web3(window.ethereum);
        userAccount = accounts[0];
        
        tokenContract = new web3.eth.Contract(TOKEN_ABI, CONFIG.tokenContract);
        
        // Get decimals
        try {
            const decimals = await tokenContract.methods.decimals().call();
            CONFIG.tokenDecimals = parseInt(decimals);
            console.log(`✅ Decimals: ${CONFIG.tokenDecimals}`);
        } catch (e) {
            console.warn('⚠️ Decimals default 18');
        }

        isInitialized = true;
        console.log('✅ Web3 initialized:', userAccount);
        
        return { web3, tokenContract, userAccount };

    } catch (error) {
        console.error('❌ Init error:', error);
        throw error;
    }
}

// ============================================
// 🔥 FIXED: GET BALANCE
// ============================================

async function getTokenBalance(address) {
    if (!tokenContract || !address) return 0;
    try {
        const balance = await tokenContract.methods.balanceOf(address).call();
        return fromWei(balance);
    } catch (error) {
        console.error('Error balance:', error);
        return 0;
    }
}

// ============================================
// 🔥 FIXED: VERIFY PAYMENT
// ============================================

async function verifyPayment(txHash) {
    if (!web3) throw new Error('Web3 belum siap');
    
    try {
        const receipt = await web3.eth.getTransactionReceipt(txHash);
        if (!receipt || !receipt.status) {
            return { success: false, error: 'Transaksi gagal' };
        }
        
        const tx = await web3.eth.getTransaction(txHash);
        
        if (tx.input && tx.input.startsWith('0xa9059cbb')) {
            const decoded = web3.eth.abi.decodeParameters(
                ['address', 'uint256'],
                tx.input.slice(10)
            );
            const amount = fromWei(decoded[1]);
            return {
                success: true,
                amount: amount,
                to: decoded[0],
                from: tx.from
            };
        }
        
        return { success: true };
    } catch (error) {
        console.error('Error verify:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// EXPORTS
// ============================================

window.web3Manager = {
    initWeb3,
    getTokenBalance,
    verifyPayment,
    toWei,
    fromWei,
    CONFIG,
    get web3() { return web3; },
    get tokenContract() { return tokenContract; },
    get userAccount() { return userAccount; },
    get isInitialized() { return isInitialized; }
};

console.log('✅ Web3 Config loaded (Web3.js only)');