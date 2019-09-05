var ethers = require('ethers');
var request = require("request");
var Q = require('q');
const { address, ABI } = require("../constants/defaultConstant");

var service = {};
service.getContract = getContract;

module.exports = service;

function _getABI() {
	let deferred = Q.defer();

  let url = "http://api.etherscan.io/api?module=contract&action=getabi&address=" + address;
	request({
		uri: url,
		method: "GET",
	}, function(error, response, body) {
		if (error) {
			deferred.reject(error);
		} else {
			let contractABI = null;
			
			if (body.length > 0) {
				let json_body = JSON.parse(body);
				if (json_body.status == 0 && json_body.result == "Invalid Address format") {
					deferred.reject("Invalid Address format");
				} else {
					contractABI = json_body.result;
					if (contractABI && contractABI != '') {
						deferred.resolve(JSON.parse(contractABI));
					} else {
						deferred.resolve(ABI);
					}
				}
			} else {
				deferred.reject("error");
			}
		}
	});
	return deferred.promise;
}

function getContract() {
	let deferred = Q.defer();
	let provider = ethers.getDefaultProvider();
	_getABI().then(res => {
		let donationContract = new ethers.Contract(address, res, provider);
		if (donationContract) deferred.resolve(donationContract);
		else {
			deferred.reject("can not create");
		}
	})
    .catch(err => (deferred.reject(err)));
    return deferred.promise;
}