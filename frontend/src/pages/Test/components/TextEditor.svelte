<script lang="ts">
  import RGAClient from "../../../lib/crdt/RADT/RGAClient";

  export let id: number = -1;

  const client = new RGAClient(id);
  let text: string = "";
  client.onChange = (list) => {
    text =
      list.reduce((prev: string, current) => {
        const character = current.data as string;
        return prev.concat(character);
      }, "") ?? "";
    console.log(text);
  };

  const onTextChange = (e: Event) => {
    console.log(e);
    const textarea = e.target as HTMLTextAreaElement;
    client.insert(textarea.selectionStart - 1, (e as InputEvent).data);
  };
</script>

<textarea value={text} on:input={onTextChange} />
