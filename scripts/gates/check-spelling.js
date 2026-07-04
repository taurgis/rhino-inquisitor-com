import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Blocking spelling gate for published content.
 *
 * Catches obvious, unambiguous English misspellings in article prose so they
 * do not reach production. The dictionary below is a curated map of
 * misspelling -> correction. Only tokens that are essentially never valid
 * English words (and never valid SFCC/technical jargon or British spellings)
 * belong here — this keeps the gate free of false positives on domain terms.
 *
 * The gate deliberately does NOT try to be a full grammar checker. It targets
 * the "obvious typo" class of defect. To broaden coverage over time, add more
 * misspelling -> correction pairs to MISSPELLINGS. To silence a specific token
 * that this gate flags but is intentional in context, add it (lowercased) to
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

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const contentDir = options.contentDir ?? DEFAULT_CONTENT_DIR;
  const allowlist = await loadAllowlist();

  const markdownFiles = (await collectMarkdownFiles(contentDir)).sort((left, right) =>
    left.localeCompare(right)
  );

  const tokenPattern = /[A-Za-z][A-Za-z'’-]*/gu;
  const findings = [];

  for (const markdownFile of markdownFiles) {
    const source = await fs.readFile(markdownFile, 'utf8');
    const prose = maskNonProse(source);

    for (const match of prose.matchAll(tokenPattern)) {
      const token = match[0];
      const normalized = token.toLowerCase().replace(/[’]/gu, "'");
      if (!Object.hasOwn(MISSPELLINGS, normalized) || allowlist.has(normalized)) {
        continue;
      }
      const suggestion = MISSPELLINGS[normalized];

      findings.push({
        file: toRepoRelative(markdownFile),
        line: offsetToLine(source, match.index ?? 0),
        found: token,
        suggestion
      });
    }
  }

  if (findings.length === 0) {
    console.log(
      `Checked ${markdownFiles.length} content file(s) against ${Object.keys(MISSPELLINGS).length} known misspelling(s). No spelling issues found.`
    );
    return;
  }

  console.error(
    `Found ${findings.length} spelling issue(s) across ${markdownFiles.length} content file(s):`
  );
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line}  "${finding.found}" -> "${finding.suggestion}"`);
    if (process.env.GITHUB_ACTIONS) {
      const message = `Spelling: "${finding.found}" should be "${finding.suggestion}"`;
      console.error(`::error file=${finding.file},line=${finding.line},title=spelling gate::${message}`);
    }
  }
  console.error(
    'Fix the misspelling, or if it is intentional add the lowercased word to scripts/gates/spelling-allow.txt.'
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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
