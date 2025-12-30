import { addDays, format, startOfDay, differenceInCalendarDays, parseISO } from 'date-fns';

/**
 * Finds the best dates for a swarm/meeting based on availability.
 * @param {Array} availability - List of { date, memberId, status } objects
 * @param {Array} members - List of all members (to calculate % available)
 * @param {Date|String} startDate - Search start date
 * @param {Number} rangeDays - How many days to look ahead (default 14)
 * @returns {Array} Top 3 dates { date, dateStr, conflictCount, busyMembers, score }
 */
export const findBestDates = (availability, members, startDate = new Date(), rangeDays = 14) => {
    const candidates = [];
    const start = startOfDay(new Date(startDate));

    for (let i = 0; i < rangeDays; i++) {
        const currentDate = addDays(start, i);
        const dateStr = format(currentDate, 'yyyy-MM-dd');

        // Find conflicts for this day
        const conflicts = availability.filter(a => a.date === dateStr && a.status === 'BUSY');

        // Map to member names
        const busyMemberIds = conflicts.map(c => c.memberId);
        const busyMembers = members.filter(m => busyMemberIds.includes(m.id));

        candidates.push({
            date: currentDate,
            dateStr,
            conflictCount: conflicts.length,
            busyMembers: busyMembers,
            // Score: Lower is better. 
            // We can add "Day of Week" preference later (e.g. Fri/Sat better than Mon)
            score: conflicts.length
        });
    }

    // Sort by Score (Ascending) -> Date (Ascending)
    return candidates.sort((a, b) => {
        if (a.score !== b.score) return a.score - b.score;
        return a.date - b.date;
    }).slice(0, 3);
};
