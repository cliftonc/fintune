import { html } from "hono/html";
import { Employee } from "../schema";
import { themes } from "../themes";

export function EmployeeItem(props: Employee) { 
  const deptId = `employee-${props.id}`;
  return (        
    <tr id={deptId} class="hover" hx-target="this" hx-swap="outerHTML">
      <td class="w-1/4">{props.name}</td>      
      <td class="w-1/4">{props.employeeId}</td>
      <td class="w-1/8">{props.active ? 'Yes' : 'No'}</td>
      <td class="w-1/6">{props.started}</td>
      <td class="w-1/6">{props.finished}</td>      
      <td class="w-1">          
        <button
          class="save btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1"
          hx-trigger="click"
          hx-get={`/employee/edit/${props.id}`}
        > 
          <div class="i-mdi-edit text-xl"></div>
        </button>
      </td><td>
        <button
          class="delete btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1"
          hx-delete={`/employee/delete/${props.id}`}
        >
          <div class="i-mdi-trash text-xl"></div>
        </button>          
      </td>      
    </tr>  
  );
}

export function EmployeeItemEdit(props: Employee) {   
  const deptId = props.id ? `employee-${props.id}` : 'employee-new';
  let saveButton
  if (props.id) {
    saveButton = <button class="save btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1" hx-trigger="click, keyup[keyCode==13] from:body" hx-include="closest tr" hx-put={`/employee/${props.id}`}>
      <div class="i-mdi-floppy text-xl"></div>
    </button>   
  } else {
    saveButton = <button class="save btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1" hx-trigger="click, keyup[keyCode==13] from:body" hx-include="closest tr" hx-post={`/employee/new`}>
      <div class="i-mdi-floppy text-xl"></div>
    </button>   
  }

  let cancelButton
  if (props.id) {
     cancelButton = <button id="undo" class="btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1" hx-trigger="click, keyup[keyCode==27] from:body" hx-get={`/employee/${props.id}`}>
          <div class="i-mdi-undo text-xl"></div>
        </button>           
  } else {
    cancelButton = <button id="undo" class="btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1" _="on click remove closest <tr/> end on keyup[keyCode==27] from body remove closest <tr/> end">
          <div class="i-mdi-undo text-xl"></div>
        </button>
  }
  return (         
    <tr id={deptId} class="hover p-0 border-1" hx-target="this" hx-swap="outerHTML">     
      <td class="w-1/4">
        <input name="name" maxlength={40} required type="text"
          class="input join-item input-bordered w-full"
          autocomplete="off" autofocus value={props.name}
        />
      </td>
      <td class="w-1/4">
        <input name="employeeId" maxlength={20} required type="text"
          class="input join-item input-bordered w-full"
          autocomplete="off" value={props.employeeId}
        />
      </td>
      <td class="w-1/8">        
        <input
          class="checkbox mr-1"
          type="checkbox"
          checked={props.active}          
          name="active"
        />
      </td>
      <td class="w-1/6">
        <input name="started" maxlength={20} required type="date"
          class="input join-item input-bordered w-full"
          autocomplete="off" value={props.started}
        />
      </td>
      <td class="w-1/6">
        <input name="finished" maxlength={20} required type="date"
          class="input join-item input-bordered w-full"
          autocomplete="off" value={props.finished || ''}
        />
      </td>
      <td>{saveButton}</td>
      <td>{cancelButton}</td> 
    </tr>        
  );
}

export function EmployeePage(props: { employees: Employee[] }) {
  return (
    <>    
      <ul class="menu menu-horizontal bg-base-200 rounded-box">
        <li><a hx-get="/employee/create" hx-target="#employees tbody" hx-swap="beforeend">Add employee</a></li>                      
        <label class="input input-sm flex items-center ml-3">
          <input type="text" class="grow" placeholder="Search" />
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
      </ul>
      <table id="employees" class="flex-none hover table table-zebra table-sm w-full text-left" hx-swap="outerHTML" hx-target="closest tr">
        <thead>
          <th>Name</th>
          <th>ID</th>
          <th>Active</th>
          <th>Started</th>
          <th>Finished</th>          
          <th></th>
        </thead>
        <tbody>
          {props.employees.map((employee) => (
            <EmployeeItem {...employee} />
          ))}
        </tbody>
      </table>
      <div id="alerts"></div>  
    </>
  );
}