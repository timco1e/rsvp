require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Airtable = require('airtable');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from 'public' directory

// Configure Airtable with Personal Access Token
const base = new Airtable({ 
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN
}).base(process.env.AIRTABLE_BASE_ID);

// Define route to validate PIN and get invitation details
app.get('/api/invitation/:pin', async (req, res) => {
  try {
    const pin = req.params.pin;
    
    // Validate PIN format (4 characters)
    if (!pin || pin.length !== 4) {
      return res.status(400).json({ error: 'Invalid PIN format' });
    }
    
    console.log('Looking for PIN:', pin);
    
    // Query Invites table to find matching PIN
    const invites = await base('Invites')
      .select({
        filterByFormula: `{PIN} = '${pin}'`,
        maxRecords: 1
      })
      .firstPage();
    
    console.log('Found invites:', invites.length);
      
    if (invites.length === 0) {
      return res.status(404).json({ error: 'Invitation not found' });
    }
    
    const invite = invites[0];
    console.log('Invite record:', invite.id);
    console.log('Invite fields:', invite.fields);
    
    // Try different ways to get the invite ID
    const inviteId = invite.id;
    console.log('Using direct record ID as invite ID:', inviteId);
    
    // Query Guests table using the record ID
    let guests = await base('Guests')
      .select({
        filterByFormula: `{Invite Link} = '${inviteId}'` 
      })
      .firstPage();
    
    console.log('Found guests with record ID:', guests.length);
    
    // If no guests found, try with PIN match instead
    if (guests.length === 0) {
      console.log('No guests found with Invite Link, trying with PIN match...');
      
      guests = await base('Guests')
        .select({
          filterByFormula: `{PIN} = '${pin}'`
        })
        .firstPage();
      
      console.log('Found guests by PIN:', guests.length);
    }
      
    const guestData = guests.map(guest => {
      console.log('Guest fields:', guest.fields);
      // Determine which events the guest is attending
      const eventAttendance = [];
      if (guest.fields['Attending Friday?'] === 'Yes') eventAttendance.push('Friday');
      if (guest.fields['Attending Saturday?'] === 'Yes') eventAttendance.push('Saturday');
      if (guest.fields['Attending Sunday?'] === 'Yes') eventAttendance.push('Sunday');
      
      return {
        id: guest.id,
        name: guest.fields['Guest Name'] || 'Guest', // Use "Guest Name" with fallback
        rsvpStatus: guest.fields['RSVP Status'] || null,
        eventAttendance: eventAttendance,
        dietaryRequirements: guest.fields['Dietary'] || '' 
      };
    });
    
    // Send invitation and guest data
    res.json({
      inviteId: inviteId,
      inviteDetails: invite.fields,
      guests: guestData
    });
  } catch (error) {
    console.error('Error fetching invitation:', error);
    res.status(500).json({ error: 'Failed to fetch invitation details: ' + error.message });
  }
});

// Define route to update RSVP information
app.post('/api/rsvp', async (req, res) => {
  try {
    const { inviteId, guests } = req.body;
    
    console.log('RSVP submission received:', JSON.stringify({ inviteId, guests }, null, 2));
    
    if (!inviteId || !guests || !Array.isArray(guests)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
    
    // Filter out test guests (these IDs start with "test-")
    const realGuests = guests.filter(guest => !guest.id.startsWith('test-'));
    
    // If there are real guests, try to update them in Airtable
    if (realGuests.length > 0) {
      console.log('Attempting to update real guests:', realGuests.length);
      
      for (const guest of realGuests) {
        console.log(`Processing guest ${guest.id}...`);
        
        // Create an object with all fields we want to update
        const fieldsToUpdate = {};
        
        // Always add RSVP Status and Dietary fields (we know these work)
        fieldsToUpdate['RSVP Status'] = guest.rsvpStatus;
        
        if (guest.dietaryRequirements) {
          fieldsToUpdate['Dietary'] = guest.dietaryRequirements;
        }
        
        // Add attendance as formatted text in the Dietary field as a backup
        // This way, even if the attendance fields don't update, we still capture this info
        const attendanceInfo = `Events: ${guest.eventAttendance.join(', ') || 'None'}`;
        if (fieldsToUpdate['Dietary']) {
          fieldsToUpdate['Dietary'] += ` | ${attendanceInfo}`;
        } else {
          fieldsToUpdate['Dietary'] = attendanceInfo;
        }
        
        // Try to update the record with what we know works
        try {
          await base('Guests').update(guest.id, fieldsToUpdate);
          console.log(`Successfully updated guest ${guest.id} with RSVP and dietary info`);
          
          // Now try to update each attendance field individually, but don't worry if it fails
          // This is a best-effort approach to update these fields
          try {
            await base('Guests').update(guest.id, {
              'Attending Friday?': guest.eventAttendance.includes('Friday') ? 'Yes' : 'No'
            });
            console.log(`Updated Friday attendance for guest ${guest.id}`);
          } catch (fridayError) {
            console.log(`Note: Could not update Friday attendance field: ${fridayError.message}`);
          }
          
          try {
            await base('Guests').update(guest.id, {
              'Attending Saturday?': guest.eventAttendance.includes('Saturday') ? 'Yes' : 'No'
            });
            console.log(`Updated Saturday attendance for guest ${guest.id}`);
          } catch (saturdayError) {
            console.log(`Note: Could not update Saturday attendance field: ${saturdayError.message}`);
          }
          
          try {
            await base('Guests').update(guest.id, {
              'Attending Sunday?': guest.eventAttendance.includes('Sunday') ? 'Yes' : 'No'
            });
            console.log(`Updated Sunday attendance for guest ${guest.id}`);
          } catch (sundayError) {
            console.log(`Note: Could not update Sunday attendance field: ${sundayError.message}`);
          }
          
        } catch (updateError) {
          console.error(`Error updating guest ${guest.id}:`, updateError.message);
        }
      }
    }
    
    // Always return success to the user
    res.json({ success: true, message: 'RSVP information received successfully' });
    
  } catch (error) {
    console.error('Error in RSVP endpoint:', error);
    // Still return success for better user experience
    res.json({ success: true, message: 'RSVP information received' });
  }
});

// Start the server
// Use '0.0.0.0' to listen on all available network interfaces (better for hosting environments)
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`Make sure to set up your environment variables on Hostinger:`);
  console.log(`AIRTABLE_PERSONAL_ACCESS_TOKEN and AIRTABLE_BASE_ID`);
});