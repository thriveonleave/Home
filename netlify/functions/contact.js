const { Client } = require('@notionhq/client');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  try {
    const { name, email, reason, message } = JSON.parse(event.body);
    if (!email || !email.includes('@')) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Valid email required' }) };
    const notion = new Client({ auth: process.env.NOTION_TOKEN });
    await notion.pages.create({
      parent: { database_id: process.env.NOTION_CONTACT_DB },
      properties: {
        'Name': { title: [{ text: { content: name || '' } }] },
        'Email': { email: email },
        'Reason': { rich_text: [{ text: { content: reason || '' } }] },
        'Message': { rich_text: [{ text: { content: message || '' } }] },
        'Date Submitted': { rich_text: [{ text: { content: new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }) } }] }
      }
    });
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error' }) };
  }
};
