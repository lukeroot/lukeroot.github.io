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
        static word_list
        static word_to_guess
        static tile_reveal_speed = 500

        static init()
        {
            let xmlhttp = new XMLHttpRequest()
            xmlhttp.open("GET", "5_letter_words.txt", false)
            xmlhttp.overrideMimeType("text/plain")
            xmlhttp.send()
            Wordle.word_list = xmlhttp.responseText.split("\n")
            Wordle.set_word()
        }

        static set_word(word = null)
        {
            if (!word) {
                word = Wordle.word_list[
                    // parseInt(Random.rand() * Wordle.word_list.length)
                    parseInt(Math.random())
                ]
            }

            Wordle.word_to_guess = word.split('')
            Wordle.letters_to_guess = Wordle.word_to_guess
        }

        static check(guess)
        {
            if (!Wordle.word_list.includes(guess.text())) {
                return false
            }

            let cell
            guess.each(i => {
                cell = $(guess[i])
                if (cell.text() == Wordle.word_to_guess[i]) {
                    Wordle.cell_animate("#32aa34", i, cell)
                    Wordle.letters_to_guess[i] = ''
                    return
                }

                if (Wordle.letters_to_guess.includes(cell.text())) {
                    Wordle.cell_animate("#9a9a34", i, cell)
                    return
                }

                Wordle.cell_animate("#3a3a3c", i, cell)
            })

            return true
        }

        static cell_animate(colour, i, cell) {
            // console.log(cell)
            setTimeout(() => {
                cell.animate({backgroundColor:colour}, Wordle.tile_reveal_speed, () => {
                    $(this).css({backgroundColor:colour})
                })
            }, i * Wordle.tile_reveal_speed)
        }
    }

    Wordle.init()

    let row = 1
    let col = 1
    let guess
    let id
    document.addEventListener("keydown",function(e){
        if (![13,8,...Array(26).keys().map(x=>x+=65)].includes(e.keyCode)) {
            return
        }
        id = "#" + row + "_" + col
        if (e.keyCode == 13) {
            if (row == 6) {
                guess = $("." + col)
                if (!Wordle.check(guess)) {
                    return
                }
                // guess.each(i => {
                //     setTimeout(() => {
                //         $(guess[i]).animate({backgroundColor:"#3a3a3c"}, tile_reveal_speed, () => {
                //             $(this).css({backgroundColor:"#3a3a3c"})
                //         })
                //     }, i * tile_reveal_speed)
                // })
                // $()
                col += 1
                row = 1
            }
            return
        }
        if (e.keyCode == 8) {
            row != 1 ? row-- : null
            id = "#" + row + "_" + col
            $(id).text("⠀")
            return
        }
        if (row < 6) {
            row < 6 ? row++ : null
            $(id).text(e.key)
        }
    })
})