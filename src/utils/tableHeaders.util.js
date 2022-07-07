const TITLE_FIELDS = [
  'ФИО',
  'Мобильный телефон',
  'Город',
  'Марка и модель автомобиля',
  'Госномер авто',
  'Макет',
  'Фото 1',
  'Фото 2',
  'Фото 3',
  'Фото 4',
  'Брендинг',
  'Дизайн',
  'Заднее стекло',
];

const DESCRIPTION_FIELDS = [
  'ФИО',
  'Мобильный телефон',
  'Город',
  'Марка и модель автомобиля',
  'Госномер авто',
  'Макет',
  'Фото 1',
  'Фото 2',
  'Фото 3',
  'Фото 4',
  'Брендинг',
  'Дизайн',
  'Заднее стекло',
];

class TableHeaders {
  static _headerArray = [];
  
  constructor(headerArray) {
    this.headerArray = headerArray;
  }
  
  get headerArray() {
    return this._headerArray;
  }
  
  set headerArray(arr) {
    this._headerArray = [...arr];
  }
  
  get contractor() {
    return this.headerArray.findIndex((val) => val === 'Подрядчик');
  }
  
  get status() {
    return this.headerArray.findIndex((val) => val === 'Статус');
  }
  
  get taskDesign() {
    return this.headerArray.findIndex((val) => val === 'Номер задачи на дизайн');
  }
  
  get taskPrint() {
    return this.headerArray.findIndex((val) => val === 'Номер задачи на печать');
  }
  
  get taskInstall() {
    return this.headerArray.findIndex((val) => val === 'Номер задачи на монтаж');
  }
  
  get carNumber() {
    return this.headerArray.findIndex((val) => val === 'Госномер авто');
  }
  
  get taskTitleFields() {
    return this.headerArray.filter((val) => {
      return TITLE_FIELDS.includes(val);
    });
  }
}

module.exports = { TableHeaders };
