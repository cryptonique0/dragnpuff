const assert = require('assert');
const { ethers } = require('ethers');
const ReferralsController = require('../api/controllers/referralsController');

// Minimal in-memory mocks for req/res
function mockRes() {
  return {
    statusCode: 200,
    _json: null,
    status(code){ this.statusCode = code; return this; },
    json(obj){ this._json = obj; return this; }
  };
}

describe('ReferralsController.verifyFramePayload', () => {
  it('verifies a signed message', async () => {
    const wallet = ethers.Wallet.createRandom();
    const message = 'Recruit proof test';
    const signature = await wallet.signMessage(message);
    // Call internal verification via submitReferral path
    const req = { body: { referrerFid: '100', refereeFid: '200', context: 'frame', payload: { address: wallet.address, message, signature }, meta: {} } };
    const res = mockRes();
    // We cannot write to Firestore in test env; just assert validation error is not signature-related
    await ReferralsController.submitReferral(req, res);
    assert(res._json, 'expects response');
    // Either success (if Firestore initialized) or invalid Firestore error; but not invalid signature
    const err = res._json && res._json.error ? res._json.error.toLowerCase() : '';
    assert(!err.includes('invalid frame payload'), 'signature should be valid');
  });
});
