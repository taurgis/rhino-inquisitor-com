import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/**
 * Blocking spelling gate for published content.
 *
 * Catches obvious, unambiguous English mistakes in article prose so they do
 * not reach production. Two checks run:
 *
 *   1. Misspellings — a curated map of misspelling -> correction. Only tokens
 *      that are essentially never valid English words (and never valid
 *      SFCC/technical jargon or British spellings) belong here, which keeps the
 *      gate free of false positives on domain terms.
 *   2. Repeated words — an accidentally doubled function word ("the the"). Only
 *      lowercase occurrences of a small safelist are flagged, so proper nouns
 *      ("Will Will"), sentence starts, and the rare valid double ("had had",
 *      "that that") are left alone.
 *
 * The gate deliberately does NOT try to be a full grammar or dictionary spell
 * checker — that would flag jargon on every run. It targets the "obvious typo"
 * class of defect. To broaden coverage, add pairs to MISSPELLINGS. To silence a
 * token that is intentional in context, add it (lowercased) to
 * scripts/gates/spelling-allow.txt.
 */

const REPO_ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const DEFAULT_CONTENT_DIR = path.join(REPO_ROOT, 'src/content');
const ALLOWLIST_PATH = path.join(REPO_ROOT, 'scripts/gates/spelling-allow.txt');

// misspelling (lowercase) -> suggested correction
const MISSPELLINGS = {
  // Very common transposition typos
  adn: 'and',
  hte: 'the',
  taht: 'that',
  teh: 'the',
  waht: 'what',
  wiht: 'with',
  // General common misspellings
  abbout: 'about',
  accomodate: 'accommodate',
  accross: 'across',
  acheive: 'achieve',
  acheived: 'achieved',
  adress: 'address',
  aggresive: 'aggressive',
  alot: 'a lot',
  alredy: 'already',
  ammount: 'amount',
  apparant: 'apparent',
  aquire: 'acquire',
  arguement: 'argument',
  auther: 'author',
  becuase: 'because',
  begining: 'beginning',
  beleive: 'believe',
  belive: 'believe',
  benefical: 'beneficial',
  bizzare: 'bizarre',
  buisness: 'business',
  calender: 'calendar',
  catagory: 'category',
  cateogry: 'category',
  commited: 'committed',
  commitee: 'committee',
  comparision: 'comparison',
  completly: 'completely',
  concious: 'conscious',
  consistant: 'consistent',
  definately: 'definitely',
  definatly: 'definitely',
  dependancy: 'dependency',
  dependancies: 'dependencies',
  developement: 'development',
  differnt: 'different',
  dissapear: 'disappear',
  dissapoint: 'disappoint',
  embarass: 'embarrass',
  enchancement: 'enhancement',
  enchancements: 'enhancements',
  enviroment: 'environment',
  enviroments: 'environments',
  equiptment: 'equipment',
  especialy: 'especially',
  everytime: 'every time',
  exampe: 'example',
  examle: 'example',
  excpetion: 'exception',
  existance: 'existence',
  familar: 'familiar',
  finaly: 'finally',
  foriegn: 'foreign',
  foward: 'forward',
  freind: 'friend',
  gaurd: 'guard',
  goverment: 'government',
  grammer: 'grammar',
  greatful: 'grateful',
  happend: 'happened',
  harrass: 'harass',
  heirarchy: 'hierarchy',
  hierachy: 'hierarchy',
  immediatly: 'immediately',
  independant: 'independent',
  infite: 'infinite',
  knowlege: 'knowledge',
  langauge: 'language',
  lenght: 'length',
  liason: 'liaison',
  maintainance: 'maintenance',
  maintenence: 'maintenance',
  managment: 'management',
  neccessary: 'necessary',
  necesary: 'necessary',
  noticable: 'noticeable',
  occassion: 'occasion',
  occured: 'occurred',
  occurence: 'occurrence',
  occurance: 'occurrence',
  occuring: 'occurring',
  oportunity: 'opportunity',
  oppurtunity: 'opportunity',
  paralell: 'parallel',
  parllel: 'parallel',
  particulary: 'particularly',
  performace: 'performance',
  persistant: 'persistent',
  personel: 'personnel',
  posession: 'possession',
  preceed: 'precede',
  priviledge: 'privilege',
  pronounciation: 'pronunciation',
  publically: 'publicly',
  publicaly: 'publicly',
  questionaire: 'questionnaire',
  reccommend: 'recommend',
  recomend: 'recommend',
  recieve: 'receive',
  recieved: 'received',
  refered: 'referred',
  refering: 'referring',
  relevent: 'relevant',
  religous: 'religious',
  remeber: 'remember',
  reponse: 'response',
  responce: 'response',
  resistence: 'resistance',
  responsibile: 'responsible',
  restaraunt: 'restaurant',
  retreive: 'retrieve',
  retrive: 'retrieve',
  rythm: 'rhythm',
  rhythem: 'rhythm',
  seige: 'siege',
  sentance: 'sentence',
  seperate: 'separate',
  seperated: 'separated',
  seperately: 'separately',
  seperator: 'separator',
  similiar: 'similar',
  sincerly: 'sincerely',
  speach: 'speech',
  succesful: 'successful',
  succesfully: 'successfully',
  successfull: 'successful',
  sucess: 'success',
  sucessful: 'successful',
  sucessfully: 'successfully',
  supercede: 'supersede',
  suprise: 'surprise',
  temperment: 'temperament',
  tendancy: 'tendency',
  threshhold: 'threshold',
  tommorow: 'tomorrow',
  tommorrow: 'tomorrow',
  tounge: 'tongue',
  truely: 'truly',
  unfortunatly: 'unfortunately',
  untill: 'until',
  useable: 'usable',
  varaiation: 'variation',
  varaiations: 'variations',
  vaccuum: 'vacuum',
  vehical: 'vehicle',
  visable: 'visible',
  wich: 'which',
  wierd: 'weird',
  writting: 'writing',
  yeild: 'yield',

  // Technical / web-flavoured misspellings
  atribute: 'attribute',
  attirbute: 'attribute',
  attribue: 'attribute',
  authetication: 'authentication',
  compatability: 'compatibility',
  compatiblity: 'compatibility',
  defualt: 'default',
  delimeter: 'delimiter',
  enviornment: 'environment',
  fuction: 'function',
  fucntion: 'function',
  funtion: 'function',
  heigth: 'height',
  javascipt: 'javascript',
  paramater: 'parameter',
  paramaters: 'parameters',
  paramter: 'parameter',
  paramters: 'parameters',
  recieves: 'receives',
  reqeust: 'request',
  requst: 'request',
  seperatly: 'separately',
  vaild: 'valid',
  widht: 'width'
};

/**
 * Lowercase function words that are virtually never validly doubled. Kept
 * conservative on purpose: words with a legitimate double ("had had",
 * "that that") or a common proper-noun/hyphenated reading ("will", "no",
 * "so", "do") are intentionally excluded.
 */
const DOUBLED_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'at', 'for', 'with',
  'as', 'is', 'are', 'was', 'were', 'be', 'been', 'this', 'these', 'those',
  'it', 'its', 'from', 'by', 'but', 'we', 'you', 'they', 'our', 'your',
  'their', 'then', 'than', 'if', 'into', 'over', 'about', 'which', 'when',
  'where', 'while', 'also', 'not', 'has', 'have', 'will'
]);

const TOKEN_PATTERN = /[A-Za-z][A-Za-z'’-]*/gu;
const DOUBLED_WORD_PATTERN = /\b([a-z]+)(\s+)(\1)\b/gu;

function normalizeToken(token) {
  return token.toLowerCase().replace(/[’]/gu, "'");
}

/**
 * Find curated misspellings in already-masked prose. `allowlist` is a Set of
 * lowercased tokens to skip.
 */
function findMisspellings(prose, allowlist = new Set()) {
  const findings = [];
  for (const match of prose.matchAll(TOKEN_PATTERN)) {
    const token = match[0];
    const normalized = normalizeToken(token);
    if (!Object.hasOwn(MISSPELLINGS, normalized) || allowlist.has(normalized)) {
      continue;
    }
    findings.push({
      type: 'spelling',
      offset: match.index ?? 0,
      found: token,
      suggestion: MISSPELLINGS[normalized]
    });
  }
  return findings;
}

/** Find accidentally repeated function words in already-masked prose. */
function findDoubledWords(prose, allowlist = new Set()) {
  const findings = [];
  for (const match of prose.matchAll(DOUBLED_WORD_PATTERN)) {
    const word = match[1];
    if (!DOUBLED_WORDS.has(word) || allowlist.has(word)) {
      continue;
    }
    findings.push({
      type: 'repeated-word',
      offset: match.index ?? 0,
      found: `${match[1]}${match[2]}${match[3]}`,
      suggestion: word
    });
  }
  return findings;
}

async function collectMarkdownFiles(contentDir) {
  let entries;
  try {
    entries = await fs.readdir(contentDir, { recursive: true, withFileTypes: true });
  } catch {
    return [];
  }

  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.md'))
    .map((entry) => path.join(entry.parentPath ?? entry.path, entry.name));
}

async function loadAllowlist() {
  let raw;
  try {
    raw = await fs.readFile(ALLOWLIST_PATH, 'utf8');
  } catch {
    return new Set();
  }

  const words = raw
    .split(/\r?\n/u)
    .map((line) => line.replace(/#.*$/u, '').trim().toLowerCase())
    .filter((line) => line.length > 0);

  return new Set(words);
}

/**
 * Remove regions that are not prose so the checker never inspects code,
 * URLs, or asset references.
 */
function maskNonProse(source) {
  return source
    // Fenced code blocks
    .replace(/```[\s\S]*?```/gu, (block) => block.replace(/[^\n]/gu, ' '))
    .replace(/~~~[\s\S]*?~~~/gu, (block) => block.replace(/[^\n]/gu, ' '))
    // Inline code spans
    .replace(/`[^`\n]*`/gu, (span) => span.replace(/[^\n]/gu, ' '))
    // HTML comments
    .replace(/<!--[\s\S]*?-->/gu, (block) => block.replace(/[^\n]/gu, ' '))
    // Markdown link/image targets: (https://...) and (/local/path/)
    .replace(/\]\(([^)\n]+)\)/gu, (match) => match.replace(/[^\n]/gu, ' '))
    // Bare URLs
    .replace(/https?:\/\/\S+/gu, (url) => url.replace(/[^\n]/gu, ' '));
}

function offsetToLine(source, offset) {
  let line = 1;
  for (let index = 0; index < offset && index < source.length; index += 1) {
    if (source[index] === '\n') {
      line += 1;
    }
  }
  return line;
}

function toRepoRelative(absolutePath) {
  return path.relative(REPO_ROOT, absolutePath).split(path.sep).join('/');
}

/** Analyse a single document's raw source and return de-duplicated findings. */
function analyzeSource(source, allowlist = new Set()) {
  const prose = maskNonProse(source);
  const raw = [...findMisspellings(prose, allowlist), ...findDoubledWords(prose, allowlist)];

  const seen = new Set();
  const findings = [];
  for (const finding of raw) {
    const line = offsetToLine(source, finding.offset);
    const key = `${line}:${finding.type}:${finding.found.toLowerCase()}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    findings.push({ ...finding, line });
  }

  return findings.sort((left, right) => left.line - right.line);
}

function describe(finding) {
  return finding.type === 'repeated-word'
    ? `repeated word "${finding.found.replace(/\s+/gu, ' ')}" -> "${finding.suggestion}"`
    : `"${finding.found}" -> "${finding.suggestion}"`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const contentDir = options.contentDir ?? DEFAULT_CONTENT_DIR;
  const allowlist = await loadAllowlist();

  const markdownFiles = (await collectMarkdownFiles(contentDir)).sort((left, right) =>
    left.localeCompare(right)
  );

  const findings = [];
  for (const markdownFile of markdownFiles) {
    const source = await fs.readFile(markdownFile, 'utf8');
    const file = toRepoRelative(markdownFile);
    for (const finding of analyzeSource(source, allowlist)) {
      findings.push({ ...finding, file });
    }
  }

  if (findings.length === 0) {
    console.log(
      `Checked ${markdownFiles.length} content file(s) against ${Object.keys(MISSPELLINGS).length} known misspelling(s) and ${DOUBLED_WORDS.size} repeated-word pattern(s). No spelling issues found.`
    );
    return;
  }

  console.error(
    `Found ${findings.length} spelling issue(s) across ${markdownFiles.length} content file(s):`
  );
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line}  ${describe(finding)}`);
    if (process.env.GITHUB_ACTIONS) {
      console.error(
        `::error file=${finding.file},line=${finding.line},title=spelling gate::${describe(finding)}`
      );
    }
  }
  console.error(
    'Fix the issue, or if it is intentional add the lowercased word to scripts/gates/spelling-allow.txt.'
  );
  process.exitCode = 1;
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--content-dir') {
      parsed.contentDir = path.resolve(argv[++index]);
    }
  }
  return parsed;
}

export {
  MISSPELLINGS,
  DOUBLED_WORDS,
  maskNonProse,
  findMisspellings,
  findDoubledWords,
  analyzeSource,
  loadAllowlist
};

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
