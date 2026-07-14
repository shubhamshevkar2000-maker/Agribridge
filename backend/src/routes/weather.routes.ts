import { Router } from 'express';
import { protect } from '../middlewares/auth.middleware';
import { User } from '../models/User';
import { getWeatherData } from '../services/weather.service';

const router = Router();

router.get('/farmer', protect, async (req: any, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.location || !user.location.coordinates || user.location.coordinates.length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Farm location not set in profile. Please add your location first.' 
      });
    }

    const [lon, lat] = user.location.coordinates;
    const weatherRes = await getWeatherData(lat, lon);

    if (weatherRes.error) {
      return res.json({
        success: false,
        message: weatherRes.message,
        code: 'API_ERROR'
      });
    }

    res.json({ success: true, data: weatherRes.data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
