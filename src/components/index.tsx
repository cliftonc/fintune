import { html } from "hono/html";
import { Todo } from "../schema";
import { themes } from "../themes";

interface SiteData {
  username: string
  currentPage: string
  children?: any
}

const ThemeSelector = () => (
  <div class="dropdown ml-1">
    <label tabindex={0} class="btn btn-ghost btn-circle">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path 
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h7"
        />
      </svg>
    </label>
    <ul
      tabindex={0}
      class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
    >
      {themes.map((t) => (
        <li>
          <button
            onClick={`htmx.find('html').setAttribute('data-theme','${t}')`}
          >
            {t[0].toUpperCase() + t.substring(1)}
          </button>
        </li>
      ))}
    </ul>
  </div>
)

const LeftMenu = (props: { username?: string, currentPage?: string }) => (
  <ul class="menu pr-5 p-0">
  {props.username ? (
    <>
      <li>
        <h2 class="menu-title">Planning</h2>
        <ul>
          <li><a class={props.currentPage === "index" ? "active" : ""} href="/">Dashboard</a></li>
          <li><a class={props.currentPage === "models" ? "active" : ""} href="/models">Models</a></li>
          <li><a class={props.currentPage === "scenarios" ? "active" : ""} href="/plans">Scenarios</a></li>
        </ul>
      </li>
      <li>
        <h2 class="menu-title">Reference Data</h2>
        <ul>
          <li><a class={props.currentPage === "department" ? "active" : ""} href="/department">Departments</a></li>
          <li><a class={props.currentPage === "team" ? "active" : ""} href="/team">Teams</a></li>    
          <li><a class={props.currentPage === "employee" ? "active" : ""} href="/employee">Employees</a></li>
          <li><a class={props.currentPage === "calendar" ? "active" : ""} href="/calendar">Calendars</a></li>
          <li><a class={props.currentPage === "period" ? "active" : ""} href="/period">Periods</a></li>
          <li><a class={props.currentPage === "rates" ? "active" : ""} href="/rate">Rates</a></li>
        </ul>
      </li>
    </>
   ) : (
    <li></li>
   )}
  </ul>
)

const Navbar = (props: { username?: string }) => (
  <div class="navbar flex-col sm:flex-row gap-2">
    <div class="flex-1">      
      <h1 class="text-3xl font-bold"><a href="/">fintune</a></h1>        
      <ThemeSelector />
    </div>        
    
    <div class="flex-none gap-2">
      {props.username ? (
        <>
          <span>{props.username}</span>
          <a class="btn normal-case" href="/logout">
            Logout
          </a>
        </>
      ) : (
        <a class="btn normal-case" href="/login/github">
          Sign in with GitHub
        </a>
      )}
    </div>   
  </div>
);

export function Layout(props: SiteData) {
  return html`<!DOCTYPE html>
    <html lang="en" data-theme="lofi">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>fintune</title>
        <meta name="htmx-config" content='{"useTemplateFragments":"true"}'>
        <script src="https://unpkg.com/htmx.org@1.9.3"></script>
        <script src="https://unpkg.com/hyperscript.org@0.9.12"></script>
        <script src="https://unpkg.com/htmx-ext-debug@2.0.0/debug.js"></script>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@unocss/reset/tailwind.min.css"
        />
        <link rel="stylesheet" href="/style.css" />
        <script type="text/hyperscript">
          on clearAlerts set #alerts.innerHTML to ''          
        </script>
      </head>
      <body hx-ext="debug" class="w-full h-screen p-6 mx-auto">
        <div class="flex flex-wrap">
          <div class="md:w-full">
            ${<Navbar {...{username: props.username}}/>}
          </div>
          <div class="md:w-1/6 text-left">            
            ${<LeftMenu {...{currentPage: props.currentPage, username: props.username}}/>}
          </div>
          <div class="md:w-5/6 text-left">
            ${props.children}
          </div>                
        </div>              
      </body>
    </html> `;
}
