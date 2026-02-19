import { MarkdownPostProcessorContext } from "obsidian";

const COMMENT_REGEX = /%%>\s*([\s\S]*?)\s*%%/g;

export function processSideNotes(
	el: HTMLElement,
	ctx: MarkdownPostProcessorContext
): void {
	const sectionInfo = ctx.getSectionInfo(el);
	if (!sectionInfo) return;

	const { text, lineStart, lineEnd } = sectionInfo;
	const allLines = text.split("\n");
	const sectionLines = allLines.slice(lineStart, lineEnd + 1);

	// Also look at lines immediately before this section for comment-only lines
	const precedingComments: string[] = [];
	for (let i = lineStart - 1; i >= 0; i--) {
		const line = allLines[i].trim();
		if (line === "") continue; // skip blank lines
		COMMENT_REGEX.lastIndex = 0;
		const match = COMMENT_REGEX.exec(line);
		// Check if the entire line is just a comment
		if (match && match.index === 0 && match[0].length === line.length) {
			precedingComments.unshift(match[1].trim());
		} else {
			break;
		}
	}
	COMMENT_REGEX.lastIndex = 0;

	const listItems = el.querySelectorAll("li");
	const isList = listItems.length > 0;

	if (isList) {
		let liIndex = 0;
		for (const line of sectionLines) {
			COMMENT_REGEX.lastIndex = 0;
			const isListLine = /^\s*(?:[-*+]|\d+[.)]) /.test(line);

			if (isListLine && liIndex < listItems.length) {
				// Collect all side-note matches on this list line
				const lineComments: string[] = [];
				let match: RegExpExecArray | null;
				while ((match = COMMENT_REGEX.exec(line)) !== null) {
					const content = match[1].trim();
					if (content) lineComments.push(content);
				}
				COMMENT_REGEX.lastIndex = 0;

				if (lineComments.length > 0) {
					const li = listItems[liIndex];
					li.classList.add("side-note-container");

					const stack = document.createElement("div");
					stack.classList.add("side-note-stack");

					for (const comment of lineComments) {
						const aside = document.createElement("aside");
						aside.classList.add("side-note");
						const p = document.createElement("p");
						p.textContent = comment;
						aside.appendChild(p);
						stack.appendChild(aside);
					}

					li.insertBefore(stack, li.firstChild);
				}

				liIndex++;
			}
		}
	} else {
		// Gather inline comments from the section itself
		const sectionText = sectionLines.join("\n");
		const comments: string[] = [];
		let match: RegExpExecArray | null;
		while ((match = COMMENT_REGEX.exec(sectionText)) !== null) {
			const content = match[1].trim();
			if (content) {
				comments.push(content);
			}
		}
		COMMENT_REGEX.lastIndex = 0;

		// Combine preceding comment-only lines with inline comments
		const allComments = [...precedingComments, ...comments];
		if (allComments.length === 0) return;

		el.classList.add("side-note-container");

		// Wrap all notes in a single positioned stack container
		const stack = document.createElement("div");
		stack.classList.add("side-note-stack");

		for (const comment of allComments) {
			const aside = document.createElement("aside");
			aside.classList.add("side-note");
			const p = document.createElement("p");
			p.textContent = comment;
			aside.appendChild(p);
			stack.appendChild(aside);
		}

		el.insertBefore(stack, el.firstChild);
	}
}
