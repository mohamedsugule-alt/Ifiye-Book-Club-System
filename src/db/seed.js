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
    { id: 'B22_1', title: "The 7 Habits of Highly Effective People", author: "Stephen R. Covey", category: 'Mindset', year: '2022', pages: 381, coverUrl: getGoogleCover('9781982137274') },
    { id: 'B22_2', title: "Kaizen", author: "Sarah Harvey", category: 'Mindset', year: '2022', pages: 272, coverUrl: getGoogleCover('9781524867188') },
    { id: 'B22_3', title: "The 21 Irrefutable Laws of Leadership", author: "John C. Maxwell", category: 'Leadership', year: '2022', pages: 336, coverUrl: getGoogleCover('9781400236169') },
    { id: 'B22_4', title: "The $100 Startup", author: "Chris Guillebeau", category: 'Business', year: '2022', pages: 304, coverUrl: getGoogleCover('9780307951526') },
    { id: 'B23_1', title: "The Greatest Secret", author: "Rhonda Byrne", category: 'Mindset', year: '2023', pages: 288, coverUrl: getGoogleCover('9780063078482') },
    { id: 'B23_2', title: "The ONE Thing", author: "Gary Keller and Jay Papasan", category: 'Productivity', year: '2023', pages: 240, coverUrl: getGoogleCover('9781885167774') },
    { id: 'B23_3', title: "Unlimited Memory", author: "Kevin Horsley", category: 'Mindset', year: '2023', pages: 126, coverUrl: getGoogleCover('9781631619984') },
    { id: 'B23_4', title: "Limitless", author: "Jim Kwik", category: 'Mindset', year: '2023', pages: 343, coverUrl: getGoogleCover('9781401956615') },
    { id: 'B23_5', title: "The Compound Effect", author: "Darren Hardy", category: 'Mindset', year: '2023', pages: 208, coverUrl: getGoogleCover('9781593157241') },
    { id: 'B23_6', title: "Getting Things Done", author: "David Allen", category: 'Productivity', year: '2023', pages: 352, coverUrl: getGoogleCover('9780143126560') },
    { id: 'B23_7', title: "How to Win Friends and Influence People", author: "Dale Carnegie", category: 'Social', year: '2023', pages: 288, coverUrl: getGoogleCover('9781439167342') },
    { id: 'B23_8', title: "The Leadership Challenge", author: "James Kouzes and Barry Posner", category: 'Leadership', year: '2023', pages: 416, coverUrl: getGoogleCover('9781119278962') },
    { id: 'B23_9', title: "Leaders Eat Last", author: "Simon Sinek", category: 'Leadership', year: '2023', pages: 368, coverUrl: getGoogleCover('9781591845327') },
    { id: 'B23_10', title: "Emotional Intelligence", author: "Daniel Goleman", category: 'Psychology', year: '2023', pages: 384, coverUrl: getGoogleCover('9780553804911') },
    { id: 'B23_11', title: "Leadership: Theory and Practice", author: "Peter G. Northouse", category: 'Leadership', year: '2023', pages: 528, coverUrl: getGoogleCover('9781506362311') },
    { id: 'B23_12', title: "Wooden on Leadership", author: "John Wooden", category: 'Leadership', year: '2023', pages: 320, coverUrl: getGoogleCover('9780071453394') },
    { id: 'B23_13', title: "Rich Dad Poor Dad", author: "Robert T. Kiyosaki", category: 'Finance', year: '2023', pages: 336, coverUrl: getGoogleCover('9781612680194') },
    { id: 'B23_14', title: "Accounting for Non-Accountants", author: "Mike Piper", category: 'Finance', year: '2023', pages: 150, coverUrl: getGoogleCover('9780981454221') },
    { id: 'B23_15', title: "Financial Intelligence", author: "Karen Berman, Joe Knight", category: 'Finance', year: '2023', pages: 304, coverUrl: getGoogleCover('9781422144114') },
    { id: 'B23_16', title: "Think and Grow Rich", author: "Napoleon Hill", category: 'Mindset', year: '2023', pages: 238, coverUrl: getGoogleCover('9781585424337') },
    { id: 'B23_17', title: "The Millionaire Fastlane", author: "M. J. DeMarco", category: 'Finance', year: '2023', pages: 336, coverUrl: getGoogleCover('9780984358106') },
    { id: 'B23_18', title: "Financial Freedom", author: "Grant Sabatier", category: 'Finance', year: '2023', pages: 384, coverUrl: getGoogleCover('9781101981382') },
    { id: 'B23_19', title: "The Psychology of Selling", author: "Brian Tracy", category: 'Business', year: '2023', pages: 240, coverUrl: getGoogleCover('9781418579432') },
    { id: 'B23_20', title: "The Ultimate Sales Machine", author: "Chet Holmes", category: 'Business', year: '2023', pages: 304, coverUrl: getGoogleCover('9782806229793') },
    { id: 'B23_21', title: "Building a StoryBrand", author: "Donald Miller", category: 'Marketing', year: '2023', pages: 240, coverUrl: getGoogleCover('9780718033323') },
    { id: 'B23_22', title: "The Challenger Sale", author: "Matthew Dixon", category: 'Sales', year: '2023', pages: 256, coverUrl: getGoogleCover('9781591844358') },
    { id: 'B23_23', title: "Made to Stick", author: "Chip Heath", category: 'Marketing', year: '2023', pages: 336, coverUrl: getGoogleCover('9780812982008') },
    { id: 'B23_24', title: "Marketing Management", author: "Paul Baines", category: 'Marketing', year: '2023', pages: 760, coverUrl: getGoogleCover('9780199579617') },
    { id: 'B24_1', title: "The Subtle Art of Not Giving a F*ck", author: "Mark Manson", category: 'Mindset', year: '2024', pages: 224, coverUrl: getGoogleCover('9780063228252') },
    { id: 'B24_2', title: "AI Superpowers", author: "Kai-Fu Lee", category: 'Tech', year: '2024', pages: 272, coverUrl: getGoogleCover('9781328546395') },
    { id: 'B24_3', title: "The Five Dysfunctions of a Team", author: "Patrick Lencioni", category: 'Leadership', year: '2024', pages: 229, coverUrl: getGoogleCover('9780787960759') },
    { id: 'B24_4', title: "Dare to Lead", author: "Brené Brown", category: 'Leadership', year: '2024', pages: 320, coverUrl: getGoogleCover('9781473562523') },
    { id: 'B24_5', title: "Project Management for the Unofficial Project Manager", author: "Kory Kogon", category: 'Management', year: '2024', pages: 272, coverUrl: getGoogleCover('9781941631119') },
    { id: 'B24_6', title: "Critique of Pure Reason", author: "Immanuel Kant", category: 'Philosophy', year: '2024', pages: 880, coverUrl: getGoogleCover('9780521657297') },
    { id: 'B24_7', title: "Influence: The Psychology of Persuasion", author: "Robert B. Cialdini", category: 'Psychology', year: '2024', pages: 592, coverUrl: getGoogleCover('9780062937650') },
    { id: 'B24_8', title: "Think Again", author: "Adam Grant", category: 'Mindset', year: '2024', pages: 320, coverUrl: getGoogleCover('9780753553893') },
    { id: 'B24_9', title: "The Hard Thing About Hard Things", author: "Ben Horowitz", category: 'Business', year: '2024', pages: 304, coverUrl: 'https://books.google.com/books/content?id=j9ucCwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api' },
    { id: 'B24_10', title: "The Startup Owner’s Manual", author: "Steve Blank", category: 'Business', year: '2024', pages: 608, coverUrl: getGoogleCover('9781119690689') },
    { id: 'B24_11', title: "Life 3.0", author: "Max Tegmark", category: 'Tech', year: '2024', pages: 384, coverUrl: 'https://books.google.com/books/content?id=I6PEEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api' },
    { id: 'B24_12', title: "Disrupt You!", author: "Jay Samit", category: 'Business', year: '2024', pages: 288, coverUrl: getGoogleCover('9781250059390') },
    { id: 'B24_13', title: "Homo Deus", author: "Yuval Noah Harari", category: 'History', year: '2024', pages: 448, coverUrl: 'https://books.google.com/books/content?id=XgksEQAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api' },
    { id: 'B24_14', title: "The Inevitable", author: "Kevin Kelly", category: 'Tech', year: '2024', pages: 336, coverUrl: getGoogleCover('9780698183650') },
    { id: 'B24_15', title: "Good to Great", author: "Jim Collins", category: 'Business', year: '2024', pages: 320, coverUrl: getGoogleCover('9781944195465') },
    { id: 'B24_16', title: "Neuromarketing", author: "Christophe Morin", category: 'Marketing', year: '2024', pages: 250, coverUrl: getGoogleCover('OCLC:1176445556') },
    { id: 'B24_17', title: "Blue Ocean Strategy", author: "W. Chan Kim", category: 'Business', year: '2024', pages: 320, coverUrl: getGoogleCover('9781633692756') },
    { id: 'B24_18', title: "Talk Like TED", author: "Carmine Gallo", category: 'Communication', year: '2024', pages: 288, coverUrl: getGoogleCover('9781447261261') },
    { id: 'B25_1', title: "The Art of Public Speaking", author: "Dale Carnegie", category: 'Communication', year: '2025', pages: 384, coverUrl: getGoogleCover('9781602060517') },
    { id: 'B25_2', title: "The Ideal Muslim", author: "Muhammad Ali al-Hashimi", category: 'Faith', year: '2025', pages: 544, coverUrl: getGoogleCover('9781643540016') },
    { id: 'B25_3', title: "Purification of the Heart", author: "Hamza Yusuf", category: 'Faith', year: '2025', pages: 208, coverUrl: getGoogleCover('9780985565909') },
    { id: 'B25_4', title: "Emotional Intelligence 2.0", author: "Travis Bradberry", category: 'Psychology', year: '2025', pages: 280, coverUrl: getGoogleCover('9780974320625') },
    { id: 'B25_5', title: "Mindset", author: "Carol S. Dweck", category: 'Mindset', year: '2025', pages: 320, coverUrl: getGoogleCover('9781400062751') },
    { id: 'B25_6', title: "What Every BODY Is Saying", author: "Joe Navarro", category: 'Communication', year: '2025', pages: 272, coverUrl: getGoogleCover('9780061755668') },
    { id: 'B25_7', title: "Critical Thinking", author: "Alec Fisher", category: 'Thinking', year: '2025', pages: 316, coverUrl: getGoogleCover('9781107401983') },
    { id: 'B25_8', title: "Multipliers", author: "Liz Wiseman", category: 'Leadership', year: '2025', pages: 320, coverUrl: getGoogleCover('9780061999482') },
    { id: 'B25_9', title: "The Art of War", author: "Sun Tzu", category: 'Strategy', year: '2025', pages: 273, coverUrl: getGoogleCover('9780834845756') },
    { id: 'B25_10', title: "Drive", author: "Daniel H. Pink", category: 'Psychology', year: '2025', pages: 272, coverUrl: getGoogleCover('9781594484803') },
    { id: 'B25_11', title: "Purple Cow", author: "Seth Godin", category: 'Marketing', year: '2025', pages: 224, coverUrl: getGoogleCover('9781101184554') },
    { id: 'B25_12', title: "Leading Change", author: "John P. Kotter", category: 'Leadership', year: '2025', pages: 196, coverUrl: getGoogleCover('9781422186435') },
    { id: 'B25_13', title: "Traction", author: "Gino Wickman", category: 'Business', year: '2025', pages: 365, coverUrl: getGoogleCover('9781936661848') },
    { id: 'B25_14', title: "Rework", author: "Jason Fried", category: 'Business', year: '2025', pages: 279, coverUrl: getGoogleCover('9780307463746') },
    { id: 'B25_15', title: "The E-Myth Revisited", author: "Michael E. Gerber", category: 'Business', year: '2025', pages: 268, coverUrl: getGoogleCover('9780061741654') },
    { id: 'B25_16', title: "The Personal MBA", author: "Josh Kaufman", category: 'Business', year: '2025', pages: 496, coverUrl: getGoogleCover('9780141971094') },
    { id: 'B25_17', title: "Scaling Up", author: "Verne Harnish", category: 'Business', year: '2025', pages: 278, coverUrl: getGoogleCover('9780986019593') },
    { id: 'B25_18', title: "Business Model Generation", author: "Alexander Osterwalder", category: 'Business', year: '2025', pages: 288, coverUrl: getGoogleCover('9782839905800') },
    { id: 'B25_19', title: "The Total Money Makeover", author: "Dave Ramsey", category: 'Finance', year: '2025', pages: 288, coverUrl: getGoogleCover('9781595550781') },
    { id: 'B25_20', title: "Baby Steps Millionaires", author: "Dave Ramsey", category: 'Finance', year: '2025', pages: 256, coverUrl: getGoogleCover('9781942121602') },
    { id: 'B25_21', title: "The Millionaire Next Door", author: "Thomas J. Stanley", category: 'Finance', year: '2025', pages: 258, coverUrl: getGoogleCover('9780671015206') },
    { id: 'B25_22', title: "Money: Master the Game", author: "Tony Robbins", category: 'Finance', year: '2025', pages: 688, coverUrl: getGoogleCover('9781476757865') },
    { id: 'B25_23', title: "Your Money or Your Life", author: "Vicki Robin", category: 'Finance', year: '2025', pages: 368, coverUrl: getGoogleCover('9781101539705') }
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
