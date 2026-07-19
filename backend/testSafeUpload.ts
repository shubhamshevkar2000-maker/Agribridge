import { safeUpload } from './src/config/cloudinary';

async function run() {
  try {
    const res = await safeUpload('data:image/png;base64,iVBORw...', { folder: 'test' });
    console.log('Result:', res);
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}
run();
