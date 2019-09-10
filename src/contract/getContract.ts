import fetch from 'node-fetch'
import { ethers } from 'ethers'
import { address } from '../constants/defaultConstant';

export const getContract = async function () {
	let url = "http://api.etherscan.io/api?module=contract&action=getabi&address=" + address;
	const provider = ethers.getDefaultProvider();

	try {
		const response = await fetch(url);
		const json = await response.json();
		if (json.status != '0') {
			const contractABI = JSON.parse(json.result);
			return new ethers.Contract(address, contractABI, provider);
		} else {
			throw new Error("Error")
		}
	} catch (e) {
		throw new Error("Error" + e)
	}
};