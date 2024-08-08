import { zValidator } from "@hono/zod-validator";
import { Context, Hono } from "hono";
import { z } from "zod";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { TeamPage, TeamItem, TeamItemEdit } from "../components/team";
import { Layout } from "../components";
import { teams, departments, user } from "../schema";
import { checkAuthMiddleware } from "../lucia";
import { Session } from "lucia";
import { errorHandler, zodErrorHandler, successHandler } from "../utils/alerts";

const app = new Hono<AuthEnv>();

app.use("*", checkAuthMiddleware);

const zodSchema = z.object({
  name: z.string().min(1).max(40),
  department: z.coerce.number().int()
})

app.post(
  "/new",
  zValidator(
    "form",
    zodSchema,
    zodErrorHandler
  ),
  async (c) => {
    const session = c.get("session")
    const newTeam = await drizzle(c.env.DB)
      .insert(teams)
      .values({ ...c.req.valid("form"), createdBy: session.user.userId })
      .returning()
      .get();

    const department = await drizzle(c.env.DB).select().from(departments).where(eq(departments.id, newTeam.department));    

    c.header('HX-Trigger','clearAlerts');
    return c.html(
      <>
        <TeamItem {...{teams: newTeam, departments: department[0]}} />        
        {successHandler('Create', `Team ${newTeam.name} created`)}
      </>
    );
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
    const updatedTeam = await drizzle(c.env.DB)
      .update(teams)
      .set({ ...c.req.valid("form"), createdBy: session.user.userId })
      .where(eq(teams.id, id))
      .returning()
      .get();

    const department = await drizzle(c.env.DB).select().from(departments).where(eq(departments.id, updatedTeam.department));    

    c.header('HX-Trigger','clearAlerts');
    return c.html(
      <>
        <TeamItem {...{teams: updatedTeam, departments: department[0]}} />
        {successHandler('Updated', `Team ${updatedTeam.name} updated`)}
      </>);
  }
);

app.delete("/delete/:id{[0-9]+}", async (c) => {
  const id = parseInt(c.req.param().id);
  const db = drizzle(c.env.DB);  
  await drizzle(c.env.DB).delete(teams).where(eq(teams.id, id)).run();
  return c.html(successHandler('Deleted', `Team ${id} deleted`));
});

app.get("/edit/:id{[0-9]+}", async (c) => {
  const id = parseInt(c.req.param().id);
  const db = drizzle(c.env.DB);  
  const team = await drizzle(c.env.DB).select().from(teams).where(eq(teams.id, id));  
  const department = await drizzle(c.env.DB).select().from(departments).where(eq(departments.id, team[0].department));
  const departmentList = await drizzle(c.env.DB).select().from(departments).all();
  return c.html(<TeamItemEdit {...{teams: team[0], departments: department[0], departmentList }} />);
});

app.get("/create", async (c) => {
  const departmentList = await drizzle(c.env.DB).select().from(departments).all();  
  return c.html(<TeamItemEdit {...{teams: {id: 0, name: '', created: '', createdBy: ''}, departments: {}, departmentList}} />);  
});

app.get("/:id{[0-9]+}", async (c) => {
  const id = parseInt(c.req.param().id);
  const db = drizzle(c.env.DB);  
  const createdByUser = alias(user, 'createdByUser')
  const team = await drizzle(c.env.DB)
    .select()
    .from(teams)    
    .leftJoin(departments, eq(teams.department, departments.id))
    .where(eq(teams.id, id));

  return c.html(<TeamItem {...team[0]} />);  
});

app.get("*", async(c) => {
  const session = c.get("session");
  const createdByUser = alias(user, 'createdByUser')
  const teamList = await drizzle(c.env.DB)
    .select()
    .from(teams)
    .leftJoin(departments, eq(teams.department, departments.id))
    .all();    

  return c.html(
    <Layout username={session.user.githubUsername} currentPage="team">      
      <TeamPage teams={teamList} />
    </Layout>  
  );
})

export { app as teamController };
