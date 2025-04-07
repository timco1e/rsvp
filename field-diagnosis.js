require('dotenv').config();
const Airtable = require('airtable');

// Configure Airtable
const base = new Airtable({ 
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN
}).base(process.env.AIRTABLE_BASE_ID);

async function diagnoseFields() {
  try {
    console.log('Fetching a guest record to examine field names exactly...');
    
    // Get some guest records
    const guests = await base('Guests').select({
      maxRecords: 2
    }).firstPage();
    
    if (guests.length === 0) {
      console.log('No guests found!');
      return;
    }
    
    // Log the first guest
    const guest = guests[0];
    console.log('Guest ID:', guest.id);
    
    // Log ALL metadata about the record to see the exact field names
    console.log('All record metadata:');
    console.log(JSON.stringify(guest, null, 2));
    
    // Log field keys exactly as they are
    console.log('\nExact field keys:');
    const fields = Object.keys(guest.fields);
    fields.forEach((field, index) => {
      console.log(`Field ${index+1}: "${field}" (${typeof field})`);
      // Also log UTF-8 code points to detect any invisible characters
      console.log('  Character codes:', Array.from(field).map(c => c.charCodeAt(0)));
    });
    
    // Try to update with each field individually
    console.log('\nTrying to update each field:');
    
    for (const field of fields) {
      try {
        const updateObj = {};
        
        // Set appropriate test value based on field name
        if (field.includes('Friday') || field.includes('Saturday') || field.includes('Sunday')) {
          updateObj[field] = true;
        } else if (field.includes('Dietary')) {
          updateObj[field] = 'Test dietary note';
        } else if (field.includes('RSVP') || field.includes('Status')) {
          updateObj[field] = 'Yes';
        } else if (field !== 'Guest Name' && field !== 'Invite Link' && field !== 'PIN') {
          // Try updating any other fields that aren't these known ones
          updateObj[field] = 'Test';
        }
        
        // Only attempt update if we set a value
        if (Object.keys(updateObj).length > 0) {
          console.log(`Trying to update "${field}"...`);
          await base('Guests').update(guest.id, updateObj);
          console.log(`✅ Successfully updated "${field}"`);
        }
      } catch (err) {
        console.log(`❌ Failed to update "${field}": ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

diagnoseFields();