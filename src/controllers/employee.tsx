import { zValidator } from "@hono/zod-validator";
import { Context, Hono } from "hono";
import { z } from "zod";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { EmployeePage, EmployeeItem, EmployeeItemEdit } from "../components/employee";
import { Layout } from "../components";
import { employees, user } from "../schema";
import { checkAuthMiddleware } from "../lucia";
import { Session } from "lucia";
import { errorHandler, zodErrorHandler, successHandler } from "../utils/alerts";
import { index } from './search';

const app = new Hono<AuthEnv>();

const zodSchema = z.object({
  name: z.string().min(1).max(40),
  employeeId: z.string().min(1).max(40),      
  started: z.string().min(10),
  finished: z.string().optional(),
  active: z.preprocess(value => value === 'on', z.boolean())
})

app.use("*", checkAuthMiddleware);

app.post(
  "/new",
  zValidator(
    "form",
    zodSchema,
    zodErrorHandler
  ),
  async (c) => {    
    const session = c.get("session")
    const newEmployee = await drizzle(c.env.DB)
      .insert(employees)
      .values({ ...c.req.valid("form"), createdBy: session.user.userId })
      .returning()
      .get();      

    const createdBy = await drizzle(c.env.DB)
      .select()
      .from(user)
      .where(eq(user.id, session.user.userId))

    await index(drizzle(c.env.DB), {
      object_key: `employee-${newEmployee.id}`,
      type: 'employee',
      org: 'infinitas',
      search_data: `${newEmployee.name} ${newEmployee.employeeId}`
    });

    const returnEmployee = {
      ...newEmployee,      
    }    
    c.header('HX-Trigger', 'clearAlerts');
    return c.html(
      <>
        <EmployeeItem {...returnEmployee} />
        {successHandler('Created', `Employee ${returnEmployee.name} created`)}
      </>);
  }
);

app.put(
  "/:id{[0-9]+}",
  zValidator(
    "form",
    zodSchema,
    zodErrorHandler
  ),
  async (c) => {
    const session = c.get("session")
    const id = parseInt(c.req.param().id);
    console.log(c.req.valid("form"))
    const updatedEmployee = await drizzle(c.env.DB)
      .update(employees)
      .set({ ...c.req.valid("form"), createdBy: session.user.userId })
      .where(eq(employees.id, id))
      .returning()
      .get();

    await index(drizzle(c.env.DB), {
      object_key: `employee-${updatedEmployee.id}`,
      type: 'employee',
      org: 'infinitas',
      search_data: `${updatedEmployee.name} ${updatedEmployee.employeeId}`
    });

    c.header('HX-Trigger','clearAlerts');
    return c.html(
      <>
        <EmployeeItem {...updatedEmployee} />
        {successHandler('Updated', `Employee ${updatedEmployee.name} updated`)}
      </>);
  }
);

app.delete("/delete/:id{[0-9]+}", async (c) => {
  const id = parseInt(c.req.param().id);
  const db = drizzle(c.env.DB);  
  await drizzle(c.env.DB).delete(employees).where(eq(employees.id, id)).run();
  return c.html(successHandler('Deleted', `Employee ${id} deleted`));
});

app.get("/edit/:id{[0-9]+}", async (c) => {
  const id = parseInt(c.req.param().id);
  const db = drizzle(c.env.DB);  
  const employee = await drizzle(c.env.DB).select().from(employees).where(eq(employees.id, id));  
  return c.html(<EmployeeItemEdit {...employee[0]} />);
});

app.get("/create", async (c) => {
  const newEmployee = {
    id: 0, 
    name: '', 
    employeeId: '',
    active: true,
    started: '',
    finished: '',
    created: '', 
    createdBy: ''
  }
  return c.html(<EmployeeItemEdit {...newEmployee} />);  
});

app.get("/:id{[0-9]+}", async (c) => {
  const id = parseInt(c.req.param().id);
  const db = drizzle(c.env.DB);  
  const createdByUser = alias(user, 'createdByUser')
  const department = await drizzle(c.env.DB).select()
    .from(employees)    
    .where(eq(employees.id, id));  
  return c.html(<EmployeeItem {...department[0]} />);  
});

app.get("*", async(c) => {
  const session = c.get("session");
  const createdByUser = alias(user, 'createdByUser')
  const employeeList = await drizzle(c.env.DB)
    .select()
    .from(employees)    
    .all();    

  return c.html(
    <Layout theme={c.theme} username={session.user.githubUsername} currentPage="employee">      
      <EmployeePage employees={employeeList} />
    </Layout>  
  );
})

export { app as employeeController };
