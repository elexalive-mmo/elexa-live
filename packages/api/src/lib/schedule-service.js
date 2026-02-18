const axios = require('axios');

class ScheduleService {
    constructor() {
        this.url = 'https://api.twitch.tv/helix/schedule/icalendar?broadcaster_id=1439255333';
        this.events = [];
        this.lastFetch = 0;
        this.pollInterval = 15 * 60 * 1000; // 15 mins
    }

    async fetchSchedule() {
        try {
            // Using https instead of webcal
            const response = await axios.get(this.url);
            this.events = this.parseICal(response.data);
            this.lastFetch = Date.now();
            console.log(`📅 Schedule Service: Refreshed (${this.events.length} events found)`);
        } catch (e) {
            console.error('📅 Schedule Service: Fetch error', e.message);
        }
    }

    parseICal(data) {
        const events = [];
        const eventBlocks = data.split('BEGIN:VEVENT');

        // Skip first block (metadata)
        for (let i = 1; i < eventBlocks.length; i++) {
            const block = eventBlocks[i];
            const startMatch = block.match(/DTSTART:(\d+T\d+Z)/);
            const endMatch = block.match(/DTEND:(\d+T\d+Z)/);
            const summaryMatch = block.match(/SUMMARY:(.*)/);

            if (startMatch && endMatch) {
                events.push({
                    start: this.parseDate(startMatch[1]),
                    end: this.parseDate(endMatch[1]),
                    summary: summaryMatch ? summaryMatch[1].trim() : 'Twitch Stream'
                });
            }
        }
        return events.sort((a, b) => a.start - b.start);
    }

    parseDate(str) {
        // Format: 20260209T030000Z -> 2026-02-09T03:00:00Z
        const y = str.substring(0, 4);
        const m = str.substring(4, 6);
        const d = str.substring(6, 8);
        const hh = str.substring(9, 11);
        const mm = str.substring(11, 13);
        const ss = str.substring(13, 15);
        return new Date(`${y}-${m}-${d}T${hh}:${mm}:${ss}Z`);
    }

    isStreamLive() {
        const now = new Date();
        return this.events.some(e => now >= e.start && now <= e.end);
    }

    getNextStream() {
        const now = new Date();
        return this.events.find(e => e.start > now);
    }

    getEventStatus() {
        const now = new Date();
        const live = this.events.find(e => now >= e.start && now <= e.end);
        if (live) return { status: 'LIVE', event: live };

        const next = this.getNextStream();
        if (next) return { status: 'UPCOMING', event: next };

        return { status: 'OFFLINE', event: null };
    }

    async start() {
        await this.fetchSchedule();
        setInterval(() => this.fetchSchedule(), this.pollInterval);
    }
}

const scheduleService = new ScheduleService();
module.exports = { scheduleService };
