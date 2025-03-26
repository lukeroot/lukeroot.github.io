$(() => {


    class Random
    {
        static cyrb128(str)
        {
            let h1 = 1779033703, h2 = 3144134277,
                h3 = 1013904242, h4 = 2773480762;
            for (let i = 0, k; i < str.length; i++) {
                k = str.charCodeAt(i);
                h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
                h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
                h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
                h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
            }
            h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
            h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
            h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
            h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
            h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
            return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
        }

        static sfc32(a, b, c, d)
        {
            a |= 0; b |= 0; c |= 0; d |= 0;
            let t = (a + b | 0) + d | 0;
            d = d + 1 | 0;
            a = b ^ b >>> 9;
            b = c + (c << 3) | 0;
            c = (c << 21 | c >>> 11);
            c = c + t | 0;
            return (t >>> 0) / 4294967296;
        }

        static rand(seed=null)
        {
            if (!seed) {
                seed = (new Date()).toLocaleDateString("en-UK")
            }

            return Random.sfc32(...Random.cyrb128(seed))
        }
    }

    class Wordle
    {
        static num_of_guesses = 0
        static letters_used = []
        static word_list
        static word_to_guess
        static tile_reveal_speed = 500
        static has_won = false

        static init(random_mode = false)
        {
            let xmlhttp = new XMLHttpRequest()
            xmlhttp.open("GET", "5_letter_words.txt", false)
            xmlhttp.overrideMimeType("text/plain")
            xmlhttp.send()
            Wordle.word_list = xmlhttp.responseText.split("\n")
            Wordle.set_word(null, random_mode)
        }

        static set_word(word = null, random_mode = false)
        {
            if (!word) {
                let index
                if (random_mode == 1) {
                    index = parseInt(Math.random() * Wordle.word_list.length)
                } else {
                    index = parseInt(Random.rand() * Wordle.word_list.length)
                }

                word = Wordle.word_list[index]
            }

            Wordle.word_to_guess = word
            Wordle.letters_still_to_guess = Wordle.word_to_guess.split("")
        }

        static check(guess)
        {
            if (!Wordle.word_list.includes(guess.text()) || Wordle.has_won) {
                return false
            }

            let cell
            let word_to_guess_letters = Wordle.word_to_guess.split("")
            guess.each(i => {
                cell = $(guess[i])

                if (cell.text() == word_to_guess_letters[i]) {
                    Wordle.letters_used[cell.text()] = 2
                    Wordle.cell_animate(cell, i)
                    Wordle.letters_still_to_guess[i] = ''
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

        static cell_animate(cell, offset) {
            let colour_info = Wordle.get_colour_from_letter(cell.text())
            setTimeout(() => {
                cell.animate({backgroundColor:colour_info.background}, Wordle.tile_reveal_speed, () => {
                    cell.css({outline: "2px solid " + colour_info.outline})
                    if (offset == 4) {
                        if (Wordle.has_won) {
                            alert('You have won!')
                        }
                        if (Wordle.has_lost()) {
                            alert('You have lost! The word was ' + Wordle.word_to_guess)
                        }
                    }

                    Wordle.colourise_letters(cell.text())
                })
            }, offset * Wordle.tile_reveal_speed)
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
                shadow: shadow,
            }
        }

        static colourise_letters(letter, remove_colour=false, override_mode=false)
        {
            let colour_info_letters = Wordle.get_colour_from_letter(letter, true, override_mode)
// console.log(override_mode ? colour_info_letters.background : undefined || (remove_colour ? "black" : "#323234"))
            $("#" + letter).animate({
                backgroundColor: (!override_mode ? colour_info_letters.background : undefined) || (remove_colour ? "black" : "#323234"),
                outline: "2px solid " + colour_info_letters.outline
            }, Wordle.tile_reveal_speed / 2)

            if (!colour_info_letters.shadow) {
                $("#" + letter).css({
                    "text-shadow": "none",
                    color: colour_info_letters.outline
                })
            }
        }

        static has_lost()
        {
            return Wordle.num_of_guesses >= 6
        }

        static has_finished()
        {
            return Wordle.has_won || Wordle.has_lost()
        }
    }
    // $('head').append('<meta name="viewport" content="width=device-width, initial-scale=' + Math.min(1, Math.abs(Math.log(window.screen.width/250))).toFixed(2)  +'">');


    let id, guess, row = 1, random_mode
    let terms = window.location.search.substr(1)
    random_mode = terms.includes("random") ? terms.split("random=").pop().split("&")[0] : ""
    $("#mode").click(() => {
        if (random_mode == 1) {
            random_mode = 0
        } else {
            random_mode = 1
        }
        window.location.href = "index.html?random=" + random_mode
    })

    Wordle.init(random_mode)

    let control_pressed = false, enter_debounce = true, backspace_debounce = true
    document.addEventListener("keyup", function(e){
        if (e.keyCode == 17) {
            control_pressed = false
            return
        }
        if (![13,8,...Array(26).keys().toArray().map(x=>x+=65)].includes(e.keyCode) || Wordle.has_finished()) {
            return
        }
        let dark = false
        if ([13,8].includes(e.keyCode)) {
            dark = true
            if (e.keyCode == 13) {
                Wordle.colourise_letters("Enter", true, 2)
                // enter_debounce = false
            } else {
                Wordle.colourise_letters("Backspace", true, 1)
                backspace_debounce = false
            }

        } else {
            Wordle.colourise_letters(e.key, dark)
        }
    })

    document.addEventListener("keydown", function(e){
        if (e.keyCode == 17 || control_pressed) {
            control_pressed = true
            return
        }
        if (![13,8,...Array(26).keys().toArray().map(x=>x+=65)].includes(e.keyCode) || Wordle.has_finished()) {
            return
        }
        col = Wordle.num_of_guesses + 1
        id = "#" + row + "_" + col

        if (row == 1) {
            backspace_debounce = true
        }
        if (e.keyCode == 13) {
            if (row == 6) {
                guess = $("." + col)
                Wordle.colourise_letters("Enter", false, 2)
                // enter_debounce = true

                if (!Wordle.check(guess)) {
                    return
                }
                Wordle.num_of_guesses += 1
                row = 1
            }
            return
        }
        if (e.keyCode == 8) {
            if (backspace_debounce) {
                return
            }
            row != 1 ? row-- : null
            // console.log("#" + $(id).text())
            id = "#" + row + "_" + col
            // $("#" + $(id).text()).css({backgroundColor: "black"})
            let letter = $(id).text()
            $(id).text("⠀")
            if (!$("." + col).text().includes(letter)) {
                Wordle.colourise_letters(letter, true)
            }
            Wordle.colourise_letters("Backspace", false, 1)
            backspace_debounce = true
            return
        }
        if (row < 6) {
            $("#" + e.key).css({
                backgroundColor: "#323234",
                outline: "2px solid #323234"
            })
            row < 6 ? row++ : null
            $(id).text(e.key)
            backspace_debounce = false
        }
    })


})