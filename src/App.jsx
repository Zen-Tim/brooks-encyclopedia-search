import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import RAW from "./data.js";

const DATA = RAW.map((d, i) => ({
  id: i,
  part: d[0],
  section: d[1],
  abbrev: d[2],
  cats: d[3],
  tags: d[4],
  dir: d[5] || null,
  _search: (d[1] + " " + d[2] + " " + d[4].join(" ")).toLowerCase()
}));

const ALL_CATS = [
  { key: "Pattern", color: "#6c9bde", icon: "\u25B3" },
  { key: "Trend", color: "#56c49a", icon: "\u2197" },
  { key: "Gap", color: "#d4a05a", icon: "\u2195" },
  { key: "Breakout", color: "#e07c5a", icon: "\u26A1" },
  { key: "Reversal", color: "#c77dba", icon: "\u21BA" },
  { key: "Failed", color: "#e05a6f", icon: "\u2717" },
  { key: "Trading Range", color: "#7a8fa6", icon: "\u2194" },
  { key: "Entry", color: "#5ac4c4", icon: "\u25B6" },
  { key: "Trap", color: "#d45a5a", icon: "\u26D4" },
  { key: "Concept", color: "#8a8a9e", icon: "\u2139" },
  { key: "Time", color: "#9a9a6e", icon: "\u23F0" },
  { key: "Management", color: "#6a9a7e", icon: "\u2699" },
  { key: "Moving Average", color: "#7e8ad4", icon: "\u223F" },
  { key: "Open", color: "#d4c45a", icon: "\u25CB" },
  { key: "Event", color: "#b07050", icon: "\u2605" },
];

const PART_COLORS = [
  "", "#4a7ab5", "#5a8a5a", "#9a7a4a", "#8a5a7a", "#5a7a7a",
  "#6a6a9a", "#7a8a5a", "#9a6a6a", "#5a6a8a", "#7a7a5a",
  "#6a8a7a", "#8a6a8a", "#5a8a8a", "#9a7a6a", "#6a6a7a", "#7a6a5a"
];

function scoreEntry(entry, terms) {
  if (!terms.length) return 1;
  let score = 0;
  const sLow = entry.section.toLowerCase();
  const aLow = entry.abbrev.toLowerCase();
  
  for (const t of terms) {
    if (sLow === t) score += 100;
    else if (aLow === t) score += 90;
    else if (sLow.startsWith(t)) score += 50;
    else if (aLow.startsWith(t)) score += 45;
    else if (entry._search.includes(t)) score += 10;
    else return 0;
  }
  return score;
}

function highlightText(text, terms) {
  if (!terms.length) return text;
  const parts = [];
  let remaining = text;
  let key = 0;
  
  while (remaining.length > 0) {
    let matchLen = 0;
    let matchIdx = remaining.length;
    
    for (const t of terms) {
      const idx = remaining.toLowerCase().indexOf(t);
      if (idx !== -1 && idx < matchIdx) {
        matchIdx = idx;
        matchLen = t.length;
      }
    }
    
    if (matchLen === 0) {
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }
    
    if (matchIdx > 0) {
      parts.push(<span key={key++}>{remaining.slice(0, matchIdx)}</span>);
    }
    parts.push(
      <span key={key++} style={{
        color: "#f0c050",
        fontWeight: 700,
        textShadow: "0 0 8px rgba(240,192,80,0.3)"
      }}>
        {remaining.slice(matchIdx, matchIdx + matchLen)}
      </span>
    );
    remaining = remaining.slice(matchIdx + matchLen);
  }
  return parts;
}

export default function BrooksSearch() {
  const [query, setQuery] = useState("");
  const [activeCats, setActiveCats] = useState(new Set());
  const [activePart, setActivePart] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const toggleCat = useCallback((cat) => {
    setActiveCats(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
    setShowAll(false);
  }, []);

  const terms = useMemo(() => {
    return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  }, [query]);

  const results = useMemo(() => {
    let filtered = DATA;
    
    if (activeCats.size > 0) {
      filtered = filtered.filter(e => e.cats.some(c => activeCats.has(c)));
    }
    if (activePart !== null) {
      filtered = filtered.filter(e => e.part === activePart);
    }
    
    if (terms.length === 0) {
      return filtered.map(e => ({ ...e, score: 1 }));
    }
    
    const scored = [];
    for (const e of filtered) {
      const s = scoreEntry(e, terms);
      if (s > 0) scored.push({ ...e, score: s });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored;
  }, [terms, activeCats, activePart]);

  const displayResults = showAll ? results : results.slice(0, 50);
  const hasMore = results.length > 50 && !showAll;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #080b10 0%, #0d1117 50%, #0a0e14 100%)",
      color: "#c9d1d9",
      fontFamily: "'Sora', 'Segoe UI', system-ui, sans-serif",
      padding: "0",
      position: "relative",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      
      <div style={{
        maxWidth: 960,
        margin: "0 auto",
        padding: "32px 20px 60px",
      }}>
        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <h1 style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "clamp(18px, 3.5vw, 26px)",
            fontWeight: 700,
            color: "#e6edf3",
            margin: 0,
            letterSpacing: "-0.5px",
            lineHeight: 1.3,
          }}>
            Brooks Encyclopedia
            <span style={{ color: "#4a6a8a" }}> // </span>
            <span style={{ color: "#6c9bde" }}>Chart Patterns</span>
          </h1>
          <p style={{
            fontSize: 13,
            color: "#546270",
            marginTop: 6,
            fontWeight: 400,
            letterSpacing: "0.5px",
          }}>
            {DATA.length} sections across 16 parts &mdash; search by name, abbreviation, or describe what you see
          </p>
        </div>

        {/* Search */}
        <div style={{
          position: "relative",
          marginBottom: 20,
        }}>
          <div style={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#4a5568",
            fontSize: 18,
            pointerEvents: "none",
          }}>&#9906;</div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setShowAll(false); }}
            placeholder="Search patterns... try 'wedge bottom', 'failed breakout', 'gap down reversal'"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px 16px 14px 44px",
              fontSize: 15,
              fontFamily: "'Sora', sans-serif",
              background: "#111820",
              border: "1px solid #1e2a38",
              borderRadius: 10,
              color: "#e6edf3",
              outline: "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
            onFocus={e => {
              e.target.style.borderColor = "#2a4a6a";
              e.target.style.boxShadow = "0 0 0 3px rgba(108,155,222,0.1)";
            }}
            onBlur={e => {
              e.target.style.borderColor = "#1e2a38";
              e.target.style.boxShadow = "none";
            }}
          />
          {query && (
            <button
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#546270",
                cursor: "pointer",
                fontSize: 18,
                padding: 4,
              }}
            >{"\u2715"}</button>
          )}
        </div>

        {/* Part filter */}
        <div style={{
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
          marginBottom: 12,
          alignItems: "center",
        }}>
          <span style={{ fontSize: 11, color: "#3a4a5a", marginRight: 4, fontWeight: 500 }}>PART</span>
          {Array.from({length: 16}, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => { setActivePart(activePart === p ? null : p); setShowAll(false); }}
              style={{
                padding: "3px 8px",
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: activePart === p ? 700 : 500,
                background: activePart === p ? PART_COLORS[p] : "transparent",
                color: activePart === p ? "#fff" : "#4a5a6a",
                border: activePart === p ? "none" : "1px solid #1a2430",
                borderRadius: 4,
                cursor: "pointer",
                transition: "all 0.15s",
                minWidth: 28,
              }}
            >{p}</button>
          ))}
        </div>

        {/* Category filters */}
        <div style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          marginBottom: 24,
          alignItems: "center",
        }}>
          <span style={{ fontSize: 11, color: "#3a4a5a", marginRight: 2, fontWeight: 500 }}>FILTER</span>
          {ALL_CATS.map(cat => {
            const active = activeCats.has(cat.key);
            const count = DATA.filter(e => e.cats.includes(cat.key)).length;
            return (
              <button
                key={cat.key}
                onClick={() => toggleCat(cat.key)}
                style={{
                  padding: "4px 10px",
                  fontSize: 11,
                  fontWeight: active ? 600 : 400,
                  background: active ? cat.color + "22" : "transparent",
                  color: active ? cat.color : "#4a5a6a",
                  border: `1px solid ${active ? cat.color + "44" : "#1a2430"}`,
                  borderRadius: 20,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span style={{ fontSize: 10 }}>{cat.icon}</span>
                {cat.key}
                <span style={{ opacity: 0.5, fontSize: 10 }}>({count})</span>
              </button>
            );
          })}
          {(activeCats.size > 0 || activePart !== null) && (
            <button
              onClick={() => { setActiveCats(new Set()); setActivePart(null); }}
              style={{
                padding: "4px 10px",
                fontSize: 11,
                background: "#1a1a2a",
                color: "#e05a6f",
                border: "1px solid #2a1a2a",
                borderRadius: 20,
                cursor: "pointer",
              }}
            >Clear all</button>
          )}
        </div>

        {/* Results count */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          paddingBottom: 8,
          borderBottom: "1px solid #151c24",
        }}>
          <span style={{ fontSize: 12, color: "#3a4a5a", fontFamily: "'JetBrains Mono', monospace" }}>
            {results.length === DATA.length ? `${DATA.length} sections` : `${results.length} of ${DATA.length} sections`}
          </span>
          {terms.length > 0 && results.length > 0 && (
            <span style={{ fontSize: 11, color: "#4a5a3a" }}>
              sorted by relevance
            </span>
          )}
        </div>

        {/* Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {displayResults.map((entry, idx) => (
            <div
              key={entry.id}
              style={{
                display: "grid",
                gridTemplateColumns: "44px 1fr auto",
                gap: 12,
                alignItems: "center",
                padding: "10px 12px",
                borderRadius: 6,
                background: idx % 2 === 0 ? "transparent" : "#0c1018",
                transition: "background 0.1s",
                cursor: "default",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#111820"}
              onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "transparent" : "#0c1018"}
            >
              {/* Part badge */}
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 6,
                background: PART_COLORS[entry.part] + "20",
                border: `1px solid ${PART_COLORS[entry.part]}40`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <span style={{
                  fontSize: 8,
                  color: PART_COLORS[entry.part],
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                  opacity: 0.7,
                  lineHeight: 1,
                }}>PT</span>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 14,
                  fontWeight: 700,
                  color: PART_COLORS[entry.part],
                  lineHeight: 1,
                }}>{entry.part}</span>
              </div>

              {/* Section name + cats */}
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#d0d8e0",
                  lineHeight: 1.3,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {highlightText(entry.section, terms)}
                </div>
                <div style={{
                  display: "flex",
                  gap: 4,
                  marginTop: 3,
                  flexWrap: "wrap",
                }}>
                  {entry.cats.map(c => {
                    const catDef = ALL_CATS.find(x => x.key === c);
                    return (
                      <span key={c} style={{
                        fontSize: 9,
                        padding: "1px 6px",
                        borderRadius: 3,
                        background: (catDef?.color || "#555") + "18",
                        color: (catDef?.color || "#888"),
                        fontWeight: 500,
                        letterSpacing: "0.3px",
                      }}>{c}</span>
                    );
                  })}
                  {entry.dir && (
                    <span style={{
                      fontSize: 9,
                      padding: "1px 6px",
                      borderRadius: 3,
                      background: entry.dir === "bull" ? "#2a4a2a" : entry.dir === "bear" ? "#4a2a2a" : "#3a3a2a",
                      color: entry.dir === "bull" ? "#56c49a" : entry.dir === "bear" ? "#e05a6f" : "#d4a05a",
                      fontWeight: 500,
                    }}>{entry.dir === "bull" ? "\u25B2 Bull" : entry.dir === "bear" ? "\u25BC Bear" : "\u25C6 Both"}</span>
                  )}
                </div>
              </div>

              {/* Abbreviation */}
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: "#4a6a8a",
                fontWeight: 500,
                textAlign: "right",
                whiteSpace: "nowrap",
                letterSpacing: "0.3px",
              }}>
                {highlightText(entry.abbrev, terms)}
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <button
            onClick={() => setShowAll(true)}
            style={{
              display: "block",
              margin: "16px auto",
              padding: "8px 24px",
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              background: "#111820",
              color: "#6c9bde",
              border: "1px solid #1e2a38",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >Show all {results.length} results</button>
        )}

        {results.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "48px 20px",
            color: "#3a4a5a",
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{"\u2205"}</div>
            <div style={{ fontSize: 14 }}>No sections match your search</div>
            <div style={{ fontSize: 12, marginTop: 6, color: "#2a3a4a" }}>
              Try different keywords or clear your filters
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: 40,
          paddingTop: 16,
          borderTop: "1px solid #151c24",
          textAlign: "center",
          fontSize: 11,
          color: "#2a3a4a",
          lineHeight: 1.6,
        }}>
          <div>Brooks Encyclopedia of Chart Patterns Index &mdash; v1.0 &mdash; Source: October 2025 Edition</div>
          <div>Built for <a href="https://zentradingtech.com" target="_blank" rel="noopener" style={{ color: "#3a5a7a", textDecoration: "none" }}>Zen Trading Tech</a> &mdash; Data from <a href="https://brookstradingcourse.com" target="_blank" rel="noopener" style={{ color: "#3a5a7a", textDecoration: "none" }}>Brooks Trading Course</a></div>
        </div>
      </div>
    </div>
  );
}
