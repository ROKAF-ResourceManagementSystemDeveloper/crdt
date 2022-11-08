<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import { Editor } from "@tiptap/core";
  import StarterKit from "@tiptap/starter-kit";
  import { ReplaceStep } from "prosemirror-transform";

  let element;
  let editor: Editor;
  export let text;

  interface TiptapEvent {
    delete: {
      offset: number;
    };
    insert: {
      offset: number;
      data: string;
    };
  }
  const dispatch = createEventDispatcher<TiptapEvent>();

  onMount(() => {
    editor = new Editor({
      element: element,
      extensions: [StarterKit],
      content: text,
      onTransaction: () => {
        // force re-render so `editor.isActive` works as expected
        editor = editor;
      },
      onUpdate: ({ transaction }) => {
        transaction.steps.forEach((step) => {
          if (step instanceof ReplaceStep) {
            console.log("replace");
            const { from, to, slice } = step;

            /** Deletion */
            if (from < to) {
              for (let i = to - 1; i >= from; i--) {
                dispatch("delete", {
                  offset: i,
                });
              }
            }

            /** Insertion */
            const { content } = slice;
            content.forEach((node) => {
              [...node.text].forEach((char, index) => {
                dispatch("insert", {
                  offset: from + index - 1,
                  data: char,
                });
              });
            });
          }
        });
      },
    });
  });

  function setContent(text) {
    if (editor) {
      editor.commands.setContent(text);
    }
  }

  $: setContent(text);

  onDestroy(() => {
    if (editor) {
      editor.destroy();
    }
  });
</script>

<!-- {#if editor}
  <button
    on:click={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
    class:active={editor.isActive("heading", { level: 1 })}
  >
    H1
  </button>
  <button
    on:click={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
    class:active={editor.isActive("heading", { level: 2 })}
  >
    H2
  </button>
  <button
    on:click={() => editor.chain().focus().setParagraph().run()}
    class:active={editor.isActive("paragraph")}
  >
    P
  </button>
{/if} -->

<div bind:this={element} class="w-20em b-black b-solid b-1" />

<style>
  button.active {
    background: black;
    color: white;
  }
</style>
