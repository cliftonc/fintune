import { Hono } from "hono";
import { Layout } from "./components";
import { serveStatic } from "hono/cloudflare-workers";
import { loginController } from "./controllers/login";
import { todoController } from "./controllers/todo";
import { departmentController } from "./controllers/department";
import { employeeController } from "./controllers/employee";
import { teamController } from "./controllers/team";
import { authMiddleware } from "./lucia";
import { eq } from "drizzle-orm";

const app = new Hono<Env>();

app.get("/favicon.ico", serveStatic({ path: "./favicon.ico" }));
app.get("/style.css", serveStatic({ path: "./style.css" }));

app.route("/", loginController);

app.use("*", authMiddleware);
app.get("/", async (c) => {
  const session = c.get("session");
  if (!session) {
    return c.html(
      <Layout username="" currentPage="home">
        <div class="animate-fade-in text-2xl text-gray alert-error">        
          Welcome!  You need to login to be able to do anything interesting ...
        </div>      
      </Layout>
    );
  }

  return c.html(
    <Layout username={session.user.githubUsername} currentPage="index">      
      <div class="animate-fade-in text-2xl text-gray">        
        Click something!
      </div>
    </Layout>
  );
});

app.route("/todo", todoController);
app.route("/department", departmentController);
app.route("/employee", employeeController);
app.route("/team", teamController);

export default app;
