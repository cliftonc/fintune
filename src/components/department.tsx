import { html } from "hono/html";
import { Department } from "../schema";
import { themes } from "../themes";

export function DepartmentItem(props: Department) { 
  const deptId = `department-${props.id}`;
  return (        
    <tr id={deptId} class="hover" hx-target="this" hx-swap="outerHTML">
      <td class="w-full">{props.name}</td>      
      <td>          
        <button
          class="save btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1"
          hx-trigger="click"
          hx-get={`/department/edit/${props.id}`}
        > 
          <div class="i-mdi-edit text-xl"></div>
        </button>
      </td><td>
        <button
          class="delete btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1"
          hx-delete={`/department/delete/${props.id}`}
        >
          <div class="i-mdi-trash text-xl"></div>
        </button>          
      </td>      
    </tr>    
  );
}

export function DepartmentItemEdit(props: Department | null) {   
  const deptId = props ? `department-${props.id}` : 'department-new';
  let saveButton
  if (props?.id) {
    saveButton = <button class="save btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1" hx-trigger="click, keyup[keyCode==13] from:body" hx-include="closest tr" hx-put={`/department/${props.id}`}>
      <div class="i-mdi-floppy text-xl"></div>
    </button>   
  } else {
    saveButton = <button class="save btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1" hx-trigger="click, keyup[keyCode==13] from:body" hx-include="closest tr" hx-post={`/department/new`}>
      <div class="i-mdi-floppy text-xl"></div>
    </button>   
  }

  let cancelButton
  if (props?.id) {
     cancelButton = <button id="undo" class="btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1" hx-trigger="click, keyup[keyCode==27] from:body" hx-get={`/department/${props.id}`}>
          <div class="i-mdi-undo text-xl"></div>
        </button>           
  } else {
    cancelButton = <button id="undo" class="btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1" _="on click remove closest <tr/> end on keyup[keyCode==27] from body remove closest <tr/> end">
          <div class="i-mdi-undo text-xl"></div>
        </button>
  }
  return (         
    <tr id={deptId} class="hover" hx-target="this" hx-swap="outerHTML">     
      <td class="w-full">
        <input
          name="name"
          maxlength={40}
          required
          type="text"
          class="input join-item input-bordered w-full"
          autocomplete="off"
          autofocus
          value={props?.name}
        /></td>      
      <td>{saveButton}</td>
      <td>{cancelButton}</td>
    </tr>        
  );
}

export function DepartmentPage(props: { departments: Department[] }) {
  return (
    <>    
      <div class="w-full text-left">
        <button hx-get="/department/create" hx-target="#departments tbody" hx-swap="beforeend" class="btn text-right mt-5 join-item">Add Department</button>      
      </div>
      <table id="departments" class="table table-zebra table-sm w-full" hx-swap="outerHTML" hx-target="closest tr">
        <thead>
          <th>Department Name</th>
          <th></th>
        </thead>
        <tbody>
          {props.departments.map((department) => (
            <DepartmentItem {...department} />
          ))}
        </tbody>
      </table>     
      <div id="alerts"></div>
    </>
  );
}