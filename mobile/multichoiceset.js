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
define(["core/str"], () => ({
	componentInit: function () {
		if (!this.question) {
			return this.CoreQuestionHelperProvider.showComponentError(this.onAbort);
		}

		// Create a temporary div to ease extraction of parts of the provided html.
		var div = document.createElement("div");
		div.innerHTML = this.question.html;

		// Replace Moodle's correct/incorrect classes, feedback and icons with mobile versions.
		this.CoreQuestionHelperProvider.replaceCorrectnessClasses(div);
		this.CoreQuestionHelperProvider.replaceFeedbackClasses(div);

		// Get useful parts of the provided question html data.
		var questiontext = div.querySelector(".qtext");
		var prompt = div.querySelector(".prompt");
		var answeroptions = div.querySelector(".answer");

		// Add the useful parts back into the question object ready for rendering in the template.
		this.question.text = questiontext ? questiontext.innerHTML : "";

		// Without the question text there is no point in proceeding.
		if (!this.question.text) {
			return this.CoreQuestionHelperProvider.showComponentError(this.onAbort);
		}

		if (prompt) {
			this.question.prompt = prompt.innerHTML;
		}

		var options = [];
		var divs = answeroptions
			? answeroptions.querySelectorAll("div[class^=r]")
			: [];

		Array.prototype.forEach.call(divs, (d) => {
			// Each answer option contains all the data for presentation, it just needs extracting.
			var checkbox = d.querySelector("input[type=checkbox]");
			if (!checkbox) {
				return;
			}

			var feedbackDiv = d.querySelector("div.core-question-feedback-container");
			var labelId = checkbox.getAttribute("aria-labelledby");
			var labelElement = labelId
				? d.querySelector("#" + labelId.replace(/:/g, "\\:"))
				: null;

			// If not found, use the format used in older Moodle versions.
			if (!labelElement) {
				labelElement = d.querySelector("label");
			}

			if (!labelElement) {
				return;
			}

			var label = labelElement.innerHTML;
			var name = checkbox.getAttribute("name");
			var checked = checkbox.hasAttribute("checked");
			var disabled = d.querySelector("input").hasAttribute("disabled");
			var feedback = feedbackDiv ? feedbackDiv.innerHTML : "";
			var qclass = d.getAttribute("class") || "";
			var iscorrect = qclass.includes("core-question-answer-correct")
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
		});

		this.question.options = options;
		return true;
	},
}));

// This next line is required as is (because of an eval step that puts this result object into the global scope).
result;
