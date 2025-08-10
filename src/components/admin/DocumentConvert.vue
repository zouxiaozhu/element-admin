npm<template>
  <div class="document-convert">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>Excel转Word工具</h2>
      <p>批量将Excel数据填充到Word模板中，支持变量替换</p>
    </div>

    <!-- 历史记录区域 -->
    <el-card v-if="!hideHistory" class="history-card" shadow="hover" style="margin-bottom: 16px;">
      <template #header>
        <div class="card-header">
          <span>历史转换记录</span>
          <el-button type="primary" size="large" @click="startNewTaskFromTop">添加新的转换</el-button>
        </div>
      </template>
      <div v-if="loadingHistory" style="text-align:center;color:#909399;">加载中...</div>
      <div v-else>
        <el-empty v-if="!historyList || historyList.length === 0" description="暂无历史记录" />
        <el-table v-else :data="historyList" size="small" border>
          <el-table-column prop="id" label="ID" width="90" />
          <el-table-column prop="taskId" label="任务ID" width="180" />
          <el-table-column prop="fileCount" label="文件数" width="90" />
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作" width="160">
            <template #default="scope">
              <el-button size="small" type="primary" :disabled="!getZipUrl(scope.row)" @click="downloadHistoryZip(scope.row)">批量下载</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <el-row :gutter="20">
        <!-- 左侧：文件上传区域 -->
        <el-col :span="12">
          <!-- Excel文件上传 -->
          <el-card class="upload-card" shadow="hover" ref="topUploadCard">
            <template #header>
              <div class="card-header">
                <span class="step-number">1</span>
                <span class="step-title">上传Excel文件</span>
                
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
                <el-icon class="upload-icon" size="28">
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
                <el-icon class="upload-icon" size="28">
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
                v-if="!isCompleted"
                type="primary"
                size="large"
                :loading="isConverting"
                :disabled="!excelFile || !wordFile || excelVars.length === 0"
                @click="startConversion"
                style="width: 100%"
              >
                {{ isConverting ? '转换中...' : '开始转换' }}
              </el-button>
              <el-button
                v-else
                type="warning"
                size="large"
                style="width: 100%"
                @click="resetTask"
              >
                重置任务
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
                  <el-button 
                    v-if="zipStatus.zip_path"
                    type="primary" 
                    size="small"
                    :loading="isDownloadingZip"
                    @click="downloadZipByUrl"
                  >
                    批量下载
                  </el-button>
                
                </div>
              </div>
            </template>
            
            <div v-if="convertedFiles.length > 0 || (zipStatus.zip_end && zipStatus.zip_success)" class="result-content">
              <div v-if="zipStatus.zip_end && zipStatus.zip_success" class="zip-status">
                <el-icon class="success-icon"><CircleCheck /></el-icon>
                <span>{{ zipStatus.zip_text || '转换完成！' }}</span>
              </div>
              
              <div v-if="sortedFiles.length > 0" class="files-container">
                <div class="files-header-fixed">
                  <span class="files-count">共 {{ sortedFiles.length }} 个文件</span>
                  <div class="header-actions">
                    
                    <el-button 
                      type="warning" 
                      size="small"
                      @click="resetTask"
                    >
                      重置任务
                    </el-button>
                  </div>
                </div>
                <div class="files-list">
                  <div 
                    v-for="file in sortedFiles" 
                    :key="file.id" 
                    class="file-item"
                  >
                    <el-icon><Document /></el-icon>
                    <span class="file-name">{{ file.name }}</span>
                    <el-tooltip content="下载该文件" placement="top">
                      <el-button 
                        type="primary" 
                        size="small"
                        class="download-btn"
                        @click.stop="downloadFile(file)"
                      >
                        <el-icon><Download /></el-icon>
                        下载
                      </el-button>
                    </el-tooltip>
                  </div>
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
      
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onBeforeUnmount, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
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
  props: {
    hideHistory: {
      type: Boolean,
      default: false
    }
  },
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
  setup(props) {
    // 历史记录
    const loadingHistory = ref(false);
    const historyList = ref([]);
    const topUploadCard = ref(null);
    const hideHistory = ref(!!props.hideHistory);

    const getZipUrl = (row) => row?.zip_url || row?.zipUrl || row?.result?.zip_url;
    const downloadHistoryZip = (row) => {
      const url = getZipUrl(row);
      if (!url) return;
      const link = document.createElement('a');
      link.href = url;
      link.download = 'words.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('开始下载批量压缩包');
    };

    const startNewTaskFromTop = () => {
      restartTask();
      // 滚动到上传区域
      setTimeout(() => {
        topUploadCard.value?.$el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    };

    const loadHistory = async () => {
      try {
        loadingHistory.value = true;
        const res = await documentApi.listHistory({ page: 1, size: 10 });
        historyList.value = res?.records || res?.list || [];
      } catch (e) {
        console.error('加载历史记录失败', e);
      } finally {
        loadingHistory.value = false;
      }
    };
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

    // 错误信息
    const errorMessage = ref('');

    // 在setup中添加轮询计数器
    const pollingCount = ref(0);

    // 添加文件URL
    const excelFileUrl = ref('');
    const wordFileUrl = ref('');

    // 添加二维码显示状态
    const showQrCode = ref(false);
    const errorCode = ref(null);

    // 倒计时已移除

    // 文件倒计时已移除

    // 统一的轻量吐司
    const showToast = (message, type = 'success') => {
      ElMessage({ message, type, duration: 2000, showClose: false });
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

      // 清理所有倒计时
      

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
        excelFile.value = null;
        excelFileUrl.value = '';
      }

      // 重置Word文件URL
      if (resetType === 'all' || resetType === 'word') {
        wordFile.value = null;
        wordFileUrl.value = '';
      }

      // 重置文件输入
      if (excelFileInput.value) excelFileInput.value.value = '';
      if (wordFileInput.value) wordFileInput.value.value = '';
    };

    const handleExcelUpload = (event) => {
      const target = event && event.target ? event.target : null;
      const selectedFile = target && target.files && target.files.length > 0 ? target.files[0] : null;
      if (!selectedFile) {
        return; // 用户取消选择或未选择文件
      }

      // 先读取文件再重置，避免resetState清空input导致files丢失
      resetState('excel');

      // 检查文件大小 (100MB)
      if (selectedFile.size > 100 * 1024 * 1024) {
        errorMessage.value = 'Excel文件大小不能超过100MB';
        return;
      }

      excelFile.value = selectedFile;
      statusMessage.value = `Excel文件已选择: ${excelFile.value.name}`;
      errorMessage.value = '';

      // 上传Excel后立即解析变量
      parseExcelVars();
    };

    const handleWordUpload = (event) => {
      const target = event && event.target ? event.target : null;
      const selectedFile = target && target.files && target.files.length > 0 ? target.files[0] : null;
      if (!selectedFile) {
        return; // 用户取消选择或未选择文件
      }

      // 先读取文件再重置，避免resetState清空input导致files丢失
      resetState('word');

      // 检查文件大小 (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        errorMessage.value = 'Word文件大小不能超过10MB';
        return;
      }

      // 检查文件类型
      if (!selectedFile.name.endsWith('.docx')) {
        errorMessage.value = '只支持.docx格式的Word文件';
        return;
      }

      wordFile.value = selectedFile;
      statusMessage.value = `Word文件已选择: ${wordFile.value.name}`;
      errorMessage.value = '';

      // 上传Word文件
      documentApi.uploadFile(selectedFile, 'EXCEL_TO_WORD_WORD')
        .then(fileData => {
          wordFileUrl.value = fileData;
          console.log('Word文件上传成功:', fileData);
          
        })
        .catch(err => {
          console.error('Word文件上传失败:', err);
          errorMessage.value = 'Word文件上传失败，请重试';
        });
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

  
        taskId.value = response?.task?.taskId || response?.task?.task_id;
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

        if (pollingCount.value > 300) { // 最大轮询次数 (10分钟)
          if (pollingInterval) {
            clearInterval(pollingInterval);
          }
          errorMessage.value = '任务处理超时，请稍后重试';
          showToast('任务处理超时');
          isConverting.value = false;
          return;
        }

        try {
          const response = await documentApi.getTransferStatus({
            taskId: taskId.value,
            onlyTask:false,
            excludeIds:excludeIds.value
          });
          const { transferTasks, commonTask } = response;

          if (!commonTask) {
            errorMessage.value = '服务器返回数据异常，任务信息不存在';
            if (pollingInterval) {
              clearInterval(pollingInterval);
            }
            isConverting.value = false;
            return;
          }

          // zip_url 的赋值改由 processTransferTasks 统一处理

          // 调试信息
          console.log('任务状态:', commonTask.status, '任务ID:', commonTask.taskId, '进度:', commonTask.completeCount, '/', commonTask.exceptCount);
          if (transferTasks && transferTasks.length > 0) {
            const successCount = transferTasks.filter(t => t.status === 'SUCCESS').length;
            console.log(`转换任务: ${successCount}/${transferTasks.length} 已完成`);
          }

          // 更新进度
          if (transferTasks && transferTasks.length > 0) {
            // 根据转换任务的状态计算进度
            const successCount = transferTasks.filter(t => t.status === 'SUCCESS').length;
            const totalCount = transferTasks.length;
            progress.value = Math.floor((successCount / totalCount) * 100);
          } else if (commonTask.exceptCount > 0) {
            const completeCount = commonTask.completeCount || 0;
            progress.value = Math.floor((completeCount / commonTask.exceptCount) * 100);
          } else {
            // 如果没有进度信息，根据状态设置进度
            switch (commonTask.status) {
              case 'PENDING':
                progress.value = 10;
                break;
              case 'PROCESSING':
              case 'RUNNING':
                progress.value = 50;
                break;
              case 'SUCCESS':
              case 'COMPLETED':
                progress.value = 100;
                break;
              default:
                progress.value = 25;
            }
          }

          // 根据任务状态更新提示信息
          switch (commonTask.status) {
            case 'PENDING':
              // 检查是否有已完成的转换任务
              if (transferTasks && transferTasks.length > 0) {
                const successCount = transferTasks.filter(t => t.status === 'SUCCESS').length;
                const totalCount = transferTasks.length;
                
                if (successCount > 0) {
                  statusMessage.value = `正在处理中... (${successCount}/${totalCount})`;
                  
                  // 处理已完成的转换任务
                  processTransferTasks(transferTasks, commonTask);
                  
                  // 如果所有任务都完成了，显示完成状态
                  if (successCount === totalCount) {
                    statusMessage.value = `转换完成！共生成 ${successCount} 个文件`;
                    showToast(`转换完成！共生成 ${successCount} 个文件`);
                    if (pollingInterval) {
                      clearInterval(pollingInterval);
                    }
                    isConverting.value = false;
                  }
                } else {
                  statusMessage.value = `任务等待中... (ID: ${commonTask.taskId})`;
                }
              } else {
                statusMessage.value = `任务等待中... (ID: ${commonTask.taskId})`;
              }
              break;
            case 'PROCESSING':
              const completeCount = commonTask.completeCount || 0;
              statusMessage.value = `正在处理中... (${completeCount}/${commonTask.exceptCount})`;
              // 实时处理已完成的子任务，逐步展示结果
              if (transferTasks && transferTasks.length > 0) {
                processTransferTasks(transferTasks, commonTask);
              }
              break;
            case 'RUNNING':
              const runningCompleteCount = commonTask.completeCount || 0;
              statusMessage.value = `正在运行中... (${runningCompleteCount}/${commonTask.exceptCount})`;
              // 实时处理已完成的子任务，逐步展示结果
              if (transferTasks && transferTasks.length > 0) {
                processTransferTasks(transferTasks, commonTask);
              }
              break;
            case 'SUCCESS':
              statusMessage.value = '转换完成！';
              
              // 处理转换任务列表
              if (transferTasks && transferTasks.length > 0) {
                const processedCount = processTransferTasks(transferTasks, commonTask);
                
                // 显示成功提示
                showToast(`转换完成！共生成 ${transferTasks.filter(t => t.status === 'SUCCESS').length} 个文件`);
              }
              
              // 显示任务变量信息
              if (commonTask.payload && commonTask.payload.wordVars && commonTask.payload.wordVars.length > 0) {
                console.log('任务变量:', commonTask.payload.wordVars);
              }
              
              if (pollingInterval) {
                clearInterval(pollingInterval);
              }
              isConverting.value = false;
              break;
            case 'FAILED':
              statusMessage.value = '转换失败，请重试！';
              errorMessage.value = commonTask.errorMessage || '转换过程中发生错误';
              if (pollingInterval) {
                clearInterval(pollingInterval);
              }
              isConverting.value = false;
              break;
            case 'COMPLETED':
              statusMessage.value = '转换完成！';
              
              // 处理转换任务列表
              if (transferTasks && transferTasks.length > 0) {
                const processedCount = processTransferTasks(transferTasks, commonTask);
                
                // 显示成功提示
                showToast(`转换完成！共生成 ${transferTasks.filter(t => t.status === 'SUCCESS').length} 个文件`);
              }
              
              // 显示任务变量信息
              if (commonTask.payload && commonTask.payload.wordVars && commonTask.payload.wordVars.length > 0) {
                console.log('任务变量:', commonTask.payload.wordVars);
              }
              
              if (pollingInterval) {
                clearInterval(pollingInterval);
              }
              isConverting.value = false;
              break;
            default:
              const currentCompleteCount = commonTask.completeCount || 0;
              statusMessage.value = `处理中... (${currentCompleteCount}/${commonTask.exceptCount})`;
          }
        } catch (error) {
          console.error('轮询任务状态失败:', error);
          statusMessage.value = '获取任务状态失败，请刷新页面或重试';
          errorMessage.value = error.message || '网络请求失败，请检查网络连接';
          if (pollingInterval) {
            clearInterval(pollingInterval);
          }
          isConverting.value = false;
        }
      }, 2000); // 2秒轮询间隔，提高响应速度
    };

    // 处理转换任务的公共函数
    const processTransferTasks = (transferTasks, commonTask = null) => {
      if (!transferTasks || transferTasks.length === 0) return 0;
      
      let processedCount = 0;
      
      // 同步 zipUrl（当后端已生成压缩包时）
      try {
        const zipUrl = commonTask?.result?.zip_url;
        debugger
        if (zipUrl && zipStatus.value.zip_path !== zipUrl) {
          zipStatus.value.zip_path = zipUrl;
          zipStatus.value.zip_end = true;
          zipStatus.value.zip_success = true;
          zipStatus.value.zip_text = '压缩包已生成，可批量下载';
        }
      } catch (e) {
        console.log(e)
        // 忽略
      }

      transferTasks.forEach((transferTask) => {
        if (transferTask.status === 'SUCCESS') {
          // 解析备注信息
          let fileName = `转换结果_${transferTask.id}.docx`;
          let remarkData = {};
          
          try {
            if (transferTask.remark) {
              remarkData = JSON.parse(transferTask.remark);
              // 使用姓名作为文件名的一部分
              if (remarkData.姓名) {
                fileName = `${remarkData.姓名}_${transferTask.id}.docx`;
              }
            }
          } catch (e) {
            console.error('解析备注信息失败:', e);
          }
          
          const existingFile = convertedFiles.value.find(f => f.id === transferTask.id);
          
          if (!existingFile) {
            convertedFiles.value.push({
              id: transferTask.id,
              name: fileName,
              taskId: transferTask.taskId,
              transferTask: transferTask
            });
            // 记录已处理的ID，避免后续重复
            if (!excludeIds.value.includes(transferTask.id)) {
              excludeIds.value.push(transferTask.id);
            }
            processedCount++;
          }
        }
      });
      
      return processedCount;
    };

    const downloadFile = async (file) => {
      try {
        if (file.taskId) {
          // 使用新的API下载文件
          const transferId = file.transferTask ? file.transferTask.id : null;
          const blob = await documentApi.downloadFile(file.taskId, transferId);
          
          // 创建blob URL
          const url = window.URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = url;
          link.download = file.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // 清理blob URL
          window.URL.revokeObjectURL(url);
          
          showToast('文件下载成功！');
        } else {
          // 原有的下载方式
          const link = document.createElement('a');
          link.href = file.url;
          link.download = file.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (error) {
        console.error('下载文件失败:', error);
        showToast('下载文件失败，请重试');
      }
    };

    // 批量下载所有文件
    const downloadAllFiles = async () => {
      if (convertedFiles.value.length === 0) {
        showToast('没有可下载的文件');
        return;
      }

      showToast('开始批量下载...');
      
      for (let i = 0; i < convertedFiles.value.length; i++) {
        const file = convertedFiles.value[i];
        try {
          await downloadFile(file);
          // 添加延迟避免浏览器阻止多个下载
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`下载文件 ${file.name} 失败:`, error);
        }
      }
      
      showToast('批量下载完成！');
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

    // 重置任务方法（作为restartTask的别名）
    const resetTask = () => {
      restartTask();
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

    // 倒计时函数已移除

    // 使用计算属性实现按ID倒序排列
    const sortedFiles = computed(() => {
      return [...convertedFiles.value].sort((a, b) => b.id - a.id);
    });

    // 是否已完成，用于切换按钮为“重置任务”
    const isCompleted = computed(() => {
      const hasFiles = convertedFiles.value && convertedFiles.value.length > 0;
      const zipDone = zipStatus.value && zipStatus.value.zip_end && zipStatus.value.zip_success;
      return !isConverting.value && (zipDone || (hasFiles && progress.value === 100));
    });

    const downloadAllSelected = () => {
      if (convertedFiles.value.length === 0) return;
      downloadFile({
        name: 'words.zip',
        url: zipStatus.value.zip_path
      });
    };

    const isDownloadingZip = ref(false);
    const downloadZipByUrl = async () => {
      try {
        debugger
        if (!zipStatus.value.zip_path) {
          showToast('压缩包暂未生成，请稍后重试', 'warning');
          return;
        }
        isDownloadingZip.value = true;
        const link = document.createElement('a');
        link.href = zipStatus.value.zip_path;
        link.download = 'words.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('开始下载批量压缩包');
      } catch (e) {
        showToast('下载失败，请稍后重试', 'error');
      } finally {
        isDownloadingZip.value = false;
      }
    };

    // 组件挂载时初始化
    onMounted(() => {
      if (excelFileInput.value) excelFileInput.value.value = '';
      if (wordFileInput.value) wordFileInput.value.value = '';
      // 通过 URL 或外部 props 控制是否隐藏历史记录
      const params = new URLSearchParams(location.search)
      const paramHide = params.get('hideHistory') === '1'
      hideHistory.value = !!props.hideHistory || paramHide
      if (!hideHistory.value) loadHistory();
    });

    // 组件卸载时清除轮询
    onBeforeUnmount(() => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
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
      showToast,
      triggerExcelUpload,
      triggerWordUpload,
      handleExcelUpload,
      handleWordUpload,
      startConversion,
      downloadFile,
      downloadAllFiles,
      downloadZipByUrl,
      sortedFiles,
      downloadAllSelected,
      isDownloadingZip,
      excelVars,
      isParsingExcel,
      copyVarCode,
      zipStatus,
      restartTask,
      startNewTaskFromTop,
      loadingHistory,
      historyList,
      downloadHistoryZip,
      getZipUrl,
      topUploadCard,
      hideHistory,
      resetTask,
      copyWechatId,
      retryParseExcel,
      retryUploadWord,
      excelFileUrl,
      wordFileUrl,
      errorCode,
      isCompleted
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
  min-height: 100vh;
  height: auto;
}

.upload-card, 
.action-card,
.result-card, 
.error-card {
  margin-bottom: 20px;
}

.history-card :deep(.el-card__header) {
  padding: 14px 16px;
}

.history-card .card-header .el-button {
  font-weight: 600;
}

.result-card {
  height: auto;
  overflow: visible;
  display: flex;
  flex-direction: column;
}

.result-content {
  display: block;
}

.result-content::-webkit-scrollbar {
  width: 6px;
}

.result-content::-webkit-scrollbar-track {
  background: #f5f7fa;
  border-radius: 3px;
}

.result-content::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.result-content::-webkit-scrollbar-thumb:hover {
  background: #909399;
}

.files-list::-webkit-scrollbar {
  width: 6px;
}

.files-list::-webkit-scrollbar-track {
  background: #f5f7fa;
  border-radius: 3px;
}

.files-list::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.files-list::-webkit-scrollbar-thumb:hover {
  background: #909399;
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

/* 倒计时样式已移除 */

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.upload-area {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  padding: 20px 12px;
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
  gap: 8px;
  padding: 12px 4px;
}

.files-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.files-header-fixed {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 2px solid #e4e7ed;
  background: #f8f9fa;
  border-radius: 6px 6px 0 0;
  position: sticky;
  top: 0;
  z-index: 10;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.files-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 2px solid #e4e7ed;
  margin-bottom: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.files-count {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafbfc;
  margin-bottom: 6px;
  min-height: 52px;
}

.file-item .el-icon {
  font-size: 16px;
  color: #606266;
  flex-shrink: 0;
}

.file-item:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.file-name {
  flex: 1;
  color: #303133;
  word-break: break-word;
  line-height: 1.3;
  font-size: 14px;
}

.download-btn {
  flex-shrink: 0;
  padding: 6px 12px;
  font-size: 12px;
  height: 32px;
  border-radius: 6px;
}

.download-btn:hover {
  transform: scale(1.05);
}

.download-icon {
  color: #409eff;
  font-size: 18px;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s;
  flex-shrink: 0;
  cursor: pointer;
}

.download-icon:hover {
  background: #e6f7ff;
  transform: scale(1.1);
}

/* 修复下载按钮大小 */
.files-header-fixed .el-button {
  padding: 8px 16px;
  font-size: 14px;
  height: 36px;
}

.result-actions .el-button {
  padding: 8px 16px;
  font-size: 14px;
  height: 36px;
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
    height: 96vh;
  }
  
  .result-content {
    height: auto;
    max-height: calc(96vh - 120px);
  }
  
  .files-list {
    max-height: calc(96vh - 200px);
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
  
  .files-header,
  .files-header-fixed {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }
  
  .header-actions .el-button {
    width: 100%;
    padding: 10px 20px;
    font-size: 14px;
    height: 40px;
  }
  
  .file-item {
    flex-wrap: nowrap;
    padding: 10px 12px;
    min-height: 48px;
  }
  
  .wechat-id {
    flex-direction: column;
    gap: 10px;
  }
  
  .result-card {
    min-height: 70vh;
    height: 70vh;
  }
  
  .result-content {
    min-height: 0;
    height: auto;
    max-height: calc(70vh - 120px);
    overflow: hidden;
  }
  
  .files-list {
    padding: 8px 2px;
    max-height: calc(70vh - 200px);
  }
  
  .files-header,
  .files-header-fixed {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  /* 移动端下载按钮样式 */
  .files-header-fixed .el-button,
  .result-actions .el-button {
    padding: 10px 20px;
    font-size: 14px;
    height: 40px;
    width: 100%;
  }
  
  .download-icon {
    font-size: 20px;
    padding: 10px;
  }

  .download-btn {
    padding: 8px 16px;
    font-size: 12px;
    height: 32px;
    width: auto;
    margin-top: 0;
  }
}
</style> 