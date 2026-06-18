    // ===================== KONFIGURASI =====================
    const CONTRACT_ADDR = "0x501d5483a41d3779128E7CE109B8649133bD21f8";
    const TOKEN_ADDR = "0x0cCB00abb35109FF33F0AbaB1C07915900954695";
    const BASE_URL = window.location.origin + window.location.pathname;
    
    const contractDisplay = document.getElementById("contractAddrDisplay");
    if (contractDisplay) contractDisplay.innerText = CONTRACT_ADDR;
    
    // ===================== ABI =====================
    const CONTRACT_ABI = [
        {
            "inputs": [
                { "internalType": "uint256", "name": "_amountToken", "type": "uint256" },
                { "internalType": "uint256", "name": "_durationDays", "type": "uint256" },
                { "internalType": "address", "name": "_referrer", "type": "address" }
            ],
            "name": "stakeSimple",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "claimReward",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "withdraw",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "earlyWithdraw",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{ "internalType": "address", "name": "_downline", "type": "address" }],
            "name": "claimRankBonus",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [{ "internalType": "address", "name": "u", "type": "address" }],
            "name": "pendingReward",
            "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{ "internalType": "address", "name": "u", "type": "address" }],
            "name": "getTotalRewardEarned",
            "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{ "internalType": "address", "name": "u", "type": "address" }],
            "name": "getUserRank",
            "outputs": [
                { "internalType": "uint8", "name": "", "type": "uint8" },
                { "internalType": "uint256", "name": "", "type": "uint256" },
                { "internalType": "uint256", "name": "", "type": "uint256" },
                { "internalType": "uint256", "name": "", "type": "uint256" }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
            "name": "refEarnings",
            "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "contractStats",
            "outputs": [
                { "internalType": "uint256", "name": "", "type": "uint256" },
                { "internalType": "uint256", "name": "", "type": "uint256" },
                { "internalType": "uint256", "name": "", "type": "uint256" },
                { "internalType": "uint256", "name": "", "type": "uint256" },
                { "internalType": "uint256", "name": "", "type": "uint256" },
                { "internalType": "uint256", "name": "", "type": "uint256" }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "rewardRate",
            "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "minStake",
            "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
            "name": "stakes",
            "outputs": [
                { "internalType": "uint256", "name": "amount", "type": "uint256" },
                { "internalType": "uint256", "name": "principal", "type": "uint256" },
                { "internalType": "uint256", "name": "startTime", "type": "uint256" },
                { "internalType": "uint256", "name": "finishAt", "type": "uint256" },
                { "internalType": "uint256", "name": "lastRewardTime", "type": "uint256" },
                { "internalType": "uint256", "name": "totalRewardClaimed", "type": "uint256" },
                { "internalType": "address", "name": "referrer", "type": "address" },
                { "internalType": "bool", "name": "exists", "type": "bool" }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{ "internalType": "address", "name": "u", "type": "address" }],
            "name": "getUserDownlines",
            "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                { "internalType": "address", "name": "upline", "type": "address" },
                { "internalType": "address", "name": "downline", "type": "address" }
            ],
            "name": "getClaimableInfo",
            "outputs": [
                { "internalType": "uint256", "name": "totalReward", "type": "uint256" },
                { "internalType": "uint256", "name": "alreadyClaimed", "type": "uint256" },
                { "internalType": "uint256", "name": "newReward", "type": "uint256" },
                { "internalType": "uint256", "name": "claimableBonus", "type": "uint256" }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];
    
    const TOKEN_ABI = [
        {
            "constant": true,
            "inputs": [{ "name": "account", "type": "address" }],
            "name": "balanceOf",
            "outputs": [{ "name": "", "type": "uint256" }],
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [{ "name": "owner", "type": "address" }, { "name": "spender", "type": "address" }],
            "name": "allowance",
            "outputs": [{ "name": "", "type": "uint256" }],
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [{ "name": "spender", "type": "address" }, { "name": "amount", "type": "uint256" }],
            "name": "approve",
            "outputs": [{ "name": "", "type": "bool" }],
            "type": "function"
        }
    ];
    
    let web3, contract, tokenContract;
    let userAccount = null;
    let downlineList = [];
    
    function setElementText(id, value, suffix = '') {
        const el = document.getElementById(id);
        if (el) el.innerHTML = value + suffix;
    }
    
    function showToast(msg, isError = false) {
        const toast = document.getElementById("toastMsg");
        if (toast) {
            toast.style.backgroundColor = isError ? "#b91c1c" : "#1e293b";
            toast.innerText = msg;
            toast.style.display = "block";
            setTimeout(() => { if (toast) toast.style.display = "none"; }, 4000);
        }
    }
    
    function truncateAddress(addr) {
        if (!addr || addr === "0x0000000000000000000000000000000000000000") return "0x0000...0000";
        return addr.slice(0, 6) + "..." + addr.slice(-4);
    }
    
    function getReferralFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('ref');
    }
    
    function updateReferralLink() {
        const refCard = document.getElementById('refLinkCard');
        const refInput = document.getElementById('referralLinkInput');
        if (userAccount) {
            refCard.style.display = 'block';
            const refLink = BASE_URL + '?ref=' + userAccount;
            refInput.value = refLink;
        } else {
            refCard.style.display = 'none';
        }
    }
    
    function copyReferralLink() {
        const refInput = document.getElementById('referralLinkInput');
        if (refInput && refInput.value) {
            navigator.clipboard.writeText(refInput.value).then(() => {
                showToast('📋 Referral link copied to clipboard!');
            }).catch(() => {
                refInput.select();
                document.execCommand('copy');
                showToast('📋 Referral link copied!');
            });
        }
    }
    
    function shareReferralLink() {
        const refInput = document.getElementById('referralLinkInput');
        if (refInput && refInput.value) {
            if (navigator.share) {
                navigator.share({
                    title: 'Join Ojol Staking!',
                    text: 'Stake OJOL tokens and earn rewards! Use my referral link:',
                    url: refInput.value
                }).catch(() => {});
            } else {
                copyReferralLink();
            }
        }
    }
    
    async function initWeb3() {
        if (window.ethereum) {
            try {
                web3 = new Web3(window.ethereum);
                contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDR);
                tokenContract = new web3.eth.Contract(TOKEN_ABI, TOKEN_ADDR);
                console.log("✅ Web3 terinisialisasi dengan benar");
                return true;
            } catch(e) {
                console.error("Init web3 error", e);
                showToast("Error inisialisasi Web3", true);
                return false;
            }
        } else {
            showToast("MetaMask tidak terdeteksi!", true);
            return false;
        }
    }
    
    async function updateWalletInfo() {
        if (!userAccount || !tokenContract || !web3) return;
        try {
            const balanceWei = await tokenContract.methods.balanceOf(userAccount).call();
            const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
            setElementText("ojolBalance", parseFloat(balanceEth).toFixed(4));
            
            const allowanceWei = await tokenContract.methods.allowance(userAccount, CONTRACT_ADDR).call();
            const allowanceEth = web3.utils.fromWei(allowanceWei, 'ether');
            const stakeAmountElem = document.getElementById("stakeAmount");
            const requiredAmount = stakeAmountElem ? parseFloat(stakeAmountElem.value) || 0 : 0;
            
            const allowanceStatus = document.getElementById("allowanceStatus");
            if (allowanceStatus) {
                if (requiredAmount > 0 && parseFloat(allowanceEth) >= requiredAmount) {
                    allowanceStatus.innerHTML = `<span class="green-badge">✅ Allowance mencukupi (${parseFloat(allowanceEth).toFixed(4)} OJOL)</span>`;
                } else if (requiredAmount > 0) {
                    allowanceStatus.innerHTML = `<span style="color:#b45309;">⚠️ Allowance ${parseFloat(allowanceEth).toFixed(4)} < ${requiredAmount}, perlu approve</span>`;
                } else {
                    allowanceStatus.innerHTML = `🔓 Allowance: ${parseFloat(allowanceEth).toFixed(4)} OJOL`;
                }
            }
            
            const ethBalanceWei = await web3.eth.getBalance(userAccount);
            setElementText("nativeBalance", parseFloat(web3.utils.fromWei(ethBalanceWei, 'ether')).toFixed(5));
        } catch (e) {
            console.warn("updateWalletInfo error", e);
        }
    }
    
    async function loadDownlines() {
        if (!userAccount || !contract) return;
        try {
            const downlines = await contract.methods.getUserDownlines(userAccount).call();
            downlineList = downlines;
            renderDownlines();
        } catch (e) {
            console.warn("loadDownlines error", e);
            const container = document.getElementById("downlineListContainer");
            if (container) container.innerHTML = `<div class="no-downline">❌ Gagal memuat downline</div>`;
        }
    }
    
    async function renderDownlines() {
        const container = document.getElementById("downlineListContainer");
        if (!container) return;
        
        if (!downlineList || downlineList.length === 0) {
            container.innerHTML = `<div class="no-downline">👥 Belum ada downline langsung</div>`;
            return;
        }
        
        let html = '';
        
        for (const downline of downlineList) {
            try {
                const claimableInfo = await contract.methods.getClaimableInfo(userAccount, downline).call();
                const totalReward = web3.utils.fromWei(claimableInfo.totalReward, 'ether');
                const alreadyClaimed = web3.utils.fromWei(claimableInfo.alreadyClaimed, 'ether');
                const claimableBonus = web3.utils.fromWei(claimableInfo.claimableBonus, 'ether');
                
                const bonusValue = parseFloat(claimableBonus);
                const hasBonus = bonusValue > 0;
                
                html += `
                    <div class="downline-item">
                        <div>
                            <div class="downline-addr">${truncateAddress(downline)}</div>
                            <div style="font-size: 0.7rem; color: #64748b; margin-top: 2px;">
                                Total: ${parseFloat(totalReward).toFixed(4)} | Claimed: ${parseFloat(alreadyClaimed).toFixed(4)}
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span class="downline-bonus">${hasBonus ? `${parseFloat(claimableBonus).toFixed(4)} OJOL` : '0 OJOL'}</span>
                            <button class="claim-btn-mini" data-downline="${downline}" ${!hasBonus ? 'disabled' : ''}>
                                ${hasBonus ? '<i class="fas fa-hand-holding-usd"></i> Claim' : 'No Bonus'}
                            </button>
                        </div>
                    </div>
                `;
            } catch (e) {
                console.warn("Error getting claimable info for", downline, e);
            }
        }
        
        if (html === '') {
            container.innerHTML = `<div class="no-downline">⚠️ Gagal memuat data downline</div>`;
        } else {
            container.innerHTML = html;
            
            document.querySelectorAll('.claim-btn-mini').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const downlineAddr = this.dataset.downline;
                    await claimRankBonusForDownline(downlineAddr);
                });
            });
        }
    }
    
    async function claimRankBonusForDownline(downlineAddr) {
        if (!userAccount) { showToast("Connect wallet dulu", true); return; }
        try {
            showToast(`Memproses claim bonus untuk ${truncateAddress(downlineAddr)}...`);
            await contract.methods.claimRankBonus(downlineAddr).send({ from: userAccount });
            showToast(`✅ Rank bonus claimed untuk ${truncateAddress(downlineAddr)}!`);
            await refreshAllData();
            await loadDownlines();
        } catch (e) {
            console.error("Claim rank bonus error:", e);
            showToast("Gagal claim bonus: " + (e.message || e), true);
        }
    }
    
    async function refreshAllData() {
        if (!userAccount || !contract) return;
        try {
            const stake = await contract.methods.stakes(userAccount).call();
            const exists = stake.exists;
            let stakeAmount = exists ? web3.utils.fromWei(stake.amount, 'ether') : "0";
            setElementText("myStakeAmount", parseFloat(stakeAmount).toFixed(2), " OJOL");
            
            const pendingWei = await contract.methods.pendingReward(userAccount).call();
            setElementText("pendingReward", parseFloat(web3.utils.fromWei(pendingWei, 'ether')).toFixed(4));
            
            const totalClaimedWei = await contract.methods.getTotalRewardEarned(userAccount).call();
            setElementText("totalClaimedReward", parseFloat(web3.utils.fromWei(totalClaimedWei, 'ether')).toFixed(4));
            
            if (exists && Number(stake.finishAt) > 0) {
                const finishMs = Number(stake.finishAt) * 1000;
                const now = Date.now();
                if (finishMs > now) {
                    let daysLeft = Math.ceil((finishMs - now) / (1000 * 3600 * 24));
                    setElementText("finishTimer", `${daysLeft} days left`);
                } else {
                    setElementText("finishTimer", "✅ Ready to withdraw");
                }
            } else {
                setElementText("finishTimer", "No active stake");
            }
            
            const rankData = await contract.methods.getUserRank(userAccount).call();
            const rank = rankData[0];
            const netVol = web3.utils.fromWei(rankData[1], 'ether');
            const downCount = rankData[2];
            const rankBonusClaimed = web3.utils.fromWei(rankData[3], 'ether');
            
            let rankText = "No Rank";
            if (rank > 0) {
                const rankEmojis = ['', '🥉', '🥈', '🥇'];
                rankText = `Rank ${rank} ${rankEmojis[rank] || '👑'}`;
            }
            setElementText("userRank", rankText);
            setElementText("networkVolume", parseFloat(netVol).toFixed(2));
            setElementText("downlineCount", downCount.toString());
            setElementText("rankBonusClaimed", parseFloat(rankBonusClaimed).toFixed(4));
            
            const refEarn = await contract.methods.refEarnings(userAccount).call();
            setElementText("refEarnings", parseFloat(web3.utils.fromWei(refEarn, 'ether')).toFixed(4));
            
            const stats = await contract.methods.contractStats().call();
            setElementText("totalStakedGl", parseFloat(web3.utils.fromWei(stats[0], 'ether')).toFixed(2));
            setElementText("totalRewardsPaidGl", parseFloat(web3.utils.fromWei(stats[1], 'ether')).toFixed(2));
            setElementText("totalRefRewardsGl", parseFloat(web3.utils.fromWei(stats[2], 'ether')).toFixed(2));
            setElementText("totalRankBonusesGl", parseFloat(web3.utils.fromWei(stats[3], 'ether')).toFixed(2));
            
            const rewardRate = await contract.methods.rewardRate().call();
            const minStakeVal = await contract.methods.minStake().call();
            const rewardRateEl = document.getElementById("rewardRateDisplay");
            if (rewardRateEl) rewardRateEl.innerHTML = `<span>📈 Reward Rate</span><span>${rewardRate}/10000 per day</span>`;
            const minStakeEl = document.getElementById("minStakeDisplay");
            if (minStakeEl) minStakeEl.innerHTML = `<span>⚠️ Min Stake</span><span>${web3.utils.fromWei(minStakeVal, 'ether')} OJOL</span>`;
            const minStakeSpan = document.getElementById("minStakeSpan");
            if (minStakeSpan) minStakeSpan.innerHTML = web3.utils.fromWei(minStakeVal, 'ether');
            
        } catch (e) {
            console.error("refreshAllData error", e);
        }
    }
    
    async function approveOJOL() {
        if (!userAccount) { showToast("Connect wallet dulu", true); return; }
        let amountToken = document.getElementById("stakeAmount").value;
        if (!amountToken || parseFloat(amountToken) <= 0) { showToast("Masukkan jumlah OJOL", true); return; }
        const amountWei = web3.utils.toWei(amountToken, 'ether');
        try {
            showToast(`Menyetujui ${amountToken} OJOL ...`);
            await tokenContract.methods.approve(CONTRACT_ADDR, amountWei).send({ from: userAccount });
            showToast(`✅ Approve ${amountToken} OJOL berhasil!`);
            await updateWalletInfo();
        } catch (e) {
            showToast("Approve gagal: " + (e.message || e), true);
        }
    }
    
    async function performStake() {
        if (!userAccount) { showToast("Hubungkan wallet dulu", true); return; }
        let amountToken = document.getElementById("stakeAmount").value;
        if (!amountToken || parseFloat(amountToken) <= 0) { showToast("Masukkan amount valid", true); return; }
        const durationDays = parseInt(document.getElementById("durationDays").value);
        let referrer = document.getElementById("referrerAddr").value.trim();
        if (referrer === "") referrer = "0x0000000000000000000000000000000000000000";
        if (referrer !== "0x0000000000000000000000000000000000000000" && !web3.utils.isAddress(referrer)) {
            showToast("Address referrer tidak valid", true);
            return;
        }
        const amountWei = web3.utils.toWei(amountToken, 'ether');
        const minStakeWei = await contract.methods.minStake().call();
        if (web3.utils.toBN(amountWei).lt(web3.utils.toBN(minStakeWei))) {
            showToast(`Minimal stake ${web3.utils.fromWei(minStakeWei, 'ether')} OJOL`, true);
            return;
        }
        const allowanceWei = await tokenContract.methods.allowance(userAccount, CONTRACT_ADDR).call();
        if (web3.utils.toBN(allowanceWei).lt(web3.utils.toBN(amountWei))) {
            showToast("Allowance tidak cukup. Approve dulu!", true);
            return;
        }
        try {
            showToast("Memproses stake...");
            await contract.methods.stakeSimple(amountToken, durationDays, referrer).send({ from: userAccount });
            showToast(`🎉 Staking ${amountToken} OJOL berhasil!`);
            await refreshAllData();
            await updateWalletInfo();
            await loadDownlines();
        } catch (e) {
            console.error(e);
            showToast("Stake gagal: " + (e.message || e), true);
        }
    }
    
    async function claimReward() {
        if (!userAccount) return;
        try {
            await contract.methods.claimReward().send({ from: userAccount });
            showToast("Reward berhasil diklaim!");
            refreshAllData();
            updateWalletInfo();
        } catch (e) { showToast("Claim reward error: " + e.message, true); }
    }
    
    async function withdrawFull() {
        if (!userAccount) return;
        try {
            await contract.methods.withdraw().send({ from: userAccount });
            showToast("Withdraw sukses (principal + reward)");
            refreshAllData();
            updateWalletInfo();
            loadDownlines();
        } catch (e) { showToast("Withdraw error: " + e.message, true); }
    }
    
    async function earlyWithdraw() {
        if (!userAccount) return;
        if (confirm("⚠️ Peringatan: Penalti akan dikenakan! Lanjutkan?")) {
            try {
                await contract.methods.earlyWithdraw().send({ from: userAccount });
                showToast("Early withdraw selesai, penalti diterapkan.");
                refreshAllData();
                updateWalletInfo();
                loadDownlines();
            } catch (e) { showToast("Early withdraw gagal: " + e.message, true); }
        }
    }
    
    async function connectWallet() {
        if (!window.ethereum) {
            showToast("MetaMask tidak terinstall!", true);
            alert("Install MetaMask terlebih dahulu.");
            return;
        }
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            if (accounts.length === 0) throw new Error("Tidak ada akun dipilih");
            userAccount = accounts[0];
            
            if (!web3) {
                web3 = new Web3(window.ethereum);
                contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDR);
                tokenContract = new web3.eth.Contract(TOKEN_ABI, TOKEN_ADDR);
            }
            
            const walletBtn = document.getElementById("walletBtnText");
            if (walletBtn) walletBtn.innerText = userAccount.slice(0,6) + "..." + userAccount.slice(-4);
            const walletShort = document.getElementById("walletShort");
            if (walletShort) walletShort.innerHTML = `<i class="fas fa-user-check"></i> ${userAccount.slice(0,8)}...${userAccount.slice(-6)}`;
            
            updateReferralLink();
            
            await refreshAllData();
            await updateWalletInfo();
            await loadDownlines();
            
            window.ethereum.on("accountsChanged", async (accs) => {
                if (accs.length > 0 && accs[0]) {
                    userAccount = accs[0];
                    if (walletBtn) walletBtn.innerText = userAccount.slice(0,6) + "...";
                    if (walletShort) walletShort.innerHTML = `<i class="fas fa-user-check"></i> ${userAccount.slice(0,8)}...${userAccount.slice(-6)}`;
                    updateReferralLink();
                    await refreshAllData();
                    await updateWalletInfo();
                    await loadDownlines();
                } else {
                    userAccount = null;
                    if (walletBtn) walletBtn.innerText = "Connect Wallet";
                    if (walletShort) walletShort.innerHTML = "⚡ Not connected";
                    document.getElementById('refLinkCard').style.display = 'none';
                }
            });
            
            showToast(`Wallet terhubung: ${userAccount.slice(0,8)}...`);
        } catch (error) {
            console.error("Koneksi gagal:", error);
            showToast("Gagal connect: " + (error.message || "User rejected"), true);
        }
    }
    
    // Event binding
    window.addEventListener("load", async () => {
        await initWeb3();
        
        // Check for referral parameter in URL
        const refAddr = getReferralFromURL();
        if (refAddr && web3 && web3.utils.isAddress(refAddr)) {
            const referrerInput = document.getElementById("referrerAddr");
            const refDetected = document.getElementById("refDetected");
            const detectedRefAddr = document.getElementById("detectedRefAddr");
            if (referrerInput) {
                referrerInput.value = refAddr;
                if (refDetected && detectedRefAddr) {
                    refDetected.style.display = 'block';
                    detectedRefAddr.textContent = truncateAddress(refAddr);
                }
            }
        }
        
        if (window.ethereum && window.ethereum.selectedAddress) {
            userAccount = window.ethereum.selectedAddress;
            if (web3) {
                const walletBtn = document.getElementById("walletBtnText");
                if (walletBtn) walletBtn.innerText = userAccount.slice(0,6) + "...";
                const walletShort = document.getElementById("walletShort");
                if (walletShort) walletShort.innerHTML = `<i class="fas fa-link"></i> ${userAccount.slice(0,8)}...`;
                updateReferralLink();
                await refreshAllData();
                await updateWalletInfo();
                await loadDownlines();
            }
        }
        
        const connectBtn = document.getElementById("connectWalletBtn");
        if (connectBtn) connectBtn.addEventListener("click", connectWallet);
        
        const stakeBtn = document.getElementById("stakeBtn");
        if (stakeBtn) stakeBtn.addEventListener("click", performStake);
        
        const approveBtn = document.getElementById("approveBtn");
        if (approveBtn) approveBtn.addEventListener("click", approveOJOL);
        
        const claimBtn = document.getElementById("claimRewardBtn");
        if (claimBtn) claimBtn.addEventListener("click", claimReward);
        
        const withdrawBtn = document.getElementById("withdrawBtn");
        if (withdrawBtn) withdrawBtn.addEventListener("click", withdrawFull);
        
        const earlyBtn = document.getElementById("earlyWithdrawBtn");
        if (earlyBtn) earlyBtn.addEventListener("click", earlyWithdraw);
        
        const copyBtn = document.getElementById("copyRefLinkBtn");
        if (copyBtn) copyBtn.addEventListener("click", copyReferralLink);
        
        const shareBtn = document.getElementById("shareRefLinkBtn");
        if (shareBtn) shareBtn.addEventListener("click", shareReferralLink);
        
        const stakeAmountInput = document.getElementById("stakeAmount");
        if (stakeAmountInput) stakeAmountInput.addEventListener("input", () => { if (userAccount) updateWalletInfo(); });
    });
    
    setInterval(() => {
        if (userAccount) {
            refreshAllData();
            updateWalletInfo();
        }
    }, 14000);
