const ftp = require("basic-ftp");
async function list() {
    const client = new ftp.Client();
    try {
        await client.access({
            host: "ftp.kliacustoms.net",
            user: "pekema-my@kliacustoms.net",
            password: "Iris6102009@#",
            secure: true,
            secureOptions: { rejectUnauthorized: false }
        });
        const list = await client.list("/");
        console.log("Root directory contents:");
        list.forEach(item => console.log(item.name));
    } catch(e) { console.error(e); }
    client.close();
}
list();
