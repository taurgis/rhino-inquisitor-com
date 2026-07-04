import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import nspell from 'nspell';
import enGb from 'dictionary-en-gb';
import matter from 'gray-matter';

/**
 * Blocking spelling and grammar gate for published content.
 *
 * Five checks run over article prose. Front-matter keys/URLs/tags are dropped
 * and only the prose fields (title, description, takeaways) are kept; in the
 * body, code, URLs, HTML tags, and shortcode parameters are masked, so only
 * human-readable text is inspected:
 *
 *   1. Curated misspellings — a map of misspelling -> correction for common
 *      typos, so the report can suggest the exact fix.
 *   2. Dictionary check — every remaining word is looked up in the British
 *      English Hunspell dictionary. en-GB is the single house style, so
 *      American variants (color, organize, center, ...) are flagged and should
 *      be written in British form. Anything the dictionary does not know and
 *      that is not in the project word list (scripts/gates/spelling-allow.txt)
 *      is flagged. The word list is pre-seeded with the jargon, product names,
 *      and cited people's names the site uses, so only genuinely new/unknown
 *      words fail the gate.
 *   3. Repeated words — an accidentally doubled function word ("the the").
 *   4. Error phrases — curated multi-word mistakes a spell checker cannot see
 *      because every word is valid ("should of", "to setup", "more then").
 *   5. Article agreement — "a" vs "an" chosen by the sound of the next word,
 *      including initialisms read letter by letter ("an SFCC instance",
 *      "a URL") and silent-h words ("an hour").
 *
 * When the gate flags a valid word (new jargon, product name, person), add it
 * (lowercased) to scripts/gates/spelling-allow.txt. Regenerate candidates with
 * `node scripts/gates/check-spelling.js --list-unknown`; list stale entries
 * with `--unused-allowlist`. A multi-word allowlist phrase is masked before
 * any check runs, so it also suppresses a false-positive article or phrase
 * finding (e.g. add "a slas" if that initialism is read as a word).
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
  accomodate: 'accommodate',
  acheive: 'achieve',
  alot: 'a lot',
  arguement: 'argument',
  becuase: 'because',
  begining: 'beginning',
  beleive: 'believe',
  calender: 'calendar',
  catagory: 'category',
  commited: 'committed',
  definately: 'definitely',
  dependancy: 'dependency',
  dependancies: 'dependencies',
  enviroment: 'environment',
  enviroments: 'environments',
  existance: 'existence',
  foriegn: 'foreign',
  goverment: 'government',
  independant: 'independent',
  occured: 'occurred',
  occurance: 'occurrence',
  publically: 'publicly',
  recieve: 'receive',
  recieved: 'received',
  seperate: 'separate',
  seperated: 'separated',
  seperately: 'separately',
  succesful: 'successful',
  suprise: 'surprise',
  tommorow: 'tomorrow',
  untill: 'until',
  wich: 'which',
  wierd: 'weird',
  // Technical / web-flavoured misspellings
  compatability: 'compatibility',
  defualt: 'default',
  paramater: 'parameter',
  paramaters: 'parameters',
  reponse: 'response',
  vaild: 'valid'
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

/**
 * Multi-word mistakes whose individual words are all valid, so neither the
 * dictionary nor the misspelling map can catch them. Keys are lowercase and
 * matched case-insensitively on the first word only: a capital inside the rest
 * of the phrase reads as a proper noun ("to Setup" as a named page) and is
 * left alone.
 */
const PHRASE_ERRORS = {
  // modal + "of" for "have"
  'should of': 'should have',
  'would of': 'would have',
  'could of': 'could have',
  'must of': 'must have',
  'might of': 'might have',
  // "then" where a comparison needs "than"
  'more then': 'more than',
  'less then': 'less than',
  'fewer then': 'fewer than',
  'rather then': 'rather than',
  'other then': 'other than',
  'better then': 'better than',
  'worse then': 'worse than',
  'higher then': 'higher than',
  'lower then': 'lower than',
  'larger then': 'larger than',
  'smaller then': 'smaller than',
  'greater then': 'greater than',
  // compound noun used where the verb phrase is needed ("to checkout" is
  // deliberately absent: "proceed to checkout" is a valid noun reading)
  'to setup': 'to set up',
  'to login': 'to log in',
  'to logout': 'to log out',
  'to backup': 'to back up',
  'to rollback': 'to roll back',
  'to workaround': 'to work around',
  // idioms
  'sneak peak': 'sneak peek',
  'per say': 'per se',
  'in tact': 'intact',
  'case and point': 'case in point',
  'one in the same': 'one and the same',
  'for all intensive purposes': 'for all intents and purposes'
};

const TOKEN_PATTERN = /[A-Za-z][A-Za-z'’]*/gu;
// Lookbehind/lookahead keep hyphenated compounds out: "Apple Web Sign-In in
// SFRA" must not read as a doubled "In in".
const DOUBLED_WORD_PATTERN = /(?<![A-Za-z'’-])([A-Za-z]+)(\s+)(\1)(?![A-Za-z'’-])/giu;
// Article + exactly one space + next word. Masking blanks regions to runs of
// spaces, so requiring a single space keeps the check from pairing an article
// with the first word after a masked code span or link. The lookbehind keeps
// the "A" of "Q&A" (and hyphen/slash compounds) from reading as an article.
const ARTICLE_PATTERN = /(?<![A-Za-z0-9&'’/-])(a|an) ([A-Za-z0-9][A-Za-z0-9'’-]*)/giu;

// Front-matter fields whose values are prose worth spell-checking.
const PROSE_FIELDS = ['title', 'description', 'takeaways'];

let cachedSpeller;

function createSpeller() {
  if (!cachedSpeller) {
    // British English is the single house style: only en-GB is accepted, so
    // American variants (color, organize, center, ...) are flagged and can be
    // converted to their British forms. Enforcing one variant keeps spelling
    // consistent across articles and the word list small.
    cachedSpeller = nspell(enGb);
  }
  return cachedSpeller;
}

function normalizeToken(token) {
  return token.toLowerCase().replace(/[’]/gu, "'");
}

/** Strip a trailing possessive so "developer's" checks as "developer". */
function baseWord(token) {
  return token.replace(/['’]s$/u, '').replace(/['’]$/u, '');
}

/**
 * Words that are not worth dictionary-checking: too short, acronyms (all
 * caps), or code-style identifiers with internal capitals (getProps, GitHub).
 */
function isSkippableToken(token) {
  const base = baseWord(token);
  if (base.length < 3) {
    return true;
  }
  if (/^[A-Z]+$/u.test(base)) {
    return true;
  }
  if (/[A-Z]/u.test(base.slice(1))) {
    return true;
  }
  return false;
}

/** Find curated misspellings in already-masked prose. */
function findMisspellings(prose, allowlist = new Set()) {
  const findings = [];
  for (const match of prose.matchAll(TOKEN_PATTERN)) {
    const normalized = normalizeToken(match[0]);
    if (!Object.hasOwn(MISSPELLINGS, normalized) || allowlist.has(normalized)) {
      continue;
    }
    findings.push({
      type: 'spelling',
      offset: match.index ?? 0,
      found: match[0],
      suggestion: MISSPELLINGS[normalized]
    });
  }
  return findings;
}

/** Find words unknown to the dictionary and the project word list. */
function findUnknownWords(prose, { speller, allowlist = new Set(), suggest = true } = {}) {
  if (!speller) {
    return [];
  }
  const findings = [];
  for (const match of prose.matchAll(TOKEN_PATTERN)) {
    const token = match[0];
    if (isSkippableToken(token)) {
      continue;
    }
    const base = baseWord(token);
    const normalized = normalizeToken(base);
    if (
      Object.hasOwn(MISSPELLINGS, normalized) ||
      allowlist.has(normalized) ||
      speller.correct(base) ||
      speller.correct(normalized) ||
      // Accept stylistic internal apostrophes, e.g. 'event'ful -> eventful
      speller.correct(base.replace(/['’]/gu, ''))
    ) {
      continue;
    }
    const suggestions = suggest ? speller.suggest(base).slice(0, 2) : [];
    findings.push({
      type: 'unknown-word',
      offset: match.index ?? 0,
      found: token,
      suggestion: suggestions.join(', ')
    });
  }
  return findings;
}

/** Find accidentally repeated function words in already-masked prose. */
function findDoubledWords(prose, allowlist = new Set()) {
  const findings = [];
  for (const match of prose.matchAll(DOUBLED_WORD_PATTERN)) {
    const word = match[1].toLowerCase();
    if (!DOUBLED_WORDS.has(word) || allowlist.has(word)) {
      continue;
    }
    findings.push({
      type: 'repeated-word',
      offset: match.index ?? 0,
      found: `${match[1]}${match[2]}${match[3]}`,
      suggestion: match[1]
    });
  }
  return findings;
}

/** Find curated multi-word error phrases in already-masked prose. */
function findErrorPhrases(prose, allowlist = new Set()) {
  const findings = [];
  for (const [phrase, suggestion] of Object.entries(PHRASE_ERRORS)) {
    if (allowlist.has(phrase)) {
      continue;
    }
    const pattern = new RegExp(
      `\\b${phrase.split(' ').map(escapeRegExp).join('\\s+')}\\b`,
      'giu'
    );
    for (const match of prose.matchAll(pattern)) {
      // A capital anywhere past the first word reads as a proper noun
      // ("to Setup" as a named page), so leave it alone.
      const rest = match[0].slice(match[0].search(/\s/u));
      if (/[A-Z]/u.test(rest)) {
        continue;
      }
      findings.push({
        type: 'phrase',
        offset: match.index ?? 0,
        found: match[0].replace(/\s+/gu, ' '),
        suggestion
      });
    }
  }
  return findings;
}

/** Letters whose spoken names start with a vowel sound: "an SFCC", "an FAQ". */
const VOWEL_SOUND_LETTERS = new Set([...'AEFHILMNORSX']);

/**
 * All-caps acronyms this site reads as words rather than letter by letter, so
 * the article follows the word's opening sound: "a REST API", "a SCAPI hook",
 * "a LINK cartridge". Site usage decides membership (SFRA and SFCC stay
 * letter-read: "an SFRA cartridge").
 */
const WORD_ACRONYMS = new Set(['rest', 'link', 'sig', 'slas', 'scapi', 'soap', 'sql']);

/**
 * The article the next word should take, judged by its opening sound.
 *
 * - Initialisms are read letter by letter: all-caps tokens ("an SFCC
 *   instance" but "a URL" — U is pronounced "you"), leading-caps camel case
 *   ("an HTTPError"), and vowel-less tokens in any case ("an npm package").
 *   All-caps acronyms the site pronounces as words (WORD_ACRONYMS) follow
 *   word rules instead: "a REST API".
 * - Numbers are read out: "an 8-second delay", "an 11th step", "a 404 page".
 * - u-/eu- words with a "you" sound take "a" (a user, a unique, a European);
 *   un- prefixed words keep "an" (an uninstalled cartridge).
 * - Silent-h words take "an" (an hour, an honest answer).
 */
function expectedArticle(next) {
  if (/^[0-9]/u.test(next)) {
    return /^(?:8|11(?![0-9])|18(?![0-9]))/u.test(next) ? 'an' : 'a';
  }
  const head = next.replace(/['’-].*$/u, '');
  const lower = next.toLowerCase();
  if (!WORD_ACRONYMS.has(head.toLowerCase())) {
    const initialism =
      /^[A-Z][A-Z0-9]/u.test(head) || // SFCC, HTTPError, S3
      /^[A-Z]$/u.test(head) || // "an A record"
      !/[aeiouy]/u.test(head.toLowerCase()); // npm, xml, css in any case
    if (initialism) {
      return VOWEL_SOUND_LETTERS.has(head[0].toUpperCase()) ? 'an' : 'a';
    }
  }
  if (/^(?:uni(?![nm])|us(?!h)|ubi|ut[ei]|url|eu|ewe|one(?:$|[-s'’])|once)/u.test(lower)) {
    return 'a';
  }
  if (/^(?:hour|honest|honou?r|heir)/u.test(lower)) {
    return 'an';
  }
  return /^[aeiou]/u.test(lower) ? 'an' : 'a';
}

/** Find "a"/"an" that disagrees with the sound of the following word. */
function findArticleErrors(prose, allowlist = new Set()) {
  const findings = [];
  for (const match of prose.matchAll(ARTICLE_PATTERN)) {
    const article = match[1];
    const next = match[2];
    const expected = expectedArticle(next);
    if (article.toLowerCase() === expected || allowlist.has(`${article.toLowerCase()} ${next.toLowerCase()}`)) {
      continue;
    }
    const corrected = article[0] === article[0].toUpperCase()
      ? expected[0].toUpperCase() + expected.slice(1)
      : expected;
    findings.push({
      type: 'article',
      offset: match.index ?? 0,
      found: `${article} ${next}`,
      suggestion: `${corrected} ${next}`
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

/** Blank every character in `region` except newlines, preserving offsets. */
function blank(region) {
  return region.replace(/[^\n]/gu, ' ');
}

/**
 * Blank a block but keep the quoted values of alt/caption/title so shortcode
 * and HTML prose is still checked while filenames and parameter keys are not.
 * Length and newlines are preserved so byte offsets stay accurate.
 */
function keepProseAttributes(block) {
  const chars = [...blank(block)];
  for (const attr of block.matchAll(/\b(?:alt|caption|title)\s*=\s*"([^"]*)"/giu)) {
    const valueStart = (attr.index ?? 0) + attr[0].indexOf('"') + 1;
    for (let index = 0; index < attr[1].length; index += 1) {
      chars[valueStart + index] = block[valueStart + index];
    }
  }
  return chars.join('');
}

/**
 * Remove regions of the body that are not prose so the checker never inspects
 * code, URLs, HTML tags, or asset references.
 */
function maskNonProse(source) {
  return source
    // Fenced code blocks
    .replace(/```[\s\S]*?```/gu, blank)
    .replace(/~~~[\s\S]*?~~~/gu, blank)
    // Inline code spans
    .replace(/`[^`\n]*`/gu, blank)
    // HTML comments
    .replace(/<!--[\s\S]*?-->/gu, blank)
    // Hugo shortcodes: keep alt/caption/title, blank the rest
    .replace(/\{\{[<%][\s\S]*?[%>]\}\}/gu, keepProseAttributes)
    // HTML tags: keep alt/caption/title, blank the rest
    .replace(/<[^>\n]+>/gu, keepProseAttributes)
    // Bare/parenthesised URLs first — long URLs can contain ")" which would
    // otherwise defeat the link-target rule below. No whitespace in a URL, so
    // \S+ blanks the whole thing.
    .replace(/https?:\/\/\S+/gu, blank)
    // @-mention link text, e.g. [@username] in changelogs
    .replace(/\[@[^\]\n]+\]/gu, blank)
    // Remaining relative markdown link/image targets: ](/local/path/)
    .replace(/\]\(([^)\n]+)\)/gu, blank);
}

function offsetToLine(text, offset) {
  let line = 1;
  for (let index = 0; index < offset && index < text.length; index += 1) {
    if (text[index] === '\n') {
      line += 1;
    }
  }
  return line;
}

function toRepoRelative(absolutePath) {
  return path.relative(REPO_ROOT, absolutePath).split(path.sep).join('/');
}

/**
 * Split a document into its front matter and body, tracking how many lines the
 * front matter occupies so body findings can report absolute line numbers.
 */
function splitDocument(source) {
  const fmMatch = /^---\r?\n[\s\S]*?\r?\n---[ \t]*\r?\n?/u.exec(source);
  if (!fmMatch) {
    return { body: source, bodyLineOffset: 0, data: {} };
  }
  const block = fmMatch[0];
  const bodyLineOffset = (block.match(/\n/gu) ?? []).length;
  let data = {};
  try {
    data = matter(source).data ?? {};
  } catch {
    data = {};
  }
  return { block, body: source.slice(block.length), bodyLineOffset, data };
}

function lineOfKey(source, key) {
  const match = new RegExp(`^${key}\\s*:`, 'mu').exec(source);
  return match ? offsetToLine(source, match.index) : 1;
}

/**
 * Line of a specific front-matter value (e.g. one takeaways list item), so a
 * finding in the third item points at that item rather than at the key. The
 * front-matter block is a prefix of the source, so offsets line up. Falls
 * back to the key's line when the value is not found verbatim (wrapped or
 * escaped YAML).
 */
function lineOfValue(block, value, fallbackLine) {
  const needle = value.slice(0, 60);
  const index = needle.length > 0 ? block.indexOf(needle) : -1;
  return index === -1 ? fallbackLine : offsetToLine(block, index);
}

function findInText(text, options) {
  return [
    ...findMisspellings(text, options.allowlist),
    ...findUnknownWords(text, options),
    ...findDoubledWords(text, options.allowlist),
    ...findErrorPhrases(text, options.allowlist),
    ...findArticleErrors(text, options.allowlist)
  ];
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

/**
 * Blank allowlisted multi-word phrases (proper nouns like "Log Center") so
 * their component words are not individually flagged, without accepting those
 * words elsewhere. Length-preserving, so byte offsets stay accurate.
 */
function maskPhrases(text, phrases) {
  let masked = text;
  for (const phrase of phrases) {
    masked = masked.replace(new RegExp(`\\b${escapeRegExp(phrase)}\\b`, 'giu'), (match) =>
      match.replace(/[^\n]/gu, ' ')
    );
  }
  return masked;
}

/** Analyse a single document's raw source and return de-duplicated findings. */
function analyzeSource(source, { speller, allowlist = new Set(), suggest = true } = {}) {
  const options = { speller, allowlist, suggest };
  const phrases = [...allowlist].filter((entry) => entry.includes(' '));
  const prepare = (text) => maskPhrases(maskNonProse(text), phrases);
  const { block, body, bodyLineOffset, data } = splitDocument(source);
  const collected = [];

  for (const finding of findInText(prepare(body), options)) {
    collected.push({ ...finding, line: bodyLineOffset + offsetToLine(body, finding.offset) });
  }

  for (const field of PROSE_FIELDS) {
    const value = data[field];
    const values = Array.isArray(value) ? value : [value];
    const keyLine = block ? lineOfKey(source, field) : 1;
    for (const entry of values) {
      if (typeof entry !== 'string') {
        continue;
      }
      const entryLine = block ? lineOfValue(block, entry, keyLine) : keyLine;
      for (const finding of findInText(prepare(entry), options)) {
        collected.push({ ...finding, line: entryLine, field });
      }
    }
  }

  const seen = new Set();
  const findings = [];
  for (const finding of collected) {
    const key = `${finding.line}:${finding.field ?? 'body'}:${finding.type}:${finding.found.toLowerCase()}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    findings.push(finding);
  }

  return findings.sort((left, right) => left.line - right.line);
}

function describe(finding) {
  const where = finding.field ? ` (front matter: ${finding.field})` : '';
  if (finding.type === 'repeated-word') {
    return `repeated word "${finding.found.replace(/\s+/gu, ' ')}" -> "${finding.suggestion}"${where}`;
  }
  if (finding.type === 'unknown-word') {
    return finding.suggestion
      ? `unknown word "${finding.found}" (did you mean: ${finding.suggestion}?)${where}`
      : `unknown word "${finding.found}"${where}`;
  }
  if (finding.type === 'phrase') {
    return `error phrase "${finding.found}" -> "${finding.suggestion}"${where}`;
  }
  if (finding.type === 'article') {
    return `article disagreement "${finding.found}" -> "${finding.suggestion}"${where}`;
  }
  return `"${finding.found}" -> "${finding.suggestion}"${where}`;
}

/** Print every unknown word once (lowercased) to help seed the word list. */
async function listUnknown(contentDir) {
  const speller = createSpeller();
  const allowlist = await loadAllowlist();
  const files = (await collectMarkdownFiles(contentDir)).sort((left, right) =>
    left.localeCompare(right)
  );

  const unknown = new Map();
  for (const file of files) {
    const source = await fs.readFile(file, 'utf8');
    for (const finding of analyzeSource(source, { speller, allowlist, suggest: false })) {
      if (finding.type !== 'unknown-word') {
        continue;
      }
      const word = normalizeToken(baseWord(finding.found));
      const entry = unknown.get(word) ?? { count: 0, sample: toRepoRelative(file) };
      entry.count += 1;
      unknown.set(word, entry);
    }
  }

  const sorted = [...unknown.entries()].sort((left, right) => left[0].localeCompare(right[0]));
  for (const [word, { count, sample }] of sorted) {
    process.stdout.write(`${word}\t${count}\t${sample}\n`);
  }
  console.error(`\n${sorted.length} unique unknown word(s) across ${files.length} file(s).`);
}

/**
 * Maintenance mode: list allowlist entries no content currently needs, so the
 * word list can be pruned when articles are removed or rewritten. A word is
 * needed if the dictionary check would flag it with an empty allowlist; a
 * phrase is needed if it still occurs in some file's prose. Advisory only —
 * always exits 0.
 */
async function listUnusedAllowlist(contentDir) {
  const speller = createSpeller();
  const allowlist = await loadAllowlist();
  const files = await collectMarkdownFiles(contentDir);

  const words = new Set([...allowlist].filter((entry) => !entry.includes(' ')));
  const phrases = [...allowlist].filter((entry) => entry.includes(' '));

  const needed = new Set();
  const neededPhrases = new Set();
  for (const file of files) {
    const source = await fs.readFile(file, 'utf8');
    for (const finding of analyzeSource(source, { speller, allowlist: new Set(), suggest: false })) {
      needed.add(normalizeToken(baseWord(finding.found)));
      if (finding.type === 'phrase' || finding.type === 'article') {
        needed.add(finding.found.toLowerCase());
      }
    }
    const prose = maskNonProse(source);
    for (const phrase of phrases) {
      if (new RegExp(`\\b${escapeRegExp(phrase)}\\b`, 'iu').test(prose)) {
        neededPhrases.add(phrase);
      }
    }
  }

  const unused = [
    ...[...words].filter((word) => !needed.has(word)),
    ...phrases.filter((phrase) => !neededPhrases.has(phrase) && !needed.has(phrase))
  ].sort((left, right) => left.localeCompare(right));

  for (const entry of unused) {
    process.stdout.write(`${entry}\n`);
  }
  console.error(
    `\n${unused.length} of ${allowlist.size} allowlist entries not needed by any of ${files.length} content file(s).`
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const contentDir = options.contentDir ?? DEFAULT_CONTENT_DIR;

  if (options.listUnknown) {
    await listUnknown(contentDir);
    return;
  }

  if (options.unusedAllowlist) {
    await listUnusedAllowlist(contentDir);
    return;
  }

  const speller = createSpeller();
  const allowlist = await loadAllowlist();
  const markdownFiles = (await collectMarkdownFiles(contentDir)).sort((left, right) =>
    left.localeCompare(right)
  );

  const findings = [];
  for (const markdownFile of markdownFiles) {
    const source = await fs.readFile(markdownFile, 'utf8');
    const file = toRepoRelative(markdownFile);
    for (const finding of analyzeSource(source, { speller, allowlist })) {
      findings.push({ ...finding, file });
    }
  }

  if (findings.length === 0) {
    console.log(
      `Checked ${markdownFiles.length} content file(s) against the British English dictionary, ${allowlist.size} project word(s), ${Object.keys(MISSPELLINGS).length} curated misspelling(s), ${Object.keys(PHRASE_ERRORS).length} error phrase(s), and the repeated-word and a/an agreement checks. No issues found.`
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
    'Fix the issue, or if the flagged text is valid add it (lowercased word or phrase) to scripts/gates/spelling-allow.txt.'
  );
  process.exitCode = 1;
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--content-dir') {
      parsed.contentDir = path.resolve(argv[++index]);
    } else if (argv[index] === '--list-unknown') {
      parsed.listUnknown = true;
    } else if (argv[index] === '--unused-allowlist') {
      parsed.unusedAllowlist = true;
    }
  }
  return parsed;
}

export {
  MISSPELLINGS,
  DOUBLED_WORDS,
  PHRASE_ERRORS,
  createSpeller,
  maskNonProse,
  findMisspellings,
  findUnknownWords,
  findDoubledWords,
  findErrorPhrases,
  findArticleErrors,
  expectedArticle,
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
