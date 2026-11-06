const {ipcRenderer}  = require('electron')
const fs             = require('fs-extra')
const os             = require('os')
const path           = require('path')

const ConfigManager  = require('./configmanager')
const DistroManager  = require('./distromanager') // Импортируем весь модуль
const LangLoader     = require('./langloader')
const { LoggerUtil } = require('helios-core')

const logger = LoggerUtil.getLogger('Preloader')

logger.info('Loading..')

// Загружаем конфиг СРАЗУ, чтобы пути были доступны
ConfigManager.load()
// Load Strings
LangLoader.setupLanguage()

function onDistroLoad(data){
    if(data != null){
        if(ConfigManager.getSelectedServer() == null || data.getServerById(ConfigManager.getSelectedServer()) == null){
            logger.info('Determining default selected server..')
            ConfigManager.setSelectedServer(data.getMainServer().rawServer.id)
            ConfigManager.save()
        }
    }
    ipcRenderer.send('distributionIndexDone', data != null)
}

// Проверяем зеркало, затем внедряем пути и загружаем дистрибутив
DistroManager.checkMirrorAndUpdate().then(() => {

    const api = DistroManager.DistroAPI

    // Внедряем пути после загрузки конфига
    api['commonDir'] = ConfigManager.getCommonDirectory()
    api['instanceDir'] = ConfigManager.getInstanceDirectory()

    return api.getDistribution()
})
.then(heliosDistro => {
    logger.info('Loaded distribution index.')
    onDistroLoad(heliosDistro)
})
.catch(err => {
    logger.info('Failed to load distribution index.')
    logger.error(err)
    onDistroLoad(null)
})

// Clean up temp dir incase previous launches ended unexpectedly.
fs.remove(path.join(os.tmpdir(), ConfigManager.getTempNativeFolder()), (err) => {
    if(err){
        logger.warn('Error while cleaning natives directory', err)
    } else {
        logger.info('Cleaned natives directory.')
    }
})
