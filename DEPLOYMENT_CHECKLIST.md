# ✅ DragNPuff Deployment Checklist

## Pre-Deployment Setup

- [ ] **1. Environment Configuration**
  - [ ] Copy `.env.template` to `.env`
  - [ ] Add PRIVATE_KEY to `.env` (without 0x prefix)
  - [ ] Verify BASE_RPC_URL is set correctly
  - [ ] Keep `.env` out of git (add to .gitignore)

- [ ] **2. Contract Compilation**
  - [ ] Run `npm run compile`
  - [ ] Verify no compilation errors
  - [ ] Check artifacts/ folder created
  - [ ] Confirm ABIs generated

- [ ] **3. Account Verification**
  - [ ] Account has ETH on Base network
  - [ ] Have at least 0.1 ETH for gas
  - [ ] Account is cryptonique0 or correct account
  - [ ] Check balance: `npx hardhat run scripts/examples.js --network base`

## Deployment Phase

- [ ] **4. Deploy Contracts**
  - [ ] Run `npm run deploy`
  - [ ] All 4 contracts deploy successfully
  - [ ] Note the contract addresses
  - [ ] Save output in case of errors

- [ ] **5. Verify Deployment**
  - [ ] Run `npm run read-state`
  - [ ] See all 4 contract addresses
  - [ ] Account balance shows ETH
  - [ ] DragNPuff supply > 0 (if deployed before)

- [ ] **6. Test Minting**
  - [ ] Run `npm run mint`
  - [ ] Transaction succeeds
  - [ ] Gas usage shows in output
  - [ ] Token supply increases

## Post-Deployment Verification

- [ ] **7. Check Contract Connection**
  - [ ] Run `npm run interact`
  - [ ] Contract name: "DragN'Puff"
  - [ ] Symbol: "DRAGN"
  - [ ] Base URI displays correctly

- [ ] **8. Explore Contract States**
  - [ ] Run all interaction scripts
  - [ ] `npm run read-state` - all data visible
  - [ ] `npm run interact` - connection works
  - [ ] `npm run mint` - can mint NFT
  - [ ] `npm run execute` - functions execute

- [ ] **9. View on Basescan**
  - [ ] Open https://basescan.org
  - [ ] Search for contract address
  - [ ] Verify contract is deployed
  - [ ] Check transactions
  - [ ] Confirm creator is your account

## Customization & Integration

- [ ] **10. Update Constants (if needed)**
  - [ ] Check `constants/addresses.js`
  - [ ] Verify addresses match deployed
  - [ ] Update VITE variables if changed
  - [ ] Update .env.example for team

- [ ] **11. Create Custom Functions**
  - [ ] Copy `execute-actions.js` template
  - [ ] Add your custom contract calls
  - [ ] Test with `npm run execute:local`
  - [ ] Verify on Base mainnet

- [ ] **12. Setup CI/CD (Optional)**
  - [ ] Add deployment to GitHub Actions
  - [ ] Create test workflow
  - [ ] Setup monitoring
  - [ ] Configure alerts

## Documentation & Handoff

- [ ] **13. Documentation**
  - [ ] Review QUICKSTART.md
  - [ ] Check DEPLOYMENT.md
  - [ ] Verify SUMMARY.md is current
  - [ ] Update team docs

- [ ] **14. Backup & Security**
  - [ ] Store private key securely
  - [ ] Backup .env file (encrypted)
  - [ ] Document recovery procedures
  - [ ] Setup emergency access

- [ ] **15. Team Communication**
  - [ ] Notify team of deployment
  - [ ] Share contract addresses
  - [ ] Document how to interact
  - [ ] Provide access instructions

## Monitoring & Maintenance

- [ ] **16. Post-Launch Monitoring**
  - [ ] Monitor gas prices
  - [ ] Track transaction volume
  - [ ] Watch for errors in logs
  - [ ] Monitor contract state changes

- [ ] **17. Maintenance Tasks**
  - [ ] Regular backup of state
  - [ ] Update dependencies monthly
  - [ ] Review security patches
  - [ ] Performance optimization

- [ ] **18. Future Upgrades**
  - [ ] Plan upgrade strategy
  - [ ] Document migration path
  - [ ] Setup proxy contracts (if applicable)
  - [ ] Plan feature additions

## Quick Command Reference

```bash
# Setup
cp .env.template .env                    # Create environment file
npm install                              # Install dependencies
npm run compile                          # Compile contracts

# Deployment
npm run deploy                           # Deploy to Base
npm run deploy:local                     # Deploy to Hardhat

# Verification
npm run read-state                       # Check contract states
npm run interact                         # Test connection
npm run mint                             # Mint test NFT

# Development
npm run dev                              # Start local blockchain
npm run execute:local                    # Execute on local network

# Code Quality
npm run lint                             # Check code
npm run format                           # Format code
npm run test                             # Run tests

# Utilities
npx hardhat run scripts/examples.js --network base    # View examples
bash scripts/menu.sh                     # Show menu
```

## Success Criteria

✅ All 4 contracts deployed  
✅ Can read contract states  
✅ Can mint NFTs  
✅ All transactions succeed  
✅ Gas usage is reasonable  
✅ No connection errors  
✅ Contracts visible on Basescan  
✅ Documentation complete  

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Invalid private key | Remove 0x prefix in .env |
| Insufficient funds | Fund account with ETH on Base |
| Contract not found | Run `npm run compile` |
| ABI not found | Check contracts/ folder |
| Network error | Verify BASE_RPC_URL in .env |
| Gas too low | Increase GAS_LIMIT in config |
| Nonce error | Wait for pending transactions |
| Deploy fails | Check account has enough ETH |

## Notes

- Each deployment costs gas (~1.5-2.0 ETH)
- Test on local hardhat first (free)
- Keep private key secure
- Never commit .env to git
- Backup important addresses
- Monitor gas prices before deploying

## Sign-Off

- [ ] Deployment completed successfully
- [ ] All tests passed
- [ ] Documentation reviewed
- [ ] Team notified
- [ ] Ready for production use

---

**Last Updated:** 2024  
**Network:** Base Mainnet (8453)  
**Account:** cryptonique0  
**Status:** ✅ Ready for Deployment
