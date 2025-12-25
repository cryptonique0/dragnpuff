/**
 * Performance Monitoring Utilities
 */

class PerformanceMonitor {
  constructor() {
    this.marks = new Map();
    this.measures = [];
  }

  mark(name) {
    this.marks.set(name, Date.now());
  }

  measure(name, startMark, endMark) {
    const start = this.marks.get(startMark);
    const end = this.marks.get(endMark);

    if (!start || !end) {
      console.warn(`Missing mark for measurement: ${name}`);
      return null;
    }

    const duration = end - start;
    this.measures.push({ name, duration });
    return duration;
  }

  getDuration(markName) {
    const markTime = this.marks.get(markName);
    return markTime ? Date.now() - markTime : null;
  }

  getMeasures() {
    return this.measures;
  }

  clear() {
    this.marks.clear();
    this.measures = [];
  }
}

function createMonitor() {
  return new PerformanceMonitor();
}

module.exports = {
  PerformanceMonitor,
  createMonitor,
};
