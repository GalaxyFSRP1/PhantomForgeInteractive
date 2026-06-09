export default async function handler(req, res) {
  try {
    const apiKey = process.env.UPTIMEROBOT_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

    let monitorId = req.query.id || process.env.GRAPH_MONITOR_ID;
    if (!monitorId) {
      const monitorsRes = await fetch('https://api.uptimerobot.com/v2/getMonitors', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: `api_key=${apiKey}&format=json&logs=0`
      });
      const monitorsData = await monitorsRes.json();
      if (monitorsData.monitors && monitorsData.monitors.length > 0) {
        monitorId = monitorsData.monitors[0].id;
      } else {
        return res.status(400).json({ error: 'No monitors found' });
      }
    }

    const logsRes = await fetch('https://api.uptimerobot.com/v2/getMonitors', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: `api_key=${apiKey}&format=json&monitors=${monitorId}&custom_uptime_ratios=1&logs=1&logs_start_date=${Date.now() - 86400000}&logs_end_date=${Date.now()}`
    });
    const data = await logsRes.json();
    if (data.stat !== 'ok') throw new Error('UptimeRobot API error');

    const monitor = data.monitors[0];
    const logs = monitor.logs || [];
    const labels = logs.map(log => new Date(log.datetime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const responseTimes = logs.map(log => log.response_time);

    res.status(200).json({
      monitorId: monitor.id,
      monitorName: monitor.friendly_name,
      labels,
      responseTimes,
      averageResponseTime: responseTimes.length 
        ? Math.round(responseTimes.reduce((a,b) => a+b, 0) / responseTimes.length)
        : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
