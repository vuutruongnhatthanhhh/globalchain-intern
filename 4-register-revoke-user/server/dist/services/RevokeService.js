"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
// Thay thế appUser37 bằng giá trị bạn muốn
const userId = 'appUser38';
// Chạy kịch bản shell và truyền tham số
(0, child_process_1.exec)(`./run_commands.sh ${userId}`, (error, stdout, stderr) => {
    if (error) {
        console.error(`exec error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
});
