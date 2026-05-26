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
        await client.uploadFromDir(path.join(__dirname, "dist"), "/");
    }
    catch (err) {
        console.log(err);
    }
    client.close();
}
deploy();
