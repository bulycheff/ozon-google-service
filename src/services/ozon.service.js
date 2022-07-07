const { BitrixTasks } = require('../api/bitrix.api');
const { SheetTable } = require('../api/google.api');
const { TableHeaders } = require('../utils/tableHeaders.util');
const { convertToCellAddress } = require('../helpers/cellAddress.helper');
const { generateFields } = require('../helpers/taskFiels.helper');

class OzonService extends SheetTable {
  _bitrix;
  _tableHeaders;
  _iceberg;
  static _tasks;
  tasksAll;
  
  constructor(spreadsheetId, sheetName) {
    super(spreadsheetId, sheetName);
    this._bitrix = new BitrixTasks();
  }
  
  async init() {
    const data = await this.load();
    const h = this.tableHeaders = new TableHeaders(this.headers);
    this.iceberg = data.filter((row) => row[h.contractor] === 'Айсберг');
    this.tasks = await this.bitrix.findByTitle(...this.carNumbers);
  }
  
  get carNumbers() {
    return this.iceberg.map((row) => row[this.tableHeaders.carNumber]);
  }
  
  get iceberg() {
    return this._iceberg;
  }
  
  set iceberg(data) {
    this._iceberg = [...data];
  }
  
  get tableHeaders() {
    return this._tableHeaders;
  }
  
  set tableHeaders(headers) {
    this._tableHeaders = headers;
  }
  
  get bitrix() {
    return this._bitrix;
  }
  
  get tasks() {
    return this._tasks;
  }
  
  set tasks(arr) {
    this._tasks = [...arr];
  }
  
  keyTasks(keyWord) {
    return this.tasks.filter((item) => item.title.includes(keyWord));
  }
  
  get tasksDesign() {
    return this.keyTasks('Дизайн');
  }
  
  get tasksPrint() {
    return this.keyTasks('Производство');
  }
  
  get tasksInstall() {
    return this.keyTasks('Монтаж');
  }
  
  get orderData() {
    const h = this.tableHeaders;
    const result = [];
    this.iceberg.forEach((row) => {
      let orderStatus;
      const obj = {};
      const carNumber = row[h.carNumber];
      const rowIndex = this.data.findIndex((dataItem) => dataItem[h.carNumber] === carNumber);
      const taskDesign = this.tasksDesign.find((task) => task.title.includes(carNumber));
      if (taskDesign) {
        obj.taskDesign = {};
        obj.taskDesign.id = taskDesign.id;
        obj.taskDesign.cell = convertToCellAddress(rowIndex, h.taskDesign);
        obj.taskDesign.status = taskDesign.status;
      }
      const taskPrint = this.tasksPrint.find((task) => task.title.includes(carNumber));
      if (taskPrint) {
        obj.taskPrint = {};
        obj.taskPrint.id = taskPrint.id;
        obj.taskPrint.cell = convertToCellAddress(rowIndex, h.taskPrint);
        obj.taskPrint.status = taskPrint.status;
      }
      const taskInstall = this.tasksInstall.find((task) => task.title.includes(carNumber));
      if (taskInstall) {
        obj.taskInstall = {};
        obj.taskInstall.id = taskInstall.id;
        obj.taskInstall.cell = convertToCellAddress(rowIndex, h.taskInstall);
        obj.taskInstall.status = taskInstall.status;
      }
      
      orderStatus = this.orderStatus(obj);
      if (orderStatus) {
        result.push({
          carNumber, order: {
            status: this.orderStatus(obj),
            cell: convertToCellAddress(rowIndex, h.status),
          }, ...obj,
        });
      }
    });
    return result;
  }
  
  get newOrders() {
    const h = this.tableHeaders;
    return this.iceberg.filter((row) => !row[h.status] || row[h.status] === '');
  }
  
  orderStatus(obj) {
    if (obj.taskDesign && obj.taskDesign.status === '2') return 'В работе';
    if (obj.taskDesign && obj.taskDesign.status === '4') return 'На согласовании';
    if (obj.taskDesign && obj.taskDesign.status === '5' && !obj.taskPrint) return 'На согласовании';
    if (obj.taskDesign && obj.taskDesign.status === '6' && !obj.taskPrint) return 'На согласовании';
    if (obj.taskPrint && obj.taskPrint.status === '2') return 'Печать';
    if (obj.taskPrint && obj.taskPrint.status === '4') return 'Печать';
    if (obj.taskInstall && obj.taskInstall.status === '2') return 'Монтаж';
    if (obj.taskInstall && obj.taskInstall.status === '4') return 'Монтаж';
    if (obj.taskInstall && obj.taskInstall.status === '5') return 'Оклеен';
    if (obj.taskDesign && obj.taskPrint && obj.taskInstall) return 'Оклеен';
    return undefined;
  }
  
  async rewriteTaskNumbers() {
    const data = this.orderData.map((item) => {
      const arr = [];
      if (item.taskDesign) arr.push({
        range: item.taskDesign.cell, values: [[item.taskDesign.id]],
      });
      if (item.taskPrint) arr.push({
        range: item.taskPrint.cell, values: [[item.taskPrint.id]],
      });
      if (item.taskInstall) arr.push({
        range: item.taskInstall.cell, values: [[item.taskInstall.id]],
      });
      return [...arr];
    });
    await this.batchUpdate(data);
  }
  
  async rewriteOrderStatuses() {
    const data = this.orderData.map((item) => ({
      range: item.order.cell,
      values: [[item.order.status]],
    }));
    await this.batchUpdate(data);
  }
  
  async createDesignTasks() {
    const h = this.tableHeaders;
    const promiseArr = this.newOrders.map(async (row) => {
      await this.bitrix.create(generateFields(row, 'Дизайн'));
      const rowIndex = this.data.findIndex((item) => item[h.carNumber] === row[h.carNumber] && item[h.contractor] === 'Айсберг');
      const cellAddress = convertToCellAddress(rowIndex, h.status);
      console.log({ rowIndex, cellAddress });
      await this.updateCell(cellAddress, 'В работе');
    });
    await Promise.all(promiseArr);
  }
  
  
}

module.exports = { OzonService };
