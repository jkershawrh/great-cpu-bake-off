# Separate Bake Off frontend

Deploy into `cost-aware-inference-demo`, alongside the existing `proof-api`
service. The frontend uses its own Deployment, Service, Route, and image stream;
it does not replace the Cost-Aware presentation or model deployments.

Apply `build.yaml`, then start a binary build from this repository. Exclude
node_modules, Git metadata, generated artifacts, and local configuration from
the upload. The Containerfile builds the Vite application inside the cluster.

Update the image digest in `frontend.yaml` from the completed build before
applying it. Wait for rollout readiness, then verify the catalog and all three
live bakery lanes through the new route. Keep cluster credentials outside Git.

## Cost interpretation

The displayed execution-cost proxy multiplies measured inference duration by
the selected hourly assumptions. It is not a throughput-qualified price or
full TCO. Already-provisioned CPU capacity sets the modeled incremental CPU
rate to zero, not total infrastructure cost. A downstream TCO assessment needs
volume, concurrency, utilization, hardware lifecycle, power, platform costs,
operations, and the customer's quality and latency requirements.
