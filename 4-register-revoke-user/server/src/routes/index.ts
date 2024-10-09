import { Express } from 'express';
import UserRouter from './userRoutes';


const routes = (app: Express): void => {
    app.use('/api/user', UserRouter);
};

export default routes;
