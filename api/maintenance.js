import { readFileSync } from 'fs';
import { join } from 'path';

export default function handler(req, res) {
  try {
    const filePath = join(process.cwd(), 'maintenance.json');
    const data = readFileSync(filePath, 'utf-8');
    const maintenance = JSON.parse(data);
    // Ensure active is boolean
    res.status(200).json({
      active: maintenance.active === true,
      title: maintenance.title || 'Maintenance',
      message: maintenance.message || '',
      startTime: maintenance.startTime || null,
      endTime: maintenance.endTime || null
    });
  } catch (error) {
    // If file missing / invalid -> not in maintenance
    res.status(200).json({ active: false });
  }
}
