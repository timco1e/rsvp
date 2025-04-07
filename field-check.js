require('dotenv').config();
const Airtable = require('airtable');

// Configure Airtable with Personal Access Token
const base = new Airtable({ 
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN
}).base(process.env.AIRTABLE_BASE_ID);

async function checkFields() {
  try {
    console.log('Checking Guests table fields...');
    
    // Get fields from Guests table
    const fields = await base('Guests').fields();
    console.log('\nFields in "Guests" table:');
    
    fields.forEach(field => {
      console.log(`- ${field.name} (${field.type})`);
    });
    
    // Get a sample record from Guests table
    console.log('\nSample Guest Record:');
    const guests = await base('Guests').select({ maxRecords: 1 }).firstPage();
    
    if (guests.length > 0) {
      const sampleGuest = guests[0];
      console.log('Record ID:', sampleGuest.id);
      console.log('Fields:', JSON.stringify(sampleGuest.fields, null, 2));
    } else {
      console.log('No guest records found');
    }
    
    // Check Invites table
    console.log('\nChecking Invites table fields...');
    
    // Get fields from Invites table
    const inviteFields = await base('Invites').fields();
    console.log('\nFields in "Invites" table:');
    
    inviteFields.forEach(field => {
      console.log(`- ${field.name} (${field.type})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkFields();