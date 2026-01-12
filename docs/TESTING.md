# Testing Guide

## Test Status Summary
✅ **87 passing tests** | ⚠️ 40 tests pending fixes | 🎯 68% pass rate

Recent improvements:
- Fixed hardhat configuration for proper test execution
- Added ERC20Mock and ERC721Mock contracts
- Increased passing tests from 58 to 87 (+50% improvement)

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npx hardhat test test/DragNRoles.test.js
```

### Run Tests Matching Pattern
```bash
npx hardhat test --grep "DragNRoles"
```

### View Test Coverage (coming soon)
```bash
npm run test:coverage
```

## Test Structure

```
test/
├── unit/
│   ├── utils/
│   │   ├── blockchain.test.js
│   │   ├── cache.test.js
│   │   ├── logger.test.js
│   │   └── formatters.test.js
│   └── contracts/
│       ├── DragNPuff.test.js
│       ├── FairToken.test.js
│       └── Minter.test.js
├── integration/
│   ├── deployment.test.js
│   ├── minting.test.js
│   └── transfers.test.js
└── e2e/
    └── scenarios.test.js
```

## Writing Tests

### Basic Test Structure

```javascript
const { expect } = require("chai");
const { someFunction } = require("../../../utils/module");

describe("Module Name", () => {
  describe("Function Name", () => {
    it("should do something", () => {
      const result = someFunction(input);
      expect(result).to.equal(expectedValue);
    });
  });
});
```

### Testing Promises

```javascript
it("should handle async operations", async () => {
  const result = await asyncFunction();
  expect(result).to.exist;
});
```

### Testing Errors

```javascript
it("should throw error on invalid input", () => {
  expect(() => {
    functionThatThrows("invalid");
  }).to.throw();
});
```

## Best Practices

1. **Clear Test Names** - Use descriptive test names
2. **One Assertion** - Each test should verify one behavior
3. **Setup/Teardown** - Use before/after hooks
4. **DRY** - Don't repeat test setup code
5. **Test Edge Cases** - Test boundaries and edge cases
6. **Mock External** - Mock external dependencies
7. **Isolate Tests** - Tests should be independent

## Contract Testing

### Hardhat Tests

```javascript
const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("DragNPuff Contract", () => {
  let dragnpuff;
  let owner;

  before(async () => {
    const DragNPuff = await ethers.getContractFactory("DragNPuff");
    dragnpuff = await DragNPuff.deploy();
    [owner] = await ethers.getSigners();
  });

  it("should mint NFT", async () => {
    const tx = await dragnpuff.mint(owner.address, "ipfs://...");
    await tx.wait();
    const balance = await dragnpuff.balanceOf(owner.address);
    expect(balance).to.equal(1);
  });
});
```

## Continuous Integration

Tests run on every push via GitHub Actions. See `.github/workflows/test.yml`.

## Debugging Tests

### Debug Mode

```bash
DEBUG=* npm test
```

### Inspect Variables

```javascript
it("should work", () => {
  const result = someFunction();
  console.log("Result:", result);
  expect(result).to.exist;
});
```

### Use Breakpoints

With VS Code:

```json
{
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/node_modules/.bin/mocha",
  "args": ["test/**/*.test.js"],
  "skipFiles": ["<node_internals>/**"]
}
```

## Test Coverage

Target 80%+ coverage:

```bash
npm test -- --coverage
```

## See Also

- [Chai Assertion Library](https://www.chaijs.com/api/)
- [Mocha Test Framework](https://mochajs.org/)
- [Hardhat Testing](https://hardhat.org/tutorial/testing-contracts)
