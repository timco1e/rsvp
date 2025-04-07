/**
 * ICS Calendar Generator for Wedding RSVP App
 * Generates .ics files for wedding events
 */

class ICSGenerator {
  /**
   * Create a new ICS file generator
   * @param {Object} weddingDetails - Details about the wedding
   */
  constructor(weddingDetails = {}) {
    this.weddingDetails = {
      title: weddingDetails.title || "Tim & Aoife's Wedding",
      location: weddingDetails.location || "Ballymaloe House",
      description: weddingDetails.description || "We can't wait to share this next chapter together. Come ready for good food, drinks, and making memories!",
      organizer: weddingDetails.organizer || "Tim & Aoife",
      organizerEmail: weddingDetails.organizerEmail || "wedding@timandaoife.com",
      url: weddingDetails.url || "https://timandaoife.com",
      timezone: weddingDetails.timezone || "Europe/Dublin"
    };
    
    // Default event details
    this.events = {
      friday: {
        title: "Welcome Drinks & Dinner",
        description: "Welcome drinks and casual dinner at Ballymaloe House",
        location: "Ballymaloe House",
        date: "2025-07-04",
        startTime: "19:00",
        endTime: "22:00"
      },
      saturday: {
        title: "Wedding Ceremony & Reception",
        description: "Wedding ceremony and reception at Ballymaloe House",
        location: "Ballymaloe House",
        date: "2025-07-05",
        startTime: "14:30",
        endTime: "23:59"
      },
      sunday: {
        title: "Farewell Brunch",
        description: "Farewell brunch at Ballymaloe House",
        location: "Ballymaloe House",
        date: "2025-07-06",
        startTime: "11:00",
        endTime: "14:00"
      }
    };
  }
  
  /**
   * Format date for ICS file
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} time - Time in HH:MM format
   * @returns {string} - Formatted date for ICS
   */
  formatDate(date, time) {
    const [year, month, day] = date.split('-');
    const [hour, minute] = time.split(':');
    
    return `${year}${month}${day}T${hour}${minute}00`;
  }
  
  /**
   * Generate a unique ID for the event
   * @returns {string} - Unique ID
   */
  generateUID() {
    return `event-${Math.random().toString(36).substring(2, 15)}-${Date.now().toString(36)}@timandaoife.com`;
  }
  
  /**
   * Create ICS content for a specific event
   * @param {string} eventKey - Key of the event (friday, saturday, sunday)
   * @returns {string} - ICS file content
   */
  createEventICS(eventKey) {
    if (!this.events[eventKey]) {
      throw new Error(`Event ${eventKey} not found`);
    }
    
    const event = this.events[eventKey];
    const uid = this.generateUID();
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const dtstart = this.formatDate(event.date, event.startTime);
    const dtend = this.formatDate(event.date, event.endTime);
    
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'PRODID:-//Tim & Aoife Wedding//RSVP App//EN',
      'X-WR-TIMEZONE:' + this.weddingDetails.timezone,
      'BEGIN:VEVENT',
      'UID:' + uid,
      'SUMMARY:' + event.title,
      'DTSTAMP:' + now,
      'DTSTART:' + dtstart,
      'DTEND:' + dtend,
      'DESCRIPTION:' + event.description.replace(/\n/g, '\\n'),
      'LOCATION:' + event.location,
      'URL:' + this.weddingDetails.url,
      'ORGANIZER;CN=' + this.weddingDetails.organizer + ':mailto:' + this.weddingDetails.organizerEmail,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
  }
  
  /**
   * Create a combined ICS file for multiple events
   * @param {Array} eventKeys - Array of event keys to include
   * @returns {string} - Combined ICS file content
   */
  createCombinedICS(eventKeys) {
    if (!eventKeys || eventKeys.length === 0) {
      throw new Error('No events specified');
    }
    
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'PRODID:-//Tim & Aoife Wedding//RSVP App//EN',
      'X-WR-TIMEZONE:' + this.weddingDetails.timezone
    ];
    
    eventKeys.forEach(eventKey => {
      if (!this.events[eventKey]) {
        console.warn(`Event ${eventKey} not found, skipping`);
        return;
      }
      
      const event = this.events[eventKey];
      const uid = this.generateUID();
      const dtstart = this.formatDate(event.date, event.startTime);
      const dtend = this.formatDate(event.date, event.endTime);
      
      icsContent = icsContent.concat([
        'BEGIN:VEVENT',
        'UID:' + uid,
        'SUMMARY:' + event.title,
        'DTSTAMP:' + now,
        'DTSTART:' + dtstart,
        'DTEND:' + dtend,
        'DESCRIPTION:' + event.description.replace(/\n/g, '\\n'),
        'LOCATION:' + event.location,
        'URL:' + this.weddingDetails.url,
        'ORGANIZER;CN=' + this.weddingDetails.organizer + ':mailto:' + this.weddingDetails.organizerEmail,
        'STATUS:CONFIRMED',
        'TRANSP:OPAQUE',
        'END:VEVENT'
      ]);
    });
    
    icsContent.push('END:VCALENDAR');
    return icsContent.join('\r\n');
  }
  
  /**
   * Generate a download link for an ICS file
   * @param {string} icsContent - Content of the ICS file
   * @param {string} filename - Name of the file to download
   * @returns {string} - HTML for a download link
   */
  generateDownloadLink(icsContent, filename) {
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    return `<a href="${url}" download="${filename}" class="calendar-link button">Add to Calendar</a>`;
  }
  
  /**
   * Generate download links for specific events
   * @param {Array} eventAttendance - Array of events the guest is attending
   * @returns {string} - HTML for download links
   */
  generateEventLinks(eventAttendance) {
    if (!eventAttendance || eventAttendance.length === 0) {
      return '';
    }
    
    const eventMap = {
      'Friday': 'friday',
      'Saturday': 'saturday',
      'Sunday': 'sunday'
    };
    
    const eventKeys = eventAttendance.map(day => eventMap[day]).filter(key => key);
    
    if (eventKeys.length === 0) {
      return '';
    }
    
    // Generate combined calendar if attending multiple events
    if (eventKeys.length > 1) {
      const combinedICS = this.createCombinedICS(eventKeys);
      return this.generateDownloadLink(combinedICS, 'Tim_and_Aoife_Wedding.ics');
    }
    
    // Generate single event calendar
    const eventKey = eventKeys[0];
    const eventICS = this.createEventICS(eventKey);
    const event = this.events[eventKey];
    return this.generateDownloadLink(eventICS, `Tim_and_Aoife_${event.title.replace(/\s+/g, '_')}.ics`);
  }
}

// Make available globally
window.ICSGenerator = ICSGenerator;
