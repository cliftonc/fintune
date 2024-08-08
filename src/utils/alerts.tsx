
const errorHandler = (title, message) => <div id="alerts" class="toast toast-bottom toast-end" hx-swap-oob="true">{errorItem(title, message)}</div>

const errorItem = (title, message) => <div id='alert' class='alert alert-error animate-in fade-in-0 animate-duration-1000' _='on load or click wait 5s then remove me end on click remove me'>
   <svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-6 w-6 shrink-0 stroke-current"
    fill="none"
    viewBox="0 0 24 24">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
  <div>
    <h3 class="font-bold">{title}</h3>
    <div class="text-xs">{message}</div>
  </div>      
</div> 

const zodErrorHandler = (result, c) => {
  if(!result.success) {
    const id = parseInt(c.req.param().id);
    const errors = [];       
    result.error.errors.forEach((error) => {
      errors.push(errorItem(`Problem in ${error.path}`, error.message))
    })
    c.header('HX-Reswap', 'none');
    return c.html(<div id="alerts" class="toast toast-bottom toast-end" hx-swap-oob="true">{...errors}</div>, 200)
  }
}

const successHandler = (title, message) => <div id="alerts" class="toast toast-bottom toast-end" hx-swap-oob="true">
   <div id='alert' class='alert alert-info alert-success animate-in fade-in-0 animate-duration-1000' _='on load or click wait 5s then remove me end on click remove me'>
      <svg
	    xmlns="http://www.w3.org/2000/svg"
	    class="h-6 w-6 shrink-0 stroke-current"
	    fill="none"
	    viewBox="0 0 24 24">
	    <path
	      stroke-linecap="round"
	      stroke-linejoin="round"
	      stroke-width="2"
	      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
	  </svg>
    <div>
      <h4 class="font-bold">{title}</h4>
      <div class="text-xs">{message}</div>
    </div>      
  </div>   
</div>

export { errorHandler, zodErrorHandler, successHandler };