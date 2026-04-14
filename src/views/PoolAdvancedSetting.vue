<template>
  <div class="pool-advanced-setting-container">
    <div class="header-section">
      <h2 class="page-title">{{ $t('pool.advancedSetting') }}</h2>
      <div class="button-group">
        <button @click="goBack" class="action-btn back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          {{ $t('common.back') }}
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ $t('common.loading') }}</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchAdvancedSettings" class="retry-btn">{{ $t('common.retry') }}</button>
    </div>

    <!-- 高级设置数据 -->
    <div v-else-if="advancedData" class="settings-content">
      <div class="pool-name-header">
        <span class="label">{{ $t('pool.name') }}:</span>
        <span class="value">{{ poolName }}</span>
      </div>
      
      <div class="settings-grid">
        <div v-for="(value, key) in advancedData" :key="key" class="setting-card" :class="{ 'editable': ['primarycache', 'quota', 'reservation', 'autoexpand', 'mountpoint', 'recordsize', 'atime', 'relatime', 'readonly', 'aclmode', 'acltype', 'aclinherit', 'canmount', 'logbias', 'compression', 'sync', 'checksum'].includes(key) }">
          <div class="setting-label">{{ $t('pool.' + key) }}</div>
          <!-- primarycache 可编辑下拉框 -->
          <div v-if="key === 'primarycache'" class="setting-edit">
            <select 
              v-model="primaryCacheValue" 
              class="setting-select"
              :disabled="saving"
            >
              <option value="all">all</option>
              <option value="metadata">metadata</option>
              <option value="none">none</option>
            </select>
            <button 
              @click="savePrimaryCache" 
              class="save-btn"
              :disabled="saving || primaryCacheValue === originalPrimaryCache"
            >
              <span v-if="saving" class="spinner-small"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ saving ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
          <!-- quota 可编辑输入 -->
          <div v-else-if="key === 'quota'" class="setting-edit">
            <div class="quota-input-group">
              <input 
                v-model="quotaValue" 
                type="text"
                class="setting-input"
                :disabled="saving"
                placeholder="如: 10G, 1T, none"
              />
              <select 
                v-model="quotaUnit" 
                class="setting-select unit-select"
                :disabled="saving || quotaValue === 'none' || quotaValue === ''"
              >
                <option value="G">G</option>
                <option value="T">T</option>
              </select>
            </div>
            <button 
              @click="saveQuota" 
              class="save-btn"
              :disabled="saving || quotaInput === originalQuota"
            >
              <span v-if="saving" class="spinner-small"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ saving ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
          <!-- reservation 可编辑输入 -->
          <div v-else-if="key === 'reservation'" class="setting-edit">
            <div class="quota-input-group">
              <input 
                v-model="reservationValue" 
                type="text"
                class="setting-input"
                :disabled="saving"
                placeholder="如: 10G, 1T, none"
              />
              <select 
                v-model="reservationUnit" 
                class="setting-select unit-select"
                :disabled="saving || reservationValue === 'none' || reservationValue === ''"
              >
                <option value="G">G</option>
                <option value="T">T</option>
              </select>
            </div>
            <button 
              @click="saveReservation" 
              class="save-btn"
              :disabled="saving || reservationInput === originalReservation"
            >
              <span v-if="saving" class="spinner-small"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ saving ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
          <!-- autoexpand 可编辑下拉框 -->
          <div v-else-if="key === 'autoexpand'" class="setting-edit">
            <select 
              v-model="autoexpandValue" 
              class="setting-select"
              :disabled="saving"
            >
              <option value="on">on</option>
              <option value="off">off</option>
            </select>
            <button 
              @click="saveAutoexpand" 
              class="save-btn"
              :disabled="saving || autoexpandValue === originalAutoexpand"
            >
              <span v-if="saving" class="spinner-small"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ saving ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
          <!-- mountpoint 可编辑输入 -->
          <div v-else-if="key === 'mountpoint'" class="setting-edit">
            <input 
              v-model="mountpointValue" 
              type="text"
              class="setting-input"
              :disabled="saving"
              placeholder="如: /mnt/mypool"
            />
            <button 
              @click="saveMountpoint" 
              class="save-btn"
              :disabled="saving || mountpointValue === originalMountpoint"
            >
              <span v-if="saving" class="spinner-small"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ saving ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
          <!-- recordsize 可编辑下拉框 -->
          <div v-else-if="key === 'recordsize'" class="setting-edit">
            <select 
              v-model="recordsizeValue" 
              class="setting-select"
              :disabled="saving"
            >
              <option value="1M">1M</option>
              <option value="128K">128K</option>
              <option value="64K">64K</option>
              <option value="16K">16K</option>
            </select>
            <button 
              @click="saveRecordsize" 
              class="save-btn"
              :disabled="saving || recordsizeValue === originalRecordsize"
            >
              <span v-if="saving" class="spinner-small"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ saving ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
          <!-- atime 可编辑下拉框 -->
          <div v-else-if="key === 'atime'" class="setting-edit">
            <select 
              v-model="atimeValue" 
              class="setting-select"
              :disabled="saving"
            >
              <option value="on">on</option>
              <option value="off">off</option>
            </select>
            <button 
              @click="saveAtime" 
              class="save-btn"
              :disabled="saving || atimeValue === originalAtime"
            >
              <span v-if="saving" class="spinner-small"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ saving ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
          <!-- relatime 可编辑下拉框 -->
          <div v-else-if="key === 'relatime'" class="setting-edit">
            <select 
              v-model="relatimeValue" 
              class="setting-select"
              :disabled="saving"
            >
              <option value="on">on</option>
              <option value="off">off</option>
            </select>
            <button 
              @click="saveRelatime" 
              class="save-btn"
              :disabled="saving || relatimeValue === originalRelatime"
            >
              <span v-if="saving" class="spinner-small"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ saving ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
          <!-- readonly 可编辑下拉框 -->
          <div v-else-if="key === 'readonly'" class="setting-edit">
            <select 
              v-model="readonlyValue" 
              class="setting-select"
              :disabled="saving"
            >
              <option value="on">on</option>
              <option value="off">off</option>
            </select>
            <button 
              @click="saveReadonly" 
              class="save-btn"
              :disabled="saving || readonlyValue === originalReadonly"
            >
              <span v-if="saving" class="spinner-small"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ saving ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
          <!-- aclmode 可编辑下拉框 -->
          <div v-else-if="key === 'aclmode'" class="setting-edit">
            <select 
              v-model="aclmodeValue" 
              class="setting-select"
              :disabled="saving"
            >
              <option value="discard">discard</option>
              <option value="groupmask">groupmask</option>
              <option value="passthrough">passthrough</option>
            </select>
            <button 
              @click="saveAclmode" 
              class="save-btn"
              :disabled="saving || aclmodeValue === originalAclmode"
            >
              <span v-if="saving" class="spinner-small"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ saving ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
          <!-- acltype 可编辑下拉框 -->
          <div v-else-if="key === 'acltype'" class="setting-edit">
            <select 
              v-model="acltypeValue" 
              class="setting-select"
              :disabled="saving"
            >
              <option value="nfsv4">nfsv4</option>
              <option value="off">off</option>
              <option value="posix">posix</option>
            </select>
            <button 
              @click="saveAcltype" 
              class="save-btn"
              :disabled="saving || acltypeValue === originalAcltype"
            >
              <span v-if="saving" class="spinner-small"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ saving ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
          <!-- aclinherit 可编辑下拉框 -->
          <div v-else-if="key === 'aclinherit'" class="setting-edit">
            <select 
              v-model="aclinheritValue" 
              class="setting-select"
              :disabled="saving"
            >
              <option value="restricted">restricted</option>
              <option value="passthrough">passthrough</option>
              <option value="passthrough-x">passthrough-x</option>
              <option value="noallow">noallow</option>
              <option value="discard">discard</option>
            </select>
            <button 
              @click="saveAclinherit" 
              class="save-btn"
              :disabled="saving || aclinheritValue === originalAclinherit"
            >
              <span v-if="saving" class="spinner-small"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ saving ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
          <!-- canmount 可编辑下拉框 -->
          <div v-else-if="key === 'canmount'" class="setting-edit">
            <select 
              v-model="canmountValue" 
              class="setting-select"
              :disabled="saving"
            >
              <option value="on">on</option>
              <option value="off">off</option>
              <option value="noauto">noauto</option>
            </select>
            <button 
              @click="saveCanmount" 
              class="save-btn"
              :disabled="saving || canmountValue === originalCanmount"
            >
              <span v-if="saving" class="spinner-small"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ saving ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
          <!-- logbias 可编辑下拉框 -->
          <div v-else-if="key === 'logbias'" class="setting-edit">
            <select 
              v-model="logbiasValue" 
              class="setting-select"
              :disabled="saving"
            >
              <option value="latency">latency</option>
              <option value="throughput">throughput</option>
            </select>
            <button 
              @click="saveLogbias" 
              class="save-btn"
              :disabled="saving || logbiasValue === originalLogbias"
            >
              <span v-if="saving" class="spinner-small"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ saving ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
          <!-- compression 可编辑下拉框 -->
          <div v-else-if="key === 'compression'" class="setting-edit">
            <select 
              v-model="compressionValue" 
              class="setting-select"
              :disabled="saving"
            >
              <option value="on">on</option>
              <option value="off">off</option>
              <option value="lz4">lz4</option>
              <option value="lzjb">lzjb</option>
              <option value="zle">zle</option>
              <option value="gzip">gzip</option>
              <option value="gzip-1">gzip-1</option>
              <option value="gzip-2">gzip-2</option>
              <option value="gzip-3">gzip-3</option>
              <option value="gzip-4">gzip-4</option>
              <option value="gzip-5">gzip-5</option>
              <option value="gzip-6">gzip-6</option>
              <option value="gzip-7">gzip-7</option>
              <option value="gzip-8">gzip-8</option>
              <option value="gzip-9">gzip-9</option>
              <option value="zstd">zstd</option>
              <option value="zstd-fast">zstd-fast</option>
              <option value="zstd-1">zstd-1</option>
              <option value="zstd-2">zstd-2</option>
              <option value="zstd-3">zstd-3</option>
              <option value="zstd-5">zstd-5</option>
              <option value="zstd-10">zstd-10</option>
              <option value="zstd-15">zstd-15</option>
              <option value="zstd-19">zstd-19</option>
            </select>
            <button 
              @click="saveCompression" 
              class="save-btn"
              :disabled="saving || compressionValue === originalCompression"
            >
              <span v-if="saving" class="spinner-small"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ saving ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
          <!-- sync 可编辑下拉框 -->
          <div v-else-if="key === 'sync'" class="setting-edit">
            <select 
              v-model="syncValue" 
              class="setting-select"
              :disabled="saving"
            >
              <option value="standard">standard</option>
              <option value="always">always</option>
              <option value="disabled">disabled</option>
            </select>
            <button 
              @click="saveSync" 
              class="save-btn"
              :disabled="saving || syncValue === originalSync"
            >
              <span v-if="saving" class="spinner-small"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ saving ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
          <!-- checksum 可编辑下拉框 -->
          <div v-else-if="key === 'checksum'" class="setting-edit">
            <select 
              v-model="checksumValue" 
              class="setting-select"
              :disabled="saving"
            >
              <option value="on">on</option>
              <option value="off">off</option>
              <option value="fletcher2">fletcher2</option>
              <option value="fletcher4">fletcher4</option>
              <option value="sha256">sha256</option>
              <option value="sha512">sha512</option>
              <option value="skein">skein</option>
              <option value="edonr">edonr</option>
            </select>
            <button 
              @click="saveChecksum" 
              class="save-btn"
              :disabled="saving || checksumValue === originalChecksum"
            >
              <span v-if="saving" class="spinner-small"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ saving ? $t('common.saving') : $t('common.save') }}
            </button>
          </div>
          <!-- 其他字段只读 -->
          <div v-else class="setting-value">{{ value }}</div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      </div>
      <p class="empty-text">{{ $t('pool.noAdvancedData') }}</p>
    </div>

    <!-- 保存成功提示 -->
    <div v-if="saveSuccess" class="success-toast">
      <div class="success-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <div class="success-content">
        <p class="success-title">{{ $t('common.saveSuccess') }}</p>
      </div>
      <button class="success-close" @click="saveSuccess = false">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- 保存错误提示 -->
    <div v-if="saveError" class="error-toast">
      <div class="error-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <div class="error-content">
        <p class="error-title">{{ $t('common.saveFailed') }}</p>
        <p class="error-detail">{{ saveError }}</p>
      </div>
      <button class="error-close" @click="saveError = ''">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storageApi } from '@/api/storage'

const route = useRoute()
const router = useRouter()

const poolName = ref('')
const advancedData = ref<Record<string, string> | null>(null)
const loading = ref(false)
const error = ref('')

// primarycache 编辑相关
const primaryCacheValue = ref('all')
const originalPrimaryCache = ref('all')

// quota 编辑相关
const quotaValue = ref('')
const quotaUnit = ref('G')
const originalQuota = ref('')

// reservation 编辑相关
const reservationValue = ref('')
const reservationUnit = ref('G')
const originalReservation = ref('')

// autoexpand 编辑相关
const autoexpandValue = ref('off')
const originalAutoexpand = ref('off')

// mountpoint 编辑相关
const mountpointValue = ref('')
const originalMountpoint = ref('')

// recordsize 编辑相关
const recordsizeValue = ref('128K')
const originalRecordsize = ref('128K')

// atime 编辑相关
const atimeValue = ref('on')
const originalAtime = ref('on')

// relatime 编辑相关
const relatimeValue = ref('off')
const originalRelatime = ref('off')

// readonly 编辑相关
const readonlyValue = ref('off')
const originalReadonly = ref('off')

// aclmode 编辑相关
const aclmodeValue = ref('discard')
const originalAclmode = ref('discard')

// acltype 编辑相关
const acltypeValue = ref('off')
const originalAcltype = ref('off')

// aclinherit 编辑相关
const aclinheritValue = ref('restricted')
const originalAclinherit = ref('restricted')

// canmount 编辑相关
const canmountValue = ref('on')
const originalCanmount = ref('on')

// logbias 编辑相关
const logbiasValue = ref('latency')
const originalLogbias = ref('latency')

// compression 编辑相关
const compressionValue = ref('off')
const originalCompression = ref('off')

// sync 编辑相关
const syncValue = ref('standard')
const originalSync = ref('standard')

// checksum 编辑相关
const checksumValue = ref('on')
const originalChecksum = ref('on')

const saving = ref(false)
const saveSuccess = ref(false)
const saveError = ref('')

// quota 完整输入值（数值+单位）
const quotaInput = computed(() => {
  if (quotaValue.value === 'none' || quotaValue.value === '') {
    return quotaValue.value
  }
  return quotaValue.value + quotaUnit.value
})

// reservation 完整输入值（数值+单位）
const reservationInput = computed(() => {
  if (reservationValue.value === 'none' || reservationValue.value === '') {
    return reservationValue.value
  }
  return reservationValue.value + reservationUnit.value
})

// 获取高级设置数据
const fetchAdvancedSettings = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await storageApi.getPoolAdvancedSetting(poolName.value)
    if (response.success) {
      advancedData.value = response.data
      // 初始化 primarycache 值
      if (response.data.primarycache) {
        primaryCacheValue.value = response.data.primarycache
        originalPrimaryCache.value = response.data.primarycache
      }
      // 初始化 quota 值
      if (response.data.quota) {
        const quota = response.data.quota
        originalQuota.value = quota
        if (quota === 'none') {
          quotaValue.value = 'none'
        } else {
          // 解析数值和单位（如 "10G" -> 数值 "10"，单位 "G"）
          const match = quota.match(/^(\d+)([GT])$/)
          if (match) {
            quotaValue.value = match[1]
            quotaUnit.value = match[2]
          } else {
            quotaValue.value = quota
          }
        }
      }
      // 初始化 reservation 值
      if (response.data.reservation) {
        const reservation = response.data.reservation
        originalReservation.value = reservation
        if (reservation === 'none') {
          reservationValue.value = 'none'
        } else {
          const match = reservation.match(/^(\d+)([GT])$/)
          if (match) {
            reservationValue.value = match[1]
            reservationUnit.value = match[2]
          } else {
            reservationValue.value = reservation
          }
        }
      }
      // 初始化 autoexpand 值
      if (response.data.autoexpand) {
        autoexpandValue.value = response.data.autoexpand
        originalAutoexpand.value = response.data.autoexpand
      }
      // 初始化 mountpoint 值
      if (response.data.mountpoint) {
        mountpointValue.value = response.data.mountpoint
        originalMountpoint.value = response.data.mountpoint
      }
      // 初始化 recordsize 值
      if (response.data.recordsize) {
        recordsizeValue.value = response.data.recordsize
        originalRecordsize.value = response.data.recordsize
      }
      // 初始化 atime 值
      if (response.data.atime) {
        atimeValue.value = response.data.atime
        originalAtime.value = response.data.atime
      }
      // 初始化 relatime 值
      if (response.data.relatime) {
        relatimeValue.value = response.data.relatime
        originalRelatime.value = response.data.relatime
      }
      // 初始化 readonly 值
      if (response.data.readonly) {
        readonlyValue.value = response.data.readonly
        originalReadonly.value = response.data.readonly
      }
      // 初始化 aclmode 值
      if (response.data.aclmode) {
        aclmodeValue.value = response.data.aclmode
        originalAclmode.value = response.data.aclmode
      }
      // 初始化 acltype 值
      if (response.data.acltype) {
        acltypeValue.value = response.data.acltype
        originalAcltype.value = response.data.acltype
      }
      // 初始化 aclinherit 值
      if (response.data.aclinherit) {
        aclinheritValue.value = response.data.aclinherit
        originalAclinherit.value = response.data.aclinherit
      }
      // 初始化 canmount 值
      if (response.data.canmount) {
        canmountValue.value = response.data.canmount
        originalCanmount.value = response.data.canmount
      }
      // 初始化 logbias 值
      if (response.data.logbias) {
        logbiasValue.value = response.data.logbias
        originalLogbias.value = response.data.logbias
      }
      // 初始化 compression 值
      if (response.data.compression) {
        compressionValue.value = response.data.compression
        originalCompression.value = response.data.compression
      }
      // 初始化 sync 值
      if (response.data.sync) {
        syncValue.value = response.data.sync
        originalSync.value = response.data.sync
      }
      // 初始化 checksum 值
      if (response.data.checksum) {
        checksumValue.value = response.data.checksum
        originalChecksum.value = response.data.checksum
      }
    } else {
      error.value = response.error || 'Failed to fetch advanced settings'
    }
  } catch (err: any) {
    error.value = err.message || 'Network error'
  } finally {
    loading.value = false
  }
}

// 保存 primarycache 设置
const savePrimaryCache = async () => {
  if (!poolName.value || !primaryCacheValue.value) return
  
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  
  try {
    const response = await storageApi.setPoolPrimaryCache(poolName.value, primaryCacheValue.value)
    if (response.success) {
      originalPrimaryCache.value = primaryCacheValue.value
      saveSuccess.value = true
      // 3秒后自动关闭成功提示
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    } else {
      saveError.value = response.error || 'Failed to save primarycache'
    }
  } catch (err: any) {
    saveError.value = err.message || 'Network error'
  } finally {
    saving.value = false
  }
}

// 验证 quota 输入
const validateQuota = (value: string): boolean => {
  if (value === 'none' || value === '') {
    return true
  }
  const num = parseInt(value)
  return !isNaN(num) && num >= 1 && num <= 999
}

// 保存 quota 设置
const saveQuota = async () => {
  if (!poolName.value) return
  
  // 验证输入
  if (!validateQuota(quotaValue.value)) {
    saveError.value = 'Quota must be 1-999G, 1-999T, or none'
    return
  }
  
  const finalQuota = quotaInput.value
  
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  
  try {
    const response = await storageApi.setPoolQuota(poolName.value, finalQuota)
    if (response.success) {
      originalQuota.value = finalQuota
      saveSuccess.value = true
      // 3秒后自动关闭成功提示
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    } else {
      saveError.value = response.error || 'Failed to save quota'
    }
  } catch (err: any) {
    saveError.value = err.message || 'Network error'
  } finally {
    saving.value = false
  }
}

// 验证 reservation 输入
const validateReservation = (value: string): boolean => {
  if (value === 'none' || value === '') {
    return true
  }
  const num = parseInt(value)
  return !isNaN(num) && num >= 1 && num <= 999
}

// 保存 reservation 设置
const saveReservation = async () => {
  if (!poolName.value) return
  
  // 验证输入
  if (!validateReservation(reservationValue.value)) {
    saveError.value = 'Reservation must be 1-999G, 1-999T, or none'
    return
  }
  
  const finalReservation = reservationInput.value
  
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  
  try {
    const response = await storageApi.setPoolReservation(poolName.value, finalReservation)
    if (response.success) {
      originalReservation.value = finalReservation
      saveSuccess.value = true
      // 3秒后自动关闭成功提示
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    } else {
      saveError.value = response.error || 'Failed to save reservation'
    }
  } catch (err: any) {
    saveError.value = err.message || 'Network error'
  } finally {
    saving.value = false
  }
}

// 保存 autoexpand 设置
const saveAutoexpand = async () => {
  if (!poolName.value || !autoexpandValue.value) return
  
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  
  try {
    const response = await storageApi.setPoolAutoexpand(poolName.value, autoexpandValue.value)
    if (response.success) {
      originalAutoexpand.value = autoexpandValue.value
      saveSuccess.value = true
      // 3秒后自动关闭成功提示
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    } else {
      saveError.value = response.error || 'Failed to save autoexpand'
    }
  } catch (err: any) {
    saveError.value = err.message || 'Network error'
  } finally {
    saving.value = false
  }
}

// 验证 mountpoint 输入
const validateMountpoint = (value: string): boolean => {
  if (!value || value.trim() === '') {
    return false
  }
  // 必须以 / 开头
  return value.startsWith('/')
}

// 保存 mountpoint 设置
const saveMountpoint = async () => {
  if (!poolName.value) return
  
  // 验证输入
  const trimmedValue = mountpointValue.value.trim()
  if (!validateMountpoint(trimmedValue)) {
    saveError.value = 'Mountpoint must be a valid absolute path starting with /'
    return
  }
  
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  
  try {
    const response = await storageApi.setPoolMountpoint(poolName.value, trimmedValue)
    if (response.success) {
      originalMountpoint.value = trimmedValue
      mountpointValue.value = trimmedValue
      saveSuccess.value = true
      // 3秒后自动关闭成功提示
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    } else {
      saveError.value = response.error || 'Failed to save mountpoint'
    }
  } catch (err: any) {
    saveError.value = err.message || 'Network error'
  } finally {
    saving.value = false
  }
}

// 保存 recordsize 设置
const saveRecordsize = async () => {
  if (!poolName.value || !recordsizeValue.value) return
  
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  
  try {
    const response = await storageApi.setPoolRecordsize(poolName.value, recordsizeValue.value)
    if (response.success) {
      originalRecordsize.value = recordsizeValue.value
      saveSuccess.value = true
      // 3秒后自动关闭成功提示
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    } else {
      saveError.value = response.error || 'Failed to save recordsize'
    }
  } catch (err: any) {
    saveError.value = err.message || 'Network error'
  } finally {
    saving.value = false
  }
}

// 保存 atime 设置
const saveAtime = async () => {
  if (!poolName.value || !atimeValue.value) return
  
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  
  try {
    const response = await storageApi.setPoolAtime(poolName.value, atimeValue.value)
    if (response.success) {
      originalAtime.value = atimeValue.value
      saveSuccess.value = true
      // 3秒后自动关闭成功提示
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    } else {
      saveError.value = response.error || 'Failed to save atime'
    }
  } catch (err: any) {
    saveError.value = err.message || 'Network error'
  } finally {
    saving.value = false
  }
}

// 保存 relatime 设置
const saveRelatime = async () => {
  if (!poolName.value || !relatimeValue.value) return
  
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  
  try {
    const response = await storageApi.setPoolRelatime(poolName.value, relatimeValue.value)
    if (response.success) {
      originalRelatime.value = relatimeValue.value
      saveSuccess.value = true
      // 3秒后自动关闭成功提示
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    } else {
      saveError.value = response.error || 'Failed to save relatime'
    }
  } catch (err: any) {
    saveError.value = err.message || 'Network error'
  } finally {
    saving.value = false
  }
}

// 保存 readonly 设置
const saveReadonly = async () => {
  if (!poolName.value || !readonlyValue.value) return
  
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  
  try {
    const response = await storageApi.setPoolReadonly(poolName.value, readonlyValue.value)
    if (response.success) {
      originalReadonly.value = readonlyValue.value
      saveSuccess.value = true
      // 3秒后自动关闭成功提示
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    } else {
      saveError.value = response.error || 'Failed to save readonly'
    }
  } catch (err: any) {
    saveError.value = err.message || 'Network error'
  } finally {
    saving.value = false
  }
}

// 保存 aclmode 设置
const saveAclmode = async () => {
  if (!poolName.value || !aclmodeValue.value) return
  
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  
  try {
    const response = await storageApi.setPoolAclmode(poolName.value, aclmodeValue.value)
    if (response.success) {
      originalAclmode.value = aclmodeValue.value
      saveSuccess.value = true
      // 3秒后自动关闭成功提示
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    } else {
      saveError.value = response.error || 'Failed to save aclmode'
    }
  } catch (err: any) {
    saveError.value = err.message || 'Network error'
  } finally {
    saving.value = false
  }
}

// 保存 acltype 设置
const saveAcltype = async () => {
  if (!poolName.value || !acltypeValue.value) return
  
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  
  try {
    const response = await storageApi.setPoolAcltype(poolName.value, acltypeValue.value)
    if (response.success) {
      originalAcltype.value = acltypeValue.value
      saveSuccess.value = true
      // 3秒后自动关闭成功提示
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    } else {
      saveError.value = response.error || 'Failed to save acltype'
    }
  } catch (err: any) {
    saveError.value = err.message || 'Network error'
  } finally {
    saving.value = false
  }
}

// 保存 aclinherit 设置
const saveAclinherit = async () => {
  if (!poolName.value || !aclinheritValue.value) return
  
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  
  try {
    const response = await storageApi.setPoolAclinherit(poolName.value, aclinheritValue.value)
    if (response.success) {
      originalAclinherit.value = aclinheritValue.value
      saveSuccess.value = true
      // 3秒后自动关闭成功提示
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    } else {
      saveError.value = response.error || 'Failed to save aclinherit'
    }
  } catch (err: any) {
    saveError.value = err.message || 'Network error'
  } finally {
    saving.value = false
  }
}

// 保存 canmount 设置
const saveCanmount = async () => {
  if (!poolName.value || !canmountValue.value) return
  
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  
  try {
    const response = await storageApi.setPoolCanmount(poolName.value, canmountValue.value)
    if (response.success) {
      originalCanmount.value = canmountValue.value
      saveSuccess.value = true
      // 3秒后自动关闭成功提示
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    } else {
      saveError.value = response.error || 'Failed to save canmount'
    }
  } catch (err: any) {
    saveError.value = err.message || 'Network error'
  } finally {
    saving.value = false
  }
}

// 保存 logbias 设置
const saveLogbias = async () => {
  if (!poolName.value || !logbiasValue.value) return
  
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  
  try {
    const response = await storageApi.setPoolLogbias(poolName.value, logbiasValue.value)
    if (response.success) {
      originalLogbias.value = logbiasValue.value
      saveSuccess.value = true
      // 3秒后自动关闭成功提示
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    } else {
      saveError.value = response.error || 'Failed to save logbias'
    }
  } catch (err: any) {
    saveError.value = err.message || 'Network error'
  } finally {
    saving.value = false
  }
}

// 保存 compression 设置
const saveCompression = async () => {
  if (!poolName.value || !compressionValue.value) return
  
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  
  try {
    const response = await storageApi.setPoolCompression(poolName.value, compressionValue.value)
    if (response.success) {
      originalCompression.value = compressionValue.value
      saveSuccess.value = true
      // 3秒后自动关闭成功提示
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    } else {
      saveError.value = response.error || 'Failed to save compression'
    }
  } catch (err: any) {
    saveError.value = err.message || 'Network error'
  } finally {
    saving.value = false
  }
}

// 保存 sync 设置
const saveSync = async () => {
  if (!poolName.value || !syncValue.value) return
  
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  
  try {
    const response = await storageApi.setPoolSync(poolName.value, syncValue.value)
    if (response.success) {
      originalSync.value = syncValue.value
      saveSuccess.value = true
      // 3秒后自动关闭成功提示
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    } else {
      saveError.value = response.error || 'Failed to save sync'
    }
  } catch (err: any) {
    saveError.value = err.message || 'Network error'
  } finally {
    saving.value = false
  }
}

// 保存 checksum 设置
const saveChecksum = async () => {
  if (!poolName.value || !checksumValue.value) return
  
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  
  try {
    const response = await storageApi.setPoolChecksum(poolName.value, checksumValue.value)
    if (response.success) {
      originalChecksum.value = checksumValue.value
      saveSuccess.value = true
      // 3秒后自动关闭成功提示
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    } else {
      saveError.value = response.error || 'Failed to save checksum'
    }
  } catch (err: any) {
    saveError.value = err.message || 'Network error'
  } finally {
    saving.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.push('/storage/pool')
}

onMounted(() => {
  const name = route.query.pool as string
  if (name) {
    poolName.value = name
    fetchAdvancedSettings()
  } else {
    error.value = 'No pool name provided'
  }
})
</script>

<style scoped>
.pool-advanced-setting-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color, #1f2937);
  margin: 0;
}

.button-group {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn {
  background-color: #f3f4f6;
  color: #374151;
}

.back-btn:hover {
  background-color: #e5e7eb;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spinner-small {
  width: 14px;
  height: 14px;
  border: 2px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #dc2626;
}

.error-message {
  font-size: 1rem;
  margin-bottom: 16px;
}

.retry-btn {
  padding: 8px 16px;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background-color: #b91c1c;
}

.pool-name-header {
  background-color: #f3f4f6;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.pool-name-header .label {
  font-weight: 600;
  color: #374151;
  margin-right: 8px;
}

.pool-name-header .value {
  font-weight: 500;
  color: #1f2937;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.setting-card {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.setting-card.editable {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.setting-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 8px;
  letter-spacing: 0.05em;
}

.setting-value {
  font-size: 0.875rem;
  color: #1f2937;
  word-break: break-word;
}

.setting-edit {
  display: flex;
  gap: 8px;
  align-items: center;
}

.setting-select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #1f2937;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.setting-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.setting-select:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

/* quota 输入组 */
.quota-input-group {
  display: flex;
  gap: 8px;
  flex: 1;
  align-items: center;
}

.setting-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #1f2937;
  background-color: white;
  transition: all 0.2s;
}

.setting-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.setting-input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.unit-select {
  width: 60px;
  flex: none;
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.save-btn:hover:not(:disabled) {
  background-color: #2563eb;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #6b7280;
}

.empty-icon {
  margin-bottom: 16px;
  color: #9ca3af;
}

.empty-text {
  font-size: 1rem;
}

/* 成功提示 */
.success-toast {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  background: #fff;
  border: 1px solid #86efac;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  z-index: 2000;
  animation: toast-appear 0.3s ease;
}

.success-toast .success-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: #dcfce7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #16a34a;
}

.success-content {
  flex: 1;
}

.success-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #166534;
}

.success-close {
  flex-shrink: 0;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #86efac;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-close:hover {
  color: #16a34a;
}

/* 错误提示 */
.error-toast {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  background: #fff;
  border: 1px solid #fecaca;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  z-index: 2000;
  animation: toast-appear 0.3s ease;
}

.error-toast .error-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: #fee2e2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dc2626;
}

.error-content {
  flex: 1;
}

.error-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #991b1b;
}

.error-detail {
  margin: 0;
  font-size: 13px;
  color: #b91c1c;
  word-break: break-word;
}

.error-close {
  flex-shrink: 0;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #9ca3af;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-close:hover {
  color: #6b7280;
}

@keyframes toast-appear {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
