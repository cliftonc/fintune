import { html } from "hono/html";
import { Team } from "../schema";
import { themes } from "../themes";
import { DepartmentCombo } from "./department";

export function TeamItem(props: Team) {   
  const teamId = `team-${props.teams.id}`;
  return (        
    <tr id={teamId} class="hover" hx-target="this" hx-swap="outerHTML">
      <td class="w-1/2">{props.teams.name}</td>
      <td class="w-1/2">{props.departments.name}</td>      
      <td>          
        <button
          class="save btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1"
          hx-trigger="click"
          hx-get={`/team/edit/${props.teams.id}`}
        > 
          <div class="i-mdi-edit text-xl"></div>
        </button>
      </td><td>
        <button
          class="delete btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1"
          hx-delete={`/team/delete/${props.teams.id}`}
        >
          <div class="i-mdi-trash text-xl"></div>
        </button>          
      </td>      
    </tr>    
  );
}

export function TeamItemEdit(props: Team | null) {     
  const teamId = props ? `team-${props.teams.id}` : 'team-new';
  let saveButton
  if (props?.teams?.id) {
    saveButton = <button class="save btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1" hx-trigger="click, keyup[keyCode==13] from:body" hx-include="closest tr" hx-put={`/team/${props.teams.id}`}>
      <div class="i-mdi-floppy text-xl"></div>
    </button>   
  } else {
    saveButton = <button class="save btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1" hx-trigger="click, keyup[keyCode==13] from:body" hx-include="closest tr" hx-post={`/team/new`}>
      <div class="i-mdi-floppy text-xl"></div>
    </button>   
  }

  let cancelButton
  if (props?.teams?.id) {
     cancelButton = <button id="undo" class="btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1" hx-trigger="click, keyup[keyCode==27] from:body" hx-get={`/team/${props.teams.id}`}>
          <div class="i-mdi-undo text-xl"></div>
        </button>           
  } else {
    cancelButton = <button id="undo" class="btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1" _="on click remove closest <tr/> end on keyup[keyCode==27] from body remove closest <tr/> end">
          <div class="i-mdi-undo text-xl"></div>
        </button>
  }  

  let departmentCombo = DepartmentCombo({department: props?.teams?.department, departments: props.departmentList})  

  return (         
    <tr id={teamId} class="hover" hx-target="this" hx-swap="outerHTML">     
      <td class="w-1/2">
        <input
          name="name"
          maxlength={40}
          required
          type="text"
          class="input join-item input-bordered w-full"
          autocomplete="off"
          autofocus
          value={props?.teams?.name}
        /></td>  
      <td class="w-full">{departmentCombo}</td>
      <td>{saveButton}</td>
      <td>{cancelButton}</td>
    </tr>        
  );
}

export function TeamPage(props: { teams: Team[] }) {
  return (
    <>    
      <div class="w-full text-left">
        <button hx-get="/team/create" hx-target="#teams tbody" hx-swap="beforeend" class="btn text-right mt-5 join-item">Add Team</button>      
      </div>
      <table id="teams" class="table table-zebra table-sm w-full" hx-swap="outerHTML" hx-target="closest tr">
        <thead>
          <th>Team Name</th>
          <th></th>
        </thead>
        <tbody>
          {props.teams.map((team) => (
            <TeamItem {...team} />
          ))}
        </tbody>
      </table>     
      <div id="alerts"></div>
    </>
  );
}