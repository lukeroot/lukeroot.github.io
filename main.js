$(() => {
    Array.prototype.myMap = function(callbackFn) {
      var arr = [];
      for (var i = 0; i < this.length; i++) {
         /* call the callback function for every value of this array and       push the returned value into our resulting array
         */
        arr.push(callbackFn(this[i], i, this));
      }
      return arr;
    }
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
        static word_to_guess_letters
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

            Wordle.word_to_guess_letters = word.split('')
            Wordle.letters_still_to_guess = structuredClone(Wordle.word_to_guess_letters)
        }

        static check(guess)
        {
            if (!Wordle.word_list.includes(guess.text()) || Wordle.has_won) {
                return false
            }

            let cell
            guess.each(i => {
                cell = $(guess[i])
                if (cell.text() == Wordle.word_to_guess_letters[i]) {
                    Wordle.cell_animate(cell, i, "green")
                    Wordle.letters_still_to_guess[i] = ''
                    return
                }

                if (Wordle.letters_still_to_guess.includes(cell.text())) {
                    Wordle.cell_animate(cell, i, "orange")
                    return
                }

                Wordle.cell_animate(cell, i)
            })

            if (Wordle.word_to_guess_letters.join("") == guess.text()) {
                Wordle.has_won = true
            }

            return true
        }

        static cell_animate(cell, offset, colour = "grey") {
            let background, outline
            switch (colour) {
                case "green":
                    background = "#32aa34"
                    outline = "#327734"
                    break
                case "orange":
                    background = "#9a9a34"
                    outline = "#868634"
                    break
                case "grey":
                    background = "#3a3a3c"
                    outline = "#323234"
                    break

            }
            setTimeout(() => {
                cell.animate({backgroundColor:background}, Wordle.tile_reveal_speed, () => {
                    cell.css({outline: "2px solid " + outline})
                    if (Wordle.has_won && offset == 4) {
                        alert('You have won!')
                    }
                })
            }, offset * Wordle.tile_reveal_speed)
        }
    }


    let id, guess, row = 1, col = 1, random_mode
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

    document.addEventListener("keydown",function(e){
        if (![13,8,...Array(26).keys().map(x=>x+=65)].includes(e.keyCode) || Wordle.has_won) {
            return
        }
        id = "#" + row + "_" + col
        if (e.keyCode == 13) {
            if (row == 6) {
                guess = $("." + col)
                if (!Wordle.check(guess)) {
                    return
                }
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