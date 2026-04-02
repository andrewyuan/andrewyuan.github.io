// ============================================
// TIMELINE OF WORLD HISTORY - DATA
// Comprehensive dataset from ~3500 BCE to 2000 CE
// ============================================

const REGIONS = [
    { id: 'americas', name: 'Americas', color: '#f59e0b' },
    { id: 'africa', name: 'Africa', color: '#ef4444' },
    { id: 'europe', name: 'Europe', color: '#8b5cf6' },
    { id: 'middle-east', name: 'Middle East', color: '#06b6d4' },
    { id: 'south-asia', name: 'South Asia', color: '#10b981' },
    { id: 'east-asia', name: 'East Asia', color: '#f43f5e' },
];

const ERAS = [
    { id: 'early-bronze', name: 'Early Bronze Age', start: -3500, end: -2100, color: '#d4a574' },
    { id: 'bronze', name: 'Bronze Age', start: -2100, end: -1200, color: '#cd7f32' },
    { id: 'iron', name: 'Iron Age', start: -1200, end: -600, color: '#71717a' },
    { id: 'classical', name: 'Classical Antiquity', start: -600, end: 500, color: '#8b5cf6' },
    { id: 'middle', name: 'Middle Ages', start: 500, end: 1500, color: '#059669' },
    { id: 'modern', name: 'Modern Period', start: 1500, end: 2025, color: '#2563eb' },
];

// Civilization streams: vertical bars showing duration of civilizations
// subCol: position within region (0-1), width: bar width multiplier, parent: lineage connection
const CIVILIZATIONS = [
    // ============ AMERICAS ============
    { id: 'maya', name: 'Maya', region: 'americas', start: -2000, end: 1500, color: '#eab308', subCol: 0.55, width: 1.8 },
    { id: 'olmec', name: 'Olmecs', region: 'americas', start: -1500, end: -400, color: '#f59e0b', subCol: 0.2, width: 2 },
    { id: 'teotihuacan', name: 'Teotihuacan', region: 'americas', start: -200, end: 550, color: '#d97706', subCol: 0.2, width: 1.8 },
    { id: 'aztec', name: 'Aztec Empire', region: 'americas', start: 1300, end: 1521, color: '#b45309', subCol: 0.2, width: 2.2 },
    { id: 'inca', name: 'Inca Empire', region: 'americas', start: 1400, end: 1533, color: '#92400e', subCol: 0.82, width: 1.8 },
    { id: 'new-spain', name: 'New Spain', region: 'americas', start: 1521, end: 1821, color: '#7c3aed', subCol: 0.3, width: 1.8 },
    { id: 'brazil-col', name: 'Portuguese Brazil', region: 'americas', start: 1500, end: 1822, color: '#059669', subCol: 0.75, width: 1.5 },
    { id: 'new-france', name: 'New France', region: 'americas', start: 1534, end: 1763, color: '#2563eb', subCol: 0.15, width: 1.5 },
    { id: 'british-america', name: 'British America', region: 'americas', start: 1607, end: 1783, color: '#dc2626', subCol: 0.45, width: 1.5 },
    { id: 'usa', name: 'United States', region: 'americas', start: 1776, end: 2025, color: '#1d4ed8', subCol: 0.35, width: 2.2, parent: 'british-america' },

    // ============ AFRICA ============
    { id: 'egypt-old', name: 'Egyptian Old Kingdom', region: 'africa', start: -2686, end: -2181, color: '#22d3ee', subCol: 0.6, width: 2.2 },
    { id: 'egypt-middle', name: 'Egyptian Middle Kingdom', region: 'africa', start: -2055, end: -1650, color: '#06b6d4', subCol: 0.6, width: 2.2, parent: 'egypt-old' },
    { id: 'egypt-new', name: 'Egyptian New Kingdom', region: 'africa', start: -1550, end: -1077, color: '#0891b2', subCol: 0.6, width: 2.8, parent: 'egypt-middle' },
    { id: 'kush', name: 'Kingdom of Kush', region: 'africa', start: -1070, end: 350, color: '#ef4444', subCol: 0.45, width: 1.8, parent: 'egypt-new' },
    { id: 'aksum', name: 'Aksumite Empire', region: 'africa', start: 100, end: 940, color: '#dc2626', subCol: 0.75, width: 1.5 },
    { id: 'ghana', name: 'Ghana Empire', region: 'africa', start: 300, end: 1200, color: '#b91c1c', subCol: 0.2, width: 1.8 },
    { id: 'mali', name: 'Mali Empire', region: 'africa', start: 1235, end: 1600, color: '#991b1b', subCol: 0.2, width: 2.2, parent: 'ghana' },
    { id: 'songhai', name: 'Songhai Empire', region: 'africa', start: 1430, end: 1591, color: '#7f1d1d', subCol: 0.5, width: 1.5, parent: 'mali' },

    // ============ EUROPE ============
    { id: 'minoan', name: 'Minoan', region: 'europe', start: -2700, end: -1450, color: '#a78bfa', subCol: 0.4, width: 1.8 },
    { id: 'mycenaean', name: 'Mycenaean', region: 'europe', start: -1600, end: -1100, color: '#8b5cf6', subCol: 0.4, width: 1.8, parent: 'minoan' },
    { id: 'greek', name: 'Ancient Greece', region: 'europe', start: -800, end: -146, color: '#7c3aed', subCol: 0.35, width: 2.2, parent: 'mycenaean' },
    { id: 'roman', name: 'Roman Empire', region: 'europe', start: -509, end: 476, color: '#6d28d9', subCol: 0.55, width: 3, parent: 'greek' },
    { id: 'byzantine', name: 'Byzantine Empire', region: 'europe', start: 330, end: 1453, color: '#5b21b6', subCol: 0.72, width: 2, parent: 'roman' },
    { id: 'charlemagne', name: 'Charlemagne', region: 'europe', start: 768, end: 888, color: '#4c1d95', subCol: 0.28, width: 1.8 },
    { id: 'hre', name: 'Holy Roman Empire', region: 'europe', start: 962, end: 1806, color: '#581c87', subCol: 0.42, width: 1.8, parent: 'charlemagne' },
    { id: 'france', name: 'France', region: 'europe', start: 843, end: 2025, color: '#7c3aed', subCol: 0.15, width: 1.5, parent: 'charlemagne' },
    { id: 'british', name: 'British Empire', region: 'europe', start: 1583, end: 1997, color: '#dc2626', subCol: 0.55, width: 2.2 },
    { id: 'german-empire', name: 'German Empire', region: 'europe', start: 1871, end: 1918, color: '#374151', subCol: 0.42, width: 1.8, parent: 'hre' },
    { id: 'nazi', name: 'Nazi Germany', region: 'europe', start: 1933, end: 1945, color: '#1f2937', subCol: 0.42, width: 2.0, parent: 'german-empire' },
    { id: 'russian-empire', name: 'Russian Empire', region: 'europe', start: 1721, end: 1917, color: '#9f1239', subCol: 0.88, width: 1.8 },
    { id: 'soviet', name: 'Soviet Union', region: 'europe', start: 1922, end: 1991, color: '#b91c1c', subCol: 0.88, width: 1.5, parent: 'russian-empire' },

    // ============ MIDDLE EAST ============
    { id: 'sumer', name: 'Sumer', region: 'middle-east', start: -3500, end: -2004, color: '#06b6d4', subCol: 0.3, width: 2.2 },
    { id: 'akkad', name: 'Akkadian Empire', region: 'middle-east', start: -2334, end: -2154, color: '#0891b2', subCol: 0.55, width: 1.5, parent: 'sumer' },
    { id: 'babylon', name: 'Babylonian Empire', region: 'middle-east', start: -1895, end: -539, color: '#0e7490', subCol: 0.3, width: 2, parent: 'sumer' },
    { id: 'assyria', name: 'Assyrian Empire', region: 'middle-east', start: -2500, end: -609, color: '#155e75', subCol: 0.7, width: 1.8 },
    { id: 'achaemenid', name: 'Achaemenid (Persian)', region: 'middle-east', start: -550, end: -330, color: '#164e63', subCol: 0.5, width: 2.8 },
    { id: 'parthia', name: 'Parthian Empire', region: 'middle-east', start: -247, end: 224, color: '#22d3ee', subCol: 0.65, width: 1.8, parent: 'achaemenid' },
    { id: 'sassanid', name: 'Sassanid Empire', region: 'middle-east', start: 224, end: 651, color: '#67e8f9', subCol: 0.65, width: 2, parent: 'parthia' },
    { id: 'umayyad', name: 'Umayyad Caliphate', region: 'middle-east', start: 661, end: 750, color: '#2dd4bf', subCol: 0.35, width: 2, parent: 'sassanid' },
    { id: 'abbasid', name: 'Abbasid Caliphate', region: 'middle-east', start: 750, end: 1258, color: '#14b8a6', subCol: 0.35, width: 2.5, parent: 'umayyad' },
    { id: 'ottoman', name: 'Ottoman Empire', region: 'middle-east', start: 1299, end: 1922, color: '#0d9488', subCol: 0.5, width: 2.8, parent: 'abbasid' },

    // ============ SOUTH ASIA ============
    { id: 'indus', name: 'Indus Valley', region: 'south-asia', start: -3300, end: -1300, color: '#10b981', subCol: 0.4, width: 2.2 },
    { id: 'maurya', name: 'Maurya Empire', region: 'south-asia', start: -322, end: -185, color: '#059669', subCol: 0.45, width: 2.5 },
    { id: 'gupta', name: 'Gupta Empire', region: 'south-asia', start: 320, end: 550, color: '#047857', subCol: 0.4, width: 2, parent: 'maurya' },
    { id: 'chola', name: 'Chola Dynasty', region: 'south-asia', start: 300, end: 1279, color: '#065f46', subCol: 0.75, width: 1.5 },
    { id: 'mughal', name: 'Mughal Empire', region: 'south-asia', start: 1526, end: 1857, color: '#064e3b', subCol: 0.4, width: 2.5 },
    { id: 'india', name: 'India', region: 'south-asia', start: 1947, end: 2025, color: '#10b981', subCol: 0.45, width: 2.2, parent: 'mughal' },

    // ============ EAST ASIA ============
    { id: 'shang', name: 'Shang Dynasty', region: 'east-asia', start: -1600, end: -1046, color: '#f43f5e', subCol: 0.35, width: 1.8 },
    { id: 'zhou', name: 'Zhou Dynasty', region: 'east-asia', start: -1046, end: -256, color: '#e11d48', subCol: 0.35, width: 2.2, parent: 'shang' },
    { id: 'qin', name: 'Qin Dynasty', region: 'east-asia', start: -221, end: -206, color: '#be123c', subCol: 0.35, width: 1.5, parent: 'zhou' },
    { id: 'han', name: 'Han Dynasty', region: 'east-asia', start: -206, end: 220, color: '#9f1239', subCol: 0.35, width: 2.8, parent: 'qin' },
    { id: 'tang', name: 'Tang Dynasty', region: 'east-asia', start: 618, end: 907, color: '#881337', subCol: 0.35, width: 2.8, parent: 'han' },
    { id: 'song', name: 'Song Dynasty', region: 'east-asia', start: 960, end: 1279, color: '#831843', subCol: 0.35, width: 2.2, parent: 'tang' },
    { id: 'mongol', name: 'Mongol Empire', region: 'east-asia', start: 1206, end: 1368, color: '#fb923c', subCol: 0.62, width: 2.2 },
    { id: 'ming', name: 'Ming Dynasty', region: 'east-asia', start: 1368, end: 1644, color: '#f43f5e', subCol: 0.35, width: 2.2, parent: 'song' },
    { id: 'qing', name: 'Qing Dynasty', region: 'east-asia', start: 1644, end: 1912, color: '#e11d48', subCol: 0.35, width: 2.2, parent: 'ming' },
    { id: 'roc', name: 'Republic of China', region: 'east-asia', start: 1912, end: 1949, color: '#f43f5e', subCol: 0.35, width: 1.8, parent: 'qing' },
    { id: 'prc', name: 'China (PRC)', region: 'east-asia', start: 1949, end: 2025, color: '#dc2626', subCol: 0.35, width: 2.8, parent: 'roc' },
    { id: 'japan', name: 'Imperial Japan', region: 'east-asia', start: 660, end: 1945, color: '#fda4af', subCol: 0.85, width: 1.5 },
];

// Events
const EVENTS = [
    // ===== EARLY BRONZE AGE (3500-2100 BCE) =====
    { id: 'e1', title: 'Invention of Writing (Cuneiform)', year: -3400, region: 'middle-east', importance: 5, icon: '𒀀',
      description: 'The Sumerians developed cuneiform, one of the earliest systems of writing, using wedge-shaped marks on clay tablets. This revolutionary invention enabled record-keeping, literature, and the transmission of knowledge across generations.',
      tags: ['writing', 'technology', 'Sumer'] },

    { id: 'e2', title: 'Hieroglyphic Writing in Egypt', year: -3200, region: 'africa', importance: 5, icon: '𓂀',
      description: 'Ancient Egyptians developed hieroglyphic writing, a complex system using pictorial symbols. Used primarily for religious texts and monumental inscriptions.',
      tags: ['writing', 'Egypt', 'technology'] },

    { id: 'e3', title: 'Unification of Upper & Lower Egypt', year: -3100, region: 'africa', importance: 5, icon: '👑',
      description: 'King Narmer (Menes) united Upper and Lower Egypt, establishing the first dynasty and one of the world\'s earliest unified states.',
      tags: ['Egypt', 'politics', 'unification'] },

    { id: 'e4', title: 'Great Pyramid of Giza Built', year: -2560, region: 'africa', importance: 5, icon: '🔺',
      description: 'The Great Pyramid was built as a tomb for Pharaoh Khufu. It is the oldest of the Seven Wonders of the Ancient World and remained the tallest man-made structure for over 3,800 years.',
      tags: ['Egypt', 'architecture', 'wonder'] },

    { id: 'e5', title: 'Rise of Indus Valley Civilization', year: -3300, region: 'south-asia', importance: 4, icon: '🏙️',
      description: 'The Indus Valley Civilization emerged in present-day Pakistan and northwestern India, featuring advanced urban planning, drainage systems, and standardized weights.',
      tags: ['Indus Valley', 'urbanization', 'civilization'] },

    { id: 'e6', title: 'Cities of Ur and Uruk Flourish', year: -3000, region: 'middle-east', importance: 4,
      description: 'The Sumerian cities of Ur and Uruk became major urban centers with populations exceeding 40,000, featuring ziggurats and complex social hierarchies.',
      tags: ['Sumer', 'urbanization', 'Mesopotamia'] },

    { id: 'e7', title: 'Stonehenge Construction Begins', year: -3000, region: 'europe', importance: 4, icon: '🪨',
      description: 'Construction of the iconic stone circle at Stonehenge in England began, serving as an astronomical observatory and ceremonial site.',
      tags: ['Britain', 'monument', 'astronomy'] },

    { id: 'e8', title: 'Bronze Metallurgy Develops', year: -3300, region: 'middle-east', importance: 4, icon: '⚒️',
      description: 'The alloying of copper and tin to produce bronze transformed toolmaking and warfare, defining the Bronze Age.',
      tags: ['technology', 'metallurgy', 'Bronze Age'] },

    { id: 'e9', title: 'Early Trade Routes Established', year: -3000, region: 'middle-east', importance: 3,
      description: 'Long-distance trade networks connected Mesopotamia, the Indus Valley, and Egypt, exchanging goods like lapis lazuli, gold, and textiles.',
      tags: ['trade', 'economy', 'connectivity'] },

    { id: 'e10', title: 'Akkadian Empire Founded', year: -2334, region: 'middle-east', importance: 4,
      description: 'Sargon of Akkad created the world\'s first known empire, uniting the Sumerian city-states and extending his rule from the Persian Gulf to the Mediterranean.',
      tags: ['Akkad', 'empire', 'Sargon'] },

    { id: 'e11', title: '4.2 Kiloyear Event', year: -2200, region: 'middle-east', importance: 4,
      description: 'A severe drought lasting about 200 years caused the collapse of the Akkadian Empire, the Egyptian Old Kingdom, and potentially the Indus Valley Civilization.',
      tags: ['climate', 'collapse', 'drought'] },

    // ===== BRONZE AGE (2100-1200 BCE) =====
    { id: 'e12', title: 'Code of Hammurabi', year: -1754, region: 'middle-east', importance: 5, icon: '⚖️',
      description: 'Babylonian King Hammurabi created one of the oldest known written legal codes, establishing 282 laws covering property, trade, family, and criminal justice.',
      tags: ['Babylon', 'law', 'governance'] },

    { id: 'e13', title: 'Minoan Civilization at its Peak', year: -1700, region: 'europe', importance: 4,
      description: 'The Minoan civilization on Crete reached its height, with the Palace of Knossos serving as a major center of culture, trade, and the famous Labyrinth legend.',
      tags: ['Minoan', 'Crete', 'civilization'] },

    { id: 'e14', title: 'Shang Dynasty Established', year: -1600, region: 'east-asia', importance: 4,
      description: 'The Shang Dynasty became the first historically verified Chinese dynasty, known for bronze casting, oracle bones, and the development of Chinese writing.',
      tags: ['China', 'Shang', 'writing'] },

    { id: 'e15', title: 'Hyksos Invade Egypt', year: -1650, region: 'africa', importance: 3,
      description: 'The Hyksos, a Semitic people, conquered Lower Egypt and ruled during the Second Intermediate Period, introducing the horse-drawn chariot and composite bow.',
      tags: ['Egypt', 'invasion', 'Hyksos'] },

    { id: 'e16', title: 'Egyptian New Kingdom Begins', year: -1550, region: 'africa', importance: 4,
      description: 'The New Kingdom era (18th-20th Dynasties) represented the height of Egyptian power and prosperity, producing pharaohs like Hatshepsut, Akhenaten, and Ramesses II.',
      tags: ['Egypt', 'New Kingdom', 'golden age'] },

    { id: 'e17', title: 'Thutmose III Expands Egypt', year: -1457, region: 'africa', importance: 3,
      description: 'Often called the "Napoleon of Egypt," Thutmose III conducted 17 military campaigns, expanding Egypt to its greatest territorial extent.',
      tags: ['Egypt', 'military', 'expansion'] },

    { id: 'e18', title: 'Reign of Akhenaten', year: -1353, region: 'africa', importance: 3,
      description: 'Pharaoh Akhenaten introduced monotheistic worship of the sun disk Aten, dramatically transforming Egyptian religion and art.',
      tags: ['Egypt', 'religion', 'monotheism'] },

    { id: 'e19', title: 'Tutankhamun Rules Egypt', year: -1332, region: 'africa', importance: 3, icon: '🏺',
      description: 'The boy king Tutankhamun restored traditional Egyptian polytheism. His intact tomb, discovered in 1922, provided unprecedented insights into ancient Egypt.',
      tags: ['Egypt', 'Tutankhamun', 'archaeology'] },

    { id: 'e20', title: 'Trojan War (Traditional Date)', year: -1184, region: 'europe', importance: 4, icon: '🐴',
      description: 'The legendary Trojan War between Greeks and Trojans, immortalized in Homer\'s Iliad. Archaeological evidence suggests a historical conflict at Troy (Hisarlik).',
      tags: ['Greece', 'Troy', 'warfare', 'mythology'] },

    { id: 'e21', title: 'Bronze Age Collapse', year: -1200, region: 'middle-east', importance: 5,
      description: 'A catastrophic period when most Bronze Age civilizations in the Eastern Mediterranean collapsed. The Sea Peoples, drought, earthquakes, and systems failure contributed to the fall of the Hittites, Mycenaeans, and others.',
      tags: ['collapse', 'Sea Peoples', 'catastrophe'] },

    { id: 'e22', title: 'Olmec Civilization Emerges', year: -1500, region: 'americas', importance: 4, icon: '🗿',
      description: 'The Olmecs, often considered the "mother culture" of Mesoamerica, emerged in present-day Mexico, creating colossal stone heads and developing early writing and calendar systems.',
      tags: ['Olmec', 'Mesoamerica', 'civilization'] },

    { id: 'e23', title: 'Vedas Composed', year: -1500, region: 'south-asia', importance: 4, icon: '🕉️',
      description: 'The Rigveda and other Vedic texts were composed, forming the foundation of Hindu philosophy, ritual, and Indian civilization.',
      tags: ['India', 'Vedas', 'religion', 'Hinduism'] },

    // ===== IRON AGE (1200-600 BCE) =====
    { id: 'e24', title: 'Iron Smelting Spreads', year: -1200, region: 'middle-east', importance: 4,
      description: 'Iron smelting technology spread from the Hittites throughout the Near East and Mediterranean, producing harder and more accessible tools and weapons than bronze.',
      tags: ['technology', 'iron', 'metallurgy'] },

    { id: 'e25', title: 'Phoenician Alphabet Created', year: -1050, region: 'middle-east', importance: 5, icon: '🔤',
      description: 'The Phoenicians developed the first widely-used alphabet, a phonetic system that became the ancestor of Greek, Latin, Arabic, and most modern alphabets.',
      tags: ['writing', 'Phoenicia', 'alphabet'] },

    { id: 'e26', title: 'Kingdom of Israel under David', year: -1000, region: 'middle-east', importance: 4,
      description: 'King David united the tribes of Israel and established Jerusalem as the capital. His son Solomon built the First Temple.',
      tags: ['Israel', 'David', 'Jerusalem'] },

    { id: 'e27', title: 'Homer Writes the Iliad & Odyssey', year: -750, region: 'europe', importance: 5, icon: '📜',
      description: 'Homer composed the epic poems the Iliad and the Odyssey, foundational works of Western literature that defined Greek cultural identity.',
      tags: ['Greece', 'Homer', 'literature'] },

    { id: 'e28', title: 'Founding of Rome (Traditional)', year: -753, region: 'europe', importance: 5, icon: '🐺',
      description: 'According to tradition, Romulus founded Rome on the Palatine Hill. Archaeological evidence confirms settlements in the area from around this period.',
      tags: ['Rome', 'founding', 'Italy'] },

    { id: 'e29', title: 'First Olympic Games', year: -776, region: 'europe', importance: 4, icon: '🏅',
      description: 'The first recorded Olympic Games were held at Olympia, Greece. The games were a Panhellenic festival celebrating athletic competition and honoring Zeus.',
      tags: ['Greece', 'Olympics', 'sports'] },

    { id: 'e30', title: 'Neo-Assyrian Empire at Its Height', year: -700, region: 'middle-east', importance: 4,
      description: 'The Neo-Assyrian Empire became the largest empire the world had yet seen, stretching from Egypt to Iran, known for its military prowess and the Library of Ashurbanipal.',
      tags: ['Assyria', 'empire', 'military'] },

    { id: 'e31', title: 'Kushite Pharaohs Rule Egypt', year: -747, region: 'africa', importance: 3,
      description: 'The Kingdom of Kush (Nubia) conquered Egypt, establishing the 25th Dynasty. Kushite pharaohs like Taharqa built extensively and revived Egyptian culture.',
      tags: ['Kush', 'Nubia', 'Egypt'] },

    { id: 'e32', title: 'Zhou Dynasty - Mandate of Heaven', year: -1046, region: 'east-asia', importance: 4,
      description: 'The Zhou Dynasty overthrew the Shang and introduced the concept of the Mandate of Heaven, legitimizing rule based on virtue and moral authority.',
      tags: ['China', 'Zhou', 'philosophy'] },

    // ===== CLASSICAL ANTIQUITY (600 BCE - 500 CE) =====
    { id: 'e33', title: 'Birth of Buddha (Siddhartha Gautama)', year: -563, region: 'south-asia', importance: 5, icon: '☸️',
      description: 'Siddhartha Gautama was born in Lumbini (modern Nepal). His teachings on suffering, enlightenment, and the Middle Way founded Buddhism, one of the world\'s major religions.',
      tags: ['Buddhism', 'religion', 'India'] },

    { id: 'e34', title: 'Confucius Born', year: -551, region: 'east-asia', importance: 5, icon: '🎓',
      description: 'Confucius (Kong Qiu) was born in the state of Lu. His philosophy emphasizing social harmony, filial piety, and moral governance shaped Chinese civilization for millennia.',
      tags: ['Confucius', 'philosophy', 'China'] },

    { id: 'e35', title: 'Athenian Democracy Established', year: -508, region: 'europe', importance: 5, icon: '🏛️',
      description: 'Cleisthenes reformed Athenian government, establishing demokratia — rule by the people. This became the foundation for Western democratic thought.',
      tags: ['Athens', 'democracy', 'politics'] },

    { id: 'e36', title: 'Persian Wars (Greco-Persian Wars)', year: -499, region: 'europe', importance: 5, icon: '⚔️',
      description: 'The Greeks fought off two Persian invasions, with iconic battles at Marathon (490 BCE), Thermopylae (480 BCE), and Salamis (480 BCE), preserving Greek independence.',
      tags: ['Greece', 'Persia', 'warfare', 'Marathon'] },

    { id: 'e37', title: 'Golden Age of Athens', year: -461, region: 'europe', importance: 5, icon: '🏛️',
      description: 'Under Pericles, Athens experienced its golden age: the Parthenon was built, Socrates taught philosophy, Sophocles wrote tragedies, and Herodotus pioneered history.',
      tags: ['Athens', 'Pericles', 'Parthenon', 'philosophy'] },

    { id: 'e38', title: 'Achaemenid Empire at Peak', year: -500, region: 'middle-east', importance: 4,
      description: 'Under Darius I, the Persian Achaemenid Empire became the largest empire in history up to that point, stretching from Egypt to India, with an innovative administrative system.',
      tags: ['Persia', 'Darius', 'empire'] },

    { id: 'e39', title: 'Alexander the Great\'s Conquests', year: -334, region: 'europe', importance: 5, icon: '🗡️',
      description: 'Alexander of Macedon conquered the Persian Empire, Egypt, and parts of India in just 13 years, spreading Greek culture across a vast territory and inaugurating the Hellenistic period.',
      tags: ['Alexander', 'Macedon', 'conquest', 'Hellenism'] },

    { id: 'e40', title: 'Hellenistic Period Begins', year: -323, region: 'middle-east', importance: 4,
      description: 'After Alexander\'s death, his empire split into successor kingdoms (Ptolemaic Egypt, Seleucid Empire, Antigonid Macedon), blending Greek and Eastern cultures.',
      tags: ['Hellenism', 'culture', 'successor kingdoms'] },

    { id: 'e41', title: 'Maurya Empire Founded', year: -322, region: 'south-asia', importance: 4,
      description: 'Chandragupta Maurya founded the Maurya Empire, unifying most of the Indian subcontinent. His grandson Ashoka later promoted Buddhism and non-violence.',
      tags: ['India', 'Maurya', 'Chandragupta'] },

    { id: 'e42', title: 'Emperor Ashoka Embraces Buddhism', year: -260, region: 'south-asia', importance: 5,
      description: 'After the bloody Kalinga War, Emperor Ashoka converted to Buddhism and promoted dhamma (righteousness), erecting pillars and edicts across India advocating non-violence.',
      tags: ['India', 'Ashoka', 'Buddhism', 'non-violence'] },

    { id: 'e43', title: 'Punic Wars Begin', year: -264, region: 'europe', importance: 4,
      description: 'Rome and Carthage fought three Punic Wars (264-146 BCE). Hannibal\'s crossing of the Alps in the Second Punic War remains one of history\'s greatest military feats.',
      tags: ['Rome', 'Carthage', 'Hannibal', 'warfare'] },

    { id: 'e44', title: 'Qin Shi Huang Unifies China', year: -221, region: 'east-asia', importance: 5, icon: '🏯',
      description: 'Qin Shi Huang conquered all rival states, establishing the first unified Chinese empire. He standardized writing, currency, and weights, and began the Great Wall.',
      tags: ['China', 'Qin', 'unification', 'Great Wall'] },

    { id: 'e45', title: 'Construction of the Great Wall Begins', year: -214, region: 'east-asia', importance: 4,
      description: 'Qin Shi Huang ordered the connection of existing walls into a unified defensive barrier against northern nomads, creating the precursor to the Great Wall of China.',
      tags: ['China', 'Great Wall', 'construction'] },

    { id: 'e46', title: 'Han Dynasty Begins', year: -206, region: 'east-asia', importance: 5,
      description: 'The Han Dynasty established a golden age of Chinese civilization lasting over 400 years, with advances in science, technology, and the opening of the Silk Road.',
      tags: ['China', 'Han', 'golden age'] },

    { id: 'e47', title: 'Silk Road Opens', year: -130, region: 'east-asia', importance: 5, icon: '🐪',
      description: 'Zhang Qian\'s diplomatic missions opened the Silk Road, connecting China with Central Asia, India, Persia, and eventually Rome, facilitating trade and cultural exchange.',
      tags: ['Silk Road', 'trade', 'China', 'connectivity'] },

    { id: 'e48', title: 'Julius Caesar Assassinated', year: -44, region: 'europe', importance: 5, icon: '🗡️',
      description: 'Roman dictator Julius Caesar was assassinated on the Ides of March by a group of senators, triggering civil wars that ended the Roman Republic.',
      tags: ['Rome', 'Caesar', 'politics', 'assassination'] },

    { id: 'e49', title: 'Roman Empire Under Augustus', year: -27, region: 'europe', importance: 5, icon: '🦅',
      description: 'Octavian became Augustus, the first Roman Emperor, beginning the Pax Romana — a 200-year period of relative peace and stability across the Roman Empire.',
      tags: ['Rome', 'Augustus', 'Pax Romana', 'empire'] },

    { id: 'e50', title: 'Life of Jesus Christ', year: 1, region: 'middle-east', importance: 5, icon: '✝️',
      description: 'Jesus of Nazareth was born in Roman Judea. His teachings formed the basis of Christianity, which would become the world\'s largest religion.',
      tags: ['Christianity', 'religion', 'Jesus'] },

    { id: 'e51', title: 'Destruction of the Second Temple', year: 70, region: 'middle-east', importance: 4,
      description: 'Roman forces under Titus destroyed the Second Temple in Jerusalem, a pivotal event in Jewish history that led to the Jewish diaspora.',
      tags: ['Jerusalem', 'Rome', 'Judaism'] },

    { id: 'e52', title: 'Invention of Paper in China', year: 105, region: 'east-asia', importance: 4,
      description: 'Cai Lun is credited with standardizing the papermaking process in Han China, revolutionizing writing, communication, and record-keeping.',
      tags: ['China', 'paper', 'invention', 'technology'] },

    { id: 'e53', title: 'Pax Romana - "The Good Emperors"', year: 96, region: 'europe', importance: 4,
      description: 'The era of the Five Good Emperors (Nerva through Marcus Aurelius) represented the height of Roman prosperity, territorial extent, and good governance.',
      tags: ['Rome', 'peace', 'governance'] },

    { id: 'e54', title: 'Gupta Empire Golden Age', year: 320, region: 'south-asia', importance: 4,
      description: 'The Gupta Empire presided over a golden age of Indian civilization, with breakthroughs in mathematics (including the concept of zero), astronomy, literature, and art.',
      tags: ['India', 'Gupta', 'mathematics', 'golden age'] },

    { id: 'e55', title: 'Constantine Legalizes Christianity', year: 313, region: 'europe', importance: 5, icon: '☦️',
      description: 'Emperor Constantine issued the Edict of Milan, legalizing Christianity. He later convened the Council of Nicaea (325) and founded Constantinople.',
      tags: ['Rome', 'Christianity', 'Constantine'] },

    { id: 'e56', title: 'Fall of the Western Roman Empire', year: 476, region: 'europe', importance: 5, icon: '🏚️',
      description: 'The last Western Roman Emperor, Romulus Augustulus, was deposed by the Germanic chieftain Odoacer, traditionally marking the end of the ancient world and the beginning of the Middle Ages.',
      tags: ['Rome', 'fall', 'barbarian', 'Middle Ages'] },

    // ===== MIDDLE AGES (500-1500 CE) =====
    { id: 'e57', title: 'Muhammad and the Rise of Islam', year: 610, region: 'middle-east', importance: 5, icon: '☪️',
      description: 'Prophet Muhammad received his first revelation. Islam rapidly spread across Arabia and beyond, transforming the political and religious landscape of the Middle East and beyond.',
      tags: ['Islam', 'Muhammad', 'religion'] },

    { id: 'e58', title: 'Tang Dynasty Established', year: 618, region: 'east-asia', importance: 5,
      description: 'The Tang Dynasty inaugurated a golden age of Chinese civilization, with flourishing poetry, art, technology, and cosmopolitan culture in the capital Chang\'an.',
      tags: ['China', 'Tang', 'golden age'] },

    { id: 'e59', title: 'Islamic Golden Age Begins', year: 750, region: 'middle-east', importance: 5,
      description: 'Under the Abbasid Caliphate, the Islamic world experienced a golden age of science, mathematics, medicine, philosophy, and literature centered in Baghdad.',
      tags: ['Islam', 'Abbasid', 'science', 'Baghdad'] },

    { id: 'e60', title: 'Charlemagne Crowned Emperor', year: 800, region: 'europe', importance: 5, icon: '👑',
      description: 'Pope Leo III crowned Charlemagne as Emperor, reviving the concept of a Western Roman Empire and unifying much of Western Europe under Frankish rule.',
      tags: ['Charlemagne', 'France', 'empire'] },

    { id: 'e61', title: 'Viking Age Begins', year: 793, region: 'europe', importance: 4, icon: '⚓',
      description: 'The attack on Lindisfarne monastery marked the beginning of the Viking Age. Norse explorers, traders, and warriors expanded across Europe, reaching North America.',
      tags: ['Vikings', 'Norse', 'Scandinavia'] },

    { id: 'e62', title: 'Printing Invented in China', year: 868, region: 'east-asia', importance: 4,
      description: 'The Diamond Sutra (868 CE) is the earliest known dated printed book. Woodblock printing and later movable type revolutionized Chinese culture and knowledge.',
      tags: ['China', 'printing', 'technology'] },

    { id: 'e63', title: 'Song Dynasty Renaissance', year: 960, region: 'east-asia', importance: 4,
      description: 'The Song Dynasty produced inventions like gunpowder, the compass, and movable type printing, along with advances in agriculture, economy, and philosophy.',
      tags: ['China', 'Song', 'invention'] },

    { id: 'e64', title: 'Norman Conquest of England', year: 1066, region: 'europe', importance: 4,
      description: 'William the Conqueror defeated King Harold at the Battle of Hastings, transforming English culture, language, and governance with Norman French influence.',
      tags: ['England', 'Norman', 'warfare'] },

    { id: 'e65', title: 'First Crusade', year: 1096, region: 'middle-east', importance: 5, icon: '🛡️',
      description: 'Pope Urban II called the First Crusade to recapture the Holy Land. The Crusaders captured Jerusalem in 1099, beginning two centuries of conflict between Christian and Muslim powers.',
      tags: ['Crusade', 'Jerusalem', 'Christianity', 'Islam'] },

    { id: 'e66', title: 'Angkor Wat Built', year: 1113, region: 'south-asia', importance: 4,
      description: 'King Suryavarman II of the Khmer Empire built Angkor Wat, the largest religious monument in the world, originally as a Hindu temple dedicated to Vishnu.',
      tags: ['Cambodia', 'Angkor Wat', 'architecture'] },

    { id: 'e67', title: 'Magna Carta Signed', year: 1215, region: 'europe', importance: 5, icon: '📜',
      description: 'English barons forced King John to sign the Magna Carta, establishing the principle that even the king was subject to law. A foundational document for constitutional governance.',
      tags: ['England', 'law', 'Magna Carta', 'rights'] },

    { id: 'e68', title: 'Mongol Empire Under Genghis Khan', year: 1206, region: 'east-asia', importance: 5, icon: '🏹',
      description: 'Genghis Khan united the Mongol tribes and began conquering the largest contiguous land empire in history, stretching from Korea to Eastern Europe.',
      tags: ['Mongol', 'Genghis Khan', 'empire', 'conquest'] },

    { id: 'e69', title: 'Mali Empire Under Mansa Musa', year: 1312, region: 'africa', importance: 5, icon: '👑',
      description: 'Mansa Musa became ruler of Mali. His legendary pilgrimage to Mecca in 1324, distributing gold along the way, destabilized gold prices across the Mediterranean.',
      tags: ['Mali', 'Mansa Musa', 'gold', 'Africa'] },

    { id: 'e70', title: 'Black Death Devastates Europe', year: 1347, region: 'europe', importance: 5, icon: '💀',
      description: 'The bubonic plague killed an estimated 30-60% of Europe\'s population. It transformed European society, economy, and culture, contributing to the end of feudalism.',
      tags: ['plague', 'Black Death', 'pandemic'] },

    { id: 'e71', title: 'Ming Dynasty Begins', year: 1368, region: 'east-asia', importance: 4,
      description: 'Zhu Yuanzhang overthrew the Mongol Yuan Dynasty and established the Ming Dynasty, known for the Forbidden City, the Great Wall expansion, and maritime expeditions.',
      tags: ['China', 'Ming', 'dynasty'] },

    { id: 'e72', title: 'Zheng He\'s Voyages', year: 1405, region: 'east-asia', importance: 4,
      description: 'Admiral Zheng He led seven massive naval expeditions across Southeast Asia, India, Arabia, and East Africa, displaying Chinese naval power and diplomatic reach.',
      tags: ['China', 'Ming', 'exploration', 'Zheng He'] },

    { id: 'e73', title: 'Fall of Constantinople', year: 1453, region: 'middle-east', importance: 5, icon: '🏰',
      description: 'Ottoman Sultan Mehmed II conquered Constantinople, ending the Byzantine Empire. This pivotal event shifted trade routes and helped trigger the European Age of Exploration.',
      tags: ['Byzantine', 'Ottoman', 'Constantinople'] },

    { id: 'e74', title: 'Gutenberg\'s Printing Press', year: 1440, region: 'europe', importance: 5, icon: '📰',
      description: 'Johannes Gutenberg invented the movable-type printing press, revolutionizing the production of books and enabling the rapid spread of knowledge, contributing to the Renaissance and Reformation.',
      tags: ['printing', 'Gutenberg', 'technology', 'revolution'] },

    // ===== MODERN PERIOD (1500-2025 CE) =====
    { id: 'e75', title: 'Columbus Reaches the Americas', year: 1492, region: 'americas', importance: 5, icon: '⛵',
      description: 'Christopher Columbus\'s voyage to the Caribbean began the sustained European exploration and colonization of the Americas, with profound consequences for indigenous peoples.',
      tags: ['Columbus', 'exploration', 'Americas'] },

    { id: 'e76', title: 'Renaissance in Full Bloom', year: 1500, region: 'europe', importance: 5, icon: '🎨',
      description: 'The European Renaissance reached its height, with Leonardo da Vinci, Michelangelo, and Raphael producing masterworks. Humanism, art, science, and philosophy flourished.',
      tags: ['Renaissance', 'art', 'humanism', 'Italy'] },

    { id: 'e77', title: 'Protestant Reformation', year: 1517, region: 'europe', importance: 5, icon: '✝️',
      description: 'Martin Luther posted his 95 Theses, challenging Catholic Church practices. The Reformation split Western Christianity and transformed European politics and culture.',
      tags: ['Luther', 'Reformation', 'Christianity'] },

    { id: 'e78', title: 'Mughal Empire Founded', year: 1526, region: 'south-asia', importance: 4,
      description: 'Babur founded the Mughal Empire after his victory at Panipat. The Mughals would rule most of the Indian subcontinent, producing the Taj Mahal and a rich syncretic culture.',
      tags: ['Mughal', 'India', 'Babur'] },

    { id: 'e79', title: 'Copernicus: Heliocentric Model', year: 1543, region: 'europe', importance: 5, icon: '☀️',
      description: 'Nicolaus Copernicus published his heliocentric model, placing the Sun at the center of the solar system and revolutionizing astronomy and scientific thinking.',
      tags: ['Copernicus', 'science', 'astronomy'] },

    { id: 'e80', title: 'Spanish Conquest of the Aztec Empire', year: 1521, region: 'americas', importance: 5, icon: '⚔️',
      description: 'Hernán Cortés and his allies conquered the Aztec capital Tenochtitlan, ending the Aztec Empire and establishing New Spain.',
      tags: ['Aztec', 'Spain', 'conquest', 'colonization'] },

    { id: 'e81', title: 'Galileo\'s Telescope Observations', year: 1610, region: 'europe', importance: 5, icon: '🔭',
      description: 'Galileo Galilei used an improved telescope to observe Jupiter\'s moons and Venus\'s phases, providing evidence for the heliocentric model and transforming astronomy.',
      tags: ['Galileo', 'science', 'telescope'] },

    { id: 'e82', title: 'Scientific Revolution', year: 1687, region: 'europe', importance: 5, icon: '🌌',
      description: 'Isaac Newton published Principia Mathematica, formulating the laws of motion and universal gravitation. This was the culmination of the Scientific Revolution.',
      tags: ['Newton', 'science', 'physics', 'Principia'] },

    { id: 'e83', title: 'Ottoman Empire at Its Height', year: 1520, region: 'middle-east', importance: 4,
      description: 'Under Suleiman the Magnificent, the Ottoman Empire reached its greatest territorial extent and cultural achievement, dominating Southeast Europe, Western Asia, and North Africa.',
      tags: ['Ottoman', 'Suleiman', 'empire'] },

    { id: 'e84', title: 'Taj Mahal Built', year: 1632, region: 'south-asia', importance: 4, icon: '🕌',
      description: 'Mughal Emperor Shah Jahan commissioned the Taj Mahal as a mausoleum for his wife Mumtaz Mahal. It is considered one of the finest examples of Mughal architecture.',
      tags: ['Mughal', 'Taj Mahal', 'architecture', 'India'] },

    { id: 'e85', title: 'The Enlightenment', year: 1715, region: 'europe', importance: 5, icon: '💡',
      description: 'The Age of Enlightenment championed reason, individual liberty, and scientific method. Thinkers like Voltaire, Rousseau, and Locke reshaped philosophy and governance.',
      tags: ['Enlightenment', 'philosophy', 'reason'] },

    { id: 'e86', title: 'American Revolution', year: 1776, region: 'americas', importance: 5, icon: '🇺🇸',
      description: 'The 13 American colonies declared independence from Britain, establishing the United States and creating the world\'s first modern constitutional republic.',
      tags: ['USA', 'revolution', 'independence', 'democracy'] },

    { id: 'e87', title: 'French Revolution', year: 1789, region: 'europe', importance: 5, icon: '🇲🇫',
      description: 'The French Revolution overthrew the monarchy, proclaimed liberty, equality, and fraternity, and fundamentally transformed political thought worldwide.',
      tags: ['France', 'revolution', 'liberty'] },

    { id: 'e88', title: 'Industrial Revolution', year: 1760, region: 'europe', importance: 5, icon: '🏭',
      description: 'The Industrial Revolution began in Britain with mechanized manufacturing, the steam engine, and factory systems, transforming the global economy and society.',
      tags: ['Industrial', 'technology', 'Britain', 'economy'] },

    { id: 'e89', title: 'Napoleonic Wars', year: 1803, region: 'europe', importance: 5, icon: '⚔️',
      description: 'Napoleon Bonaparte dominated European affairs through a series of wars. His conquests spread revolutionary ideals and redrew the map of Europe.',
      tags: ['Napoleon', 'France', 'warfare'] },

    { id: 'e90', title: 'Latin American Independence Movements', year: 1810, region: 'americas', importance: 4,
      description: 'Led by Simón Bolívar, José de San Martín, and others, most of Latin America gained independence from Spain and Portugal between 1810 and 1830.',
      tags: ['Latin America', 'independence', 'Bolívar'] },

    { id: 'e91', title: 'Abolition of Slavery (British Empire)', year: 1833, region: 'europe', importance: 4,
      description: 'The British Empire abolished slavery with the Slavery Abolition Act, freeing over 800,000 enslaved people across the British colonies.',
      tags: ['abolition', 'slavery', 'Britain', 'rights'] },

    { id: 'e92', title: 'Meiji Restoration in Japan', year: 1868, region: 'east-asia', importance: 5, icon: '🇯🇵',
      description: 'Japan underwent rapid modernization under Emperor Meiji, transforming from a feudal society into an industrialized world power within decades.',
      tags: ['Japan', 'Meiji', 'modernization'] },

    { id: 'e93', title: 'Scramble for Africa', year: 1884, region: 'africa', importance: 5,
      description: 'European powers partitioned Africa at the Berlin Conference, imposing colonial rule over nearly the entire continent, with devastating consequences for African peoples.',
      tags: ['Africa', 'colonialism', 'Berlin Conference'] },

    { id: 'e94', title: 'World War I', year: 1914, region: 'europe', importance: 5, icon: '💣',
      description: 'The Great War engulfed most of Europe and beyond, killing over 17 million and reshaping the political map with the collapse of the Ottoman, Austro-Hungarian, Russian, and German empires.',
      tags: ['WWI', 'warfare', 'global'] },

    { id: 'e95', title: 'Russian Revolution', year: 1917, region: 'europe', importance: 5, icon: '☠️',
      description: 'The Bolshevik Revolution overthrew the Russian Empire and established the Soviet Union under Communist rule, dividing the world into ideological blocs for decades.',
      tags: ['Russia', 'revolution', 'communism', 'Soviet'] },

    { id: 'e96', title: 'World War II', year: 1939, region: 'europe', importance: 5, icon: '🌍',
      description: 'The deadliest conflict in human history killed over 70 million people. It included the Holocaust, atomic bombings, and reshaped the global order with the emergence of the US and USSR as superpowers.',
      tags: ['WWII', 'warfare', 'Holocaust', 'global'] },

    { id: 'e97', title: 'Indian Independence', year: 1947, region: 'south-asia', importance: 5, icon: '🇮🇳',
      description: 'India gained independence from Britain after decades of nonviolent resistance led by Mahatma Gandhi. The partition created India and Pakistan, displaced millions.',
      tags: ['India', 'independence', 'Gandhi', 'partition'] },

    { id: 'e98', title: 'People\'s Republic of China Founded', year: 1949, region: 'east-asia', importance: 5, icon: '🇨🇳',
      description: 'Mao Zedong proclaimed the People\'s Republic of China after the Communist victory in the Chinese Civil War, reshaping Chinese society and geopolitics.',
      tags: ['China', 'communism', 'Mao'] },

    { id: 'e99', title: 'Moon Landing', year: 1969, region: 'americas', importance: 5, icon: '🌙',
      description: 'Apollo 11 astronauts Neil Armstrong and Buzz Aldrin became the first humans to walk on the Moon, a defining achievement of the Space Age.',
      tags: ['USA', 'space', 'Apollo', 'Moon'] },

    { id: 'e100', title: 'Fall of the Berlin Wall', year: 1989, region: 'europe', importance: 5, icon: '🧱',
      description: 'The fall of the Berlin Wall symbolized the end of the Cold War and the collapse of Communist regimes across Eastern Europe, leading to German reunification in 1990.',
      tags: ['Germany', 'Cold War', 'reunification'] },

    { id: 'e101', title: 'World Wide Web Invented', year: 1991, region: 'europe', importance: 5, icon: '🌐',
      description: 'Tim Berners-Lee created the World Wide Web at CERN, connecting people and information globally and launching the Digital Age.',
      tags: ['internet', 'technology', 'WWW', 'digital'] },

    { id: 'e102', title: 'Collapse of the Soviet Union', year: 1991, region: 'europe', importance: 5,
      description: 'The Soviet Union dissolved into 15 independent republics, ending the Cold War and leaving the United States as the sole superpower.',
      tags: ['Soviet Union', 'Cold War', 'dissolution'] },

    { id: 'e103', title: 'African Decolonization Wave', year: 1960, region: 'africa', importance: 5,
      description: 'The "Year of Africa" saw 17 African nations gain independence, as the era of European colonialism rapidly came to an end across the continent.',
      tags: ['Africa', 'independence', 'decolonization'] },

    { id: 'e104', title: 'Mahatma Gandhi\'s Salt March', year: 1930, region: 'south-asia', importance: 4,
      description: 'Gandhi led the Salt March to protest British salt taxes, becoming a symbol of nonviolent civil disobedience and inspiring freedom movements worldwide.',
      tags: ['India', 'Gandhi', 'civil disobedience'] },

    { id: 'e105', title: 'United Nations Founded', year: 1945, region: 'americas', importance: 4,
      description: 'The United Nations was established to promote international cooperation and prevent future world wars, with 51 founding member states.',
      tags: ['UN', 'international', 'peace'] },

    { id: 'e106', title: 'Civil Rights Movement (USA)', year: 1955, region: 'americas', importance: 5, icon: '✊🏾',
      description: 'The American Civil Rights Movement fought for racial equality, led by figures like Martin Luther King Jr. The Civil Rights Act of 1964 outlawed discrimination.',
      tags: ['USA', 'civil rights', 'MLK', 'equality'] },

    { id: 'e107', title: 'Darwin\'s Origin of Species', year: 1859, region: 'europe', importance: 5, icon: '🧬',
      description: 'Charles Darwin published On the Origin of Species, presenting the theory of evolution by natural selection, fundamentally changing biology and our understanding of life.',
      tags: ['Darwin', 'evolution', 'science', 'biology'] },

    { id: 'e108', title: 'Invention of Gunpowder Weapons', year: 1000, region: 'east-asia', importance: 4,
      description: 'Chinese engineers developed the first gunpowder weapons, including fire arrows, bombs, and early firearms. Gunpowder later transformed warfare globally.',
      tags: ['China', 'gunpowder', 'military', 'technology'] },

    { id: 'e109', title: 'Great Zimbabwe Flourishes', year: 1100, region: 'africa', importance: 3,
      description: 'Great Zimbabwe, a medieval city in southern Africa, flourished as a center of trade and commerce, known for its massive stone structures built without mortar.',
      tags: ['Africa', 'Zimbabwe', 'trade', 'architecture'] },

    { id: 'e110', title: 'Axial Age / Rise of World Religions', year: -500, region: 'south-asia', importance: 5,
      description: 'The Axial Age (800-200 BCE) saw the emergence of major philosophical and religious traditions: Buddhism, Jainism, Greek philosophy, Confucianism, Taoism, and Zoroastrianism.',
      tags: ['Axial Age', 'religion', 'philosophy'] },
];
