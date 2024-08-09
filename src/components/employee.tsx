import { html } from "hono/html";
import { Employee } from "../schema";
import { themes } from "../themes";

export function EmployeeView(props: Employee) { 
  const empId = `employee-${props.id}`;
  return <article>
      <a href="/employee" class="link">All employees</a> | <span>{props.name}</span>          
      <h1 class="text-2xl">{props.name}</h1>
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
          <EmployeeItem {...props} />
        </tbody>      
      </table>
    </article>
}

export function EmployeeItem(props: Employee) { 
  const empId = `employee-${props.id}`;
  return (        
    <tr id={empId} class="hover" hx-target="this" hx-swap="outerHTML" >
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
      </td>
      <td>
        <button
          class="view btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1"
          _={`on click go to url "/employee/${props.id}"`}
        >
          <div class="i-mdi-eye text-xl"></div>
        </button>          
      </td>   
      <td>
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
  const empId = props.id ? `employee-${props.id}` : 'employee-new';
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
     cancelButton = <button id="undo" class="btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1" hx-trigger="click, keyup[keyCode==27] from:body" hx-get={`/employee/item/${props.id}`}>
          <div class="i-mdi-undo text-xl"></div>
        </button>           
  } else {
    cancelButton = <button id="undo" class="btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1" _="on click remove closest <tr/> end on keyup[keyCode==27] from body remove closest <tr/> end">
          <div class="i-mdi-undo text-xl"></div>
        </button>
  }
  return (         
    <tr id={empId} class="hover p-0 border-1" hx-target="this" hx-swap="outerHTML">     
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