/**
 * Sharing functionality for Wedding RSVP App
 * Allows guests to share invitation details with others
 */

class InvitationSharing {
  /**
   * Create a new invitation sharing instance
   */
  constructor() {
    this.shareableData = null;
  }
  
  /**
   * Prepare invitation data for sharing
   * @param {Object} inviteDetails - Details about the invitation
   * @param {Array} guests - List of guests on this invitation
   * @returns {Object} - Prepared data for sharing
   */
  prepareShareableData(inviteDetails, guests) {
    if (!inviteDetails || !guests || guests.length === 0) {
      throw new Error('Invalid invitation data for sharing');
    }
    
    // Create a shareable version of the invitation data
    this.shareableData = {
      title: "Tim & Aoife's Wedding",
      date: "July 5, 2025",
      location: "Ballymaloe House",
      pin: inviteDetails.pin || '',
      guests: guests.map(guest => ({
        name: guest.name,
        attending: guest.rsvpStatus === 'Yes',
        events: guest.eventAttendance || [],
        dietaryRequirements: guest.dietaryRequirements || ''
      }))
    };
    
    return this.shareableData;
  }
  
  /**
   * Generate a shareable text message
   * @returns {string} - Formatted text message for sharing
   */
  generateShareableText() {
    if (!this.shareableData) {
      return 'No invitation data available for sharing';
    }
    
    const data = this.shareableData;
    let message = `${data.title}\n${data.date} at ${data.location}\n\n`;
    
    message += `Your PIN: ${data.pin}\n\n`;
    
    if (data.guests && data.guests.length > 0) {
      message += 'RSVP Confirmation:\n';
      data.guests.forEach(guest => {
        message += `\n- ${guest.name}\n`;
        message += `  Status: ${guest.attending ? 'Attending' : 'Not attending'}\n`;
        
        if (guest.attending) {
          if (guest.events && guest.events.length > 0) {
            message += '  Events:\n';
            if (guest.events.includes('Friday')) {
              message += '    • Friday - Welcome Drinks and Casual Dinner\n';
            }
            if (guest.events.includes('Saturday')) {
              message += '    • Saturday - Wedding Ceremony & Reception\n';
            }
            if (guest.events.includes('Sunday')) {
              message += '    • Sunday - Farewell Brunch\n';
            }
          }
          
          if (guest.dietaryRequirements) {
            message += `  Dietary Requirements: ${guest.dietaryRequirements}\n`;
          }
        }
      });
    }
    
    message += `\nView your RSVP details online: https://rsvp.timandaoife.com\n`;
    message += `For any changes, please visit the RSVP site and use the "Request Update" button.\n`;
    
    return message;
  }
  
  /**
   * Share invitation via email
   * @returns {string} - Email sharing link
   */
  shareViaEmail() {
    if (!this.shareableData) {
      return '#';
    }
    
    const subject = encodeURIComponent(`RSVP Confirmation - ${this.shareableData.title}`);
    const body = encodeURIComponent(this.generateShareableText());
    
    return `mailto:?subject=${subject}&body=${body}`;
  }
  
  /**
   * Share invitation via WhatsApp
   * @returns {string} - WhatsApp sharing link
   */
  shareViaWhatsApp() {
    if (!this.shareableData) {
      return '#';
    }
    
    const text = encodeURIComponent(this.generateShareableText());
    return `https://wa.me/?text=${text}`;
  }
  
  /**
   * Share invitation via SMS
   * @returns {string} - SMS sharing link
   */
  shareViaSMS() {
    if (!this.shareableData) {
      return '#';
    }
    
    const body = encodeURIComponent(this.generateShareableText());
    return `sms:?&body=${body}`;
  }
  
  /**
   * Generate HTML for sharing buttons
   * @returns {string} - HTML for sharing buttons
   */
  generateSharingButtons() {
    if (!this.shareableData) {
      return '';
    }
    
    return `
      <div class="sharing-buttons">
        <h3>Save or share your RSVP details</h3>
        <p class="sharing-description">Keep a record of your RSVP details for your reference.</p>
        <div class="sharing-options">
          <a href="${this.shareViaEmail()}" class="share-button email-share" target="_blank">
            <span>Email</span>
          </a>
          <a href="${this.shareViaWhatsApp()}" class="share-button whatsapp-share" target="_blank">
            <span>WhatsApp</span>
          </a>
          <a href="${this.shareViaSMS()}" class="share-button sms-share">
            <span>SMS</span>
          </a>
          <button class="share-button copy-link" onclick="copyInvitationDetails()">
            <span>Copy Details</span>
          </button>
        </div>
      </div>
    `;
  }
}

/**
 * Copy invitation details to clipboard
 */
function copyInvitationDetails() {
  if (!window.invitationSharing || !window.invitationSharing.shareableData) {
    alert('No invitation details available to copy');
    return;
  }
  
  const text = window.invitationSharing.generateShareableText();
  
  // Create a temporary textarea element to copy the text
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  
  // Select and copy the text
  textarea.select();
  document.execCommand('copy');
  
  // Remove the textarea
  document.body.removeChild(textarea);
  
  // Show a confirmation message
  alert('RSVP details copied to clipboard!');
}

// Make available globally
window.InvitationSharing = InvitationSharing;
window.copyInvitationDetails = copyInvitationDetails;
