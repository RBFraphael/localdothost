const asarmor = require('asarmor');
const { join } = require("path");

exports.default = async ({ appOutDir, packager }) => {
    try {
        const asarPath = join(packager.getResourcesDir(appOutDir), 'app.asar');
        console.log(`  • asarmor applying patches to ${asarPath}`);
        const archive = await asarmor.open(asarPath);
        archive.patch(); // apply default patches
        await archive.write(asarPath);
        console.log(`  • finished applying asar patches`);
    } catch (err) {
        console.error(err);
    }
};