import { html } from "hono/html";
import { Period } from "../schema";
import { themes } from "../themes";
import { CalendarCombo } from "./calendar";

export function PeriodItem(props: Period) {
  const periodId = `period-${props.periods.id}`;
  return (        
    <tr id={periodId} class="hover" hx-target="this" hx-swap="outerHTML">
      <td class="w-1/4">{props.periods.name}</td>
      <td class="w-1/4"><a href={`/calendar/${props.calendars.id}`}>{props.calendars.name}</a></td>      
      <td class="w-1/4">{props.periods.start}</td>
      <td class="w-1/4">{props.periods.end}</td>
      <td>          
        <button
          class="save btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1"
          hx-trigger="click"
          hx-get={`/period/edit/${props.periods.id}?calendar=${props.calendar}`}
        > 
          <div class="i-mdi-edit text-xl"></div>
        </button>
      </td>  
      <td class="w-8">
        <button
          class="view btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1"
          _={`on click go to url "/period/${props.periods.id}"`}
        >
          <div class="i-mdi-eye text-xl"></div>
        </button>          
      </td>
      <td>
        <button
          class="delete btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1"
          hx-delete={`/period/delete/${props.periods.id}`}
        >
          <div class="i-mdi-trash text-xl"></div>
        </button>          
      </td>      
    </tr>);
}

export function PeriodItemEdit(props: Period | null) {     
  const periodId = props ? `period-${props.periods.id}` : 'period-new';
  let saveButton
  if (props?.periods?.id) {
    saveButton = <button class="save btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1" hx-trigger="click, keyup[keyCode==13] from:body" hx-include="closest tr" hx-put={`/period/${props.periods.id}`}>
      <div class="i-mdi-floppy text-xl"></div>
    </button>   
  } else {
    saveButton = <button class="save btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1" hx-trigger="click, keyup[keyCode==13] from:body" hx-include="closest tr" hx-post={`/period/new`}>
      <div class="i-mdi-floppy text-xl"></div>
    </button>   
  }

  let cancelButton
  if (props?.periods?.id) {
     cancelButton = <button id="undo" class="btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1" hx-trigger="click, keyup[keyCode==27] from:body" hx-get={`/period/item/${props.periods.id}`}>
          <div class="i-mdi-undo text-xl"></div>
        </button>           
  } else {
    cancelButton = <button id="undo" class="btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1" _="on click remove closest <tr/> end on keyup[keyCode==27] from body remove closest <tr/> end">
          <div class="i-mdi-undo text-xl"></div>
        </button>
  }  

  let calendarCombo = CalendarCombo({calendar: props?.periods?.calendar, calendars: props.calendarList})  

  return (         
    <tr id={periodId} class="hover" hx-target="this" hx-swap="outerHTML">     
      <td class="w-1/2">
        <input
          name="name"
          maxlength={40}
          required
          type="text"
          class="input join-item input-bordered w-full"
          autocomplete="off"
          autofocus
          value={props?.periods?.name}
        /></td>  
      <td class="w-full">{calendarCombo}</td>
      <td class="w-1/6">
        <input name="start" maxlength={20} required type="date"
          class="input join-item input-bordered w-full"
          autocomplete="off" value={props?.periods?.start}
        />
      </td>
      <td class="w-1/6">
        <input name="end" maxlength={20} required type="date"
          class="input join-item input-bordered w-full"
          autocomplete="off" value={props?.periods?.end || ''}
        />
      </td>
      <td>{saveButton}</td>
      <td>{cancelButton}</td>
    </tr>        
  );
}


export function PeriodView(props: Period) { 
  const periodId = `period-${props.id}`;
  return <article>
      <a href="/period" class="link">All periods</a> | <span>{props.periods.name}</span>                
      <div class="divider"></div>
      <h1 class="text-3xl">Details</h1>
      <table id="periods" class="flex-none mt-4 bg-base-200 hover table table-zebra table-sm w-full text-left" hx-swap="outerHTML" hx-target="closest tr">
        <thead>
            <th>Name</th>
            <th>Calendar</th>      
            <th>Start</th>
            <th>End</th>              
            <th></th>
        </thead>
        <tbody>        
          <PeriodItem {...props} />
        </tbody>      
      </table>      
    </article>
}

export function PeriodPage(props: { periods: Period[], calendar: int }) {
  return (
    <>    
      <div class="w-full text-left">
        <button hx-get={`/period/create?calendar=${props.calendar}`} hx-target="#periods tbody" hx-swap="beforeend" class="btn text-right mt-5 join-item">Add Period</button>      
      </div>
      <table id="periods" class="table table-zebra table-sm w-full text-left" hx-swap="outerHTML" hx-target="closest tr">
        <thead>
          <th>Period Name</th>
          <th>Calendar</th>
          <th>Start</th>
          <th>End</th>   
        </thead>
        <tbody>
          {props.periods.map((period) => (
            <PeriodItem {...{...period, calendar: props.calendar}} />
          ))}
        </tbody>
      </table>     
      <div id="alerts"></div>
    </>
  );
}