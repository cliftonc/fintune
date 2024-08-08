import { zValidator } from "@hono/zod-validator";
import { Context, Hono } from "hono";
import { z } from "zod";
import { drizzle } from "drizzle-orm/d1";
import { eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { CalendarPage, CalendarItem, CalendarItemEdit } from "../components/calendar";
import { Layout } from "../components";
import { calendars, user } from "../schema";
import { checkAuthMiddleware } from "../lucia";
import { Session } from "lucia";
import { errorHandler, zodErrorHandler, successHandler } from "../utils/alerts";

const app = new Hono<AuthEnv>();

const zodSchema = z.object({
  name: z.string().min(1).max(40),
  firstPeriod: z.string().min(1, { message: "First period is required to be set!" }),
  type: z.string().min(1).max(40)
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
    const newCalendar = await drizzle(c.env.DB)
      .insert(calendars)
      .values({ ...c.req.valid("form"), createdBy: session.user.userId })
      .returning()
      .get();      
    c.header('HX-Trigger','clearAlerts');
    return c.html(
      <>
        <CalendarItem {...newCalendar} />        
        {successHandler('Create', `Calendar ${newCalendar.name} created`)}
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
    const updatedCalendar = await drizzle(c.env.DB)
      .update(calendars)
      .set({ ...c.req.valid("form"), createdBy: session.user.userId })
      .where(eq(calendars.id, id))
      .returning()
      .get();
    c.header('HX-Trigger','clearAlerts');
    return c.html(
      <>
        <CalendarItem {...updatedCalendar} />
        {successHandler('Updated', `Calendar ${updatedCalendar.name} updated`)}
      </>);
  }
);

app.delete("/delete/:id{[0-9]+}", async (c) => {
  const id = parseInt(c.req.param().id);
  const db = drizzle(c.env.DB);  
  try {
    await drizzle(c.env.DB).delete(calendars).where(eq(calendars.id, id)).run();
  } catch(ex) {
    const calendar = await drizzle(c.env.DB).select().from(calendars).where(eq(calendars.id, id));  
    return c.html(
      <>
        <CalendarItem {...calendar[0]} />
        {errorHandler('Calendar has periods!', 'Cannot delete a calendar that has periods attached to it :D')}
      </>)
  }
  return c.html(successHandler('Deleted', `Calendar ${id} deleted`));
});

app.get("/edit/:id{[0-9]+}", async (c) => {
  const id = parseInt(c.req.param().id);
  const db = drizzle(c.env.DB);
  const calendar = await drizzle(c.env.DB).select().from(calendars).where(eq(calendars.id, id));  
  return c.html(<CalendarItemEdit {...calendar[0]} />);  
});

app.get("/create", async (c) => {
  return c.html(<CalendarItemEdit {...{id: 0, name: '', created: '', createdBy: ''}} />);  
});

app.get("/:id{[0-9]+}", async (c) => {
  const id = parseInt(c.req.param().id);
  const db = drizzle(c.env.DB);  
  const createdByUser = alias(user, 'createdByUser')
  const calendar = await drizzle(c.env.DB)
    .select()
    .from(calendars)    
    .where(eq(calendars.id, id));  
  return c.html(<CalendarItem {...calendar[0]} />);  
});

app.get("*", async(c) => {
  const session = c.get("session");
  const createdByUser = alias(user, 'createdByUser')
  const calendarList = await drizzle(c.env.DB)
    .select()
    .from(calendars)    
    .all();

  return c.html(
    <Layout theme={c.theme} username={session.user.githubUsername} currentPage="calendar">      
      <CalendarPage calendars={calendarList} />
    </Layout>  
  );
})

export { app as calendarController };
