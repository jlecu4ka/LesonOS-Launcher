const fs = require('fs-extra')
const path = require('path')
const toml = require('toml')
const merge = require('lodash.merge')

let lang

exports.loadLanguage = function(id){
    const filePath = path.join(__dirname, '..', 'lang', `${id}.toml`)
    if (fs.existsSync(filePath)) {
        lang = merge(lang || {}, toml.parse(fs.readFileSync(filePath)) || {})
    } else {
        console.warn(`Файл перевода не найден: ${id}.toml`)
    }
}

exports.query = function(id, placeHolders){
    let query = id.split('.')
    let res = lang
    for(let q of query){
        if (res === undefined) break
            res = res[q]
    }
    let text = res === lang || res === undefined ? '' : res
    if (placeHolders && typeof text === 'string') {
        Object.entries(placeHolders).forEach(([key, value]) => {
            text = text.replace(`{${key}}`, value)
        })
    }
    return text
}

exports.queryJS = function(id, placeHolders){
    return exports.query(`js.${id}`, placeHolders)
}

exports.queryEJS = function(id, placeHolders){
    return exports.query(`ejs.${id}`, placeHolders)
}

exports.setupLanguage = function(){
    // Загружаем базовый английский
    exports.loadLanguage('en_US')

    // Безопасно подгружаем ConfigManager (только когда функция вызвана)
    try {
        const ConfigManager = require('./configmanager')
        const selectedLocale = ConfigManager.getLocale()

        if (selectedLocale && selectedLocale !== 'en_US') {
            exports.loadLanguage(selectedLocale)
        }
    } catch (e) {
        console.warn("Не удалось загрузить настройки языка:", e.message)
    }

    // Загружаем кастомный файл
    exports.loadLanguage('_custom')
}
