# rigging

Rigging is a multi-cluster API proxy for Kubernetes.

## Features

- provides API endpoints proxied to each respective cluster backend
- unified multi-cluster GraphQL API supporting CRDs
- fully configurable via environment variables
- authenticates with each cluster backend using service account tokens

## Examples

### REST 

Uses `/clusters/{cluster}` base path for each cluster's API, can be configured with normal Kubernetes client libraries or `kubectl`.

```
GET /clusters/{cluster}/apis/apps/v1/namespaces/{namespace}/deployments
```

### GraphQL

Uses a single `/graphql` endpoint. Each query in the schema accepts an argument to specify which cluster the request is for.

```
{
  listAppsV1NamespacedDeployment(
    cluster: $cluster
    namespace: $namespace
  ) {
    items {
      metadata {
        name
        namespace
      }
    }
  }
}
```

## Getting started

Before setting up your rigging, familiarise yourself with the environment variables used for configuration.

```
CLUSTER__NAME__API_SERVER=https://<api host>:<api port>/
CLUSTER__NAME__AUTH_TOKEN=<service account token>
CLUSTER__NAME__CA=<base64 encoded certificate>
```

These variables should be repeated where `NAME` is a unique identifier for each cluster.

The cluster name will be lowercased and converted to camel case:

- `NAME` becomes `name`
- `CLUSTER_NAME` becomes `clusterName`

You can either provide these in the environment directly or you can place them in a `.env` file in the app's root.

### Running locally

Add your configuration variables to a `.env` file in the app root.

Use `yarn` to install dependencies, then build the schema and run the server.

```
$ yarn
$ yarn buildschema
$ yarn start
```

Each cluster's API server must be available to build a complete schema.
If a cluster is down whilst the schema is being built the GraphQL API might be missing some resources.

