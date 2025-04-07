require('dotenv').config();
const Airtable = require('airtable');

// Configure Airtable
const base = new Airtable({ 
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN
}).base(process.env.AIRTABLE_BASE_ID);

async function testSimpleUpdate() {
  try {
    // Get a guest record
    console.log('Fetching a guest record...');
    const guests = await base('Guests').select({
      maxRecords: 1
    }).firstPage();
    
    if (guests.length === 0) {
      console.log('No guests found!');
      return;
    }
    
    const guest = guests[0];
    console.log('Found guest:', guest.id);
    console.log('Current fields:', JSON.stringify(guest.fields, null, 2));
    
    // Try to update ONE field that's likely to exist
    console.log('\nTrying to update Dietary field...');
    const updatedGuest = await base('Guests').update(guest.id, {
      'Dietary': 'Test dietary note from script'
    });
    
    console.log('Update successful!');
    console.log('Updated fields:', JSON.stringify(updatedGuest.fields, null, 2));
    
    // Now try to create a new field if it doesn't exist
    console.log('\nTrying to update with new field RSVP Status...');
    const updatedGuestWithStatus = await base('Guests').update(guest.id, {
      'RSVP Status': 'Yes',
      'Dietary': 'Another test note'
    });
    
    console.log('Update with RSVP Status successful!');
    console.log('Updated fields:', JSON.stringify(updatedGuestWithStatus.fields, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
    
    if (error.message.includes('Unknown field name:')) {
      console.log('\nField name error detected. Let\'s try other field names:');
      
      try {
        const guests = await base('Guests').select({
          maxRecords: 1
        }).firstPage();
        
        if (guests.length > 0) {
          const guest = guests[0];
          console.log('Guest fields available:', Object.keys(guest.fields).join(', '));
          
          // Try to update with a known field
          console.log('Trying field name "RSVP" instead...');
          const updatedGuest = await base('Guests').update(guest.id, {
            'RSVP': 'Yes'
          });
          
          console.log('Update with RSVP field successful!');
          console.log('Updated fields:', JSON.stringify(updatedGuest.fields, null, 2));
        }
      } catch (secondError) {
        console.error('Second attempt error:', secondError.message);
      }
    }
  }
}

testSimpleUpdate();