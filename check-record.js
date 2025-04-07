require('dotenv').config();
const Airtable = require('airtable');

// Configure Airtable with Personal Access Token
const base = new Airtable({ 
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN
}).base(process.env.AIRTABLE_BASE_ID);

async function checkRecord() {
  try {
    console.log('Fetching records from Guests table...');
    
    // Get all records from Guests table
    const records = await base('Guests').select().all();
    
    console.log(`Found ${records.length} records in Guests table`);
    
    // Show details of each record
    records.forEach((record, index) => {
      console.log(`\nRecord ${index + 1}:`);
      console.log('  ID:', record.id);
      console.log('  Fields:', JSON.stringify(record.fields, null, 2));
    });
    
    // Try to directly manipulate a record (test update)
    if (records.length > 0) {
      console.log('\nTesting field update with first record...');
      
      const testRecord = records[0];
      console.log('Test record ID:', testRecord.id);
      
      // First try with standard fields
      try {
        const updateResult = await base('Guests').update(testRecord.id, {
          // Try different possible field names
          'RSVP': 'Yes'
        });
        console.log('Update succeeded with field "RSVP"');
        console.log('Updated record:', JSON.stringify(updateResult.fields, null, 2));
      } catch (updateError) {
        console.error('Update failed with field "RSVP":', updateError.message);
        
        // Try with "RSVP Status"
        try {
          const updateResult = await base('Guests').update(testRecord.id, {
            'RSVP Status': 'Yes'
          });
          console.log('Update succeeded with field "RSVP Status"');
          console.log('Updated record:', JSON.stringify(updateResult.fields, null, 2));
        } catch (updateError2) {
          console.error('Update failed with field "RSVP Status":', updateError2.message);
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkRecord();