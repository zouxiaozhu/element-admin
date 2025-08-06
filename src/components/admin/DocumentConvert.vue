npm<template>
  <div class="document-convert">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>Excel转Word工具</h2>
      <p>批量将Excel数据填充到Word模板中，支持变量替换</p>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <el-row :gutter="20">
        <!-- 左侧：文件上传区域 -->
        <el-col :span="12">
          <!-- Excel文件上传 -->
          <el-card class="upload-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="step-number">1</span>
                <span class="step-title">上传Excel文件</span>
                <span v-if="excelFileUrl && excelCountdownMinutes >= 0" class="countdown">
                  {{ excelCountdownMinutes }}:{{ excelCountdownSeconds.toString().padStart(2, '0') }}
                </span>
              </div>
            </template>
            
            <div class="upload-section">
              <input
                ref="excelFileInput"
                type="file"
                accept=".xlsx,.xls"
                style="display: none"
                @change="handleExcelUpload"
              />
              
              <div class="upload-area" @click="triggerExcelUpload">
                <el-icon class="upload-icon" size="36">
                  <DocumentAdd />
                </el-icon>
                <div class="upload-text">
                  <p>点击上传Excel文件</p>
                  <p class="upload-hint">支持.xlsx和.xls格式，文件大小不超过100MB</p>
                </div>
              </div>
              
              <div v-if="excelFile" class="file-info">
                <el-icon><Document /></el-icon>
                <span>{{ excelFile.name }}</span>
                <el-button 
                  v-if="!excelFileUrl || errorMessage" 
                  type="primary" 
                  size="small" 
                  @click="retryParseExcel"
                  :loading="isParsingExcel"
                >
                  重新解析
                </el-button>
              </div>
              
              <div v-if="isParsingExcel" class="parsing-status">
                <el-icon class="is-loading"><Loading /></el-icon>
                <span>正在解析Excel文件...</span>
              </div>
            </div>

            <!-- Excel变量显示 -->
            <div v-if="excelVars.length > 0" class="variables-section">
              <div class="variables-header">
                <span>Excel变量列表</span>
                <el-tag type="success" size="small">共{{ excelVars.length }}个</el-tag>
              </div>
              
              <div class="variables-grid">
                <div 
                  v-for="(variable, index) in excelVars" 
                  :key="index" 
                  class="variable-item"
                  @click="copyVarCode(variable.var)"
                >
                  <div class="variable-header">
                    <span class="variable-title">{{ variable.title }}</span>
                    <el-icon class="copy-icon"><CopyDocument /></el-icon>
                  </div>
                  <div class="variable-code">{{ variable.var }}</div>
                </div>
              </div>
              
              <div class="variables-hint">
                <el-icon><InfoFilled /></el-icon>
                <span>点击变量可复制代码</span>
              </div>
            </div>
          </el-card>

          <!-- Word模板上传 -->
          <el-card class="upload-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="step-number">2</span>
                <span class="step-title">上传Word模板</span>
                <span v-if="wordFileUrl && wordCountdownMinutes >= 0" class="countdown">
                  {{ wordCountdownMinutes }}:{{ wordCountdownSeconds.toString().padStart(2, '0') }}
                </span>
              </div>
            </template>
            
            <div class="upload-section">
              <input
                ref="wordFileInput"
                type="file"
                accept=".docx"
                style="display: none"
                @change="handleWordUpload"
              />
              
              <div class="upload-area" @click="triggerWordUpload">
                <el-icon class="upload-icon" size="36">
                  <DocumentAdd />
                </el-icon>
                <div class="upload-text">
                  <p>点击上传Word模板</p>
                  <p class="upload-hint">仅支持.docx格式，文件大小不超过10MB</p>
                </div>
              </div>
              
              <div v-if="wordFile" class="file-info">
                <el-icon><Document /></el-icon>
                <span>{{ wordFile.name }}</span>
                <el-button 
                  v-if="!wordFileUrl || errorMessage" 
                  type="primary" 
                  size="small" 
                  @click="retryUploadWord"
                >
                  重新上传
                </el-button>
              </div>
            </div>
          </el-card>

          <!-- 转换操作 -->
          <el-card class="action-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span class="step-number">3</span>
                <span class="step-title">开始转换</span>
              </div>
            </template>
            
            <div class="convert-section">
              <el-button 
                type="primary" 
                size="large"
                :loading="isConverting"
                :disabled="!excelFile || !wordFile || excelVars.length === 0"
                @click="startConversion"
                style="width: 100%"
              >
                {{ isConverting ? '转换中...' : '开始转换' }}
              </el-button>
              
              <div v-if="progress > 0" class="progress-section">
                <el-progress 
                  :percentage="progress" 
                  :stroke-width="6"
                  :show-text="true"
                />
              </div>
              
              <div v-if="statusMessage" class="status-message">
                <el-icon><InfoFilled /></el-icon>
                <span>{{ statusMessage }}</span>
              </div>
            </div>
          </el-card>

          <!-- 错误信息 -->
          <el-card v-if="errorMessage" class="error-card" shadow="hover">
            <template #header>
              <div class="card-header error-header">
                <el-icon><Warning /></el-icon>
                <span>错误信息</span>
              </div>
            </template>
            
            <div class="error-content">
              <p>{{ errorMessage }}</p>
              <el-button type="primary" @click="restartTask">重新开始</el-button>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧：转换结果区域 -->
        <el-col :span="12">
          <el-card class="result-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>转换结果</span>
                <div class="result-actions">
                  <span v-if="countdownMinutes >= 0 && (convertedFiles.length > 0 || (zipStatus.zip_end && zipStatus.zip_success))" class="countdown">
                    自动清除：{{ countdownMinutes }}:{{ countdownSeconds.toString().padStart(2, '0') }}
                  </span>
                  <el-button 
                    v-if="zipStatus.zip_end && zipStatus.zip_success" 
                    type="primary" 
                    size="small"
                    @click="downloadAllSelected"
                  >
                    下载全部文件
                  </el-button>
                </div>
              </div>
            </template>
            
            <div v-if="convertedFiles.length > 0 || (zipStatus.zip_end && zipStatus.zip_success)" class="result-content">
              <div v-if="zipStatus.zip_end && zipStatus.zip_success" class="zip-status">
                <el-icon class="success-icon"><CircleCheck /></el-icon>
                <span>{{ zipStatus.zip_text || '转换完成！' }}</span>
              </div>
              
              <div v-if="sortedFiles.length > 0" class="files-list">
                <div 
                  v-for="file in sortedFiles" 
                  :key="file.id" 
                  class="file-item"
                  @click="downloadFile(file)"
                >
                  <el-icon><Document /></el-icon>
                  <span class="file-name">{{ file.name }}</span>
                  <el-icon class="download-icon"><Download /></el-icon>
                </div>
              </div>
            </div>
            
            <el-empty v-else description="暂无转换结果" />
          </el-card>
        </el-col>
      </el-row>

      <!-- 二维码弹窗 -->
      <el-dialog 
        v-model="showQrCode" 
        title="获取帮助" 
        width="400px"
        align-center
      >
        <div class="qr-content">
          <div class="qr-message">
            <el-icon class="warning-icon"><Warning /></el-icon>
            <p>Word文件中没有找到变量，请加入客户群获取帮助</p>
          </div>
          
          <div class="contact-info">
            <div class="wechat-id">
              <span>微信号：Rqdll1</span>
              <el-button type="primary" size="small" @click="copyWechatId">
                复制微信号
              </el-button>
            </div>
          </div>
        </div>
        
        <template #footer>
          <el-button @click="showQrCode = false">关闭</el-button>
        </template>
      </el-dialog>

      <!-- Toast消息 -->
      <el-dialog 
        v-model="showToastMessage" 
        :show-close="false"
        width="300px"
        align-center
        class="toast-dialog"
      >
        <div class="toast-content">
          <el-icon class="success-icon"><CircleCheck /></el-icon>
          <span>{{ toastMessage }}</span>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onBeforeUnmount, computed, onMounted } from 'vue';
import { 
  DocumentAdd, 
  Document, 
  Loading, 
  CopyDocument, 
  InfoFilled, 
  CircleCheck, 
  Download, 
  Warning 
} from '@element-plus/icons-vue';
import { documentApi } from '@/api/document';
import { uploadToCOS, getFileUrl } from '@/utils/cos';
import { getUploadMode } from '@/utils/env';
import { handleError, safeAsync } from '@/utils/errorHandler';

export default defineComponent({
  name: 'DocumentConvert',
  components: {
    DocumentAdd,
    Document,
    Loading,
    CopyDocument,
    InfoFilled,
    CircleCheck,
    Download,
    Warning
  },
  setup() {
    const excelFileInput = ref(null);
    const wordFileInput = ref(null);
    const excelFile = ref(null);
    const wordFile = ref(null);
    const taskId = ref(null);
    const progress = ref(0);
    const statusMessage = ref('');
    const isConverting = ref(false);
    const convertedFiles = ref([]);
    const excludeIds = ref([]);
    let pollingInterval = null;

    // 添加zip状态相关变量
    const zipStatus = ref({
      zip_path: '',
      need_zip_count: 0,
      has_zip_count: 0,
      zip_text: '',
      zip_end: false,
      zip_success: false
    });

    // 添加解析Excel获取的变量数据
    const excelVars = ref([]);
    const isParsingExcel = ref(false);

    // 添加错误信息和吐司消息状态
    const errorMessage = ref('');
    const toastMessage = ref('');
    const showToastMessage = ref(false);

    // 在setup中添加轮询计数器
    const pollingCount = ref(0);

    // 添加文件URL
    const excelFileUrl = ref('');
    const wordFileUrl = ref('');

    // 添加二维码显示状态
    const showQrCode = ref(false);
    const errorCode = ref(null);

    // 添加倒计时相关变量
    const countdownMinutes = ref(10);
    const countdownSeconds = ref(0);
    let countdownTimer = null;

    // 添加文件倒计时相关变量
    const excelCountdownMinutes = ref(10);
    const excelCountdownSeconds = ref(0);
    const wordCountdownMinutes = ref(10);
    const wordCountdownSeconds = ref(0);
    let excelCountdownTimer = null;
    let wordCountdownTimer = null;

    // 显示吐司消息的函数
    const showToast = (message) => {
      toastMessage.value = message;
      showToastMessage.value = true;

      // 3秒后自动关闭
      setTimeout(() => {
        showToastMessage.value = false;
      }, 3000);
    };

    // 通用文件上传方法
    const uploadFile = async (file, fileType) => {
        return safeAsync(
            async () => {
                const response = await documentApi.uploadFile(file, fileType);
                return response;
            },
            '文件上传失败，请重试'
        );
    };

    // 解析Excel文件，获取变量信息
    const parseExcelVars = async () => {
      if (!excelFile.value) return;

      isParsingExcel.value = true;
      excelVars.value = [];
      errorMessage.value = '';

      try {
        // 使用通用上传方法上传Excel文件
        const fileData = await uploadFile(excelFile.value, 'EXCEL_TO_WORD_EXCEL');
        excelFileUrl.value = fileData;
      
        // 调用API解析Excel
        const response = await documentApi.parseTable(fileData);

        if (response && response.vars) {
          excelVars.value = response.vars;
        } else {
          throw new Error('Excel文件解析失败，未获取到变量信息');
        }
      } catch (error) {
        handleError(error, '解析Excel文件失败，请检查网络连接或重试', true);
        excelFileUrl.value = '';
      } finally {
        isParsingExcel.value = false;
      }
    };

    const triggerExcelUpload = () => {
      if (excelFileInput.value) {
        excelFileInput.value.value = '';
        excelFileInput.value.click();
      }
    };

    const triggerWordUpload = () => {
      if (wordFileInput.value) {
        wordFileInput.value.value = '';
        wordFileInput.value.click();
      }
    };

    const resetState = (resetType = 'all') => {
      // 停止任何正在进行的轮询
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }

      // 重置任务相关状态
      if (resetType === 'all' || resetType === 'task') {
        taskId.value = null;
        progress.value = 0;
        isConverting.value = false;
        convertedFiles.value = [];
        excludeIds.value = [];
        errorMessage.value = '';
        zipStatus.value = {
          zip_path: '',
          need_zip_count: 0,
          has_zip_count: 0,
          zip_text: '',
          zip_end: false,
          zip_success: false
        };
      }

      // 根据重置类型决定是否重置Excel变量和URL
      if (resetType === 'all' || resetType === 'excel') {
        excelVars.value = [];
        isParsingExcel.value = false;
        excelFileUrl.value = '';
      }

      // 重置Word文件URL
      if (resetType === 'all' || resetType === 'word') {
        wordFileUrl.value = '';
      }
    };

    const handleExcelUpload = (event) => {
      const target = event.target;
      if (target.files && target.files.length > 0) {
        resetState('excel');

        const file = target.files[0];

        // 检查文件大小 (100MB)
        if (file.size > 100 * 1024 * 1024) {
          errorMessage.value = 'Excel文件大小不能超过100MB';
          return;
        }

        excelFile.value = file;
        statusMessage.value = `Excel文件已选择: ${excelFile.value.name}`;
        errorMessage.value = '';

        // 上传Excel后立即解析变量
        parseExcelVars().then(() => {
          if (excelFileUrl.value) {
            startExcelCountdown();
          }
        });
      }
    };

    const handleWordUpload = (event) => {
      const target = event.target;
      if (target.files && target.files.length > 0) {
        resetState('word');

        const file = target.files[0];

        // 检查文件大小 (10MB)
        if (file.size > 10 * 1024 * 1024) {
          errorMessage.value = 'Word文件大小不能超过10MB';
          return;
        }

        // 检查文件类型
        if (!file.name.endsWith('.docx')) {
          errorMessage.value = '只支持.docx格式的Word文件';
          return;
        }

        wordFile.value = file;
        statusMessage.value = `Word文件已选择: ${wordFile.value.name}`;
        errorMessage.value = '';

        // 上传Word文件
       documentApi.uploadFile(file, 'EXCEL_TO_WORD_WORD')
          .then(fileData => {
            wordFileUrl.value = fileData;
            console.log('Word文件上传成功:', fileData);
            startWordCountdown();

            if (!excelFile.value && excelVars.value.length === 0) {
              statusMessage.value = '请上传Excel文件以获取变量信息';
            }
          })
          .catch(err => {
            console.error('Word文件上传失败:', err);
            errorMessage.value = 'Word文件上传失败，请重试';
            wordFileUrl.value = '';
          });
      }
    };

    const startConversion = async () => {
      console.log(excelFile.value,wordFile.value)
      if (!excelFile.value || !wordFile.value) {
        statusMessage.value = '请先上传Excel文件和Word模板';
        return;
      }

      if (excelVars.value.length === 0) {
        statusMessage.value = '请先确保Excel文件已成功解析变量';
        errorMessage.value = 'Excel变量解析未完成，请重新上传Excel文件';
        return;
      }

      isConverting.value = true;
      statusMessage.value = '准备转换...';

      convertedFiles.value = [];
      excludeIds.value = [];
      errorMessage.value = '';

      try {
        // 创建转换任务
        const response = await documentApi.transferTable({
          excel: excelFileUrl.value,
          word: wordFileUrl.value,
        });

        taskId.value = response.task.task_id;
        statusMessage.value = '转换任务已创建，开始处理...';
        progress.value = 0;

        // 开始轮询任务状态
        startPolling();

        // 设置10分钟自动清除定时器
        setTimeout(() => {
          if (convertedFiles.value.length > 0) {
            showToast('转换结果已自动清除');
            resetState('task');
          }
        }, 10 * 60 * 1000);
      } catch (error) {
        console.error('创建转换任务失败:', error);
        
        if (error.code === 8888) {
          errorCode.value = 8888;
          showQrCode.value = true;
          statusMessage.value = 'Word文件中没有找到变量，请加入客户群获取帮助';
          errorMessage.value = error.message || '未知错误';
        } else {
          statusMessage.value = `创建任务失败: ${error.message || '未知错误'}`;
          errorMessage.value = error.message || '未知错误';
        }
        isConverting.value = false;
      }
    };

    const startPolling = () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }

      pollingCount.value = 0;

      pollingInterval = setInterval(async () => {
        if (!taskId.value) {
          if (pollingInterval) {
            clearInterval(pollingInterval);
          }
          return;
        }

        pollingCount.value++;

        if (pollingCount.value > 120) { // 最大轮询次数
          if (pollingInterval) {
            clearInterval(pollingInterval);
          }
          errorMessage.value = '任务处理超时，请稍后重试';
          showToast('任务处理超时');
          isConverting.value = false;
          return;
        }

        try {
          const excludeIdsParam = excludeIds.value.join(',');
          
          const response = await documentApi.getTransferStatus({
            task_id: taskId.value,
            exclude_ids: excludeIdsParam,
            only_task: false
          });

          const { common_task, transfer_task } = response;

          if (!common_task) {
            errorMessage.value = '服务器返回数据异常，任务信息不存在';
            if (pollingInterval) {
              clearInterval(pollingInterval);
            }
            isConverting.value = false;
            return;
          }

          // 更新进度
          if (common_task.except_count > 0) {
            progress.value = Math.floor((common_task.complete_count / common_task.except_count) * 100);
          }

          // 根据任务状态更新提示信息
          switch (common_task.status) {
            case 'processing':
              statusMessage.value = `正在处理中... (${common_task.complete_count}/${common_task.except_count})`;
              break;
            case 'success':
              if (common_task.result) {
                try {
                  const zipResult = common_task.result;
                  zipStatus.value = { ...zipResult };
                  statusMessage.value = zipResult.zip_text || '转换完成！';

                  if (zipStatus.value.zip_end && zipStatus.value.zip_success) {
                    startCountdown();
                  }
                } catch (e) {
                  console.error('解析zip状态失败:', e);
                  statusMessage.value = '转换完成！';
                }
              }

              if (zipStatus.value.zip_end && zipStatus.value.zip_success) {
                if (pollingInterval) {
                  clearInterval(pollingInterval);
                }
                isConverting.value = false;
              }
              break;
            case 'fail':
              statusMessage.value = '转换失败，请重试！';
              if (pollingInterval) {
                clearInterval(pollingInterval);
              }
              isConverting.value = false;
              break;
            default:
              statusMessage.value = `处理中... (${common_task.complete_count}/${common_task.except_count})`;
          }

          // 如果有新的转换文件，添加到结果列表中
          if (transfer_task && transfer_task.length > 0) {
            transfer_task.forEach((task) => {
              if (task.status === 'success') {
                const fileName = task.remark?.file_name || `文件_${task.id}.docx`;
                const fileUrl = task.file_url;

                if (!excludeIds.value.includes(task.id)) {
                  convertedFiles.value.push({
                    id: task.id,
                    name: fileName,
                    url: fileUrl
                  });

                  excludeIds.value.push(task.id);
                }
              }
            });
          }
        } catch (error) {
          console.error('轮询任务状态失败:', error);
          statusMessage.value = '获取任务状态失败，请刷新页面或重试';
          errorMessage.value = '网络请求失败，请检查网络连接';
          if (pollingInterval) {
            clearInterval(pollingInterval);
          }
          isConverting.value = false;
        }
      }, 3000); // 3秒轮询间隔
    };

    const downloadFile = (file) => {
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const copyVarCode = (code) => {
      const textArea = document.createElement('textarea');
      textArea.value = code;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);

      textArea.select();
      try {
        document.execCommand('copy');
        showToast('变量代码已复制到剪贴板');
      } catch (err) {
        console.error('复制失败:', err);
        showToast('复制失败，请手动复制');
      }

      document.body.removeChild(textArea);
    };

    const restartTask = () => {
      resetState('all');
      excelFile.value = null;
      wordFile.value = null;
      convertedFiles.value = [];
      excludeIds.value = [];
      zipStatus.value = {
        zip_path: '',
        need_zip_count: 0,
        has_zip_count: 0,
        zip_text: '',
        zip_end: false,
        zip_success: false
      };

      if (excelFileInput.value) excelFileInput.value.value = '';
      if (wordFileInput.value) wordFileInput.value.value = '';

      statusMessage.value = '任务已重置，请先上传Excel文件获取变量，然后上传Word模板';
      showToast('任务已重置，请重新上传文件');
    };

    const copyWechatId = () => {
      const textArea = document.createElement('textarea');
      textArea.value = 'Rqdll1';
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);

      textArea.select();
      try {
        document.execCommand('copy');
        showToast('微信号已复制到剪贴板');
      } catch (err) {
        console.error('复制失败:', err);
        showToast('复制失败，请手动复制');
      }

      document.body.removeChild(textArea);
    };

    const retryParseExcel = () => {
      if (!excelFile.value) {
        showToast('请先选择Excel文件');
        return;
      }

      excelFileUrl.value = '';
      errorMessage.value = '';
      parseExcelVars();
    };

    const retryUploadWord = () => {
      if (!wordFile.value) {
        showToast('请先选择Word文件');
        return;
      }

      wordFileUrl.value = '';
      errorMessage.value = '';

      uploadFile(wordFile.value, 'EXCEL_TO_WORD_WORD')
        .then(fileData => {
          wordFileUrl.value = fileData.url;
          console.log('Word文件重新上传成功:', fileData.url);
          showToast('Word文件重新上传成功');
        })
        .catch(err => {
          console.error('Word文件重新上传失败:', err);
          errorMessage.value = 'Word文件重新上传失败，请重试';
        });
    };

    // 开始倒计时
    const startCountdown = () => {
      countdownMinutes.value = 10;
      countdownSeconds.value = 0;

      if (countdownTimer) {
        clearInterval(countdownTimer);
      }

      countdownTimer = setInterval(() => {
        if (countdownSeconds.value > 0) {
          countdownSeconds.value--;
        } else if (countdownMinutes.value > 0) {
          countdownMinutes.value--;
          countdownSeconds.value = 59;
        } else {
          if (countdownTimer) {
            clearInterval(countdownTimer);
            countdownTimer = null;
          }
          if (convertedFiles.value.length > 0) {
            showToast('转换结果已自动清除');
            resetState('task');
          }
        }
      }, 1000);
    };

    // 开始Excel文件倒计时
    const startExcelCountdown = () => {
      excelCountdownMinutes.value = 10;
      excelCountdownSeconds.value = 0;

      if (excelCountdownTimer) {
        clearInterval(excelCountdownTimer);
      }

      excelCountdownTimer = setInterval(() => {
        if (excelCountdownSeconds.value > 0) {
          excelCountdownSeconds.value--;
        } else if (excelCountdownMinutes.value > 0) {
          excelCountdownMinutes.value--;
          excelCountdownSeconds.value = 59;
        } else {
          if (excelCountdownTimer) {
            clearInterval(excelCountdownTimer);
            excelCountdownTimer = null;
          }
          if (excelFileUrl.value) {
            showToast('Excel文件已自动清除');
            resetState('excel');
          }
        }
      }, 1000);
    };

    // 开始Word文件倒计时
    const startWordCountdown = () => {
      wordCountdownMinutes.value = 10;
      wordCountdownSeconds.value = 0;

      if (wordCountdownTimer) {
        clearInterval(wordCountdownTimer);
      }

      wordCountdownTimer = setInterval(() => {
        if (wordCountdownSeconds.value > 0) {
          wordCountdownSeconds.value--;
        } else if (wordCountdownMinutes.value > 0) {
          wordCountdownMinutes.value--;
          wordCountdownSeconds.value = 59;
        } else {
          if (wordCountdownTimer) {
            clearInterval(wordCountdownTimer);
            wordCountdownTimer = null;
          }
          if (wordFileUrl.value) {
            showToast('Word文件已自动清除');
            resetState('word');
          }
        }
      }, 1000);
    };

    // 使用计算属性实现按ID倒序排列
    const sortedFiles = computed(() => {
      return [...convertedFiles.value].sort((a, b) => b.id - a.id);
    });

    const downloadAllSelected = () => {
      if (convertedFiles.value.length === 0) return;
      downloadFile({
        name: 'words.zip',
        url: zipStatus.value.zip_path
      });
    };

    // 组件挂载时初始化
    onMounted(() => {
      if (excelFileInput.value) excelFileInput.value.value = '';
      if (wordFileInput.value) wordFileInput.value.value = '';
    });

    // 组件卸载时清除轮询
    onBeforeUnmount(() => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
      if (countdownTimer) {
        clearInterval(countdownTimer);
      }
      if (excelCountdownTimer) {
        clearInterval(excelCountdownTimer);
      }
      if (wordCountdownTimer) {
        clearInterval(wordCountdownTimer);
      }
    });

    return {
      excelFileInput,
      wordFileInput,
      excelFile,
      wordFile,
      taskId,
      progress,
      statusMessage,
      isConverting,
      convertedFiles,
      errorMessage,
      showToastMessage,
      toastMessage,
      showQrCode,
      triggerExcelUpload,
      triggerWordUpload,
      handleExcelUpload,
      handleWordUpload,
      startConversion,
      downloadFile,
      sortedFiles,
      downloadAllSelected,
      excelVars,
      isParsingExcel,
      copyVarCode,
      zipStatus,
      restartTask,
      copyWechatId,
      retryParseExcel,
      retryUploadWord,
      excelFileUrl,
      wordFileUrl,
      countdownMinutes,
      countdownSeconds,
      excelCountdownMinutes,
      excelCountdownSeconds,
      wordCountdownMinutes,
      wordCountdownSeconds,
      errorCode
    };
  }
});
</script>

<style scoped>
.document-convert {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h2 {
  color: #303133;
  margin-bottom: 10px;
}

.page-header p {
  color: #606266;
  font-size: 14px;
}

.main-content {
  min-height: calc(100vh - 200px);
}

.upload-card, 
.action-card,
.result-card, 
.error-card {
  margin-bottom: 20px;
}

.result-card {
  height: calc(100vh - 240px);
  overflow: hidden;
}

.result-content {
  height: calc(100vh - 320px);
  overflow-y: auto;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}

.step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  margin-right: 10px;
}

.step-title {
  flex: 1;
}

.countdown {
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 4px 8px;
  border-radius: 4px;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.upload-area {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  padding: 30px 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafbfc;
}

.upload-area:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.upload-icon {
  color: #c0c4cc;
  margin-bottom: 15px;
}

.upload-text p {
  margin: 0;
  color: #606266;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f0f9ff;
  border-radius: 6px;
  border: 1px solid #b3d8ff;
}

.parsing-status {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #409eff;
}

.variables-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.variables-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  font-weight: 600;
}

.variables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
  max-height: 200px;
  overflow-y: auto;
}

.variable-item {
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafbfc;
}

.variable-item:hover {
  border-color: #409eff;
  background: #f0f9ff;
  transform: translateY(-2px);
}

.variable-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.variable-title {
  font-weight: 600;
  color: #303133;
}

.copy-icon {
  color: #909399;
}

.variable-code {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #409eff;
  background: #ecf5ff;
  padding: 6px 8px;
  border-radius: 4px;
  word-break: break-all;
}

.variables-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 12px;
  background: #f5f7fa;
  padding: 8px;
  border-radius: 4px;
}

.convert-section {
  text-align: center;
}

.convert-section .el-button {
  margin-bottom: 15px;
}

.progress-section {
  margin: 15px 0;
}

.status-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
}

.result-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.zip-status {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: #f0f9ff;
  border-radius: 8px;
  margin-bottom: 20px;
}

.success-icon {
  color: #67c23a;
  font-size: 20px;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafbfc;
}

.file-item:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.file-name {
  flex: 1;
  color: #303133;
}

.download-icon {
  color: #409eff;
}

.error-header {
  color: #f56c6c;
}

.error-content {
  color: #f56c6c;
  text-align: center;
}

.error-content p {
  margin-bottom: 15px;
}

.qr-content {
  text-align: center;
}

.qr-message {
  margin-bottom: 20px;
}

.warning-icon {
  color: #e6a23c;
  font-size: 24px;
  margin-bottom: 10px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.wechat-id {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 6px;
}

.toast-dialog .el-dialog__body {
  padding: 15px 20px;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}

.toast-content .success-icon {
  color: #67c23a;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .variables-grid {
    grid-template-columns: 1fr;
  }
  
  .result-card {
    height: auto;
  }
  
  .result-content {
    height: auto;
    max-height: 400px;
  }
}

@media (max-width: 768px) {
  .document-convert {
    padding: 15px;
  }
  
  .main-content .el-col {
    margin-bottom: 20px;
  }
  
  .variables-grid {
    grid-template-columns: 1fr;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .result-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .file-item {
    flex-wrap: wrap;
  }
  
  .wechat-id {
    flex-direction: column;
    gap: 10px;
  }
  
  .result-card {
    height: auto;
  }
  
  .result-content {
    height: auto;
    max-height: 300px;
  }
}
</style> 