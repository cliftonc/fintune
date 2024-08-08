import { zValidator } from "@hono/zod-validator";
import { Context, Hono } from "hono";
import { z } from "zod";
import { drizzle } from "drizzle-orm/d1";
import { eq, sql } from "drizzle-orm";
import { alias, SQLiteSyncDialect } from "drizzle-orm/sqlite-core";
import { eq, sql } from "drizzle-orm";
import { DepartmentPage, DepartmentItem, DepartmentItemEdit } from "../components/department";
import { Layout } from "../components";
import { departments, teams, user } from "../schema";
import { checkAuthMiddleware } from "../lucia";
import { Session } from "lucia";
import { errorHandler, zodErrorHandler, successHandler } from "../utils/alerts";

const app = new Hono<AuthEnv>();

const index = async (db, {object_key, type, org, search_data}) => {
  // Always delete to update
  await db.run(sql`delete from search_fts where object_key = ${object_key}`)
  const result = await db.run(sql`insert into search_fts 
      (object_key, type, org, search_data) 
      values(${object_key}, ${type}, ${org}, ${search_data})`)     
  return;
}

app.use("*", checkAuthMiddleware);
app.use("*", async (c, next) => {
  c.db = drizzle(c.env.DB)
  return await next()
});

app.get("/:search", async (c) => {
  const search = c.req.param().search;
  const sanitizedQuery = search.replaceAll('"', '""');

  const searchSql = sql`
      SELECT 
        object_key, 
        type, 
        org, 
        search_data
      FROM search_fts
      WHERE search_fts MATCH ${sanitizedQuery}
      ORDER BY rank
    `
  const res = await c.db.run(searchSql);
  return c.html(<h1>{res.results.map((r) => <div>{r.type} - {r.search_data}</div>)}</h1>);  
});

app.get("/", async(c) => {
  const session = c.get("session");
  
  return c.html(
    <Layout theme={c.theme} username={session.user.githubUsername} currentPage="department">      
      <h1>Search!</h1>
    </Layout>  
  );
})

export { app as searchController, index };
