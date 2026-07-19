import 'dotenv/config';
import jwt from 'jsonwebtoken';

const token = jwt.sign({ id: '6a56126a798409c2bcef3971' }, process.env.JWT_SECRET || 'super_secret_key_123', { expiresIn: '1d' });
console.log(token);
