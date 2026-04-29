// Starter content for the Campaign Codex.
// Three entry kinds: characters, factions, locations.
// Mirrors the Adversary Binder's heraldic-sigil approach.

window.CODEX_HERALDIC = {
  Character: `<g fill="currentColor">
    <circle cx="32" cy="22" r="9"/>
    <path d="M14 50 C 14 38 22 32 32 32 C 42 32 50 38 50 50 L50 54 L14 54 Z"/>
  </g>`,
  Faction: `<g fill="currentColor">
    <path d="M16 10 L48 10 L48 44 L32 54 L16 44 Z"/>
    <path d="M22 18 L42 18 L42 40 L32 46 L22 40 Z" fill="#efe7d6" opacity="0.18"/>
    <path d="M28 22 L36 22 L36 30 L32 34 L28 30 Z" fill="#efe7d6"/>
  </g>`,
  Location: `<g fill="currentColor">
    <path d="M10 48 L22 28 L30 38 L40 22 L54 48 Z"/>
    <circle cx="44" cy="18" r="4"/>
    <path d="M14 48 L54 48" stroke="#efe7d6" stroke-width="1.2" opacity="0.4" fill="none"/>
  </g>`,
};

// Sample seeds — small, illustrative; user can edit/remove.
window.CODEX_STARTER_CHARACTERS = [
  {
    id: 'ch-mira',
    kind: 'Character',
    name: 'Mira Thornroot',
    age: '34',
    ancestry: 'Half-elf',
    occupation: 'Innkeeper of the Salted Stag',
    portrait: null,
    backstory:
      'Runs the only inn in Ashbrook with an iron hand and a soft laugh. Lost her brother to a bandit raid five winters past — keeps his sword above the hearth. Knows every traveler by name, and which of them owe her coin.',
    relations: [
      { name: 'Old Hen Wyn', note: 'her late mother\'s closest friend' },
      { name: 'Cael Vance', note: 'sweet on him, won\'t admit it' },
    ],
    factions: [
      { name: 'The Lantern Circle', note: 'sympathetic; harbors them' },
    ],
    locations: [
      { name: 'Ashbrook', note: 'runs the Salted Stag here' },
    ],
    notes:
      'Knows about the smuggling tunnel beneath the cellar. Will not betray a guest unless the guest threatens a child.',
  },
  {
    id: 'ch-cael',
    kind: 'Character',
    name: 'Cael Vance',
    age: '41',
    ancestry: 'Human',
    occupation: 'Captain of the Ashbrook Watch',
    portrait: null,
    backstory:
      'A weary, capable veteran of the Border Wars. Walks with a limp from a goblin spear and drinks his lunch at the Salted Stag. He is the only law in town that the bandits respect.',
    relations: [
      { name: 'Mira Thornroot', note: 'old friend; unspoken affection' },
      { name: 'Sergeant Halla', note: 'his second; trusts her with his life' },
    ],
    factions: [
      { name: 'Ashbrook Watch', note: 'commanding officer' },
    ],
    locations: [
      { name: 'Ashbrook', note: 'keeps watch from the Old Watchhouse' },
    ],
    notes:
      'Took bribes once, eight years ago. Hasn\'t since. Will help the party if they prove honorable — but won\'t step outside the law.',
  },
  {
    id: 'ch-vexa',
    kind: 'Character',
    name: 'Vexa the Jackdaw',
    age: '29',
    ancestry: 'Tiefling',
    occupation: 'Information broker',
    portrait: null,
    backstory:
      'Operates out of a back room above the Crooked Coin. Wears a silver mask shaped like a bird. Trades in secrets the way other people trade in coin — and her ledger is rumored to know the names of three nobles\' bastards.',
    relations: [
      { name: 'The Whisper-King', note: 'her absent patron' },
    ],
    factions: [
      { name: 'The Black Tally', note: 'mid-rank; runs the Ashbrook cell' },
    ],
    locations: [
      { name: 'Ashbrook', note: 'a back room above the Crooked Coin' },
    ],
    notes:
      'She wants the players in her debt, not the other way around. First favor is always free; the second has teeth.',
  },
];

window.CODEX_STARTER_FACTIONS = [
  {
    id: 'fa-lantern',
    kind: 'Faction',
    name: 'The Lantern Circle',
    image: null,
    description:
      'A loose, half-secret network of healers, hedge-witches, and sympathetic clergy who shelter those the crown has marked. They light a single shuttered lantern in their windows on moonless nights.',
    operates: [
      { name: 'Ashbrook', note: 'main cell; shuttered lanterns in the windows' },
    ],
    members: [
      { name: 'Mira Thornroot', note: 'shelters runners in the Salted Stag cellar' },
    ],
    notes:
      'They will trust the party only after the party has bled for someone the Circle was protecting. Until then, polite distance.',
  },
  {
    id: 'fa-tally',
    kind: 'Faction',
    name: 'The Black Tally',
    image: null,
    description:
      'A thieves\' guild with a long memory and an accountant\'s patience. They do not steal for thrill; they steal because debts must be paid, and the Tally is who you go to when the lawful courts have failed you.',
    operates: [
      { name: 'Ashbrook', note: 'cell of five; ledger-keeper above the Crooked Coin' },
    ],
    members: [
      { name: 'Vexa the Jackdaw', note: 'Ashbrook ledger-keeper' },
    ],
    notes:
      'Their gold is good and their contracts are clear. The price is always paid in kind — never in coin alone.',
  },
];

window.CODEX_STARTER_LOCATIONS = [
  {
    id: 'lo-ashbrook',
    kind: 'Location',
    name: 'Ashbrook',
    image: null,
    description:
      'A grey-stone river town of perhaps six hundred souls, half a day\'s ride from the King\'s Road. The river Tay runs through its heart, spanned by a single arched bridge older than the town itself. Smoke rises always from the smithy and from the Salted Stag\'s chimney.',
    pointsOfInterest: [
      { name: 'The Salted Stag', text: 'The town\'s only inn. A long oak common-room, a hearth that never quite goes out, and a cellar with a door the proprietress never mentions.' },
      { name: 'The Bridge of Saints', text: 'Pre-imperial stonework, carved with weather-smoothed faces. Local legend says the saints turn their heads when the innocent cross at midnight.' },
      { name: 'The Crooked Coin', text: 'A gambling house with rooms above. The dice are honest; the proprietor is not.' },
      { name: 'The Old Watchhouse', text: 'A squat stone keep on the north bank. Captain Vance\'s office, three holding cells, and a ledger of every traveler through the gate this season.' },
    ],
    loot:
      'The cellar of the Salted Stag conceals a small smuggler\'s cache: 40gp in mixed coin, three sealed letters bearing a noble cipher, and a vial of moon-thistle worth 80gp to an alchemist.',
    characters: [
      { name: 'Mira Thornroot', note: 'innkeeper' },
      { name: 'Cael Vance', note: 'captain of the watch' },
      { name: 'Vexa the Jackdaw', note: 'above the Crooked Coin' },
    ],
    factions: [
      { name: 'The Lantern Circle', note: 'cell active in the Stag' },
      { name: 'The Black Tally', note: 'small cell, run by Vexa' },
      { name: 'Ashbrook Watch', note: 'twelve sworn, plus Vance' },
    ],
    adversaries: [
      { name: 'Black Fen Bandits', note: 'rumored to use a tunnel beneath the bridge' },
      { name: 'Dire Wolf', note: 'sightings on the north road after dusk' },
    ],
    notes:
      'If the players push hard against the Tally, Vexa will leave town within a day — and not return. Mira will not forgive them for that.',
    encounters: [
      { name: 'Session 04 — The Tay Bridge', text: 'Party arrived at dusk; met by Sergeant Halla. Brief tense exchange about the bandit raid two nights prior. Resolved with a shared drink at the Stag.' },
      { name: 'Session 06 — The Cellar Door', text: 'Mira revealed the cache after the rogue saved a Lantern runner. The party now knows the cellar exists; she has not yet shown them the tunnel beyond.' },
    ],
  },
];

// Convenience: get all entries, regardless of kind.
window.CODEX_STARTER_ALL = function () {
  return [
    ...window.CODEX_STARTER_CHARACTERS,
    ...window.CODEX_STARTER_FACTIONS,
    ...window.CODEX_STARTER_LOCATIONS,
  ];
};
