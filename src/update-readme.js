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
  const maxSeconds = Math.max(...data.slice(0, 3).map(item => item.grand_total.total_seconds));
  const dny = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];

  const graph = data.slice(0, 3).map((item) => {
    const seconds = item.grand_total.total_seconds;
    const barLength = (seconds / maxSeconds) * graphWidth;
    const fullBlocks = Math.floor(barLength);
    const partialBlock = '🟨';
    
    const bar = '🟩'.repeat(fullBlocks) + 
                (fullBlocks < graphWidth ? partialBlock : '') + 
                '⬜'.repeat(Math.max(graphWidth - fullBlocks - 1, 0));

    const date = new Date(item.range.date);
    const dayText = dny[date.getDay()].padEnd(7);
    const timeText = item.grand_total.text.padStart(12);
    return `${dayText}            ${timeText.padStart(15)} ${bar}`;
  });

  return graph.join('\n');
}

function formatAllTimeData(allTimeData) {
  const grandTotal = allTimeData.data.grand_total;
  return `**Celkový čas kódování:** ${grandTotal.human_readable_total_including_other_language}`;
}

function generateWakaTimeContent(allTimeData, timeData) {
  const allTimeContent = formatAllTimeData(allTimeData);
  const graphContent = createASCIIGraph(timeData.data);

  return `## Můj WakaTime přehled

${allTimeContent}

### Aktivita za poslední 3 dny

\`\`\`
${graphContent}
\`\`\`

*Tato sekce je automaticky generována pomocí [WakaTime](https://wakatime.com/) API*
`;
}

function updateReadmeSection(readmeContent, newContent) {
  const startMarker = '<!-- WAKATIME-START -->';
  const endMarker = '<!-- WAKATIME-END -->';

  const startIndex = readmeContent.indexOf(startMarker);
  const endIndex = readmeContent.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    console.error('Značky pro WakaTime sekci nebyly nalezeny v README.');
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
    console.log('README.md byl úspěšně aktualizován.');
  } catch (error) {
    console.error('Chyba při aktualizaci README:', error);
  }
}

main();
