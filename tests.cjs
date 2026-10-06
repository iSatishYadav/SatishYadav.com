const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const directory = __dirname;
const html = fs.readFileSync(path.join(directory, 'index.html'), 'utf8');
const articles = JSON.parse(fs.readFileSync(path.join(directory, 'articles.json'), 'utf8'));

test('navigation targets exist and IDs are unique', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const [, anchor] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(anchor), anchor);
});

test('all referenced local assets exist', () => {
  for (const [, asset] of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    if (/^https?:/.test(asset)) continue;
    assert.ok(fs.existsSync(path.join(directory, asset)), asset);
  }
});

test('writing inventory contains 36 unique valid public articles', () => {
  assert.equal(articles.length, 36);
  assert.equal(new Set(articles.map(article => article.url)).size, 36);
  for (const article of articles) {
    assert.ok(article.title.length > 0);
    assert.ok(!Number.isNaN(Date.parse(article.date)));
    assert.ok(['dotnet', 'engineering', 'tools'].includes(article.category));
    assert.ok(['read.satishyadav.com', 'blog.satishyadav.com'].includes(new URL(article.url).hostname));
  }
});

test('source exports are gitignored and not linked from the portfolio', () => {
  const ignored = fs.readFileSync(path.join(directory, '.gitignore'), 'utf8').split(/\r?\n/);
  assert.ok(ignored.includes('/source/'));
  assert.ok(!html.includes('Credential ID'));
  assert.ok(!/\b(?:href|src)="(?:\.\/)?sources?\//.test(html));
});

test('full-size project cards include all five case studies', () => {
  const cards = [...html.matchAll(/<button class="project-card ([^"]+)" data-project="([^"]+)"/g)];
  assert.deepEqual(cards.map(card => card[2]), ['bitss', 'api', 'sms', 'ideas', 'measurement']);
  assert.ok(cards.every(card => !card[1].includes('compact-project')));
  const app = fs.readFileSync(path.join(directory, 'app.js'), 'utf8');
  for (const card of cards) assert.match(app, new RegExp(`${card[2]}: \\{`));
});

test('branding, recognition counts, and every career stage are present', () => {
  assert.equal((html.match(/>satish yadav<span class="logo-dot">/g) || []).length, 2);
  assert.match(html, /proof-number">6<\/span><p>honors &amp; awards|proof-number">6<\/span><p>honors & awards/);
  assert.match(html, /proof-number">23<\/span><p>certifications earned/);
  for (const milestone of ['Senior Manager', 'Manager', 'Assistant Manager', 'Executive', 'Management Trainee']) {
    assert.ok(html.includes(`<h3>${milestone}</h3>`), milestone);
  }
  for (const date of ['APR 2025', 'APR 2021', 'APR 2017', 'APR 2015', 'JUN 2014']) assert.ok(html.includes(date), date);
  assert.ok(html.includes('Beyond the job titles'));
});

test('social sharing metadata uses production URLs and a real JPEG image', () => {
  for (const property of ['og:type', 'og:title', 'og:description', 'og:url', 'og:image', 'og:image:width', 'og:image:height', 'og:image:alt']) {
    assert.ok(html.includes(`property="${property}"`), property);
  }
  assert.ok(html.includes('name="twitter:card" content="summary_large_image"'));
  assert.ok(html.includes('name="twitter:image:alt"'));
  assert.ok(html.includes('content="https://satishyadav.com/og-image.jpg"'));
  const image = fs.readFileSync(path.join(directory, 'og-image.jpg'));
  assert.equal(image.readUInt16BE(0), 0xffd8);
});

test('external new-tab links have safe relationship attributes', () => {
  for (const [tag] of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    assert.ok(tag.includes('noopener noreferrer'));
  }
});
