const crypto = require('crypto')

const loginOptionsCancelContainer = document.getElementById('loginOptionCancelContainer')
const loginOptionMicrosoft = document.getElementById('loginOptionMicrosoft')
const loginOptionMojang = document.getElementById('loginOptionMojang')
const loginOptionOffline = document.getElementById('loginOptionOffline')
const loginOptionsCancelButton = document.getElementById('loginOptionCancelButton')

const offlineLoginModal = document.getElementById('offlineLoginModal')
const offlineNickInput = document.getElementById('offlineNickInput')
const offlinePlayBtn = document.getElementById('offlinePlayBtn')
const offlineCancelBtn = document.getElementById('offlineCancelBtn')

// Обычные глобальные переменные, которые видит uibinder.js и welcome.js
let loginOptionsCancellable = false
let loginOptionsViewOnLoginSuccess
let loginOptionsViewOnLoginCancel
let loginOptionsViewOnCancel
let loginOptionsViewCancelHandler

function loginOptionsCancelEnabled(val){
    if(loginOptionsCancelContainer) {
        if(val){
            $(loginOptionsCancelContainer).show()
        } else {
            $(loginOptionsCancelContainer).hide()
        }
    }
}

if (loginOptionMicrosoft) {
    loginOptionMicrosoft.onclick = (e) => {
        switchView(getCurrentView(), VIEWS.waiting, 500, 500, () => {
            ipcRenderer.send(
                MSFT_OPCODE.OPEN_LOGIN,
                loginOptionsViewOnLoginSuccess,
                loginOptionsViewOnLoginCancel
            )
        })
    }
}

if (loginOptionMojang) {
    loginOptionMojang.onclick = (e) => {
        switchView(getCurrentView(), VIEWS.login, 500, 500, () => {
            loginViewOnSuccess = loginOptionsViewOnLoginSuccess
            loginViewOnCancel = loginOptionsViewOnLoginCancel
            loginCancelEnabled(true)
        })
    }
}

if (loginOptionOffline) {
    loginOptionOffline.onclick = (e) => {
        e.target.blur()
        if (offlineLoginModal) {
            offlineLoginModal.style.display = 'flex'
            offlineNickInput.value = ''
            offlineNickInput.focus()
        }
    }
}

if (offlineCancelBtn) {
    offlineCancelBtn.onclick = () => {
        if (offlineLoginModal) offlineLoginModal.style.display = 'none'
    }
}

if (offlinePlayBtn) {
    offlinePlayBtn.onclick = () => {
        const cleanName = offlineNickInput.value.trim()
        if (!/^[a-zA-Z0-9_]{3,16}$/.test(cleanName)) {
            alert('Неверный ник! Используйте 3-16 символов: A-Z, 0-9, _')
            return
        }

        const hash = crypto.createHash('md5').update('OfflinePlayer:' + cleanName).digest('hex')
        const uuid = `${hash.slice(0,8)}-${hash.slice(8,12)}-${hash.slice(12,16)}-${hash.slice(16,20)}-${hash.slice(20)}`

        ConfigManager.addMojangAuthAccount(uuid, 'offline', cleanName, cleanName)
        ConfigManager.setSelectedAccount(uuid)
        ConfigManager.save()

        if (offlineLoginModal) offlineLoginModal.style.display = 'none'

            updateSelectedAccount(ConfigManager.getSelectedAccount())
            switchView(getCurrentView(), loginOptionsViewOnLoginSuccess, 500, 500)
    }
}

if (offlineNickInput) {
    offlineNickInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            offlinePlayBtn.click()
        }
    })
}

if (loginOptionsCancelButton) {
    loginOptionsCancelButton.onclick = (e) => {
        switchView(getCurrentView(), loginOptionsViewOnCancel, 500, 500, () => {
            if (typeof loginUsername !== 'undefined' && loginUsername) loginUsername.value = ''
                if (typeof loginPassword !== 'undefined' && loginPassword) loginPassword.value = ''
                    if(loginOptionsViewCancelHandler != null){
                        loginOptionsViewCancelHandler()
                        loginOptionsViewCancelHandler = null
                    }
        })
    }
}
