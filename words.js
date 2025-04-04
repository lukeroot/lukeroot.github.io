export class Words
{
    static words = []

    static get_list()
    {
        if (this.words.length) {
            return this.words
        }

        let xmlhttp = new XMLHttpRequest()
        xmlhttp.open("GET", "5_letter_words.txt", false)
        xmlhttp.overrideMimeType("text/plain")
        xmlhttp.send()
        this.words = xmlhttp.responseText.split("\n")
        this.words.pop()
        return this.words
    }
}