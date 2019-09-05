var ethers = require('ethers');
var request = require("request");
const { address, ABI } = require("../constants/defaultConstant");

const getContract = new Promise(function(resolve, reject) {
	let url = "http://api.etherscan.io/api?module=contract&action=getabi&address=" + address;
	request({
		uri: url,
		method: "GET",
	}, function(error, response, body) {
		if (error) {
			reject();
		} else {
			let contractABI = null;			
			if (body.length > 0) {
				let json_body = JSON.parse(body);
				if (json_body.status == 0 && json_body.result == "Invalid Address format") {
					reject();
				} else {
					contractABI = json_body.result;
					var provider = ethers.getDefaultProvider();
					let donationContract = new ethers.Contract(address, contractABI, provider);
					if (donationContract) {
						resolve(donationContract);
					} else {
						reject();
					}
				}
			} else {
				reject();
			}
			
		}
	});
});

module.exports = { getContract};
