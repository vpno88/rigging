const dotenv = require("dotenv");
const nconf = require("nconf");

dotenv.config();

const snakeToCamel = (str) =>
  str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace("-", "").replace("_", "")
    );

const transformKey = (obj) => {
  const key = obj.key
    .split("__")
    .map((part) => {
      return snakeToCamel(part);
    })
    .join("__");
  return {
    key,
    value: obj.value,
  };
};

const transformCACert = (obj) => {
  if (obj.key.endsWith("ca")) {
    const value = Buffer.from(obj.value, "base64").toString();
    return {
      key: obj.key,
      value,
    };
  }
  return obj;
};

const transforms = [transformKey, transformCACert];

nconf.env({
  separator: "__",
  parseValues: true,
  transform: (obj) => {
    return transforms.reduce((previous, next) => {
      return next(previous);
    }, obj);
  },
});

const getClusters = () => {
  return Object.entries(nconf.get("cluster") || {});
};

module.exports = { nconf, getClusters };
