import { Plugin } from "obsidian";
import { processSideNotes } from "./src/processor";
import { createSideNoteViewPlugin } from "./src/view-plugin";

export default class SideNotesPlugin extends Plugin {
	async onload() {
		this.registerEditorExtension(createSideNoteViewPlugin(this.app));

		this.registerMarkdownPostProcessor((el, ctx) => {
			processSideNotes(el, ctx);
		});
	}
}
