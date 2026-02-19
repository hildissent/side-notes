import { WidgetType, EditorView } from "@codemirror/view";
import { App, MarkdownRenderer, Component } from "obsidian";

export class SideNoteWidget extends WidgetType {
	constructor(
		private notes: string[],
		private app: App
	) {
		super();
	}

	toDOM(view: EditorView): HTMLElement {
		const wrapper = document.createElement("span");
		wrapper.classList.add("side-note-anchor");

		for (const text of this.notes) {
			const aside = document.createElement("aside");
			aside.classList.add("side-note");

			const component = new Component();
			component.load();
			MarkdownRenderer.render(this.app, text, aside, "", component);

			wrapper.appendChild(aside);
		}

		return wrapper;
	}

	eq(other: SideNoteWidget): boolean {
		if (this.notes.length !== other.notes.length) return false;
		return this.notes.every((n, i) => n === other.notes[i]);
	}

	get estimatedHeight(): number {
		return 0;
	}

	ignoreEvent(): boolean {
		return false;
	}
}
