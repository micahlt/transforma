const path = require("path");
const ffmpeg = require("ffmpeg-static");
const { spawn } = require("child_process");

module.exports = (filePath, outputFolder, format, messager, callback) => {
  const output =
    path.join(outputFolder, path.basename(filePath, path.extname(filePath))) +
    "-converted." +
    format;
  console.log(`OUTPUT ${output}`);
  console.log(`CONVERTING FILE "${filePath}" TO FORMAT ${format}`);
  console.log(`USING FFMPEG @ ${ffmpeg}`);
  const command = spawn(`${ffmpeg}`, ["-i", `${filePath}`, `${output}`]);
  command.stdout.on("data", (d) => {
    console.log(d.toString());
    messager.send("stdout", d.toString());
  });
  command.stderr.on("data", (d) => {
    console.error(d.toString());
    messager.send("stderr", d.toString());
  });
  command.on("close", (code) => {
    console.log(code);
    messager.send("finish", code);
  });
  command.on("error", (err) => {
    messager.send("finish", err.name);
  });
  callback(command);
};
