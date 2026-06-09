export default async function handler(req, res) {
  try {
    const apiKey = process.env.UPTIMEROBOT_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

    const response = await fetch('https://api.uptimerobot.com/v2/getMonitors', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: `api_key=${apiKey}&format=json&logs=0`
    });
    const data = await response.json();

    if (data.stat !== 'ok') throw new Error('UptimeRobot API error');

    const services = data.monitors.map(m => ({
      id: m.id,
      name: m.friendly_name,
      status: m.status,          // 0=paused, 1=down, 2=up, 8=seems down, 9=not checked
      statusText: m.status === 2 ? 'Operational' :
                  m.status === 9 ? 'Degraded' :
                  m.status === 1 ? 'Down' : 'Unknown'
    }));

    res.status(200).json({
      services,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
