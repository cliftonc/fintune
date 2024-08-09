import { html } from "hono/html";
import { Todo } from "../schema";
import { themes } from "../themes";

interface SiteData {
  username: string
  currentPage: string
  theme: string
  children?: any
}

const ThemeSelector = () => (
  <div class="dropdown">
    <label tabindex={0}>
      Theme
    </label>
    <ul
      tabindex={0}
      class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
    >
      {themes.map((t) => (
        <li>
          <button
            _={`on click send setTheme(theme:"${t}")`}            
          >
            {t[0].toUpperCase() + t.substring(1)}
          </button>
        </li>
      ))}
    </ul>
  </div>
)

const LoginBar = (props: { username?: string }) => (    
  <div class="flex-none gap-0">
    {props.username ? (            
      <a class="normal-case" href="/logout">
        Logout
      </a>              
    ) : (
      <a class="btn normal-case" href="/login/github">
        Sign in with GitHub
      </a>
    )}
  </div>  
);

const LeftMenu = (props: { username?: string, currentPage?: string }) => (
  <ul class="menu">
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
      <li>
        <h2 class="menu-title">Settings</h2>
        <ul>
          <li><ThemeSelector /></li>
          <li><LoginBar {...{username: props.username}} /></li>
        </ul>
      </li>
    </>
   ) : (
    <li><LoginBar /></li>
   )}
  </ul>
)

const Body = (props: SiteData) => {
  console.log(props)
  return <body hx-ext="debug">
    <div>          
      <div class="min-w-screen flex flex-col">
        <div class="flex flex-grid p-4">                            
          <div class="flex flex-row">
            <button _="on click toggle .hidden on #navbar-default" data-collapse-toggle="navbar-default" type="button" class="inline-flex mr-5 items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-default" aria-expanded="false">
                <span class="sr-only">Open main menu</span>
                <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
                </svg>
            </button>
            <div>
              <h1 class="text-3xl font-bold"><a href="/">fintune</a></h1>                          
            </div>  
            <div class="ml-5 mt-1">
              <label class="input input-sm flex items-center">
                <input id="search-input" type="text" class="input grow bg-none" autocomplete="off" placeholder="Search" 
                  _={`on keyup debounced at 200ms
                     if the event's key is 'Escape'
                       set my value to ''
                       trigger keyup
                     else
                       set global searchFor to my value
                       if searchFor
                        fetch \`/search/\$\{searchFor}\` put it into #main-content                        
                       else
                         reload() the location of the window
                       end
                     end`}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  class="h-4 w-4 opacity-70">
                  <path
                    fill-rule="evenodd"
                    d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                    clip-rule="evenodd" />
                </svg>                  
              </label>
            </div>
          </div>
        </div>
        <div class="flex flex-row">
          <div class=" bg-base-200 md:w-content whitespace-nowrap hidden md:block sm:bg-grey ml-2 mr-2 pl-0 pr-4 rounded-box" id="navbar-default">          
              <LeftMenu {...{currentPage: props.currentPage, username: props.username}}/>
          </div>       
          <div id="main-content" class="w-full p-2">
            {props.children}
          </div>
        </div>
      </div>
    </div>                     
  </body>
}

const Hyperscript = () => (
  <script type="text/hyperscript">
    {html`
    on clearAlerts set #alerts.innerHTML to '' end          

    on setTheme
      set cookies['theme'] to event.detail.theme
      htmx.find('html').setAttribute('data-theme', event.detail.theme)
      reload() the location of the window
    end`}
  </script>
)

export function Layout(props: SiteData) {    
  return html`<!DOCTYPE html>
    <html lang="en" data-theme="${props.theme}">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>fintune</title>
        <meta name="htmx-config" content='{"useTemplateFragments":"true"}'>
        <script src="https://unpkg.com/htmx.org@1.9.3"></script>
        <script src="https://unpkg.com/hyperscript.org@0.9.12"></script>
        <script src="https://unpkg.com/htmx-ext-debug@2.0.0/debug.js"></script>
        ${<Hyperscript />}        
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@unocss/reset/tailwind.min.css"
        />
        <link rel="stylesheet" href="/style.css" />        
      </head>
      ${<Body {...props} />}
    </html>`;
}
