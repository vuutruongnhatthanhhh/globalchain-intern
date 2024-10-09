import { Request, Response } from 'express';
import * as UserService from '../services/UserService';


export const createKey = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { user } = req.body;
        const response = await UserService.createKey(user);
        return res.status(200).json(response);
    } catch (e: unknown) {
        if (e instanceof Error) {
            return res.status(404).json({
                message: e.message || 'An error occurred',
            });
        } else {
            return res.status(404).json({
                message: 'An unknown error occurred',
            });
        }
    }
};

// export const verify = async (req: Request, res: Response): Promise<Response> => {
//     try {
//         const { token } = req.body;
//         const response = await UserService.verifyUser(token);
//         return res.status(200).json(response);
//     } catch (e) {
//         return res.status(404).json({
//             message: (e as Error).message
//         });
//     }
// }

export const getAllUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { token } = req.body;
        const response = await UserService.getAllUser(token);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: (e as Error).message
        });
    }
}
