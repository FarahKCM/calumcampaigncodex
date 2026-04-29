/* Shared components for the Campaign Codex.
 * Mirrors binder-parts.jsx style.
 */
const { useState: cuS, useEffect: cuE, useRef: cuR } = React;

// ── Heraldic icon for the three codex kinds ──
function CodexHeraldic({ kind, size = 40 }) {
  const inner = (window.CODEX_HERALDIC && window.CODEX_HERALDIC[kind]) || window.CODEX_HERALDIC.Character;
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} dangerouslySetInnerHTML={{ __html: inner }} />
  );
}

// ── Square portrait (for Characters) — click to expand, button to upload ──
function CodexPortrait({ entry, onUpload, onClear }) {
  const inputRef = cuR(null);
  const [expanded, setExpanded] = cuS(false);
  function onFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => onUpload(ev.target.result);
    r.readAsDataURL(f);
    e.target.value = '';
  }
  cuE(() => {
    if (!expanded) return;
    function onKey(e) { if (e.key === 'Escape') setExpanded(false); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded]);
  const has = !!entry.portrait;
  return (
    <>
      <div
        className="page-portrait"
        onClick={() => has ? setExpanded(true) : (inputRef.current && inputRef.current.click())}
        title={has ? 'Click to expand' : 'Click to upload'}
      >
        {has ? (
          <>
            <img src={entry.portrait} alt={entry.name} />
            <button
              className="portrait-expand"
              onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
              title="Show to players"
              aria-label="Expand portrait"
            >⛶</button>
            <button
              className="portrait-replace"
              onClick={(e) => { e.stopPropagation(); inputRef.current && inputRef.current.click(); }}
              title="Replace portrait"
              aria-label="Replace portrait"
            >↻</button>
            <button
              className="portrait-clear"
              onClick={(e) => { e.stopPropagation(); if (confirm('Remove the portrait?')) onClear(); }}
              title="Remove portrait"
            >×</button>
          </>
        ) : (
          <>
            <CodexHeraldic kind={entry.kind} size={56} />
            <div className="portrait-upload-hint">Upload</div>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFile} />
      </div>
      {expanded && has && (
        <div className="portrait-lightbox" onClick={() => setExpanded(false)}>
          <button
            className="lightbox-close"
            onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
            aria-label="Close"
            title="Close (Esc)"
          >×</button>
          <div className="lightbox-stage" onClick={e => e.stopPropagation()}>
            <img src={entry.portrait} alt={entry.name} />
            <div className="lightbox-caption">{entry.name}</div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Wide image banner (for Factions / Locations) ──
function CodexBanner({ entry, height = 200, onUpload, onClear, hint = 'Upload image' }) {
  const inputRef = cuR(null);
  function onFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => onUpload(ev.target.result);
    r.readAsDataURL(f);
    e.target.value = '';
  }
  const has = !!entry.image;
  return (
    <div className={`codex-banner ${has ? 'has-img' : ''}`} style={{ height }} onClick={() => inputRef.current && inputRef.current.click()}>
      {has ? (
        <>
          <img src={entry.image} alt={entry.name} />
          <button
            className="banner-clear"
            onClick={(e) => { e.stopPropagation(); if (confirm('Remove the image?')) onClear(); }}
            title="Remove image"
          >×</button>
        </>
      ) : (
        <div className="banner-empty">
          <CodexHeraldic kind={entry.kind} size={56} />
          <div className="banner-hint">{hint}</div>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFile} />
    </div>
  );
}

// ── Linked-entry list (resolves names to entries; click to jump) ──
// `kindFilter`: 'Character' | 'Faction' | 'Location' | null (any)
function LinkedEntryList({ items, allEntries, kindFilter, onJump, onChange, addLabel = '+ Add link', editing }) {
  const [draftName, setDraftName] = cuS('');
  const [draftNote, setDraftNote] = cuS('');

  function add() {
    const n = draftName.trim();
    if (!n) return;
    onChange([...(items || []), { name: n, note: draftNote.trim() }]);
    setDraftName(''); setDraftNote('');
  }
  function remove(i) {
    const next = [...(items || [])];
    next.splice(i, 1);
    onChange(next);
  }
  function updateNote(i, v) {
    const next = [...(items || [])];
    next[i] = { ...next[i], note: v };
    onChange(next);
  }

  // Build datalist suggestions from existing entries of the right kind.
  const suggestions = (allEntries || []).filter(e => !kindFilter || e.kind === kindFilter);
  const dlId = `dl-${kindFilter || 'any'}-${Math.random().toString(36).slice(2, 6)}`;

  return (
    <div className="linked-list">
      {(items || []).length === 0 && !editing && (
        <div className="linked-empty">— none —</div>
      )}
      <div className="linked-chips">
        {(items || []).map((it, i) => {
          const target = (allEntries || []).find(e =>
            e.name.toLowerCase() === it.name.toLowerCase() &&
            (!kindFilter || e.kind === kindFilter)
          );
          const exists = !!target;
          return (
            <div key={i} className={`linked-chip ${exists ? 'exists' : 'missing'}`}>
              {exists ? (
                <button className="linked-chip-name" onClick={() => onJump(target)} title={`Open ${target.name}`}>
                  {it.name} <span className="link-arrow">↗</span>
                </button>
              ) : (
                <span className="linked-chip-name dim" title="Not yet in the codex">{it.name}</span>
              )}
              {editing ? (
                <input
                  className="linked-chip-note-input"
                  value={it.note || ''}
                  placeholder="note…"
                  onChange={e => updateNote(i, e.target.value)}
                />
              ) : (
                it.note && <span className="linked-chip-note">— {it.note}</span>
              )}
              {editing && (
                <button className="linked-chip-x" onClick={() => remove(i)} title="Remove">×</button>
              )}
            </div>
          );
        })}
      </div>
      {editing && (
        <div className="linked-add">
          <input
            list={dlId}
            placeholder={kindFilter ? `${kindFilter} name…` : 'Name…'}
            value={draftName}
            onChange={e => setDraftName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') add(); }}
          />
          <datalist id={dlId}>
            {suggestions.map(s => <option key={s.id} value={s.name} />)}
          </datalist>
          <input
            placeholder="note (optional)"
            value={draftNote}
            onChange={e => setDraftNote(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') add(); }}
          />
          <button onClick={add}>{addLabel}</button>
        </div>
      )}
    </div>
  );
}

// ── Editable feature-style boxes (for Points of Interest, Encounter Log) ──
function FeatureBoxes({ items, onChange, editing, addLabel = '+ Add', namePlaceholder = 'Name', textPlaceholder = 'Description' }) {
  function update(i, patch) {
    const next = [...(items || [])];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }
  function remove(i) {
    onChange((items || []).filter((_, j) => j !== i));
  }
  function add() {
    onChange([...(items || []), { name: '', text: '' }]);
  }
  return (
    <div className="features">
      {editing ? (
        <>
          {(items || []).map((it, i) => (
            <div key={i} className="feature feature-edit">
              <input className="edit-inline edit-feature-name" value={it.name} onChange={e => update(i, { name: e.target.value })} placeholder={namePlaceholder} />
              <textarea className="edit-field" value={it.text} onChange={e => update(i, { text: e.target.value })} placeholder={textPlaceholder} />
              <button className="edit-remove-btn" onClick={() => remove(i)}>Remove</button>
            </div>
          ))}
          <button className="edit-add-btn" onClick={add}>{addLabel}</button>
        </>
      ) : (
        (items || []).map((it, i) => (
          <div key={i} className="feature">
            <div className="feature-name">{it.name || '—'}</div>
            <div className="feature-text">{it.text}</div>
          </div>
        ))
      )}
    </div>
  );
}

// ── Kind-picker modal (for + New Entry) ──
function KindPicker({ onPick, onCancel }) {
  const kinds = [
    { kind: 'Character', sub: 'A person met along the way' },
    { kind: 'Faction', sub: 'A group, guild, or order' },
    { kind: 'Location', sub: 'A place worth remembering' },
  ];
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal kind-picker" onClick={e => e.stopPropagation()}>
        <h2>New Entry</h2>
        <div className="sub">What kind of entry shall it be?</div>
        <div className="kind-grid">
          {kinds.map(k => (
            <button key={k.kind} className="kind-card" onClick={() => onPick(k.kind)}>
              <div className="kind-sigil"><CodexHeraldic kind={k.kind} size={40} /></div>
              <div className="kind-name">{k.kind}</div>
              <div className="kind-sub">{k.sub}</div>
            </button>
          ))}
        </div>
        <div className="modal-actions">
          <button className="cancel" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CodexHeraldic, CodexPortrait, CodexBanner, LinkedEntryList, FeatureBoxes, KindPicker });
