import { Hono } from "hono";
import { getCookie } from 'hono/cookie'
import { Layout } from "./components";
import { serveStatic } from "hono/cloudflare-workers";
import { loginController } from "./controllers/login";
import { todoController } from "./controllers/todo";
import { departmentController } from "./controllers/department";
import { employeeController } from "./controllers/employee";
import { teamController } from "./controllers/team";
import { calendarController } from "./controllers/calendar";
import { searchController } from "./controllers/search";
import { authMiddleware } from "./lucia";
import { eq } from "drizzle-orm";

const app = new Hono<Env>();

app.get("/favicon.ico", serveStatic({ path: "./favicon.ico" }));
app.get("/style.css", serveStatic({ path: "./style.css" }));

app.route("/", loginController);

app.use("*", async (c, next) => {
  const theme = getCookie(c, 'theme') || 'lofi'
  console.log('theme', theme)
  c.theme = theme  
  await next()
})

app.use("*", authMiddleware);
app.get("/", async (c) => {
  const session = c.get("session");
  if (!session) {
    return c.html(
      <Layout theme={c.theme} username="" currentPage="home">
        <div class="animate-fade-in text-2xl text-gray alert-error">        
          Welcome!  You need to login to be able to do anything interesting ...
        </div>      
      </Layout>
    );
  }

  return c.html(
    <Layout theme={c.theme} username={session.user.githubUsername} currentPage="index">      
      <div class="text-center w-full">
        <div class="grid">
          <div class="hero min-h-fit">
            <div class="hero-content text-center">
              <div class="max-w-fit">
                <h1 class="text-5xl text-error font-bold">Fintune</h1>
                <p class="py-6">
                  Snazzy dashboard coming soon
                </p>            
              </div>
            </div>
          </div>
        </div>             
        <div class="stats shadow">
          <div class="stat">
            <div class="stat-figure text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                class="inline-block h-8 w-8 stroke-current">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </div>
            <div class="stat-title">Total Likes</div>
            <div class="stat-value text-primary">25.6K</div>
            <div class="stat-desc">21% more than last month</div>
          </div>

          <div class="stat">
            <div class="stat-figure text-secondary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                class="inline-block h-8 w-8 stroke-current">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <div class="stat-title">Page Views</div>
            <div class="stat-value text-secondary">2.6M</div>
            <div class="stat-desc">21% more than last month</div>
          </div>

          <div class="stat">
            <div class="stat-figure text-secondary">
              <div class="avatar online">
                <div class="w-16 rounded-full">
                  <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                </div>
              </div>
            </div>
            <div class="stat-value">86%</div>
            <div class="stat-title">Tasks done</div>
            <div class="stat-desc text-secondary">31 tasks remaining</div>
          </div>
        </div>
      </div>
    </Layout>
  );
});

app.route("/todo", todoController);
app.route("/department", departmentController);
app.route("/employee", employeeController);
app.route("/team", teamController);
app.route("/calendar", calendarController);
app.route("/search", searchController);

app.notFound((c) => {
 const session = c.get("session");
 return c.html(
    <Layout theme={c.theme} username={session?.user?.githubUsername} currentPage="404">      
      <div class="grid h-100">
        <div class="hero min-h-fit">
          <div class="hero-content text-center">
            <div class="max-w-fit">
              <h1 class="text-5xl text-error font-bold">Still haven't found what you're looking for?</h1>
              <p class="py-6">
                Sorry but we don't seem to have gotten around to build that yet, try something else ...
              </p>            
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}, 404)

export default app;
