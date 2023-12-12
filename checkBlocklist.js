const fs = require('fs');

// from blocklist.json
const blocklist = JSON.parse(fs.readFileSync('blocklist.json', 'utf8'));

function checkAgainstBlocklist(str, blocklist) {
    return blocklist.some(list => list.every(elem => str.includes(elem)));
}

if (require.main === module) {
    const testStrings = [
        "NODE_OPTIONS shell argv0", // Should return true
        "context jquery something else", // Should return true
        "random string", // Should return false
        "argv0 NODE_OPTIONS", // Should return true
        "NODE_OPTIONS missing argv0", // Should return false
        "title = userData  [__proto__] shell = /proc/self/exe argv0 = require(\\\"child_process\\\").execSync(\\\"cat flag.txt > public/pages/empty.html\\\")// \n  NODE_OPTIONS = \\\"--require /proc/self/cmdline\\\"  [user]  name = \\\"admin\\\"  password =\\\"dksjhf2798y8372ghkjfgsd8jbfsig7g2gkfjsh\\\""
    ];

    testStrings.forEach(testStr => {
        console.log(`Test string: "${testStr}" - Result: ${checkAgainstBlocklist(testStr, blocklist)}`);
    });
}

module.exports = checkAgainstBlocklist;
