/**
 * Update request functionality for Wedding RSVP App
 * Allows guests to request changes to their RSVP after submission
 */

class UpdateRequestForm {
  /**
   * Create a new update request form instance
   */
  constructor() {
    this.pin = null;
    this.guestNames = [];
  }
  
  /**
   * Set the PIN and guest names for the update request
   * @param {string} pin - The invitation PIN
   * @param {Array} guests - List of guests on this invitation
   */
  setRequestData(pin, guests) {
    this.pin = pin;
    this.guestNames = guests.map(guest => guest.name);
  }
  
  /**
   * Generate HTML for the update request form
   * @returns {string} - HTML for the update request form
   */
  generateUpdateRequestForm() {
    if (!this.pin || this.guestNames.length === 0) {
      return '';
    }
    
    return `
      <div class="update-request-form">
        <h3>Request Changes to Your RSVP</h3>
        <p>If you need to make changes to your RSVP, please fill out this form and we'll get back to you.</p>
        <form id="change-request-form">
          <input type="hidden" id="request-pin" value="${this.pin}">
          
          <div class="form-group">
            <label for="request-name">Your Name:</label>
            <select id="request-name" required>
              <option value="">-- Select your name --</option>
              ${this.guestNames.map(name => `<option value="${name}">${name}</option>`).join('')}
            </select>
          </div>
          
          <div class="form-group">
            <label for="request-email">Your Email:</label>
            <input type="email" id="request-email" placeholder="Enter your email address" required>
          </div>
          
          <div class="form-group">
            <label for="request-details">Change Request Details:</label>
            <textarea id="request-details" placeholder="Please describe the changes you would like to make to your RSVP..." rows="4" required></textarea>
          </div>
          
          <button type="submit" class="submit-button">Send Request</button>
        </form>
        <div id="request-success" style="display: none;">
          <p class="success-message">Your request has been sent! We'll get back to you soon.</p>
        </div>
        <div id="request-error" style="display: none;">
          <p class="error-message">There was an error sending your request. Please try again.</p>
        </div>
      </div>
    `;
  }
  
  /**
   * Submit the update request form
   * @param {string} name - Guest name
   * @param {string} email - Guest email
   * @param {string} details - Request details
   * @returns {Promise} - Promise that resolves when the email is sent
   */
  submitUpdateRequest(name, email, details) {
    // Create email content
    const subject = `RSVP Update Request - PIN: ${this.pin} - ${name}`;
    const body = `
RSVP Update Request

PIN: ${this.pin}
Name: ${name}
Email: ${email}

Request Details:
${details}
    `;
    
    // In a real implementation, this would send an email to wedding@timandaoife.com
    // For this demo, we'll simulate sending an email
    console.log('Sending update request email:');
    console.log('To: wedding@timandaoife.com');
    console.log('Subject:', subject);
    console.log('Body:', body);
    
    // Simulate email sending with a promise
    return new Promise((resolve, reject) => {
      // Simulate successful email sending (in real implementation, this would be an actual email API call)
      setTimeout(() => {
        // 90% chance of success for demo purposes
        if (Math.random() < 0.9) {
          resolve({ success: true });
        } else {
          reject(new Error('Failed to send email'));
        }
      }, 1000);
    });
  }
}

// Initialize update request form handler
document.addEventListener('DOMContentLoaded', () => {
  // Create global instance
  window.updateRequestForm = new UpdateRequestForm();
  
  // Add event listener for the form submission
  document.body.addEventListener('submit', (e) => {
    if (e.target.id === 'change-request-form') {
      e.preventDefault();
      
      const name = document.getElementById('request-name').value;
      const email = document.getElementById('request-email').value;
      const details = document.getElementById('request-details').value;
      
      if (!name || !email || !details) {
        alert('Please fill out all fields');
        return;
      }
      
      // Show loading state
      const submitButton = e.target.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      submitButton.textContent = 'Sending...';
      submitButton.disabled = true;
      
      // Submit the request
      window.updateRequestForm.submitUpdateRequest(name, email, details)
        .then(() => {
          // Show success message
          document.getElementById('change-request-form').style.display = 'none';
          document.getElementById('request-success').style.display = 'block';
        })
        .catch(error => {
          console.error('Error sending update request:', error);
          // Show error message
          document.getElementById('request-error').style.display = 'block';
          // Reset button
          submitButton.textContent = originalText;
          submitButton.disabled = false;
        });
    }
  });
});

// Make available globally
window.UpdateRequestForm = UpdateRequestForm;
