const https = require('https');
const fs = require('fs');

function getWakaTimeData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject('Chyba při parsování JSON: ' + error.message);
        }
      });
    }).on('error', (error) => {
      reject('Chyba při požadavku: ' + error.message);
    });
  });
}

function createASCIIGraph(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return 'Neočekávaná struktura dat. Nelze vytvořit graf.';
  }

  const graphWidth = 25;
  const dny = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];
  const today = new Date();
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(today.getDate() - 2);

  const relevantData = data.filter(item => {
    const itemDate = new Date(item.range.date);
    return itemDate >= threeDaysAgo && itemDate <= today;
  }).sort((a, b) => new Date(b.range.date) - new Date(a.range.date));

  const maxSeconds = Math.max(...relevantData.map(item => item.grand_total.total_seconds || 0));

  const graph = [];
  for (let i = 0; i < 3; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() - i);
    const item = relevantData.find(d => new Date(d.range.date).toDateString() === currentDate.toDateString());
    
    const seconds = item ? item.grand_total.total_seconds : 0;
    const barLength = maxSeconds > 0 ? (seconds / maxSeconds) * graphWidth : 0;
    const fullBlocks = Math.floor(barLength);
    const partialBlock = fullBlocks < graphWidth ? '🟨' : '';
    
    const bar = '🟩'.repeat(fullBlocks) + 
                partialBlock + 
                '⬜'.repeat(Math.max(graphWidth - fullBlocks - (partialBlock ? 1 : 0), 0));

    const dayText = dny[currentDate.getDay()].padEnd(7);
    const timeText = item ? item.grand_total.text : '0 secs';
    graph.unshift(`${dayText}            ${timeText.padStart(15)} ${bar}`);
  }

  return graph.join('\n');
}

function formatAllTimeData(allTimeData) {
  const grandTotal = allTimeData.data.grand_total;
  return `All time: ${grandTotal.human_readable_total_including_other_language}`;
}

function generateWakaTimeContent(allTimeData, timeData) {
  const allTimeContent = formatAllTimeData(allTimeData);
  const graphContent = createASCIIGraph(timeData.data);

  return `${allTimeContent}

\`\`\`
${graphContent}
\`\`\``;
}

function updateReadmeSection(readmeContent, newContent) {
  const startMarker = '<!-- WAKATIME-START -->';
  const endMarker = '<!-- WAKATIME-END -->';

  const startIndex = readmeContent.indexOf(startMarker);
  const endIndex = readmeContent.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    return readmeContent;
  }

  return readmeContent.substring(0, startIndex + startMarker.length) +
         '\n' + newContent + '\n' +
         readmeContent.substring(endIndex);
}

async function main() {
  try {
    const timeDataUrl = 'https://wakatime.com/share/@patek_cz/4253e379-bca0-4732-b22d-16eb74730130.json';
    const allTimeDataUrl = 'https://wakatime.com/share/@patek_cz/7eed1af5-ca68-4889-b018-456edef34023.json';

    const [timeResponse, allTimeResponse] = await Promise.all([
      getWakaTimeData(timeDataUrl),
      getWakaTimeData(allTimeDataUrl)
    ]);

    const wakaTimeContent = generateWakaTimeContent(allTimeResponse, timeResponse);

    let readmeContent = fs.readFileSync('README.md', 'utf8');
    const updatedReadmeContent = updateReadmeSection(readmeContent, wakaTimeContent);

    fs.writeFileSync('README.md', updatedReadmeContent);
  } catch (error) {
  }
}

main();
