import { zValidator } from "@hono/zod-validator";
import { Context, Hono } from "hono";
import { z } from "zod";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { PeopleTeamPage } from "../components/people-team";
import { Layout } from "../components";
import { peopleTeams, teams, employees, calendars, periods, user } from "../schema";
import { checkAuthMiddleware } from "../lucia";
import { Session } from "lucia";
import { errorHandler, zodErrorHandler, successHandler } from "../utils/alerts";
import { index, removeIndex } from './search';

const app = new Hono<AuthEnv>();

app.use("*", checkAuthMiddleware);

const zodSchema = z.object({})

app.post(
  "/save", 
  async (c, next) => {
    const body = await c.req.formData()  
    console.log(body)  
    return c.html(<div>Saved!</div>)
  }
);

app.get("*", async(c) => {
  const session = c.get("session");
  
  const teamList = await drizzle(c.env.DB)
    .select()
    .from(teams)    
    .all();  

  const employeeList = await drizzle(c.env.DB)
    .select()
    .from(employees)    
    .all();  

  const periodList = await drizzle(c.env.DB)
    .select()
    .from(periods)
    .where(eq(periods.calendar, 1))   
    .all();

  return c.html(
    <Layout theme={c.theme} username={session.user.githubUsername} currentPage="people-team">      
      <PeopleTeamPage teams={teamList} employees={employeeList} periods={periodList} />
    </Layout>);
})

export { app as peopleTeamController };
