import { Wordle } from "./wordle.js"

$(() => {
    // $('head').append('<meta name="viewport" content="width=device-width, initial-scale=' + Math.min(1, Math.abs(Math.log(window.screen.width/250))).toFixed(2)  +'">');
    let terms = window.location.search.substr(1)
    let modes = {
        random_mode: terms.includes("random_mode") ? terms.split("random_mode=").pop().split("&")[0] : "",
        ai_mode: terms.includes("ai_mode") ? terms.split("ai_mode=").pop().split("&")[0] : ""
    }
    let params = ""
    for (let mode_index in modes) {
        if (!params) {
            params = "?"
        } else {
            params += "&"
        }
        let value = modes[mode_index]
        params += mode_index + "=" + (value || 0)
        $("#" + mode_index).click((el) => {
            if (value == 1) {
                value = 0
            } else {
                value = 1
            }
            let key = ($(el))[0].target.classList[0]
            params = params.replace(new RegExp(key + "=."), key + "=" + value)
            window.location.href = "index.html" + params
        })
    }
    Wordle.init(modes)
})