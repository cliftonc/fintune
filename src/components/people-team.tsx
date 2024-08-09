import { html } from "hono/html";
import { Team, Employee, PeopleTeam, Period } from "../schema";
import { themes } from "../themes";

export function PeopleTeamPage(props: { teams: Team[], employees: Employee[], periods: Period[] }) {
  return (
    <>    
      <div class="w-full text-left">
        <button hx-get="/team/create" hx-target="#teams tbody" hx-swap="beforeend" class="btn text-right mt-5 join-item">Add Team</button>      
        <button class="save btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1" hx-trigger="click, keyup[keyCode==13] from:body" hx-include="#allocation" hx-post={`/people-team/save`}>
          <div class="i-mdi-floppy text-xl">Save</div>
        </button>   
      </div>
      <div id="allocation" class="flex flex-col w-full gap-2">
          <input type="hidden" name="team" value="1" />
          <div class="flex flex-row">
              <div class="w-50 m-1"></div>
             {props.periods.map((period) => (
                <div class="w-30 m-1 text-center">{period.name}</div>
             ))}
          </div>
          {props.employees.map((employee) => (
          <div class="flex flex-row">
            <div class="w-50 m-1">{employee.name}</div>
             {props.periods.map((period) => (
                <div class="w-30 m-1 text-center"><input name={`${employee.id}/${period.id}`} class="input text-center input-sm w-25 bg-base-200" /></div>
             ))}
            </div>
          ))}            
      </div>       
    </>
  );
}