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
 * Mobile support for multichoiceset question type.
 *
 * @module    qtype_multichoiceset/mobile
 * @copyright 2025 tim-louis.rieck@oncampus.de
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('qtype_multichoiceset/mobile', [], () => {
    /* eslint-disable-next-line no-var */
    var result = {
        /**
         * Initialize the multichoiceset question component.
         *
         * @return {boolean|void} True if initialization successful, void if error
         */
        componentInit: function () {
            if (!this.question) {
                return this.CoreQuestionHelperProvider.showComponentError(this.onAbort);
            }

            // Create a temporary div to ease extraction of parts of the provided html.
            const div = document.createElement('div');
            div.innerHTML = this.question.html;

            // Replace Moodle's correct/incorrect classes, feedback and icons with mobile versions.
            this.CoreQuestionHelperProvider.replaceCorrectnessClasses(div);
            this.CoreQuestionHelperProvider.replaceFeedbackClasses(div);

            // Get useful parts of the provided question html data.
            const questiontext = div.querySelector('.qtext');
            const prompt = div.querySelector('.prompt');
            const answeroptions = div.querySelector('.answer');

            // Add the useful parts back into the question object ready for rendering in the template.
            this.question.text = questiontext.innerHTML;
            // Without the question text there is no point in proceeding.
            if (typeof this.question.text === 'undefined') {
                return this.CoreQuestionHelperProvider.showComponentError(this.onAbort);
            }
            if (prompt !== null) {
                this.question.prompt = prompt.innerHTML;
            }

            const options = [];
            // Only get the answer options divs (class="r0...").
            const divs = answeroptions.querySelectorAll('div[class^=r]');

            for (const d of divs) {
                // Each answer option contains all the data for presentation, it just needs extracting.
                const checkbox = d.querySelector('input[type=checkbox]');
                const feedbackDiv = d.querySelector('div.core-question-feedback-container');
                const label = d.querySelector('label')?.innerHTML || '';
                const name = checkbox.getAttribute('name');
                const checked = !!checkbox.getAttribute('checked');
                const disabled = d.querySelector('input').getAttribute('disabled') === 'disabled';
                const feedback = feedbackDiv ? feedbackDiv.innerHTML : '';
                const qclass = d.getAttribute('class') || '';
                const iscorrect =
                    qclass.indexOf('core-question-answer-correct') >= 0
                        ? 1
                        : qclass.indexOf('core-question-answer-incorrect') >= 0
                          ? 0
                          : undefined;

                options.push({
                    text: label,
                    name,
                    checked,
                    disabled,
                    feedback,
                    qclass,
                    iscorrect,
                });
            }
            this.question.options = options;

            return true;
        },
    };

    return result;
});
