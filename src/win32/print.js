"use strict";

const path = require("path");
const fs = require("fs");
const execAsync = require("../execAsync");
const tmp = require("tmp");

const tmpDir = tmp.dirSync();
const sourceSumatraPath = path.join(__dirname, "SumatraPDF.exe");
const destSumatraPath = path.join(tmpDir, "SumatraPDF.exe");

// We ran into some bugs with @vercel/pkg, where
// we need to copy this to a local file system to
// be allowed to execute this.
const ensureSumatraInLocalFileSystem = () => {
  if (fs.existsSync(destSumatraPath)) {
    return;
  }

  const sourceFile = fs.readFileSync(sourceSumatraPath);
  fs.writeFileSync(destSumatraPath, sourceFile);
  fs.chmodSync(destSumatraPath, 0o765); // maybe need to grant execute permission
};

const print = (pdf, options = {}) => {
  if (!pdf) throw "No PDF specified";
  if (typeof pdf !== "string") throw "Invalid PDF name";
  if (!fs.existsSync(pdf)) throw "No such file";

  ensureSumatraInLocalFileSystem();

  const args = [];

  const { printer, win32 } = options;

  if (printer) {
    args.push("-print-to", printer);
  } else {
    args.push("-print-to-default");
  }

  if (win32) {
    if (!Array.isArray(win32)) throw "options.win32 should be an array";
    win32.map(win32Arg => args.push(...win32Arg.split(" ")));
  }

  args.push("-silent", pdf);

  return execAsync(destSumatraPath, args);
};

module.exports = print;
