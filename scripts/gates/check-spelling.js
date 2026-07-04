import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import nspell from 'nspell';
import enGb from 'dictionary-en-gb';
import enUs from 'dictionary-en';
import matter from 'gray-matter';

/**
 * Blocking spelling and grammar gate for published content.
 *
 * Six checks run over article prose. Front-matter keys/URLs/tags are dropped
 * and only the prose fields (title, description, takeaways) are kept; in the
 * body, code, URLs, HTML tags, and shortcode parameters are masked, so only
 * human-readable text is inspected:
 *
 *   1. Curated misspellings — a map of misspelling -> correction for common
 *      typos, so the report can suggest the exact fix.
 *   2. Dictionary check — every remaining word is looked up in the British
 *      English Hunspell dictionary. en-GB is the single house style, so
 *      American variants (color, organize, center, ...) are flagged and should
 *      be written in British form. A flagged word that the American English
 *      dictionary accepts is reported as an American spelling (with the
 *      British form suggested) rather than as a typo. Anything neither
 *      dictionary knows and that is not in the project word list
 *      (scripts/gates/spelling-allow.txt) is flagged as unknown. The word
 *      list is pre-seeded with the jargon, product names, and cited people's
 *      names the site uses, so only genuinely new/unknown words fail the gate.
 *   3. American forms the en-GB dictionary happens to accept — a curated map
 *      (AMERICANISMS) for words like "toward", "gotten", and noun "license"
 *      that pass a Hunspell lookup but are against the British house style.
 *   4. Repeated words — an accidentally doubled function word ("the the").
 *   5. Error phrases — curated multi-word mistakes a spell checker cannot see
 *      because every word is valid ("should of", "more then", "to setup",
 *      "beta program", "should practice").
 *   6. Article agreement — "a" vs "an" chosen by the sound of the next word,
 *      including initialisms read letter by letter ("an SFCC instance",
 *      "a URL") and silent-h words ("an hour").
 *
 * When the gate flags a valid word (new jargon, product name, person), add it
 * (lowercased) to scripts/gates/spelling-allow.txt. Regenerate candidates with
 * `node scripts/gates/check-spelling.js --list-unknown`; list stale entries
 * with `--unused-allowlist`. A multi-word allowlist phrase is masked before
 * any check runs, so it also suppresses a false-positive article or phrase
 * finding (e.g. add "an slas" if a post spells that acronym out letter by
 * letter instead of reading it as a word).
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
  accidently: 'accidentally',
  comparision: 'comparison',
  embarassing: 'embarrassing',
  guage: 'gauge',
  harrass: 'harass',
  irregardless: 'regardless',
  labled: 'labelled',
  maintainance: 'maintenance',
  miniscule: 'minuscule',
  neccessary: 'necessary',
  noticable: 'noticeable',
  occassion: 'occasion',
  occassionally: 'occasionally',
  occuring: 'occurring',
  perseverence: 'perseverance',
  priviledge: 'privilege',
  recomend: 'recommend',
  refered: 'referred',
  relevent: 'relevant',
  strenght: 'strength',
  succesfully: 'successfully',
  supercede: 'supersede',
  thier: 'their',
  truely: 'truly',
  usefull: 'useful',
  // Technical / web-flavoured misspellings
  compatability: 'compatibility',
  defualt: 'default',
  paramater: 'parameter',
  paramaters: 'parameters',
  reponse: 'response',
  vaild: 'valid'
};

/**
 * American forms that the en-GB Hunspell dictionary accepts, so the
 * dictionary check alone cannot flag them, mapped to the British house-style
 * form. Kept to words where the American reading is by far the likeliest:
 * "license" is listed because British English spells the noun "licence" and
 * this site only ever uses the noun (a genuine verb use — "to license the
 * code" — is correct as written and can be kept via a phrase allowlist entry
 * such as "to license"). Words that are also everyday British words in
 * another sense (meter/metre, tire/tyre, curb/kerb, program for software,
 * disk in computing, dialog for UI dialogs) are deliberately absent —
 * flagging those needs context a word list does not have, so the risky ones
 * are handled as curated phrases (PHRASE_ERRORS) instead.
 */
const AMERICANISMS = {
  anyways: 'anyway',
  gotten: 'got',
  license: 'licence',
  licenses: 'licences',
  oftentimes: 'often',
  toward: 'towards'
};

/**
 * Function words that are virtually never validly doubled. Kept conservative
 * on purpose: words with a legitimate double ("had had", "that that"), a
 * proper-noun reading ("Will Will Smith star?"), or a common hyphenated
 * reading ("no", "so", "do") are intentionally excluded.
 */
const DOUBLED_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'at', 'for', 'with',
  'as', 'is', 'are', 'was', 'were', 'be', 'been', 'this', 'these', 'those',
  'it', 'its', 'from', 'by', 'but', 'we', 'you', 'they', 'our', 'your',
  'their', 'then', 'than', 'if', 'into', 'over', 'about', 'which', 'when',
  'where', 'while', 'also', 'not', 'has', 'have'
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
  'to signup': 'to sign up',
  'to shutdown': 'to shut down',
  'to cleanup': 'to clean up',
  'to logon': 'to log on',
  // British verb "practise": the noun is "practice", so only contexts that
  // force the verb reading are listed (a bare "practice" is usually the noun)
  'to practice': 'to practise',
  'should practice': 'should practise',
  'must practice': 'must practise',
  'can practice': 'can practise',
  'could practice': 'could practise',
  'will practice': 'will practise',
  'would practice': 'would practise',
  'may practice': 'may practise',
  'might practice': 'might practise',
  // British "programme" for schemes and initiatives; a computer program keeps
  // "program", so only noun pairings that are never software are listed.
  // Capitalised proper names ("AppExchange Partner Program") are skipped via
  // PROPER_NOUN_PHRASES.
  'beta program': 'beta programme',
  'pilot program': 'pilot programme',
  'partner program': 'partner programme',
  'mentorship program': 'mentorship programme',
  'rewards program': 'rewards programme',
  'tiers program': 'tiers programme',
  'loyalty program': 'loyalty programme',
  'certification program': 'certification programme',
  'training program': 'training programme',
  'trial program': 'trial programme',
  // British style prefers "different from"
  'different than': 'different from',
  // "in/with regard to" (no s)
  'in regards to': 'in regard to',
  'with regards to': 'with regard to',
  // idioms
  'sneak peak': 'sneak peek',
  'per say': 'per se',
  'in tact': 'intact',
  'case and point': 'case in point',
  'one in the same': 'one and the same',
  'for all intensive purposes': 'for all intents and purposes',
  'could care less': "couldn't care less",
  'on accident': 'by accident',
  'suppose to': 'supposed to',
  'piece of mind': 'peace of mind',
  'free reign': 'free rein',
  'make due': 'make do',
  'mute point': 'moot point',
  'tow the line': 'toe the line',
  'baited breath': 'bated breath',
  'beckon call': 'beck and call',
  'peaked my interest': 'piqued my interest',
  'peaked your interest': 'piqued your interest',
  'hone in on': 'home in on',
  'wet your appetite': 'whet your appetite',
  'off of': 'off',
  'as of yet': 'yet',
  'very unique': 'unique',
  // redundant-acronym phrases (RAS syndrome)
  'pin number': 'PIN',
  'atm machine': 'ATM',
  // GDS style: forms are filled in, not out
  'fill out a form': 'fill in a form',
  'fill out the form': 'fill in the form'
};

const TOKEN_PATTERN = /[A-Za-z][A-Za-z'’]*/gu;
// Lookbehind/lookahead keep hyphenated compounds ("Apple Web Sign-In in SFRA")
// and digit-glued tokens ("a 2in in the box") from reading as doubled words.
const DOUBLED_WORD_PATTERN = /(?<![A-Za-z0-9'’-])([A-Za-z]+)(\s+)(\1)(?![A-Za-z0-9'’-])/giu;
// Article + exactly one space + next word. Masked regions become runs of the
// non-whitespace MASK_CHAR, so an article next to a masked code span or link
// never pairs with the first word beyond it. The lookbehind keeps the "A" of
// "Q&A" (and hyphen/slash compounds) from reading as an article.
const ARTICLE_PATTERN = /(?<![A-Za-z0-9&'’/-])(a|an) ([A-Za-z0-9][A-Za-z0-9'’-]*)/giu;

// Front-matter fields whose values are prose worth spell-checking.
const PROSE_FIELDS = ['title', 'description', 'takeaways'];

let cachedSpeller;
let cachedAmericanSpeller;

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

/**
 * The American English dictionary is used only to classify findings, never to
 * accept words: a word the en-GB dictionary rejects but en-US accepts is an
 * American spelling to convert, not a typo, and the report says so.
 */
function createAmericanSpeller() {
  if (!cachedAmericanSpeller) {
    cachedAmericanSpeller = nspell(enUs);
  }
  return cachedAmericanSpeller;
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

/**
 * Find words unknown to the dictionary and the project word list. A word the
 * American dictionary knows is reported as an American spelling (the en-GB
 * suggester reliably offers the British form for those); anything else is an
 * unknown word.
 */
function findUnknownWords(prose, { speller, usSpeller, allowlist = new Set(), suggest = true } = {}) {
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
      Object.hasOwn(AMERICANISMS, normalized) ||
      allowlist.has(normalized) ||
      speller.correct(base) ||
      speller.correct(normalized) ||
      // Accept stylistic internal apostrophes, e.g. 'event'ful -> eventful
      speller.correct(base.replace(/['’]/gu, ''))
    ) {
      continue;
    }
    const american = usSpeller ? usSpeller.correct(base) || usSpeller.correct(normalized) : false;
    const suggestions = suggest ? speller.suggest(base).slice(0, 2) : [];
    findings.push({
      type: american ? 'american-spelling' : 'unknown-word',
      offset: match.index ?? 0,
      found: token,
      suggestion: suggestions.join(', ')
    });
  }
  return findings;
}

/**
 * Find curated American forms (AMERICANISMS) in already-masked prose. A token
 * glued to a hyphen or apostrophe is left alone — "ill-gotten" is correct
 * British English even though "gotten" on its own is not.
 */
function findAmericanisms(prose, allowlist = new Set()) {
  const findings = [];
  for (const match of prose.matchAll(TOKEN_PATTERN)) {
    const normalized = normalizeToken(baseWord(match[0]));
    if (!Object.hasOwn(AMERICANISMS, normalized) || allowlist.has(normalized)) {
      continue;
    }
    const index = match.index ?? 0;
    const before = index > 0 ? prose[index - 1] : '';
    if (/[-'’]/u.test(before)) {
      continue;
    }
    findings.push({
      type: 'americanism',
      offset: index,
      found: match[0],
      suggestion: AMERICANISMS[normalized]
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
    // A single-letter pair with mismatched case is a label plus an article
    // ("Plan A a.k.a. the fallback"), and a capitalised second word reads as
    // a proper noun or title ("the The Guardian piece") — leave both alone.
    if (match[1].length === 1 && match[1] !== match[3]) {
      continue;
    }
    if (/^[A-Z]/u.test(match[3])) {
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

/** One boundary-anchored, whitespace-flexible regex per phrase, shared by
 * every place that needs to match a multi-word phrase in prose. */
function phrasePattern(phrase, flags) {
  return new RegExp(`\\b${phrase.split(/\s+/u).map(escapeRegExp).join('\\s+')}\\b`, flags);
}

/**
 * PHRASE_ERRORS entries where a capitalised second word is a plausible proper
 * noun ("to Setup" as a named admin page) rather than the same mistake in a
 * title-case heading. Only these skip capitalised matches; "More Then You
 * Think" in a heading is still an error and still flagged.
 */
const PROPER_NOUN_PHRASES = new Set([
  'to setup', 'to login', 'to logout', 'to backup', 'to rollback', 'to workaround',
  'to signup', 'to shutdown', 'to cleanup', 'to logon',
  // "AppExchange Partner Program", "Consulting Partner Program", ... are
  // proper names and keep the American spelling their owner gave them.
  'beta program', 'pilot program', 'partner program', 'mentorship program',
  'rewards program', 'tiers program', 'loyalty program', 'certification program',
  'training program', 'trial program'
]);

const PHRASE_PATTERNS = Object.entries(PHRASE_ERRORS).map(([phrase, suggestion]) => ({
  phrase,
  suggestion,
  pattern: phrasePattern(phrase, 'giu'),
  skipCapitalised: PROPER_NOUN_PHRASES.has(phrase)
}));

/** Find curated multi-word error phrases in already-masked prose. */
function findErrorPhrases(prose) {
  const findings = [];
  for (const { pattern, suggestion, skipCapitalised } of PHRASE_PATTERNS) {
    for (const match of prose.matchAll(pattern)) {
      const rest = match[0].slice(match[0].search(/\s/u));
      if (skipCapitalised && /[A-Z]/u.test(rest)) {
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
 *   word rules instead: "a REST API". Any other all-caps token whose
 *   lowercase form is a dictionary word of three or more letters is
 *   ambiguous — it may be an acronym read letter by letter ("an SPA", "an
 *   SAP") or a word in caps for emphasis or as a protocol verb ("a MUST",
 *   "a GET request") — so either article is accepted (returns null).
 *   Mixed-case plurals like "SLAs" are letter-read, not matched against the
 *   SLAS acronym.
 * - Numbers are read out: "an 8-second delay", "an 11th step", "a 404 page".
 * - u-/eu- words with a "you" sound take "a" (a user, a unique, a European);
 *   un- prefixed words keep "an" (an uninstalled, an unidentified error).
 * - Silent-h words take "an" (an hour, an honest answer).
 */
function expectedArticle(next, speller) {
  if (/^[0-9]/u.test(next)) {
    return /^(?:8|11(?![0-9])|18(?![0-9]))/u.test(next) ? 'an' : 'a';
  }
  const head = next.replace(/['’-].*$/u, '');
  const lower = next.toLowerCase();
  const allCaps = head === head.toUpperCase();
  if (!(allCaps && WORD_ACRONYMS.has(head.toLowerCase()))) {
    if (allCaps && head.length >= 3 && speller?.correct(head.toLowerCase())) {
      return null; // ambiguous: letter-read acronym or caps-for-emphasis word
    }
    const initialism =
      /^[A-Z][A-Z0-9]/u.test(head) || // SFCC, HTTPError, S3, SLAs
      /^[A-Z]$/u.test(head) || // "an A record"
      !/[aeiouy]/u.test(head.toLowerCase()); // npm, xml, css in any case
    if (initialism) {
      return VOWEL_SOUND_LETTERS.has(head[0].toUpperCase()) ? 'an' : 'a';
    }
  }
  if (/^(?:uni(?!dent|diom|[nm])|us(?!h)|ubi|ut[ei]|url|eu|ewe|one(?:$|[-s'’])|once)/u.test(lower)) {
    return 'a';
  }
  if (/^(?:hour|honest|honou?r|heir)/u.test(lower)) {
    return 'an';
  }
  return /^[aeiou]/u.test(lower) ? 'an' : 'a';
}

/**
 * A bare capital "A" is only an article at the start of a sentence; anywhere
 * else it is a label or name ("option A and option B", "Appendix A"). The
 * nearest non-blank character to the left decides.
 */
function isSentenceStart(prose, index) {
  let cursor = index - 1;
  while (cursor >= 0 && (prose[cursor] === ' ' || prose[cursor] === '\t' || prose[cursor] === MASK_CHAR)) {
    cursor -= 1;
  }
  if (cursor < 0 || prose[cursor] === '\n') {
    return true;
  }
  return /[.!?:;"'“”‘’()\[\]—*_#>|-]/u.test(prose[cursor]);
}

/** Find "a"/"an" that disagrees with the sound of the following word. */
function findArticleErrors(prose, speller) {
  const findings = [];
  for (const match of prose.matchAll(ARTICLE_PATTERN)) {
    const article = match[1];
    const next = match[2];
    if (article === 'A' && !isSentenceStart(prose, match.index ?? 0)) {
      continue;
    }
    const expected = expectedArticle(next, speller);
    if (!expected || article.toLowerCase() === expected) {
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
    // AGENTS.md files quote published prose verbatim (including pre-en-GB text),
    // so spell-checking them would re-flag words already fixed in the posts.
    .filter((entry) => entry.name !== 'AGENTS.md')
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
 * Non-whitespace filler for masked regions. Masking with spaces would let
 * whitespace-bridging patterns pair words across a masked span — "pass the
 * `id` the API returns" must not read as a doubled "the the", and an article
 * must not pair with the first word beyond a masked code span.
 */
const MASK_CHAR = '\u0000';

/** Mask every character in `region` except newlines, preserving offsets. */
function blank(region) {
  return region.replace(/[^\n]/gu, MASK_CHAR);
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
 * front-matter block is a prefix of the source, so offsets line up. The
 * search starts at the field's own key so a value that repeats an earlier
 * field's text is not attributed to that earlier line. Falls back to the
 * key's line when the value is not found verbatim (wrapped or escaped YAML).
 */
function lineOfValue(block, value, fallbackLine, fromIndex = 0) {
  const needle = value.slice(0, 60);
  const index = needle.length > 0 ? block.indexOf(needle, fromIndex) : -1;
  return index === -1 ? fallbackLine : offsetToLine(block, index);
}

function findInText(text, options) {
  return [
    ...findMisspellings(text, options.allowlist),
    ...findUnknownWords(text, options),
    ...findAmericanisms(text, options.allowlist),
    ...findDoubledWords(text, options.allowlist),
    ...findErrorPhrases(text),
    ...findArticleErrors(text, options.speller)
  ];
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

/**
 * Blank allowlisted multi-word phrases (proper nouns like "Log Center") so
 * their component words are not individually flagged, without accepting those
 * words elsewhere. Length-preserving, so byte offsets stay accurate. Because
 * this runs before every check, a phrase entry also suppresses a
 * false-positive article or error-phrase finding at those spots.
 */
function maskPhrases(text, phrases) {
  let masked = text;
  for (const phrase of phrases) {
    masked = masked.replace(phrasePattern(phrase, 'giu'), blank);
  }
  return masked;
}

/** Analyse a single document's raw source and return de-duplicated findings. */
function analyzeSource(source, { speller, usSpeller, allowlist = new Set(), suggest = true } = {}) {
  const options = { speller, usSpeller, allowlist, suggest };
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
    const keyIndex = block ? block.search(new RegExp(`^${field}\\s*:`, 'mu')) : -1;
    for (const entry of values) {
      if (typeof entry !== 'string') {
        continue;
      }
      const entryLine = block ? lineOfValue(block, entry, keyLine, Math.max(keyIndex, 0)) : keyLine;
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

const FINDING_LABELS = {
  'repeated-word': 'repeated word ',
  phrase: 'error phrase ',
  article: 'article disagreement ',
  americanism: 'American form ',
  spelling: ''
};

function describe(finding) {
  const where = finding.field ? ` (front matter: ${finding.field})` : '';
  if (finding.type === 'unknown-word') {
    return finding.suggestion
      ? `unknown word "${finding.found}" (did you mean: ${finding.suggestion}?)${where}`
      : `unknown word "${finding.found}"${where}`;
  }
  if (finding.type === 'american-spelling') {
    return finding.suggestion
      ? `American spelling "${finding.found}" (British: ${finding.suggestion})${where}`
      : `American spelling "${finding.found}"${where}`;
  }
  const found = finding.found.replace(/\s+/gu, ' ');
  return `${FINDING_LABELS[finding.type] ?? ''}"${found}" -> "${finding.suggestion}"${where}`;
}

/**
 * Print every unknown word once (lowercased) to help seed the word list.
 * American spellings are excluded on purpose: they should be converted to
 * their British forms, not allowlisted.
 */
async function listUnknown(contentDir) {
  const speller = createSpeller();
  const usSpeller = createAmericanSpeller();
  const allowlist = await loadAllowlist();
  const files = (await collectMarkdownFiles(contentDir)).sort((left, right) =>
    left.localeCompare(right)
  );

  const unknown = new Map();
  for (const file of files) {
    const source = await fs.readFile(file, 'utf8');
    for (const finding of analyzeSource(source, { speller, usSpeller, allowlist, suggest: false })) {
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
  const usSpeller = createAmericanSpeller();
  const allowlist = await loadAllowlist();
  const files = await collectMarkdownFiles(contentDir);

  const words = new Set([...allowlist].filter((entry) => !entry.includes(' ')));
  const phrases = [...allowlist]
    .filter((entry) => entry.includes(' '))
    .map((phrase) => ({ phrase, pattern: phrasePattern(phrase, 'iu') }));

  const wordFindingTypes = new Set(['unknown-word', 'spelling', 'american-spelling', 'americanism']);
  const neededWords = new Set();
  const neededPhrases = new Set();
  for (const file of files) {
    const source = await fs.readFile(file, 'utf8');
    for (const finding of analyzeSource(source, { speller, usSpeller, allowlist: new Set(), suggest: false })) {
      if (wordFindingTypes.has(finding.type)) {
        neededWords.add(normalizeToken(baseWord(finding.found)));
      }
    }
    // A phrase entry is needed while its text still occurs anywhere in the
    // file's prose (it masks those occurrences from every check).
    const prose = maskNonProse(source);
    for (const { phrase, pattern } of phrases) {
      if (pattern.test(prose)) {
        neededPhrases.add(phrase);
      }
    }
  }

  const unused = [
    ...[...words].filter((word) => !neededWords.has(word)),
    ...phrases.filter(({ phrase }) => !neededPhrases.has(phrase)).map(({ phrase }) => phrase)
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
  const usSpeller = createAmericanSpeller();
  const allowlist = await loadAllowlist();
  const markdownFiles = (await collectMarkdownFiles(contentDir)).sort((left, right) =>
    left.localeCompare(right)
  );

  const findings = [];
  for (const markdownFile of markdownFiles) {
    const source = await fs.readFile(markdownFile, 'utf8');
    const file = toRepoRelative(markdownFile);
    for (const finding of analyzeSource(source, { speller, usSpeller, allowlist })) {
      findings.push({ ...finding, file });
    }
  }

  if (findings.length === 0) {
    console.log(
      `Checked ${markdownFiles.length} content file(s) against the British English dictionary, ${allowlist.size} project word(s), ${Object.keys(MISSPELLINGS).length} curated misspelling(s), ${Object.keys(AMERICANISMS).length} American form(s), ${Object.keys(PHRASE_ERRORS).length} error phrase(s), and the repeated-word and a/an agreement checks. No issues found.`
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
  AMERICANISMS,
  DOUBLED_WORDS,
  PHRASE_ERRORS,
  createSpeller,
  createAmericanSpeller,
  maskNonProse,
  findMisspellings,
  findUnknownWords,
  findAmericanisms,
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
