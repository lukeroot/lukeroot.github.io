import { Random } from "./random.js"
import { Words } from "./words.js"
import { Wurdi } from "./wurdi.js"

export class Wordle
{
    static modes = {}
    static num_of_guesses = 0
    static letters_used = {}
    static word_to_guess = ""
    static row = 1
    static tile_reveal_speed = 400
    static has_won = false
    static control_pressed = false

    static init(modes, word = null)
    {
        this.modes = modes
        this.set_word(word)
        this.mode_display()
        this.handle_events()
    }

    static set_word(word = null)
    {
        if (!word) {
            let index
            if (this.modes.random_mode == 1) {
                index = parseInt(Math.random() * Words.get_list().length)
                $("random-mode").removeClass("light-grey")
                $("daily-mode").addClass("light-grey")
            } else {
                index = parseInt(Random.rand() * Words.get_list().length)
            }

            word = Words.get_list()[index]
        }

        this.word_to_guess = word
        this.letters_still_to_guess = this.word_to_guess.split("")
    }

    static mode_display()
    {
        if (this.modes.ai_mode == 1) {
            $("wurdi-mode").removeClass("light-grey")
            $("solo-mode").addClass("light-grey")
            this.play_wurdi()
        } else {
            $("wurdi-guess").remove()
            $("guess").width("100%")
        }
    }

    static play_wurdi()
    {
        Wurdi.init()
        //test
        // for (let i = 1; i <= 6; i++) {

        // Wurdi.got_the_next_word_yey(i)
        // this.check($(".wurdi_" + i))
        // }
    }

    static has_lost()
    {
        return this.num_of_guesses >= 6
    }

    static has_finished()
    {
        return this.has_won || this.has_lost()
    }

    static handle_events()
    {
        // $.debounce(200, () => {

        $(document).keydown(
            (e) => {
        // $.debounce(100, (e) => {
            this.key_down_event(e.key, e.keyCode)
        })
        $(document).keyup(
            (e) => {
        // $.debounce(100, (e) => {
            this.key_up_event(e.key, e.keyCode)
        })
        $("letter").click(
        // $.debounce(100, (el) => {
            (el) => {
            let letter = ($(el))[0].target.id
            let code = letter == "Backspace" ? 8 : letter == "Enter" ? 13 : letter.toUpperCase().charCodeAt(0)
            this.key_down_event(letter, code)
            this.key_up_event(letter, code)
        })
    }

    static key_up_event(key, keyCode)
    {
        if (keyCode == 17) {
            this.control_pressed = false
            return
        }
        if (this.allowed_keys(keyCode)) {
            return
        }
        let dark = false
        if ([13,8].includes(keyCode)) {
            dark = true
            if (keyCode == 13) {
                this.colourise_letters("Enter", true, 2)
            } else {
                this.colourise_letters("Backspace", true, 1)
            }

        } else {
            this.colourise_letters(key, dark)
        }
    }

    static key_down_event(key, keyCode)
    {
        if (keyCode == 17 || this.control_pressed) {
            this.control_pressed = true
            return
        }
        if (this.allowed_keys(keyCode)) {
            return
        }
        let col = this.num_of_guesses + 1

        let id = "#" + this.row + "_" + col

        if (keyCode == 13) {
            if (this.row == 6) {

                this.colourise_letters("Enter", false, 2)

                if (!this.check($("." + col))) {
                    return
                }

                if (!this.has_won && Wurdi.yawn_im_awake_promise) {
                    Wurdi.got_the_next_word_yey(col)
                    this.check($(".wurdi_" + col))
                    if (this.has_won) {
                        Wurdi.won = true
                    }
                }

                this.num_of_guesses += 1
                this.row = 1
            }
            return
        }
        if (keyCode == 8) {
            this.row != 1 ? this.row-- : null
            id = "#" + this.row + "_" + col
            let letter = $(id).text()
            $(id).text("⠀")
            if (!$("." + col).text().includes(letter)) {
                this.colourise_letters(letter, true)
            }
            this.colourise_letters("Backspace", false, 1)
            return
        }
        if (this.row < 6) {
            $("#" + key).css({
                backgroundColor: "#323234",
                outline: "2px solid #323234"
            })
            this.row < 6 ? this.row++ : null
            $(id).text(key)
        }
    }

    static allowed_keys(key)
    {
        let allowed_keys = [13, 8]
        for (let i = 65; i < 65 + 26; i++) {
            allowed_keys.push(i)
        }
        return !allowed_keys.includes(key) || this.has_finished()
    }

    static check(guess)
    {
        if (this.has_won) {
            return false
        }

        if (!Words.get_list().includes(guess.text())) {
            guess.each(i => {
                let background_colour = $(guess[i]).css("backgroundColor")
                let outline = $(guess[i]).css("backgroundColor")
                //scrap this crap it needs to be b4 the enter imo
                $(guess[i]).animate({backgroundColor: "red"}, Wordle.tile_reveal_speed, () => {
                    $(guess[i]).animate({backgroundColor: background_colour}, Wordle.tile_reveal_speed, () => {
                        $(guess[i]).css({
                            outline: "2px solid #323234"
                        })
                    })
                })
            })

            return false
        }

        let cell
        let word_to_guess_letters = this.word_to_guess.split("")
        guess.each(i => {
            if ($(guess[i]).text() == word_to_guess_letters[i]) {
                this.letters_still_to_guess[i] = ""
            }

            // if amber guess in removed letter list (dont duplicate ambers)
        })
        guess.each(i => {
            cell = $(guess[i])

            if (cell.text() == word_to_guess_letters[i]) {
                this.letters_used[cell.text()] = 2
            } else if (this.letters_still_to_guess.includes(cell.text())) {
                this.letters_used[cell.text()] = 1
            } else {
                this.letters_used[cell.text()] = 0
            }

            Wurdi.yawn_im_awake_promise ? Wurdi.mmm_i_like_letter_column_soup(i + cell.text(), this.letters_used[cell.text()]) : null

            this.cell_animate(cell, i)
        })

        Wurdi.yawn_im_awake_promise ? Wurdi.mm_letters_used_tasty(this.letters_used) : null

        if (this.word_to_guess == guess.text()) {
            this.has_won = true
        }

        return true
    }

    static cell_animate(cell, offset)
    {
        let colour_info = this.get_colour_from_letter(cell.text())
        setTimeout(() => {
            cell.animate({backgroundColor:colour_info.background}, this.tile_reveal_speed, () => {
                cell.css({outline: "2px solid " + colour_info.outline})
                if (offset == 4) {
                    if (this.has_won) {
                        this.win()
                    } else if (this.has_lost()) {
                        this.lose()
                    }
                }

                this.colourise_letters(cell.text())
            })
        }, offset * this.tile_reveal_speed)
    }

    static win()
    {
        let cell, win = $("." + (Wurdi.won ? "wurdi_" : "") + this.num_of_guesses)
        for (let i = 0; i <= 20; i++) {
            win.each(key => {
                cell = $(win[key])
                let colour = `rgb(
                    ${parseInt(Math.random() * 255)},
                    ${parseInt(Math.random() * 255)},
                    ${parseInt(Math.random() * 255)})
                `
                let letter = cell.text()
                cell.animate({backgroundColor:colour}, this.tile_reveal_speed / 2, () => {
                    $("#" + letter).css({backgroundColor: colour})
                })
            })
        }
    }

    static lose()
    {
        alert("No more guesses! The word was " + this.word_to_guess.toUpperCase())
        $("." + this.num_of_guesses).css({backgroundColor:"red", outline: "#773434"})
    }

    static get_colour_from_letter(letter, letter_mode=false, override_mode=false)
    {
        let background, outline, shadow = true
        switch (override_mode ? override_mode : this.letters_used[letter]) {
            case 2:
                background = "#32aa34"
                outline = "#327734"
                break
            case 1:
                background = "#9a9a34"
                outline = "#868634"
                break
            case 0:
                background = letter_mode ? "black" : "#3a3a3c"
                outline = "#323234"
                shadow = false
                break
        }

        return {
            background: background,
            outline: outline,
            shadow: shadow
        }
    }

    static colourise_letters(letter, remove_colour=false, override_mode=false)
    {
        if (!["Enter", "Backspace"].includes(letter) && this.row > 5) {
            return
        }

        let colour_info_letters = this.get_colour_from_letter(letter, true, override_mode)
        $("#" + letter).animate({
            backgroundColor: (!override_mode ? colour_info_letters.background : undefined) || (remove_colour ? "black" : "#323234"),
        }, this.tile_reveal_speed / 2, () => {
            if (!override_mode) {
                $("#" + letter).css({outline: "2px solid " + colour_info_letters.outline})
            }
        })

        if (!colour_info_letters.shadow) {
            $("#" + letter).css({
                "text-shadow": "none",
                color: colour_info_letters.outline
            })
        }
    }
}