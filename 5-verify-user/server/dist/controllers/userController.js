"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUser = exports.createKey = void 0;
const UserService = __importStar(require("../services/UserService"));
const createKey = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req.body;
        const response = yield UserService.createKey(user);
        return res.status(200).json(response);
    }
    catch (e) {
        if (e instanceof Error) {
            return res.status(404).json({
                message: e.message || 'An error occurred',
            });
        }
        else {
            return res.status(404).json({
                message: 'An unknown error occurred',
            });
        }
    }
});
exports.createKey = createKey;
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
const getAllUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        const response = yield UserService.getAllUser(token);
        return res.status(200).json(response);
    }
    catch (e) {
        return res.status(404).json({
            message: e.message
        });
    }
});
exports.getAllUser = getAllUser;
