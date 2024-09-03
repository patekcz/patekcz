const https = require('https');
const fs = require('fs');

const languagesDataUrl = 'https://wakatime.com/share/@patek_cz/92b15acc-b725-4b07-b856-b753899a227b.json';

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
  today.setHours(0, 0, 0, 0);  // Nastavte čas na půlnoc
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);

  const relevantData = data.filter(item => {
    const itemDate = new Date(item.range.date);
    itemDate.setHours(0, 0, 0, 0);  // Nastavte čas na půlnoc
    return itemDate >= sevenDaysAgo && itemDate <= today;
  }).sort((a, b) => new Date(a.range.date) - new Date(b.range.date));

  console.log('Relevantní data:', relevantData);

  const maxSeconds = Math.max(...relevantData.map(item => item.grand_total.total_seconds || 0));

  const graph = [];
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(sevenDaysAgo);
    currentDate.setDate(sevenDaysAgo.getDate() + i);
    console.log('Aktuální datum:', currentDate.toISOString());
    
    const item = relevantData.find(d => {
      const dDate = new Date(d.range.date);
      return dDate.toDateString() === currentDate.toDateString();
    });
    
    const seconds = item ? item.grand_total.total_seconds : 0;
    const barLength = maxSeconds > 0 ? (seconds / maxSeconds) * graphWidth : 0;
    const fullBlocks = Math.floor(barLength);
    const partialBlock = fullBlocks < graphWidth ? '🟨' : '';
    
    const bar = '🟩'.repeat(fullBlocks) + 
                partialBlock + 
                '⬜'.repeat(Math.max(graphWidth - fullBlocks - (partialBlock ? 1 : 0), 0));

    const dayText = dny[currentDate.getDay()].padEnd(7);
    console.log('Den v týdnu:', dayText);
    const timeText = item ? item.grand_total.text : '0 secs';
    graph.push(`${dayText}            ${timeText.padStart(15)} ${bar}`);
  }

  return graph.join('\n');
}

function formatAllTimeData(allTimeData) {
  const grandTotal = allTimeData.data.grand_total;
  return `All time: ${grandTotal.human_readable_total_including_other_language}`;
}

function formatLanguagesData(languagesData) {
  const languages = languagesData.data.map(lang => {
    const iconName = lang.name.toLowerCase().replace(/\s+/g, '-'); // Nahraďte mezery pomlčkami
    const iconMapping = {
    "pdf": "pdf",
    "haskell": "haskell",
    "earthfile": "earthfile",
    "nunjucks": "nunjucks",
    "testOutput": "visual-studio",
    "vb": "visual-studio",
    "mdx": "mdx",
    "lang-cfml": "coldfusion",
    "editorconfig": "editorconfig",
    "tex": "tex",
    "doctex": "tex",
    "latex": "tex",
    "latex-expl3": "tex",
    "terraform": "terraform",
    "elixir": "elixir",
    "erlang": "erlang",
    "yml": "yml",
    "yaml": "yaml",
    "postcss": "postcss",
    "scala": "scala",
    "styl": "stylus",
    "graphql": "graphql",
    "rust": "rust",
    "swift": "swift",
    "ruby": "ruby",
    "svelte": "svelte",
    "gherkin": "cucumber",
    "r": "r",
    "rsweave": "r",
    "jade": "pug",
    "pug": "pug",
    "properties": "gear",
    "perl": "perl",
    "lua": "lua",
    "makefile": "gear",
    "markdown": "markdown",
    "less": "brackets-sky",
    "jinja": "brackets-red",
    "hlsl": "brackets-purple",
    "java": "java",
    "ignore": "ignore",
    "dart": "dart",
    "clojure": "clojure",
    "coffeescript": "coffeescript",
    "fsharp": "fsharp",
    "github-issues": "github",
    "git-commit": "git",
    "git-rebase": "git",
    "git": "git",
    "csharp": "csharp",
    "razor": "razor",
    "aspnetcorerazor": "razor",
    "svg": "svg",
    "handlebars": "brackets-orange",
    "css": "brackets-sky",
    "juliamarkdown": "julia-markdown",
    "julia": "julia",
    "ssh_config": "shell",
    "powershell": "shell",
    "bat": "shell",
    "awk": "shell",
    "shellscript": "shell",
    "php": "php",
    "twig": "twig",
    "haml": "haml",
    "html": "brackets-orange",
    "json": "brackets-yellow",
    "pip-requirements": "python",
    "python": "python",
    "typescript": "ts",
    "javascript": "js",
    "rescript": "rescript",
    "rescript-interface": "rescript-interface",
    "go": "go",
    "c": "c",
    "crystal": "crystal",
    "objective-c": "c",
    "objective-cpp": "c",
    "cpp": "cplus",
    "javascriptreact": "react",
    "typescriptreact": "react-ts",
    "sql": "database",
    "sass": "sass",
    "scss": "sass",
    "sass.hover": "sass",
    "dockercompose": "docker",
    "dockerfile": "docker",
    "xml": "xml",
    "xquery": "xml",
    "xsl": "xml",
    "plaintext": "document",
    "excel": "csv",
    "csv": "csv",
    "tsv": "csv",
    "psv": "csv",
    "jupyter": "notebook",
    "vue": "vue",
    "vue-postcss": "vue",
    "vue-html": "vue",
    "vue.js": "vue",
    "ng-template": "angular",
    "nix": "nix",
    "func": "func",
    "text": "text",
    "ssh_config": "shell",
		"sh": "shell",
		"ksh": "shell",
		"csh": "shell",
		"tcsh": "shell",
		"zsh": "shell",
		"bash": "shell",
		"nu": "shell",
		"bat": "shell",
		"cmd": "shell",
		"awk": "shell",
		"fish": "shell",
		"exp": "shell",
		"ps1": "shell",
		"psm1": "shell",
		"psd1": "shell",
		"ps1xml": "shell",
		"psc1": "shell",
		"pssc": "shell",
    "other": "code-blue",
    };
    const icon = iconMapping[lang.name.toLowerCase()] || 'code-blue'; // Výchozí ikona
    const iconUrl = `https://github.com/patekcz/patekcz/raw/main/icon-language/${icon}.png`;
    return `<span style="display: inline-flex; align-items: center; font-size: 12px; white-space: nowrap;"> <img src="${iconUrl}" height="15" alt="${lang.name.toLowerCase()} logo" style="margin-right: 0px;" /> **${lang.name.toLowerCase()}**: ${lang.percent.toFixed(2)}%</span>`; // Zajištění jednoho řádku
  }).join(' | '); // Použití '|' pro oddělení jazyků

  // Nový kód pro rozdělení jazyků do řádků po 4
  const languagesPerRow = 4;
  const rows = [];
  for (let i = 0; i < languagesData.data.length; i += languagesPerRow) {
    rows.push(languages.slice(i, i + languagesPerRow).join(' | '));
  }
  return rows.join('\n'); // Vložení nového řádku mezi řádky
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
    
    const [timeResponse, allTimeResponse, languagesResponse] = await Promise.all([
      getWakaTimeData(timeDataUrl),
      getWakaTimeData(allTimeDataUrl),
      getWakaTimeData(languagesDataUrl)
    ]);

    const wakaTimeContent = generateWakaTimeContent(allTimeResponse, timeResponse);
    const languagesContent = formatLanguagesData(languagesResponse);

    let readmeContent = fs.readFileSync('README.md', 'utf8');
    const updatedReadmeContent = updateReadmeSection(readmeContent, `${wakaTimeContent}\n\n${languagesContent}`);

    fs.writeFileSync('README.md', updatedReadmeContent);
    console.log('README.md byl úspěšně aktualizován.');
  } catch (error) {
    console.error('Došlo k chybě:', error);
  }
}

main();
