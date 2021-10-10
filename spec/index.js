const https = require("https");
const axios = require("axios");
const { getClusters } = require("../config");

const getClusterSpec = async (config) => {
  const specReq = await axios.get(`${config.apiServer}/openapi/v2`, {
    headers: { Authorization: `Bearer ${config.authToken}` },
    httpsAgent: new https.Agent({
      ca: config.ca,
    }),
  });
  return specReq.data;
};

const buildApiSpec = async () => {
  const clusters = getClusters();
  var mergedSpec = {};

  // merge the openapi v2 spec from each cluster so we have all paths
  // and definitions
  for (const cluster in clusters) {
    const config = clusters[cluster][1];
    try {
      const spec = await getClusterSpec(config);
      if (Object.keys(mergedSpec).length === 0) {
        mergedSpec = spec;
      } else {
        for (const path in spec.paths) {
          if (!(path in mergedSpec.paths)) {
            mergedSpec.paths[path] = spec.paths[path];
          }
        }
        for (const definition in spec.definitions) {
          if (!(definition in mergedSpec.definitions)) {
            mergedSpec.definitions[definition] = spec.definitions[definition];
          }
        }
      }
    } catch (error) {
      console.error(`Could not merge spec for cluster ${cluster}`, error);
    }
  }

  // add a parameter to select which cluster the request is routed to
  // each path
  const newPaths = {};
  for (const path in mergedSpec.paths) {
    // prepend the path with a cluster param and add it to the spec
    newPaths[`/clusters/{cluster}${path}`] = {
      ...mergedSpec.paths[path],
      parameters: [
        ...(mergedSpec.paths[path].parameters || []),
        {
          uniqueItems: true,
          type: "string",
          description: "The cluster id",
          name: "cluster",
          in: "path",
          required: true,
        },
      ],
    };
  }

  return {
    ...mergedSpec,
    paths: newPaths,
  };
};

const handleApiEndpoint = async (req, res) => {
  res.json(await buildApiSpec())
};

module.exports = { buildApiSpec, handleApiEndpoint };
