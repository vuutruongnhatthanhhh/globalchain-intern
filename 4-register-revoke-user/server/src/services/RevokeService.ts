import { exec } from "child_process";
import fs from "fs";
import path from "path";

const userId = "appUser1";

// Cách chạy
// npm run build
// node dist/services/RevokeService.js

const filePath = path.join("dist", "services", "wallet", `${userId}.id`);

fs.unlink(filePath, (err) => {
  if (err) {
    console.error(`Error deleting file: ${err.message}`);
    return;
  }
  console.log(`File ${filePath} deleted successfully.`);

  exec(`./run_commands.sh ${userId}`, (error, stdout, stderr) => {
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
});
