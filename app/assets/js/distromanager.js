const { DistributionAPI } = require('helios-core/common')
const ConfigManager = require('./configmanager')
const { LoggerUtil } = require('helios-core')

const logger = LoggerUtil.getLogger('DistroManager')

const MIRROR_URL = 'https://lesonos-mc-files.duckdns.org:8443/api/public/dl/C2btCLUF/distribution.json'
const HOME_URL = 'https://lesonos-mc.duckdns.org/launcher/distribution.json'

// Создаем объект один раз. Пути (commonDir, instanceDir) будут внедрены позже в preloader.js
const api = new DistributionAPI(
    ConfigManager.getLauncherDirectory(),
                                null,
                                null,
                                HOME_URL,
                                false
)

exports.DistroAPI = api

// Функция проверки зеркала
exports.checkMirrorAndUpdate = async function() {
    logger.info('Проверка доступности зеркала в Польше...')
    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)

        const res = await fetch(MIRROR_URL, { method: 'GET', signal: controller.signal })
        clearTimeout(timeoutId)

        if (res.ok) {
            logger.info('Зеркало в Польше доступно. Используем его.')
            // Меняем ссылку внутри уже существующего объекта, чтобы UI не потерял его
            exports.DistroAPI.remoteUrl = MIRROR_URL
            return true
        } else {
            logger.warn(`Польское зеркало вернуло статус ${res.status}. Переключаемся на РФ.`)
        }
    } catch (err) {
        logger.warn('Польское зеркало недоступно. Переключаемся на РФ.')
    }
    return false
}
