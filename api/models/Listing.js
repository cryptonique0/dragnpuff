/**
 * Listing Model
 * Represents an NFT marketplace listing
 */

class Listing {
  constructor(listingId, data = {}) {
    this.listingId = listingId;
    this.nftId = data.nftId || '';
    this.seller = data.seller?.toLowerCase() || '';
    this.price = data.price || 0;
    this.currency = data.currency || 'ETH';
    this.status = data.status || 'active'; // active, sold, cancelled
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.bids = data.bids || [];
    this.offers = data.offers || [];
    this.highestBid = data.highestBid || null;
  }

  static async findById(listingId) {
    // TODO: Implement database lookup
    return new Listing(listingId);
  }

  static async findByNFT(nftId) {
    // TODO: Implement database lookup
    return [];
  }

  static async findBySeller(seller) {
    // TODO: Implement database lookup
    return [];
  }

  static async create(nftId, seller, price) {
    const listing = new Listing(Math.random().toString(36), {
      nftId,
      seller,
      price,
      createdAt: new Date()
    });
    // TODO: Save to database
    return listing;
  }

  addBid(bidder, amount) {
    const bid = {
      bidder: bidder.toLowerCase(),
      amount,
      timestamp: new Date()
    };
    this.bids.push(bid);
    if (!this.highestBid || amount > this.highestBid.amount) {
      this.highestBid = bid;
    }
    return bid;
  }

  addOffer(offerer, amount) {
    const offer = {
      offerer: offerer.toLowerCase(),
      amount,
      timestamp: new Date(),
      status: 'pending'
    };
    this.offers.push(offer);
    return offer;
  }

  acceptOffer(offerId) {
    const offer = this.offers.find(o => o.id === offerId);
    if (offer) {
      offer.status = 'accepted';
      this.status = 'sold';
    }
    return offer;
  }

  sell(buyer) {
    this.status = 'sold';
    this.updatedAt = new Date();
    return this;
  }

  cancel() {
    this.status = 'cancelled';
    this.updatedAt = new Date();
    return this;
  }

  async save() {
    this.updatedAt = new Date();
    // TODO: Save to database
    return this;
  }

  toJSON() {
    return {
      listingId: this.listingId,
      nftId: this.nftId,
      seller: this.seller,
      price: this.price,
      currency: this.currency,
      status: this.status,
      createdAt: this.createdAt,
      bids: this.bids.length,
      highestBid: this.highestBid?.amount || null,
      offers: this.offers.length
    };
  }
}

module.exports = Listing;
