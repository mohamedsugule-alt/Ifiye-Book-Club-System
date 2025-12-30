// Initial Seed Data for Jan 1, 2026 Launch
// Initial Seed Data for Jan 1, 2026 Launch

// --- SEED MEMBERS ---
export const INITIAL_MEMBERS = [
    { id: 'M001', name: 'Mohamed Sugule', role: 'ADMIN', active: true, goal_factor: 1.0, username: 'mohamed', password: 'password' },
    { id: 'M002', name: 'Ahmed Abdi', role: 'MEMBER', active: true, goal_factor: 1.0, username: 'ahmed', password: 'member1' },
    { id: 'M003', name: 'Abdisabir Yusuf', role: 'MEMBER', active: true, goal_factor: 1.0, username: 'abdisabir', password: 'member2' },
    { id: 'M004', name: 'Abdirizak Bashe', role: 'MEMBER', active: true, goal_factor: 1.0, username: 'abdirizak', password: 'member3' },
    { id: 'M005', name: 'Mohamed Abdirahman', role: 'MEMBER', active: true, goal_factor: 1.0, username: 'm.abdirahman', password: 'member4' },
];

// --- SEED BOOKS ---
const getGoogleCover = (isbn) => `https://books.google.com/books/content?vid=ISBN${isbn}&printsec=frontcover&img=1&zoom=1`;

export const INITIAL_BOOKS = [
    {
        id: 'B26_1',
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        category: 'History & Civilization',
        pages: 498,
        coverUrl: 'https://m.media-amazon.com/images/I/713jIoMO3UL.jpg' // Keep working Amazon link
    },
    {
        id: 'B26_2',
        title: 'Destiny Disrupted: A History of the World Through Islamic Eyes',
        author: 'Tamim Ansary',
        category: 'History & Civilization',
        pages: 416,
        coverUrl: getGoogleCover('9781541706200')
    },
    {
        id: 'B26_3',
        title: 'Originals: How Non-Conformists Move the World',
        author: 'Adam Grant',
        category: 'Psychology & Thinking',
        pages: 336,
        coverUrl: getGoogleCover('9780143128854')
    },
    {
        id: 'B26_4',
        title: 'Decisive: How to Make Better Choices in Life and Work',
        author: 'Chip Heath; Dan Heath',
        category: 'Psychology & Thinking',
        pages: 336,
        coverUrl: getGoogleCover('9780307956392')
    },
    {
        id: 'B26_5',
        title: 'Statistics For Dummies',
        author: 'Deborah J. Rumsey',
        category: 'Research, Data & Analytics',
        pages: 408,
        coverUrl: getGoogleCover('9781119293521')
    },
    {
        id: 'B26_6',
        title: 'Research Design: Qualitative, Quantitative, and Mixed Methods Approaches',
        author: 'John W. Creswell; J. David Creswell',
        category: 'Research, Data & Analytics',
        pages: 304,
        coverUrl: getGoogleCover('9781071817940')
    },
    {
        id: 'B26_7',
        title: 'Writing for Academic Success',
        author: 'Gail Craswell',
        category: 'Research, Writing & Academia',
        pages: 264,
        coverUrl: getGoogleCover('9780857029287')
    },
    {
        id: 'B26_8',
        title: 'Entrepreneurship: Theory, Process, and Practice',
        author: 'Donald F. Kuratko',
        category: 'Entrepreneurship & Business',
        pages: 832,
        coverUrl: getGoogleCover('9780357899502')
    },
    {
        id: 'B26_9',
        title: 'Operations Management (10th ed.)',
        author: 'Nigel Slack; Alistair Brandon-Jones; Robert Johnston',
        category: 'Strategy, PM & Operations',
        pages: 768,
        coverUrl: getGoogleCover('9781292408248')
    },
    {
        id: 'B26_10',
        title: 'PMBOK® Guide (7th Edition)',
        author: 'Project Management Institute',
        category: 'Strategy, PM & Operations',
        pages: 372,
        coverUrl: getGoogleCover('9781628256642')
    },
    {
        id: 'B26_11',
        title: 'Artificial Intelligence: A Modern Approach',
        author: 'Stuart Russell; Peter Norvig',
        category: 'Technology & AI',
        pages: 1132,
        coverUrl: getGoogleCover('9780134610993')
    },
    {
        id: 'B26_12',
        title: 'My Daughters (Parenting in Islam)',
        author: 'Salman Al-Oadah',
        category: 'Faith & Spirituality',
        pages: 222,
        coverUrl: 'https://placehold.co/400x600/2ecc71/ffffff?text=My+Daughters' // Safe placeholder
    },
];

// --- ARCHIVE BOOKS (2022-2025) ---
export const ARCHIVE_BOOKS = [
    { id: 'B22_1', title: 'Atomic Habits', author: 'James Clear', category: 'Mindset', pages: 320, coverUrl: 'https://m.media-amazon.com/images/I/81wgcld4wxL.jpg' },
    { id: 'B22_2', title: 'Deep Work', author: 'Cal Newport', category: 'Mindset', pages: 304, coverUrl: 'https://m.media-amazon.com/images/I/7185IPG1xCL.jpg' },
    { id: 'B23_1', title: 'The Lean Startup', author: 'Eric Ries', category: 'Business', pages: 336, coverUrl: 'https://m.media-amazon.com/images/I/81-QB7nDh4L.jpg' },
    { id: 'B23_2', title: 'Zero to One', author: 'Peter Thiel', category: 'Business', pages: 224, coverUrl: 'https://m.media-amazon.com/images/I/71uAI28kJuL.jpg' },
    { id: 'B24_1', title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', category: 'Psychology', pages: 499, coverUrl: 'https://m.media-amazon.com/images/I/61fdrEuPJwL.jpg' },
    { id: 'B24_2', title: 'Start with Why', author: 'Simon Sinek', category: 'Leadership', pages: 256, coverUrl: 'https://m.media-amazon.com/images/I/71CKa-re9CL.jpg' },
    { id: 'B25_1', title: 'The Psychology of Money', author: 'Morgan Housel', category: 'Finance', pages: 256, coverUrl: 'https://m.media-amazon.com/images/I/715kYk-43qL.jpg' },
    { id: 'B25_2', title: 'Show Your Work!', author: 'Austin Kleon', category: 'Creativity', pages: 144, coverUrl: 'https://m.media-amazon.com/images/I/715h0w-61xL.jpg' }
];

// --- SEED SESSIONS (2026 Plan) ---
export const INITIAL_SESSIONS = [
    { id: 'S26_1', bookId: 'B26_1', startDate: '2026-01-01', endDate: '2026-01-31' },
    { id: 'S26_2', bookId: 'B26_2', startDate: '2026-02-01', endDate: '2026-02-28' },
    { id: 'S26_3', bookId: 'B26_3', startDate: '2026-03-01', endDate: '2026-03-14' },
    { id: 'S26_4', bookId: 'B26_4', startDate: '2026-03-15', endDate: '2026-03-28' },
    { id: 'S26_5', bookId: 'B26_5', startDate: '2026-03-29', endDate: '2026-04-11' },
    { id: 'S26_6', bookId: 'B26_6', startDate: '2026-04-12', endDate: '2026-04-25' },
    { id: 'S26_7', bookId: 'B26_7', startDate: '2026-04-26', endDate: '2026-05-09' },
    { id: 'S26_8', bookId: 'B26_8', startDate: '2026-05-10', endDate: '2026-06-09' },
    { id: 'S26_9', bookId: 'B26_9', startDate: '2026-06-10', endDate: '2026-07-09' },
    { id: 'S26_10', bookId: 'B26_10', startDate: '2026-07-10', endDate: '2026-07-23' },
    { id: 'S26_11', bookId: 'B26_11', startDate: '2026-07-24', endDate: '2026-08-23' },
    { id: 'S26_12', bookId: 'B26_12', startDate: '2026-08-24', endDate: '2026-09-06' },
];

export const DEFAULT_SETTINGS = {
    compliance_min: 0.75,
    weights: {
        completion: 0.55,
        consistency: 0.30,
        peer: 0.15
    },
    peer_min_ratings: 3,
    categories: ['Context', 'Mindset', 'Toolkit', 'Business', 'Tech', 'Application', 'History & Civilization', 'Psychology & Thinking', 'Research, Data & Analytics', 'Research, Writing & Academia', 'Entrepreneurship & Business', 'Strategy, PM & Operations', 'Technology & AI', 'Faith & Spirituality']
};
