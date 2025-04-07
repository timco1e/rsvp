document.addEventListener('DOMContentLoaded', () => {
    // API URL (adjust based on your deployment)
    const API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000/api' 
      : '/api';
    
    // DOM Elements
    const pinScreen = document.getElementById('pin-screen');
    const rsvpScreen = document.getElementById('rsvp-screen');
    const confirmationScreen = document.getElementById('confirmation-screen');
    const updateRequestScreen = document.getElementById('update-request-screen');
    const pinInput = document.getElementById('pin-input');
    const submitPinBtn = document.getElementById('submit-pin');
    const pinError = document.getElementById('pin-error');
    const rsvpForm = document.getElementById('rsvp-form');
    const guestsContainer = document.getElementById('guests-container');
    const backButton = document.getElementById('back-button');
    const mainWebsiteBtn = document.getElementById('main-website-btn');
    const accommodationsBtn = document.getElementById('accommodations-btn');
    const scheduleBtn = document.getElementById('schedule-btn');
    const requestUpdateBtn = document.getElementById('request-update-btn');
    const backToConfirmationBtn = document.getElementById('back-to-confirmation-btn');
    const loadingIndicator = document.getElementById('loading');
    const invitationDetails = document.getElementById('invitation-details');
    const confirmationDetails = document.getElementById('confirmation-details');
    const calendarContainer = document.getElementById('calendar-container');
    const sharingContainer = document.getElementById('sharing-container');
    const updateRequestContainer = document.getElementById('update-request-container');
    
    // Initialize calendar and sharing functionality
    const icsGenerator = new ICSGenerator();
    window.invitationSharing = new InvitationSharing();
    
    // State variables
    let currentInviteId = null;
    let currentGuests = [];
    let currentPin = null;
    let hasSubmitted = false;
    
    // Format PIN input to uppercase
    pinInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase();
    });
    
    // Submit PIN
    submitPinBtn.addEventListener('click', () => {
      const pin = pinInput.value.trim();
      if (pin.length !== 4) {
        showError('Please enter a valid 4-character PIN');
        return;
      }
      
      currentPin = pin;
      fetchInvitation(pin);
    });
    
    // Also submit when pressing Enter in the PIN input
    pinInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        submitPinBtn.click();
      }
    });
    
    // Handle form submission
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitRSVP();
    });
    
    // Back button
    backButton.addEventListener('click', () => {
      showScreen(pinScreen);
    });
    
    // Request update button
    if (requestUpdateBtn) {
      requestUpdateBtn.addEventListener('click', () => {
        showUpdateRequestForm();
      });
    }
    
    // Back to confirmation button
    if (backToConfirmationBtn) {
      backToConfirmationBtn.addEventListener('click', () => {
        showScreen(confirmationScreen);
      });
    }
    
    // Fetch invitation details with PIN
    async function fetchInvitation(pin) {
      showLoading(true);
      hideError();
      
      try {
        const response = await fetch(`${API_URL}/invitation/${pin}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to find invitation');
        }
        
        // Debug: Log the data we received from the server
        console.log('Invitation data received:', data);
        
        // Save invitation data
        currentInviteId = data.inviteId;
        currentGuests = data.guests;
        
        // Debug: Log guests data
        console.log('Guests data:', currentGuests);
        
        // Display invitation details
        displayInvitationDetails(data.inviteDetails);
        
        // Generate RSVP form for each guest
        generateGuestForms(data.guests);
        
        // Show RSVP screen
        showScreen(rsvpScreen);
      } catch (error) {
        console.error('Full error:', error);
        showError(error.message || 'An error occurred. Please try again.');
      } finally {
        showLoading(false);
      }
    }
    
    // Display invitation details
    function displayInvitationDetails(details) {
      console.log('Displaying invitation details:', details);
      
      // Customize with your wedding details
      const eventDate = "July 5, 2025";
      const eventLocation = "Ballymaloe House";
      
      invitationDetails.innerHTML = `
        <div class="invitation-header">
          <p>Family and friends like you have been such an important part of our story, and we are excited to share this next chapter together.</p>
        </div>
      `;
      
      // Debug: Also show if we have guests
      if (currentGuests && currentGuests.length > 0) {
        console.log(`Should be displaying ${currentGuests.length} guests`);
      } else {
        console.log('No guests to display');
      }
    }
    
    // Generate form fields for each guest
    function generateGuestForms(guests) {
      console.log('Generating guest forms for:', guests);
      guestsContainer.innerHTML = '';
      
      // If no guests are found, create a test guest card to debug the UI
      if (!guests || guests.length === 0) {
        console.log('No guests found, creating a test guest card');
        const testGuestEl = document.createElement('div');
        testGuestEl.className = 'guest-card';
        testGuestEl.setAttribute('data-guest-id', 'test-id');
        
        testGuestEl.innerHTML = `
          <div class="guest-name">Test Guest</div>
          <div class="form-group">
            <label>Will you attend our wedding?</label>
            <div class="radio-group">
              <label>
                <input type="radio" name="rsvp-status-test" value="Yes" required>
                Yes
              </label>
              <label>
                <input type="radio" name="rsvp-status-test" value="No">
                No
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>Any dietary requirements?</label>
            <textarea name="dietary-test" placeholder="Please let us know of any allergies or dietary preferences"></textarea>
          </div>
        `;
        
        guestsContainer.appendChild(testGuestEl);
        return;
      }
      
      guests.forEach((guest, index) => {
        console.log(`Creating guest card for ${guest.name}`);
        const guestEl = document.createElement('div');
        guestEl.className = 'guest-card';
        guestEl.setAttribute('data-guest-id', guest.id);
        
        guestEl.innerHTML = `
          <div class="guest-name">${guest.name}</div>
          
          <div class="form-group">
            <label>Will you attend our wedding celebration?</label>
            <div class="radio-group">
              <label>
                <input type="radio" name="rsvp-status-${index}" value="Yes" ${guest.rsvpStatus === 'Yes' ? 'checked' : ''} required ${hasSubmitted ? 'disabled' : ''}>
                Yes
              </label>
              <label>
                <input type="radio" name="rsvp-status-${index}" value="No" ${guest.rsvpStatus === 'No' ? 'checked' : ''} ${hasSubmitted ? 'disabled' : ''}>
                No
              </label>
            </div>
          </div>
          
          <div class="form-group" id="events-${index}" ${guest.rsvpStatus === 'No' ? 'style="display:none;"' : ''}>
            <label>Attending Friday?</label>
            <p class="event-description">Welcome drinks and casual dinner at Ballymaloe House</p>
            <div class="radio-group">
              <label>
                <input type="radio" name="event-friday-${index}" value="Yes" ${guest.eventAttendance && guest.eventAttendance.includes('Friday') ? 'checked' : ''} ${hasSubmitted ? 'disabled' : ''}>
                Yes
              </label>
              <label>
                <input type="radio" name="event-friday-${index}" value="No" ${guest.eventAttendance && !guest.eventAttendance.includes('Friday') ? 'checked' : ''} ${hasSubmitted ? 'disabled' : ''}>
                No
              </label>
            </div>
            
            <label>Attending Saturday?</label>
            <p class="event-description">Wedding ceremony and reception at Ballymaloe House</p>
            <div class="radio-group">
              <label>
                <input type="radio" name="event-saturday-${index}" value="Yes" ${guest.eventAttendance && guest.eventAttendance.includes('Saturday') ? 'checked' : ''} checked ${hasSubmitted ? 'disabled' : ''}>
                Yes
              </label>
              <label>
                <input type="radio" name="event-saturday-${index}" value="No" ${guest.eventAttendance && !guest.eventAttendance.includes('Saturday') ? 'checked' : ''} ${hasSubmitted ? 'disabled' : ''}>
                No
              </label>
            </div>
            
            <label>Attending Sunday?</label>
            <p class="event-description">Farewell brunch at Ballymaloe House</p>
            <div class="radio-group">
              <label>
                <input type="radio" name="event-sunday-${index}" value="Yes" ${guest.eventAttendance && guest.eventAttendance.includes('Sunday') ? 'checked' : ''} ${hasSubmitted ? 'disabled' : ''}>
                Yes
              </label>
              <label>
                <input type="radio" name="event-sunday-${index}" value="No" ${guest.eventAttendance && !guest.eventAttendance.includes('Sunday') ? 'checked' : ''} ${hasSubmitted ? 'disabled' : ''}>
                No
              </label>
            </div>
          </div>
          
          <div class="form-group" id="dietary-${index}" ${guest.rsvpStatus === 'No' ? 'style="display:none;"' : ''}>
            <label>Any dietary requirements?</label>
            <textarea name="dietary-${index}" placeholder="Please let us know of any allergies or dietary preferences" ${hasSubmitted ? 'readonly' : ''}>${guest.dietaryRequirements || ''}</textarea>
          </div>
        `;
        
        guestsContainer.appendChild(guestEl);
        
        // Add event listener to show/hide conditional fields based on RSVP status
        const rsvpRadios = guestEl.querySelectorAll(`input[name="rsvp-status-${index}"]`);
        rsvpRadios.forEach(radio => {
          radio.addEventListener('change', () => {
            const eventsGroup = document.getElementById(`events-${index}`);
            const dietaryGroup = document.getElementById(`dietary-${index}`);
            
            if (radio.value === 'Yes') {
              eventsGroup.style.display = 'block';
              dietaryGroup.style.display = 'block';
            } else {
              eventsGroup.style.display = 'none';
              dietaryGroup.style.display = 'none';
            }
          });
        });
      });
      
      // If already submitted, hide the submit button and show read-only message
      if (hasSubmitted) {
        const submitButton = document.querySelector('#rsvp-form .submit-button');
        if (submitButton) {
          submitButton.style.display = 'none';
        }
        
        const readOnlyMessage = document.createElement('div');
        readOnlyMessage.className = 'read-only-message';
        readOnlyMessage.innerHTML = `
          <p>Your RSVP has been submitted. This is a read-only view of your choices.</p>
          <p>If you need to make changes, please use the "Request Update" button on the confirmation screen.</p>
        `;
        
        guestsContainer.appendChild(readOnlyMessage);
      }
    }
    
    // Submit RSVP information
    async function submitRSVP() {
      showLoading(true);
      
      try {
        // Check if we have guests
        if (!currentGuests || currentGuests.length === 0) {
          console.log('No guests available, handling test guest card');
          
          // Handle test guest case
          const testGuestCard = document.querySelector('[data-guest-id="test-id"]');
          if (testGuestCard) {
            const rsvpStatus = testGuestCard.querySelector('input[name="rsvp-status-test"]:checked')?.value || 'No';
            const dietaryRequirements = testGuestCard.querySelector('textarea[name="dietary-test"]')?.value || '';
            
            // Display confirmation for test guest
            confirmationDetails.innerHTML = `
              <div class="confirmation-guest">
                <h3>Test Guest</h3>
                <p><strong>RSVP:</strong> ${rsvpStatus}</p>
                ${rsvpStatus === 'Yes' && dietaryRequirements ? 
                  `<p><strong>Dietary Requirements:</strong> ${dietaryRequirements}</p>` : ''}
              </div>
            `;
            
            // Add calendar link for test guest
            if (rsvpStatus === 'Yes') {
              const testEvents = ['Saturday'];
              calendarContainer.innerHTML = `
                <h3>Add to Calendar</h3>
                ${icsGenerator.generateEventLinks(testEvents)}
              `;
            } else {
              calendarContainer.innerHTML = '';
            }
            
            // Add sharing options for test guest
            const testInviteDetails = { pin: 'TEST' };
            const testGuests = [{ name: 'Test Guest', rsvpStatus, eventAttendance: ['Saturday'] }];
            window.invitationSharing.prepareShareableData(testInviteDetails, testGuests);
            sharingContainer.innerHTML = window.invitationSharing.generateSharingButtons();
            
            // Set up update request form
            if (window.updateRequestForm) {
              window.updateRequestForm.setRequestData('TEST', testGuests);
              updateRequestContainer.innerHTML = window.updateRequestForm.generateUpdateRequestForm();
            }
            
            hasSubmitted = true;
            showScreen(confirmationScreen);
            showLoading(false);
            return;
          }
        }
        
        // Collect form data for each guest
        const updatedGuests = currentGuests.map((guest, index) => {
          const guestCard = document.querySelector(`[data-guest-id="${guest.id}"]`);
          if (!guestCard) {
            console.error(`Could not find guest card for guest ID: ${guest.id}`);
            return null;
          }
          
          const rsvpStatusElement = guestCard.querySelector(`input[name="rsvp-status-${index}"]:checked`);
          if (!rsvpStatusElement) {
            console.error(`No RSVP status selected for guest ${index}`);
            return null;
          }
          
          const rsvpStatus = rsvpStatusElement.value;
          
          // Only collect event attendance and dietary info if attending
          let eventAttendance = [];
          let dietaryRequirements = '';
          
          if (rsvpStatus === 'Yes') {
            // Collect event attendance - now using radio buttons
            const fridayRadio = guestCard.querySelector(`input[name="event-friday-${index}"]:checked`);
            const saturdayRadio = guestCard.querySelector(`input[name="event-saturday-${index}"]:checked`);
            const sundayRadio = guestCard.querySelector(`input[name="event-sunday-${index}"]:checked`);
            
            if (fridayRadio && fridayRadio.value === 'Yes') eventAttendance.push('Friday');
            if (saturdayRadio && saturdayRadio.value === 'Yes') eventAttendance.push('Saturday');
            if (sundayRadio && sundayRadio.value === 'Yes') eventAttendance.push('Sunday');
            
            // Collect dietary requirements
            const dietaryElement = guestCard.querySelector(`textarea[name="dietary-${index}"]`);
            dietaryRequirements = dietaryElement ? dietaryElement.value.trim() : '';
          }
          
          return {
            id: guest.id,
            name: guest.name,
            rsvpStatus,
            eventAttendance,
            dietaryRequirements
          };
        }).filter(guest => guest !== null);
        
        if (updatedGuests.length === 0) {
          throw new Error('No valid guest data could be collected');
        }
        
        console.log('Submitting guest data:', updatedGuests);
        console.log('Invite ID:', currentInviteId);
        
        // Send updated data to the server
        const response = await fetch(`${API_URL}/rsvp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inviteId: currentInviteId,
            guests: updatedGuests
          })
        });
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || `Failed to submit RSVP (Status: ${response.status})`);
        }
        
        const data = await response.json();
        
        // Mark as submitted to make form read-only on future views
        hasSubmitted = true;
        
        // Update current guests with the submitted data
        currentGuests = updatedGuests;
        
        // Show confirmation screen
        displayConfirmation(updatedGuests);
        
        // Generate calendar links
        generateCalendarLinks(updatedGuests);
        
        // Generate sharing options
        generateSharingOptions(updatedGuests);
        
        // Set up update request form
        if (window.updateRequestForm) {
          window.updateRequestForm.setRequestData(currentPin, updatedGuests);
          updateRequestContainer.innerHTML = window.updateRequestForm.generateUpdateRequestForm();
        }
        
        showScreen(confirmationScreen);
      } catch (error) {
        console.error('Submit RSVP error:', error);
        alert(`Error: ${error.message || 'An error occurred while submitting your RSVP. Please try again.'}`);
      } finally {
        showLoading(false);
      }
    }
    
    // Display confirmation details
    function displayConfirmation(guests) {
      let html = '';
      
      guests.forEach(guest => {
        html += `<div class="confirmation-guest">
          <h3>${guest.name}</h3>`;
          
        if (guest.rsvpStatus === 'Yes') {
          html += `<p><strong>RSVP:</strong> Attending</p>`;
          
          // Show which events they're attending
          const events = [];
          if (guest.eventAttendance.includes('Friday')) events.push('Friday - Welcome Drinks');
          if (guest.eventAttendance.includes('Saturday')) events.push('Saturday - Wedding Ceremony & Reception');
          if (guest.eventAttendance.includes('Sunday')) events.push('Sunday - Farewell Brunch');
          
          if (events.length > 0) {
            html += `<p><strong>Events:</strong> ${events.join(', ')}</p>`;
          } else {
            html += `<p><strong>Events:</strong> None selected</p>`;
          }
          
          if (guest.dietaryRequirements) {
            html += `<p><strong>Dietary Requirements:</strong> ${guest.dietaryRequirements}</p>`;
          }
        } else {
          html += `<p><strong>RSVP:</strong> Unable to attend</p>`;
        }
        
        html += `</div>`;
      });
      
      confirmationDetails.innerHTML = html;
    }
    
    // Generate calendar links
    function generateCalendarLinks(guests) {
      // Find attending guests and their events
      const attendingGuests = guests.filter(guest => guest.rsvpStatus === 'Yes');
      
      if (attendingGuests.length === 0) {
        calendarContainer.innerHTML = '';
        return;
      }
      
      // Get all unique events that at least one guest is attending
      const allEvents = new Set();
      attendingGuests.forEach(guest => {
        guest.eventAttendance.forEach(event => allEvents.add(event));
      });
      
      if (allEvents.size === 0) {
        calendarContainer.innerHTML = '';
        return;
      }
      
      // Generate calendar links
      calendarContainer.innerHTML = `
        <h3>Add to Calendar</h3>
        ${icsGenerator.generateEventLinks(Array.from(allEvents))}
      `;
    }
    
    // Generate sharing options
    function generateSharingOptions(guests) {
      // Prepare invitation data for sharing
      const inviteDetails = { pin: currentPin };
      window.invitationSharing.prepareShareableData(inviteDetails, guests);
      
      // Generate sharing buttons
      sharingContainer.innerHTML = window.invitationSharing.generateSharingButtons();
    }
    
    // Show update request form
    function showUpdateRequestForm() {
      if (updateRequestScreen) {
        showScreen(updateRequestScreen);
      }
    }
    
    // Helper function to show a specific screen
    function showScreen(screen) {
      // Hide all screens
      [pinScreen, rsvpScreen, confirmationScreen, updateRequestScreen].forEach(s => {
        if (s) s.classList.remove('active');
      });
      
      // Show the specified screen
      if (screen) screen.classList.add('active');
    }
    
    // Show/hide loading indicator
    function showLoading(show) {
      if (loadingIndicator) {
        loadingIndicator.style.display = show ? 'flex' : 'none';
      }
    }
    
    // Show error message
    function showError(message) {
      if (pinError) {
        pinError.textContent = message;
        pinError.style.display = 'block';
      }
    }
    
    // Hide error message
    function hideError() {
      if (pinError) {
        pinError.style.display = 'none';
      }
    }
    
    // Reset form
    function resetForm() {
      if (pinInput) pinInput.value = '';
      currentInviteId = null;
      currentGuests = [];
      currentPin = null;
      hideError();
    }
});
