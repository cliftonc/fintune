import { html } from "hono/html";
import { Todo } from "../../schema";
import { themes } from "../../themes";

export function TodoItem(props: Todo) {
  return (
    <form class="flex items-center gap-2 text-lg p-2">
      <label class="w-full flex gap-2 leading-snug cursor-pointer">
        <input
          class="checkbox mr-1"
          type="checkbox"
          checked={props.checked}
          hx-post={`/todo/toggle/${props.id}`}
          id={`${props.id}`}
        />
        {props.checked ? <s>{props.title}</s> : props.title}
      </label>
      {props.checked && (
        <button
          class="btn btn-ghost btn-circle w-8 h-8 min-h-0 -m-1"
          hx-delete={`/todo/delete/${props.id}`}
        >
          <div class="i-mdi-close text-xl"></div>
        </button>
      )}
    </form>
  );
}

export function TodoPage(props: { todos: Todo[] }) {
  return (
    <>
      <article class="p-4 mb-4" hx-swap="outerHTML" hx-target="closest form">
        {props.todos.map((todo) => (
          <TodoItem {...todo} />
        ))}
      </article>

      <form
        method="post"
        hx-post="/todo/new"
        hx-swap="beforeend"
        hx-target="previous article"
        hx-on:submit="this.querySelector('input').value=''"
        class="join w-full"
      >
        <input
          name="title"
          placeholder="new todo"
          maxlength={40}
          required
          type="text"
          class="input join-item input-bordered w-full"
          autocomplete="off"
        />
        <button class="btn join-item">add</button>
      </form>      
    </>
  );
}
