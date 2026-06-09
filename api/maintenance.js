import { readFileSync } from 'fs';
import { join } from 'path';

export default function handler(req, res) {
  try {
    const filePath = join(process.cwd(), 'maintenance.json');
    const data = readFileSync(filePath, 'utf-8');
    const maintenance = JSON.parse(data);
    res.status(200).json(maintenance);
  } catch (error) {
    // If the file doesn't exist or is invalid, return no maintenance
    res.status(200).json({ active: false });
  }
}
