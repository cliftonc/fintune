import { html } from "hono/html";
import { Calendar } from "../schema";
import { themes } from "../themes";

export function CalendarItem(props: Calendar) { 
  const calendarId = `calendar-${props.id}`;
  return (        
    <tr id={calendarId} class="hover" hx-target="this" hx-swap="outerHTML">
      <td class="w-1/3">{props.name}</td> 
      <td class="w-1/3">{props.type}</td>      
      <td class="w-1/3">{props.firstPeriod}</td>      
      <td>          
        <button
          class="save btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1"
          hx-trigger="click"
          hx-get={`/calendar/edit/${props.id}`}
        > 
          <div class="i-mdi-edit text-xl"></div>
        </button>
      </td>
      <td class="w-8">
        <button
          class="view btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1"
          _={`on click go to url "/calendar/${props.id}"`}
        >
          <div class="i-mdi-eye text-xl"></div>
        </button>          
      </td>         
      <td>
        <button
          class="delete btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1"
          hx-delete={`/calendar/delete/${props.id}`}
        >
          <div class="i-mdi-trash text-xl"></div>
        </button>          
      </td>      
    </tr>    
  );
}

export function CalendarItemEdit(props: Calendar | null) {   
  const calendarId = props ? `calendar-${props.id}` : 'calendar-new';
  let saveButton
  if (props?.id) {
    saveButton = <button class="save btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1" hx-trigger="click, keyup[keyCode==13] from:body" hx-include="closest tr" hx-put={`/calendar/${props.id}`}>
      <div class="i-mdi-floppy text-xl"></div>
    </button>   
  } else {
    saveButton = <button class="save btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1" hx-trigger="click, keyup[keyCode==13] from:body" hx-include="closest tr" hx-post={`/calendar/new`}>
      <div class="i-mdi-floppy text-xl"></div>
    </button>   
  }

  let cancelButton
  if (props?.id) {
     cancelButton = <button id="undo" class="btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1" hx-trigger="click, keyup[keyCode==27] from:body" hx-get={`/calendar/item/${props.id}`}>
          <div class="i-mdi-undo text-xl"></div>
        </button>           
  } else {
    cancelButton = <button id="undo" class="btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1" _="on click remove closest <tr/> end on keyup[keyCode==27] from body remove closest <tr/> end">
          <div class="i-mdi-undo text-xl"></div>
        </button>
  }
  return (         
    <tr id={calendarId} class="hover" hx-target="this" hx-swap="outerHTML">     
      <td class="w-1/3">
        <input
          name="name"
          maxlength={40}
          required
          type="text"
          class="input join-item input-bordered w-full"
          autocomplete="off"
          autofocus
          value={props?.name}
        />
      </td>
      <td class="w-1/3">
        <select
          name="type"
          required
          type="text"
          class="input join-item input-bordered w-full"          
          value={props?.type}>
          <option value="week" selected={props.type === 'week'}>Week</option>
          <option value="month" selected={props.type === 'month'}>Month</option>
          <option value="quarter" selected={props.type === 'quarter'}>Quarter</option>
        </select>
      </td> 
      <td class="w-1/3">
        <input
          name="firstPeriod"          
          required
          type="date"
          class="input join-item input-bordered w-full"
          autocomplete="off"          
          value={props?.firstPeriod}
        />
      </td>      
      <td>{saveButton}</td>
      <td>{cancelButton}</td>
    </tr>        
  );
}

export function CalendarPage(props: { calendars: Calendar[] }) {
  return (
    <>    
      <div class="w-1/2 text-left">
        <button hx-get="/calendar/create" hx-target="#calendars tbody" hx-swap="beforeend" class="btn text-right mt-5 join-item">Add Calendar</button>      
      </div>
      <table id="calendars" class="table table-zebra table-sm w-full" hx-swap="outerHTML" hx-target="closest tr">
        <thead>
          <th>Calendar Name</th>
          <th>Type</th>
          <th>First Period</th>
          <th></th>
        </thead>
        <tbody>
          {props.calendars.map((calendar) => (
            <CalendarItem {...calendar} />
          ))}
        </tbody>
      </table>     
      <div id="alerts"></div>
    </>
  );
}

export function CalendarCombo(props: { calendar: int | null, calendars: Calendar[] }) {
  return (
    <>    
      <select class="select select-bordered w-full max-w-xs" value={props.calendar} name="calendar" id="calendar-select">      
          {props.calendars.map((calendar) => {    
            const selected = props.calendar === calendar.id;                    
            return <option value={calendar.id} selected={selected}>{calendar.name}</option>
          })}
      </select>
    </>
  );
}