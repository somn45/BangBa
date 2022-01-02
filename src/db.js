import mongoose from 'mongoose';

const db = mongoose.connection;

mongoose.connect(process.env.DB_URL);

db.on('error', (error) => console.log('❌ DB connect fail. Error : ', error));
db.once('open', () => console.log('✅ DB connect success.'));
