/**
 * Queue Processor Utility
 */

class Queue {
  constructor(concurrency = 1) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  async add(fn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.process();
    });
  }

  async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) return;

    this.running++;
    const { fn, resolve, reject } = this.queue.shift();

    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    }

    this.running--;
    this.process();
  }

  get size() {
    return this.queue.length;
  }
}

function createQueue(concurrency = 1) {
  return new Queue(concurrency);
}

module.exports = {
  Queue,
  createQueue,
};
