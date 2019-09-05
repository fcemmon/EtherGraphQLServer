var Q = require('q');
var ethers = require('ethers');
var ETHWallet = ethers.Wallet;
var provider = ethers.getDefaultProvider();

var service = {};

service.getAddress = getAddress;
service.getBalance = getBalance;
service.getTransactionsByAddress = getTransactionsByAddress;
service.getTransactionByTxId = getTransactionByTxId;
// service.transfer = transfer;

module.exports = service;
let contractInstance = {};

function getAddress() {
	let wallet = new ETHWallet.createRandom();
	return wallet;
}

function getBalance(addr) {
	let deferred = Q.defer();
	contractService.getContract()
    .then(res => {
    	contractInstance = res;
    	contractInstance.methods.checkContractBalance().call()
        .then(bal => {
        	let balance = bal / 1000000000000000000
        	deferred.resolve({address: "contractInstance.address", balance:0});
        }) // convert to eth
        .catch(err => {
        	deferred.reject("err");
        });
    })
    .catch(err => (deferred.reject("err")));
    return deferred.promise;
}

function getTransactionByTxId(txId) {
	let deferred = Q.defer();
	provider.getTransaction(txId).then(function(transaction) {
		deferred.resolve(transaction);
	}).catch(function(err) {
		deferred.reject(err);
	});
	return deferred.promise;
}

function getTransactionsByAddress(addr, pagenum) {
	let deferred = Q.defer();
	// let offset = 0;
	// if (pagenum != undefined && pagenum > 0) {
	// 	offset = (parseInt(pagenum) -1) * 10;
	// }

	if (pagenum === undefined) {
		pagenum = 1;
	}

	let url = "https://api.etherscan.io/api?module=account&action=txlist&address=" + addr + "&startblock=0&endblock=99999999&page=" + pagenum + "&offset=10&apikey=VG4EJ7WXR5P5SYPD5466QNRKEFV7T423WA"
	request({
		uri: url,
		method: "GET",
	}, function(error, response, body) {
		if (error) {
			deferred.reject({message: 'Error while getting the ETH transaction details by address'});
		} else {
			let r_tx = [];
			if (body.length > 0) {
				r_tx = JSON.parse(body);
			}
			deferred.resolve(r_tx);
		}
	});

	return deferred.promise;
}