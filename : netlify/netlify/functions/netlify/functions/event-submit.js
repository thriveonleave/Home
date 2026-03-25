const { Client } = require('@notionhq/client');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  try {
    const { eventName, eventDescription, eventDate, eventTime, eventLocation, eventCategory, ticketPrice, registrationLink, submitterName, submitterEmail, whyThrive } = JSON.parse(event.body);
    if (!submitterEmail || !submitterEmail.includes('@')) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Valid email required' }) };
    const notion = new Client({ auth: process.env.NOTION_TOKEN });
    await notion.pages.create({
      parent: { database_id: process.env.NOTION_EVENTS_DB },
      properties: {
        'Event Name': { title: [{ text: { content: eventName || '' } }] },
        'Description': { rich_text: [{ text: { content: eventDescription || '' } }] },
        'Date': { rich_text: [{ text: { content: eventDate || '' } }] },
        'Time': { rich_text: [{ text: { content: eventTime || '' } }] },
        'Location': { rich_text: [{ text: { content: eventLocation || '' } }] },
        'Category': { rich_text: [{ text: { content: eventCategory || '' } }] },
        'Ticket Price': { rich_text: [{ text: { content: ticketPrice || '' } }] },
        'Registration Link': { url: registrationLink || null },
        'Submitter Name': { rich_text: [{ text: { content: submitterName || '' } }] },
        'Submitter Email': { email: submitterEmail },
        'Why Thrive on Leave': { rich_text: [{ text: { content: whyThrive || '' } }] },
        'Date Submitted': { rich_text: [{ text: { content: new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }) } }] }
      }
    });
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error' }) };
  }
};
