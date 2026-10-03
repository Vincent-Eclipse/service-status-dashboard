# Service status dashboard

A small React and TypeScript status view for measured availability and response latency. It keeps operational states explicit, avoids reporting a healthy state when monitoring data is missing, and reduces dense history into chart buckets without hiding the worst observation in a bucket.

The SVG charts are responsive, keyboard-independent and include accessible labels and point details. The demo data is generated locally and does not call a backend.

## Run locally

```sh
npm install
npm run dev
```

Tests and a production build can be run with `npm test` and `npm run build`.

This is a public-safe UI and domain-logic extract from a private website project. Authentication, administration features, APIs, infrastructure and real service data are deliberately not included.
