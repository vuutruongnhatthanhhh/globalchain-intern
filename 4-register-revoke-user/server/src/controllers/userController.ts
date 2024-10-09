import { Request, Response } from 'express';
import * as RegisterService from '../services/RegisterService';

export const createKey = async (req: Request, res: Response): Promise<Response> => {
    try {
        // Định nghĩa kiểu cho user nếu có thể
        const { user } = req.body;

        // Gọi service và nhận phản hồi
        const response = await RegisterService.createKey(user);

        // Trả về phản hồi với mã trạng thái 200
        return res.status(200).json(response);
    } catch (e: unknown) {
        // Xử lý lỗi khi e có kiểu unknown
        if (e instanceof Error) {
            // Lỗi có thuộc tính message
            return res.status(404).json({
                message: e.message || 'An error occurred',
            });
        } else {
            // Xử lý lỗi không phải là Error (có thể là lỗi khác hoặc không phải lỗi)
            return res.status(404).json({
                message: 'An unknown error occurred',
            });
        }
    }
};