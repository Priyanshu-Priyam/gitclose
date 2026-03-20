/**
 * Pre-output hook — Echo variance commentary agent.
 * Validates material variance coverage, management revenue presentation, and attribution tags.
 *
 * Expected payload (flexible):
 *   { markdown: string, variances?: VarianceRecord[], meta?: object }
 *
 * VarianceRecord (recommended shape from compute_variances / generate_commentary):
 *   {
 *     account_id: string,
 *     account_name?: string,
 *     category: 'revenue' | 'expense' | 'cogs' | 'other',
 *     material_for_commentary?: boolean,
 *     material_for_detail?: boolean,
 *     ...
 *   }
 *
 * Returns { ok: boolean, errors: string[], warnings: string[] }
 */
const SOURCE_TAG_PATTERN =
  /\[(?:source|attribution)\s*:\s*(memory|data|calculation|investigation)([^\]]*)\]/gi;

function countAllSourceTags(text) {
  const re = new RegExp(SOURCE_TAG_PATTERN.source, 'gi');
  return (text.match(re) || []).length;
}

/**
 * Heuristic: revenue / income presented as a negative display amount (parentheses or leading minus).
 * Includes a pipe-aware branch so markdown tables like "| Revenue | ($500,000) |" are caught.
 */
function revenueLooksNegative(markdown) {
  const sameCell =
    /(?:^|\n|\|)\s*(?:revenue|income|sales|engineering\s+services|pm\s+fees|fee\s+revenue)[^|\n]*?(?:\(\s*AUD\s*\$?\s*[0-9][0-9,]*|\(\s*\$[0-9][0-9,]*|-\s*AUD\s*\$?\s*[0-9][0-9,]*|-\s*\$[0-9][0-9,]*)/i;
  const tableSubsequentCell =
    /(?:^|\n|\|)\s*(?:revenue|income|sales|engineering\s+services|pm\s+fees|fee\s+revenue)(?:\s*\|\s*)+[\s\S]{0,400}?(?:\(\s*(?:AUD\s*)?\$?\s*[0-9][0-9,]*\s*\)|-\s*(?:AUD\s*)?\$?\s*[0-9][0-9,]*)/i;
  return sameCell.test(markdown) || tableSubsequentCell.test(markdown);
}

function normalizeAccountKey(id) {
  return String(id || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
}

/**
 * Heuristic: section heading or row mentions account id — commentary present.
 */
function markdownCoversAccount(markdown, accountId) {
  const key = normalizeAccountKey(accountId);
  if (!key) return false;
  const md = markdown.toLowerCase();
  if (md.includes(key)) return true;
  // Allow formatted account codes e.g. `4000-001`
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escaped).test(md);
}

function countSourceTags(section) {
  return countAllSourceTags(section);
}

/**
 * Split markdown into coarse sections by ## or ### headings for per-variance attribution checks.
 */
function extractSections(markdown) {
  const lines = markdown.split(/\r?\n/);
  const sections = [];
  let buf = [];
  let title = '__preamble__';

  function flush() {
    if (buf.length) {
      sections.push({ title, text: buf.join('\n') });
      buf = [];
    }
  }

  for (const line of lines) {
    const m = /^(#{2,3})\s+(.+)$/.exec(line);
    if (m) {
      flush();
      title = m[2].trim();
      buf.push(line);
    } else {
      buf.push(line);
    }
  }
  flush();
  return sections;
}

function sectionForAccount(sections, accountId) {
  const key = normalizeAccountKey(accountId);
  for (const s of sections) {
    if (s.text.toLowerCase().includes(key)) return s.text;
  }
  return null;
}

export default function preOutput(payload) {
  const errors = [];
  const warnings = [];

  if (!payload || typeof payload.markdown !== 'string') {
    return {
      ok: false,
      errors: ['preOutput: missing `markdown` string on payload.'],
      warnings,
    };
  }

  const markdown = payload.markdown;
  const variances = Array.isArray(payload.variances) ? payload.variances : [];

  // --- Sign convention: no negative revenue presentation in body text ---
  if (revenueLooksNegative(markdown)) {
    errors.push(
      'Sign convention: detected revenue/income line(s) presented with negative amounts. ' +
        'Convert GL credits to positive management presentation for revenue/income.'
    );
  }

  // --- Material variances must have commentary + attribution ---
  const sections = extractSections(markdown);
  const material = variances.filter(
    (v) => v && (v.material_for_commentary === true || v.material === true)
  );

  for (const v of material) {
    const aid = v.account_id || v.account_code || v.gl_account;
    if (!aid) {
      warnings.push(
        'Material variance record missing account_id — could not verify commentary coverage.'
      );
      continue;
    }
    if (!markdownCoversAccount(markdown, aid)) {
      errors.push(
        `Material variance not addressed in output (account ${aid}). ` +
          'Every material line must have commentary per RULES.md #5.'
      );
      continue;
    }
    const scoped = sectionForAccount(sections, aid) || markdown;
    if (countSourceTags(scoped) < 1) {
      errors.push(
        `Attribution: material variance for ${aid} lacks a [source:memory|data|calculation|investigation] tag in its section.`
      );
    }
  }

  if (material.length === 0 && variances.length > 0) {
    warnings.push(
      'No variances flagged `material_for_commentary`; threshold coverage not auto-verified. ' +
        'Ensure manual QA if material flags omitted.'
    );
  }

  // Global sanity: long narrative with zero tags anywhere
  if (markdown.length > 400 && countAllSourceTags(markdown) < 1) {
    errors.push(
      'Attribution: no [source:...] tags found in commentary. Every explanation must cite a source.'
    );
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}
