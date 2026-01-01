import * as XLSX from 'xlsx';

// --- TEMPLATE GENERATION ---
export const generateTemplate = () => {
    const wb = XLSX.utils.book_new();

    // 1. Logs Sheet
    const logsHeaders = [
        ['Member ID', 'Date (YYYY-MM-DD)', 'Book ID', 'Session ID', 'Pages Read', 'Minutes Read', 'Notes', 'Is Missed (TRUE/FALSE)']
    ];
    const logsSheet = XLSX.utils.aoa_to_sheet(logsHeaders);
    XLSX.utils.book_append_sheet(wb, logsSheet, 'Logs');

    // 2. Academy Sheet
    const academyHeaders = [
        ['Member ID', 'Course ID', 'Status (STARTED/COMPLETED)', 'Progress (%)', 'Completion Date (YYYY-MM-DD)']
    ];
    const academySheet = XLSX.utils.aoa_to_sheet(academyHeaders);
    XLSX.utils.book_append_sheet(wb, academySheet, 'Academy');

    // 3. Topics Sheet (Discussion)
    const topicsHeaders = [
        ['Member ID', 'Topic/Prompt', 'Session ID']
    ];
    const topicsSheet = XLSX.utils.aoa_to_sheet(topicsHeaders);
    XLSX.utils.book_append_sheet(wb, topicsSheet, 'Topics');

    // 4. Peer Reviews Sheet
    const reviewHeaders = [
        ['Reviewer ID', 'Reviewee ID', 'Growth Mindset (1-5)', 'Preparation (1-5)', 'Participation (1-5)', 'Consistency (1-5)', 'Comments']
    ];
    const reviewSheet = XLSX.utils.aoa_to_sheet(reviewHeaders);
    XLSX.utils.book_append_sheet(wb, reviewSheet, 'Peer Reviews');

    // 5. Sessions Sheet (Admin Only)
    const sessionHeaders = [
        ['Session ID', 'Book ID', 'Start Date (YYYY-MM-DD)', 'End Date (YYYY-MM-DD)']
    ];
    const sessionSheet = XLSX.utils.aoa_to_sheet(sessionHeaders);
    XLSX.utils.book_append_sheet(wb, sessionSheet, 'Sessions');

    // Download
    XLSX.writeFile(wb, 'Ifiye_BookClub_Template.xlsx');
};

// --- DATA PARSING ---
export const parseExcel = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                const result = {
                    logs: [],
                    academy: [],
                    topics: [],
                    peerReviews: [],
                    sessions: []
                };

                // Helper to get sheet data safely
                const getSheetData = (sheetName) => {
                    const sheet = workbook.Sheets[sheetName];
                    if (!sheet) return [];
                    return XLSX.utils.sheet_to_json(sheet);
                };

                // 1. Parse Logs
                const rawLogs = getSheetData('Logs');
                result.logs = rawLogs.map(row => ({
                    memberId: row['Member ID'],
                    date: row['Date (YYYY-MM-DD)'],
                    bookId: row['Book ID'],
                    sessionId: row['Session ID'],
                    pagesRead: parseInt(row['Pages Read'] || 0),
                    minutesRead: parseInt(row['Minutes Read'] || 0),
                    notes: row['Notes'],
                    isMissed: String(row['Is Missed (TRUE/FALSE)']).toUpperCase() === 'TRUE'
                }));

                // 2. Parse Academy
                const rawAcademy = getSheetData('Academy');
                result.academy = rawAcademy.map(row => ({
                    memberId: row['Member ID'],
                    courseId: row['Course ID'],
                    status: row['Status (STARTED/COMPLETED)'],
                    progress: parseInt(row['Progress (%)'] || 0),
                    date: row['Completion Date (YYYY-MM-DD)']
                }));

                // 3. Parse Topics
                const rawTopics = getSheetData('Topics');
                result.topics = rawTopics.map(row => ({
                    memberId: row['Member ID'],
                    topic: row['Topic/Prompt'],
                    sessionId: row['Session ID']
                }));

                // 4. Parse Peer Reviews
                const rawReviews = getSheetData('Peer Reviews');
                result.peerReviews = rawReviews.map(row => ({
                    reviewerId: row['Reviewer ID'],
                    revieweeId: row['Reviewee ID'],
                    growth: parseInt(row['Growth Mindset (1-5)'] || 0),
                    preparation: parseInt(row['Preparation (1-5)'] || 0),
                    participation: parseInt(row['Participation (1-5)'] || 0),
                    consistency: parseInt(row['Consistency (1-5)'] || 0),
                    comments: row['Comments']
                }));

                // 5. Parse Sessions
                const rawSessions = getSheetData('Sessions');
                result.sessions = rawSessions.map(row => ({
                    id: row['Session ID'],
                    bookId: row['Book ID'],
                    startDate: row['Start Date (YYYY-MM-DD)'],
                    endDate: row['End Date (YYYY-MM-DD)']
                }));

                resolve(result);

            } catch (err) {
                console.error("Excel Parse Error:", err);
                reject(err);
            }
        };

        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
};
