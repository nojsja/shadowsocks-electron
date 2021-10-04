const targz = require("targz");
const fetch = require("node-fetch");
const fs = require("fs-extra");
const os = require("os");
const path = require("path");

const target =
  os.type() === "Linux" ? "linux" : os.type() === "Darwin" ? "mac" : "win";
const platform =
  os.type() === "Linux"
    ? "linux"
    : os.type() === "Darwin"
    ? "darwin"
    : "windows";
const arch = "x64";

const ssUrl =
  "https://api.github.com/repos/robertying/shadowsocks-libev-portable/releases/latest";
const v2rayUrl =
  "https://api.github.com/repos/shadowsocks/v2ray-plugin/releases/latest";
const kcptunUrl =
  "https://api.github.com/repos/robertying/kcptun/releases/latest";
const gfwListUrl =
  "https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt";

const downloadGitHubAssets = async (url, target, arch, saveAs) => {
  let res = await fetch(url);
  const releases = await res.json();

  const assets = releases.assets;
  const asset = assets.find(
    i => i.name.includes(target) && i.name.includes(arch)
  );

  console.log(path.resolve(__dirname, saveAs));
  if (fs.existsSync(path.resolve(__dirname, saveAs))) {
    return Promise.resolve();
  }

  console.log(`Downloading from ${asset.browser_download_url}`);

  res = await fetch(asset.browser_download_url);
  const fileStream = fs.createWriteStream(path.resolve(__dirname, saveAs));
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", err => {
      reject(err);
    });
    fileStream.on("finish", function() {
      resolve();
    });
  });
};

(async () => {
  await downloadGitHubAssets(ssUrl, target, "x64", "bin.tar.gz");

  console.log("Extracting...");
  await new Promise((resolve, reject) =>
    targz.decompress(
      {
        src: path.resolve(__dirname, "bin.tar.gz"),
        dest: __dirname
      },
      function(err) {
        if (err) {
          console.log(err);
          reject();
        } else {
          console.log("Done!");
          resolve();
        }
      }
    )
  );

  await downloadGitHubAssets(v2rayUrl, platform, "amd64", "v2ray.tar.gz");

  console.log("Extracting...");
  await new Promise((resolve, reject) =>
    targz.decompress(
      {
        src: path.resolve(__dirname, "v2ray.tar.gz"),
        dest: __dirname
      },
      function(err) {
        if (err) {
          console.log(err);
          reject();
        } else {
          console.log("Done!");
          resolve();
        }
      }
    )
  );

  await downloadGitHubAssets(kcptunUrl, platform, "amd64", "kcptun.tar.gz");

  console.log("Extracting...");
  await new Promise((resolve, reject) =>
    targz.decompress(
      {
        src: path.resolve(__dirname, "kcptun.tar.gz"),
        dest: __dirname
      },
      function(err) {
        if (err) {
          console.log(err);
          reject();
        } else {
          console.log("Done!");
          resolve();
        }
      }
    )
  );

  console.log("Removing other binary...");

  if (target !== "win") {
    await fs.remove(path.resolve(__dirname, "bin/ss-manager"));
  }
  await fs.remove(
    path.resolve(
      __dirname,
      target === "win" ? "bin/ss-server.exe" : "bin/ss-server"
    )
  );
  await fs.remove(
    path.resolve(
      __dirname,
      target === "win" ? "bin/ss-tunnel.exe" : "bin/ss-tunnel"
    )
  );

  console.log("Copying binary to bin...");
  await fs.copy(
    path.resolve(__dirname, "bin"),
    path.resolve(__dirname, `../bin/${target}/${arch}/`)
  );
  await fs.copyFile(
    path.resolve(__dirname, `v2ray-plugin_${platform}_amd64`),
    path.resolve(__dirname, `../bin/${target}/${arch}/v2ray-plugin`)
  );
  await fs.copyFile(
    path.resolve(__dirname, `client_${platform}_amd64`),
    path.resolve(__dirname, `../bin/${target}/${arch}/kcptun`)
  );

  if (fs.existsSync(path.join(__dirname, 'gfwlist.txt'))) {
    fs.readFile(path.join(__dirname, 'gfwlist.txt'), 'utf-8',async (err, text) => {
      if (!err) {
        const str = Buffer.from(text, 'base64').toString("ascii");
        await fs.writeFile(path.resolve(__dirname, "../pac/gfwlist.txt"), str);
      } else {
        console.log(err);
      }
    });
  } else {
    console.log(`Downloading from ${gfwListUrl}...`);
    const res = await fetch(gfwListUrl);
    const base64 = await res.text();
    const text = Buffer.from(base64, "base64").toString("ascii");
    await fs.writeFile(path.resolve(__dirname, "../pac/gfwlist.txt"), text);
  }


  console.log("All tasks completed");
})();
