/**
 * Event Emitter Utility
 */

class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(listener);
    return this;
  }

  once(event, listener) {
    const wrappedListener = (...args) => {
      listener.apply(this, args);
      this.off(event, wrappedListener);
    };
    return this.on(event, wrappedListener);
  }

  off(event, listener) {
    if (!this.events.has(event)) return this;

    const listeners = this.events.get(event);
    const idx = listeners.indexOf(listener);
    if (idx > -1) listeners.splice(idx, 1);

    return this;
  }

  emit(event, ...args) {
    if (!this.events.has(event)) return this;

    const listeners = this.events.get(event);
    listeners.forEach((listener) => listener.apply(this, args));

    return this;
  }

  listenerCount(event) {
    return this.events.has(event) ? this.events.get(event).length : 0;
  }
}

function createEmitter() {
  return new EventEmitter();
}

module.exports = {
  EventEmitter,
  createEmitter,
};
