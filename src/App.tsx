import { useState } from "react";
import questionsData from "./data/topics.json";

type Topic = { title: string; questions: string[] };
type Dataset = { title: string; topics: Topic[] };

// Fresh copy so the imported module is never mutated.
const DATA: Dataset = JSON.parse(JSON.stringify(questionsData));

const TOTAL_QUESTIONS = DATA.topics.reduce((sum, t) => sum + t.questions.length, 0);

function buildExportHtml(mode: "word" | "table") {
  let serial = 1;
  const rows = DATA.topics
    .map(
      (topic) =>
        topic.questions
          .map(
            (question) => `
              <tr>
                <td>${serial++}</td>
                <td>${topic.title}</td>
                <td>${question}</td>
              </tr>
            `,
          )
          .join(""),
    )
    .join("");

  const title = mode === "word" ? "AWS DevOps Interview Questions (Word Export)" : "AWS DevOps Interview Questions (Table View)";

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 24px;
            color: #0f172a;
            background: #f8fafc;
          }
          h1 {
            font-size: 26px;
            margin-bottom: 16px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border: 1px solid #cbd5e1;
          }
          th, td {
            border: 1px solid #cbd5e1;
            padding: 10px 12px;
            text-align: left;
            vertical-align: top;
          }
          th {
            background: #e2e8f0;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          td:nth-child(1) {
            width: 8%;
            font-weight: 700;
            text-align: center;
          }
          td:nth-child(2) {
            width: 28%;
            font-weight: 700;
            color: #0f172a;
          }
          td:nth-child(3) {
            width: 64%;
          }
          .meta {
            margin-bottom: 16px;
            color: #475569;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="meta">${DATA.topics.length} topics · ${TOTAL_QUESTIONS} questions</div>
        <table>
          <thead>
            <tr>
              <th>Sr No.</th>
              <th>Topic</th>
              <th>Question</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
    </html>
  `;
}

/** Normalise for case-insensitive, accent-insensitive matching. */
function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const needle = normalize(query.trim());

  // Flatten (topicIndex, qIndex) pairs and apply the search filter.
  const matches: { topicIndex: number; qIndex: number }[] = [];
  DATA.topics.forEach((topic, topicIndex) => {
    topic.questions.forEach((question, qIndex) => {
      const hit =
        !needle ||
        normalize(question).includes(needle) ||
        normalize(topic.title).includes(needle);
      if (hit) {
        matches.push({ topicIndex, qIndex });
      }
    });
  });

  const searching = needle.length > 0;
  const activeTopic = DATA.topics[activeIndex];

  const selectTopic = (index: number) => {
    setActiveIndex(index);
    setMenuOpen(false);
    setQuery("");
  };

  const handleExportWord = () => {
    const html = buildExportHtml("word");
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "aws-devops-interview-questions.doc";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleTableView = () => {
    const popup = window.open("", "_blank", "noopener,noreferrer");
    if (!popup) return;

    popup.document.write(buildExportHtml("table"));
    popup.document.close();
  };

  return (
    <div className="app">
      <Header
        query={query}
        onQueryChange={setQuery}
        onOpenMenu={() => setMenuOpen(true)}
        onExportWord={handleExportWord}
      />

      <div className="layout">
        <Sidebar
          topics={DATA.topics}
          activeIndex={activeIndex}
          searchQuery={query}
          onSelect={selectTopic}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
        />

        <main className="content">
          {searching ? (
            <SearchResults matches={matches} query={query} onSelect={selectTopic} />
          ) : (
            <TopicSection index={activeIndex} topic={activeTopic} />
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

/* ------------------------------- Header -------------------------------- */

function Header({
  query,
  onQueryChange,
  onOpenMenu,
  onExportWord,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  onOpenMenu: () => void;
  onExportWord: () => void;
}) {
  return (
    <header className="header">
      <button
        type="button"
        className="icon-btn menu-toggle"
        aria-label="Open topics menu"
        onClick={onOpenMenu}
      >
        ☰
      </button>
      <div className="brand">
        <span className="brand-logo" aria-hidden="true">☁</span>
        <span className="brand-title">{DATA.title}</span>
      </div>
      <div className="search-box">
        <span aria-hidden="true">🔍</span>
        <input
          type="search"
          id="q"
          value={query}
          placeholder="Search any topic or question…"
          aria-label="Search questions"
          onChange={(e) => onQueryChange(e.target.value)}
        />
        {query && (
          <button
            type="button"
            className="icon-btn clear"
            aria-label="Clear search"
            onClick={() => onQueryChange("")}
          >
            ✕
          </button>
        )}
      </div>

      <div className="header-actions">
        <button type="button" className="export-btn primary" onClick={onExportWord}>
          Export
        </button>
      </div>
    </header>
  );
}

/* ------------------------------- Sidebar ------------------------------- */

function Sidebar({
  topics,
  activeIndex,
  searchQuery,
  onSelect,
  open,
  onClose,
}: {
  topics: Topic[];
  activeIndex: number;
  searchQuery: string;
  onSelect: (index: number) => void;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <nav className={`sidebar${open ? " open" : ""}`} aria-label="Topics">
      {open && (
        <button type="button" className="icon-btn close" aria-label="Close menu" onClick={onClose}>
          ✕
        </button>
      )}
      <h2 className="sidebar-title">Topics</h2>
      <ul className="topic-list">
        {topics.map((topic, i) => {
          const q = searchQuery.trim();
          const highlighted =
            !q ||
            topic.questions.some(
              (question) => normalize(question).includes(normalize(q)) || normalize(topic.title).includes(normalize(q)),
            );
          const className = [
            "topic-item",
            i === activeIndex ? "active" : "",
            highlighted ? "" : "muted",
          ]
            .filter(Boolean)
            .join(" ");
          return (
            <li key={topic.title}>
              <button type="button" className={className} onClick={() => onSelect(i)}>
                <span className="topic-count">{i + 1}</span>
                <span className="topic-name">{topic.title}</span>
                <span className="topic-qcount">{topic.questions.length}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ----------------------------- Topic section ---------------------------- */

function TopicSection({ index, topic }: { index: number; topic: Topic }) {
  return (
    <section className="topic-section" aria-labelledby={`topic-${index}`}>
      <header className="section-head">
        <span className="section-number">{index + 1}</span>
        <h1 id={`topic-${index}`}>{topic.title}</h1>
        <p className="section-meta">
          {topic.questions.length} question{topic.questions.length === 1 ? "" : "s"}
        </p>
      </header>

      <ol className="question-list">
        {topic.questions.map((question, i) => (
          <QuestionCard key={i} number={i + 1} text={question} />
        ))}
      </ol>
    </section>
  );
}

function QuestionCard({ number, text }: { number: number; text: string }) {
  return (
    <li className="question-card">
      <span className="q-number">{number}</span>
      <p className="q-text">{text}</p>
    </li>
  );
}

/* ----------------------------- Search results --------------------------- */

function SearchResults({
  matches,
  query,
  onSelect,
}: {
  matches: { topicIndex: number; qIndex: number }[];
  query: string;
  onSelect: (index: number) => void;
}) {
  return (
    <section className="topic-section search-results">
      <header className="section-head">
        <span className="section-number">⌕</span>
        <h1>
          {matches.length} result{matches.length === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
        </h1>
      </header>

      <ul className="question-list">
        {matches.slice(0, 100).map((m) => {
          const topic = DATA.topics[m.topicIndex];
          return (
            <li className="question-card search-hit" key={`${m.topicIndex}-${m.qIndex}`}>
              <span className="q-number">{m.qIndex + 1}</span>
              <p className="q-text">
                <button
                  type="button"
                  className="topic-chip"
                  onClick={() => onSelect(m.topicIndex)}
                >
                  {topic.title}
                </button>
                {topic.questions[m.qIndex]}
              </p>
            </li>
          );
        })}
      </ul>
      {matches.length === 0 ? (
        <p className="empty-state">No questions match your search.</p>
      ) : matches.length > 100 ? (
        <p className="empty-state">
          Showing first 100 of {matches.length} results — refine your search.
        </p>
      ) : null}
    </section>
  );
}

/* --------------------------------- Footer ------------------------------- */

function Footer() {
  const socialLinks = [
    { label: "LinkedIn", href: "https://linkedin.com/in/divyanshutiwari1300" },
    { label: "GitHub", href: "https://github.com/cloudeasydevops" },
    { label: "Website", href: "https://cloudeasy.site/" },
  ];

  return (
    <footer className="footer">
      <p>
        <strong>{DATA.topics.length}</strong> topics · <strong>{TOTAL_QUESTIONS}</strong> questions
      </p>
      <div className="social-links" aria-label="Social media links">
        {socialLinks.map((link) => (
          <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="social-link">
            {link.label}
          </a>
        ))}
      </div>
      <p className="credit-line">By Divyanshu Tiwari</p>
      <p className="credit-role">DevOps Engineer</p>
    </footer>
  );
}