const https = require('https');

const url = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Crest_of_the_Royal_Malaysian_Customs.svg/256px-Crest_of_the_Royal_Malaysian_Customs.svg.png";

const options = {
    headers: { 'User-Agent': 'Mozilla/5.0' }
};

https.get(url, options, (res) => {
    let chunks = [];
    res.on('data', (chunk) => {
        chunks.push(chunk);
    });
    res.on('end', () => {
        let buffer = Buffer.concat(chunks);
        let base64 = buffer.toString('base64');
        require('fs').writeFileSync('logo.ts', `export const KASTAM_LOGO = "data:image/png;base64,${base64}";\n`);
    });
}).on("error", (err) => {
    console.log("Error: ", err.message);
});
