const { Client } = require('@notionhq/client');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  try {
    const { brandName, contactName, contactEmail, partnershipType, budgetRange, audienceAlignment, brandDescription } = JSON.parse(event.body);
    if (!contactEmail || !contactEmail.includes('@')) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Valid email required' }) };
    const notion = new Client({ auth: process.env.NOTION_TOKEN });
    await notion.pages.create({
      parent: { database_id: process.env.NOTION_PARTNERSHIPS_DB },
      properties: {
        'Brand Name': { title: [{ text: { content: brandName || '' } }] },
        'Contact Name': { rich_text: [{ text: { content: contactName || '' } }] },
        'Contact Email': { email: contactEmail },
        'Partnership Type': { rich_text: [{ text: { content: partnershipType || '' } }] },
        'Budget Range': { rich_text: [{ text: { content: budgetRange || '' } }] },
        'Audience Alignment': { rich_text: [{ text: { content: audienceAlignment || '' } }] },
        'Brand Description': { rich_text: [{ text: { content: brandDescription || '' } }] },
        'Date Submitted': { rich_text: [{ text: { content: new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }) } }] }
      }
    });
    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error' }) };
  }
};
