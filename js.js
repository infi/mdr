const t = document.querySelector("#a")
const o = document.querySelector("#v")
const b = document.querySelector("#f")
const l = document.querySelector("#c")
const m = document.querySelector("#d")
const s = document.querySelector("#e")
const r = document.querySelector("#w")

let fullscreen = false
let dark = localStorage.getItem("mdrd") === null ? false : !!localStorage.getItem("mdrd")

r.classList[dark ? "add" : "remove"]("dark")

b.addEventListener("click", () => {
    t.style.width = fullscreen ? "100%" : "0"
    l.style.width = fullscreen ? "100%" : "0"
    setTimeout(() => {
        l.style.display = fullscreen ? "none" : "unset"
    }, 300)
    v.style.flex = fullscreen ? "50%" : "100%"
    v.style.width = fullscreen ? "unset" : "100%"
    b.innerText = fullscreen ? "Full screen" : "Exit Full Screen"
    fullscreen = !fullscreen
})


m.addEventListener("click", () => {
    r.classList[dark ? "remove" : "add"]("dark")
    localStorage.setItem("mdrd", !dark)
    dark = !dark
})

s.addEventListener("click", () => {
    t.value = ""
    localStorage.removeItem("mdrcon")
})

const c = decodeURIComponent(localStorage.getItem("mdrcon"))

t.value = c === "null" ? "" : c

showdown.extension('codehighlight', () => {
    const htmlunencode = (text) => {
        return (
            text
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
        )
    }
    return [
        {
            type: 'output',
            filter: (text, converter, options) => {
                const left = '<pre><code\\b[^>]*>'
                const right = '</code></pre>'
                const flags = 'g',
                    replacement = (wholeMatch, match, left, right) => {
                        match = htmlunencode(match)
                        return left + hljs.highlightAuto(match).value + right
                    }
                return showdown.helper.replaceRecursiveRegExp(text, replacement, left, right, flags)
            }
        }
    ]
})


const con = new showdown.Converter({
    extensions: ["codehighlight"],
})

const so = (k) => {
    con.setOption(k, true)
}

[
    "underline", "strikethrough", "emoji",
    "tables", "tasklists", "smoothLivePreview",
    "openLinksInNewWindow"
].forEach(so)

t.addEventListener("keyup", () => {
    localStorage.setItem("mdrcon", encodeURIComponent(t.value))
    o.innerHTML = con.makeHtml(t.value)
})