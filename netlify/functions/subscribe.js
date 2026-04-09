exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    const { firstName, email, neighborhood, subscriberType, source } = JSON.parse(event.body);
    if (!email || !email.includes('@')) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid email' }) };

    // --- NOTION ---
    const notionResponse = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28'
      },
      body: JSON.stringify({
        parent: { database_id: process.env.NOTION_SUBSCRIBERS_DB },
        properties: {
          'First Name': { title: [{ text: { content: firstName || '' } }] },
          'Email': { email: email },
          'Neighborhood': { rich_text: [{ text: { content: neighborhood || '' } }] },
          'Subscriber Type': { rich_text: [{ text: { content: subscriberType || '' } }] },
          'Date Signed Up': { rich_text: [{ text: { content: new Date().toLocaleDateString() } }] },
          'Source': { rich_text: [{ text: { content: source || 'website' } }] }
        }
      })
    });

    const notionData = await notionResponse.json();
    if (!notionResponse.ok) {
      console.error('Notion error:', JSON.stringify(notionData));
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Notion error' }) };
    }

    // --- BEEHIIV ---
    try {
      const beehiivResponse = await fetch(
        `https://api.beehiiv.com/v2/publications/${process.env.BEEHIIV_PUB_ID}/subscriptions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.BEEHIIV_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            reactivate_existing: false,
            send_welcome_email: true
          })
        }
      );

      const beehiivData = await beehiivResponse.json();
      if (!beehiivResponse.ok) {
        console.error('Beehiiv error:', JSON.stringify(beehiivData));
      }
    } catch (beehiivErr) {
      console.error('Beehiiv fetch error:', beehiivErr);
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error' }) };
  }
};
