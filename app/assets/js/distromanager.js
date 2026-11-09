const { DistributionAPI } = require('helios-core/common')
const ConfigManager = require('./configmanager')
const { LoggerUtil } = require('helios-core')

const logger = LoggerUtil.getLogger('DistroManager')

// Указываем домены/IP
// 77.239.226.206 - основной сайт
// 95.85.246.91 - хостинг зеркала
const MIRROR_URL = 'http://95.85.246.91:8443/api/public/dl/C2btCLUF/distribution.json' // <-- Замени на актуальный порт/путь с хостинга 95.85.246.91
const HOME_URL = 'https://lesonos-mc.duckdns.org/launcher/distribution.json' // Основной сервер с сайтом

const api = new DistributionAPI(
    ConfigManager.getLauncherDirectory(),
    null,
    null,
    HOME_URL,
    false
)

exports.DistroAPI = api

exports.checkMirrorAndUpdate = async function() {
    logger.info('Проверка доступности зеркала на хостинге...')
    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)

        const res = await fetch(MIRROR_URL, { method: 'GET', signal: controller.signal })
        clearTimeout(timeoutId)

        if (res.ok) {
            logger.info('Зеркало на хостинге доступно. Используем его.')
            exports.DistroAPI.remoteUrl = MIRROR_URL
            return true
        } else {
            logger.warn(`Зеркало вернуло статус ${res.status}. Переключаемся на основной сайт.`)
        }
    } catch (err) {
        logger.warn('Зеркало недоступно. Переключаемся на основной сайт.')
    }
    return false
}
