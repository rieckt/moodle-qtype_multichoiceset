// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * JavaScript for the multichoiceset question type.
 *
 * @module     qtype_multichoiceset/mobile
 * @copyright  2024 Tim-Louis Rieck <tim-louis.rieck@oncampus.de>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define(['core/cookie'], function(Cookie) {
	const that = this;
	const result = {
		componentInit: function () {
			if (!this.question) {
				return that.CoreQuestionHelperProvider.showComponentError(that.onAbort);
			}

			// Create a temporary div to ease extraction of parts of the provided html.
			const div = document.createElement("div");
			div.innerHTML = this.question.html;

			// Replace Moodle's correct/incorrect classes, feedback and icons with mobile versions.
			that.CoreQuestionHelperProvider.replaceCorrectnessClasses(div);
			that.CoreQuestionHelperProvider.replaceFeedbackClasses(div);

			// Get useful parts of the provided question html data.
			const questiontext = div.querySelector(".qtext");
			const prompt = div.querySelector(".prompt");
			const answeroptions = div.querySelector(".answer");

			// Add the useful parts back into the question object ready for rendering in the template.
			this.question.text = questiontext.innerHTML;
			// Without the question text there is no point in proceeding.
			if (typeof this.question.text === "undefined") {
				return that.CoreQuestionHelperProvider.showComponentError(that.onAbort);
			}
			if (prompt !== null) {
				this.question.prompt = prompt.innerHTML;
			}

			const options = [];
			const divs = answeroptions.querySelectorAll("div[class^=r]"); // Only get the answer options divs (class="r0...").

			// Save last state in cookie if available
			const lastState = Cookie.get('qtype_multichoiceset_state');

			for (const d of divs) {
				// Each answer option contains all the data for presentation, it just needs extracting.
				const checkbox = d.querySelector("input[type=checkbox]");
				const feedbackDiv = d.querySelector(
					"div.core-question-feedback-container",
				);
				const labelId = checkbox.getAttribute("aria-labelledby");
				let labelElement = labelId
					? d.querySelector(`#${labelId.replace(/:/g, "\\:")}`)
					: null;

				// If not found, use the format used in older Moodle versions.
				if (!labelElement) {
					labelElement = d.querySelector("label");
				}

				const label = labelElement.innerHTML;
				const name = checkbox.getAttribute("name");
				const checked = checkbox.getAttribute("checked") || false;
				const disabled =
					d.querySelector("input").getAttribute("disabled") === "disabled";
				const feedback = feedbackDiv ? feedbackDiv.innerHTML : "";
				const qclass = d.getAttribute("class") || "";
				const iscorrect = qclass.includes("core-question-answer-correct")
					? 1
					: qclass.includes("core-question-answer-incorrect")
						? 0
						: undefined;
				options.push({
					text: label,
					name: name,
					checked: checked,
					disabled: disabled,
					feedback: feedback,
					qclass: qclass,
					iscorrect: iscorrect,
				});
			}
			this.question.options = options;

			// Save current state
			Cookie.set('qtype_multichoiceset_state', JSON.stringify(this.question.options), {
				path: '/',
				expires: 1 // 1 day
			});

			return true;
		},
	};

	return result;
});

// This next line is required as is (because of an eval step that puts this result object into the global scope).
result;
