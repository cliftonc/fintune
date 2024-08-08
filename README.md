# Fintune

![deploy](https://github.com/cliftonc/fintune/actions/workflows/deploy.yaml/badge.svg)

A playground using some interesting tech.

- [htmx](https://htmx.org/)
- [hono](https://hono.dev/)
- [drizzle](https://orm.drizzle.team/)

Plug this with any JS runtime (`cloudflare workers`, `deno`, `bun`, ...), any database (`mysql`, `sqlite`, `postgre`) or cloud database (`d1`, `neon`, `turso`, ...).

This example uses:

- [cloudflare workers](https://developers.cloudflare.com/workers/)
- [cloudflare d1](https://developers.cloudflare.com/d1/)
- [daisyUI](https://daisyui.com/)
- [unocss](https://unocss.dev/)

## run locally

First, create a Cloudflare account. Then:

- clone repo
- `npm install` (or whatever package manager you prefer)
- create d1 database

```bash
npx wrangler d1 create <your-db-name>
```

copy the output and replace things in `wrangler.toml`.

- apply migrations to local db

```bash
npm run d1:local:apply
```

- run the server locally

```bash
npm run dev
```

## deploy

- apply migrations to d1

```bash
npm run d1:apply
```

- deploy

```bash
npm run deploy
```

and voila. as easy as that.

## migrations

- change stuff in `db/schema.ts`
- then run

```bash
npm run drizzle:generate
npm run d1:local:apply
```

this will generate a new migration and apply it. Rerun the `deploy` steps to ship it to production.
