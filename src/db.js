import mongoose from 'mongoose';

const db = mongoose.connection;

mongoose.connect('mongodb://127.0.0.1:27017/bangba');

db.on('error', (error) => console.log('❌ DB connect fail. Error : ', error));
db.once('open', () => console.log('✅ DB connect success.'));
