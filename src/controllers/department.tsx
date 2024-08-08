import { zValidator } from "@hono/zod-validator";
import { Context, Hono } from "hono";
import { z } from "zod";
import { drizzle } from "drizzle-orm/d1";
import { eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { DepartmentPage, DepartmentItem, DepartmentItemEdit } from "../components/department";
import { Layout } from "../components";
import { departments, teams, user } from "../schema";
import { checkAuthMiddleware } from "../lucia";
import { Session } from "lucia";
import { errorHandler, zodErrorHandler, successHandler } from "../utils/alerts";

const app = new Hono<AuthEnv>();

app.use("*", checkAuthMiddleware);
app.use("*", async (c, next) => {
  c.db = drizzle(c.env.DB)
  return await next()
});

const deptSql = (id) => sql`
  SELECT 
    ${departments}.*,
    (select count(*) from ${teams} where ${teams.department}=${departments.id} ) as teams
  FROM 
    ${departments}  
  WHERE
    ${departments.id} = ${id}
`

app.post(
  "/new",
  zValidator(
    "form",
    z.object({
      name: z.string().min(1).max(40),
    }),
    zodErrorHandler
  ),
  async (c) => {
    const session = c.get("session")
    const newDepartment = await c.db
      .insert(departments)
      .values({ ...c.req.valid("form"), createdBy: session.user.userId })
      .returning()
      .get();      
      const department = await c.db.run(deptSql(newDepartment.id))
    c.header('HX-Trigger','clearAlerts');
    return c.html(
      <>
        <DepartmentItem {...department.results[0]} />        
        {successHandler('Create', `Department ${newDepartment.name} created`)}
      </>
    );
  }
);

app.put(
  "/:id{[0-9]+}",
  zValidator(
    "form",
    z.object({
      name: z.string().min(1).max(40),
    }),
    zodErrorHandler
  ),
  async (c) => {
    const session = c.get("session")
    const id = parseInt(c.req.param().id);
    const updatedDepartment = await c.db
      .update(departments)
      .set({ ...c.req.valid("form"), createdBy: session.user.userId })
      .where(eq(departments.id, id))
      .returning()
      .get();
    const department = await c.db.run(deptSql(updatedDepartment.id))
    c.header('HX-Trigger','clearAlerts');
    return c.html(
      <>
        <DepartmentItem {...department.results[0]} />
        {successHandler('Updated', `Department ${updatedDepartment.name} updated`)}
      </>);
  }
);

app.delete("/delete/:id{[0-9]+}", async (c) => {
  const id = parseInt(c.req.param().id);
  const db = c.db;  
  try {
    await c.db.delete(departments).where(eq(departments.id, id)).run();
  } catch(ex) {
    const department = await c.db.run(deptSql(id))
    return c.html(
      <>
        <DepartmentItem {...department.results[0]} />
        {errorHandler('Department has teams!', 'Cannot delete a department that has teams attached to it :D')}
      </>)
  }
  return c.html(successHandler('Deleted', `Department ${id} deleted`));
});

app.get("/edit/:id{[0-9]+}", async (c) => {
  const id = parseInt(c.req.param().id);
  const db = c.db;  
  const department = await c.db.select().from(departments).where(eq(departments.id, id));  
  return c.html(<DepartmentItemEdit {...department[0]} />);  
});

app.get("/create", async (c) => {
  return c.html(<DepartmentItemEdit {...{id: 0, name: '', created: '', createdBy: ''}} />);  
});

app.get("/:id{[0-9]+}", async (c) => {
  const id = parseInt(c.req.param().id);
  const db = c.db;   
  const department = await db.run(deptSql(id))
  return c.html(<DepartmentItem {...department.results[0]} />);  
});

app.get("*", async(c) => {
  const session = c.get("session");
  const db = c.db
  const departmentList = await db.run(sql`
    SELECT 
      departments.*,
      (select count(*) from ${teams} where department=departments.id ) as teams
    FROM 
      ${departments}    
  `)  

  return c.html(
    <Layout theme={c.theme} username={session.user.githubUsername} currentPage="department">      
      <DepartmentPage departments={departmentList.results} />
    </Layout>  
  );
})

export { app as departmentController };
