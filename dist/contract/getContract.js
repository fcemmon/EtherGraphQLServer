"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
const ethers_1 = require("ethers");
const defaultConstant_1 = require("../constants/defaultConstant");
exports.getContract = function () {
    return __awaiter(this, void 0, void 0, function* () {
        let url = "http://api.etherscan.io/api?module=contract&action=getabi&address=" + defaultConstant_1.address;
        const provider = ethers_1.ethers.getDefaultProvider();
        try {
            const response = yield node_fetch_1.default(url);
            const json = yield response.json();
            if (json.status != '0') {
                const contractABI = JSON.parse(json.result);
                return new ethers_1.ethers.Contract(defaultConstant_1.address, contractABI, provider);
            }
            else {
                throw new Error("Error");
            }
        }
        catch (e) {
            throw new Error("Error" + e);
        }
    });
};
//# sourceMappingURL=getContract.js.map