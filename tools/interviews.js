#!/usr/bin/env node

const fs = require("fs");
const http = require("http");
const path = require("path");
const url = require("url");

const root = process.cwd();
const ignoredDirs = new Set([".git", "node_modules"]);

function usage() {
  console.log(`Usage:
  node tools/interviews.js build [file-or-dir]
  node tools/interviews.js watch [file-or-dir]
  node tools/interviews.js serve [port]

Examples:
  node tools/interviews.js build
  node tools/interviews.js build fun/meyerowitz-interview.md
  node tools/interviews.js watch fun
  node tools/interviews.js serve 8080`);
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z0-9#]+;/gi, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCase(value) {
  const special = new Map([
    ["MACDONALD", "MacDonald"],
    ["MEYEROWITZ", "Meyerowitz"],
  ]);

  if (special.has(value)) {
    return special.get(value);
  }

  if (value.length <= 3) {
    return value;
  }

  return value.toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function renderInline(markdown) {
  const code = [];
  let html = escapeHtml(markdown).replace(/`([^`]+)`/g, (_, value) => {
    const token = `@@CODE${code.length}@@`;
    code.push(`<code>${value}</code>`);
    return token;
  });

  html = html
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/_([^_]+)_/g, "<em>$1</em>");

  return code.reduce((text, snippet, index) => {
    return text.replace(`@@CODE${index}@@`, snippet);
  }, html);
}

function readFrontMatter(markdown) {
  if (!markdown.startsWith("---\n")) {
    return [{}, markdown];
  }

  const end = markdown.indexOf("\n---\n", 4);
  if (end === -1) {
    return [{}, markdown];
  }

  const metadata = {};
  const raw = markdown.slice(4, end).trim();
  for (const line of raw.split("\n")) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match) {
      metadata[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }

  return [metadata, markdown.slice(end + 5).trimStart()];
}

function turnFromParagraph(block) {
  const match = block.match(/^(\*\*)?([A-Z][A-Z0-9 .'-]{0,32}|Q|A|GW)(:)(\*\*)?\s+([\s\S]+)$/);
  if (!match) {
    return null;
  }

  const speaker = match[2].trim();
  const text = match[5].trim();

  return {
    paragraphs: [text],
    speaker: titleCase(speaker),
  };
}

function renderParagraph(paragraph, id) {
  return `<p id="${id}" class="anchored-paragraph">${renderInline(paragraph).replace(/\n+/g, "<br>")} <span class="paragraph-actions" aria-label="Paragraph actions"><button type="button" class="paragraph-action copy-paragraph" data-copy-target="${id}" title="Copy paragraph" aria-label="Copy paragraph">📋</button><a class="paragraph-action" href="#${id}" title="Link to paragraph" aria-label="Link to paragraph">🔗</a></span></p>`;
}

function renderTurn(turn, nextParagraphId) {
  const paragraphs = turn.paragraphs
    .map((paragraph) => renderParagraph(paragraph, nextParagraphId()))
    .join("\n    ");

  return `<div class="section">
  <div class="left">${escapeHtml(turn.speaker)}:</div>
  <div class="right">
    ${paragraphs}
  </div>
</div>`;
}

function renderMarkdown(markdown) {
  const blocks = markdown.trim().split(/\n{2,}/);
  const html = [];
  let activeTurn = null;
  let paragraphIndex = 1;

  function nextParagraphId() {
    const id = `p-${paragraphIndex}`;
    paragraphIndex += 1;
    return id;
  }

  function flushTurn() {
    if (activeTurn) {
      html.push(renderTurn(activeTurn, nextParagraphId));
      activeTurn = null;
    }
  }

  for (const block of blocks) {
    const trimmed = block.trim();
    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);

    if (heading) {
      flushTurn();
      const level = heading[1].length;
      const text = renderInline(heading[2].trim());
      const id = slugify(text);
      html.push(`<h${level} id="${id}">${text}</h${level}>`);
      continue;
    }

    const turn = turnFromParagraph(trimmed);
    if (turn) {
      flushTurn();
      activeTurn = turn;
      continue;
    }

    if (activeTurn) {
      activeTurn.paragraphs.push(trimmed);
      continue;
    }

    html.push(`<div class="section prose">
  <div class="left"></div>
  <div class="right">
    ${renderParagraph(trimmed, nextParagraphId())}
  </div>
</div>`);
  }

  flushTurn();

  return html.join("\n\n");
}

function titleFrom(markdown, file, metadata) {
  if (metadata.title) {
    return metadata.title;
  }

  const heading = markdown.match(/^#\s+(.+)$/m);
  if (heading) {
    return heading[1].replace(/[*_`]/g, "");
  }

  return path.basename(file, ".md")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function renderDocument(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; }

    body {
      margin: 1em auto;
      color: #161412;
      font-family: 'Gill Sans MT', 'Gill Sans', sans-serif;
      font-weight: lighter;
    }

    .container {
      width: 100%;
      max-width: 1024px;
      margin: 0 auto;
      padding: 4em 0 6em;
    }

    h1 {
      margin: 0 0.4em 1.5em;
      font-size: clamp(2.1rem, 7vw, 4.8rem);
      font-weight: lighter;
      line-height: 1;
    }

    h2, h3, h4, h5, h6 {
      margin: 2.5em 0.4em 1em;
      letter-spacing: 0.1em;
      font-weight: lighter;
      text-transform: uppercase;
    }

    .section {
      display: flex;
      flex-direction: column;
      line-height: 1.8em;
      font-size: 1.2em;
      margin: 0.4em;
    }

    .left {
      color: #504a44;
      margin: 0;
      text-transform: uppercase;
    }

    .right {
      text-align: left;
    }

    .right p {
      position: relative;
      margin: 0 0 1em;
    }

    .right a {
      color: inherit;
    }

    .paragraph-actions {
      display: inline-flex;
      gap: 0.25em;
      margin-left: 0.35em;
      opacity: 0;
      transform: translateY(0.08em);
      transition: opacity 140ms ease;
    }

    .anchored-paragraph:hover .paragraph-actions,
    .anchored-paragraph:focus-within .paragraph-actions {
      opacity: 1;
    }

    .paragraph-action {
      border: 0;
      border-radius: 999px;
      background: #f0ece4;
      color: #161412;
      cursor: pointer;
      font: inherit;
      line-height: 1;
      padding: 0.18em 0.3em;
      text-decoration: none;
    }

    .paragraph-action:hover,
    .paragraph-action:focus-visible {
      background: #ded6ca;
      outline: none;
    }

    @media (min-width: 1024px) {
      h1 {
        margin-left: 8em;
      }

      h2, h3, h4, h5, h6 {
        margin-left: 7.12em;
      }

      .section {
        flex-direction: row;
      }

      .left {
        flex-basis: 7.5em;
        flex-shrink: 0;
        margin: 0 1em 0 0;
        text-align: right;
      }

      .right {
        max-width: 680px;
      }
    }
  </style>
</head>
<body>
  <main class="container">
${body.split("\n").map((line) => `      ${line}`).join("\n")}
  </main>
  <script>
    document.addEventListener("click", async (event) => {
      const button = event.target.closest(".copy-paragraph");
      if (!button) return;

      const paragraph = document.getElementById(button.dataset.copyTarget);
      if (!paragraph) return;

      const copy = paragraph.cloneNode(true);
      copy.querySelector(".paragraph-actions")?.remove();
      const text = copy.textContent.trim();

      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
    });
  </script>
</body>
</html>
`;
}

function pageInfo(file) {
  const raw = fs.readFileSync(file, "utf8");
  const [metadata, markdown] = readFrontMatter(raw.replace(/\r\n/g, "\n"));

  return {
    markdown,
    metadata,
    title: titleFrom(markdown, file, metadata),
  };
}

function renderPage(file) {
  const info = pageInfo(file);
  return renderDocument(info.title, renderMarkdown(info.markdown));
}

function renderIndexPage(directory, files) {
  const links = files
    .sort((a, b) => pageInfo(a).title.localeCompare(pageInfo(b).title))
    .map((file) => {
      const info = pageInfo(file);
      const href = path.relative(directory, file).replace(/\.md$/i, ".html");

      return `<div class="section">
  <div class="left"></div>
  <div class="right">
    <p><a href="${escapeAttr(href)}">${escapeHtml(info.title)}</a></p>
  </div>
</div>`;
    })
    .join("\n\n");

  return renderDocument("Interviews", `<h1>Interviews</h1>\n\n${links}`);
}

function isMarkdown(file) {
  return file.toLowerCase().endsWith(".md");
}

function markdownFiles(target) {
  const absolute = path.resolve(root, target || ".");
  if (!fs.existsSync(absolute)) {
    throw new Error(`No such file or directory: ${target}`);
  }

  const stat = fs.statSync(absolute);
  if (stat.isFile()) {
    return isMarkdown(absolute) ? [absolute] : [];
  }

  const files = [];
  for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) {
      continue;
    }

    const child = path.join(absolute, entry.name);
    if (entry.isDirectory()) {
      files.push(...markdownFiles(child));
    } else if (entry.isFile() && isMarkdown(child)) {
      files.push(child);
    }
  }

  return files;
}

function build(target) {
  const files = markdownFiles(target);
  const absoluteTarget = path.resolve(root, target || ".");
  const shouldWriteIndex = Boolean(target)
    && fs.existsSync(absoluteTarget)
    && fs.statSync(absoluteTarget).isDirectory();

  for (const file of files) {
    const output = file.replace(/\.md$/i, ".html");
    fs.writeFileSync(output, renderPage(file));
    console.log(`${path.relative(root, file)} -> ${path.relative(root, output)}`);
  }

  if (shouldWriteIndex && files.length) {
    const output = path.join(absoluteTarget, "index.html");
    fs.writeFileSync(output, renderIndexPage(absoluteTarget, files));
    console.log(`${path.relative(root, output)}`);
  }

  if (!files.length) {
    console.log("No Markdown files found.");
  }
}

function contentType(file) {
  const extension = path.extname(file).toLowerCase();
  return {
    ".css": "text/css; charset=utf-8",
    ".gif": "image/gif",
    ".html": "text/html; charset=utf-8",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".txt": "text/plain; charset=utf-8",
  }[extension] || "application/octet-stream";
}

function safePath(requestPath) {
  const decoded = decodeURIComponent(requestPath);
  const resolved = path.resolve(root, `.${decoded}`);
  return resolved.startsWith(root) ? resolved : null;
}

function serve(port) {
  const server = http.createServer((request, response) => {
    const parsed = url.parse(request.url);
    const requestPath = parsed.pathname === "/" ? "/index.html" : parsed.pathname;
    const file = safePath(requestPath);

    if (!file) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    const markdown = file.replace(/\.html$/i, ".md");
    if (requestPath.endsWith(".html") && fs.existsSync(markdown)) {
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      response.end(renderPage(markdown));
      return;
    }

    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      response.writeHead(200, { "Content-Type": contentType(file) });
      fs.createReadStream(file).pipe(response);
      return;
    }

    response.writeHead(404);
    response.end("Not found");
  });

  server.listen(port, () => {
    console.log(`Serving ${root} at http://localhost:${port}`);
    console.log("Requests for .html render sibling .md files first.");
  });
}

function watch(target) {
  build(target);
  console.log("Watching for Markdown changes...");

  fs.watch(path.resolve(root, target || "."), { recursive: true }, (_, file) => {
    if (!file || !isMarkdown(file)) {
      return;
    }

    try {
      build(path.resolve(root, target || ".", file));
    } catch (error) {
      console.error(error.message);
    }
  });
}

const [command, arg] = process.argv.slice(2);

try {
  if (command === "build") {
    build(arg);
  } else if (command === "watch") {
    watch(arg);
  } else if (command === "serve") {
    serve(Number(arg) || 8080);
  } else {
    usage();
    process.exit(command ? 1 : 0);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
