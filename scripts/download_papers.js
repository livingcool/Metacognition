const fs = require('fs');
const https = require('https');
const path = require('path');

const MANIFEST_PATH = path.join(__dirname, 'corpus', 'manifest.csv');
const TARGET_DIR = path.join(__dirname, 'corpus', 'papers');

// Robust CSV row parser for quoted fields
function parseCSVRow(row) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Handle 301/302 redirects recursively
async function downloadFile(url, targetPath) {
  if (!url || !url.startsWith('http')) {
    return;
  }

  return new Promise((resolve) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    https.get(url, options, (response) => {
      // Follow redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        console.log(`Following redirect for: ${url}`);
        resolve(downloadFile(response.headers.location, targetPath));
        return;
      }

      if (response.statusCode === 200) {
        const file = fs.createWriteStream(targetPath);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Downloaded: ${path.basename(targetPath)}`);
          resolve();
        });
      } else {
        console.error(`Status ${response.statusCode}: ${url}`);
        resolve();
      }
    }).on('error', (err) => {
      console.error(`Error: ${url} (${err.message})`);
      resolve();
    });
  });
}

function parseManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('manifest.csv not found');
    return [];
  }

  const content = fs.readFileSync(MANIFEST_PATH, 'utf-8').trim();
  const lines = content.split('\n');
  if (lines.length === 0) return [];

  // Remove potential UTF-8 BOM
  const firstLine = lines[0].replace(/^\uFEFF/, '').toLowerCase().trim();
  const headers = firstLine.split(',');
  
  const filenameIndex = headers.indexOf('filename');
  const urlIndex = headers.indexOf('source_url');

  if (filenameIndex === -1 || urlIndex === -1) {
    console.error('Invalid CSV headers:', headers);
    return [];
  }

  const papers = [];
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVRow(lines[i]);
    if (row[filenameIndex] && row[urlIndex]) {
      papers.push({
        filename: row[filenameIndex],
        url: row[urlIndex]
      });
    }
  }
  return papers;
}

async function start() {
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  const allPapers = parseManifest();
  const papersToDownload = allPapers.filter(p => p.url && p.url.startsWith('http'));
  
  console.log(`Found ${papersToDownload.length} papers in manifest (skipping non-HTTP ones).`);

  for (const paper of papersToDownload) {
    const targetPath = path.join(TARGET_DIR, paper.filename);
    if (!fs.existsSync(targetPath)) {
      await downloadFile(paper.url, targetPath);
    } else {
      console.log(`Skipping (already exists): ${paper.filename}`);
    }
  }
  console.log('Finished download attempt.');
}

start();
