import { zValidator } from "@hono/zod-validator";
import { Context, Hono } from "hono";
import { z } from "zod";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { PeriodPage, PeriodItem, PeriodView, PeriodItemEdit } from "../components/period";
import { Layout } from "../components";
import { periods, calendars, user } from "../schema";
import { checkAuthMiddleware } from "../lucia";
import { Session } from "lucia";
import { errorHandler, zodErrorHandler, successHandler } from "../utils/alerts";
import { index, removeIndex } from './search';

const app = new Hono<AuthEnv>();

app.use("*", checkAuthMiddleware);

const zodSchema = z.object({
  name: z.string().min(1).max(40),
  start: z.string().min(1).max(40),
  end: z.string().min(1).max(40),
  calendar: z.coerce.number().int()
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
    const newPeriod = await drizzle(c.env.DB)
      .insert(periods)
      .values({ ...c.req.valid("form"), createdBy: session.user.userId })
      .returning()
      .get();

    const calendar = await drizzle(c.env.DB).select().from(calendars).where(eq(calendars.id, newPeriod.calendar));    

    await index(drizzle(c.env.DB), {
      object_key: newPeriod.id,
      type: 'period',
      org: 'infinitas',
      search_data: `${newPeriod.name}`
    });

    c.header('HX-Trigger','clearAlerts');
    return c.html(
      <>
        <PeriodItem {...{periods: newPeriod, calendars: calendar[0]}} />        
        {successHandler('Create', `Period ${newPeriod.name} created`)}
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
    const updatedPeriod = await drizzle(c.env.DB)
      .update(periods)
      .set({ ...c.req.valid("form"), createdBy: session.user.userId })
      .where(eq(periods.id, id))
      .returning()
      .get();

    const calendar = await drizzle(c.env.DB).select().from(calendars).where(eq(calendars.id, updatedPeriod.calendar));    

    await index(drizzle(c.env.DB), {
      object_key: updatedPeriod.id,
      type: 'period',
      org: 'infinitas',
      search_data: `${updatedPeriod.name}`
    });

    c.header('HX-Trigger','clearAlerts');
    return c.html(
      <>
        <PeriodItem {...{periods: updatedPeriod, calendars: calendar[0]}} />
        {successHandler('Updated', `Period ${updatedPeriod.name} updated`)}
      </>);
  }
);

app.delete("/delete/:id{[0-9]+}", async (c) => {
  const id = parseInt(c.req.param().id);
  const db = drizzle(c.env.DB);  
  await drizzle(c.env.DB).delete(periods).where(eq(periods.id, id)).run();
  await removeIndex(drizzle(c.env.DB), {object_key: id, type: 'period'})
  return c.html(successHandler('Deleted', `Period ${id} deleted`));
});

app.get("/edit/:id{[0-9]+}", async (c) => {
  const id = parseInt(c.req.param().id);
  const db = drizzle(c.env.DB);  
  const period = await drizzle(c.env.DB).select().from(periods).where(eq(periods.id, id));  
  const calendar = await drizzle(c.env.DB).select().from(calendars).where(eq(calendars.id, period[0].calendar));
  const calendarList = await drizzle(c.env.DB).select().from(calendars).all();
  return c.html(<PeriodItemEdit {...{periods: period[0], calendars: calendar[0], calendarList }} />);
});

app.get("/create", async (c) => {
  const calendarList = await drizzle(c.env.DB).select().from(calendars).all();  
  return c.html(<PeriodItemEdit {...{periods: {id: 0, name: '', created: '', createdBy: ''}, calendars: {}, calendarList}} />);  
});

app.get("/item/:id{[0-9]+}", async (c) => {
  const id = parseInt(c.req.param().id);
  const db = drizzle(c.env.DB);  
  const createdByUser = alias(user, 'createdByUser')
  const period = await drizzle(c.env.DB)
    .select()
    .from(periods)    
    .leftJoin(calendars, eq(periods.calendar, calendars.id))
    .where(eq(periods.id, id));

  return c.html(<PeriodItem {...period[0]} />);  
});

app.get("/:id{[0-9]+}", async (c) => {
  const session = c.get("session");
  const id = parseInt(c.req.param().id);
  const db = drizzle(c.env.DB);  
  const createdByUser = alias(user, 'createdByUser')
  const period = await drizzle(c.env.DB)
    .select()
    .from(periods)    
    .leftJoin(calendars, eq(periods.calendar, calendars.id))
    .where(eq(periods.id, id));

  return c.html(
    <Layout theme={c.theme} username={session.user.githubUsername} currentPage="period">      
      <PeriodView {...period[0]} />
    </Layout >)
});

app.get("/calendar/:calendar{[0-9]+}", async(c) => {
  console.log('here!')
  const session = c.get("session");  
  const calendar = parseInt(c.req.param().calendar);
  const periodList = await drizzle(c.env.DB)
    .select()
    .from(periods)
    .leftJoin(calendars, eq(periods.calendar, calendars.id))
    .where(eq(periods.calendar, calendar))
    .all();

  return c.html(<PeriodPage periods={periodList} calendar={calendar} />)
})

app.get("*", async(c) => {
  const session = c.get("session");
  const createdByUser = alias(user, 'createdByUser')
  const periodList = await drizzle(c.env.DB)
    .select()
    .from(periods)
    .leftJoin(calendars, eq(periods.calendar, calendars.id))
    .all();    

  return c.html(
    <Layout theme={c.theme} username={session.user.githubUsername} currentPage="period">      
      <PeriodPage periods={periodList} />
    </Layout>);
})

export { app as periodController };
