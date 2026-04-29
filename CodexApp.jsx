/* Campaign Codex — main app.
 * Three entry kinds: Character, Faction, Location.
 * State persists to localStorage.
 */
const { useState: cuS2, useEffect: cuE2, useMemo: cuM2 } = React;

const CODEX_STORAGE_KEY = 'campaign-codex-v1';

function loadCodexState() {
  try {
    const raw = localStorage.getItem(CODEX_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) { return null; }
}
function saveCodexState(state) {
  try { localStorage.setItem(CODEX_STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
}

function mergeCodexStarters(persistedEntries, persistedDeleted) {
  const starters = window.CODEX_STARTER_ALL();
  const deleted = new Set(persistedDeleted || []);
  const have = new Set((persistedEntries || []).map(e => e.id));
  const additions = starters.filter(s => !have.has(s.id) && !deleted.has(s.id));
  return [...(persistedEntries || []), ...additions];
}

function CodexApp() {
  const persisted = loadCodexState();
  const initialEntries = persisted
    ? mergeCodexStarters(persisted.entries, persisted.deletedStarters)
    : window.CODEX_STARTER_ALL();

  const [entries, setEntries] = cuS2(initialEntries);
  const [deletedStarters, setDeletedStarters] = cuS2(persisted?.deletedStarters || []);
  const [openSections, setOpenSections] = cuS2(new Set(persisted?.openSections || ['Character', 'Faction', 'Location']));
  const [selectedId, setSelectedId] = cuS2(persisted?.selectedId || initialEntries[0]?.id);
  const [search, setSearch] = cuS2('');
  const [paperTone, setPaperTone] = cuS2(persisted?.paperTone || 'warm');
  const [ribbons, setRibbons] = cuS2(persisted?.ribbons !== false);
  const [tweaksOn, setTweaksOn] = cuS2(false);
  const [picking, setPicking] = cuS2(false);

  cuE2(() => {
    saveCodexState({ entries, deletedStarters, openSections: [...openSections], selectedId, paperTone, ribbons });
  }, [entries, deletedStarters, openSections, selectedId, paperTone, ribbons]);

  cuE2(() => {
    document.body.classList.remove('tone-warm', 'tone-cool', 'tone-cream');
    document.body.classList.add('tone-' + paperTone);
    document.body.classList.toggle('no-ribbons', !ribbons);
  }, [paperTone, ribbons]);

  cuE2(() => {
    function onMsg(e) {
      if (e.data?.type === '__activate_edit_mode') setTweaksOn(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweaksOn(false);
    }
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  const selected = entries.find(e => e.id === selectedId);

  const grouped = cuM2(() => {
    const q = search.trim().toLowerCase();
    const match = (e) => !q ||
      e.name.toLowerCase().includes(q) ||
      (e.occupation || '').toLowerCase().includes(q) ||
      (e.ancestry || '').toLowerCase().includes(q) ||
      (e.description || '').toLowerCase().includes(q) ||
      (e.backstory || '').toLowerCase().includes(q);
    const out = { Character: [], Faction: [], Location: [] };
    for (const e of entries) {
      if (!out[e.kind]) out[e.kind] = [];
      if (match(e)) out[e.kind].push(e);
    }
    // alphabetical
    Object.keys(out).forEach(k => out[k].sort((a, b) => a.name.localeCompare(b.name)));
    return out;
  }, [entries, search]);

  function toggleSection(s) {
    const next = new Set(openSections);
    if (next.has(s)) next.delete(s); else next.add(s);
    setOpenSections(next);
  }

  function selectEntry(e) {
    setSelectedId(e.id);
    if (!openSections.has(e.kind)) setOpenSections(new Set([...openSections, e.kind]));
  }

  function jumpToByLink(target) {
    selectEntry(target);
  }

  function blankEntry(kind) {
    const id = kind.charAt(0).toLowerCase() + '-' + Math.random().toString(36).slice(2, 9);
    if (kind === 'Character') {
      return {
        id, kind: 'Character',
        name: 'New Character', age: '', gender: '', ancestry: '', occupation: '',
        portrait: null, backstory: '',
        relations: [], locations: [], factions: [], notes: '',
      };
    }
    if (kind === 'Faction') {
      return {
        id, kind: 'Faction',
        name: 'New Faction', image: null,
        description: '',
        operates: [],
        members: [], notes: '',
      };
    }
    return {
      id, kind: 'Location',
      name: 'New Location', image: null,
      description: '',
      pointsOfInterest: [], loot: '',
      characters: [], factions: [], adversaries: [],
      notes: '', encounters: [],
    };
  }

  function createEntry(kind) {
    const e = blankEntry(kind);
    setEntries([...entries, e]);
    setOpenSections(new Set([...openSections, kind]));
    setSelectedId(e.id);
    setPicking(false);
  }

  function deleteEntry(id) {
    if (!confirm('Remove this entry from the codex?')) return;
    setEntries(entries.filter(e => e.id !== id));
    const isStarter = window.CODEX_STARTER_ALL().some(s => s.id === id);
    if (isStarter && !deletedStarters.includes(id)) setDeletedStarters([...deletedStarters, id]);
    if (selectedId === id) {
      const next = entries.find(e => e.id !== id);
      setSelectedId(next?.id || null);
    }
  }

  function patchEntry(id, patch) {
    setEntries(entries.map(e => e.id === id ? { ...e, ...patch } : e));
  }

  return (
    <div className="binder">
      <div className="binder-spine"></div>
      <div className="binder-rivet-mid"></div>
      <div className="binder-plate">The Campaign Codex</div>

      <div className="binder-interior">
        {/* LEFT */}
        <nav className="tab-column">
          <div className="binder-title">Codex</div>

          <div className="search-wrap">
            <input
              className="search"
              placeholder="search the codex…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="btn-new btn-new-inline" onClick={() => setPicking(true)}>+ New Entry</button>
          </div>

          <ul className="tab-list">
            {['Character', 'Faction', 'Location'].map(kind => {
              const list = grouped[kind] || [];
              if (search && list.length === 0) return null;
              const isOpen = openSections.has(kind) || (search && list.length > 0);
              const plural = kind === 'Faction' ? 'Factions' : kind === 'Location' ? 'Locations' : 'Characters';
              return (
                <React.Fragment key={kind}>
                  <li className={`cat-tab ${isOpen ? 'open' : ''}`} onClick={() => toggleSection(kind)}>
                    <span className="tab-sigil"><CodexHeraldic kind={kind} size={18} /></span>
                    <span>{plural}</span>
                    <span className="count">{list.length}</span>
                    <span className="chev" />
                  </li>
                  <ul className={`creature-list ${isOpen ? 'open' : ''}`}>
                    {list.length === 0 && isOpen && (
                      <li style={{ padding: '6px 14px 6px 42px', fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(232,213,168,0.4)', fontStyle: 'italic' }}>
                        — empty —
                      </li>
                    )}
                    {list.map(e => (
                      <li
                        key={e.id}
                        className={`creature-item ${e.id === selectedId ? 'active' : ''}`}
                        onClick={() => selectEntry(e)}
                      >
                        <span className="ci-dot" />
                        <span>{e.name}</span>
                      </li>
                    ))}
                  </ul>
                </React.Fragment>
              );
            })}
          </ul>
        </nav>

        {/* RIGHT */}
        <div className="page-wrap">
          <div className="page">
            {!selected ? (
              <div className="empty-state">
                <div className="empty-sigil">✦</div>
                <h2>An unmarked page.</h2>
                <p>Select an entry from the tabs, or press <strong>+ New Entry</strong> to begin.</p>
              </div>
            ) : selected.kind === 'Character' ? (
              <CharacterPage
                entry={selected}
                allEntries={entries}
                onPatch={(p) => patchEntry(selected.id, p)}
                onDelete={() => deleteEntry(selected.id)}
                onJump={jumpToByLink}
              />
            ) : selected.kind === 'Faction' ? (
              <FactionPage
                entry={selected}
                allEntries={entries}
                onPatch={(p) => patchEntry(selected.id, p)}
                onDelete={() => deleteEntry(selected.id)}
                onJump={jumpToByLink}
              />
            ) : (
              <LocationPage
                entry={selected}
                allEntries={entries}
                onPatch={(p) => patchEntry(selected.id, p)}
                onDelete={() => deleteEntry(selected.id)}
                onJump={jumpToByLink}
              />
            )}
          </div>
        </div>
      </div>

      {picking && <KindPicker onPick={createEntry} onCancel={() => setPicking(false)} />}

      <div className={`tweaks ${tweaksOn ? 'on' : ''}`}>
        <h4>Tweaks</h4>
        <div className="tweak-row">
          <label>Paper tone</label>
          <select value={paperTone} onChange={e => setPaperTone(e.target.value)}>
            <option value="warm">Warm</option>
            <option value="cool">Cool</option>
            <option value="cream">Cream</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// ── Page header used by all three kinds ──
function CodexHeader({ entry, editing, onStartEdit, onSaveEdit, onCancelEdit, onDelete, draft, setDraft, leftSlot, subline }) {
  return (
    <div className="page-header">
      {leftSlot}
      <div>
        {editing ? (
          <input
            className="edit-name-input"
            value={draft.name}
            onChange={e => setDraft({ ...draft, name: e.target.value })}
            placeholder="Name"
          />
        ) : (
          <div className="page-name">{entry.name}</div>
        )}
        <div className="page-subline">{subline}</div>
      </div>
      <div className="page-actions">
        {editing ? (
          <>
            <button className="page-action primary" onClick={onSaveEdit}>Save</button>
            <button className="page-action" onClick={onCancelEdit}>Cancel</button>
          </>
        ) : (
          <>
            <button className="page-action" onClick={onStartEdit}>Edit</button>
            <button className="page-action danger" onClick={onDelete}>Remove</button>
          </>
        )}
      </div>
    </div>
  );
}

// ── CHARACTER PAGE ──
function CharacterPage({ entry, allEntries, onPatch, onDelete, onJump }) {
  const c = entry;
  const [editing, setEditing] = cuS2(false);
  const [draft, setDraft] = cuS2(c);
  cuE2(() => { setDraft(c); setEditing(false); }, [c.id]);

  const d = editing ? draft : c;
  const up = (p) => setDraft({ ...draft, ...p });

  const sublineParts = [c.ancestry, c.occupation].filter(Boolean);
  const subline = sublineParts.length === 0 ? <span style={{ opacity: 0 }}>—</span> : (
    <>
      {sublineParts.map((p, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="bullet">•</span>}
          {p}
        </React.Fragment>
      ))}
    </>
  );

  function save() {
    onPatch({ ...draft });
    setEditing(false);
  }

  return (
    <div data-screen-label={c.name}>
      <CodexHeader
        entry={c}
        editing={editing}
        draft={draft}
        setDraft={setDraft}
        onStartEdit={() => { setDraft(c); setEditing(true); }}
        onSaveEdit={save}
        onCancelEdit={() => { setDraft(c); setEditing(false); }}
        onDelete={onDelete}
        leftSlot={
          <CodexPortrait
            entry={c}
            onUpload={(url) => onPatch({ portrait: url })}
            onClear={() => onPatch({ portrait: null })}
          />
        }
        subline={subline}
      />

      {/* Character fields */}
      <div className="section">
        <div className="section-head">Particulars</div>
        <div className="char-fields">
          <div className="char-field">
            <label>Age</label>
            {editing ? (
              <input className="edit-field" value={d.age || ''} onChange={e => up({ age: e.target.value })} />
            ) : (
              <div className="char-value">{c.age || <span className="dimmed">—</span>}</div>
            )}
          </div>
          <div className="char-field">
            <label>Gender</label>
            {editing ? (
              <input className="edit-field" value={d.gender || ''} onChange={e => up({ gender: e.target.value })} />
            ) : (
              <div className="char-value">{c.gender || <span className="dimmed">—</span>}</div>
            )}
          </div>
          <div className="char-field">
            <label>Ancestry</label>
            {editing ? (
              <input className="edit-field" value={d.ancestry || ''} onChange={e => up({ ancestry: e.target.value })} />
            ) : (
              <div className="char-value">{c.ancestry || <span className="dimmed">—</span>}</div>
            )}
          </div>
          <div className="char-field">
            <label>Occupation</label>
            {editing ? (
              <input className="edit-field" value={d.occupation || ''} onChange={e => up({ occupation: e.target.value })} />
            ) : (
              <div className="char-value">{c.occupation || <span className="dimmed">—</span>}</div>
            )}
          </div>
        </div>
      </div>

      {/* Backstory */}
      <div className="section">
        <div className="section-head">Backstory & Details</div>
        {editing ? (
          <textarea className="edit-field" value={d.backstory || ''} onChange={e => up({ backstory: e.target.value })} placeholder="Their history, their manner, their secrets…" style={{ minHeight: 120 }} />
        ) : (
          <div className="description">{c.backstory || <span className="dimmed">No backstory yet.</span>}</div>
        )}
      </div>

      {/* Relations — link to other characters */}
      <div className="section">
        <div className="section-head">Ties to Other Characters</div>
        <LinkedEntryList
          items={editing ? draft.relations : c.relations}
          allEntries={allEntries}
          kindFilter="Character"
          onJump={onJump}
          onChange={(v) => editing ? up({ relations: v }) : onPatch({ relations: v })}
          editing={true}
          addLabel="+ Add tie"
        />
      </div>

      {/* Locations they can be found */}
      <div className="section">
        <div className="section-head">Locations</div>
        <LinkedEntryList
          items={editing ? draft.locations : c.locations}
          allEntries={allEntries}
          kindFilter="Location"
          onJump={onJump}
          onChange={(v) => editing ? up({ locations: v }) : onPatch({ locations: v })}
          editing={true}
          addLabel="+ Add location"
        />
      </div>

      {/* Factions */}
      <div className="section">
        <div className="section-head">Factions</div>
        <LinkedEntryList
          items={editing ? draft.factions : c.factions}
          allEntries={allEntries}
          kindFilter="Faction"
          onJump={onJump}
          onChange={(v) => editing ? up({ factions: v }) : onPatch({ factions: v })}
          editing={true}
          addLabel="+ Add faction"
        />
      </div>

      {/* GM notes */}
      <div className="section">
        <div className="section-head">GM Notes (private)</div>
        <textarea
          className="edit-field"
          value={c.notes || ''}
          onChange={e => onPatch({ notes: e.target.value })}
          placeholder="Private notes — secrets, plot hooks, foreshadowing…"
          style={{ minHeight: 80 }}
        />
      </div>
    </div>
  );
}

// ── FACTION PAGE ──
function FactionPage({ entry, allEntries, onPatch, onDelete, onJump }) {
  const f = entry;
  const [editing, setEditing] = cuS2(false);
  const [draft, setDraft] = cuS2(f);
  cuE2(() => { setDraft(f); setEditing(false); }, [f.id]);

  const d = editing ? draft : f;
  const up = (p) => setDraft({ ...draft, ...p });

  function save() {
    onPatch({ ...draft });
    setEditing(false);
  }

  return (
    <div data-screen-label={f.name}>
      {/* Wide image up top */}
      <CodexBanner
        entry={f}
        height={180}
        onUpload={(url) => onPatch({ image: url })}
        onClear={() => onPatch({ image: null })}
        hint="Upload faction sigil or image"
      />

      <div className="page-header" style={{ gridTemplateColumns: '1fr auto' }}>
        <div>
          {editing ? (
            <input
              className="edit-name-input"
              value={draft.name}
              onChange={e => setDraft({ ...draft, name: e.target.value })}
              placeholder="Faction name"
            />
          ) : (
            <div className="page-name">{f.name}</div>
          )}
          <div className="page-subline"><span style={{ opacity: 0 }}>—</span></div>
        </div>
        <div className="page-actions">
          {editing ? (
            <>
              <button className="page-action primary" onClick={save}>Save</button>
              <button className="page-action" onClick={() => { setDraft(f); setEditing(false); }}>Cancel</button>
            </>
          ) : (
            <>
              <button className="page-action" onClick={() => { setDraft(f); setEditing(true); }}>Edit</button>
              <button className="page-action danger" onClick={onDelete}>Remove</button>
            </>
          )}
        </div>
      </div>

      <div className="section">
        <div className="section-head">Description</div>
        {editing ? (
          <textarea className="edit-field" value={d.description || ''} onChange={e => up({ description: e.target.value })} placeholder="What they stand for, what they want, who they are…" style={{ minHeight: 110 }} />
        ) : (
          <div className="description">{f.description || <span className="dimmed">No description yet.</span>}</div>
        )}
      </div>

      <div className="section">
        <div className="section-head">Where They Operate</div>
        <LinkedEntryList
          items={f.operates}
          allEntries={allEntries}
          kindFilter="Location"
          onJump={onJump}
          onChange={(v) => onPatch({ operates: v })}
          editing={true}
          addLabel="+ Add location"
        />
      </div>

      <div className="section">
        <div className="section-head">Members</div>
        <LinkedEntryList
          items={f.members}
          allEntries={allEntries}
          kindFilter="Character"
          onJump={onJump}
          onChange={(v) => onPatch({ members: v })}
          editing={true}
          addLabel="+ Add member"
        />
      </div>

      <div className="section">
        <div className="section-head">GM Notes (private)</div>
        <textarea
          className="edit-field"
          value={f.notes || ''}
          onChange={e => onPatch({ notes: e.target.value })}
          placeholder="Private notes — secrets, schemes, plot hooks…"
          style={{ minHeight: 80 }}
        />
      </div>
    </div>
  );
}

// ── LOCATION PAGE ──
function LocationPage({ entry, allEntries, onPatch, onDelete, onJump }) {
  const l = entry;
  const [editing, setEditing] = cuS2(false);
  const [draft, setDraft] = cuS2(l);
  cuE2(() => { setDraft(l); setEditing(false); }, [l.id]);

  const d = editing ? draft : l;
  const up = (p) => setDraft({ ...draft, ...p });

  function save() {
    onPatch({ ...draft });
    setEditing(false);
  }

  return (
    <div data-screen-label={l.name}>
      <CodexBanner
        entry={l}
        height={260}
        onUpload={(url) => onPatch({ image: url })}
        onClear={() => onPatch({ image: null })}
        hint="Upload area image / map"
      />

      <div className="page-header" style={{ gridTemplateColumns: '1fr auto' }}>
        <div>
          {editing ? (
            <input
              className="edit-name-input"
              value={draft.name}
              onChange={e => setDraft({ ...draft, name: e.target.value })}
              placeholder="Location name"
            />
          ) : (
            <div className="page-name">{l.name}</div>
          )}
          <div className="page-subline"><span style={{ opacity: 0 }}>—</span></div>
        </div>
        <div className="page-actions">
          {editing ? (
            <>
              <button className="page-action primary" onClick={save}>Save</button>
              <button className="page-action" onClick={() => { setDraft(l); setEditing(false); }}>Cancel</button>
            </>
          ) : (
            <>
              <button className="page-action" onClick={() => { setDraft(l); setEditing(true); }}>Edit</button>
              <button className="page-action danger" onClick={onDelete}>Remove</button>
            </>
          )}
        </div>
      </div>

      <div className="section">
        <div className="section-head">Description</div>
        {editing ? (
          <textarea className="edit-field" value={d.description || ''} onChange={e => up({ description: e.target.value })} placeholder="What the place looks like, its mood, its people…" style={{ minHeight: 120 }} />
        ) : (
          <div className="description">{l.description || <span className="dimmed">No description yet.</span>}</div>
        )}
      </div>

      <div className="section">
        <div className="section-head">Points of Interest</div>
        <FeatureBoxes
          items={l.pointsOfInterest}
          onChange={(v) => onPatch({ pointsOfInterest: v })}
          editing={true}
          addLabel="+ Add point of interest"
          namePlaceholder="Name (e.g. The Old Bridge)"
          textPlaceholder="What is here, what stands out, what players might find…"
        />
      </div>

      <div className="section">
        <div className="section-head">Loot</div>
        <textarea
          className="edit-field"
          value={l.loot || ''}
          onChange={e => onPatch({ loot: e.target.value })}
          placeholder="Treasure, oddities, hidden caches…"
          style={{ minHeight: 80, fontStyle: 'italic', color: 'var(--hope-deep)' }}
        />
      </div>

      <div className="section">
        <div className="section-head">Characters Here</div>
        <LinkedEntryList
          items={l.characters}
          allEntries={allEntries}
          kindFilter="Character"
          onJump={onJump}
          onChange={(v) => onPatch({ characters: v })}
          editing={true}
          addLabel="+ Add character"
        />
      </div>

      <div className="section">
        <div className="section-head">Factions Present</div>
        <LinkedEntryList
          items={l.factions}
          allEntries={allEntries}
          kindFilter="Faction"
          onJump={onJump}
          onChange={(v) => onPatch({ factions: v })}
          editing={true}
          addLabel="+ Add faction"
        />
      </div>

      <div className="section">
        <div className="section-head">Adversaries</div>
        <LinkedEntryList
          items={l.adversaries}
          allEntries={allEntries}
          kindFilter={null}
          onJump={onJump}
          onChange={(v) => onPatch({ adversaries: v })}
          editing={true}
          addLabel="+ Add adversary"
        />
        <div className="adv-hint">
          <em>Tip: cross-reference these entries with the Adversary Binder.</em>
        </div>
      </div>

      <div className="section">
        <div className="section-head">GM Notes (private)</div>
        <textarea
          className="edit-field"
          value={l.notes || ''}
          onChange={e => onPatch({ notes: e.target.value })}
          placeholder="Private notes — secrets, plot hooks, hidden things…"
          style={{ minHeight: 80 }}
        />
      </div>

      <div className="section">
        <div className="section-head">Encounter Log</div>
        <FeatureBoxes
          items={l.encounters}
          onChange={(v) => onPatch({ encounters: v })}
          editing={true}
          addLabel="+ Add encounter"
          namePlaceholder="Session / title"
          textPlaceholder="What happened here this session…"
        />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<CodexApp />);
