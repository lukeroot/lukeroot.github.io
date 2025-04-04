import { Words } from "./words.js"
import { Wordle } from "./wordle.js"

export class Wurdi
{
    static yawn_im_awake_promise = false
    static location_weights = {}
    static letter_weights = {}
    static letters_used = {}
    static letter_column_used = {}
    static won = false

    static init()
    {
        this.yawn_im_awake_promise = true
        this.start_my_brain_with_code_coffee()
    }

    static start_my_brain_with_code_coffee()
    {
        for (let word_key in Words.get_list()) {
            let letters = Words.get_list()[word_key].split("")
            for (let letter_key in letters) {
                let letter = letters[letter_key]
                let key = letter_key + letter

                if (!this.location_weights[key]) {
                    this.location_weights[key] = 0
                }
                if (!this.letter_weights[letter]) {
                    this.letter_weights[letter] = 0
                }

                this.location_weights[key] += 1
                this.letter_weights[letter] += 1
            }
        }

        let key
        let location_total = Object.values(this.location_weights).reduce((a, i) => {return a + i})
        let letter_total = Object.values(this.letter_weights).reduce((a, i) => {return a + i})

        for (key in this.location_weights) {
            this.location_weights[key] = this.location_weights[key] / location_total
        }

        for (key in this.letter_weights) {
            this.letter_weights[key] = this.letter_weights[key] / letter_total
        }
    }

    static got_the_next_word_yey(cur_no_guess)
    {
        let word = this.hmm_i_wonder_what_the_next_word_is(cur_no_guess)
        $(".wurdi_" + cur_no_guess).each(i => {
            $(`#wurdi_${i+1}_${cur_no_guess}`).text(word[i])
        })
    }

    static hmm_i_wonder_what_the_next_word_is(cur_no_guess)
    {
        // let cur_no_guess = cur_no_guess
        // let letters_used = letters_used
        let word_check = {}

        let letcolsum = !$.isEmptyObject(this.letter_column_used) ? Object.values(this.letter_column_used).reduce((a, i) => {return a + i}) : 0
        let snipe_mode = cur_no_guess > 3
        let hard_snipe_mode = cur_no_guess == 6

        for (let word of Words.get_list()) {
            let location_weight_current = 0, letter_weight_current = 0, mod = 1
            let letters = []
            let dont_use = false
            if (snipe_mode) {
                for (let letter in this.letters_used) {
                    if ([undefined, 0].includes(this.letters_used[letter])) {
                        continue
                    }

                    if (!word.includes(letter)) {
                        dont_use = true
                        break
                    }
                }
            }

            for (let letter_key in word) {
                let letter = word[letter_key]
                let key = letter_key + letter

                if (this.letters_used[letter] == 0) {
                    mod += 100
                }
                if (this.letter_column_used[key] == 1) {
                    mod += 1
                }
                if (snipe_mode) { //hard snipe mode
                    for (let letter_column_key in this.letter_column_used) {
                        if (letter_column_key[0] == letter_key &&
                            this.letter_column_used[letter_column_key] == 2 && key != letter_column_key) {
                            dont_use = true
                            break
                        }
                    }
                }

                if (letters.includes(letter)) {
                    mod += 1
                }

                if (letcolsum >= 8
                    && snipe_mode && !hard_snipe_mode
                    ) {
                    if (this.letters_used[letter] == undefined) {
                        mod += -1
                    }
                    if (this.letter_column_used[key] == 2) {
                        mod += 2
                    }
                }

                letters.push(letter)
                location_weight_current += this.location_weights[key]
                letter_weight_current += this.letter_weights[letter]
            }
            if (dont_use) {
                continue
            }
            word_check[word] = location_weight_current * letter_weight_current / mod
        }

        return Object.keys(word_check).sort((a, i) => {return word_check[a] - word_check[i]}).pop()
    }

    static mm_letters_used_tasty(value)
    {
        this.letters_used = value
    }

    static mmm_i_like_letter_column_soup(key, value)
    {
        this.letter_column_used[key] = value
    }
}