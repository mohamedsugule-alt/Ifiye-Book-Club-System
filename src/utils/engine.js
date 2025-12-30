import { parseISO, differenceInCalendarDays, isAfter, isBefore, startOfDay, isWithinInterval } from 'date-fns';

// --- CONSTANTS ---
const WEIGHTS = {
    COMPLETION: 0.55,
    CONSISTENCY: 0.30,
    PEER: 0.15
};

const COMPLIANCE_MIN = 0.75;

// --- HELPERS ---

export const getSessionDuration = (session) => {
    return differenceInCalendarDays(parseISO(session.endDate), parseISO(session.startDate)) + 1;
};

export const getElapsedDays = (session) => {
    const start = parseISO(session.startDate);
    const now = startOfDay(new Date());
    const sessionLength = getSessionDuration(session);

    // If session hasn't started
    if (isBefore(now, start)) return 0;

    const diff = differenceInCalendarDays(now, start) + 1;
    return Math.min(diff, sessionLength); // Clamp to max duration
};

export const getActiveSession = (sessions) => {
    const now = startOfDay(new Date());
    return sessions.find(s =>
        isWithinInterval(now, { start: parseISO(s.startDate), end: parseISO(s.endDate) })
    ) || sessions.find(s => isAfter(parseISO(s.startDate), now)) || sessions[sessions.length - 1];
    // Logic: Current -> OR Next Upcoming -> OR Last (if all done)
};

// --- CORE CALCULATOR ---

export const calculateMemberMetrics = (member, session, book, logs = [], peerReviews = [], courses = []) => {
    if (!member || !session || !book) return null; // Added member check

    const logsForSession = logs.filter(l =>
        l.memberId === member.id && l.sessionId === session.id
    );

    // 1. Pages Logic
    const pagesRead = logsForSession.reduce((acc, log) => acc + (log.pagesRead || log.pages || 0), 0);
    const completionPct = Math.min(100, (pagesRead / book.pages) * 100);
    const goalPages = book.pages * member.goal_factor; // Could be > book pages if factor > 1? Assuming 1.0 means 100%

    // 2. Pace Logic
    const duration = getSessionDuration(session);
    const elapsed = getElapsedDays(session);

    const expectedPace = goalPages / duration; // Pages/Day required
    const expectedTotalToDate = expectedPace * elapsed;

    // Status
    // If Today > EndDate, we check final compliance
    const isFinished = elapsed >= duration;
    let status = 'ON_TRACK';

    if (isFinished) {
        status = (completionPct / 100) >= COMPLIANCE_MIN ? 'COMPLETED' : 'RED_ZONE';
    } else {
        // During sprint
        if (pagesRead < expectedTotalToDate) {
            // Allow small buffer? No, high stakes.
            status = 'BEHIND';
            // Critical Check
            const remainingDays = duration - elapsed;
            const pagesRem = goalPages - pagesRead;
            if (remainingDays > 0) {
                const requiredPaceNow = pagesRem / remainingDays;
                if (requiredPaceNow > (expectedPace * 2)) status = 'RED_ZONE'; // Implicit "Impossible catchup" logic
            }
        }
    }

    // 3. Consistency Logic
    // Count unique days logged vs elapsed days
    const uniqueLogDays = new Set(logsForSession.map(l => l.date)).size;
    const consistencyPct = elapsed === 0 ? 100 : Math.min(100, (uniqueLogDays / elapsed) * 100);

    // 4. Peer Review Score (0-5 normalized to %)
    // Filter reviews WHERE ratee == member.id
    const reviewsReceived = peerReviews.filter(r => r.rateeId === member.id && r.sessionId === session.id);

    let peerScoreRaw = 0; // 0-5 scale
    if (reviewsReceived.length >= 3) { // Min 3 ratings to count
        const totalScore = reviewsReceived.reduce((acc, r) => acc + ((r.prep + r.contrib) / 2), 0);
        peerScoreRaw = totalScore / reviewsReceived.length;
    } else {
        peerScoreRaw = 5; // Default to full points if no data yet? Or neutral? 
        // Requirement says: "Only use/display peer_avg if count >= peer_min_ratings".
        // For Composite Score, we need a value. Let's assume neutral (3) or max (5) until proven otherwise?
        // "High Stakes" usually implies innocent until proven guilty, OR 0 until earned.
        // Let's go with 0.15 of score acts as a bonus. If no ratings, maybe re-weight?
        // For simplicity: Default to 0.0 if not rated yet.
        peerScoreRaw = 0.0;
    }

    const peerPct = (peerScoreRaw / 5) * 100;

    // 5. Course Bonus
    const memberCourses = courses.filter(c => c.memberId === member.id && c.status === 'COMPLETED');
    const courseBonus = memberCourses.length * 5; // 5 Points per course

    // 6. Composite Score
    // 6. Composite Score
    const baseScore =
        (WEIGHTS.COMPLETION * completionPct) +
        (WEIGHTS.CONSISTENCY * consistencyPct) +
        (WEIGHTS.PEER * peerPct);

    let score = baseScore + courseBonus;

    // CRITICAL FIX: If no progress, score must be 0
    if (pagesRead === 0 && courses.length === 0) {
        score = 0;
        status = 'NOT_STARTED';
        // Force peer/consistency display to match reality
        // consistencyPct = 0; // We keep calculations for display, but score is 0
    }

    return {
        pagesRead,
        totalPages: book.pages,
        completionPct,
        consistencyPct,
        peerScoreRaw,
        score: Math.round(score * 10) / 10, // 1 decimal
        status,
        expectedTotalToDate,
        daysRemaining: Math.max(0, duration - elapsed),
        rank: 0 // to be filled later
    };
};

export const calculateAchievements = (member, logs, history) => {
    const badges = [];

    // 1. SCHOLAR: Books Read
    if (history.length >= 5) {
        badges.push({ id: 'scholar', label: 'Scholar', description: 'Read 5+ Books', icon: 'graduation-cap', variant: 'warning' });
    }
    if (history.length >= 10) {
        badges.push({ id: 'sage', label: 'Sage', description: 'Read 10+ Books', icon: 'scroll', variant: 'warning' });
    }

    // 2. SCRIBE: Total Logs
    const memberLogs = logs.filter(l => l.memberId === member.id);
    if (memberLogs.length >= 10) {
        badges.push({ id: 'scribe', label: 'Scribe', description: 'Logged 10+ times', icon: 'pen-tool', variant: 'secondary' });
    }
    if (memberLogs.length >= 50) {
        badges.push({ id: 'chronicler', label: 'Chronicler', description: 'Logged 50+ times', icon: 'book', variant: 'secondary' });
    }

    // 3. EARLY BIRD: Finished early (needs session data, estimated from history)
    // We'll check if any history item has a high score/completion and maybe a flag if we stored finish date.
    // For now, let's just say if they have > 3 "COMPLETED" books.
    const completedBooks = history.filter(h => h.status === 'COMPLETED').length;
    if (completedBooks >= 1) {
        badges.push({ id: 'finisher', label: 'Finisher', description: 'Completed a book', icon: 'check-circle', variant: 'success' });
    }
    if (completedBooks >= 3) {
        badges.push({ id: 'dedicated', label: 'Dedicated', description: 'Completed 3 books', icon: 'award', variant: 'success' });
    }

    // 4. STREAK (Simple check for now)
    // If they logged today and yesterday?
    // We would need a dedicated streak calculator. For now, let's use a placeholder if consistency > 80% on active session
    // This is passed in, but we can't easily access it here without the active session object.
    // Let's rely on global consistency.

    return badges;
};
