import { Random } from "./random.js"

export class Wordle
{
    static num_of_guesses = 0
    static letters_used = []
    static word_list
    static word_to_guess
    static row = 1
    static tile_reveal_speed = 400
    static has_won = false
    static control_pressed = false
    static backspace_debounce = true

    static init(modes)
    {
        let xmlhttp = new XMLHttpRequest()
        xmlhttp.open("GET", "5_letter_words.txt", false)
        xmlhttp.overrideMimeType("text/plain")
        xmlhttp.send()
        Wordle.word_list = xmlhttp.responseText.split("\n")
        Wordle.set_word(null, modes.random_mode)
        if (modes.ai_mode == 1) {
            $("#ai_mode").text("Solo")
            Wordle.play_wurdi()
        } else {
            $("wurdi-guess").remove()
            $("guess").width("100%")
        }
        Wordle.handle_events()
    }

    static set_word(word = null, random_mode = 0)
    {
        if (!word) {
            let index
            if (random_mode == 1) {
                index = parseInt(Math.random() * Wordle.word_list.length)
                $("#random_mode").text("Daily Challenge")
            } else {
                index = parseInt(Random.rand() * Wordle.word_list.length)
            }

            word = Wordle.word_list[index]
        }

        Wordle.word_to_guess = word
        Wordle.letters_still_to_guess = Wordle.word_to_guess.split("")
    }

    static play_wurdi()
    {

    }

    static has_lost()
    {
        return Wordle.num_of_guesses >= 6
    }

    static has_finished()
    {
        return Wordle.has_won || Wordle.has_lost()
    }

    static handle_events()
    {
        $(document).keydown((e) => {
            Wordle.key_down_event(e.key, e.keyCode)
        })
        $(document).keyup((e) => {
            Wordle.key_up_event(e.key, e.keyCode)
        })
        $("letter").click((el) => {
            let letter = ($(el))[0].target.id
            let code = letter == "Backspace" ? 8 : letter == "Enter" ? 13 : letter.toUpperCase().charCodeAt(0)
            Wordle.key_down_event(letter, code)
            Wordle.key_up_event(letter, code)
        })
    }

    static key_up_event(key, keyCode)
    {
        if (keyCode == 17) {
            Wordle.control_pressed = false
            return
        }
        if (Wordle.allowed_keys(keyCode)) {
            return
        }
        let dark = false
        if ([13,8].includes(keyCode)) {
            dark = true
            if (keyCode == 13) {
                Wordle.colourise_letters("Enter", true, 2)
            } else {
                Wordle.colourise_letters("Backspace", true, 1)
                Wordle.backspace_debounce = false
            }

        } else {
            Wordle.colourise_letters(key, dark)
        }
    }

    static key_down_event(key, keyCode)
    {
        if (keyCode == 17 || Wordle.control_pressed) {
            Wordle.control_pressed = true
            return
        }
        if (Wordle.allowed_keys(keyCode)) {
            return
        }
        let col = Wordle.num_of_guesses + 1
        let id = "#" + Wordle.row + "_" + col

        if (Wordle.row == 1) {
            Wordle.backspace_debounce = true
        }
        if (keyCode == 13) {
            if (Wordle.row == 6) {
                Wordle.colourise_letters("Enter", false, 2)

                if (!Wordle.check($("." + col))) {
                    return
                }
                Wordle.num_of_guesses += 1
                Wordle.row = 1
            }
            return
        }
        if (keyCode == 8) {
            if (Wordle.backspace_debounce) {
                return
            }
            Wordle.row != 1 ? Wordle.row-- : null
            id = "#" + Wordle.row + "_" + col
            let letter = $(id).text()
            $(id).text("⠀")
            if (!$("." + col).text().includes(letter)) {
                Wordle.colourise_letters(letter, true)
            }
            Wordle.colourise_letters("Backspace", false, 1)
            Wordle.backspace_debounce = true
            return
        }
        if (Wordle.row < 6) {
            $("#" + key).css({
                backgroundColor: "#323234",
                outline: "2px solid #323234"
            })
            Wordle.row < 6 ? Wordle.row++ : null
            $(id).text(key)
            Wordle.backspace_debounce = false
        }
    }

    static allowed_keys(key)
    {
        let allowed_keys = [13, 8]
        for (let i = 65; i <= 65 + 26; i++) {
            allowed_keys.push(i)
        }
        return !allowed_keys.includes(key) || Wordle.has_finished()
    }

    static check(guess)
    {
        if (!Wordle.word_list.includes(guess.text()) || Wordle.has_won) {
            return false
        }

        let cell
        let word_to_guess_letters = Wordle.word_to_guess.split("")
        guess.each(i => {
            if ($(guess[i]).text() == word_to_guess_letters[i]) {
                Wordle.letters_still_to_guess[i] = ''
            }
        })
        guess.each(i => {
            cell = $(guess[i])

            if (cell.text() == word_to_guess_letters[i]) {
                Wordle.letters_used[cell.text()] = 2
                Wordle.cell_animate(cell, i)
                return
            }

            if (Wordle.letters_still_to_guess.includes(cell.text())) {
                Wordle.letters_used[cell.text()] = 1
                Wordle.cell_animate(cell, i)
                return
            }

            Wordle.letters_used[cell.text()] = 0
            Wordle.cell_animate(cell, i)
        })

        if (Wordle.word_to_guess == guess.text()) {
            Wordle.has_won = true
        }

        return true
    }

    static cell_animate(cell, offset)
    {
        let colour_info = Wordle.get_colour_from_letter(cell.text())
        setTimeout(() => {
            cell.animate({backgroundColor:colour_info.background}, Wordle.tile_reveal_speed, () => {
                cell.css({outline: "2px solid " + colour_info.outline})
                if (offset == 4) {
                    if (Wordle.has_won) {
                        Wordle.win()
                    }
                    if (Wordle.has_lost()) {
                        Wordle.lose()
                    }
                }

                Wordle.colourise_letters(cell.text())
            })
        }, offset * Wordle.tile_reveal_speed)
    }

    static win()
    {
        let cell, win = $("." + Wordle.num_of_guesses)
        for (let i = 0; i <= 20; i++) {
            win.each(key => {
                cell = $(win[key])
                let colour = `rgb(
                    ${parseInt(Math.random() * 255)},
                    ${parseInt(Math.random() * 255)},
                    ${parseInt(Math.random() * 255)})
                `
                let letter = cell.text()
                cell.animate({backgroundColor:colour}, Wordle.tile_reveal_speed / 2, () => {
                    $("#" + letter).css({backgroundColor: colour})
                })
            })
        }
    }

    static lose()
    {
        $("." + Wordle.num_of_guesses).css({backgroundColor:"red", outline: "#773434"})
    }

    static get_colour_from_letter(letter, letter_mode=false, override_mode=false)
    {
        let background, outline, shadow = true
        switch (override_mode ? override_mode : Wordle.letters_used[letter]) {
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
        let colour_info_letters = Wordle.get_colour_from_letter(letter, true, override_mode)
        $("#" + letter).animate({
            backgroundColor: (!override_mode ? colour_info_letters.background : undefined) || (remove_colour ? "black" : "#323234"),
        }, Wordle.tile_reveal_speed / 2, () => {
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