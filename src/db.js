import mongoose from 'mongoose';

const db = mongoose.connection;
const DB_URL = `mongodb+srv://${process.env.DB_USER_ID}:${process.env.DB_PASSWORD}@bangbaclusterfree.4kaagvj.mongodb.net/?retryWrites=true&w=majority`;

mongoose.connect(DB_URL);

db.on('error', (error) => console.log('❌ DB connect fail. Error : ', error));
db.once('open', () => console.log('✅ DB connect success.'));

export default DB_URL;
