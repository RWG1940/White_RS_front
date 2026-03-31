<template>
  <div>
    <LoadingYD v-if="store.loading" />
    <div v-else class="table-container">
      <ManagePage
        row-key="id"
        v-model:data-source="dataSource"
        :columns="columns"
        :editable-fields="editableFields"
        :show-add="false"
        :show-batch-delete="false"
        :show-delete="false"
        :search-select-options="searchSelectOptions"
        v-model:total="store.total"
        v-model:currentPage="store.currentPage"
        v-model:pageSize="store.pageSize"
        search-placeholder="搜索"
        @search="handleSearch"
        @save="handleSave"
        @selection-change="handleSelectionChange"
        @update:currentPage="pageChange"
        @update:pageSize="pageSizeChange"
      >
        <template #custom-tool>
          <a-button type="primary" style="margin-left: 8px" @click="handleFilterClick"
            ><FilterOutlined />筛选工厂</a-button
          >
          <a-button type="primary" style="margin-left: 8px" @click="handleFollowerDataClick"
            ><PieChartOutlined />跟单数据</a-button
          >
          <a-button class="custom-tool-btn" type="primary" @click="onHistoryClick"
            ><FundProjectionScreenOutlined />订单管理</a-button
          >
          <div class="batch-select">
            <span style="color: gray">&ensp;查看方式：</span>
            <a-select
              style="min-width: 200px"
              size="small"
              v-model="selectedBatchId"
              :options="batchOptions"
              placeholder="选择批次"
              @change="handleBatchChange"
            />
            <a-select
              size="small"
              v-model="selectedQuarterId"
              :options="quarterOptions"
              placeholder="选择季度"
              @change="handleQuarterChange"
            />
            <a-button size="small" @click="handleTotalDataClick"><TableOutlined />所有</a-button>
          </div>
        </template>
        <template #cell-__index__="{ index }">
          <span>{{ (index ?? 0) + 1 }}</span>
        </template>
        <template #cell-washPriority="{ record }">
          <div style="display: flex; justify-content: center; align-items: center">
            <div
              v-show="record.washPriority == 2"
              style="
                border-radius: 15px;
                background-color: red;
                width: 15px;
                height: 15px;
                box-shadow: 1px 1px 15px red;
              "
            ></div>
            <div
              v-show="record.washPriority == 0"
              style="
                border-radius: 15px;
                background-color: lightgreen;
                width: 15px;
                height: 15px;
                box-shadow: 1px 1px 15px lightgreen;
              "
            ></div>
            <div
              v-show="record.washPriority == 1"
              style="
                border-radius: 15px;
                background-color: gold;
                width: 15px;
                height: 15px;
                box-shadow: 1px 1px 15px gold;
              "
            ></div>
          </div>
        </template>
        <template #cell-washStatus="{ record }">
          <a-tag
            :color="
              record.washStatus == 0
                ? 'lightgrey'
                : record.washStatus == 1
                  ? 'orange'
                  : record.washStatus == 2
                    ? 'pink'
                    : record.washStatus == 3
                      ? 'green'
                      : ''
            "
          >
            {{
              record.washStatus == 0
                ? '未下单'
                : record.washStatus == 1
                  ? '做货中'
                  : record.washStatus == 2
                    ? '货好等付款'
                    : record.washStatus == 3
                      ? '已出货'
                      : ''
            }}
          </a-tag>
        </template>
        <template #cell-tagPriority="{ record }">
          <div style="display: flex; justify-content: center; align-items: center">
            <div
              v-show="record.washPriority == 2"
              style="
                border-radius: 15px;
                background-color: red;
                width: 15px;
                height: 15px;
                box-shadow: 1px 1px 15px red;
              "
            ></div>
            <div
              v-show="record.washPriority == 0"
              style="
                border-radius: 15px;
                background-color: lightgreen;
                width: 15px;
                height: 15px;
                box-shadow: 1px 1px 15px lightgreen;
              "
            ></div>
            <div
              v-show="record.washPriority == 1"
              style="
                border-radius: 15px;
                background-color: gold;
                width: 15px;
                height: 15px;
                box-shadow: 1px 1px 15px gold;
              "
            ></div>
          </div>
        </template>
        <template #cell-tagStatus="{ record }">
          <a-tag
            :color="
              record.tagStatus == 0
                ? 'lightgrey'
                : record.tagStatus == 1
                  ? 'orange'
                  : record.tagStatus == 2
                    ? 'pink'
                    : record.tagStatus == 3
                      ? 'green'
                      : ''
            "
          >
            {{
              record.tagStatus == 0
                ? '未下单'
                : record.tagStatus == 1
                  ? '做货中'
                  : record.tagStatus == 2
                    ? '货好等付款'
                    : record.tagStatus == 3
                      ? '已出货'
                      : ''
            }}
          </a-tag>
        </template>
        <template #cell-imageUrl="{ record }">
          <Transition name="fade">
            <a-row>
              <template v-if="record.imageUrl">
                <a-image
                  :width="60"
                  :height="60"
                  :src="getImageUrl(record.imageUrl, record.updatedAt)"
                  alt=""
                  style="border-radius: 5px"
                >
                  <template #previewMask>
                    <EyeOutlined />
                  </template>
                </a-image>
              </template>
              <template v-else>
                <div
                  style="
                    width: 60px;
                    height: 60px;
                    border-radius: 5px;
                    background: #f5f5f5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px dashed #d9d9d9;
                  "
                >
                  <span style="color: #999; font-size: 12px">暂无图片</span>
                </div>
              </template>
            </a-row>
          </Transition>
        </template>
        <!-- 自定义操作列 -->
        <template #operation="{ record, isEditing, save, cancel, edit }">
          <div class="editable-row-operations">
            <span v-if="isEditing">
              <a-typography-link @click="save(record.id)">保存</a-typography-link>
              <a style="margin-left: 8px" @click="cancel(record.id)">取消</a>
            </span>
            <span v-else>
              <a-button
                size="small"
                :disabled="record.status === 3"
                :title="record.status === 3 ? '已出货的记录不能修改' : ''"
                @click="
                  canEditRow(record) ? edit(record.id) : message.warning('已出货的记录不能修改')
                "
              >
                <EditOutlined />编辑
              </a-button>
            </span>
          </div>
        </template>
      </ManagePage>

      <!-- 筛选工厂 Modal -->
      <Modal v-model:visible="showFilterModal" title="筛选工厂">
        <div style="margin-bottom: 16px">
          <div style="display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap">
            <div>
              <div style="margin-bottom: 4px; font-size: 12px; color: #666">工厂</div>
              <a-select
                style="width: 200px"
                v-model:value="filterFactory"
                placeholder="请选择工厂"
                :options="factoryUserOptions"
                allow-clear
              ></a-select>
            </div>
            <div>
              <div style="margin-bottom: 4px; font-size: 12px; color: #666">洗标状态</div>
              <a-select
                style="width: 200px"
                v-model:value="filterWashStatus"
                placeholder="选择洗标状态"
                allow-clear
              >
                <a-select-option :value="0">未下单</a-select-option>
                <a-select-option :value="1">做货中</a-select-option>
                <a-select-option :value="2">货好等付款</a-select-option>
                <a-select-option :value="3">已出货</a-select-option>
              </a-select>
            </div>
            <div>
              <div style="margin-bottom: 4px; font-size: 12px; color: #666">吊牌状态</div>
              <a-select
                style="width: 200px"
                v-model:value="filterTagStatus"
                placeholder="选择吊牌状态"
                allow-clear
              >
                <a-select-option :value="0">未下单</a-select-option>
                <a-select-option :value="1">做货中</a-select-option>
                <a-select-option :value="2">货好等付款</a-select-option>
                <a-select-option :value="3">已出货</a-select-option>
              </a-select>
            </div>
            <a-button type="primary" @click="handleFilterFactory">查询</a-button>
          </div>
        </div>

        <!-- 结果列表 -->
        <div v-if="store.searchResults.length > 0" style="margin-top: 12px">
          <div style="margin-bottom: 8px; color: #666; font-size: 12px">
            找到 {{ store.searchResults.length }} 条记录
          </div>
          <div
            style="
              display: flex;
              flex-direction: column;
              gap: 4px;
              max-height: 400px;
              overflow-y: auto;
            "
          >
            <div
              v-for="item in store.searchResults as AccPurchaseContractType[]"
              :key="item.id"
              style="
                border-radius: 4px;
                border: 1px solid #e8e8e8;
                background: #fafafa;
                padding: 8px;
                transition: all 0.2s ease;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 12px;
              "
              @mouseenter="
                (e) => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = '#1890ff'
                  ;(e.currentTarget as HTMLElement).style.background = '#f0f5ff'
                  ;(e.currentTarget as HTMLElement).style.boxShadow =
                    '0 1px 4px rgba(24, 144, 255, 0.1)'
                }
              "
              @mouseleave="
                (e) => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = '#e8e8e8'
                  ;(e.currentTarget as HTMLElement).style.background = '#fafafa'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                }
              "
            >
              <!-- 图片 -->
              <div style="min-width: 70px; display: flex; justify-content: center">
                <template v-if="item.imageUrl">
                  <a-image
                    :width="50"
                    :height="50"
                    :src="getImageUrl(item.imageUrl, item.updatedAt)"
                    alt=""
                    style="border-radius: 4px"
                  >
                    <template #previewMask>
                      <EyeOutlined />
                    </template>
                  </a-image>
                </template>
                <template v-else>
                  <div
                    style="
                      width: 50px;
                      height: 50px;
                      border-radius: 4px;
                      background: #f5f5f5;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      border: 1px dashed #d9d9d9;
                    "
                  >
                    <span style="color: #999; font-size: 11px">暂无图片</span>
                  </div>
                </template>
              </div>

              <!-- 分隔符 -->
              <div style="width: 1px; height: 20px; background: #e8e8e8"></div>

              <!-- 货号 -->
              <div style="min-width: 80px">
                <div style="font-size: 11px; color: #666; margin-bottom: 2px">货号</div>
                <div style="color: #1890ff; font-size: 12px; font-weight: 500">
                  {{ item.sku || '-' }}
                </div>
              </div>

              <!-- 分隔符 -->
              <div style="width: 1px; height: 20px; background: #e8e8e8"></div>

              <!-- 绳子吊粒 -->
              <div style="min-width: 80px">
                <div style="font-size: 11px; color: #666; margin-bottom: 2px">绳子吊粒</div>
                <div style="color: #262626; font-size: 12px; font-weight: 500">
                  {{ item.threadPellets || '-' }}
                </div>
              </div>

              <!-- 分隔符 -->
              <div style="width: 1px; height: 20px; background: #e8e8e8"></div>

              <!-- 分隔符 -->
              <div style="width: 1px; height: 20px; background: #e8e8e8"></div>

              <!-- 颜色 -->
              <div style="min-width: 60px">
                <div style="font-size: 11px; color: #666; margin-bottom: 2px">颜色</div>
                <div style="color: #262626; font-size: 12px">{{ item.color || '-' }}</div>
              </div>

              <!-- 分隔符 -->
              <div style="width: 1px; height: 20px; background: #e8e8e8"></div>

              <!-- 品牌 -->
              <div style="min-width: 70px">
                <div style="font-size: 11px; color: #666; margin-bottom: 2px">品牌</div>
                <div style="color: #262626; font-size: 12px">{{ item.brand || '-' }}</div>
              </div>

              <!-- 分隔符 -->
              <div style="width: 1px; height: 20px; background: #e8e8e8"></div>

              <!-- 数量 -->
              <div style="min-width: 50px">
                <div style="font-size: 11px; color: #666; margin-bottom: 2px">数量</div>
                <div style="color: #262626; font-size: 12px; font-weight: 500">
                  {{ item.quantity || '-' }}
                </div>
              </div>

              <!-- 分隔符 -->
              <div style="width: 1px; height: 20px; background: #e8e8e8"></div>

              <!-- 地址 -->
              <div style="flex: 1; min-width: 120px">
                <div style="font-size: 11px; color: #666; margin-bottom: 2px">地址</div>
                <div
                  style="
                    color: #999;
                    font-size: 12px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: block;
                  "
                >
                  {{ item.address || '-' }}
                </div>
              </div>

              <!-- 分隔符 -->
              <div style="width: 1px; height: 20px; background: #e8e8e8"></div>

              <!-- 洗标状态 -->
              <div style="min-width: 80px">
                <div style="font-size: 11px; color: #666; margin-bottom: 2px">洗标状态</div>
                <a-tag
                  :color="
                    item.washStatus == 0
                      ? 'lightgrey'
                      : item.washStatus == 1
                        ? 'orange'
                        : item.washStatus == 2
                          ? 'pink'
                          : item.washStatus == 3
                            ? 'green'
                            : ''
                  "
                >
                  {{
                    item.washStatus == 0
                      ? '未下单'
                      : item.washStatus == 1
                        ? '做货中'
                        : item.washStatus == 2
                          ? '货好等付款'
                          : item.washStatus == 3
                            ? '已出货'
                            : ''
                  }}
                </a-tag>
              </div>
              <!-- 吊牌状态 -->
              <div style="min-width: 80px">
                <div style="font-size: 11px; color: #666; margin-bottom: 2px">吊牌状态</div>
                <a-tag
                  :color="
                    item.tagStatus == 0
                      ? 'lightgrey'
                      : item.tagStatus == 1
                        ? 'orange'
                        : item.tagStatus == 2
                          ? 'pink'
                          : item.tagStatus == 3
                            ? 'green'
                            : ''
                  "
                >
                  {{
                    item.tagStatus == 0
                      ? '未下单'
                      : item.tagStatus == 1
                        ? '做货中'
                        : item.tagStatus == 2
                          ? '货好等付款'
                          : item.tagStatus == 3
                            ? '已出货'
                            : ''
                  }}
                </a-tag>
              </div>
              <!-- 分隔符 -->
              <div style="width: 1px; height: 20px; background: #e8e8e8"></div>

              <!-- 更新时间 -->
              <div style="min-width: 130px">
                <div style="font-size: 11px; color: #666; margin-bottom: 2px">更新时间</div>
                <div style="color: #999; font-size: 12px">
                  {{ item.updatedAt ? formatTime(item.updatedAt) : '-' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else style="text-align: center; padding: 40px 20px; color: #999">
          <div style="font-size: 14px; margin-bottom: 8px">暂无结果</div>
          <div style="font-size: 12px">请输入工厂名称进行搜索</div>
        </div>
      </Modal>

      <!-- 跟单数据 Modal -->
      <Modal v-model:visible="showFollowerDataModal" title="跟单数据统计">
        <div style="margin-bottom: 20px; overflow-y: auto; max-height: 500px">
          <div style="display: flex; gap: 20px; margin-bottom: 16px">
            <div
              style="
                flex: 1;
                background: #f0f5ff;
                padding: 16px;
                border-radius: 8px;
                border-left: 4px solid #1890ff;
              "
            >
              <div style="font-size: 14px; color: #666; margin-bottom: 8px">负责工厂数量</div>
              <div style="font-size: 24px; font-weight: bold; color: #1890ff">
                {{ followerStats.totalFactories }}
              </div>
            </div>
            <div
              style="
                flex: 1;
                background: #f6ffed;
                padding: 16px;
                border-radius: 8px;
                border-left: 4px solid #52c41a;
              "
            >
              <div style="font-size: 14px; color: #666; margin-bottom: 8px">总记录数</div>
              <div style="font-size: 24px; font-weight: bold; color: #52c41a">
                {{ followerStats.totalRecords }}
              </div>
            </div>
          </div>

          <!-- 按批次统计 -->
          <div style="margin-top: 20px">
            <div style="font-size: 16px; font-weight: bold; margin-bottom: 12px; color: #262626">
              按批次统计
            </div>
            <a-table
              :columns="batchStatsColumns"
              :data-source="followerStats.batchStats"
              :pagination="false"
              size="small"
              :scroll="{ x: 800 }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'batchName'">
                  <span style="color: #1890ff; font-weight: 500">{{ record.batchName }}</span>
                </template>
                <template v-else-if="column.dataIndex === 'totalRecords'">
                  <span style="font-weight: 500">{{ record.totalRecords }}</span>
                </template>
                <template v-else-if="column.dataIndex === 'washStats'">
                  <div style="display: flex; gap: 8px; flex-wrap: wrap">
                    <a-tooltip placement="top" v-if="record.washStats[0] > 0">
                      <template #title>
                        <div style="max-width: 300px; max-height: 200px; overflow-y: auto">
                          <div style="font-weight: bold; margin-bottom: 8px">未下单货号列表:</div>
                          <div
                            v-for="sku in record.washSkus[0]"
                            :key="sku"
                            style="margin: 2px 0; font-size: 12px"
                          >
                            {{ sku }}
                          </div>
                        </div>
                      </template>
                      <a-tag color="lightgrey" style="margin: 2px"
                        >未下单: {{ record.washStats[0] }}</a-tag
                      >
                    </a-tooltip>
                    <a-tooltip placement="top" v-if="record.washStats[1] > 0">
                      <template #title>
                        <div style="max-width: 300px; max-height: 200px; overflow-y: auto">
                          <div style="font-weight: bold; margin-bottom: 8px">做货中货号列表:</div>
                          <div
                            v-for="sku in record.washSkus[1]"
                            :key="sku"
                            style="margin: 2px 0; font-size: 12px"
                          >
                            {{ sku }}
                          </div>
                        </div>
                      </template>
                      <a-tag color="orange" style="margin: 2px"
                        >做货中: {{ record.washStats[1] }}</a-tag
                      >
                    </a-tooltip>
                    <a-tooltip placement="top" v-if="record.washStats[2] > 0">
                      <template #title>
                        <div style="max-width: 300px; max-height: 200px; overflow-y: auto">
                          <div style="font-weight: bold; margin-bottom: 8px">
                            货好等付款货号列表:
                          </div>
                          <div
                            v-for="sku in record.washSkus[2]"
                            :key="sku"
                            style="margin: 2px 0; font-size: 12px"
                          >
                            {{ sku }}
                          </div>
                        </div>
                      </template>
                      <a-tag color="pink" style="margin: 2px"
                        >货好等付款: {{ record.washStats[2] }}</a-tag
                      >
                    </a-tooltip>
                    <a-tooltip placement="top" v-if="record.washStats[3] > 0">
                      <template #title>
                        <div style="max-width: 300px; max-height: 200px; overflow-y: auto">
                          <div style="font-weight: bold; margin-bottom: 8px">已出货货号列表:</div>
                          <div
                            v-for="sku in record.washSkus[3]"
                            :key="sku"
                            style="margin: 2px 0; font-size: 12px"
                          >
                            {{ sku }}
                          </div>
                        </div>
                      </template>
                      <a-tag color="green" style="margin: 2px"
                        >已出货: {{ record.washStats[3] }}</a-tag
                      >
                    </a-tooltip>
                  </div>
                </template>
                <template v-else-if="column.dataIndex === 'tagStats'">
                  <div style="display: flex; gap: 8px; flex-wrap: wrap">
                    <a-tooltip placement="top" v-if="record.tagStats[0] > 0">
                      <template #title>
                        <div style="max-width: 300px; max-height: 200px; overflow-y: auto">
                          <div style="font-weight: bold; margin-bottom: 8px">未下单货号列表:</div>
                          <div
                            v-for="sku in record.tagSkus[0]"
                            :key="sku"
                            style="margin: 2px 0; font-size: 12px"
                          >
                            {{ sku }}
                          </div>
                        </div>
                      </template>
                      <a-tag color="lightgrey" style="margin: 2px"
                        >未下单: {{ record.tagStats[0] }}</a-tag
                      >
                    </a-tooltip>
                    <a-tooltip placement="top" v-if="record.tagStats[1] > 0">
                      <template #title>
                        <div style="max-width: 300px; max-height: 200px; overflow-y: auto">
                          <div style="font-weight: bold; margin-bottom: 8px">做货中货号列表:</div>
                          <div
                            v-for="sku in record.tagSkus[1]"
                            :key="sku"
                            style="margin: 2px 0; font-size: 12px"
                          >
                            {{ sku }}
                          </div>
                        </div>
                      </template>
                      <a-tag color="orange" style="margin: 2px"
                        >做货中: {{ record.tagStats[1] }}</a-tag
                      >
                    </a-tooltip>
                    <a-tooltip placement="top" v-if="record.tagStats[2] > 0">
                      <template #title>
                        <div style="max-width: 300px; max-height: 200px; overflow-y: auto">
                          <div style="font-weight: bold; margin-bottom: 8px">
                            货好等付款货号列表:
                          </div>
                          <div
                            v-for="sku in record.tagSkus[2]"
                            :key="sku"
                            style="margin: 2px 0; font-size: 12px"
                          >
                            {{ sku }}
                          </div>
                        </div>
                      </template>
                      <a-tag color="pink" style="margin: 2px"
                        >货好等付款: {{ record.tagStats[2] }}</a-tag
                      >
                    </a-tooltip>
                    <a-tooltip placement="top" v-if="record.tagStats[3] > 0">
                      <template #title>
                        <div style="max-width: 300px; max-height: 200px; overflow-y: auto">
                          <div style="font-weight: bold; margin-bottom: 8px">已出货货号列表:</div>
                          <div
                            v-for="sku in record.tagSkus[3]"
                            :key="sku"
                            style="margin: 2px 0; font-size: 12px"
                          >
                            {{ sku }}
                          </div>
                        </div>
                      </template>
                      <a-tag color="green" style="margin: 2px"
                        >已出货: {{ record.tagStats[3] }}</a-tag
                      >
                    </a-tooltip>
                  </div>
                </template>
              </template>
            </a-table>
          </div>

          <!-- 按工厂统计 -->
          <div style="margin-top: 20px">
            <div style="font-size: 16px; font-weight: bold; margin-bottom: 12px; color: #262626">
              按工厂统计
            </div>
            <a-table
              :columns="factoryStatsColumns"
              :data-source="followerStats.factoryStats"
              :pagination="false"
              size="small"
              :scroll="{ x: 600 }"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'factoryName'">
                  <span style="color: #1890ff; font-weight: 500">{{ record.factoryName }}</span>
                </template>
                <template v-else-if="column.dataIndex === 'totalRecords'">
                  <span style="font-weight: 500">{{ record.totalRecords }}</span>
                </template>
                <template v-else-if="column.dataIndex === 'washStats'">
                  <div style="display: flex; gap: 8px; flex-wrap: wrap">
                    <a-tooltip placement="top" v-if="record.washStats[0] > 0">
                      <template #title>
                        <div style="max-width: 300px; max-height: 200px; overflow-y: auto">
                          <div style="font-weight: bold; margin-bottom: 8px">未下单货号列表:</div>
                          <div
                            v-for="sku in record.washSkus[0]"
                            :key="sku"
                            style="margin: 2px 0; font-size: 12px"
                          >
                            {{ sku }}
                          </div>
                        </div>
                      </template>
                      <a-tag color="lightgrey" style="margin: 2px"
                        >未下单: {{ record.washStats[0] }}</a-tag
                      >
                    </a-tooltip>
                    <a-tooltip placement="top" v-if="record.washStats[1] > 0">
                      <template #title>
                        <div style="max-width: 300px; max-height: 200px; overflow-y: auto">
                          <div style="font-weight: bold; margin-bottom: 8px">做货中货号列表:</div>
                          <div
                            v-for="sku in record.washSkus[1]"
                            :key="sku"
                            style="margin: 2px 0; font-size: 12px"
                          >
                            {{ sku }}
                          </div>
                        </div>
                      </template>
                      <a-tag color="orange" style="margin: 2px"
                        >做货中: {{ record.washStats[1] }}</a-tag
                      >
                    </a-tooltip>
                    <a-tooltip placement="top" v-if="record.washStats[2] > 0">
                      <template #title>
                        <div style="max-width: 300px; max-height: 200px; overflow-y: auto">
                          <div style="font-weight: bold; margin-bottom: 8px">
                            货好等付款货号列表:
                          </div>
                          <div
                            v-for="sku in record.washSkus[2]"
                            :key="sku"
                            style="margin: 2px 0; font-size: 12px"
                          >
                            {{ sku }}
                          </div>
                        </div>
                      </template>
                      <a-tag color="pink" style="margin: 2px"
                        >货好等付款: {{ record.washStats[2] }}</a-tag
                      >
                    </a-tooltip>
                    <a-tooltip placement="top" v-if="record.washStats[3] > 0">
                      <template #title>
                        <div style="max-width: 300px; max-height: 200px; overflow-y: auto">
                          <div style="font-weight: bold; margin-bottom: 8px">已出货货号列表:</div>
                          <div
                            v-for="sku in record.washSkus[3]"
                            :key="sku"
                            style="margin: 2px 0; font-size: 12px"
                          >
                            {{ sku }}
                          </div>
                        </div>
                      </template>
                      <a-tag color="green" style="margin: 2px"
                        >已出货: {{ record.washStats[3] }}</a-tag
                      >
                    </a-tooltip>
                  </div>
                </template>
                <template v-else-if="column.dataIndex === 'tagStats'">
                  <div style="display: flex; gap: 8px; flex-wrap: wrap">
                    <a-tooltip placement="top" v-if="record.tagStats[0] > 0">
                      <template #title>
                        <div style="max-width: 300px; max-height: 200px; overflow-y: auto">
                          <div style="font-weight: bold; margin-bottom: 8px">未下单货号列表:</div>
                          <div
                            v-for="sku in record.tagSkus[0]"
                            :key="sku"
                            style="margin: 2px 0; font-size: 12px"
                          >
                            {{ sku }}
                          </div>
                        </div>
                      </template>
                      <a-tag color="lightgrey" style="margin: 2px"
                        >未下单: {{ record.tagStats[0] }}</a-tag
                      >
                    </a-tooltip>
                    <a-tooltip placement="top" v-if="record.tagStats[1] > 0">
                      <template #title>
                        <div style="max-width: 300px; max-height: 200px; overflow-y: auto">
                          <div style="font-weight: bold; margin-bottom: 8px">做货中货号列表:</div>
                          <div
                            v-for="sku in record.tagSkus[1]"
                            :key="sku"
                            style="margin: 2px 0; font-size: 12px"
                          >
                            {{ sku }}
                          </div>
                        </div>
                      </template>
                      <a-tag color="orange" style="margin: 2px"
                        >做货中: {{ record.tagStats[1] }}</a-tag
                      >
                    </a-tooltip>
                    <a-tooltip placement="top" v-if="record.tagStats[2] > 0">
                      <template #title>
                        <div style="max-width: 300px; max-height: 200px; overflow-y: auto">
                          <div style="font-weight: bold; margin-bottom: 8px">
                            货好等付款货号列表:
                          </div>
                          <div
                            v-for="sku in record.tagSkus[2]"
                            :key="sku"
                            style="margin: 2px 0; font-size: 12px"
                          >
                            {{ sku }}
                          </div>
                        </div>
                      </template>
                      <a-tag color="pink" style="margin: 2px"
                        >货好等付款: {{ record.tagStats[2] }}</a-tag
                      >
                    </a-tooltip>
                    <a-tooltip placement="top" v-if="record.tagStats[3] > 0">
                      <template #title>
                        <div style="max-width: 300px; max-height: 200px; overflow-y: auto">
                          <div style="font-weight: bold; margin-bottom: 8px">已出货货号列表:</div>
                          <div
                            v-for="sku in record.tagSkus[3]"
                            :key="sku"
                            style="margin: 2px 0; font-size: 12px"
                          >
                            {{ sku }}
                          </div>
                        </div>
                      </template>
                      <a-tag color="green" style="margin: 2px"
                        >已出货: {{ record.tagStats[3] }}</a-tag
                      >
                    </a-tooltip>
                  </div>
                </template>
              </template>
            </a-table>
          </div>
        </div>
      </Modal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
  EditOutlined,
  PieChartOutlined,
  FundProjectionScreenOutlined,
  TableOutlined,
} from '@ant-design/icons-vue'
import ManagePage from '@/components/ManagePage.vue'
import {
  accStore,
  editFormData,
  fetchPageByImportId,
  quarters,
  visibleBatches,
  visibleQuarters,
  selectedBatchId,
} from '@/stores/acc-store'
import type { AccPurchaseContractType } from '@/types/acc-type'
import { formatTime } from '@/utils/formatTime'
import { getBackendUrl } from '@/utils/getApiUrl'
import { EyeOutlined, FilterOutlined } from '@ant-design/icons-vue'
import { tableImportStore } from '@/stores/tableImport-store'
import { noticeGroup } from '@/api/services/webhookTableImport-api'
import { useAuthStore } from '@/stores/auth-store'
import Modal from '@/components/Modal.vue'
import { userStore } from '@/stores/user-store'
import LoadingYD from './loadingYD.vue'

// 接收父组件的 openImport、openExport、openInfo、openHistory（双向绑定）并提供触发事件
const props = defineProps<{
  openImport?: boolean
  openExport?: boolean
  openInfo?: boolean
  openHistory?: boolean
}>()

const emit = defineEmits(['update:openInfo', 'update:openHistory'])

const onHistoryClick = () => {
  emit('update:openHistory', true)
}

// 筛选工厂 Modal 相关状态
const showFilterModal = ref(false)
// 筛选工厂
const filterFactory = ref<string | null>(null)
// 筛选洗标状态
const filterWashStatus = ref<number | null>(null)
// 筛选吊牌状态
const filterTagStatus = ref<number | null>(null)

// 跟单数据 Modal 相关状态
const showFollowerDataModal = ref(false)
const followerStats = ref({
  totalRecords: 0,
  totalFactories: 0,
  batchStats: [] as any[],
  factoryStats: [] as any[],
})

// 工厂用户选项
const factoryUserOptions = ref<{ label: string; value: string }[]>([])
// 搜索选项
const searchSelectOptions = [
  { label: '货号', value: 'sku' },
  { label: '工厂', value: 'factory' },
]
// 图片URL处理，基于更新时间戳防止缓存
const getImageUrl = (imageUrl: string, updatedAt?: string | number) => {
  if (!imageUrl) return ''
  const baseUrl = getBackendUrl()
  if (updatedAt) {
    const timestamp = new Date(updatedAt).getTime()
    return `${baseUrl}${imageUrl}?t=${timestamp}`
  }
  return `${baseUrl}${imageUrl}`
}

const store = accStore
const rawRows = ref<AccPurchaseContractType[]>([])
const dataSource = ref<any[]>([])

const factoryOptions = computed(() => {
  const factories = new Set<string>()
  rawRows.value.forEach((row) => {
    if (row.factory) {
      factories.add(row.factory)
    }
  })
  return Array.from(factories)
    .sort()
    .map((factory) => ({ text: factory, value: factory }))
})

const columns = computed(() => {
  return [
    {
      title: '序号',
      dataIndex: '__index__',
      width: '60px',
      fixed: true,
    },
    { title: '季度', dataIndex: 'quarter', width: '65px' },
    {
      title: '图片',
      dataIndex: 'imageUrl',
      width: '75px',
    },
    { title: '货号', dataIndex: 'sku', width: '125px' },
    { title: '颜色', dataIndex: 'color', width: '80px' },
    { title: '品牌', dataIndex: 'brand', width: '100px' },
    { title: '英文品名', dataIndex: 'nameEn', width: '105px' },
    { title: '大面材料', dataIndex: 'materialMain', width: '120px' },
    { title: '里衬材质', dataIndex: 'materialLining', width: '95px' },
    { title: '洗标颜色', dataIndex: 'washLabelColor', width: '75px' },
    { title: '洗标种类', dataIndex: 'washLabelType', width: '100px' },
    { title: '绳子吊粒', dataIndex: 'threadPellets', width: '75px' },
    {
      title: '工厂',
      dataIndex: 'factory',
      width: '95px',
      filters: factoryOptions.value,
      onFilter: (value: any, record: any) => {
        return record.factory === value
      },
    },
    { title: '地址', dataIndex: 'address', width: '110px' },
    { title: '跟单', dataIndex: 'follower', width: '80px' },
    { title: '洗标数量', dataIndex: 'quantity', width: '75px' },
    { title: '洗标实际出货数量', dataIndex: 'washShipQuantity', width: '130px' },
    { title: '吊牌数量', dataIndex: 'tagQuantity', width: '75px' },

    { title: '吊牌实际出货数量', dataIndex: 'tagShipQuantity', width: '140px' },
    { title: '洗标优先级', dataIndex: 'washPriority', width: '90px' },
    { title: '洗标状态', dataIndex: 'washStatus', width: '90px' },
    {
      title: '洗标确认时间',
      dataIndex: 'washConfirmTime',
      width: '140px',
      customRender: ({ text }: any) => formatTime(text),
    },
    {
      title: '洗标出货时间',
      dataIndex: 'washShipTime',
      width: '140px',
      customRender: ({ text }: any) => formatTime(text),
    },

    { title: '洗标快递单号', dataIndex: 'washExpressNo', width: '110px' },

    { title: '吊牌优先级', dataIndex: 'tagPriority', width: '90px' },
    { title: '吊牌状态', dataIndex: 'tagStatus', width: '90px' },

    {
      title: '吊牌确认时间',
      dataIndex: 'tagConfirmTime',
      width: '140px',
      customRender: ({ text }: any) => formatTime(text),
    },
    {
      title: '吊牌出货时间',
      dataIndex: 'tagShipTime',
      width: '140px',
      customRender: ({ text }: any) => formatTime(text),
    },

    { title: '吊牌快递单号', dataIndex: 'tagExpressNo', width: '110px' },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: '140px',
      sorter: (a: any, b: any) =>
        (new Date(a.createdAt ?? '').getTime() || 0) - (new Date(b.createdAt ?? '').getTime() || 0),
      customRender: ({ text }: any) => formatTime(text),
    },
    {
      title: '修改时间',
      dataIndex: 'updatedAt',
      width: '140px',
      sorter: (a: any, b: any) =>
        (new Date(a.updatedAt ?? '').getTime() || 0) - (new Date(b.updatedAt ?? '').getTime() || 0),
      customRender: ({ text }: any) => formatTime(text),
    },
    { title: '备注', dataIndex: 'remark', width: '180px' },
    { title: '批次id', dataIndex: 'importId', width: '75px' },
  ]
}) as unknown as any

const editableFields = ['factory', 'address']

// 批次统计表格列定义
const batchStatsColumns = computed(() => [
  {
    title: '批次名称',
    dataIndex: 'batchName',
    key: 'batchName',
    width: 200,
    fixed: 'left',
  },
  {
    title: '总记录数',
    dataIndex: 'totalRecords',
    key: 'totalRecords',
    width: 100,
  },
  {
    title: '洗标状态统计',
    dataIndex: 'washStats',
    key: 'washStats',
    width: 300,
  },
  {
    title: '吊牌状态统计',
    dataIndex: 'tagStats',
    key: 'tagStats',
    width: 300,
  },
])

// 工厂统计表格列定义
const factoryStatsColumns = computed(() => [
  {
    title: '工厂名称',
    dataIndex: 'factoryName',
    key: 'factoryName',
    width: 150,
    fixed: 'left',
  },
  {
    title: '总记录数',
    dataIndex: 'totalRecords',
    key: 'totalRecords',
    width: 100,
  },
  {
    title: '洗标状态统计',
    dataIndex: 'washStats',
    key: 'washStats',
    width: 250,
  },
  {
    title: '吊牌状态统计',
    dataIndex: 'tagStats',
    key: 'tagStats',
    width: 250,
  },
])

const setTableRows = (rows: AccPurchaseContractType[]) => {
  const safeRows = rows ? rows.slice() : []
  rawRows.value = safeRows
  dataSource.value = safeRows.slice()
}

const handleSearch = async (payload: Record<string, string>) => {
  const searchConditions = {
    ...payload,
    follower: useAuthStore().user?.username || '',
  }
  await store.handleSearch(searchConditions)
}
// 选择变化
const handleSelectionChange = ({
  rows,
}: {
  keys: (string | number)[]
  rows: AccPurchaseContractType[]
}) => {
  store.onSelectionChange(rows as any)
}

// 检查是否可以编辑该行（已出货的行不能编辑工厂和地址）
const canEditRow = (record: any): boolean => {
  if (record.washStatus == 3 || record.tagStatus == 3) {
    return false
  }
  return true
}

// 新的保存方法
const handleSave = async (record: any) => {
  try {
    // 检查：如果状态为已出货(3)，禁止修改工厂和地址
    if (record.washStatus == 3 || record.tagStatus == 3) {
      // 检查是否修改了工厂或地址
      const originalRecord = store.pagedList.find((r: any) => r.id === record.id) as any
      if (
        originalRecord &&
        (record.factory !== originalRecord.factory || record.address !== originalRecord.address)
      ) {
        message.error('已出货的记录不能修改工厂和地址')
        return
      }
    }
    if (editFormData.value) {
      await accStore.update(record)
      await noticeGroup(record.importId, record.sku)
    }
    // 无论如何都刷新数据
    await store.fetchPage()
  } catch (e) {
    console.error('保存失败', e)
  }
}

const selectedQuarterId = ref<string | null>(null)

const batchOptions = computed(() => {
  return visibleBatches.value.map((batch: any) => ({
    label: batch.fileName,
    value: batch.id,
  }))
})

const quarterOptions = computed(() => {
  return visibleQuarters.value.map((quarter: any) => ({
    label: quarter.name,
    value: quarter.name,
  }))
})
const handleBatchChange = (value: number) => {
  selectedBatchId.value = value
  fetchPageByImportId(selectedBatchId.value, 0, 0, '')
}
const handleQuarterChange = (value: string) => {
  selectedQuarterId.value = value
  fetchPageByImportId(selectedBatchId.value || 0, 0, 0, selectedQuarterId.value)
}
const handleTotalDataClick = () => {
  // 清空季度选择
  selectedQuarterId.value = null
  // 加载当前批次的全部数据
  fetchPageByImportId(selectedBatchId.value || 0, 0, 0, '')
  message.info('已显示为所有数据')
}
const pageChange = (val: number) => {
  store.currentPage = val
  fetchPageByImportId(
    selectedBatchId.value || 0,
    store.currentPage,
    store.pageSize,
    selectedQuarterId.value!,
  )
}
const pageSizeChange = (val: number) => {
  store.pageSize = val
  fetchPageByImportId(
    selectedBatchId.value || 0,
    store.currentPage,
    store.pageSize,
    selectedQuarterId.value!,
  )
}

const handleFilterClick = async () => {
  filterFactory.value = null
  filterWashStatus.value = null
  filterTagStatus.value = null
  await loadFactoryUsers()
  showFilterModal.value = !showFilterModal.value
}

// 加载工厂用户选项
const loadFactoryUsers = async () => {
  try {
    // 获取所有用户
    await userStore.fetchAll()
    const allUsers = userStore.list as any[]

    // 第一层筛选：筛选工厂用户（角色ID为5的用户）
    const factoryUsers = allUsers.filter((user) => {
      const hasFactoryRole = user.roles?.some((role: any) => role.id === 5)
      return hasFactoryRole
    })

    // 第二层筛选：在当前跟单用户负责的数据中存在的工厂
    const currentUser = useAuthStore().user?.username || ''

    // 获取当前用户的所有记录
    await accStore.fetchAll()
    const allRecords = accStore.list as AccPurchaseContractType[]

    // 过滤出当前用户负责的记录
    const userRecords = allRecords.filter((record) => record.follower === currentUser)

    // 提取当前数据中存在的工厂
    const existingFactories = new Set<string>()
    userRecords.forEach((record) => {
      if (record.factory) {
        existingFactories.add(record.factory)
      }
    })

    // 双重筛选：既是工厂用户，又在当前数据中存在
    const finalFactoryUsers = factoryUsers.filter((user) => {
      const username = user.user?.username || ''
      const existsInData = existingFactories.has(username)
      return existsInData
    })

    // 转换为选择器选项
    factoryUserOptions.value = finalFactoryUsers
      .map((user) => ({
        label: user.user?.username || '',
        value: user.user?.username || '',
      }))
      .filter((option) => option.value && option.label)
  } catch (error) {
    message.error('加载工厂用户失败')
  }
}

const handleFilterFactory = async () => {
  if (filterFactory.value) {
    const conditions: any = {
      factory: filterFactory.value,
      follower: useAuthStore().user?.username || '',
    }

    if (filterWashStatus.value !== null && filterWashStatus.value !== undefined) {
      conditions.wash_status = String(filterWashStatus.value)
    }
    if (filterTagStatus.value !== null && filterTagStatus.value !== undefined) {
      conditions.tag_status = String(filterTagStatus.value)
    }

    await store.handleExact(conditions)
    message.success('筛选成功')
  } else {
    message.warning('请选择工厂进行筛选')
  }
}

// 计算跟单数据统计
const calculateFollowerStats = async () => {
  const currentUser = useAuthStore().user?.username || ''
  await accStore.fetchAll()
  const allRecords = accStore.list as AccPurchaseContractType[]

  // 过滤出当前用户负责的记录
  const userRecords = allRecords.filter((record) => record.follower === currentUser)

  // 基础统计
  const totalRecords = userRecords.length
  const factories = new Set(userRecords.map((record) => record.factory).filter(Boolean))
  const totalFactories = factories.size

  // 按批次统计
  const batchStatsMap = new Map()

  userRecords.forEach((record) => {
    const batchId = record.importId
    const batch = (tableImportStore.list as any[]).find((batch: any) => batch.id === batchId)
    const batchName = batch?.fileName || `批次${batchId}`

    if (!batchStatsMap.has(batchId)) {
      batchStatsMap.set(batchId, {
        batchId,
        batchName,
        totalRecords: 0,
        washStats: [0, 0, 0, 0], // [未下单, 做货中, 货好等付款, 已出货]
        washSkus: [[], [], [], []], // 对应每个状态的货号列表
        tagStats: [0, 0, 0, 0], // [未下单, 做货中, 货好等付款, 已出货]
        tagSkus: [[], [], [], []], // 对应每个状态的货号列表
      })
    }

    const batchStat = batchStatsMap.get(batchId)
    if (batchStat) {
      batchStat.totalRecords++

      if (record.washStatus !== undefined && record.washStatus >= 0 && record.washStatus <= 3) {
        batchStat.washStats[record.washStatus]++
        if (record.sku) {
          // 确保数组索引存在且是数组
          if (!batchStat.washSkus[record.washStatus]) {
            batchStat.washSkus[record.washStatus] = []
          }
          batchStat.washSkus[record.washStatus].push(record.sku)
        }
      }

      if (record.tagStatus !== undefined && record.tagStatus >= 0 && record.tagStatus <= 3) {
        batchStat.tagStats[record.tagStatus]++
        if (record.sku) {
          // 确保数组索引存在且是数组
          if (!batchStat.tagSkus[record.tagStatus]) {
            batchStat.tagSkus[record.tagStatus] = []
          }
          batchStat.tagSkus[record.tagStatus].push(record.sku)
        }
      }
    }
  })

  // 按工厂统计
  const factoryStatsMap = new Map()

  userRecords.forEach((record) => {
    const factoryName = record.factory || '未知工厂'

    if (!factoryStatsMap.has(factoryName)) {
      factoryStatsMap.set(factoryName, {
        factoryName,
        totalRecords: 0,
        washStats: [0, 0, 0, 0],
        washSkus: [[], [], [], []], // 对应每个状态的货号列表
        tagStats: [0, 0, 0, 0],
        tagSkus: [[], [], [], []], // 对应每个状态的货号列表
      })
    }

    const factoryStat = factoryStatsMap.get(factoryName)
    if (factoryStat) {
      factoryStat.totalRecords++

      if (record.washStatus !== undefined && record.washStatus >= 0 && record.washStatus <= 3) {
        factoryStat.washStats[record.washStatus]++
        if (record.sku) {
          // 确保数组索引存在且是数组
          if (!factoryStat.washSkus[record.washStatus]) {
            factoryStat.washSkus[record.washStatus] = []
          }
          factoryStat.washSkus[record.washStatus].push(record.sku)
        }
      }

      if (record.tagStatus !== undefined && record.tagStatus >= 0 && record.tagStatus <= 3) {
        factoryStat.tagStats[record.tagStatus]++
        if (record.sku) {
          // 确保数组索引存在且是数组
          if (!factoryStat.tagSkus[record.tagStatus]) {
            factoryStat.tagSkus[record.tagStatus] = []
          }
          factoryStat.tagSkus[record.tagStatus].push(record.sku)
        }
      }
    }
  })

  followerStats.value = {
    totalRecords,
    totalFactories,
    batchStats: Array.from(batchStatsMap.values()).sort((a, b) => b.totalRecords - a.totalRecords),
    factoryStats: Array.from(factoryStatsMap.values()).sort(
      (a, b) => b.totalRecords - a.totalRecords,
    ),
  }
}

// 打开跟单数据 Modal
const handleFollowerDataClick = () => {
  const currentUser = useAuthStore().user?.username || ''
  if (!currentUser) {
    message.warning('请先登录')
    return
  }

  calculateFollowerStats()
  showFollowerDataModal.value = true
}
watch(
  () => store.pagedList,
  (list) => {
    setTableRows((list as AccPurchaseContractType[]) || [])
    // 如果跟单数据 Modal 是打开的，重新计算统计数据
    if (showFollowerDataModal.value) {
      calculateFollowerStats()
    }
  },
  { immediate: true },
)

onMounted(async () => {
  store.loading = true
  fetchPageByImportId(selectedBatchId.value || 0, store.currentPage, store.pageSize, '')
  // 等待1秒
  await new Promise((resolve) => setTimeout(resolve, 500))
  store.loading = false
})
</script>

<style scoped>
.changeImgA {
  margin-top: -40px;
  margin-left: 15px;
  color: white;
  text-shadow: 1px 1px 10px black;
}

.changeImgA:active {
  color: rgb(0, 0, 0);
  text-shadow: 1px 1px 10px rgb(255, 255, 255);
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.5s ease-in-out,
    transform 0.5s ease-in-out;
}

.fade-enter-from {
  opacity: 0;
  transform: scale(0.1);
}

.fade-enter-to {
  opacity: 1;
  transform: scale(1);
}

.fade-leave-from {
  opacity: 1;
  transform: scale(1);
}

.fade-leave-to {
  opacity: 0;
  transform: scale(0.1);
}

.fade-move {
  transition: transform 3s ease-in-out;
}

.batch-select {
  padding: 5px;
  background-color: rgb(225, 225, 225);
  border-radius: 10px;
  margin-left: 5px;
  display: flex;
  gap: 5px;
  justify-content: center;
  align-items: center;
}
.custom-tool-btn {
  margin-left: 5px;
}
</style>
