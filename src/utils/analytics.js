import { calculateMemberMetrics } from './engine';
import { differenceInCalendarDays, parseISO, isBefore, isSameDay, startOfDay, format, addDays } from 'date-fns';

export const calculateDynamicDailyTarget = (member, session, book, logs) => {
    if (!member || !session || !book) return 0;

    const metrics = calculateMemberMetrics(member, session, book, logs, []);
    const totalRead = metrics ? metrics.pagesRead : 0;
    const remainingPages = Math.max(0, book.pages - totalRead);

    const today = startOfDay(new Date());
    const endDate = parseISO(session.endDate);

    // If today is after endDate, target is 0 (or all of it if strictly overdue, but let's say 0 for "future" target)
    if (isBefore(endDate, today)) return 0;

    const remainingDays = differenceInCalendarDays(endDate, today) + 1; // +1 to include today

    if (remainingDays <= 0) return remainingPages; // Should be done today!

    return Math.ceil(remainingPages / remainingDays);
};

export const getConsistencyHistory = (member, session, logs) => {
    if (!session || !member) return [];

    // Filter logs for this specific session/member tuple first
    const sessionLogs = logs.filter(l =>
        l.memberId === member.id &&
        l.sessionId === session.id
    );

    // Create a Set of "Hit" dates for O(1) lookup and avoiding repeated filters
    const hitDates = new Set(sessionLogs.map(l => l.date));

    // Determine constraints
    let startDate = parseISO(session.startDate);
    const endDate = parseISO(session.endDate);
    const today = startOfDay(new Date());

    // Expand start date if logs indicate early activity
    if (sessionLogs.length > 0) {
        // Find earliest log date string
        // Note: l.date is 'yyyy-MM-dd' string, so string comparison works
        const earliestLogDateStr = sessionLogs.reduce((min, l) => l.date < min ? l.date : min, session.startDate);
        const earliestDate = parseISO(earliestLogDateStr);
        if (isBefore(earliestDate, startDate)) {
            startDate = earliestDate;
        }
    }

    // Determine Loop Limit
    // Cutoff is the LATER of "Today" or "End Date" (to show full history if completed), 
    // BUT typically consistency is shown up to "Now" for ongoing.
    // Let's cap at Today if session is ongoing, or EndDate if session is past.
    const cutoff = isBefore(endDate, today) ? endDate : today;

    // Safety check
    if (isBefore(cutoff, startDate)) return [];

    const history = [];
    const totalDays = differenceInCalendarDays(cutoff, startDate) + 1;

    // Iteration using addDays (safer than mutable setDate)
    for (let i = 0; i < totalDays; i++) {
        // Generate date for this index
        const d = addDays(startDate, i); // Use addDays from date-fns

        // Format to string
        const dateStr = format(d, 'yyyy-MM-dd');

        // Check Status
        let status = 'MISS';
        if (hitDates.has(dateStr)) {
            // Find specific log for page count details
            const log = sessionLogs.find(l => l.date === dateStr);
            if (log && log.pagesRead > 0) status = 'HIT';
            else if (log && log.isMissed) status = 'MISS'; // Explicit miss
            else if (log) status = 'HIT'; // Default hit if log exists
        } else {
            // If no log exists
            if (isSameDay(d, today)) status = 'PENDING';
        }

        history.push({
            date: dateStr,
            pagesRead: hitDates.has(dateStr) ? (sessionLogs.find(l => l.date === dateStr)?.pagesRead || 0) : 0,
            status
        });
    }

    return history;
};


export const calculateAggregateStats = (member, sessions, books, logs, allReviews) => {
    let totalPages = 0;
    let sumScore = 0;
    let sessionsCount = 0;
    let sumPeerRaw = 0;

    sessions.forEach(session => {
        const book = books.find(b => b.id === session.bookId);
        if (!book) return;

        // We check if the member has ANY logs or reviews for this session to count it as "participated"
        // Or simpler: We calculate metrics for ALL sessions passed in.
        // Assuming 'sessions' here means "All Historical Sessions".

        const metrics = calculateMemberMetrics(member, session, book, logs, allReviews);
        if (metrics) {
            totalPages += metrics.pagesRead;
            // Only count towards average if they participated (read > 0 pages)? 
            // Or count zeroes to punish non-participation? 
            // "Best Performer" implies active participation. Let's count if pagesRead > 0 OR they have reviews.
            if (metrics.pagesRead > 0 || metrics.peerScoreRaw !== 4.0) { // 4.0 is default
                sumScore += metrics.score;
                sumPeerRaw += metrics.peerScoreRaw;
                sessionsCount++;
            }
        }
    });

    return {
        memberId: member.id,
        name: member.name,
        role: member.role,
        active: member.active,
        totalPages,
        avgScore: sessionsCount > 0 ? (sumScore / sessionsCount).toFixed(1) : 0,
        totalScore: Math.round(sumScore * 10) / 10,
        avgPeerRating: sessionsCount > 0 ? (sumPeerRaw / sessionsCount).toFixed(1) : 0,
        sessionsCount
    };
};
