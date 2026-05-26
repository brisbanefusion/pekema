const ftp = require("basic-ftp");
const path = require("path");

async function deploy() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: "ftp.kliacustoms.net",
            user: "pekema-my@kliacustoms.net",
            password: "Iris6102009@#",
            secure: true,
            secureOptions: { rejectUnauthorized: false }
        });
        console.log("Uploading api.php...");
        await client.uploadFrom(path.join(__dirname, "api.php"), "/api.php");
        console.log("Uploading dist...");
        await client.uploadFromDir(path.join(__dirname, "dist"), "/");
        console.log("Deploy complete!");
    }
    catch (err) { console.error(err); }
    client.close();
}
deploy();
