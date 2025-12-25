/**
 * File System Utilities
 * Provides helper functions for file operations
 */

const fs = require("fs");
const path = require("path");

/**
 * Read file safely
 * @param {string} filePath - Path to file
 * @returns {Promise<string>} File contents
 */
async function readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

/**
 * Write file safely
 * @param {string} filePath - Path to file
 * @param {string} content - Content to write
 * @returns {Promise<void>}
 */
async function writeFile(filePath, content) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(filePath);
    
    // Create directory if doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFile(filePath, content, "utf8", (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * Check if file exists
 * @param {string} filePath - Path to file
 * @returns {boolean} Whether file exists
 */
function exists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Delete file
 * @param {string} filePath - Path to file
 * @returns {Promise<void>}
 */
async function deleteFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * List files in directory
 * @param {string} dirPath - Path to directory
 * @returns {Promise<Array<string>>} File names
 */
async function listFiles(dirPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirPath, (err, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  });
}

/**
 * Get file stats
 * @param {string} filePath - Path to file
 * @returns {Promise<object>} File stats
 */
async function getStats(filePath) {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) reject(err);
      else resolve(stats);
    });
  });
}

/**
 * Read JSON file
 * @param {string} filePath - Path to JSON file
 * @returns {Promise<object>} Parsed JSON
 */
async function readJSON(filePath) {
  const content = await readFile(filePath);
  return JSON.parse(content);
}

/**
 * Write JSON file
 * @param {string} filePath - Path to JSON file
 * @param {object} data - Data to write
 * @returns {Promise<void>}
 */
async function writeJSON(filePath, data) {
  const content = JSON.stringify(data, null, 2);
  return writeFile(filePath, content);
}

/**
 * Append to file
 * @param {string} filePath - Path to file
 * @param {string} content - Content to append
 * @returns {Promise<void>}
 */
async function appendFile(filePath, content) {
  return new Promise((resolve, reject) => {
    fs.appendFile(filePath, content, "utf8", (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * Copy file
 * @param {string} source - Source file path
 * @param {string} destination - Destination file path
 * @returns {Promise<void>}
 */
async function copyFile(source, destination) {
  return new Promise((resolve, reject) => {
    fs.copyFile(source, destination, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

module.exports = {
  readFile,
  writeFile,
  exists,
  deleteFile,
  listFiles,
  getStats,
  readJSON,
  writeJSON,
  appendFile,
  copyFile,
};
