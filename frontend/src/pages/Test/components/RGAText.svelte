<script lang="ts">
  import RGAClient from "../../../lib/crdt/RADT/RGAClient";
  import TextEditor from "./TextEditor.svelte";
  import Tiptap from "../../../components/Tiptap.svelte";

  export let id: number = -1;

  const client = new RGAClient(id);
  let text: string = "";
  client.onChange = (result) => {
    text = result;
    console.log(text);
  };

  const onInsert = (e) => {
    const { offset, data } = e.detail;
    client.insert(offset, data);
  };
  const onDelete = (e) => {
    const { offset } = e.detail;
    client.delete(offset);
  };
</script>

<Tiptap on:insert={onInsert} on:delete={onDelete} {text} />
