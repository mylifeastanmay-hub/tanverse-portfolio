import fs from 'fs';

const filePath = 'C:/Users/mylif/.gemini/antigravity/brain/f8b163a0-1b03-48f2-8d2d-85be9b75d043/.system_generated/steps/419/content.md';
const content = fs.readFileSync(filePath, 'utf8');

// Let's write a regex that matches the text content of HTML elements
// by matching tags and capturing anything in between that doesn't contain tags.
// But first, let's find specific phrases like "python" or "machine learning" in the raw content to see where they are.
const query = 'python';
let pos = 0;
while (true) {
  const idx = content.toLowerCase().indexOf(query, pos);
  if (idx === -1) break;
  console.log(`Found "${query}" at position ${idx}:`);
  console.log(content.substring(Math.max(0, idx - 100), Math.min(content.length, idx + 200)));
  console.log('------------------------------------\n');
  pos = idx + query.length;
}

// Let's also check for "volunteer"
console.log('Checking for volunteer in raw HTML:');
const query2 = 'volunteer';
let pos2 = 0;
while (true) {
  const idx = content.toLowerCase().indexOf(query2, pos2);
  if (idx === -1) break;
  console.log(`Found "${query2}" at position ${idx}:`);
  console.log(content.substring(Math.max(0, idx - 100), Math.min(content.length, idx + 200)));
  console.log('------------------------------------\n');
  pos2 = idx + query2.length;
}
