var eth = require('../app/eth');

const EthResolver = {
	Query: {
    async contract() {
      let totalSupply = 0;
      let address = "sd";
      let balance = 0;
      await eth.getBalance()
      	.then((res) => {
      		address = res.address;
      		balance = res.balance;
      	})
      	.catch(error => (console.log("error")));
    	return {
        address,
        balance
      };
    },

    async transctions() {

    }
  },
  Mutation: {
  	async donate(obj, args, context) {
      return{
        amount
      }
    }
  }
};

module.exports =  EthResolver;