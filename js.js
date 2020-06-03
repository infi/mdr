const markdown = document.querySelector("#markdown")
const output = document.querySelector("#out")
const fullScreenButton = document.querySelector("#fullscr")
const mdWrap = document.querySelector("#markdownWrapper")
const darkToggle = document.querySelector("#darkToggle")
const clear = document.querySelector("#clear")
const saveName = document.querySelector("#savename")
const saveButton = document.querySelector("#save")
const openSelector = document.querySelector("#opener")
const openButton = document.querySelector("#open")
const errorDisplay = document.querySelector("#error")
const tipDisplay = document.querySelector("#tip")
const body = document.querySelector("body")

let fullscreen = false
let useDark = localStorage.getItem("mdrd") === "true" ? true : false

body.classList[useDark ? "add" : "remove"]("dark")

fullScreenButton.addEventListener("click", () => {
    markdown.style.width = fullscreen ? "100%" : "0"
    mdWrap.style.width = fullscreen ? "100%" : "0"
    setTimeout(() => {
        mdWrap.style.display = fullscreen ? "none" : "unset"
    }, 300)
    output.style.flex = fullscreen ? "50%" : "100%"
    output.style.width = fullscreen ? "unset" : "100%"
    fullScreenButton.innerText = fullscreen ? "Full screen" : "Exit Full Screen"
    fullscreen = !fullscreen
})


darkToggle.addEventListener("click", () => {
    body.classList[useDark ? "remove" : "add"]("dark")
    localStorage.setItem("mdrd", !useDark)
    useDark = !useDark
})

clear.addEventListener("click", () => {
    markdown.value = ""
})

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
            filter: (text, _, __) => {
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

saveButton.addEventListener("click", () => {
    const savename = saveName.value
    if (encodeURIComponent(savename) !== savename || !savename) return displayError("Invalid Save Name")
    if (savename.length > 25) return displayError("Save name too long")
    if (["mdrnone"].includes(savename)) return displayError("Sorry, this name is reserved")
    if (!markdown.value) return clearSave(savename)
    const currentSaves = JSON.parse(localStorage.getItem("mdrsaves") || "{}")
    currentSaves[savename] = encodeURIComponent(markdown.value)
    localStorage.setItem("mdrsaves", JSON.stringify(currentSaves))
    addSaveKey(savename)
    openSelector.value = savename
    displayNotification("Saved successfully.")
    displayTip("savedelblank", "You can delete saves by saving them with no content.")
})


const clearSave = (key) => {
    const currentSaves = JSON.parse(localStorage.getItem("mdrsaves") || "{}")
    delete currentSaves[key]
    localStorage.setItem("mdrsaves", JSON.stringify(currentSaves))
    output.innerHTML = ""
    removeSaveKey(key)
    displayNotification(`Because there was no content, save ${key} was deleted or not created.`)
}

const addSaveKey = (key) => {
    const optionEl = document.createElement("option")
    optionEl.setAttribute("value", key)
    optionEl.innerText = key
    openSelector.appendChild(optionEl)
}

const removeSaveKey = (key) => {
    const optionEl = document.querySelector(`option[value=${key}]`)
    openSelector.removeChild(optionEl)
}

markdown.value = ""
saveName.value = ""

Object.keys(JSON.parse(localStorage.getItem("mdrsaves"))).forEach(addSaveKey)

openButton.addEventListener("click", () => {
    if (openSelector.value === "mdrnone") return displayError("Please select a save")
    const currentSaves = JSON.parse(localStorage.getItem("mdrsaves") || "{}")
    const selectedValue = openSelector.value
    markdown.value = decodeURIComponent(currentSaves[selectedValue])
    output.innerHTML = converter.makeHtml(decodeURIComponent(currentSaves[selectedValue]))
    displayNotification(`Opened save ${selectedValue}`)
    saveName.value = selectedValue
})

const converter = new showdown.Converter({
    extensions: ["codehighlight"],
})

const enableOption = (k) => {
    converter.setOption(k, true)
}

[
    "underline", "strikethrough", "emoji",
    "tables", "tasklists", "smoothLivePreview",
    "openLinksInNewWindow"
].forEach(enableOption)

markdown.addEventListener("keyup", () => {
    output.innerHTML = converter.makeHtml(markdown.value)
})

const displayTip = (id, text) => {
    const seenTips = JSON.parse(localStorage.getItem("mdrtips") || "[]")
    if (seenTips.includes(id)) return
    localStorage.setItem("mdrtips", JSON.stringify(seenTips.concat([id])))
    tipDisplay.innerHTML = `<span class="pretip">TIP |</span> ${text}`
    setTimeout(() => {
        tipDisplay.innerText = ""
    }, 3000)
}

const displayNotification = (text) => {
    tipDisplay.innerHTML = text
    setTimeout(() => {
        tipDisplay.innerText = ""
    }, 3000)
}

const displayError = (text) => {
    errorDisplay.innerHTML = `<span class="pretip">ERROR |</span> ${text}`
    setTimeout(() => {
        errorDisplay.innerText = ""
    }, 3000)
}

if (localStorage.getItem("mdrcon")) {
    const currentSaves = JSON.parse(localStorage.getItem("mdrsaves") || "{}")
    currentSaves["mdrcon"] = localStorage.getItem("mdrcon")
    localStorage.setItem("mdrsaves", JSON.stringify(currentSaves))
    localStorage.removeItem("mdrcon")
    displayTip("mdrconmigration", "Because you had a legacy mdrcon save state, it has been converted.")
    addSaveKey("mdrcon")
}