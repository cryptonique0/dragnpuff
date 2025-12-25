# Troubleshooting Guide

## Common Issues

### Smart Contracts

#### "Contract is not at address"
**Problem**: Contract bytecode not found at specified address
**Solution**:
- Verify the address is correct for the network
- Check that the contract was deployed to this chain
- Use block explorer to confirm deployment

#### "Insufficient balance"
**Problem**: Account doesn't have enough ETH or tokens for transaction
**Solution**:
- Check account balance: `ethers.provider.getBalance(address)`
- Fund account with testnet ETH or tokens
- Reduce transaction amount

#### "Gas limit exceeded"
**Problem**: Transaction exceeds max gas
**Solution**:
- Break large transactions into smaller batches
- Optimize contract code
- Check gas estimation: `contract.estimateGas.functionName()`

### Firebase

#### "Permission denied" on Firestore
**Problem**: Security rules preventing read/write
**Solution**:
- Review security rules in `firestore.rules`
- Check user authentication status
- Verify user has proper claims/permissions

#### "Function timeout"
**Problem**: Cloud Function exceeding 9-minute timeout
**Solution**:
- Optimize function code
- Move heavy processing to background jobs
- Use Pub/Sub for async operations

### Frontend

#### "Module not found"
**Problem**: Import path incorrect
**Solution**:
- Check file paths match actual structure
- Ensure files are in correct directories
- Clear node_modules and reinstall: `npm install`

#### "Network error"
**Problem**: Connection to API or blockchain failing
**Solution**:
- Check RPC provider status
- Verify API endpoint in .env
- Check network connectivity
- Review CORS settings

### Testing

#### "Transaction reverted"
**Problem**: Smart contract call failed
**Solution**:
- Review contract require() statements
- Check function parameters
- Verify caller has required permissions
- Use debug mode for more details

## Getting Help

1. Check this troubleshooting guide first
2. Review [FAQ.md](./FAQ.md)
3. Search existing GitHub issues
4. Create a new issue with:
   - Clear description of problem
   - Steps to reproduce
   - Error messages
   - Environment details

## Useful Commands

```bash
# Check contract code
etherscan-cli verify <address>

# View function signature
cast 4byte <selector>

# Debug transaction
cast tx <txhash> --trace

# Check network status
curl https://mainnet.base.org -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"web3_clientVersion","id":67}'
```
