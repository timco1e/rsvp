require('dotenv').config();
const Airtable = require('airtable');

// Log environment variables (will be hidden in the output for security)
console.log('Personal Access Token length:', process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN ? process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN.length : 0);
console.log('Base ID:', process.env.AIRTABLE_BASE_ID);

// Configure Airtable
const base = new Airtable({ 
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN
}).base(process.env.AIRTABLE_BASE_ID);

// Test connection by retrieving records
async function testConnection() {
  try {
    console.log('Testing Airtable connection...');
    const records = await base('Invites').select({
      maxRecords: 1
    }).firstPage();
    
    console.log('Connection successful!');
    console.log('Found', records.length, 'records');
    if (records.length > 0) {
      console.log('First record ID:', records[0].id);
    }
  } catch (error) {
    console.error('Error connecting to Airtable:');
    console.error(error);
  }
}

testConnection();