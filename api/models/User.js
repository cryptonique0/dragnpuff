/**
 * User Model
 * Represents a user in the DragNPuff platform
 */

class User {
  constructor(address, data = {}) {
    this.address = address.toLowerCase();
    this.username = data.username || '';
    this.email = data.email || '';
    this.bio = data.bio || '';
    this.avatar = data.avatar || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.nonce = data.nonce || Math.floor(Math.random() * 1000000);
    this.verified = data.verified || false;
    this.lastLogin = data.lastLogin || null;
    this.followers = data.followers || [];
    this.following = data.following || [];
    this.preferences = data.preferences || {
      notifications: true,
      newsletter: true,
      theme: 'light'
    };
  }

  static async findByAddress(address) {
    // TODO: Implement database lookup
    return new User(address);
  }

  static async findByUsername(username) {
    // TODO: Implement database lookup
    return null;
  }

  static async create(address, data) {
    const user = new User(address, data);
    // TODO: Save to database
    return user;
  }

  async save() {
    this.updatedAt = new Date();
    // TODO: Save to database
    return this;
  }

  async updateNonce() {
    this.nonce = Math.floor(Math.random() * 1000000);
    await this.save();
    return this.nonce;
  }

  async verifySignature(signature, message) {
    // TODO: Implement signature verification
    this.verified = true;
    this.lastLogin = new Date();
    await this.save();
    return true;
  }

  toJSON() {
    return {
      address: this.address,
      username: this.username,
      email: this.email,
      bio: this.bio,
      avatar: this.avatar,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      verified: this.verified,
      followers: this.followers.length,
      following: this.following.length,
      preferences: this.preferences
    };
  }
}

module.exports = User;
