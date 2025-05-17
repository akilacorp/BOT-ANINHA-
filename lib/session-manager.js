
const fs = require('fs');
const path = require('path');


const SESSIONS_DIR = path.join(__dirname, '../auth_info_baileys');
const MAX_SESSION_AGE = 7 * 24 * 60 * 60 * 1000; // 7 dias

/**
 * 
 */
function cleanStaleSessions() {
    try {
        if (!fs.existsSync(SESSIONS_DIR)) {
            return {
                success: true,
                message: 'Diretório de sessões não encontrado'
            };
        }
        
        console.log('🧹 Verificando sessões antigas...');
        
        const now = Date.now();
        let removedCount = 0;
        
        const files = fs.readdirSync(SESSIONS_DIR);
        
        const senderKeyFiles = files.filter(file => 
            file.includes('sender-key') || 
            file.includes('app-state-sync')
        );
        
        senderKeyFiles.forEach(file => {
            const filePath = path.join(SESSIONS_DIR, file);
            const stats = fs.statSync(filePath);
            
            const fileAge = now - stats.mtimeMs;
            
            if (fileAge > MAX_SESSION_AGE) {
                try {
                    fs.unlinkSync(filePath);
                    removedCount++;
                } catch (err) {
                    console.error(`Erro ao remover arquivo ${file}: ${err.message}`);
                }
            }
        });
        
        console.log(`✅ Limpeza concluída: ${removedCount} sessões antigas removidas`);
        
        return {
            success: true,
            removedCount,
            totalFiles: senderKeyFiles.length
        };
    } catch (error) {
        console.error(`❌ Erro ao limpar sessões: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 
 */
function backupCredentials() {
    try {
        const backupDir = path.join(__dirname, '../auth_info_baileys_backup');
        
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        if (!fs.existsSync(SESSIONS_DIR)) {
            return {
                success: false,
                message: 'Diretório de sessões não encontrado'
            };
        }
        
        if (fs.existsSync(path.join(SESSIONS_DIR, 'creds.json'))) {
            fs.copyFileSync(
                path.join(SESSIONS_DIR, 'creds.json'),
                path.join(backupDir, `creds-${Date.now()}.json`)
            );
        }
        
        console.log('✅ Backup de credenciais criado com sucesso');
        
        return {
            success: true,
            backupPath: backupDir
        };
    } catch (error) {
        console.error(`❌ Erro ao fazer backup: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 
 */
class SessionManager {
    /**
     * 
     * @param {number} timeout 
     */
    constructor(timeout = 6 * 60 * 60 * 1000) {
        this.sessions = new Map();
        this.timeout = timeout || 6 * 60 * 60 * 1000;
        console.log(`📝 Gerenciador de sessões inicializado (timeout: ${this.timeout/1000/60} minutos)`);
        
       
        cleanStaleSessions();
    }
    
    /**
     * 
     * @param {string} chatId 
     * @returns {Object} 
     */
    updateSession(chatId) {
        const now = Date.now();
        
     
        const existingSession = this.sessions.get(chatId);
        
        if (existingSession) {
           
            existingSession.lastActivity = now;
            return existingSession;
        } else {
          
            const newSession = {
                chatId,
                createdAt: now,
                lastActivity: now,
                context: [],
                active: true
            };
            
            this.sessions.set(chatId, newSession);
            return newSession;
        }
    }
    
    /**
     * 
     * @param {string} chatId 
     * @returns {boolean} 
     */
    isSessionActive(chatId) {
        const session = this.sessions.get(chatId);
        
        if (!session) return false;
        
        const now = Date.now();
        const elapsed = now - session.lastActivity;
        
 
        if (elapsed > this.timeout) {
            session.active = false;
            return false;
        }
        
        return session.active;
    }
}

module.exports = {
    cleanStaleSessions,
    backupCredentials,
    SessionManager
};
