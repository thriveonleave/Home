const { Client } = require('@notionhq/client');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  try {
    const { firstName, email, neighborhood, subscriberType, source } = JSON.parse(event.body);
    if (!email || !email.includes('@')) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Valid email required' }) };
    const notion = new Client({ auth: process.env.NOTION_TOKEN });
    await notion.pages.create({
      parent: { database_id: process.env.NOTION_SUBSCRIBERS_DB },
      properties: {
        'First Name': { title: [{ text: { content: firstName || '' } }] },
        'Email': { email: email },
        'Neighborhood': { rich_text: [{ text: { content: neighborhood || '' } }] },
        'Subscriber Type': { rich_text: [{ text: { content: subscriberType || '' } }] },
        'Date Signed Up': { rich_text: [{ text: { content: new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }) } }] },
        'Source': { rich_text: [{ text: { content: source || 'website' } }] }
      }
    });
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error' }) };
  }
};
