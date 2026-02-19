import { ViewPlugin, ViewUpdate, DecorationSet, Decoration, EditorView } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import { App } from "obsidian";
import { SideNoteWidget } from "./widget";

const SIDE_NOTE_REGEX = /%%>(.+?)%%/g;

interface NoteMatch {
	from: number;
	to: number;
	content: string;
}

function buildDecorations(view: EditorView, app: App): DecorationSet {
	const builder = new RangeSetBuilder<Decoration>();
	const doc = view.state.doc;
	const cursorLines = new Set<number>();

	for (const range of view.state.selection.ranges) {
		const startLine = doc.lineAt(range.from).number;
		const endLine = doc.lineAt(range.to).number;
		for (let l = startLine; l <= endLine; l++) {
			cursorLines.add(l);
		}
	}

	for (let i = 1; i <= doc.lines; i++) {
		if (cursorLines.has(i)) continue;

		const line = doc.line(i);
		let match: RegExpExecArray | null;
		SIDE_NOTE_REGEX.lastIndex = 0;

		// Collect all matches on this line
		const matches: NoteMatch[] = [];
		while ((match = SIDE_NOTE_REGEX.exec(line.text)) !== null) {
			const content = match[1].trim();
			if (content) {
				matches.push({
					from: line.from + match.index,
					to: line.from + match.index + match[0].length,
					content,
				});
			}
		}

		if (matches.length === 0) continue;

		// Hide all matches with empty replacements, except the last one
		// which gets the widget containing ALL notes for this line
		const allContents = matches.map((m) => m.content);

		for (let j = 0; j < matches.length - 1; j++) {
			builder.add(matches[j].from, matches[j].to, Decoration.replace({}));
		}

		const last = matches[matches.length - 1];
		builder.add(last.from, last.to, Decoration.replace({
			widget: new SideNoteWidget(allContents, app),
		}));
	}

	return builder.finish();
}

export function createSideNoteViewPlugin(app: App) {
	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;

			constructor(view: EditorView) {
				this.decorations = buildDecorations(view, app);
			}

			update(update: ViewUpdate) {
				if (update.docChanged || update.viewportChanged || update.selectionSet) {
					this.decorations = buildDecorations(update.view, app);
				}
			}
		},
		{ decorations: (v: { decorations: DecorationSet }) => v.decorations }
	);
}
