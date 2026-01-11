// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Marketplace
 * @dev NFT marketplace with listing, bidding, and trading functionality
 */
contract Marketplace is Ownable, ReentrancyGuard {
    // Structs
    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool active;
        uint256 createdAt;
    }

    struct Bid {
        address bidder;
        uint256 amount;
        uint256 timestamp;
    }

    struct Offer {
        address buyer;
        address nftContract;
        uint256 tokenId;
        uint256 amount;
        bool accepted;
        uint256 createdAt;
    }

    // State
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Bid[]) public bids;
    mapping(uint256 => Offer[]) public offers;
    mapping(address => uint256[]) public userListings;

    uint256 public listingCounter;
    uint256 public platformFeePercent = 2; // 2%
    address public platformFeeRecipient;

    // Events
    event ListingCreated(uint256 indexed listingId, address indexed seller, address nftContract, uint256 tokenId, uint256 price);
    event ListingCancelled(uint256 indexed listingId);
    event BidPlaced(uint256 indexed listingId, address indexed bidder, uint256 amount);
    event ListingSold(uint256 indexed listingId, address indexed buyer, uint256 price);
    event OfferMade(uint256 indexed offerId, address indexed buyer, address nftContract, uint256 tokenId, uint256 amount);
    event OfferAccepted(uint256 indexed offerId);

    constructor(address _platformFeeRecipient) {
        platformFeeRecipient = _platformFeeRecipient;
    }

    /**
     * List NFT for sale
     */
    function listNFT(
        address _nftContract,
        uint256 _tokenId,
        uint256 _price
    ) external nonReentrant {
        require(_price > 0, "Price must be greater than 0");
        require(ERC721(_nftContract).ownerOf(_tokenId) == msg.sender, "Not owner");

        uint256 listingId = listingCounter++;
        listings[listingId] = Listing({
            seller: msg.sender,
            nftContract: _nftContract,
            tokenId: _tokenId,
            price: _price,
            active: true,
            createdAt: block.timestamp
        });

        userListings[msg.sender].push(listingId);

        emit ListingCreated(listingId, msg.sender, _nftContract, _tokenId, _price);
    }

    /**
     * Cancel listing
     */
    function cancelListing(uint256 _listingId) external nonReentrant {
        Listing storage listing = listings[_listingId];
        require(listing.seller == msg.sender, "Only seller can cancel");
        require(listing.active, "Already inactive");

        listing.active = false;
        emit ListingCancelled(_listingId);
    }

    /**
     * Buy NFT directly
     */
    function buyNFT(uint256 _listingId) external payable nonReentrant {
        Listing storage listing = listings[_listingId];
        require(listing.active, "Listing not active");
        require(msg.value == listing.price, "Incorrect payment");

        listing.active = false;

        // Calculate fees
        uint256 fee = (listing.price * platformFeePercent) / 100;
        uint256 sellerAmount = listing.price - fee;

        // Transfer NFT
        ERC721(listing.nftContract).transferFrom(
            listing.seller,
            msg.sender,
            listing.tokenId
        );

        // Transfer funds
        payable(listing.seller).transfer(sellerAmount);
        payable(platformFeeRecipient).transfer(fee);

        emit ListingSold(_listingId, msg.sender, listing.price);
    }

    /**
     * Place bid on listing
     */
    function placeBid(uint256 _listingId) external payable nonReentrant {
        Listing storage listing = listings[_listingId];
        require(listing.active, "Listing not active");
        require(msg.value > 0, "Bid must be greater than 0");

        bids[_listingId].push(Bid({
            bidder: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        }));

        emit BidPlaced(_listingId, msg.sender, msg.value);
    }

    /**
     * Make offer on NFT
     */
    function makeOffer(
        address _nftContract,
        uint256 _tokenId,
        uint256 _amount
    ) external payable {
        require(msg.value == _amount, "Incorrect payment");

        uint256 offerId = offers[0].length;
        offers[0].push(Offer({
            buyer: msg.sender,
            nftContract: _nftContract,
            tokenId: _tokenId,
            amount: _amount,
            accepted: false,
            createdAt: block.timestamp
        }));

        emit OfferMade(offerId, msg.sender, _nftContract, _tokenId, _amount);
    }

    /**
     * Get listings for user
     */
    function getUserListings(address _user) external view returns (uint256[] memory) {
        return userListings[_user];
    }

    /**
     * Get bid count for listing
     */
    function getBidCount(uint256 _listingId) external view returns (uint256) {
        return bids[_listingId].length;
    }

    /**
     * Set platform fee
     */
    function setPlatformFee(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 10, "Fee too high");
        platformFeePercent = _feePercent;
    }
}
