const Store = require('electron-store');
const crypto = require('crypto');
const path = require('path');
const os = require('os');

class DatabaseManager {
  constructor() {
    // 使用 electron-store 替代 SQLite
    this.store = new Store({
      name: 'claude-key-manager',
      cwd: path.join(os.homedir(), '.claude-key-manager'),
      encryptionKey: this.getMasterKey(),
      schema: {
        apiSources: {
          type: 'array',
          default: [],
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              api_key_encrypted: { type: 'string' },
              api_base: { type: 'string' },
              model: { type: 'string' },
              is_default: { type: 'boolean' },
              is_active: { type: 'boolean' },
              created_at: { type: 'string' },
              updated_at: { type: 'string' }
            }
          }
        },
        appSettings: {
          type: 'object',
          default: {}
        },
        nextId: {
          type: 'number',
          default: 1
        }
      }
    });
    
    this.encryption = new EncryptionManager();
  }

  getMasterKey() {
    // 生成或获取主密钥
    const keyPath = path.join(os.homedir(), '.claude-key-manager', 'master.key');
    try {
      const fs = require('fs');
      if (fs.existsSync(keyPath)) {
        return fs.readFileSync(keyPath, 'utf8');
      } else {
        // 生成新密钥
        const key = crypto.randomBytes(32).toString('hex');
        fs.mkdirSync(path.dirname(keyPath), { recursive: true });
        fs.writeFileSync(keyPath, key, { mode: 0o600 });
        return key;
      }
    } catch (error) {
      console.error('Master key error:', error);
      // 回退到内存密钥
      return crypto.randomBytes(32).toString('hex');
    }
  }

  async getAllSources() {
    const sources = this.store.get('apiSources', []);
    
    // 解密 API keys并返回正确格式
    const result = sources.map(source => ({
      ...source,
      apiKey: this.encryption.decrypt(source.api_key_encrypted) // 返回真实密钥供前端使用
    }));
    
    return result;
  }

  async getSourceById(id) {
    const sources = this.store.get('apiSources', []);
    const source = sources.find(s => s.id === id);
    
    if (source) {
      return {
        ...source,
        decryptedKey: this.encryption.decrypt(source.api_key_encrypted)
      };
    }
    return null;
  }

  async saveSource(sourceData) {
    const { id, name, apiKey, api_base, model, is_default } = sourceData;
    
    try {
      // 加密 API Key
      const encryptedKey = this.encryption.encrypt(apiKey);
      const sources = this.store.get('apiSources', []);
      const now = new Date().toISOString();
      
      if (id) {
        // 更新现有源
        const index = sources.findIndex(s => s.id === id);
        if (index !== -1) {
          sources[index] = {
            ...sources[index],
            name,
            api_key_encrypted: encryptedKey,
            api_base: api_base,
            model: model,
            is_default: is_default,
            updated_at: now
          };
        }
      } else {
        // 创建新源
        if (is_default) {
          // 如果设置为默认，先清除其他默认设置
          sources.forEach(s => s.is_default = false);
        }
        
        const nextId = this.store.get('nextId', 1);
        const newSource = {
          id: nextId,
          name,
          api_key_encrypted: encryptedKey,
          api_base: api_base,
          model: model,
          is_default: is_default,
          is_active: false,
          created_at: now,
          updated_at: now
        };
        
        sources.push(newSource);
        this.store.set('nextId', nextId + 1);
        
        this.store.set('apiSources', sources);
        return nextId;
      }
      
      this.store.set('apiSources', sources);
      return true;
    } catch (error) {
      console.error('Database save error:', error);
      throw error;
    }
  }

  async deleteSource(id) {
    const sources = this.store.get('apiSources', []);
    const filteredSources = sources.filter(s => s.id !== id);
    
    if (filteredSources.length !== sources.length) {
      this.store.set('apiSources', filteredSources);
      return true;
    }
    return false;
  }

  async setActiveSource(id) {
    const sources = this.store.get('apiSources', []);
    
    // 清除所有活跃状态并设置新的活跃源
    sources.forEach(s => {
      s.is_active = s.id === id;
    });
    
    this.store.set('apiSources', sources);
  }

  async getActiveSource() {
    const sources = this.store.get('apiSources', []);
    const activeSource = sources.find(s => s.is_active);
    
    if (activeSource) {
      return {
        ...activeSource,
        decryptedKey: this.encryption.decrypt(activeSource.api_key_encrypted)
      };
    }
    return null;
  }

  async getSetting(key) {
    const settings = this.store.get('appSettings', {});
    return settings[key] || null;
  }

  async setSetting(key, value) {
    const settings = this.store.get('appSettings', {});
    settings[key] = value;
    this.store.set('appSettings', settings);
  }

  close() {
    // electron-store 不需要显式关闭
  }
}

class EncryptionManager {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
    this.ivLength = 16;
    this.saltLength = 16;
    this.tagLength = 16;
    this.iterations = 100000;
    
    // 使用简化的密钥管理
    this.masterKey = this.getMasterKey();
  }

  getMasterKey() {
    // 简化版本：使用固定的密钥派生
    const keyData = 'claude-key-manager-secret-key-2024';
    return crypto.createHash('sha256').update(keyData).digest();
  }

  encrypt(text) {
    try {
      const salt = crypto.randomBytes(this.saltLength);
      const iv = crypto.randomBytes(this.ivLength);
      
      // 使用 PBKDF2 派生密钥
      const key = crypto.pbkdf2Sync(this.masterKey, salt, this.iterations, this.keyLength, 'sha256');
      
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
      const tag = cipher.getAuthTag();
      
      // 组合所有部分
      const result = Buffer.concat([salt, iv, tag, encrypted]);
      return result.toString('base64');
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  decrypt(encryptedData) {
    try {
      const data = Buffer.from(encryptedData, 'base64');
      
      // 提取各部分
      const salt = data.slice(0, this.saltLength);
      const iv = data.slice(this.saltLength, this.saltLength + this.ivLength);
      const tag = data.slice(this.saltLength + this.ivLength, this.saltLength + this.ivLength + this.tagLength);
      const encrypted = data.slice(this.saltLength + this.ivLength + this.tagLength);
      
      // 派生密钥
      const key = crypto.pbkdf2Sync(this.masterKey, salt, this.iterations, this.keyLength, 'sha256');
      
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(tag);
      
      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
      return decrypted.toString('utf8');
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }
}

module.exports = DatabaseManager;
