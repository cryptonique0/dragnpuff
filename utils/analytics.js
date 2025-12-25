/**
 * Analytics Tracking Helper
 */

class Analytics {
  constructor() {
    this.events = [];
  }

  trackEvent(eventName, properties = {}) {
    const event = {
      name: eventName,
      properties,
      timestamp: Date.now(),
    };
    this.events.push(event);

    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", eventName, properties);
    }
  }

  trackMint(address, tokenId, price) {
    this.trackEvent("mint", {
      address,
      tokenId,
      price,
    });
  }

  trackHouseChoice(address, houseId) {
    this.trackEvent("house_choice", {
      address,
      houseId,
    });
  }

  trackBreatheFire(address, targetAddress) {
    this.trackEvent("breathe_fire", {
      address,
      targetAddress,
    });
  }

  trackPageView(pageName) {
    this.trackEvent("page_view", {
      page: pageName,
    });
  }

  getEvents() {
    return this.events;
  }

  clearEvents() {
    this.events = [];
  }
}

const analytics = new Analytics();

module.exports = {
  Analytics,
  analytics,
  trackEvent: (name, props) => analytics.trackEvent(name, props),
};
