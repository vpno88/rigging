const { getClusters } = require("../config");
const { buildApiSpec } = require("./index");

(async () => {
    const spec = await buildApiSpec();
    console.log(JSON.stringify(spec));
})();