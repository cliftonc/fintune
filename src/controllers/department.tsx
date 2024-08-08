import { zValidator } from "@hono/zod-validator";
import { Context, Hono } from "hono";
import { z } from "zod";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { DepartmentPage, DepartmentItem, DepartmentItemEdit } from "../components/department";
import { Layout } from "../components";
import { departments, user } from "../schema";
import { checkAuthMiddleware } from "../lucia";
import { Session } from "lucia";
import { errorHandler, zodErrorHandler, successHandler } from "../utils/alerts";

const app = new Hono<AuthEnv>();

app.use("*", checkAuthMiddleware);

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
    const newDepartment = await drizzle(c.env.DB)
      .insert(departments)
      .values({ ...c.req.valid("form"), createdBy: session.user.userId })
      .returning()
      .get();      
    c.header('HX-Trigger','clearAlerts');
    return c.html(
      <>
        <DepartmentItem {...newDepartment} />        
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
    const updatedDepartment = await drizzle(c.env.DB)
      .update(departments)
      .set({ ...c.req.valid("form"), createdBy: session.user.userId })
      .where(eq(departments.id, id))
      .returning()
      .get();
    c.header('HX-Trigger','clearAlerts');
    return c.html(
      <>
        <DepartmentItem {...updatedDepartment} />
        {successHandler('Updated', `Department ${updatedDepartment.name} updated`)}
      </>);
  }
);

app.delete("/delete/:id{[0-9]+}", async (c) => {
  const id = parseInt(c.req.param().id);
  const db = drizzle(c.env.DB);  
  try {
    await drizzle(c.env.DB).delete(departments).where(eq(departments.id, id)).run();
  } catch(ex) {
    const department = await drizzle(c.env.DB).select().from(departments).where(eq(departments.id, id));  
    return c.html(
      <>
        <DepartmentItem {...department[0]} />
        {errorHandler('Department has teams!', 'Cannot delete a department that has teams attached to it :D')}
      </>)
  }
  return c.html(successHandler('Deleted', `Department ${id} deleted`));
});

app.get("/edit/:id{[0-9]+}", async (c) => {
  const id = parseInt(c.req.param().id);
  const db = drizzle(c.env.DB);  
  const department = await drizzle(c.env.DB).select().from(departments).where(eq(departments.id, id));  
  return c.html(<DepartmentItemEdit {...department[0]} />);  
});

app.get("/create", async (c) => {
  return c.html(<DepartmentItemEdit {...{id: 0, name: '', created: '', createdBy: ''}} />);  
});

app.get("/:id{[0-9]+}", async (c) => {
  const id = parseInt(c.req.param().id);
  const db = drizzle(c.env.DB);  
  const createdByUser = alias(user, 'createdByUser')
  const department = await drizzle(c.env.DB)
    .select()
    .from(departments)    
    .where(eq(departments.id, id));  
  return c.html(<DepartmentItem {...department[0]} />);  
});

app.get("*", async(c) => {
  const session = c.get("session");
  const createdByUser = alias(user, 'createdByUser')
  const departmentList = await drizzle(c.env.DB)
    .select()
    .from(departments)    
    .all();

  return c.html(
    <Layout username={session.user.githubUsername} currentPage="department">      
      <DepartmentPage departments={departmentList} />
    </Layout>  
  );
})

export { app as departmentController };
