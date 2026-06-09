import { readFileSync } from 'fs';
import { join } from 'path';

export default function handler(req, res) {
  try {
    const filePath = join(process.cwd(), 'maintenance.json');
    const data = readFileSync(filePath, 'utf-8');
    const maintenance = JSON.parse(data);

    // Combine date and time into a UTC Date object
    let endTimeISO = null;
    if (maintenance.endDate && maintenance.endTime) {
      try {
        // Parse time like "2:00 AM" or "4:30 PM"
        const timeMatch = maintenance.endTime.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          const minutes = parseInt(timeMatch[2]);
          const period = timeMatch[3].toUpperCase();

          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;

          const dateStr = `${maintenance.endDate}T${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:00Z`;
          endTimeISO = new Date(dateStr).toISOString();
        }
      } catch (_) {
        // If parsing fails, fall back to no endTime
        endTimeISO = null;
      }
    }

    res.status(200).json({
      active: maintenance.active === true,
      title: maintenance.title || 'Maintenance',
      message: maintenance.message || '',
      startTime: null,          // We don't use startTime anymore
      endTime: endTimeISO       // This is what the countdown reads
    });
  } catch (error) {
    res.status(200).json({ active: false });
  }
}
