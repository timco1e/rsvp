require('dotenv').config();
const Airtable = require('airtable');

// Configure Airtable
const base = new Airtable({ 
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN
}).base(process.env.AIRTABLE_BASE_ID);

async function testFields() {
  try {
    console.log('Retrieving fields from Guests table...');
    
    // Get metadata about the Guests table
    const guestsFields = await base('Guests').fields();
    
    console.log('\n=== All Fields in Guests Table ===');
    guestsFields.forEach(field => {
      console.log(`- Name: "${field.name}" (${field.type})`);
    });
    
    // Get a sample guest record
    console.log('\nRetrieving a sample guest...');
    const guests = await base('Guests').select({
      maxRecords: 1
    }).firstPage();
    
    if (guests.length === 0) {
      console.log('No guests found!');
      return;
    }
    
    const sampleGuest = guests[0];
    console.log('\n=== Sample Guest Record ===');
    console.log('ID:', sampleGuest.id);
    console.log('Fields:', JSON.stringify(sampleGuest.fields, null, 2));
    
    // Try updating with different field names
    const fieldNamesToTry = [
      // RSVP fields
      'RSVP Status', 'RSVP', 'Status', 'Attending',
      // Event days
      'Attending Friday?', 'Friday', 'Attending Friday',
      'Attending Saturday?', 'Saturday', 'Attending Saturday',
      'Attending Sunday?', 'Sunday', 'Attending Sunday',
      // Dietary fields
      'Dietary', 'Dietary Requirements', 'Diet'
    ];
    
    console.log('\n=== Testing Field Updates ===');
    
    for (const fieldName of fieldNamesToTry) {
      try {
        console.log(`Testing update with field: "${fieldName}"`);
        
        // Create an update object with just this field
        const updateObject = {};
        
        // Set different test values based on field type
        if (fieldName.includes('Friday') || fieldName.includes('Saturday') || fieldName.includes('Sunday')) {
          updateObject[fieldName] = true; // Boolean for days
        } else if (fieldName.includes('Dietary')) {
          updateObject[fieldName] = 'Test dietary note'; // String for dietary
        } else {
          updateObject[fieldName] = 'Yes'; // String for RSVP status
        }
        
        // Attempt to update
        await base('Guests').update(sampleGuest.id, updateObject);
        console.log(`✅ SUCCESS: Field "${fieldName}" updated successfully`);
      } catch (error) {
        console.log(`❌ FAILED: Field "${fieldName}" - ${error.message}`);
      }
    }
    
    // Get the updated record to see what actually changed
    const updatedGuest = await base('Guests').find(sampleGuest.id);
    console.log('\n=== Updated Guest Record ===');
    console.log('ID:', updatedGuest.id);
    console.log('Fields:', JSON.stringify(updatedGuest.fields, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testFields();