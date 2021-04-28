window.addEventListener('load', async function () {
	
	const TsladogePresaleContract = '0x301be0feaf05eee21b65f52d638b2384c1bae3c1'
	const maxSupply = 1000000000000000000
	let tokenRate = 0.000000000001

	let connected = null
	let chainID = null
	let accounts = null
	let contract = null

	let TsladogePresaleABI = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "spender",
				"type": "address"
			},
			{
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "from",
				"type": "address"
			},
			{
				"name": "to",
				"type": "address"
			},
			{
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "who",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "to",
				"type": "address"
			},
			{
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "owner",
				"type": "address"
			},
			{
				"name": "spender",
				"type": "address"
			}
		],
		"name": "allowance",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "spender",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	}
];

	
];

	const init = async () => {
		showLoader()

		chainID = await window.ethereum.request({ method: 'eth_chainId' })
		accounts = await window.ethereum.request({ method: 'eth_accounts' })

		if (chainID == 56 && accounts.length > 0) {
			connected = true

			window.web3 = new Web3(window.ethereum)
			contract = new window.web3.eth.Contract(TsladogePresaleABI, TsladogePresaleContract)
			tcontract = new window.web3.eth.Contract(TsladogePresaleABI, TsladogePresaleContract)

			contract.methods
				.getRewardTokenCount()
				.call()
				.then(function (rate) {
					tokenRate = rate / 1e6
				})

			contract.methods
				.balanceOf(accounts[0])
				.call()
				.then(function (balance) {
					document.getElementById('wallet_balance').innerText = format(balance / 1e6)
				})

			tcontract.methods
				.totalSupply()
				.call()
				.then(function (balance) {
					let percent = (balance / 1e6 / maxSupply) * 100
					document.getElementById('contract_balance').innerText = format(balance / 1e6)
					document.querySelector('.percent').style.width = percent + '%'
				})

			document.getElementById('btn_connect').innerHTML = 'Connected'
			document.getElementById('btn_connect').classList.add('connected')
			document.getElementById('inp_bnb').value = ''
			document.getElementById('inp_iii').value = ''
		} else {
			connected = false
		}

		hideLoader()
	}

	const connect = async () => {
		let chainID = await window.ethereum.request({ method: 'eth_chainId' })
		if (chainID != 56) {
			toastr('Please change network as Binance Smart Chain.')
			return
		}

		if (window.ethereum && window.ethereum.isMetaMask && window.ethereum.isConnected()) {
			window.web3 = new Web3(window.ethereum)
			window.ethereum.enable()
			return true
		}
		return false
	}

	const swap = async () => {
		if (connected) {
			let balance_bnb = document.getElementById('inp_bnb').value * 1e6
			if (balance_bnb <= 1000 * 1e6) {
				contract.methods
					.getTokens()
					.send({ from: accounts[0], value: balance_bnb }, function (res) {
						if (res != null) hideLoader()
					})
					.then(async function (res) {
						init()
					})

				showLoader()
			} else {
				toastr('Please input BNB amount correctly.')
			}
		} else {
			toastr('Please connect MetaMask')
		}
	}

	const getTokens = async () => {
		if (connected) {
			contract.methods
				.getTokens()
				.send({ from: accounts[0] }, function (res) {
					if (res != null) hideLoader()
				})
				.then(async function (res) {
					init()
				})

			showLoader()
		} else {
			toastr('Please connect MetaMask')
		}
	}

	const sync = (from, to, rate) => {
		document.getElementById(to).value = document.getElementById(from).value * rate
	}

	const format = (balance) => {
		balance = balance.toLocaleString(0, { minimumFractionDigits: 0 })
		return balance
	}

	const toastr = (msg) => {
		let alert_lsit = document.querySelector('.alert_list')
		let alert = document.createElement('div')

		alert.innerHTML = msg
		alert_lsit.appendChild(alert)

		setTimeout(() => {
			alert.remove()
		}, 2500)
	}

	const showLoader = () => {
		document.querySelector('.loader').classList.add('active')
	}

	const hideLoader = () => {
		document.querySelector('.loader').classList.remove('active')
	}

	window.ethereum.on('accountsChanged', (accounts) => {
		init()
	})

	window.ethereum.on('chainChanged', (chainId) => {
		window.location.reload()
	})

	document.getElementById('btn_connect').addEventListener('click', connect)
	document.getElementById('btn_swap').addEventListener('click', swap)
	document.getElementById('btn_airdrop').addEventListener('click', getTokens)
	document.getElementById('inp_bnb').addEventListener('keyup', () => {
		sync('inp_bnb', 'inp_iii', 1 / tokenRate)
	})
	document.getElementById('inp_iii').addEventListener('keyup', () => {
		sync('inp_iii', 'inp_bnb', tokenRate)
	})

	init()
})
