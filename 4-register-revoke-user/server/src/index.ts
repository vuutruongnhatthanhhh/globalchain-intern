import express, { Request, Response } from 'express';
import routes from './routes';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

const app = express();
const port = 3001;

// Chính sách bảo mật của trình duyệt web
app.use(cors())
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
// Nhận chuỗi json từ dưới user gửi lên
app.use(bodyParser.json())
app.use(cookieParser())
routes(app);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
