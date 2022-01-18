import 'dotenv/config';
import './server';
import './db';
import app from './server';

const PORT = 4000;

app.listen(PORT, () => console.log('✅ Server connect success.'));
