import express from 'express';
import routes from './routes/medicine';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient()

prisma.$connect().then(()=> console.log('connected to database')).catch((err)=> console.log(`could not connect to db ${err}`));

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/', routes);


const port = process.env.PORT || 4000
app.listen(port, () => {
    console.log(`app is listening to port ${port}`);
});
